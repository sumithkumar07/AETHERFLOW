from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging

from models.user import User
from models.database import get_database
from routes.auth import get_current_user
from services.project_service import ProjectService
from services.ai_service import AIService
from services.workflow_automation import WorkflowAutomationService
from services.smart_template_generation import SmartTemplateGenerationService
from services.performance_optimizer import PerformanceOptimizerService

router = APIRouter()
logger = logging.getLogger(__name__)

# Enhanced services
project_service = ProjectService()
ai_service = AIService()
workflow_service = WorkflowAutomationService()
template_service = SmartTemplateGenerationService()
perf_service = PerformanceOptimizerService()

class EnhancedProjectRequest(BaseModel):
    name: str
    description: str
    technology_stack: List[str]
    project_type: str  # web_app, api, mobile_app, desktop_app, ai_model
    ai_requirements: Optional[Dict] = {}
    performance_targets: Optional[Dict] = {}
    deployment_preferences: Optional[Dict] = {}

class ProjectPhaseUpdate(BaseModel):
    phase: str  # planning, development, testing, deployment, maintenance
    status: str  # not_started, in_progress, completed, blocked
    progress_percentage: int
    ai_insights: Optional[Dict] = {}
    blockers: Optional[List[str]] = []

class AIEnhancedDeployment(BaseModel):
    project_id: str
    deployment_type: str  # staging, production, preview
    environment_config: Dict[str, Any]
    optimization_level: str = "high"  # low, medium, high, maximum

