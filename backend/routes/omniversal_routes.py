"""
Omniversal Renderer API Routes - 3D/AR/Audio Reality Endpoints

FastAPI routes for omniversal rendering features
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from ..services.omniversal_renderer_service import get_omniversal_renderer_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/omniversal", tags=["omniversal"])

# Pydantic models for request/response
class Render3DRequest(BaseModel):
    project_id: str
    rendering_options: Optional[Dict] = {}

class ARTapestryRequest(BaseModel):
    project_id: str
    ar_options: Optional[Dict] = {}

class SonicLandscapeRequest(BaseModel):
    project_id: str
    audio_options: Optional[Dict] = {}

@router.post("/render/3d-world")
async def render_project_as_3d_world(request: Render3DRequest):
    """
    🎮 Render project as a playable 3D WebGL game world
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.render_project_as_3d_world(
            project_id=request.project_id,
            rendering_options=request.rendering_options
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"3D world rendering failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/render/ar-tapestry")
async def create_ar_tapestry(request: ARTapestryRequest):
    """
    🥽 Create AR tapestry for Magic Leap/Apple Vision Pro
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.create_ar_tapestry(
            project_id=request.project_id,
            ar_options=request.ar_options
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"AR tapestry creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/render/sonic-landscape")
async def generate_sonic_landscape(request: SonicLandscapeRequest):
    """
    🎵 Generate sonic landscape using WebAudio API + MIDI
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.generate_sonic_landscape(
            project_id=request.project_id,
            audio_options=request.audio_options
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Sonic landscape generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/render/{render_id}/status")
async def get_render_status(render_id: str):
    """
    📊 Get status of omniversal render
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.get_render_status(render_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Render status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/play/{render_id}")
async def get_playable_world_data(render_id: str):
    """
    🌐 Get playable world data for 3D rendering
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.get_render_status(render_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail="Render not found")
        
        render_data = result['render']
        if render_data['render_type'] != 'webgl_3d':
            raise HTTPException(status_code=400, detail="Render is not a 3D world")
        
        return {
            'success': True,
            'render_id': render_id,
            'webgl_data': render_data['webgl_data'],
            'world_stats': {
                'scenes': len(render_data['webgl_data']['scenes']),
                'objects': len(render_data['webgl_data']['objects']),
                'materials': len(render_data['webgl_data']['materials'])
            }
        }
        
    except Exception as e:
        logger.error(f"Playable world data retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ar/{render_id}/manifest")
async def get_ar_manifest(render_id: str):
    """
    📱 Get AR manifest for device compatibility
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.get_render_status(render_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail="Render not found")
        
        render_data = result['render']
        if render_data['render_type'] != 'ar_tapestry':
            raise HTTPException(status_code=400, detail="Render is not an AR tapestry")
        
        return {
            'success': True,
            'render_id': render_id,
            'ar_manifest': {
                'version': '1.0',
                'type': 'ar_tapestry',
                'device_compatibility': render_data['ar_data']['device_compatibility'],
                'anchors': render_data['ar_data']['anchors'],
                'holograms': render_data['ar_data']['holograms'],
                'spatial_audio': render_data['ar_data']['spatial_audio'],
                'gestures': render_data['ar_data']['gestures']
            }
        }
        
    except Exception as e:
        logger.error(f"AR manifest retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audio/{render_id}/play")
async def get_audio_playback_data(render_id: str):
    """
    🎵 Get audio playback data for sonic landscape
    """
    try:
        renderer_service = get_omniversal_renderer_service()
        if not renderer_service:
            raise HTTPException(status_code=500, detail="Omniversal Renderer Service not available")
        
        result = await renderer_service.get_render_status(render_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail="Render not found")
        
        render_data = result['render']
        if render_data['render_type'] != 'sonic_landscape':
            raise HTTPException(status_code=400, detail="Render is not a sonic landscape")
        
        return {
            'success': True,
            'render_id': render_id,
            'audio_config': render_data['audio_config'],
            'duration_ms': render_data['duration_ms'],
            'playback_instructions': {
                'format': 'web_audio_api',
                'sample_rate': 44100,
                'channels': 2,
                'bit_depth': 16
            }
        }
        
    except Exception as e:
        logger.error(f"Audio playback data retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))