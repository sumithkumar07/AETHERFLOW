# Enhanced AI Routes with improved conversation quality and multi-agent coordination
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging

from models.user import User
from models.database import get_database
from routes.auth import get_current_user
from services.enhanced_ai_service import EnhancedAIService
from middleware.usage_tracking import get_chat_usage_dependency, estimate_tokens, estimate_response_tokens

router = APIRouter()
enhanced_ai_service = EnhancedAIService()
logger = logging.getLogger(__name__)

class EnhancedChatMessage(BaseModel):
    message: str
    model: Optional[str] = "llama-3.1-70b-versatile"
    agent: Optional[str] = "developer"
    project_id: Optional[str] = None
    conversation_id: Optional[str] = None
    context: Optional[List[Dict]] = []
    preferences: Optional[Dict] = {}
    collaboration_mode: Optional[bool] = True

class AgentHandoffRequest(BaseModel):
    conversation_id: str
    from_agent: str
    to_agent: str
    context: Optional[str] = None

class ConversationAnalyticsRequest(BaseModel):
    timeframe: Optional[str] = "week"
    include_agent_insights: Optional[bool] = True

@router.post("/enhanced-chat")
async def enhanced_chat_with_ai(
    message_data: EnhancedChatMessage,
    usage_info = Depends(get_chat_usage_dependency)
):
    """Enhanced AI chat with improved conversation quality and multi-agent coordination"""
    try:
        current_user = usage_info["user"]
        user_id = usage_info["user_id"]
        track_usage = usage_info["track_usage"]
        
        logger.info(f"Processing enhanced AI chat request from user {user_id} with agent {message_data.agent}")
        
        # Estimate input tokens
        input_tokens = estimate_tokens(message_data.message)
        
        # Generate unique message ID
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        # Process with enhanced AI service
        ai_response = await enhanced_ai_service.process_enhanced_message(
            message=message_data.message,
            agent=message_data.agent,
            context=message_data.context,
            user_id=user_id,
            project_id=message_data.project_id,
            conversation_id=message_data.conversation_id,
            model=message_data.model
        )
        
        # Estimate output tokens and track usage
        output_tokens = estimate_response_tokens(ai_response["response"], ai_response.get("model_used", message_data.model))
        total_tokens = input_tokens + output_tokens
        
        # Track token usage
        usage_result = await track_usage(
            tokens=total_tokens,
            model=ai_response.get("model_used", message_data.model),
            metadata={
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "agent": message_data.agent,
                "project_id": message_data.project_id,
                "message_length": len(message_data.message),
                "response_length": len(ai_response["response"]),
                "enhanced_features": True,
                "collaboration_opportunities": len(ai_response.get("collaboration_opportunities", [])),
                "suggestions_count": len(ai_response.get("suggestions", []))
            }
        )
        
        # Check if usage tracking failed
        if not usage_result["success"] and "limit exceeded" in usage_result.get("error", "").lower():
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Usage limit exceeded",
                    "message": usage_result["error"],
                    "tokens_used": total_tokens,
                    "upgrade_required": True
                }
            )
        
        # Save enhanced conversation to database
        db = await get_database()
        
        conversation_data = {
            "_id": f"conv_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "project_id": message_data.project_id,
            "messages": [
                {
                    "id": f"user_{message_id}",
                    "content": message_data.message,
                    "sender": "user",
                    "timestamp": datetime.utcnow(),
                    "model": message_data.model,
                    "agent": message_data.agent
                },
                {
                    "id": f"ai_{message_id}",
                    "content": ai_response["response"],
                    "sender": "assistant",
                    "timestamp": datetime.utcnow(),
                    "model": ai_response.get("model_used", message_data.model),
                    "agent": ai_response.get("agent", message_data.agent),
                    "metadata": {
                        **ai_response.get("metadata", {}),
                        "tokens_used": total_tokens,
                        "input_tokens": input_tokens,
                        "output_tokens": output_tokens,
                        "enhanced_features": {
                            "suggestions": ai_response.get("suggestions", []),
                            "agent_insights": ai_response.get("agent_insights", []),
                            "next_actions": ai_response.get("next_actions", []),
                            "collaboration_opportunities": ai_response.get("collaboration_opportunities", [])
                        }
                    }
                }
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "enhanced": True
        }
        
        # Insert or update conversation
        if message_data.conversation_id:
            await db.conversations.update_one(
                {"_id": message_data.conversation_id, "user_id": user_id},
                {
                    "$push": {"messages": conversation_data["messages"]},
                    "$set": {"updated_at": datetime.utcnow(), "enhanced": True}
                }
            )
        else:
            await db.conversations.insert_one(conversation_data)
        
        return {
            "response": ai_response["response"],
            "agent": ai_response.get("agent", message_data.agent),
            "model_used": ai_response.get("model_used", message_data.model),
            "confidence": ai_response.get("confidence", 0.95),
            "suggestions": ai_response.get("suggestions", []),
            "agent_insights": ai_response.get("agent_insights", []),
            "next_actions": ai_response.get("next_actions", []),
            "collaboration_opportunities": ai_response.get("collaboration_opportunities", []),
            "metadata": {
                **ai_response.get("metadata", {}),
                "tokens_used": total_tokens,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "remaining_tokens": usage_result.get("remaining", "unlimited"),
                "usage_tracked": usage_result["success"],
                "enhanced_processing": True
            },
            "conversation_id": message_data.conversation_id or conversation_data["_id"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Enhanced AI chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Enhanced AI service error: {str(e)}")

@router.get("/enhanced-models")
async def get_enhanced_models():
    """Get available models with enhanced information"""
    try:
        models = await enhanced_ai_service.get_available_models()
        
        return {
            "models": models,
            "total": len(models),
            "enhanced_features": True,
            "provider": "Groq",
            "capabilities": {
                "multi_agent_coordination": True,
                "context_aware_responses": True,
                "smart_suggestions": True,
                "collaboration_detection": True,
                "performance_optimized": True
            }
        }
    except Exception as e:
        logger.error(f"Failed to get enhanced models: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve enhanced models")

@router.get("/enhanced-agents")
async def get_enhanced_agents():
    """Get available agents with enhanced capabilities"""
    try:
        agents = await enhanced_ai_service.get_enhanced_agents()
        
        return {
            "agents": agents,
            "total": len(agents),
            "features": {
                "intelligent_handoffs": True,
                "specialized_expertise": True,
                "collaboration_aware": True,
                "context_preservation": True,
                "smart_routing": True
            }
        }
    except Exception as e:
        logger.error(f"Failed to get enhanced agents: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve enhanced agents")

@router.post("/agent-handoff")
async def request_agent_handoff(
    handoff_request: AgentHandoffRequest,
    current_user: User = Depends(get_current_user)
):
    """Request intelligent agent handoff"""
    try:
        # Get conversation from database
        db = await get_database()
        conversation = await db.conversations.find_one({
            "_id": handoff_request.conversation_id,
            "user_id": str(current_user.id)
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Create handoff message
        handoff_message = f"Please hand off this conversation to the {handoff_request.to_agent} agent."
        if handoff_request.context:
            handoff_message += f" Additional context: {handoff_request.context}"
        
        # Process handoff with enhanced AI service
        ai_response = await enhanced_ai_service.process_enhanced_message(
            message=handoff_message,
            agent=handoff_request.from_agent,
            user_id=str(current_user.id),
            conversation_id=handoff_request.conversation_id
        )
        
        # Update conversation with handoff
        await db.conversations.update_one(
            {"_id": handoff_request.conversation_id},
            {
                "$push": {
                    "messages": {
                        "id": f"handoff_{uuid.uuid4().hex[:12]}",
                        "content": ai_response["response"],
                        "sender": "assistant",
                        "timestamp": datetime.utcnow(),
                        "agent": ai_response.get("agent", handoff_request.to_agent),
                        "handoff": True,
                        "from_agent": handoff_request.from_agent,
                        "to_agent": handoff_request.to_agent
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {
            "success": True,
            "message": "Agent handoff completed successfully",
            "new_agent": ai_response.get("agent", handoff_request.to_agent),
            "response": ai_response["response"],
            "capabilities": ai_response.get("metadata", {}).get("agent_specialties", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Agent handoff error: {e}")
        raise HTTPException(status_code=500, detail="Agent handoff failed")

@router.get("/conversation-analytics")
async def get_conversation_analytics(
    current_user: User = Depends(get_current_user),
    timeframe: str = "week"
):
    """Get enhanced conversation analytics"""
    try:
        # Get analytics from enhanced AI service
        analytics = await enhanced_ai_service.get_conversation_analytics(str(current_user.id))
        
        # Get additional analytics from database
        db = await get_database()
        
        # Calculate timeframe filter
        from datetime import timedelta
        now = datetime.utcnow()
        if timeframe == "day":
            since = now - timedelta(days=1)
        elif timeframe == "week":
            since = now - timedelta(weeks=1)
        elif timeframe == "month":
            since = now - timedelta(days=30)
        else:
            since = now - timedelta(weeks=1)
        
        # Get recent conversations
        recent_conversations = await db.conversations.find({
            "user_id": str(current_user.id),
            "created_at": {"$gte": since}
        }).to_list(length=100)
        
        # Analyze conversation patterns
        agent_performance = {}
        total_enhanced = 0
        
        for conv in recent_conversations:
            if conv.get("enhanced", False):
                total_enhanced += 1
            
            for message in conv.get("messages", []):
                if message.get("sender") == "assistant":
                    agent = message.get("agent", "unknown")
                    if agent not in agent_performance:
                        agent_performance[agent] = {
                            "messages": 0,
                            "avg_confidence": 0,
                            "suggestions_given": 0,
                            "handoffs": 0
                        }
                    
                    agent_performance[agent]["messages"] += 1
                    
                    # Analyze metadata if available
                    metadata = message.get("metadata", {})
                    if "confidence" in metadata:
                        agent_performance[agent]["avg_confidence"] += metadata["confidence"]
                    
                    enhanced_features = metadata.get("enhanced_features", {})
                    if "suggestions" in enhanced_features:
                        agent_performance[agent]["suggestions_given"] += len(enhanced_features["suggestions"])
                    
                    if message.get("handoff", False):
                        agent_performance[agent]["handoffs"] += 1
        
        # Calculate averages
        for agent, perf in agent_performance.items():
            if perf["messages"] > 0:
                perf["avg_confidence"] = perf["avg_confidence"] / perf["messages"]
        
        return {
            "timeframe": timeframe,
            "summary": {
                "total_conversations": len(recent_conversations),
                "enhanced_conversations": total_enhanced,
                "enhancement_rate": total_enhanced / len(recent_conversations) if recent_conversations else 0,
                **analytics
            },
            "agent_performance": agent_performance,
            "insights": [
                f"You've had {len(recent_conversations)} conversations in the last {timeframe}",
                f"{total_enhanced} conversations used enhanced AI features",
                f"Most active agent: {analytics.get('most_used_agent', 'N/A')}" if analytics.get('most_used_agent') else "No conversations yet"
            ]
        }
        
    except Exception as e:
        logger.error(f"Conversation analytics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversation analytics")

@router.get("/smart-suggestions/{conversation_id}")
async def get_smart_suggestions(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get smart suggestions for a conversation"""
    try:
        db = await get_database()
        
        conversation = await db.conversations.find_one({
            "_id": conversation_id,
            "user_id": str(current_user.id)
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get latest messages
        messages = conversation.get("messages", [])
        if not messages:
            return {"suggestions": [], "message": "No messages to analyze"}
        
        latest_message = messages[-1] if messages else None
        
        # Generate contextual suggestions
        suggestions = []
        
        if latest_message:
            message_content = latest_message.get("content", "")
            agent = latest_message.get("agent", "developer")
            
            # Get suggestions from enhanced AI service
            ai_suggestions = await enhanced_ai_service._generate_smart_suggestions(
                message_content, agent, message_content
            )
            suggestions.extend(ai_suggestions)
        
        # Add conversation-level suggestions
        suggestions.extend([
            {"type": "export", "text": "Export conversation", "action": "export_conversation"},
            {"type": "share", "text": "Share insights", "action": "share_insights"},
            {"type": "continue", "text": "Continue discussion", "action": "continue_chat"}
        ])
        
        return {
            "conversation_id": conversation_id,
            "suggestions": suggestions[:8],  # Limit to 8 suggestions
            "context": {
                "message_count": len(messages),
                "latest_agent": latest_message.get("agent") if latest_message else None,
                "enhanced": conversation.get("enhanced", False)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Smart suggestions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate smart suggestions")

@router.get("/collaboration-insights")
async def get_collaboration_insights(
    current_user: User = Depends(get_current_user),
    project_id: Optional[str] = None
):
    """Get insights about multi-agent collaboration patterns"""
    try:
        db = await get_database()
        
        # Build query
        query = {"user_id": str(current_user.id)}
        if project_id:
            query["project_id"] = project_id
        
        # Get conversations with collaboration data
        conversations = await db.conversations.find(query).limit(50).to_list(length=50)
        
        # Analyze collaboration patterns
        agent_collaborations = {}
        handoff_frequency = {}
        successful_handoffs = 0
        total_handoffs = 0
        
        for conv in conversations:
            messages = conv.get("messages", [])
            current_agent = None
            
            for message in messages:
                if message.get("sender") == "assistant":
                    agent = message.get("agent", "unknown")
                    
                    # Track agent transitions
                    if current_agent and current_agent != agent:
                        # This is a handoff
                        total_handoffs += 1
                        if message.get("handoff", False):
                            successful_handoffs += 1
                        
                        collab_key = f"{current_agent}->{agent}"
                        handoff_frequency[collab_key] = handoff_frequency.get(collab_key, 0) + 1
                    
                    current_agent = agent
                    
                    # Analyze collaboration opportunities
                    collab_opps = message.get("metadata", {}).get("enhanced_features", {}).get("collaboration_opportunities", [])
                    for opp in collab_opps:
                        opp_agent = opp.get("agent")
                        if opp_agent:
                            if agent not in agent_collaborations:
                                agent_collaborations[agent] = {}
                            agent_collaborations[agent][opp_agent] = agent_collaborations[agent].get(opp_agent, 0) + 1
        
        # Generate insights
        insights = []
        if total_handoffs > 0:
            handoff_success_rate = successful_handoffs / total_handoffs
            insights.append(f"Agent handoff success rate: {handoff_success_rate:.1%}")
        
        if handoff_frequency:
            most_common_handoff = max(handoff_frequency.items(), key=lambda x: x[1])
            insights.append(f"Most common collaboration: {most_common_handoff[0]} ({most_common_handoff[1]} times)")
        
        if agent_collaborations:
            insights.append(f"Active collaboration patterns detected across {len(agent_collaborations)} agents")
        
        return {
            "project_id": project_id,
            "collaboration_summary": {
                "total_conversations_analyzed": len(conversations),
                "total_handoffs": total_handoffs,
                "successful_handoffs": successful_handoffs,
                "handoff_success_rate": successful_handoffs / total_handoffs if total_handoffs > 0 else 0
            },
            "handoff_patterns": handoff_frequency,
            "collaboration_opportunities": agent_collaborations,
            "insights": insights,
            "recommendations": [
                "Consider using multi-agent collaboration for complex tasks",
                "Developer and Designer agents work well together",
                "QA agents provide valuable testing insights"
            ]
        }
        
    except Exception as e:
        logger.error(f"Collaboration insights error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve collaboration insights")