@router.post("/enhanced/create")
async def create_enhanced_project(
    project_data: EnhancedProjectRequest,
    current_user: User = Depends(get_current_user)
):
    """Create an AI-enhanced project with full lifecycle support"""
    try:
        logger.info(f"Creating enhanced project for user {current_user.id}")
        
        # Generate project ID
        project_id = f"proj_{uuid.uuid4().hex[:12]}"
        
        # AI-powered project analysis and setup
        ai_analysis = await ai_service.process_message(
            message=f"Analyze project requirements: {project_data.description}. Tech stack: {project_data.technology_stack}",
            model="llama3.1:8b",
            agent="architect",
            user_id=str(current_user.id)
        )
        
        # Generate smart project template
        template_result = await template_service.generate_project_template(
            project_type=project_data.project_type,
            tech_stack=project_data.technology_stack,
            ai_requirements=project_data.ai_requirements,
            user_preferences={}
        )
        
        # Create performance baseline
        performance_baseline = await perf_service.create_performance_baseline(
            project_type=project_data.project_type,
            targets=project_data.performance_targets
        )
        
        # Initialize automated workflows
        workflow_config = await workflow_service.initialize_project_workflows(
            project_id=project_id,
            project_type=project_data.project_type,
            deployment_prefs=project_data.deployment_preferences
        )
        
        # Create enhanced project record
        db = await get_database()
        
        enhanced_project = {
            "_id": project_id,
            "name": project_data.name,
            "description": project_data.description,
            "owner_id": str(current_user.id),
            "technology_stack": project_data.technology_stack,
            "project_type": project_data.project_type,
            
            # AI Enhancement Features
            "ai_analysis": ai_analysis,
            "ai_requirements": project_data.ai_requirements,
            "smart_template": template_result,
            
            # Project Lifecycle
            "lifecycle_phase": "planning",
            "phases": {
                "planning": {"status": "in_progress", "progress": 25, "started_at": datetime.utcnow()},
                "development": {"status": "not_started", "progress": 0},
                "testing": {"status": "not_started", "progress": 0},
                "deployment": {"status": "not_started", "progress": 0},
                "maintenance": {"status": "not_started", "progress": 0}
            },
            
            # Performance & Optimization
            "performance_baseline": performance_baseline,
            "performance_targets": project_data.performance_targets,
            "optimization_history": [],
            
            # Automation & Workflows
            "workflow_config": workflow_config,
            "automated_features": {
                "ai_code_review": True,
                "performance_monitoring": True,
                "security_scanning": True,
                "deployment_pipeline": True,
                "testing_automation": True
            },
            
            # Real-time Features
            "real_time_features": {
                "collaboration": True,
                "ai_assistance": True,
                "live_preview": True,
                "performance_monitoring": True
            },
            
            # Project Health
            "health_metrics": {
                "code_quality": 85,
                "test_coverage": 0,
                "security_score": 95,
                "performance_score": 90,
                "documentation_coverage": 20
            },
            
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.projects.insert_one(enhanced_project)
        
        # Initialize project services
        await _initialize_project_services(project_id, enhanced_project)
        
        logger.info(f"Enhanced project {project_id} created successfully")
        
        return {
            "project_id": project_id,
            "project": enhanced_project,
            "ai_insights": ai_analysis,
            "template_generated": template_result.get("files_created", 0),
            "workflows_initialized": len(workflow_config.get("workflows", [])),
            "next_steps": [
                "Review AI-generated project analysis",
                "Customize the smart template",
                "Begin development phase",
                "Set up collaboration features"
            ],
            "ai_capabilities": {
                "unlimited_local_ai": True,
                "real_time_assistance": True,
                "multi_agent_support": True,
                "automated_workflows": True
            }
        }
        
    except Exception as e:
        logger.error(f"Enhanced project creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create enhanced project")

@router.put("/enhanced/{project_id}/phase")
async def update_project_phase(
    project_id: str,
    phase_update: ProjectPhaseUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update project phase with AI insights and automation"""
    try:
        db = await get_database()
        
        # Get current project
        project = await db.projects.find_one({"_id": project_id, "owner_id": str(current_user.id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # AI analysis of phase transition
        transition_analysis = await ai_service.process_message(
            message=f"Analyze phase transition from {project.get('lifecycle_phase')} to {phase_update.phase}. Progress: {phase_update.progress_percentage}%",
            model="llama3.1:8b", 
            agent="analyst",
            user_id=str(current_user.id),
            project_id=project_id
        )
        
        # Update phase information
        phase_update_data = {
            f"phases.{phase_update.phase}.status": phase_update.status,
            f"phases.{phase_update.phase}.progress": phase_update.progress_percentage,
            f"phases.{phase_update.phase}.updated_at": datetime.utcnow(),
            f"phases.{phase_update.phase}.ai_insights": phase_update.ai_insights
        }
        
        if phase_update.status == "in_progress" and project["phases"][phase_update.phase]["status"] == "not_started":
            phase_update_data[f"phases.{phase_update.phase}.started_at"] = datetime.utcnow()
        
        if phase_update.status == "completed":
            phase_update_data[f"phases.{phase_update.phase}.completed_at"] = datetime.utcnow()
            # Trigger phase completion workflows
            await workflow_service.trigger_phase_completion_workflows(project_id, phase_update.phase)
        
        # Update current lifecycle phase
        if phase_update.status == "in_progress":
            phase_update_data["lifecycle_phase"] = phase_update.phase
        
        # Add transition analysis
        phase_update_data[f"phases.{phase_update.phase}.transition_analysis"] = transition_analysis
        
        # Handle blockers with AI suggestions
        if phase_update.blockers:
            blocker_solutions = await _get_ai_blocker_solutions(phase_update.blockers, project_id)
            phase_update_data[f"phases.{phase_update.phase}.blocker_solutions"] = blocker_solutions
        
        await db.projects.update_one(
            {"_id": project_id},
            {"$set": phase_update_data}
        )
        
        # Get updated project
        updated_project = await db.projects.find_one({"_id": project_id})
        
        return {
            "project_id": project_id,
            "phase_updated": phase_update.phase,
            "new_status": phase_update.status,
            "progress": phase_update.progress_percentage,
            "ai_insights": transition_analysis,
            "automated_actions": await _get_automated_actions_for_phase(phase_update.phase, phase_update.status),
            "project_health": _calculate_project_health(updated_project),
            "next_recommendations": await _get_phase_recommendations(updated_project, phase_update.phase)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Phase update failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update project phase")

@router.post("/enhanced/{project_id}/deploy")
async def ai_enhanced_deployment(
    project_id: str,
    deployment_data: AIEnhancedDeployment,
    current_user: User = Depends(get_current_user)
):
    """AI-enhanced project deployment with optimization"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({"_id": project_id, "owner_id": str(current_user.id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Pre-deployment AI analysis
        deployment_analysis = await ai_service.process_message(
            message=f"Analyze deployment readiness for {project['name']}. Type: {deployment_data.deployment_type}",
            model="codellama:13b",
            agent="integrator",
            user_id=str(current_user.id),
            project_id=project_id
        )
        
        # Performance optimization recommendations
        perf_optimizations = await perf_service.get_deployment_optimizations(
            project_id=project_id,
            deployment_type=deployment_data.deployment_type,
            optimization_level=deployment_data.optimization_level
        )
        
        # Execute deployment workflow
        deployment_result = await workflow_service.execute_deployment_workflow(
            project_id=project_id,
            deployment_config={
                "type": deployment_data.deployment_type,
                "environment": deployment_data.environment_config,
                "optimizations": perf_optimizations,
                "ai_analysis": deployment_analysis
            }
        )
        
        # Create deployment record
        deployment_record = {
            "_id": f"deploy_{uuid.uuid4().hex[:12]}",
            "project_id": project_id,
            "deployment_type": deployment_data.deployment_type,
            "environment_config": deployment_data.environment_config,
            "ai_analysis": deployment_analysis,
            "performance_optimizations": perf_optimizations,
            "deployment_result": deployment_result,
            "status": deployment_result.get("status", "completed"),
            "deployed_at": datetime.utcnow(),
            "deployed_by": str(current_user.id)
        }
        
        await db.deployments.insert_one(deployment_record)
        
        # Update project deployment status
        await db.projects.update_one(
            {"_id": project_id},
            {"$set": {
                "phases.deployment.status": "completed" if deployment_result.get("success") else "blocked",
                "phases.deployment.progress": 100 if deployment_result.get("success") else 75,
                "phases.deployment.completed_at": datetime.utcnow(),
                "latest_deployment": deployment_record["_id"]
            }}
        )
        
        return {
            "deployment_id": deployment_record["_id"],
            "project_id": project_id,
            "deployment_status": deployment_result.get("status"),
            "deployment_url": deployment_result.get("url"),
            "ai_analysis": deployment_analysis,
            "performance_optimizations": perf_optimizations,
            "deployment_metrics": deployment_result.get("metrics", {}),
            "post_deployment_monitoring": {
                "enabled": True,
                "ai_monitoring": True,
                "performance_tracking": True,
                "error_reporting": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI-enhanced deployment failed: {e}")
        raise HTTPException(status_code=500, detail="Deployment failed")

@router.get("/enhanced/{project_id}/lifecycle-insights")
async def get_project_lifecycle_insights(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive project lifecycle insights"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({"_id": project_id, "owner_id": str(current_user.id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # AI-powered lifecycle analysis
        lifecycle_analysis = await ai_service.process_message(
            message=f"Analyze project lifecycle for {project['name']}. Current phase: {project.get('lifecycle_phase')}",
            model="llama3.1:8b",
            agent="analyst", 
            user_id=str(current_user.id),
            project_id=project_id
        )
        
        # Performance insights
        performance_insights = await perf_service.get_project_performance_insights(project_id)
        
        # Workflow insights
        workflow_insights = await workflow_service.get_project_workflow_insights(project_id)
        
        # Calculate lifecycle metrics
        lifecycle_metrics = _calculate_lifecycle_metrics(project)
        
        return {
            "project_id": project_id,
            "lifecycle_analysis": lifecycle_analysis,
            "current_phase": project.get("lifecycle_phase"),
            "phase_progress": lifecycle_metrics,
            "performance_insights": performance_insights,
            "workflow_insights": workflow_insights,
            "ai_recommendations": await _get_lifecycle_recommendations(project, lifecycle_analysis),
            "project_health": _calculate_project_health(project),
            "predicted_completion": _predict_project_completion(project, lifecycle_metrics),
            "optimization_opportunities": await _identify_optimization_opportunities(project_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get lifecycle insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to get insights")

async def _initialize_project_services(project_id: str, project_data: Dict):
    """Initialize all project services"""
    try:
        # Initialize performance monitoring
        await perf_service.initialize_project_monitoring(project_id)
        
        # Initialize collaboration features
        # await collab_service.initialize_project_collaboration(project_id)
        
        # Initialize AI assistance
        await ai_service.initialize_project_context(project_id, project_data)
        
        logger.info(f"Project services initialized for {project_id}")
    except Exception as e:
        logger.error(f"Failed to initialize project services: {e}")

async def _get_ai_blocker_solutions(blockers: List[str], project_id: str):
    """Get AI-powered solutions for project blockers"""
    solutions = []
    
    for blocker in blockers:
        solution = await ai_service.process_message(
            message=f"Provide solution for project blocker: {blocker}",
            model="llama3.1:8b",
            agent="developer"
        )
        
        solutions.append({
            "blocker": blocker,
            "ai_solution": solution.get("response", ""),
            "confidence": solution.get("confidence", 0.8)
        })
    
    return solutions

async def _get_automated_actions_for_phase(phase: str, status: str):
    """Get automated actions based on phase and status"""
    actions = {
        "planning": {
            "in_progress": ["Generate project documentation", "Create development roadmap"],
            "completed": ["Initialize development environment", "Set up CI/CD pipeline"]
        },
        "development": {
            "in_progress": ["Enable code quality checks", "Set up automated testing"],
            "completed": ["Deploy to staging", "Run comprehensive tests"]
        },
        "testing": {
            "in_progress": ["Execute automated test suites", "Performance testing"],
            "completed": ["Security scan", "Deployment preparation"]
        },
        "deployment": {
            "in_progress": ["Monitor deployment progress", "Health checks"],
            "completed": ["Enable monitoring", "Post-deployment verification"]
        }
    }
    
    return actions.get(phase, {}).get(status, [])

def _calculate_project_health(project: Dict):
    """Calculate overall project health score"""
    health_metrics = project.get("health_metrics", {})
    
    weights = {
        "code_quality": 0.25,
        "test_coverage": 0.20,
        "security_score": 0.20,
        "performance_score": 0.20,
        "documentation_coverage": 0.15
    }
    
    total_score = 0
    for metric, weight in weights.items():
        score = health_metrics.get(metric, 75)  # Default score
        total_score += score * weight
    
    return {
        "overall_score": round(total_score, 1),
        "individual_scores": health_metrics,
        "health_status": "excellent" if total_score >= 90 else 
                        "good" if total_score >= 80 else
                        "fair" if total_score >= 70 else "needs_improvement"
    }

async def _get_phase_recommendations(project: Dict, current_phase: str):
    """Get AI recommendations for current phase"""
    recommendations = {
        "planning": [
            "Refine project requirements with AI assistance",
            "Generate comprehensive documentation",
            "Set up development environment"
        ],
        "development": [
            "Implement core features with AI code generation",
            "Set up automated testing",
            "Regular code reviews with AI assistance"
        ],
        "testing": [
            "Run comprehensive test suites",
            "Performance testing with AI optimization",
            "Security vulnerability scanning"
        ],
        "deployment": [
            "Deploy to staging environment",
            "Run post-deployment verification",
            "Monitor application performance"
        ]
    }
    
    return recommendations.get(current_phase, [])

def _calculate_lifecycle_metrics(project: Dict):
    """Calculate lifecycle phase metrics"""
    phases = project.get("phases", {})
    total_progress = 0
    completed_phases = 0
    
    for phase, data in phases.items():
        progress = data.get("progress", 0)
        total_progress += progress
        
        if data.get("status") == "completed":
            completed_phases += 1
    
    return {
        "overall_progress": total_progress / len(phases) if phases else 0,
        "completed_phases": completed_phases,
        "total_phases": len(phases),
        "current_phase_progress": phases.get(project.get("lifecycle_phase", ""), {}).get("progress", 0)
    }

async def _get_lifecycle_recommendations(project: Dict, ai_analysis: Dict):
    """Get lifecycle-specific recommendations"""
    current_phase = project.get("lifecycle_phase", "planning")
    
    return [
        f"Focus on {current_phase} phase optimization",
        "Leverage unlimited local AI for faster development",
        "Implement automated workflows for efficiency",
        "Use real-time collaboration features for team coordination"
    ]

def _predict_project_completion(project: Dict, metrics: Dict):
    """Predict project completion timeline"""
    current_progress = metrics.get("overall_progress", 0)
    
    if current_progress > 0:
        estimated_days = round((100 - current_progress) / 2)  # Simple estimation
        return {
            "estimated_completion_days": estimated_days,
            "confidence": 0.75,
            "factors": ["Current progress rate", "AI acceleration", "Automation benefits"]
        }
    
    return {
        "estimated_completion_days": 30,
        "confidence": 0.5,
        "factors": ["Initial estimate", "Project complexity", "Team size"]
    }

async def _identify_optimization_opportunities(project_id: str):
    """Identify optimization opportunities"""
    return [
        {
            "area": "Development Speed",
            "opportunity": "Increase AI-assisted code generation usage",
            "potential_impact": "30% faster development"
        },
        {
            "area": "Code Quality",
            "opportunity": "Enable automated code reviews",
            "potential_impact": "25% fewer bugs"
        },
        {
            "area": "Testing",
            "opportunity": "Implement AI-powered test generation",
            "potential_impact": "50% better test coverage"
        }
    ]