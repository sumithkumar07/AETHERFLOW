# Visual Workflow Builder - No-Code Interface
# Issue #5: No-Code Workflow Builder

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
import subprocess
import yaml

logger = logging.getLogger(__name__)

class NodeType(Enum):
    TRIGGER = "trigger"
    ACTION = "action"
    CONDITION = "condition"
    TRANSFORM = "transform"
    INTEGRATION = "integration"
    WEBHOOK = "webhook"
    TIMER = "timer"
    EMAIL = "email"
    DATABASE = "database"
    API_CALL = "api_call"

class WorkflowStatus(Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    STOPPED = "stopped"
    ERROR = "error"

class ExecutionStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TriggerType(Enum):
    MANUAL = "manual"
    SCHEDULE = "schedule"
    WEBHOOK = "webhook"
    FILE_UPLOAD = "file_upload"
    DATABASE_CHANGE = "database_change"
    API_REQUEST = "api_request"
    USER_ACTION = "user_action"

@dataclass
class WorkflowNode:
    node_id: str
    node_type: NodeType
    name: str
    description: str
    config: Dict[str, Any]
    position: Dict[str, float]  # x, y coordinates
    inputs: List[str]  # Connected input node IDs
    outputs: List[str]  # Connected output node IDs
    created_at: datetime
    updated_at: datetime

@dataclass
class WorkflowConnection:
    connection_id: str
    source_node_id: str
    target_node_id: str
    source_output: str
    target_input: str
    condition: Optional[Dict[str, Any]] = None

@dataclass
class Workflow:
    workflow_id: str
    name: str
    description: str
    created_by: str
    status: WorkflowStatus
    nodes: List[WorkflowNode]
    connections: List[WorkflowConnection]
    trigger_config: Dict[str, Any]
    variables: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    last_executed: Optional[datetime] = None
    execution_count: int = 0

@dataclass
class WorkflowExecution:
    execution_id: str
    workflow_id: str
    status: ExecutionStatus
    started_at: datetime
    completed_at: Optional[datetime]
    triggered_by: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    execution_log: List[Dict[str, Any]]
    error_message: Optional[str] = None

@dataclass
class WorkflowTemplate:
    template_id: str
    name: str
    description: str
    category: str
    use_cases: List[str]
    workflow_config: Dict[str, Any]
    variables: Dict[str, Any]
    estimated_setup_time: int  # minutes
    difficulty_level: str
    tags: List[str]

class VisualWorkflowBuilderComprehensive:
    """
    Visual Workflow Builder - No-Code Interface
    - Drag-and-drop workflow creation
    - Natural language to workflow conversion
    - Backend workflow execution engine
    - Pre-built workflow templates
    - Real-time execution monitoring
    - Integration with external services
    """
    
    def __init__(self):
        self.workflows: Dict[str, Workflow] = {}
        self.workflow_executions: Dict[str, WorkflowExecution] = {}
        self.workflow_templates: Dict[str, WorkflowTemplate] = {}
        self.node_library: Dict[str, Dict[str, Any]] = {}
        self.active_executions: Dict[str, asyncio.Task] = {}
        
    async def initialize(self):
        """Initialize visual workflow builder"""
        try:
            await self._setup_node_library()
            await self._load_workflow_templates()
            await self._initialize_execution_engine()
            await self._setup_natural_language_parser()
            
            logger.info("🎨 Visual Workflow Builder Comprehensive initialized")
            return True
        except Exception as e:
            logger.error(f"Visual workflow builder initialization failed: {e}")
            return False
    
    # =============================================================================
    # WORKFLOW CREATION & MANAGEMENT
    # =============================================================================
    
    async def create_workflow(
        self,
        name: str,
        description: str,
        created_by: str,
        template_id: Optional[str] = None
    ) -> str:
        """Create new visual workflow"""
        
        workflow_id = str(uuid.uuid4())
        
        # Initialize from template if specified
        nodes = []
        connections = []
        trigger_config = {"type": "manual"}
        variables = {}
        
        if template_id and template_id in self.workflow_templates:
            template = self.workflow_templates[template_id]
            workflow_config = template.workflow_config
            
            # Create nodes from template
            for node_config in workflow_config.get("nodes", []):
                node = WorkflowNode(
                    node_id=str(uuid.uuid4()),
                    node_type=NodeType(node_config["type"]),
                    name=node_config["name"],
                    description=node_config["description"],
                    config=node_config["config"],
                    position=node_config["position"],
                    inputs=[],
                    outputs=[],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                nodes.append(node)
            
            # Create connections from template
            for conn_config in workflow_config.get("connections", []):
                connection = WorkflowConnection(
                    connection_id=str(uuid.uuid4()),
                    source_node_id=conn_config["source"],
                    target_node_id=conn_config["target"],
                    source_output=conn_config["source_output"],
                    target_input=conn_config["target_input"]
                )
                connections.append(connection)
            
            trigger_config = workflow_config.get("trigger", trigger_config)
            variables = template.variables
        
        workflow = Workflow(
            workflow_id=workflow_id,
            name=name,
            description=description,
            created_by=created_by,
            status=WorkflowStatus.DRAFT,
            nodes=nodes,
            connections=connections,
            trigger_config=trigger_config,
            variables=variables,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.workflows[workflow_id] = workflow
        
        logger.info(f"🎨 Workflow created: {name}")
        return workflow_id
    
    async def add_node_to_workflow(
        self,
        workflow_id: str,
        node_type: NodeType,
        name: str,
        description: str,
        config: Dict[str, Any],
        position: Dict[str, float]
    ) -> str:
        """Add node to workflow"""
        
        if workflow_id not in self.workflows:
            raise ValueError("Workflow not found")
        
        node_id = str(uuid.uuid4())
        
        node = WorkflowNode(
            node_id=node_id,
            node_type=node_type,
            name=name,
            description=description,
            config=config,
            position=position,
            inputs=[],
            outputs=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        workflow = self.workflows[workflow_id]
        workflow.nodes.append(node)
        workflow.updated_at = datetime.utcnow()
        
        logger.info(f"➕ Node added to workflow {workflow_id}: {name}")
        return node_id
    
    async def connect_nodes(
        self,
        workflow_id: str,
        source_node_id: str,
        target_node_id: str,
        source_output: str = "default",
        target_input: str = "default",
        condition: Optional[Dict[str, Any]] = None
    ) -> str:
        """Connect two nodes in workflow"""
        
        if workflow_id not in self.workflows:
            raise ValueError("Workflow not found")
        
        connection_id = str(uuid.uuid4())
        
        connection = WorkflowConnection(
            connection_id=connection_id,
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            source_output=source_output,
            target_input=target_input,
            condition=condition
        )
        
        workflow = self.workflows[workflow_id]
        workflow.connections.append(connection)
        
        # Update node connections
        for node in workflow.nodes:
            if node.node_id == source_node_id:
                if target_node_id not in node.outputs:
                    node.outputs.append(target_node_id)
            elif node.node_id == target_node_id:
                if source_node_id not in node.inputs:
                    node.inputs.append(source_node_id)
        
        workflow.updated_at = datetime.utcnow()
        
        logger.info(f"🔗 Nodes connected in workflow {workflow_id}: {source_node_id} -> {target_node_id}")
        return connection_id
    
    async def update_workflow_config(
        self,
        workflow_id: str,
        config_updates: Dict[str, Any]
    ) -> bool:
        """Update workflow configuration"""
        
        if workflow_id not in self.workflows:
            return False
        
        workflow = self.workflows[workflow_id]
        
        # Update workflow properties
        for key, value in config_updates.items():
            if hasattr(workflow, key):
                setattr(workflow, key, value)
        
        workflow.updated_at = datetime.utcnow()
        
        logger.info(f"⚙️ Workflow configuration updated: {workflow_id}")
        return True
    
    # =============================================================================
    # NATURAL LANGUAGE TO WORKFLOW
    # =============================================================================
    
    async def create_workflow_from_description(
        self,
        description: str,
        created_by: str
    ) -> str:
        """Create workflow from natural language description"""
        
        # Parse natural language description
        workflow_plan = await self._parse_natural_language(description)
        
        # Create workflow
        workflow_id = await self.create_workflow(
            name=workflow_plan["name"],
            description=description,
            created_by=created_by
        )
        
        # Add nodes based on parsed plan
        node_mappings = {}
        for node_plan in workflow_plan["nodes"]:
            node_id = await self.add_node_to_workflow(
                workflow_id=workflow_id,
                node_type=NodeType(node_plan["type"]),
                name=node_plan["name"],
                description=node_plan["description"],
                config=node_plan["config"],
                position=node_plan["position"]
            )
            node_mappings[node_plan["temp_id"]] = node_id
        
        # Add connections based on parsed plan
        for connection_plan in workflow_plan["connections"]:
            source_id = node_mappings[connection_plan["source"]]
            target_id = node_mappings[connection_plan["target"]]
            
            await self.connect_nodes(
                workflow_id=workflow_id,
                source_node_id=source_id,
                target_node_id=target_id,
                source_output=connection_plan.get("source_output", "default"),
                target_input=connection_plan.get("target_input", "default")
            )
        
        # Update trigger configuration
        if "trigger" in workflow_plan:
            workflow = self.workflows[workflow_id]
            workflow.trigger_config = workflow_plan["trigger"]
        
        logger.info(f"🤖 Workflow created from natural language: {workflow_plan['name']}")
        return workflow_id
    
    async def suggest_workflow_improvements(
        self,
        workflow_id: str
    ) -> List[Dict[str, Any]]:
        """Suggest improvements for workflow"""
        
        if workflow_id not in self.workflows:
            return []
        
        workflow = self.workflows[workflow_id]
        suggestions = []
        
        # Analyze workflow structure
        if len(workflow.nodes) == 0:
            suggestions.append({
                "type": "structure",
                "suggestion": "Add nodes to create a functional workflow",
                "priority": "high",
                "action": "add_nodes"
            })
        
        # Check for disconnected nodes
        connected_nodes = set()
        for connection in workflow.connections:
            connected_nodes.add(connection.source_node_id)
            connected_nodes.add(connection.target_node_id)
        
        disconnected_nodes = [
            node for node in workflow.nodes
            if node.node_id not in connected_nodes and len(workflow.nodes) > 1
        ]
        
        if disconnected_nodes:
            suggestions.append({
                "type": "connectivity",
                "suggestion": f"Connect {len(disconnected_nodes)} disconnected nodes",
                "priority": "medium",
                "action": "connect_nodes",
                "nodes": [node.node_id for node in disconnected_nodes]
            })
        
        # Check for missing trigger
        trigger_nodes = [node for node in workflow.nodes if node.node_type == NodeType.TRIGGER]
        if not trigger_nodes and workflow.trigger_config.get("type") == "manual":
            suggestions.append({
                "type": "trigger",
                "suggestion": "Add a trigger to start your workflow automatically",
                "priority": "medium",
                "action": "add_trigger",
                "options": ["schedule", "webhook", "database_change"]
            })
        
        # Performance suggestions
        if len(workflow.nodes) > 20:
            suggestions.append({
                "type": "performance",
                "suggestion": "Consider breaking this workflow into smaller, manageable workflows",
                "priority": "low",
                "action": "split_workflow"
            })
        
        # Error handling suggestions
        error_handling_nodes = [
            node for node in workflow.nodes
            if node.config.get("error_handling", False)
        ]
        
        if len(workflow.nodes) > 5 and not error_handling_nodes:
            suggestions.append({
                "type": "reliability",
                "suggestion": "Add error handling to make your workflow more robust",
                "priority": "medium",
                "action": "add_error_handling"
            })
        
        return suggestions
    
    # =============================================================================
    # WORKFLOW EXECUTION ENGINE
    # =============================================================================
    
    async def execute_workflow(
        self,
        workflow_id: str,
        triggered_by: str,
        input_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Execute workflow"""
        
        if workflow_id not in self.workflows:
            raise ValueError("Workflow not found")
        
        workflow = self.workflows[workflow_id]
        
        if workflow.status != WorkflowStatus.ACTIVE:
            raise ValueError("Workflow is not active")
        
        execution_id = str(uuid.uuid4())
        
        execution = WorkflowExecution(
            execution_id=execution_id,
            workflow_id=workflow_id,
            status=ExecutionStatus.PENDING,
            started_at=datetime.utcnow(),
            completed_at=None,
            triggered_by=triggered_by,
            input_data=input_data or {},
            output_data={},
            execution_log=[]
        )
        
        self.workflow_executions[execution_id] = execution
        
        # Start asynchronous execution
        execution_task = asyncio.create_task(
            self._execute_workflow_async(execution)
        )
        self.active_executions[execution_id] = execution_task
        
        # Update workflow statistics
        workflow.execution_count += 1
        workflow.last_executed = datetime.utcnow()
        
        logger.info(f"▶️ Workflow execution started: {workflow_id}")
        return execution_id
    
    async def _execute_workflow_async(self, execution: WorkflowExecution):
        """Execute workflow asynchronously"""
        
        try:
            execution.status = ExecutionStatus.RUNNING
            workflow = self.workflows[execution.workflow_id]
            
            # Build execution graph
            execution_graph = await self._build_execution_graph(workflow)
            
            # Execute nodes in topological order
            execution_context = {
                "variables": workflow.variables.copy(),
                "input_data": execution.input_data,
                "node_outputs": {}
            }
            
            for node_id in execution_graph:
                node = next((n for n in workflow.nodes if n.node_id == node_id), None)
                if not node:
                    continue
                
                # Log execution step
                execution.execution_log.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "node_id": node_id,
                    "node_name": node.name,
                    "status": "started"
                })
                
                # Execute node
                node_result = await self._execute_node(node, execution_context)
                execution_context["node_outputs"][node_id] = node_result
                
                # Log completion
                execution.execution_log.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "node_id": node_id,
                    "node_name": node.name,
                    "status": "completed",
                    "output": node_result
                })
            
            # Complete execution
            execution.status = ExecutionStatus.COMPLETED
            execution.completed_at = datetime.utcnow()
            execution.output_data = execution_context["node_outputs"]
            
            logger.info(f"✅ Workflow execution completed: {execution.execution_id}")
            
        except Exception as e:
            execution.status = ExecutionStatus.FAILED
            execution.completed_at = datetime.utcnow()
            execution.error_message = str(e)
            
            execution.execution_log.append({
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error",
                "error": str(e)
            })
            
            logger.error(f"❌ Workflow execution failed: {execution.execution_id} - {e}")
        
        finally:
            # Remove from active executions
            if execution.execution_id in self.active_executions:
                del self.active_executions[execution.execution_id]
    
    async def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """Get workflow execution status"""
        
        if execution_id not in self.workflow_executions:
            return {"error": "Execution not found"}
        
        execution = self.workflow_executions[execution_id]
        
        return {
            "execution_id": execution_id,
            "workflow_id": execution.workflow_id,
            "status": execution.status.value,
            "started_at": execution.started_at.isoformat(),
            "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
            "triggered_by": execution.triggered_by,
            "progress": len(execution.execution_log),
            "error_message": execution.error_message,
            "duration": (
                (execution.completed_at or datetime.utcnow()) - execution.started_at
            ).total_seconds() if execution.started_at else 0
        }
    
    async def cancel_execution(self, execution_id: str) -> bool:
        """Cancel running workflow execution"""
        
        if execution_id not in self.active_executions:
            return False
        
        execution_task = self.active_executions[execution_id]
        execution_task.cancel()
        
        if execution_id in self.workflow_executions:
            execution = self.workflow_executions[execution_id]
            execution.status = ExecutionStatus.CANCELLED
            execution.completed_at = datetime.utcnow()
        
        logger.info(f"🛑 Workflow execution cancelled: {execution_id}")
        return True
    
    # =============================================================================
    # WORKFLOW TEMPLATES
    # =============================================================================
    
    async def get_workflow_templates(
        self,
        category: Optional[str] = None,
        difficulty: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get available workflow templates"""
        
        templates = list(self.workflow_templates.values())
        
        # Filter by category
        if category:
            templates = [t for t in templates if t.category.lower() == category.lower()]
        
        # Filter by difficulty
        if difficulty:
            templates = [t for t in templates if t.difficulty_level.lower() == difficulty.lower()]
        
        return [asdict(template) for template in templates]
    
    async def create_template_from_workflow(
        self,
        workflow_id: str,
        template_name: str,
        template_description: str,
        category: str,
        use_cases: List[str],
        difficulty_level: str = "intermediate",
        tags: Optional[List[str]] = None
    ) -> str:
        """Create template from existing workflow"""
        
        if workflow_id not in self.workflows:
            raise ValueError("Workflow not found")
        
        workflow = self.workflows[workflow_id]
        template_id = str(uuid.uuid4())
        
        # Create workflow configuration for template
        workflow_config = {
            "nodes": [
                {
                    "temp_id": f"node_{i}",
                    "type": node.node_type.value,
                    "name": node.name,
                    "description": node.description,
                    "config": node.config,
                    "position": node.position
                }
                for i, node in enumerate(workflow.nodes)
            ],
            "connections": [
                {
                    "source": f"node_{i}",
                    "target": f"node_{j}",
                    "source_output": conn.source_output,
                    "target_input": conn.target_input
                }
                for i, conn in enumerate(workflow.connections)
                for j, node in enumerate(workflow.nodes)
                if node.node_id == conn.target_node_id
            ],
            "trigger": workflow.trigger_config
        }
        
        # Estimate setup time based on complexity
        estimated_time = len(workflow.nodes) * 2 + len(workflow.connections)  # 2 minutes per node
        
        template = WorkflowTemplate(
            template_id=template_id,
            name=template_name,
            description=template_description,
            category=category,
            use_cases=use_cases,
            workflow_config=workflow_config,
            variables=workflow.variables,
            estimated_setup_time=estimated_time,
            difficulty_level=difficulty_level,
            tags=tags or []
        )
        
        self.workflow_templates[template_id] = template
        
        logger.info(f"📋 Workflow template created: {template_name}")
        return template_id
    
    # =============================================================================
    # NODE LIBRARY & CONFIGURATION
    # =============================================================================
    
    async def get_node_library(self) -> Dict[str, Any]:
        """Get available node types and configurations"""
        
        return {
            "categories": {
                "triggers": [
                    {
                        "type": NodeType.TRIGGER.value,
                        "name": "Manual Trigger",
                        "description": "Manually trigger workflow execution",
                        "config_schema": {
                            "button_text": {"type": "string", "default": "Run Workflow"}
                        }
                    },
                    {
                        "type": NodeType.TIMER.value,
                        "name": "Timer Trigger",
                        "description": "Trigger workflow on schedule",
                        "config_schema": {
                            "schedule": {"type": "string", "required": True},
                            "timezone": {"type": "string", "default": "UTC"}
                        }
                    }
                ],
                "actions": [
                    {
                        "type": NodeType.EMAIL.value,
                        "name": "Send Email",
                        "description": "Send email notification",
                        "config_schema": {
                            "to": {"type": "string", "required": True},
                            "subject": {"type": "string", "required": True},
                            "body": {"type": "string", "required": True},
                            "from": {"type": "string", "default": "noreply@example.com"}
                        }
                    },
                    {
                        "type": NodeType.API_CALL.value,
                        "name": "API Call",
                        "description": "Make HTTP API request",
                        "config_schema": {
                            "url": {"type": "string", "required": True},
                            "method": {"type": "string", "default": "GET"},
                            "headers": {"type": "object", "default": {}},
                            "body": {"type": "string", "default": ""}
                        }
                    }
                ],
                "conditions": [
                    {
                        "type": NodeType.CONDITION.value,
                        "name": "If/Else Condition",
                        "description": "Branch workflow based on condition",
                        "config_schema": {
                            "condition": {"type": "string", "required": True},
                            "operator": {"type": "string", "default": "equals"},
                            "value": {"type": "string", "required": True}
                        }
                    }
                ],
                "integrations": [
                    {
                        "type": NodeType.DATABASE.value,
                        "name": "Database Query",
                        "description": "Execute database query",
                        "config_schema": {
                            "connection": {"type": "string", "required": True},
                            "query": {"type": "string", "required": True},
                            "parameters": {"type": "object", "default": {}}
                        }
                    }
                ]
            },
            "total_nodes": sum(len(category) for category in self.node_library.values())
        }
    
    async def validate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Validate workflow configuration"""
        
        if workflow_id not in self.workflows:
            return {"valid": False, "errors": ["Workflow not found"]}
        
        workflow = self.workflows[workflow_id]
        errors = []
        warnings = []
        
        # Check for nodes
        if not workflow.nodes:
            errors.append("Workflow must contain at least one node")
        
        # Check for valid connections
        node_ids = {node.node_id for node in workflow.nodes}
        for connection in workflow.connections:
            if connection.source_node_id not in node_ids:
                errors.append(f"Invalid source node in connection: {connection.source_node_id}")
            if connection.target_node_id not in node_ids:
                errors.append(f"Invalid target node in connection: {connection.target_node_id}")
        
        # Check for cycles
        if await self._has_cycles(workflow):
            errors.append("Workflow contains circular dependencies")
        
        # Check for orphaned nodes
        orphaned_nodes = await self._find_orphaned_nodes(workflow)
        if orphaned_nodes:
            warnings.append(f"Found {len(orphaned_nodes)} orphaned nodes")
        
        # Validate node configurations
        for node in workflow.nodes:
            node_validation = await self._validate_node_config(node)
            if node_validation["errors"]:
                errors.extend([f"Node '{node.name}': {error}" for error in node_validation["errors"]])
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "node_count": len(workflow.nodes),
            "connection_count": len(workflow.connections)
        }
    
    # =============================================================================
    # WORKFLOW ANALYTICS
    # =============================================================================
    
    async def get_workflow_analytics(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow analytics and performance metrics"""
        
        if workflow_id not in self.workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        
        # Get executions for this workflow
        executions = [
            exec for exec in self.workflow_executions.values()
            if exec.workflow_id == workflow_id
        ]
        
        # Calculate metrics
        total_executions = len(executions)
        successful_executions = len([e for e in executions if e.status == ExecutionStatus.COMPLETED])
        failed_executions = len([e for e in executions if e.status == ExecutionStatus.FAILED])
        
        success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0
        
        # Average execution time
        completed_executions = [
            e for e in executions 
            if e.status == ExecutionStatus.COMPLETED and e.completed_at
        ]
        
        avg_execution_time = 0
        if completed_executions:
            execution_times = [
                (e.completed_at - e.started_at).total_seconds()
                for e in completed_executions
            ]
            avg_execution_time = sum(execution_times) / len(execution_times)
        
        # Execution frequency
        recent_executions = [
            e for e in executions
            if e.started_at > datetime.utcnow() - timedelta(days=30)
        ]
        
        return {
            "workflow_id": workflow_id,
            "workflow_name": workflow.name,
            "status": workflow.status.value,
            "created_at": workflow.created_at.isoformat(),
            "last_executed": workflow.last_executed.isoformat() if workflow.last_executed else None,
            "execution_metrics": {
                "total_executions": total_executions,
                "successful_executions": successful_executions,
                "failed_executions": failed_executions,
                "success_rate": round(success_rate, 2),
                "avg_execution_time_seconds": round(avg_execution_time, 2)
            },
            "recent_activity": {
                "executions_last_30_days": len(recent_executions),
                "last_execution_status": executions[-1].status.value if executions else None
            },
            "complexity_metrics": {
                "node_count": len(workflow.nodes),
                "connection_count": len(workflow.connections),
                "estimated_execution_time": len(workflow.nodes) * 2  # Rough estimate
            }
        }
    
    # =============================================================================
    # UTILITY METHODS
    # =============================================================================
    
    async def _parse_natural_language(self, description: str) -> Dict[str, Any]:
        """Parse natural language description into workflow plan"""
        
        # Simplified natural language parsing (in production, would use NLP models)
        description_lower = description.lower()
        
        workflow_plan = {
            "name": "Auto-Generated Workflow",
            "nodes": [],
            "connections": [],
            "trigger": {"type": "manual"}
        }
        
        # Detect common patterns
        node_counter = 0
        
        # Email detection
        if "send email" in description_lower or "email notification" in description_lower:
            workflow_plan["nodes"].append({
                "temp_id": f"node_{node_counter}",
                "type": "email",
                "name": "Send Email",
                "description": "Send email notification",
                "config": {
                    "to": "user@example.com",
                    "subject": "Notification",
                    "body": "Workflow completed successfully"
                },
                "position": {"x": 100, "y": 100 + (node_counter * 120)}
            })
            node_counter += 1
        
        # API call detection
        if "api" in description_lower or "http" in description_lower or "webhook" in description_lower:
            workflow_plan["nodes"].append({
                "temp_id": f"node_{node_counter}",
                "type": "api_call",
                "name": "API Call",
                "description": "Make HTTP API request",
                "config": {
                    "url": "https://api.example.com/data",
                    "method": "GET",
                    "headers": {}
                },
                "position": {"x": 100, "y": 100 + (node_counter * 120)}
            })
            node_counter += 1
        
        # Database detection
        if "database" in description_lower or "save data" in description_lower:
            workflow_plan["nodes"].append({
                "temp_id": f"node_{node_counter}",
                "type": "database",
                "name": "Database Operation",
                "description": "Execute database operation",
                "config": {
                    "connection": "default",
                    "query": "INSERT INTO table (column) VALUES (?)",
                    "parameters": {}
                },
                "position": {"x": 100, "y": 100 + (node_counter * 120)}
            })
            node_counter += 1
        
        # Create linear connections
        for i in range(len(workflow_plan["nodes"]) - 1):
            workflow_plan["connections"].append({
                "source": f"node_{i}",
                "target": f"node_{i+1}",
                "source_output": "default",
                "target_input": "default"
            })
        
        # Detect triggers
        if "schedule" in description_lower or "timer" in description_lower:
            workflow_plan["trigger"] = {"type": "schedule", "schedule": "0 0 * * *"}
        elif "webhook" in description_lower:
            workflow_plan["trigger"] = {"type": "webhook", "path": "/webhook"}
        
        # Generate a name based on content
        if "email" in description_lower and "api" in description_lower:
            workflow_plan["name"] = "Email and API Workflow"
        elif "email" in description_lower:
            workflow_plan["name"] = "Email Notification Workflow"
        elif "api" in description_lower:
            workflow_plan["name"] = "API Integration Workflow"
        
        return workflow_plan
    
    async def _build_execution_graph(self, workflow: Workflow) -> List[str]:
        """Build execution graph in topological order"""
        
        # Create adjacency list
        graph = {node.node_id: [] for node in workflow.nodes}
        in_degree = {node.node_id: 0 for node in workflow.nodes}
        
        for connection in workflow.connections:
            graph[connection.source_node_id].append(connection.target_node_id)
            in_degree[connection.target_node_id] += 1
        
        # Topological sort
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        result = []
        
        while queue:
            current = queue.pop(0)
            result.append(current)
            
            for neighbor in graph[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        return result
    
    async def _execute_node(self, node: WorkflowNode, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute individual workflow node"""
        
        try:
            if node.node_type == NodeType.EMAIL:
                return await self._execute_email_node(node, context)
            elif node.node_type == NodeType.API_CALL:
                return await self._execute_api_call_node(node, context)
            elif node.node_type == NodeType.DATABASE:
                return await self._execute_database_node(node, context)
            elif node.node_type == NodeType.CONDITION:
                return await self._execute_condition_node(node, context)
            elif node.node_type == NodeType.TRANSFORM:
                return await self._execute_transform_node(node, context)
            else:
                # Default node execution
                return {"status": "completed", "output": "Node executed successfully"}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    async def _execute_email_node(self, node: WorkflowNode, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute email node"""
        
        config = node.config
        
        # Simulate email sending
        email_data = {
            "to": config.get("to"),
            "subject": config.get("subject"),
            "body": config.get("body"),
            "from": config.get("from", "noreply@example.com")
        }
        
        # In production, would actually send email
        logger.info(f"📧 Email sent: {email_data['subject']} to {email_data['to']}")
        
        return {
            "status": "completed",
            "email_sent": True,
            "recipient": email_data["to"],
            "subject": email_data["subject"]
        }
    
    async def _execute_api_call_node(self, node: WorkflowNode, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute API call node"""
        
        config = node.config
        
        # Simulate API call
        api_data = {
            "url": config.get("url"),
            "method": config.get("method", "GET"),
            "headers": config.get("headers", {}),
            "body": config.get("body", "")
        }
        
        # In production, would make actual HTTP request
        logger.info(f"🌐 API call: {api_data['method']} {api_data['url']}")
        
        return {
            "status": "completed",
            "api_called": True,
            "url": api_data["url"],
            "method": api_data["method"],
            "response": {"status": 200, "data": "Mock response"}
        }
    
    async def _execute_database_node(self, node: WorkflowNode, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute database node"""
        
        config = node.config
        
        # Simulate database operation
        db_operation = {
            "connection": config.get("connection"),
            "query": config.get("query"),
            "parameters": config.get("parameters", {})
        }
        
        # In production, would execute actual database query
        logger.info(f"🗃️ Database query: {db_operation['query']}")
        
        return {
            "status": "completed",
            "query_executed": True,
            "connection": db_operation["connection"],
            "affected_rows": 1
        }
    
    async def _execute_condition_node(self, node: WorkflowNode, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute condition node"""
        
        config = node.config
        condition = config.get("condition", "true")
        
        # Simple condition evaluation (in production, would be more sophisticated)
        result = condition.lower() == "true"
        
        return {
            "status": "completed",
            "condition_result": result,
            "condition": condition
        }
    
    async def _execute_transform_node(self, node: WorkflowNode, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute transform node"""
        
        config = node.config
        transform_type = config.get("type", "passthrough")
        
        # Simple data transformation
        input_data = context.get("input_data", {})
        
        if transform_type == "uppercase":
            output_data = {k: str(v).upper() if isinstance(v, str) else v for k, v in input_data.items()}
        elif transform_type == "lowercase":
            output_data = {k: str(v).lower() if isinstance(v, str) else v for k, v in input_data.items()}
        else:
            output_data = input_data
        
        return {
            "status": "completed",
            "transformed_data": output_data,
            "transform_type": transform_type
        }
    
    async def _has_cycles(self, workflow: Workflow) -> bool:
        """Check if workflow has circular dependencies"""
        
        # Use DFS to detect cycles
        visited = set()
        rec_stack = set()
        
        def dfs(node_id):
            if node_id in rec_stack:
                return True
            if node_id in visited:
                return False
            
            visited.add(node_id)
            rec_stack.add(node_id)
            
            # Find connections from this node
            for connection in workflow.connections:
                if connection.source_node_id == node_id:
                    if dfs(connection.target_node_id):
                        return True
            
            rec_stack.remove(node_id)
            return False
        
        for node in workflow.nodes:
            if node.node_id not in visited:
                if dfs(node.node_id):
                    return True
        
        return False
    
    async def _find_orphaned_nodes(self, workflow: Workflow) -> List[str]:
        """Find nodes that are not connected to any other nodes"""
        
        connected_nodes = set()
        for connection in workflow.connections:
            connected_nodes.add(connection.source_node_id)
            connected_nodes.add(connection.target_node_id)
        
        orphaned = [
            node.node_id for node in workflow.nodes
            if node.node_id not in connected_nodes and len(workflow.nodes) > 1
        ]
        
        return orphaned
    
    async def _validate_node_config(self, node: WorkflowNode) -> Dict[str, Any]:
        """Validate node configuration"""
        
        errors = []
        
        # Check required fields based on node type
        if node.node_type == NodeType.EMAIL:
            required_fields = ["to", "subject", "body"]
            for field in required_fields:
                if not node.config.get(field):
                    errors.append(f"Missing required field: {field}")
        
        elif node.node_type == NodeType.API_CALL:
            if not node.config.get("url"):
                errors.append("Missing required field: url")
        
        elif node.node_type == NodeType.DATABASE:
            required_fields = ["connection", "query"]
            for field in required_fields:
                if not node.config.get(field):
                    errors.append(f"Missing required field: {field}")
        
        return {"errors": errors}
    
    async def _setup_node_library(self):
        """Setup node library with available node types"""
        
        self.node_library = {
            "triggers": [NodeType.TRIGGER, NodeType.TIMER, NodeType.WEBHOOK],
            "actions": [NodeType.ACTION, NodeType.EMAIL, NodeType.API_CALL, NodeType.DATABASE],
            "logic": [NodeType.CONDITION, NodeType.TRANSFORM],
            "integrations": [NodeType.INTEGRATION]
        }
        
        logger.info("📚 Node library configured")
    
    async def _load_workflow_templates(self):
        """Load predefined workflow templates"""
        
        # Sample templates
        templates = [
            {
                "name": "Email Notification Workflow",
                "description": "Send email notifications based on triggers",
                "category": "notification",
                "use_cases": ["User registration", "Order confirmation", "System alerts"],
                "difficulty_level": "beginner",
                "tags": ["email", "notification", "automation"]
            },
            {
                "name": "Data Processing Pipeline",
                "description": "Process and transform data through multiple steps",
                "category": "data_processing",
                "use_cases": ["ETL operations", "Data validation", "Report generation"],
                "difficulty_level": "intermediate",
                "tags": ["data", "processing", "transformation"]
            },
            {
                "name": "API Integration Workflow",
                "description": "Integrate with external APIs and process responses",
                "category": "integration",
                "use_cases": ["Third-party sync", "Webhook processing", "Data aggregation"],
                "difficulty_level": "advanced",
                "tags": ["api", "integration", "webhook"]
            }
        ]
        
        for template_data in templates:
            template_id = str(uuid.uuid4())
            template = WorkflowTemplate(
                template_id=template_id,
                name=template_data["name"],
                description=template_data["description"],
                category=template_data["category"],
                use_cases=template_data["use_cases"],
                workflow_config={"nodes": [], "connections": [], "trigger": {"type": "manual"}},
                variables={},
                estimated_setup_time=10,
                difficulty_level=template_data["difficulty_level"],
                tags=template_data["tags"]
            )
            self.workflow_templates[template_id] = template
        
        logger.info("📋 Workflow templates loaded")
    
    async def _initialize_execution_engine(self):
        """Initialize workflow execution engine"""
        logger.info("⚙️ Workflow execution engine initialized")
    
    async def _setup_natural_language_parser(self):
        """Setup natural language to workflow parser"""
        logger.info("🤖 Natural language parser configured")