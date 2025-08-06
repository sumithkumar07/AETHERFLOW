"""
Visual Workflow Builder System - Priority 2  
Drag-and-drop workflow interface with natural language processing
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
import json
import uuid
import asyncio
from dataclasses import dataclass, asdict
import logging

class WorkflowNodeType(Enum):
    TRIGGER = "trigger"
    ACTION = "action" 
    CONDITION = "condition"
    LOOP = "loop"
    API_CALL = "api_call"
    DATA_TRANSFORM = "data_transform"
    NOTIFICATION = "notification"
    DATABASE = "database"
    AI_PROCESSING = "ai_processing"

class WorkflowStatus(Enum):
    DRAFT = "draft"
    ACTIVE = "active" 
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

class ExecutionStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class WorkflowNode:
    id: str
    type: WorkflowNodeType
    name: str
    description: str
    config: Dict[str, Any]
    position: Dict[str, float]  # x, y coordinates
    inputs: List[str] = None
    outputs: List[str] = None
    
    def __post_init__(self):
        if self.inputs is None:
            self.inputs = []
        if self.outputs is None:
            self.outputs = []

@dataclass  
class WorkflowConnection:
    id: str
    source_node_id: str
    target_node_id: str
    source_output: str
    target_input: str
    condition: Optional[str] = None

@dataclass
class Workflow:
    id: str
    name: str
    description: str
    user_id: str
    nodes: List[WorkflowNode]
    connections: List[WorkflowConnection]
    status: WorkflowStatus
    created_at: datetime
    updated_at: datetime
    version: int = 1
    tags: List[str] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []

class VisualWorkflowBuilderSystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.workflows: Dict[str, Workflow] = {}
        self.workflow_templates = self._initialize_workflow_templates()
        self.execution_history: Dict[str, List[Dict]] = {}
        
    def _initialize_workflow_templates(self) -> Dict[str, Dict]:
        """Initialize pre-built workflow templates"""
        return {
            "user_onboarding": {
                "name": "User Onboarding Workflow",
                "description": "Automated user registration and welcome sequence",
                "template_nodes": [
                    {
                        "type": WorkflowNodeType.TRIGGER.value,
                        "name": "New User Registration", 
                        "config": {"event": "user_registered"}
                    },
                    {
                        "type": WorkflowNodeType.ACTION.value,
                        "name": "Send Welcome Email",
                        "config": {"template": "welcome_email", "delay": 0}
                    },
                    {
                        "type": WorkflowNodeType.DATABASE.value,
                        "name": "Create User Profile", 
                        "config": {"table": "user_profiles", "action": "create"}
                    }
                ]
            },
            "data_processing": {
                "name": "Data Processing Pipeline",
                "description": "ETL workflow for data transformation and analysis",
                "template_nodes": [
                    {
                        "type": WorkflowNodeType.TRIGGER.value,
                        "name": "Data Upload Trigger",
                        "config": {"event": "file_uploaded", "file_types": ["csv", "json"]}
                    },
                    {
                        "type": WorkflowNodeType.DATA_TRANSFORM.value,
                        "name": "Data Validation",
                        "config": {"rules": ["required_fields", "data_types"]}
                    },
                    {
                        "type": WorkflowNodeType.AI_PROCESSING.value,
                        "name": "AI Analysis",
                        "config": {"model": "data_analyzer", "confidence_threshold": 0.8}
                    }
                ]
            },
            "content_generation": {
                "name": "AI Content Generation Workflow", 
                "description": "Automated content creation and publishing",
                "template_nodes": [
                    {
                        "type": WorkflowNodeType.TRIGGER.value,
                        "name": "Content Request",
                        "config": {"trigger_type": "schedule", "cron": "0 9 * * 1"}
                    },
                    {
                        "type": WorkflowNodeType.AI_PROCESSING.value,
                        "name": "Generate Content",
                        "config": {"model": "content_generator", "topic": "tech_trends"}
                    },
                    {
                        "type": WorkflowNodeType.ACTION.value,
                        "name": "Publish Content",
                        "config": {"platforms": ["blog", "social_media"]}
                    }
                ]
            }
        }
    
    async def create_workflow(self, name: str, description: str, user_id: str,
                            template_id: Optional[str] = None) -> Dict:
        """Create a new workflow"""
        workflow_id = str(uuid.uuid4())
        
        if template_id and template_id in self.workflow_templates:
            nodes, connections = await self._create_from_template(template_id)
        else:
            nodes, connections = [], []
            
        workflow = Workflow(
            id=workflow_id,
            name=name,
            description=description, 
            user_id=user_id,
            nodes=nodes,
            connections=connections,
            status=WorkflowStatus.DRAFT,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.workflows[workflow_id] = workflow
        
        self.logger.info(f"Created workflow: {workflow_id} - {name}")
        return {
            "workflow_id": workflow_id,
            "status": "created",
            "name": name,
            "template_used": template_id,
            "nodes_count": len(nodes),
            "created_at": workflow.created_at.isoformat()
        }
    
    async def _create_from_template(self, template_id: str) -> tuple[List[WorkflowNode], List[WorkflowConnection]]:
        """Create workflow nodes and connections from template"""
        template = self.workflow_templates[template_id]
        nodes = []
        connections = []
        
        # Create nodes from template
        for i, node_template in enumerate(template["template_nodes"]):
            node = WorkflowNode(
                id=str(uuid.uuid4()),
                type=WorkflowNodeType(node_template["type"]),
                name=node_template["name"],
                description=node_template.get("description", ""),
                config=node_template["config"],
                position={"x": i * 200, "y": 100}  # Auto-layout
            )
            nodes.append(node)
            
        # Create sequential connections
        for i in range(len(nodes) - 1):
            connection = WorkflowConnection(
                id=str(uuid.uuid4()),
                source_node_id=nodes[i].id,
                target_node_id=nodes[i + 1].id,
                source_output="output",
                target_input="input"
            )
            connections.append(connection)
            
        return nodes, connections
    
    async def add_node(self, workflow_id: str, node_type: WorkflowNodeType,
                      name: str, config: Dict, position: Dict[str, float]) -> Dict:
        """Add a node to existing workflow"""
        if workflow_id not in self.workflows:
            return {"status": "error", "message": "Workflow not found"}
            
        workflow = self.workflows[workflow_id]
        
        node = WorkflowNode(
            id=str(uuid.uuid4()),
            type=node_type,
            name=name,
            description=config.get("description", ""),
            config=config,
            position=position
        )
        
        workflow.nodes.append(node)
        workflow.updated_at = datetime.utcnow()
        workflow.version += 1
        
        return {
            "status": "success",
            "node_id": node.id,
            "workflow_version": workflow.version
        }
    
    async def connect_nodes(self, workflow_id: str, source_node_id: str,
                          target_node_id: str, source_output: str = "output",
                          target_input: str = "input", condition: str = None) -> Dict:
        """Connect two nodes in the workflow"""
        if workflow_id not in self.workflows:
            return {"status": "error", "message": "Workflow not found"}
            
        workflow = self.workflows[workflow_id]
        
        connection = WorkflowConnection(
            id=str(uuid.uuid4()),
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            source_output=source_output,
            target_input=target_input,
            condition=condition
        )
        
        workflow.connections.append(connection)
        workflow.updated_at = datetime.utcnow()
        workflow.version += 1
        
        return {
            "status": "success", 
            "connection_id": connection.id,
            "workflow_version": workflow.version
        }
    
    async def natural_language_to_workflow(self, description: str, user_id: str) -> Dict:
        """Convert natural language description to workflow"""
        # Simplified NL processing - in production would use advanced NLP
        workflow_id = await self._parse_and_create_workflow(description, user_id)
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "message": "Workflow created from natural language description",
            "parsed_elements": await self._extract_workflow_elements(description)
        }
    
    async def _parse_and_create_workflow(self, description: str, user_id: str) -> str:
        """Parse natural language and create workflow structure"""
        # Simple keyword-based parsing
        workflow_name = "Generated Workflow"
        workflow_id = str(uuid.uuid4())
        
        nodes = []
        connections = []
        
        # Detect triggers
        if any(word in description.lower() for word in ["when", "if", "trigger", "on"]):
            trigger_node = WorkflowNode(
                id=str(uuid.uuid4()),
                type=WorkflowNodeType.TRIGGER,
                name="Detected Trigger",
                description="Trigger detected from description",
                config={"trigger_type": "event"},
                position={"x": 0, "y": 100}
            )
            nodes.append(trigger_node)
        
        # Detect actions  
        if any(word in description.lower() for word in ["send", "create", "update", "delete", "process"]):
            action_node = WorkflowNode(
                id=str(uuid.uuid4()),
                type=WorkflowNodeType.ACTION,
                name="Detected Action",
                description="Action detected from description", 
                config={"action_type": "generic"},
                position={"x": 200, "y": 100}
            )
            nodes.append(action_node)
        
        # Connect nodes sequentially
        for i in range(len(nodes) - 1):
            connection = WorkflowConnection(
                id=str(uuid.uuid4()),
                source_node_id=nodes[i].id,
                target_node_id=nodes[i + 1].id,
                source_output="output",
                target_input="input"
            )
            connections.append(connection)
        
        workflow = Workflow(
            id=workflow_id,
            name=workflow_name,
            description=description,
            user_id=user_id,
            nodes=nodes,
            connections=connections,
            status=WorkflowStatus.DRAFT,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.workflows[workflow_id] = workflow
        return workflow_id
    
    async def _extract_workflow_elements(self, description: str) -> Dict:
        """Extract workflow elements from natural language"""
        elements = {
            "triggers": [],
            "actions": [],
            "conditions": [],
            "entities": []
        }
        
        # Simple keyword extraction
        trigger_words = ["when", "if", "on", "after", "before"]
        action_words = ["send", "create", "update", "delete", "process", "analyze"]
        condition_words = ["if", "unless", "when", "while"]
        
        words = description.lower().split()
        
        for word in words:
            if word in trigger_words:
                elements["triggers"].append(word)
            elif word in action_words:
                elements["actions"].append(word)
            elif word in condition_words:
                elements["conditions"].append(word)
                
        return elements
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict = None) -> Dict:
        """Execute a workflow"""
        if workflow_id not in self.workflows:
            return {"status": "error", "message": "Workflow not found"}
            
        workflow = self.workflows[workflow_id]
        execution_id = str(uuid.uuid4())
        
        execution_context = {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "started_at": datetime.utcnow(),
            "input_data": input_data or {},
            "status": ExecutionStatus.RUNNING,
            "node_results": {},
            "errors": []
        }
        
        try:
            # Find trigger nodes to start execution
            trigger_nodes = [node for node in workflow.nodes if node.type == WorkflowNodeType.TRIGGER]
            
            if not trigger_nodes:
                return {"status": "error", "message": "No trigger nodes found"}
            
            # Execute workflow from trigger nodes
            for trigger_node in trigger_nodes:
                await self._execute_node(trigger_node, workflow, execution_context)
            
            execution_context["status"] = ExecutionStatus.SUCCESS
            execution_context["completed_at"] = datetime.utcnow()
            
        except Exception as e:
            execution_context["status"] = ExecutionStatus.FAILED
            execution_context["errors"].append(str(e))
            execution_context["failed_at"] = datetime.utcnow()
            self.logger.error(f"Workflow execution failed: {workflow_id} - {str(e)}")
        
        # Store execution history
        if workflow_id not in self.execution_history:
            self.execution_history[workflow_id] = []
        self.execution_history[workflow_id].append(execution_context)
        
        return {
            "execution_id": execution_id,
            "status": execution_context["status"].value,
            "started_at": execution_context["started_at"].isoformat(),
            "node_results_count": len(execution_context["node_results"]),
            "errors": execution_context["errors"]
        }
    
    async def _execute_node(self, node: WorkflowNode, workflow: Workflow, 
                          execution_context: Dict) -> Any:
        """Execute individual workflow node"""
        self.logger.info(f"Executing node: {node.id} - {node.name}")
        
        try:
            # Simulate node execution based on type
            result = await self._simulate_node_execution(node, execution_context)
            execution_context["node_results"][node.id] = result
            
            # Find and execute connected nodes
            connected_nodes = self._find_connected_nodes(node.id, workflow)
            for connected_node in connected_nodes:
                await self._execute_node(connected_node, workflow, execution_context)
                
            return result
            
        except Exception as e:
            error_msg = f"Node execution failed: {node.id} - {str(e)}"
            execution_context["errors"].append(error_msg)
            self.logger.error(error_msg)
            raise
    
    async def _simulate_node_execution(self, node: WorkflowNode, execution_context: Dict) -> Dict:
        """Simulate node execution - replace with real implementations"""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        if node.type == WorkflowNodeType.TRIGGER:
            return {
                "status": "triggered",
                "timestamp": datetime.utcnow().isoformat(),
                "data": execution_context["input_data"]
            }
        elif node.type == WorkflowNodeType.ACTION:
            return {
                "status": "completed",
                "action": node.config.get("action_type", "generic"),
                "timestamp": datetime.utcnow().isoformat()
            }
        elif node.type == WorkflowNodeType.AI_PROCESSING:
            return {
                "status": "processed",
                "model": node.config.get("model", "default"),
                "confidence": 0.95,
                "result": "AI processing completed"
            }
        else:
            return {
                "status": "completed",
                "node_type": node.type.value,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _find_connected_nodes(self, source_node_id: str, workflow: Workflow) -> List[WorkflowNode]:
        """Find nodes connected to the source node"""
        connected_node_ids = [
            conn.target_node_id for conn in workflow.connections
            if conn.source_node_id == source_node_id
        ]
        
        return [node for node in workflow.nodes if node.id in connected_node_ids]
    
    async def get_workflow(self, workflow_id: str) -> Dict:
        """Get workflow details"""
        if workflow_id not in self.workflows:
            return {"status": "error", "message": "Workflow not found"}
            
        workflow = self.workflows[workflow_id]
        
        return {
            "status": "success",
            "workflow": {
                "id": workflow.id,
                "name": workflow.name,
                "description": workflow.description,
                "user_id": workflow.user_id,
                "status": workflow.status.value,
                "nodes": [asdict(node) for node in workflow.nodes],
                "connections": [asdict(conn) for conn in workflow.connections],
                "version": workflow.version,
                "created_at": workflow.created_at.isoformat(),
                "updated_at": workflow.updated_at.isoformat(),
                "tags": workflow.tags
            }
        }
    
    async def list_workflows(self, user_id: str = None, status: WorkflowStatus = None) -> Dict:
        """List workflows with optional filtering"""
        workflows = list(self.workflows.values())
        
        if user_id:
            workflows = [w for w in workflows if w.user_id == user_id]
            
        if status:
            workflows = [w for w in workflows if w.status == status]
            
        workflow_summaries = []
        for workflow in workflows:
            workflow_summaries.append({
                "id": workflow.id,
                "name": workflow.name,
                "description": workflow.description,
                "status": workflow.status.value,
                "nodes_count": len(workflow.nodes),
                "connections_count": len(workflow.connections),
                "created_at": workflow.created_at.isoformat(),
                "updated_at": workflow.updated_at.isoformat()
            })
        
        return {
            "status": "success",
            "workflows": workflow_summaries,
            "total_count": len(workflow_summaries)
        }
    
    async def get_workflow_templates(self) -> Dict:
        """Get available workflow templates"""
        templates = []
        for template_id, template in self.workflow_templates.items():
            templates.append({
                "id": template_id,
                "name": template["name"],
                "description": template["description"],
                "nodes_count": len(template["template_nodes"])
            })
            
        return {
            "status": "success",
            "templates": templates,
            "total_count": len(templates)
        }
    
    async def get_execution_history(self, workflow_id: str) -> Dict:
        """Get workflow execution history"""
        if workflow_id not in self.execution_history:
            return {
                "status": "success",
                "executions": [],
                "total_count": 0
            }
            
        executions = self.execution_history[workflow_id]
        execution_summaries = []
        
        for execution in executions[-10:]:  # Last 10 executions
            execution_summaries.append({
                "execution_id": execution["execution_id"],
                "status": execution["status"].value,
                "started_at": execution["started_at"].isoformat(),
                "completed_at": execution.get("completed_at", {}).isoformat() if execution.get("completed_at") else None,
                "nodes_executed": len(execution["node_results"]),
                "errors_count": len(execution["errors"])
            })
        
        return {
            "status": "success",
            "executions": execution_summaries,
            "total_count": len(execution_summaries)
        }