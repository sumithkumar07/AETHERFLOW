from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Service will be injected
workspace_intelligence = None

def set_workspace_intelligence(service):
    global workspace_intelligence
    workspace_intelligence = service

router = APIRouter()

class BehaviorAnalysisRequest(BaseModel):
    user_id: str
    workspace_activity: List[Dict[str, Any]]

class LayoutOptimizationRequest(BaseModel):
    user_id: str
    current_task: str
    screen_config: Dict[str, Any]

class LayoutAdjustmentRequest(BaseModel):
    user_id: str
    current_layout: Dict[str, Any]
    performance_metrics: Dict[str, Any]

class TaskLayoutRequest(BaseModel):
    user_id: str
    task_types: List[str]

class LearningRequest(BaseModel):
    user_id: str
    adjustment_data: Dict[str, Any]

class ScreenUsagePredictionRequest(BaseModel):
    user_id: str
    screen_config: Dict[str, Any]

@router.post("/analyze-behavior")
async def analyze_user_behavior(request: BehaviorAnalysisRequest):
    """Analyze user workspace behavior patterns"""
    try:
        if not workspace_intelligence:
            raise HTTPException(status_code=503, detail="Workspace Intelligence service not available")
        
        analysis = await workspace_intelligence.analyze_user_behavior(
            request.user_id,
            request.workspace_activity
        )
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize-layout")
async def optimize_workspace_layout(request: LayoutOptimizationRequest):
    """Optimize workspace layout for current task and screen configuration"""
    try:
        if not workspace_intelligence:
            raise HTTPException(status_code=503, detail="Workspace Intelligence service not available")
        
        optimization = await workspace_intelligence.optimize_workspace_layout(
            request.user_id,
            request.current_task,
            request.screen_config
        )
        
        return {
            "success": True,
            "data": optimization,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-adjustments")
async def suggest_layout_adjustments(request: LayoutAdjustmentRequest):
    """Suggest real-time layout adjustments based on performance"""
    try:
        if not workspace_intelligence:
            raise HTTPException(status_code=503, detail="Workspace Intelligence service not available")
        
        suggestions = await workspace_intelligence.suggest_layout_adjustments(
            request.user_id,
            request.current_layout,
            request.performance_metrics
        )
        
        return {
            "success": True,
            "data": suggestions,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-task-layouts")
async def create_task_specific_layouts(request: TaskLayoutRequest):
    """Create optimized layouts for different task types"""
    try:
        if not workspace_intelligence:
            raise HTTPException(status_code=503, detail="Workspace Intelligence service not available")
        
        layouts = await workspace_intelligence.create_task_specific_layouts(
            request.user_id,
            request.task_types
        )
        
        return {
            "success": True,
            "data": layouts,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/learn-adjustments")
async def learn_from_manual_adjustments(request: LearningRequest):
    """Learn from user's manual layout adjustments to improve recommendations"""
    try:
        if not workspace_intelligence:
            raise HTTPException(status_code=503, detail="Workspace Intelligence service not available")
        
        learning = await workspace_intelligence.learn_from_manual_adjustments(
            request.user_id,
            request.adjustment_data
        )
        
        return {
            "success": True,
            "data": learning,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-screen-usage")
async def predict_optimal_screen_usage(request: ScreenUsagePredictionRequest):
    """Predict optimal usage of available screen real estate"""
    try:
        if not workspace_intelligence:
            raise HTTPException(status_code=503, detail="Workspace Intelligence service not available")
        
        prediction = await workspace_intelligence.predict_optimal_screen_usage(
            request.user_id,
            request.screen_config
        )
        
        return {
            "success": True,
            "data": prediction,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/default-layouts")
async def get_default_layouts():
    """Get available default workspace layouts"""
    try:
        return {
            "success": True,
            "data": {
                "layouts": {
                    "coding": {
                        "description": "Optimized for software development",
                        "panels": ["code_editor", "file_explorer", "terminal", "output"],
                        "focus": "code_editor"
                    },
                    "debugging": {
                        "description": "Optimized for debugging sessions",
                        "panels": ["code_editor", "debug_console", "variables", "call_stack"],
                        "focus": "debug_console"
                    },
                    "design": {
                        "description": "Optimized for UI/UX design work",
                        "panels": ["design_canvas", "layers", "properties", "assets"],
                        "focus": "design_canvas"
                    },
                    "testing": {
                        "description": "Optimized for testing and QA",
                        "panels": ["test_explorer", "code_editor", "terminal", "test_output"],
                        "focus": "test_explorer"
                    }
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for workspace intelligence service"""
    return {
        "service": "Workspace Intelligence",
        "status": "healthy" if workspace_intelligence else "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }