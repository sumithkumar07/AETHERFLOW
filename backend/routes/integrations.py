from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

from models.user import User
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

class Integration(BaseModel):
    id: str
    name: str
    description: str
    category: str
    icon: str
    website: str
    pricing: str
    setup_difficulty: str
    features: List[str]
    required_fields: List[Dict[str, Any]]
    is_popular: bool = False
    is_free: bool = False

class IntegrationConfig(BaseModel):
    integration_id: str
    config: Dict[str, Any]
    is_active: bool = True

# Sample integrations data
AVAILABLE_INTEGRATIONS = [
    Integration(
        id="stripe",
        name="Stripe",
        description="Accept payments online with Stripe's powerful payment processing platform.",
        category="Payment",
        icon="💳",
        website="https://stripe.com",
        pricing="2.9% + 30¢ per transaction",
        setup_difficulty="Easy",
        features=[
            "Credit card processing",
            "Subscription billing",
            "International payments",
            "Fraud protection",
            "Detailed analytics"
        ],
        required_fields=[
            {"name": "publishable_key", "type": "text", "label": "Publishable Key", "required": True},
            {"name": "secret_key", "type": "password", "label": "Secret Key", "required": True}
        ],
        is_popular=True,
        is_free=False
    ),
    Integration(
        id="supabase",
        name="Supabase",
        description="Open source Firebase alternative with PostgreSQL database and real-time features.",
        category="Database",
        icon="🗄️",
        website="https://supabase.com",
        pricing="Free tier available, $25/month for Pro",
        setup_difficulty="Medium",
        features=[
            "PostgreSQL database",
            "Real-time subscriptions",
            "User authentication",
            "Storage buckets",
            "Edge functions"
        ],
        required_fields=[
            {"name": "url", "type": "text", "label": "Project URL", "required": True},
            {"name": "anon_key", "type": "text", "label": "Anon Key", "required": True},
            {"name": "service_key", "type": "password", "label": "Service Role Key", "required": False}
        ],
        is_popular=True,
        is_free=True
    ),
    Integration(
        id="auth0",
        name="Auth0",
        description="Flexible identity platform for secure user authentication and authorization.",
        category="Authentication",
        icon="🔐",
        website="https://auth0.com",
        pricing="Free for up to 7,000 users, then $23/month",
        setup_difficulty="Medium",
        features=[
            "Social login",
            "Multi-factor authentication",
            "Single sign-on",
            "User management",
            "Security analytics"
        ],
        required_fields=[
            {"name": "domain", "type": "text", "label": "Auth0 Domain", "required": True},
            {"name": "client_id", "type": "text", "label": "Client ID", "required": True},
            {"name": "client_secret", "type": "password", "label": "Client Secret", "required": True}
        ],
        is_popular=True,
        is_free=True
    ),
    Integration(
        id="sendgrid",
        name="SendGrid",
        description="Email delivery service for transactional and marketing emails.",
        category="Email",
        icon="✉️",
        website="https://sendgrid.com",
        pricing="Free for 100 emails/day, $14.95/month for 40K",
        setup_difficulty="Easy",
        features=[
            "Transactional emails",
            "Email templates",
            "Analytics and tracking",
            "SMTP relay",
            "Spam protection"
        ],
        required_fields=[
            {"name": "api_key", "type": "password", "label": "API Key", "required": True},
            {"name": "from_email", "type": "email", "label": "From Email", "required": True}
        ],
        is_popular=False,
        is_free=True
    ),
    Integration(
        id="vercel",
        name="Vercel",
        description="Frontend cloud platform for static sites and serverless functions.",
        category="Deployment",
        icon="▲",
        website="https://vercel.com",
        pricing="Free for personal use, $20/month for Pro",
        setup_difficulty="Easy",
        features=[
            "Automatic deployments",
            "Global CDN",
            "Serverless functions",
            "Custom domains",
            "Preview deployments"
        ],
        required_fields=[
            {"name": "token", "type": "password", "label": "Vercel Token", "required": True},
            {"name": "team_id", "type": "text", "label": "Team ID", "required": False}
        ],
        is_popular=True,
        is_free=True
    ),
    Integration(
        id="openai",
        name="OpenAI",
        description="Integrate GPT models for AI-powered features in your applications.",
        category="AI/ML",
        icon="🤖",
        website="https://openai.com",
        pricing="Pay per token, starts at $0.002/1K tokens",
        setup_difficulty="Easy",
        features=[
            "GPT-4 and GPT-3.5 models",
            "Text completion",
            "Chat completions",
            "Image generation",
            "Fine-tuning"
        ],
        required_fields=[
            {"name": "api_key", "type": "password", "label": "API Key", "required": True},
            {"name": "organization", "type": "text", "label": "Organization ID", "required": False}
        ],
        is_popular=True,
        is_free=False
    ),
    Integration(
        id="twilio",
        name="Twilio",
        description="Cloud communications platform for SMS, voice, and video messaging.",
        category="Communication",
        icon="📱",
        website="https://twilio.com",
        pricing="Pay as you go, SMS from $0.0075 per message",
        setup_difficulty="Medium",
        features=[
            "SMS messaging",
            "Voice calls",
            "Video calls",
            "WhatsApp integration",
            "Phone number management"
        ],
        required_fields=[
            {"name": "account_sid", "type": "text", "label": "Account SID", "required": True},
            {"name": "auth_token", "type": "password", "label": "Auth Token", "required": True},
            {"name": "phone_number", "type": "tel", "label": "Twilio Phone Number", "required": True}
        ],
        is_popular=False,
        is_free=False
    ),
    Integration(
        id="cloudinary",
        name="Cloudinary",
        description="Cloud-based image and video management platform with optimization and transformation.",
        category="Media",
        icon="🖼️",
        website="https://cloudinary.com",
        pricing="Free tier available, $89/month for Plus",
        setup_difficulty="Easy",
        features=[
            "Image optimization",
            "Video transcoding",
            "Content delivery",
            "Media transformations",
            "Upload widget"
        ],
        required_fields=[
            {"name": "cloud_name", "type": "text", "label": "Cloud Name", "required": True},
            {"name": "api_key", "type": "text", "label": "API Key", "required": True},
            {"name": "api_secret", "type": "password", "label": "API Secret", "required": True}
        ],
        is_popular=False,
        is_free=True
    )
]

