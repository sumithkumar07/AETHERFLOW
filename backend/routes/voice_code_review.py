from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from models.database import get_database
from routes.auth import get_current_user
from services.voice_code_review import VoiceCodeReview
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize voice code review service
voice_code_review = VoiceCodeReview()

@router.post("/start-review")
async def start_voice_code_review(
    review_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Start a voice-guided code review session"""
    try:
        review_session = await voice_code_review.start_voice_review(
            code_content=review_request["code_content"],
            review_type=review_request.get("review_type", "general"),
            user_id=current_user["id"]
        )
        
        return {
            "review_session": review_session,
            "session_started": True
        }
        
    except Exception as e:
        logger.error(f"Failed to start voice review: {e}")
        raise HTTPException(status_code=500, detail="Failed to start voice code review")

@router.post("/voice-command")
async def process_voice_command(
    command_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Process voice commands during review session"""
    try:
        response = await voice_code_review.process_voice_command(
            session_id=command_request["session_id"],
            voice_command=command_request["voice_command"],
            user_id=current_user["id"]
        )
        
        return {
            "command_response": response,
            "session_id": command_request["session_id"]
        }
        
    except Exception as e:
        logger.error(f"Failed to process voice command: {e}")
        raise HTTPException(status_code=500, detail="Failed to process voice command")

@router.post("/voice-explanation")
async def get_voice_code_explanation(
    explanation_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get voice explanation of code snippet"""
    try:
        explanation = await voice_code_review.get_voice_explanation(
            code_snippet=explanation_request["code_snippet"],
            explanation_type=explanation_request.get("explanation_type", "walkthrough"),
            user_level=explanation_request.get("user_level", "intermediate")
        )
        
        return {
            "voice_explanation": explanation,
            "explanation_type": explanation_request.get("explanation_type", "walkthrough")
        }
        
    except Exception as e:
        logger.error(f"Failed to get voice explanation: {e}")
        raise HTTPException(status_code=500, detail="Failed to get voice explanation")

@router.post("/interactive-debugging")
async def start_interactive_debugging(
    debug_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Start interactive voice-guided debugging session"""
    try:
        debug_session = await voice_code_review.conduct_interactive_debugging(
            code_with_error=debug_request["code_with_error"],
            error_message=debug_request["error_message"],
            user_id=current_user["id"]
        )
        
        return {
            "debug_session": debug_session,
            "session_type": "interactive_debugging"
        }
        
    except Exception as e:
        logger.error(f"Failed to start debugging session: {e}")
        raise HTTPException(status_code=500, detail="Failed to start interactive debugging")

@router.post("/voice-summary")
async def generate_voice_code_summary(
    summary_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Generate voice summary of codebase or file"""
    try:
        summary = await voice_code_review.generate_voice_code_summary(
            codebase=summary_request["codebase"],
            summary_focus=summary_request.get("summary_focus", "overview")
        )
        
        return {
            "voice_summary": summary,
            "summary_focus": summary_request.get("summary_focus", "overview")
        }
        
    except Exception as e:
        logger.error(f"Failed to generate voice summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate voice summary")