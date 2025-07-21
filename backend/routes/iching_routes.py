"""
I Ching API Routes - Ancient wisdom debugging endpoints

FastAPI routes for I Ching error interpretation and mystical debugging
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from services.iching_service import get_iching_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/iching", tags=["iching-wisdom"])

# Pydantic models for request/response
class ErrorDivinationRequest(BaseModel):
    error_message: str
    error_type: str
    context: Optional[Dict[str, Any]] = {}

class WisdomConsultationRequest(BaseModel):
    question: str
    context: str = "debugging"

@router.post("/divine-error")
async def divine_error_meaning(request: ErrorDivinationRequest):
    """
    🔮 Divine the deeper meaning of errors through I Ching wisdom
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        result = await iching_service.divine_error_meaning(
            error_message=request.error_message,
            error_type=request.error_type,
            context=request.context
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Error divination failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/consult-wisdom")
async def consult_ancient_wisdom(request: WisdomConsultationRequest):
    """
    📿 Consult I Ching for development guidance
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        result = await iching_service.consult_wisdom(
            question=request.question,
            context=request.context
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Wisdom consultation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daily-hexagram")
async def get_daily_hexagram():
    """
    🌅 Get daily I Ching hexagram for development guidance
    """
    try:
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        result = await iching_service.get_daily_hexagram()
        
        return result
        
    except Exception as e:
        logger.error(f"Daily hexagram retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hexagram/{hexagram_number}")
async def get_hexagram_details(hexagram_number: int):
    """
    📖 Get detailed information about specific hexagram
    """
    try:
        if hexagram_number < 1 or hexagram_number > 64:
            raise HTTPException(status_code=400, detail="Invalid hexagram number (must be 1-64)")
            
        iching_service = get_iching_service()
        if not iching_service:
            raise HTTPException(status_code=500, detail="I Ching Service not available")
        
        result = await iching_service.get_hexagram_details(hexagram_number)
        
        return result
        
    except Exception as e:
        logger.error(f"Hexagram details retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))