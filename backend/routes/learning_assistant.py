from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from models.database import get_database
from routes.auth import get_current_user
from services.contextual_learning import ContextualLearningAssistant
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize learning assistant service
learning_assistant = ContextualLearningAssistant()

@router.post("/contextual-suggestions")
async def get_contextual_learning_suggestions(
    suggestion_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get contextual learning suggestions based on current work"""
    try:
        suggestions = await learning_assistant.get_contextual_suggestions(
            current_code=suggestion_request["current_code"],
            user_activity=suggestion_request["user_activity"],
            user_id=current_user["id"]
        )
        
        return {
            "suggestions": suggestions,
            "context": "work_based_learning"
        }
        
    except Exception as e:
        logger.error(f"Failed to get contextual suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get learning suggestions")

@router.post("/skill-assessment")
async def assess_user_skills(
    assessment_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Assess user's skill level in a technology"""
    try:
        assessment = await learning_assistant.get_skill_assessment(
            code_samples=assessment_request["code_samples"],
            user_id=current_user["id"],
            technology=assessment_request.get("technology", "javascript")
        )
        
        return {
            "assessment": assessment,
            "technology": assessment_request.get("technology", "javascript")
        }
        
    except Exception as e:
        logger.error(f"Failed to assess skills: {e}")
        raise HTTPException(status_code=500, detail="Failed to assess user skills")

@router.post("/learning-path")
async def generate_learning_path(
    path_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Generate personalized learning path"""
    try:
        learning_path = await learning_assistant.get_personalized_learning_path(
            user_id=current_user["id"],
            goals=path_request["goals"],
            current_skills=path_request["current_skills"],
            time_commitment=path_request.get("time_commitment", "moderate")
        )
        
        return {
            "learning_path": learning_path,
            "personalization": "high"
        }
        
    except Exception as e:
        logger.error(f"Failed to generate learning path: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate learning path")

@router.get("/tutorials")
async def get_interactive_tutorials(
    topic: str,
    skill_level: str = "beginner",
    preferred_style: str = "hands-on",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get interactive tutorials for specific topics"""
    try:
        tutorials = await learning_assistant.get_interactive_tutorials(
            topic=topic,
            skill_level=skill_level,
            preferred_style=preferred_style
        )
        
        return {
            "tutorials": tutorials,
            "topic": topic,
            "skill_level": skill_level
        }
        
    except Exception as e:
        logger.error(f"Failed to get tutorials: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interactive tutorials")

@router.post("/track-progress")
async def track_learning_progress(
    activity_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Track user's learning progress"""
    try:
        progress = await learning_assistant.track_learning_progress(
            user_id=current_user["id"],
            activity=activity_data
        )
        
        return {
            "progress": progress,
            "tracking": "enabled"
        }
        
    except Exception as e:
        logger.error(f"Failed to track progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to track learning progress")

@router.get("/challenges")
async def get_skill_challenges(
    technology: str,
    difficulty: str = "appropriate",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get coding challenges tailored to user's skill level"""
    try:
        challenges = await learning_assistant.get_skill_challenges(
            user_id=current_user["id"],
            technology=technology,
            difficulty=difficulty
        )
        
        return {
            "challenges": challenges,
            "technology": technology,
            "difficulty": difficulty
        }
        
    except Exception as e:
        logger.error(f"Failed to get challenges: {e}")
        raise HTTPException(status_code=500, detail="Failed to get skill challenges")

@router.post("/mentorship")
async def get_ai_mentorship(
    mentorship_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get AI mentorship suggestions for current work"""
    try:
        mentorship = await learning_assistant.get_mentorship_suggestions(
            user_id=current_user["id"],
            current_project=mentorship_request["current_project"]
        )
        
        return {
            "mentorship_advice": mentorship,
            "mentor_type": "ai_senior_developer"
        }
        
    except Exception as e:
        logger.error(f"Failed to get mentorship: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI mentorship")