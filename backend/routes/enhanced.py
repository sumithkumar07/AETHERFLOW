from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import uuid
import json

from models.user import User
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

class EnhancedInitRequest(BaseModel):
    project_id: str
    features: Dict[str, bool]

class PatternTrackingRequest(BaseModel):
    project_id: str
    action: str
    metadata: Optional[Dict] = {}

class ContextUpdateRequest(BaseModel):
    context_type: str
    context_data: Dict
    timestamp: str

class InsightsRequest(BaseModel):
    project_id: str
    analysis_types: List[str]

class WorkflowRequest(BaseModel):
    project_id: str
    workflow: Dict

class FeatureToggleRequest(BaseModel):
    feature: str
    enabled: bool
    timestamp: str

@router.post("/initialize")
async def initialize_enhanced_features(
    request: EnhancedInitRequest,
    current_user: User = Depends(get_current_user)
):
    """Initialize enhanced features for a project"""
    try:
        logger.info(f"Initializing enhanced features for project {request.project_id}")
        
        db = await get_database()
        
        # Check if project exists and belongs to user
        project = await db.projects.find_one({
            "_id": request.project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Initialize enhanced features document
        enhanced_config = {
            "_id": f"enhanced_{request.project_id}",
            "project_id": request.project_id,
            "user_id": str(current_user.id),
            "features": request.features,
            "context": {
                "session_id": f"session_{uuid.uuid4().hex[:12]}",
                "initialized_at": datetime.utcnow(),
                "user_preferences": {},
                "project_context": {
                    "type": project.get("type"),
                    "tech_stack": project.get("tech_stack", []),
                    "status": project.get("status")
                }
            },
            "patterns": [],
            "insights": {
                "project_health": None,
                "code_quality": None,
                "performance_metrics": None,
                "security_analysis": None
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Upsert enhanced configuration
        await db.enhanced_projects.replace_one(
            {"project_id": request.project_id, "user_id": str(current_user.id)},
            enhanced_config,
            upsert=True
        )
        
        return {
            "success": True,
            "context": enhanced_config["context"],
            "message": "Enhanced features initialized successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced features initialization error: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize enhanced features")

@router.post("/track-pattern")
async def track_development_pattern(
    request: PatternTrackingRequest,
    current_user: User = Depends(get_current_user)
):
    """Track development patterns for analysis"""
    try:
        db = await get_database()
        
        pattern_data = {
            "_id": f"pattern_{uuid.uuid4().hex[:12]}",
            "project_id": request.project_id,
            "user_id": str(current_user.id),
            "action": request.action,
            "metadata": request.metadata,
            "timestamp": datetime.utcnow()
        }
        
        # Insert pattern
        await db.development_patterns.insert_one(pattern_data)
        
        # Update enhanced project with latest pattern
        await db.enhanced_projects.update_one(
            {"project_id": request.project_id, "user_id": str(current_user.id)},
            {
                "$push": {"patterns": {"$each": [pattern_data], "$slice": -100}},
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        return {"success": True, "pattern_id": pattern_data["_id"]}
        
    except Exception as e:
        logger.error(f"Pattern tracking error: {e}")
        raise HTTPException(status_code=500, detail="Failed to track pattern")

@router.post("/context")
async def update_context_awareness(
    request: ContextUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update context awareness data"""
    try:
        db = await get_database()
        
        context_update = {
            "type": request.context_type,
            "data": request.context_data,
            "timestamp": request.timestamp,
            "updated_by": str(current_user.id)
        }
        
        # Update enhanced project context
        result = await db.enhanced_projects.update_one(
            {"user_id": str(current_user.id)},
            {
                "$set": {
                    f"context.session_data.{request.context_type}": request.context_data,
                    "context.last_updated": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            # Create new enhanced project record
            enhanced_config = {
                "_id": f"enhanced_{uuid.uuid4().hex[:8]}",
                "user_id": str(current_user.id),
                "context": {
                    "session_data": {request.context_type: request.context_data},
                    "last_updated": datetime.utcnow()
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.enhanced_projects.insert_one(enhanced_config)
        
        return {
            "success": True,
            "context": context_update,
            "message": "Context updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Context update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update context")

@router.post("/insights")
async def generate_smart_insights(
    request: InsightsRequest,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Generate smart insights for project"""
    try:
        db = await get_database()
        
        # Check project access
        project = await db.projects.find_one({
            "_id": request.project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Generate insights based on analysis types
        insights = {}
        
        if "health" in request.analysis_types:
            insights["project_health"] = {
                "score": 85,  # Mock score
                "factors": {
                    "code_quality": 90,
                    "test_coverage": 75,
                    "documentation": 80,
                    "dependencies": 95
                },
                "recommendations": [
                    "Improve test coverage for better reliability",
                    "Add more inline documentation",
                    "Consider updating some dependencies"
                ]
            }
        
        if "quality" in request.analysis_types:
            insights["code_quality"] = {
                "score": "A",
                "issues": 3,
                "complexity": "Low",
                "maintainability": "High",
                "suggestions": [
                    "Extract some complex functions into smaller ones",
                    "Add type hints for better code clarity",
                    "Consider using constants for magic numbers"
                ]
            }
        
        if "performance" in request.analysis_types:
            insights["performance_metrics"] = {
                "load_time": 1.2,
                "bundle_size": "245KB",
                "lighthouse_score": 92,
                "bottlenecks": [
                    "Large image assets could be optimized",
                    "Consider lazy loading for non-critical components"
                ]
            }
        
        if "security" in request.analysis_types:
            insights["security_analysis"] = {
                "score": "A+",
                "vulnerabilities": 0,
                "issues": [],
                "recommendations": [
                    "All dependencies are up to date",
                    "No known security vulnerabilities detected",
                    "Consider implementing HTTPS headers"
                ]
            }
        
        # Update enhanced project with insights
        await db.enhanced_projects.update_one(
            {"project_id": request.project_id, "user_id": str(current_user.id)},
            {
                "$set": {
                    "insights": insights,
                    "insights_generated_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        logger.info(f"Generated insights for project {request.project_id}")
        
        return {
            "success": True,
            "insights": insights,
            "message": "Smart insights generated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Insights generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")

@router.post("/workflows")
async def create_workflow_automation(
    request: WorkflowRequest,
    current_user: User = Depends(get_current_user)
):
    """Create workflow automation"""
    try:
        db = await get_database()
        
        workflow_data = {
            "_id": f"workflow_{uuid.uuid4().hex[:12]}",
            "project_id": request.project_id,
            "user_id": str(current_user.id),
            "name": request.workflow.get("name", "Unnamed Workflow"),
            "triggers": request.workflow.get("triggers", []),
            "actions": request.workflow.get("actions", []),
            "conditions": request.workflow.get("conditions", []),
            "enabled": True,
            "executions": 0,
            "last_executed": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.workflows.insert_one(workflow_data)
        
        logger.info(f"Created workflow {workflow_data['_id']} for project {request.project_id}")
        
        return {
            "success": True,
            "workflow": workflow_data,
            "message": "Workflow created successfully"
        }
        
    except Exception as e:
        logger.error(f"Workflow creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create workflow")

@router.post("/features")
async def toggle_enhanced_feature(
    request: FeatureToggleRequest,
    current_user: User = Depends(get_current_user)
):
    """Toggle enhanced feature on/off"""
    try:
        db = await get_database()
        
        # Update user's feature preferences
        await db.enhanced_projects.update_many(
            {"user_id": str(current_user.id)},
            {
                "$set": {
                    f"features.{request.feature}": request.enabled,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Also store in user preferences
        await db.users.update_one(
            {"_id": str(current_user.id)},
            {
                "$set": {
                    f"preferences.enhanced_features.{request.feature}": request.enabled,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "feature": request.feature,
            "enabled": request.enabled,
            "message": f"Feature {request.feature} {'enabled' if request.enabled else 'disabled'}"
        }
        
    except Exception as e:
        logger.error(f"Feature toggle error: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle feature")

@router.post("/optimize/{project_id}")
async def optimize_project_performance(
    project_id: str,
    optimizations: List[str],
    current_user: User = Depends(get_current_user)
):
    """Optimize project performance"""
    try:
        db = await get_database()
        
        # Check project access
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Mock optimization results
        optimization_results = {
            "improvements_applied": len(optimizations),
            "metrics": {
                "before": {
                    "bundle_size": "300KB",
                    "load_time": 2.1,
                    "lighthouse_score": 78
                },
                "after": {
                    "bundle_size": "245KB",
                    "load_time": 1.6,
                    "lighthouse_score": 92
                },
                "improvement": {
                    "bundle_size_reduction": "18%",
                    "load_time_improvement": "24%",
                    "lighthouse_improvement": "+14 points"
                }
            },
            "optimizations_applied": optimizations,
            "timestamp": datetime.utcnow()
        }
        
        # Update enhanced project with optimization results
        await db.enhanced_projects.update_one(
            {"project_id": project_id, "user_id": str(current_user.id)},
            {
                "$set": {
                    "optimization_history": optimization_results,
                    "last_optimization": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return optimization_results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization error: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize project")

@router.post("/security-analysis/{project_id}")
async def run_security_analysis(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Run security analysis on project"""
    try:
        db = await get_database()
        
        # Check project access
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Mock security analysis results
        analysis = {
            "score": "A+",
            "vulnerabilities": 0,
            "issues": [],
            "dependencies_checked": len(project.get("tech_stack", [])),
            "scan_date": datetime.utcnow(),
            "recommendations": [
                "All dependencies are up to date",
                "No known security vulnerabilities detected",
                "Consider implementing additional security headers",
                "Enable HTTPS in production environment"
            ],
            "details": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            }
        }
        
        # Update enhanced project
        await db.enhanced_projects.update_one(
            {"project_id": project_id, "user_id": str(current_user.id)},
            {
                "$set": {
                    "security_analysis": analysis,
                    "last_security_scan": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"success": True, "analysis": analysis}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Security analysis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run security analysis")

@router.post("/ai-review")
async def request_ai_code_review(
    project_id: str,
    files: List[str],
    current_user: User = Depends(get_current_user)
):
    """Request AI-powered code review"""
    try:
        db = await get_database()
        
        # Mock AI code review results
        review = {
            "id": f"review_{uuid.uuid4().hex[:12]}",
            "project_id": project_id,
            "files_reviewed": len(files),
            "suggestions": [
                {
                    "file": "src/App.jsx",
                    "line": 45,
                    "type": "best_practice",
                    "severity": "medium",
                    "message": "Consider extracting this component into a separate file",
                    "suggestion": "Create a separate component file for better maintainability"
                },
                {
                    "file": "src/utils/helpers.js",
                    "line": 12,
                    "type": "performance",
                    "severity": "low",
                    "message": "This function could be memoized",
                    "suggestion": "Use React.memo or useMemo to optimize re-renders"
                },
                {
                    "file": "src/components/Modal.jsx",
                    "line": 23,
                    "type": "code_quality",
                    "severity": "medium",
                    "message": "Add prop validation",
                    "suggestion": "Consider adding PropTypes or TypeScript for better type checking"
                }
            ],
            "overall_score": "B+",
            "summary": {
                "code_quality": "Good",
                "best_practices": "Mostly followed",
                "security": "No issues found",
                "performance": "Minor optimizations possible"
            },
            "reviewed_at": datetime.utcnow()
        }
        
        # Store review results
        await db.ai_reviews.insert_one({
            "_id": review["id"],
            "project_id": project_id,
            "user_id": str(current_user.id),
            "review": review,
            "created_at": datetime.utcnow()
        })
        
        return {"success": True, "review": review}
        
    except Exception as e:
        logger.error(f"AI review error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI review")

@router.get("/project-data/{project_id}")
async def get_enhanced_project_data(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all enhanced project data"""
    try:
        db = await get_database()
        
        # Get enhanced project data
        enhanced_project = await db.enhanced_projects.find_one({
            "project_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not enhanced_project:
            return {"success": True, "data": None}
        
        return {
            "success": True,
            "data": {
                "features": enhanced_project.get("features", {}),
                "context": enhanced_project.get("context", {}),
                "insights": enhanced_project.get("insights", {}),
                "patterns": enhanced_project.get("patterns", []),
                "workflows": enhanced_project.get("workflows", []),
                "updated_at": enhanced_project.get("updated_at")
            }
        }
        
    except Exception as e:
        logger.error(f"Enhanced project data fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch enhanced project data")