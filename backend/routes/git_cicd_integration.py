from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
import uuid
import base64
import json
from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

class GitHubRepo(BaseModel):
    name: str
    description: Optional[str] = ""
    private: bool = True
    auto_init: bool = True

class DeploymentConfig(BaseModel):
    platform: str  # vercel, netlify, railway, aws, gcp
    environment: str  # dev, staging, production
    auto_deploy: bool = True
    build_command: Optional[str] = ""
    deploy_hooks: List[str] = []

class CICDPipeline(BaseModel):
    id: str
    name: str
    repository: str
    branch: str = "main"
    triggers: List[str] = ["push", "pull_request"]
    steps: List[Dict[str, Any]]
    environment_vars: Dict[str, str] = {}
    notifications: Dict[str, Any] = {}
    created_at: datetime

class GitIntegrationService:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
        
    async def create_github_repo(self, repo_config: GitHubRepo, github_token: str, user_id: str) -> Dict[str, Any]:
        """Create GitHub repository with AI-generated content"""
        try:
            import httpx
            
            headers = {
                "Authorization": f"token {github_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            # Create repository
            repo_data = {
                "name": repo_config.name,
                "description": repo_config.description,
                "private": repo_config.private,
                "auto_init": repo_config.auto_init
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.github.com/user/repos",
                    headers=headers,
                    json=repo_data
                )
                
                if response.status_code != 201:
                    raise HTTPException(status_code=400, detail=f"GitHub API error: {response.text}")
                
                repo_info = response.json()
                
                # Generate AI-powered README
                readme_content = await self._generate_smart_readme(repo_config, user_id)
                
                # Add README to repository
                await self._add_file_to_repo(
                    repo_info["full_name"], 
                    "README.md", 
                    readme_content, 
                    github_token
                )
                
                # Generate .gitignore based on project type
                gitignore_content = await self._generate_gitignore(repo_config, user_id)
                await self._add_file_to_repo(
                    repo_info["full_name"],
                    ".gitignore",
                    gitignore_content,
                    github_token
                )
                
                # Store in database
                db = await get_database()
                await db.git_repositories.insert_one({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "github_repo": repo_info,
                    "created_at": datetime.utcnow(),
                    "last_sync": datetime.utcnow()
                })
                
                return {
                    "repository": repo_info,
                    "readme_generated": True,
                    "gitignore_generated": True,
                    "status": "created"
                }
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Repository creation failed: {str(e)}")
    
    async def setup_cicd_pipeline(self, pipeline_config: CICDPipeline, user_id: str) -> Dict[str, Any]:
        """Setup CI/CD pipeline with intelligent configuration"""
        try:
            # Generate intelligent pipeline configuration
            pipeline_yaml = await self._generate_pipeline_config(pipeline_config, user_id)
            
            # Create GitHub Actions workflow
            workflow_content = await self._create_github_actions_workflow(pipeline_config, user_id)
            
            pipeline_id = str(uuid.uuid4())
            
            # Store pipeline configuration
            db = await get_database()
            await db.cicd_pipelines.insert_one({
                "id": pipeline_id,
                "user_id": user_id,
                "config": pipeline_config.dict(),
                "pipeline_yaml": pipeline_yaml,
                "workflow_content": workflow_content,
                "status": "active",
                "created_at": datetime.utcnow(),
                "last_run": None
            })
            
            return {
                "pipeline_id": pipeline_id,
                "workflow_generated": True,
                "config": pipeline_yaml,
                "github_actions": workflow_content,
                "status": "configured"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pipeline setup failed: {str(e)}")
    
    async def auto_deploy_to_platform(self, deployment_config: DeploymentConfig, project_path: str, user_id: str) -> Dict[str, Any]:
        """Auto-deploy to specified platform"""
        try:
            deployment_id = str(uuid.uuid4())
            
            # Generate platform-specific deployment configuration
            deploy_config = await self._generate_deployment_config(deployment_config, user_id)
            
            # Create deployment script
            deploy_script = await self._create_deployment_script(deployment_config, project_path, user_id)
            
            # Store deployment information
            db = await get_database()
            await db.deployments.insert_one({
                "id": deployment_id,
                "user_id": user_id,
                "platform": deployment_config.platform,
                "environment": deployment_config.environment,
                "config": deploy_config,
                "script": deploy_script,
                "status": "configured",
                "created_at": datetime.utcnow(),
                "last_deployment": None
            })
            
            return {
                "deployment_id": deployment_id,
                "platform": deployment_config.platform,
                "config": deploy_config,
                "script": deploy_script,
                "status": "ready_to_deploy"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Deployment setup failed: {str(e)}")
    
    async def create_pull_request(self, repo_name: str, branch: str, title: str, description: str, github_token: str, user_id: str) -> Dict[str, Any]:
        """Create intelligent pull request with AI-generated content"""
        try:
            import httpx
            
            # Generate AI-enhanced PR description
            enhanced_description = await self._enhance_pr_description(title, description, user_id)
            
            headers = {
                "Authorization": f"token {github_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            pr_data = {
                "title": title,
                "body": enhanced_description,
                "head": branch,
                "base": "main"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://api.github.com/repos/{repo_name}/pulls",
                    headers=headers,
                    json=pr_data
                )
                
                if response.status_code != 201:
                    raise HTTPException(status_code=400, detail=f"PR creation failed: {response.text}")
                
                pr_info = response.json()
                
                # Store PR information
                db = await get_database()
                await db.pull_requests.insert_one({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "github_pr": pr_info,
                    "enhanced_description": enhanced_description,
                    "created_at": datetime.utcnow()
                })
                
                return {
                    "pull_request": pr_info,
                    "enhanced_description": True,
                    "status": "created"
                }
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pull request creation failed: {str(e)}")
    
    async def _generate_smart_readme(self, repo_config: GitHubRepo, user_id: str) -> str:
        """Generate AI-powered README content"""
        readme_prompt = f"""
        Generate a professional README.md for a project called "{repo_config.name}".
        Description: {repo_config.description}
        
        Include:
        1. Project title and description
        2. Features and capabilities
        3. Installation instructions
        4. Usage examples
        5. Contributing guidelines
        6. License information
        7. Contact information
        
        Make it comprehensive and professional.
        """
        
        response = await self.ai_service.process_enhanced_chat(
            message=readme_prompt,
            conversation_id=f"readme_{uuid.uuid4()}",
            user_id=user_id,
            agent_coordination="single"
        )
        
        return response.get("response", "# " + repo_config.name)
    
    async def _generate_gitignore(self, repo_config: GitHubRepo, user_id: str) -> str:
        """Generate intelligent .gitignore based on project type"""
        # Standard .gitignore patterns
        base_patterns = [
            "node_modules/", "*.log", ".env", ".DS_Store", "dist/", "build/",
            "*.pyc", "__pycache__/", ".pytest_cache/", "venv/", ".venv/",
            "*.swp", "*.swo", ".idea/", ".vscode/", "coverage/"
        ]
        
        return "\n".join(base_patterns)
    
    async def _add_file_to_repo(self, repo_full_name: str, file_path: str, content: str, github_token: str):
        """Add file to GitHub repository"""
        import httpx
        
        headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        file_data = {
            "message": f"Add {file_path}",
            "content": base64.b64encode(content.encode()).decode()
        }
        
        async with httpx.AsyncClient() as client:
            await client.put(
                f"https://api.github.com/repos/{repo_full_name}/contents/{file_path}",
                headers=headers,
                json=file_data
            )
    
    async def _generate_pipeline_config(self, pipeline_config: CICDPipeline, user_id: str) -> Dict[str, Any]:
        """Generate intelligent CI/CD pipeline configuration"""
        config = {
            "name": pipeline_config.name,
            "triggers": pipeline_config.triggers,
            "steps": [
                {"name": "Checkout", "action": "checkout@v3"},
                {"name": "Setup Node.js", "action": "setup-node@v3", "with": {"node-version": "18"}},
                {"name": "Install dependencies", "run": "npm install"},
                {"name": "Run tests", "run": "npm test"},
                {"name": "Build", "run": "npm run build"},
                {"name": "Deploy", "run": "npm run deploy"}
            ],
            "environment_vars": pipeline_config.environment_vars
        }
        
        return config
    
    async def _create_github_actions_workflow(self, pipeline_config: CICDPipeline, user_id: str) -> str:
        """Create GitHub Actions workflow YAML"""
        workflow = f"""
name: {pipeline_config.name}

on:
  push:
    branches: [ {pipeline_config.branch} ]
  pull_request:
    branches: [ {pipeline_config.branch} ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      run: npm run deploy
      env:
        {chr(10).join([f'        {k}: ${{{{ secrets.{k} }}}}' for k in pipeline_config.environment_vars.keys()])}
"""
        return workflow
    
    async def _generate_deployment_config(self, deployment_config: DeploymentConfig, user_id: str) -> Dict[str, Any]:
        """Generate platform-specific deployment configuration"""
        configs = {
            "vercel": {
                "name": "vercel-deployment",
                "build": deployment_config.build_command or "npm run build",
                "output": "dist",
                "framework": "auto-detect"
            },
            "netlify": {
                "build": {"command": deployment_config.build_command or "npm run build", "publish": "dist"},
                "headers": [{"for": "/*", "values": {"X-Frame-Options": "DENY"}}]
            },
            "railway": {
                "build": {"builder": "NIXPACKS"},
                "deploy": {"startCommand": "npm start", "restartPolicyType": "ON_FAILURE"}
            }
        }
        
        return configs.get(deployment_config.platform, {})
    
    async def _create_deployment_script(self, deployment_config: DeploymentConfig, project_path: str, user_id: str) -> str:
        """Create deployment script"""
        scripts = {
            "vercel": f"npx vercel --prod --cwd {project_path}",
            "netlify": f"npx netlify deploy --prod --dir {project_path}/dist",
            "railway": f"railway deploy --service {deployment_config.platform}"
        }
        
        return scripts.get(deployment_config.platform, "echo 'Deployment not configured'")
    
    async def _enhance_pr_description(self, title: str, description: str, user_id: str) -> str:
        """Enhance PR description with AI"""
        enhancement_prompt = f"""
        Enhance this pull request description:
        
        Title: {title}
        Description: {description}
        
        Add:
        1. Clear summary of changes
        2. Testing information
        3. Impact assessment
        4. Checklist for reviewers
        
        Keep it professional and structured.
        """
        
        response = await self.ai_service.process_enhanced_chat(
            message=enhancement_prompt,
            conversation_id=f"pr_{uuid.uuid4()}",
            user_id=user_id,
            agent_coordination="single"
        )
        
        return response.get("response", description)

# Initialize service
git_service = GitIntegrationService()

@router.post("/create-repo")
async def create_github_repository(
    repo_config: GitHubRepo,
    github_token: str,
    current_user = Depends(get_current_user)
):
    """Create GitHub repository with AI-generated content"""
    return await git_service.create_github_repo(repo_config, github_token, current_user["id"])

@router.post("/setup-pipeline")
async def setup_cicd_pipeline(
    pipeline_config: CICDPipeline,
    current_user = Depends(get_current_user)
):
    """Setup CI/CD pipeline with intelligent configuration"""
    return await git_service.setup_cicd_pipeline(pipeline_config, current_user["id"])

@router.post("/deploy")
async def deploy_to_platform(
    deployment_config: DeploymentConfig,
    project_path: str,
    current_user = Depends(get_current_user)
):
    """Deploy project to specified platform"""
    return await git_service.auto_deploy_to_platform(deployment_config, project_path, current_user["id"])

@router.post("/create-pr")
async def create_pull_request(
    repo_name: str,
    branch: str,
    title: str,
    description: str,
    github_token: str,
    current_user = Depends(get_current_user)
):
    """Create intelligent pull request"""
    return await git_service.create_pull_request(repo_name, branch, title, description, github_token, current_user["id"])

@router.get("/repositories")
async def get_user_repositories(current_user = Depends(get_current_user)):
    """Get all repositories for current user"""
    db = await get_database()
    repos = await db.git_repositories.find(
        {"user_id": current_user["id"]}
    ).to_list(length=50)
    return repos

@router.get("/pipelines")
async def get_user_pipelines(current_user = Depends(get_current_user)):
    """Get all CI/CD pipelines for current user"""
    db = await get_database()
    pipelines = await db.cicd_pipelines.find(
        {"user_id": current_user["id"]}
    ).to_list(length=50)
    return pipelines

@router.get("/deployments")
async def get_user_deployments(current_user = Depends(get_current_user)):
    """Get all deployments for current user"""
    db = await get_database()
    deployments = await db.deployments.find(
        {"user_id": current_user["id"]}
    ).to_list(length=50)
    return deployments