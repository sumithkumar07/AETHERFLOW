from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uuid
import logging
from datetime import datetime

from services.enhanced_ai_service import EnhancedAIService, AgentRole, ConversationContext

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize the enhanced AI service
enhanced_ai_service = EnhancedAIService()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    project_id: Optional[str] = None
    user_id: Optional[str] = None
    include_context: bool = True

class ChatResponse(BaseModel):
    content: str
    session_id: str
    agent: Optional[str] = None
    agent_role: Optional[str] = None
    agents: List[str] = []
    type: str
    timestamp: str
    model_used: Optional[str] = None

class ConversationSummaryResponse(BaseModel):
    summary: str
    total_messages: int
    active_agents: List[str]
    session_id: str

@router.post("/chat/enhanced", response_model=ChatResponse)
async def enhanced_ai_chat(request: ChatRequest):
    """Enhanced AI chat with multi-agent coordination and intelligent conversation management"""
    
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        user_id = request.user_id or "anonymous"
        
        # Initialize conversation if new session
        if session_id not in enhanced_ai_service.conversation_contexts:
            await enhanced_ai_service.initialize_conversation(
                session_id=session_id,
                user_id=user_id,
                project_id=request.project_id,
                initial_context=request.message
            )
        
        # Process the message with enhanced AI
        response = await enhanced_ai_service.enhance_conversation(
            session_id=session_id,
            user_message=request.message,
            include_context=request.include_context
        )
        
        return ChatResponse(
            content=response["content"],
            session_id=session_id,
            agent=response.get("agent"),
            agent_role=response.get("agent_role"),
            agents=response.get("agents", []),
            type=response.get("type", "single_agent"),
            timestamp=datetime.utcnow().isoformat(),
            model_used=response.get("model_used")
        )
        
    except Exception as e:
        logger.error(f"Error in enhanced AI chat: {e}")
        raise HTTPException(status_code=500, detail=f"Enhanced AI chat failed: {str(e)}")

@router.get("/chat/{session_id}/summary", response_model=ConversationSummaryResponse)
async def get_conversation_summary(session_id: str):
    """Get intelligent summary of a conversation"""
    
    try:
        summary_data = await enhanced_ai_service.get_conversation_summary(session_id)
        
        if "error" in summary_data:
            raise HTTPException(status_code=404, detail=summary_data["error"])
        
        return ConversationSummaryResponse(**summary_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversation summary: {str(e)}")

@router.get("/chat/{session_id}/agents")
async def get_active_agents(session_id: str):
    """Get currently active agents for a conversation session"""
    
    try:
        agents = enhanced_ai_service.get_active_agents(session_id)
        
        return {
            "session_id": session_id,
            "active_agents": agents,
            "total_agents": len(agents)
        }
        
    except Exception as e:
        logger.error(f"Error getting active agents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get active agents: {str(e)}")

@router.post("/chat/{session_id}/agents/add")
async def add_agent_to_conversation(session_id: str, agent_role: str):
    """Add a specific agent to the conversation"""
    
    try:
        # Validate agent role
        try:
            role = AgentRole(agent_role)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid agent role: {agent_role}")
        
        if session_id not in enhanced_ai_service.conversation_contexts:
            raise HTTPException(status_code=404, detail="Conversation session not found")
        
        context = enhanced_ai_service.conversation_contexts[session_id]
        
        if role not in context.active_agents:
            context.active_agents.append(role)
            context.collaboration_mode = len(context.active_agents) > 1
        
        return {
            "message": f"Agent {agent_role} added to conversation",
            "active_agents": [agent.value for agent in context.active_agents]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding agent to conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add agent: {str(e)}")

@router.delete("/chat/{session_id}/agents/{agent_role}")
async def remove_agent_from_conversation(session_id: str, agent_role: str):
    """Remove a specific agent from the conversation"""
    
    try:
        # Validate agent role
        try:
            role = AgentRole(agent_role)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid agent role: {agent_role}")
        
        if session_id not in enhanced_ai_service.conversation_contexts:
            raise HTTPException(status_code=404, detail="Conversation session not found")
        
        context = enhanced_ai_service.conversation_contexts[session_id]
        
        if role in context.active_agents:
            context.active_agents.remove(role)
            context.collaboration_mode = len(context.active_agents) > 1
        
        # Ensure at least one agent remains
        if not context.active_agents:
            context.active_agents.append(AgentRole.DEVELOPER)
        
        return {
            "message": f"Agent {agent_role} removed from conversation",
            "active_agents": [agent.value for agent in context.active_agents]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing agent from conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to remove agent: {str(e)}")

@router.get("/agents/available")
async def get_available_agents():
    """Get list of all available AI agents with their capabilities"""
    
    try:
        agents = []
        
        for role, config in enhanced_ai_service.agent_configs.items():
            agents.append({
                "role": role.value,
                "name": config["name"],
                "personality": config["personality"],
                "capabilities": config["capabilities"],
                "model": config["model"]
            })
        
        return {
            "agents": agents,
            "total_agents": len(agents)
        }
        
    except Exception as e:
        logger.error(f"Error getting available agents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get available agents: {str(e)}")

@router.post("/chat/quick-response")
async def quick_ai_response(request: ChatRequest):
    """Quick AI response without session management - for simple queries"""
    
    try:
        # Create temporary session for quick response
        temp_session_id = f"quick_{uuid.uuid4()}"
        
        await enhanced_ai_service.initialize_conversation(
            session_id=temp_session_id,
            user_id=request.user_id or "anonymous",
            initial_context=request.message
        )
        
        response = await enhanced_ai_service.enhance_conversation(
            session_id=temp_session_id,
            user_message=request.message,
            include_context=False
        )
        
        # Clean up temporary session
        if temp_session_id in enhanced_ai_service.conversation_contexts:
            del enhanced_ai_service.conversation_contexts[temp_session_id]
        
        return {
            "content": response["content"],
            "agent": response.get("agent"),
            "agent_role": response.get("agent_role"),
            "type": response.get("type", "quick_response"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in quick AI response: {e}")
        raise HTTPException(status_code=500, detail=f"Quick AI response failed: {str(e)}")

@router.delete("/chat/{session_id}")
async def end_conversation(session_id: str):
    """End a conversation session and clean up resources"""
    
    try:
        if session_id in enhanced_ai_service.conversation_contexts:
            del enhanced_ai_service.conversation_contexts[session_id]
            return {"message": f"Conversation {session_id} ended successfully"}
        else:
            raise HTTPException(status_code=404, detail="Conversation session not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to end conversation: {str(e)}")

@router.post("/maintenance/cleanup")
async def cleanup_old_conversations(max_age_hours: int = 24):
    """Clean up old conversation contexts (admin endpoint)"""
    
    try:
        await enhanced_ai_service.cleanup_old_conversations(max_age_hours)
        return {"message": f"Cleaned up conversations older than {max_age_hours} hours"}
        
    except Exception as e:
        logger.error(f"Error in cleanup: {e}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")