from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from models.user import User
from models.conversation import Conversation, Message, MessageRole, MessageType, ConversationCreate
from models.database import get_database
from routes.auth import get_current_user
from services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: Dict[str, Any]
    conversation_id: str
    message_id: str

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message to AI and get response"""
    db = await get_database()
    
    # Get or create conversation
    if request.conversation_id:
        conversation = await db.conversations.find_one({
            "_id": request.conversation_id,
            "user_id": str(current_user.id)
        })
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Create new conversation
        conversation_data = {
            "user_id": str(current_user.id),
            "title": request.message[:50] + "..." if len(request.message) > 50 else request.message,
            "messages": [],
            "context": request.context or {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.conversations.insert_one(conversation_data)
        conversation_data["_id"] = str(result.inserted_id)
        conversation = conversation_data
    
    # Add user message
    user_message = Message(
        role=MessageRole.USER,
        content=request.message,
        type=MessageType.TEXT,
        timestamp=datetime.utcnow()
    )
    
    # Process AI response
    ai_response = await ai_service.process_message(
        request.message, 
        {
            **conversation.get("context", {}),
            **(request.context or {}),
            "conversation_history": conversation.get("messages", [])
        }
    )
    
    # Create AI message
    ai_message = Message(
        role=MessageRole.ASSISTANT,
        content=ai_response.get("content", ""),
        type=MessageType(ai_response.get("type", "text")),
        metadata=ai_response.get("metadata", {}),
        timestamp=datetime.utcnow()
    )
    
    # Update conversation
    await db.conversations.update_one(
        {"_id": conversation["_id"]},
        {
            "$push": {
                "messages": {
                    "$each": [user_message.dict(), ai_message.dict()]
                }
            },
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return ChatResponse(
        response=ai_response,
        conversation_id=str(conversation["_id"]),
        message_id=str(ai_message.timestamp)
    )

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """Get user's conversations"""
    db = await get_database()
    
    conversations = await db.conversations.find(
        {"user_id": str(current_user.id)}
    ).sort("updated_at", -1).skip(offset).limit(limit).to_list(length=limit)
    
    # Convert ObjectId to string
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    
    return {"conversations": conversations}

@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific conversation"""
    db = await get_database()
    
    conversation = await db.conversations.find_one({
        "_id": conversation_id,
        "user_id": str(current_user.id)
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation["_id"] = str(conversation["_id"])
    return conversation

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation"""
    db = await get_database()
    
    result = await db.conversations.delete_one({
        "_id": conversation_id,
        "user_id": str(current_user.id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"message": "Conversation deleted successfully"}

@router.post("/conversations")
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation"""
    db = await get_database()
    
    conversation_data = {
        "user_id": str(current_user.id),
        "title": conversation.title,
        "project_id": conversation.project_id,
        "messages": [],
        "context": {},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.conversations.insert_one(conversation_data)
    conversation_data["_id"] = str(result.inserted_id)
    
    return conversation_data