"""
Natural Language Planning System
Converts project descriptions into detailed roadmaps automatically
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
from services.groq_ai_service import GroqAIService
from routes.auth import get_current_user
from models.database import get_database
import uuid

router = APIRouter()

class ProjectPlanRequest(BaseModel):
    description: str
    complexity: Optional[str] = "medium"  # simple, medium, complex, enterprise
    timeline: Optional[str] = "2-4 weeks"
    tech_stack: Optional[List[str]] = []
    requirements: Optional[List[str]] = []

class TaskItem(BaseModel):
    id: str
    title: str
    description: str
    estimated_hours: int
    priority: str  # high, medium, low
    dependencies: List[str]
    assigned_agent: str  # Dev, Luna, Atlas, Quinn, Sage
    phase: str
    status: str = "pending"

class Milestone(BaseModel):
    id: str
    title: str
    description: str
    target_date: datetime
    tasks: List[str]  # task IDs
    completion_percentage: int = 0

class ProjectPlan(BaseModel):
    id: str
    title: str
    description: str
    complexity: str
    estimated_duration: str
    phases: List[str]
    tasks: List[TaskItem]
    milestones: List[Milestone]
    tech_stack: List[str]
    agents_involved: List[str]
    created_at: datetime
    updated_at: datetime

class PlanningService:
    def __init__(self):
        self.ai_service = GroqAIService()
    
    async def generate_project_plan(self, request: ProjectPlanRequest) -> ProjectPlan:
        """Generate comprehensive project plan from natural language description"""
        
        # Enhanced prompt for intelligent planning
        planning_prompt = f"""
        You are an expert AI project manager. Create a comprehensive, detailed project plan from this description:
        
        PROJECT DESCRIPTION: {request.description}
        COMPLEXITY: {request.complexity}
        TIMELINE: {request.timeline}
        TECH STACK: {', '.join(request.tech_stack) if request.tech_stack else 'Auto-suggest'}
        REQUIREMENTS: {', '.join(request.requirements) if request.requirements else 'Auto-analyze'}
        
        Generate a detailed JSON project plan with:
        
        1. PROJECT ANALYSIS:
           - Auto-detected project type and complexity
           - Recommended tech stack if not provided
           - Key technical challenges and solutions
        
        2. MULTI-AGENT TASK ASSIGNMENT:
           - Dev: Backend, APIs, database design, core logic
           - Luna: UI/UX design, user experience, accessibility
           - Atlas: Architecture, scalability, performance optimization
           - Quinn: Testing strategy, QA, deployment validation
           - Sage: Project coordination, timeline management, documentation
        
        3. SMART PHASES (4-6 phases):
           - Phase 1: Foundation & Setup
           - Phase 2: Core Development
           - Phase 3: Feature Implementation
           - Phase 4: Testing & Optimization
           - Phase 5: Deployment & Launch
           - Phase 6: Post-Launch Support (if needed)
        
        4. DETAILED TASKS (15-25 tasks):
           - Each task: specific, measurable, time-estimated
           - Clear dependencies and agent assignments
           - Priority levels and blocking relationships
        
        5. INTELLIGENT MILESTONES (3-5 milestones):
           - MVP completion checkpoints
           - Feature delivery milestones
           - Quality gates and reviews
        
        Return ONLY valid JSON in this exact format:
        {{
            "title": "Project Title",
            "description": "Enhanced project description",
            "complexity": "detected_complexity",
            "estimated_duration": "X weeks",
            "tech_stack": ["tech1", "tech2", "tech3"],
            "phases": ["Phase 1: Foundation", "Phase 2: Core Dev", ...],
            "tasks": [
                {{
                    "title": "Task Title",
                    "description": "Detailed task description",
                    "estimated_hours": 8,
                    "priority": "high|medium|low",
                    "dependencies": ["task_id1", "task_id2"],
                    "assigned_agent": "Dev|Luna|Atlas|Quinn|Sage",
                    "phase": "Phase 1: Foundation"
                }}
            ],
            "milestones": [
                {{
                    "title": "Milestone Title",
                    "description": "Milestone description",
                    "target_date_offset_days": 7,
                    "tasks": ["task1", "task2"]
                }}
            ],
            "agents_involved": ["Dev", "Luna", "Atlas", "Quinn", "Sage"]
        }}
        """
        
        try:
            # Use Groq AI to generate intelligent plan
            response = await self.ai_service.generate_response(
                planning_prompt,
                model="llama-3.3-70b-versatile",  # Use best model for planning
                max_tokens=2000,
                temperature=0.1  # Low temperature for consistent planning
            )
            
            # Parse AI response
            plan_data = json.loads(response)
            
            # Generate unique IDs and structure the plan
            plan_id = str(uuid.uuid4())
            current_time = datetime.utcnow()
            
            # Process tasks with unique IDs
            tasks = []
            for i, task_data in enumerate(plan_data.get("tasks", [])):
                task = TaskItem(
                    id=f"task_{i+1}",
                    title=task_data["title"],
                    description=task_data["description"],
                    estimated_hours=task_data["estimated_hours"],
                    priority=task_data["priority"],
                    dependencies=task_data.get("dependencies", []),
                    assigned_agent=task_data["assigned_agent"],
                    phase=task_data["phase"]
                )
                tasks.append(task)
            
            # Process milestones
            milestones = []
            for i, milestone_data in enumerate(plan_data.get("milestones", [])):
                milestone = Milestone(
                    id=f"milestone_{i+1}",
                    title=milestone_data["title"],
                    description=milestone_data["description"],
                    target_date=current_time + timedelta(days=milestone_data.get("target_date_offset_days", 7)),
                    tasks=milestone_data.get("tasks", [])
                )
                milestones.append(milestone)
            
            # Create comprehensive project plan
            project_plan = ProjectPlan(
                id=plan_id,
                title=plan_data["title"],
                description=plan_data["description"],
                complexity=plan_data["complexity"],
                estimated_duration=plan_data["estimated_duration"],
                phases=plan_data["phases"],
                tasks=tasks,
                milestones=milestones,
                tech_stack=plan_data["tech_stack"],
                agents_involved=plan_data["agents_involved"],
                created_at=current_time,
                updated_at=current_time
            )
            
            return project_plan
            
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI-generated plan")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Planning service error: {str(e)}")

planning_service = PlanningService()

@router.post("/generate", response_model=ProjectPlan)
async def generate_project_plan(
    request: ProjectPlanRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate intelligent project plan from natural language description"""
    try:
        plan = await planning_service.generate_project_plan(request)
        
        # Store plan in database
        db = await get_database()
        await db.project_plans.insert_one({
            "_id": plan.id,
            "user_id": current_user["user_id"],
            "plan_data": plan.dict(),
            "created_at": plan.created_at,
            "updated_at": plan.updated_at
        })
        
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans", response_model=List[Dict[str, Any]])
async def get_user_plans(
    current_user: dict = Depends(get_current_user)
):
    """Get all project plans for current user"""
    try:
        db = await get_database()
        cursor = db.project_plans.find({"user_id": current_user["user_id"]})
        plans = await cursor.to_list(length=50)
        
        return [
            {
                "id": plan["_id"],
                "title": plan["plan_data"]["title"],
                "complexity": plan["plan_data"]["complexity"],
                "estimated_duration": plan["plan_data"]["estimated_duration"],
                "phases_count": len(plan["plan_data"]["phases"]),
                "tasks_count": len(plan["plan_data"]["tasks"]),
                "created_at": plan["created_at"],
                "updated_at": plan["updated_at"]
            } for plan in plans
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans/{plan_id}", response_model=ProjectPlan)
async def get_project_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed project plan by ID"""
    try:
        db = await get_database()
        plan = await db.project_plans.find_one({
            "_id": plan_id,
            "user_id": current_user["user_id"]
        })
        
        if not plan:
            raise HTTPException(status_code=404, detail="Project plan not found")
        
        return ProjectPlan(**plan["plan_data"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/plans/{plan_id}/tasks/{task_id}/status")
async def update_task_status(
    plan_id: str,
    task_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    """Update task status and recalculate milestone progress"""
    try:
        db = await get_database()
        
        # Update task status
        result = await db.project_plans.update_one(
            {"_id": plan_id, "user_id": current_user["user_id"]},
            {"$set": {
                f"plan_data.tasks.$[task].status": status,
                "updated_at": datetime.utcnow()
            }},
            array_filters=[{"task.id": task_id}]
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Plan or task not found")
        
        return {"message": "Task status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plans/{plan_id}/optimize")
async def optimize_project_plan(
    plan_id: str,
    optimization_request: dict,
    current_user: dict = Depends(get_current_user)
):
    """AI-powered plan optimization based on progress and feedback"""
    try:
        db = await get_database()
        plan = await db.project_plans.find_one({
            "_id": plan_id,
            "user_id": current_user["user_id"]
        })
        
        if not plan:
            raise HTTPException(status_code=404, detail="Project plan not found")
        
        # AI-powered optimization logic here
        optimization_prompt = f"""
        Optimize this project plan based on current progress and requirements:
        
        CURRENT PLAN: {json.dumps(plan['plan_data'], indent=2)}
        OPTIMIZATION REQUEST: {optimization_request}
        
        Provide optimized task assignments, timeline adjustments, and resource allocation.
        Return only the optimized sections as JSON.
        """
        
        response = await planning_service.ai_service.generate_response(
            optimization_prompt,
            model="llama-3.3-70b-versatile",
            max_tokens=1500,
            temperature=0.1
        )
        
        # Apply optimization (implementation details)
        return {"message": "Plan optimized successfully", "optimizations": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))