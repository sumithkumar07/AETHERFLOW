"""
Intelligent Agent Coordinator - Enhanced Multi-Agent System
"""
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class AgentRole(Enum):
    DEVELOPER = "developer"
    DESIGNER = "designer" 
    TESTER = "tester"
    INTEGRATOR = "integrator"
    ANALYST = "analyst"
    COORDINATOR = "coordinator"

@dataclass
class AgentCapability:
    name: str
    confidence_level: float
    specializations: List[str]
    collaboration_strength: List[str]
    
@dataclass
class TaskRequirement:
    complexity: float
    required_skills: List[str]
    estimated_time: int
    priority: str
    collaborative: bool

class IntelligentAgentCoordinator:
    """Advanced multi-agent coordination system"""
    
    def __init__(self):
        self.agent_capabilities = self._initialize_agent_capabilities()
        self.active_collaborations = {}
        self.coordination_history = []
        self.performance_metrics = {}
        
    def _initialize_agent_capabilities(self) -> Dict[AgentRole, AgentCapability]:
        """Initialize comprehensive agent capability matrix"""
        return {
            AgentRole.DEVELOPER: AgentCapability(
                name="Senior Developer Agent",
                confidence_level=0.95,
                specializations=[
                    "full_stack_development", "code_architecture", "api_design",
                    "performance_optimization", "debugging", "code_review",
                    "modern_frameworks", "database_design", "security_implementation"
                ],
                collaboration_strength=[AgentRole.TESTER, AgentRole.DESIGNER, AgentRole.INTEGRATOR]
            ),
            AgentRole.DESIGNER: AgentCapability(
                name="UI/UX Design Agent", 
                confidence_level=0.92,
                specializations=[
                    "user_interface_design", "user_experience", "design_systems",
                    "accessibility", "responsive_design", "user_research",
                    "prototyping", "visual_hierarchy", "interaction_design"
                ],
                collaboration_strength=[AgentRole.DEVELOPER, AgentRole.TESTER, AgentRole.ANALYST]
            ),
            AgentRole.TESTER: AgentCapability(
                name="QA Engineering Agent",
                confidence_level=0.90,
                specializations=[
                    "test_strategy", "automated_testing", "quality_assurance",
                    "performance_testing", "security_testing", "accessibility_testing",
                    "test_automation", "bug_analysis", "continuous_integration"
                ],
                collaboration_strength=[AgentRole.DEVELOPER, AgentRole.INTEGRATOR, AgentRole.ANALYST]
            ),
            AgentRole.INTEGRATOR: AgentCapability(
                name="Integration Specialist Agent",
                confidence_level=0.88,
                specializations=[
                    "system_integration", "api_integration", "third_party_services",
                    "data_architecture", "microservices", "cloud_integration",
                    "devops_pipelines", "authentication_systems", "data_migration"
                ],
                collaboration_strength=[AgentRole.DEVELOPER, AgentRole.TESTER, AgentRole.ANALYST]
            ),
            AgentRole.ANALYST: AgentCapability(
                name="Business Analysis Agent",
                confidence_level=0.85,
                specializations=[
                    "requirements_analysis", "business_logic", "data_analysis", 
                    "process_optimization", "user_stories", "acceptance_criteria",
                    "roi_analysis", "project_planning", "stakeholder_management"
                ],
                collaboration_strength=[AgentRole.DESIGNER, AgentRole.INTEGRATOR, AgentRole.DEVELOPER]
            )
        }
    
    async def analyze_task_requirements(self, message: str, context: Dict = None) -> TaskRequirement:
        """Analyze task to determine requirements and optimal agent allocation"""
        
        # Complexity analysis
        complexity_indicators = {
            "simple": ["hello", "hi", "what", "how", "explain", "define"],
            "medium": ["implement", "create", "build", "design", "develop", "integrate"],  
            "complex": ["architecture", "optimize", "refactor", "migrate", "scale", "enterprise"]
        }
        
        message_lower = message.lower()
        
        # Determine complexity
        complexity = 0.3  # Default
        for level, indicators in complexity_indicators.items():
            if any(indicator in message_lower for indicator in indicators):
                if level == "simple":
                    complexity = 0.2
                elif level == "medium":
                    complexity = 0.6
                elif level == "complex":
                    complexity = 0.9
                break
        
        # Extract required skills
        skill_keywords = {
            "full_stack_development": ["fullstack", "full stack", "full-stack", "end to end"],
            "code_architecture": ["architecture", "design pattern", "structure", "organize"],
            "api_design": ["api", "rest", "graphql", "endpoint", "service"],
            "user_interface_design": ["ui", "interface", "frontend", "user interface"],
            "user_experience": ["ux", "user experience", "usability", "user journey"],
            "test_strategy": ["test", "testing", "qa", "quality", "coverage"],
            "system_integration": ["integration", "connect", "third party", "external"],
            "requirements_analysis": ["requirements", "analysis", "business logic", "specs"]
        }
        
        required_skills = []
        for skill, keywords in skill_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                required_skills.append(skill)
        
        # Determine if collaborative effort needed
        collaborative_indicators = ["complete", "comprehensive", "full", "end-to-end", "complex"]
        collaborative = any(indicator in message_lower for indicator in collaborative_indicators) or complexity > 0.7
        
        # Estimate time based on complexity and scope
        word_count = len(message.split())
        if complexity > 0.8:
            estimated_time = 60 + (word_count * 2)  # Complex tasks take longer
        elif complexity > 0.5:
            estimated_time = 30 + word_count
        else:
            estimated_time = 15 + (word_count // 2)
        
        # Determine priority
        priority_keywords = {
            "urgent": ["urgent", "asap", "immediately", "critical", "emergency"],
            "high": ["important", "priority", "soon", "quick"],
            "low": ["later", "eventually", "when possible", "low priority"]
        }
        
        priority = "medium"  # Default
        for level, keywords in priority_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                priority = level
                break
        
        return TaskRequirement(
            complexity=complexity,
            required_skills=required_skills,
            estimated_time=min(120, estimated_time),  # Cap at 2 hours
            priority=priority,
            collaborative=collaborative
        )
    
    async def recommend_optimal_agent(self, task_req: TaskRequirement, context: Dict = None) -> Dict[str, Any]:
        """Recommend the optimal agent(s) for a given task"""
        
        agent_scores = {}
        
        # Score each agent based on task requirements
        for role, capability in self.agent_capabilities.items():
            score = 0.0
            
            # Base confidence score
            score += capability.confidence_level * 0.3
            
            # Specialization match score
            matching_specializations = [
                spec for spec in capability.specializations 
                if any(req_skill in spec for req_skill in task_req.required_skills)
            ]
            specialization_score = len(matching_specializations) / len(capability.specializations) if capability.specializations else 0
            score += specialization_score * 0.5
            
            # Complexity appropriateness
            if task_req.complexity > 0.8 and role in [AgentRole.DEVELOPER, AgentRole.INTEGRATOR]:
                score += 0.2
            elif task_req.complexity < 0.4 and role in [AgentRole.DESIGNER, AgentRole.ANALYST]:
                score += 0.15
            
            # Priority handling
            if task_req.priority == "urgent" and role == AgentRole.DEVELOPER:
                score += 0.1
            
            agent_scores[role] = score
        
        # Sort agents by score
        sorted_agents = sorted(agent_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Determine if collaboration is recommended
        if task_req.collaborative or task_req.complexity > 0.7:
            # Recommend multi-agent collaboration
            primary_agent = sorted_agents[0][0]
            collaborating_agents = []
            
            # Find best collaborators
            primary_capability = self.agent_capabilities[primary_agent]
            for collab_role in primary_capability.collaboration_strength[:2]:  # Top 2 collaborators
                if collab_role != primary_agent:
                    collaborating_agents.append(collab_role)
            
            return {
                "recommendation_type": "collaboration",
                "primary_agent": primary_agent.value,
                "collaborating_agents": [agent.value for agent in collaborating_agents],
                "confidence": sorted_agents[0][1],
                "reasoning": f"Complex task requiring {primary_agent.value} expertise with support from {', '.join([a.value for a in collaborating_agents])}",
                "estimated_agents": len(collaborating_agents) + 1,
                "coordination_needed": True
            }
        else:
            # Single agent recommendation
            best_agent = sorted_agents[0][0]
            return {
                "recommendation_type": "single_agent",
                "primary_agent": best_agent.value,
                "confidence": sorted_agents[0][1],
                "reasoning": f"Task well-suited for {best_agent.value} specialization",
                "estimated_agents": 1,
                "coordination_needed": False,
                "alternatives": [agent[0].value for agent in sorted_agents[1:3]]  # Top alternatives
            }
    
    async def coordinate_multi_agent_workflow(
        self, 
        task_req: TaskRequirement,
        agents: List[str],
        message: str,
        context: Dict = None
    ) -> Dict[str, Any]:
        """Coordinate workflow between multiple agents"""
        
        workflow_id = f"workflow_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{hash(message) % 10000}"
        
        # Create coordination plan
        coordination_plan = {
            "workflow_id": workflow_id,
            "task_breakdown": await self._break_down_task(message, task_req, agents),
            "agent_assignments": await self._assign_agent_responsibilities(agents, task_req),
            "execution_order": await self._determine_execution_order(agents, task_req),
            "collaboration_points": await self._identify_collaboration_points(agents, task_req),
            "success_metrics": self._define_success_metrics(task_req)
        }
        
        # Store active collaboration
        self.active_collaborations[workflow_id] = {
            "plan": coordination_plan,
            "started_at": datetime.utcnow(),
            "status": "active",
            "progress": 0.0,
            "agents_involved": agents,
            "current_phase": "planning"
        }
        
        return coordination_plan
    
    async def _break_down_task(self, message: str, task_req: TaskRequirement, agents: List[str]) -> List[Dict]:
        """Break down complex task into manageable subtasks"""
        
        subtasks = []
        
        # Analysis phase (if analyst is involved)
        if "analyst" in agents:
            subtasks.append({
                "phase": "analysis",
                "agent": "analyst", 
                "task": "Analyze requirements and create detailed specifications",
                "estimated_time": task_req.estimated_time * 0.2,
                "dependencies": [],
                "deliverables": ["requirements_doc", "user_stories", "acceptance_criteria"]
            })
        
        # Design phase (if designer is involved)
        if "designer" in agents:
            subtasks.append({
                "phase": "design",
                "agent": "designer",
                "task": "Create UI/UX design and user interface specifications", 
                "estimated_time": task_req.estimated_time * 0.3,
                "dependencies": ["analysis"] if "analyst" in agents else [],
                "deliverables": ["mockups", "design_system", "user_flows"]
            })
        
        # Development phase (developer always involved)
        subtasks.append({
            "phase": "development", 
            "agent": "developer",
            "task": "Implement core functionality and features",
            "estimated_time": task_req.estimated_time * 0.4,
            "dependencies": ["design"] if "designer" in agents else ["analysis"] if "analyst" in agents else [],
            "deliverables": ["code_implementation", "documentation", "api_endpoints"]
        })
        
        # Integration phase (if integrator is involved)
        if "integrator" in agents:
            subtasks.append({
                "phase": "integration",
                "agent": "integrator", 
                "task": "Integrate with external services and systems",
                "estimated_time": task_req.estimated_time * 0.2,
                "dependencies": ["development"],
                "deliverables": ["integration_code", "api_connections", "data_flows"]
            })
        
        # Testing phase (if tester is involved)
        if "tester" in agents:
            subtasks.append({
                "phase": "testing",
                "agent": "tester",
                "task": "Create comprehensive test suite and quality assurance",
                "estimated_time": task_req.estimated_time * 0.3,
                "dependencies": ["development", "integration"] if "integrator" in agents else ["development"],
                "deliverables": ["test_suite", "qa_report", "performance_metrics"]
            })
        
        return subtasks
    
    async def _assign_agent_responsibilities(self, agents: List[str], task_req: TaskRequirement) -> Dict[str, List[str]]:
        """Assign specific responsibilities to each agent"""
        
        responsibilities = {}
        
        for agent in agents:
            if agent == "developer":
                responsibilities[agent] = [
                    "Core functionality implementation",
                    "Code architecture and structure", 
                    "Performance optimization",
                    "Security implementation",
                    "API development"
                ]
            elif agent == "designer":
                responsibilities[agent] = [
                    "User interface design",
                    "User experience optimization",
                    "Design system creation",
                    "Accessibility compliance",
                    "Responsive design implementation"
                ]
            elif agent == "tester":
                responsibilities[agent] = [
                    "Test strategy development",
                    "Automated test creation",
                    "Quality assurance validation",
                    "Performance testing",
                    "Bug detection and reporting"
                ]
            elif agent == "integrator":
                responsibilities[agent] = [
                    "Third-party service integration", 
                    "API connection management",
                    "Data architecture design",
                    "System communication setup",
                    "Integration testing"
                ]
            elif agent == "analyst":
                responsibilities[agent] = [
                    "Requirements analysis",
                    "Business logic definition",
                    "User story creation", 
                    "Acceptance criteria definition",
                    "Process optimization recommendations"
                ]
        
        return responsibilities
    
    async def _determine_execution_order(self, agents: List[str], task_req: TaskRequirement) -> List[Dict]:
        """Determine optimal execution order for multi-agent workflow"""
        
        # Standard execution order based on software development lifecycle
        execution_phases = []
        
        if "analyst" in agents:
            execution_phases.append({
                "phase": 1,
                "agents": ["analyst"],
                "description": "Requirements analysis and planning",
                "can_parallel": False
            })
        
        if "designer" in agents:
            execution_phases.append({
                "phase": 2,
                "agents": ["designer"],
                "description": "UI/UX design and prototyping", 
                "can_parallel": False
            })
        
        # Core development can happen with some parallel activities
        parallel_agents = ["developer"]
        if "integrator" in agents and task_req.complexity > 0.6:
            parallel_agents.append("integrator")
        
        execution_phases.append({
            "phase": 3,
            "agents": parallel_agents,
            "description": "Core development and integration",
            "can_parallel": True
        })
        
        if "tester" in agents:
            execution_phases.append({
                "phase": 4,
                "agents": ["tester"],
                "description": "Testing and quality assurance",
                "can_parallel": False
            })
        
        return execution_phases
    
    async def _identify_collaboration_points(self, agents: List[str], task_req: TaskRequirement) -> List[Dict]:
        """Identify key points where agents need to collaborate"""
        
        collaboration_points = []
        
        # Design-Development handoff
        if "designer" in agents and "developer" in agents:
            collaboration_points.append({
                "type": "handoff",
                "participants": ["designer", "developer"],
                "trigger": "design_completion",
                "description": "Review design specifications and implementation feasibility",
                "estimated_duration": 15
            })
        
        # Development-Integration collaboration
        if "developer" in agents and "integrator" in agents:
            collaboration_points.append({
                "type": "collaboration",
                "participants": ["developer", "integrator"],
                "trigger": "api_definition",
                "description": "Define API contracts and integration requirements", 
                "estimated_duration": 20
            })
        
        # Development-Testing handoff
        if "developer" in agents and "tester" in agents:
            collaboration_points.append({
                "type": "handoff",
                "participants": ["developer", "tester"], 
                "trigger": "development_completion",
                "description": "Code review and testing requirements discussion",
                "estimated_duration": 25
            })
        
        # Cross-functional reviews
        if len(agents) > 2:
            collaboration_points.append({
                "type": "review",
                "participants": agents,
                "trigger": "milestone_completion",
                "description": "Cross-functional review and feedback session",
                "estimated_duration": 30
            })
        
        return collaboration_points
    
    def _define_success_metrics(self, task_req: TaskRequirement) -> Dict[str, Any]:
        """Define success metrics for the multi-agent workflow"""
        
        base_metrics = {
            "completion_rate": {"target": 100, "unit": "percentage"},
            "quality_score": {"target": 85, "unit": "percentage"},
            "time_efficiency": {"target": task_req.estimated_time, "unit": "minutes"},
            "collaboration_effectiveness": {"target": 80, "unit": "percentage"}
        }
        
        # Add complexity-specific metrics
        if task_req.complexity > 0.7:
            base_metrics["architectural_quality"] = {"target": 90, "unit": "percentage"}
            base_metrics["scalability_score"] = {"target": 85, "unit": "percentage"}
        
        # Add priority-specific metrics
        if task_req.priority == "urgent":
            base_metrics["response_time"] = {"target": task_req.estimated_time * 0.8, "unit": "minutes"}
        
        return base_metrics
    
    async def get_coordination_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get status of active coordination workflow"""
        
        if workflow_id not in self.active_collaborations:
            return {"error": "Workflow not found"}
        
        collaboration = self.active_collaborations[workflow_id]
        
        # Calculate progress based on completed phases
        total_phases = len(collaboration["plan"]["task_breakdown"])
        completed_phases = sum(1 for task in collaboration["plan"]["task_breakdown"] if task.get("status") == "completed")
        progress = (completed_phases / total_phases) * 100 if total_phases > 0 else 0
        
        collaboration["progress"] = progress
        
        return {
            "workflow_id": workflow_id,
            "status": collaboration["status"],
            "progress": f"{progress:.1f}%",
            "current_phase": collaboration["current_phase"],
            "agents_involved": collaboration["agents_involved"],
            "elapsed_time": (datetime.utcnow() - collaboration["started_at"]).total_seconds() / 60,
            "estimated_completion": self._estimate_completion_time(collaboration),
            "next_actions": self._get_next_actions(collaboration)
        }
    
    def _estimate_completion_time(self, collaboration: Dict) -> int:
        """Estimate time to completion for workflow"""
        plan = collaboration["plan"]
        remaining_tasks = [task for task in plan["task_breakdown"] if task.get("status") != "completed"]
        return sum(task["estimated_time"] for task in remaining_tasks)
    
    def _get_next_actions(self, collaboration: Dict) -> List[str]:
        """Get next recommended actions for workflow"""
        plan = collaboration["plan"] 
        
        # Find next pending task
        for task in plan["task_breakdown"]:
            if task.get("status") != "completed":
                return [
                    f"Begin {task['phase']} phase with {task['agent']} agent",
                    f"Focus on: {task['task']}", 
                    f"Expected deliverables: {', '.join(task['deliverables'])}"
                ]
        
        return ["Workflow completion - review final deliverables"]