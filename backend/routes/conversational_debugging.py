"""
Conversational Debugging & Replay - Addresses Gap #6
Natural language debugging, build replay, and test failure analysis
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
from datetime import datetime, timedelta
import uuid
import re

from routes.auth import get_current_user
from models.database import get_database
from services.ai_service_v3_enhanced import EnhancedAIServiceV3

router = APIRouter()

class DebugQuery(BaseModel):
    query: str
    project_id: str
    context: Optional[Dict[str, Any]] = None
    error_logs: Optional[List[str]] = None
    code_snippet: Optional[str] = None

class BuildReplayRequest(BaseModel):
    build_id: str
    action: str  # replay, analyze, fix
    target_step: Optional[int] = None

class TestFailureAnalysis(BaseModel):
    test_name: str
    error_message: str
    stack_trace: Optional[str] = None
    test_code: Optional[str] = None
    related_files: Optional[List[str]] = None

class DebuggingSession(BaseModel):
    session_id: str
    project_id: str
    issue_description: str
    conversation_history: List[Dict[str, Any]]
    resolution_steps: List[str]
    status: str  # active, resolved, escalated
    created_at: datetime

class ConversationalDebugger:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
    
    async def start_debug_conversation(self, user_id: str, query: DebugQuery) -> Dict[str, Any]:
        """Start a conversational debugging session"""
        try:
            db = await get_database()
            
            session_id = f"debug_{uuid.uuid4().hex[:12]}"
            
            # Gather context from project
            project_context = await self._gather_project_context(user_id, query.project_id)
            
            # Analyze the initial query and error
            analysis_prompt = f"""
            You are an expert debugging assistant. A developer is experiencing an issue and needs help.
            
            ISSUE: {query.query}
            PROJECT: {query.project_id}
            
            CONTEXT:
            {json.dumps(query.context or {}, indent=2)}
            
            ERROR LOGS:
            {chr(10).join(query.error_logs or [])}
            
            CODE SNIPPET:
            ```
            {query.code_snippet or "No code provided"}
            ```
            
            PROJECT CONTEXT:
            {json.dumps(project_context, indent=2)}
            
            Please provide:
            1. Initial diagnosis of the problem
            2. Likely root causes (ranked by probability)
            3. Information needed to debug further
            4. Immediate steps the developer can try
            5. Questions to ask for clarification
            
            Be conversational, helpful, and ask clarifying questions to narrow down the issue.
            Focus on actionable steps and clear explanations.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=analysis_prompt,
                session_id=session_id,
                user_id=user_id,
                agent_preference="Quinn",  # QA Engineer for debugging
                include_context=True
            )
            
            # Create debugging session
            debug_session = {
                "session_id": session_id,
                "user_id": user_id,
                "project_id": query.project_id,
                "issue_description": query.query,
                "conversation_history": [
                    {
                        "role": "user",
                        "content": query.query,
                        "timestamp": datetime.utcnow(),
                        "context": query.context,
                        "error_logs": query.error_logs,
                        "code_snippet": query.code_snippet
                    },
                    {
                        "role": "assistant",
                        "content": ai_response['content'],
                        "agent": ai_response.get('agent', 'Quinn'),
                        "timestamp": datetime.utcnow()
                    }
                ],
                "resolution_steps": [],
                "status": "active",
                "created_at": datetime.utcnow(),
                "last_updated": datetime.utcnow()
            }
            
            await db.debugging_sessions.insert_one(debug_session)
            
            return {
                "session_id": session_id,
                "initial_response": ai_response['content'],
                "agent": ai_response.get('agent', 'Quinn'),
                "status": "active"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Debug session creation failed: {str(e)}")
    
    async def continue_debug_conversation(self, user_id: str, session_id: str, message: str, additional_info: Optional[Dict] = None) -> Dict[str, Any]:
        """Continue debugging conversation with context"""
        try:
            db = await get_database()
            
            # Get existing session
            session = await db.debugging_sessions.find_one({
                "session_id": session_id,
                "user_id": user_id
            })
            
            if not session:
                raise HTTPException(status_code=404, detail="Debug session not found")
            
            # Build conversation context
            conversation_history = session.get("conversation_history", [])
            recent_context = conversation_history[-6:]  # Last 6 messages for context
            
            # Create contextual debugging prompt
            debug_prompt = f"""
            Continue this debugging conversation. Here's the context:
            
            ORIGINAL ISSUE: {session.get('issue_description', '')}
            PROJECT: {session.get('project_id', '')}
            
            RECENT CONVERSATION:
            {self._format_conversation_history(recent_context)}
            
            USER'S NEW MESSAGE: {message}
            
            ADDITIONAL INFO PROVIDED:
            {json.dumps(additional_info or {}, indent=2)}
            
            Based on the conversation so far and this new information:
            1. Address the user's latest question or information
            2. Provide specific debugging steps or solutions
            3. Ask follow-up questions if needed
            4. If you have enough info, provide a comprehensive solution
            5. Mention if you need to see specific files, logs, or code
            
            Be direct, helpful, and focus on solving the issue.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=debug_prompt,
                session_id=session_id,
                user_id=user_id,
                agent_preference="Quinn",
                include_context=True
            )
            
            # Add to conversation history
            user_message = {
                "role": "user",
                "content": message,
                "timestamp": datetime.utcnow(),
                "additional_info": additional_info
            }
            
            assistant_message = {
                "role": "assistant",
                "content": ai_response['content'],
                "agent": ai_response.get('agent', 'Quinn'),
                "timestamp": datetime.utcnow()
            }
            
            # Update session
            await db.debugging_sessions.update_one(
                {"session_id": session_id, "user_id": user_id},
                {
                    "$push": {
                        "conversation_history": {"$each": [user_message, assistant_message]}
                    },
                    "$set": {"last_updated": datetime.utcnow()}
                }
            )
            
            # Check if issue seems resolved
            if self._detect_resolution_in_response(ai_response['content']):
                await db.debugging_sessions.update_one(
                    {"session_id": session_id, "user_id": user_id},
                    {"$set": {"status": "likely_resolved"}}
                )
            
            return {
                "session_id": session_id,
                "response": ai_response['content'],
                "agent": ai_response.get('agent', 'Quinn'),
                "status": session.get("status", "active")
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Debug conversation failed: {str(e)}")
    
    async def analyze_test_failure(self, user_id: str, analysis_request: TestFailureAnalysis) -> Dict[str, Any]:
        """Analyze test failure with conversational explanation"""
        try:
            # Create detailed test failure analysis
            analysis_prompt = f"""
            Analyze this test failure and explain what went wrong in conversational terms:
            
            TEST NAME: {analysis_request.test_name}
            ERROR MESSAGE: {analysis_request.error_message}
            
            STACK TRACE:
            {analysis_request.stack_trace or "No stack trace provided"}
            
            TEST CODE:
            ```
            {analysis_request.test_code or "No test code provided"}
            ```
            
            RELATED FILES: {', '.join(analysis_request.related_files or [])}
            
            Please provide:
            1. What exactly failed and why?
            2. What was the test trying to do?
            3. What went wrong in simple terms?
            4. How to fix this specific failure
            5. How to prevent similar failures
            6. Suggested improvements to the test
            
            Explain like you're talking to a developer who needs to understand and fix this quickly.
            Be specific about the failure and provide actionable solutions.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=analysis_prompt,
                session_id=f"test_analysis_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Quinn",  # QA specialist
                include_context=False
            )
            
            # Store analysis for future reference
            db = await get_database()
            await db.test_failure_analyses.insert_one({
                "user_id": user_id,
                "test_name": analysis_request.test_name,
                "error_message": analysis_request.error_message,
                "analysis": ai_response['content'],
                "created_at": datetime.utcnow()
            })
            
            return {
                "test_name": analysis_request.test_name,
                "analysis": ai_response['content'],
                "agent": ai_response.get('agent', 'Quinn'),
                "recommendations": self._extract_recommendations(ai_response['content'])
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Test failure analysis failed: {str(e)}")
    
    async def replay_build(self, user_id: str, request: BuildReplayRequest) -> Dict[str, Any]:
        """Replay and analyze build steps"""
        try:
            db = await get_database()
            
            # Get build information
            build = await db.build_history.find_one({
                "build_id": request.build_id,
                "user_id": user_id
            })
            
            if not build:
                raise HTTPException(status_code=404, detail="Build not found")
            
            build_steps = build.get("steps", [])
            
            if request.action == "replay":
                return await self._replay_build_steps(build, request.target_step)
            elif request.action == "analyze":
                return await self._analyze_build_failure(user_id, build)
            elif request.action == "fix":
                return await self._suggest_build_fixes(user_id, build)
            else:
                raise HTTPException(status_code=400, detail="Invalid action")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Build replay failed: {str(e)}")
    
    async def ask_why_failed(self, user_id: str, failure_context: Dict[str, Any]) -> Dict[str, Any]:
        """Answer "Why did this fail?" questions conversationally"""
        try:
            why_prompt = f"""
            A developer is asking "Why did this fail?" about their issue.
            
            FAILURE CONTEXT:
            {json.dumps(failure_context, indent=2)}
            
            Analyze the failure and explain:
            1. What exactly failed?
            2. Why did it fail? (root cause analysis)
            3. What conditions led to this failure?
            4. What should have happened instead?
            5. How to prevent this in the future?
            
            Be like a helpful senior developer explaining the issue clearly and thoroughly.
            Focus on helping them understand the "why" behind the failure.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=why_prompt,
                session_id=f"why_failed_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Atlas",  # System architect for root cause analysis
                include_context=False
            )
            
            return {
                "explanation": ai_response['content'],
                "agent": ai_response.get('agent', 'Atlas'),
                "analysis_type": "root_cause_analysis"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failure analysis failed: {str(e)}")
    
    async def undo_last_deploy(self, user_id: str, project_id: str) -> Dict[str, Any]:
        """Provide guidance on undoing last deployment"""
        try:
            db = await get_database()
            
            # Get recent deployments
            deployments = await db.deployments.find({
                "user_id": user_id,
                "project_id": project_id
            }).sort("created_at", -1).limit(5).to_list(5)
            
            if not deployments:
                return {
                    "message": "No recent deployments found",
                    "instructions": "No deployments to undo"
                }
            
            latest_deployment = deployments[0]
            previous_deployment = deployments[1] if len(deployments) > 1 else None
            
            undo_prompt = f"""
            Provide step-by-step instructions to undo the last deployment:
            
            LATEST DEPLOYMENT:
            - Platform: {latest_deployment.get('platform', 'unknown')}
            - Deployment ID: {latest_deployment.get('deployment_id', '')}
            - Created: {latest_deployment.get('created_at', '')}
            - Status: {latest_deployment.get('status', '')}
            
            PREVIOUS DEPLOYMENT:
            {json.dumps(previous_deployment, indent=2, default=str) if previous_deployment else "None"}
            
            Provide:
            1. Platform-specific rollback commands
            2. Manual rollback steps if needed
            3. How to verify the rollback worked
            4. What to check after rolling back
            5. How to prevent similar issues
            
            Make the instructions clear and actionable for immediate use.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=undo_prompt,
                session_id=f"undo_deploy_{project_id}",
                user_id=user_id,
                agent_preference="Dev",  # Developer for deployment operations
                include_context=False
            )
            
            return {
                "latest_deployment": latest_deployment,
                "rollback_instructions": ai_response['content'],
                "agent": ai_response.get('agent', 'Dev')
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Undo deployment guidance failed: {str(e)}")
    
    async def _gather_project_context(self, user_id: str, project_id: str) -> Dict[str, Any]:
        """Gather relevant project context for debugging"""
        try:
            db = await get_database()
            
            # Get project info
            project = await db.projects.find_one({"project_id": project_id, "user_id": user_id})
            
            # Get recent errors
            recent_errors = await db.error_logs.find({
                "user_id": user_id,
                "project_id": project_id
            }).sort("created_at", -1).limit(10).to_list(10)
            
            # Get recent builds
            recent_builds = await db.build_history.find({
                "user_id": user_id,
                "project_id": project_id
            }).sort("created_at", -1).limit(3).to_list(3)
            
            return {
                "project": project,
                "recent_errors": recent_errors,
                "recent_builds": recent_builds,
                "tech_stack": project.get("tech_stack", []) if project else []
            }
        except:
            return {}
    
    def _format_conversation_history(self, history: List[Dict]) -> str:
        """Format conversation history for context"""
        formatted = []
        for msg in history:
            role = msg.get("role", "unknown")
            content = msg.get("content", "")[:300]  # Truncate long messages
            formatted.append(f"{role.upper()}: {content}")
        return "\n".join(formatted)
    
    def _detect_resolution_in_response(self, response: str) -> bool:
        """Detect if the response suggests the issue is resolved"""
        resolution_indicators = [
            "should fix the issue",
            "problem should be resolved",
            "that should work",
            "try this solution",
            "this should resolve",
            "issue is likely fixed"
        ]
        response_lower = response.lower()
        return any(indicator in response_lower for indicator in resolution_indicators)
    
    def _extract_recommendations(self, analysis: str) -> List[str]:
        """Extract actionable recommendations from analysis"""
        # Simple regex to find recommendations
        recommendations = []
        lines = analysis.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(starter in line.lower() for starter in ['recommend', 'suggest', 'should', 'try', 'fix']):
                if len(line) > 20:  # Skip very short lines
                    recommendations.append(line)
        
        return recommendations[:5]  # Return top 5 recommendations
    
    async def _replay_build_steps(self, build: Dict, target_step: Optional[int]) -> Dict[str, Any]:
        """Replay build steps up to target step"""
        steps = build.get("steps", [])
        target = target_step or len(steps)
        
        return {
            "build_id": build.get("build_id"),
            "total_steps": len(steps),
            "replayed_steps": min(target, len(steps)),
            "steps": steps[:target],
            "status": "replayed"
        }
    
    async def _analyze_build_failure(self, user_id: str, build: Dict) -> Dict[str, Any]:
        """Analyze why a build failed"""
        failed_steps = [step for step in build.get("steps", []) if step.get("status") == "failed"]
        
        analysis_prompt = f"""
        Analyze this build failure:
        
        BUILD ID: {build.get("build_id")}
        FAILED STEPS: {len(failed_steps)}
        
        FAILURE DETAILS:
        {json.dumps(failed_steps, indent=2)}
        
        Explain why the build failed and how to fix it.
        """
        
        ai_response = await self.ai_service.get_enhanced_response(
            message=analysis_prompt,
            session_id=f"build_analysis_{build.get('build_id')}",
            user_id=user_id,
            agent_preference="Dev",
            include_context=False
        )
        
        return {
            "build_id": build.get("build_id"),
            "analysis": ai_response['content'],
            "failed_steps": failed_steps
        }
    
    async def _suggest_build_fixes(self, user_id: str, build: Dict) -> Dict[str, Any]:
        """Suggest fixes for build failures"""
        # Similar to analyze but focused on solutions
        return await self._analyze_build_failure(user_id, build)

# Initialize conversational debugger
conversational_debugger = ConversationalDebugger()

@router.post("/debug/start")
async def start_debug_session(
    query: DebugQuery,
    current_user = Depends(get_current_user)
):
    """Start a conversational debugging session"""
    return await conversational_debugger.start_debug_conversation(str(current_user["_id"]), query)

@router.post("/debug/{session_id}/continue")
async def continue_debug_session(
    session_id: str,
    message: str,
    additional_info: Optional[Dict] = None,
    current_user = Depends(get_current_user)
):
    """Continue debugging conversation"""
    return await conversational_debugger.continue_debug_conversation(
        str(current_user["_id"]), session_id, message, additional_info
    )

@router.post("/debug/test-failure")
async def analyze_test_failure(
    analysis_request: TestFailureAnalysis,
    current_user = Depends(get_current_user)
):
    """Analyze test failure conversationally"""
    return await conversational_debugger.analyze_test_failure(str(current_user["_id"]), analysis_request)

@router.post("/debug/build-replay")
async def replay_build(
    request: BuildReplayRequest,
    current_user = Depends(get_current_user)
):
    """Replay and analyze build steps"""
    return await conversational_debugger.replay_build(str(current_user["_id"]), request)

@router.post("/debug/why-failed")
async def ask_why_failed(
    failure_context: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Ask why something failed"""
    return await conversational_debugger.ask_why_failed(str(current_user["_id"]), failure_context)

@router.post("/debug/projects/{project_id}/undo-deploy")
async def undo_last_deploy(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """Get instructions to undo last deployment"""
    return await conversational_debugger.undo_last_deploy(str(current_user["_id"]), project_id)

@router.get("/debug/sessions")
async def get_debug_sessions(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    current_user = Depends(get_current_user)
):
    """Get debugging sessions"""
    try:
        db = await get_database()
        
        criteria = {"user_id": str(current_user["_id"])}
        if project_id:
            criteria["project_id"] = project_id
        if status:
            criteria["status"] = status
        
        sessions = await db.debugging_sessions.find(
            criteria,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return {"sessions": sessions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get debug sessions: {str(e)}")

@router.get("/debug/sessions/{session_id}")
async def get_debug_session(
    session_id: str,
    current_user = Depends(get_current_user)
):
    """Get specific debugging session"""
    try:
        db = await get_database()
        
        session = await db.debugging_sessions.find_one({
            "session_id": session_id,
            "user_id": str(current_user["_id"])
        }, {"_id": 0})
        
        if not session:
            raise HTTPException(status_code=404, detail="Debug session not found")
        
        return session
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get debug session: {str(e)}")