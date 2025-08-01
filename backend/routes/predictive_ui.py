from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from models.database import get_database
from routes.auth import get_current_user
from services.predictive_ui import PredictiveUIService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize predictive UI service
predictive_ui = PredictiveUIService()

@router.post("/predict-actions")
async def predict_next_actions(
    prediction_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Predict user's next likely actions"""
    try:
        predictions = await predictive_ui.predict_next_actions(
            user_id=current_user["id"],
            current_context=prediction_request["current_context"],
            interaction_history=prediction_request["interaction_history"]
        )
        
        return {
            "predictions": predictions,
            "context": "behavioral_analysis"
        }
        
    except Exception as e:
        logger.error(f"Failed to predict actions: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict next actions")

@router.post("/adaptive-layout")
async def get_adaptive_layout(
    layout_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get adaptive UI layout based on user patterns"""
    try:
        layout = await predictive_ui.get_adaptive_layout(
            user_id=current_user["id"],
            device_info=layout_request["device_info"],
            usage_patterns=layout_request["usage_patterns"]
        )
        
        return {
            "layout": layout,
            "adaptation_type": "usage_based"
        }
        
    except Exception as e:
        logger.error(f"Failed to get adaptive layout: {e}")
        raise HTTPException(status_code=500, detail="Failed to get adaptive layout")

@router.post("/workflow-optimizations")
async def suggest_workflow_optimizations(
    optimization_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Suggest workflow optimizations"""
    try:
        optimizations = await predictive_ui.suggest_workflow_optimizations(
            user_id=current_user["id"],
            current_workflow=optimization_request["current_workflow"],
            performance_metrics=optimization_request["performance_metrics"]
        )
        
        return {
            "optimizations": optimizations,
            "analysis_type": "efficiency_focused"
        }
        
    except Exception as e:
        logger.error(f"Failed to suggest optimizations: {e}")
        raise HTTPException(status_code=500, detail="Failed to suggest workflow optimizations")

@router.post("/contextual-suggestions")
async def get_contextual_ui_suggestions(
    suggestion_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get contextual UI suggestions"""
    try:
        suggestions = await predictive_ui.get_contextual_suggestions(
            user_id=current_user["id"],
            current_state=suggestion_request["current_state"]
        )
        
        return {
            "suggestions": suggestions,
            "context": "state_based"
        }
        
    except Exception as e:
        logger.error(f"Failed to get suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get contextual suggestions")

@router.post("/predict-content")
async def predict_content_needs(
    content_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Predict content/files user will need next"""
    try:
        predictions = await predictive_ui.predict_content_needs(
            user_id=current_user["id"],
            project_context=content_request["project_context"],
            upcoming_tasks=content_request["upcoming_tasks"]
        )
        
        return {
            "content_predictions": predictions,
            "prediction_type": "task_based"
        }
        
    except Exception as e:
        logger.error(f"Failed to predict content: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict content needs")

@router.get("/efficiency-analysis")
async def analyze_user_efficiency(
    time_period: str = "7d",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Analyze user's efficiency patterns"""
    try:
        analysis = await predictive_ui.analyze_user_efficiency(
            user_id=current_user["id"],
            time_period=time_period
        )
        
        return {
            "efficiency_analysis": analysis,
            "time_period": time_period
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze efficiency: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze user efficiency")

@router.post("/record-interaction")
async def record_user_interaction(
    interaction_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Record user interaction for learning"""
    try:
        await predictive_ui.record_interaction(
            user_id=current_user["id"],
            interaction_data=interaction_data
        )
        
        return {
            "status": "success",
            "message": "Interaction recorded"
        }
        
    except Exception as e:
        logger.error(f"Failed to record interaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to record interaction")

@router.post("/validate-predictions")
async def validate_predictions(
    validation_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Validate previous predictions against actual actions"""
    try:
        validation = await predictive_ui.validate_predictions(
            user_id=current_user["id"],
            actual_action=validation_data["actual_action"]
        )
        
        return {
            "validation": validation,
            "learning": "enabled"
        }
        
    except Exception as e:
        logger.error(f"Failed to validate predictions: {e}")
        raise HTTPException(status_code=500, detail="Failed to validate predictions")

@router.post("/smart-defaults")
async def get_smart_defaults(
    defaults_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get smart default values based on user patterns"""
    try:
        defaults = await predictive_ui.get_smart_defaults(
            user_id=current_user["id"],
            context=defaults_request["context"]
        )
        
        return {
            "smart_defaults": defaults,
            "personalization": "high"
        }
        
    except Exception as e:
        logger.error(f"Failed to get smart defaults: {e}")
        raise HTTPException(status_code=500, detail="Failed to get smart defaults")