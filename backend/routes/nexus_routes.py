"""
Nexus Events API Routes - Cross-platform synchronization endpoints

FastAPI routes for nexus events and cross-platform system integration
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from services.nexus_events_service import get_nexus_events_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/nexus", tags=["nexus-events"])

# Pydantic models for request/response
class NexusEventRequest(BaseModel):
    event_type: str
    source_platform: str
    target_platform: str
    payload: Dict[str, Any] = {}
    user_id: str

class CrossPlatformSync(BaseModel):
    platforms: List[str]
    sync_type: str = "bidirectional"

@router.post("/events/create")
async def create_nexus_event(request: NexusEventRequest):
    """
    🌉 Create cross-platform nexus event
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        result = await nexus_service.create_nexus_event(
            event_type=request.event_type,
            source_platform=request.source_platform,
            target_platform=request.target_platform,
            payload=request.payload,
            user_id=request.user_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Nexus event creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/platforms")
async def sync_platforms(request: CrossPlatformSync):
    """
    🔄 Synchronize multiple platforms through nexus
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        result = await nexus_service.sync_platforms(
            platforms=request.platforms,
            sync_type=request.sync_type
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Platform synchronization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/active")
async def get_active_nexus_events():
    """
    📊 Get all active nexus events
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        result = await nexus_service.get_active_events()
        
        return result
        
    except Exception as e:
        logger.error(f"Active events retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))