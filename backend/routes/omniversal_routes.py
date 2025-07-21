"""
Omniversal Renderer API Routes - Multidimensional reality endpoints

FastAPI routes for 3D WebGL rendering, AR tapestries, and sonic landscapes
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from services.omniversal_renderer_service import get_omniversal_renderer_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/omniversal", tags=["omniversal-renderer"])

# Pydantic models for request/response
class GameWorldRequest(BaseModel):
    project_id: str
    world_type: str = "code_visualization"
    dimensions: int = 3

class ARTapestryRequest(BaseModel):
    code_content: str
    tapestry_style: str = "sacred_geometry"

class SonicLandscapeRequest(BaseModel):
    code_metrics: Dict[str, Any]
    composition_type: str = "algorithmic"

@router.post("/game-world/create")
async def create_3d_game_world(request: GameWorldRequest):
    """
    🎮 Create 3D WebGL game world from project
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.create_game_world(
            project_id=request.project_id,
            world_type=request.world_type,
            dimensions=request.dimensions
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Game world creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ar-tapestry/generate")
async def generate_ar_tapestry(request: ARTapestryRequest):
    """
    🖼️ Generate AR tapestry from code structure
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.generate_ar_tapestry(
            code_content=request.code_content,
            tapestry_style=request.tapestry_style
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"AR tapestry generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sonic-landscape/compose")
async def compose_sonic_landscape(request: SonicLandscapeRequest):
    """
    🎵 Compose sonic landscape from code metrics
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.compose_sonic_landscape(
            code_metrics=request.code_metrics,
            composition_type=request.composition_type
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Sonic landscape composition failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/worlds/active")
async def get_active_worlds():
    """
    🌍 Get all active game worlds and AR environments
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.get_active_worlds()
        
        return result
        
    except Exception as e:
        logger.error(f"Active worlds retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/world/{world_id}")
async def get_world_details(world_id: str):
    """
    🔍 Get detailed information about specific world
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.get_world_details(world_id)
        
        return result
        
    except Exception as e:
        logger.error(f"World details retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))