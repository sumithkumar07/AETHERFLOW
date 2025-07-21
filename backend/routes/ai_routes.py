"""
AI API Routes - PHASE 1: Enhanced AI Backend
Real-time code completion, review, debugging, documentation, vulnerability scanning
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import asyncio
import json
import uuid
from typing import Dict, Any

from services.ai_service import ai_service
from models.ai_models import (
    CodeCompletionRequest, CodeReviewRequest, DebugRequest,
    DocumentationRequest, VulnerabilityRequest, RefactorRequest,
    NLPToCodeRequest, ConversationRequest, AIResponse
)

router = APIRouter(prefix="/api/ai", tags=["AI Services"])

# Session storage for conversations
conversation_sessions: Dict[str, Dict] = {}

@router.post("/code-completion", response_model=AIResponse)
async def code_completion(request: CodeCompletionRequest):
    """
    Real-time code completion API (like GitHub Copilot)
    
    Features:
    - Context-aware code suggestions
    - Multiple completion options
    - Language-specific completions
    - Real-time performance optimized
    """
    try:
        response = await ai_service.code_completion(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code completion failed: {str(e)}")

@router.post("/code-review", response_model=AIResponse) 
async def code_review(request: CodeReviewRequest):
    """
    AI code review & security analysis
    
    Features:
    - Security vulnerability detection
    - Performance analysis
    - Best practice recommendations
    - Code quality assessment
    """
    try:
        response = await ai_service.code_review(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code review failed: {str(e)}")

@router.post("/debug-assistance", response_model=AIResponse)
async def debug_assistance(request: DebugRequest):
    """
    Smart debugging assistance
    
    Features:
    - Error analysis and explanation
    - Bug detection and suggestions
    - Step-by-step debugging guidance
    - Context-aware problem solving
    """
    try:
        response = await ai_service.debug_assistance(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug assistance failed: {str(e)}")

@router.post("/generate-docs", response_model=AIResponse)
async def generate_documentation(request: DocumentationRequest):
    """
    Automated documentation generation
    
    Features:
    - Function/class documentation
    - API documentation
    - Code comments generation
    - Usage examples
    """
    try:
        response = await ai_service.generate_documentation(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Documentation generation failed: {str(e)}")

@router.post("/vulnerability-scan", response_model=AIResponse)
async def vulnerability_scan(request: VulnerabilityRequest):
    """
    Vulnerability scanning and security analysis
    
    Features:
    - Security vulnerability detection
    - OWASP compliance checking
    - Dependency security analysis
    - Risk assessment and recommendations
    """
    try:
        response = await ai_service.vulnerability_scan(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vulnerability scan failed: {str(e)}")

@router.post("/refactor", response_model=AIResponse)
async def code_refactor(request: RefactorRequest):
    """
    Code refactoring suggestions
    
    Features:
    - Performance optimization suggestions
    - Code structure improvements
    - Design pattern recommendations
    - Maintainability enhancements
    """
    try:
        response = await ai_service.code_refactor(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code refactoring failed: {str(e)}")

@router.post("/nlp-to-code", response_model=AIResponse)
async def natural_language_to_code(request: NLPToCodeRequest):
    """
    Natural language to code generation
    
    Features:
    - Convert descriptions to functional code
    - Context-aware code generation
    - Multi-language support
    - Best practice adherence
    """
    try:
        response = await ai_service.nlp_to_code(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP to code conversion failed: {str(e)}")

@router.post("/conversation", response_model=AIResponse)
async def ai_conversation(request: ConversationRequest):
    """
    Multi-turn AI conversation system
    
    Features:
    - Context-aware conversations
    - Session management
    - Code-focused discussions
    - History retention
    """
    try:
        response = await ai_service.conversation(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI conversation failed: {str(e)}")

# Utility endpoints
@router.post("/create-session")
async def create_conversation_session():
    """Create a new conversation session"""
    session_id = str(uuid.uuid4())
    conversation_sessions[session_id] = {
        "created_at": asyncio.get_event_loop().time(),
        "messages": []
    }
    return {"session_id": session_id}

@router.get("/session/{session_id}")
async def get_conversation_history(session_id: str):
    """Get conversation history for a session"""
    if session_id not in conversation_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return conversation_sessions[session_id]

@router.delete("/session/{session_id}")
async def delete_conversation_session(session_id: str):
    """Delete a conversation session"""
    if session_id in conversation_sessions:
        del conversation_sessions[session_id]
    return {"message": "Session deleted"}

@router.get("/models/available")
async def get_available_models():
    """Get list of available AI models and their optimal use cases"""
    return {
        "models": {
            "meta-llama/llama-4-maverick": {
                "description": "Latest Llama 4 model - best for real-time features",
                "optimal_for": ["code_completion", "debug_assistance", "refactoring", "conversations"],
                "performance": "fast",
                "capabilities": "excellent"
            },
            "meta-llama/llama-3-70b-instruct": {
                "description": "Large Llama 3 model - best for deep analysis", 
                "optimal_for": ["code_review", "documentation", "vulnerability_scan", "optimization"],
                "performance": "thorough",
                "capabilities": "comprehensive"
            },
            "meta-llama/llama-guard-3-8b": {
                "description": "Safety-focused model for content filtering",
                "optimal_for": ["content_filtering", "safety_checks"],
                "performance": "fast",
                "capabilities": "safety-focused"
            }
        },
        "feature_model_mapping": ai_service.model_config.MODEL_MAP
    }

@router.get("/health")
async def ai_service_health():
    """AI service health check"""
    return {
        "status": "healthy",
        "service": "AI Services",
        "features": [
            "code_completion",
            "code_review", 
            "debug_assistance",
            "documentation_generation",
            "vulnerability_scanning",
            "code_refactoring",
            "nlp_to_code",
            "conversations"
        ],
        "models": ["llama-4-maverick", "llama-3-70b-instruct", "llama-guard-3-8b"]
    }