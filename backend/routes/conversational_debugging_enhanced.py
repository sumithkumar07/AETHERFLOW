"""
Conversational Debugging Interface
Natural language error analysis and intelligent debugging assistance
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import traceback
import re
import ast
import subprocess
from datetime import datetime
from models.auth import get_current_user
from models.database import get_database
from services.groq_ai_service import GroqAIService
import uuid

router = APIRouter()

class ErrorReport(BaseModel):
    error_type: str
    error_message: str
    stack_trace: Optional[str] = None
    code_context: Optional[str] = None
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    environment: Dict[str, Any] = {}

class DebugQuery(BaseModel):
    description: str
    error_report: Optional[ErrorReport] = None
    code_snippet: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None

class DebugSolution(BaseModel):
    id: str
    problem_analysis: str
    root_cause: str
    solution_steps: List[str]
    code_fixes: Dict[str, str]  # filename -> fixed code
    explanation: str
    prevention_tips: List[str]
    related_resources: List[Dict[str, str]]
    confidence_score: float
    estimated_fix_time: str

class ConversationalDebugger:
    def __init__(self):
        self.ai_service = GroqAIService()
        self.error_patterns = {
            "syntax_error": r"SyntaxError|IndentationError|TabError",
            "import_error": r"ImportError|ModuleNotFoundError",
            "type_error": r"TypeError|AttributeError",
            "value_error": r"ValueError|KeyError|IndexError",
            "runtime_error": r"RuntimeError|RecursionError|MemoryError",
            "network_error": r"ConnectionError|TimeoutError|HTTPException",
            "database_error": r"DatabaseError|IntegrityError|OperationalError",
            "authentication_error": r"AuthenticationError|PermissionError|Unauthorized"
        }
    
    async def analyze_error(self, error_report: ErrorReport) -> Dict[str, Any]:
        """AI-powered error analysis with pattern recognition"""
        
        # Classify error type
        error_category = self._classify_error(error_report.error_message)
        
        analysis_prompt = f"""
        Analyze this error and provide comprehensive debugging information:
        
        ERROR DETAILS:
        Type: {error_report.error_type}
        Message: {error_report.error_message}
        Stack Trace: {error_report.stack_trace or 'Not provided'}
        Code Context: {error_report.code_context or 'Not provided'}
        File: {error_report.file_path or 'Unknown'}
        Line: {error_report.line_number or 'Unknown'}
        Environment: {json.dumps(error_report.environment, indent=2)}
        
        ERROR CATEGORY: {error_category}
        
        Provide detailed analysis:
        1. Root cause identification
        2. Step-by-step explanation of why this error occurred
        3. Common scenarios that lead to this error
        4. Specific fix recommendations
        5. Code examples of the fix
        6. Prevention strategies
        7. Related best practices
        
        Return JSON:
        {{
            "error_category": "{error_category}",
            "root_cause": "Detailed explanation of the root cause",
            "why_it_happened": "Step-by-step explanation",
            "common_scenarios": ["scenario1", "scenario2", "scenario3"],
            "fix_recommendations": [
                "1. Specific fix step 1",
                "2. Specific fix step 2",
                "3. Specific fix step 3"
            ],
            "code_examples": {{
                "problematic_code": "// Example of problematic code",
                "fixed_code": "// Example of fixed code",
                "explanation": "What changed and why"
            }},
            "prevention_strategies": [
                "Prevention tip 1",
                "Prevention tip 2",
                "Prevention tip 3"
            ],
            "best_practices": [
                "Best practice 1",
                "Best practice 2"
            ],
            "confidence_score": 0.9,
            "estimated_fix_time": "15-30 minutes"
        }}
        """
        
        try:
            analysis_response = await self.ai_service.generate_response(
                analysis_prompt,
                model="llama-3.3-70b-versatile",  # Use best model for analysis
                max_tokens=2000,
                temperature=0.1
            )
            
            return json.loads(analysis_response)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error analysis failed: {str(e)}")
    
    def _classify_error(self, error_message: str) -> str:
        """Classify error based on patterns"""
        for category, pattern in self.error_patterns.items():
            if re.search(pattern, error_message, re.IGNORECASE):
                return category
        return "unknown_error"
    
    async def conversational_debug(self, query: DebugQuery) -> DebugSolution:
        """Provide conversational debugging assistance"""
        
        debug_prompt = f"""
        Act as an expert debugging assistant. Help debug this issue:
        
        USER DESCRIPTION: {query.description}
        
        ERROR REPORT: {json.dumps(query.error_report.dict() if query.error_report else {}, indent=2)}
        
        CODE SNIPPET: {query.code_snippet or 'Not provided'}
        
        EXPECTED BEHAVIOR: {query.expected_behavior or 'Not specified'}
        ACTUAL BEHAVIOR: {query.actual_behavior or 'Not specified'}
        
        Provide comprehensive debugging assistance:
        
        1. PROBLEM ANALYSIS: What's going wrong and why
        2. ROOT CAUSE: The fundamental issue causing this problem
        3. SOLUTION STEPS: Clear, actionable steps to fix the issue
        4. CODE FIXES: Specific code changes needed (if applicable)
        5. EXPLANATION: Why this solution works
        6. PREVENTION: How to avoid this in the future
        7. RESOURCES: Helpful documentation or tutorials
        
        Be conversational, clear, and provide specific examples.
        
        Return JSON:
        {{
            "problem_analysis": "Clear explanation of what's going wrong",
            "root_cause": "The fundamental issue",
            "solution_steps": [
                "1. First step with specific action",
                "2. Second step with details",
                "3. Third step if needed"
            ],
            "code_fixes": {{
                "filename": "Fixed code content",
                "another_file": "More fixed code if needed"
            }},
            "explanation": "Why this solution works and what it does",
            "prevention_tips": [
                "Prevention tip 1 with explanation",
                "Prevention tip 2 with details",
                "Prevention tip 3 with examples"
            ],
            "related_resources": [
                {{"title": "Resource 1", "url": "https://example.com", "type": "documentation"}},
                {{"title": "Resource 2", "url": "https://example.com", "type": "tutorial"}}
            ],
            "confidence_score": 0.95,
            "estimated_fix_time": "10-20 minutes"
        }}
        """
        
        try:
            debug_response = await self.ai_service.generate_response(
                debug_prompt,
                model="llama-3.3-70b-versatile",
                max_tokens=2500,
                temperature=0.2
            )
            
            solution_data = json.loads(debug_response)
            
            solution = DebugSolution(
                id=str(uuid.uuid4()),
                problem_analysis=solution_data["problem_analysis"],
                root_cause=solution_data["root_cause"],
                solution_steps=solution_data["solution_steps"],
                code_fixes=solution_data["code_fixes"],
                explanation=solution_data["explanation"],
                prevention_tips=solution_data["prevention_tips"],
                related_resources=solution_data["related_resources"],
                confidence_score=solution_data["confidence_score"],
                estimated_fix_time=solution_data["estimated_fix_time"]
            )
            
            return solution
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Conversational debugging failed: {str(e)}")
    
    async def code_review_debug(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Proactive code review to identify potential issues"""
        
        review_prompt = f"""
        Perform a comprehensive code review to identify potential bugs, issues, and improvements:
        
        LANGUAGE: {language}
        CODE:
        ```{language}
        {code}
        ```
        
        Analyze for:
        1. Potential bugs and error-prone patterns
        2. Performance issues
        3. Security vulnerabilities
        4. Code quality and best practices
        5. Maintainability concerns
        6. Memory leaks or resource issues
        7. Logic errors
        8. Edge case handling
        
        For each issue found, provide:
        - Issue description
        - Severity (critical, high, medium, low)
        - Specific line numbers if applicable
        - Fix recommendations
        - Improved code examples
        
        Return JSON:
        {{
            "overall_health": "excellent|good|fair|poor",
            "issues_found": [
                {{
                    "type": "potential_bug|performance|security|quality",
                    "severity": "critical|high|medium|low",
                    "description": "Detailed description of the issue",
                    "line_numbers": [10, 15],
                    "problematic_code": "Code snippet causing issue",
                    "fix_recommendation": "How to fix this issue",
                    "fixed_code": "Corrected code example"
                }}
            ],
            "suggestions": [
                {{
                    "category": "performance|readability|maintainability",
                    "suggestion": "Specific improvement suggestion",
                    "impact": "What this improvement achieves"
                }}
            ],
            "best_practice_violations": [
                "Violation 1 with explanation",
                "Violation 2 with explanation"
            ],
            "security_notes": [
                "Security consideration 1",
                "Security consideration 2"
            ]
        }}
        """
        
        try:
            review_response = await self.ai_service.generate_response(
                review_prompt,
                model="llama-3.3-70b-versatile",
                max_tokens=2000,
                temperature=0.1
            )
            
            return json.loads(review_response)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Code review failed: {str(e)}")
    
    async def debug_session_chat(self, conversation_history: List[Dict[str, str]], new_message: str) -> str:
        """Interactive debugging conversation"""
        
        conversation_context = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in conversation_history[-10:]  # Last 10 messages for context
        ])
        
        chat_prompt = f"""
        You are an expert debugging assistant having a conversation with a developer.
        
        CONVERSATION HISTORY:
        {conversation_context}
        
        NEW MESSAGE: {new_message}
        
        Respond helpfully as a debugging expert. Be:
        1. Conversational and friendly
        2. Specific and actionable
        3. Clear with explanations
        4. Proactive with suggestions
        5. Ask clarifying questions if needed
        
        If they show you code or errors, analyze them thoroughly.
        If they ask for help, provide step-by-step guidance.
        If they need explanations, make them clear and comprehensive.
        
        Respond naturally as if you're a helpful debugging partner.
        """
        
        try:
            chat_response = await self.ai_service.generate_response(
                chat_prompt,
                model="llama-3.1-70b-versatile",
                max_tokens=1000,
                temperature=0.3  # Slightly higher for more conversational tone
            )
            
            return chat_response
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Debug chat failed: {str(e)}")

