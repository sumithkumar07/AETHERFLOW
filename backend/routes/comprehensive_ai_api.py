"""
Comprehensive AI API Routes - Enhanced AI capabilities
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import uuid
import logging
from datetime import datetime

from services.comprehensive_ai_enhancement_service import comprehensive_ai_service, AgentSpecialty, IntelligenceLevel

logger = logging.getLogger(__name__)
router = APIRouter()

class EnhancedChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    agent_preference: Optional[str] = None
    intelligence_level: Optional[str] = None
    include_suggestions: bool = True
    include_collaboration: bool = True
    
class EnhancedChatResponse(BaseModel):
    content: str
    agent: str
    agent_name: str
    confidence: float
    intelligence_level: str
    suggestions: List[str] = []
    next_actions: List[str] = []
    collaboration_opportunities: List[Dict[str, Any]] = []
    performance_metrics: Dict[str, float]
    metadata: Dict[str, Any]
    session_id: str
    timestamp: str

class QuickResponseRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    user_id: Optional[str] = None

@router.post("/chat/enhanced", response_model=EnhancedChatResponse)
async def enhanced_ai_chat(request: EnhancedChatRequest):
    """
    Enhanced AI chat with comprehensive intelligence features
    - Context-aware responses
    - Multi-agent coordination  
    - Smart suggestions and next actions
    - Collaboration opportunities
    - Performance optimization
    """
    
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Process with comprehensive AI service
        response = await comprehensive_ai_service.enhanced_conversation(
            session_id=session_id,
            user_message=request.message,
            user_id=request.user_id or "anonymous",
            agent_preference=request.agent_preference,
            intelligence_level=request.intelligence_level,
            include_suggestions=request.include_suggestions,
            include_collaboration=request.include_collaboration
        )
        
        # Map agent enum to string
        agent_names = {
            AgentSpecialty.DEVELOPER: "Senior Developer",
            AgentSpecialty.DESIGNER: "UX/UI Designer", 
            AgentSpecialty.ARCHITECT: "System Architect",
            AgentSpecialty.TESTER: "QA Engineer",
            AgentSpecialty.PROJECT_MANAGER: "Project Manager"
        }
        
        return EnhancedChatResponse(
            content=response.content,
            agent=response.agent.value,
            agent_name=agent_names[response.agent],
            confidence=response.confidence,
            intelligence_level=response.intelligence_level.value,
            suggestions=response.suggestions,
            next_actions=response.next_actions,
            collaboration_opportunities=response.collaboration_opportunities,
            performance_metrics=response.performance_metrics,
            metadata=response.metadata,
            session_id=session_id,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Enhanced AI chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Enhanced AI chat failed: {str(e)}")

@router.post("/chat/quick", response_model=EnhancedChatResponse)
async def quick_enhanced_response(request: QuickResponseRequest):
    """
    Quick enhanced response optimized for speed (<2s target)
    Maintains intelligence while prioritizing response time
    """
    
    try:
        # Generate quick response with comprehensive AI
        response = await comprehensive_ai_service.quick_enhanced_response(
            message=request.message,
            user_id=request.user_id or "anonymous"
        )
        
        # Map agent enum to string
        agent_names = {
            AgentSpecialty.DEVELOPER: "Senior Developer",
            AgentSpecialty.DESIGNER: "UX/UI Designer",
            AgentSpecialty.ARCHITECT: "System Architect", 
            AgentSpecialty.TESTER: "QA Engineer",
            AgentSpecialty.PROJECT_MANAGER: "Project Manager"
        }
        
        return EnhancedChatResponse(
            content=response.content,
            agent=response.agent.value,
            agent_name=agent_names[response.agent],
            confidence=response.confidence,
            intelligence_level=response.intelligence_level.value,
            suggestions=response.suggestions,
            next_actions=response.next_actions,
            collaboration_opportunities=response.collaboration_opportunities,
            performance_metrics=response.performance_metrics,
            metadata=response.metadata,
            session_id=f"quick_{uuid.uuid4().hex[:8]}",
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Quick enhanced response failed: {e}")
        raise HTTPException(status_code=500, detail=f"Quick response failed: {str(e)}")

@router.get("/agents/enhanced")
async def get_enhanced_agents():
    """Get available enhanced agents with capabilities and performance metrics"""
    
    try:
        agents_data = await comprehensive_ai_service.get_available_agents()
        return {
            "status": "success",
            "data": agents_data,
            "enhanced_features": {
                "context_awareness": "Maintains conversation context and user preferences",
                "intelligent_routing": "Automatically selects best agent for each query",
                "smart_suggestions": "Provides contextual suggestions and next actions",
                "collaboration_detection": "Identifies opportunities for multi-agent collaboration",
                "performance_optimization": "Optimized for speed while maintaining quality",
                "learning_adaptation": "Adapts responses based on user interaction patterns"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting enhanced agents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get enhanced agents: {str(e)}")

@router.get("/conversation/{session_id}/context")
async def get_conversation_context(session_id: str):
    """Get conversation context and intelligence metrics"""
    
    try:
        if session_id not in comprehensive_ai_service.conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        context = comprehensive_ai_service.conversations[session_id]
        
        return {
            "session_id": session_id,
            "intelligence_level": context.intelligence_level.value,
            "active_agents": [agent.value for agent in context.active_agents],
            "total_interactions": context.total_interactions,
            "performance_metrics": context.performance_metrics,
            "conversation_length": len(context.conversation_history),
            "created_at": context.created_at.isoformat(),
            "last_active": context.last_active.isoformat(),
            "user_preferences": context.preferences
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation context: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversation context: {str(e)}")

@router.post("/conversation/{session_id}/agent/switch")
async def switch_conversation_agent(session_id: str, new_agent: str):
    """Switch active agent in conversation"""
    
    try:
        if session_id not in comprehensive_ai_service.conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Validate agent
        try:
            agent_enum = AgentSpecialty(new_agent)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid agent: {new_agent}")
        
        context = comprehensive_ai_service.conversations[session_id]
        
        # Update active agents
        if agent_enum not in context.active_agents:
            context.active_agents.append(agent_enum)
        
        # Make the new agent primary (first in list)
        if agent_enum in context.active_agents:
            context.active_agents.remove(agent_enum)
        context.active_agents.insert(0, agent_enum)
        
        return {
            "message": f"Switched to {new_agent}",
            "active_agents": [agent.value for agent in context.active_agents],
            "primary_agent": context.active_agents[0].value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error switching conversation agent: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to switch agent: {str(e)}")

@router.delete("/conversation/{session_id}")
async def end_enhanced_conversation(session_id: str):
    """End conversation and cleanup resources"""
    
    try:
        if session_id not in comprehensive_ai_service.conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        context = comprehensive_ai_service.conversations[session_id]
        
        # Get final metrics
        final_metrics = {
            "total_interactions": context.total_interactions,
            "duration_minutes": (datetime.utcnow() - context.created_at).total_seconds() / 60,
            "average_response_time": context.performance_metrics.get('average_response_time', 0),
            "agents_used": list(set(agent.value for agent in context.active_agents))
        }
        
        # Cleanup
        del comprehensive_ai_service.conversations[session_id]
        
        return {
            "message": f"Conversation {session_id} ended successfully",
            "final_metrics": final_metrics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to end conversation: {str(e)}")

@router.post("/maintenance/cleanup")
async def cleanup_old_conversations(max_age_hours: int = 24):
    """Cleanup old conversations (admin endpoint)"""
    
    try:
        await comprehensive_ai_service.cleanup_conversations(max_age_hours)
        
        return {
            "message": f"Cleaned up conversations older than {max_age_hours} hours",
            "active_conversations": len(comprehensive_ai_service.conversations)
        }
        
    except Exception as e:
        logger.error(f"Error in cleanup: {e}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@router.get("/health")
async def comprehensive_ai_health():
    """Health check for comprehensive AI service"""
    
    try:
        return {
            "status": "healthy",
            "service": "Comprehensive AI Enhancement",
            "version": "2.0.0",
            "features": {
                "enhanced_conversation": "active",
                "multi_agent_coordination": "active", 
                "smart_suggestions": "active",
                "performance_optimization": "active",
                "context_awareness": "active"
            },
            "active_conversations": len(comprehensive_ai_service.conversations),
            "agent_performance": {
                agent.value: {
                    "response_time": metrics.get('response_time', 0),
                    "success_count": metrics.get('success_count', 0)
                }
                for agent, metrics in comprehensive_ai_service.agent_performances.items()
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")