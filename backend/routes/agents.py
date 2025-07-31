from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime

from models.agent import Agent, AgentCreate, AgentUpdate, AgentTeam, TaskExecution
from models.user import User
from services.agent_orchestrator import AgentOrchestrator
from routes.auth import get_current_user
from models.database import get_database

router = APIRouter()

@router.post("/agents", response_model=Agent)
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new AI agent"""
    try:
        orchestrator = AgentOrchestrator(db)
        agent = await orchestrator.create_agent(agent_data.dict(), current_user.id)
        return agent
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/agents", response_model=List[Agent])
async def list_agents(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
    limit: int = 50,
    offset: int = 0
):
    """List user's agents"""
    try:
        agents_collection = db.agents
        agents_data = await agents_collection.find(
            {"created_by": current_user.id}
        ).skip(offset).limit(limit).to_list(limit)
        
        return [Agent(**agent_data) for agent_data in agents_data]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/agents/{agent_id}", response_model=Agent)
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get specific agent details"""
    try:
        agents_collection = db.agents
        agent_data = await agents_collection.find_one({
            "id": agent_id,
            "created_by": current_user.id
        })
        
        if not agent_data:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return Agent(**agent_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/agents/{agent_id}", response_model=Agent)
async def update_agent(
    agent_id: str,
    agent_update: AgentUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update agent configuration"""
    try:
        agents_collection = db.agents
        
        # Verify ownership
        existing_agent = await agents_collection.find_one({
            "id": agent_id,
            "created_by": current_user.id
        })
        
        if not existing_agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Update agent
        update_data = {k: v for k, v in agent_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await agents_collection.update_one(
            {"id": agent_id},
            {"$set": update_data}
        )
        
        # Return updated agent
        updated_agent_data = await agents_collection.find_one({"id": agent_id})
        return Agent(**updated_agent_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/agents/{agent_id}")
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete an agent"""
    try:
        agents_collection = db.agents
        
        # Verify ownership
        existing_agent = await agents_collection.find_one({
            "id": agent_id,
            "created_by": current_user.id
        })
        
        if not existing_agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Delete agent
        await agents_collection.delete_one({"id": agent_id})
        
        return {"message": "Agent deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/agents/{agent_id}/execute")
async def execute_agent_task(
    agent_id: str,
    task_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Execute a task with specific agent"""
    try:
        orchestrator = AgentOrchestrator(db)
        
        # Verify agent exists and user has access
        agents_collection = db.agents
        agent_data = await agents_collection.find_one({
            "id": agent_id,
            "created_by": current_user.id
        })
        
        if not agent_data:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Create task execution record
        task_execution = TaskExecution(
            agent_id=agent_id,
            task_type=task_data.get("type", "general"),
            task_data=task_data,
            status="queued"
        )
        
        # Queue task for background execution
        background_tasks.add_task(
            execute_agent_task_background,
            orchestrator,
            task_execution,
            db
        )
        
        return {
            "task_id": task_execution.id,
            "status": "queued",
            "message": "Task queued for execution"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def execute_agent_task_background(
    orchestrator: AgentOrchestrator,
    task_execution: TaskExecution,
    db
):
    """Background task execution"""
    try:
        # Update status to running
        task_execution.status = "running"
        task_execution.started_at = datetime.utcnow()
        
        # Execute task (this would involve the actual agent execution logic)
        result = await orchestrator._run_agent_task(
            orchestrator.active_agents.get(task_execution.agent_id),
            task_execution,
            None  # Execution context
        )
        
        # Update completion status
        task_execution.status = "completed"
        task_execution.completed_at = datetime.utcnow()
        task_execution.result = result
        task_execution.execution_time = (
            task_execution.completed_at - task_execution.started_at
        ).total_seconds()
        
    except Exception as e:
        task_execution.status = "failed"
        task_execution.error = str(e)
        task_execution.completed_at = datetime.utcnow()
    
    # Save final status
    tasks_collection = db.task_executions
    await tasks_collection.insert_one(task_execution.dict())

@router.get("/agents/{agent_id}/tasks")
async def get_agent_tasks(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
    limit: int = 20,
    offset: int = 0
):
    """Get agent's task execution history"""
    try:
        # Verify agent ownership
        agents_collection = db.agents
        agent_data = await agents_collection.find_one({
            "id": agent_id,
            "created_by": current_user.id
        })
        
        if not agent_data:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Get tasks
        tasks_collection = db.task_executions
        tasks_data = await tasks_collection.find(
            {"agent_id": agent_id}
        ).sort("started_at", -1).skip(offset).limit(limit).to_list(limit)
        
        return [TaskExecution(**task_data) for task_data in tasks_data]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/orchestrate")
async def orchestrate_multi_agent_task(
    task_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Orchestrate a complex task using multiple agents"""
    try:
        orchestrator = AgentOrchestrator(db)
        await orchestrator.initialize()
        
        task_description = task_request.get("description", "")
        if not task_description:
            raise HTTPException(status_code=400, detail="Task description is required")
        
        result = await orchestrator.orchestrate_multi_agent_task(
            task_description,
            current_user.id
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orchestration/status")
async def get_orchestration_status(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get current orchestration system status"""
    try:
        orchestrator = AgentOrchestrator(db)
        await orchestrator.initialize()
        
        status = await orchestrator.get_orchestration_status()
        return status
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/teams", response_model=AgentTeam)
async def create_agent_team(
    team_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a team of agents"""
    try:
        team = AgentTeam(
            name=team_data["name"],
            description=team_data["description"],
            agents=team_data.get("agents", []),
            workflow_config=team_data.get("workflow_config", {}),
            created_by=current_user.id
        )
        
        # Save team
        teams_collection = db.agent_teams
        await teams_collection.insert_one(team.dict())
        
        return team
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/teams")
async def list_agent_teams(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """List user's agent teams"""
    try:
        teams_collection = db.agent_teams
        teams_data = await teams_collection.find(
            {"created_by": current_user.id}
        ).to_list(None)
        
        return [AgentTeam(**team_data) for team_data in teams_data]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))