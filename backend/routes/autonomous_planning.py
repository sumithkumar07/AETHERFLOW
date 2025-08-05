"""
Autonomous Planning Interface - Addresses Gap #1
Natural Language Planning similar to Devin's autonomous task breakdown
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
from datetime import datetime, timedelta
import uuid

from services.ai_service_v3_enhanced import EnhancedAIServiceV3
from routes.auth import get_current_user
from models.database import get_database

router = APIRouter()

class PlanningRequest(BaseModel):
    goal: str
    project_context: Optional[str] = None
    timeline: Optional[str] = "flexible"
    complexity: Optional[str] = "medium"
    tech_stack: Optional[List[str]] = []

class TaskPlan(BaseModel):
    id: str
    title: str
    description: str
    dependencies: List[str]
    estimated_hours: int
    assigned_agent: str
    status: str = "pending"
    phase: str

class PlanningResponse(BaseModel):
    plan_id: str
    goal: str
    total_phases: int
    estimated_completion: str
    tasks: List[TaskPlan]
    roadmap: List[Dict[str, Any]]
    next_actions: List[str]

class AutonomousPlanner:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
    
    async def create_autonomous_plan(self, request: PlanningRequest, user_id: str) -> PlanningResponse:
        """Create autonomous task breakdown from high-level goal"""
        
        # Enhanced planning prompt for autonomous breakdown
        planning_prompt = f"""
        As an autonomous planning agent, break down this goal into a comprehensive project plan:
        
        GOAL: {request.goal}
        CONTEXT: {request.project_context or "None provided"}
        TIMELINE: {request.timeline}
        COMPLEXITY: {request.complexity}
        TECH_STACK: {', '.join(request.tech_stack) if request.tech_stack else "To be determined"}
        
        Create an autonomous execution plan with:
        
        1. PHASE BREAKDOWN (3-5 phases):
           - Discovery & Planning
           - Core Development
           - Integration & Testing
           - Deployment & Optimization
           - Maintenance & Scaling
        
        2. TASK DECOMPOSITION:
           For each phase, create specific, actionable tasks with:
           - Clear deliverables
           - Dependencies
           - Time estimates
           - Agent assignments (Dev, Luna, Atlas, Quinn, Sage)
        
        3. AUTONOMOUS DECISION POINTS:
           - Key milestones for automatic progression
           - Quality gates and success criteria
           - Risk mitigation strategies
        
        4. ROADMAP VISUALIZATION:
           - Timeline with dependencies
           - Parallel workstreams
           - Critical path identification
        
        Return as structured JSON with tasks, phases, roadmap, and next_actions.
        Make this plan autonomous - agents should be able to execute without constant human intervention.
        """
        
        # Get autonomous plan from AI
        try:
            ai_response = await self.ai_service.get_enhanced_response(
                message=planning_prompt,
                session_id=f"planning_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Atlas",  # System architect for planning
                include_context=True
            )
            
            # Parse the AI response to extract structured plan
            plan_data = self._parse_planning_response(ai_response['content'])
            
            # Generate plan ID and metadata
            plan_id = f"plan_{uuid.uuid4().hex[:12]}"
            estimated_completion = self._calculate_completion_date(plan_data.get('tasks', []))
            
            # Create tasks with proper structure
            tasks = []
            for task_data in plan_data.get('tasks', []):
                task = TaskPlan(
                    id=f"task_{uuid.uuid4().hex[:8]}",
                    title=task_data.get('title', ''),
                    description=task_data.get('description', ''),
                    dependencies=task_data.get('dependencies', []),
                    estimated_hours=task_data.get('estimated_hours', 4),
                    assigned_agent=task_data.get('assigned_agent', 'Dev'),
                    phase=task_data.get('phase', 'Core Development')
                )
                tasks.append(task)
            
            response = PlanningResponse(
                plan_id=plan_id,
                goal=request.goal,
                total_phases=plan_data.get('total_phases', 4),
                estimated_completion=estimated_completion,
                tasks=tasks,
                roadmap=plan_data.get('roadmap', []),
                next_actions=plan_data.get('next_actions', [])
            )
            
            # Store plan in database for future reference
            await self._store_plan(plan_id, response, user_id)
            
            return response
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Planning failed: {str(e)}")
    
    def _parse_planning_response(self, ai_content: str) -> Dict[str, Any]:
        """Parse AI response into structured plan data"""
        try:
            # Try to extract JSON from AI response
            if "```json" in ai_content:
                json_start = ai_content.find("```json") + 7
                json_end = ai_content.find("```", json_start)
                json_content = ai_content[json_start:json_end]
                return json.loads(json_content)
            
            # Fallback: Create structured plan from text response
            return self._create_fallback_plan(ai_content)
            
        except json.JSONDecodeError:
            return self._create_fallback_plan(ai_content)
    
    def _create_fallback_plan(self, content: str) -> Dict[str, Any]:
        """Create fallback plan structure from text content"""
        return {
            "total_phases": 4,
            "tasks": [
                {
                    "title": "Project Setup & Planning",
                    "description": "Initialize project structure and define requirements",
                    "dependencies": [],
                    "estimated_hours": 8,
                    "assigned_agent": "Atlas",
                    "phase": "Discovery & Planning"
                },
                {
                    "title": "Core Development",
                    "description": "Implement main application features",
                    "dependencies": ["task_1"],
                    "estimated_hours": 24,
                    "assigned_agent": "Dev",
                    "phase": "Core Development"
                },
                {
                    "title": "UI/UX Design Implementation",
                    "description": "Create user interface and experience",
                    "dependencies": ["task_1"],
                    "estimated_hours": 16,
                    "assigned_agent": "Luna",
                    "phase": "Core Development"
                },
                {
                    "title": "Testing & Quality Assurance",
                    "description": "Comprehensive testing strategy execution",
                    "dependencies": ["task_2", "task_3"],
                    "estimated_hours": 12,
                    "assigned_agent": "Quinn",
                    "phase": "Integration & Testing"
                }
            ],
            "roadmap": [
                {"phase": "Discovery & Planning", "duration": "1-2 days", "deliverables": ["Project spec", "Architecture design"]},
                {"phase": "Core Development", "duration": "5-7 days", "deliverables": ["Core features", "UI implementation"]},
                {"phase": "Integration & Testing", "duration": "2-3 days", "deliverables": ["Test suite", "Bug fixes"]},
                {"phase": "Deployment", "duration": "1 day", "deliverables": ["Production deployment", "Monitoring"]}
            ],
            "next_actions": [
                "Review and approve project plan",
                "Set up development environment",
                "Begin discovery phase tasks"
            ]
        }
    
    def _calculate_completion_date(self, tasks: List[Dict]) -> str:
        """Calculate estimated completion date based on tasks"""
        total_hours = sum(task.get('estimated_hours', 4) for task in tasks)
        # Assume 6 hours of effective work per day
        total_days = max(1, total_hours // 6)
        completion_date = datetime.now() + timedelta(days=total_days)
        return completion_date.strftime("%Y-%m-%d")
    
    async def _store_plan(self, plan_id: str, plan: PlanningResponse, user_id: str):
        """Store autonomous plan in database"""
        try:
            db = await get_database()
            await db.autonomous_plans.insert_one({
                "plan_id": plan_id,
                "user_id": user_id,
                "goal": plan.goal,
                "plan_data": plan.dict(),
                "created_at": datetime.utcnow(),
                "status": "active"
            })
        except Exception as e:
            print(f"Failed to store plan: {e}")

# Initialize planner
autonomous_planner = AutonomousPlanner()

@router.post("/create-plan", response_model=PlanningResponse)
async def create_autonomous_plan(
    request: PlanningRequest,
    current_user = Depends(get_current_user)
):
    """Create autonomous task breakdown from high-level goal"""
    return await autonomous_planner.create_autonomous_plan(request, str(current_user["_id"]))

@router.get("/plans")
async def get_user_plans(current_user = Depends(get_current_user)):
    """Get all autonomous plans for current user"""
    try:
        db = await get_database()
        plans = await db.autonomous_plans.find(
            {"user_id": str(current_user["_id"])},
            {"_id": 0}
        ).sort("created_at", -1).to_list(20)
        
        return {"plans": plans}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch plans: {str(e)}")

@router.get("/plans/{plan_id}")
async def get_plan_details(
    plan_id: str,
    current_user = Depends(get_current_user)
):
    """Get detailed plan information"""
    try:
        db = await get_database()
        plan = await db.autonomous_plans.find_one({
            "plan_id": plan_id,
            "user_id": str(current_user["_id"])
        }, {"_id": 0})
        
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
            
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch plan: {str(e)}")

@router.post("/plans/{plan_id}/execute-next")
async def execute_next_task(
    plan_id: str,
    current_user = Depends(get_current_user)
):
    """Execute next autonomous task in the plan"""
    try:
        db = await get_database()
        plan = await db.autonomous_plans.find_one({
            "plan_id": plan_id,
            "user_id": str(current_user["_id"])
        })
        
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        # Find next pending task
        plan_data = plan.get("plan_data", {})
        tasks = plan_data.get("tasks", [])
        
        next_task = None
        for task in tasks:
            if task.get("status") == "pending":
                # Check if dependencies are complete
                dependencies = task.get("dependencies", [])
                deps_complete = all(
                    any(t.get("id") == dep and t.get("status") == "completed" for t in tasks)
                    for dep in dependencies
                ) if dependencies else True
                
                if deps_complete:
                    next_task = task
                    break
        
        if not next_task:
            return {"message": "No executable tasks available", "status": "waiting_or_complete"}
        
        # Execute the task with appropriate agent
        execution_prompt = f"""
        Execute this autonomous task:
        
        TASK: {next_task.get('title')}
        DESCRIPTION: {next_task.get('description')}
        PHASE: {next_task.get('phase')}
        ESTIMATED_HOURS: {next_task.get('estimated_hours')}
        
        Provide detailed implementation or deliverable for this task.
        Include code, documentation, or specific artifacts as appropriate.
        """
        
        ai_response = await autonomous_planner.ai_service.get_enhanced_response(
            message=execution_prompt,
            session_id=f"execute_{plan_id}_{next_task.get('id')}",
            user_id=str(current_user["_id"]),
            agent_preference=next_task.get('assigned_agent', 'Dev'),
            include_context=True
        )
        
        # Update task status
        next_task["status"] = "completed"
        next_task["completed_at"] = datetime.utcnow().isoformat()
        next_task["output"] = ai_response['content']
        
        # Update plan in database
        await db.autonomous_plans.update_one(
            {"plan_id": plan_id, "user_id": str(current_user["_id"])},
            {"$set": {"plan_data": plan_data, "updated_at": datetime.utcnow()}}
        )
        
        return {
            "task_completed": next_task,
            "execution_result": ai_response,
            "next_available_tasks": [
                t for t in tasks 
                if t.get("status") == "pending" and t.get("id") != next_task.get("id")
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task execution failed: {str(e)}")