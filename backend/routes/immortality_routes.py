"""
Quantum Immortality API Routes - Code Survival System Endpoints

FastAPI routes for quantum immortality and code preservation
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from ..services.quantum_immortality_service import get_quantum_immortality_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/immortality", tags=["immortality"])

# Pydantic models for request/response
class GrantImmortalityRequest(BaseModel):
    project_id: str
    user_id: str
    immortality_level: Optional[str] = 'basic'

class HostDisappearanceRequest(BaseModel):
    project_id: str

class ResurrectionRequest(BaseModel):
    immortality_id: str
    target_dimension: Optional[str] = None

class ImmortalityStatusRequest(BaseModel):
    project_id: str

@router.post("/grant")
async def grant_immortality(request: GrantImmortalityRequest):
    """
    ♾️ Grant quantum immortality to a project
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        result = await immortality_service.grant_immortality(
            project_id=request.project_id,
            user_id=request.user_id,
            immortality_level=request.immortality_level
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Immortality granting failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-disappearance")
async def detect_host_disappearance(request: HostDisappearanceRequest):
    """
    🔍 Detect if project host has disappeared and activate survival protocols
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        result = await immortality_service.detect_host_disappearance(
            project_id=request.project_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Host disappearance detection failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resurrect")
async def resurrect_project(request: ResurrectionRequest):
    """
    🔄 Resurrect project from quantum backup
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        result = await immortality_service.resurrect_project(
            immortality_id=request.immortality_id,
            target_dimension=request.target_dimension
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Project resurrection failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/status")
async def get_immortality_status(request: ImmortalityStatusRequest):
    """
    📊 Get immortality status for a project
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        result = await immortality_service.get_immortality_status(
            project_id=request.project_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Immortality status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/levels")
async def get_immortality_levels():
    """
    ⚡ Get available immortality levels and their features
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        return {
            'success': True,
            'immortality_levels': immortality_service.immortality_levels,
            'backup_dimensions': immortality_service.backup_dimensions,
            'level_descriptions': {
                'basic': 'Standard protection with basic backup and recovery',
                'advanced': 'Enhanced protection with AI maintenance',
                'quantum': 'Quantum-level protection with auto-migration',
                'eternal': 'Ultimate protection with dimensional consciousness'
            }
        }
        
    except Exception as e:
        logger.error(f"Immortality levels retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dimensions")
async def get_backup_dimensions():
    """
    🌌 Get available backup dimensions for code storage
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        return {
            'success': True,
            'backup_dimensions': immortality_service.backup_dimensions,
            'dimension_count': len(immortality_service.backup_dimensions),
            'dimension_descriptions': {
                'primary_reality': 'Main dimensional storage with highest stability',
                'parallel_dimension_alpha': 'First parallel reality backup',
                'parallel_dimension_beta': 'Second parallel reality backup',
                'quantum_backup_realm': 'Quantum-secured backup dimension',
                'eternal_code_archive': 'Eternal preservation archive'
            }
        }
        
    except Exception as e:
        logger.error(f"Backup dimensions retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/immortal-projects")
async def get_all_immortal_projects():
    """
    👑 Get all projects under immortality protection
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        immortal_projects = list(immortality_service.immortal_projects.values())
        
        # Calculate summary statistics
        level_distribution = {}
        total_survivals = 0
        active_ai_caretakers = 0
        
        for project in immortal_projects:
            level = project['immortality_level']
            level_distribution[level] = level_distribution.get(level, 0) + 1
            total_survivals += project['survival_count']
            if project['ai_caretaker']:
                active_ai_caretakers += 1
        
        return {
            'success': True,
            'immortal_projects': immortal_projects,
            'project_count': len(immortal_projects),
            'summary_stats': {
                'level_distribution': level_distribution,
                'total_survivals': total_survivals,
                'active_ai_caretakers': active_ai_caretakers,
                'average_dimensional_integrity': sum(p['dimensional_integrity'] for p in immortal_projects) / len(immortal_projects) if immortal_projects else 0
            }
        }
        
    except Exception as e:
        logger.error(f"Immortal projects retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{immortality_id}/caretaker")
async def get_ai_caretaker_info(immortality_id: str):
    """
    🤖 Get AI caretaker information for immortal project
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        if immortality_id not in immortality_service.immortal_projects:
            raise HTTPException(status_code=404, detail="Immortal project not found")
        
        project = immortality_service.immortal_projects[immortality_id]
        ai_caretaker = project.get('ai_caretaker')
        
        if not ai_caretaker:
            return {
                'success': True,
                'caretaker_active': False,
                'message': 'No AI caretaker assigned to this project'
            }
        
        return {
            'success': True,
            'caretaker_active': True,
            'ai_caretaker': ai_caretaker,
            'capabilities': ai_caretaker['capabilities'],
            'knowledge_base_size': len(ai_caretaker['knowledge_base']),
            'dedication_level': ai_caretaker['personality']['dedication']
        }
        
    except Exception as e:
        logger.error(f"AI caretaker info retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{immortality_id}/dimensional-anchors")
async def get_dimensional_anchors(immortality_id: str):
    """
    ⚓ Get dimensional anchors for immortal project
    """
    try:
        immortality_service = get_quantum_immortality_service()
        if not immortality_service:
            raise HTTPException(status_code=500, detail="Quantum Immortality Service not available")
        
        if immortality_id not in immortality_service.immortal_projects:
            raise HTTPException(status_code=404, detail="Immortal project not found")
        
        project = immortality_service.immortal_projects[immortality_id]
        dimensional_anchors = project['dimensional_anchors']
        
        # Calculate anchor statistics
        total_storage = sum(anchor['storage_capacity'] for anchor in dimensional_anchors)
        average_stability = sum(anchor['stability'] for anchor in dimensional_anchors) / len(dimensional_anchors)
        
        return {
            'success': True,
            'dimensional_anchors': dimensional_anchors,
            'anchor_count': len(dimensional_anchors),
            'anchor_stats': {
                'total_storage_gb': total_storage,
                'average_stability': average_stability,
                'dimensions_covered': [anchor['dimension'] for anchor in dimensional_anchors],
                'most_stable_dimension': max(dimensional_anchors, key=lambda x: x['stability'])['dimension']
            }
        }
        
    except Exception as e:
        logger.error(f"Dimensional anchors retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))