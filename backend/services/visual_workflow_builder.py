# ISSUE #5: LOW-CODE/NO-CODE WORKFLOW BUILDER
# Visual workflow system with natural language conversion

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
from motor.motor_asyncio import AsyncIOMotorDatabase


class WorkflowNodeType(Enum):
    """Types of workflow nodes"""
    START = "start"
    END = "end" 
    ACTION = "action"
    CONDITION = "condition"
    LOOP = "loop"
    API_CALL = "api_call"
    DATABASE = "database"
    NOTIFICATION = "notification"
    TRANSFORMATION = "transformation"
    DELAY = "delay"
    APPROVAL = "approval"


class WorkflowStatus(Enum):
    """Workflow execution status"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class VisualWorkflowBuilder:
    """
    Visual workflow builder addressing competitive gap:
    Code-first approach vs drag-and-drop, wizards, natural language builders
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.workflows_collection = db.visual_workflows
        self.templates_collection = db.workflow_templates
        self.executions_collection = db.workflow_executions
        self.nl_parser = NaturalLanguageWorkflowParser()
        self.workflow_engine = WorkflowExecutionEngine(db)
        
    async def initialize(self):
        """Initialize workflow builder system"""
        await self._setup_workflow_storage()
        await self._setup_workflow_templates()
        await self._setup_execution_engine()
        await self._setup_nl_parser()
        
    # WORKFLOW STORAGE & MANAGEMENT
    async def _setup_workflow_storage(self):
        """Setup workflow storage with indexing"""
        await self.workflows_collection.create_index([
            ("owner_id", 1),
            ("status", 1),
            ("created_at", -1)
        ])
        
        await self.executions_collection.create_index([
            ("workflow_id", 1),
            ("status", 1),
            ("started_at", -1)
        ])
        
    async def create_workflow(self, workflow_data: Dict[str, Any], owner_id: str) -> str:
        """Create new visual workflow"""
        workflow_id = str(uuid.uuid4())
        
        workflow_record = {
            "workflow_id": workflow_id,
            "name": workflow_data["name"],
            "description": workflow_data.get("description", ""),
            "owner_id": owner_id,
            "status": WorkflowStatus.DRAFT.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "version": "1.0.0",
            
            # Visual workflow definition
            "nodes": workflow_data.get("nodes", []),
            "connections": workflow_data.get("connections", []),
            "canvas_settings": workflow_data.get("canvas_settings", {}),
            
            # Execution settings
            "trigger_settings": workflow_data.get("trigger_settings", {}),
            "error_handling": workflow_data.get("error_handling", {"retry_attempts": 3, "timeout": 300}),
            "notifications": workflow_data.get("notifications", []),
            
            # Metadata
            "tags": workflow_data.get("tags", []),
            "category": workflow_data.get("category", "general"),
            "is_template": workflow_data.get("is_template", False),
            "public": workflow_data.get("public", False),
            
            # Analytics
            "execution_count": 0,
            "success_rate": 0.0,
            "average_execution_time": 0.0
        }
        
        await self.workflows_collection.insert_one(workflow_record)
        return workflow_id
        
    async def update_workflow_visual(self, workflow_id: str, nodes: List[Dict[str, Any]], 
                                   connections: List[Dict[str, Any]], owner_id: str) -> bool:
        """Update workflow visual design"""
        # Validate workflow structure
        validation_result = await self._validate_workflow_structure(nodes, connections)
        if not validation_result["valid"]:
            raise ValueError(f"Invalid workflow structure: {validation_result['errors']}")
            
        # Update workflow
        await self.workflows_collection.update_one(
            {"workflow_id": workflow_id, "owner_id": owner_id},
            {
                "$set": {
                    "nodes": nodes,
                    "connections": connections,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return True
        
    async def _validate_workflow_structure(self, nodes: List[Dict[str, Any]], 
                                         connections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate workflow has proper structure"""
        errors = []
        
        # Check for start and end nodes
        start_nodes = [n for n in nodes if n.get("type") == WorkflowNodeType.START.value]
        end_nodes = [n for n in nodes if n.get("type") == WorkflowNodeType.END.value]
        
        if len(start_nodes) == 0:
            errors.append("Workflow must have at least one START node")
        if len(start_nodes) > 1:
            errors.append("Workflow can have only one START node")
        if len(end_nodes) == 0:
            errors.append("Workflow must have at least one END node")
            
        # Validate connections
        node_ids = set(n["id"] for n in nodes)
        for connection in connections:
            if connection["source"] not in node_ids:
                errors.append(f"Connection source {connection['source']} not found in nodes")
            if connection["target"] not in node_ids:
                errors.append(f"Connection target {connection['target']} not found in nodes")
                
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
        
    # NATURAL LANGUAGE CONVERSION
    async def _setup_nl_parser(self):
        """Setup natural language workflow parser"""
        await self.nl_parser.initialize()
        
    async def create_workflow_from_description(self, description: str, owner_id: str,
                                             preferences: Dict[str, Any] = None) -> str:
        """Create workflow from natural language description"""
        preferences = preferences or {}
        
        # Parse natural language description
        workflow_spec = await self.nl_parser.parse_description(description, preferences)
        
        # Convert specification to visual workflow
        visual_workflow = await self._convert_spec_to_visual(workflow_spec)
        
        # Create workflow
        workflow_data = {
            "name": workflow_spec.get("name", "NL Generated Workflow"),
            "description": f"Generated from: {description}",
            "nodes": visual_workflow["nodes"],
            "connections": visual_workflow["connections"],
            "tags": ["nl-generated"] + workflow_spec.get("tags", []),
            "category": workflow_spec.get("category", "automation")
        }
        
        workflow_id = await self.create_workflow(workflow_data, owner_id)
        
        # Mark as NL-generated
        await self.workflows_collection.update_one(
            {"workflow_id": workflow_id},
            {"$set": {"nl_generated": True, "original_description": description}}
        )
        
        return workflow_id
        
    async def _convert_spec_to_visual(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Convert workflow specification to visual nodes and connections"""
        nodes = []
        connections = []
        
        # Create start node
        start_node = {
            "id": "start_1",
            "type": WorkflowNodeType.START.value,
            "position": {"x": 100, "y": 100},
            "data": {"label": "Start"}
        }
        nodes.append(start_node)
        
        # Process steps from specification
        previous_node_id = "start_1"
        y_position = 200
        
        for i, step in enumerate(spec.get("steps", [])):
            node_id = f"step_{i+1}"
            
            # Determine node type based on step
            node_type = self._determine_node_type(step)
            
            # Create node
            node = {
                "id": node_id,
                "type": node_type,
                "position": {"x": 100, "y": y_position},
                "data": {
                    "label": step.get("name", f"Step {i+1}"),
                    "description": step.get("description", ""),
                    "configuration": step.get("configuration", {})
                }
            }
            nodes.append(node)
            
            # Create connection from previous node
            connection = {
                "id": f"conn_{previous_node_id}_{node_id}",
                "source": previous_node_id,
                "target": node_id,
                "type": "default"
            }
            connections.append(connection)
            
            previous_node_id = node_id
            y_position += 100
            
        # Create end node
        end_node = {
            "id": "end_1",
            "type": WorkflowNodeType.END.value,
            "position": {"x": 100, "y": y_position},
            "data": {"label": "End"}
        }
        nodes.append(end_node)
        
        # Connect last step to end
        if len(spec.get("steps", [])) > 0:
            final_connection = {
                "id": f"conn_{previous_node_id}_end_1",
                "source": previous_node_id,
                "target": "end_1",
                "type": "default"
            }
            connections.append(final_connection)
        
        return {"nodes": nodes, "connections": connections}
        
    def _determine_node_type(self, step: Dict[str, Any]) -> str:
        """Determine appropriate node type for workflow step"""
        action_type = step.get("action_type", "").lower()
        
        if "api" in action_type or "call" in action_type:
            return WorkflowNodeType.API_CALL.value
        elif "database" in action_type or "db" in action_type:
            return WorkflowNodeType.DATABASE.value
        elif "notification" in action_type or "email" in action_type or "slack" in action_type:
            return WorkflowNodeType.NOTIFICATION.value
        elif "condition" in action_type or "if" in action_type:
            return WorkflowNodeType.CONDITION.value
        elif "loop" in action_type or "repeat" in action_type:
            return WorkflowNodeType.LOOP.value
        elif "transform" in action_type or "process" in action_type:
            return WorkflowNodeType.TRANSFORMATION.value
        elif "delay" in action_type or "wait" in action_type:
            return WorkflowNodeType.DELAY.value
        elif "approval" in action_type or "review" in action_type:
            return WorkflowNodeType.APPROVAL.value
        else:
            return WorkflowNodeType.ACTION.value
            
    # WORKFLOW TEMPLATES
    async def _setup_workflow_templates(self):
        """Setup pre-built workflow templates"""
        default_templates = [
            {
                "name": "Customer Onboarding",
                "description": "Automated customer onboarding workflow with welcome emails and setup tasks",
                "category": "customer_success",
                "tags": ["onboarding", "automation", "email"],
                "nodes": await self._create_onboarding_template_nodes(),
                "use_cases": ["SaaS onboarding", "Service sign-up", "User registration"]
            },
            {
                "name": "Data Processing Pipeline", 
                "description": "ETL workflow for processing and transforming data",
                "category": "data",
                "tags": ["data", "etl", "processing"],
                "nodes": await self._create_data_pipeline_template_nodes(),
                "use_cases": ["Data analysis", "Report generation", "Data migration"]
            },
            {
                "name": "Content Approval Workflow",
                "description": "Multi-stage content review and approval process",
                "category": "content",
                "tags": ["approval", "review", "content"],
                "nodes": await self._create_approval_template_nodes(),
                "use_cases": ["Blog publishing", "Marketing content", "Documentation"]
            }
        ]
        
        for template in default_templates:
            # Check if template already exists
            existing = await self.templates_collection.find_one({"name": template["name"]})
            if not existing:
                template["template_id"] = str(uuid.uuid4())
                template["created_at"] = datetime.now(timezone.utc)
                template["usage_count"] = 0
                await self.templates_collection.insert_one(template)
                
    async def _create_onboarding_template_nodes(self) -> List[Dict[str, Any]]:
        """Create nodes for customer onboarding template"""
        return [
            {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "New Customer"}},
            {"id": "welcome_email", "type": "notification", "position": {"x": 100, "y": 200}, 
             "data": {"label": "Send Welcome Email", "email_template": "welcome"}},
            {"id": "create_account", "type": "database", "position": {"x": 100, "y": 300},
             "data": {"label": "Create User Account", "table": "users"}},
            {"id": "setup_workspace", "type": "action", "position": {"x": 100, "y": 400},
             "data": {"label": "Initialize Workspace"}},
            {"id": "end", "type": "end", "position": {"x": 100, "y": 500}, "data": {"label": "Onboarding Complete"}}
        ]
        
    async def _create_data_pipeline_template_nodes(self) -> List[Dict[str, Any]]:
        """Create nodes for data processing pipeline template"""
        return [
            {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Data Source"}},
            {"id": "extract", "type": "api_call", "position": {"x": 100, "y": 200},
             "data": {"label": "Extract Data", "endpoint": "/api/data/extract"}},
            {"id": "transform", "type": "transformation", "position": {"x": 100, "y": 300},
             "data": {"label": "Transform Data", "script": "transform_script.py"}},
            {"id": "validate", "type": "condition", "position": {"x": 100, "y": 400},
             "data": {"label": "Validate Data Quality"}},
            {"id": "load", "type": "database", "position": {"x": 100, "y": 500},
             "data": {"label": "Load to Database", "table": "processed_data"}},
            {"id": "end", "type": "end", "position": {"x": 100, "y": 600}, "data": {"label": "Processing Complete"}}
        ]
        
    async def _create_approval_template_nodes(self) -> List[Dict[str, Any]]:
        """Create nodes for approval workflow template"""
        return [
            {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Content Submitted"}},
            {"id": "review", "type": "approval", "position": {"x": 100, "y": 200},
             "data": {"label": "Content Review", "reviewers": ["editor", "manager"]}},
            {"id": "approved", "type": "condition", "position": {"x": 100, "y": 300},
             "data": {"label": "Approved?"}},
            {"id": "publish", "type": "action", "position": {"x": 50, "y": 400},
             "data": {"label": "Publish Content"}},
            {"id": "reject", "type": "notification", "position": {"x": 150, "y": 400},
             "data": {"label": "Notify Author", "message": "Content needs revision"}},
            {"id": "end", "type": "end", "position": {"x": 100, "y": 500}, "data": {"label": "Process Complete"}}
        ]
        
    async def get_workflow_templates(self, category: str = None) -> List[Dict[str, Any]]:
        """Get available workflow templates"""
        query = {}
        if category:
            query["category"] = category
            
        cursor = self.templates_collection.find(query).sort([("usage_count", -1)])
        templates = await cursor.to_list(length=None)
        
        return templates
        
    # WORKFLOW EXECUTION
    async def _setup_execution_engine(self):
        """Setup workflow execution engine"""
        await self.workflow_engine.initialize()
        
    async def execute_workflow(self, workflow_id: str, trigger_data: Dict[str, Any] = None,
                             user_id: str = None) -> str:
        """Execute workflow and return execution ID"""
        # Get workflow definition
        workflow = await self.workflows_collection.find_one({"workflow_id": workflow_id})
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
            
        if workflow["status"] != WorkflowStatus.ACTIVE.value:
            raise ValueError(f"Workflow {workflow_id} is not active")
            
        # Start execution
        execution_id = await self.workflow_engine.start_execution(
            workflow_id, workflow["nodes"], workflow["connections"], trigger_data, user_id
        )
        
        # Update workflow execution count
        await self.workflows_collection.update_one(
            {"workflow_id": workflow_id},
            {"$inc": {"execution_count": 1}}
        )
        
        return execution_id
        
    async def get_workflow_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """Get workflow execution status and progress"""
        return await self.workflow_engine.get_execution_status(execution_id)
        
    # ANALYTICS AND OPTIMIZATION
    async def get_workflow_analytics(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow performance analytics"""
        workflow = await self.workflows_collection.find_one({"workflow_id": workflow_id})
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
            
        # Get execution statistics
        execution_stats = await self._calculate_execution_stats(workflow_id)
        
        # Get performance metrics
        performance_metrics = await self._calculate_performance_metrics(workflow_id)
        
        # Get optimization suggestions
        optimization_suggestions = await self._get_optimization_suggestions(workflow_id, execution_stats)
        
        return {
            "workflow_id": workflow_id,
            "total_executions": workflow["execution_count"],
            "success_rate": execution_stats["success_rate"],
            "average_execution_time": execution_stats["average_execution_time"],
            "performance_metrics": performance_metrics,
            "optimization_suggestions": optimization_suggestions,
            "last_execution": execution_stats["last_execution"],
            "error_patterns": execution_stats["error_patterns"]
        }
        
    async def _calculate_execution_stats(self, workflow_id: str) -> Dict[str, Any]:
        """Calculate workflow execution statistics"""
        # Get recent executions
        pipeline = [
            {"$match": {"workflow_id": workflow_id}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "avg_execution_time": {"$avg": "$execution_time_seconds"}
            }}
        ]
        
        stats = await self.executions_collection.aggregate(pipeline).to_list(length=None)
        
        total_executions = sum(stat["count"] for stat in stats)
        successful_executions = next((stat["count"] for stat in stats if stat["_id"] == "completed"), 0)
        
        return {
            "success_rate": successful_executions / total_executions if total_executions > 0 else 0,
            "average_execution_time": next((stat["avg_execution_time"] for stat in stats if stat["_id"] == "completed"), 0),
            "last_execution": await self._get_last_execution_time(workflow_id),
            "error_patterns": await self._analyze_error_patterns(workflow_id)
        }
        
    async def _calculate_performance_metrics(self, workflow_id: str) -> Dict[str, Any]:
        """Calculate detailed performance metrics"""
        return {
            "throughput": await self._calculate_throughput(workflow_id),
            "bottlenecks": await self._identify_bottlenecks(workflow_id),
            "resource_usage": await self._calculate_resource_usage(workflow_id)
        }
        
    async def _get_optimization_suggestions(self, workflow_id: str, stats: Dict[str, Any]) -> List[str]:
        """Generate workflow optimization suggestions"""
        suggestions = []
        
        if stats["success_rate"] < 0.9:
            suggestions.append("Consider adding error handling and retry logic")
            
        if stats["average_execution_time"] > 300:  # 5 minutes
            suggestions.append("Workflow execution time is high - consider parallel processing")
            
        return suggestions


class NaturalLanguageWorkflowParser:
    """Parses natural language descriptions into workflow specifications"""
    
    def __init__(self):
        self.action_keywords = {
            "send": {"type": "notification", "category": "communication"},
            "email": {"type": "notification", "category": "communication"},
            "notify": {"type": "notification", "category": "communication"},
            "call": {"type": "api_call", "category": "integration"},
            "fetch": {"type": "api_call", "category": "integration"},
            "save": {"type": "database", "category": "data"},
            "store": {"type": "database", "category": "data"},
            "update": {"type": "database", "category": "data"},
            "check": {"type": "condition", "category": "logic"},
            "if": {"type": "condition", "category": "logic"},
            "when": {"type": "condition", "category": "logic"},
            "process": {"type": "transformation", "category": "data"},
            "transform": {"type": "transformation", "category": "data"},
            "wait": {"type": "delay", "category": "timing"},
            "delay": {"type": "delay", "category": "timing"},
            "approve": {"type": "approval", "category": "review"},
            "review": {"type": "approval", "category": "review"}
        }
        
    async def initialize(self):
        """Initialize NL parser"""
        pass
        
    async def parse_description(self, description: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Parse natural language description into workflow specification"""
        # This is a simplified implementation - in production would use advanced NLP
        description_lower = description.lower()
        
        # Extract workflow name
        name = await self._extract_workflow_name(description)
        
        # Identify steps and actions
        steps = await self._identify_workflow_steps(description)
        
        # Determine category
        category = await self._determine_category(description, steps)
        
        # Generate tags
        tags = await self._generate_tags(description, steps)
        
        return {
            "name": name,
            "description": description,
            "category": category,
            "tags": tags,
            "steps": steps,
            "estimated_complexity": await self._estimate_complexity(steps),
            "estimated_execution_time": await self._estimate_execution_time(steps)
        }
        
    async def _extract_workflow_name(self, description: str) -> str:
        """Extract workflow name from description"""
        # Simple implementation - would use NLP in production
        if "workflow" in description.lower():
            return "Custom Workflow"
        elif "process" in description.lower():
            return "Custom Process"
        else:
            return "Generated Workflow"
            
    async def _identify_workflow_steps(self, description: str) -> List[Dict[str, Any]]:
        """Identify workflow steps from description"""
        steps = []
        sentences = description.split('. ')
        
        for i, sentence in enumerate(sentences):
            sentence = sentence.strip().lower()
            if not sentence:
                continue
                
            # Find action keywords
            action_type = "action"
            for keyword, config in self.action_keywords.items():
                if keyword in sentence:
                    action_type = config["type"]
                    break
                    
            step = {
                "name": f"Step {i+1}",
                "description": sentence.capitalize(),
                "action_type": action_type,
                "order": i,
                "configuration": {}
            }
            
            steps.append(step)
            
        return steps
        
    async def _determine_category(self, description: str, steps: List[Dict[str, Any]]) -> str:
        """Determine workflow category"""
        description_lower = description.lower()
        
        if any(word in description_lower for word in ["customer", "onboarding", "welcome"]):
            return "customer_success"
        elif any(word in description_lower for word in ["data", "process", "transform"]):
            return "data"
        elif any(word in description_lower for word in ["approval", "review", "content"]):
            return "content"
        elif any(word in description_lower for word in ["notification", "email", "alert"]):
            return "communication"
        else:
            return "automation"
            
    async def _generate_tags(self, description: str, steps: List[Dict[str, Any]]) -> List[str]:
        """Generate tags for workflow"""
        tags = ["nl-generated"]
        
        description_lower = description.lower()
        
        # Add tags based on content
        tag_keywords = {
            "automation": ["automate", "automatic", "trigger"],
            "data": ["data", "database", "process"],
            "email": ["email", "send", "notify"],
            "api": ["api", "call", "fetch"],
            "approval": ["approve", "review", "check"],
            "customer": ["customer", "user", "client"]
        }
        
        for tag, keywords in tag_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                tags.append(tag)
                
        return tags
        
    async def _estimate_complexity(self, steps: List[Dict[str, Any]]) -> str:
        """Estimate workflow complexity"""
        num_steps = len(steps)
        
        if num_steps <= 3:
            return "simple"
        elif num_steps <= 7:
            return "medium"
        else:
            return "complex"
            
    async def _estimate_execution_time(self, steps: List[Dict[str, Any]]) -> int:
        """Estimate execution time in seconds"""
        base_time = 30  # 30 seconds base
        step_time = len(steps) * 15  # 15 seconds per step
        
        # Add time based on step types
        for step in steps:
            if step["action_type"] in ["api_call", "database"]:
                step_time += 10
            elif step["action_type"] == "approval":
                step_time += 300  # 5 minutes for human approval
                
        return base_time + step_time


class WorkflowExecutionEngine:
    """Engine for executing visual workflows"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.executions_collection = db.workflow_executions
        self.execution_logs_collection = db.workflow_execution_logs
        
    async def initialize(self):
        """Initialize execution engine"""
        await self.executions_collection.create_index([
            ("workflow_id", 1),
            ("status", 1),
            ("started_at", -1)
        ])
        
    async def start_execution(self, workflow_id: str, nodes: List[Dict[str, Any]], 
                            connections: List[Dict[str, Any]], trigger_data: Dict[str, Any] = None,
                            user_id: str = None) -> str:
        """Start workflow execution"""
        execution_id = str(uuid.uuid4())
        
        execution_record = {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "user_id": user_id,
            "status": WorkflowStatus.ACTIVE.value,
            "started_at": datetime.now(timezone.utc),
            "completed_at": None,
            "trigger_data": trigger_data or {},
            "current_node": None,
            "execution_data": {},
            "error_message": None,
            "execution_time_seconds": None
        }
        
        await self.executions_collection.insert_one(execution_record)
        
        # Start async execution
        asyncio.create_task(self._execute_workflow_async(execution_id, nodes, connections))
        
        return execution_id
        
    async def _execute_workflow_async(self, execution_id: str, nodes: List[Dict[str, Any]], 
                                    connections: List[Dict[str, Any]]):
        """Execute workflow asynchronously"""
        try:
            start_time = datetime.now(timezone.utc)
            
            # Find start node
            start_node = next((n for n in nodes if n["type"] == "start"), None)
            if not start_node:
                raise ValueError("No start node found")
                
            # Execute workflow
            await self._execute_from_node(execution_id, start_node, nodes, connections)
            
            # Mark as completed
            execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            await self.executions_collection.update_one(
                {"execution_id": execution_id},
                {
                    "$set": {
                        "status": WorkflowStatus.COMPLETED.value,
                        "completed_at": datetime.now(timezone.utc),
                        "execution_time_seconds": execution_time
                    }
                }
            )
            
        except Exception as e:
            # Mark as failed
            await self.executions_collection.update_one(
                {"execution_id": execution_id},
                {
                    "$set": {
                        "status": WorkflowStatus.FAILED.value,
                        "completed_at": datetime.now(timezone.utc),
                        "error_message": str(e)
                    }
                }
            )
            
    async def _execute_from_node(self, execution_id: str, current_node: Dict[str, Any],
                               all_nodes: List[Dict[str, Any]], connections: List[Dict[str, Any]]):
        """Execute workflow from a specific node"""
        # Update current node
        await self.executions_collection.update_one(
            {"execution_id": execution_id},
            {"$set": {"current_node": current_node["id"]}}
        )
        
        # Log node execution
        await self._log_node_execution(execution_id, current_node["id"], "started")
        
        # Execute node logic
        if current_node["type"] == "end":
            return  # End execution
            
        # Simulate node execution (in production, would have actual implementations)
        await asyncio.sleep(1)  # Simulate processing time
        
        # Log completion
        await self._log_node_execution(execution_id, current_node["id"], "completed")
        
        # Find next nodes
        next_connections = [c for c in connections if c["source"] == current_node["id"]]
        
        for connection in next_connections:
            next_node = next((n for n in all_nodes if n["id"] == connection["target"]), None)
            if next_node:
                await self._execute_from_node(execution_id, next_node, all_nodes, connections)
                
    async def _log_node_execution(self, execution_id: str, node_id: str, status: str):
        """Log node execution details"""
        log_record = {
            "execution_id": execution_id,
            "node_id": node_id,
            "status": status,
            "timestamp": datetime.now(timezone.utc),
            "data": {}
        }
        
        await self.execution_logs_collection.insert_one(log_record)
        
    async def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """Get execution status and progress"""
        execution = await self.executions_collection.find_one({"execution_id": execution_id})
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")
            
        # Get execution logs
        logs = await self.execution_logs_collection.find(
            {"execution_id": execution_id}
        ).sort([("timestamp", 1)]).to_list(length=None)
        
        return {
            "execution_id": execution_id,
            "workflow_id": execution["workflow_id"],
            "status": execution["status"],
            "started_at": execution["started_at"],
            "completed_at": execution.get("completed_at"),
            "current_node": execution.get("current_node"),
            "execution_time_seconds": execution.get("execution_time_seconds"),
            "error_message": execution.get("error_message"),
            "logs": logs,
            "progress": await self._calculate_execution_progress(execution_id, logs)
        }
        
    async def _calculate_execution_progress(self, execution_id: str, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate execution progress"""
        completed_nodes = set(log["node_id"] for log in logs if log["status"] == "completed")
        total_nodes = set(log["node_id"] for log in logs)
        
        progress_percentage = len(completed_nodes) / len(total_nodes) * 100 if total_nodes else 0
        
        return {
            "percentage": progress_percentage,
            "completed_nodes": len(completed_nodes),
            "total_nodes": len(total_nodes)
        }


# Global workflow builder instance
visual_workflow_builder = None


async def initialize_workflow_system(db: AsyncIOMotorDatabase):
    """Initialize visual workflow builder"""
    global visual_workflow_builder
    visual_workflow_builder = VisualWorkflowBuilder(db)
    await visual_workflow_builder.initialize()


async def create_visual_workflow(workflow_data: Dict[str, Any], owner_id: str) -> str:
    """Create new visual workflow"""
    return await visual_workflow_builder.create_workflow(workflow_data, owner_id)


async def create_workflow_from_nl(description: str, owner_id: str, preferences: Dict[str, Any] = None) -> str:
    """Create workflow from natural language"""
    return await visual_workflow_builder.create_workflow_from_description(description, owner_id, preferences)


async def get_workflow_templates_list() -> List[Dict[str, Any]]:
    """Get available workflow templates"""
    return await visual_workflow_builder.get_workflow_templates()


async def execute_visual_workflow(workflow_id: str, trigger_data: Dict[str, Any] = None, user_id: str = None) -> str:
    """Execute visual workflow"""
    return await visual_workflow_builder.execute_workflow(workflow_id, trigger_data, user_id)


async def get_workflow_execution_details(execution_id: str) -> Dict[str, Any]:
    """Get workflow execution details"""
    return await visual_workflow_builder.get_workflow_execution_status(execution_id)


async def get_workflow_performance(workflow_id: str) -> Dict[str, Any]:
    """Get workflow performance analytics"""
    return await visual_workflow_builder.get_workflow_analytics(workflow_id)