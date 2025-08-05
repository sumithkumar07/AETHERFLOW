from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime
import logging
from pydantic import BaseModel
import json
import re
import traceback

logger = logging.getLogger(__name__)
router = APIRouter()

# Models for Conversational Debugging
class DebugSession(BaseModel):
    id: str
    project_id: str
    user_id: str
    title: str
    error_context: Dict[str, Any]
    conversation: List[Dict]
    status: str  # active, resolved, escalated
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_summary: Optional[str] = None

class ErrorAnalysis(BaseModel):
    error_type: str
    severity: str  # low, medium, high, critical
    category: str  # syntax, runtime, logic, performance, security
    description: str
    likely_causes: List[str]
    suggested_fixes: List[str]
    related_files: List[str]
    confidence_score: float

class DebugStep(BaseModel):
    step_number: int
    description: str
    action_type: str  # investigation, fix_attempt, test, verification
    command: Optional[str] = None
    expected_outcome: str
    actual_outcome: Optional[str] = None
    success: Optional[bool] = None

class BuildReplay(BaseModel):
    id: str
    build_id: str
    project_id: str
    steps: List[DebugStep]
    logs: List[str]
    duration: int  # seconds
    status: str  # success, failed, cancelled
    created_at: datetime

# Advanced Conversational Debugging Engine
class ConversationalDebuggingEngine:
    def __init__(self):
        # In-memory storage (in production, use database)
        self.debug_sessions: Dict[str, DebugSession] = {}
        self.error_patterns: Dict[str, Dict] = self._initialize_error_patterns()
        self.build_replays: Dict[str, BuildReplay] = {}
        
    def _initialize_error_patterns(self) -> Dict[str, Dict]:
        """Initialize common error patterns for intelligent analysis"""
        return {
            "syntax_error": {
                "patterns": [
                    r"SyntaxError",
                    r"unexpected token",
                    r"missing \)",
                    r"invalid syntax"
                ],
                "category": "syntax",
                "severity": "high",
                "common_fixes": [
                    "Check for missing brackets or parentheses",
                    "Verify proper indentation",
                    "Look for typos in keywords"
                ]
            },
            "type_error": {
                "patterns": [
                    r"TypeError",
                    r"cannot read property",
                    r"undefined is not a function",
                    r"not a function"
                ],
                "category": "runtime",
                "severity": "high",
                "common_fixes": [
                    "Check variable initialization",
                    "Verify function definitions",
                    "Ensure proper object structure"
                ]
            },
            "reference_error": {
                "patterns": [
                    r"ReferenceError",
                    r"is not defined",
                    r"Cannot access before initialization"
                ],
                "category": "runtime",
                "severity": "high",
                "common_fixes": [
                    "Check variable declarations",
                    "Verify import statements",
                    "Look for hoisting issues"
                ]
            },
            "import_error": {
                "patterns": [
                    r"ImportError",
                    r"ModuleNotFoundError",
                    r"Cannot resolve module",
                    r"Module not found"
                ],
                "category": "dependency",
                "severity": "medium",
                "common_fixes": [
                    "Install missing dependencies",
                    "Check import paths",
                    "Verify module names"
                ]
            },
            "network_error": {
                "patterns": [
                    r"NetworkError",
                    r"fetch failed",
                    r"ECONNREFUSED",
                    r"timeout"
                ],
                "category": "network",
                "severity": "medium",
                "common_fixes": [
                    "Check network connectivity",
                    "Verify API endpoints",
                    "Review timeout settings"
                ]
            },
            "permission_error": {
                "patterns": [
                    r"PermissionError",
                    r"EACCES",
                    r"access denied",
                    r"forbidden"
                ],
                "category": "security",
                "severity": "medium",
                "common_fixes": [
                    "Check file permissions",
                    "Verify user access rights",
                    "Review security configurations"
                ]
            }
        }
    
    async def analyze_error(self, error_message: str, stack_trace: str = "", context: Dict = None) -> ErrorAnalysis:
        """Analyze error using intelligent pattern matching"""
        try:
            error_text = f"{error_message} {stack_trace}".lower()
            
            # Pattern matching for error type
            matched_pattern = None
            for error_type, pattern_info in self.error_patterns.items():
                for pattern in pattern_info["patterns"]:
                    if re.search(pattern.lower(), error_text):
                        matched_pattern = (error_type, pattern_info)
                        break
                if matched_pattern:
                    break
            
            if not matched_pattern:
                matched_pattern = ("unknown_error", {
                    "category": "unknown",
                    "severity": "medium",
                    "common_fixes": ["Review error details and context"]
                })
            
            error_type, pattern_info = matched_pattern
            
            # Extract file information from stack trace
            file_pattern = r'at .+? \((.+?):(\d+):(\d+)\)'
            related_files = []
            for match in re.finditer(file_pattern, stack_trace):
                file_path = match.group(1)
                line_number = match.group(2)
                related_files.append(f"{file_path}:{line_number}")
            
            # Generate analysis
            analysis = ErrorAnalysis(
                error_type=error_type,
                severity=pattern_info.get("severity", "medium"),
                category=pattern_info.get("category", "unknown"),
                description=f"Detected {error_type.replace('_', ' ')}: {error_message}",
                likely_causes=self._generate_likely_causes(error_type, context),
                suggested_fixes=pattern_info.get("common_fixes", []),
                related_files=related_files[:5],  # Limit to top 5 files
                confidence_score=0.8 if matched_pattern[0] != "unknown_error" else 0.3
            )
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing error: {e}")
            # Return basic analysis
            return ErrorAnalysis(
                error_type="analysis_failed",
                severity="low",
                category="unknown",
                description=f"Failed to analyze error: {error_message}",
                likely_causes=["Error analysis system encountered an issue"],
                suggested_fixes=["Review error manually", "Contact support if needed"],
                related_files=[],
                confidence_score=0.1
            )
    
    def _generate_likely_causes(self, error_type: str, context: Dict = None) -> List[str]:
        """Generate likely causes based on error type and context"""
        base_causes = {
            "syntax_error": [
                "Missing or mismatched brackets, parentheses, or quotes",
                "Incorrect indentation or formatting",
                "Typos in keywords or variable names"
            ],
            "type_error": [
                "Attempting to call undefined function",
                "Accessing properties of null or undefined",
                "Type mismatch in operations"
            ],
            "reference_error": [
                "Variable used before declaration",
                "Missing import statements",
                "Scope-related issues"
            ],
            "import_error": [
                "Missing package installation",
                "Incorrect import path",
                "Version compatibility issues"
            ]
        }
        
        causes = base_causes.get(error_type, ["Unknown cause"])
        
        # Add context-specific causes
        if context:
            if context.get("recent_changes"):
                causes.append("Recent code changes may have introduced the issue")
            if context.get("new_dependencies"):
                causes.append("New dependencies may be causing conflicts")
                
        return causes
    
    async def start_debug_session(
        self, 
        project_id: str, 
        user_id: str, 
        error_context: Dict
    ) -> DebugSession:
        """Start a new conversational debugging session"""
        try:
            # Analyze the initial error
            error_analysis = await self.analyze_error(
                error_context.get("error_message", ""),
                error_context.get("stack_trace", ""),
                error_context
            )
            
            session = DebugSession(
                id=str(uuid.uuid4()),
                project_id=project_id,
                user_id=user_id,
                title=f"Debug: {error_analysis.error_type.replace('_', ' ').title()}",
                error_context=error_context,
                conversation=[{
                    "type": "system",
                    "content": f"🔍 **Debug Session Started**\n\n"
                              f"**Error Type**: {error_analysis.error_type}\n"
                              f"**Severity**: {error_analysis.severity}\n"
                              f"**Category**: {error_analysis.category}\n\n"
                              f"**Analysis**: {error_analysis.description}\n\n"
                              f"**Suggested Investigation Steps**:\n" +
                              "\n".join(f"• {fix}" for fix in error_analysis.suggested_fixes),
                    "timestamp": datetime.now().isoformat()
                }],
                status="active",
                created_at=datetime.now()
            )
            
            self.debug_sessions[session.id] = session
            logger.info(f"Started debug session: {session.id}")
            return session
            
        except Exception as e:
            logger.error(f"Error starting debug session: {e}")
            raise
    
    async def add_debug_interaction(
        self, 
        session_id: str, 
        user_message: str, 
        investigation_results: Dict = None
    ) -> Dict:
        """Add user interaction to debug session and generate intelligent response"""
        try:
            if session_id not in self.debug_sessions:
                raise ValueError("Debug session not found")
            
            session = self.debug_sessions[session_id]
            
            # Add user message
            session.conversation.append({
                "type": "user",
                "content": user_message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Generate intelligent response
            response = await self._generate_debug_response(session, user_message, investigation_results)
            
            # Add system response
            session.conversation.append({
                "type": "assistant",
                "content": response,
                "timestamp": datetime.now().isoformat()
            })
            
            return {"response": response, "session": session.dict()}
            
        except Exception as e:
            logger.error(f"Error adding debug interaction: {e}")
            raise
    
    async def _generate_debug_response(
        self, 
        session: DebugSession, 
        user_message: str, 
        investigation_results: Dict = None
    ) -> str:
        """Generate intelligent debugging response"""
        try:
            message_lower = user_message.lower()
            
            # Intent detection
            if any(keyword in message_lower for keyword in ["why", "what caused", "reason"]):
                return self._explain_error_cause(session.error_context)
            elif any(keyword in message_lower for keyword in ["how to fix", "solution", "resolve"]):
                return self._provide_solution_steps(session.error_context)
            elif any(keyword in message_lower for keyword in ["test", "verify", "check"]):
                return self._suggest_verification_steps(session.error_context)
            elif any(keyword in message_lower for keyword in ["similar", "before", "happened"]):
                return self._provide_similar_cases(session.error_context)
            else:
                return self._provide_general_guidance(session.error_context, user_message)
                
        except Exception as e:
            logger.error(f"Error generating debug response: {e}")
            return "I encountered an issue generating a response. Let's continue debugging step by step."
    
    def _explain_error_cause(self, error_context: Dict) -> str:
        """Explain the likely cause of the error"""
        error_message = error_context.get("error_message", "Unknown error")
        
        return f"""🔍 **Error Cause Analysis**

Based on the error message: `{error_message}`

**Most Likely Causes**:
1. **Code Structure Issue**: The error often occurs when there's a structural problem in your code
2. **Dependency Problem**: Missing or incompatible dependencies
3. **Environment Issue**: Configuration or environment-related problems

**Investigation Steps**:
• Check the exact line where the error occurs
• Review recent changes to related files
• Verify all dependencies are properly installed
• Check for typos or syntax issues

Would you like me to help you investigate any specific aspect?"""
    
    def _provide_solution_steps(self, error_context: Dict) -> str:
        """Provide step-by-step solution"""
        return f"""🛠️ **Solution Steps**

Here's a systematic approach to fix this issue:

**Step 1: Quick Diagnosis**
• Check the error location in your code
• Look for obvious syntax errors (brackets, quotes, semicolons)

**Step 2: Environment Check**
• Verify all packages are installed: `npm install` or `pip install -r requirements.txt`
• Check that you're using the correct Node.js/Python version

**Step 3: Code Review**
• Review the code around the error line
• Check for recent changes that might have caused the issue

**Step 4: Testing**
• Try a minimal reproduction of the issue
• Test individual components to isolate the problem

**Step 5: Advanced Debugging**
• Use debugger breakpoints
• Add console.log/print statements to trace execution

Try Step 1 first and let me know what you find!"""
    
    def _suggest_verification_steps(self, error_context: Dict) -> str:
        """Suggest verification and testing steps"""
        return f"""✅ **Verification Steps**

Let's systematically verify your fix:

**1. Syntax Verification**
• Run your linter: `eslint .` or `flake8 .`
• Check for compilation errors

**2. Unit Testing**
• Run your test suite: `npm test` or `pytest`
• Create a minimal test case for the fixed functionality

**3. Integration Testing**
• Test the feature end-to-end
• Check related functionality hasn't broken

**4. Performance Check**
• Monitor for performance regressions
• Check memory usage and response times

**5. Edge Case Testing**
• Test with different input values
• Verify error handling works correctly

Would you like help creating specific tests for your fix?"""
    
    def _provide_similar_cases(self, error_context: Dict) -> str:
        """Provide information about similar cases"""
        return f"""📚 **Similar Cases & Patterns**

I've seen similar errors before. Here are common patterns:

**Common Scenarios**:
• **Import Issues**: Often caused by incorrect paths or missing modules
• **Async Problems**: Race conditions or improperly handled promises
• **Type Errors**: Usually from unexpected data types or null values

**Typical Solutions That Worked**:
• Adding proper error handling with try-catch blocks
• Checking for null/undefined before accessing properties
• Ensuring async operations are properly awaited

**Prevention Tips**:
• Use TypeScript for better type safety
• Add comprehensive error handling
• Implement proper testing coverage

**Quick Wins**:
• Check console for additional warnings
• Look at the complete stack trace, not just the first error

Have you tried any of these approaches yet?"""
    
    def _provide_general_guidance(self, error_context: Dict, user_message: str) -> str:
        """Provide general debugging guidance"""
        return f"""💡 **Debugging Guidance**

I understand you're working on: "{user_message}"

**General Debugging Approach**:
• Break down the problem into smaller pieces
• Use systematic elimination to find the root cause
• Don't forget to check the basics (dependencies, syntax, etc.)

**Helpful Commands**:
• `npm run dev` - Start development server
• `npm run build` - Test production build
• `git log --oneline -10` - See recent changes

**Debug Tools**:
• Browser DevTools (F12)
• VS Code debugger
• Console logging for tracing

**Next Steps**:
1. Can you share the specific error message you're seeing?
2. What were you trying to accomplish when this error occurred?
3. Have you made any recent changes to the code?

The more details you provide, the better I can help you solve this!"""

# Initialize debugging engine
debug_engine = ConversationalDebuggingEngine()

@router.post("/sessions/start", response_model=DebugSession)
async def start_debug_session(session_request: Dict[str, Any]):
    """Start a new debugging session"""
    try:
        session = await debug_engine.start_debug_session(
            project_id=session_request["project_id"],
            user_id=session_request["user_id"],
            error_context=session_request["error_context"]
        )
        return session
    except Exception as e:
        logger.error(f"Error starting debug session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_debug_session(session_id: str):
    """Get debug session details"""
    try:
        if session_id not in debug_engine.debug_sessions:
            raise HTTPException(status_code=404, detail="Debug session not found")
        
        session = debug_engine.debug_sessions[session_id]
        return session.dict()
    except Exception as e:
        logger.error(f"Error getting debug session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/interact")
async def add_debug_interaction(session_id: str, interaction_request: Dict[str, Any]):
    """Add interaction to debug session"""
    try:
        result = await debug_engine.add_debug_interaction(
            session_id=session_id,
            user_message=interaction_request["message"],
            investigation_results=interaction_request.get("investigation_results")
        )
        return result
    except Exception as e:
        logger.error(f"Error adding debug interaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-error", response_model=ErrorAnalysis)
async def analyze_error(error_request: Dict[str, Any]):
    """Analyze an error message and provide insights"""
    try:
        analysis = await debug_engine.analyze_error(
            error_message=error_request["error_message"],
            stack_trace=error_request.get("stack_trace", ""),
            context=error_request.get("context")
        )
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def list_debug_sessions(user_id: str = None, project_id: str = None):
    """List debug sessions with optional filtering"""
    try:
        sessions = list(debug_engine.debug_sessions.values())
        
        # Filter by user_id if provided
        if user_id:
            sessions = [s for s in sessions if s.user_id == user_id]
            
        # Filter by project_id if provided
        if project_id:
            sessions = [s for s in sessions if s.project_id == project_id]
        
        return {"sessions": [session.dict() for session in sessions]}
    except Exception as e:
        logger.error(f"Error listing debug sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/resolve")
async def resolve_debug_session(session_id: str, resolution_data: Dict[str, Any]):
    """Mark debug session as resolved"""
    try:
        if session_id not in debug_engine.debug_sessions:
            raise HTTPException(status_code=404, detail="Debug session not found")
        
        session = debug_engine.debug_sessions[session_id]
        session.status = "resolved"
        session.resolved_at = datetime.now()
        session.resolution_summary = resolution_data.get("summary", "Issue resolved")
        
        return {"message": "Debug session resolved", "session": session.dict()}
    except Exception as e:
        logger.error(f"Error resolving debug session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/error-patterns")
async def get_error_patterns():
    """Get available error patterns for analysis"""
    try:
        return {"patterns": debug_engine.error_patterns}
    except Exception as e:
        logger.error(f"Error getting error patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))