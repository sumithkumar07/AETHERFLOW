from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from models.database import get_database
from routes.auth import get_current_user
from services.ai_code_completion import AICodeCompletion
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize AI code completion service
ai_completion = AICodeCompletion()

@router.post("/completions")
async def get_code_completions(
    completion_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get AI-powered code completions"""
    try:
        completions = await ai_completion.get_code_completions(
            code_context=completion_request["code_context"],
            cursor_position=completion_request["cursor_position"],
            file_type=completion_request.get("file_type", "javascript"),
            user_id=current_user["id"]
        )
        
        return {
            "completions": completions,
            "context": {
                "file_type": completion_request.get("file_type", "javascript"),
                "cursor_position": completion_request["cursor_position"]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get completions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get code completions")

@router.post("/suggestions")
async def get_smart_suggestions(
    suggestion_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get smart code improvement suggestions"""
    try:
        suggestions = await ai_completion.get_smart_suggestions(
            code_context=suggestion_request["code_context"],
            issue_type=suggestion_request.get("issue_type", "optimization"),
            user_id=current_user["id"]
        )
        
        return {
            "suggestions": suggestions,
            "issue_type": suggestion_request.get("issue_type", "optimization")
        }
        
    except Exception as e:
        logger.error(f"Failed to get suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get smart suggestions")

@router.post("/documentation")
async def generate_documentation(
    doc_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Generate contextual documentation for code"""
    try:
        documentation = await ai_completion.get_contextual_documentation(
            code_snippet=doc_request["code_snippet"],
            language=doc_request.get("language", "javascript")
        )
        
        return {
            "documentation": documentation,
            "language": doc_request.get("language", "javascript")
        }
        
    except Exception as e:
        logger.error(f"Failed to generate documentation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate documentation")

@router.post("/patterns")
async def detect_code_patterns(
    pattern_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Detect reusable patterns in codebase"""
    try:
        patterns = await ai_completion.detect_code_patterns(
            codebase=pattern_request["codebase"],
            user_id=current_user["id"]
        )
        
        return {
            "patterns": patterns,
            "analysis_scope": "codebase"
        }
        
    except Exception as e:
        logger.error(f"Failed to detect patterns: {e}")
        raise HTTPException(status_code=500, detail="Failed to detect code patterns")

@router.post("/preferences")
async def update_completion_preferences(
    preferences: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update user's code completion preferences"""
    try:
        await ai_completion.update_user_preferences(
            user_id=current_user["id"],
            preferences=preferences
        )
        
        return {
            "status": "success",
            "message": "Completion preferences updated"
        }
        
    except Exception as e:
        logger.error(f"Failed to update preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")

@router.post("/learn")
async def learn_from_selection(
    learning_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Learn from user's completion selections"""
    try:
        await ai_completion.learn_from_selection(
            user_id=current_user["id"],
            context=learning_data["context"],
            selected_completion=learning_data["selected_completion"]
        )
        
        return {
            "status": "success",
            "message": "Learning data recorded"
        }
        
    except Exception as e:
        logger.error(f"Failed to record learning data: {e}")
        raise HTTPException(status_code=500, detail="Failed to record learning data")