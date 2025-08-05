# Enhanced AI Routes v2 with Advanced Multi-Agent Coordination
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
from services.enhanced_conversation_manager import EnhancedConversationManager
from services.intelligent_agent_coordinator import IntelligentAgentCoordinator
from middleware.usage_tracking import get_chat_usage_dependency, estimate_tokens, estimate_response_tokens

router = APIRouter()
enhanced_ai_service = EnhancedAIService()
conversation_manager = EnhancedConversationManager()
agent_coordinator = IntelligentAgentCoordinator()
logger = logging.getLogger(__name__)

class AdvancedChatMessage(BaseModel):
    message: str
    model: Optional[str] = "llama-3.1-70b-versatile"
    agent: Optional[str] = "developer"
    project_id: Optional[str] = None
    conversation_id: Optional[str] = None
    context: Optional[List[Dict]] = []
    preferences: Optional[Dict] = {}
    enable_coordination: Optional[bool] = True
    multi_agent_mode: Optional[bool] = False

class MultiAgentRequest(BaseModel):
    message: str
    task_complexity: Optional[str] = "auto"  # auto, simple, medium, complex
    preferred_agents: Optional[List[str]] = []
    project_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ConversationAnalysisRequest(BaseModel):
    conversation_id: str
    analysis_depth: Optional[str] = "standard"  # standard, deep, insights

