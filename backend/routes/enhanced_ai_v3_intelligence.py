"""
Enhanced AI v3 Intelligence API Routes
Integrates advanced AI intelligence without changing existing endpoints
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import logging
import time
from datetime import datetime

from services.advanced_ai_intelligence import ai_intelligence
from services.enhanced_performance_optimizer import performance_optimizer

logger = logging.getLogger(__name__)

router = APIRouter()

class IntelligenceEnhancedRequest(BaseModel):
    message: str
    session_id: str
    context: Optional[Dict[str, Any]] = None
    enable_intelligence: bool = True
    user_preferences: Optional[Dict[str, Any]] = None

class QuickIntelligentRequest(BaseModel):
    message: str
    urgency: Optional[str] = "normal"  # low, normal, high
    context_type: Optional[str] = "general"  # coding, design, architecture, testing, general

@router.post("/chat/enhanced-intelligent")
async def enhanced_intelligent_chat(request: IntelligenceEnhancedRequest):
    """
    Enhanced AI chat with advanced intelligence
    Provides superior conversation quality without changing UI
    """
    try:
        start_time = time.time()
        
        if request.enable_intelligence:
            # Use advanced AI intelligence
            result = await ai_intelligence.enhance_conversation(
                message=request.message,
                session_id=request.session_id,
                user_context={
                    "preferences": request.user_preferences or {},
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            if "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])
            
            # Extract enhanced response
            enhanced_response = result["response"]
            content = enhanced_response.content if hasattr(enhanced_response, 'content') else str(enhanced_response)
            
            processing_time = time.time() - start_time
            
            return {
                "response": content,
                "session_id": request.session_id,
                "metadata": {
                    "intelligence_enhanced": True,
                    "processing_time": processing_time,
                    "confidence_score": getattr(enhanced_response, 'confidence_score', 0.9),
                    "suggested_actions": getattr(enhanced_response, 'suggested_actions', []),
                    "follow_up_questions": getattr(enhanced_response, 'follow_up_questions', []),
                    "related_concepts": getattr(enhanced_response, 'related_concepts', []),
                    "model_used": getattr(enhanced_response, 'model_used', 'llama-3.3-70b-versatile')
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        
        else:
            # Fallback to regular processing
            return {
                "response": f"Regular response to: {request.message}",
                "session_id": request.session_id,
                "metadata": {"intelligence_enhanced": False},
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Enhanced intelligent chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/quick-intelligent")
async def quick_intelligent_response(request: QuickIntelligentRequest):
    """
    Quick intelligent response with optimized processing
    Faster responses while maintaining intelligence
    """
    try:
        start_time = time.time()
        
        # Create simplified context for quick processing
        context = {
            "urgency": request.urgency,
            "context_type": request.context_type,
            "quick_mode": True
        }
        
        # Generate quick session ID based on message hash
        import hashlib
        session_id = f"quick_{hashlib.md5(request.message.encode()).hexdigest()[:8]}"
        
        # Use AI intelligence with optimized settings
        result = await ai_intelligence.enhance_conversation(
            message=request.message,
            session_id=session_id,
            user_context=context
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        processing_time = time.time() - start_time
        
        return {
            "response": result["response"].content if hasattr(result["response"], 'content') else str(result["response"]),
            "processing_time": processing_time,
            "intelligence_applied": True,
            "quick_mode": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Quick intelligent response error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/intelligence/status")
async def get_intelligence_status():
    """
    Get AI intelligence system status
    Shows how intelligence enhancements are working
    """
    try:
        # Get intelligence report
        intelligence_report = await ai_intelligence.get_intelligence_report()
        
        # Get performance report  
        performance_report = await performance_optimizer.get_performance_report()
        
        return {
            "ai_intelligence": intelligence_report,
            "performance_optimization": performance_report,
            "overall_status": "operational",
            "enhancements_active": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Intelligence status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/intelligence/metrics")
async def get_intelligence_metrics():
    """
    Get detailed intelligence and performance metrics
    For monitoring and optimization purposes
    """
    try:
        intelligence_report = await ai_intelligence.get_intelligence_report()
        performance_report = await performance_optimizer.get_performance_report()
        
        # Combine metrics
        combined_metrics = {
            "intelligence_metrics": {
                "active_sessions": intelligence_report.get("active_sessions", 0),
                "total_interactions": intelligence_report.get("total_interactions", 0),
                "average_quality": intelligence_report.get("average_quality_score", 0.0),
                "concept_graph_size": intelligence_report.get("concept_graph_size", 0)
            },
            "performance_metrics": {
                "cpu_usage": performance_report.get("current_metrics", {}).get("cpu_usage", 0.0),
                "memory_usage": performance_report.get("current_metrics", {}).get("memory_usage", 0.0),
                "response_time": performance_report.get("current_metrics", {}).get("response_time", 0.0),
                "cache_hit_rate": performance_report.get("current_metrics", {}).get("cache_hit_rate", 0.0)
            },
            "optimization_status": {
                "active_optimizations": performance_report.get("optimizations", {}).get("active_tasks", 0),
                "strategies_enabled": performance_report.get("optimizations", {}).get("strategies_enabled", 0)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return combined_metrics
        
    except Exception as e:
        logger.error(f"Intelligence metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intelligence/optimize")
async def trigger_intelligence_optimization():
    """
    Trigger intelligence and performance optimization
    Manual optimization trigger for admin use
    """
    try:
        # Start optimization tasks if not already running
        await ai_intelligence.initialize_intelligence_systems()
        await performance_optimizer.start_optimization_engine()
        
        return {
            "message": "Intelligence and performance optimization triggered",
            "ai_intelligence": "initialized",
            "performance_optimizer": "started", 
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Intelligence optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/intelligence/conversation/{session_id}")
async def get_conversation_intelligence(session_id: str):
    """
    Get intelligence data for specific conversation
    Shows how AI is learning and improving responses
    """
    try:
        if session_id in ai_intelligence.conversation_memories:
            memory = ai_intelligence.conversation_memories[session_id]
            
            return {
                "session_id": session_id,
                "conversation_context": {
                    "context_type": memory.context_type.value,
                    "key_concepts": memory.key_concepts,
                    "technical_stack": memory.technical_stack,
                    "interaction_count": memory.interaction_count,
                    "quality_score": memory.quality_score,
                    "created_at": memory.created_at.isoformat(),
                    "last_updated": memory.last_updated.isoformat()
                },
                "intelligence_applied": True,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "session_id": session_id,
                "message": "No conversation memory found",
                "intelligence_applied": False,
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Conversation intelligence error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/intelligence/conversation/{session_id}")
async def clear_conversation_intelligence(session_id: str):
    """
    Clear conversation intelligence data
    For privacy or testing purposes
    """
    try:
        if session_id in ai_intelligence.conversation_memories:
            del ai_intelligence.conversation_memories[session_id]
            return {
                "message": f"Conversation intelligence cleared for session {session_id}",
                "status": "success"
            }
        else:
            return {
                "message": f"No conversation intelligence found for session {session_id}",
                "status": "not_found"
            }
            
    except Exception as e:
        logger.error(f"Clear conversation intelligence error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/intelligence/health")
async def intelligence_health_check():
    """
    Health check for AI intelligence systems
    Ensures all enhancement systems are working
    """
    try:
        health_status = {
            "ai_intelligence": "healthy",
            "performance_optimizer": "healthy", 
            "conversation_memories": len(ai_intelligence.conversation_memories),
            "concept_graph": len(ai_intelligence.concept_graph),
            "active_optimizations": len(performance_optimizer.optimization_tasks),
            "overall_status": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Intelligence health check error: {e}")
        return {
            "overall_status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Initialize systems when module loads
@router.on_event("startup")
async def startup_intelligence_systems():
    """Initialize AI intelligence systems on startup"""
    try:
        await ai_intelligence.initialize_intelligence_systems()
        await performance_optimizer.start_optimization_engine()
        logger.info("✅ AI Intelligence systems initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize AI Intelligence systems: {e}")