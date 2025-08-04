from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class SubscriptionPlan(str, Enum):
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"
    PAUSED = "paused"

class BillingInterval(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

# Plan configurations
PLAN_CONFIGS = {
    SubscriptionPlan.BASIC: {
        "name": "Basic",
        "description": "Perfect for individual developers getting started",
        "price_monthly": 19,
        "price_yearly": 190,  # ~17% discount
        "features": {
            "tokens_per_month": 500000,  # 500K tokens
            "max_projects": 10,
            "max_team_members": 1,
            "integrations_limit": 5,
            "support_level": "email",
            "ai_models": ["basic"],
            "analytics": "basic",
            "api_access": False,
            "custom_domains": False,
            "priority_support": False
        },
        "limits": {
            "api_calls_per_minute": 60,
            "storage_gb": 1,
            "bandwidth_gb": 10
        },
        # Trial configuration for new users
        "trial": {
            "tokens_per_week": 50000,  # Limited tokens for 7-day trial
            "duration_days": 7
        }
    },
    SubscriptionPlan.PROFESSIONAL: {
        "name": "Professional", 
        "description": "Advanced features for professional developers and small teams",
        "price_monthly": 49,
        "price_yearly": 490,  # ~17% discount
        "features": {
            "tokens_per_month": 2000000,  # 2M tokens
            "max_projects": 50,
            "max_team_members": 5,
            "integrations_limit": 50,
            "support_level": "priority",
            "ai_models": ["basic", "advanced"],
            "analytics": "advanced", 
            "api_access": True,
            "custom_domains": True,
            "priority_support": True
        },
        "limits": {
            "api_calls_per_minute": 300,
            "storage_gb": 10,
            "bandwidth_gb": 100
        }
    },
    SubscriptionPlan.ENTERPRISE: {
        "name": "Enterprise",
        "description": "Complete solution for teams and organizations",
        "price_monthly": 179,
        "price_yearly": 1790,  # ~17% discount
        "features": {
            "tokens_per_month": 10000000,  # 10M tokens
            "max_projects": -1,  # unlimited
            "max_team_members": -1,  # unlimited
            "integrations_limit": -1,  # unlimited
            "support_level": "dedicated",
            "ai_models": ["basic", "advanced", "premium"],
            "analytics": "enterprise",
            "api_access": True,
            "custom_domains": True,
            "priority_support": True,
            "dedicated_manager": True,
            "sso": True,
            "audit_logs": True
        },
        "limits": {
            "api_calls_per_minute": 1000,
            "storage_gb": 100,
            "bandwidth_gb": 1000
        }
    }
}

class SubscriptionBase(BaseModel):
    plan: SubscriptionPlan
    billing_interval: BillingInterval = BillingInterval.MONTHLY
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE

class SubscriptionCreate(SubscriptionBase):
    user_id: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    plan: Optional[SubscriptionPlan] = None
    billing_interval: Optional[BillingInterval] = None
    status: Optional[SubscriptionStatus] = None
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None

class Subscription(SubscriptionBase):
    id: str = Field(alias="_id")
    user_id: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    current_period_start: datetime
    current_period_end: datetime
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Current billing period usage
    current_usage: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class UsageRecord(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    subscription_id: str
    usage_type: str  # "tokens", "api_calls", "storage", "bandwidth"
    amount: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class BillingEvent(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    subscription_id: str
    event_type: str  # "subscription_created", "payment_succeeded", "payment_failed", etc.
    stripe_event_id: Optional[str] = None
    amount: Optional[int] = None
    currency: str = "usd"
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class SubscriptionResponse(BaseModel):
    id: str
    plan: SubscriptionPlan
    billing_interval: BillingInterval
    status: SubscriptionStatus
    current_period_start: datetime
    current_period_end: datetime
    trial_end: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    current_usage: Dict[str, Any]
    plan_config: Dict[str, Any]
    
class UsageResponse(BaseModel):
    current_usage: Dict[str, Any]
    limits: Dict[str, Any]
    usage_percentage: Dict[str, float]
    billing_cycle_start: datetime
    billing_cycle_end: datetime

def get_plan_config(plan: SubscriptionPlan) -> Dict[str, Any]:
    """Get configuration for a subscription plan"""
    return PLAN_CONFIGS.get(plan, {})

def calculate_usage_percentage(current_usage: Dict[str, Any], limits: Dict[str, Any]) -> Dict[str, float]:
    """Calculate usage percentage for each limit"""
    percentages = {}
    
    for key, limit in limits.items():
        if limit == -1:  # unlimited
            percentages[key] = 0.0
        else:
            current = current_usage.get(key, 0)
            percentages[key] = min((current / limit) * 100, 100) if limit > 0 else 0.0
    
    return percentages

def is_usage_exceeded(current_usage: Dict[str, Any], limits: Dict[str, Any]) -> Dict[str, bool]:
    """Check if usage limits are exceeded"""
    exceeded = {}
    
    for key, limit in limits.items():
        if limit == -1:  # unlimited
            exceeded[key] = False
        else:
            current = current_usage.get(key, 0)
            exceeded[key] = current >= limit
    
    return exceeded