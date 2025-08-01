from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from models.database import get_database
from models.user import get_current_user
from services.gamification_service import GamificationService, Achievement, UserStats, StreakInfo
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize gamification service
gamification = GamificationService()

@router.get("/stats")
async def get_user_stats(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get comprehensive user statistics and progress
    """
    try:
        stats = await gamification.get_user_stats(
            user_id=current_user["id"],
            db=db
        )
        
        return stats.dict()
        
    except Exception as e:
        logger.error(f"Failed to get user stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user statistics")

@router.get("/achievements")
async def get_achievements(
    category: Optional[str] = None,
    unlocked_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get user's achievements with optional filtering
    """
    try:
        achievements = await gamification.get_user_achievements(
            user_id=current_user["id"],
            category=category,
            unlocked_only=unlocked_only,
            db=db
        )
        
        return {
            "achievements": [achievement.dict() for achievement in achievements],
            "total_unlocked": len([a for a in achievements if a.unlocked]),
            "total_available": len(achievements)
        }
        
    except Exception as e:
        logger.error(f"Failed to get achievements: {e}")
        raise HTTPException(status_code=500, detail="Failed to get achievements")

@router.post("/achievements/check")
async def check_achievements(
    action_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Check and unlock achievements based on user actions
    """
    try:
        new_achievements = await gamification.check_and_unlock_achievements(
            user_id=current_user["id"],
            action_type=action_data["action_type"],
            action_data=action_data,
            db=db
        )
        
        return {
            "new_achievements": [achievement.dict() for achievement in new_achievements],
            "xp_gained": sum(a.xp for a in new_achievements),
            "message": f"Unlocked {len(new_achievements)} new achievements!" if new_achievements else "No new achievements"
        }
        
    except Exception as e:
        logger.error(f"Failed to check achievements: {e}")
        raise HTTPException(status_code=500, detail="Failed to check achievements")

@router.get("/streak")
async def get_streak_info(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get user's current streak information
    """
    try:
        streak_info = await gamification.get_streak_info(
            user_id=current_user["id"],
            db=db
        )
        
        return streak_info.dict()
        
    except Exception as e:
        logger.error(f"Failed to get streak info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get streak information")

@router.post("/streak/update")
async def update_streak(
    activity_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update user streak based on activity
    """
    try:
        streak_info = await gamification.update_streak(
            user_id=current_user["id"],
            activity_type=activity_data.get("activity_type", "coding"),
            db=db
        )
        
        return {
            "streak_info": streak_info.dict(),
            "message": f"Streak updated! Current: {streak_info.current} days"
        }
        
    except Exception as e:
        logger.error(f"Failed to update streak: {e}")
        raise HTTPException(status_code=500, detail="Failed to update streak")

@router.post("/xp/award")
async def award_xp(
    xp_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Award XP to user for specific actions
    """
    try:
        result = await gamification.award_xp(
            user_id=current_user["id"],
            xp_amount=xp_data["amount"],
            reason=xp_data.get("reason", "Action completed"),
            category=xp_data.get("category", "general"),
            db=db
        )
        
        return {
            "xp_awarded": result["xp_awarded"],
            "total_xp": result["total_xp"],
            "level_up": result.get("level_up", False),
            "new_level": result.get("new_level"),
            "message": result.get("message", "XP awarded!")
        }
        
    except Exception as e:
        logger.error(f"Failed to award XP: {e}")
        raise HTTPException(status_code=500, detail="Failed to award XP")

@router.get("/leaderboard")
async def get_leaderboard(
    timeframe: str = "all_time",  # all_time, monthly, weekly
    category: str = "xp",  # xp, projects, streak
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get leaderboard rankings
    """
    try:
        leaderboard = await gamification.get_leaderboard(
            timeframe=timeframe,
            category=category,
            limit=limit,
            current_user_id=current_user["id"],
            db=db
        )
        
        return {
            "leaderboard": leaderboard,
            "user_rank": next((i + 1 for i, entry in enumerate(leaderboard) if entry["user_id"] == current_user["id"]), None),
            "timeframe": timeframe,
            "category": category
        }
        
    except Exception as e:
        logger.error(f"Failed to get leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard")

@router.get("/progress")
async def get_progress_tracking(
    timeframe: str = "30d",  # 7d, 30d, 90d, all
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get detailed progress tracking and analytics
    """
    try:
        progress = await gamification.get_progress_tracking(
            user_id=current_user["id"],
            timeframe=timeframe,
            db=db
        )
        
        return progress
        
    except Exception as e:
        logger.error(f"Failed to get progress tracking: {e}")
        raise HTTPException(status_code=500, detail="Failed to get progress tracking")

@router.post("/badges/custom")
async def create_custom_badge(
    badge_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Create custom badge for specific achievements
    """
    try:
        badge = await gamification.create_custom_badge(
            user_id=current_user["id"],
            badge_name=badge_data["name"],
            badge_description=badge_data["description"],
            badge_criteria=badge_data["criteria"],
            badge_icon=badge_data.get("icon"),
            db=db
        )
        
        return {
            "badge": badge,
            "message": "Custom badge created successfully!"
        }
        
    except Exception as e:
        logger.error(f"Failed to create custom badge: {e}")
        raise HTTPException(status_code=500, detail="Failed to create custom badge")

@router.get("/challenges")
async def get_active_challenges(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get active challenges and competitions
    """
    try:
        challenges = await gamification.get_active_challenges(
            user_id=current_user["id"],
            db=db
        )
        
        return {
            "challenges": challenges,
            "total_active": len(challenges)
        }
        
    except Exception as e:
        logger.error(f"Failed to get challenges: {e}")
        raise HTTPException(status_code=500, detail="Failed to get active challenges")

@router.post("/challenges/join")
async def join_challenge(
    challenge_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Join a gamification challenge
    """
    try:
        result = await gamification.join_challenge(
            user_id=current_user["id"],
            challenge_id=challenge_data["challenge_id"],
            db=db
        )
        
        return {
            "status": "joined" if result else "already_joined",
            "message": "Successfully joined challenge!" if result else "Already participating in this challenge"
        }
        
    except Exception as e:
        logger.error(f"Failed to join challenge: {e}")
        raise HTTPException(status_code=500, detail="Failed to join challenge")

@router.get("/settings")
async def get_gamification_settings(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get user's gamification preferences and settings
    """
    try:
        settings = await gamification.get_user_settings(
            user_id=current_user["id"],
            db=db
        )
        
        return settings
        
    except Exception as e:
        logger.error(f"Failed to get gamification settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get gamification settings")

@router.post("/settings")
async def update_gamification_settings(
    settings: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update user's gamification preferences
    """
    try:
        updated_settings = await gamification.update_user_settings(
            user_id=current_user["id"],
            settings=settings,
            db=db
        )
        
        return {
            "settings": updated_settings,
            "message": "Gamification settings updated successfully!"
        }
        
    except Exception as e:
        logger.error(f"Failed to update gamification settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update gamification settings")