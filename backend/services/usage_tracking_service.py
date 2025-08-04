from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import asyncio
import logging

from models.database import get_database
from services.subscription_service import get_subscription_service

logger = logging.getLogger(__name__)

class UsageTrackingService:
    def __init__(self):
        self.db = None
        self.subscription_service = None
    
    async def initialize(self):
        """Initialize the usage tracking service"""
        self.db = await get_database()
        self.subscription_service = await get_subscription_service()
        logger.info("✅ Usage tracking service initialized")
    
    async def track_ai_usage(self, user_id: str, tokens_used: int, model_name: str, 
                           operation_type: str = "chat", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Track AI token usage and check limits"""
        try:
            # Check if user can use tokens
            limit_check = await self.subscription_service.check_usage_limits(user_id, "tokens", tokens_used)
            
            if not limit_check["allowed"]:
                return {
                    "success": False,
                    "error": "Token limit exceeded",
                    "details": limit_check
                }
            
            # Record the usage
            usage_metadata = {
                "model_name": model_name,
                "operation_type": operation_type,
                "tokens_used": tokens_used,
                **(metadata or {})
            }
            
            success = await self.subscription_service.record_usage(
                user_id, "tokens", tokens_used, usage_metadata
            )
            
            if success:
                return {
                    "success": True,
                    "tokens_used": tokens_used,
                    "remaining": limit_check.get("remaining", "unlimited")
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to record usage"
                }
        except Exception as e:
            logger.error(f"Failed to track AI usage: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def track_api_usage(self, user_id: str, endpoint: str, method: str = "GET", 
                            metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Track API call usage"""
        try:
            # Check API call limits (per minute)
            limit_check = await self.subscription_service.check_usage_limits(user_id, "api_calls", 1)
            
            if not limit_check["allowed"]:
                return {
                    "success": False,
                    "error": "API rate limit exceeded",
                    "details": limit_check
                }
            
            # Record the usage
            usage_metadata = {
                "endpoint": endpoint,
                "method": method,
                **(metadata or {})
            }
            
            success = await self.subscription_service.record_usage(
                user_id, "api_calls", 1, usage_metadata
            )
            
            return {
                "success": success,
                "remaining": limit_check.get("remaining", "unlimited")
            }
        except Exception as e:
            logger.error(f"Failed to track API usage: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def track_project_creation(self, user_id: str, project_id: str, 
                                   metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Track project creation"""
        try:
            # Check project limits
            limit_check = await self.subscription_service.check_usage_limits(user_id, "projects", 1)
            
            if not limit_check["allowed"]:
                return {
                    "success": False,
                    "error": "Project limit exceeded",
                    "details": limit_check
                }
            
            # Record the usage
            usage_metadata = {
                "project_id": project_id,
                **(metadata or {})
            }
            
            success = await self.subscription_service.record_usage(
                user_id, "projects", 1, usage_metadata
            )
            
            return {
                "success": success,
                "remaining": limit_check.get("remaining", "unlimited")
            }
        except Exception as e:
            logger.error(f"Failed to track project creation: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def track_storage_usage(self, user_id: str, size_mb: float, 
                                file_type: str = "unknown", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Track storage usage"""
        try:
            # Convert MB to GB for limit checking
            size_gb = size_mb / 1024
            
            # Check storage limits
            limit_check = await self.subscription_service.check_usage_limits(user_id, "storage", size_gb)
            
            if not limit_check["allowed"]:
                return {
                    "success": False,
                    "error": "Storage limit exceeded",
                    "details": limit_check
                }
            
            # Record the usage
            usage_metadata = {
                "size_mb": size_mb,
                "file_type": file_type,
                **(metadata or {})
            }
            
            success = await self.subscription_service.record_usage(
                user_id, "storage", size_gb, usage_metadata
            )
            
            return {
                "success": success,
                "remaining_gb": limit_check.get("remaining", "unlimited")
            }
        except Exception as e:
            logger.error(f"Failed to track storage usage: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_usage_warnings(self, user_id: str) -> List[Dict[str, Any]]:
        """Get usage warnings for a user (80%+ usage)"""
        try:
            usage_stats = await self.subscription_service.get_usage_stats(user_id)
            if not usage_stats:
                return []
            
            warnings = []
            
            for usage_type, percentage in usage_stats.usage_percentage.items():
                if percentage >= 80:
                    warning_level = "critical" if percentage >= 95 else "warning"
                    
                    warnings.append({
                        "type": usage_type,
                        "percentage": percentage,
                        "level": warning_level,
                        "current": usage_stats.current_usage.get(f"{usage_type}_used", 0),
                        "limit": usage_stats.limits.get(usage_type.replace("_used", ""), 0),
                        "message": f"{usage_type.title()} usage is at {percentage:.1f}%"
                    })
            
            return warnings
        except Exception as e:
            logger.error(f"Failed to get usage warnings: {e}")
            return []
    
    async def cleanup_old_usage_records(self, days_to_keep: int = 90):
        """Clean up old usage records to save storage"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            result = await self.db.usage_records.delete_many({
                "timestamp": {"$lt": cutoff_date}
            })
            
            logger.info(f"Cleaned up {result.deleted_count} old usage records")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Failed to cleanup old usage records: {e}")
            return 0
    
    async def get_usage_analytics(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get usage analytics for a user"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Aggregate usage by type and day
            pipeline = [
                {
                    "$match": {
                        "user_id": user_id,
                        "timestamp": {"$gte": start_date}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                            "usage_type": "$usage_type"
                        },
                        "total_amount": {"$sum": "$amount"},
                        "count": {"$sum": 1}
                    }
                },
                {
                    "$sort": {"_id.date": 1}
                }
            ]
            
            results = []
            async for doc in self.db.usage_records.aggregate(pipeline):
                results.append({
                    "date": doc["_id"]["date"],
                    "usage_type": doc["_id"]["usage_type"],
                    "total_amount": doc["total_amount"],
                    "count": doc["count"]
                })
            
            # Get current subscription info
            subscription = await self.subscription_service.get_user_subscription(user_id)
            subscription_info = None
            if subscription:
                subscription_info = await self.subscription_service.get_subscription_response(subscription)
            
            return {
                "period": f"Last {days} days",
                "usage_data": results,
                "subscription_info": subscription_info.dict() if subscription_info else None
            }
        except Exception as e:
            logger.error(f"Failed to get usage analytics: {e}")
            return {}

# Singleton instance
usage_tracking_service = UsageTrackingService()

async def get_usage_tracking_service() -> UsageTrackingService:
    """Get usage tracking service instance"""
    if usage_tracking_service.db is None:
        await usage_tracking_service.initialize()
    return usage_tracking_service