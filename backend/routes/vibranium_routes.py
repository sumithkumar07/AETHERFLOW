"""
Vibranium NFT API Routes - Blockchain Economy Endpoints

FastAPI routes for Vibranium NFT and blockchain economy features
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from ..services.vibranium_nft_service import get_vibranium_nft_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/vibranium", tags=["vibranium"])

# Pydantic models for request/response
class MintNFTRequest(BaseModel):
    user_id: str
    code: str
    title: str
    description: Optional[str] = ''
    network: Optional[str] = 'cosmic_chain'

class MarketplaceRequest(BaseModel):
    user_id: str

@router.post("/nft/mint")
async def mint_code_nft(request: MintNFTRequest):
    """
    ⚒️ Mint an NFT from code using cosmic algorithms
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        result = await nft_service.mint_code_nft(
            user_id=request.user_id,
            code=request.code,
            title=request.title,
            description=request.description,
            network=request.network
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"NFT minting failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/marketplace/create")
async def create_nft_marketplace(request: MarketplaceRequest):
    """
    🏪 Create cosmic NFT marketplace listing
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        result = await nft_service.create_nft_marketplace(
            user_id=request.user_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        logger.error(f"NFT marketplace creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/marketplace/{marketplace_id}")
async def get_nft_marketplace(marketplace_id: str):
    """
    🌟 Get NFT marketplace details
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        # Find marketplace in database
        marketplace = await nft_service.db.nft_marketplaces.find_one({'marketplace_id': marketplace_id})
        
        if not marketplace:
            raise HTTPException(status_code=404, detail="Marketplace not found")
        
        return {
            'success': True,
            'marketplace': marketplace,
            'featured_nfts': marketplace['featured_nfts'],
            'marketplace_stats': marketplace['marketplace_stats'],
            'cosmic_ranking': marketplace['cosmic_ranking']
        }
        
    except Exception as e:
        logger.error(f"NFT marketplace retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nft/{nft_id}")
async def get_nft_details(nft_id: str):
    """
    💎 Get detailed NFT information
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        # Find NFT in database
        nft = await nft_service.db.nft_collection.find_one({'nft_id': nft_id})
        
        if not nft:
            raise HTTPException(status_code=404, detail="NFT not found")
        
        return {
            'success': True,
            'nft': nft,
            'metadata': nft['metadata'],
            'visual_data': nft['visual_data'],
            'rarity_info': {
                'rarity': nft['rarity'],
                'rarity_config': nft_service.rarity_tiers[nft['rarity']]
            }
        }
        
    except Exception as e:
        logger.error(f"NFT details retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/networks")
async def get_supported_networks():
    """
    🌐 Get supported blockchain networks
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        return {
            'success': True,
            'supported_networks': nft_service.blockchain_networks,
            'default_network': 'cosmic_chain',
            'network_count': len(nft_service.blockchain_networks)
        }
        
    except Exception as e:
        logger.error(f"Supported networks retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rarity-tiers")
async def get_rarity_tiers():
    """
    ⭐ Get NFT rarity tier information
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        return {
            'success': True,
            'rarity_tiers': nft_service.rarity_tiers,
            'tier_count': len(nft_service.rarity_tiers),
            'explanation': {
                'common': 'Basic code with standard patterns',
                'uncommon': 'Well-structured code with good practices',
                'rare': 'High-quality code with creative solutions',
                'epic': 'Exceptional code with innovative patterns',
                'legendary': 'Masterpiece code that pushes boundaries',
                'cosmic': 'Transcendent code that defies conventional wisdom'
            }
        }
        
    except Exception as e:
        logger.error(f"Rarity tiers retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/collection")
async def get_user_nft_collection(user_id: str):
    """
    👤 Get user's NFT collection
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        # Get user's NFTs
        user_nfts = await nft_service.db.nft_collection.find(
            {'owner_id': user_id}
        ).to_list(100)
        
        # Calculate collection statistics
        rarity_distribution = {}
        total_estimated_value = 0
        
        for nft in user_nfts:
            rarity = nft.get('rarity', 'common')
            rarity_distribution[rarity] = rarity_distribution.get(rarity, 0) + 1
            
            # Add estimated value
            rarity_multiplier = nft_service.rarity_tiers[rarity]['multiplier']
            total_estimated_value += 0.01 * rarity_multiplier  # Base 0.01 ETH
        
        return {
            'success': True,
            'user_id': user_id,
            'collection': user_nfts,
            'collection_stats': {
                'total_nfts': len(user_nfts),
                'rarity_distribution': rarity_distribution,
                'estimated_total_value_eth': round(total_estimated_value, 4),
                'estimated_total_value_usd': round(total_estimated_value * 2000, 2)
            },
            'most_valuable_nft': max(user_nfts, key=lambda x: nft_service.rarity_tiers[x.get('rarity', 'common')]['multiplier']) if user_nfts else None
        }
        
    except Exception as e:
        logger.error(f"User NFT collection retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nft/{nft_id}/visual")
async def get_nft_visual_data(nft_id: str):
    """
    🎨 Get NFT visual representation data
    """
    try:
        nft_service = get_vibranium_nft_service()
        if not nft_service:
            raise HTTPException(status_code=500, detail="Vibranium NFT Service not available")
        
        # Find NFT
        nft = await nft_service.db.nft_collection.find_one({'nft_id': nft_id})
        
        if not nft:
            raise HTTPException(status_code=404, detail="NFT not found")
        
        return {
            'success': True,
            'nft_id': nft_id,
            'visual_data': nft['visual_data'],
            'rendering_instructions': {
                'canvas_size': nft['visual_data']['dimensions'],
                'background_pattern': nft['visual_data']['background_pattern'],
                'rarity_effects': nft['visual_data']['rarity_effects'],
                'sacred_geometry': nft['visual_data']['sacred_geometry']
            }
        }
        
    except Exception as e:
        logger.error(f"NFT visual data retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))