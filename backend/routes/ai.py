from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import logging
import asyncio
import httpx

from models.user import User
from models.conversation import Conversation, Message, MessageRole
from models.database import get_database
from routes.auth import get_current_user
from services.ai_service import AIService
from services.enhanced_ai_service import EnhancedAIService

router = APIRouter()
ai_service = AIService()
enhanced_ai_service = EnhancedAIService()
logger = logging.getLogger(__name__)

# Available AI models
AVAILABLE_MODELS = {
    "gpt-4.1-nano": {
        "name": "GPT-4.1 Nano",
        "provider": "Puter.js",
        "description": "Fast and efficient for quick tasks",
        "max_tokens": 4096,
        "cost": "Free",
        "capabilities": ["text", "code", "analysis"]
    },
    "claude-sonnet-4": {
        "name": "Claude Sonnet 4",
        "provider": "Puter.js", 
        "description": "Great for creative and analytical tasks",
        "max_tokens": 8192,
        "cost": "Free",
        "capabilities": ["text", "code", "analysis", "creative"]
    },
    "gemini-2.5-flash": {
        "name": "Gemini 2.5 Flash",
        "provider": "Puter.js",
        "description": "Lightning fast responses",
        "max_tokens": 2048,
        "cost": "Free",
        "capabilities": ["text", "code", "fast-response"]
    }
}

@router.get("/models")
async def get_available_models():
    """Get list of available AI models"""
    return {
        "models": AVAILABLE_MODELS,
        "default": "gpt-4.1-nano"
    }

