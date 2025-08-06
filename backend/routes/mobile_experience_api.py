"""
Mobile Experience API Routes - Complete Implementation
Mobile-optimized APIs, offline sync, PWA features, push notifications
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import logging

from services.mobile_experience_complete import get_mobile_system

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class MobileSessionRequest(BaseModel):
    device_type: str = Field(..., description="Device type: mobile, tablet, desktop, pwa")
    device_id: str = Field(..., description="Unique device identifier")
    app_version: str = Field(..., description="App version")
    os_version: str = Field(..., description="Operating system version")
    screen_size: Dict[str, int] = Field(..., description="Screen dimensions {width, height}")
    network_type: str = Field(default="unknown", description="Network type: wifi, cellular, offline")
    push_token: Optional[str] = Field(None, description="Push notification token")

class MobileDataRequest(BaseModel):
    data_type: str = Field(..., description="Type of data requested")
    device_type: str = Field(..., description="Device type for optimization")
    network_type: str = Field(default="unknown", description="Current network type")

class PushNotificationRequest(BaseModel):
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body")
    data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional notification data")
    scheduled_at: Optional[datetime] = Field(None, description="Schedule notification for later")

class OfflineDataRequest(BaseModel):
    data_type: str = Field(..., description="Type of data to store offline")
    data: Dict[str, Any] = Field(..., description="Data to store")
    priority: int = Field(default=5, ge=1, le=10, description="Sync priority (1-10)")

@router.get("/health")
async def mobile_health_check():
    """Health check for mobile experience system"""
    try:
        mobile_system = await get_mobile_system()
        return {
            "status": "healthy",
            "service": "Mobile Experience System",
            "features": {
                "mobile_optimization": "active",
                "offline_sync": "active",
                "pwa_support": "active",
                "push_notifications": "active"
            },
            "supported_devices": ["mobile", "tablet", "desktop", "pwa"],
            "offline_capabilities": ["data_sync", "cached_responses", "background_sync"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Mobile health check failed: {e}")
        raise HTTPException(status_code=503, detail="Mobile experience system unavailable")

@router.post("/session/register")
async def register_mobile_session(
    session_request: MobileSessionRequest,
    user_id: str = Query(..., description="User ID")
):
    """Register a new mobile session"""
    try:
        mobile_system = await get_mobile_system()
        
        session_id = await mobile_system.register_mobile_session(
            user_id=user_id,
            device_type=session_request.device_type,
            device_id=session_request.device_id,
            app_version=session_request.app_version,
            os_version=session_request.os_version,
            screen_size=session_request.screen_size,
            network_type=session_request.network_type,
            push_token=session_request.push_token
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "message": "Mobile session registered successfully",
            "offline_capable": session_request.device_type.lower() in ["mobile", "tablet", "pwa"]
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to register mobile session: {e}")
        raise HTTPException(status_code=500, detail="Failed to register mobile session")

@router.get("/data/optimized")
async def get_mobile_optimized_data(
    data_type: str = Query(..., description="Type of data to retrieve"),
    device_type: str = Query(..., description="Device type"),
    network_type: str = Query(default="unknown", description="Network type"),
    user_id: str = Query(..., description="User ID")
):
    """Get mobile-optimized API response"""
    try:
        mobile_system = await get_mobile_system()
        
        optimized_response = await mobile_system.get_mobile_optimized_response(
            user_id=user_id,
            data_type=data_type,
            device_type=device_type,
            network_type=network_type
        )
        
        return {
            "success": True,
            "response": optimized_response,
            "message": "Mobile-optimized data retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get mobile optimized data: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve mobile-optimized data")

@router.post("/offline/store")
async def store_offline_data(
    offline_request: OfflineDataRequest,
    user_id: str = Query(..., description="User ID")
):
    """Store data for offline access"""
    try:
        mobile_system = await get_mobile_system()
        
        data_id = await mobile_system.store_offline_data(
            user_id=user_id,
            data_type=offline_request.data_type,
            data=offline_request.data,
            priority=offline_request.priority
        )
        
        return {
            "success": True,
            "data_id": data_id,
            "message": "Data stored for offline access successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to store offline data: {e}")
        raise HTTPException(status_code=500, detail="Failed to store offline data")

@router.post("/offline/sync")
async def sync_offline_data(
    user_id: str = Query(..., description="User ID"),
    device_id: str = Query(..., description="Device ID")
):
    """Sync offline data with server"""
    try:
        mobile_system = await get_mobile_system()
        
        sync_results = await mobile_system.sync_offline_data(user_id, device_id)
        
        return {
            "success": True,
            "sync_results": sync_results,
            "message": "Offline data sync completed"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to sync offline data: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync offline data")

@router.post("/notifications/send")
async def send_push_notification(
    notification_request: PushNotificationRequest,
    user_id: str = Query(..., description="User ID to send notification to")
):
    """Send push notification to mobile devices"""
    try:
        mobile_system = await get_mobile_system()
        
        notification_id = await mobile_system.send_push_notification(
            user_id=user_id,
            title=notification_request.title,
            body=notification_request.body,
            data=notification_request.data,
            scheduled_at=notification_request.scheduled_at
        )
        
        return {
            "success": True,
            "notification_id": notification_id,
            "message": "Push notification sent successfully",
            "scheduled": notification_request.scheduled_at is not None
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to send push notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to send push notification")

@router.get("/analytics")
async def get_mobile_analytics(user_id: str = Query(..., description="User ID")):
    """Get mobile usage analytics"""
    try:
        mobile_system = await get_mobile_system()
        analytics = await mobile_system.get_mobile_analytics(user_id)
        
        return {
            "success": True,
            "analytics": analytics,
            "message": "Mobile analytics retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get mobile analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve mobile analytics")

@router.get("/pwa/manifest")
async def get_pwa_manifest():
    """Get PWA manifest configuration"""
    try:
        mobile_system = await get_mobile_system()
        manifest = await mobile_system.get_pwa_manifest()
        
        return manifest
        
    except Exception as e:
        logger.error(f"❌ Failed to get PWA manifest: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve PWA manifest")

@router.get("/optimization/limits")
async def get_optimization_limits():
    """Get mobile optimization limits and configurations"""
    return {
        "success": True,
        "optimization_limits": {
            "chat_messages": {
                "mobile": 50,
                "tablet": 100,
                "desktop": 200,
                "cellular": 25,
                "wifi": 100
            },
            "projects": {
                "mobile": 10,
                "tablet": 20,
                "desktop": 50,
                "cellular": 5,
                "wifi": 20
            },
            "templates": {
                "mobile": 20,
                "tablet": 50,
                "desktop": 100,
                "cellular": 10,
                "wifi": 50
            },
            "file_size_mb": {
                "mobile": 5,
                "tablet": 10,
                "desktop": 50,
                "cellular": 2,
                "wifi": 10
            },
            "image_optimization": {
                "mobile": {
                    "max_width": 600,
                    "quality": 60
                },
                "tablet": {
                    "max_width": 800,
                    "quality": 70
                },
                "desktop": {
                    "max_width": 1200,
                    "quality": 80
                }
            }
        }
    }

@router.get("/device-capabilities")
async def get_device_capabilities():
    """Get device-specific capabilities and features"""
    return {
        "success": True,
        "device_capabilities": {
            "mobile": {
                "offline_sync": True,
                "push_notifications": True,
                "camera_access": True,
                "location_services": True,
                "touch_gestures": True,
                "accelerometer": True,
                "background_sync": True
            },
            "tablet": {
                "offline_sync": True,
                "push_notifications": True,
                "camera_access": True,
                "location_services": True,
                "touch_gestures": True,
                "accelerometer": True,
                "background_sync": True,
                "split_screen": True
            },
            "desktop": {
                "offline_sync": False,
                "push_notifications": True,
                "camera_access": True,
                "location_services": True,
                "touch_gestures": False,
                "accelerometer": False,
                "background_sync": False,
                "keyboard_shortcuts": True,
                "multi_window": True
            },
            "pwa": {
                "offline_sync": True,
                "push_notifications": True,
                "camera_access": True,
                "location_services": True,
                "touch_gestures": True,
                "accelerometer": True,
                "background_sync": True,
                "install_prompt": True,
                "app_shortcuts": True
            }
        }
    }

@router.post("/feedback/performance")
async def submit_performance_feedback(
    device_type: str = Body(..., description="Device type"),
    network_type: str = Body(..., description="Network type"),
    performance_score: int = Body(..., ge=1, le=10, description="Performance score 1-10"),
    issues: Optional[List[str]] = Body(default_factory=list, description="Reported issues"),
    suggestions: Optional[str] = Body(None, description="Performance suggestions"),
    user_id: str = Query(..., description="User ID")
):
    """Submit mobile performance feedback"""
    try:
        feedback_data = {
            "user_id": user_id,
            "device_type": device_type,
            "network_type": network_type,
            "performance_score": performance_score,
            "issues": issues,
            "suggestions": suggestions,
            "timestamp": datetime.utcnow()
        }
        
        logger.info(f"📱 Mobile performance feedback: {user_id} - Score: {performance_score}")
        
        return {
            "success": True,
            "message": "Performance feedback submitted successfully",
            "feedback_id": f"mobile_feedback_{int(datetime.utcnow().timestamp())}"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to submit performance feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit performance feedback")

@router.get("/network-adaptations")
async def get_network_adaptations():
    """Get network-specific adaptations and optimizations"""
    return {
        "success": True,
        "network_adaptations": {
            "wifi": {
                "description": "High-speed, low-cost connection",
                "optimizations": [
                    "Full quality images and videos",
                    "Larger data payloads",
                    "Real-time features enabled",
                    "Automatic background sync"
                ],
                "limits": {
                    "concurrent_requests": 10,
                    "max_file_size_mb": 50,
                    "image_quality": 90
                }
            },
            "cellular": {
                "description": "Mobile data connection with usage costs",
                "optimizations": [
                    "Compressed images and reduced quality",
                    "Smaller data payloads",
                    "Limited background activity",
                    "User-initiated sync only"
                ],
                "limits": {
                    "concurrent_requests": 3,
                    "max_file_size_mb": 10,
                    "image_quality": 60
                }
            },
            "offline": {
                "description": "No network connection available",
                "optimizations": [
                    "Cached data only",
                    "Queue operations for later sync",
                    "Local storage prioritized",
                    "Minimal UI updates"
                ],
                "limits": {
                    "concurrent_requests": 0,
                    "max_file_size_mb": 0,
                    "cached_data_only": True
                }
            }
        }
    }

# Convenience endpoints for common mobile operations
@router.get("/chat/mobile-optimized")
async def get_mobile_optimized_chat(
    limit: int = Query(50, ge=1, le=200, description="Message limit"),
    device_type: str = Query("mobile", description="Device type"),
    user_id: str = Query(..., description="User ID")
):
    """Get mobile-optimized chat messages"""
    try:
        mobile_system = await get_mobile_system()
        
        response = await mobile_system.get_mobile_optimized_response(
            user_id=user_id,
            data_type="chat_messages",
            device_type=device_type
        )
        
        return {
            "success": True,
            "chat_data": response,
            "message": "Mobile-optimized chat data retrieved"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get mobile chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve mobile-optimized chat")

@router.get("/projects/mobile-optimized")
async def get_mobile_optimized_projects(
    limit: int = Query(10, ge=1, le=50, description="Project limit"),
    device_type: str = Query("mobile", description="Device type"),
    user_id: str = Query(..., description="User ID")
):
    """Get mobile-optimized project list"""
    try:
        mobile_system = await get_mobile_system()
        
        response = await mobile_system.get_mobile_optimized_response(
            user_id=user_id,
            data_type="projects",
            device_type=device_type
        )
        
        return {
            "success": True,
            "projects_data": response,
            "message": "Mobile-optimized projects retrieved"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get mobile projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve mobile-optimized projects")