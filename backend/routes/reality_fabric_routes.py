"""
Reality Fabric API Routes - Spacetime Manipulation Endpoints

FastAPI routes for reality fabric and time manipulation features
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from services.reality_fabric_service import get_reality_fabric_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reality-fabric", tags=["reality-fabric"])

# Pydantic models for request/response
class BulletTimeRequest(BaseModel):
    user_id: str
    duration: int = 300

class TechPreviewRequest(BaseModel):
    current_stack: str
    years_ahead: int = 2

class SpacetimeManipulationRequest(BaseModel):
    manipulation_type: str
    intensity: float = 0.5

class TemporalCheckpointRequest(BaseModel):
    user_id: str
    code_state: str
    description: str = ''

@router.post("/bullet-time/activate")
async def activate_bullet_time(request: BulletTimeRequest):
    """
    🐌 Activate Bullet Time Mode - slow down time during debugging
    """
    try:
        reality_service = get_reality_fabric_service()
        if not reality_service:
            raise HTTPException(status_code=500, detail="Reality Fabric Service not available")
        
        result = await reality_service.activate_bullet_time(
            user_id=request.user_id,
            duration=request.duration
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Bullet time activation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bullet-time/deactivate/{session_id}")
async def deactivate_bullet_time(session_id: str):
    """
    ⏰ Deactivate bullet time mode and return to normal time flow
    """
    try:
        reality_service = get_reality_fabric_service()
        if not reality_service:
            raise HTTPException(status_code=500, detail="Reality Fabric Service not available")
        
        result = await reality_service.deactivate_bullet_time(session_id)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Bullet time deactivation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/future-tech-preview")
async def preview_future_tech_stack(request: TechPreviewRequest):
    """
    🔮 Preview future technology stacks using temporal projection
    """
    try:
        reality_service = get_reality_fabric_service()
        if not reality_service:
            raise HTTPException(status_code=500, detail="Reality Fabric Service not available")
        
        result = await reality_service.preview_future_tech_stack(
            current_stack=request.current_stack,
            years_ahead=request.years_ahead
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Future tech preview failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/spacetime/manipulate")
async def manipulate_spacetime_flow(request: SpacetimeManipulationRequest):
    """
    ⚡ Manipulate spacetime flow for enhanced coding experience
    """
    try:
        reality_service = get_reality_fabric_service()
        if not reality_service:
            raise HTTPException(status_code=500, detail="Reality Fabric Service not available")
        
        result = await reality_service.manipulate_spacetime_flow(
            manipulation_type=request.manipulation_type,
            intensity=request.intensity
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Spacetime manipulation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reality-coherence")
async def monitor_reality_coherence():
    """
    🌌 Monitor reality coherence across all manipulations
    """
    try:
        reality_service = get_reality_fabric_service()
        if not reality_service:
            raise HTTPException(status_code=500, detail="Reality Fabric Service not available")
        
        result = await reality_service.monitor_reality_coherence()
        
        return result
        
    except Exception as e:
        logger.error(f"Reality coherence monitoring failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/temporal-checkpoint")
async def create_temporal_checkpoint(request: TemporalCheckpointRequest):
    """
    ⏳ Create temporal checkpoint for time-travel debugging
    """
    try:
        reality_service = get_reality_fabric_service()
        if not reality_service:
            raise HTTPException(status_code=500, detail="Reality Fabric Service not available")
        
        result = await reality_service.create_temporal_checkpoint(
            user_id=request.user_id,
            code_state=request.code_state,
            description=request.description
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Temporal checkpoint creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))