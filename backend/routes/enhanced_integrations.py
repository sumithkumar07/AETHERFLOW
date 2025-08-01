from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from models.database import get_database
from routes.auth import get_current_user
from services.enhanced_integrations import EnhancedIntegrationsService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize enhanced integrations service
enhanced_integrations = EnhancedIntegrationsService()

@router.post("/smart-recommendations")
async def get_smart_integration_recommendations(
    recommendation_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get AI-powered integration recommendations"""
    try:
        recommendations = await enhanced_integrations.get_smart_recommendations(
            project_context=recommendation_request["project_context"],
            user_id=current_user["id"],
            project_stage=recommendation_request.get("project_stage", "development")
        )
        
        return {
            "recommendations": recommendations,
            "recommendation_type": "ai_powered",
            "personalized": True
        }
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get integration recommendations")

@router.post("/compatibility-analysis")
async def analyze_integration_compatibility(
    compatibility_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Analyze compatibility between integration and project stack"""
    try:
        analysis = await enhanced_integrations.analyze_integration_compatibility(
            integration_name=compatibility_request["integration_name"],
            project_stack=compatibility_request["project_stack"]
        )
        
        return {
            "compatibility_analysis": analysis,
            "integration_name": compatibility_request["integration_name"]
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze compatibility: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze integration compatibility")

@router.post("/alternatives")
async def get_integration_alternatives(
    alternatives_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get alternative integrations based on requirements"""
    try:
        alternatives = await enhanced_integrations.get_integration_alternatives(
            current_integration=alternatives_request["current_integration"],
            requirements=alternatives_request["requirements"]
        )
        
        return {
            "alternatives": alternatives,
            "current_integration": alternatives_request["current_integration"]
        }
        
    except Exception as e:
        logger.error(f"Failed to get alternatives: {e}")
        raise HTTPException(status_code=500, detail="Failed to get integration alternatives")

@router.post("/integration-guide")
async def generate_integration_guide(
    guide_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Generate step-by-step integration guide"""
    try:
        guide = await enhanced_integrations.generate_integration_guide(
            integration_name=guide_request["integration_name"],
            project_context=guide_request["project_context"],
            user_level=guide_request.get("user_level", "intermediate")
        )
        
        return {
            "integration_guide": guide,
            "personalized": True
        }
        
    except Exception as e:
        logger.error(f"Failed to generate guide: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate integration guide")

@router.post("/success-prediction")
async def predict_integration_success(
    prediction_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Predict likelihood of successful integration"""
    try:
        prediction = await enhanced_integrations.predict_integration_success(
            integration_name=prediction_request["integration_name"],
            project_data=prediction_request["project_data"],
            team_data=prediction_request["team_data"]
        )
        
        return {
            "success_prediction": prediction,
            "integration_name": prediction_request["integration_name"]
        }
        
    except Exception as e:
        logger.error(f"Failed to predict success: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict integration success")

@router.get("/trends")
async def get_integration_trends(
    category: str = "all",
    time_period: str = "6m",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get trending integrations and market insights"""
    try:
        trends = await enhanced_integrations.get_integration_trends(
            category=category,
            time_period=time_period
        )
        
        return {
            "trends": trends,
            "category": category,
            "time_period": time_period
        }
        
    except Exception as e:
        logger.error(f"Failed to get trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to get integration trends")