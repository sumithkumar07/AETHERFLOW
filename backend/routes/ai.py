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
    """Chat with local Ollama AI agent"""
    try:
        logger.info(f"Processing local AI chat request from user {current_user.id}")
        
        # Generate unique message ID
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        # Process with local AI service
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
        logger.error(f"Local AI chat error: {e}")
        raise HTTPException(status_code=500, detail="Local AI service error")

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
    """Get available local AI models"""
    try:
        model_status = await ai_service.get_model_status()
        
        return {
            "models": [
                {
                    "id": "codellama:13b",
                    "name": "CodeLlama 13B",
                    "provider": "Meta (Local)",
                    "description": "Specialized for code generation, debugging, and software architecture",
                    "capabilities": ["code", "debugging", "architecture", "best-practices"],
                    "speed": "medium",
                    "quality": "highest",
                    "cost": "free",
                    "size": "13B",
                    "type": "coding",
                    "unlimited": True,
                    "local": True,
                    "available": model_status["models"].get("codellama:13b", {}).get("available", False)
                },
                {
                    "id": "llama3.1:8b", 
                    "name": "LLaMA 3.1 8B",
                    "provider": "Meta (Local)",
                    "description": "Excellent general-purpose model for various tasks",
                    "capabilities": ["general", "analysis", "creative", "reasoning"],
                    "speed": "fast",
                    "quality": "high",
                    "cost": "free",
                    "size": "8B",
                    "type": "general",
                    "unlimited": True,
                    "local": True,
                    "available": model_status["models"].get("llama3.1:8b", {}).get("available", False)
                },
                {
                    "id": "deepseek-coder:6.7b",
                    "name": "DeepSeek Coder 6.7B",
                    "provider": "DeepSeek (Local)",
                    "description": "Fast responses for quick coding tasks and completion",
                    "capabilities": ["code", "completion", "quick-fixes", "snippets"],
                    "speed": "fastest",
                    "quality": "high",
                    "cost": "free",
                    "size": "6.7B",
                    "type": "coding-fast",
                    "unlimited": True,
                    "local": True,
                    "available": model_status["models"].get("deepseek-coder:6.7b", {}).get("available", False)
                }
            ],
            "status": model_status,
            "total": len(model_status["models"]),
            "unlimited_usage": True,
            "local_processing": True
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
    """Get available AI agents optimized for local models"""
    return {
        "agents": [
            {
                "id": "developer",
                "name": "Developer Agent",
                "icon": "💻",
                "description": "Expert in coding, debugging, and software architecture using CodeLlama",
                "capabilities": ["Full-stack development", "Code review", "Architecture", "Debugging"],
                "recommended_model": "codellama:13b",
                "unlimited": True,
                "local": True
            },
            {
                "id": "designer",
                "name": "Designer Agent", 
                "icon": "🎨",
                "description": "UI/UX design specialist with modern design principles using LLaMA",
                "capabilities": ["UI/UX Design", "Design Systems", "User Research", "Prototyping"],
                "recommended_model": "llama3.1:8b",
                "unlimited": True,
                "local": True
            },
            {
                "id": "tester",
                "name": "QA Agent",
                "icon": "🧪", 
                "description": "Quality assurance and testing specialist using CodeLlama",
                "capabilities": ["Test Strategy", "Automation", "Bug Analysis", "Performance Testing"],
                "recommended_model": "codellama:13b",
                "unlimited": True,
                "local": True
            },
            {
                "id": "integrator",
                "name": "Integration Agent",
                "icon": "🔗",
                "description": "Third-party integration and API specialist using CodeLlama", 
                "capabilities": ["API Integration", "Third-party Services", "Data Migration", "System Architecture"],
                "recommended_model": "codellama:13b",
                "unlimited": True,
                "local": True
            },
            {
                "id": "analyst",
                "name": "Business Analyst",
                "icon": "📊",
                "description": "Business requirements and data analysis expert using LLaMA",
                "capabilities": ["Requirements Analysis", "Data Analysis", "Process Optimization", "Reporting"],
                "recommended_model": "llama3.1:8b",
                "unlimited": True,
                "local": True
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
    """Get AI service status"""
    try:
        model_status = await ai_service.get_model_status()
        
        return {
            "service": "Local Ollama AI",
            "status": "online" if model_status.get("ollama_connected", False) else "offline",
            "unlimited": True,
            "local": True,
            "privacy": "complete",
            "cost": "free",
            "models": model_status,
            "features": {
                "unlimited_usage": True,
                "offline_capable": True,
                "private_processing": True,
                "no_api_costs": True,
                "multi_agent_support": True
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