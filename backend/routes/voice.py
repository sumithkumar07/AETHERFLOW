from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
import logging
from datetime import datetime

from services.voice_interface import VoiceInterface
from models.user import get_current_user

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter()

# Global voice interface instance
voice_interface = None

def set_voice_interface(interface: VoiceInterface):
    """Set the voice interface instance"""
    global voice_interface
    voice_interface = interface

@router.post("/process-voice")
async def process_voice_command(
    text_input: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Process voice command via text input"""
    try:
        if not voice_interface:
            raise HTTPException(status_code=503, detail="Voice interface not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        if not text_input:
            raise HTTPException(status_code=400, detail="Text input is required")
        
        # Process the command
        result = await voice_interface.process_voice_command(
            text_input=text_input,
            user_id=user_id
        )
        
        return {
            "success": True,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing voice command: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/process-audio")
async def process_audio_command(
    audio_file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Process voice command via audio file"""
    try:
        if not voice_interface:
            raise HTTPException(status_code=503, detail="Voice interface not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        # Validate audio file
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Invalid audio file format")
        
        # Read audio data
        audio_data = await audio_file.read()
        
        if len(audio_data) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")
        
        # Process the audio command
        result = await voice_interface.process_voice_command(
            audio_data=audio_data,
            user_id=user_id
        )
        
        return {
            "success": True,
            "result": result,
            "audio_processed": True,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing audio command: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/conversation-history")
async def get_conversation_history(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get conversation history for current user"""
    try:
        if not voice_interface:
            raise HTTPException(status_code=503, detail="Voice interface not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        history = await voice_interface.get_conversation_history(user_id)
        
        return {
            "success": True,
            "history": history,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/conversation-history")
async def clear_conversation_history(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Clear conversation history for current user"""
    try:
        if not voice_interface:
            raise HTTPException(status_code=503, detail="Voice interface not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        await voice_interface.clear_conversation_history(user_id)
        
        return {
            "success": True,
            "message": "Conversation history cleared",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing conversation history: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/voice-capabilities")
async def get_voice_capabilities():
    """Get voice interface capabilities and available commands"""
    try:
        capabilities = {
            "supported_intents": [
                {
                    "intent": "create_project",
                    "description": "Create a new project",
                    "examples": [
                        "Create a new React project",
                        "Build a Node.js application",
                        "Start a Python project called MyApp"
                    ]
                },
                {
                    "intent": "search_templates",
                    "description": "Search for project templates",
                    "examples": [
                        "Show me templates",
                        "Find React templates",
                        "Browse e-commerce templates"
                    ]
                },
                {
                    "intent": "deploy_app",
                    "description": "Deploy application",
                    "examples": [
                        "Deploy my app",
                        "Publish to production",
                        "Launch my application"
                    ]
                },
                {
                    "intent": "ai_chat",
                    "description": "Chat with AI assistant",
                    "examples": [
                        "Help me build a login form",
                        "Generate API code",
                        "Explain this error"
                    ]
                },
                {
                    "intent": "get_integrations",
                    "description": "Browse available integrations",
                    "examples": [
                        "Show integrations",
                        "Find payment integrations",
                        "Connect to Stripe"
                    ]
                },
                {
                    "intent": "project_status",
                    "description": "Check project status",
                    "examples": [
                        "Project status",
                        "How is my project doing",
                        "Check my applications"
                    ]
                },
                {
                    "intent": "help",
                    "description": "Get help and tutorials",
                    "examples": [
                        "Help",
                        "What can you do",
                        "Show me tutorials"
                    ]
                }
            ],
            "supported_audio_formats": [
                "audio/wav",
                "audio/mp3",
                "audio/webm",
                "audio/ogg"
            ],
            "max_audio_duration": "60 seconds",
            "max_audio_size": "10MB",
            "voice_enabled": voice_interface.voice_enabled if voice_interface else False
        }
        
        return {
            "success": True,
            "capabilities": capabilities,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting voice capabilities: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/toggle-voice")
async def toggle_voice_processing(
    enabled: bool,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Enable or disable voice processing"""
    try:
        if not voice_interface:
            raise HTTPException(status_code=503, detail="Voice interface not available")
        
        voice_interface.set_voice_enabled(enabled)
        
        return {
            "success": True,
            "voice_enabled": enabled,
            "message": f"Voice processing {'enabled' if enabled else 'disabled'}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error toggling voice processing: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")