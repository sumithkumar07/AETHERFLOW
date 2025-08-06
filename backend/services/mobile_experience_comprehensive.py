# Mobile Experience & Accessibility Enhancement
# Issue #6: Mobile Experience & Accessibility

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
import httpx
from fastapi import WebSocket
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

class DeviceType(Enum):
    MOBILE = "mobile"
    TABLET = "tablet"
    DESKTOP = "desktop"
    SMARTWATCH = "smartwatch"

class PlatformType(Enum):
    IOS = "ios"
    ANDROID = "android"
    WEB = "web"
    PWA = "pwa"

class OfflineSyncStatus(Enum):
    SYNCED = "synced"
    PENDING = "pending"
    FAILED = "failed"
    OFFLINE = "offline"

class AccessibilityLevel(Enum):
    AA = "wcag_aa"
    AAA = "wcag_aaa"
    SECTION_508 = "section_508"

@dataclass
class MobileSession:
    session_id: str
    user_id: str
    device_type: DeviceType
    platform: PlatformType
    user_agent: str
    screen_resolution: str
    connection_type: str
    created_at: datetime
    last_active: datetime
    offline_capable: bool = False
    push_enabled: bool = False

@dataclass
class OfflineData:
    data_id: str
    user_id: str
    data_type: str
    payload: Dict[str, Any]
    created_offline: datetime
    sync_status: OfflineSyncStatus
    sync_attempts: int = 0
    last_sync_attempt: Optional[datetime] = None
    error_message: Optional[str] = None

@dataclass
class PushNotification:
    notification_id: str
    user_id: str
    title: str
    body: str
    data: Dict[str, Any]
    scheduled_at: datetime
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    platform: PlatformType = PlatformType.WEB

@dataclass
class AccessibilityAudit:
    audit_id: str
    page_url: str
    accessibility_level: AccessibilityLevel
    score: float
    violations: List[Dict[str, Any]]
    timestamp: datetime
    recommendations: List[str]

