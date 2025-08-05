from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime
import logging
from pydantic import BaseModel
import asyncio
import json

logger = logging.getLogger(__name__)
router = APIRouter()

# Models for Git & CI/CD Integration
class GitRepository(BaseModel):
    id: str
    name: str
    url: str
    branch: str
    provider: str  # github, gitlab, bitbucket
    is_private: bool
    last_commit: Optional[Dict] = None
    created_at: datetime

class DeploymentTarget(BaseModel):
    id: str
    name: str
    provider: str  # vercel, netlify, heroku, aws, railway
    environment: str  # development, staging, production
    auto_deploy: bool
    branch_pattern: str  # main, develop, feat/*
    build_command: Optional[str] = None
    deploy_url: Optional[str] = None
    status: str = "inactive"  # active, inactive, deploying, error

class CIPipeline(BaseModel):
    id: str
    name: str
    repository_id: str
    trigger_events: List[str]  # push, pull_request, tag
    steps: List[Dict]
    environment_variables: Dict[str, str]
    status: str = "inactive"
    last_run: Optional[Dict] = None

class GitCommit(BaseModel):
    sha: str
    message: str
    author: str
    timestamp: datetime
    files_changed: List[str]
    additions: int
    deletions: int

class DeploymentHistory(BaseModel):
    id: str
    deployment_id: str
    commit_sha: str
    status: str  # pending, deploying, success, failed
    build_logs: List[str]
    deploy_time: Optional[datetime] = None
    duration: Optional[int] = None  # seconds
    error_message: Optional[str] = None

