#!/usr/bin/env python3
"""
Mobile Experience Service
Provides PWA, offline sync, and mobile-optimized APIs
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import uuid

class PWAManifest(BaseModel):
    name: str
    short_name: str
    description: str
    start_url: str
    display: str
    theme_color: str
    background_color: str
    icons: List[Dict[str, str]]
    categories: List[str]

class OfflineSyncItem(BaseModel):
    id: str
    user_id: str
    type: str  # "conversation", "template", "project", "settings"
    data: Dict[str, Any]
    timestamp: datetime
    sync_status: str  # "pending", "synced", "conflict", "error"
    conflict_resolution: Optional[str] = None

class MobileConfiguration(BaseModel):
    user_id: str
    device_id: str
    push_notifications: bool
    offline_sync: bool
    data_compression: bool
    image_optimization: bool
    reduced_animations: bool
    dark_mode: bool
    font_scaling: float

class MobileExperienceService:
    def __init__(self):
        self.offline_queue = []
        self.mobile_configs = {}
        self.pwa_manifest = self._generate_pwa_manifest()
        
    def _generate_pwa_manifest(self) -> PWAManifest:
        """Generate Progressive Web App manifest"""
        return PWAManifest(
            name="Aether AI Platform",
            short_name="Aether AI",
            description="Next-generation AI development platform with multi-agent intelligence",
            start_url="/",
            display="standalone",
            theme_color="#1e293b",
            background_color="#0f172a",
            icons=[
                {
                    "src": "/icons/icon-72x72.png",
                    "sizes": "72x72",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "/icons/icon-96x96.png",
                    "sizes": "96x96",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "/icons/icon-128x128.png",
                    "sizes": "128x128",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "/icons/icon-144x144.png",
                    "sizes": "144x144",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "/icons/icon-152x152.png",
                    "sizes": "152x152",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "/icons/icon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "/icons/icon-384x384.png",
                    "sizes": "384x384",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "/icons/icon-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "maskable any"
                }
            ],
            categories=["productivity", "developer-tools", "ai", "automation"]
        )

    async def get_pwa_manifest(self) -> Dict[str, Any]:
        """Get PWA manifest data"""
        return self.pwa_manifest.dict()

    async def get_mobile_health(self) -> Dict[str, Any]:
        """Get mobile service health status"""
        return {
            "status": "healthy",
            "services": {
                "pwa_manifest": "active",
                "offline_sync": "active",
                "push_notifications": "active",
                "mobile_optimization": "active"
            },
            "features": {
                "offline_capable": True,
                "push_notifications": True,
                "background_sync": True,
                "responsive_design": True,
                "touch_optimized": True,
                "app_shell": True,
                "service_worker": True,
                "web_share": True
            },
            "statistics": {
                "total_mobile_users": len(self.mobile_configs),
                "offline_sync_queue_size": len(self.offline_queue),
                "pwa_installations": 247,  # Simulated metric
                "mobile_session_duration": "8.5 minutes"  # Simulated metric
            }
        }

    async def configure_mobile_experience(self, user_id: str, device_id: str, config: Dict[str, Any]) -> MobileConfiguration:
        """Configure mobile experience for user"""
        mobile_config = MobileConfiguration(
            user_id=user_id,
            device_id=device_id,
            push_notifications=config.get("push_notifications", True),
            offline_sync=config.get("offline_sync", True),
            data_compression=config.get("data_compression", True),
            image_optimization=config.get("image_optimization", True),
            reduced_animations=config.get("reduced_animations", False),
            dark_mode=config.get("dark_mode", True),
            font_scaling=config.get("font_scaling", 1.0)
        )
        
        self.mobile_configs[f"{user_id}:{device_id}"] = mobile_config
        return mobile_config

    async def get_mobile_configuration(self, user_id: str, device_id: str) -> Optional[MobileConfiguration]:
        """Get mobile configuration for user"""
        return self.mobile_configs.get(f"{user_id}:{device_id}")

    async def add_to_offline_sync(self, user_id: str, sync_type: str, data: Dict[str, Any]) -> OfflineSyncItem:
        """Add item to offline sync queue"""
        sync_item = OfflineSyncItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            type=sync_type,
            data=data,
            timestamp=datetime.now(),
            sync_status="pending"
        )
        
        self.offline_queue.append(sync_item)
        return sync_item

    async def get_offline_sync_status(self, user_id: str) -> Dict[str, Any]:
        """Get offline sync status for user"""
        user_items = [item for item in self.offline_queue if item.user_id == user_id]
        
        return {
            "total_items": len(user_items),
            "pending": len([item for item in user_items if item.sync_status == "pending"]),
            "synced": len([item for item in user_items if item.sync_status == "synced"]),
            "conflicts": len([item for item in user_items if item.sync_status == "conflict"]),
            "errors": len([item for item in user_items if item.sync_status == "error"]),
            "last_sync": max([item.timestamp for item in user_items], default=datetime.now()).isoformat(),
            "items": [item.dict() for item in user_items[-20:]]  # Last 20 items
        }

    async def process_offline_sync(self, user_id: str) -> Dict[str, Any]:
        """Process offline sync for user"""
        user_items = [item for item in self.offline_queue if item.user_id == user_id and item.sync_status == "pending"]
        
        synced = 0
        conflicts = 0
        errors = 0
        
        for item in user_items:
            try:
                # Simulate sync processing
                if await self._sync_item_to_server(item):
                    item.sync_status = "synced"
                    synced += 1
                else:
                    item.sync_status = "conflict"
                    conflicts += 1
                    
            except Exception as e:
                item.sync_status = "error"
                errors += 1
        
        return {
            "processed": len(user_items),
            "synced": synced,
            "conflicts": conflicts,
            "errors": errors,
            "remaining_pending": len([item for item in self.offline_queue if item.user_id == user_id and item.sync_status == "pending"])
        }

    async def get_mobile_optimized_data(self, user_id: str, data_type: str, limit: int = 50) -> Dict[str, Any]:
        """Get mobile-optimized data for user"""
        # Get user's mobile configuration for optimization settings
        config_key = f"{user_id}:default"  # Default device if not specified
        mobile_config = self.mobile_configs.get(config_key)
        
        optimizations = {
            "data_compression": mobile_config.data_compression if mobile_config else True,
            "image_optimization": mobile_config.image_optimization if mobile_config else True,
            "reduced_payload": True,
            "lazy_loading": True
        }
        
        if data_type == "conversations":
            return await self._get_optimized_conversations(user_id, limit, optimizations)
        elif data_type == "templates":
            return await self._get_optimized_templates(user_id, limit, optimizations)
        elif data_type == "projects":
            return await self._get_optimized_projects(user_id, limit, optimizations)
        else:
            return {"error": "Unknown data type", "supported_types": ["conversations", "templates", "projects"]}

    async def register_push_subscription(self, user_id: str, device_id: str, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register push notification subscription"""
        # Store push subscription data (in real implementation, would use a database)
        subscription_id = str(uuid.uuid4())
        
        return {
            "subscription_id": subscription_id,
            "status": "registered",
            "features": [
                "new_message_notifications",
                "project_updates",
                "system_alerts",
                "collaboration_invites"
            ]
        }

    async def send_push_notification(self, user_id: str, notification: Dict[str, Any]) -> Dict[str, Any]:
        """Send push notification to user"""
        # Simulate sending push notification
        return {
            "status": "sent",
            "notification_id": str(uuid.uuid4()),
            "delivered_to": 1,  # Number of devices
            "timestamp": datetime.now().isoformat()
        }

    # Helper methods for mobile optimization
    async def _sync_item_to_server(self, item: OfflineSyncItem) -> bool:
        """Sync individual item to server"""
        # Simulate server sync with 90% success rate
        import random
        return random.random() > 0.1

    async def _get_optimized_conversations(self, user_id: str, limit: int, optimizations: Dict[str, Any]) -> Dict[str, Any]:
        """Get mobile-optimized conversation data"""
        # Simulate optimized conversation data
        conversations = []
        for i in range(min(limit, 10)):  # Simulate 10 conversations
            conv = {
                "id": f"conv_{i}",
                "title": f"AI Chat {i+1}",
                "last_message": f"Last message preview..." if not optimizations["data_compression"] else "Preview...",
                "timestamp": (datetime.now() - timedelta(hours=i)).isoformat(),
                "message_count": 5 + i,
                "agent_used": ["Dev", "Luna", "Atlas"][i % 3]
            }
            
            # Apply mobile optimizations
            if optimizations["reduced_payload"]:
                conv.pop("message_count", None)  # Remove non-essential data
                
            conversations.append(conv)
            
        return {
            "conversations": conversations,
            "total": len(conversations),
            "optimizations_applied": optimizations
        }

    async def _get_optimized_templates(self, user_id: str, limit: int, optimizations: Dict[str, Any]) -> Dict[str, Any]:
        """Get mobile-optimized template data"""
        templates = []
        for i in range(min(limit, 8)):  # Simulate 8 templates
            template = {
                "id": f"template_{i}",
                "name": f"Mobile Template {i+1}",
                "category": ["React", "Vue", "Angular", "Node.js"][i % 4],
                "description": f"Template description..." if not optimizations["data_compression"] else "Description...",
                "thumbnail": f"/thumbnails/template_{i}.jpg" if not optimizations["image_optimization"] else f"/thumbnails/template_{i}_mobile.webp"
            }
            templates.append(template)
            
        return {
            "templates": templates,
            "total": len(templates),
            "optimizations_applied": optimizations
        }

    async def _get_optimized_projects(self, user_id: str, limit: int, optimizations: Dict[str, Any]) -> Dict[str, Any]:
        """Get mobile-optimized project data"""
        projects = []
        for i in range(min(limit, 5)):  # Simulate 5 projects
            project = {
                "id": f"project_{i}",
                "name": f"Mobile Project {i+1}",
                "status": ["active", "completed", "draft"][i % 3],
                "last_modified": (datetime.now() - timedelta(days=i)).isoformat(),
                "progress": (i + 1) * 20  # 20%, 40%, 60%, etc.
            }
            projects.append(project)
            
        return {
            "projects": projects,
            "total": len(projects),
            "optimizations_applied": optimizations
        }

# Global instance
mobile_experience_service = MobileExperienceService()