"""
Mobile Experience System - Priority 3
Mobile-optimized APIs, offline sync, and push notifications
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
import json
import uuid
import asyncio
import gzip
import base64
from dataclasses import dataclass, asdict
import logging

class DeviceType(Enum):
    MOBILE = "mobile"
    TABLET = "tablet"
    DESKTOP = "desktop"
    UNKNOWN = "unknown"

class OfflineAction(Enum):
    CREATE = "create"
    UPDATE = "update" 
    DELETE = "delete"
    SYNC = "sync"

class NotificationType(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"
    SYSTEM = "system"

@dataclass
class MobileDeviceInfo:
    device_id: str
    user_id: str
    device_type: DeviceType
    platform: str  # iOS, Android, Web
    app_version: str
    os_version: str
    screen_size: Dict[str, int]
    last_sync: datetime
    push_token: Optional[str] = None
    
@dataclass
class OfflineSyncItem:
    id: str
    user_id: str
    device_id: str
    action: OfflineAction
    resource_type: str
    resource_id: str
    data: Dict[str, Any]
    timestamp: datetime
    synced: bool = False
    retry_count: int = 0

@dataclass
class PushNotification:
    id: str
    user_id: str
    title: str
    message: str
    type: NotificationType
    data: Dict[str, Any]
    created_at: datetime
    sent_at: Optional[datetime] = None
    device_tokens: List[str] = None

class MobileExperienceSystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.registered_devices: Dict[str, MobileDeviceInfo] = {}
        self.offline_sync_queue: List[OfflineSyncItem] = []
        self.notification_queue: List[PushNotification] = []
        self.mobile_cache: Dict[str, Dict] = {}
        
    async def register_device(self, user_id: str, device_info: Dict) -> Dict:
        """Register mobile device for optimized experience"""
        device_id = device_info.get("device_id") or str(uuid.uuid4())
        
        # Detect device type from user agent or explicit info
        device_type = self._detect_device_type(device_info)
        
        device = MobileDeviceInfo(
            device_id=device_id,
            user_id=user_id,
            device_type=device_type,
            platform=device_info.get("platform", "unknown"),
            app_version=device_info.get("app_version", "1.0.0"),
            os_version=device_info.get("os_version", "unknown"),
            screen_size=device_info.get("screen_size", {"width": 375, "height": 812}),
            last_sync=datetime.utcnow(),
            push_token=device_info.get("push_token")
        )
        
        self.registered_devices[device_id] = device
        
        # Initialize mobile cache for device
        await self._initialize_mobile_cache(device_id, user_id)
        
        self.logger.info(f"Registered mobile device: {device_id} for user {user_id}")
        return {
            "status": "success",
            "device_id": device_id,
            "optimizations_enabled": True,
            "offline_sync_enabled": True,
            "push_notifications_enabled": device.push_token is not None
        }
    
    def _detect_device_type(self, device_info: Dict) -> DeviceType:
        """Detect device type from provided information"""
        user_agent = device_info.get("user_agent", "").lower()
        screen_size = device_info.get("screen_size", {})
        
        # Explicit device type
        if "device_type" in device_info:
            try:
                return DeviceType(device_info["device_type"])
            except ValueError:
                pass
        
        # Detect from user agent
        if any(keyword in user_agent for keyword in ["mobile", "android", "iphone"]):
            return DeviceType.MOBILE
        elif any(keyword in user_agent for keyword in ["tablet", "ipad"]):
            return DeviceType.TABLET
        
        # Detect from screen size
        width = screen_size.get("width", 1920)
        if width <= 768:
            return DeviceType.MOBILE
        elif width <= 1024:
            return DeviceType.TABLET
        else:
            return DeviceType.DESKTOP
    
    async def _initialize_mobile_cache(self, device_id: str, user_id: str):
        """Initialize mobile-specific cache for offline experience"""
        self.mobile_cache[device_id] = {
            "user_data": await self._get_essential_user_data(user_id),
            "templates": await self._get_mobile_templates(),
            "recent_projects": await self._get_recent_projects(user_id, limit=5),
            "cached_at": datetime.utcnow().isoformat(),
            "cache_version": 1
        }
    
    async def _get_essential_user_data(self, user_id: str) -> Dict:
        """Get essential user data for mobile cache"""
        return {
            "user_id": user_id,
            "profile": {
                "name": "Demo User",
                "email": "demo@aicodestudio.com",
                "subscription": "trial"
            },
            "preferences": {
                "theme": "dark",
                "language": "en",
                "notifications": True
            }
        }
    
    async def _get_mobile_templates(self) -> List[Dict]:
        """Get mobile-optimized templates"""
        return [
            {
                "id": "mobile_app_starter",
                "name": "Mobile App Starter",
                "description": "React Native mobile app template",
                "size": "small",
                "mobile_optimized": True
            },
            {
                "id": "pwa_template", 
                "name": "Progressive Web App",
                "description": "PWA template for mobile-first experience",
                "size": "medium",
                "mobile_optimized": True
            }
        ]
    
    async def _get_recent_projects(self, user_id: str, limit: int = 5) -> List[Dict]:
        """Get recent projects for mobile cache"""
        return [
            {
                "id": f"project_{i}",
                "name": f"Mobile Project {i}",
                "updated_at": (datetime.utcnow() - timedelta(days=i)).isoformat(),
                "status": "active"
            }
            for i in range(1, limit + 1)
        ]
    
    async def get_mobile_optimized_response(self, device_id: str, endpoint: str, 
                                          data: Dict = None) -> Dict:
        """Get mobile-optimized API response"""
        if device_id not in self.registered_devices:
            return {"status": "error", "message": "Device not registered"}
            
        device = self.registered_devices[device_id]
        
        # Apply mobile optimizations based on device type
        if device.device_type == DeviceType.MOBILE:
            optimized_response = await self._apply_mobile_optimizations(endpoint, data, device)
        else:
            optimized_response = await self._apply_standard_response(endpoint, data)
            
        # Add mobile-specific metadata
        optimized_response["mobile_metadata"] = {
            "device_id": device_id,
            "optimized_for": device.device_type.value,
            "response_size": len(json.dumps(optimized_response)),
            "cache_enabled": True,
            "offline_available": await self._check_offline_availability(endpoint)
        }
        
        return optimized_response
    
    async def _apply_mobile_optimizations(self, endpoint: str, data: Dict, 
                                        device: MobileDeviceInfo) -> Dict:
        """Apply mobile-specific optimizations"""
        # Reduce response payload for mobile
        if endpoint == "/api/templates":
            return await self._get_mobile_templates_response(device)
        elif endpoint == "/api/projects":
            return await self._get_mobile_projects_response(device)
        elif endpoint == "/api/ai/chat":
            return await self._get_mobile_ai_response(data, device)
        else:
            return {"status": "success", "data": "Mobile optimized response"}
    
    async def _get_mobile_templates_response(self, device: MobileDeviceInfo) -> Dict:
        """Get mobile-optimized templates response"""
        templates = await self._get_mobile_templates()
        
        # Compress images and reduce metadata for mobile
        for template in templates:
            template["preview_image"] = self._get_compressed_image_url(
                template.get("preview_image", "")
            )
            # Remove unnecessary fields for mobile
            template.pop("full_description", None)
            template.pop("detailed_config", None)
            
        return {
            "status": "success",
            "templates": templates,
            "total_count": len(templates),
            "mobile_optimized": True,
            "cached": True
        }
    
    async def _get_mobile_projects_response(self, device: MobileDeviceInfo) -> Dict:
        """Get mobile-optimized projects response"""
        projects = await self._get_recent_projects(device.user_id, limit=10)
        
        # Simplify project data for mobile
        mobile_projects = []
        for project in projects:
            mobile_projects.append({
                "id": project["id"],
                "name": project["name"],
                "status": project["status"],
                "updated_at": project["updated_at"],
                "mobile_actions": ["view", "edit", "share"]
            })
            
        return {
            "status": "success",
            "projects": mobile_projects,
            "total_count": len(mobile_projects),
            "mobile_optimized": True
        }
    
    async def _get_mobile_ai_response(self, data: Dict, device: MobileDeviceInfo) -> Dict:
        """Get mobile-optimized AI response"""
        # Shorter responses for mobile screens
        mobile_response = {
            "status": "success",
            "response": "This is a mobile-optimized AI response that's concise and easy to read on small screens.",
            "mobile_formatted": True,
            "response_length": "short",
            "actions": [
                {"type": "copy", "label": "Copy"},
                {"type": "share", "label": "Share"},
                {"type": "save", "label": "Save"}
            ]
        }
        
        return mobile_response
    
    def _get_compressed_image_url(self, image_url: str) -> str:
        """Get compressed image URL for mobile"""
        if not image_url:
            return ""
        # In production, this would return actual compressed image URLs
        return image_url.replace(".jpg", "_mobile.jpg").replace(".png", "_mobile.png")
    
    async def _apply_standard_response(self, endpoint: str, data: Dict) -> Dict:
        """Apply standard response for non-mobile devices"""
        return {
            "status": "success",
            "data": "Standard response",
            "full_metadata": True
        }
    
    async def _check_offline_availability(self, endpoint: str) -> bool:
        """Check if endpoint data is available offline"""
        offline_endpoints = ["/api/templates", "/api/projects", "/api/user/profile"]
        return endpoint in offline_endpoints
    
    async def sync_offline_data(self, device_id: str, offline_items: List[Dict]) -> Dict:
        """Sync offline data from mobile device"""
        if device_id not in self.registered_devices:
            return {"status": "error", "message": "Device not registered"}
            
        device = self.registered_devices[device_id]
        sync_results = []
        
        for item_data in offline_items:
            sync_item = OfflineSyncItem(
                id=item_data.get("id", str(uuid.uuid4())),
                user_id=device.user_id,
                device_id=device_id,
                action=OfflineAction(item_data["action"]),
                resource_type=item_data["resource_type"],
                resource_id=item_data["resource_id"],
                data=item_data["data"],
                timestamp=datetime.fromisoformat(item_data["timestamp"])
            )
            
            result = await self._process_sync_item(sync_item)
            sync_results.append(result)
            
        # Update device last sync time
        device.last_sync = datetime.utcnow()
        
        return {
            "status": "success",
            "synced_items": len(sync_results),
            "successful_syncs": len([r for r in sync_results if r["status"] == "success"]),
            "failed_syncs": len([r for r in sync_results if r["status"] == "failed"]),
            "last_sync": device.last_sync.isoformat(),
            "results": sync_results
        }
    
    async def _process_sync_item(self, sync_item: OfflineSyncItem) -> Dict:
        """Process individual offline sync item"""
        try:
            if sync_item.action == OfflineAction.CREATE:
                result = await self._sync_create_item(sync_item)
            elif sync_item.action == OfflineAction.UPDATE:
                result = await self._sync_update_item(sync_item)
            elif sync_item.action == OfflineAction.DELETE:
                result = await self._sync_delete_item(sync_item)
            else:
                result = {"status": "error", "message": "Unknown sync action"}
                
            sync_item.synced = result["status"] == "success"
            return result
            
        except Exception as e:
            self.logger.error(f"Sync item processing failed: {sync_item.id} - {str(e)}")
            return {"status": "failed", "error": str(e), "item_id": sync_item.id}
    
    async def _sync_create_item(self, sync_item: OfflineSyncItem) -> Dict:
        """Sync create operation"""
        # Simulate creating item in backend
        await asyncio.sleep(0.1)
        return {
            "status": "success",
            "item_id": sync_item.id,
            "action": "created",
            "resource_type": sync_item.resource_type
        }
    
    async def _sync_update_item(self, sync_item: OfflineSyncItem) -> Dict:
        """Sync update operation"""
        # Simulate updating item in backend
        await asyncio.sleep(0.1)
        return {
            "status": "success", 
            "item_id": sync_item.id,
            "action": "updated",
            "resource_type": sync_item.resource_type
        }
    
    async def _sync_delete_item(self, sync_item: OfflineSyncItem) -> Dict:
        """Sync delete operation"""
        # Simulate deleting item in backend
        await asyncio.sleep(0.1)
        return {
            "status": "success",
            "item_id": sync_item.id,
            "action": "deleted",
            "resource_type": sync_item.resource_type
        }
    
    async def send_push_notification(self, user_id: str, title: str, message: str,
                                   notification_type: NotificationType = NotificationType.INFO,
                                   data: Dict = None) -> Dict:
        """Send push notification to user's mobile devices"""
        # Find user's devices with push tokens
        user_devices = [
            device for device in self.registered_devices.values()
            if device.user_id == user_id and device.push_token
        ]
        
        if not user_devices:
            return {
                "status": "error",
                "message": "No devices with push tokens found for user"
            }
            
        notification = PushNotification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            data=data or {},
            created_at=datetime.utcnow(),
            device_tokens=[device.push_token for device in user_devices]
        )
        
        # Simulate sending push notification
        await self._send_push_to_devices(notification)
        
        notification.sent_at = datetime.utcnow()
        self.notification_queue.append(notification)
        
        return {
            "status": "success",
            "notification_id": notification.id,
            "devices_notified": len(user_devices),
            "sent_at": notification.sent_at.isoformat()
        }
    
    async def _send_push_to_devices(self, notification: PushNotification):
        """Send push notification to devices (simulation)"""
        # In production, integrate with FCM, APNs, etc.
        await asyncio.sleep(0.1)
        self.logger.info(f"Push notification sent: {notification.id} to {len(notification.device_tokens)} devices")
    
    async def get_mobile_cache(self, device_id: str) -> Dict:
        """Get mobile cache data for offline experience"""
        if device_id not in self.mobile_cache:
            return {"status": "error", "message": "No cache data found"}
            
        cache_data = self.mobile_cache[device_id]
        
        return {
            "status": "success",
            "cache_data": cache_data,
            "cache_version": cache_data["cache_version"],
            "cached_at": cache_data["cached_at"],
            "size_kb": len(json.dumps(cache_data)) / 1024
        }
    
    async def update_mobile_cache(self, device_id: str, cache_updates: Dict) -> Dict:
        """Update mobile cache data"""
        if device_id not in self.mobile_cache:
            await self._initialize_mobile_cache(
                device_id, 
                self.registered_devices[device_id].user_id
            )
            
        cache = self.mobile_cache[device_id]
        
        # Update cache with new data
        for key, value in cache_updates.items():
            cache[key] = value
            
        cache["cached_at"] = datetime.utcnow().isoformat()
        cache["cache_version"] += 1
        
        return {
            "status": "success",
            "cache_version": cache["cache_version"],
            "updated_fields": list(cache_updates.keys())
        }
    
    async def get_mobile_analytics(self, user_id: str = None) -> Dict:
        """Get mobile usage analytics"""
        devices = list(self.registered_devices.values())
        
        if user_id:
            devices = [d for d in devices if d.user_id == user_id]
            
        analytics = {
            "total_devices": len(devices),
            "device_types": {
                "mobile": len([d for d in devices if d.device_type == DeviceType.MOBILE]),
                "tablet": len([d for d in devices if d.device_type == DeviceType.TABLET]),
                "desktop": len([d for d in devices if d.device_type == DeviceType.DESKTOP])
            },
            "platforms": {},
            "push_enabled_devices": len([d for d in devices if d.push_token]),
            "recent_syncs": len([d for d in devices if d.last_sync > datetime.utcnow() - timedelta(days=1)]),
            "offline_sync_queue_size": len(self.offline_sync_queue),
            "notification_queue_size": len(self.notification_queue)
        }
        
        # Platform distribution
        for device in devices:
            platform = device.platform
            analytics["platforms"][platform] = analytics["platforms"].get(platform, 0) + 1
            
        return {
            "status": "success",
            "analytics": analytics,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    async def optimize_for_network(self, data: Dict, connection_type: str = "mobile") -> Dict:
        """Optimize data for different network conditions"""
        if connection_type == "mobile" or connection_type == "slow":
            # Compress data for slow connections
            compressed_data = await self._compress_response_data(data)
            return {
                "data": compressed_data,
                "optimized_for": connection_type,
                "compression_ratio": len(json.dumps(compressed_data)) / len(json.dumps(data)),
                "optimization_applied": True
            }
        else:
            return {
                "data": data,
                "optimized_for": connection_type,
                "optimization_applied": False
            }
    
    async def _compress_response_data(self, data: Dict) -> Dict:
        """Compress response data for mobile networks"""
        # Remove unnecessary fields
        compressed = data.copy()
        
        # Remove verbose descriptions, large images, etc.
        if "description" in compressed and len(compressed["description"]) > 100:
            compressed["description"] = compressed["description"][:100] + "..."
            
        # Compress arrays by limiting items
        for key, value in compressed.items():
            if isinstance(value, list) and len(value) > 10:
                compressed[key] = value[:10]
                compressed[f"{key}_truncated"] = True
                
        return compressed