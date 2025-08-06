from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Pydantic models for Workflow Builder
class WorkflowNode(BaseModel):
    id: str
    type: str  # "trigger", "action", "condition", "ai_agent", "integration"
    name: str
    config: Dict[str, Any]
    position: Dict[str, float]  # x, y coordinates
    inputs: List[str] = []
    outputs: List[str] = []

class WorkflowConnection(BaseModel):
    id: str
    source_node: str
    source_output: str
    target_node: str
    target_input: str
    condition: Optional[str] = None

class Workflow(BaseModel):
    id: str
    name: str
    description: str
    version: str
    created_at: datetime
    updated_at: datetime
    created_by: str
    status: str  # "draft", "active", "paused", "archived"
    nodes: List[WorkflowNode]
    connections: List[WorkflowConnection]
    triggers: List[str]
    variables: Dict[str, Any] = {}
    settings: Dict[str, Any] = {}

class WorkflowExecution(BaseModel):
    id: str
    workflow_id: str
    status: str  # "running", "completed", "failed", "cancelled"
    started_at: datetime
    completed_at: Optional[datetime] = None
    trigger_data: Dict[str, Any]
    execution_log: List[Dict[str, Any]] = []
    output_data: Dict[str, Any] = {}

# Available workflow node types
node_types = {
    "triggers": [
        {
            "type": "webhook",
            "name": "Webhook Trigger",
            "description": "Trigger workflow from HTTP webhook",
            "icon": "🔗",
            "inputs": [],
            "outputs": ["payload"],
            "config_schema": {
                "url": {"type": "string", "description": "Webhook URL"},
                "method": {"type": "select", "options": ["GET", "POST", "PUT"], "default": "POST"}
            }
        },
        {
            "type": "schedule",
            "name": "Schedule Trigger",
            "description": "Trigger workflow on schedule",
            "icon": "⏰",
            "inputs": [],
            "outputs": ["timestamp"],
            "config_schema": {
                "cron": {"type": "string", "description": "Cron expression"},
                "timezone": {"type": "string", "default": "UTC"}
            }
        },
        {
            "type": "file_upload",
            "name": "File Upload",
            "description": "Trigger when file is uploaded",
            "icon": "📁",
            "inputs": [],
            "outputs": ["file_info", "file_content"],
            "config_schema": {
                "allowed_types": {"type": "array", "items": "string"},
                "max_size": {"type": "number", "default": 10485760}
            }
        }
    ],
    "actions": [
        {
            "type": "ai_chat",
            "name": "AI Agent Chat",
            "description": "Send message to AI agent",
            "icon": "🤖",
            "inputs": ["message", "context"],
            "outputs": ["response", "agent_used"],
            "config_schema": {
                "agent": {"type": "select", "options": ["Dev", "Luna", "Atlas", "Quinn", "Sage"]},
                "temperature": {"type": "number", "default": 0.7, "min": 0, "max": 1}
            }
        },
        {
            "type": "code_generation",
            "name": "Generate Code",
            "description": "Generate code using AI",
            "icon": "💻",
            "inputs": ["requirements", "language", "framework"],
            "outputs": ["generated_code", "explanation"],
            "config_schema": {
                "language": {"type": "select", "options": ["JavaScript", "Python", "TypeScript", "Go"]},
                "framework": {"type": "string", "description": "Target framework"}
            }
        },
        {
            "type": "send_email",
            "name": "Send Email",
            "description": "Send email notification",
            "icon": "✉️",
            "inputs": ["to", "subject", "body"],
            "outputs": ["sent", "message_id"],
            "config_schema": {
                "provider": {"type": "select", "options": ["SendGrid", "AWS SES", "SMTP"]},
                "template": {"type": "string", "description": "Email template"}
            }
        },
        {
            "type": "deploy_app",
            "name": "Deploy Application", 
            "description": "Deploy app to cloud platform",
            "icon": "🚀",
            "inputs": ["project_config", "platform"],
            "outputs": ["deployment_url", "status"],
            "config_schema": {
                "platform": {"type": "select", "options": ["Railway", "Vercel", "AWS", "Heroku"]},
                "environment": {"type": "select", "options": ["development", "staging", "production"]}
            }
        }
    ],
    "conditions": [
        {
            "type": "if_condition",
            "name": "If/Then/Else",
            "description": "Conditional logic branch",
            "icon": "🔀",
            "inputs": ["condition_data"],
            "outputs": ["true", "false"],
            "config_schema": {
                "condition": {"type": "string", "description": "Condition expression"},
                "operator": {"type": "select", "options": ["equals", "not_equals", "contains", "greater_than"]}
            }
        },
        {
            "type": "switch",
            "name": "Switch",
            "description": "Multiple condition branches",
            "icon": "🔧",
            "inputs": ["input_value"],
            "outputs": ["case1", "case2", "case3", "default"],
            "config_schema": {
                "cases": {"type": "array", "items": {"type": "object", "properties": {"value": {"type": "string"}, "output": {"type": "string"}}}}
            }
        }
    ],
    "integrations": [
        {
            "type": "github",
            "name": "GitHub Integration",
            "description": "Interact with GitHub repositories",
            "icon": "🐙",
            "inputs": ["action", "repo", "data"],
            "outputs": ["result", "status"],
            "config_schema": {
                "token": {"type": "string", "description": "GitHub API token"},
                "action": {"type": "select", "options": ["create_issue", "create_pr", "commit", "deploy"]}
            }
        },
        {
            "type": "database",
            "name": "Database Operation",
            "description": "Perform database operations",
            "icon": "🗄️",
            "inputs": ["query", "data"],
            "outputs": ["result", "affected_rows"],
            "config_schema": {
                "connection": {"type": "string", "description": "Database connection string"},
                "operation": {"type": "select", "options": ["select", "insert", "update", "delete"]}
            }
        },
        {
            "type": "slack",
            "name": "Slack Notification",
            "description": "Send messages to Slack",
            "icon": "📱",
            "inputs": ["channel", "message", "attachments"],
            "outputs": ["sent", "ts"],
            "config_schema": {
                "webhook_url": {"type": "string", "description": "Slack webhook URL"},
                "channel": {"type": "string", "default": "#general"}
            }
        }
    ]
}

