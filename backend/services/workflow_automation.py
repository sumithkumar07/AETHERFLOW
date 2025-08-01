import logging
import asyncio
import json
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import uuid

logger = logging.getLogger(__name__)

class TriggerType(Enum):
    PROJECT_CREATED = "project.created"
    PROJECT_DEPLOYED = "project.deployed"
    AI_RESPONSE_GENERATED = "ai.response.generated"
    USER_SIGNED_UP = "user.signed_up"
    INTEGRATION_ADDED = "integration.added"
    CODE_COMMITTED = "code.committed"
    SCHEDULE = "schedule"
    WEBHOOK = "webhook"
    CUSTOM_EVENT = "custom.event"

class ActionType(Enum):
    SEND_WEBHOOK = "send_webhook"
    SEND_EMAIL = "send_email"
    SEND_SLACK_MESSAGE = "send_slack"
    CREATE_PROJECT = "create_project"
    AI_ENHANCE = "ai_enhance"
    RUN_SCRIPT = "run_script"
    UPDATE_DATABASE = "update_database"
    SEND_NOTIFICATION = "send_notification"
    TRIGGER_DEPLOYMENT = "trigger_deployment"

class WorkflowStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"
    ERROR = "error"

@dataclass
class WorkflowTrigger:
    type: TriggerType
    conditions: Dict[str, Any] = field(default_factory=dict)
    schedule: Optional[str] = None  # Cron expression for scheduled triggers
    webhook_url: Optional[str] = None

@dataclass
class WorkflowAction:
    type: ActionType
    config: Dict[str, Any] = field(default_factory=dict)
    retry_count: int = 3
    timeout: int = 30  # seconds
    condition: Optional[str] = None  # Python expression to evaluate

@dataclass
class WorkflowExecution:
    execution_id: str
    workflow_id: str
    trigger_data: Dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str = "running"
    actions_completed: List[str] = field(default_factory=list)
    errors: List[Dict[str, Any]] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Workflow:
    id: str
    name: str
    description: str
    triggers: List[WorkflowTrigger]
    actions: List[WorkflowAction]
    status: WorkflowStatus = WorkflowStatus.ACTIVE
    created_by: str = "system"
    created_at: datetime = field(default_factory=datetime.now)
    last_run: Optional[datetime] = None
    run_count: int = 0
    success_count: int = 0
    error_count: int = 0

