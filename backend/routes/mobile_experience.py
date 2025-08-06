#!/usr/bin/env python3
"""
Mobile Experience API Routes
Provides PWA, offline sync, and mobile-optimized endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from services.mobile_experience_service import mobile_experience_service
from routes.auth import get_current_user

router = APIRouter()

@router.get("/mobile/health")
async def get_mobile_health():
    """Get mobile service health status"""
    try:
        health_data = await mobile_experience_service.get_mobile_health()
        return {
            "success": True,
            "data": health_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mobile health: {str(e)}")

@router.get("/mobile/pwa/manifest")
async def get_pwa_manifest():
    """Get Progressive Web App manifest"""
    try:
        manifest_data = await mobile_experience_service.get_pwa_manifest()
        return manifest_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get PWA manifest: {str(e)}")

@router.post("/mobile/configuration")
async def configure_mobile_experience(
    config_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Configure mobile experience for user"""
    try:
        user_id = current_user.get("id", "unknown")
        device_id = config_data.get("device_id", "default")
        
        mobile_config = await mobile_experience_service.configure_mobile_experience(
            user_id=user_id,
            device_id=device_id,
            config=config_data
        )
        
        return {
            "success": True,
            "configuration": mobile_config.dict(),
            "message": "Mobile experience configured successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to configure mobile experience: {str(e)}")

@router.get("/mobile/configuration")
async def get_mobile_configuration(
    device_id: str = "default",
    current_user: dict = Depends(get_current_user)
):
    """Get mobile configuration for user"""
    try:
        user_id = current_user.get("id", "unknown")
        
        config = await mobile_experience_service.get_mobile_configuration(user_id, device_id)
        
        if config:
            return {
                "success": True,
                "configuration": config.dict()
            }
        else:
            return {
                "success": True,
                "configuration": None,
                "message": "No configuration found for this device"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mobile configuration: {str(e)}")

@router.post("/mobile/offline/sync")
async def add_to_offline_sync(
    sync_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Add item to offline sync queue"""
    try:
        required_fields = ["type", "data"]
        for field in required_fields:
            if field not in sync_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        user_id = current_user.get("id", "unknown")
        
        sync_item = await mobile_experience_service.add_to_offline_sync(
            user_id=user_id,
            sync_type=sync_data["type"],
            data=sync_data["data"]
        )
        
        return {
            "success": True,
            "sync_item": sync_item.dict(),
            "message": "Item added to offline sync queue"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add to offline sync: {str(e)}")

@router.get("/mobile/offline/sync/status")
async def get_offline_sync_status(current_user: dict = Depends(get_current_user)):
    """Get offline sync status for user"""
    try:
        user_id = current_user.get("id", "unknown")
        
        sync_status = await mobile_experience_service.get_offline_sync_status(user_id)
        
        return {
            "success": True,
            "sync_status": sync_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get offline sync status: {str(e)}")

@router.post("/mobile/offline/sync/process")
async def process_offline_sync(current_user: dict = Depends(get_current_user)):
    """Process offline sync for user"""
    try:
        user_id = current_user.get("id", "unknown")
        
        result = await mobile_experience_service.process_offline_sync(user_id)
        
        return {
            "success": True,
            "sync_result": result,
            "message": f"Processed {result['processed']} items"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process offline sync: {str(e)}")

@router.get("/mobile/data/{data_type}")
async def get_mobile_optimized_data(
    data_type: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get mobile-optimized data for user"""
    try:
        user_id = current_user.get("id", "unknown")
        
        optimized_data = await mobile_experience_service.get_mobile_optimized_data(
            user_id=user_id,
            data_type=data_type,
            limit=limit
        )
        
        return {
            "success": True,
            "data_type": data_type,
            "data": optimized_data,
            "optimizations": {
                "mobile_friendly": True,
                "compressed_payloads": True,
                "lazy_loading_ready": True,
                "offline_capable": True
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mobile optimized data: {str(e)}")

@router.post("/mobile/push/subscription")
async def register_push_subscription(
    subscription_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Register push notification subscription"""
    try:
        user_id = current_user.get("id", "unknown")
        device_id = subscription_data.get("device_id", "default")
        
        subscription = await mobile_experience_service.register_push_subscription(
            user_id=user_id,
            device_id=device_id,
            subscription_data=subscription_data
        )
        
        return {
            "success": True,
            "subscription": subscription,
            "message": "Push notification subscription registered"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register push subscription: {str(e)}")

@router.post("/mobile/push/send")
async def send_push_notification(
    notification_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Send push notification to user"""
    try:
        user_id = current_user.get("id", "unknown")
        
        result = await mobile_experience_service.send_push_notification(
            user_id=user_id,
            notification=notification_data
        )
        
        return {
            "success": True,
            "notification_result": result,
            "message": "Push notification sent successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send push notification: {str(e)}")

@router.get("/mobile/features")
async def get_mobile_features():
    """Get available mobile features and capabilities"""
    try:
        features = {
            "pwa_support": {
                "enabled": True,
                "features": ["offline_capability", "app_shell", "service_worker", "web_manifest"]
            },
            "offline_sync": {
                "enabled": True,
                "sync_types": ["conversations", "templates", "projects", "settings"],
                "conflict_resolution": ["merge", "overwrite", "user_choice"]
            },
            "push_notifications": {
                "enabled": True,
                "types": ["new_messages", "project_updates", "system_alerts", "collaboration"]
            },
            "mobile_optimizations": {
                "data_compression": True,
                "image_optimization": True,
                "lazy_loading": True,
                "reduced_animations": True,
                "touch_optimized": True
            },
            "accessibility": {
                "screen_reader": True,
                "high_contrast": True,
                "font_scaling": True,
                "voice_navigation": True
            },
            "performance": {
                "app_shell_architecture": True,
                "code_splitting": True,
                "resource_preloading": True,
                "background_sync": True
            }
        }
        
        return {
            "success": True,
            "features": features,
            "platform_support": {
                "ios_safari": True,
                "android_chrome": True,
                "desktop_browsers": True,
                "pwa_installable": True
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mobile features: {str(e)}")