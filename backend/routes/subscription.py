from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from datetime import datetime, timedelta
import logging

from models.subscription import (
    SubscriptionPlan, BillingInterval, SubscriptionCreate, SubscriptionUpdate,
    SubscriptionResponse, UsageResponse, PLAN_CONFIGS, SubscriptionStatus
)
from models.user import User
from routes.auth import get_current_user
from services.subscription_service import get_subscription_service
from services.usage_tracking_service import get_usage_tracking_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/trial/status")
async def get_trial_status(current_user: User = Depends(get_current_user)):
    """Get trial status for current user"""
    try:
        subscription_service = await get_subscription_service()
        
        subscription = await subscription_service.get_user_subscription(str(current_user.id))
        if not subscription:
            return {
                "has_trial": False,
                "is_trial_active": False,
                "trial_days_remaining": 0,
                "can_start_trial": True,
                "message": "No subscription found"
            }
        
        from models.subscription import is_trial_active, get_trial_days_remaining
        
        trial_active = is_trial_active(subscription)
        days_remaining = get_trial_days_remaining(subscription)
        
        return {
            "has_trial": subscription.trial_end is not None,
            "is_trial_active": trial_active,
            "trial_days_remaining": days_remaining,
            "trial_start": subscription.trial_start,
            "trial_end": subscription.trial_end,
            "can_start_trial": False,  # User already has subscription/trial
            "subscription_status": subscription.status,
            "message": f"{'Active trial' if trial_active else 'Trial expired'} - {days_remaining} days remaining"
        }
        
    except Exception as e:
        logger.error(f"Failed to get trial status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get trial status")

@router.post("/trial/start")
async def start_trial(current_user: User = Depends(get_current_user)):
    """Start a 7-day free trial for user (if eligible)"""
    try:
        subscription_service = await get_subscription_service()
        
        # Check if user already has a subscription
        existing = await subscription_service.get_user_subscription(str(current_user.id))
        if existing:
            return {
                "success": False,
                "message": "User already has an active subscription or trial"
            }
        
        # Create trial subscription
        trial_subscription = await subscription_service.create_trial_subscription(str(current_user.id))
        
        return {
            "success": True,
            "message": "7-day free trial started!",
            "subscription": await subscription_service.get_subscription_response(trial_subscription)
        }
        
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }
    except Exception as e:
        logger.error(f"Failed to start trial: {e}")
        raise HTTPException(status_code=500, detail="Failed to start trial")

