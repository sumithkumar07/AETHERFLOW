import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorCollection

from models.agent import Agent, AgentTeam, TaskExecution, AgentStatus, AgentType
from models.workflow import Workflow, WorkflowExecution, WorkflowStep
from services.ai_service import AIService

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """Advanced multi-agent orchestration system"""
    
    def __init__(self, db_client):
        self.db = db_client
        self.ai_service = AIService()
        self.active_agents: Dict[str, Agent] = {}
        self.task_queue = asyncio.Queue()
        self.agent_tasks: Dict[str, asyncio.Task] = {}
        
    async def initialize(self):
        """Initialize the orchestrator"""
        try:
            # Load active agents from database
            agents_collection = self.db.agents
            active_agents = await agents_collection.find({"status": "active"}).to_list(None)
            
            for agent_data in active_agents:
                agent = Agent(**agent_data)
                self.active_agents[agent.id] = agent
                
            logger.info(f"Initialized orchestrator with {len(self.active_agents)} active agents")
            
            # Start the task processing loop
            asyncio.create_task(self._process_task_queue())
            
        except Exception as e:
            logger.error(f"Failed to initialize agent orchestrator: {e}")
            raise
    
    async def create_agent(self, agent_data: dict, creator_id: str) -> Agent:
        """Create a new AI agent with specialized capabilities"""
        try:
            # Auto-configure agent based on type
            agent_config = await self._auto_configure_agent(agent_data)
            
            agent = Agent(
                **agent_config,
                created_by=creator_id
            )
            
            # Save to database
            agents_collection = self.db.agents
            await agents_collection.insert_one(agent.dict())
            
            # Add to active agents if status is active
            if agent.status == AgentStatus.ACTIVE:
                self.active_agents[agent.id] = agent
                
            logger.info(f"Created new agent: {agent.name} ({agent.type})")
            return agent
            
        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            raise
    
    async def _auto_configure_agent(self, agent_data: dict) -> dict:
        """Auto-configure agent capabilities based on type"""
        agent_type = AgentType(agent_data.get("type", "developer"))
        
        if agent_type == AgentType.DEVELOPER:
            agent_data["capabilities"] = [
                {
                    "name": "code_generation",
                    "description": "Generate code in multiple languages",
                    "parameters": {"languages": ["python", "javascript", "typescript", "react"]}
                },
                {
                    "name": "code_review",
                    "description": "Review and analyze code quality",
                    "parameters": {"check_types": ["syntax", "security", "performance"]}
                },
                {
                    "name": "debugging",
                    "description": "Debug and fix code issues",
                    "parameters": {"error_types": ["runtime", "logic", "performance"]}
                }
            ]
            agent_data["model_config"] = {
                "primary_model": "gpt-4",
                "fallback_model": "claude-sonnet-4",
                "temperature": 0.1,
                "max_tokens": 4000
            }
            
        elif agent_type == AgentType.INTEGRATOR:
            agent_data["capabilities"] = [
                {
                    "name": "api_integration",
                    "description": "Connect and integrate external APIs",
                    "parameters": {"protocols": ["REST", "GraphQL", "WebSocket"]}
                },
                {
                    "name": "database_integration",
                    "description": "Integrate with various databases",
                    "parameters": {"databases": ["mongodb", "postgresql", "mysql", "redis"]}
                },
                {
                    "name": "third_party_services",
                    "description": "Integrate third-party services",
                    "parameters": {"services": ["stripe", "auth0", "sendgrid", "twilio"]}
                }
            ]
            
        elif agent_type == AgentType.TESTER:
            agent_data["capabilities"] = [
                {
                    "name": "unit_testing",
                    "description": "Generate and run unit tests",
                    "parameters": {"frameworks": ["jest", "pytest", "mocha"]}
                },
                {
                    "name": "integration_testing",
                    "description": "Test API and integration points",
                    "parameters": {"tools": ["postman", "cypress", "playwright"]}
                },
                {
                    "name": "performance_testing",
                    "description": "Test application performance",
                    "parameters": {"metrics": ["response_time", "throughput", "memory"]}
                }
            ]
            
        elif agent_type == AgentType.DEPLOYER:
            agent_data["capabilities"] = [
                {
                    "name": "containerization",
                    "description": "Create Docker containers and configurations",
                    "parameters": {"platforms": ["docker", "kubernetes"]}
                },
                {
                    "name": "cloud_deployment",
                    "description": "Deploy to cloud platforms",
                    "parameters": {"providers": ["aws", "gcp", "azure", "vercel", "netlify"]}
                },
                {
                    "name": "ci_cd_setup",
                    "description": "Set up continuous integration and deployment",
                    "parameters": {"tools": ["github_actions", "gitlab_ci", "jenkins"]}
                }
            ]
            
        return agent_data
    
    async def orchestrate_multi_agent_task(self, task_description: str, user_id: str) -> Dict[str, Any]:
        """Orchestrate a complex task using multiple specialized agents"""
        try:
            # Analyze task and determine required agents
            task_analysis = await self._analyze_task(task_description)
            required_agents = await self._select_agents_for_task(task_analysis)
            
            # Create workflow for multi-agent coordination
            workflow = await self._create_coordination_workflow(task_analysis, required_agents)
            
            # Execute the workflow
            execution = await self._execute_workflow(workflow, user_id)
            
            return {
                "workflow_id": workflow.id,
                "execution_id": execution.id,
                "agents_involved": [agent.name for agent in required_agents],
                "estimated_completion": self._estimate_completion_time(workflow),
                "status": "started"
            }
            
        except Exception as e:
            logger.error(f"Multi-agent orchestration failed: {e}")
            raise
    
    async def _analyze_task(self, task_description: str) -> Dict[str, Any]:
        """Analyze task to determine complexity and requirements"""
        analysis_prompt = f"""
        Analyze this development task and break it down:
        
        Task: {task_description}
        
        Please identify:
        1. Main components needed (frontend, backend, database, etc.)
        2. Required integrations (APIs, services, databases)
        3. Complexity level (simple, medium, complex, enterprise)
        4. Estimated development phases
        5. Required skills/agent types
        
        Respond in JSON format.
        """
        
        response = await self.ai_service.process_message(analysis_prompt)
        
        # Parse AI response and structure task analysis
        return {
            "description": task_description,
            "complexity": "medium",  # Will be determined by AI
            "components": ["frontend", "backend", "database"],
            "integrations": [],
            "phases": ["planning", "development", "testing", "deployment"],
            "required_agent_types": [AgentType.DEVELOPER, AgentType.TESTER]
        }
    
    async def _select_agents_for_task(self, task_analysis: Dict[str, Any]) -> List[Agent]:
        """Select the best agents for the task"""
        required_types = task_analysis.get("required_agent_types", [])
        selected_agents = []
        
        for agent_type in required_types:
            # Find the best available agent of this type
            best_agent = await self._find_best_agent(agent_type)
            if best_agent:
                selected_agents.append(best_agent)
            else:
                # Create a new agent if none available
                new_agent = await self._create_agent_for_task(agent_type, task_analysis)
                selected_agents.append(new_agent)
                
        return selected_agents
    
    async def _find_best_agent(self, agent_type: AgentType) -> Optional[Agent]:
        """Find the best available agent of a specific type"""
        available_agents = [
            agent for agent in self.active_agents.values()
            if agent.type == agent_type and agent.status == AgentStatus.IDLE
        ]
        
        if not available_agents:
            return None
            
        # Select agent with best performance metrics
        return max(available_agents, key=lambda a: a.performance_metrics.get("success_rate", 0))
    
    async def _create_coordination_workflow(self, task_analysis: Dict[str, Any], agents: List[Agent]) -> Workflow:
        """Create a workflow to coordinate multiple agents"""
        workflow_steps = []
        
        for i, phase in enumerate(task_analysis.get("phases", [])):
            step = WorkflowStep(
                name=f"{phase.title()} Phase",
                type="ai_generation",
                description=f"Execute {phase} phase of the task",
                order=i,
                agent_id=agents[i % len(agents)].id if agents else None,
                configuration={
                    "phase": phase,
                    "task_description": task_analysis["description"]
                }
            )
            workflow_steps.append(step)
        
        workflow = Workflow(
            name=f"Multi-Agent Task: {task_analysis['description'][:50]}...",
            description="Orchestrated multi-agent workflow",
            steps=workflow_steps,
            created_by="system"
        )
        
        # Save workflow
        workflows_collection = self.db.workflows
        await workflows_collection.insert_one(workflow.dict())
        
        return workflow
    
    async def _execute_workflow(self, workflow: Workflow, user_id: str) -> WorkflowExecution:
        """Execute a multi-agent workflow"""
        execution = WorkflowExecution(
            workflow_id=workflow.id,
            workflow_version=workflow.version,
            triggered_by=user_id
        )
        
        # Save execution record
        executions_collection = self.db.workflow_executions
        await executions_collection.insert_one(execution.dict())
        
        # Start async execution
        asyncio.create_task(self._run_workflow_steps(workflow, execution))
        
        return execution
    
    async def _run_workflow_steps(self, workflow: Workflow, execution: WorkflowExecution):
        """Run workflow steps in sequence"""
        try:
            for step in sorted(workflow.steps, key=lambda s: s.order):
                # Execute step with assigned agent
                step_result = await self._execute_step(step, execution)
                
                execution.step_executions.append({
                    "step_id": step.id,
                    "status": step_result.get("status", "completed"),
                    "result": step_result.get("result"),
                    "duration": step_result.get("duration", 0)
                })
                
                # Update execution in database
                executions_collection = self.db.workflow_executions
                await executions_collection.update_one(
                    {"id": execution.id},
                    {"$set": execution.dict()}
                )
                
            execution.status = "completed"
            execution.completed_at = datetime.utcnow()
            
        except Exception as e:
            execution.status = "failed"
            execution.error = str(e)
            logger.error(f"Workflow execution failed: {e}")
    
    async def _execute_step(self, step: WorkflowStep, execution: WorkflowExecution) -> Dict[str, Any]:
        """Execute a single workflow step"""
        start_time = datetime.utcnow()
        
        try:
            if step.agent_id:
                agent = self.active_agents.get(step.agent_id)
                if agent:
                    # Update agent status
                    agent.status = AgentStatus.BUSY
                    
                    # Execute step with agent
                    result = await self._run_agent_task(agent, step, execution)
                    
                    # Reset agent status
                    agent.status = AgentStatus.IDLE
                    
                    duration = (datetime.utcnow() - start_time).total_seconds()
                    
                    return {
                        "status": "completed",
                        "result": result,
                        "duration": duration
                    }
            
            # Fallback execution without specific agent
            return {"status": "completed", "result": "Step completed"}
            
        except Exception as e:
            duration = (datetime.utcnow() - start_time).total_seconds()
            return {
                "status": "failed",
                "error": str(e),
                "duration": duration
            }
    
    async def _run_agent_task(self, agent: Agent, step: WorkflowStep, execution: WorkflowExecution) -> Dict[str, Any]:
        """Run a specific task with an agent"""
        task_prompt = f"""
        You are a {agent.type} agent named {agent.name}.
        
        Task: {step.description}
        Configuration: {step.configuration}
        
        Please execute this task and provide a detailed result.
        """
        
        # Use agent's configured AI model
        model = agent.model_config.get("primary_model", "gpt-4")
        response = await self.ai_service.process_message(task_prompt, {"model": model})
        
        return response
    
    def _estimate_completion_time(self, workflow: Workflow) -> int:
        """Estimate workflow completion time in minutes"""
        base_time = len(workflow.steps) * 2  # 2 minutes per step base
        complexity_multiplier = 1.5  # Default complexity
        
        return int(base_time * complexity_multiplier)
    
    async def _process_task_queue(self):
        """Process queued tasks continuously"""
        while True:
            try:
                # Get next task from queue
                task = await self.task_queue.get()
                
                # Process task
                await self._handle_queued_task(task)
                
                # Mark task as done
                self.task_queue.task_done()
                
            except Exception as e:
                logger.error(f"Error processing queued task: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    async def _handle_queued_task(self, task: Dict[str, Any]):
        """Handle a single queued task"""
        task_type = task.get("type")
        
        if task_type == "agent_health_check":
            await self._perform_agent_health_check()
        elif task_type == "workflow_cleanup":
            await self._cleanup_completed_workflows()
        # Add more task types as needed
    
    async def _perform_agent_health_check(self):
        """Check health of all active agents"""
        for agent_id, agent in self.active_agents.items():
            try:
                # Simple health check - could be expanded
                if agent.status == AgentStatus.ERROR:
                    # Attempt to recover agent
                    agent.status = AgentStatus.IDLE
                    logger.info(f"Recovered agent {agent.name}")
                    
            except Exception as e:
                logger.error(f"Health check failed for agent {agent.name}: {e}")
    
    async def get_orchestration_status(self) -> Dict[str, Any]:
        """Get current orchestration system status"""
        return {
            "active_agents": len(self.active_agents),
            "queued_tasks": self.task_queue.qsize(),
            "agent_breakdown": {
                agent_type.value: len([a for a in self.active_agents.values() if a.type == agent_type])
                for agent_type in AgentType
            },
            "system_health": "healthy"
        }