"""
Competitive Features Integration Service
Seamlessly integrates all 5 new competitive features with existing multi-agent system
"""

from typing import Dict, Any, List, Optional
import json
from datetime import datetime
from services.groq_ai_service import GroqAIService
from routes.natural_language_planning import planning_service
from routes.persistent_memory import memory_service
from routes.git_cicd_enhanced import git_cicd_service
from routes.enhanced_templates_expanded import template_service
from routes.conversational_debugging_enhanced import debug_service

class CompetitiveFeaturesOrchestrator:
    """
    Orchestrates all competitive features to work seamlessly with existing multi-agent system
    """
    
    def __init__(self):
        self.ai_service = GroqAIService()
        self.features = {
            "natural_language_planning": planning_service,
            "persistent_memory": memory_service,
            "git_cicd_enhanced": git_cicd_service,
            "enhanced_templates": template_service,
            "conversational_debugging": debug_service
        }
    
    async def intelligent_feature_routing(self, user_request: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Intelligently route user requests to appropriate competitive features
        """
        
        routing_prompt = f"""
        Analyze this user request and determine which competitive features should be engaged:
        
        USER REQUEST: {user_request}
        CONTEXT: {json.dumps(context, indent=2)}
        
        Available competitive features:
        1. NATURAL_LANGUAGE_PLANNING - Convert project descriptions into detailed roadmaps
        2. PERSISTENT_MEMORY - Access project memory and context across sessions
        3. GIT_CICD_ENHANCED - GitHub repository management and deployment
        4. ENHANCED_TEMPLATES - 25+ professional templates with AI generation
        5. CONVERSATIONAL_DEBUGGING - Natural language error analysis and fixes
        
        Determine which features should be activated and in what order:
        
        Return JSON:
        {{
            "primary_feature": "feature_name",
            "secondary_features": ["feature1", "feature2"],
            "coordination_strategy": "sequential|parallel|hierarchical",
            "agent_handoffs": {{
                "Dev": ["coding", "debugging"],
                "Luna": ["ui_design", "templates"],
                "Atlas": ["architecture", "cicd"],
                "Quinn": ["testing", "debugging"],
                "Sage": ["planning", "memory"]
            }},
            "execution_plan": [
                "1. Feature action 1",
                "2. Feature action 2",
                "3. Agent coordination step"
            ]
        }}
        """
        
        try:
            routing_response = await self.ai_service.generate_response(
                routing_prompt,
                model="llama-3.1-70b-versatile",
                max_tokens=800,
                temperature=0.1
            )
            
            return json.loads(routing_response)
            
        except Exception as e:
            return {"error": f"Feature routing failed: {str(e)}"}
    
    async def enhanced_multi_agent_coordination(self, request: str, features_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinate multi-agent system with competitive features
        """
        
        coordination_prompt = f"""
        Coordinate the multi-agent system with competitive features for this request:
        
        REQUEST: {request}
        FEATURES_PLAN: {json.dumps(features_plan, indent=2)}
        
        Available agents:
        - Dev: Technical expert - coding, debugging, architecture
        - Luna: UX/UI designer - user experience, accessibility, templates
        - Atlas: System architect - scalability, performance, CI/CD
        - Quinn: QA tester - testing, quality assurance, debugging
        - Sage: Project manager - planning, coordination, memory management
        
        Create a coordination plan that:
        1. Assigns specific agents to competitive features
        2. Defines handoff points between agents and features
        3. Ensures seamless integration of all capabilities
        4. Provides clear execution sequence
        
        Return JSON with detailed coordination plan:
        {{
            "coordination_sequence": [
                {{
                    "step": 1,
                    "agent": "Sage",
                    "feature": "natural_language_planning",
                    "action": "Generate project roadmap",
                    "output": "Project plan with tasks and milestones"
                }},
                {{
                    "step": 2,
                    "agent": "Luna",
                    "feature": "enhanced_templates",
                    "action": "Select appropriate templates",
                    "input_from_step": 1
                }}
            ],
            "agent_specializations": {{
                "Dev": ["debugging", "code_analysis", "technical_implementation"],
                "Luna": ["template_selection", "ui_design", "user_experience"],
                "Atlas": ["architecture_planning", "cicd_setup", "deployment"],
                "Quinn": ["testing_strategy", "debugging_assistance", "quality_gates"],
                "Sage": ["project_planning", "memory_management", "coordination"]
            }},
            "feature_integrations": {{
                "memory_context": "How persistent memory enhances other features",
                "planning_templates": "How planning integrates with templates",
                "debugging_cicd": "How debugging works with CI/CD"
            }}
        }}
        """
        
        try:
            coordination_response = await self.ai_service.generate_response(
                coordination_prompt,
                model="llama-3.3-70b-versatile",
                max_tokens=1500,
                temperature=0.1
            )
            
            return json.loads(coordination_response)
            
        except Exception as e:
            return {"error": f"Multi-agent coordination failed: {str(e)}"}
    
    async def execute_competitive_workflow(self, user_request: str, user_id: str, project_id: str = None) -> Dict[str, Any]:
        """
        Execute complete competitive features workflow
        """
        
        workflow_results = {
            "request": user_request,
            "user_id": user_id,
            "project_id": project_id,
            "features_executed": [],
            "results": {},
            "execution_time": datetime.utcnow(),
            "status": "processing"
        }
        
        try:
            # Step 1: Analyze request and route to features
            context = {"user_id": user_id, "project_id": project_id}
            routing_plan = await self.intelligent_feature_routing(user_request, context)
            
            if "error" in routing_plan:
                workflow_results["status"] = "failed"
                workflow_results["error"] = routing_plan["error"]
                return workflow_results
            
            # Step 2: Coordinate multi-agent system
            coordination_plan = await self.enhanced_multi_agent_coordination(user_request, routing_plan)
            
            # Step 3: Execute features in coordinated sequence
            for step in coordination_plan.get("coordination_sequence", []):
                feature_name = step.get("feature")
                agent_name = step.get("agent")
                action = step.get("action")
                
                if feature_name in self.features:
                    # Execute specific feature action
                    feature_result = await self._execute_feature_action(
                        feature_name, action, user_request, user_id, project_id
                    )
                    
                    workflow_results["results"][f"{agent_name}_{feature_name}"] = feature_result
                    workflow_results["features_executed"].append(feature_name)
            
            workflow_results["status"] = "completed"
            workflow_results["coordination_plan"] = coordination_plan
            workflow_results["routing_plan"] = routing_plan
            
            return workflow_results
            
        except Exception as e:
            workflow_results["status"] = "failed"
            workflow_results["error"] = str(e)
            return workflow_results
    
    async def _execute_feature_action(self, feature_name: str, action: str, request: str, user_id: str, project_id: str) -> Dict[str, Any]:
        """
        Execute specific feature action
        """
        
        try:
            if feature_name == "natural_language_planning":
                # Execute planning feature
                from routes.natural_language_planning import ProjectPlanRequest
                plan_request = ProjectPlanRequest(description=request)
                result = await planning_service.generate_project_plan(plan_request)
                return {"type": "project_plan", "data": result.dict()}
            
            elif feature_name == "persistent_memory":
                # Execute memory feature
                from routes.persistent_memory import MemoryQuery
                query = MemoryQuery(query=request)
                result = await memory_service.retrieve_relevant_context(user_id, project_id or "default", query)
                return {"type": "memory_context", "data": [ctx.dict() for ctx in result]}
            
            elif feature_name == "enhanced_templates":
                # Execute template feature
                if "template" in request.lower() or "starter" in request.lower():
                    from routes.enhanced_templates_expanded import TemplateRequest
                    template_request = TemplateRequest(description=request)
                    result = await template_service.generate_custom_template(template_request)
                    return {"type": "custom_template", "data": result.dict()}
                else:
                    # Return available templates
                    return {"type": "template_library", "data": "Enhanced template library with 25+ templates available"}
            
            elif feature_name == "conversational_debugging":
                # Execute debugging feature
                from routes.conversational_debugging_enhanced import DebugQuery
                debug_query = DebugQuery(description=request)
                result = await debug_service.conversational_debug(debug_query)
                return {"type": "debug_solution", "data": result.dict()}
            
            elif feature_name == "git_cicd_enhanced":
                # Execute Git/CI-CD feature
                result = await git_cicd_service.analyze_project_structure("/tmp/project")
                return {"type": "cicd_analysis", "data": result}
            
            else:
                return {"type": "unknown_feature", "error": f"Unknown feature: {feature_name}"}
                
        except Exception as e:
            return {"type": "feature_error", "error": str(e)}
    
    async def get_features_status(self) -> Dict[str, Any]:
        """
        Get status of all competitive features
        """
        
        return {
            "features_available": list(self.features.keys()),
            "integration_status": "active",
            "multi_agent_coordination": "enabled",
            "ai_routing": "intelligent",
            "execution_modes": ["sequential", "parallel", "hierarchical"],
            "agents_enhanced": ["Dev", "Luna", "Atlas", "Quinn", "Sage"],
            "last_updated": datetime.utcnow()
        }

# Initialize global orchestrator
competitive_orchestrator = CompetitiveFeaturesOrchestrator()