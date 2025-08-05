from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# Models for Natural Language Planning
class ProjectPlanRequest(BaseModel):
    description: str
    complexity: Optional[str] = "medium"  # low, medium, high, enterprise
    timeline_preference: Optional[str] = "moderate"  # fast, moderate, thorough
    tech_stack: Optional[List[str]] = []
    user_requirements: Optional[List[str]] = []

class TaskBreakdown(BaseModel):
    id: str
    title: str
    description: str
    estimated_hours: int
    priority: str  # high, medium, low
    dependencies: List[str]
    phase: str
    skills_required: List[str]
    acceptance_criteria: List[str]

class ProjectPlan(BaseModel):
    id: str
    project_title: str
    overview: str
    total_estimated_hours: int
    phases: List[Dict]
    tasks: List[TaskBreakdown]
    milestones: List[Dict]
    risk_assessment: List[str]
    tech_stack_recommendations: List[str]
    architecture_suggestions: List[str]
    deployment_strategy: str
    created_at: datetime

# Advanced Planning Intelligence Engine
class NaturalLanguagePlanningEngine:
    def __init__(self):
        self.complexity_mappings = {
            "low": {"base_hours": 40, "multiplier": 1.0},
            "medium": {"base_hours": 120, "multiplier": 1.5},
            "high": {"base_hours": 300, "multiplier": 2.0},
            "enterprise": {"base_hours": 800, "multiplier": 3.0}
        }
        
    async def analyze_project_description(self, description: str) -> Dict:
        """Advanced analysis of project description using intelligent parsing"""
        
        # Detect project type
        project_type = self._detect_project_type(description.lower())
        
        # Detect complexity signals
        complexity_signals = self._analyze_complexity_signals(description.lower())
        
        # Extract requirements
        requirements = self._extract_requirements(description)
        
        # Suggest tech stack
        tech_stack = self._suggest_tech_stack(project_type, complexity_signals)
        
        return {
            "project_type": project_type,
            "complexity_signals": complexity_signals,
            "requirements": requirements,
            "tech_stack": tech_stack,
            "estimated_complexity": self._calculate_complexity(complexity_signals)
        }
    
    def _detect_project_type(self, description: str) -> str:
        """Detect the type of project from description"""
        project_patterns = {
            "web_app": ["web app", "website", "dashboard", "admin panel", "portal"],
            "mobile_app": ["mobile app", "ios", "android", "react native", "flutter"],
            "api": ["api", "backend", "microservice", "rest", "graphql"],
            "ai_ml": ["ai", "machine learning", "ml", "nlp", "computer vision", "deep learning"],
            "ecommerce": ["ecommerce", "shop", "store", "marketplace", "payment"],
            "social": ["social", "chat", "messaging", "community", "forum"],
            "fintech": ["fintech", "banking", "payment", "finance", "trading"],
            "saas": ["saas", "subscription", "multi-tenant", "enterprise"]
        }
        
        for project_type, keywords in project_patterns.items():
            if any(keyword in description for keyword in keywords):
                return project_type
        
        return "web_app"  # default
    
    def _analyze_complexity_signals(self, description: str) -> List[str]:
        """Analyze description for complexity indicators"""
        complexity_signals = []
        
        high_complexity_signals = [
            "scalable", "enterprise", "real-time", "microservices", 
            "ai", "machine learning", "blockchain", "complex workflow",
            "multi-tenant", "high availability", "load balancing",
            "distributed", "cloud native"
        ]
        
        medium_complexity_signals = [
            "authentication", "database", "api integration", "dashboard",
            "reporting", "notifications", "file upload", "search",
            "admin panel", "user management"
        ]
        
        for signal in high_complexity_signals:
            if signal in description:
                complexity_signals.append(f"high:{signal}")
                
        for signal in medium_complexity_signals:
            if signal in description:
                complexity_signals.append(f"medium:{signal}")
                
        return complexity_signals
    
    def _extract_requirements(self, description: str) -> List[str]:
        """Extract specific requirements from description"""
        requirements = []
        
        # Pattern matching for requirements
        requirement_patterns = {
            "user_auth": ["login", "register", "authentication", "user account"],
            "database": ["store", "save", "database", "data persistence"],
            "real_time": ["real-time", "live", "instant", "websocket"],
            "mobile": ["mobile", "responsive", "mobile-friendly"],
            "admin": ["admin", "management", "dashboard"],
            "api": ["api", "integration", "third-party"],
            "payment": ["payment", "billing", "subscription", "checkout"],
            "search": ["search", "filter", "find"],
            "notifications": ["notification", "email", "sms", "alert"]
        }
        
        for req_type, keywords in requirement_patterns.items():
            if any(keyword in description.lower() for keyword in keywords):
                requirements.append(req_type)
                
        return requirements
    
    def _suggest_tech_stack(self, project_type: str, complexity_signals: List[str]) -> List[str]:
        """Suggest appropriate tech stack based on project analysis"""
        base_stacks = {
            "web_app": ["React", "Node.js", "MongoDB", "Express"],
            "mobile_app": ["React Native", "Expo", "Firebase"],
            "api": ["FastAPI", "PostgreSQL", "Redis"],
            "ai_ml": ["Python", "TensorFlow", "Docker", "PostgreSQL"],
            "ecommerce": ["Next.js", "Stripe", "PostgreSQL", "Redis"],
            "saas": ["React", "FastAPI", "PostgreSQL", "Docker", "AWS"]
        }
        
        tech_stack = base_stacks.get(project_type, base_stacks["web_app"])
        
        # Add complexity-based enhancements
        has_high_complexity = any("high:" in signal for signal in complexity_signals)
        
        if has_high_complexity:
            tech_stack.extend(["Docker", "Kubernetes", "Redis", "Nginx"])
            
        return tech_stack
    
    def _calculate_complexity(self, complexity_signals: List[str]) -> str:
        """Calculate overall complexity based on signals"""
        high_signals = len([s for s in complexity_signals if s.startswith("high:")])
        medium_signals = len([s for s in complexity_signals if s.startswith("medium:")])
        
        if high_signals >= 3:
            return "enterprise"
        elif high_signals >= 1 or medium_signals >= 4:
            return "high"
        elif medium_signals >= 2:
            return "medium"
        else:
            return "low"
    
    async def generate_task_breakdown(self, analysis: Dict, complexity: str) -> List[TaskBreakdown]:
        """Generate detailed task breakdown based on project analysis"""
        
        base_config = self.complexity_mappings[complexity]
        tasks = []
        
        # Phase 1: Foundation & Setup
        foundation_tasks = [
            TaskBreakdown(
                id=str(uuid.uuid4()),
                title="Project Setup & Configuration",
                description="Initialize project structure, setup development environment, configure tooling",
                estimated_hours=8,
                priority="high",
                dependencies=[],
                phase="foundation",
                skills_required=["DevOps", "Configuration"],
                acceptance_criteria=[
                    "Project structure created",
                    "Development environment configured",
                    "Version control setup"
                ]
            ),
            TaskBreakdown(
                id=str(uuid.uuid4()),
                title="Database Design & Schema",
                description="Design database schema, create migrations, setup database connections",
                estimated_hours=12,
                priority="high",
                dependencies=[],
                phase="foundation",
                skills_required=["Database Design", "Backend"],
                acceptance_criteria=[
                    "Database schema designed",
                    "Migrations created",
                    "Database connections tested"
                ]
            )
        ]
        
        # Phase 2: Core Development
        core_tasks = self._generate_core_tasks(analysis)
        
        # Phase 3: Advanced Features
        advanced_tasks = self._generate_advanced_tasks(analysis, complexity)
        
        # Phase 4: Testing & Deployment
        testing_tasks = [
            TaskBreakdown(
                id=str(uuid.uuid4()),
                title="Comprehensive Testing Suite",
                description="Create unit tests, integration tests, and end-to-end tests",
                estimated_hours=20,
                priority="medium",
                dependencies=[],
                phase="testing",
                skills_required=["Testing", "QA"],
                acceptance_criteria=[
                    "Unit tests coverage > 80%",
                    "Integration tests created",
                    "E2E tests implemented"
                ]
            ),
            TaskBreakdown(
                id=str(uuid.uuid4()),
                title="Production Deployment",
                description="Configure production environment, setup CI/CD, deploy application",
                estimated_hours=16,
                priority="high",
                dependencies=[],
                phase="deployment",
                skills_required=["DevOps", "Deployment"],
                acceptance_criteria=[
                    "Production environment configured",
                    "CI/CD pipeline setup",
                    "Application successfully deployed"
                ]
            )
        ]
        
        tasks.extend(foundation_tasks)
        tasks.extend(core_tasks)
        tasks.extend(advanced_tasks)
        tasks.extend(testing_tasks)
        
        return tasks
    
    def _generate_core_tasks(self, analysis: Dict) -> List[TaskBreakdown]:
        """Generate core development tasks based on project analysis"""
        tasks = []
        requirements = analysis.get("requirements", [])
        
        if "user_auth" in requirements:
            tasks.append(TaskBreakdown(
                id=str(uuid.uuid4()),
                title="User Authentication System",
                description="Implement user registration, login, session management",
                estimated_hours=24,
                priority="high",
                dependencies=[],
                phase="core",
                skills_required=["Backend", "Security"],
                acceptance_criteria=[
                    "User registration implemented",
                    "Login/logout functionality",
                    "Session management working",
                    "Password security enforced"
                ]
            ))
        
        if "api" in requirements:
            tasks.append(TaskBreakdown(
                id=str(uuid.uuid4()),
                title="API Development",
                description="Create RESTful API endpoints with proper validation and error handling",
                estimated_hours=32,
                priority="high",
                dependencies=[],
                phase="core",
                skills_required=["Backend", "API Design"],
                acceptance_criteria=[
                    "API endpoints created",
                    "Request validation implemented",
                    "Error handling configured",
                    "API documentation created"
                ]
            ))
            
        # Add more core tasks based on requirements
        return tasks
    
    def _generate_advanced_tasks(self, analysis: Dict, complexity: str) -> List[TaskBreakdown]:
        """Generate advanced feature tasks based on complexity"""
        tasks = []
        
        if complexity in ["high", "enterprise"]:
            tasks.append(TaskBreakdown(
                id=str(uuid.uuid4()),
                title="Performance Optimization",
                description="Implement caching, optimize queries, setup monitoring",
                estimated_hours=28,
                priority="medium",
                dependencies=[],
                phase="advanced",
                skills_required=["Performance", "Backend"],
                acceptance_criteria=[
                    "Caching layer implemented",
                    "Database queries optimized",
                    "Performance monitoring setup"
                ]
            ))
            
        if complexity == "enterprise":
            tasks.append(TaskBreakdown(
                id=str(uuid.uuid4()),
                title="Scalability Architecture",
                description="Implement microservices, load balancing, horizontal scaling",
                estimated_hours=48,
                priority="medium",
                dependencies=[],
                phase="advanced",
                skills_required=["Architecture", "DevOps"],
                acceptance_criteria=[
                    "Microservices architecture implemented",
                    "Load balancing configured",
                    "Horizontal scaling enabled"
                ]
            ))
            
        return tasks

