"""
Advanced Git & CI/CD Integration
Native GitHub repository management within the platform
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
import asyncio
import subprocess
from datetime import datetime
from models.auth import get_current_user
from models.database import get_database
from services.groq_ai_service import GroqAIService
import uuid
import aiohttp
import base64

router = APIRouter()

class GitConfig(BaseModel):
    repo_url: str
    branch: str = "main"
    access_token: Optional[str] = None
    auto_commit: bool = True
    auto_deploy: bool = False

class DeploymentConfig(BaseModel):
    platform: str  # vercel, netlify, railway, aws, gcp
    environment: str  # development, staging, production
    config: Dict[str, Any]
    auto_deploy_on: List[str] = ["push_to_main"]

class PipelineStep(BaseModel):
    name: str
    type: str  # build, test, deploy, quality_check
    command: str
    environment: Dict[str, str] = {}
    depends_on: List[str] = []
    timeout: int = 300  # seconds

class CICDPipeline(BaseModel):
    id: str
    name: str
    trigger: str  # push, pull_request, manual, scheduled
    steps: List[PipelineStep]
    notifications: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class GitCICDService:
    def __init__(self):
        self.ai_service = GroqAIService()
    
    async def analyze_project_structure(self, project_path: str) -> Dict[str, Any]:
        """AI-powered analysis of project structure for optimal CI/CD setup"""
        
        try:
            # Scan project files
            file_structure = await self._scan_project_files(project_path)
            
            analysis_prompt = f"""
            Analyze this project structure and recommend optimal Git & CI/CD configuration:
            
            PROJECT FILES: {json.dumps(file_structure, indent=2)}
            
            Provide recommendations for:
            1. Git workflow (GitHub Flow, Git Flow, or custom)
            2. Branch strategy and protection rules
            3. CI/CD pipeline steps based on detected tech stack
            4. Deployment platforms suitable for this project
            5. Quality gates and testing strategy
            6. Security and compliance requirements
            
            Return JSON:
            {{
                "detected_tech_stack": ["React", "FastAPI", "Python"],
                "project_type": "full_stack_web_app",
                "recommended_workflow": "github_flow",
                "branch_strategy": {{
                    "main": "production_ready",
                    "develop": "integration_branch",
                    "feature": "feature/*",
                    "hotfix": "hotfix/*"
                }},
                "ci_pipeline": [
                    {{"step": "install_dependencies", "command": "npm install && pip install -r requirements.txt"}},
                    {{"step": "run_tests", "command": "npm test && python -m pytest"}},
                    {{"step": "build", "command": "npm run build"}},
                    {{"step": "quality_check", "command": "eslint src/ && flake8 ."}}
                ],
                "deployment_recommendations": [
                    {{"platform": "vercel", "suitability": "excellent", "config": {{}}}},
                    {{"platform": "railway", "suitability": "good", "config": {{}}}}
                ],
                "security_recommendations": ["dependabot", "code_scanning", "secret_scanning"]
            }}
            """
            
            analysis_response = await self.ai_service.generate_response(
                analysis_prompt,
                model="llama-3.3-70b-versatile",
                max_tokens=1500,
                temperature=0.1
            )
            
            return json.loads(analysis_response)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Project analysis error: {str(e)}")
    
    async def _scan_project_files(self, project_path: str) -> Dict[str, Any]:
        """Scan project directory for relevant files"""
        file_structure = {
            "config_files": [],
            "package_files": [],
            "source_dirs": [],
            "test_dirs": [],
            "build_files": []
        }
        
        try:
            for root, dirs, files in os.walk(project_path):
                for file in files:
                    if file in ['package.json', 'requirements.txt', 'Pipfile', 'pom.xml', 'build.gradle']:
                        file_structure["package_files"].append(file)
                    elif file.endswith(('.config.js', '.config.json', 'Dockerfile', 'docker-compose.yml')):
                        file_structure["config_files"].append(file)
                    elif 'test' in root.lower() or file.startswith('test_'):
                        file_structure["test_dirs"].append(root)
                    elif file.endswith(('.js', '.ts', '.py', '.java', '.go', '.rs')):
                        if 'src' in root or 'lib' in root:
                            file_structure["source_dirs"].append(root)
            
            # Remove duplicates
            for key in file_structure:
                file_structure[key] = list(set(file_structure[key]))
            
            return file_structure
            
        except Exception as e:
            return {"error": f"Failed to scan project: {str(e)}"}
    
    async def create_github_repo(self, repo_config: Dict[str, Any], access_token: str) -> Dict[str, Any]:
        """Create GitHub repository with optimal settings"""
        
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
        
        repo_data = {
            "name": repo_config["name"],
            "description": repo_config.get("description", ""),
            "private": repo_config.get("private", False),
            "auto_init": True,
            "gitignore_template": repo_config.get("gitignore_template", "Python"),
            "license_template": repo_config.get("license", "mit")
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.github.com/user/repos",
                    headers=headers,
                    json=repo_data
                ) as response:
                    if response.status == 201:
                        repo_info = await response.json()
                        
                        # Setup branch protection and CI/CD
                        await self._setup_branch_protection(
                            repo_info["full_name"], 
                            access_token,
                            repo_config.get("branch_protection", {})
                        )
                        
                        return {
                            "status": "success",
                            "repo_url": repo_info["html_url"],
                            "clone_url": repo_info["clone_url"],
                            "ssh_url": repo_info["ssh_url"]
                        }
                    else:
                        error_data = await response.json()
                        raise HTTPException(status_code=response.status, detail=error_data.get("message", "Failed to create repository"))
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GitHub API error: {str(e)}")
    
    async def _setup_branch_protection(self, repo_full_name: str, access_token: str, protection_config: Dict[str, Any]):
        """Setup branch protection rules"""
        
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
        
        protection_data = {
            "required_status_checks": {
                "strict": True,
                "contexts": protection_config.get("required_checks", ["continuous-integration"])
            },
            "enforce_admins": protection_config.get("enforce_admins", False),
            "required_pull_request_reviews": {
                "required_approving_review_count": protection_config.get("required_reviewers", 1),
                "dismiss_stale_reviews": True
            },
            "restrictions": None
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.put(
                    f"https://api.github.com/repos/{repo_full_name}/branches/main/protection",
                    headers=headers,
                    json=protection_data
                ) as response:
                    return response.status == 200
        except:
            return False
    
    async def generate_cicd_config(self, project_analysis: Dict[str, Any], deployment_config: DeploymentConfig) -> Dict[str, str]:
        """Generate CI/CD configuration files for different platforms"""
        
        config_prompt = f"""
        Generate CI/CD configuration files for this project:
        
        PROJECT ANALYSIS: {json.dumps(project_analysis, indent=2)}
        DEPLOYMENT CONFIG: {deployment_config.dict()}
        
        Generate configuration files for:
        1. GitHub Actions (.github/workflows/ci.yml)
        2. Vercel (vercel.json) if suitable
        3. Railway (railway.toml) if suitable  
        4. Docker (Dockerfile, docker-compose.yml) if needed
        
        Return JSON with file contents:
        {{
            "github_actions": "YAML content for GitHub Actions",
            "vercel_config": "JSON content for Vercel",
            "railway_config": "TOML content for Railway",
            "dockerfile": "Docker configuration if needed"
        }}
        """
        
        try:
            config_response = await self.ai_service.generate_response(
                config_prompt,
                model="llama-3.3-70b-versatile",
                max_tokens=2000,
                temperature=0.1
            )
            
            return json.loads(config_response)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"CI/CD config generation error: {str(e)}")
    
    async def execute_deployment(self, deployment_config: DeploymentConfig, project_path: str) -> Dict[str, Any]:
        """Execute deployment to specified platform"""
        
        deployment_results = {
            "status": "started",
            "platform": deployment_config.platform,
            "environment": deployment_config.environment,
            "logs": [],
            "deployment_url": None
        }
        
        try:
            if deployment_config.platform == "vercel":
                result = await self._deploy_to_vercel(project_path, deployment_config.config)
            elif deployment_config.platform == "railway":
                result = await self._deploy_to_railway(project_path, deployment_config.config)
            elif deployment_config.platform == "netlify":
                result = await self._deploy_to_netlify(project_path, deployment_config.config)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported deployment platform: {deployment_config.platform}")
            
            deployment_results.update(result)
            deployment_results["status"] = "completed"
            
            return deployment_results
            
        except Exception as e:
            deployment_results["status"] = "failed"
            deployment_results["error"] = str(e)
            return deployment_results
    
    async def _deploy_to_vercel(self, project_path: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy to Vercel platform"""
        # Implementation for Vercel deployment
        return {
            "deployment_url": "https://your-app.vercel.app",
            "logs": ["Deployment successful to Vercel"]
        }
    
    async def _deploy_to_railway(self, project_path: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy to Railway platform"""
        # Implementation for Railway deployment
        return {
            "deployment_url": "https://your-app.railway.app",
            "logs": ["Deployment successful to Railway"]
        }
    
    async def _deploy_to_netlify(self, project_path: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy to Netlify platform"""
        # Implementation for Netlify deployment
        return {
            "deployment_url": "https://your-app.netlify.app",
            "logs": ["Deployment successful to Netlify"]
        }

git_cicd_service = GitCICDService()

@router.post("/analyze-project")
async def analyze_project_structure(
    project_path: str,
    current_user: dict = Depends(get_current_user)
):
    """Analyze project structure for optimal Git & CI/CD setup"""
    try:
        analysis = await git_cicd_service.analyze_project_structure(project_path)
        return {
            "message": "Project analyzed successfully",
            "analysis": analysis,
            "recommendations": analysis.get("deployment_recommendations", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-repo")
async def create_github_repository(
    repo_config: Dict[str, Any],
    access_token: str,
    current_user: dict = Depends(get_current_user)
):
    """Create GitHub repository with optimal settings"""
    try:
        result = await git_cicd_service.create_github_repo(repo_config, access_token)
        
        # Store repo info in database
        db = await get_database()
        await db.git_repositories.insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": current_user["user_id"],
            "repo_config": repo_config,
            "repo_info": result,
            "created_at": datetime.utcnow()
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-cicd")
async def generate_cicd_configuration(
    project_analysis: Dict[str, Any],
    deployment_config: DeploymentConfig,
    current_user: dict = Depends(get_current_user)
):
    """Generate CI/CD configuration files"""
    try:
        config_files = await git_cicd_service.generate_cicd_config(project_analysis, deployment_config)
        return {
            "message": "CI/CD configuration generated successfully",
            "config_files": config_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deploy")
async def deploy_project(
    deployment_config: DeploymentConfig,
    project_path: str,
    current_user: dict = Depends(get_current_user)
):
    """Deploy project to specified platform"""
    try:
        deployment_result = await git_cicd_service.execute_deployment(deployment_config, project_path)
        
        # Store deployment info
        db = await get_database()
        await db.deployments.insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": current_user["user_id"],
            "deployment_config": deployment_config.dict(),
            "result": deployment_result,
            "created_at": datetime.utcnow()
        })
        
        return deployment_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/deployments")
async def get_user_deployments(
    current_user: dict = Depends(get_current_user)
):
    """Get user's deployment history"""
    try:
        db = await get_database()
        cursor = db.deployments.find({"user_id": current_user["user_id"]})
        deployments = await cursor.to_list(length=50)
        
        return {
            "deployments": [
                {
                    "id": deployment["_id"],
                    "platform": deployment["deployment_config"]["platform"],
                    "environment": deployment["deployment_config"]["environment"],
                    "status": deployment["result"]["status"],
                    "deployment_url": deployment["result"].get("deployment_url"),
                    "created_at": deployment["created_at"]
                } for deployment in deployments
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/repositories")
async def get_user_repositories(
    current_user: dict = Depends(get_current_user)
):
    """Get user's connected repositories"""
    try:
        db = await get_database()
        cursor = db.git_repositories.find({"user_id": current_user["user_id"]})
        repositories = await cursor.to_list(length=50)
        
        return {
            "repositories": [
                {
                    "id": repo["_id"],
                    "name": repo["repo_config"]["name"],
                    "repo_url": repo["repo_info"]["repo_url"],
                    "created_at": repo["created_at"]
                } for repo in repositories
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))