#!/usr/bin/env python3
"""
Workflow Builder API Routes
Provides drag-and-drop workflow creation and natural language processing
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from services.workflow_builder_service import workflow_builder_service
from auth import get_current_user

router = APIRouter()

@router.get("/workflows/health")
async def get_workflow_health():
    """Get workflow service health status"""
    try:
        health_data = await workflow_builder_service.get_workflow_health()
        return {
            "success": True,
            "data": health_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow health: {str(e)}")

@router.get("/workflows/templates")
async def get_workflow_templates():
    """Get available workflow templates"""
    try:
        templates = await workflow_builder_service.get_workflow_templates()
        return {
            "success": True,
            "templates": [template.dict() for template in templates],
            "total": len(templates)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow templates: {str(e)}")

@router.post("/workflows/create/from-template")
async def create_workflow_from_template(
    template_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Create a new workflow from template"""
    try:
        required_fields = ["template_id", "workflow_name"]
        for field in required_fields:
            if field not in template_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        user_id = current_user.get("id", "unknown")
        
        workflow = await workflow_builder_service.create_workflow_from_template(
            user_id=user_id,
            template_id=template_data["template_id"],
            workflow_name=template_data["workflow_name"]
        )
        
        return {
            "success": True,
            "workflow": workflow.dict(),
            "message": f"Workflow '{workflow.name}' created from template"
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create workflow from template: {str(e)}")

@router.post("/workflows/create/from-description")
async def create_workflow_from_natural_language(
    nl_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Create workflow from natural language description"""
    try:
        if "description" not in nl_data:
            raise HTTPException(status_code=400, detail="Missing required field: description")
        
        user_id = current_user.get("id", "unknown")
        
        workflow = await workflow_builder_service.create_workflow_from_natural_language(
            user_id=user_id,
            description=nl_data["description"]
        )
        
        return {
            "success": True,
            "workflow": workflow.dict(),
            "message": "Workflow created from natural language description",
            "note": "This is an AI-generated workflow. Please review and customize as needed."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create workflow from description: {str(e)}")

@router.get("/workflows/user")
async def get_user_workflows(current_user: dict = Depends(get_current_user)):
    """Get all workflows for the current user"""
    try:
        user_id = current_user.get("id", "unknown")
        workflows = await workflow_builder_service.get_user_workflows(user_id)
        
        return {
            "success": True,
            "workflows": [workflow.dict() for workflow in workflows],
            "total": len(workflows)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user workflows: {str(e)}")

@router.get("/workflows/{workflow_id}")
async def get_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific workflow"""
    try:
        workflow = await workflow_builder_service.get_workflow(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Verify user access
        if workflow.user_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Access denied to this workflow")
        
        return {
            "success": True,
            "workflow": workflow.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow: {str(e)}")

@router.patch("/workflows/{workflow_id}")
async def update_workflow(
    workflow_id: str,
    updates: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Update workflow configuration"""
    try:
        # First verify the workflow exists and user has access
        workflow = await workflow_builder_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        if workflow.user_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Access denied to this workflow")
        
        updated_workflow = await workflow_builder_service.update_workflow(workflow_id, updates)
        
        return {
            "success": True,
            "workflow": updated_workflow.dict(),
            "message": "Workflow updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update workflow: {str(e)}")

@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    execution_data: Dict[str, Any] = None,
    current_user: dict = Depends(get_current_user)
):
    """Execute a workflow"""
    try:
        # Verify workflow exists and user has access
        workflow = await workflow_builder_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        if workflow.user_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Access denied to this workflow")
        
        if workflow.status != "active":
            raise HTTPException(status_code=400, detail=f"Cannot execute workflow with status: {workflow.status}")
        
        input_data = execution_data.get("input_data", {}) if execution_data else {}
        
        execution = await workflow_builder_service.execute_workflow(workflow_id, input_data)
        
        return {
            "success": True,
            "execution": execution.dict(),
            "message": "Workflow execution started"
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute workflow: {str(e)}")

@router.get("/workflows/execution/{execution_id}/status")
async def get_execution_status(
    execution_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get workflow execution status"""
    try:
        execution = await workflow_builder_service.get_execution_status(execution_id)
        
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        # Verify user access by checking the workflow
        workflow = await workflow_builder_service.get_workflow(execution.workflow_id)
        if not workflow or workflow.user_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Access denied to this execution")
        
        return {
            "success": True,
            "execution": execution.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get execution status: {str(e)}")

@router.get("/workflows/builder/nodes")
async def get_available_node_types():
    """Get all available node types for the visual builder"""
    try:
        node_types = await workflow_builder_service.get_available_node_types()
        return {
            "success": True,
            "node_types": node_types,
            "categories": list(node_types.keys()),
            "total_nodes": sum(len(nodes) for nodes in node_types.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get available node types: {str(e)}")

@router.get("/workflows/categories")
async def get_workflow_categories():
    """Get workflow categories and their descriptions"""
    try:
        categories = {
            "Content Creation": {
                "description": "Workflows for automated content generation and management",
                "examples": ["Blog automation", "Social media content", "Marketing materials"],
                "difficulty": "beginner",
                "popular_templates": ["AI Content Generator", "Social Media Scheduler"]
            },
            "DevOps": {
                "description": "Development and deployment automation workflows",
                "examples": ["CI/CD pipelines", "Automated testing", "Infrastructure management"],
                "difficulty": "intermediate",
                "popular_templates": ["Project Deployment Pipeline", "Automated Testing"]
            },
            "Development": {
                "description": "Code-related automation and assistance workflows",
                "examples": ["Code review", "Documentation generation", "Bug tracking"],
                "difficulty": "advanced",
                "popular_templates": ["AI Code Review Assistant", "Documentation Generator"]
            },
            "Customer Support": {
                "description": "Customer service automation and management workflows",
                "examples": ["Support ticket routing", "Auto-responses", "Escalation management"],
                "difficulty": "intermediate",
                "popular_templates": ["Customer Support Automation", "Ticket Routing"]
            },
            "Data Processing": {
                "description": "Data transformation, analysis, and reporting workflows",
                "examples": ["ETL pipelines", "Report generation", "Data validation"],
                "difficulty": "advanced",
                "popular_templates": ["Data Processing Pipeline", "Analytics Reporter"]
            },
            "Marketing": {
                "description": "Marketing automation and campaign management workflows",
                "examples": ["Email campaigns", "Lead nurturing", "Social media automation"],
                "difficulty": "intermediate",
                "popular_templates": ["Email Campaign Automation", "Lead Scoring"]
            },
            "Project Management": {
                "description": "Project coordination and team collaboration workflows",
                "examples": ["Task automation", "Status updates", "Resource allocation"],
                "difficulty": "beginner",
                "popular_templates": ["Project Status Updates", "Task Assignment"]
            },
            "Integration": {
                "description": "Third-party service integration and data synchronization workflows",
                "examples": ["API synchronization", "Data migration", "Service orchestration"],
                "difficulty": "advanced",
                "popular_templates": ["API Sync Workflow", "Data Migration"]
            }
        }
        
        return {
            "success": True,
            "categories": categories,
            "total_categories": len(categories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow categories: {str(e)}")