@router.post("/advanced-chat")
async def advanced_ai_chat(
    message_data: AdvancedChatMessage,
    usage_info = Depends(get_chat_usage_dependency)
):
    """Advanced AI chat with enhanced conversation quality and intelligent coordination"""
    try:
        current_user = usage_info["user"]
        user_id = usage_info["user_id"]
        track_usage = usage_info["track_usage"]
        
        logger.info(f"Processing advanced AI chat from user {user_id}")
        
        # Estimate input tokens
        input_tokens = estimate_tokens(message_data.message)
        
        # Generate unique message ID
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        # Analyze task requirements for intelligent agent coordination
        task_req = await agent_coordinator.analyze_task_requirements(
            message_data.message,
            {"project_id": message_data.project_id, "conversation_id": message_data.conversation_id}
        )
        
        # Get agent recommendation
        agent_recommendation = await agent_coordinator.recommend_optimal_agent(task_req)
        
        # Determine if multi-agent coordination is needed
        if (message_data.enable_coordination and 
            (agent_recommendation["recommendation_type"] == "collaboration" or message_data.multi_agent_mode)):
            
            # Initialize multi-agent workflow
            agents = [agent_recommendation["primary_agent"]]
            if "collaborating_agents" in agent_recommendation:
                agents.extend(agent_recommendation["collaborating_agents"])
            
            coordination_plan = await agent_coordinator.coordinate_multi_agent_workflow(
                task_req, agents, message_data.message
            )
            
            # Process with primary agent first
            primary_response = await enhanced_ai_service.process_enhanced_message(
                message=message_data.message,
                agent=agent_recommendation["primary_agent"],
                context=message_data.context,
                user_id=user_id,
                project_id=message_data.project_id,
                conversation_id=message_data.conversation_id,
                model=message_data.model
            )
            
            # Enhance with coordination insights
            primary_response["multi_agent_coordination"] = {
                "coordination_active": True,
                "workflow_id": coordination_plan["workflow_id"],
                "recommended_agents": agents,
                "task_breakdown": coordination_plan["task_breakdown"],
                "next_phase": coordination_plan["execution_order"][0] if coordination_plan["execution_order"] else None
            }
            
            ai_response = primary_response
            
        else:
            # Single agent processing with enhanced capabilities
            selected_agent = message_data.agent
            if agent_recommendation["confidence"] > 0.8:
                selected_agent = agent_recommendation["primary_agent"]
            
            ai_response = await enhanced_ai_service.process_enhanced_message(
                message=message_data.message,
                agent=selected_agent,
                context=message_data.context,
                user_id=user_id,
                project_id=message_data.project_id,
                conversation_id=message_data.conversation_id,
                model=message_data.model
            )
            
            # Add agent recommendation insights
            ai_response["agent_recommendation"] = agent_recommendation
        
        # Enhance conversation context
        conversation_context = await conversation_manager.enhance_conversation_context(
            conversation_id=message_data.conversation_id or f"conv_{uuid.uuid4().hex[:12]}",
            message=message_data.message,
            response=ai_response["response"],
            agent=ai_response["agent"],
            user_id=user_id
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
                "agent": ai_response["agent"],
                "project_id": message_data.project_id,
                "advanced_features": True,
                "coordination_enabled": message_data.enable_coordination,
                "multi_agent": message_data.multi_agent_mode,
                "task_complexity": task_req.complexity,
                "agents_involved": len(ai_response.get("multi_agent_coordination", {}).get("recommended_agents", [ai_response["agent"]]))
            }
        )
        
        # Save enhanced conversation to database
        db = await get_database()
        
        conversation_data = {
            "_id": message_data.conversation_id or f"conv_{uuid.uuid4().hex[:12]}",
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
                            "collaboration_opportunities": ai_response.get("collaboration_opportunities", []),
                            "conversation_quality": conversation_context.get("complexity_level", "medium"),
                            "user_expertise": conversation_context.get("user_expertise", "intermediate")
                        },
                        "coordination": ai_response.get("multi_agent_coordination", {}),
                        "agent_recommendation": ai_response.get("agent_recommendation", {})
                    }
                }
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "enhanced_v2": True,
            "conversation_context": conversation_context
        }
        
        # Insert or update conversation
        if message_data.conversation_id:
            await db.conversations.update_one(
                {"_id": message_data.conversation_id, "user_id": user_id},
                {
                    "$push": {"messages": conversation_data["messages"]},
                    "$set": {
                        "updated_at": datetime.utcnow(), 
                        "enhanced_v2": True,
                        "conversation_context": conversation_context
                    }
                }
            )
        else:
            await db.conversations.insert_one(conversation_data)
        
        # Get conversation insights
        conversation_insights = await conversation_manager.get_conversation_insights(
            conversation_data["_id"]
        )
        
        return {
            "response": ai_response["response"],
            "agent": ai_response.get("agent", message_data.agent),
            "model_used": ai_response.get("model_used", message_data.model),
            "confidence": ai_response.get("confidence", 0.95),
            "suggestions": ai_response.get("suggestions", []),
            "agent_insights": ai_response.get("agent_insights", []),
            "next_actions": ai_response.get("next_actions", []),
            "collaboration_opportunities": ai_response.get("collaboration_opportunities", []),
            "agent_recommendation": ai_response.get("agent_recommendation", {}),
            "multi_agent_coordination": ai_response.get("multi_agent_coordination", {}),
            "conversation_quality": conversation_insights.get("conversation_quality", {}),
            "metadata": {
                **ai_response.get("metadata", {}),
                "tokens_used": total_tokens,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "remaining_tokens": usage_result.get("remaining", "unlimited"),
                "usage_tracked": usage_result["success"],
                "advanced_processing_v2": True,
                "task_analysis": {
                    "complexity": task_req.complexity,
                    "required_skills": task_req.required_skills,
                    "estimated_time": task_req.estimated_time,
                    "collaborative": task_req.collaborative,
                    "priority": task_req.priority
                }
            },
            "conversation_id": message_data.conversation_id or conversation_data["_id"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Advanced AI chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Advanced AI service error: {str(e)}")

@router.post("/multi-agent-chat")
async def multi_agent_chat(
    request: MultiAgentRequest,
    current_user: User = Depends(get_current_user)
):
    """Initiate multi-agent collaboration for complex tasks"""
    try:
        user_id = str(current_user.id)
        
        # Analyze task requirements
        task_req = await agent_coordinator.analyze_task_requirements(request.message)
        
        # Override complexity if specified
        if request.task_complexity != "auto":
            complexity_map = {"simple": 0.3, "medium": 0.6, "complex": 0.9}
            task_req.complexity = complexity_map.get(request.task_complexity, 0.6)
        
        # Get agent recommendations
        agent_recommendation = await agent_coordinator.recommend_optimal_agent(task_req)
        
        # Use preferred agents if specified
        agents = request.preferred_agents if request.preferred_agents else []
        if not agents:
            agents = [agent_recommendation["primary_agent"]]
            if "collaborating_agents" in agent_recommendation:
                agents.extend(agent_recommendation["collaborating_agents"])
        
        # Create coordination workflow
        coordination_plan = await agent_coordinator.coordinate_multi_agent_workflow(
            task_req, agents, request.message
        )
        
        return {
            "workflow_id": coordination_plan["workflow_id"],
            "agents_assigned": agents,
            "task_analysis": {
                "complexity": task_req.complexity,
                "required_skills": task_req.required_skills,
                "estimated_time": task_req.estimated_time,
                "priority": task_req.priority,
                "collaborative": task_req.collaborative
            },
            "coordination_plan": coordination_plan,
            "agent_recommendation": agent_recommendation,
            "next_steps": [
                f"Begin with {coordination_plan['execution_order'][0]['agents'][0]} agent",
                "Follow the coordination plan for optimal results",
                "Monitor progress through workflow status endpoint"
            ]
        }
        
    except Exception as e:
        logger.error(f"Multi-agent chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Multi-agent coordination error: {str(e)}")

@router.get("/coordination-status/{workflow_id}")
async def get_coordination_status(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get status of active multi-agent coordination"""
    try:
        status = await agent_coordinator.get_coordination_status(workflow_id)
        return status
        
    except Exception as e:
        logger.error(f"Coordination status error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get coordination status: {str(e)}")

@router.post("/conversation-analysis")
async def analyze_conversation(
    request: ConversationAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """Get deep analysis of conversation patterns and quality"""
    try:
        # Get conversation insights
        insights = await conversation_manager.get_conversation_insights(request.conversation_id)
        
        # Get suggested next actions
        next_actions = await conversation_manager.suggest_next_actions(request.conversation_id)
        
        return {
            "conversation_id": request.conversation_id,
            "analysis_depth": request.analysis_depth,
            "insights": insights,
            "suggested_actions": next_actions,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Conversation analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze conversation: {str(e)}")

@router.get("/intelligent-suggestions")
async def get_intelligent_suggestions(
    context: Optional[str] = None,
    agent: Optional[str] = "developer",
    complexity: Optional[str] = "medium",
    current_user: User = Depends(get_current_user)
):
    """Get intelligent suggestions based on context and user patterns"""
    try:
        user_id = str(current_user.id)
        
        # Get user preferences from conversation manager
        user_prefs = conversation_manager.user_preferences.get(user_id, {})
        
        # Generate contextual suggestions
        suggestions = []
        
        # Based on user's favorite topics
        favorite_topics = user_prefs.get("favorite_topics", {})
        if favorite_topics:
            top_topics = sorted(favorite_topics.items(), key=lambda x: x[1], reverse=True)[:3]
            for topic, _ in top_topics:
                suggestions.append({
                    "type": "topic_continuation",
                    "text": f"Continue exploring {topic}",
                    "category": "personalized",
                    "confidence": 0.8
                })
        
        # Agent-specific suggestions
        agent_suggestions = {
            "developer": [
                "Review and optimize existing code",
                "Implement new feature with best practices",
                "Set up automated testing",
                "Design scalable architecture"
            ],
            "designer": [
                "Create user-friendly interface design",
                "Improve accessibility and usability",
                "Design responsive mobile experience",
                "Develop design system"
            ],
            "tester": [
                "Create comprehensive test suite",
                "Analyze performance bottlenecks", 
                "Set up automated quality checks",
                "Review security vulnerabilities"
            ]
        }
        
        for suggestion_text in agent_suggestions.get(agent, agent_suggestions["developer"])[:3]:
            suggestions.append({
                "type": "agent_expertise",
                "text": suggestion_text,
                "category": f"{agent}_specialized",
                "confidence": 0.9
            })
        
        # Complexity-based suggestions
        if complexity == "complex":
            suggestions.append({
                "type": "collaboration",
                "text": "Consider multi-agent collaboration for comprehensive solution",
                "category": "coordination",
                "confidence": 0.85
            })
        
        return {
            "suggestions": suggestions[:6],  # Top 6 suggestions
            "user_context": {
                "expertise_level": conversation_manager._assess_user_expertise(user_id),
                "preferred_communication": user_prefs.get("communication_style", {}),
                "active_topics": list(favorite_topics.keys())[:5]
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Intelligent suggestions error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

@router.get("/agent-capabilities")
async def get_agent_capabilities():
    """Get detailed information about agent capabilities and specializations"""
    try:
        capabilities = {}
        
        for role, capability in agent_coordinator.agent_capabilities.items():
            capabilities[role.value] = {
                "name": capability.name,
                "confidence_level": capability.confidence_level,
                "specializations": capability.specializations,
                "collaboration_strength": [agent.value for agent in capability.collaboration_strength],
                "recommended_for": [],
                "enhanced_features": {
                    "context_awareness": True,
                    "learning_capability": True,
                    "multi_agent_coordination": True,
                    "intelligent_handoffs": True,
                    "performance_optimization": True
                }
            }
        
        # Add recommendations for each agent
        capabilities["developer"]["recommended_for"] = [
            "Code implementation and architecture",
            "Performance optimization",
            "API development",
            "Database design",
            "Security implementation"
        ]
        
        capabilities["designer"]["recommended_for"] = [
            "User interface design",
            "User experience optimization",
            "Design systems creation",
            "Accessibility improvements",
            "Responsive design"
        ]
        
        capabilities["tester"]["recommended_for"] = [
            "Quality assurance strategy",
            "Test automation",
            "Performance testing",
            "Security testing",
            "Bug analysis"
        ]
        
        capabilities["integrator"]["recommended_for"] = [
            "System integration",
            "Third-party API connections",
            "Data architecture", 
            "Microservices design",
            "DevOps pipeline setup"
        ]
        
        capabilities["analyst"]["recommended_for"] = [
            "Requirements analysis",
            "Business logic design",
            "Process optimization",
            "Data analysis",
            "Strategic planning"
        ]
        
        return {
            "agent_capabilities": capabilities,
            "total_agents": len(capabilities),
            "coordination_features": {
                "intelligent_task_analysis": True,
                "optimal_agent_selection": True,
                "multi_agent_workflows": True,
                "real_time_collaboration": True,
                "performance_monitoring": True
            }
        }
        
    except Exception as e:
        logger.error(f"Agent capabilities error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent capabilities: {str(e)}")