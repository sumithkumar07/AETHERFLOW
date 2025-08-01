from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Service will be injected
theme_intelligence_service = None

def set_theme_intelligence_service(service):
    global theme_intelligence_service
    theme_intelligence_service = service

router = APIRouter()

class UserPatternAnalysisRequest(BaseModel):
    user_id: str
    activity_data: List[Dict[str, Any]]

class PersonalizedThemeRequest(BaseModel):
    user_id: str
    preferences: Dict[str, Any]

class ThemeAdjustmentRequest(BaseModel):
    user_id: str
    current_time: str  # ISO format
    environmental_factors: Dict[str, Any]

class ColorPaletteRequest(BaseModel):
    mood: str
    purpose: str

@router.post("/analyze-patterns")
async def analyze_user_patterns(request: UserPatternAnalysisRequest):
    """Analyze user's work patterns to suggest optimal themes"""
    try:
        if not theme_intelligence_service:
            raise HTTPException(status_code=503, detail="Theme Intelligence service not available")
        
        analysis = await theme_intelligence_service.analyze_user_patterns(
            request.user_id,
            request.activity_data
        )
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-theme")
async def generate_personalized_theme(request: PersonalizedThemeRequest):
    """Generate a personalized theme based on user patterns and preferences"""
    try:
        if not theme_intelligence_service:
            raise HTTPException(status_code=503, detail="Theme Intelligence service not available")
        
        theme = await theme_intelligence_service.generate_personalized_theme(
            request.user_id,
            request.preferences
        )
        
        return {
            "success": True,
            "data": theme,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-adjustments")
async def suggest_theme_adjustments(request: ThemeAdjustmentRequest):
    """Suggest real-time theme adjustments based on time and environment"""
    try:
        if not theme_intelligence_service:
            raise HTTPException(status_code=503, detail="Theme Intelligence service not available")
        
        current_time = datetime.fromisoformat(request.current_time.replace('Z', '+00:00'))
        
        suggestions = await theme_intelligence_service.suggest_theme_adjustments(
            request.user_id,
            current_time,
            request.environmental_factors
        )
        
        return {
            "success": True,
            "data": suggestions,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/adaptive-schedule/{user_id}")
async def create_adaptive_theme_schedule(user_id: str):
    """Create a schedule that automatically adjusts theme throughout the day"""
    try:
        if not theme_intelligence_service:
            raise HTTPException(status_code=503, detail="Theme Intelligence service not available")
        
        schedule = await theme_intelligence_service.create_adaptive_theme_schedule(user_id)
        
        return {
            "success": True,
            "data": schedule,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/color-palettes")
async def generate_color_palette_suggestions(request: ColorPaletteRequest):
    """Generate color palette suggestions based on mood and purpose"""
    try:
        if not theme_intelligence_service:
            raise HTTPException(status_code=503, detail="Theme Intelligence service not available")
        
        palettes = await theme_intelligence_service.generate_color_palette_suggestions(
            request.mood,
            request.purpose
        )
        
        return {
            "success": True,
            "data": {"palettes": palettes},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for theme intelligence service"""
    return {
        "service": "Theme Intelligence",
        "status": "healthy" if theme_intelligence_service else "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }