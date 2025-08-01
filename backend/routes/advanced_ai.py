from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from models.user import get_current_user
from services.intelligent_ai_router import IntelligentAIRouter, TaskType, TaskComplexity

router = APIRouter()
logger = logging.getLogger(__name__)

# Global router instance (will be initialized in main.py)
intelligent_ai_router: Optional[IntelligentAIRouter] = None

def set_ai_router(router_instance: IntelligentAIRouter):
    global intelligent_ai_router
    intelligent_ai_router = router_instance

@router.post("/smart-chat")
async def smart_chat(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Smart AI chat with intelligent model routing"""
    try:
        if not intelligent_ai_router:
            raise HTTPException(status_code=500, detail="AI router not initialized")
        
        message = request.get("message", "")
        context = request.get("context", {})
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Add user context
        context["user_id"] = current_user["user_id"]
        
        # Process with intelligent routing
        result = await intelligent_ai_router.process_with_fallback(message, context)
        
        return {
            "success": True,
            "response": result["response"],
            "model_used": result["model_used"],
            "processing_time": result["processing_time"],
            "cached": result.get("cached", False),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in smart chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/select-optimal-model")
async def select_optimal_model(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Select optimal AI model for a specific task"""
    try:
        if not intelligent_ai_router:
            raise HTTPException(status_code=500, detail="AI router not initialized")
        
        task = request.get("task", "")
        context = request.get("context", {})
        
        if not task:
            raise HTTPException(status_code=400, detail="Task is required")
        
        # Add user context
        context["user_id"] = current_user["user_id"]
        
        # Select optimal model
        selected_model = await intelligent_ai_router.select_optimal_model(task, context)
        
        return {
            "success": True,
            "selected_model": selected_model,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error selecting optimal model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-performance")
async def get_model_performance(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get AI model performance statistics"""
    try:
        if not intelligent_ai_router:
            raise HTTPException(status_code=500, detail="AI router not initialized")
        
        # Get performance history
        performance_data = {
            "performance_history": intelligent_ai_router.performance_history,
            "models_available": list(intelligent_ai_router.models.keys()),
            "current_load": intelligent_ai_router.load_balancer.model_loads,
            "cache_stats": {
                "cache_size": len(intelligent_ai_router.response_cache.cache),
                "cache_hit_rate": 0.85  # Mock data
            }
        }
        
        return {
            "success": True,
            "data": performance_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting model performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-process")
async def batch_process_requests(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Process multiple AI requests in batch for efficiency"""
    try:
        if not intelligent_ai_router:
            raise HTTPException(status_code=500, detail="AI router not initialized")
        
        requests = request.get("requests", [])
        if not requests:
            raise HTTPException(status_code=400, detail="Requests array is required")
        
        results = []
        for req in requests:
            message = req.get("message", "")
            context = req.get("context", {})
            context["user_id"] = current_user["user_id"]
            
            try:
                result = await intelligent_ai_router.process_with_fallback(message, context)
                results.append({
                    "success": True,
                    "response": result["response"],
                    "model_used": result["model_used"],
                    "processing_time": result["processing_time"]
                })
            except Exception as req_error:
                results.append({
                    "success": False,
                    "error": str(req_error)
                })
        
        return {
            "success": True,
            "results": results,
            "total_processed": len(results),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in batch processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available-models")
async def get_available_models(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get list of available AI models with their capabilities"""
    try:
        if not intelligent_ai_router:
            raise HTTPException(status_code=500, detail="AI router not initialized")
        
        models_info = []
        for model_name, capabilities in intelligent_ai_router.models.items():
            models_info.append({
                "name": capabilities.name,
                "cost_per_token": capabilities.cost_per_token,
                "max_tokens": capabilities.max_tokens,
                "strengths": capabilities.strengths,
                "speed_score": capabilities.speed_score,
                "quality_score": capabilities.quality_score,
                "specialized_for": [task_type.value for task_type in capabilities.specialized_for]
            })
        
        return {
            "success": True,
            "models": models_info,
            "total_models": len(models_info),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting available models: {e}")
        raise HTTPException(status_code=500, detail=str(e))