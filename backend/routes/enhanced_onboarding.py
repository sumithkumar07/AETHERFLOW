#!/usr/bin/env python3
"""
Enhanced Onboarding API Routes
Provides one-click deployment, guided setup, and demo data generation
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from services.enhanced_onboarding_service import enhanced_onboarding_service
from auth import get_current_user

router = APIRouter()

@router.get("/onboarding/health")
async def get_onboarding_health():
    """Get onboarding service health status"""
    try:
        health_data = await enhanced_onboarding_service.get_onboarding_health()
        return {
            "success": True,
            "data": health_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get onboarding health: {str(e)}")

@router.post("/onboarding/wizard/start")
async def start_setup_wizard(current_user: dict = Depends(get_current_user)):
    """Start the setup wizard for a user"""
    try:
        user_id = current_user.get("id", "unknown")
        
        wizard = await enhanced_onboarding_service.start_setup_wizard(user_id)
        
        return {
            "success": True,
            "wizard": wizard.dict(),
            "message": "Setup wizard started successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start setup wizard: {str(e)}")

@router.get("/onboarding/wizard/{wizard_id}/steps")
async def get_setup_wizard_steps(
    wizard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get setup wizard steps and progress"""
    try:
        wizard = await enhanced_onboarding_service.get_setup_wizard_steps(wizard_id)
        
        if not wizard:
            raise HTTPException(status_code=404, detail="Setup wizard not found")
        
        # Verify user access
        if wizard.user_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Access denied to this wizard")
        
        return {
            "success": True,
            "wizard": wizard.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get setup wizard steps: {str(e)}")

@router.patch("/onboarding/wizard/{wizard_id}/step/{step_id}")
async def update_wizard_step(
    wizard_id: str,
    step_id: str,
    update_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Update the status of a wizard step"""
    try:
        status = update_data.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="Status is required")
        
        valid_statuses = ["pending", "in_progress", "completed", "skipped"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Valid options: {valid_statuses}")
        
        result = await enhanced_onboarding_service.update_wizard_step(wizard_id, step_id, status)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "update_result": result,
            "message": f"Step {step_id} updated to {status}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update wizard step: {str(e)}")

@router.post("/onboarding/deployment")
async def initiate_one_click_deployment(
    deployment_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Initiate one-click deployment to specified platform"""
    try:
        required_fields = ["platform", "repository_url"]
        for field in required_fields:
            if field not in deployment_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        valid_platforms = ["railway", "vercel", "heroku", "aws", "digital_ocean"]
        if deployment_data["platform"] not in valid_platforms:
            raise HTTPException(status_code=400, detail=f"Invalid platform. Supported: {valid_platforms}")
        
        user_id = current_user.get("id", "unknown")
        
        deployment = await enhanced_onboarding_service.initiate_one_click_deployment(
            user_id=user_id,
            platform=deployment_data["platform"],
            repository_url=deployment_data["repository_url"],
            config=deployment_data
        )
        
        return {
            "success": True,
            "deployment": deployment.dict(),
            "message": f"Deployment initiated to {deployment_data['platform']}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate deployment: {str(e)}")

@router.get("/onboarding/deployment/{deployment_id}/status")
async def get_deployment_status(
    deployment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get deployment status and logs"""
    try:
        deployment = await enhanced_onboarding_service.get_deployment_status(deployment_id)
        
        if not deployment:
            raise HTTPException(status_code=404, detail="Deployment not found")
        
        # Verify user access
        if deployment.user_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Access denied to this deployment")
        
        return {
            "success": True,
            "deployment": deployment.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get deployment status: {str(e)}")

@router.post("/onboarding/demo-data")
async def generate_demo_data(
    demo_request: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Generate demo data for user onboarding"""
    try:
        data_types = demo_request.get("data_types", ["conversations", "templates", "projects"])
        
        valid_types = ["conversations", "templates", "projects", "integrations"]
        invalid_types = [t for t in data_types if t not in valid_types]
        if invalid_types:
            raise HTTPException(status_code=400, detail=f"Invalid data types: {invalid_types}. Valid: {valid_types}")
        
        user_id = current_user.get("id", "unknown")
        
        demo_data = await enhanced_onboarding_service.generate_demo_data(user_id, data_types)
        
        return {
            "success": True,
            "demo_data": {key: value.dict() for key, value in demo_data.items()},
            "message": f"Generated demo data for {len(data_types)} types"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate demo data: {str(e)}")

@router.get("/onboarding/tutorials")
async def get_guided_tutorials():
    """Get available guided tutorials"""
    try:
        tutorials_data = await enhanced_onboarding_service.get_guided_tutorials()
        return {
            "success": True,
            "tutorials": tutorials_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get guided tutorials: {str(e)}")

@router.get("/onboarding/platforms")
async def get_deployment_platforms():
    """Get supported deployment platforms"""
    try:
        platforms = {
            "railway": {
                "name": "Railway",
                "description": "Modern app deployment platform with automatic scaling",
                "features": ["Auto-scaling", "Built-in databases", "GitHub integration", "Custom domains"],
                "pricing": "Pay-as-you-use starting at $5/month",
                "setup_time": "2-3 minutes",
                "difficulty": "Easy"
            },
            "vercel": {
                "name": "Vercel",
                "description": "Frontend-focused deployment platform optimized for Next.js",
                "features": ["Edge network", "Serverless functions", "Preview deployments", "Analytics"],
                "pricing": "Free tier available, Pro starts at $20/month",
                "setup_time": "1-2 minutes",
                "difficulty": "Easy"
            },
            "heroku": {
                "name": "Heroku",
                "description": "Cloud platform supporting multiple programming languages",
                "features": ["Add-ons ecosystem", "Dyno scaling", "Pipeline deployments", "Review apps"],
                "pricing": "Free tier available, paid plans from $7/month",
                "setup_time": "3-5 minutes",
                "difficulty": "Medium"
            },
            "aws": {
                "name": "Amazon Web Services",
                "description": "Comprehensive cloud platform with extensive services",
                "features": ["Global infrastructure", "Extensive services", "Enterprise security", "Cost optimization"],
                "pricing": "Pay-as-you-go, free tier available",
                "setup_time": "10-15 minutes",
                "difficulty": "Advanced"
            },
            "digital_ocean": {
                "name": "DigitalOcean",
                "description": "Developer-friendly cloud infrastructure provider",
                "features": ["Simple pricing", "SSD storage", "Load balancers", "Monitoring"],
                "pricing": "Droplets start at $6/month",
                "setup_time": "5-10 minutes", 
                "difficulty": "Medium"
            }
        }
        
        return {
            "success": True,
            "platforms": platforms,
            "recommended": "railway",
            "total_supported": len(platforms)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get deployment platforms: {str(e)}")

@router.get("/onboarding/progress/{user_id}")
async def get_onboarding_progress(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get onboarding progress for user"""
    try:
        # Verify user access (admin or self)
        if current_user.get("id") != user_id and not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Find active wizards for user
        user_wizards = [wizard for wizard in enhanced_onboarding_service.active_wizards.values() 
                       if wizard.user_id == user_id]
        
        if not user_wizards:
            return {
                "success": True,
                "progress": None,
                "message": "No active onboarding found for user"
            }
        
        # Get most recent wizard
        latest_wizard = max(user_wizards, key=lambda w: w.started_at)
        
        return {
            "success": True,
            "progress": {
                "wizard_id": latest_wizard.wizard_id,
                "progress_percentage": latest_wizard.progress_percentage,
                "current_step": latest_wizard.current_step,
                "total_steps": latest_wizard.total_steps,
                "started_at": latest_wizard.started_at.isoformat(),
                "estimated_completion": latest_wizard.estimated_completion.isoformat(),
                "completed_steps": len([s for s in latest_wizard.steps if s.status == "completed"])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get onboarding progress: {str(e)}")