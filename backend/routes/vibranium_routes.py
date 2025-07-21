"""
Vibranium NFT API Routes - Cosmic blockchain economy endpoints

FastAPI routes for Vibranium NFT marketplace and blockchain features
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from services.vibranium_nft_service import get_vibranium_nft_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/vibranium", tags=["vibranium-nft"])

# Pydantic models for request/response
class NFTMintRequest(BaseModel):
    code_hash: str
    metadata: Dict[str, Any]
    user_id: str
    vibranium_cost: int = 100

class NFTTradeRequest(BaseModel):
    nft_id: str
    buyer_id: str
    seller_id: str
    price: int

@router.post("/nft/mint")
async def mint_vibranium_nft(request: NFTMintRequest):
    """
    💎 Mint new Vibranium NFT from code
    """
    try:
        vibranium_service = get_vibranium_nft_service()
        if not vibranium_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        result = await vibranium_service.mint_nft(
            code_hash=request.code_hash,
            metadata=request.metadata,
            user_id=request.user_id,
            vibranium_cost=request.vibranium_cost
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Vibranium NFT minting failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nft/trade")
async def trade_vibranium_nft(request: NFTTradeRequest):
    """
    🔄 Trade Vibranium NFT between users
    """
    try:
        vibranium_service = get_vibranium_nft_service()
        if not vibranium_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        result = await vibranium_service.trade_nft(
            nft_id=request.nft_id,
            buyer_id=request.buyer_id,
            seller_id=request.seller_id,
            price=request.price
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"Vibranium NFT trading failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/marketplace")
async def get_nft_marketplace():
    """
    🏪 Get Vibranium NFT marketplace listings
    """
    try:
        vibranium_service = get_vibranium_nft_service()
        if not vibranium_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        result = await vibranium_service.get_marketplace()
        
        return result
        
    except Exception as e:
        logger.error(f"Marketplace retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nft/{nft_id}")
async def get_nft_details(nft_id: str):
    """
    🔍 Get detailed information about specific NFT
    """
    try:
        vibranium_service = get_vibranium_nft_service()
        if not vibranium_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        result = await vibranium_service.get_nft_details(nft_id)
        
        return result
        
    except Exception as e:
        logger.error(f"NFT details retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))