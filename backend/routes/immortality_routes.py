"""
Quantum Immortality API Routes - Code preservation endpoints

FastAPI routes for quantum immortality and code preservation features
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from services.quantum_immortality_service import get_quantum_immortality_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/immortality", tags=["quantum-immortality"])

# Pydantic models for request/response
class ImmortalizationRequest(BaseModel):
    project_id: str
    user_id: str
    preservation_level: str = "standard"

class QuantumBackupRequest(BaseModel):
    project_id: str
    backup_type: str = "full"

@router.post("/activate")
async def activate_quantum_immortality(request: ImmortalizationRequest):
    """
    ♾️ Activate quantum immortality for code preservation
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        result = await immortality_service.activate_immortality(
            project_id=request.project_id,
            user_id=request.user_id,
            preservation_level=request.preservation_level
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Quantum immortality activation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/backup/quantum")
async def create_quantum_backup(request: QuantumBackupRequest):
    """
    💾 Create quantum-state backup of code
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        result = await immortality_service.create_quantum_backup(
            project_id=request.project_id,
            backup_type=request.backup_type
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Quantum backup creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{project_id}")
async def get_immortality_status(project_id: str):
    """
    📊 Get quantum immortality status for project
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        result = await immortality_service.get_immortality_status(project_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Immortality status retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))