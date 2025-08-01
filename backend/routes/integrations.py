from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from models.user import User
from routes.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_integrations(current_user: User = Depends(get_current_user)):
    """Get available integrations"""
    
    integrations = [
        {
            "id": "stripe",
            "name": "Stripe",
            "description": "Payment processing",
            "category": "payment",
            "status": "available",
            "setup_time": "5 min"
        },
        {
            "id": "mongodb",
            "name": "MongoDB",
            "description": "NoSQL database",
            "category": "database", 
            "status": "connected",
            "setup_time": "2 min"
        }
    ]
    
    return {"integrations": integrations}

@router.get("/categories")
async def get_integration_categories(current_user: User = Depends(get_current_user)):
    """Get integration categories"""
    
    categories = [
        {
            "id": "payments",
            "name": "Payments & Commerce",
            "description": "Payment processing and e-commerce tools",
            "count": 4,
            "integrations": ["stripe", "paypal", "square", "shopify"]
        },
        {
            "id": "auth",
            "name": "Authentication",
            "description": "User authentication and authorization",
            "count": 5,
            "integrations": ["auth0", "firebase", "clerk", "supabase", "okta"]
        },
        {
            "id": "analytics",
            "name": "Analytics",
            "description": "Analytics and monitoring tools",
            "count": 4,
            "integrations": ["google-analytics", "mixpanel", "amplitude", "posthog"]
        },
        {
            "id": "communication",
            "name": "Communication",
            "description": "Email, SMS, and messaging services",
            "count": 3,
            "integrations": ["sendgrid", "twilio", "resend"]
        }
    ]
    
    return {"categories": categories}

@router.get("/popular")
async def get_popular_integrations(current_user: User = Depends(get_current_user)):
    """Get popular integrations"""
    
    popular = [
        {
            "id": "stripe",
            "name": "Stripe",
            "description": "Payment processing",
            "category": "payment",
            "popularity_score": 95,
            "monthly_installs": 15420,
            "rating": 4.8
        },
        {
            "id": "auth0",
            "name": "Auth0",
            "description": "Identity platform",
            "category": "auth",
            "popularity_score": 92,
            "monthly_installs": 12850,
            "rating": 4.7
        },
        {
            "id": "sendgrid",
            "name": "SendGrid",
            "description": "Email delivery service",
            "category": "communication",
            "popularity_score": 88,
            "monthly_installs": 11200,
            "rating": 4.6
        }
    ]
    
    return {"integrations": popular}