@router.get("/", response_model=dict)
async def get_integrations(
    category: Optional[str] = None,
    popular_only: bool = False,
    free_only: bool = False
):
    """Get available integrations with filtering"""
    integrations = AVAILABLE_INTEGRATIONS.copy()
    
    # Filter by category
    if category:
        integrations = [i for i in integrations if i.category.lower() == category.lower()]
    
    # Filter popular only
    if popular_only:
        integrations = [i for i in integrations if i.is_popular]
    
    # Filter free only
    if free_only:
        integrations = [i for i in integrations if i.is_free]
    
    # Get categories
    categories = list(set(i.category for i in AVAILABLE_INTEGRATIONS))
    
    return {
        "integrations": [i.dict() for i in integrations],
        "categories": categories,
        "total": len(integrations)
    }

@router.get("/categories", response_model=dict)
async def get_integration_categories():
    """Get integration categories with counts"""
    categories = {}
    
    for integration in AVAILABLE_INTEGRATIONS:
        cat = integration.category
        if cat not in categories:
            categories[cat] = {"count": 0, "integrations": []}
        categories[cat]["count"] += 1
        categories[cat]["integrations"].append({
            "id": integration.id,
            "name": integration.name,
            "is_popular": integration.is_popular,
            "is_free": integration.is_free
        })
    
    return {"categories": categories}

@router.get("/popular", response_model=dict)
async def get_popular_integrations():
    """Get popular integrations"""
    popular = [i for i in AVAILABLE_INTEGRATIONS if i.is_popular]
    return {"integrations": [i.dict() for i in popular]}

@router.get("/{integration_id}", response_model=dict)
async def get_integration(integration_id: str):
    """Get a specific integration by ID"""
    integration = next((i for i in AVAILABLE_INTEGRATIONS if i.id == integration_id), None)
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"integration": integration.dict()}

@router.post("/{integration_id}/configure", response_model=dict)
async def configure_integration(
    integration_id: str,
    config: IntegrationConfig,
    current_user: User = Depends(get_current_user)
):
    """Configure an integration for the user"""
    # Check if integration exists
    integration = next((i for i in AVAILABLE_INTEGRATIONS if i.id == integration_id), None)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    db = await get_database()
    
    # Save or update integration config
    config_data = {
        "user_id": str(current_user.id),
        "integration_id": integration_id,
        "config": config.config,
        "is_active": config.is_active,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Check if config already exists
    existing = await db.user_integrations.find_one({
        "user_id": str(current_user.id),
        "integration_id": integration_id
    })
    
    if existing:
        await db.user_integrations.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "config": config.config,
                "is_active": config.is_active,
                "updated_at": datetime.utcnow()
            }}
        )
        config_data["_id"] = str(existing["_id"])
    else:
        result = await db.user_integrations.insert_one(config_data)
        config_data["_id"] = str(result.inserted_id)
    
    return {
        "message": "Integration configured successfully",
        "config": config_data
    }

@router.get("/user/configured", response_model=dict)
async def get_user_integrations(
    current_user: User = Depends(get_current_user)
):
    """Get user's configured integrations"""
    db = await get_database()
    
    configs = await db.user_integrations.find({
        "user_id": str(current_user.id)
    }).to_list(length=100)
    
    # Convert ObjectId to string and add integration details
    for config in configs:
        config["_id"] = str(config["_id"])
        integration = next((i for i in AVAILABLE_INTEGRATIONS if i.id == config["integration_id"]), None)
        if integration:
            config["integration_details"] = {
                "name": integration.name,
                "category": integration.category,
                "icon": integration.icon
            }
    
    return {
        "integrations": configs,
        "total": len(configs)
    }

@router.delete("/{integration_id}/configure", response_model=dict)
async def remove_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove an integration configuration"""
    db = await get_database()
    
    result = await db.user_integrations.delete_one({
        "user_id": str(current_user.id),
        "integration_id": integration_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Integration configuration not found")
    
    return {"message": "Integration removed successfully"}

@router.post("/{integration_id}/test", response_model=dict)
async def test_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Test an integration configuration"""
    db = await get_database()
    
    # Get user's integration config
    config = await db.user_integrations.find_one({
        "user_id": str(current_user.id),
        "integration_id": integration_id
    })
    
    if not config:
        raise HTTPException(status_code=404, detail="Integration not configured")
    
    # Simulate test (in real implementation, test actual connection)
    test_results = {
        "stripe": {"status": "success", "message": "Successfully connected to Stripe API"},
        "supabase": {"status": "success", "message": "Database connection established"},
        "auth0": {"status": "success", "message": "Auth0 domain verified"},
        "sendgrid": {"status": "success", "message": "Email service ready"},
        "vercel": {"status": "success", "message": "Deployment access verified"},
        "openai": {"status": "success", "message": "OpenAI API key validated"},
        "twilio": {"status": "success", "message": "SMS service connected"},
        "cloudinary": {"status": "success", "message": "Media cloud configured"}
    }
    
    result = test_results.get(integration_id, {"status": "error", "message": "Test not implemented"})
    
    return {
        "integration_id": integration_id,
        "test_result": result,
        "timestamp": datetime.utcnow()
    }