# Sample workflows
sample_workflows = []
workflow_executions = []

@router.get("/health")
async def workflow_health():
    """Health check for workflow builder system"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "workflow_systems": {
            "visual_builder": "operational",
            "execution_engine": "active",
            "node_library": "loaded",
            "natural_language": "enabled"
        },
        "statistics": {
            "total_node_types": sum(len(category) for category in node_types.values()),
            "active_workflows": len([w for w in sample_workflows if w.get("status") == "active"]),
            "total_executions": len(workflow_executions)
        }
    }

@router.get("/templates")
async def get_workflow_templates():
    """Get workflow templates for quick start"""
    templates = [
        {
            "id": "auto_deployment",
            "name": "Automated Deployment",
            "description": "Automatically deploy when code is pushed to main branch",
            "category": "DevOps",
            "difficulty": "Intermediate",
            "estimated_time": "15 minutes",
            "nodes_count": 6,
            "triggers": ["GitHub push"],
            "actions": ["Build", "Test", "Deploy", "Notify"],
            "preview_image": "/workflow-templates/auto-deployment.png",
            "tags": ["deployment", "ci/cd", "automation"],
            "workflow_data": {
                "nodes": [
                    {
                        "id": "trigger_1",
                        "type": "webhook",
                        "name": "GitHub Webhook",
                        "position": {"x": 100, "y": 100},
                        "config": {"method": "POST", "filter": "push"}
                    },
                    {
                        "id": "action_1", 
                        "type": "code_generation",
                        "name": "Build Application",
                        "position": {"x": 300, "y": 100},
                        "config": {"command": "npm run build"}
                    },
                    {
                        "id": "action_2",
                        "type": "deploy_app",
                        "name": "Deploy to Production", 
                        "position": {"x": 500, "y": 100},
                        "config": {"platform": "Railway", "environment": "production"}
                    }
                ]
            }
        },
        {
            "id": "ai_code_review",
            "name": "AI Code Review",
            "description": "Automatically review pull requests using AI agents",
            "category": "Quality Assurance",
            "difficulty": "Advanced",
            "estimated_time": "20 minutes",
            "nodes_count": 8,
            "triggers": ["Pull request"],
            "actions": ["Analyze", "Review", "Comment", "Approve/Reject"],
            "preview_image": "/workflow-templates/ai-code-review.png",
            "tags": ["code review", "ai", "quality", "automation"],
            "workflow_data": {
                "nodes": [
                    {
                        "id": "trigger_1",
                        "type": "webhook",
                        "name": "PR Created",
                        "position": {"x": 100, "y": 100},
                        "config": {"event": "pull_request"}
                    },
                    {
                        "id": "action_1",
                        "type": "ai_chat",
                        "name": "Code Analysis",
                        "position": {"x": 300, "y": 100},
                        "config": {"agent": "Dev", "task": "analyze_code"}
                    }
                ]
            }
        },
        {
            "id": "customer_onboarding",
            "name": "Customer Onboarding",
            "description": "Automate new customer onboarding process",
            "category": "Business Process",
            "difficulty": "Beginner",
            "estimated_time": "10 minutes",
            "nodes_count": 4,
            "triggers": ["User signup"],
            "actions": ["Send welcome", "Setup account", "Schedule follow-up"],
            "preview_image": "/workflow-templates/customer-onboarding.png",
            "tags": ["onboarding", "customer", "automation", "email"],
            "workflow_data": {
                "nodes": [
                    {
                        "id": "trigger_1",
                        "type": "webhook",
                        "name": "User Registered",
                        "position": {"x": 100, "y": 100},
                        "config": {"event": "user_signup"}
                    },
                    {
                        "id": "action_1",
                        "type": "send_email",
                        "name": "Welcome Email",
                        "position": {"x": 300, "y": 100},
                        "config": {"template": "welcome_new_user"}
                    }
                ]
            }
        }
    ]
    
    return {
        "templates": templates,
        "categories": ["DevOps", "Quality Assurance", "Business Process", "Data Processing", "Notifications"],
        "difficulty_levels": ["Beginner", "Intermediate", "Advanced"],
        "most_popular": ["auto_deployment", "ai_code_review", "customer_onboarding"]
    }

@router.get("/node-types")
async def get_workflow_node_types():
    """Get available workflow node types and their specifications"""
    return {
        "node_types": node_types,
        "categories": list(node_types.keys()),
        "total_nodes": sum(len(category) for category in node_types.values()),
        "node_search_index": {
            # Create searchable index
            node["name"].lower(): {
                "type": node["type"],
                "category": category,
                "description": node["description"]
            }
            for category, nodes in node_types.items()
            for node in nodes
        }
    }

@router.post("/create")
async def create_workflow(name: str, description: str = ""):
    """Create a new workflow"""
    try:
        workflow = Workflow(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
            version="1.0.0",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            created_by="current_user",  # Replace with actual user ID
            status="draft",
            nodes=[],
            connections=[],
            triggers=[],
            variables={},
            settings={
                "auto_save": True,
                "error_handling": "continue",
                "timeout": 300  # seconds
            }
        )
        
        sample_workflows.append(workflow.dict())
        
        return {
            "message": "Workflow created successfully",
            "workflow_id": workflow.id,
            "workflow": workflow
        }
    except Exception as e:
        logger.error(f"Error creating workflow: {e}")
        raise HTTPException(status_code=500, detail="Error creating workflow")

@router.get("/list")
async def list_workflows():
    """List all workflows for the current user"""
    return {
        "workflows": sample_workflows,
        "total_count": len(sample_workflows),
        "status_summary": {
            "draft": len([w for w in sample_workflows if w["status"] == "draft"]),
            "active": len([w for w in sample_workflows if w["status"] == "active"]), 
            "paused": len([w for w in sample_workflows if w["status"] == "paused"]),
            "archived": len([w for w in sample_workflows if w["status"] == "archived"])
        }
    }

@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get specific workflow by ID"""
    try:
        workflow = next((w for w in sample_workflows if w["id"] == workflow_id), None)
        if not workflow:
            # Return a sample workflow for demonstration
            workflow = {
                "id": workflow_id,
                "name": "Sample AI Development Workflow",
                "description": "Automated workflow for AI-powered development",
                "version": "1.0.0",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now(),
                "created_by": "demo_user",
                "status": "active",
                "nodes": [
                    {
                        "id": "node_1",
                        "type": "webhook",
                        "name": "Project Request",
                        "config": {"method": "POST"},
                        "position": {"x": 100, "y": 100},
                        "inputs": [],
                        "outputs": ["request_data"]
                    },
                    {
                        "id": "node_2",
                        "type": "ai_chat",
                        "name": "AI Analysis",
                        "config": {"agent": "Atlas", "temperature": 0.7},
                        "position": {"x": 350, "y": 100},
                        "inputs": ["requirements"],
                        "outputs": ["analysis", "recommendations"]
                    },
                    {
                        "id": "node_3",
                        "type": "code_generation",
                        "name": "Generate Code",
                        "config": {"language": "JavaScript", "framework": "React"},
                        "position": {"x": 600, "y": 100},
                        "inputs": ["specifications"],
                        "outputs": ["generated_code"]
                    }
                ],
                "connections": [
                    {
                        "id": "conn_1",
                        "source_node": "node_1",
                        "source_output": "request_data",
                        "target_node": "node_2", 
                        "target_input": "requirements"
                    },
                    {
                        "id": "conn_2",
                        "source_node": "node_2",
                        "source_output": "analysis",
                        "target_node": "node_3",
                        "target_input": "specifications"
                    }
                ],
                "triggers": ["webhook"],
                "variables": {"project_type": "web_app", "framework": "react"},
                "settings": {"auto_save": True, "error_handling": "retry", "timeout": 600}
            }
        
        return workflow
    except Exception as e:
        logger.error(f"Error getting workflow: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving workflow")

