from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from datetime import datetime
import json
import logging
import uuid

from models.user import User
from models.project import Project, ProjectCreate, ProjectUpdate, ProjectStatus, FileContent
from models.database import get_database
from routes.auth import get_current_user
from services.project_service import ProjectService

router = APIRouter()
project_service = ProjectService()
logger = logging.getLogger(__name__)

@router.post("/", response_model=dict)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Create a new project"""
    try:
        db = await get_database()
        
        # Generate unique project ID
        project_id = f"proj_{uuid.uuid4().hex[:12]}"
        
        # Create project data
        project_data = {
            "_id": project_id,
            "user_id": str(current_user.id),
            "name": project.name,
            "description": project.description,
            "type": project.type,
            "status": ProjectStatus.DRAFT.value,
            "template_id": project.template_id,
            "requirements": project.requirements or [],
            "tech_stack": [],
            "files": [],
            "build_logs": [],
            "deployment_url": None,
            "metadata": {
                "created_by": current_user.name,
                "estimated_completion": None,
                "priority": "medium"
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.projects.insert_one(project_data)
        project_data["id"] = project_id
        
        # If template_id is provided, initialize from template
        if project.template_id and background_tasks:
            background_tasks.add_task(
                project_service.initialize_from_template,
                project_id,
                project.template_id
            )
        
        # Update user's project count
        await db.users.update_one(
            {"_id": str(current_user.id)},
            {"$inc": {"projects_count": 1}}
        )
        
        logger.info(f"Project created: {project_id} by user {current_user.id}")
        
        return {
            "project": project_data,
            "message": "Project created successfully"
        }
        
    except Exception as e:
        logger.error(f"Project creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project")

@router.get("/", response_model=dict)
async def get_projects(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """Get user's projects"""
    try:
        db = await get_database()
        
        # Build query
        query = {"user_id": str(current_user.id)}
        if status:
            query["status"] = status
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        # Get projects with pagination
        projects_cursor = db.projects.find(query).sort("updated_at", -1).skip(offset).limit(limit)
        projects = await projects_cursor.to_list(length=limit)
        
        # Convert _id to id and ensure consistency
        for project in projects:
            project["id"] = str(project["_id"])
            project["_id"] = str(project["_id"])
            project["status"] = project.get("status", "draft")
            project["tech_stack"] = project.get("tech_stack", [])
        
        total = await db.projects.count_documents(query)
        
        return {
            "projects": projects,
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Projects fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch projects")

@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific project"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project["id"] = str(project["_id"])
        project["_id"] = str(project["_id"])
        
        return {"project": project}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project")

@router.put("/{project_id}", response_model=dict)
async def update_project(
    project_id: str,
    update_data: ProjectUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a project"""
    try:
        db = await get_database()
        
        # Check if project exists and belongs to user
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Prepare update data
        update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        # Update project
        await db.projects.update_one(
            {"_id": project_id},
            {"$set": update_dict}
        )
        
        # Get updated project
        updated_project = await db.projects.find_one({"_id": project_id})
        updated_project["id"] = str(updated_project["_id"])
        updated_project["_id"] = str(updated_project["_id"])
        
        logger.info(f"Project updated: {project_id}")
        
        return {
            "project": updated_project,
            "message": "Project updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update project")

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a project"""
    try:
        db = await get_database()
        
        result = await db.projects.delete_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update user's project count
        await db.users.update_one(
            {"_id": str(current_user.id)},
            {"$inc": {"projects_count": -1}}
        )
        
        logger.info(f"Project deleted: {project_id}")
        
        return {"message": "Project deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete project")

@router.post("/{project_id}/build")
async def build_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Build a project"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update status to building
        await db.projects.update_one(
            {"_id": project_id},
            {
                "$set": {
                    "status": "building",
                    "updated_at": datetime.utcnow()
                },
                "$push": {
                    "build_logs": {
                        "timestamp": datetime.utcnow(),
                        "message": "Build started",
                        "level": "info"
                    }
                }
            }
        )
        
        # Start build process in background
        if background_tasks:
            background_tasks.add_task(
                project_service.build_project,
                project_id
            )
        
        logger.info(f"Build started for project: {project_id}")
        
        return {"message": "Build started", "status": "building"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project build error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start build")

@router.post("/{project_id}/deploy")
async def deploy_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Deploy a project"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if project is ready for deployment
        if project.get("status") not in ["ready", "deployed"] and len(project.get("files", [])) == 0:
            raise HTTPException(status_code=400, detail="Project must be built before deployment")
        
        # Update status to deploying
        await db.projects.update_one(
            {"_id": project_id},
            {
                "$set": {
                    "status": "deploying",
                    "updated_at": datetime.utcnow()
                },
                "$push": {
                    "build_logs": {
                        "timestamp": datetime.utcnow(),
                        "message": "Deployment started",
                        "level": "info"
                    }
                }
            }
        )
        
        # Start deployment process
        if background_tasks:
            background_tasks.add_task(
                project_service.deploy_project,
                project_id
            )
        
        logger.info(f"Deployment started for project: {project_id}")
        
        return {"message": "Deployment started", "status": "deploying"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project deployment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start deployment")

@router.get("/{project_id}/files")
async def get_project_files(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get project files"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return {"files": project.get("files", [])}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project files fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project files")

@router.post("/{project_id}/files")
async def save_project_file(
    project_id: str,
    file_data: FileContent,
    current_user: User = Depends(get_current_user)
):
    """Save a file to project"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update or add file
        files = project.get("files", [])
        file_exists = False
        
        file_dict = file_data.dict()
        file_dict["updated_at"] = datetime.utcnow()
        
        for i, existing_file in enumerate(files):
            if existing_file["path"] == file_data.path:
                files[i] = file_dict
                file_exists = True
                break
        
        if not file_exists:
            files.append(file_dict)
        
        # Update project
        await db.projects.update_one(
            {"_id": project_id},
            {
                "$set": {
                    "files": files,
                    "updated_at": datetime.utcnow(),
                    "status": "ready"  # Mark as ready when files are saved
                }
            }
        )
        
        logger.info(f"File saved for project {project_id}: {file_data.path}")
        
        return {"message": "File saved successfully", "file": file_dict}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File save error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file")

@router.get("/{project_id}/logs")
async def get_project_logs(
    project_id: str,
    current_user: User = Depends(get_current_user),
    limit: int = 50
):
    """Get project build logs"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        logs = project.get("build_logs", [])
        
        # Return last N logs
        return {"logs": logs[-limit:] if len(logs) > limit else logs}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project logs fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project logs")