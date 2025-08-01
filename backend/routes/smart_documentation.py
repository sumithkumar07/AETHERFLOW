from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Service will be injected
smart_documentation_service = None

def set_smart_documentation_service(service):
    global smart_documentation_service
    smart_documentation_service = service

router = APIRouter()

class RealtimeDocRequest(BaseModel):
    code: str
    file_type: str
    context: Dict[str, Any] = {}

class ReadmeGenerationRequest(BaseModel):
    project_data: Dict[str, Any]

class ApiDocRequest(BaseModel):
    endpoints: List[Dict[str, Any]]

class InlineCommentRequest(BaseModel):
    code: str
    file_type: str

class ChangelogRequest(BaseModel):
    project_history: List[Dict[str, Any]]

@router.post("/realtime-documentation")
async def generate_realtime_documentation(request: RealtimeDocRequest):
    """Generate documentation in real-time as user codes"""
    try:
        if not smart_documentation_service:
            raise HTTPException(status_code=503, detail="Smart Documentation service not available")
        
        documentation = await smart_documentation_service.generate_realtime_documentation(
            request.code,
            request.file_type,
            request.context
        )
        
        return {
            "success": True,
            "data": documentation,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-readme")
async def auto_generate_readme(request: ReadmeGenerationRequest):
    """Auto-generate comprehensive README file"""
    try:
        if not smart_documentation_service:
            raise HTTPException(status_code=503, detail="Smart Documentation service not available")
        
        readme_content = await smart_documentation_service.auto_generate_readme(request.project_data)
        
        return {
            "success": True,
            "data": {"readme": readme_content},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-api-docs")
async def generate_api_documentation(request: ApiDocRequest):
    """Generate comprehensive API documentation"""
    try:
        if not smart_documentation_service:
            raise HTTPException(status_code=503, detail="Smart Documentation service not available")
        
        api_docs = await smart_documentation_service.generate_api_documentation(request.endpoints)
        
        return {
            "success": True,
            "data": {"api_documentation": api_docs},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-comments")
async def suggest_inline_comments(request: InlineCommentRequest):
    """Suggest inline comments for complex code sections"""
    try:
        if not smart_documentation_service:
            raise HTTPException(status_code=503, detail="Smart Documentation service not available")
        
        suggestions = await smart_documentation_service.suggest_inline_comments(
            request.code,
            request.file_type
        )
        
        return {
            "success": True,
            "data": {"suggestions": suggestions},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-changelog")
async def generate_changelog(request: ChangelogRequest):
    """Auto-generate changelog from project history"""
    try:
        if not smart_documentation_service:
            raise HTTPException(status_code=503, detail="Smart Documentation service not available")
        
        changelog = await smart_documentation_service.generate_changelog(request.project_history)
        
        return {
            "success": True,
            "data": {"changelog": changelog},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for smart documentation service"""
    return {
        "service": "Smart Documentation Engine",
        "status": "healthy" if smart_documentation_service else "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }