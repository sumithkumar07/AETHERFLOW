"""
Nexus Events API Routes - Cross-Platform Intervention Endpoints

FastAPI routes for nexus events and cross-platform interventions
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from ..services.nexus_events_service import get_nexus_events_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/nexus", tags=["nexus"])

# Pydantic models for request/response
class PlatformBridgeRequest(BaseModel):
    source_platform: str
    target_platform: str
    user_id: str
    intervention_type: Optional[str] = 'debugging'

class NexusInterventionRequest(BaseModel):
    bridge_id: str
    intervention_data: Dict[str, Any]

class ActiveBridgesRequest(BaseModel):
    user_id: str

@router.post("/bridge/create")
async def create_platform_bridge(request: PlatformBridgeRequest):
    """
    🌉 Create quantum bridge between different platforms
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        result = await nexus_service.create_platform_bridge(
            source_platform=request.source_platform,
            target_platform=request.target_platform,
            user_id=request.user_id,
            intervention_type=request.intervention_type
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Platform bridge creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intervention/perform")
async def perform_nexus_intervention(request: NexusInterventionRequest):
    """
    ⚡ Perform cosmic intervention across platforms
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        result = await nexus_service.perform_nexus_intervention(
            bridge_id=request.bridge_id,
            intervention_data=request.intervention_data
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Nexus intervention failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bridges/active")
async def get_active_bridges(request: ActiveBridgesRequest):
    """
    🔗 Get all active nexus bridges for user
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        result = await nexus_service.get_active_bridges(
            user_id=request.user_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Active bridges retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stability/monitor")
async def monitor_nexus_stability():
    """
    📊 Monitor overall nexus stability across all bridges
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        result = await nexus_service.monitor_nexus_stability()
        
        return result
        
    except Exception as e:
        logger.error(f"Nexus stability monitoring failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/platforms/supported")
async def get_supported_platforms():
    """
    📱 Get supported platform types and capabilities
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        return {
            'success': True,
            'supported_platforms': nexus_service.platform_types,
            'platform_count': len(nexus_service.platform_types),
            'platform_bridges': nexus_service.platform_bridges,
            'intervention_capabilities': [
                'fix_ios_from_android',
                'patch_server_from_smartwatch', 
                'debug_web_from_mobile',
                'sync_configuration',
                'monitor_performance'
            ]
        }
        
    except Exception as e:
        logger.error(f"Supported platforms retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intervention/ios-android-fix")
async def fix_ios_from_android(
    bridge_id: str,
    issue: str,
    strategy: str = 'auto'
):
    """
    📱 Fix iOS app issues from Android device
    """
    try:
        intervention_data = {
            'type': 'fix_ios_from_android',
            'issue': issue,
            'strategy': strategy
        }
        
        request = NexusInterventionRequest(
            bridge_id=bridge_id,
            intervention_data=intervention_data
        )
        
        return await perform_nexus_intervention(request)
        
    except Exception as e:
        logger.error(f"iOS from Android fix failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intervention/server-smartwatch-patch")
async def patch_server_from_smartwatch(
    bridge_id: str,
    issue: str,
    urgency: str = 'medium'
):
    """
    ⌚ Patch production server from smartwatch
    """
    try:
        intervention_data = {
            'type': 'patch_server_from_smartwatch',
            'issue': issue,
            'urgency': urgency
        }
        
        request = NexusInterventionRequest(
            bridge_id=bridge_id,
            intervention_data=intervention_data
        )
        
        return await perform_nexus_intervention(request)
        
    except Exception as e:
        logger.error(f"Server from smartwatch patch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intervention/web-mobile-debug")
async def debug_web_from_mobile(
    bridge_id: str,
    issue: str,
    debug_tools: List[str] = ['console', 'network']
):
    """
    🌐 Debug web application from mobile device
    """
    try:
        intervention_data = {
            'type': 'debug_web_from_mobile',
            'issue': issue,
            'tools': debug_tools
        }
        
        request = NexusInterventionRequest(
            bridge_id=bridge_id,
            intervention_data=intervention_data
        )
        
        return await perform_nexus_intervention(request)
        
    except Exception as e:
        logger.error(f"Web from mobile debug failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bridge/{bridge_id}/status")
async def get_bridge_status(bridge_id: str):
    """
    🔍 Get status of specific nexus bridge
    """
    try:
        nexus_service = get_nexus_events_service()
        if not nexus_service:
            raise HTTPException(status_code=500, detail="Nexus Events Service not available")
        
        if bridge_id not in nexus_service.active_nexus_connections:
            raise HTTPException(status_code=404, detail="Bridge not found")
        
        bridge = nexus_service.active_nexus_connections[bridge_id]
        
        return {
            'success': True,
            'bridge_id': bridge_id,
            'bridge_status': bridge,
            'interventions_performed': len(bridge['interventions_performed']),
            'quantum_stability': bridge['quantum_stability'],
            'bridge_strength': bridge['bridge_strength']
        }
        
    except Exception as e:
        logger.error(f"Bridge status retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))