"""
Git & CI/CD Integration - Addresses Gap #3
Native GitHub, version control, and deployment automation
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import os
import json
import asyncio
import aiohttp
from datetime import datetime

from routes.auth import get_current_user
from models.database import get_database

router = APIRouter()

class GitHubConfig(BaseModel):
    github_token: str
    repository_url: str
    branch: str = "main"
    auto_deploy: bool = True

class DeploymentConfig(BaseModel):
    platform: str  # vercel, railway, heroku, netlify
    api_key: str
    project_id: Optional[str] = None
    auto_deploy: bool = True

class CommitRequest(BaseModel):
    message: str
    files: Dict[str, str]  # filename -> content
    branch: str = "main"

class PRRequest(BaseModel):
    title: str
    description: str
    base_branch: str = "main"
    head_branch: str
    files: Dict[str, str]

class GitCICDManager:
    def __init__(self):
        self.github_api_base = "https://api.github.com"
    
    async def setup_git_integration(self, project_id: str, config: GitHubConfig, user_id: str):
        """Set up Git integration for a project"""
        try:
            # Validate GitHub token and repository
            headers = {
                "Authorization": f"token {config.github_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            # Extract repo info from URL
            repo_parts = config.repository_url.replace("https://github.com/", "").split("/")
            if len(repo_parts) != 2:
                raise HTTPException(status_code=400, detail="Invalid GitHub repository URL")
            
            owner, repo = repo_parts[0], repo_parts[1].replace(".git", "")
            
            async with aiohttp.ClientSession() as session:
                # Verify repository access
                async with session.get(
                    f"{self.github_api_base}/repos/{owner}/{repo}",
                    headers=headers
                ) as response:
                    if response.status != 200:
                        raise HTTPException(status_code=400, detail="Cannot access repository")
                    
                    repo_data = await response.json()
            
            # Store Git configuration
            db = await get_database()
            await db.git_integrations.update_one(
                {"project_id": project_id, "user_id": user_id},
                {
                    "$set": {
                        "github_token": config.github_token,  # In production, encrypt this
                        "repository_url": config.repository_url,
                        "owner": owner,
                        "repo": repo,
                        "branch": config.branch,
                        "auto_deploy": config.auto_deploy,
                        "repository_data": repo_data,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            
            return {
                "status": "success",
                "message": "Git integration configured successfully",
                "repository": f"{owner}/{repo}",
                "branch": config.branch
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Git integration setup failed: {str(e)}")
    
    async def create_commit(self, project_id: str, request: CommitRequest, user_id: str):
        """Create a commit with files to GitHub"""
        try:
            db = await get_database()
            git_config = await db.git_integrations.find_one({
                "project_id": project_id,
                "user_id": user_id
            })
            
            if not git_config:
                raise HTTPException(status_code=404, detail="Git integration not configured")
            
            headers = {
                "Authorization": f"token {git_config['github_token']}",
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            }
            
            owner = git_config['owner']
            repo = git_config['repo']
            
            async with aiohttp.ClientSession() as session:
                # Get reference to branch
                async with session.get(
                    f"{self.github_api_base}/repos/{owner}/{repo}/git/ref/heads/{request.branch}",
                    headers=headers
                ) as response:
                    if response.status != 200:
                        raise HTTPException(status_code=400, detail=f"Branch {request.branch} not found")
                    
                    ref_data = await response.json()
                    base_sha = ref_data['object']['sha']
                
                # Get base tree
                async with session.get(
                    f"{self.github_api_base}/repos/{owner}/{repo}/git/trees/{base_sha}",
                    headers=headers
                ) as response:
                    base_tree = await response.json()
                
                # Create tree with new files
                tree_items = []
                for filename, content in request.files.items():
                    # Create blob for file content
                    blob_data = {
                        "content": content,
                        "encoding": "utf-8"
                    }
                    
                    async with session.post(
                        f"{self.github_api_base}/repos/{owner}/{repo}/git/blobs",
                        headers=headers,
                        json=blob_data
                    ) as response:
                        blob_response = await response.json()
                        blob_sha = blob_response['sha']
                    
                    tree_items.append({
                        "path": filename,
                        "mode": "100644",
                        "type": "blob",
                        "sha": blob_sha
                    })
                
                # Create new tree
                tree_data = {
                    "base_tree": base_sha,
                    "tree": tree_items
                }
                
                async with session.post(
                    f"{self.github_api_base}/repos/{owner}/{repo}/git/trees",
                    headers=headers,
                    json=tree_data
                ) as response:
                    tree_response = await response.json()
                    tree_sha = tree_response['sha']
                
                # Create commit
                commit_data = {
                    "message": request.message,
                    "tree": tree_sha,
                    "parents": [base_sha]
                }
                
                async with session.post(
                    f"{self.github_api_base}/repos/{owner}/{repo}/git/commits",
                    headers=headers,
                    json=commit_data
                ) as response:
                    commit_response = await response.json()
                    commit_sha = commit_response['sha']
                
                # Update branch reference
                ref_update = {"sha": commit_sha}
                
                async with session.patch(
                    f"{self.github_api_base}/repos/{owner}/{repo}/git/refs/heads/{request.branch}",
                    headers=headers,
                    json=ref_update
                ) as response:
                    await response.json()
                
                # Store commit info
                await db.git_commits.insert_one({
                    "project_id": project_id,
                    "user_id": user_id,
                    "commit_sha": commit_sha,
                    "message": request.message,
                    "branch": request.branch,
                    "files_changed": list(request.files.keys()),
                    "created_at": datetime.utcnow(),
                    "github_url": f"https://github.com/{owner}/{repo}/commit/{commit_sha}"
                })
                
                # Trigger auto-deployment if configured
                if git_config.get('auto_deploy'):
                    asyncio.create_task(self._trigger_auto_deploy(project_id, commit_sha, user_id))
                
                return {
                    "status": "success",
                    "commit_sha": commit_sha,
                    "commit_url": f"https://github.com/{owner}/{repo}/commit/{commit_sha}",
                    "files_committed": list(request.files.keys())
                }
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Commit creation failed: {str(e)}")
    
    async def create_pull_request(self, project_id: str, request: PRRequest, user_id: str):
        """Create a pull request"""
        try:
            db = await get_database()
            git_config = await db.git_integrations.find_one({
                "project_id": project_id,
                "user_id": user_id
            })
            
            if not git_config:
                raise HTTPException(status_code=404, detail="Git integration not configured")
            
            # First create a commit on the head branch
            commit_request = CommitRequest(
                message=f"Feature: {request.title}",
                files=request.files,
                branch=request.head_branch
            )
            
            # Create commit (this will create the branch if it doesn't exist)
            commit_result = await self.create_commit(project_id, commit_request, user_id)
            
            headers = {
                "Authorization": f"token {git_config['github_token']}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            owner = git_config['owner']
            repo = git_config['repo']
            
            # Create pull request
            pr_data = {
                "title": request.title,
                "head": request.head_branch,
                "base": request.base_branch,
                "body": request.description
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.github_api_base}/repos/{owner}/{repo}/pulls",
                    headers=headers,
                    json=pr_data
                ) as response:
                    if response.status != 201:
                        error_data = await response.json()
                        raise HTTPException(status_code=400, detail=f"PR creation failed: {error_data.get('message', 'Unknown error')}")
                    
                    pr_response = await response.json()
            
            # Store PR info
            await db.pull_requests.insert_one({
                "project_id": project_id,
                "user_id": user_id,
                "pr_number": pr_response['number'],
                "title": request.title,
                "head_branch": request.head_branch,
                "base_branch": request.base_branch,
                "pr_url": pr_response['html_url'],
                "created_at": datetime.utcnow()
            })
            
            return {
                "status": "success",
                "pr_number": pr_response['number'],
                "pr_url": pr_response['html_url'],
                "commit_sha": commit_result['commit_sha']
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pull request creation failed: {str(e)}")
    
    async def setup_deployment_integration(self, project_id: str, config: DeploymentConfig, user_id: str):
        """Set up deployment integration (Vercel, Railway, etc.)"""
        try:
            db = await get_database()
            await db.deployment_integrations.update_one(
                {"project_id": project_id, "user_id": user_id},
                {
                    "$set": {
                        "platform": config.platform,
                        "api_key": config.api_key,  # Encrypt in production
                        "project_id": config.project_id,
                        "auto_deploy": config.auto_deploy,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            
            return {
                "status": "success",
                "message": f"{config.platform.title()} deployment integration configured",
                "platform": config.platform,
                "auto_deploy": config.auto_deploy
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Deployment integration failed: {str(e)}")
    
    async def _trigger_auto_deploy(self, project_id: str, commit_sha: str, user_id: str):
        """Trigger automatic deployment"""
        try:
            db = await get_database()
            deploy_config = await db.deployment_integrations.find_one({
                "project_id": project_id,
                "user_id": user_id
            })
            
            if not deploy_config or not deploy_config.get('auto_deploy'):
                return
            
            platform = deploy_config['platform']
            
            if platform == "vercel":
                await self._deploy_to_vercel(deploy_config, commit_sha, project_id, user_id)
            elif platform == "railway":
                await self._deploy_to_railway(deploy_config, commit_sha, project_id, user_id)
            # Add more platforms as needed
            
        except Exception as e:
            print(f"Auto-deployment failed: {e}")
    
    async def _deploy_to_vercel(self, config: Dict, commit_sha: str, project_id: str, user_id: str):
        """Deploy to Vercel"""
        try:
            headers = {
                "Authorization": f"Bearer {config['api_key']}",
                "Content-Type": "application/json"
            }
            
            deployment_data = {
                "name": config.get('project_id', f"aether-project-{project_id}"),
                "gitSource": {
                    "type": "github",
                    "ref": commit_sha
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.vercel.com/v13/deployments",
                    headers=headers,
                    json=deployment_data
                ) as response:
                    deploy_response = await response.json()
            
            # Store deployment info
            db = await get_database()
            await db.deployments.insert_one({
                "project_id": project_id,
                "user_id": user_id,
                "platform": "vercel",
                "commit_sha": commit_sha,
                "deployment_id": deploy_response.get('id'),
                "deployment_url": deploy_response.get('url'),
                "status": "building",
                "created_at": datetime.utcnow()
            })
            
        except Exception as e:
            print(f"Vercel deployment failed: {e}")
    
    async def _deploy_to_railway(self, config: Dict, commit_sha: str, project_id: str, user_id: str):
        """Deploy to Railway"""
        try:
            headers = {
                "Authorization": f"Bearer {config['api_key']}",
                "Content-Type": "application/json"
            }
            
            deployment_data = {
                "variables": {},
                "branch": "main"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"https://backboard.railway.app/graphql/v2",
                    headers=headers,
                    json=deployment_data
                ) as response:
                    deploy_response = await response.json()
            
            # Store deployment info
            db = await get_database()
            await db.deployments.insert_one({
                "project_id": project_id,
                "user_id": user_id,
                "platform": "railway",
                "commit_sha": commit_sha,
                "deployment_id": deploy_response.get('data', {}).get('id'),
                "status": "building",
                "created_at": datetime.utcnow()
            })
            
        except Exception as e:
            print(f"Railway deployment failed: {e}")

# Initialize Git CI/CD manager
git_cicd_manager = GitCICDManager()

@router.post("/projects/{project_id}/git/setup")
async def setup_git_integration(
    project_id: str,
    config: GitHubConfig,
    current_user = Depends(get_current_user)
):
    """Set up Git integration for project"""
    return await git_cicd_manager.setup_git_integration(project_id, config, str(current_user["_id"]))

@router.post("/projects/{project_id}/git/commit")
async def create_commit(
    project_id: str,
    request: CommitRequest,
    current_user = Depends(get_current_user)
):
    """Create a commit to GitHub repository"""
    return await git_cicd_manager.create_commit(project_id, request, str(current_user["_id"]))

@router.post("/projects/{project_id}/git/pull-request")
async def create_pull_request(
    project_id: str,
    request: PRRequest,
    current_user = Depends(get_current_user)
):
    """Create a pull request"""
    return await git_cicd_manager.create_pull_request(project_id, request, str(current_user["_id"]))

@router.post("/projects/{project_id}/deployment/setup")
async def setup_deployment_integration(
    project_id: str,
    config: DeploymentConfig,
    current_user = Depends(get_current_user)
):
    """Set up deployment integration"""
    return await git_cicd_manager.setup_deployment_integration(project_id, config, str(current_user["_id"]))

@router.get("/projects/{project_id}/git/status")
async def get_git_status(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """Get Git integration status"""
    try:
        db = await get_database()
        git_config = await db.git_integrations.find_one({
            "project_id": project_id,
            "user_id": str(current_user["_id"])
        }, {"github_token": 0})  # Don't return the token
        
        if not git_config:
            return {"integrated": False}
        
        # Get recent commits
        commits = await db.git_commits.find({
            "project_id": project_id,
            "user_id": str(current_user["_id"])
        }).sort("created_at", -1).limit(5).to_list(5)
        
        # Get recent deployments
        deployments = await db.deployments.find({
            "project_id": project_id,
            "user_id": str(current_user["_id"])
        }).sort("created_at", -1).limit(3).to_list(3)
        
        return {
            "integrated": True,
            "repository": f"{git_config['owner']}/{git_config['repo']}",
            "branch": git_config['branch'],
            "auto_deploy": git_config['auto_deploy'],
            "recent_commits": commits,
            "recent_deployments": deployments
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get Git status: {str(e)}")

@router.get("/projects/{project_id}/deployments")
async def get_deployments(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """Get deployment history"""
    try:
        db = await get_database()
        deployments = await db.deployments.find({
            "project_id": project_id,
            "user_id": str(current_user["_id"])
        }).sort("created_at", -1).to_list(20)
        
        return {"deployments": deployments}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get deployments: {str(e)}")