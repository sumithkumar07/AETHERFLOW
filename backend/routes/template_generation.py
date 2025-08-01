from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from models.database import get_database
from routes.auth import get_current_user
from services.smart_template_generation import SmartTemplateGeneration
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize template generation service
template_generator = SmartTemplateGeneration()

@router.post("/generate-from-project")
async def generate_template_from_project(
    generation_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Generate a reusable template from existing project"""
    try:
        template = await template_generator.generate_template_from_project(
            project_data=generation_request["project_data"],
            user_id=current_user["id"]
        )
        
        return {
            "template": template,
            "generation_type": "project_based"
        }
        
    except Exception as e:
        logger.error(f"Failed to generate template: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate template from project")

@router.post("/suggest-improvements")
async def suggest_template_improvements(
    improvement_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Suggest improvements for existing templates"""
    try:
        improvements = await template_generator.suggest_template_improvements(
            template_id=improvement_request["template_id"],
            usage_analytics=improvement_request["usage_analytics"]
        )
        
        return {
            "improvements": improvements,
            "template_id": improvement_request["template_id"]
        }
        
    except Exception as e:
        logger.error(f"Failed to suggest improvements: {e}")
        raise HTTPException(status_code=500, detail="Failed to suggest template improvements")

@router.post("/create-custom")
async def create_custom_template(
    custom_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create custom template based on requirements"""
    try:
        template = await template_generator.create_custom_template(
            requirements=custom_request["requirements"],
            user_id=current_user["id"]
        )
        
        return {
            "template": template,
            "creation_type": "custom_requirements"
        }
        
    except Exception as e:
        logger.error(f"Failed to create custom template: {e}")
        raise HTTPException(status_code=500, detail="Failed to create custom template")

@router.post("/recommendations")
async def get_template_recommendations(
    recommendation_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get personalized template recommendations"""
    try:
        recommendations = await template_generator.get_template_recommendations(
            project_context=recommendation_request["project_context"],
            user_history=recommendation_request["user_history"],
            user_id=current_user["id"]
        )
        
        return {
            "recommendations": recommendations,
            "personalization": "high"
        }
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get template recommendations")

@router.get("/usage-analysis/{template_id}")
async def analyze_template_usage(
    template_id: str,
    time_period: str = "30d",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Analyze template usage patterns"""
    try:
        analysis = await template_generator.analyze_template_usage(
            template_id=template_id,
            time_period=time_period
        )
        
        return {
            "analysis": analysis,
            "template_id": template_id,
            "time_period": time_period
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze usage: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze template usage")

@router.post("/generate-variations")
async def generate_template_variations(
    variation_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Generate variations of existing templates"""
    try:
        variations = await template_generator.generate_template_variations(
            base_template_id=variation_request["base_template_id"],
            variation_types=variation_request["variation_types"]
        )
        
        return {
            "variations": variations,
            "base_template_id": variation_request["base_template_id"]
        }
        
    except Exception as e:
        logger.error(f"Failed to generate variations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate template variations")

@router.post("/analytics/update")
async def update_template_analytics(
    analytics_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update template usage analytics"""
    try:
        await template_generator.update_template_analytics(
            template_id=analytics_data["template_id"],
            event_type=analytics_data["event_type"],
            event_data=analytics_data["event_data"]
        )
        
        return {
            "status": "success",
            "message": "Analytics updated"
        }
        
    except Exception as e:
        logger.error(f"Failed to update analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to update template analytics")