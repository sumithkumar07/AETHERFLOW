from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Service will be injected
architectural_intelligence_service = None

def set_architectural_intelligence_service(service):
    global architectural_intelligence_service
    architectural_intelligence_service = service

router = APIRouter()

class ProjectAnalysisRequest(BaseModel):
    project_id: str
    codebase: Dict[str, Any]
    
class StructureSuggestionRequest(BaseModel):
    project_type: str
    requirements: List[str]

class DocumentationRequest(BaseModel):
    project_id: str
    codebase: Dict[str, Any]

@router.post("/analyze-structure")
async def analyze_project_structure(request: ProjectAnalysisRequest):
    """Analyze project structure and suggest improvements"""
    try:
        if not architectural_intelligence_service:
            raise HTTPException(status_code=503, detail="Architectural Intelligence service not available")
        
        analysis = await architectural_intelligence_service.analyze_project_structure(
            request.project_id, 
            request.codebase
        )
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-structure")
async def suggest_optimal_structure(request: StructureSuggestionRequest):
    """Suggest optimal project structure before starting"""
    try:
        if not architectural_intelligence_service:
            raise HTTPException(status_code=503, detail="Architectural Intelligence service not available")
        
        suggestion = await architectural_intelligence_service.suggest_optimal_structure(
            request.project_type,
            request.requirements
        )
        
        return {
            "success": True,
            "data": suggestion,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-documentation")
async def generate_architecture_documentation(request: DocumentationRequest):
    """Auto-generate architectural documentation"""
    try:
        if not architectural_intelligence_service:
            raise HTTPException(status_code=503, detail="Architectural Intelligence service not available")
        
        documentation = await architectural_intelligence_service.generate_architecture_documentation(
            request.project_id,
            request.codebase
        )
        
        return {
            "success": True,
            "data": {"documentation": documentation},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for architectural intelligence service"""
    return {
        "service": "Architectural Intelligence",
        "status": "healthy" if architectural_intelligence_service else "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }