"""
Enhanced Integrations API Routes
Third-party service integrations and management
"""
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from services.integration_hub_service import IntegrationHubService

router = APIRouter()
integration_service = IntegrationHubService()

class IntegrationSetupRequest(BaseModel):
    provider_id: str
    config: Dict[str, Any]
    enable_webhooks: bool = False
    sync_frequency: int = 3600  # seconds

class IntegrationUpdateRequest(BaseModel):
    config: Optional[Dict[str, Any]] = None
    enabled: Optional[bool] = None
    sync_frequency: Optional[int] = None

@router.get("/providers")
async def get_integration_providers(integration_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Get available integration providers
    """
    try:
        result = await integration_service.get_available_integrations(integration_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/providers/{provider_id}")
async def get_provider_details(provider_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific integration provider
    """
    try:
        result = await integration_service.get_integration_details(provider_id)
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/setup")
async def setup_integration(
    request: IntegrationSetupRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Set up a new integration
    """
    try:
        result = await integration_service.setup_integration(
            provider_id=request.provider_id,
            config=request.config
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Schedule background sync if requested
        if request.enable_webhooks:
            background_tasks.add_task(
                _setup_webhooks,
                request.provider_id,
                request.config
            )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_integrations_status(provider_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Get status of integrations
    """
    try:
        result = await integration_service.get_integration_status(provider_id)
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/{provider_id}")
async def sync_integration(provider_id: str) -> Dict[str, Any]:
    """
    Manually trigger integration sync
    """
    try:
        result = await integration_service.sync_integration(provider_id)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{provider_id}")
async def update_integration(
    provider_id: str,
    request: IntegrationUpdateRequest
) -> Dict[str, Any]:
    """
    Update integration configuration
    """
    try:
        # This would update the integration config in the service
        # For now, return a mock response
        return {
            "success": True,
            "provider_id": provider_id,
            "message": "Integration updated successfully",
            "updated_fields": [k for k, v in request.dict().items() if v is not None]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/remove/{provider_id}")
async def remove_integration(provider_id: str) -> Dict[str, Any]:
    """
    Remove an integration
    """
    try:
        result = await integration_service.remove_integration(provider_id)
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def get_integration_templates() -> Dict[str, Any]:
    """
    Get integration configuration templates
    """
    templates = {
        "github": {
            "name": "GitHub Integration",
            "fields": [
                {"name": "api_token", "type": "string", "required": True, "description": "GitHub personal access token"},
                {"name": "repository", "type": "string", "required": True, "description": "Repository name (owner/repo)"},
                {"name": "webhook_secret", "type": "string", "required": False, "description": "Webhook secret for security"}
            ],
            "scopes_required": ["repo", "workflow", "read:org"],
            "webhook_events": ["push", "pull_request", "issues"]
        },
        "aws": {
            "name": "AWS Integration",
            "fields": [
                {"name": "access_key_id", "type": "string", "required": True, "description": "AWS access key ID"},
                {"name": "secret_access_key", "type": "password", "required": True, "description": "AWS secret access key"},
                {"name": "region", "type": "string", "required": True, "description": "AWS region"},
                {"name": "role_arn", "type": "string", "required": False, "description": "IAM role ARN for cross-account access"}
            ],
            "permissions_required": ["EC2FullAccess", "S3FullAccess", "CloudWatchReadOnlyAccess"],
            "supported_services": ["EC2", "S3", "CloudWatch", "Lambda", "RDS"]
        },
        "datadog": {
            "name": "Datadog Integration",
            "fields": [
                {"name": "api_key", "type": "string", "required": True, "description": "Datadog API key"},
                {"name": "app_key", "type": "string", "required": True, "description": "Datadog application key"},
                {"name": "site", "type": "string", "required": False, "description": "Datadog site (us1, eu1, etc.)"}
            ],
            "features": ["APM", "Infrastructure monitoring", "Log management", "Synthetic monitoring"],
            "setup_complexity": "medium"
        },
        "slack": {
            "name": "Slack Integration",
            "fields": [
                {"name": "bot_token", "type": "password", "required": True, "description": "Slack bot token"},
                {"name": "channel", "type": "string", "required": True, "description": "Default channel for notifications"},
                {"name": "webhook_url", "type": "string", "required": False, "description": "Slack webhook URL"}
            ],
            "bot_permissions": ["chat:write", "channels:read", "users:read"],
            "notification_types": ["deployments", "alerts", "build_status"]
        }
    }
    
    return {
        "success": True,
        "templates": templates,
        "total_templates": len(templates)
    }

@router.get("/recommendations")
async def get_integration_recommendations(
    project_type: Optional[str] = None,
    team_size: Optional[str] = None,
    current_stack: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Get personalized integration recommendations
    """
    try:
        recommendations = {
            "essential": [],
            "recommended": [],
            "optional": [],
            "reasoning": {}
        }
        
        # Essential integrations for any project
        recommendations["essential"] = [
            {
                "provider_id": "github",
                "name": "GitHub",
                "reason": "Version control and collaboration",
                "priority": 1
            }
        ]
        
        # Recommendations based on project type
        if project_type == "web_app":
            recommendations["recommended"].extend([
                {
                    "provider_id": "aws",
                    "name": "AWS",
                    "reason": "Scalable cloud infrastructure",
                    "priority": 2
                },
                {
                    "provider_id": "datadog",
                    "name": "Datadog",
                    "reason": "Application monitoring",
                    "priority": 3
                }
            ])
        elif project_type == "mobile_app":
            recommendations["recommended"].extend([
                {
                    "provider_id": "firebase",
                    "name": "Firebase",
                    "reason": "Mobile backend services",
                    "priority": 2
                },
                {
                    "provider_id": "amplitude",
                    "name": "Amplitude",
                    "reason": "Mobile analytics",
                    "priority": 3
                }
            ])
        
        # Team-based recommendations
        if team_size == "large":
            recommendations["recommended"].append({
                "provider_id": "slack",
                "name": "Slack",
                "reason": "Team communication at scale",
                "priority": 2
            })
        
        # Security recommendations
        recommendations["recommended"].append({
            "provider_id": "snyk",
            "name": "Snyk",
            "reason": "Vulnerability scanning",
            "priority": 4
        })
        
        # Optional integrations
        recommendations["optional"] = [
            {
                "provider_id": "mixpanel",
                "name": "Mixpanel",
                "reason": "Advanced product analytics",
                "priority": 5
            },
            {
                "provider_id": "sentry",
                "name": "Sentry",
                "reason": "Error tracking",
                "priority": 6
            }
        ]
        
        return {
            "success": True,
            "recommendations": recommendations,
            "total_suggestions": (
                len(recommendations["essential"]) +
                len(recommendations["recommended"]) +
                len(recommendations["optional"])
            )
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/marketplace")
async def get_integration_marketplace(
    category: Optional[str] = None,
    popularity: Optional[str] = None,
    pricing: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get integration marketplace with filtering options
    """
    try:
        # Mock marketplace data
        marketplace_items = [
            {
                "provider_id": "github",
                "name": "GitHub",
                "category": "version_control",
                "popularity": "high",
                "pricing": "freemium",
                "rating": 4.8,
                "installs": 50000,
                "description": "World's leading software development platform"
            },
            {
                "provider_id": "aws",
                "name": "Amazon Web Services",
                "category": "cloud_platform",
                "popularity": "high",
                "pricing": "pay_as_you_go",
                "rating": 4.6,
                "installs": 25000,
                "description": "Comprehensive cloud computing platform"
            },
            {
                "provider_id": "datadog",
                "name": "Datadog",
                "category": "monitoring",
                "popularity": "medium",
                "pricing": "subscription",
                "rating": 4.7,
                "installs": 15000,
                "description": "Modern monitoring and security platform"
            },
            {
                "provider_id": "slack",
                "name": "Slack",
                "category": "communication",
                "popularity": "high",
                "pricing": "freemium",
                "rating": 4.5,
                "installs": 30000,
                "description": "Team collaboration hub"
            }
        ]
        
        # Apply filters
        filtered_items = marketplace_items
        
        if category:
            filtered_items = [item for item in filtered_items if item["category"] == category]
        
        if popularity:
            filtered_items = [item for item in filtered_items if item["popularity"] == popularity]
        
        if pricing:
            filtered_items = [item for item in filtered_items if item["pricing"] == pricing]
        
        # Sort by popularity (installs)
        filtered_items.sort(key=lambda x: x["installs"], reverse=True)
        
        return {
            "success": True,
            "marketplace": filtered_items,
            "total_items": len(filtered_items),
            "filters_applied": {
                "category": category,
                "popularity": popularity,
                "pricing": pricing
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_integration_analytics() -> Dict[str, Any]:
    """
    Get integration usage analytics
    """
    try:
        # Mock analytics data
        analytics = {
            "total_integrations": 8,
            "active_integrations": 6,
            "most_used": [
                {"provider": "github", "usage_count": 150, "last_used": "2025-01-04T10:30:00Z"},
                {"provider": "aws", "usage_count": 89, "last_used": "2025-01-04T09:15:00Z"},
                {"provider": "slack", "usage_count": 67, "last_used": "2025-01-04T08:45:00Z"}
            ],
            "health_summary": {
                "healthy": 5,
                "warning": 1,
                "error": 0
            },
            "sync_stats": {
                "successful_syncs": 245,
                "failed_syncs": 3,
                "last_sync_time": "2025-01-04T10:00:00Z"
            },
            "cost_analysis": {
                "monthly_cost": 150.50,
                "cost_by_provider": {
                    "aws": 89.20,
                    "datadog": 45.30,
                    "github": 16.00
                }
            }
        }
        
        return {
            "success": True,
            "analytics": analytics,
            "generated_at": "2025-01-04T10:35:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
async def _setup_webhooks(provider_id: str, config: Dict[str, Any]):
    """Set up webhooks for the integration (background task)"""
    try:
        # Mock webhook setup
        print(f"Setting up webhooks for {provider_id}")
        await asyncio.sleep(2)  # Simulate setup time
        print(f"Webhooks configured for {provider_id}")
    except Exception as e:
        print(f"Failed to setup webhooks for {provider_id}: {e}")

@router.post("/test-connection")
async def test_integration_connection(
    provider_id: str,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Test integration connection without saving
    """
    try:
        # Use the integration service to test connection
        test_result = await integration_service._test_integration_connection(provider_id, config)
        
        return {
            "success": test_result["success"],
            "provider_id": provider_id,
            "test_result": test_result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))