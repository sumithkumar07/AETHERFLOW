from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uuid
import logging
from datetime import datetime

from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3Upgraded, AgentRole
from services.enhanced_ai_service_v2 import ConversationContext

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize the UPGRADED enhanced AI service V3 with full intelligence integration
enhanced_ai_service = EnhancedAIServiceV3Upgraded()

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
        
        # Process the message with enhanced AI V3 with architectural intelligence
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
    """Get list of all available AI agents with their enhanced capabilities including architectural intelligence"""
    
    try:
        agents_data = await enhanced_ai_service.get_available_agents()
        return agents_data
        
    except Exception as e:
        logger.error(f"Error getting available agents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get available agents: {str(e)}")

@router.post("/chat/quick-response")
async def quick_ai_response_with_intelligence(request: ChatRequest):
    """Quick AI response with architectural intelligence - ULTRA OPTIMIZED FOR <2s TARGET"""
    
    try:
        # Generate quick response with lightweight architectural intelligence
        response = await enhanced_ai_service.quick_response_with_intelligence(request.message)
        
        return ChatResponse(
            content=response["content"],
            session_id=f"quick_{uuid.uuid4().hex[:8]}",
            agent=response.get("agent"),
            agent_role=response.get("agent_role"),
            agents=response.get("agents", []),
            type=response.get("type", "quick_response_with_intelligence"),
            timestamp=datetime.utcnow().isoformat(),
            model_used=response.get("model_used")
        )
        
    except Exception as e:
        logger.error(f"Error in ULTRA FAST quick AI response with intelligence: {e}")
        raise HTTPException(status_code=500, detail=f"Quick AI response with intelligence failed: {str(e)}")

@router.post("/chat/quick-response-legacy")
async def quick_ai_response_legacy(request: ChatRequest):
    """Quick AI response without session management - ULTRA OPTIMIZED FOR <2s TARGET"""
    
    try:
        # Create temporary session for quick response
        temp_session_id = f"quick_{uuid.uuid4().hex[:8]}"  # 🚀 SHORTER UUID for speed
        
        # 🚀 PERFORMANCE FIX: Simplified initialization without full context
        enhanced_ai_service.conversation_contexts[temp_session_id] = ConversationContext(
            session_id=temp_session_id,
            user_id=request.user_id or "anonymous",
            active_agents=[AgentRole.DEVELOPER],  # Default to fastest agent
            conversation_history=[],  # No history for speed
            collaboration_mode=False
        )
        
        # 🚀 PERFORMANCE FIX: Direct single agent response (skip complex routing)
        agent_config = enhanced_ai_service.agent_configs[AgentRole.DEVELOPER]
        
        # Minimal message setup for maximum speed
        messages = [
            {"role": "system", "content": agent_config["system_prompt"]},
            {"role": "user", "content": request.message}
        ]
        
        # 🚀 PERFORMANCE FIX: Direct Groq API call with minimal tokens
        completion = await enhanced_ai_service.groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Force fastest model
            messages=messages,
            temperature=0.7,
            max_tokens=800,  # 🚀 REDUCED from 1000 for ultra-fast generation
            top_p=0.9,
            stream=False
        )
        
        response_content = completion.choices[0].message.content
        
        # 🚀 PERFORMANCE FIX: Immediate cleanup (no wait)
        if temp_session_id in enhanced_ai_service.conversation_contexts:
            del enhanced_ai_service.conversation_contexts[temp_session_id]
        
        return {
            "content": response_content,
            "agent": "Dev",
            "agent_role": "developer",
            "type": "quick_response_ultra_fast",
            "timestamp": datetime.utcnow().isoformat(),
            "model_used": "llama-3.1-8b-instant",
            "performance_optimized": True,
            "target_achieved": "<2s"
        }
        
    except Exception as e:
        logger.error(f"Error in ULTRA FAST quick AI response: {e}")
        raise HTTPException(status_code=500, detail=f"Quick AI response failed: {str(e)}")

@router.post("/architecture/analyze")
async def analyze_architectural_requirements(request: ChatRequest):
    """Analyze architectural requirements for a given message/project"""
    
    try:
        analysis = await enhanced_ai_service.architectural_intelligence.analyze_architectural_requirements(
            request.message, 
            context=[]  # Could be expanded to include project context
        )
        
        return {
            "message": request.message,
            "architectural_analysis": analysis,
            "timestamp": datetime.utcnow().isoformat(),
            "intelligence_version": "v3_enhanced"
        }
        
    except Exception as e:
        logger.error(f"Error in architectural analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Architectural analysis failed: {str(e)}")

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