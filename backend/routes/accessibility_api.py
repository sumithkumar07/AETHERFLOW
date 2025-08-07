"""
Accessibility API Routes
Provides accessibility enhancements without changing UI
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

from services.advanced_accessibility_engine import accessibility_engine

logger = logging.getLogger(__name__)

router = APIRouter()

class AccessibilityProfileRequest(BaseModel):
    user_id: str
    preferences: Dict[str, Any]

class ContentEnhancementRequest(BaseModel):
    content: Dict[str, Any]
    user_id: Optional[str] = None
    enhancement_level: str = "aa"  # basic, aa, aaa

class AccessibilityValidationRequest(BaseModel):
    content: Dict[str, Any]

@router.post("/profile")
async def create_accessibility_profile(request: AccessibilityProfileRequest):
    """
    Create or update user accessibility profile
    Stores user preferences for consistent experience
    """
    try:
        profile = await accessibility_engine.create_user_profile(
            user_id=request.user_id,
            preferences=request.preferences
        )
        
        return {
            "message": "Accessibility profile created successfully",
            "user_id": request.user_id,
            "profile": {
                "screen_reader": profile.screen_reader,
                "high_contrast": profile.high_contrast,
                "large_text": profile.large_text,
                "reduced_motion": profile.reduced_motion,
                "keyboard_only": profile.keyboard_only,
                "voice_control": profile.voice_control,
                "color_blind_type": profile.color_blind_type
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Create accessibility profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{user_id}")
async def get_accessibility_profile(user_id: str):
    """Get user accessibility profile"""
    try:
        if user_id in accessibility_engine.user_profiles:
            profile = accessibility_engine.user_profiles[user_id]
            
            return {
                "user_id": user_id,
                "profile": {
                    "screen_reader": profile.screen_reader,
                    "high_contrast": profile.high_contrast,
                    "large_text": profile.large_text,
                    "reduced_motion": profile.reduced_motion,
                    "keyboard_only": profile.keyboard_only,
                    "voice_control": profile.voice_control,
                    "color_blind_type": profile.color_blind_type,
                    "custom_settings": profile.custom_settings
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "message": "No accessibility profile found",
                "user_id": user_id,
                "profile": None
            }
            
    except Exception as e:
        logger.error(f"Get accessibility profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhance")
async def enhance_content_accessibility(request: ContentEnhancementRequest):
    """
    Enhance content for accessibility compliance
    Returns content with accessibility enhancements applied
    """
    try:
        enhanced_content = await accessibility_engine.enhance_content_accessibility(
            content=request.content,
            user_id=request.user_id
        )
        
        return {
            "enhanced_content": enhanced_content,
            "accessibility_applied": True,
            "enhancement_level": request.enhancement_level,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Content accessibility enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate")
async def validate_accessibility_compliance(request: AccessibilityValidationRequest):
    """
    Validate content for WCAG compliance
    Returns compliance score and recommendations
    """
    try:
        validation_result = await accessibility_engine.validate_accessibility_compliance(
            content=request.content
        )
        
        return {
            "validation": validation_result,
            "content_analyzed": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Accessibility validation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/report")
async def get_accessibility_report():
    """
    Get comprehensive accessibility system report
    Shows current accessibility features and usage
    """
    try:
        report = await accessibility_engine.get_accessibility_report()
        
        return {
            "accessibility_report": report,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Accessibility report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/guidelines")
async def get_wcag_guidelines():
    """
    Get WCAG guidelines supported by the system
    Educational endpoint for developers
    """
    try:
        return {
            "wcag_version": "2.1",
            "supported_levels": ["A", "AA", "AAA"],
            "guidelines": accessibility_engine.wcag_guidelines,
            "total_guidelines": len(accessibility_engine.wcag_guidelines),
            "enhancement_rules": accessibility_engine.enhancement_rules,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"WCAG guidelines error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/color-palettes")
async def get_accessible_color_palettes():
    """
    Get accessible color palettes for different accessibility needs
    """
    try:
        return {
            "color_palettes": accessibility_engine.color_palettes,
            "supported_types": [
                "high_contrast",
                "protanopia",
                "deuteranopia", 
                "tritanopia"
            ],
            "usage": "Apply based on user accessibility profile",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Color palettes error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def accessibility_health_check():
    """Health check for accessibility system"""
    try:
        total_profiles = len(accessibility_engine.user_profiles)
        
        return {
            "accessibility_engine": "operational",
            "user_profiles": total_profiles,
            "wcag_compliance": "2.1 AA/AAA",
            "features": {
                "aria_enhancements": accessibility_engine.aria_enhancements,
                "semantic_structure": accessibility_engine.semantic_structure,
                "keyboard_navigation": accessibility_engine.keyboard_navigation,
                "focus_management": accessibility_engine.focus_management
            },
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Accessibility health check error: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.delete("/profile/{user_id}")
async def delete_accessibility_profile(user_id: str):
    """Delete user accessibility profile"""
    try:
        if user_id in accessibility_engine.user_profiles:
            del accessibility_engine.user_profiles[user_id]
            return {
                "message": f"Accessibility profile deleted for user {user_id}",
                "status": "success"
            }
        else:
            return {
                "message": f"No accessibility profile found for user {user_id}",
                "status": "not_found"
            }
            
    except Exception as e:
        logger.error(f"Delete accessibility profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))