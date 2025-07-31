import asyncio
import os
import tempfile
import shutil
from typing import Dict, Any, List
from datetime import datetime
import logging

from models.database import get_database
from models.project import ProjectStatus
from models.template import Template

logger = logging.getLogger(__name__)

class ProjectService:
    """Service for project operations"""
    
    def __init__(self):
        self.build_queue = asyncio.Queue()
        self.deploy_queue = asyncio.Queue()
    
    async def initialize_from_template(self, project_id: str, template_id: str):
        """Initialize project from a template"""
        try:
            db = await get_database()
            
            # Get template
            from routes.templates import SAMPLE_TEMPLATES
            template = next((t for t in SAMPLE_TEMPLATES if t["_id"] == template_id), None)
            
            if not template:
                logger.error(f"Template {template_id} not found")
                return
            
            # Update project with template files
            await db.projects.update_one(
                {"_id": project_id},
                {
                    "$set": {
                        "files": template["files"],
                        "updated_at": datetime.utcnow()
                    },
                    "$push": {
                        "build_logs": f"Initialized from template: {template['name']}"
                    }
                }
            )
            
            logger.info(f"Project {project_id} initialized from template {template_id}")
            
        except Exception as e:
            logger.error(f"Error initializing project from template: {e}")
            await self._update_project_status(project_id, ProjectStatus.ERROR, str(e))
    
    async def build_project(self, project_id: str):
        """Build a project"""
        try:
            db = await get_database()
            project = await db.projects.find_one({"_id": project_id})
            
            if not project:
                logger.error(f"Project {project_id} not found")
                return
            
            # Update status
            await self._update_project_status(project_id, ProjectStatus.BUILDING)
            
            # Simulate build process
            build_steps = [
                "Analyzing project structure...",
                "Installing dependencies...",
                "Running build process...",
                "Optimizing assets...",
                "Generating build artifacts..."
            ]
            
            for step in build_steps:
                await db.projects.update_one(
                    {"_id": project_id},
                    {"$push": {"build_logs": step}}
                )
                await asyncio.sleep(1)  # Simulate build time
            
            # Check for build errors (simulate)
            if self._should_simulate_build_error():
                error_msg = "Build failed: Missing dependency 'react-scripts'"
                await self._update_project_status(project_id, ProjectStatus.ERROR, error_msg)
                return
            
            # Success
            await self._update_project_status(project_id, ProjectStatus.DEPLOYED)
            await db.projects.update_one(
                {"_id": project_id},
                {"$push": {"build_logs": "✅ Build completed successfully!"}}
            )
            
            logger.info(f"Project {project_id} built successfully")
            
        except Exception as e:
            logger.error(f"Error building project {project_id}: {e}")
            await self._update_project_status(project_id, ProjectStatus.ERROR, str(e))
    
    async def deploy_project(self, project_id: str):
        """Deploy a project"""
        try:
            db = await get_database()
            project = await db.projects.find_one({"_id": project_id})
            
            if not project:
                logger.error(f"Project {project_id} not found")
                return
            
            # Generate deployment URL
            deployment_url = f"https://{project['name'].lower().replace(' ', '-')}-{project_id[:8]}.aicodestudio.app"
            
            # Update project with deployment info
            await db.projects.update_one(
                {"_id": project_id},
                {
                    "$set": {
                        "deployment_url": deployment_url,
                        "status": ProjectStatus.DEPLOYED,
                        "updated_at": datetime.utcnow()
                    },
                    "$push": {
                        "build_logs": f"🚀 Deployed to: {deployment_url}"
                    }
                }
            )
            
            logger.info(f"Project {project_id} deployed to {deployment_url}")
            
        except Exception as e:
            logger.error(f"Error deploying project {project_id}: {e}")
            await self._update_project_status(project_id, ProjectStatus.ERROR, str(e))
    
    async def _update_project_status(self, project_id: str, status: ProjectStatus, error_msg: str = None):
        """Update project status"""
        db = await get_database()
        
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if error_msg:
            update_data["build_logs"] = [f"❌ Error: {error_msg}"]
        
        await db.projects.update_one(
            {"_id": project_id},
            {"$set": update_data}
        )
    
    def _should_simulate_build_error(self) -> bool:
        """Simulate occasional build errors for demo purposes"""
        import random
        return random.random() < 0.1  # 10% chance of error
    
    async def get_project_analytics(self, project_id: str) -> Dict[str, Any]:
        """Get project analytics and metrics"""
        db = await get_database()
        project = await db.projects.find_one({"_id": project_id})
        
        if not project:
            return {}
        
        # Calculate metrics
        files_count = len(project.get("files", []))
        lines_of_code = sum(
            len(file.get("content", "").split("\n"))
            for file in project.get("files", [])
        )
        
        return {
            "files_count": files_count,
            "lines_of_code": lines_of_code,
            "build_count": len([log for log in project.get("build_logs", []) if "Build started" in log]),
            "last_updated": project.get("updated_at"),
            "deployment_status": project.get("status"),
            "deployment_url": project.get("deployment_url")
        }
    
    async def duplicate_project(self, project_id: str, user_id: str, new_name: str) -> str:
        """Duplicate an existing project"""
        db = await get_database()
        
        # Get original project
        original = await db.projects.find_one({"_id": project_id})
        if not original:
            raise ValueError("Project not found")
        
        # Create new project data
        new_project = {
            "user_id": user_id,
            "name": new_name,
            "description": f"Copy of {original['name']}",
            "type": original["type"],
            "status": ProjectStatus.DRAFT,
            "files": original.get("files", []),
            "metadata": {"duplicated_from": project_id},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert new project
        result = await db.projects.insert_one(new_project)
        
        return str(result.inserted_id)
    
    async def export_project(self, project_id: str) -> Dict[str, Any]:
        """Export project as JSON"""
        db = await get_database()
        project = await db.projects.find_one({"_id": project_id})
        
        if not project:
            raise ValueError("Project not found")
        
        # Clean up for export
        export_data = {
            "name": project["name"],
            "description": project.get("description"),
            "type": project["type"],
            "files": project.get("files", []),
            "requirements": project.get("requirements"),
            "exported_at": datetime.utcnow().isoformat()
        }
        
        return export_data