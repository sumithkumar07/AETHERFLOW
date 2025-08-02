from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Global service instance (will be set by main.py)
experimental_sandbox_service = None

def set_experimental_sandbox_service(service):
    global experimental_sandbox_service
    experimental_sandbox_service = service

# Pydantic models
class SandboxCreateRequest(BaseModel):
    project_id: str
    experiment_type: str = "general"
    isolation_level: str = "high"
    description: Optional[str] = None

class ExperimentRequest(BaseModel):
    type: str
    name: str
    config: Dict[str, Any] = {}
    safety_level: str = "high"

class LanguageFeatureTestRequest(BaseModel):
    language: str
    features: List[str]

class ExperimentalAPITestRequest(BaseModel):
    apis: List[Dict[str, Any]]

class RollbackRequest(BaseModel):
    rollback_point_id: str

@router.post("/create-sandbox")
async def create_experimental_sandbox(request: SandboxCreateRequest, user_id: str = "demo_user"):
    """Create new experimental sandbox environment"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    experiment_config = {
        "type": request.experiment_type,
        "isolation": request.isolation_level,
        "description": request.description
    }
    
    result = await experimental_sandbox_service.create_sandbox(
        user_id, request.project_id, experiment_config
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/sandbox/{sandbox_id}/experiment")
async def run_experiment(sandbox_id: str, request: ExperimentRequest):
    """Run experiment in sandbox"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    experiment_config = {
        "type": request.type,
        "name": request.name,
        "config": request.config,
        "safety_level": request.safety_level
    }
    
    result = await experimental_sandbox_service.run_experiment(sandbox_id, experiment_config)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/sandbox/{sandbox_id}/test-language-features")
async def test_language_features(sandbox_id: str, request: LanguageFeatureTestRequest):
    """Test experimental language features"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    result = await experimental_sandbox_service.test_language_features(
        sandbox_id, request.language, request.features
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/sandbox/{sandbox_id}/test-experimental-apis")
async def test_experimental_apis(sandbox_id: str, request: ExperimentalAPITestRequest):
    """Test experimental APIs safely"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    result = await experimental_sandbox_service.test_experimental_apis(
        sandbox_id, request.apis
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/sandbox/{sandbox_id}/rollback")
async def rollback_sandbox(sandbox_id: str, request: RollbackRequest):
    """Rollback sandbox to previous state"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    result = await experimental_sandbox_service.rollback_to_state(
        sandbox_id, request.rollback_point_id
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/sandbox/{sandbox_id}/status")
async def get_sandbox_status(sandbox_id: str):
    """Get sandbox status and experiment history"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    if sandbox_id not in experimental_sandbox_service.sandbox_instances:
        raise HTTPException(status_code=404, detail="Sandbox not found")
    
    sandbox = experimental_sandbox_service.sandbox_instances[sandbox_id]
    
    return {
        "sandbox_id": sandbox_id,
        "status": sandbox["status"],
        "experiment_type": sandbox["experiment_type"],
        "created_at": sandbox["created_at"],
        "experiments_count": len(sandbox["experiments"]),
        "rollback_points": len(sandbox["rollback_points"]),
        "recent_experiments": sandbox["experiments"][-5:] if sandbox["experiments"] else [],
        "resource_usage": {
            "isolation_level": sandbox["isolation_level"],
            "temp_directory": sandbox["temp_directory"] is not None
        }
    }

@router.get("/sandbox/{sandbox_id}/experiments")
async def get_experiment_history(sandbox_id: str):
    """Get experiment history for sandbox"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    if sandbox_id not in experimental_sandbox_service.sandbox_instances:
        raise HTTPException(status_code=404, detail="Sandbox not found")
    
    sandbox = experimental_sandbox_service.sandbox_instances[sandbox_id]
    
    return {
        "sandbox_id": sandbox_id,
        "experiments": sandbox["experiments"],
        "total_experiments": len(sandbox["experiments"]),
        "successful_experiments": len([e for e in sandbox["experiments"] if e["status"] == "completed"]),
        "failed_experiments": len([e for e in sandbox["experiments"] if e["status"] in ["failed", "blocked"]]),
        "rollback_count": len([e for e in sandbox["experiments"] if e.get("rollback_triggered", False)])
    }

@router.get("/available-experiments")
async def get_available_experiments():
    """Get list of available experimental features"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    return {
        "language_features": experimental_sandbox_service.experimental_features.get("language_features", {}),
        "experimental_apis": experimental_sandbox_service.experimental_features.get("experimental_apis", {}),
        "cutting_edge_tools": experimental_sandbox_service.experimental_features.get("cutting_edge_tools", {}),
        "experiment_types": [
            {
                "type": "language_feature",
                "description": "Test new language features before they're stable",
                "risk_level": "low_to_medium",
                "isolation_recommended": "high"
            },
            {
                "type": "experimental_api", 
                "description": "Test experimental APIs safely",
                "risk_level": "medium_to_high",
                "isolation_recommended": "high"
            },
            {
                "type": "performance_optimization",
                "description": "Test performance optimizations",
                "risk_level": "medium",
                "isolation_recommended": "medium"
            }
        ]
    }

@router.delete("/sandbox/{sandbox_id}")
async def cleanup_sandbox(sandbox_id: str, preserve_data: bool = True):
    """Clean up sandbox environment"""
    if not experimental_sandbox_service:
        raise HTTPException(status_code=503, detail="Experimental Sandbox service not available")
    
    result = await experimental_sandbox_service.cleanup_sandbox(sandbox_id, preserve_data)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result