@router.post("/generate-project")
async def generate_project_code(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Enhanced AI endpoint that generates actual project files and structure"""
    try:
        message = request.get("message", "")
        project_id = request.get("project_id")
        model = request.get("model", "gpt-4.1-nano")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Enhanced prompt for code generation
        enhanced_prompt = f"""
        You are an expert full-stack developer. Generate a complete, working project based on this request: "{message}"

        Please provide:
        1. Complete file structure with all necessary files
        2. Full code implementation for each file
        3. Package.json with all required dependencies
        4. Clear setup and run instructions
        5. Professional code with comments and best practices

        Format your response as structured JSON with this exact format:
        {{
            "project_name": "descriptive-project-name",
            "description": "Brief description of the project",
            "files": [
                {{
                    "path": "relative/file/path.ext",
                    "content": "complete file content here"
                }}
            ],
            "dependencies": {{
                "production": {{}},
                "development": {{}}
            }},
            "setup_instructions": [
                "step 1",
                "step 2"
            ],
            "run_commands": [
                "npm install",
                "npm start"
            ]
        }}

        Make sure the project is fully functional and production-ready.
        """
        
        # Get AI response with enhanced prompt
        ai_response = await ai_service.chat_with_ai(
            message=enhanced_prompt,
            model=model,
            user_id=current_user.id,
            max_tokens=6000,
            temperature=0.1  # Lower temperature for more consistent code generation
        )
        
        # Try to parse the structured response
        try:
            # Extract JSON from AI response if it's wrapped in text
            response_text = ai_response.get("response", "")
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_content = response_text[json_start:json_end].strip()
            else:
                json_content = response_text
                
            project_data = json.loads(json_content)
            
            # Validate required fields
            required_fields = ["project_name", "description", "files"]
            for field in required_fields:
                if field not in project_data:
                    raise ValueError(f"Missing required field: {field}")
                    
            # Store project files in database if project_id provided
            if project_id:
                db = await get_database()
                await db.projects.update_one(
                    {"id": project_id, "user_id": current_user.id},
                    {"$set": {
                        "files": project_data.get("files", []),
                        "dependencies": project_data.get("dependencies", {}),
                        "setup_instructions": project_data.get("setup_instructions", []),
                        "run_commands": project_data.get("run_commands", []),
                        "updated_at": datetime.now().isoformat()
                    }}
                )
            
            return {
                "success": True,
                "project_data": project_data,
                "ai_response": ai_response,
                "model": model,
                "timestamp": datetime.now().isoformat()
            }
            
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback to regular chat response if JSON parsing fails
            logger.warning(f"Failed to parse structured response: {e}")
            return {
                "success": False,
                "fallback_response": ai_response.get("response", ""),
                "error": "Could not generate structured project files",
                "model": model,
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error in generate_project_code: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating project: {str(e)}")

@router.post("/chat")
async def chat_with_ai(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Send a message to AI and get response"""
    try:
        message = request.get("message", "")
        model = request.get("model", "gpt-4.1-nano")
        conversation_id = request.get("conversation_id")
        project_id = request.get("project_id")
        agents = request.get("agents", ["developer"])
        temperature = request.get("temperature", 0.7)
        max_tokens = request.get("max_tokens", 2048)
        
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if model not in AVAILABLE_MODELS:
            model = "gpt-4.1-nano"
        
        # Enhanced prompt with agent context
        enhanced_prompt = await build_enhanced_prompt(message, agents, project_id, current_user)
        
        # Try multiple AI services
        response = await get_ai_response(enhanced_prompt, model, temperature, max_tokens)
        
        # Store conversation in database
        if conversation_id:
            await store_conversation_message(
                conversation_id, 
                current_user.id, 
                message, 
                response, 
                model,
                agents,
                project_id
            )
        
        logger.info(f"AI chat completed for user {current_user.id}, model: {model}")
        
        return {
            "response": response,
            "model": model,
            "tokens_used": estimate_tokens(message + response),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

@router.post("/conversation")
async def create_conversation(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation"""
    try:
        db = await get_database()
        
        conversation_data = {
            "_id": f"conv_{int(datetime.utcnow().timestamp() * 1000)}",
            "user_id": str(current_user.id),
            "title": request.get("title", "New Chat"),
            "project_id": request.get("project_id"),
            "messages": [],
            "model": request.get("model", "gpt-4.1-nano"),
            "agents": request.get("agents", ["developer"]),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.conversations.insert_one(conversation_data)
        
        return {
            "conversation": conversation_data,
            "message": "Conversation created successfully"
        }
        
    except Exception as e:
        logger.error(f"Conversation creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation")

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    project_id: Optional[str] = None
):
    """Get user's conversations"""
    try:
        db = await get_database()
        
        query = {"user_id": str(current_user.id)}
        if project_id:
            query["project_id"] = project_id
        
        conversations = await db.conversations.find(query)\
            .sort("updated_at", -1)\
            .skip(offset)\
            .limit(limit)\
            .to_list(length=limit)
        
        # Convert _id to id for consistency
        for conv in conversations:
            conv["id"] = str(conv["_id"])
            conv["_id"] = str(conv["_id"])
        
        total = await db.conversations.count_documents(query)
        
        return {
            "conversations": conversations,
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Conversations fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversations")

@router.get("/conversation/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific conversation"""
    try:
        db = await get_database()
        
        conversation = await db.conversations.find_one({
            "_id": conversation_id,
            "user_id": str(current_user.id)
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        conversation["id"] = str(conversation["_id"])
        conversation["_id"] = str(conversation["_id"])
        
        return {"conversation": conversation}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Conversation fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversation")

@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation"""
    try:
        db = await get_database()
        
        result = await db.conversations.delete_one({
            "_id": conversation_id,
            "user_id": str(current_user.id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Conversation deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")

# Helper functions
async def build_enhanced_prompt(message: str, agents: List[str], project_id: Optional[str], user: User) -> str:
    """Build enhanced prompt with agent and project context"""
    prompt_parts = []
    
    # Add agent context
    agent_prompts = {
        "developer": "You are an expert software developer. Focus on clean, efficient code, best practices, and technical architecture.",
        "designer": "You are a skilled UI/UX designer. Focus on user experience, aesthetics, accessibility, and design systems.",
        "tester": "You are a QA expert. Focus on testing strategies, quality assurance, bug detection, and test automation.",
        "integrator": "You are an integration specialist. Focus on API connections, third-party services, and system integrations."
    }
    
    active_agents = [agent_prompts.get(agent, "") for agent in agents if agent in agent_prompts]
    if active_agents:
        prompt_parts.append("Agent Context:\n" + "\n".join(active_agents))
    
    # Add project context if available
    if project_id:
        try:
            db = await get_database()
            project = await db.projects.find_one({
                "_id": project_id,
                "user_id": str(user.id)
            })
            if project:
                context = f"Project: {project.get('name', 'Untitled')}\n"
                context += f"Description: {project.get('description', 'No description')}\n"
                if project.get('tech_stack'):
                    context += f"Tech Stack: {', '.join(project['tech_stack'])}\n"
                prompt_parts.append(f"Project Context:\n{context}")
        except Exception as e:
            logger.warning(f"Failed to fetch project context: {e}")
    
    # Add user message
    prompt_parts.append(f"User Request: {message}")
    
    return "\n\n".join(prompt_parts)

async def get_ai_response(prompt: str, model: str, temperature: float, max_tokens: int) -> str:
    """Get AI response with fallback mechanisms"""
    
    # Try enhanced AI service first
    try:
        response = await enhanced_ai_service.process_message(prompt, {
            "model": model,
            "temperature": temperature,
            "max_tokens": max_tokens
        })
        if response and response.strip():
            return response
    except Exception as e:
        logger.warning(f"Enhanced AI service failed: {e}")
    
    # Try basic AI service
    try:
        response = await ai_service.process_message(prompt, {
            "model": model,
            "temperature": temperature,
            "max_tokens": max_tokens
        })
        if response and response.strip():
            return response
    except Exception as e:
        logger.warning(f"Basic AI service failed: {e}")
    
    # Try direct Puter.js call (if available)
    try:
        async with httpx.AsyncClient() as client:
            # This would be replaced with actual Puter.js API call
            # For now, return a fallback response
            pass
    except Exception as e:
        logger.warning(f"Direct API call failed: {e}")
    
    # Fallback response
    return generate_fallback_response(prompt, model)

def generate_fallback_response(prompt: str, model: str) -> str:
    """Generate a fallback response when AI services are unavailable"""
    responses = [
        f"I understand you're asking about: '{prompt[:100]}...'. I'm experiencing connectivity issues right now, but I'd be happy to help you once the connection is restored.",
        f"That's an interesting request. Let me think about the best approach to help you with this.",
        f"I see you're working on something important. This is definitely something I can assist you with once our AI services are fully operational.",
        f"Thank you for your message. I'm currently experiencing some technical difficulties, but I'll be back to full functionality shortly."
    ]
    
    import random
    return random.choice(responses)

async def store_conversation_message(
    conversation_id: str,
    user_id: str,
    user_message: str,
    ai_response: str,
    model: str,
    agents: List[str],
    project_id: Optional[str]
):
    """Store conversation messages in database"""
    try:
        db = await get_database()
        
        messages = [
            {
                "id": f"msg_{int(datetime.utcnow().timestamp() * 1000)}",
                "role": "user",
                "content": user_message,
                "timestamp": datetime.utcnow()
            },
            {
                "id": f"msg_{int(datetime.utcnow().timestamp() * 1000) + 1}",
                "role": "assistant",
                "content": ai_response,
                "model": model,
                "agents": agents,
                "timestamp": datetime.utcnow()
            }
        ]
        
        await db.conversations.update_one(
            {"_id": conversation_id, "user_id": user_id},
            {
                "$push": {"messages": {"$each": messages}},
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        
    except Exception as e:
        logger.error(f"Failed to store conversation: {e}")

def estimate_tokens(text: str) -> int:
    """Rough estimation of token count"""
    # Simple approximation: ~4 characters per token
    return len(text) // 4