class WorkflowEngine:
    """Advanced workflow automation engine"""
    
    def __init__(self, db_client=None):
        self.db_client = db_client
        self.workflows: Dict[str, Workflow] = {}
        self.active_executions: Dict[str, WorkflowExecution] = {}
        self.event_listeners: Dict[TriggerType, List[str]] = {}
        self.action_handlers: Dict[ActionType, Callable] = {}
        self.scheduler_tasks: Dict[str, asyncio.Task] = {}
        self.initialized = False
        
    async def initialize(self):
        """Initialize workflow engine"""
        try:
            # Register built-in action handlers
            self._register_built_in_handlers()
            
            # Load workflows from database
            await self._load_workflows()
            
            # Start scheduler
            asyncio.create_task(self._scheduler_loop())
            
            # Load sample workflows
            await self._create_sample_workflows()
            
            self.initialized = True
            logger.info("Workflow automation engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize workflow engine: {e}")
            raise
    
    def _register_built_in_handlers(self):
        """Register built-in action handlers"""
        self.action_handlers = {
            ActionType.SEND_WEBHOOK: self._handle_send_webhook,
            ActionType.SEND_EMAIL: self._handle_send_email,
            ActionType.SEND_SLACK_MESSAGE: self._handle_send_slack,
            ActionType.AI_ENHANCE: self._handle_ai_enhance,
            ActionType.SEND_NOTIFICATION: self._handle_send_notification,
            ActionType.RUN_SCRIPT: self._handle_run_script,
            ActionType.UPDATE_DATABASE: self._handle_update_database,
            ActionType.TRIGGER_DEPLOYMENT: self._handle_trigger_deployment
        }
    
    async def create_workflow(self, name: str, description: str, triggers: List[Dict[str, Any]], 
                            actions: List[Dict[str, Any]], created_by: str = "user") -> str:
        """Create a new workflow"""
        try:
            workflow_id = str(uuid.uuid4())
            
            # Parse triggers
            parsed_triggers = []
            for trigger_data in triggers:
                trigger = WorkflowTrigger(
                    type=TriggerType(trigger_data["type"]),
                    conditions=trigger_data.get("conditions", {}),
                    schedule=trigger_data.get("schedule"),
                    webhook_url=trigger_data.get("webhook_url")
                )
                parsed_triggers.append(trigger)
            
            # Parse actions
            parsed_actions = []
            for action_data in actions:
                action = WorkflowAction(
                    type=ActionType(action_data["type"]),
                    config=action_data.get("config", {}),
                    retry_count=action_data.get("retry_count", 3),
                    timeout=action_data.get("timeout", 30),
                    condition=action_data.get("condition")
                )
                parsed_actions.append(action)
            
            # Create workflow
            workflow = Workflow(
                id=workflow_id,
                name=name,
                description=description,
                triggers=parsed_triggers,
                actions=parsed_actions,
                created_by=created_by
            )
            
            # Store workflow
            self.workflows[workflow_id] = workflow
            
            # Register event listeners
            for trigger in parsed_triggers:
                if trigger.type not in self.event_listeners:
                    self.event_listeners[trigger.type] = []
                self.event_listeners[trigger.type].append(workflow_id)
                
                # Schedule if needed
                if trigger.type == TriggerType.SCHEDULE and trigger.schedule:
                    await self._schedule_workflow(workflow_id, trigger.schedule)
            
            # Save to database
            await self._save_workflow(workflow)
            
            logger.info(f"Created workflow: {name} ({workflow_id})")
            return workflow_id
            
        except Exception as e:
            logger.error(f"Error creating workflow: {e}")
            raise
    
    async def trigger_event(self, event_type: TriggerType, event_data: Dict[str, Any], 
                          context: Dict[str, Any] = None):
        """Trigger workflows based on event"""
        try:
            if event_type not in self.event_listeners:
                return
            
            workflow_ids = self.event_listeners[event_type]
            
            for workflow_id in workflow_ids:
                workflow = self.workflows.get(workflow_id)
                if not workflow or workflow.status != WorkflowStatus.ACTIVE:
                    continue
                
                # Check if any trigger matches
                for trigger in workflow.triggers:
                    if trigger.type == event_type:
                        # Check conditions
                        if await self._check_trigger_conditions(trigger, event_data, context):
                            await self._execute_workflow(workflow, event_data, context)
                            break
                            
        except Exception as e:
            logger.error(f"Error triggering event {event_type}: {e}")
    
    async def _check_trigger_conditions(self, trigger: WorkflowTrigger, 
                                      event_data: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        """Check if trigger conditions are met"""
        try:
            if not trigger.conditions:
                return True
            
            # Simple condition checking
            for key, expected_value in trigger.conditions.items():
                actual_value = event_data.get(key)
                
                if isinstance(expected_value, dict):
                    # Handle operators like {"gt": 100}, {"contains": "test"}
                    for operator, value in expected_value.items():
                        if operator == "gt" and actual_value <= value:
                            return False
                        elif operator == "lt" and actual_value >= value:
                            return False
                        elif operator == "eq" and actual_value != value:
                            return False
                        elif operator == "contains" and value not in str(actual_value):
                            return False
                else:
                    # Direct comparison
                    if actual_value != expected_value:
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking trigger conditions: {e}")
            return False
    
    async def _execute_workflow(self, workflow: Workflow, trigger_data: Dict[str, Any], 
                              context: Dict[str, Any] = None):
        """Execute a workflow"""
        try:
            execution_id = str(uuid.uuid4())
            
            execution = WorkflowExecution(
                execution_id=execution_id,
                workflow_id=workflow.id,
                trigger_data=trigger_data,
                started_at=datetime.now()
            )
            
            self.active_executions[execution_id] = execution
            
            logger.info(f"Starting workflow execution: {workflow.name} ({execution_id})")
            
            # Update workflow stats
            workflow.last_run = datetime.now()
            workflow.run_count += 1
            
            # Execute actions sequentially
            for i, action in enumerate(workflow.actions):
                try:
                    # Check action condition if specified
                    if action.condition and not await self._evaluate_condition(action.condition, trigger_data, context):
                        logger.info(f"Skipping action {i+1} due to condition: {action.condition}")
                        continue
                    
                    # Execute action
                    result = await self._execute_action(action, trigger_data, context, execution)
                    
                    execution.actions_completed.append(f"action_{i+1}")
                    execution.results[f"action_{i+1}"] = result
                    
                    logger.info(f"Completed action {i+1}/{len(workflow.actions)} in workflow {workflow.name}")
                    
                except Exception as action_error:
                    logger.error(f"Error in action {i+1} of workflow {workflow.name}: {action_error}")
                    
                    error_info = {
                        "action_index": i+1,
                        "action_type": action.type.value,
                        "error": str(action_error),
                        "timestamp": datetime.now().isoformat()
                    }
                    execution.errors.append(error_info)
                    
                    # Decide whether to continue or stop
                    if action.retry_count <= 0:
                        execution.status = "failed"
                        workflow.error_count += 1
                        break
            
            # Complete execution
            execution.completed_at = datetime.now()
            if execution.status == "running":
                execution.status = "completed"
                workflow.success_count += 1
            
            # Remove from active executions
            if execution_id in self.active_executions:
                del self.active_executions[execution_id]
            
            # Save execution result
            await self._save_execution(execution)
            
            logger.info(f"Workflow execution completed: {workflow.name} ({execution_id})")
            
        except Exception as e:
            logger.error(f"Error executing workflow {workflow.name}: {e}")
            workflow.error_count += 1
    
    async def _execute_action(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                            context: Dict[str, Any], execution: WorkflowExecution) -> Any:
        """Execute a single action"""
        try:
            handler = self.action_handlers.get(action.type)
            if not handler:
                raise ValueError(f"No handler for action type: {action.type}")
            
            # Execute with timeout
            result = await asyncio.wait_for(
                handler(action, trigger_data, context, execution),
                timeout=action.timeout
            )
            
            return result
            
        except asyncio.TimeoutError:
            raise Exception(f"Action timed out after {action.timeout} seconds")
        except Exception as e:
            # Implement retry logic
            if action.retry_count > 0:
                action.retry_count -= 1
                await asyncio.sleep(2)  # Wait before retry
                return await self._execute_action(action, trigger_data, context, execution)
            else:
                raise
    
    async def _evaluate_condition(self, condition: str, trigger_data: Dict[str, Any], 
                                context: Dict[str, Any] = None) -> bool:
        """Evaluate action condition"""
        try:
            # Simple condition evaluation
            # In production, use a safe expression evaluator
            safe_globals = {
                "trigger_data": trigger_data,
                "context": context or {},
                "len": len,
                "str": str,
                "int": int,
                "float": float
            }
            
            return eval(condition, {"__builtins__": {}}, safe_globals)
            
        except Exception as e:
            logger.error(f"Error evaluating condition '{condition}': {e}")
            return False
    
    # Action Handlers
    async def _handle_send_webhook(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                                 context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """Send webhook action"""
        try:
            import httpx
            
            url = action.config.get("url")
            method = action.config.get("method", "POST")
            headers = action.config.get("headers", {})
            
            # Prepare payload
            payload = {
                "workflow_id": execution.workflow_id,
                "execution_id": execution.execution_id,
                "trigger_data": trigger_data,
                "timestamp": datetime.now().isoformat()
            }
            
            # Add custom data if specified
            if "data" in action.config:
                payload.update(action.config["data"])
            
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method=method,
                    url=url,
                    json=payload,
                    headers=headers
                )
                
                return {
                    "status_code": response.status_code,
                    "response": response.text,
                    "sent_at": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error sending webhook: {e}")
            raise
    
    async def _handle_send_email(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                               context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """Send email action"""
        try:
            # In production, integrate with email service like SendGrid
            to_email = action.config.get("to")
            subject = action.config.get("subject", "Workflow Notification")
            template = action.config.get("template", "default")
            
            # Simulate email sending
            await asyncio.sleep(0.1)
            
            logger.info(f"Email sent to {to_email}: {subject}")
            
            return {
                "to": to_email,
                "subject": subject,
                "template": template,
                "sent_at": datetime.now().isoformat(),
                "status": "sent"
            }
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise
    
    async def _handle_send_slack(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                               context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """Send Slack message action"""
        try:
            channel = action.config.get("channel", "#general")
            message = action.config.get("message", "Workflow notification")
            webhook_url = action.config.get("webhook_url")
            
            if webhook_url:
                # Send to Slack webhook
                import httpx
                
                payload = {
                    "channel": channel,
                    "text": message,
                    "username": "AI Tempo Workflows"
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(webhook_url, json=payload)
                    
                    return {
                        "channel": channel,
                        "message": message,
                        "status": "sent" if response.status_code == 200 else "failed",
                        "sent_at": datetime.now().isoformat()
                    }
            else:
                # Simulate Slack API call
                await asyncio.sleep(0.1)
                logger.info(f"Slack message sent to {channel}: {message}")
                
                return {
                    "channel": channel,
                    "message": message,
                    "status": "sent",
                    "sent_at": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error sending Slack message: {e}")
            raise
    
    async def _handle_ai_enhance(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                               context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """AI enhancement action"""
        try:
            prompt = action.config.get("prompt", "Enhance this content")
            content = trigger_data.get("content", "")
            
            # In production, call actual AI service
            # For now, simulate AI enhancement
            await asyncio.sleep(1)
            
            enhanced_content = f"[AI Enhanced] {content}"
            
            return {
                "original_content": content,
                "enhanced_content": enhanced_content,
                "prompt_used": prompt,
                "enhanced_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI enhancement: {e}")
            raise
    
    async def _handle_send_notification(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                                      context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """Send notification action"""
        try:
            title = action.config.get("title", "Workflow Notification")
            message = action.config.get("message", "A workflow has been executed")
            recipients = action.config.get("recipients", [])
            
            # Simulate notification sending
            await asyncio.sleep(0.1)
            
            return {
                "title": title,
                "message": message,
                "recipients": recipients,
                "sent_at": datetime.now().isoformat(),
                "status": "sent"
            }
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            raise
    
    async def _handle_run_script(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                               context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """Run script action"""
        try:
            script_type = action.config.get("type", "python")
            script_content = action.config.get("script", "")
            
            # For security, only allow predefined scripts
            if script_type == "python":
                # Simulate script execution
                await asyncio.sleep(0.5)
                result = "Script executed successfully"
            else:
                raise ValueError(f"Unsupported script type: {script_type}")
            
            return {
                "script_type": script_type,
                "result": result,
                "executed_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Error running script: {e}")
            raise
    
    async def _handle_update_database(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                                    context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """Update database action"""
        try:
            collection = action.config.get("collection")
            operation = action.config.get("operation", "update")
            query = action.config.get("query", {})
            data = action.config.get("data", {})
            
            if not self.db_client:
                raise ValueError("Database client not available")
            
            # Simulate database operation
            await asyncio.sleep(0.1)
            
            return {
                "collection": collection,
                "operation": operation,
                "query": query,
                "data": data,
                "updated_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Error updating database: {e}")
            raise
    
    async def _handle_trigger_deployment(self, action: WorkflowAction, trigger_data: Dict[str, Any], 
                                       context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """Trigger deployment action"""
        try:
            project_id = action.config.get("project_id") or trigger_data.get("project_id")
            environment = action.config.get("environment", "production")
            
            # Simulate deployment trigger
            await asyncio.sleep(2)
            
            return {
                "project_id": project_id,
                "environment": environment,
                "deployment_id": str(uuid.uuid4()),
                "triggered_at": datetime.now().isoformat(),
                "status": "triggered"
            }
            
        except Exception as e:
            logger.error(f"Error triggering deployment: {e}")
            raise
    
    async def _scheduler_loop(self):
        """Background scheduler for scheduled workflows"""
        while True:
            try:
                await asyncio.sleep(60)  # Check every minute
                
                current_time = datetime.now()
                
                # Check scheduled workflows
                for workflow_id, workflow in self.workflows.items():
                    if workflow.status != WorkflowStatus.ACTIVE:
                        continue
                    
                    for trigger in workflow.triggers:
                        if trigger.type == TriggerType.SCHEDULE and trigger.schedule:
                            # Simple cron-like scheduling (production would use proper cron parser)
                            if await self._should_run_scheduled_workflow(trigger.schedule, current_time, workflow.last_run):
                                await self._execute_workflow(workflow, {"scheduled": True, "time": current_time.isoformat()})
                
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
    
    async def _should_run_scheduled_workflow(self, schedule: str, current_time: datetime, 
                                           last_run: Optional[datetime]) -> bool:
        """Check if scheduled workflow should run"""
        try:
            # Simple scheduling logic
            if schedule == "daily":
                if not last_run or (current_time - last_run) >= timedelta(days=1):
                    return True
            elif schedule == "hourly":
                if not last_run or (current_time - last_run) >= timedelta(hours=1):
                    return True
            elif schedule.startswith("every_"):
                # Parse "every_N_minutes" or "every_N_hours"
                parts = schedule.split("_")
                if len(parts) == 3:
                    interval = int(parts[1])
                    unit = parts[2]
                    
                    if unit == "minutes":
                        delta = timedelta(minutes=interval)
                    elif unit == "hours":
                        delta = timedelta(hours=interval)
                    else:
                        return False
                    
                    if not last_run or (current_time - last_run) >= delta:
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking schedule {schedule}: {e}")
            return False
    
    async def _create_sample_workflows(self):
        """Create sample workflows for demonstration"""
        try:
            # Sample 1: Project creation notification
            await self.create_workflow(
                name="Project Creation Notification",
                description="Send notifications when a new project is created",
                triggers=[{
                    "type": TriggerType.PROJECT_CREATED.value,
                    "conditions": {}
                }],
                actions=[
                    {
                        "type": ActionType.SEND_EMAIL.value,
                        "config": {
                            "to": "admin@aitempo.com",
                            "subject": "New Project Created",
                            "template": "project_created"
                        }
                    },
                    {
                        "type": ActionType.SEND_SLACK_MESSAGE.value,
                        "config": {
                            "channel": "#projects",
                            "message": "🎉 New project created!"
                        }
                    }
                ],
                created_by="system"
            )
            
            # Sample 2: AI enhancement workflow
            await self.create_workflow(
                name="Auto AI Enhancement",
                description="Automatically enhance content with AI",
                triggers=[{
                    "type": TriggerType.AI_RESPONSE_GENERATED.value,
                    "conditions": {"type": "code"}
                }],
                actions=[
                    {
                        "type": ActionType.AI_ENHANCE.value,
                        "config": {
                            "prompt": "Add comprehensive documentation to this code"
                        },
                        "condition": "len(trigger_data.get('content', '')) > 100"
                    }
                ],
                created_by="system"
            )
            
            # Sample 3: Daily report workflow
            await self.create_workflow(
                name="Daily Analytics Report",
                description="Send daily analytics report",
                triggers=[{
                    "type": TriggerType.SCHEDULE.value,
                    "schedule": "daily"
                }],
                actions=[
                    {
                        "type": ActionType.SEND_EMAIL.value,
                        "config": {
                            "to": "team@aitempo.com",
                            "subject": "Daily Analytics Report",
                            "template": "daily_report"
                        }
                    }
                ],
                created_by="system"
            )
            
            logger.info("Sample workflows created successfully")
            
        except Exception as e:
            logger.error(f"Error creating sample workflows: {e}")
    
    async def get_workflows(self) -> List[Dict[str, Any]]:
        """Get all workflows"""
        workflows = []
        for workflow in self.workflows.values():
            workflows.append({
                "id": workflow.id,
                "name": workflow.name,
                "description": workflow.description,
                "status": workflow.status.value,
                "triggers": [{"type": t.type.value, "conditions": t.conditions} for t in workflow.triggers],
                "actions": [{"type": a.type.value, "config": a.config} for a in workflow.actions],
                "created_by": workflow.created_by,
                "created_at": workflow.created_at.isoformat(),
                "last_run": workflow.last_run.isoformat() if workflow.last_run else None,
                "run_count": workflow.run_count,
                "success_count": workflow.success_count,
                "error_count": workflow.error_count
            })
        return workflows
    
    async def get_workflow_executions(self, workflow_id: str) -> List[Dict[str, Any]]:
        """Get executions for a workflow"""
        # In production, this would query the database
        # For now, return sample data
        return [
            {
                "execution_id": "exec_1",
                "workflow_id": workflow_id,
                "status": "completed",
                "started_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                "completed_at": (datetime.now() - timedelta(hours=2, minutes=-5)).isoformat(),
                "actions_completed": ["action_1", "action_2"],
                "errors": []
            }
        ]
    
    async def pause_workflow(self, workflow_id: str):
        """Pause a workflow"""
        if workflow_id in self.workflows:
            self.workflows[workflow_id].status = WorkflowStatus.PAUSED
            
    async def resume_workflow(self, workflow_id: str):
        """Resume a workflow"""
        if workflow_id in self.workflows:
            self.workflows[workflow_id].status = WorkflowStatus.ACTIVE
    
    async def delete_workflow(self, workflow_id: str):
        """Delete a workflow"""
        if workflow_id in self.workflows:
            del self.workflows[workflow_id]
            
            # Remove from event listeners
            for trigger_type, listeners in self.event_listeners.items():
                if workflow_id in listeners:
                    listeners.remove(workflow_id)
    
    async def _load_workflows(self):
        """Load workflows from database"""
        # In production, load from database
        pass
    
    async def _save_workflow(self, workflow: Workflow):
        """Save workflow to database"""
        # In production, save to database
        pass
    
    async def _save_execution(self, execution: WorkflowExecution):
        """Save execution result to database"""
        # In production, save to database
        pass
    
    async def _schedule_workflow(self, workflow_id: str, schedule: str):
        """Schedule a workflow"""
        # In production, use proper cron scheduler
        pass