class MobileExperienceComprehensive:
    """
    Mobile Experience & Accessibility Enhancement
    - Mobile-optimized API responses
    - Offline data synchronization
    - Push notification service
    - Progressive Web App optimization
    - WCAG accessibility compliance
    - Touch-friendly interface optimization
    """
    
    def __init__(self):
        self.mobile_sessions: Dict[str, MobileSession] = {}
        self.offline_data_queue: List[OfflineData] = []
        self.push_notifications: List[PushNotification] = []
        self.accessibility_audits: List[AccessibilityAudit] = []
        self.websocket_connections: Dict[str, WebSocket] = {}
        
    async def initialize(self):
        """Initialize mobile experience services"""
        try:
            await self._setup_mobile_optimization()
            await self._initialize_offline_sync()
            await self._setup_push_notifications()
            await self._configure_accessibility()
            await self._setup_pwa_optimization()
            
            logger.info("📱 Mobile Experience Comprehensive initialized")
            return True
        except Exception as e:
            logger.error(f"Mobile experience initialization failed: {e}")
            return False
    
    # =============================================================================
    # MOBILE SESSION MANAGEMENT
    # =============================================================================
    
    async def create_mobile_session(
        self,
        user_id: str,
        user_agent: str,
        screen_resolution: str,
        connection_type: str = "unknown"
    ) -> str:
        """Create optimized mobile session"""
        
        session_id = str(uuid.uuid4())
        
        # Detect device type from user agent
        device_type = self._detect_device_type(user_agent)
        platform = self._detect_platform(user_agent)
        
        session = MobileSession(
            session_id=session_id,
            user_id=user_id,
            device_type=device_type,
            platform=platform,
            user_agent=user_agent,
            screen_resolution=screen_resolution,
            connection_type=connection_type,
            created_at=datetime.utcnow(),
            last_active=datetime.utcnow(),
            offline_capable=platform in [PlatformType.PWA, PlatformType.WEB],
            push_enabled=False
        )
        
        self.mobile_sessions[session_id] = session
        
        logger.info(f"📱 Mobile session created: {device_type.value} on {platform.value}")
        return session_id
    
    async def optimize_api_response(
        self,
        session_id: str,
        original_response: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize API response for mobile device"""
        
        session = self.mobile_sessions.get(session_id)
        if not session:
            return original_response
        
        optimized_response = original_response.copy()
        
        # Mobile-specific optimizations
        if session.device_type == DeviceType.MOBILE:
            # Reduce payload size
            optimized_response = await self._reduce_payload_size(optimized_response)
            
            # Optimize images
            if 'images' in optimized_response:
                optimized_response['images'] = await self._optimize_images_for_mobile(
                    optimized_response['images']
                )
            
            # Limit data for slow connections
            if session.connection_type in ["2g", "slow-2g"]:
                optimized_response = await self._limit_data_for_slow_connection(
                    optimized_response
                )
        
        # Add mobile-specific metadata
        optimized_response['_mobile_optimized'] = True
        optimized_response['_device_type'] = session.device_type.value
        optimized_response['_optimization_timestamp'] = datetime.utcnow().isoformat()
        
        return optimized_response
    
    # =============================================================================
    # OFFLINE SYNCHRONIZATION
    # =============================================================================
    
    async def store_offline_data(
        self,
        user_id: str,
        data_type: str,
        payload: Dict[str, Any]
    ) -> str:
        """Store data for offline synchronization"""
        
        data_id = str(uuid.uuid4())
        
        offline_data = OfflineData(
            data_id=data_id,
            user_id=user_id,
            data_type=data_type,
            payload=payload,
            created_offline=datetime.utcnow(),
            sync_status=OfflineSyncStatus.PENDING
        )
        
        self.offline_data_queue.append(offline_data)
        
        logger.info(f"💾 Offline data stored: {data_type} for user {user_id}")
        return data_id
    
    async def sync_offline_data(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Synchronize offline data with server"""
        
        sync_results = {
            "synced": 0,
            "failed": 0,
            "errors": []
        }
        
        # Filter data for specific user or all pending data
        data_to_sync = [
            data for data in self.offline_data_queue
            if data.sync_status == OfflineSyncStatus.PENDING
            and (user_id is None or data.user_id == user_id)
        ]
        
        for data in data_to_sync:
            try:
                # Simulate API call to sync data
                success = await self._sync_data_item(data)
                
                if success:
                    data.sync_status = OfflineSyncStatus.SYNCED
                    data.last_sync_attempt = datetime.utcnow()
                    sync_results["synced"] += 1
                    
                    # Notify connected clients via WebSocket
                    await self._notify_sync_success(data)
                else:
                    data.sync_status = OfflineSyncStatus.FAILED
                    data.sync_attempts += 1
                    data.last_sync_attempt = datetime.utcnow()
                    sync_results["failed"] += 1
                    
            except Exception as e:
                data.sync_status = OfflineSyncStatus.FAILED
                data.sync_attempts += 1
                data.last_sync_attempt = datetime.utcnow()
                data.error_message = str(e)
                sync_results["failed"] += 1
                sync_results["errors"].append(str(e))
                
                logger.error(f"Offline sync failed for {data.data_id}: {e}")
        
        logger.info(f"📡 Offline sync completed: {sync_results['synced']} synced, {sync_results['failed']} failed")
        return sync_results
    
    async def get_offline_data_status(self, user_id: str) -> Dict[str, Any]:
        """Get offline data synchronization status"""
        
        user_data = [data for data in self.offline_data_queue if data.user_id == user_id]
        
        status_summary = {
            "total": len(user_data),
            "synced": len([d for d in user_data if d.sync_status == OfflineSyncStatus.SYNCED]),
            "pending": len([d for d in user_data if d.sync_status == OfflineSyncStatus.PENDING]),
            "failed": len([d for d in user_data if d.sync_status == OfflineSyncStatus.FAILED]),
            "last_sync": None
        }
        
        # Find most recent sync attempt
        recent_synced = [
            d for d in user_data
            if d.last_sync_attempt and d.sync_status == OfflineSyncStatus.SYNCED
        ]
        
        if recent_synced:
            recent_synced.sort(key=lambda x: x.last_sync_attempt, reverse=True)
            status_summary["last_sync"] = recent_synced[0].last_sync_attempt.isoformat()
        
        return status_summary
    
    # =============================================================================
    # PUSH NOTIFICATIONS
    # =============================================================================
    
    async def enable_push_notifications(self, session_id: str, push_token: str) -> bool:
        """Enable push notifications for mobile session"""
        
        session = self.mobile_sessions.get(session_id)
        if not session:
            return False
        
        session.push_enabled = True
        
        # Store push token (in production, would store in database)
        # For demo, we'll just mark as enabled
        
        logger.info(f"🔔 Push notifications enabled for session {session_id}")
        return True
    
    async def send_push_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        platform: Optional[PlatformType] = None
    ) -> str:
        """Send push notification to user"""
        
        notification_id = str(uuid.uuid4())
        
        notification = PushNotification(
            notification_id=notification_id,
            user_id=user_id,
            title=title,
            body=body,
            data=data or {},
            scheduled_at=datetime.utcnow(),
            platform=platform or PlatformType.WEB
        )
        
        # Simulate sending notification
        notification.sent_at = datetime.utcnow()
        
        self.push_notifications.append(notification)
        
        # Send via WebSocket if user is online
        await self._send_websocket_notification(user_id, notification)
        
        logger.info(f"🔔 Push notification sent to user {user_id}: {title}")
        return notification_id
    
    async def schedule_push_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        scheduled_at: datetime,
        data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Schedule push notification for future delivery"""
        
        notification_id = str(uuid.uuid4())
        
        notification = PushNotification(
            notification_id=notification_id,
            user_id=user_id,
            title=title,
            body=body,
            data=data or {},
            scheduled_at=scheduled_at
        )
        
        self.push_notifications.append(notification)
        
        logger.info(f"📅 Push notification scheduled for {scheduled_at.isoformat()}")
        return notification_id
    
    # =============================================================================
    # PROGRESSIVE WEB APP OPTIMIZATION
    # =============================================================================
    
    async def generate_pwa_manifest(self, app_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate PWA manifest with mobile optimizations"""
        
        manifest = {
            "name": app_config.get("name", "Aether AI Platform"),
            "short_name": app_config.get("short_name", "Aether AI"),
            "description": app_config.get("description", "AI-powered development platform"),
            "start_url": "/",
            "display": "standalone",
            "background_color": app_config.get("background_color", "#1a1a1a"),
            "theme_color": app_config.get("theme_color", "#3b82f6"),
            "orientation": "any",
            "icons": [
                {
                    "src": "/icons/icon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any maskable"
                }
            ],
            "categories": ["productivity", "developer", "ai"],
            "lang": "en",
            "dir": "ltr",
            "scope": "/",
            "prefer_related_applications": False,
            "shortcuts": [
                {
                    "name": "AI Chat",
                    "short_name": "Chat",
                    "description": "Open AI Chat interface",
                    "url": "/chat",
                    "icons": [{"src": "/icons/chat-icon.png", "sizes": "96x96"}]
                },
                {
                    "name": "Projects",
                    "short_name": "Projects",
                    "description": "Manage your projects",
                    "url": "/projects",
                    "icons": [{"src": "/icons/projects-icon.png", "sizes": "96x96"}]
                }
            ]
        }
        
        return manifest
    
    async def generate_service_worker(self, cache_strategy: str = "network_first") -> str:
        """Generate optimized service worker for PWA"""
        
        service_worker_code = f'''
const CACHE_NAME = 'aether-ai-v1';
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {{
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
}});

// Fetch event with {cache_strategy} strategy
self.addEventListener('fetch', (event) => {{
    if (event.request.url.includes('/api/')) {{
        // API requests - network first with offline fallback
        event.respondWith(
            fetch(event.request)
                .then((response) => {{
                    if (response.ok) {{
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseClone));
                    }}
                    return response;
                }})
                .catch(() => caches.match(event.request))
        );
    }} else {{
        // Static resources - cache first
        event.respondWith(
            caches.match(event.request)
                .then((response) => response || fetch(event.request))
        );
    }}
}});

// Background sync for offline data
self.addEventListener('sync', (event) => {{
    if (event.tag === 'background-sync') {{
        event.waitUntil(
            fetch('/api/sync/offline-data', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{ action: 'sync_all' }})
            }})
        );
    }}
}});

// Push notifications
self.addEventListener('push', (event) => {{
    const data = event.data.json();
    const options = {{
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-icon.png',
        vibrate: [100, 50, 100],
        data: data.data || {{}}
    }};
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
}});
'''
        
        return service_worker_code
    
    # =============================================================================
    # ACCESSIBILITY COMPLIANCE
    # =============================================================================
    
    async def audit_accessibility(
        self,
        page_url: str,
        accessibility_level: AccessibilityLevel = AccessibilityLevel.AA
    ) -> str:
        """Perform accessibility audit on page"""
        
        audit_id = str(uuid.uuid4())
        
        # Simulate accessibility audit (in production, would use axe-core or similar)
        violations = await self._simulate_accessibility_audit(page_url)
        
        # Calculate score based on violations
        max_score = 100.0
        violation_penalty = len(violations) * 10
        score = max(0, max_score - violation_penalty)
        
        # Generate recommendations
        recommendations = await self._generate_accessibility_recommendations(violations)
        
        audit = AccessibilityAudit(
            audit_id=audit_id,
            page_url=page_url,
            accessibility_level=accessibility_level,
            score=score,
            violations=violations,
            timestamp=datetime.utcnow(),
            recommendations=recommendations
        )
        
        self.accessibility_audits.append(audit)
        
        logger.info(f"♿ Accessibility audit completed for {page_url}: Score {score}/100")
        return audit_id
    
    async def get_accessibility_report(self, audit_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed accessibility audit report"""
        
        audit = next(
            (a for a in self.accessibility_audits if a.audit_id == audit_id),
            None
        )
        
        if not audit:
            return None
        
        return {
            "audit_id": audit.audit_id,
            "page_url": audit.page_url,
            "accessibility_level": audit.accessibility_level.value,
            "score": audit.score,
            "grade": self._get_accessibility_grade(audit.score),
            "total_violations": len(audit.violations),
            "violations_by_severity": self._categorize_violations(audit.violations),
            "violations": audit.violations,
            "recommendations": audit.recommendations,
            "compliance_status": "compliant" if audit.score >= 80 else "non_compliant",
            "timestamp": audit.timestamp.isoformat()
        }
    
    async def implement_accessibility_fix(
        self,
        audit_id: str,
        violation_id: str,
        fix_implemented: bool,
        notes: str = ""
    ) -> bool:
        """Mark accessibility violation as fixed"""
        
        audit = next(
            (a for a in self.accessibility_audits if a.audit_id == audit_id),
            None
        )
        
        if not audit:
            return False
        
        # Find and update violation
        for violation in audit.violations:
            if violation.get("id") == violation_id:
                violation["fixed"] = fix_implemented
                violation["fix_notes"] = notes
                violation["fix_timestamp"] = datetime.utcnow().isoformat()
                
                logger.info(f"♿ Accessibility violation {violation_id} marked as {'fixed' if fix_implemented else 'unfixed'}")
                return True
        
        return False
    
    # =============================================================================
    # TOUCH-FRIENDLY INTERFACE OPTIMIZATION
    # =============================================================================
    
    async def optimize_touch_interface(
        self,
        ui_elements: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Optimize UI elements for touch interaction"""
        
        optimized_elements = []
        
        for element in ui_elements:
            optimized_element = element.copy()
            
            # Ensure minimum touch target size (44px recommended)
            if element.get("type") in ["button", "link", "input"]:
                current_size = element.get("size", {})
                min_size = {"width": 44, "height": 44}
                
                optimized_element["size"] = {
                    "width": max(current_size.get("width", 0), min_size["width"]),
                    "height": max(current_size.get("height", 0), min_size["height"])
                }
                
                # Add touch-friendly spacing
                optimized_element["margin"] = element.get("margin", 8)
                
                # Optimize for different screen densities
                optimized_element["responsive_sizes"] = {
                    "mobile": {"width": 48, "height": 48},
                    "tablet": {"width": 44, "height": 44},
                    "desktop": current_size
                }
            
            # Optimize form inputs for mobile
            if element.get("type") == "input":
                optimized_element["mobile_attributes"] = {
                    "autocomplete": element.get("autocomplete", "on"),
                    "autocapitalize": element.get("autocapitalize", "sentences"),
                    "inputmode": element.get("inputmode", "text"),
                    "spellcheck": element.get("spellcheck", "true")
                }
            
            optimized_elements.append(optimized_element)
        
        return optimized_elements
    
    # =============================================================================
    # UTILITY METHODS
    # =============================================================================
    
    def _detect_device_type(self, user_agent: str) -> DeviceType:
        """Detect device type from user agent"""
        user_agent_lower = user_agent.lower()
        
        if any(mobile in user_agent_lower for mobile in ["mobile", "android", "iphone"]):
            return DeviceType.MOBILE
        elif any(tablet in user_agent_lower for tablet in ["ipad", "tablet"]):
            return DeviceType.TABLET
        elif "watch" in user_agent_lower:
            return DeviceType.SMARTWATCH
        else:
            return DeviceType.DESKTOP
    
    def _detect_platform(self, user_agent: str) -> PlatformType:
        """Detect platform from user agent"""
        user_agent_lower = user_agent.lower()
        
        if "iphone" in user_agent_lower or "ipad" in user_agent_lower:
            return PlatformType.IOS
        elif "android" in user_agent_lower:
            return PlatformType.ANDROID
        else:
            return PlatformType.WEB
    
    async def _reduce_payload_size(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Reduce API response payload for mobile"""
        # Remove unnecessary fields for mobile
        mobile_optimized = {}
        
        # Keep only essential fields
        essential_fields = ["id", "title", "content", "status", "created_at"]
        for field in essential_fields:
            if field in response:
                mobile_optimized[field] = response[field]
        
        # Truncate long text fields
        if "content" in mobile_optimized and len(str(mobile_optimized["content"])) > 500:
            mobile_optimized["content"] = str(mobile_optimized["content"])[:500] + "..."
            mobile_optimized["content_truncated"] = True
        
        return mobile_optimized
    
    async def _optimize_images_for_mobile(self, images: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Optimize images for mobile viewing"""
        optimized_images = []
        
        for image in images:
            optimized_image = image.copy()
            
            # Generate mobile-optimized URLs (in production, would use image CDN)
            if "url" in image:
                base_url = image["url"]
                optimized_image["mobile_url"] = f"{base_url}?w=400&q=80"  # Smaller, compressed
                optimized_image["tablet_url"] = f"{base_url}?w=800&q=85"
            
            # Add responsive attributes
            optimized_image["responsive"] = True
            optimized_image["lazy_loading"] = True
            
            optimized_images.append(optimized_image)
        
        return optimized_images
    
    async def _limit_data_for_slow_connection(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Limit data for slow network connections"""
        limited_response = {}
        
        # Keep only critical data
        critical_fields = ["id", "title", "status"]
        for field in critical_fields:
            if field in response:
                limited_response[field] = response[field]
        
        # Add indicator that data was limited
        limited_response["_data_limited"] = True
        limited_response["_full_data_available"] = True
        
        return limited_response
    
    async def _sync_data_item(self, data: OfflineData) -> bool:
        """Synchronize individual offline data item"""
        try:
            # Simulate API call to sync data
            # In production, would make actual HTTP request
            
            # Simulate some failures for demonstration
            import random
            if random.random() < 0.1:  # 10% failure rate
                return False
            
            # Mark as synced
            return True
            
        except Exception as e:
            logger.error(f"Data sync failed: {e}")
            return False
    
    async def _notify_sync_success(self, data: OfflineData):
        """Notify client of successful sync via WebSocket"""
        if data.user_id in self.websocket_connections:
            websocket = self.websocket_connections[data.user_id]
            try:
                await websocket.send_json({
                    "type": "sync_success",
                    "data_id": data.data_id,
                    "data_type": data.data_type,
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as e:
                logger.error(f"WebSocket notification failed: {e}")
    
    async def _send_websocket_notification(self, user_id: str, notification: PushNotification):
        """Send notification via WebSocket if user is connected"""
        if user_id in self.websocket_connections:
            websocket = self.websocket_connections[user_id]
            try:
                await websocket.send_json({
                    "type": "push_notification",
                    "notification_id": notification.notification_id,
                    "title": notification.title,
                    "body": notification.body,
                    "data": notification.data,
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as e:
                logger.error(f"WebSocket notification failed: {e}")
    
    async def _simulate_accessibility_audit(self, page_url: str) -> List[Dict[str, Any]]:
        """Simulate accessibility audit violations"""
        # Sample violations for demonstration
        violations = [
            {
                "id": "color-contrast",
                "impact": "serious",
                "description": "Elements must have sufficient color contrast",
                "nodes": ["button.primary", "a.nav-link"],
                "wcag": ["1.4.3", "1.4.6"]
            },
            {
                "id": "alt-text",
                "impact": "critical",
                "description": "Images must have alternate text",
                "nodes": ["img.hero-image"],
                "wcag": ["1.1.1"]
            }
        ]
        
        return violations
    
    async def _generate_accessibility_recommendations(self, violations: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on violations"""
        recommendations = []
        
        for violation in violations:
            if violation["id"] == "color-contrast":
                recommendations.append("Increase color contrast ratio to at least 4.5:1 for normal text")
            elif violation["id"] == "alt-text":
                recommendations.append("Add descriptive alt text to all images")
            elif violation["id"] == "keyboard-navigation":
                recommendations.append("Ensure all interactive elements are keyboard accessible")
        
        return recommendations
    
    def _get_accessibility_grade(self, score: float) -> str:
        """Get accessibility grade based on score"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def _categorize_violations(self, violations: List[Dict[str, Any]]) -> Dict[str, int]:
        """Categorize violations by severity"""
        categories = {"critical": 0, "serious": 0, "moderate": 0, "minor": 0}
        
        for violation in violations:
            impact = violation.get("impact", "minor")
            if impact in categories:
                categories[impact] += 1
        
        return categories
    
    async def _setup_mobile_optimization(self):
        """Setup mobile optimization features"""
        logger.info("📱 Mobile optimization configured")
    
    async def _initialize_offline_sync(self):
        """Initialize offline synchronization"""
        logger.info("📡 Offline synchronization initialized")
    
    async def _setup_push_notifications(self):
        """Setup push notification service"""
        logger.info("🔔 Push notification service initialized")
    
    async def _configure_accessibility(self):
        """Configure accessibility features"""
        logger.info("♿ Accessibility features configured")
    
    async def _setup_pwa_optimization(self):
        """Setup Progressive Web App optimization"""
        logger.info("🌐 PWA optimization configured")

# Global mobile system instance
_mobile_system = None

async def get_mobile_system() -> MobileExperienceComprehensive:
    """Get the global mobile experience system instance"""
    global _mobile_system
    if _mobile_system is None:
        _mobile_system = MobileExperienceComprehensive()
        await _mobile_system.initialize()
    return _mobile_system