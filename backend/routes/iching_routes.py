"""
I Ching API Routes - Sacred Error Interpretation Endpoints

FastAPI routes for I Ching wisdom and mystical error interpretation
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from ..services.iching_service import get_iching_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/iching", tags=["iching"])

# Pydantic models for request/response
class ErrorInterpretationRequest(BaseModel):
    error_type: str
    error_message: str
    code_context: Optional[str] = ''

class DailyGuidanceRequest(BaseModel):
    user_id: str

@router.post("/interpret-error")
async def interpret_error_as_hexagram(request: ErrorInterpretationRequest):
    """
    🔮 Interpret programming error through I Ching wisdom
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        result = await iching_service.interpret_error_as_hexagram(
            error_type=request.error_type,
            error_message=request.error_message,
            code_context=request.code_context
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"I Ching error interpretation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/daily-guidance")
async def generate_daily_coding_guidance(request: DailyGuidanceRequest):
    """
    🌅 Generate daily I Ching guidance for coding
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        result = await iching_service.generate_daily_coding_guidance(
            user_id=request.user_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Daily I Ching guidance generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hexagrams")
async def get_all_hexagrams():
    """
    ☯️ Get all 64 I Ching hexagrams with programming interpretations
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        # Return hexagram information
        hexagrams = iching_service.hexagrams
        
        return {
            'success': True,
            'total_hexagrams': len(hexagrams),
            'hexagrams': hexagrams,
            'message': 'Ancient wisdom of 64 hexagrams revealed'
        }
        
    except Exception as e:
        logger.error(f"Hexagrams retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hexagram/{hexagram_number}")
async def get_hexagram_details(hexagram_number: int):
    """
    📜 Get detailed information about specific hexagram
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        if hexagram_number not in iching_service.hexagrams:
            raise HTTPException(status_code=404, detail="Hexagram not found")
        
        hexagram = iching_service.hexagrams[hexagram_number]
        
        # Generate visualization data
        binary = hexagram['binary']
        lines = []
        for i, bit in enumerate(binary):
            line_type = 'solid' if bit == '1' else 'broken'
            lines.append({
                'position': 6 - i,  # Bottom to top
                'type': line_type,
                'symbol': '━━━━━━' if bit == '1' else '━━  ━━',
                'energy': 'yang' if bit == '1' else 'yin'
            })
        
        return {
            'success': True,
            'hexagram_number': hexagram_number,
            'hexagram': hexagram,
            'visualization': {
                'lines': lines,
                'binary_pattern': binary,
                'trigrams': hexagram['trigrams']
            },
            'programming_wisdom': hexagram['programming_meaning']
        }
        
    except Exception as e:
        logger.error(f"Hexagram details retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/meditation/{hexagram_number}")
async def get_hexagram_meditation(hexagram_number: int):
    """
    🧘 Get meditation guide for specific hexagram
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        if hexagram_number not in iching_service.hexagrams:
            raise HTTPException(status_code=404, detail="Hexagram not found")
        
        hexagram = iching_service.hexagrams[hexagram_number]
        
        # Generate meditation colors and breathing pattern
        colors = iching_service._get_hexagram_colors(hexagram)
        breathing = iching_service._get_breathing_pattern(hexagram)
        
        return {
            'success': True,
            'hexagram_number': hexagram_number,
            'hexagram_name': hexagram['name'],
            'meditation_guide': {
                'colors': colors,
                'breathing_pattern': breathing,
                'focus_phrase': f'I embody the wisdom of {hexagram["name"]}',
                'meditation_duration': '10-15 minutes',
                'instructions': [
                    f'Visualize the {hexagram["symbol"]} symbol',
                    f'Breathe in for {breathing["inhale"]} counts',
                    f'Hold for {breathing["hold"]} counts',
                    f'Exhale for {breathing["exhale"]} counts',
                    'Contemplate the hexagram\'s programming wisdom'
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Hexagram meditation guide failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/error-mappings")
async def get_error_type_mappings():
    """
    🗺️ Get error type to hexagram mappings
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        return {
            'success': True,
            'error_mappings': iching_service.error_mappings,
            'supported_error_types': list(iching_service.error_mappings.keys()),
            'message': 'Error-to-hexagram mappings for divine debugging guidance'
        }
        
    except Exception as e:
        logger.error(f"Error mappings retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))