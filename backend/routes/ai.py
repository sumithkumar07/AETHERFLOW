from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging

from models.user import User
from models.database import get_database
from routes.auth import get_current_user
from services.ai_service import AIService
from middleware.usage_tracking import get_chat_usage_dependency, estimate_tokens, estimate_response_tokens

router = APIRouter()
ai_service = AIService()
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str
    model: Optional[str] = "codellama:13b"
    agent: Optional[str] = "developer"
    project_id: Optional[str] = None
    conversation_id: Optional[str] = None
    context: Optional[List[Dict]] = []
    agent_prompt: Optional[str] = None
    enhanced_features: Optional[Dict] = {}

class ConversationCreate(BaseModel):
    title: str
    project_id: Optional[str] = None

@router.post("/chat")
async def chat_with_ai(
    message_data: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    """Chat with ultra-fast Groq AI agent"""
    try:
        logger.info(f"Processing Groq AI chat request from user {current_user.id}")
        
        # Generate unique message ID
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        # Process with Groq AI service (ultra-fast responses)
        ai_response = await ai_service.process_message(
            message=message_data.message,
            model=message_data.model,
            agent=message_data.agent,
            context=message_data.context,
            user_id=str(current_user.id),
            project_id=message_data.project_id
        )
        
        # Save conversation to database
        db = await get_database()
        
        conversation_data = {
            "_id": f"conv_{uuid.uuid4().hex[:12]}",
            "user_id": str(current_user.id),
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
                    "agent": message_data.agent,
                    "metadata": ai_response.get("metadata", {})
                }
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert or update conversation
        if message_data.conversation_id:
            await db.conversations.update_one(
                {"_id": message_data.conversation_id, "user_id": str(current_user.id)},
                {
                    "$push": {"messages": conversation_data["messages"]},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        else:
            await db.conversations.insert_one(conversation_data)
        
        return {
            "response": ai_response["response"],
            "model_used": ai_response.get("model_used", message_data.model),
            "agent": message_data.agent,
            "confidence": ai_response.get("confidence", 0.95),
            "suggestions": ai_response.get("suggestions", []),
            "usage": ai_response.get("usage", {}),
            "conversation_id": conversation_data["_id"],
            "metadata": ai_response.get("metadata", {})
        }
        
    except Exception as e:
        logger.error(f"Groq AI chat error: {e}")
        raise HTTPException(status_code=500, detail="Groq AI service error")

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    project_id: Optional[str] = None,
    limit: int = 20
):
    """Get user conversations"""
    try:
        db = await get_database()
        
        query = {"user_id": str(current_user.id)}
        if project_id:
            query["project_id"] = project_id
        
        conversations_cursor = db.conversations.find(query).sort("updated_at", -1).limit(limit)
        conversations = await conversations_cursor.to_list(length=limit)
        
        # Get messages from latest conversation for immediate display
        messages = []
        if conversations and not project_id:
            latest_conversation = conversations[0]
            messages = latest_conversation.get("messages", [])
        elif project_id:
            # Get all messages for this project
            project_conversations = [conv for conv in conversations if conv.get("project_id") == project_id]
            if project_conversations:
                messages = project_conversations[0].get("messages", [])
        
        return {
            "conversations": conversations,
            "messages": messages,
            "total": len(conversations)
        }
        
    except Exception as e:
        logger.error(f"Conversations fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversations")

@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific conversation"""
    try:
        db = await get_database()
        
        conversation = await db.conversations.find_one({
            "_id": conversation_id,
            "user_id": str(current_user.id)
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Conversation fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversation")

@router.post("/conversations")
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new conversation"""
    try:
        db = await get_database()
        
        conversation = {
            "_id": f"conv_{uuid.uuid4().hex[:12]}",
            "user_id": str(current_user.id),
            "project_id": conversation_data.project_id,
            "title": conversation_data.title,
            "messages": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.conversations.insert_one(conversation)
        
        return conversation
        
    except Exception as e:
        logger.error(f"Conversation creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation")

@router.get("/models")
async def get_available_models():
    """Get available Groq AI models with cost information"""
    try:
        # Get models from the new Groq service
        models = await ai_service.get_available_models()
        model_status = await ai_service.get_model_status()
        
        return {
            "models": models,
            "status": model_status,
            "total": len(models),
            "ultra_fast": True,
            "cloud_based": True,
            "cost_optimized": True,
            "provider": "Groq",
            "features": {
                "ultra_fast_inference": True,
                "smart_cost_routing": True,
                "multiple_models": True,
                "enterprise_reliability": True,
                "generous_free_tier": True
            }
        }
    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        return {
            "models": [],
            "status": {"error": str(e)},
            "total": 0,
            "unlimited_usage": True,
            "local_processing": True
        }

@router.get("/agents")
async def get_available_agents():
    """Get available AI agents optimized for Groq models"""
    return {
        "agents": [
            {
                "id": "developer",
                "name": "Developer Agent",
                "icon": "💻",
                "description": "Expert in coding, debugging, and software architecture using ultra-fast Groq AI",
                "capabilities": ["Full-stack development", "Code review", "Architecture", "Debugging"],
                "recommended_model": "llama-3.1-70b-versatile",
                "ultra_fast": True,
                "cloud_based": True,
                "cost_optimized": True
            },
            {
                "id": "designer",
                "name": "Designer Agent", 
                "icon": "🎨",
                "description": "UI/UX design specialist with modern design principles using Groq AI",
                "capabilities": ["UI/UX Design", "Design Systems", "User Research", "Prototyping"],
                "recommended_model": "llama-3.1-8b-instant",
                "ultra_fast": True,
                "cloud_based": True,
                "cost_optimized": True
            },
            {
                "id": "tester",
                "name": "QA Agent",
                "icon": "🧪", 
                "description": "Quality assurance and testing specialist using ultra-fast Groq AI",
                "capabilities": ["Test Strategy", "Automation", "Bug Analysis", "Performance Testing"],
                "recommended_model": "llama-3.1-70b-versatile",
                "ultra_fast": True,
                "cloud_based": True,
                "cost_optimized": True
            },
            {
                "id": "integrator",
                "name": "Integration Agent",
                "icon": "🔗",
                "description": "Third-party integration and API specialist using Groq AI", 
                "capabilities": ["API Integration", "Third-party Services", "Data Migration", "System Architecture"],
                "recommended_model": "llama-3.1-70b-versatile",
                "ultra_fast": True,
                "cloud_based": True,
                "cost_optimized": True
            },
            {
                "id": "analyst",
                "name": "Business Analyst",
                "icon": "📊",
                "description": "Business requirements and data analysis expert using Groq AI",
                "capabilities": ["Requirements Analysis", "Data Analysis", "Process Optimization", "Reporting"],
                "recommended_model": "mixtral-8x7b-32768",
                "ultra_fast": True,
                "cloud_based": True,
                "cost_optimized": True
            }
        ]
    }

@router.post("/models/{model_name}/download")
async def download_model(
    model_name: str,
    current_user: User = Depends(get_current_user)
):
    """Download a specific model"""
    try:
        result = await ai_service.download_model(model_name)
        return result
    except Exception as e:
        logger.error(f"Model download error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download model: {str(e)}")

@router.get("/status")
async def get_ai_status():
    """Get Groq AI service status"""
    try:
        model_status = await ai_service.get_model_status()
        usage_stats = ai_service.get_usage_stats()
        
        return {
            "service": "Groq AI",
            "status": "online" if model_status.get("groq_connected", False) else "offline", 
            "ultra_fast": True,
            "cloud_based": True,
            "cost_optimized": True,
            "provider": "Groq",
            "models": model_status,
            "usage": usage_stats,
            "features": {
                "ultra_fast_inference": True,
                "smart_cost_routing": True,
                "generous_free_tier": True,
                "enterprise_reliability": True,
                "multiple_model_support": True,
                "real_time_streaming": True,
                "cost_effective": True,
                "no_infrastructure_needed": True
            },
            "benefits": {
                "speed": "10x faster than competitors",
                "cost": "80%+ savings vs alternatives", 
                "reliability": "Enterprise-grade uptime",
                "scalability": "Handles unlimited concurrent users"
            }
        }
    except Exception as e:
        logger.error(f"Status check error: {e}")
        return {
            "service": "Local Ollama AI",
            "status": "error",
            "error": str(e),
            "unlimited": True,
            "local": True
        }