@router.put("/{workflow_id}")
async def update_workflow(workflow_id: str, workflow_data: Dict[str, Any]):
    """Update workflow configuration"""
    try:
        workflow_index = next((i for i, w in enumerate(sample_workflows) if w["id"] == workflow_id), None)
        
        if workflow_index is not None:
            sample_workflows[workflow_index].update(workflow_data)
            sample_workflows[workflow_index]["updated_at"] = datetime.now()
        else:
            # Create new workflow if not found
            workflow_data.update({
                "id": workflow_id,
                "updated_at": datetime.now(),
                "created_at": datetime.now()
            })
            sample_workflows.append(workflow_data)
        
        return {
            "message": "Workflow updated successfully",
            "workflow_id": workflow_id
        }
    except Exception as e:
        logger.error(f"Error updating workflow: {e}")
        raise HTTPException(status_code=500, detail="Error updating workflow")

@router.post("/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, trigger_data: Dict[str, Any] = {}):
    """Execute a workflow"""
    try:
        execution = WorkflowExecution(
            id=str(uuid.uuid4()),
            workflow_id=workflow_id,
            status="running",
            started_at=datetime.now(),
            trigger_data=trigger_data,
            execution_log=[
                {
                    "timestamp": datetime.now(),
                    "level": "info",
                    "message": "Workflow execution started",
                    "node_id": None
                }
            ],
            output_data={}
        )
        
        # Simulate execution steps
        execution.execution_log.extend([
            {
                "timestamp": datetime.now() + timedelta(seconds=1),
                "level": "info", 
                "message": "Processing trigger data",
                "node_id": "node_1"
            },
            {
                "timestamp": datetime.now() + timedelta(seconds=3),
                "level": "info",
                "message": "AI agent processing request",
                "node_id": "node_2"
            },
            {
                "timestamp": datetime.now() + timedelta(seconds=8),
                "level": "success",
                "message": "Code generation completed",
                "node_id": "node_3"
            }
        ])
        
        # Mark as completed
        execution.status = "completed"
        execution.completed_at = datetime.now() + timedelta(seconds=10)
        execution.output_data = {
            "generated_code": "// Sample generated React component\nconst App = () => <div>Hello World</div>",
            "analysis_results": "Project appears to be a simple React application",
            "recommendations": ["Use TypeScript for better type safety", "Add error boundaries", "Implement responsive design"]
        }
        
        workflow_executions.append(execution.dict())
        
        return {
            "message": "Workflow execution started",
            "execution": execution
        }
    except Exception as e:
        logger.error(f"Error executing workflow: {e}")
        raise HTTPException(status_code=500, detail="Error executing workflow")

@router.get("/{workflow_id}/executions")
async def get_workflow_executions(workflow_id: str):
    """Get workflow execution history"""
    executions = [e for e in workflow_executions if e["workflow_id"] == workflow_id]
    
    return {
        "executions": executions,
        "total_executions": len(executions),
        "success_rate": len([e for e in executions if e["status"] == "completed"]) / len(executions) * 100 if executions else 0,
        "average_duration": "8.5 seconds",  # Simulated
        "last_execution": executions[-1] if executions else None
    }

@router.post("/natural-language")
async def create_workflow_from_text(description: str):
    """Create workflow from natural language description"""
    try:
        # Simulate NLP processing
        workflow_id = str(uuid.uuid4())
        
        # Parse the description and suggest workflow structure
        suggested_workflow = {
            "id": workflow_id,
            "name": f"Auto-generated from: {description[:50]}...",
            "description": description,
            "confidence": 0.85,
            "suggested_nodes": [
                {
                    "type": "webhook" if "webhook" in description.lower() else "schedule",
                    "reason": "Detected trigger requirement in description"
                },
                {
                    "type": "ai_chat", 
                    "reason": "AI processing appears to be needed"
                },
                {
                    "type": "send_email" if "email" in description.lower() else "slack",
                    "reason": "Notification requirement detected"
                }
            ],
            "estimated_complexity": "Medium",
            "estimated_setup_time": "15 minutes",
            "next_steps": [
                "Review suggested node structure",
                "Customize node configurations",
                "Test workflow with sample data",
                "Deploy to production"
            ]
        }
        
        return {
            "message": "Workflow structure suggested from natural language",
            "workflow": suggested_workflow,
            "alternatives": [
                "Consider adding error handling nodes",
                "Add conditional logic for different scenarios",
                "Include data transformation steps"
            ]
        }
    except Exception as e:
        logger.error(f"Error creating workflow from text: {e}")
        raise HTTPException(status_code=500, detail="Error processing natural language description")

@router.get("/analytics/usage")
async def get_workflow_analytics():
    """Get workflow usage analytics"""
    return {
        "overview": {
            "total_workflows": len(sample_workflows),
            "active_workflows": len([w for w in sample_workflows if w.get("status") == "active"]),
            "total_executions": len(workflow_executions),
            "success_rate": 94.2,
            "average_execution_time": "12.4 seconds"
        },
        "popular_node_types": [
            {"type": "ai_chat", "usage": 78.5, "category": "AI"},
            {"type": "webhook", "usage": 65.2, "category": "Triggers"},
            {"type": "send_email", "usage": 52.1, "category": "Notifications"},
            {"type": "code_generation", "usage": 48.7, "category": "AI"},
            {"type": "deploy_app", "usage": 34.2, "category": "DevOps"}
        ],
        "workflow_categories": {
            "DevOps": 45.2,
            "AI/ML": 32.8,
            "Business Process": 28.4,
            "Notifications": 25.7,
            "Data Processing": 18.9
        },
        "execution_trends": [
            {"date": "2025-01-01", "executions": 145},
            {"date": "2025-01-02", "executions": 167},
            {"date": "2025-01-03", "executions": 189},
            {"date": "2025-01-04", "executions": 203},
            {"date": "2025-01-05", "executions": 234}
        ],
        "error_analysis": {
            "timeout_errors": 3.2,
            "configuration_errors": 1.8,
            "api_errors": 0.9,
            "other_errors": 0.3
        }
    }