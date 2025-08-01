from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from services.workflow_automation import WorkflowEngine, TriggerType, ActionType
from routes.auth import get_current_user

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter()

# Global workflow engine instance
workflow_engine = None

def set_workflow_engine(engine: WorkflowEngine):
    """Set the workflow engine instance"""
    global workflow_engine
    workflow_engine = engine

@router.get("/workflows")
async def get_workflows(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all workflows"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        workflows = await workflow_engine.get_workflows()
        
        return {
            "success": True,
            "workflows": workflows,
            "total": len(workflows),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflows: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/workflows")
async def create_workflow(
    workflow_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new workflow"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        
        # Validate required fields
        required_fields = ["name", "description", "triggers", "actions"]
        for field in required_fields:
            if field not in workflow_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create workflow
        workflow_id = await workflow_engine.create_workflow(
            name=workflow_data["name"],
            description=workflow_data["description"],
            triggers=workflow_data["triggers"],
            actions=workflow_data["actions"],
            created_by=current_user.get("user_id", "unknown")
        )
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "message": "Workflow created successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflows/{workflow_id}/trigger")
async def trigger_workflow(
    workflow_id: str,
    event_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Manually trigger a workflow"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        # Trigger custom event
        await workflow_engine.trigger_event(
            event_type=TriggerType.CUSTOM_EVENT,
            event_data={
                "workflow_id": workflow_id,
                "manual_trigger": True,
                **event_data
            }
        )
        
        return {
            "success": True,
            "message": "Workflow triggered successfully",
            "workflow_id": workflow_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering workflow: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/workflows/{workflow_id}/executions")
async def get_workflow_executions(
    workflow_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get executions for a workflow"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        executions = await workflow_engine.get_workflow_executions(workflow_id)
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "executions": executions,
            "total": len(executions),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow executions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/workflows/{workflow_id}/pause")
async def pause_workflow(
    workflow_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Pause a workflow"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        await workflow_engine.pause_workflow(workflow_id)
        
        return {
            "success": True,
            "message": "Workflow paused successfully",
            "workflow_id": workflow_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error pausing workflow: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/workflows/{workflow_id}/resume")
async def resume_workflow(
    workflow_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Resume a workflow"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        await workflow_engine.resume_workflow(workflow_id)
        
        return {
            "success": True,
            "message": "Workflow resumed successfully",
            "workflow_id": workflow_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resuming workflow: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a workflow"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        await workflow_engine.delete_workflow(workflow_id)
        
        return {
            "success": True,
            "message": "Workflow deleted successfully",
            "workflow_id": workflow_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting workflow: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/workflows/capabilities")
async def get_workflow_capabilities():
    """Get workflow engine capabilities"""
    try:
        trigger_types = [
            {
                "type": "project.created",
                "description": "Triggered when a new project is created",
                "conditions": ["project_type", "user_id", "template_used"]
            },
            {
                "type": "project.deployed",
                "description": "Triggered when a project is deployed",
                "conditions": ["environment", "project_id", "success"]
            },
            {
                "type": "ai.response.generated",
                "description": "Triggered when AI generates a response",
                "conditions": ["model_used", "response_type", "content_length"]
            },
            {
                "type": "user.signed_up",
                "description": "Triggered when a new user signs up",
                "conditions": ["user_type", "referral_source"]
            },
            {
                "type": "integration.added",
                "description": "Triggered when an integration is added",
                "conditions": ["integration_type", "project_id"]
            },
            {
                "type": "schedule",
                "description": "Triggered on a schedule",
                "conditions": ["daily", "hourly", "every_N_minutes", "every_N_hours"]
            },
            {
                "type": "webhook",
                "description": "Triggered by incoming webhook",
                "conditions": ["webhook_source", "payload_type"]
            }
        ]
        
        action_types = [
            {
                "type": "send_webhook",
                "description": "Send HTTP webhook to external service",
                "config": ["url", "method", "headers", "data"]
            },
            {
                "type": "send_email",
                "description": "Send email notification",
                "config": ["to", "subject", "template", "data"]
            },
            {
                "type": "send_slack",
                "description": "Send Slack message",
                "config": ["channel", "message", "webhook_url"]
            },
            {
                "type": "ai_enhance",
                "description": "Enhance content with AI",
                "config": ["prompt", "model", "enhancement_type"]
            },
            {
                "type": "send_notification",
                "description": "Send in-app notification",
                "config": ["title", "message", "recipients", "priority"]
            },
            {
                "type": "run_script",
                "description": "Execute custom script",
                "config": ["type", "script", "parameters"]
            },
            {
                "type": "update_database",
                "description": "Update database records",
                "config": ["collection", "operation", "query", "data"]
            },
            {
                "type": "trigger_deployment",
                "description": "Trigger application deployment",
                "config": ["project_id", "environment", "build_config"]
            }
        ]
        
        return {
            "success": True,
            "capabilities": {
                "trigger_types": trigger_types,
                "action_types": action_types,
                "max_actions_per_workflow": 10,
                "max_triggers_per_workflow": 5,
                "supports_conditions": True,
                "supports_scheduling": True,
                "supports_retries": True
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow capabilities: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/events/trigger")
async def trigger_event(
    event_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Trigger a workflow event"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not available")
        
        # Validate event data
        if "event_type" not in event_data:
            raise HTTPException(status_code=400, detail="Missing event_type")
        
        try:
            event_type = TriggerType(event_data["event_type"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid event_type")
        
        # Trigger event
        await workflow_engine.trigger_event(
            event_type=event_type,
            event_data=event_data.get("data", {}),
            context=event_data.get("context", {})
        )
        
        return {
            "success": True,
            "message": "Event triggered successfully",
            "event_type": event_data["event_type"],
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering event: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")