# Advanced Git & CI/CD Engine
class GitCICDEngine:
    def __init__(self):
        # In-memory storage (in production, use database)
        self.repositories: Dict[str, GitRepository] = {}
        self.deployment_targets: Dict[str, DeploymentTarget] = {}
        self.ci_pipelines: Dict[str, CIPipeline] = {}
        self.deployment_history: List[DeploymentHistory] = []
        
        # Mock deployment providers
        self.deployment_providers = {
            "vercel": {
                "name": "Vercel",
                "supports": ["react", "nextjs", "vue", "angular"],
                "build_commands": {
                    "react": "npm run build",
                    "nextjs": "next build",
                    "vue": "npm run build"
                }
            },
            "netlify": {
                "name": "Netlify", 
                "supports": ["react", "vue", "angular", "static"],
                "build_commands": {
                    "react": "npm run build",
                    "vue": "npm run build"
                }
            },
            "railway": {
                "name": "Railway",
                "supports": ["node", "python", "golang", "ruby"],
                "build_commands": {
                    "node": "npm start",
                    "python": "python app.py"
                }
            },
            "heroku": {
                "name": "Heroku",
                "supports": ["node", "python", "ruby", "php", "java"],
                "build_commands": {
                    "node": "npm start",
                    "python": "python app.py"
                }
            }
        }
    
    async def connect_repository(self, repo_data: Dict) -> GitRepository:
        """Connect a Git repository to the platform"""
        try:
            # Simulate repository connection
            repo = GitRepository(
                id=str(uuid.uuid4()),
                name=repo_data["name"],
                url=repo_data["url"],
                branch=repo_data.get("branch", "main"),
                provider=self._detect_git_provider(repo_data["url"]),
                is_private=repo_data.get("is_private", False),
                created_at=datetime.now()
            )
            
            # Mock fetch latest commit
            repo.last_commit = {
                "sha": "abc123def456",
                "message": "Initial commit",
                "author": "Developer",
                "timestamp": datetime.now().isoformat()
            }
            
            self.repositories[repo.id] = repo
            logger.info(f"Connected repository: {repo.name}")
            return repo
            
        except Exception as e:
            logger.error(f"Error connecting repository: {e}")
            raise
    
    def _detect_git_provider(self, url: str) -> str:
        """Detect git provider from repository URL"""
        if "github.com" in url:
            return "github"
        elif "gitlab.com" in url:
            return "gitlab"
        elif "bitbucket.org" in url:
            return "bitbucket"
        else:
            return "unknown"
    
    async def create_deployment_target(self, target_data: Dict) -> DeploymentTarget:
        """Create a new deployment target"""
        try:
            # Validate provider
            provider = target_data["provider"]
            if provider not in self.deployment_providers:
                raise ValueError(f"Unsupported deployment provider: {provider}")
            
            target = DeploymentTarget(
                id=str(uuid.uuid4()),
                name=target_data["name"],
                provider=provider,
                environment=target_data["environment"],
                auto_deploy=target_data.get("auto_deploy", False),
                branch_pattern=target_data.get("branch_pattern", "main"),
                build_command=target_data.get("build_command")
            )
            
            # Generate mock deploy URL
            target.deploy_url = f"https://{target.name.lower().replace(' ', '-')}.{provider}.app"
            
            self.deployment_targets[target.id] = target
            logger.info(f"Created deployment target: {target.name}")
            return target
            
        except Exception as e:
            logger.error(f"Error creating deployment target: {e}")
            raise
    
    async def setup_ci_pipeline(self, pipeline_data: Dict) -> CIPipeline:
        """Setup CI/CD pipeline for a repository"""
        try:
            repository_id = pipeline_data["repository_id"]
            if repository_id not in self.repositories:
                raise ValueError("Repository not found")
            
            # Create default pipeline steps
            default_steps = [
                {
                    "name": "Checkout Code",
                    "type": "checkout",
                    "config": {"fetch-depth": 0}
                },
                {
                    "name": "Setup Environment",
                    "type": "setup",
                    "config": {"node-version": "18"}
                },
                {
                    "name": "Install Dependencies",
                    "type": "run",
                    "config": {"command": "npm install"}
                },
                {
                    "name": "Run Tests",
                    "type": "test",
                    "config": {"command": "npm test"}
                },
                {
                    "name": "Build Application",
                    "type": "build", 
                    "config": {"command": "npm run build"}
                }
            ]
            
            pipeline = CIPipeline(
                id=str(uuid.uuid4()),
                name=pipeline_data["name"],
                repository_id=repository_id,
                trigger_events=pipeline_data.get("trigger_events", ["push"]),
                steps=pipeline_data.get("steps", default_steps),
                environment_variables=pipeline_data.get("env_vars", {})
            )
            
            self.ci_pipelines[pipeline.id] = pipeline
            logger.info(f"Created CI pipeline: {pipeline.name}")
            return pipeline
            
        except Exception as e:
            logger.error(f"Error setting up CI pipeline: {e}")
            raise
    
    async def trigger_deployment(
        self, 
        repository_id: str, 
        target_id: str, 
        commit_sha: str = None
    ) -> DeploymentHistory:
        """Trigger a deployment"""
        try:
            # Validate inputs
            if repository_id not in self.repositories:
                raise ValueError("Repository not found")
            if target_id not in self.deployment_targets:
                raise ValueError("Deployment target not found")
            
            repo = self.repositories[repository_id]
            target = self.deployment_targets[target_id]
            
            # Create deployment history entry
            deployment = DeploymentHistory(
                id=str(uuid.uuid4()),
                deployment_id=target_id,
                commit_sha=commit_sha or repo.last_commit["sha"],
                status="pending",
                build_logs=[]
            )
            
            # Simulate deployment process
            await self._simulate_deployment(deployment, target)
            
            self.deployment_history.append(deployment)
            logger.info(f"Triggered deployment: {deployment.id}")
            return deployment
            
        except Exception as e:
            logger.error(f"Error triggering deployment: {e}")
            raise
    
    async def _simulate_deployment(self, deployment: DeploymentHistory, target: DeploymentTarget):
        """Simulate deployment process with logs"""
        try:
            deployment.status = "deploying"
            start_time = datetime.now()
            
            # Simulate build steps with logs
            build_steps = [
                "📥 Cloning repository...",
                "🔧 Installing dependencies...",
                "⚙️ Running build process...",
                "🧪 Running tests...",
                "📦 Creating deployment package...",
                "🚀 Deploying to production...",
                "✅ Deployment successful!"
            ]
            
            for step in build_steps:
                deployment.build_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] {step}")
                await asyncio.sleep(0.1)  # Simulate time
            
            # Mark as successful (90% success rate in simulation)
            import random
            if random.random() > 0.1:
                deployment.status = "success"
                deployment.deploy_time = datetime.now()
                target.status = "active"
            else:
                deployment.status = "failed"
                deployment.error_message = "Build failed: Test suite returned errors"
                deployment.build_logs.append("❌ Build failed!")
            
            # Calculate duration
            deployment.duration = int((datetime.now() - start_time).total_seconds())
            
        except Exception as e:
            deployment.status = "failed"
            deployment.error_message = str(e)
            logger.error(f"Deployment simulation error: {e}")
    
    async def get_repository_commits(self, repository_id: str, limit: int = 10) -> List[GitCommit]:
        """Get recent commits for a repository"""
        try:
            if repository_id not in self.repositories:
                raise ValueError("Repository not found")
            
            # Mock commit history
            commits = []
            for i in range(limit):
                commit = GitCommit(
                    sha=f"commit{i:03d}hash",
                    message=f"Mock commit #{i+1}: Added new features",
                    author="Developer",
                    timestamp=datetime.now() - timedelta(days=i),
                    files_changed=[f"src/file{i}.js", f"test/test{i}.js"],
                    additions=15 + (i * 3),
                    deletions=5 + i
                )
                commits.append(commit)
            
            return commits
            
        except Exception as e:
            logger.error(f"Error getting commits: {e}")
            raise
    
    async def get_deployment_status(self, deployment_id: str) -> Dict:
        """Get detailed deployment status"""
        try:
            deployment = next(
                (d for d in self.deployment_history if d.id == deployment_id),
                None
            )
            
            if not deployment:
                raise ValueError("Deployment not found")
            
            target = self.deployment_targets.get(deployment.deployment_id)
            
            return {
                "deployment": deployment.dict(),
                "target": target.dict() if target else None,
                "logs": deployment.build_logs,
                "metrics": {
                    "duration": deployment.duration,
                    "success_rate": "90%",
                    "avg_deploy_time": "2m 30s"
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting deployment status: {e}")
            raise

# Initialize Git CI/CD engine
git_cicd_engine = GitCICDEngine()

@router.post("/repositories/connect", response_model=GitRepository)
async def connect_repository(repo_data: Dict[str, Any]):
    """Connect a Git repository"""
    try:
        repository = await git_cicd_engine.connect_repository(repo_data)
        return repository
    except Exception as e:
        logger.error(f"Error connecting repository: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/repositories")
async def list_repositories():
    """List connected repositories"""
    try:
        repos = list(git_cicd_engine.repositories.values())
        return {"repositories": [repo.dict() for repo in repos]}
    except Exception as e:
        logger.error(f"Error listing repositories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/repositories/{repository_id}/commits")
async def get_repository_commits(repository_id: str, limit: int = 10):
    """Get recent commits for a repository"""
    try:
        commits = await git_cicd_engine.get_repository_commits(repository_id, limit)
        return {"commits": [commit.dict() for commit in commits]}
    except Exception as e:
        logger.error(f"Error getting commits: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deployment-targets", response_model=DeploymentTarget)
async def create_deployment_target(target_data: Dict[str, Any]):
    """Create a deployment target"""
    try:
        target = await git_cicd_engine.create_deployment_target(target_data)
        return target
    except Exception as e:
        logger.error(f"Error creating deployment target: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/deployment-targets")
async def list_deployment_targets():
    """List deployment targets"""
    try:
        targets = list(git_cicd_engine.deployment_targets.values())
        return {"targets": [target.dict() for target in targets]}
    except Exception as e:
        logger.error(f"Error listing deployment targets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pipelines", response_model=CIPipeline)
async def create_ci_pipeline(pipeline_data: Dict[str, Any]):
    """Create a CI/CD pipeline"""
    try:
        pipeline = await git_cicd_engine.setup_ci_pipeline(pipeline_data)
        return pipeline
    except Exception as e:
        logger.error(f"Error creating CI pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pipelines")
async def list_ci_pipelines():
    """List CI/CD pipelines"""
    try:
        pipelines = list(git_cicd_engine.ci_pipelines.values())
        return {"pipelines": [pipeline.dict() for pipeline in pipelines]}
    except Exception as e:
        logger.error(f"Error listing CI pipelines: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deploy")
async def trigger_deployment(deployment_request: Dict[str, Any]):
    """Trigger a deployment"""
    try:
        deployment = await git_cicd_engine.trigger_deployment(
            repository_id=deployment_request["repository_id"],
            target_id=deployment_request["target_id"],
            commit_sha=deployment_request.get("commit_sha")
        )
        return {"deployment": deployment.dict()}
    except Exception as e:
        logger.error(f"Error triggering deployment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/deployments")
async def get_deployment_history():
    """Get deployment history"""
    try:
        deployments = git_cicd_engine.deployment_history[-20:]  # Last 20 deployments
        return {"deployments": [d.dict() for d in deployments]}
    except Exception as e:
        logger.error(f"Error getting deployment history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/deployments/{deployment_id}/status")
async def get_deployment_status(deployment_id: str):
    """Get detailed deployment status"""
    try:
        status = await git_cicd_engine.get_deployment_status(deployment_id)
        return status
    except Exception as e:
        logger.error(f"Error getting deployment status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/providers")
async def list_deployment_providers():
    """List available deployment providers"""
    try:
        return {"providers": git_cicd_engine.deployment_providers}
    except Exception as e:
        logger.error(f"Error listing providers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auto-setup")
async def auto_setup_deployment(project_data: Dict[str, Any]):
    """Automatically setup repository, pipeline and deployment"""
    try:
        # Connect repository
        repo = await git_cicd_engine.connect_repository({
            "name": project_data["project_name"],
            "url": project_data["repository_url"],
            "branch": project_data.get("branch", "main")
        })
        
        # Create deployment target
        target = await git_cicd_engine.create_deployment_target({
            "name": f"{project_data['project_name']} - Production",
            "provider": project_data.get("provider", "vercel"),
            "environment": "production",
            "auto_deploy": True,
            "branch_pattern": "main"
        })
        
        # Setup CI pipeline
        pipeline = await git_cicd_engine.setup_ci_pipeline({
            "name": f"{project_data['project_name']} - CI",
            "repository_id": repo.id,
            "trigger_events": ["push", "pull_request"]
        })
        
        return {
            "repository": repo.dict(),
            "deployment_target": target.dict(),
            "ci_pipeline": pipeline.dict(),
            "message": "Auto-setup completed successfully!"
        }
        
    except Exception as e:
        logger.error(f"Error in auto-setup: {e}")
        raise HTTPException(status_code=500, detail=str(e))