# Initialize the planning engine
planning_engine = NaturalLanguagePlanningEngine()

@router.post("/generate-plan", response_model=ProjectPlan)
async def generate_project_plan(request: ProjectPlanRequest):
    """Generate a comprehensive project plan from natural language description"""
    try:
        logger.info(f"Generating project plan for: {request.description[:100]}...")
        
        # Analyze the project description
        analysis = await planning_engine.analyze_project_description(request.description)
        
        # Determine complexity
        complexity = request.complexity or analysis["estimated_complexity"]
        
        # Generate task breakdown
        tasks = await planning_engine.generate_task_breakdown(analysis, complexity)
        
        # Calculate total hours
        total_hours = sum(task.estimated_hours for task in tasks)
        
        # Generate phases
        phases = [
            {
                "name": "Foundation",
                "description": "Project setup and core architecture",
                "duration_hours": sum(t.estimated_hours for t in tasks if t.phase == "foundation"),
                "tasks": len([t for t in tasks if t.phase == "foundation"])
            },
            {
                "name": "Core Development", 
                "description": "Main feature development",
                "duration_hours": sum(t.estimated_hours for t in tasks if t.phase == "core"),
                "tasks": len([t for t in tasks if t.phase == "core"])
            },
            {
                "name": "Advanced Features",
                "description": "Enhanced functionality and optimization",
                "duration_hours": sum(t.estimated_hours for t in tasks if t.phase == "advanced"), 
                "tasks": len([t for t in tasks if t.phase == "advanced"])
            },
            {
                "name": "Testing & Deployment",
                "description": "Quality assurance and production deployment",
                "duration_hours": sum(t.estimated_hours for t in tasks if t.phase in ["testing", "deployment"]),
                "tasks": len([t for t in tasks if t.phase in ["testing", "deployment"]])
            }
        ]
        
        # Generate milestones
        milestones = [
            {
                "name": "MVP Complete",
                "description": "Core functionality working",
                "target_date": (datetime.now() + timedelta(weeks=4)).isoformat(),
                "deliverables": ["Basic features", "User authentication", "Core API"]
            },
            {
                "name": "Beta Release",
                "description": "Feature-complete version for testing",
                "target_date": (datetime.now() + timedelta(weeks=8)).isoformat(),
                "deliverables": ["All features", "Testing complete", "Performance optimized"]
            },
            {
                "name": "Production Launch",
                "description": "Live production deployment",
                "target_date": (datetime.now() + timedelta(weeks=12)).isoformat(),
                "deliverables": ["Production deployment", "Monitoring", "Documentation"]
            }
        ]
        
        # Risk assessment
        risk_assessment = [
            "Third-party API dependencies may cause delays",
            "Complex requirements may require additional development time",
            "Performance optimization may need additional iterations",
            "User feedback may require feature adjustments"
        ]
        
        # Create project plan
        plan = ProjectPlan(
            id=str(uuid.uuid4()),
            project_title=analysis["project_type"].replace("_", " ").title() + " Development Project",
            overview=f"Comprehensive development plan for {request.description[:200]}...",
            total_estimated_hours=total_hours,
            phases=phases,
            tasks=tasks,
            milestones=milestones,
            risk_assessment=risk_assessment,
            tech_stack_recommendations=analysis["tech_stack"],
            architecture_suggestions=[
                "Use microservices for scalability",
                "Implement proper authentication and authorization",
                "Setup comprehensive monitoring and logging",
                "Use containerization for consistent deployment"
            ],
            deployment_strategy="Progressive deployment with staging environment",
            created_at=datetime.now()
        )
        
        logger.info(f"Successfully generated plan with {len(tasks)} tasks, {total_hours} hours")
        return plan
        
    except Exception as e:
        logger.error(f"Error generating project plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate project plan: {str(e)}")

@router.get("/complexity-analysis")
async def analyze_complexity(description: str):
    """Analyze project complexity from description"""
    try:
        analysis = await planning_engine.analyze_project_description(description)
        return {
            "complexity": analysis["estimated_complexity"],
            "project_type": analysis["project_type"],
            "requirements": analysis["requirements"],
            "complexity_signals": analysis["complexity_signals"],
            "recommended_tech_stack": analysis["tech_stack"]
        }
    except Exception as e:
        logger.error(f"Error analyzing complexity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine-plan/{plan_id}")
async def refine_project_plan(plan_id: str, feedback: str):
    """Refine an existing project plan based on user feedback"""
    try:
        # In a real implementation, you would fetch the existing plan
        # and modify it based on the feedback
        
        return {
            "message": "Plan refinement feature coming soon",
            "plan_id": plan_id,
            "feedback_received": feedback
        }
    except Exception as e:
        logger.error(f"Error refining plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))