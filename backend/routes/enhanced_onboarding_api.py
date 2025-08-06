"""
Enhanced Onboarding API Routes - Complete Implementation
One-click deployment, guided setup, demo data, trial management endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import logging

from services.enhanced_onboarding_complete import get_onboarding_system

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class StartOnboardingRequest(BaseModel):
    user_type: str = Field(default="developer", description="User type: developer, business_user, designer")
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Initial user preferences")

class CompleteStepRequest(BaseModel):
    step: str = Field(..., description="Onboarding step to complete")
    step_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Data from completed step")

class DeploymentRequest(BaseModel):
    deployment_type: str = Field(..., description="Deployment type: full_stack, frontend_only, backend_only")
    configuration: Dict[str, Any] = Field(..., description="Deployment configuration")

@router.get("/health")
async def onboarding_health_check():
    """Health check for onboarding system"""
    try:
        onboarding_system = await get_onboarding_system()
        return {
            "status": "healthy",
            "service": "Enhanced Onboarding System",
            "features": {
                "guided_setup": "active",
                "one_click_deployment": "active",
                "demo_data_generation": "active",
                "trial_management": "active"
            },
            "supported_user_types": ["developer", "business_user", "designer"],
            "deployment_types": ["full_stack", "frontend_only", "backend_only"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Onboarding health check failed: {e}")
        raise HTTPException(status_code=503, detail="Onboarding system unavailable")

@router.post("/start")
async def start_onboarding(
    onboarding_request: StartOnboardingRequest,
    user_id: str = Query(..., description="User ID to start onboarding for")
):
    """Start onboarding process for a user"""
    try:
        onboarding_system = await get_onboarding_system()
        
        progress_id = await onboarding_system.start_onboarding(
            user_id=user_id,
            user_type=onboarding_request.user_type,
            preferences=onboarding_request.preferences
        )
        
        return {
            "success": True,
            "progress_id": progress_id,
            "user_type": onboarding_request.user_type,
            "message": "Onboarding started successfully",
            "next_step": "welcome"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to start onboarding: {e}")
        raise HTTPException(status_code=500, detail="Failed to start onboarding")

@router.get("/status")
async def get_onboarding_status(user_id: str = Query(..., description="User ID")):
    """Get current onboarding status for a user"""
    try:
        onboarding_system = await get_onboarding_system()
        status = await onboarding_system.get_onboarding_status(user_id)
        
        return {
            "success": True,
            "status": status,
            "message": "Onboarding status retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get onboarding status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve onboarding status")

@router.post("/complete-step")
async def complete_onboarding_step(
    step_request: CompleteStepRequest,
    user_id: str = Query(..., description="User ID")
):
    """Complete an onboarding step"""
    try:
        onboarding_system = await get_onboarding_system()
        
        result = await onboarding_system.complete_onboarding_step(
            user_id=user_id,
            step=step_request.step,
            step_data=step_request.step_data
        )
        
        return {
            "success": True,
            "result": result,
            "message": f"Onboarding step '{step_request.step}' completed successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Failed to complete onboarding step: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete onboarding step")

@router.post("/skip-step")
async def skip_onboarding_step(
    step: str = Body(..., description="Onboarding step to skip"),
    user_id: str = Query(..., description="User ID")
):
    """Skip an onboarding step"""
    try:
        onboarding_system = await get_onboarding_system()
        
        result = await onboarding_system.skip_onboarding_step(user_id, step)
        
        return {
            "success": True,
            "result": result,
            "message": f"Onboarding step '{step}' skipped successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Failed to skip onboarding step: {e}")
        raise HTTPException(status_code=500, detail="Failed to skip onboarding step")

@router.get("/steps")
async def get_guided_setup_steps(
    user_type: str = Query(default="developer", description="User type")
):
    """Get guided setup steps for a user type"""
    try:
        onboarding_system = await get_onboarding_system()
        steps = await onboarding_system.get_guided_setup_steps(user_type)
        
        return {
            "success": True,
            "user_type": user_type,
            "steps": steps,
            "total_steps": len(steps),
            "message": "Guided setup steps retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get guided setup steps: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve guided setup steps")

@router.post("/deploy")
async def initiate_one_click_deployment(
    deployment_request: DeploymentRequest,
    user_id: str = Query(..., description="User ID"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Initiate one-click deployment"""
    try:
        onboarding_system = await get_onboarding_system()
        
        task_id = await onboarding_system.initiate_one_click_deployment(
            user_id=user_id,
            deployment_type=deployment_request.deployment_type,
            configuration=deployment_request.configuration
        )
        
        return {
            "success": True,
            "deployment_task_id": task_id,
            "deployment_type": deployment_request.deployment_type,
            "status": "initiated",
            "message": "One-click deployment initiated successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to initiate deployment: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate deployment")

@router.get("/deploy/{task_id}/status")
async def get_deployment_status(task_id: str):
    """Get deployment task status"""
    try:
        onboarding_system = await get_onboarding_system()
        status = await onboarding_system.get_deployment_status(task_id)
        
        return {
            "success": True,
            "deployment": status,
            "message": "Deployment status retrieved successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Failed to get deployment status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve deployment status")

