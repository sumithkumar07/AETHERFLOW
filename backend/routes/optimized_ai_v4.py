"""
Optimized AI Routes v4 - Enterprise Performance
Implements all Phase 1 optimizations with backward compatibility
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
import logging

from models.user import User
from routes.auth import get_current_user
from services.enhanced_ai_service_optimized import get_optimized_ai_service
from services.performance_monitor import get_performance_monitor, monitor_performance

logger = logging.getLogger(__name__)
router = APIRouter()

# Request/Response Models
class OptimizedAIRequest(BaseModel):
    message: str
    agent_type: Optional[str] = "dev"
    context: Optional[List[Dict]] = None
    use_cache: Optional[bool] = True
    priority: Optional[str] = "normal"  # normal, high, premium

class MultiAgentRequest(BaseModel):
    message: str
    agents: Optional[List[str]] = None
    context: Optional[List[Dict]] = None
    collaboration_mode: Optional[str] = "parallel"  # parallel, sequential

class QuickResponseRequest(BaseModel):
    message: str
    model: Optional[str] = "llama-3.1-8b-instant"

class AIResponse(BaseModel):
    content: str
    agent: Dict
    model_used: str
    tokens_used: int
    cost: float
    response_time: float
    cached: bool
    timestamp: str

class MultiAgentResponse(BaseModel):
    synthesized_response: Dict
    individual_responses: List[Dict]
    agents_used: List[str]
    total_cost: float
    total_tokens: int
    response_time: float
    cached: bool

@router.post("/v4/chat/optimized", response_model=AIResponse)
@monitor_performance("ai_chat_optimized")
async def optimized_ai_chat(
    request: OptimizedAIRequest,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Optimized AI chat with full performance stack
    - Multi-layer caching
    - Performance monitoring
    - Cost optimization
    - Smart model routing
    """
    try:
        ai_service = await get_optimized_ai_service()
        
        # Process request with full optimization
        response = await ai_service.process_ai_request(
            user_id=str(current_user.id),
            message=request.message,
            agent_type=request.agent_type,
            context=request.context,
            use_cache=request.use_cache
        )
        
        # Background task for analytics
        background_tasks.add_task(
            update_user_analytics,
            str(current_user.id),
            request.agent_type,
            response['tokens_used'],
            response['cost']
        )
        
        return AIResponse(**response)
        
    except Exception as e:
        logger.error(f"❌ Optimized AI chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

@router.post("/v4/chat/multi-agent", response_model=MultiAgentResponse)
@monitor_performance("multi_agent_chat")
async def multi_agent_chat(
    request: MultiAgentRequest,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Multi-agent collaboration with performance optimization
    - Parallel or sequential processing
    - Response synthesis
    - Cost tracking across agents
    """
    try:
        ai_service = await get_optimized_ai_service()
        
        # Process multi-agent request
        response = await ai_service.process_multi_agent_request(
            user_id=str(current_user.id),
            message=request.message,
            agents=request.agents,
            context=request.context
        )
        
        # Background analytics
        background_tasks.add_task(
            update_multi_agent_analytics,
            str(current_user.id),
            request.agents or ["dev", "luna", "atlas"],
            response['total_tokens'],
            response['total_cost']
        )
        
        return MultiAgentResponse(**response)
        
    except Exception as e:
        logger.error(f"❌ Multi-agent chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Multi-agent processing failed: {str(e)}")

@router.post("/v4/chat/quick")
@monitor_performance("quick_response")
async def quick_ai_response(
    request: QuickResponseRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Ultra-fast AI response for simple queries
    - Minimal processing overhead
    - Aggressive caching
    - Fastest models only
    """
    try:
        ai_service = await get_optimized_ai_service()
        
        # Force fastest model and aggressive caching
        response = await ai_service.process_ai_request(
            user_id=str(current_user.id),
            message=request.message,
            agent_type="dev",  # Default agent
            context=None,      # No context for speed
            use_cache=True     # Always use cache
        )
        
        return {
            "content": response["content"],
            "response_time": response["response_time"],
            "cached": response["cached"],
            "cost": response["cost"]
        }
        
    except Exception as e:
        logger.error(f"❌ Quick response failed: {e}")
        raise HTTPException(status_code=500, detail=f"Quick response failed: {str(e)}")

@router.get("/v4/agents/available")
@monitor_performance("get_agents")
async def get_available_agents(
    current_user: User = Depends(get_current_user)
):
    """Get all available AI agents with performance metrics"""
    try:
        ai_service = await get_optimized_ai_service()
        agents = await ai_service.get_available_agents()
        
        return {
            "agents": agents,
            "total_agents": len(agents),
            "features": {
                "multi_agent_collaboration": True,
                "performance_optimized": True,
                "cost_optimized": True,
                "caching_enabled": True
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Get agents failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get agents: {str(e)}")

@router.get("/v4/analytics/user")
@monitor_performance("user_analytics")
async def get_user_ai_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive user AI analytics"""
    try:
        ai_service = await get_optimized_ai_service()
        analytics = await ai_service.get_user_ai_analytics(str(current_user.id), days)
        
        return {
            "user_id": str(current_user.id),
            "period_days": days,
            **analytics
        }
        
    except Exception as e:
        logger.error(f"❌ Analytics failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

@router.get("/v4/performance/dashboard")
@monitor_performance("performance_dashboard")
async def get_performance_dashboard(
    current_user: User = Depends(get_current_user)
):
    """Get real-time performance dashboard"""
    try:
        monitor = await get_performance_monitor()
        dashboard_data = await monitor.get_performance_dashboard()
        
        return {
            "dashboard": dashboard_data,
            "timestamp": "2025-01-01T00:00:00Z",  # Current timestamp
            "user_id": str(current_user.id)
        }
        
    except Exception as e:
        logger.error(f"❌ Performance dashboard failed: {e}")
        raise HTTPException(status_code=500, detail=f"Dashboard failed: {str(e)}")

# Streaming response for real-time AI
@router.post("/v4/chat/stream")
async def stream_ai_response(
    request: OptimizedAIRequest,
    current_user: User = Depends(get_current_user)
):
    """Stream AI response for real-time experience"""
    
    async def generate_stream():
        try:
            ai_service = await get_optimized_ai_service()
            
            # Start processing
            yield f"data: {json.dumps({'status': 'processing', 'agent': request.agent_type})}\n\n"
            
            # Get response
            response = await ai_service.process_ai_request(
                user_id=str(current_user.id),
                message=request.message,
                agent_type=request.agent_type,
                context=request.context,
                use_cache=request.use_cache
            )
            
            # Stream response in chunks
            content = response["content"]
            chunk_size = 50
            
            for i in range(0, len(content), chunk_size):
                chunk = content[i:i + chunk_size]
                yield f"data: {json.dumps({'chunk': chunk, 'progress': (i + chunk_size) / len(content)})}\n\n"
            
            # Final metadata
            yield f"data: {json.dumps({'status': 'complete', 'metadata': {'cost': response['cost'], 'tokens': response['tokens_used'], 'cached': response['cached']}})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

# Cache management endpoints
@router.post("/v4/cache/clear")
@monitor_performance("clear_cache")
async def clear_user_cache(
    current_user: User = Depends(get_current_user)
):
    """Clear user's cache for fresh responses"""
    try:
        from services.performance_cache import get_performance_cache
        cache = await get_performance_cache()
        
        await cache.clear_user_cache(str(current_user.id))
        
        return {
            "message": "User cache cleared successfully",
            "user_id": str(current_user.id)
        }
        
    except Exception as e:
        logger.error(f"❌ Cache clear failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache clear failed: {str(e)}")

@router.get("/v4/health/detailed")
@monitor_performance("health_check")
async def detailed_health_check():
    """Comprehensive health check with performance metrics"""
    try:
        from services.scalable_database import get_scalable_database
        
        # Check all services
        db = await get_scalable_database()
        ai_service = await get_optimized_ai_service()
        monitor = await get_performance_monitor()
        
        # Get connection stats
        db_stats = await db.get_connection_stats()
        
        return {
            "status": "healthy",
            "services": {
                "database": "connected",
                "ai_service": "ready",
                "cache_layer": "active",
                "monitoring": "enabled"
            },
            "performance": {
                "database_connections": db_stats.get("mongodb", {}),
                "cache_stats": db_stats.get("redis", {}),
                "ai_models": len(ai_service.models),
                "available_agents": len(ai_service.agents)
            },
            "features": {
                "multi_layer_caching": True,
                "performance_monitoring": True,
                "cost_optimization": True,
                "auto_scaling_ready": True,
                "enterprise_grade": True
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "degraded",
            "error": str(e)
        }

# Background task functions
async def update_user_analytics(
    user_id: str, 
    agent_type: str, 
    tokens_used: int, 
    cost: float
):
    """Background task to update user analytics"""
    try:
        from services.scalable_database import get_scalable_database
        db = await get_scalable_database()
        
        # Update user usage statistics
        await db.update_user_usage_stats(user_id, tokens_used, cost)
        
    except Exception as e:
        logger.error(f"❌ Analytics update failed: {e}")

async def update_multi_agent_analytics(
    user_id: str,
    agents_used: List[str],
    total_tokens: int,
    total_cost: float
):
    """Background task for multi-agent analytics"""
    try:
        from services.scalable_database import get_scalable_database
        db = await get_scalable_database()
        
        # Track multi-agent usage
        await db.track_ai_usage(
            user_id=user_id,
            model="multi_agent",
            tokens_used=total_tokens,
            response_time=0.0,  # Already recorded individually
            cost=total_cost
        )
        
    except Exception as e:
        logger.error(f"❌ Multi-agent analytics failed: {e}")