@router.post("/trial/convert")
async def convert_trial_to_paid(
    plan: SubscriptionPlan,
    billing_interval: BillingInterval = BillingInterval.MONTHLY,
    current_user: User = Depends(get_current_user)
):
    """Convert trial subscription to paid subscription"""
    try:
        subscription_service = await get_subscription_service()
        
        # Get current subscription
        subscription = await subscription_service.get_user_subscription(str(current_user.id))
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")
        
        if subscription.status != SubscriptionStatus.TRIALING.value:
            raise HTTPException(status_code=400, detail="Current subscription is not in trial")
        
        # Update subscription to paid
        updates = SubscriptionUpdate(
            plan=plan,
            billing_interval=billing_interval,
            status=SubscriptionStatus.ACTIVE
        )
        
        updated_subscription = await subscription_service.update_subscription(
            subscription.id, updates
        )
        
        if not updated_subscription:
            raise HTTPException(status_code=400, detail="Failed to convert trial")
        
        # Reset trial fields and extend period
        now = datetime.utcnow()
        if billing_interval == BillingInterval.YEARLY:
            period_end = now + timedelta(days=365)
        else:
            period_end = now + timedelta(days=30)
        
        # Update period end and remove trial status
        await subscription_service.db.subscriptions.update_one(
            {"_id": subscription.id},
            {
                "$set": {
                    "current_period_start": now,
                    "current_period_end": period_end,
                    "trial_start": None,
                    "trial_end": None,
                    "updated_at": now
                }
            }
        )
        
        # Get updated subscription
        final_subscription = await subscription_service.get_subscription(subscription.id)
        
        return {
            "message": f"Trial successfully converted to {plan.value} plan",
            "subscription": await subscription_service.get_subscription_response(final_subscription)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to convert trial: {e}")
        raise HTTPException(status_code=500, detail="Failed to convert trial")

@router.get("/plans", response_model=Dict[str, Any])
async def get_subscription_plans():
    """Get all available subscription plans with pricing and features"""
    try:
        return {
            "plans": PLAN_CONFIGS,
            "billing_intervals": {
                "monthly": "Monthly billing",
                "yearly": "Yearly billing (save ~17%)"
            }
        }
    except Exception as e:
        logger.error(f"Failed to get subscription plans: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscription plans")

@router.post("/create", response_model=SubscriptionResponse)
async def create_subscription(
    plan: SubscriptionPlan,
    billing_interval: BillingInterval = BillingInterval.MONTHLY,
    current_user: User = Depends(get_current_user)
):
    """Create a new subscription for the current user"""
    try:
        subscription_service = await get_subscription_service()
        
        # Create subscription
        subscription = await subscription_service.create_subscription(
            user_id=str(current_user.id),
            plan=plan,
            billing_interval=billing_interval
        )
        
        return await subscription_service.get_subscription_response(subscription)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to create subscription")

@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(current_user: User = Depends(get_current_user)):
    """Get current user's subscription"""
    try:
        subscription_service = await get_subscription_service()
        
        subscription = await subscription_service.get_user_subscription(str(current_user.id))
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")
        
        return await subscription_service.get_subscription_response(subscription)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get current subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscription")

@router.put("/update", response_model=SubscriptionResponse)
async def update_subscription(
    updates: SubscriptionUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user's subscription"""
    try:
        subscription_service = await get_subscription_service()
        
        # Get current subscription
        subscription = await subscription_service.get_user_subscription(str(current_user.id))
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")
        
        # Update subscription
        updated_subscription = await subscription_service.update_subscription(
            subscription.id, updates
        )
        
        if not updated_subscription:
            raise HTTPException(status_code=400, detail="Failed to update subscription")
        
        return await subscription_service.get_subscription_response(updated_subscription)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to update subscription")

@router.post("/cancel")
async def cancel_subscription(
    immediate: bool = False,
    current_user: User = Depends(get_current_user)
):
    """Cancel current user's subscription"""
    try:
        subscription_service = await get_subscription_service()
        
        # Get current subscription
        subscription = await subscription_service.get_user_subscription(str(current_user.id))
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")
        
        # Cancel subscription
        success = await subscription_service.cancel_subscription(subscription.id, immediate)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to cancel subscription")
        
        return {
            "message": "Subscription canceled successfully",
            "immediate": immediate,
            "access_until": subscription.current_period_end if not immediate else datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

@router.get("/usage", response_model=UsageResponse)
async def get_usage_stats(current_user: User = Depends(get_current_user)):
    """Get current user's usage statistics"""
    try:
        subscription_service = await get_subscription_service()
        
        usage_stats = await subscription_service.get_usage_stats(str(current_user.id))
        if not usage_stats:
            raise HTTPException(status_code=404, detail="No usage data found")
        
        return usage_stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get usage stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage stats")

@router.get("/usage/warnings")
async def get_usage_warnings(current_user: User = Depends(get_current_user)):
    """Get usage warnings for current user"""
    try:
        usage_service = await get_usage_tracking_service()
        
        warnings = await usage_service.get_usage_warnings(str(current_user.id))
        
        return {
            "warnings": warnings,
            "total_warnings": len(warnings),
            "has_critical": any(w["level"] == "critical" for w in warnings)
        }
        
    except Exception as e:
        logger.error(f"Failed to get usage warnings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage warnings")

@router.get("/usage/analytics")
async def get_usage_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get usage analytics for current user"""
    try:
        if days > 365:
            raise HTTPException(status_code=400, detail="Analytics period cannot exceed 365 days")
        
        usage_service = await get_usage_tracking_service()
        
        analytics = await usage_service.get_usage_analytics(str(current_user.id), days)
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get usage analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage analytics")

@router.post("/usage/check")
async def check_usage_limits(
    usage_type: str,
    amount: int = 1,
    current_user: User = Depends(get_current_user)
):
    """Check if user can perform an action based on usage limits"""
    try:
        subscription_service = await get_subscription_service()
        
        result = await subscription_service.check_usage_limits(
            str(current_user.id), usage_type, amount
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to check usage limits: {e}")
        raise HTTPException(status_code=500, detail="Failed to check usage limits")

@router.get("/billing/history")
async def get_billing_history(current_user: User = Depends(get_current_user)):
    """Get billing history for current user"""
    try:
        subscription_service = await get_subscription_service()
        
        # Get subscription
        subscription = await subscription_service.get_user_subscription(str(current_user.id))
        if not subscription:
            return {"billing_events": [], "total": 0}
        
        # Get billing events from database
        billing_events = []
        async for event in subscription_service.db.billing_events.find(
            {"user_id": str(current_user.id)},
            sort=[("timestamp", -1)],
            limit=50
        ):
            event["id"] = event.pop("_id")
            billing_events.append(event)
        
        return {
            "billing_events": billing_events,
            "total": len(billing_events)
        }
        
    except Exception as e:
        logger.error(f"Failed to get billing history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get billing history")

@router.post("/upgrade")
async def upgrade_subscription(
    new_plan: SubscriptionPlan,
    current_user: User = Depends(get_current_user)
):
    """Upgrade user's subscription plan"""
    try:
        subscription_service = await get_subscription_service()
        
        # Get current subscription
        subscription = await subscription_service.get_user_subscription(str(current_user.id))
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")
        
        # Check if it's actually an upgrade
        plan_order = {
            SubscriptionPlan.BASIC: 1,
            SubscriptionPlan.PROFESSIONAL: 2,
            SubscriptionPlan.ENTERPRISE: 3
        }
        
        current_plan = SubscriptionPlan(subscription.plan)
        if plan_order[new_plan] <= plan_order[current_plan]:
            raise HTTPException(status_code=400, detail="New plan must be higher than current plan")
        
        # Update subscription plan
        updates = SubscriptionUpdate(plan=new_plan)
        updated_subscription = await subscription_service.update_subscription(
            subscription.id, updates
        )
        
        if not updated_subscription:
            raise HTTPException(status_code=400, detail="Failed to upgrade subscription")
        
        return {
            "message": f"Successfully upgraded to {new_plan.value} plan",
            "subscription": await subscription_service.get_subscription_response(updated_subscription)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upgrade subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to upgrade subscription")