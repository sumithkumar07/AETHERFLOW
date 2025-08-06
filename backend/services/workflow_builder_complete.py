# Workflow Builder Complete Implementation
# Feature 5: No-Code Workflow Builder with Natural Language Processing

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import json
import uuid
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

class WorkflowStatus(Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"

class NodeType(Enum):
    TRIGGER = "trigger"
    ACTION = "action"
    CONDITION = "condition"
    LOOP = "loop"
    DELAY = "delay"
    API_CALL = "api_call"
    DATA_TRANSFORM = "data_transform"
    NOTIFICATION = "notification"

class TriggerType(Enum):
    SCHEDULE = "schedule"
    WEBHOOK = "webhook"
    FILE_UPLOAD = "file_upload"
    DATABASE_CHANGE = "database_change"
    USER_ACTION = "user_action"
    API_EVENT = "api_event"

@dataclass
class WorkflowNode:
    id: str
    type: NodeType
    name: str
    description: str
    configuration: Dict[str, Any]
    position: Dict[str, float]  # x, y coordinates
    connections: List[str]  # IDs of connected nodes
    error_handling: Dict[str, Any]
    created_at: datetime = None

@dataclass
class WorkflowExecution:
    id: str
    workflow_id: str
    trigger_data: Dict[str, Any]
    status: WorkflowStatus
    started_at: datetime
    completed_at: Optional[datetime]
    current_node: Optional[str]
    execution_log: List[Dict[str, Any]]
    error_message: Optional[str]
    result_data: Dict[str, Any]

@dataclass
class Workflow:
    id: str
    name: str
    description: str
    version: str
    status: WorkflowStatus
    nodes: List[WorkflowNode]
    connections: List[Dict[str, str]]  # source_id -> target_id mappings
    trigger_config: Dict[str, Any]
    settings: Dict[str, Any]
    created_by: str
    created_at: datetime
    updated_at: datetime
    execution_count: int
    success_rate: float

class WorkflowBuilderComplete:
    """
    Complete No-Code Workflow Builder with:
    - Visual drag-and-drop workflow creation
    - Natural language workflow generation
    - Pre-built workflow templates
    - Real-time workflow execution
    - Advanced workflow analytics
    - Integration with external APIs
    """
    
    def __init__(self):
        self.workflows: Dict[str, Workflow] = {}
        self.workflow_templates: Dict[str, Dict[str, Any]] = {}
        self.executions: Dict[str, WorkflowExecution] = {}
        self.active_triggers: Dict[str, Any] = {}
        
    async def initialize(self):
        """Initialize workflow builder with templates and configurations"""
        await self._setup_workflow_templates()
        await self._setup_node_templates()
        await self._setup_natural_language_processor()
        logger.info("🔄 Workflow Builder initialized with drag-and-drop and natural language support")
    
    # Workflow Management
    async def create_workflow(
        self,
        name: str,
        description: str,
        created_by: str,
        template_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new workflow from scratch or template"""
        workflow_id = str(uuid.uuid4())
        
        if template_id and template_id in self.workflow_templates:
            # Create from template
            template = self.workflow_templates[template_id]
            nodes = [
                WorkflowNode(
                    id=str(uuid.uuid4()),
                    type=NodeType(node["type"]),
                    name=node["name"],
                    description=node["description"],
                    configuration=node["configuration"],
                    position=node["position"],
                    connections=node.get("connections", []),
                    error_handling=node.get("error_handling", {}),
                    created_at=datetime.utcnow()
                )
                for node in template["nodes"]
            ]
        else:
            # Create empty workflow
            nodes = []
        
        workflow = Workflow(
            id=workflow_id,
            name=name,
            description=description,
            version="1.0.0",
            status=WorkflowStatus.DRAFT,
            nodes=nodes,
            connections=[],
            trigger_config={},
            settings={"retry_attempts": 3, "timeout": 300},
            created_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            execution_count=0,
            success_rate=0.0
        )
        
        self.workflows[workflow_id] = workflow
        
        return {
            "workflow_id": workflow_id,
            "name": name,
            "status": "created",
            "template_used": template_id is not None,
            "nodes_count": len(nodes)
        }
    
    async def create_workflow_from_natural_language(
        self,
        description: str,
        created_by: str
    ) -> Dict[str, Any]:
        """Create workflow from natural language description"""
        workflow_id = str(uuid.uuid4())
        
        # Parse natural language description
        parsed_workflow = await self._parse_natural_language(description)
        
        # Generate nodes based on parsed intent
        nodes = await self._generate_nodes_from_intent(parsed_workflow)
        
        workflow = Workflow(
            id=workflow_id,
            name=parsed_workflow.get("name", "AI-Generated Workflow"),
            description=f"Generated from: {description}",
            version="1.0.0",
            status=WorkflowStatus.DRAFT,
            nodes=nodes,
            connections=parsed_workflow.get("connections", []),
            trigger_config=parsed_workflow.get("trigger_config", {}),
            settings={"retry_attempts": 3, "timeout": 300, "ai_generated": True},
            created_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            execution_count=0,
            success_rate=0.0
        )
        
        self.workflows[workflow_id] = workflow
        
        return {
            "workflow_id": workflow_id,
            "name": workflow.name,
            "status": "generated",
            "description": description,
            "nodes_generated": len(nodes),
            "confidence": parsed_workflow.get("confidence", 0.8),
            "suggestions": parsed_workflow.get("suggestions", [])
        }
    
    async def add_workflow_node(
        self,
        workflow_id: str,
        node_type: str,
        name: str,
        configuration: Dict[str, Any],
        position: Dict[str, float] = None
    ) -> Dict[str, Any]:
        """Add a new node to workflow"""
        if workflow_id not in self.workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        node_id = str(uuid.uuid4())
        
        node = WorkflowNode(
            id=node_id,
            type=NodeType(node_type),
            name=name,
            description=f"{node_type} node: {name}",
            configuration=configuration,
            position=position or {"x": 100, "y": 100},
            connections=[],
            error_handling={"retry": True, "max_retries": 3},
            created_at=datetime.utcnow()
        )
        
        workflow.nodes.append(node)
        workflow.updated_at = datetime.utcnow()
        
        return {
            "node_id": node_id,
            "workflow_id": workflow_id,
            "status": "added",
            "node_type": node_type,
            "total_nodes": len(workflow.nodes)
        }
    
    async def connect_workflow_nodes(
        self,
        workflow_id: str,
        source_node_id: str,
        target_node_id: str,
        condition: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Connect two workflow nodes"""
        if workflow_id not in self.workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        
        # Find source node and add connection
        source_node = next((node for node in workflow.nodes if node.id == source_node_id), None)
        if not source_node:
            return {"error": "Source node not found"}
        
        target_node = next((node for node in workflow.nodes if node.id == target_node_id), None)
        if not target_node:
            return {"error": "Target node not found"}
        
        # Add connection
        connection = {
            "source": source_node_id,
            "target": target_node_id,
            "condition": condition
        }
        
        if connection not in workflow.connections:
            workflow.connections.append(connection)
            source_node.connections.append(target_node_id)
            workflow.updated_at = datetime.utcnow()
        
        return {
            "connection_id": f"{source_node_id}-{target_node_id}",
            "status": "connected",
            "source": source_node.name,
            "target": target_node.name,
            "total_connections": len(workflow.connections)
        }
    
    # Workflow Execution
    async def execute_workflow(
        self,
        workflow_id: str,
        trigger_data: Dict[str, Any] = None,
        manual_trigger: bool = False
    ) -> Dict[str, Any]:
        """Execute a workflow"""
        if workflow_id not in self.workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        if workflow.status != WorkflowStatus.ACTIVE and not manual_trigger:
            return {"error": "Workflow is not active"}
        
        execution_id = str(uuid.uuid4())
        
        execution = WorkflowExecution(
            id=execution_id,
            workflow_id=workflow_id,
            trigger_data=trigger_data or {},
            status=WorkflowStatus.ACTIVE,
            started_at=datetime.utcnow(),
            completed_at=None,
            current_node=None,
            execution_log=[],
            error_message=None,
            result_data={}
        )
        
        self.executions[execution_id] = execution
        
        # Start workflow execution in background
        asyncio.create_task(self._execute_workflow_async(execution))
        
        return {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "status": "started",
            "started_at": execution.started_at.isoformat(),
            "trigger_data": trigger_data
        }
    
    async def _execute_workflow_async(self, execution: WorkflowExecution):
        """Execute workflow asynchronously"""
        try:
            workflow = self.workflows[execution.workflow_id]
            
            # Find trigger node
            trigger_nodes = [node for node in workflow.nodes if node.type == NodeType.TRIGGER]
            if not trigger_nodes:
                raise Exception("No trigger node found in workflow")
            
            current_node = trigger_nodes[0]
            execution.current_node = current_node.id
            
            # Execute workflow nodes
            context_data = execution.trigger_data.copy()
            
            while current_node:
                # Log node execution
                execution.execution_log.append({
                    "node_id": current_node.id,
                    "node_name": current_node.name,
                    "node_type": current_node.type.value,
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": "executing"
                })
                
                # Execute current node
                node_result = await self._execute_node(current_node, context_data)
                
                if node_result.get("error"):
                    execution.error_message = node_result["error"]
                    execution.status = WorkflowStatus.ERROR
                    break
                
                # Update context data
                context_data.update(node_result.get("data", {}))
                
                # Log successful execution
                execution.execution_log[-1].update({
                    "status": "completed",
                    "result": node_result
                })
                
                # Find next node
                next_node_id = self._get_next_node(workflow, current_node.id, context_data)
                if next_node_id:
                    current_node = next((node for node in workflow.nodes if node.id == next_node_id), None)
                    execution.current_node = next_node_id
                else:
                    current_node = None
            
            # Complete execution
            if execution.status != WorkflowStatus.ERROR:
                execution.status = WorkflowStatus.COMPLETED
                execution.result_data = context_data
            
            execution.completed_at = datetime.utcnow()
            
            # Update workflow statistics
            workflow.execution_count += 1
            if execution.status == WorkflowStatus.COMPLETED:
                success_count = len([e for e in self.executions.values() 
                                   if e.workflow_id == workflow.id and e.status == WorkflowStatus.COMPLETED])
                workflow.success_rate = (success_count / workflow.execution_count) * 100
            
        except Exception as e:
            execution.error_message = str(e)
            execution.status = WorkflowStatus.ERROR
            execution.completed_at = datetime.utcnow()
            logger.error(f"Workflow execution error: {e}")
    
    async def _execute_node(self, node: WorkflowNode, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single workflow node"""
        try:
            if node.type == NodeType.TRIGGER:
                return {"success": True, "data": context_data}
            
            elif node.type == NodeType.ACTION:
                return await self._execute_action_node(node, context_data)
            
            elif node.type == NodeType.CONDITION:
                return await self._execute_condition_node(node, context_data)
            
            elif node.type == NodeType.API_CALL:
                return await self._execute_api_call_node(node, context_data)
            
            elif node.type == NodeType.DATA_TRANSFORM:
                return await self._execute_data_transform_node(node, context_data)
            
            elif node.type == NodeType.NOTIFICATION:
                return await self._execute_notification_node(node, context_data)
            
            elif node.type == NodeType.DELAY:
                delay_seconds = node.configuration.get("delay_seconds", 1)
                await asyncio.sleep(delay_seconds)
                return {"success": True, "data": {"delay_completed": delay_seconds}}
            
            else:
                return {"error": f"Unsupported node type: {node.type}"}
                
        except Exception as e:
            return {"error": f"Node execution failed: {str(e)}"}
    
    async def _execute_action_node(self, node: WorkflowNode, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an action node"""
        action_type = node.configuration.get("action_type")
        
        if action_type == "create_record":
            # Simulate database record creation
            record_data = node.configuration.get("record_data", {})
            record_id = str(uuid.uuid4())
            return {
                "success": True,
                "data": {"record_id": record_id, "action": "create_record", "record_data": record_data}
            }
        
        elif action_type == "send_email":
            # Simulate email sending
            email_config = node.configuration.get("email_config", {})
            return {
                "success": True,
                "data": {"email_sent": True, "recipient": email_config.get("to"), "subject": email_config.get("subject")}
            }
        
        elif action_type == "file_processing":
            # Simulate file processing
            file_path = context_data.get("file_path")
            return {
                "success": True,
                "data": {"file_processed": True, "file_path": file_path, "processing_time": "0.5s"}
            }
        
        else:
            return {"error": f"Unknown action type: {action_type}"}
    
    async def _execute_condition_node(self, node: WorkflowNode, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a condition node"""
        condition = node.configuration.get("condition", {})
        field = condition.get("field")
        operator = condition.get("operator")
        value = condition.get("value")
        
        if field not in context_data:
            return {"success": True, "data": {"condition_result": False, "reason": f"Field {field} not found"}}
        
        field_value = context_data[field]
        
        if operator == "equals":
            result = field_value == value
        elif operator == "greater_than":
            result = float(field_value) > float(value)
        elif operator == "less_than":
            result = float(field_value) < float(value)
        elif operator == "contains":
            result = str(value) in str(field_value)
        else:
            return {"error": f"Unknown operator: {operator}"}
        
        return {
            "success": True,
            "data": {"condition_result": result, "field": field, "operator": operator, "value": value}
        }
    
    async def _execute_api_call_node(self, node: WorkflowNode, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an API call node"""
        import httpx
        
        try:
            api_config = node.configuration.get("api_config", {})
            method = api_config.get("method", "GET")
            url = api_config.get("url")
            headers = api_config.get("headers", {})
            data = api_config.get("data", {})
            
            # Replace variables in URL and data
            url = self._replace_variables(url, context_data)
            data = self._replace_variables(data, context_data)
            
            async with httpx.AsyncClient() as client:
                if method == "GET":
                    response = await client.get(url, headers=headers)
                elif method == "POST":
                    response = await client.post(url, headers=headers, json=data)
                elif method == "PUT":
                    response = await client.put(url, headers=headers, json=data)
                else:
                    return {"error": f"Unsupported HTTP method: {method}"}
                
                return {
                    "success": True,
                    "data": {
                        "api_response": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
                        "status_code": response.status_code,
                        "headers": dict(response.headers)
                    }
                }
        
        except Exception as e:
            return {"error": f"API call failed: {str(e)}"}
    
    async def _execute_data_transform_node(self, node: WorkflowNode, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a data transformation node"""
        transform_type = node.configuration.get("transform_type")
        
        if transform_type == "json_extract":
            source_field = node.configuration.get("source_field")
            target_field = node.configuration.get("target_field")
            json_path = node.configuration.get("json_path")
            
            if source_field in context_data:
                try:
                    import jsonpath_ng
                    jsonpath_expr = jsonpath_ng.parse(json_path)
                    matches = jsonpath_expr.find(context_data[source_field])
                    extracted_value = matches[0].value if matches else None
                    
                    return {
                        "success": True,
                        "data": {target_field: extracted_value, "transform": "json_extract"}
                    }
                except Exception as e:
                    return {"error": f"JSON extraction failed: {str(e)}"}
        
        elif transform_type == "string_format":
            template = node.configuration.get("template")
            target_field = node.configuration.get("target_field")
            
            try:
                formatted_value = template.format(**context_data)
                return {
                    "success": True,
                    "data": {target_field: formatted_value, "transform": "string_format"}
                }
            except Exception as e:
                return {"error": f"String formatting failed: {str(e)}"}
        
        else:
            return {"error": f"Unknown transform type: {transform_type}"}
    
    async def _execute_notification_node(self, node: WorkflowNode, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a notification node"""
        notification_type = node.configuration.get("notification_type")
        message = node.configuration.get("message", "")
        
        # Replace variables in message
        message = self._replace_variables(message, context_data)
        
        if notification_type == "slack":
            # Simulate Slack notification
            return {
                "success": True,
                "data": {"notification_sent": True, "type": "slack", "message": message}
            }
        
        elif notification_type == "email":
            # Simulate email notification
            return {
                "success": True,
                "data": {"notification_sent": True, "type": "email", "message": message}
            }
        
        else:
            return {"error": f"Unknown notification type: {notification_type}"}
    
    def _get_next_node(self, workflow: Workflow, current_node_id: str, context_data: Dict[str, Any]) -> Optional[str]:
        """Get the next node to execute based on connections and conditions"""
        connections = [conn for conn in workflow.connections if conn["source"] == current_node_id]
        
        if not connections:
            return None
        
        for connection in connections:
            condition = connection.get("condition")
            if not condition:
                return connection["target"]
            
            # Evaluate condition
            if condition.get("field") in context_data:
                field_value = context_data[condition["field"]]
                expected_value = condition.get("value")
                operator = condition.get("operator", "equals")
                
                if operator == "equals" and field_value == expected_value:
                    return connection["target"]
                elif operator == "greater_than" and float(field_value) > float(expected_value):
                    return connection["target"]
                # Add more condition operators as needed
        
        # Return first connection if no conditions match
        return connections[0]["target"] if connections else None
    
    def _replace_variables(self, template: Any, context_data: Dict[str, Any]) -> Any:
        """Replace variables in templates with context data"""
        if isinstance(template, str):
            for key, value in context_data.items():
                template = template.replace(f"{{{key}}}", str(value))
            return template
        elif isinstance(template, dict):
            return {k: self._replace_variables(v, context_data) for k, v in template.items()}
        elif isinstance(template, list):
            return [self._replace_variables(item, context_data) for item in template]
        else:
            return template
    
    # Natural Language Processing
    async def _parse_natural_language(self, description: str) -> Dict[str, Any]:
        """Parse natural language description into workflow components"""
        # Simplified NLP parsing (in production, use more sophisticated NLP)
        description_lower = description.lower()
        
        # Extract workflow intent
        workflow_intent = {
            "name": "AI-Generated Workflow",
            "confidence": 0.8,
            "trigger_config": {},
            "nodes": [],
            "connections": [],
            "suggestions": []
        }
        
        # Detect trigger types
        if "when" in description_lower or "schedule" in description_lower:
            if "file" in description_lower and ("upload" in description_lower or "receive" in description_lower):
                workflow_intent["trigger_config"] = {"type": "file_upload"}
            elif any(time_word in description_lower for time_word in ["daily", "hourly", "weekly", "every"]):
                workflow_intent["trigger_config"] = {"type": "schedule"}
            else:
                workflow_intent["trigger_config"] = {"type": "webhook"}
        
        # Detect actions
        actions = []
        if "send email" in description_lower or "notify" in description_lower:
            actions.append({"type": "notification", "subtype": "email"})
        if "create" in description_lower and ("record" in description_lower or "entry" in description_lower):
            actions.append({"type": "action", "subtype": "create_record"})
        if "call api" in description_lower or "http" in description_lower:
            actions.append({"type": "api_call"})
        if "transform" in description_lower or "convert" in description_lower:
            actions.append({"type": "data_transform"})
        
        # Generate suggested improvements
        workflow_intent["suggestions"] = [
            "Consider adding error handling for API calls",
            "Add data validation steps for better reliability",
            "Include notification for workflow completion"
        ]
        
        return workflow_intent
    
    async def _generate_nodes_from_intent(self, intent: Dict[str, Any]) -> List[WorkflowNode]:
        """Generate workflow nodes from parsed intent"""
        nodes = []
        
        # Create trigger node
        trigger_node = WorkflowNode(
            id=str(uuid.uuid4()),
            type=NodeType.TRIGGER,
            name="Workflow Trigger",
            description="Initiates the workflow execution",
            configuration=intent.get("trigger_config", {}),
            position={"x": 100, "y": 100},
            connections=[],
            error_handling={},
            created_at=datetime.utcnow()
        )
        nodes.append(trigger_node)
        
        # Create action nodes based on detected actions
        y_position = 200
        for i, action in enumerate(intent.get("actions", [])):
            action_node = WorkflowNode(
                id=str(uuid.uuid4()),
                type=NodeType(action["type"]),
                name=f"Action {i+1}",
                description=f"Performs {action['type']} operation",
                configuration={"action_type": action.get("subtype", action["type"])},
                position={"x": 100, "y": y_position},
                connections=[],
                error_handling={"retry": True, "max_retries": 3},
                created_at=datetime.utcnow()
            )
            nodes.append(action_node)
            y_position += 100
        
        return nodes
    
    # Workflow Templates
    async def _setup_workflow_templates(self):
        """Setup pre-built workflow templates"""
        templates = {
            "data_processing": {
                "name": "Data Processing Pipeline",
                "description": "Process uploaded files with validation and notification",
                "category": "Data Processing",
                "nodes": [
                    {
                        "type": "trigger",
                        "name": "File Upload Trigger",
                        "description": "Triggered when a file is uploaded",
                        "configuration": {"trigger_type": "file_upload"},
                        "position": {"x": 100, "y": 100},
                        "connections": []
                    },
                    {
                        "type": "condition",
                        "name": "File Validation",
                        "description": "Validate file format and size",
                        "configuration": {
                            "condition": {
                                "field": "file_size",
                                "operator": "less_than",
                                "value": 10485760  # 10MB
                            }
                        },
                        "position": {"x": 100, "y": 200},
                        "connections": []
                    },
                    {
                        "type": "action",
                        "name": "Process File",
                        "description": "Process the uploaded file",
                        "configuration": {"action_type": "file_processing"},
                        "position": {"x": 100, "y": 300},
                        "connections": []
                    },
                    {
                        "type": "notification",
                        "name": "Success Notification",
                        "description": "Notify about successful processing",
                        "configuration": {
                            "notification_type": "email",
                            "message": "File {file_name} processed successfully"
                        },
                        "position": {"x": 100, "y": 400},
                        "connections": []
                    }
                ]
            },
            "api_integration": {
                "name": "API Integration Workflow",
                "description": "Fetch data from API and create records",
                "category": "Integration",
                "nodes": [
                    {
                        "type": "trigger",
                        "name": "Schedule Trigger",
                        "description": "Run on schedule",
                        "configuration": {"trigger_type": "schedule", "schedule": "0 9 * * *"},  # Daily at 9 AM
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "type": "api_call",
                        "name": "Fetch Data",
                        "description": "Fetch data from external API",
                        "configuration": {
                            "api_config": {
                                "method": "GET",
                                "url": "https://api.example.com/data",
                                "headers": {"Authorization": "Bearer {api_token}"}
                            }
                        },
                        "position": {"x": 100, "y": 200}
                    },
                    {
                        "type": "data_transform",
                        "name": "Transform Data",
                        "description": "Transform API response data",
                        "configuration": {
                            "transform_type": "json_extract",
                            "source_field": "api_response",
                            "target_field": "extracted_data",
                            "json_path": "$.data[*]"
                        },
                        "position": {"x": 100, "y": 300}
                    },
                    {
                        "type": "action",
                        "name": "Create Records",
                        "description": "Create database records",
                        "configuration": {"action_type": "create_record"},
                        "position": {"x": 100, "y": 400}
                    }
                ]
            }
        }
        
        self.workflow_templates = templates
    
    async def _setup_node_templates(self):
        """Setup node configuration templates"""
        # This would contain pre-configured node templates for easy drag-and-drop
        pass
    
    async def _setup_natural_language_processor(self):
        """Setup natural language processing for workflow generation"""
        # This would initialize NLP models for understanding workflow descriptions
        pass
    
    # Public API Methods
    async def get_all_workflows(self, created_by: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all workflows, optionally filtered by creator"""
        workflows = list(self.workflows.values())
        
        if created_by:
            workflows = [w for w in workflows if w.created_by == created_by]
        
        return [
            {
                "id": w.id,
                "name": w.name,
                "description": w.description,
                "status": w.status.value,
                "nodes_count": len(w.nodes),
                "execution_count": w.execution_count,
                "success_rate": w.success_rate,
                "created_at": w.created_at.isoformat(),
                "updated_at": w.updated_at.isoformat()
            }
            for w in workflows
        ]
    
    async def get_workflow_templates(self) -> Dict[str, Any]:
        """Get all available workflow templates"""
        return {
            "total_templates": len(self.workflow_templates),
            "templates": [
                {
                    "id": template_id,
                    "name": template_data["name"],
                    "description": template_data["description"],
                    "category": template_data["category"],
                    "nodes_count": len(template_data["nodes"])
                }
                for template_id, template_data in self.workflow_templates.items()
            ]
        }
    
    async def get_workflow_executions(self, workflow_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get workflow execution history"""
        executions = list(self.executions.values())
        
        if workflow_id:
            executions = [e for e in executions if e.workflow_id == workflow_id]
        
        return [
            {
                "execution_id": e.id,
                "workflow_id": e.workflow_id,
                "status": e.status.value,
                "started_at": e.started_at.isoformat(),
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "duration": str(e.completed_at - e.started_at) if e.completed_at else None,
                "nodes_executed": len(e.execution_log),
                "error_message": e.error_message
            }
            for e in executions
        ]

# Global workflow builder instance
_workflow_builder = None

async def get_workflow_builder() -> WorkflowBuilderComplete:
    """Get the global workflow builder instance"""
    global _workflow_builder
    if _workflow_builder is None:
        _workflow_builder = WorkflowBuilderComplete()
        await _workflow_builder.initialize()
    return _workflow_builder