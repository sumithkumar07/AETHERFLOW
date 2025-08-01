from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime
from models.database import get_database
from models.user import get_current_user
from services.version_control_service import VersionControlService, BackupVersion, AutoCommit
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize version control service
version_control = VersionControlService()

@router.post("/backup/create")
async def create_backup(
    backup_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Create an intelligent backup of project state
    """
    try:
        backup = await version_control.create_backup(
            project_id=backup_data["project_id"],
            user_id=current_user["id"],
            backup_type=backup_data.get("type", "manual"),
            message=backup_data.get("message", "Manual backup"),
            files=backup_data.get("files", []),
            db=db
        )
        
        return {
            "status": "success",
            "backup_id": backup.id,
            "message": "Backup created successfully"
        }
        
    except Exception as e:
        logger.error(f"Backup creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create backup")

@router.get("/backup/list/{project_id}")
async def list_backups(
    project_id: str,
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    List all backups for a project
    """
    try:
        backups = await version_control.list_backups(
            project_id=project_id,
            user_id=current_user["id"],
            limit=limit,
            offset=offset,
            db=db
        )
        
        return {
            "backups": [backup.dict() for backup in backups],
            "total": len(backups)
        }
        
    except Exception as e:
        logger.error(f"Failed to list backups: {e}")
        raise HTTPException(status_code=500, detail="Failed to list backups")

@router.get("/backup/{backup_id}")
async def get_backup_details(
    backup_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get detailed information about a specific backup
    """
    try:
        backup = await version_control.get_backup(
            backup_id=backup_id,
            user_id=current_user["id"],
            db=db
        )
        
        if not backup:
            raise HTTPException(status_code=404, detail="Backup not found")
        
        return backup.dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get backup details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get backup details")

@router.post("/backup/restore/{backup_id}")
async def restore_backup(
    backup_id: str,
    restore_options: Dict[str, Any] = {},
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Restore project from a backup
    """
    try:
        result = await version_control.restore_backup(
            backup_id=backup_id,
            user_id=current_user["id"],
            restore_files=restore_options.get("files", []),
            create_backup_before=restore_options.get("create_backup", True),
            db=db
        )
        
        return {
            "status": "success",
            "restored_files": result["restored_files"],
            "backup_created": result.get("backup_created"),
            "message": "Project restored successfully"
        }
        
    except Exception as e:
        logger.error(f"Backup restoration failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to restore backup")

@router.delete("/backup/{backup_id}")
async def delete_backup(
    backup_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Delete a backup
    """
    try:
        success = await version_control.delete_backup(
            backup_id=backup_id,
            user_id=current_user["id"],
            db=db
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Backup not found")
        
        return {"status": "success", "message": "Backup deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete backup: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete backup")

@router.post("/auto-commit/enable")
async def enable_auto_commit(
    project_id: str,
    settings: Dict[str, Any] = {},
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Enable intelligent auto-commit for a project
    """
    try:
        config = await version_control.enable_auto_commit(
            project_id=project_id,
            user_id=current_user["id"],
            interval_minutes=settings.get("interval", 30),
            min_changes=settings.get("min_changes", 5),
            smart_commit_messages=settings.get("smart_messages", True),
            db=db
        )
        
        return {
            "status": "success",
            "message": "Auto-commit enabled",
            "config": config
        }
        
    except Exception as e:
        logger.error(f"Failed to enable auto-commit: {e}")
        raise HTTPException(status_code=500, detail="Failed to enable auto-commit")

@router.post("/auto-commit/disable")
async def disable_auto_commit(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Disable auto-commit for a project
    """
    try:
        await version_control.disable_auto_commit(
            project_id=project_id,
            user_id=current_user["id"],
            db=db
        )
        
        return {"status": "success", "message": "Auto-commit disabled"}
        
    except Exception as e:
        logger.error(f"Failed to disable auto-commit: {e}")
        raise HTTPException(status_code=500, detail="Failed to disable auto-commit")

@router.get("/auto-commit/history/{project_id}")
async def get_auto_commit_history(
    project_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get auto-commit history for a project
    """
    try:
        commits = await version_control.get_auto_commit_history(
            project_id=project_id,
            user_id=current_user["id"],
            limit=limit,
            db=db
        )
        
        return {
            "commits": [commit.dict() for commit in commits],
            "total": len(commits)
        }
        
    except Exception as e:
        logger.error(f"Failed to get auto-commit history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get auto-commit history")

@router.post("/diff/generate")
async def generate_diff(
    diff_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Generate intelligent diff between two versions
    """
    try:
        diff = await version_control.generate_smart_diff(
            project_id=diff_request["project_id"],
            version_a=diff_request["version_a"],
            version_b=diff_request["version_b"],
            user_id=current_user["id"],
            db=db
        )
        
        return {
            "diff": diff,
            "summary": diff.get("summary", {}),
            "changes": diff.get("changes", [])
        }
        
    except Exception as e:
        logger.error(f"Failed to generate diff: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate diff")

@router.get("/settings/{project_id}")
async def get_version_control_settings(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get version control settings for a project
    """
    try:
        settings = await version_control.get_settings(
            project_id=project_id,
            user_id=current_user["id"],
            db=db
        )
        
        return settings
        
    except Exception as e:
        logger.error(f"Failed to get settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get version control settings")

@router.post("/settings/{project_id}")
async def update_version_control_settings(
    project_id: str,
    settings: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update version control settings for a project
    """
    try:
        updated_settings = await version_control.update_settings(
            project_id=project_id,
            user_id=current_user["id"],
            settings=settings,
            db=db
        )
        
        return {
            "status": "success",
            "settings": updated_settings,
            "message": "Settings updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to update settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update version control settings")