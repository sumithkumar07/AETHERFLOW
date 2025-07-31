from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from datetime import datetime
import json

from models.user import User
from models.project import Project, ProjectCreate, ProjectUpdate, ProjectStatus, FileContent
from models.database import get_database
from routes.auth import get_current_user
from services.project_service import ProjectService

router = APIRouter()
project_service = ProjectService()

@router.post("/", response_model=dict)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Create a new project"""
    db = await get_database()
    
    # Create project data
    project_data = {
        "user_id": str(current_user.id),
        "name": project.name,
        "description": project.description,
        "type": project.type,
        "status": ProjectStatus.DRAFT,
        "template_id": project.template_id,
        "requirements": project.requirements,
        "files": [],
        "build_logs": [],
        "metadata": {},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.projects.insert_one(project_data)
    project_data["_id"] = str(result.inserted_id)
    
    # If template_id is provided, initialize from template
    if project.template_id:
        background_tasks.add_task(
            project_service.initialize_from_template,
            str(result.inserted_id),
            project.template_id
        )
    
    # Update user's project count
    await db.users.update_one(
        {"_id": str(current_user.id)},
        {"$inc": {"projects_count": 1}}
    )
    
    return {
        "project": project_data,
        "message": "Project created successfully"
    }

@router.get("/", response_model=dict)
async def get_projects(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    status: Optional[ProjectStatus] = None
):
    """Get user's projects"""
    db = await get_database()
    
    query = {"user_id": str(current_user.id)}
    if status:
        query["status"] = status
    
    projects = await db.projects.find(query).sort("updated_at", -1).skip(offset).limit(limit).to_list(length=limit)
    
    # Convert ObjectId to string
    for project in projects:
        project["_id"] = str(project["_id"])
    
    return {
        "projects": projects,
        "total": await db.projects.count_documents(query)
    }

@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific project"""
    db = await get_database()
    
    project = await db.projects.find_one({
        "_id": project_id,
        "user_id": str(current_user.id)
    })
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project["_id"] = str(project["_id"])
    return {"project": project}

@router.put("/{project_id}", response_model=dict)
async def update_project(
    project_id: str,
    update_data: ProjectUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a project"""
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
    updated_project["_id"] = str(updated_project["_id"])
    
    return {
        "project": updated_project,
        "message": "Project updated successfully"
    }

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a project"""
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
    
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/build")
async def build_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Build a project"""
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
                "status": ProjectStatus.BUILDING,
                "updated_at": datetime.utcnow()
            },
            "$push": {
                "build_logs": f"Build started at {datetime.utcnow().isoformat()}"
            }
        }
    )
    
    # Start build process in background
    background_tasks.add_task(
        project_service.build_project,
        project_id
    )
    
    return {"message": "Build started", "status": "building"}

@router.post("/{project_id}/deploy")
async def deploy_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Deploy a project"""
    db = await get_database()
    
    project = await db.projects.find_one({
        "_id": project_id,
        "user_id": str(current_user.id)
    })
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["status"] != ProjectStatus.DEPLOYED.value and len(project.get("files", [])) == 0:
        raise HTTPException(status_code=400, detail="Project must be built before deployment")
    
    # Start deployment process
    background_tasks.add_task(
        project_service.deploy_project,
        project_id
    )
    
    return {"message": "Deployment started"}

@router.get("/{project_id}/files")
async def get_project_files(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get project files"""
    db = await get_database()
    
    project = await db.projects.find_one({
        "_id": project_id,
        "user_id": str(current_user.id)
    })
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"files": project.get("files", [])}

@router.post("/{project_id}/files")
async def save_project_file(
    project_id: str,
    file_data: FileContent,
    current_user: User = Depends(get_current_user)
):
    """Save a file to project"""
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
    
    for i, existing_file in enumerate(files):
        if existing_file["path"] == file_data.path:
            files[i] = file_data.dict()
            file_exists = True
            break
    
    if not file_exists:
        files.append(file_data.dict())
    
    # Update project
    await db.projects.update_one(
        {"_id": project_id},
        {
            "$set": {
                "files": files,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "File saved successfully", "file": file_data.dict()}