debug_service = ConversationalDebugger()

@router.post("/analyze-error")
async def analyze_error(
    error_report: ErrorReport,
    current_user: dict = Depends(get_current_user)
):
    """Analyze error with AI-powered debugging assistance"""
    try:
        analysis = await debug_service.analyze_error(error_report)
        
        # Store debugging session
        db = await get_database()
        await db.debug_sessions.insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": current_user["user_id"],
            "type": "error_analysis",
            "error_report": error_report.dict(),
            "analysis": analysis,
            "created_at": datetime.utcnow()
        })
        
        return {
            "message": "Error analyzed successfully",
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversational-debug")
async def conversational_debug(
    query: DebugQuery,
    current_user: dict = Depends(get_current_user)
):
    """Get conversational debugging assistance"""
    try:
        solution = await debug_service.conversational_debug(query)
        
        # Store debugging session
        db = await get_database()
        await db.debug_sessions.insert_one({
            "_id": solution.id,
            "user_id": current_user["user_id"],
            "type": "conversational_debug",
            "query": query.dict(),
            "solution": solution.dict(),
            "created_at": datetime.utcnow()
        })
        
        return {
            "message": "Debug solution generated successfully",
            "solution": solution
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code-review")
async def code_review_debug(
    code: str,
    language: str = "python",
    current_user: dict = Depends(get_current_user)
):
    """Proactive code review to identify potential issues"""
    try:
        review = await debug_service.code_review_debug(code, language)
        
        # Store code review
        db = await get_database()
        await db.code_reviews.insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": current_user["user_id"],
            "code": code,
            "language": language,
            "review": review,
            "created_at": datetime.utcnow()
        })
        
        return {
            "message": "Code review completed",
            "review": review,
            "summary": {
                "overall_health": review["overall_health"],
                "issues_count": len(review["issues_found"]),
                "critical_issues": len([i for i in review["issues_found"] if i["severity"] == "critical"]),
                "suggestions_count": len(review["suggestions"])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def debug_chat(
    conversation_history: List[Dict[str, str]],
    new_message: str,
    current_user: dict = Depends(get_current_user)
):
    """Interactive debugging conversation"""
    try:
        response = await debug_service.debug_session_chat(conversation_history, new_message)
        
        # Store chat interaction
        db = await get_database()
        await db.debug_conversations.update_one(
            {"user_id": current_user["user_id"], "active": True},
            {
                "$push": {
                    "messages": [
                        {"role": "user", "content": new_message, "timestamp": datetime.utcnow()},
                        {"role": "assistant", "content": response, "timestamp": datetime.utcnow()}
                    ]
                },
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        return {
            "response": response,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_debug_sessions(
    current_user: dict = Depends(get_current_user),
    limit: int = 20
):
    """Get user's debugging session history"""
    try:
        db = await get_database()
        cursor = db.debug_sessions.find(
            {"user_id": current_user["user_id"]}
        ).sort("created_at", -1).limit(limit)
        
        sessions = await cursor.to_list(length=limit)
        
        return {
            "sessions": [
                {
                    "id": session["_id"],
                    "type": session["type"],
                    "created_at": session["created_at"],
                    "summary": session.get("analysis", {}).get("root_cause", "Debug session") if session["type"] == "error_analysis" else session.get("solution", {}).get("problem_analysis", "Debug session")
                } for session in sessions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_debug_session_details(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed debug session information"""
    try:
        db = await get_database()
        session = await db.debug_sessions.find_one({
            "_id": session_id,
            "user_id": current_user["user_id"]
        })
        
        if not session:
            raise HTTPException(status_code=404, detail="Debug session not found")
        
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/common-issues")
async def get_common_issues():
    """Get common debugging patterns and solutions"""
    try:
        common_issues = [
            {
                "category": "Import Errors",
                "issues": [
                    "ModuleNotFoundError: No module named 'xyz'",
                    "ImportError: cannot import name 'xyz'",
                    "Circular import errors"
                ],
                "quick_solutions": [
                    "Check package installation",
                    "Verify import paths",
                    "Resolve circular dependencies"
                ]
            },
            {
                "category": "Type Errors",
                "issues": [
                    "TypeError: 'NoneType' object is not subscriptable",
                    "AttributeError: 'dict' object has no attribute 'xyz'",
                    "TypeError: unsupported operand type(s)"
                ],
                "quick_solutions": [
                    "Add null checks",
                    "Verify object types",
                    "Type casting and validation"
                ]
            },
            {
                "category": "Async/Await Issues",
                "issues": [
                    "RuntimeError: This event loop is already running",
                    "TypeError: object is not awaitable", 
                    "SyntaxError: 'await' outside function"
                ],
                "quick_solutions": [
                    "Use async/await properly",
                    "Check event loop context",
                    "Async function definitions"
                ]
            }
        ]
        
        return {
            "common_issues": common_issues,
            "debug_tips": [
                "Always read error messages carefully",
                "Check stack traces for exact error locations",
                "Use print statements or debugger for investigation",
                "Test with simple inputs first",
                "Review recent changes that might have caused issues"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))