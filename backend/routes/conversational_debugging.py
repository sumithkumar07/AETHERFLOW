from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import traceback
from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

class DebugSession(BaseModel):
    id: str
    title: str
    description: str
    error_type: str
    stack_trace: Optional[str]
    context: Dict[str, Any]
    status: str = "active"  # active, resolved, paused
    created_at: datetime
    resolved_at: Optional[datetime]
    user_id: str

class DebugStep(BaseModel):
    id: str
    session_id: str
    step_number: int
    action: str  # analyze, test, fix, verify
    description: str
    code_changes: Optional[str]
    result: Dict[str, Any]
    ai_agent: str
    timestamp: datetime

class TestRun(BaseModel):
    id: str
    session_id: str
    test_type: str  # unit, integration, e2e, manual
    test_results: Dict[str, Any]
    passed: bool
    execution_time: float
    artifacts: List[str]  # logs, screenshots, reports
    timestamp: datetime

class ConversationalDebugger:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
        
    async def start_debug_session(self, error_description: str, context: Dict[str, Any], user_id: str) -> DebugSession:
        """Start a new conversational debugging session"""
        try:
            session_id = str(uuid.uuid4())
            
            # Analyze the error with AI
            analysis_prompt = f"""
            As an expert debugging assistant, analyze this error:
            
            **Error Description**: {error_description}
            **Context**: {json.dumps(context, indent=2)}
            
            Provide:
            1. Error classification and severity
            2. Likely root causes
            3. Step-by-step debugging strategy
            4. Initial hypothesis
            5. Recommended investigation steps
            
            Be specific and actionable.
            """
            
            initial_analysis = await self.ai_service.process_enhanced_chat(
                message=analysis_prompt,
                conversation_id=f"debug_{session_id}",
                user_id=user_id,
                agent_coordination="collaborative"
            )
            
            # Create debug session
            session = DebugSession(
                id=session_id,
                title=self._generate_session_title(error_description),
                description=error_description,
                error_type=self._classify_error_type(error_description, context),
                stack_trace=context.get("stack_trace"),
                context=context,
                created_at=datetime.utcnow(),
                user_id=user_id
            )
            
            # Store in database
            db = await get_database()
            await db.debug_sessions.insert_one({
                **session.dict(),
                "initial_analysis": initial_analysis
            })
            
            # Create first debug step
            await self._create_debug_step(
                session_id=session_id,
                action="analyze",
                description="Initial error analysis completed",
                result=initial_analysis,
                ai_agent="Quinn",  # QA specialist for debugging
                user_id=user_id
            )
            
            return session
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Debug session creation failed: {str(e)}")
    
    async def continue_debug_conversation(self, session_id: str, user_message: str, user_id: str) -> Dict[str, Any]:
        """Continue debugging conversation with AI assistance"""
        try:
            # Get session context
            db = await get_database()
            session = await db.debug_sessions.find_one({"id": session_id, "user_id": user_id})
            
            if not session:
                raise HTTPException(status_code=404, detail="Debug session not found")
            
            # Get previous debug steps for context
            steps = await db.debug_steps.find(
                {"session_id": session_id}
            ).sort("step_number", 1).to_list(length=20)
            
            # Build conversation context
            debug_context = {
                "session": session,
                "previous_steps": steps[-5:],  # Last 5 steps
                "current_message": user_message
            }
            
            # Generate intelligent debugging response
            debug_prompt = f"""
            Continue debugging session for: {session['title']}
            
            **Previous Context**: {json.dumps(debug_context, indent=2, default=str)}
            **User Message**: {user_message}
            
            As an expert debugger, provide:
            1. Analysis of the user's input
            2. Next debugging steps
            3. Specific code to test or modify
            4. Expected outcomes
            5. Alternative approaches if current path fails
            
            Be conversational but precise.
            """
            
            ai_response = await self.ai_service.process_enhanced_chat(
                message=debug_prompt,
                conversation_id=f"debug_{session_id}",
                user_id=user_id,
                agent_coordination="single"
            )
            
            # Determine next action based on conversation
            next_action = self._determine_debug_action(user_message, ai_response)
            
            # Create debug step
            step_number = len(steps) + 1
            await self._create_debug_step(
                session_id=session_id,
                action=next_action,
                description=f"User: {user_message[:100]}...",
                result=ai_response,
                ai_agent="Quinn",
                user_id=user_id,
                step_number=step_number
            )
            
            return {
                "session_id": session_id,
                "ai_response": ai_response,
                "suggested_action": next_action,
                "step_number": step_number,
                "conversation_continues": True
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Debug conversation failed: {str(e)}")
    
    async def run_debug_test(self, session_id: str, test_config: Dict[str, Any], user_id: str) -> TestRun:
        """Run a test as part of debugging process"""
        try:
            db = await get_database()
            session = await db.debug_sessions.find_one({"id": session_id, "user_id": user_id})
            
            if not session:
                raise HTTPException(status_code=404, detail="Debug session not found")
            
            test_id = str(uuid.uuid4())
            
            # Generate test based on context
            test_results = await self._execute_debug_test(test_config, session)
            
            test_run = TestRun(
                id=test_id,
                session_id=session_id,
                test_type=test_config.get("type", "manual"),
                test_results=test_results,
                passed=test_results.get("success", False),
                execution_time=test_results.get("execution_time", 0.0),
                artifacts=test_results.get("artifacts", []),
                timestamp=datetime.utcnow()
            )
            
            # Store test run
            await db.debug_test_runs.insert_one(test_run.dict())
            
            # Create debug step for test
            await self._create_debug_step(
                session_id=session_id,
                action="test",
                description=f"Executed {test_config.get('type', 'manual')} test",
                result=test_results,
                ai_agent="Quinn",
                user_id=user_id
            )
            
            return test_run
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Debug test failed: {str(e)}")
    
    async def suggest_fix(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Generate AI-powered fix suggestions"""
        try:
            db = await get_database()
            session = await db.debug_sessions.find_one({"id": session_id, "user_id": user_id})
            
            if not session:
                raise HTTPException(status_code=404, detail="Debug session not found")
            
            # Get all debug steps and test results
            steps = await db.debug_steps.find({"session_id": session_id}).to_list(length=50)
            test_runs = await db.debug_test_runs.find({"session_id": session_id}).to_list(length=20)
            
            # Generate comprehensive fix suggestion
            fix_prompt = f"""
            Based on the debugging session analysis, provide specific fix recommendations:
            
            **Original Error**: {session['description']}
            **Error Type**: {session['error_type']}
            **Debug Steps Taken**: {len(steps)} steps completed
            **Test Results**: {len([t for t in test_runs if t['passed']])} passed, {len([t for t in test_runs if not t['passed']])} failed
            
            **Recent Context**: {json.dumps(steps[-3:], indent=2, default=str)}
            
            Provide:
            1. Root cause analysis
            2. Specific code fixes with explanations
            3. Preventive measures
            4. Testing strategy to verify fix
            5. Rollback plan if fix fails
            
            Include actual code snippets where applicable.
            """
            
            fix_suggestion = await self.ai_service.process_enhanced_chat(
                message=fix_prompt,
                conversation_id=f"debug_{session_id}",
                user_id=user_id,
                agent_coordination="collaborative"
            )
            
            # Create fix step
            await self._create_debug_step(
                session_id=session_id,
                action="fix",
                description="AI-generated fix suggestion",
                result=fix_suggestion,
                ai_agent="Dev",  # Developer agent for fixes
                user_id=user_id
            )
            
            return {
                "session_id": session_id,
                "fix_suggestion": fix_suggestion,
                "confidence_level": self._calculate_fix_confidence(steps, test_runs),
                "estimated_effort": self._estimate_fix_effort(session),
                "risk_assessment": self._assess_fix_risk(session, fix_suggestion)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Fix suggestion failed: {str(e)}")
    
    async def replay_debug_session(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Replay entire debugging session with analysis"""
        try:
            db = await get_database()
            session = await db.debug_sessions.find_one({"id": session_id, "user_id": user_id})
            
            if not session:
                raise HTTPException(status_code=404, detail="Debug session not found")
            
            # Get all session data
            steps = await db.debug_steps.find({"session_id": session_id}).sort("step_number", 1).to_list(length=100)
            test_runs = await db.debug_test_runs.find({"session_id": session_id}).sort("timestamp", 1).to_list(length=50)
            
            # Generate session replay analysis
            replay_analysis = await self._analyze_debug_session(session, steps, test_runs)
            
            return {
                "session": session,
                "steps": steps,
                "test_runs": test_runs,
                "analysis": replay_analysis,
                "timeline": self._create_debug_timeline(steps, test_runs),
                "insights": self._extract_debug_insights(steps, test_runs),
                "lessons_learned": self._generate_lessons_learned(session, steps)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Session replay failed: {str(e)}")
    
    # Helper methods
    async def _create_debug_step(self, session_id: str, action: str, description: str, result: Dict[str, Any], ai_agent: str, user_id: str, step_number: Optional[int] = None):
        """Create a debug step record"""
        db = await get_database()
        
        if step_number is None:
            # Get next step number
            last_step = await db.debug_steps.find_one(
                {"session_id": session_id},
                sort=[("step_number", -1)]
            )
            step_number = (last_step["step_number"] if last_step else 0) + 1
        
        step = DebugStep(
            id=str(uuid.uuid4()),
            session_id=session_id,
            step_number=step_number,
            action=action,
            description=description,
            result=result,
            ai_agent=ai_agent,
            timestamp=datetime.utcnow()
        )
        
        await db.debug_steps.insert_one(step.dict())
        return step
    
    def _generate_session_title(self, error_description: str) -> str:
        """Generate a concise title for debug session"""
        if len(error_description) <= 50:
            return error_description
        
        # Extract key terms
        key_terms = []
        words = error_description.lower().split()
        
        error_keywords = ["error", "exception", "failed", "broken", "issue", "bug", "crash"]
        for keyword in error_keywords:
            if keyword in words:
                # Find context around keyword
                idx = words.index(keyword)
                context = words[max(0, idx-2):idx+3]
                key_terms.extend(context)
                break
        
        if not key_terms:
            key_terms = words[:8]
        
        return " ".join(key_terms[:8]).title()
    
    def _classify_error_type(self, error_description: str, context: Dict[str, Any]) -> str:
        """Classify the type of error"""
        desc_lower = error_description.lower()
        
        if any(term in desc_lower for term in ["syntax", "parse", "compile"]):
            return "syntax"
        elif any(term in desc_lower for term in ["runtime", "execution", "null", "undefined"]):
            return "runtime"
        elif any(term in desc_lower for term in ["network", "connection", "timeout", "api"]):
            return "network"
        elif any(term in desc_lower for term in ["database", "query", "sql"]):
            return "database"
        elif any(term in desc_lower for term in ["performance", "slow", "memory", "cpu"]):
            return "performance"
        elif any(term in desc_lower for term in ["security", "auth", "permission"]):
            return "security"
        else:
            return "general"
    
    def _determine_debug_action(self, user_message: str, ai_response: Dict[str, Any]) -> str:
        """Determine next debugging action"""
        msg_lower = user_message.lower()
        
        if any(term in msg_lower for term in ["test", "try", "run"]):
            return "test"
        elif any(term in msg_lower for term in ["fix", "change", "modify"]):
            return "fix"
        elif any(term in msg_lower for term in ["check", "verify", "confirm"]):
            return "verify"
        else:
            return "analyze"
    
    async def _execute_debug_test(self, test_config: Dict[str, Any], session: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a debug test (simulated for now)"""
        # This would integrate with actual testing frameworks
        import random
        import time
        
        start_time = time.time()
        
        # Simulate test execution
        await asyncio.sleep(0.5)  # Simulate test time
        
        success_probability = 0.7  # 70% chance of test passing
        success = random.random() < success_probability
        
        execution_time = time.time() - start_time
        
        return {
            "success": success,
            "execution_time": execution_time,
            "output": f"Test {'passed' if success else 'failed'} for {test_config.get('type', 'unknown')} test",
            "artifacts": [f"test_log_{uuid.uuid4().hex[:8]}.txt"],
            "details": {
                "test_type": test_config.get("type", "manual"),
                "configuration": test_config,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    
    def _calculate_fix_confidence(self, steps: List[Dict], test_runs: List[Dict]) -> float:
        """Calculate confidence level for fix suggestion"""
        base_confidence = 0.5
        
        # More steps generally mean better understanding
        if len(steps) > 5:
            base_confidence += 0.2
        
        # Successful tests increase confidence
        if test_runs:
            success_rate = len([t for t in test_runs if t["passed"]]) / len(test_runs)
            base_confidence += success_rate * 0.3
        
        return min(1.0, base_confidence)
    
    def _estimate_fix_effort(self, session: Dict[str, Any]) -> str:
        """Estimate effort required for fix"""
        error_type = session.get("error_type", "general")
        
        effort_map = {
            "syntax": "Low (1-2 hours)",
            "runtime": "Medium (2-4 hours)",
            "network": "Medium (3-6 hours)",
            "database": "Medium (2-5 hours)",
            "performance": "High (4-8 hours)",
            "security": "High (6-12 hours)",
            "general": "Medium (2-4 hours)"
        }
        
        return effort_map.get(error_type, "Medium (2-4 hours)")
    
    def _assess_fix_risk(self, session: Dict[str, Any], fix_suggestion: Dict[str, Any]) -> Dict[str, str]:
        """Assess risks associated with the fix"""
        return {
            "impact": "Medium",
            "rollback_difficulty": "Low",
            "testing_requirements": "Standard regression testing recommended",
            "deployment_risk": "Low to Medium"
        }
    
    async def _analyze_debug_session(self, session: Dict, steps: List[Dict], test_runs: List[Dict]) -> Dict[str, Any]:
        """Analyze complete debug session"""
        total_time = (datetime.utcnow() - datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))).total_seconds()
        
        return {
            "session_duration": f"{total_time / 3600:.1f} hours",
            "total_steps": len(steps),
            "tests_executed": len(test_runs),
            "success_rate": len([t for t in test_runs if t["passed"]]) / max(1, len(test_runs)),
            "primary_actions": self._count_actions(steps),
            "resolution_status": session.get("status", "active"),
            "efficiency_score": self._calculate_efficiency_score(steps, test_runs, total_time)
        }
    
    def _create_debug_timeline(self, steps: List[Dict], test_runs: List[Dict]) -> List[Dict[str, Any]]:
        """Create timeline of debugging session"""
        timeline = []
        
        # Add steps to timeline
        for step in steps:
            timeline.append({
                "type": "step",
                "timestamp": step["timestamp"],
                "action": step["action"],
                "description": step["description"],
                "agent": step["ai_agent"]
            })
        
        # Add test runs to timeline
        for test in test_runs:
            timeline.append({
                "type": "test",
                "timestamp": test["timestamp"],
                "test_type": test["test_type"],
                "result": "passed" if test["passed"] else "failed",
                "execution_time": test["execution_time"]
            })
        
        # Sort by timestamp
        timeline.sort(key=lambda x: x["timestamp"])
        
        return timeline
    
    def _extract_debug_insights(self, steps: List[Dict], test_runs: List[Dict]) -> List[str]:
        """Extract insights from debugging session"""
        insights = []
        
        # Analyze action patterns
        actions = [step["action"] for step in steps]
        if actions.count("test") > actions.count("fix"):
            insights.append("Test-driven debugging approach used effectively")
        
        if len(test_runs) > 3:
            insights.append("Comprehensive testing strategy employed")
        
        # Success rate insights
        if test_runs:
            success_rate = len([t for t in test_runs if t["passed"]]) / len(test_runs)
            if success_rate > 0.8:
                insights.append("High test success rate indicates good debugging approach")
            elif success_rate < 0.5:
                insights.append("Low test success rate suggests complex issue or need for different approach")
        
        return insights
    
    def _generate_lessons_learned(self, session: Dict, steps: List[Dict]) -> List[str]:
        """Generate lessons learned from debugging session"""
        lessons = []
        
        error_type = session.get("error_type", "general")
        
        lessons.append(f"Error type: {error_type} - requires specific debugging approach")
        lessons.append(f"Debugging session took {len(steps)} steps - consider efficiency improvements")
        
        # Add type-specific lessons
        if error_type == "performance":
            lessons.append("Performance issues require systematic profiling and measurement")
        elif error_type == "network":
            lessons.append("Network issues need both client and server-side investigation")
        elif error_type == "database":
            lessons.append("Database errors often require query optimization and schema review")
        
        return lessons
    
    def _count_actions(self, steps: List[Dict]) -> Dict[str, int]:
        """Count different types of actions taken"""
        action_counts = {}
        for step in steps:
            action = step["action"]
            action_counts[action] = action_counts.get(action, 0) + 1
        return action_counts
    
    def _calculate_efficiency_score(self, steps: List[Dict], test_runs: List[Dict], total_time: float) -> float:
        """Calculate debugging efficiency score"""
        base_score = 0.5
        
        # Fewer steps for resolution is more efficient
        if len(steps) < 10:
            base_score += 0.2
        
        # Good test coverage
        if len(test_runs) >= 3:
            base_score += 0.2
        
        # Quick resolution
        if total_time < 3600:  # Less than 1 hour
            base_score += 0.1
        
        return min(1.0, base_score)

# Initialize service
debug_service = ConversationalDebugger()

@router.post("/start-session", response_model=DebugSession)
async def start_debug_session(
    error_description: str,
    context: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Start a new conversational debugging session"""
    return await debug_service.start_debug_session(error_description, context, current_user["id"])

@router.post("/session/{session_id}/continue")
async def continue_debug_conversation(
    session_id: str,
    user_message: str,
    current_user = Depends(get_current_user)
):
    """Continue debugging conversation"""
    return await debug_service.continue_debug_conversation(session_id, user_message, current_user["id"])

@router.post("/session/{session_id}/test")
async def run_debug_test(
    session_id: str,
    test_config: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Run a test as part of debugging"""
    return await debug_service.run_debug_test(session_id, test_config, current_user["id"])

@router.post("/session/{session_id}/suggest-fix")
async def suggest_fix(
    session_id: str,
    current_user = Depends(get_current_user)
):
    """Get AI-powered fix suggestions"""
    return await debug_service.suggest_fix(session_id, current_user["id"])

@router.get("/session/{session_id}/replay")
async def replay_debug_session(
    session_id: str,
    current_user = Depends(get_current_user)
):
    """Replay and analyze entire debugging session"""
    return await debug_service.replay_debug_session(session_id, current_user["id"])

@router.get("/sessions")
async def get_debug_sessions(current_user = Depends(get_current_user)):
    """Get all debugging sessions for user"""
    db = await get_database()
    sessions = await db.debug_sessions.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(20).to_list(length=20)
    return sessions

@router.put("/session/{session_id}/status")
async def update_session_status(
    session_id: str,
    status: str,
    current_user = Depends(get_current_user)
):
    """Update debug session status"""
    db = await get_database()
    
    update_data = {"status": status}
    if status == "resolved":
        update_data["resolved_at"] = datetime.utcnow()
    
    result = await db.debug_sessions.update_one(
        {"id": session_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Debug session not found")
    
    return {"message": f"Session status updated to {status}", "session_id": session_id}