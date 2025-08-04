from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import logging

from models.subscription import (
    Subscription, SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse,
    UsageRecord, BillingEvent, UsageResponse, SubscriptionPlan, SubscriptionStatus,
    BillingInterval, PLAN_CONFIGS, get_plan_config, calculate_usage_percentage, 
    is_usage_exceeded
)
from models.database import get_database

logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self):
        self.db = None
    
    async def initialize(self):
        """Initialize the subscription service"""
        self.db = await get_database()
        logger.info("✅ Subscription service initialized")
    
    async def create_subscription(self, user_id: str, plan: SubscriptionPlan, 
                                billing_interval: BillingInterval = BillingInterval.MONTHLY) -> Subscription:
        """Create a new subscription for a user"""
        try:
            # Check if user already has an active subscription
            existing = await self.db.subscriptions.find_one({
                "user_id": user_id,
                "status": {"$in": ["active", "trialing"]}
            })
            
            if existing:
                raise ValueError("User already has an active subscription")
            
            # Create subscription
            subscription_id = f"sub_{uuid.uuid4().hex}"
            now = datetime.utcnow()
            
            # Calculate billing period
            if billing_interval == BillingInterval.YEARLY:
                period_end = now + timedelta(days=365)
            else:
                period_end = now + timedelta(days=30)
            
            subscription_data = {
                "_id": subscription_id,
                "user_id": user_id,
                "plan": plan.value,
                "billing_interval": billing_interval.value,
                "status": SubscriptionStatus.ACTIVE.value,
                "current_period_start": now,
                "current_period_end": period_end,
                "created_at": now,
                "updated_at": now,
                "current_usage": {
                    "tokens_used": 0,
                    "api_calls": 0,
                    "projects_created": 0,
                    "storage_used": 0,
                    "bandwidth_used": 0
                }
            }
            
            await self.db.subscriptions.insert_one(subscription_data)
            
            # Update user with subscription
            await self.db.users.update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "subscription_id": subscription_id,
                        "updated_at": now
                    }
                }
            )
            
            # Log billing event
            await self._create_billing_event(
                user_id, subscription_id, "subscription_created", 
                {"plan": plan.value, "billing_interval": billing_interval.value}
            )
            
            logger.info(f"✅ Created subscription {subscription_id} for user {user_id}")
            return Subscription(**subscription_data)
            
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}")
            raise
    
    async def get_subscription(self, subscription_id: str) -> Optional[Subscription]:
        """Get subscription by ID"""
        try:
            subscription_data = await self.db.subscriptions.find_one({"_id": subscription_id})
            if subscription_data:
                return Subscription(**subscription_data)
            return None
        except Exception as e:
            logger.error(f"Failed to get subscription {subscription_id}: {e}")
            return None
    
    async def get_user_subscription(self, user_id: str) -> Optional[Subscription]:
        """Get active subscription for a user"""
        try:
            subscription_data = await self.db.subscriptions.find_one({
                "user_id": user_id,
                "status": {"$in": ["active", "trialing", "past_due"]}
            })
            if subscription_data:
                return Subscription(**subscription_data)
            return None
        except Exception as e:
            logger.error(f"Failed to get user subscription for {user_id}: {e}")
            return None
    
    async def update_subscription(self, subscription_id: str, updates: SubscriptionUpdate) -> Optional[Subscription]:
        """Update subscription"""
        try:
            update_data = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.db.subscriptions.update_one(
                {"_id": subscription_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return await self.get_subscription(subscription_id)
            return None
        except Exception as e:
            logger.error(f"Failed to update subscription {subscription_id}: {e}")
            return None
    
    async def cancel_subscription(self, subscription_id: str, immediate: bool = False) -> bool:
        """Cancel subscription"""
        try:
            update_data = {
                "status": SubscriptionStatus.CANCELED.value,
                "canceled_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # If immediate cancellation, end the period now
            if immediate:
                update_data["current_period_end"] = datetime.utcnow()
            
            result = await self.db.subscriptions.update_one(
                {"_id": subscription_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Log billing event
                subscription = await self.get_subscription(subscription_id)
                if subscription:
                    await self._create_billing_event(
                        subscription.user_id, subscription_id, "subscription_canceled",
                        {"immediate": immediate}
                    )
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {e}")
            return False
    
    async def record_usage(self, user_id: str, usage_type: str, amount: int, metadata: Dict[str, Any] = None) -> bool:
        """Record usage for a user"""
        try:
            # Get user's subscription
            subscription = await self.get_user_subscription(user_id)
            if not subscription:
                # No subscription - create usage record but don't enforce limits yet
                logger.warning(f"Recording usage for user {user_id} without subscription")
            
            # Create usage record
            usage_id = f"usage_{uuid.uuid4().hex}"
            usage_data = {
                "_id": usage_id,
                "user_id": user_id,
                "subscription_id": subscription.id if subscription else None,
                "usage_type": usage_type,
                "amount": amount,
                "timestamp": datetime.utcnow(),
                "metadata": metadata or {}
            }
            
            await self.db.usage_records.insert_one(usage_data)
            
            # Update subscription current usage
            if subscription:
                usage_key = f"{usage_type}_used"
                await self.db.subscriptions.update_one(
                    {"_id": subscription.id},
                    {
                        "$inc": {f"current_usage.{usage_key}": amount},
                        "$set": {"updated_at": datetime.utcnow()}
                    }
                )
            
            return True
        except Exception as e:
            logger.error(f"Failed to record usage: {e}")
            return False
    
    async def get_usage_stats(self, user_id: str) -> Optional[UsageResponse]:
        """Get current usage statistics for a user"""
        try:
            subscription = await self.get_user_subscription(user_id)
            if not subscription:
                return None
            
            plan_config = get_plan_config(SubscriptionPlan(subscription.plan))
            if not plan_config:
                return None
            
            limits = plan_config["features"]
            current_usage = subscription.current_usage
            
            # Calculate usage percentages
            usage_percentage = calculate_usage_percentage(current_usage, limits)
            
            return UsageResponse(
                current_usage=current_usage,
                limits=limits,
                usage_percentage=usage_percentage,
                billing_cycle_start=subscription.current_period_start,
                billing_cycle_end=subscription.current_period_end
            )
        except Exception as e:
            logger.error(f"Failed to get usage stats for {user_id}: {e}")
            return None
    
    async def check_usage_limits(self, user_id: str, usage_type: str, requested_amount: int = 1) -> Dict[str, Any]:
        """Check if user can perform an action based on usage limits"""
        try:
            subscription = await self.get_user_subscription(user_id)
            if not subscription:
                return {"allowed": False, "reason": "No active subscription"}
            
            plan_config = get_plan_config(SubscriptionPlan(subscription.plan))
            if not plan_config:
                return {"allowed": False, "reason": "Invalid subscription plan"}
            
            # Map usage types to limit keys
            usage_limit_map = {
                "tokens": "tokens_per_month",
                "api_calls": "api_calls_per_minute", 
                "projects": "max_projects",
                "storage": "storage_gb",
                "bandwidth": "bandwidth_gb"
            }
            
            limit_key = usage_limit_map.get(usage_type)
            if not limit_key:
                return {"allowed": True, "reason": "Unknown usage type"}
            
            limit = plan_config["features"].get(limit_key, -1)
            
            # Unlimited (-1)
            if limit == -1:
                return {"allowed": True, "reason": "Unlimited"}
            
            # Get current usage
            current_usage_key = f"{usage_type}_used"
            current_usage = subscription.current_usage.get(current_usage_key, 0)
            
            # Check if request would exceed limit
            if current_usage + requested_amount > limit:
                return {
                    "allowed": False,
                    "reason": f"Usage limit exceeded. Current: {current_usage}, Limit: {limit}, Requested: {requested_amount}"
                }
            
            return {
                "allowed": True,
                "current_usage": current_usage,
                "limit": limit,
                "remaining": limit - current_usage
            }
            
        except Exception as e:
            logger.error(f"Failed to check usage limits: {e}")
            return {"allowed": False, "reason": "Error checking limits"}
    
    async def reset_usage_for_billing_cycle(self, subscription_id: str) -> bool:
        """Reset usage counters for new billing cycle"""
        try:
            reset_usage = {
                "tokens_used": 0,
                "api_calls": 0,
                "projects_created": 0,
                "storage_used": 0,
                "bandwidth_used": 0
            }
            
            result = await self.db.subscriptions.update_one(
                {"_id": subscription_id},
                {
                    "$set": {
                        "current_usage": reset_usage,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to reset usage for subscription {subscription_id}: {e}")
            return False
    
    async def get_subscription_response(self, subscription: Subscription) -> SubscriptionResponse:
        """Convert subscription to response format"""
        plan_config = get_plan_config(SubscriptionPlan(subscription.plan))
        
        return SubscriptionResponse(
            id=subscription.id,
            plan=SubscriptionPlan(subscription.plan),
            billing_interval=BillingInterval(subscription.billing_interval),
            status=SubscriptionStatus(subscription.status),
            current_period_start=subscription.current_period_start,
            current_period_end=subscription.current_period_end,
            trial_end=subscription.trial_end,
            canceled_at=subscription.canceled_at,
            current_usage=subscription.current_usage,
            plan_config=plan_config
        )
    
    async def _create_billing_event(self, user_id: str, subscription_id: str, event_type: str, metadata: Dict[str, Any] = None):
        """Create a billing event record"""
        try:
            event_id = f"evt_{uuid.uuid4().hex}"
            event_data = {
                "_id": event_id,
                "user_id": user_id,
                "subscription_id": subscription_id,
                "event_type": event_type,
                "status": "completed",
                "timestamp": datetime.utcnow(),
                "metadata": metadata or {}
            }
            
            await self.db.billing_events.insert_one(event_data)
        except Exception as e:
            logger.error(f"Failed to create billing event: {e}")

# Singleton instance
subscription_service = SubscriptionService()

async def get_subscription_service() -> SubscriptionService:
    """Get subscription service instance"""
    if not subscription_service.db:
        await subscription_service.initialize()
    return subscription_service