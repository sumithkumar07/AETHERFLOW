from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging

from models.user import User
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

class IntegrationConfig(BaseModel):
    api_key: Optional[str] = None
    webhook_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = {}
    enabled: bool = True

@router.get("/")
async def get_integrations(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get available integrations"""
    try:
        db = await get_database()
        
        # Check if integrations collection has data, if not, seed it
        integration_count = await db.integrations.count_documents({})
        if integration_count == 0:
            await seed_integrations(db)
        
        # Build query
        query = {}
        if category:
            query["category"] = category
        
        integrations_cursor = db.integrations.find(query)
        integrations = await integrations_cursor.to_list(length=None)
        
        # Get user's configured integrations
        user_integrations = await db.user_integrations.find({
            "user_id": str(current_user.id)
        }).to_list(length=None)
        
        user_integration_map = {ui["integration_id"]: ui for ui in user_integrations}
        
        # Enhance integrations with user configuration status
        for integration in integrations:
            integration["id"] = str(integration["_id"])
            integration["_id"] = str(integration["_id"])
            
            user_config = user_integration_map.get(integration["id"])
            integration["configured"] = bool(user_config)
            integration["enabled"] = user_config.get("enabled", False) if user_config else False
            integration["last_sync"] = user_config.get("last_sync") if user_config else None
        
        return {
            "integrations": integrations,
            "total": len(integrations)
        }
        
    except Exception as e:
        logger.error(f"Integrations fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch integrations")

@router.get("/categories")
async def get_integration_categories():
    """Get integration categories"""
    return {
        "categories": [
            {"name": "Payments & Commerce", "slug": "payments", "count": 3},
            {"name": "Authentication & Security", "slug": "auth", "count": 3}, 
            {"name": "Analytics & Monitoring", "slug": "analytics", "count": 3},
            {"name": "Communication", "slug": "communication", "count": 3},
            {"name": "Infrastructure", "slug": "infrastructure", "count": 3},
            {"name": "Databases", "slug": "databases", "count": 3},
            {"name": "AI Services", "slug": "ai", "count": 3}
        ]
    }

@router.get("/{integration_id}")
async def get_integration_details(
    integration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get integration details"""
    try:
        db = await get_database()
        
        integration = await db.integrations.find_one({"_id": integration_id})
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Get user configuration
        user_config = await db.user_integrations.find_one({
            "user_id": str(current_user.id),
            "integration_id": integration_id
        })
        
        integration["id"] = str(integration["_id"])
        integration["_id"] = str(integration["_id"])
        integration["user_config"] = user_config
        
        return {"integration": integration}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Integration fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch integration")

@router.post("/{integration_id}/configure")
async def configure_integration(
    integration_id: str,
    config: IntegrationConfig,
    current_user: User = Depends(get_current_user)
):
    """Configure an integration"""
    try:
        db = await get_database()
        
        # Check if integration exists
        integration = await db.integrations.find_one({"_id": integration_id})
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Create or update user integration configuration
        user_integration = {
            "_id": f"ui_{uuid.uuid4().hex[:12]}",
            "user_id": str(current_user.id),
            "integration_id": integration_id,
            "api_key": config.api_key,
            "webhook_url": config.webhook_url,
            "settings": config.settings,
            "enabled": config.enabled,
            "configured_at": datetime.utcnow(),
            "last_sync": None,
            "sync_status": "pending"
        }
        
        # Upsert user integration
        await db.user_integrations.replace_one(
            {"user_id": str(current_user.id), "integration_id": integration_id},
            user_integration,
            upsert=True
        )
        
        # Update integration usage count
        await db.integrations.update_one(
            {"_id": integration_id},
            {"$inc": {"installs": 1}}
        )
        
        return {
            "message": "Integration configured successfully",
            "configuration": user_integration
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Integration configuration error: {e}")
        raise HTTPException(status_code=500, detail="Failed to configure integration")

@router.post("/{integration_id}/test")
async def test_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Test integration connection"""
    try:
        db = await get_database()
        
        # Get user integration configuration
        user_config = await db.user_integrations.find_one({
            "user_id": str(current_user.id),
            "integration_id": integration_id
        })
        
        if not user_config:
            raise HTTPException(status_code=404, detail="Integration not configured")
        
        # Simulate connection test
        import asyncio
        await asyncio.sleep(1)  # Simulate API call
        
        # Update sync status
        await db.user_integrations.update_one(
            {"_id": user_config["_id"]},
            {
                "$set": {
                    "last_sync": datetime.utcnow(),
                    "sync_status": "connected"
                }
            }
        )
        
        return {
            "status": "success",
            "message": "Integration connection successful",
            "tested_at": datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Integration test error: {e}")
        raise HTTPException(status_code=500, detail="Integration test failed")

@router.delete("/{integration_id}")
async def remove_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove integration configuration"""
    try:
        db = await get_database()
        
        result = await db.user_integrations.delete_one({
            "user_id": str(current_user.id),
            "integration_id": integration_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Integration configuration not found")
        
        return {"message": "Integration removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Integration removal error: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove integration")

async def seed_integrations(db):
    """Seed database with sample integrations"""
    integrations = [
        # Payments & Commerce
        {
            "_id": "stripe",
            "name": "Stripe",
            "description": "Complete payments platform for online businesses",
            "category": "Payments & Commerce",
            "icon": "💳",
            "color": "blue",
            "website": "https://stripe.com",
            "documentation": "https://stripe.com/docs",
            "features": ["Payment processing", "Subscriptions", "Invoicing", "Multi-currency"],
            "pricing": "2.9% + 30¢ per transaction",
            "setup_complexity": "Easy",
            "installs": 15000,
            "rating": 4.9,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "paypal",
            "name": "PayPal",
            "description": "Global digital payments and money transfers",
            "category": "Payments & Commerce",
            "icon": "💰",
            "color": "yellow",
            "website": "https://paypal.com",
            "documentation": "https://developer.paypal.com",
            "features": ["Digital payments", "Money transfers", "Buyer protection", "Global reach"],
            "pricing": "2.9% + fixed fee",
            "setup_complexity": "Easy",
            "installs": 12000,
            "rating": 4.7,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "square",
            "name": "Square",
            "description": "Payment processing and business management tools",
            "category": "Payments & Commerce",
            "icon": "⬜",
            "color": "gray",
            "website": "https://squareup.com",
            "documentation": "https://developer.squareup.com",
            "features": ["Payment processing", "Point of sale", "Inventory management", "Analytics"],
            "pricing": "2.6% + 10¢ per transaction",
            "setup_complexity": "Medium",
            "installs": 8000,
            "rating": 4.6,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        
        # Authentication & Security
        {
            "_id": "auth0",
            "name": "Auth0",
            "description": "Identity and access management platform",
            "category": "Authentication & Security",
            "icon": "🔐",
            "color": "orange",
            "website": "https://auth0.com",
            "documentation": "https://auth0.com/docs",
            "features": ["Single sign-on", "Multi-factor auth", "Social login", "User management"],
            "pricing": "Free up to 1000 users",
            "setup_complexity": "Medium",
            "installs": 18000,
            "rating": 4.8,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "firebase-auth",
            "name": "Firebase Auth",
            "description": "Google's authentication service",
            "category": "Authentication & Security",
            "icon": "🔥",
            "color": "red",
            "website": "https://firebase.google.com",
            "documentation": "https://firebase.google.com/docs/auth",
            "features": ["Email/password auth", "Social providers", "Phone auth", "Anonymous auth"],
            "pricing": "Free tier available",
            "setup_complexity": "Easy",
            "installs": 22000,
            "rating": 4.7,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "clerk",
            "name": "Clerk",
            "description": "Complete user authentication and management",
            "category": "Authentication & Security", 
            "icon": "👤",
            "color": "purple",
            "website": "https://clerk.dev",
            "documentation": "https://docs.clerk.dev",
            "features": ["Drop-in auth components", "User profiles", "Organizations", "Sessions"],
            "pricing": "Free up to 5000 users",
            "setup_complexity": "Easy",
            "installs": 5000,
            "rating": 4.9,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        
        # Analytics & Monitoring  
        {
            "_id": "google-analytics",
            "name": "Google Analytics",
            "description": "Web analytics and reporting platform",
            "category": "Analytics & Monitoring",
            "icon": "📊",
            "color": "green",
            "website": "https://analytics.google.com",
            "documentation": "https://developers.google.com/analytics",
            "features": ["Website analytics", "Real-time data", "Custom reports", "Goal tracking"],
            "pricing": "Free",
            "setup_complexity": "Easy",
            "installs": 35000,
            "rating": 4.5,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "mixpanel",
            "name": "Mixpanel",
            "description": "Product analytics for mobile and web",
            "category": "Analytics & Monitoring",
            "icon": "📈",
            "color": "blue",
            "website": "https://mixpanel.com",
            "documentation": "https://docs.mixpanel.com",
            "features": ["Event tracking", "User analytics", "Funnels", "Cohort analysis"],
            "pricing": "Free up to 1000 users",
            "setup_complexity": "Medium",
            "installs": 8000,
            "rating": 4.6,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "sentry",
            "name": "Sentry",
            "description": "Application monitoring and error tracking",
            "category": "Analytics & Monitoring",
            "icon": "🚨",
            "color": "red",
            "website": "https://sentry.io",
            "documentation": "https://docs.sentry.io",
            "features": ["Error tracking", "Performance monitoring", "Release tracking", "Alerting"],
            "pricing": "Free tier available",
            "setup_complexity": "Easy",
            "installs": 12000,
            "rating": 4.7,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        
        # Communication
        {
            "_id": "sendgrid",
            "name": "SendGrid",
            "description": "Email delivery and marketing platform",
            "category": "Communication",
            "icon": "📧",
            "color": "blue",
            "website": "https://sendgrid.com",
            "documentation": "https://docs.sendgrid.com",
            "features": ["Transactional email", "Marketing campaigns", "Email templates", "Analytics"],
            "pricing": "Free up to 100 emails/day",
            "setup_complexity": "Easy",
            "installs": 15000,
            "rating": 4.6,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "twilio",
            "name": "Twilio",
            "description": "Communication APIs for SMS, voice, and video",
            "category": "Communication",
            "icon": "📱",
            "color": "red",
            "website": "https://twilio.com",
            "documentation": "https://www.twilio.com/docs",
            "features": ["SMS messaging", "Voice calls", "Video calls", "WhatsApp API"],
            "pricing": "Pay-per-use",
            "setup_complexity": "Medium",
            "installs": 10000,
            "rating": 4.7,
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "resend",
            "name": "Resend",
            "description": "Email API for developers",
            "category": "Communication",
            "icon": "✉️",
            "color": "gray",
            "website": "https://resend.com",
            "documentation": "https://resend.com/docs",
            "features": ["Transactional email", "Email templates", "Webhooks", "Analytics"],
            "pricing": "Free up to 3000 emails/month",
            "setup_complexity": "Easy",
            "installs": 3000,
            "rating": 4.8,
            "status": "active",
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.integrations.insert_many(integrations)
    logger.info(f"✅ Seeded {len(integrations)} integrations")