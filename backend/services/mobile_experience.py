# ISSUE #6: MOBILE EXPERIENCE & ACCESSIBILITY
# Mobile-optimized APIs, PWA, and mobile-specific features

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from enum import Enum
from motor.motor_asyncio import AsyncIOMotorDatabase


class MobileDeviceType(Enum):
    """Types of mobile devices"""
    PHONE = "phone"
    TABLET = "tablet"
    DESKTOP = "desktop"
    UNKNOWN = "unknown"


class MobileNotificationType(Enum):
    """Types of mobile notifications"""
    PUSH = "push"
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"


class MobileExperience:
    """
    Mobile experience optimization addressing competitive gap:
    No dedicated mobile app or mobile-optimized experience
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.mobile_sessions_collection = db.mobile_sessions
        self.mobile_preferences_collection = db.mobile_preferences
        self.offline_data_collection = db.offline_data
        self.push_subscriptions_collection = db.push_subscriptions
        self.mobile_analytics_collection = db.mobile_analytics
        
    async def initialize(self):
        """Initialize mobile experience system"""
        await self._setup_mobile_tracking()
        await self._setup_offline_sync()
        await self._setup_push_notifications()
        await self._setup_mobile_analytics()
        await self._setup_pwa_optimization()
        
    # MOBILE-OPTIMIZED APIS
    async def _setup_mobile_tracking(self):
        """Setup mobile session and device tracking"""
        await self.mobile_sessions_collection.create_index([
            ("user_id", 1),
            ("device_type", 1),
            ("session_start", -1)
        ])
        
        await self.mobile_preferences_collection.create_index([
            ("user_id", 1),
            ("device_id", 1)
        ])
        
    async def create_mobile_session(self, session_data: Dict[str, Any]) -> str:
        """Create mobile session with device-specific optimizations"""
        session_id = str(uuid.uuid4())
        
        # Detect device type
        device_type = await self._detect_device_type(session_data.get("user_agent", ""))
        
        session_record = {
            "session_id": session_id,
            "user_id": session_data.get("user_id"),
            "device_id": session_data.get("device_id"),
            "device_type": device_type.value,
            "user_agent": session_data.get("user_agent", ""),
            "screen_resolution": session_data.get("screen_resolution"),
            "viewport_size": session_data.get("viewport_size"),
            "connection_type": session_data.get("connection_type", "unknown"),
            "session_start": datetime.now(timezone.utc),
            "session_end": None,
            "is_pwa": session_data.get("is_pwa", False),
            "is_offline_capable": session_data.get("is_offline_capable", False),
            "location": session_data.get("location"),
            "battery_level": session_data.get("battery_level"),
            "network_speed": session_data.get("network_speed"),
            
            # Mobile-specific metrics
            "touch_interactions": 0,
            "swipe_gestures": 0,
            "pinch_zooms": 0,
            "orientation_changes": 0,
            "background_switches": 0
        }
        
        await self.mobile_sessions_collection.insert_one(session_record)
        
        # Initialize mobile preferences if new device
        await self._initialize_mobile_preferences(session_data.get("user_id"), session_data.get("device_id"), device_type)
        
        return session_id
        
    async def _detect_device_type(self, user_agent: str) -> MobileDeviceType:
        """Detect device type from user agent"""
        user_agent_lower = user_agent.lower()
        
        if any(mobile in user_agent_lower for mobile in ["mobile", "android", "iphone"]):
            return MobileDeviceType.PHONE
        elif any(tablet in user_agent_lower for tablet in ["tablet", "ipad"]):
            return MobileDeviceType.TABLET
        elif any(desktop in user_agent_lower for desktop in ["windows", "macintosh", "linux"]):
            return MobileDeviceType.DESKTOP
        else:
            return MobileDeviceType.UNKNOWN
            
    async def _initialize_mobile_preferences(self, user_id: str, device_id: str, device_type: MobileDeviceType):
        """Initialize mobile-specific user preferences"""
        if not user_id or not device_id:
            return
            
        # Check if preferences already exist
        existing = await self.mobile_preferences_collection.find_one({
            "user_id": user_id,
            "device_id": device_id
        })
        
        if existing:
            return
            
        # Create default mobile preferences
        default_preferences = {
            "user_id": user_id,
            "device_id": device_id,
            "device_type": device_type.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            
            # UI Preferences
            "theme": "system",  # system, light, dark
            "text_size": "medium",  # small, medium, large, xlarge
            "gesture_navigation": True,
            "haptic_feedback": True,
            "reduce_animations": False,
            
            # Performance Preferences
            "data_saver_mode": False,
            "offline_sync_enabled": True,
            "background_refresh": True,
            "push_notifications_enabled": True,
            "location_services": False,
            
            # Accessibility
            "high_contrast": False,
            "screen_reader_optimized": False,
            "voice_commands": False,
            "large_touch_targets": False,
            
            # Content Preferences
            "mobile_layout": "compact",  # compact, comfortable, spacious
            "image_quality": "auto",  # low, medium, high, auto
            "auto_play_media": False,
            "preload_content": True
        }
        
        await self.mobile_preferences_collection.insert_one(default_preferences)
        
    async def get_mobile_optimized_response(self, user_id: str, device_id: str, 
                                          original_response: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize API response for mobile device"""
        # Get mobile preferences
        preferences = await self.mobile_preferences_collection.find_one({
            "user_id": user_id,
            "device_id": device_id
        })
        
        if not preferences:
            return original_response
            
        # Apply mobile optimizations
        optimized_response = original_response.copy()
        
        # Reduce response size for data saver mode
        if preferences.get("data_saver_mode", False):
            optimized_response = await self._apply_data_saver_optimizations(optimized_response)
            
        # Optimize for device type
        device_type = preferences.get("device_type", "unknown")
        if device_type == MobileDeviceType.PHONE.value:
            optimized_response = await self._apply_phone_optimizations(optimized_response)
        elif device_type == MobileDeviceType.TABLET.value:
            optimized_response = await self._apply_tablet_optimizations(optimized_response)
            
        # Apply accessibility optimizations
        if preferences.get("screen_reader_optimized", False):
            optimized_response = await self._apply_accessibility_optimizations(optimized_response)
            
        return optimized_response
        
    async def _apply_data_saver_optimizations(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Apply data saver optimizations to reduce response size"""
        # Remove non-essential data
        if "metadata" in response:
            response["metadata"] = {}
            
        # Compress text responses
        if "content" in response and len(response["content"]) > 500:
            response["content"] = response["content"][:500] + "..."
            response["truncated"] = True
            
        # Remove large arrays
        for key, value in response.items():
            if isinstance(value, list) and len(value) > 10:
                response[key] = value[:10]
                response[f"{key}_truncated"] = True
                
        return response
        
    async def _apply_phone_optimizations(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Apply phone-specific optimizations"""
        # Optimize for small screens
        if "ui_components" in response:
            for component in response["ui_components"]:
                component["mobile_optimized"] = True
                component["touch_friendly"] = True
                
        # Prioritize essential information
        if "sections" in response:
            # Move most important sections to the top
            important_sections = ["primary", "main", "essential"]
            response["sections"] = sorted(
                response["sections"],
                key=lambda x: 0 if x.get("priority") in important_sections else 1
            )
            
        return response
        
    async def _apply_tablet_optimizations(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Apply tablet-specific optimizations"""
        # Optimize for medium screens
        if "layout" in response:
            response["layout"]["tablet_columns"] = 2
            response["layout"]["touch_optimized"] = True
            
        return response
        
    async def _apply_accessibility_optimizations(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Apply accessibility optimizations"""
        # Add aria labels and descriptions
        if "ui_components" in response:
            for component in response["ui_components"]:
                if "label" in component and "aria_label" not in component:
                    component["aria_label"] = component["label"]
                if "description" not in component:
                    component["description"] = f"Interactive {component.get('type', 'element')}"
                    
        return response
        
    # OFFLINE SYNC SYSTEM
    async def _setup_offline_sync(self):
        """Setup offline data synchronization"""
        await self.offline_data_collection.create_index([
            ("user_id", 1),
            ("device_id", 1),
            ("sync_status", 1),
            ("created_at", -1)
        ])
        
    async def store_offline_data(self, user_id: str, device_id: str, data: Dict[str, Any]) -> str:
        """Store data for offline sync"""
        offline_record_id = str(uuid.uuid4())
        
        offline_record = {
            "offline_id": offline_record_id,
            "user_id": user_id,
            "device_id": device_id,
            "data": data,
            "data_type": data.get("type", "unknown"),
            "action": data.get("action", "create"),  # create, update, delete
            "created_at": datetime.now(timezone.utc),
            "sync_status": "pending",
            "sync_attempts": 0,
            "last_sync_attempt": None,
            "sync_error": None,
            "priority": data.get("priority", "normal")  # high, normal, low
        }
        
        await self.offline_data_collection.insert_one(offline_record)
        return offline_record_id
        
    async def sync_offline_data(self, user_id: str, device_id: str) -> Dict[str, Any]:
        """Sync offline data when connection is restored"""
        # Get pending offline data
        pending_data = await self.offline_data_collection.find({
            "user_id": user_id,
            "device_id": device_id,
            "sync_status": "pending"
        }).sort([("priority", -1), ("created_at", 1)]).to_list(length=None)
        
        sync_results = {
            "total_items": len(pending_data),
            "synced": 0,
            "failed": 0,
            "errors": []
        }
        
        for record in pending_data:
            try:
                # Attempt to sync data
                await self._sync_single_record(record)
                
                # Mark as synced
                await self.offline_data_collection.update_one(
                    {"offline_id": record["offline_id"]},
                    {
                        "$set": {
                            "sync_status": "synced",
                            "last_sync_attempt": datetime.now(timezone.utc)
                        },
                        "$inc": {"sync_attempts": 1}
                    }
                )
                
                sync_results["synced"] += 1
                
            except Exception as e:
                # Mark sync attempt
                await self.offline_data_collection.update_one(
                    {"offline_id": record["offline_id"]},
                    {
                        "$set": {
                            "sync_status": "failed",
                            "last_sync_attempt": datetime.now(timezone.utc),
                            "sync_error": str(e)
                        },
                        "$inc": {"sync_attempts": 1}
                    }
                )
                
                sync_results["failed"] += 1
                sync_results["errors"].append({
                    "record_id": record["offline_id"],
                    "error": str(e)
                })
                
        return sync_results
        
    async def _sync_single_record(self, record: Dict[str, Any]):
        """Sync a single offline record"""
        data = record["data"]
        action = record["action"]
        
        # This would contain actual sync logic based on data type and action
        # For now, simulate sync processing
        await asyncio.sleep(0.1)
        
        # In production, this would:
        # - Apply the action to the server
        # - Handle conflicts
        # - Update related data
        # - Trigger notifications if needed
        
    async def get_offline_data(self, user_id: str, device_id: str, data_types: List[str] = None) -> List[Dict[str, Any]]:
        """Get offline data for mobile app caching"""
        query = {
            "user_id": user_id,
            "device_id": device_id,
            "sync_status": {"$in": ["synced", "cached"]}
        }
        
        if data_types:
            query["data_type"] = {"$in": data_types}
            
        cursor = self.offline_data_collection.find(query).sort([("created_at", -1)]).limit(100)
        offline_data = await cursor.to_list(length=None)
        
        # Prepare data for mobile consumption
        mobile_data = []
        for record in offline_data:
            mobile_record = {
                "id": record["offline_id"],
                "type": record["data_type"],
                "data": record["data"],
                "last_updated": record["created_at"],
                "cache_expiry": await self._calculate_cache_expiry(record["data_type"])
            }
            mobile_data.append(mobile_record)
            
        return mobile_data
        
    async def _calculate_cache_expiry(self, data_type: str) -> datetime:
        """Calculate cache expiry time based on data type"""
        cache_durations = {
            "user_profile": 24 * 60 * 60,  # 24 hours
            "templates": 12 * 60 * 60,     # 12 hours
            "projects": 6 * 60 * 60,       # 6 hours
            "conversations": 2 * 60 * 60,  # 2 hours
            "default": 1 * 60 * 60         # 1 hour
        }
        
        duration_seconds = cache_durations.get(data_type, cache_durations["default"])
        return datetime.now(timezone.utc).timestamp() + duration_seconds
        
    # PUSH NOTIFICATIONS
    async def _setup_push_notifications(self):
        """Setup push notification system"""
        await self.push_subscriptions_collection.create_index([
            ("user_id", 1),
            ("device_id", 1),
            ("active", 1)
        ])
        
    async def register_push_subscription(self, subscription_data: Dict[str, Any]) -> str:
        """Register push notification subscription"""
        subscription_id = str(uuid.uuid4())
        
        subscription_record = {
            "subscription_id": subscription_id,
            "user_id": subscription_data["user_id"],
            "device_id": subscription_data["device_id"],
            "endpoint": subscription_data["endpoint"],
            "keys": subscription_data["keys"],
            "user_agent": subscription_data.get("user_agent", ""),
            "created_at": datetime.now(timezone.utc),
            "last_used": datetime.now(timezone.utc),
            "active": True,
            
            # Notification preferences
            "notification_types": subscription_data.get("notification_types", ["all"]),
            "quiet_hours": subscription_data.get("quiet_hours", {}),
            "frequency": subscription_data.get("frequency", "immediate"),  # immediate, hourly, daily
            "priority_only": subscription_data.get("priority_only", False)
        }
        
        await self.push_subscriptions_collection.insert_one(subscription_record)
        return subscription_id
        
    async def send_push_notification(self, user_id: str, notification: Dict[str, Any], 
                                   target_devices: List[str] = None) -> Dict[str, Any]:
        """Send push notification to user's devices"""
        # Get active subscriptions
        query = {"user_id": user_id, "active": True}
        if target_devices:
            query["device_id"] = {"$in": target_devices}
            
        subscriptions = await self.push_subscriptions_collection.find(query).to_list(length=None)
        
        if not subscriptions:
            return {"sent": 0, "failed": 0, "errors": ["No active subscriptions found"]}
            
        results = {
            "sent": 0,
            "failed": 0,
            "errors": []
        }
        
        for subscription in subscriptions:
            try:
                # Check if notification should be sent based on preferences
                if not await self._should_send_notification(subscription, notification):
                    continue
                    
                # Send notification (would integrate with actual push service)
                await self._send_push_to_device(subscription, notification)
                
                # Update last used
                await self.push_subscriptions_collection.update_one(
                    {"subscription_id": subscription["subscription_id"]},
                    {"$set": {"last_used": datetime.now(timezone.utc)}}
                )
                
                results["sent"] += 1
                
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "device_id": subscription["device_id"],
                    "error": str(e)
                })
                
        return results
        
    async def _should_send_notification(self, subscription: Dict[str, Any], notification: Dict[str, Any]) -> bool:
        """Check if notification should be sent based on user preferences"""
        # Check notification type preferences
        notification_types = subscription.get("notification_types", ["all"])
        notification_type = notification.get("type", "general")
        
        if "all" not in notification_types and notification_type not in notification_types:
            return False
            
        # Check priority settings
        if subscription.get("priority_only", False) and notification.get("priority", "normal") != "high":
            return False
            
        # Check quiet hours
        quiet_hours = subscription.get("quiet_hours", {})
        if quiet_hours:
            current_hour = datetime.now(timezone.utc).hour
            start_hour = quiet_hours.get("start", 22)  # 10 PM
            end_hour = quiet_hours.get("end", 8)       # 8 AM
            
            if start_hour <= current_hour or current_hour <= end_hour:
                return False
                
        return True
        
    async def _send_push_to_device(self, subscription: Dict[str, Any], notification: Dict[str, Any]):
        """Send push notification to specific device"""
        # This would integrate with actual push notification service (FCM, APNS, etc.)
        # For now, simulate sending
        await asyncio.sleep(0.1)
        
        # In production, would:
        # - Format notification for device type
        # - Send via appropriate service (FCM for Android, APNS for iOS)
        # - Handle delivery receipts
        # - Manage retry logic
        
    # PWA OPTIMIZATION
    async def _setup_pwa_optimization(self):
        """Setup Progressive Web App optimizations"""
        pass  # PWA optimizations are mostly frontend-focused
        
    async def get_pwa_manifest(self, user_id: str = None) -> Dict[str, Any]:
        """Get PWA manifest optimized for user preferences"""
        base_manifest = {
            "name": "Aether AI",
            "short_name": "Aether",
            "description": "Next-generation AI development platform",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#3b82f6",
            "orientation": "any",
            "icons": [
                {
                    "src": "/icons/icon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/icons/icon-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ],
            "screenshots": [
                {
                    "src": "/screenshots/mobile-screenshot.png",
                    "sizes": "1080x1920",
                    "type": "image/png",
                    "form_factor": "narrow"
                }
            ],
            "shortcuts": [
                {
                    "name": "New Chat",
                    "short_name": "Chat",
                    "description": "Start a new AI conversation",
                    "url": "/chat",
                    "icons": [{"src": "/icons/chat-icon.png", "sizes": "96x96"}]
                }
            ],
            "categories": ["productivity", "developer", "ai"],
            "prefer_related_applications": False
        }
        
        # Customize based on user preferences if provided
        if user_id:
            preferences = await self.mobile_preferences_collection.find_one({"user_id": user_id})
            if preferences:
                # Customize theme based on user preference
                if preferences.get("theme") == "dark":
                    base_manifest["background_color"] = "#1f2937"
                    base_manifest["theme_color"] = "#374151"
                    
        return base_manifest
        
    # MOBILE ANALYTICS
    async def _setup_mobile_analytics(self):
        """Setup mobile-specific analytics"""
        await self.mobile_analytics_collection.create_index([
            ("user_id", 1),
            ("device_type", 1),
            ("event_type", 1),
            ("timestamp", -1)
        ])
        
    async def track_mobile_event(self, event_data: Dict[str, Any]) -> str:
        """Track mobile-specific events"""
        event_id = str(uuid.uuid4())
        
        analytics_record = {
            "event_id": event_id,
            "user_id": event_data.get("user_id"),
            "session_id": event_data.get("session_id"),
            "device_id": event_data.get("device_id"),
            "device_type": event_data.get("device_type"),
            "event_type": event_data["event_type"],
            "event_data": event_data.get("event_data", {}),
            "timestamp": datetime.now(timezone.utc),
            
            # Mobile-specific metrics
            "viewport_size": event_data.get("viewport_size"),
            "orientation": event_data.get("orientation"),
            "connection_type": event_data.get("connection_type"),
            "battery_level": event_data.get("battery_level"),
            "memory_usage": event_data.get("memory_usage"),
            "load_time": event_data.get("load_time"),
            "is_offline": event_data.get("is_offline", False),
            "gesture_type": event_data.get("gesture_type"),  # tap, swipe, pinch, etc.
            
            # Performance metrics
            "render_time": event_data.get("render_time"),
            "interaction_delay": event_data.get("interaction_delay"),
            "network_latency": event_data.get("network_latency")
        }
        
        await self.mobile_analytics_collection.insert_one(analytics_record)
        return event_id
        
    async def get_mobile_analytics(self, user_id: str = None, days: int = 7) -> Dict[str, Any]:
        """Get mobile analytics summary"""
        from_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        from_date = from_date.replace(day=from_date.day - days)
        
        query = {"timestamp": {"$gte": from_date}}
        if user_id:
            query["user_id"] = user_id
            
        # Device type distribution
        device_pipeline = [
            {"$match": query},
            {"$group": {"_id": "$device_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        device_stats = await self.mobile_analytics_collection.aggregate(device_pipeline).to_list(length=None)
        
        # Most common events
        event_pipeline = [
            {"$match": query},
            {"$group": {"_id": "$event_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        event_stats = await self.mobile_analytics_collection.aggregate(event_pipeline).to_list(length=None)
        
        # Performance metrics
        performance_pipeline = [
            {"$match": {**query, "load_time": {"$exists": True}}},
            {"$group": {
                "_id": None,
                "avg_load_time": {"$avg": "$load_time"},
                "avg_render_time": {"$avg": "$render_time"},
                "avg_interaction_delay": {"$avg": "$interaction_delay"}
            }}
        ]
        performance_stats = await self.mobile_analytics_collection.aggregate(performance_pipeline).to_list(length=1)
        
        return {
            "period_days": days,
            "total_events": await self.mobile_analytics_collection.count_documents(query),
            "device_distribution": {item["_id"]: item["count"] for item in device_stats},
            "top_events": event_stats,
            "performance_metrics": performance_stats[0] if performance_stats else {},
            "mobile_vs_desktop": await self._calculate_mobile_vs_desktop_usage(query)
        }
        
    async def _calculate_mobile_vs_desktop_usage(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate mobile vs desktop usage statistics"""
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": {
                    "$cond": {
                        "if": {"$in": ["$device_type", ["phone", "tablet"]]},
                        "then": "mobile",
                        "else": "desktop"
                    }
                },
                "count": {"$sum": 1},
                "unique_users": {"$addToSet": "$user_id"}
            }}
        ]
        
        results = await self.mobile_analytics_collection.aggregate(pipeline).to_list(length=None)
        
        mobile_data = next((r for r in results if r["_id"] == "mobile"), {"count": 0, "unique_users": []})
        desktop_data = next((r for r in results if r["_id"] == "desktop"), {"count": 0, "unique_users": []})
        
        total_events = mobile_data["count"] + desktop_data["count"]
        
        return {
            "mobile_percentage": (mobile_data["count"] / total_events * 100) if total_events > 0 else 0,
            "desktop_percentage": (desktop_data["count"] / total_events * 100) if total_events > 0 else 0,
            "mobile_users": len(mobile_data["unique_users"]),
            "desktop_users": len(desktop_data["unique_users"]),
            "mobile_events": mobile_data["count"],
            "desktop_events": desktop_data["count"]
        }


# Global mobile experience instance
mobile_experience = None


async def initialize_mobile_system(db: AsyncIOMotorDatabase):
    """Initialize mobile experience system"""
    global mobile_experience
    mobile_experience = MobileExperience(db)
    await mobile_experience.initialize()


async def create_mobile_session(session_data: Dict[str, Any]) -> str:
    """Create optimized mobile session"""
    return await mobile_experience.create_mobile_session(session_data)


async def get_mobile_optimized_data(user_id: str, device_id: str, original_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get mobile-optimized API response"""
    return await mobile_experience.get_mobile_optimized_response(user_id, device_id, original_data)


async def sync_offline_data(user_id: str, device_id: str) -> Dict[str, Any]:
    """Sync offline data"""
    return await mobile_experience.sync_offline_data(user_id, device_id)


async def register_push_notifications(subscription_data: Dict[str, Any]) -> str:
    """Register push notification subscription"""
    return await mobile_experience.register_push_subscription(subscription_data)


async def send_mobile_notification(user_id: str, notification: Dict[str, Any], target_devices: List[str] = None) -> Dict[str, Any]:
    """Send push notification"""
    return await mobile_experience.send_push_notification(user_id, notification, target_devices)


async def get_pwa_config(user_id: str = None) -> Dict[str, Any]:
    """Get PWA manifest"""
    return await mobile_experience.get_pwa_manifest(user_id)


async def track_mobile_analytics(event_data: Dict[str, Any]) -> str:
    """Track mobile event"""
    return await mobile_experience.track_mobile_event(event_data)


async def get_mobile_stats(user_id: str = None, days: int = 7) -> Dict[str, Any]:
    """Get mobile analytics"""
    return await mobile_experience.get_mobile_analytics(user_id, days)