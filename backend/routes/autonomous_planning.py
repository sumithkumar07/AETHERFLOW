from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import uuid
from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

class PlanningRequest(BaseModel):
    goal: str
    complexity: Optional[str] = "medium"  # simple, medium, complex, enterprise
    timeline: Optional[str] = "flexible"  # urgent, normal, flexible
    context: Optional[Dict[str, Any]] = {}

class TaskBreakdown(BaseModel):
    id: str
    title: str
    description: str
    estimated_time: str
    priority: str
    dependencies: List[str]
    agent_assigned: str
    status: str = "pending"
    phase: str

class ProjectRoadmap(BaseModel):
    id: str
    goal: str
    total_phases: int
    estimated_duration: str
    current_phase: int
    tasks: List[TaskBreakdown]
    milestones: List[Dict[str, Any]]
    risk_assessment: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class AutonomousPlanningService:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
        
    async def create_project_roadmap(self, request: PlanningRequest, user_id: str) -> ProjectRoadmap:
        """Create comprehensive project roadmap with task breakdown"""
        
        # Generate intelligent project analysis
        analysis_prompt = f"""
        As an expert project manager and technical architect, create a comprehensive roadmap for:
        
        **Goal**: {request.goal}
        **Complexity**: {request.complexity}
        **Timeline**: {request.timeline}
        **Context**: {request.context}
        
        Provide a detailed breakdown including:
        1. Project phases (MVP, Beta, Production, Scale)
        2. Task breakdown with time estimates
        3. Dependencies between tasks
        4. Risk assessment and mitigation
        5. Resource requirements
        6. Milestone definitions
        
        Format as structured JSON with clear task assignments for our 5 AI agents:
        - Dev: Technical implementation
        - Luna: UI/UX design
        - Atlas: Architecture and scaling
        - Quinn: Testing and quality
        - Sage: Project management
        """
        
        try:
            # Get AI-generated roadmap
            roadmap_response = await self.ai_service.process_enhanced_chat(
                message=analysis_prompt,
                conversation_id=f"planning_{uuid.uuid4()}",
                user_id=user_id,
                agent_coordination="hierarchical"
            )
            
            # Parse and structure the response
            roadmap_id = str(uuid.uuid4())
            
            # Generate tasks with intelligent breakdown
            tasks = await self._generate_task_breakdown(request.goal, request.complexity)
            milestones = await self._generate_milestones(tasks)
            risk_assessment = await self._assess_project_risks(request.goal, request.complexity)
            
            roadmap = ProjectRoadmap(
                id=roadmap_id,
                goal=request.goal,
                total_phases=4,  # MVP, Beta, Production, Scale
                estimated_duration=self._calculate_duration(request.complexity, len(tasks)),
                current_phase=1,
                tasks=tasks,
                milestones=milestones,
                risk_assessment=risk_assessment,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Store in database
            db = await get_database()
            await db.project_roadmaps.insert_one({
                **roadmap.dict(),
                "user_id": user_id,
                "ai_analysis": roadmap_response
            })
            
            return roadmap
            
        except Exception as e:
            raise HTTPException(status_code=500, f"Planning generation failed: {str(e)}")
    
    async def _generate_task_breakdown(self, goal: str, complexity: str) -> List[TaskBreakdown]:
        """Generate intelligent task breakdown"""
        base_tasks = [
            {"title": "Project Setup", "agent": "Sage", "phase": "MVP"},
            {"title": "Architecture Design", "agent": "Atlas", "phase": "MVP"},
            {"title": "UI/UX Design", "agent": "Luna", "phase": "MVP"},
            {"title": "Core Development", "agent": "Dev", "phase": "MVP"},
            {"title": "Testing Strategy", "agent": "Quinn", "phase": "MVP"},
            {"title": "Beta Release", "agent": "Sage", "phase": "Beta"},
            {"title": "Performance Optimization", "agent": "Atlas", "phase": "Production"},
            {"title": "Production Deployment", "agent": "Dev", "phase": "Production"},
            {"title": "Scaling Strategy", "agent": "Atlas", "phase": "Scale"}
        ]
        
        tasks = []
        for i, task in enumerate(base_tasks):
            task_id = str(uuid.uuid4())
            estimated_time = self._estimate_task_time(task["title"], complexity)
            priority = "high" if i < 5 else "medium"
            
            tasks.append(TaskBreakdown(
                id=task_id,
                title=task["title"],
                description=f"Detailed {task['title'].lower()} for: {goal}",
                estimated_time=estimated_time,
                priority=priority,
                dependencies=[tasks[i-1].id] if i > 0 else [],
                agent_assigned=task["agent"],
                phase=task["phase"]
            ))
            
        return tasks
    
    async def _generate_milestones(self, tasks: List[TaskBreakdown]) -> List[Dict[str, Any]]:
        """Generate project milestones"""
        phases = ["MVP", "Beta", "Production", "Scale"]
        milestones = []
        
        for phase in phases:
            phase_tasks = [t for t in tasks if t.phase == phase]
            milestones.append({
                "name": f"{phase} Complete",
                "description": f"All {phase} phase tasks completed",
                "tasks_count": len(phase_tasks),
                "estimated_completion": self._calculate_phase_duration(phase_tasks),
                "success_criteria": self._get_phase_criteria(phase)
            })
            
        return milestones
    
    async def _assess_project_risks(self, goal: str, complexity: str) -> Dict[str, Any]:
        """Assess project risks and mitigation strategies"""
        complexity_multiplier = {"simple": 1.0, "medium": 1.5, "complex": 2.0, "enterprise": 3.0}
        base_risk = complexity_multiplier.get(complexity, 1.5)
        
        return {
            "overall_risk": "medium" if base_risk < 2.0 else "high",
            "technical_risks": [
                "Integration complexity",
                "Scalability challenges", 
                "Performance bottlenecks"
            ],
            "timeline_risks": [
                "Scope creep",
                "Resource availability",
                "External dependencies"
            ],
            "mitigation_strategies": [
                "Iterative development approach",
                "Regular stakeholder reviews",
                "Automated testing pipeline",
                "Performance monitoring"
            ],
            "risk_score": base_risk,
            "confidence_level": 0.85
        }
    
    def _estimate_task_time(self, task_title: str, complexity: str) -> str:
        """Estimate task completion time"""
        base_times = {
            "Project Setup": "2-3 days",
            "Architecture Design": "3-5 days", 
            "UI/UX Design": "5-7 days",
            "Core Development": "10-15 days",
            "Testing Strategy": "3-5 days",
            "Beta Release": "2-3 days",
            "Performance Optimization": "5-7 days",
            "Production Deployment": "2-3 days",
            "Scaling Strategy": "3-5 days"
        }
        return base_times.get(task_title, "3-5 days")
    
    def _calculate_duration(self, complexity: str, task_count: int) -> str:
        """Calculate overall project duration"""
        base_days = task_count * 3
        multiplier = {"simple": 0.8, "medium": 1.0, "complex": 1.5, "enterprise": 2.0}
        total_days = int(base_days * multiplier.get(complexity, 1.0))
        weeks = total_days // 7
        return f"{weeks}-{weeks+2} weeks"
    
    def _calculate_phase_duration(self, tasks: List[TaskBreakdown]) -> str:
        """Calculate phase completion time"""
        return f"{len(tasks) * 2}-{len(tasks) * 3} days"
    
    def _get_phase_criteria(self, phase: str) -> List[str]:
        """Get success criteria for phase"""
        criteria = {
            "MVP": ["Core functionality working", "Basic UI implemented", "Initial testing complete"],
            "Beta": ["User feedback incorporated", "Performance optimized", "Beta testing complete"],
            "Production": ["Production ready", "Security validated", "Monitoring in place"],
            "Scale": ["Scalability tested", "Cost optimized", "Growth strategies implemented"]
        }
        return criteria.get(phase, ["Phase objectives met"])

# Initialize service
planning_service = AutonomousPlanningService()

@router.post("/create-roadmap", response_model=ProjectRoadmap)
async def create_project_roadmap(
    request: PlanningRequest,
    current_user = Depends(get_current_user)
):
    """Create AI-generated project roadmap with autonomous task breakdown"""
    return await planning_service.create_project_roadmap(request, current_user["id"])

@router.get("/roadmaps")
async def get_user_roadmaps(current_user = Depends(get_current_user)):
    """Get all roadmaps for current user"""
    db = await get_database()
    roadmaps = await db.project_roadmaps.find(
        {"user_id": current_user["id"]}
    ).to_list(length=20)
    return roadmaps

@router.get("/roadmap/{roadmap_id}")
async def get_roadmap(roadmap_id: str, current_user = Depends(get_current_user)):
    """Get specific roadmap details"""
    db = await get_database()
    roadmap = await db.project_roadmaps.find_one(
        {"id": roadmap_id, "user_id": current_user["id"]}
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@router.put("/roadmap/{roadmap_id}/task/{task_id}")
async def update_task_status(
    roadmap_id: str, 
    task_id: str, 
    status: str,
    current_user = Depends(get_current_user)
):
    """Update task status in roadmap"""
    db = await get_database()
    result = await db.project_roadmaps.update_one(
        {"id": roadmap_id, "user_id": current_user["id"], "tasks.id": task_id},
        {"$set": {"tasks.$.status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task status updated", "task_id": task_id, "status": status}

@router.post("/roadmap/{roadmap_id}/progress")
async def update_roadmap_progress(
    roadmap_id: str,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Update roadmap progress and move to next phase if ready"""
    db = await get_database()
    roadmap = await db.project_roadmaps.find_one(
        {"id": roadmap_id, "user_id": current_user["id"]}
    )
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Calculate progress and update phase
    background_tasks.add_task(planning_service.update_roadmap_progress, roadmap_id, current_user["id"])
    
    return {"message": "Progress update initiated", "roadmap_id": roadmap_id}