@router.get("/demo-data")
async def get_demo_data(user_id: str = Query(..., description="User ID")):
    """Get demo data for a user"""
    try:
        onboarding_system = await get_onboarding_system()
        demo_data = await onboarding_system.get_demo_data(user_id)
        
        if demo_data:
            return {
                "success": True,
                "demo_data": demo_data,
                "message": "Demo data retrieved successfully"
            }
        else:
            return {
                "success": False,
                "demo_data": None,
                "message": "No demo data found for user"
            }
        
    except Exception as e:
        logger.error(f"❌ Failed to get demo data: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve demo data")

@router.get("/user-types")
async def get_user_types():
    """Get available user types for onboarding"""
    return {
        "success": True,
        "user_types": [
            {
                "id": "developer",
                "name": "Developer",
                "description": "Software developers, programmers, and technical professionals",
                "features": [
                    "AI-powered code generation",
                    "Project templates and workflows",
                    "Integration with development tools",
                    "Advanced deployment options"
                ],
                "onboarding_steps": 8,
                "estimated_time": "15-20 minutes"
            },
            {
                "id": "business_user",
                "name": "Business User",
                "description": "Product managers, business analysts, and non-technical users",
                "features": [
                    "No-code AI applications",
                    "Business workflow automation",
                    "Analytics and reporting",
                    "Team collaboration tools"
                ],
                "onboarding_steps": 6,
                "estimated_time": "10-15 minutes"
            },
            {
                "id": "designer",
                "name": "Designer",
                "description": "UI/UX designers, creative professionals, and design-focused users",
                "features": [
                    "Design-first AI tools",
                    "Visual template library",
                    "Design system integration",
                    "Prototype generation"
                ],
                "onboarding_steps": 7,
                "estimated_time": "12-18 minutes"
            }
        ]
    }

@router.get("/deployment-types")
async def get_deployment_types():
    """Get available deployment types"""
    return {
        "success": True,
        "deployment_types": [
            {
                "id": "full_stack",
                "name": "Full Stack Application",
                "description": "Complete application with frontend, backend, and database",
                "features": [
                    "React frontend with modern UI",
                    "FastAPI backend with REST APIs",
                    "MongoDB database with data models",
                    "Authentication and authorization",
                    "Deployment to cloud platform"
                ],
                "estimated_time": "5-8 minutes",
                "complexity": "high"
            },
            {
                "id": "frontend_only",
                "name": "Frontend Application",
                "description": "Client-side application with static hosting",
                "features": [
                    "React application with routing",
                    "Modern responsive design",
                    "Static asset optimization",
                    "CDN deployment"
                ],
                "estimated_time": "2-4 minutes",
                "complexity": "low"
            },
            {
                "id": "backend_only",
                "name": "API Backend",
                "description": "REST API backend with database",
                "features": [
                    "FastAPI with OpenAPI documentation",
                    "Database integration",
                    "Authentication endpoints",
                    "Cloud deployment with monitoring"
                ],
                "estimated_time": "3-5 minutes",
                "complexity": "medium"
            }
        ]
    }

@router.get("/analytics")
async def get_onboarding_analytics():
    """Get onboarding system analytics"""
    try:
        onboarding_system = await get_onboarding_system()
        analytics = await onboarding_system.get_onboarding_analytics()
        
        return {
            "success": True,
            "analytics": analytics,
            "message": "Onboarding analytics retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get onboarding analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve onboarding analytics")

@router.get("/templates")
async def get_onboarding_templates():
    """Get available templates for onboarding"""
    return {
        "success": True,
        "templates": {
            "sample_projects": [
                {
                    "name": "AI Chat Application",
                    "description": "Modern chat interface with AI integration",
                    "type": "web_app",
                    "technologies": ["React", "FastAPI", "Groq AI"],
                    "difficulty": "beginner",
                    "estimated_build_time": "30 minutes"
                },
                {
                    "name": "Task Management Dashboard",
                    "description": "Intelligent task management with AI assistance",
                    "type": "productivity",
                    "technologies": ["React", "MongoDB", "AI Analytics"],
                    "difficulty": "intermediate",
                    "estimated_build_time": "45 minutes"
                },
                {
                    "name": "Content Generation Platform",
                    "description": "AI-powered content creation and management",
                    "type": "content_management",
                    "technologies": ["React", "FastAPI", "AI Content Gen"],
                    "difficulty": "advanced",
                    "estimated_build_time": "60 minutes"
                }
            ],
            "workflow_templates": [
                {
                    "name": "Automated Content Pipeline",
                    "description": "Generate, review, and publish content automatically",
                    "steps": 5,
                    "integrations": ["AI Generation", "Review System", "CMS"]
                },
                {
                    "name": "Customer Support Automation",
                    "description": "AI-powered customer support ticket processing",
                    "steps": 4,
                    "integrations": ["AI Chat", "Knowledge Base", "Ticketing"]
                }
            ]
        }
    }

@router.post("/feedback")
async def submit_onboarding_feedback(
    rating: int = Body(..., ge=1, le=5, description="Rating from 1-5"),
    feedback: str = Body(..., description="Feedback text"),
    step: Optional[str] = Body(None, description="Specific step feedback relates to"),
    user_id: str = Query(..., description="User ID")
):
    """Submit onboarding feedback"""
    try:
        # Store feedback (would integrate with feedback system)
        feedback_data = {
            "user_id": user_id,
            "rating": rating,
            "feedback": feedback,
            "step": step,
            "timestamp": datetime.utcnow()
        }
        
        logger.info(f"📝 Onboarding feedback received: {user_id} - Rating: {rating}")
        
        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "thank_you": "Thank you for helping us improve the onboarding experience!"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to submit onboarding feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")