from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Service will be injected
code_quality_engine = None

def set_code_quality_engine(service):
    global code_quality_engine
    code_quality_engine = service

router = APIRouter()

class CodeAnalysisRequest(BaseModel):
    code: str
    file_type: str
    context: Dict[str, Any] = {}

class RealtimeFeedbackRequest(BaseModel):
    code: str
    file_type: str
    cursor_position: Dict[str, int]

class CodeImprovementRequest(BaseModel):
    code: str
    file_type: str
    focus_area: str = "all"

class CodeSmellDetectionRequest(BaseModel):
    code: str
    file_type: str

class QualityReportRequest(BaseModel):
    project_files: Dict[str, str]

@router.post("/analyze-quality")
async def analyze_code_quality(request: CodeAnalysisRequest):
    """Analyze code quality and provide comprehensive scoring"""
    try:
        if not code_quality_engine:
            raise HTTPException(status_code=503, detail="Code Quality Engine not available")
        
        analysis = await code_quality_engine.analyze_code_quality(
            request.code,
            request.file_type,
            request.context
        )
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/realtime-feedback")
async def get_realtime_quality_feedback(request: RealtimeFeedbackRequest):
    """Provide real-time quality feedback as user types"""
    try:
        if not code_quality_engine:
            raise HTTPException(status_code=503, detail="Code Quality Engine not available")
        
        feedback = await code_quality_engine.get_realtime_quality_feedback(
            request.code,
            request.file_type,
            request.cursor_position
        )
        
        return {
            "success": True,
            "data": feedback,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-improvements")
async def suggest_code_improvements(request: CodeImprovementRequest):
    """Suggest specific code improvements"""
    try:
        if not code_quality_engine:
            raise HTTPException(status_code=503, detail="Code Quality Engine not available")
        
        improvements = await code_quality_engine.suggest_code_improvements(
            request.code,
            request.file_type,
            request.focus_area
        )
        
        return {
            "success": True,
            "data": {"improvements": improvements},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-code-smells")
async def detect_code_smells(request: CodeSmellDetectionRequest):
    """Detect code smells and anti-patterns"""
    try:
        if not code_quality_engine:
            raise HTTPException(status_code=503, detail="Code Quality Engine not available")
        
        smells = await code_quality_engine.detect_code_smells(
            request.code,
            request.file_type
        )
        
        return {
            "success": True,
            "data": {"code_smells": smells},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-quality-report")
async def generate_quality_report(request: QualityReportRequest):
    """Generate comprehensive quality report for entire project"""
    try:
        if not code_quality_engine:
            raise HTTPException(status_code=503, detail="Code Quality Engine not available")
        
        report = await code_quality_engine.generate_quality_report(request.project_files)
        
        return {
            "success": True,
            "data": report,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/overview")
async def get_quality_metrics_overview():
    """Get overview of quality metrics and scoring system"""
    try:
        return {
            "success": True,
            "data": {
                "metrics": {
                    "readability": {"weight": 0.25, "description": "Code clarity and naming conventions"},
                    "maintainability": {"weight": 0.25, "description": "Code organization and modularity"},
                    "performance": {"weight": 0.20, "description": "Efficiency and optimization"},
                    "security": {"weight": 0.20, "description": "Security best practices"},
                    "best_practices": {"weight": 0.10, "description": "Language-specific conventions"}
                },
                "scoring": {
                    "A": "90-100 - Excellent",
                    "B": "80-89 - Good",
                    "C": "70-79 - Average",
                    "D": "60-69 - Below Average",
                    "F": "0-59 - Poor"
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for code quality engine"""
    return {
        "service": "Code Quality Engine",
        "status": "healthy" if code_quality_engine else "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }