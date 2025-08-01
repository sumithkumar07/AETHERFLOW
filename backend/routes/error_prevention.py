from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from models.database import get_database
from routes.auth import get_current_user
from services.smart_error_prevention import SmartErrorPrevention
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize error prevention service
error_prevention = SmartErrorPrevention()

@router.post("/analyze")
async def analyze_code_for_errors(
    analysis_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Analyze code for potential errors"""
    try:
        errors = await error_prevention.analyze_code_for_errors(
            code=analysis_request["code"],
            file_type=analysis_request.get("file_type", "javascript"),
            user_id=current_user["id"]
        )
        
        return {
            "errors": errors,
            "analysis_type": "comprehensive",
            "file_type": analysis_request.get("file_type", "javascript")
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze code: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze code for errors")

@router.post("/realtime-warnings")
async def get_real_time_warnings(
    warning_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get real-time warnings as user types"""
    try:
        warnings = await error_prevention.get_real_time_warnings(
            code_fragment=warning_request["code_fragment"],
            cursor_position=warning_request["cursor_position"],
            file_type=warning_request.get("file_type", "javascript"),
            user_id=current_user["id"]
        )
        
        return {
            "warnings": warnings,
            "context": {
                "cursor_position": warning_request["cursor_position"],
                "file_type": warning_request.get("file_type", "javascript")
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get warnings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get real-time warnings")

@router.post("/suggest-fixes")
async def suggest_error_fixes(
    fix_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Suggest fixes for detected errors"""
    try:
        fixes = await error_prevention.suggest_fixes(
            error_data=fix_request["error_data"],
            code_context=fix_request["code_context"],
            user_id=current_user["id"]
        )
        
        return {
            "fixes": fixes,
            "error_type": fix_request["error_data"].get("type", "unknown")
        }
        
    except Exception as e:
        logger.error(f"Failed to suggest fixes: {e}")
        raise HTTPException(status_code=500, detail="Failed to suggest fixes")

@router.post("/validate-dependencies")
async def validate_project_dependencies(
    validation_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Validate project dependencies"""
    try:
        validation = await error_prevention.validate_dependencies(
            dependencies=validation_request["dependencies"],
            project_type=validation_request.get("project_type", "javascript")
        )
        
        return {
            "validation": validation,
            "project_type": validation_request.get("project_type", "javascript"),
            "dependencies_count": len(validation_request["dependencies"])
        }
        
    except Exception as e:
        logger.error(f"Failed to validate dependencies: {e}")
        raise HTTPException(status_code=500, detail="Failed to validate dependencies")

@router.post("/record-error")
async def record_user_error(
    error_record: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Record user error for learning"""
    try:
        await error_prevention.record_user_error(
            user_id=current_user["id"],
            error_type=error_record["error_type"],
            error_pattern=error_record["error_pattern"]
        )
        
        return {
            "status": "success",
            "message": "Error pattern recorded for learning"
        }
        
    except Exception as e:
        logger.error(f"Failed to record error: {e}")
        raise HTTPException(status_code=500, detail="Failed to record error pattern")