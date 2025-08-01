from typing import List, Dict, Any, Optional
import ast
import re
import json
from datetime import datetime
from services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

class SmartErrorPrevention:
    """Proactive error detection and prevention service"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.common_patterns = {}
        self.user_error_history = {}
        
    async def initialize(self):
        """Initialize the error prevention service"""
        try:
            await self.ai_service.initialize()
            await self._load_common_patterns()
            logger.info("Smart Error Prevention service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize error prevention: {e}")
            raise
    
    async def analyze_code_for_errors(
        self,
        code: str,
        file_type: str = "javascript",
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Analyze code for potential errors before execution"""
        try:
            errors = []
            
            # Static analysis
            static_errors = await self._static_analysis(code, file_type)
            errors.extend(static_errors)
            
            # Pattern-based detection
            pattern_errors = await self._pattern_based_detection(code, file_type)
            errors.extend(pattern_errors)
            
            # AI-powered analysis
            ai_errors = await self._ai_error_analysis(code, file_type, user_id)
            errors.extend(ai_errors)
            
            # Rank errors by severity
            ranked_errors = self._rank_errors_by_severity(errors)
            
            return ranked_errors
            
        except Exception as e:
            logger.error(f"Failed to analyze code for errors: {e}")
            return []
    
    async def get_real_time_warnings(
        self,
        code_fragment: str,
        cursor_position: int,
        file_type: str = "javascript",
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Get real-time warnings as user types"""
        try:
            warnings = []
            
            # Quick syntax checks
            syntax_warnings = await self._quick_syntax_check(code_fragment, file_type)
            warnings.extend(syntax_warnings)
            
            # Common mistake detection
            mistake_warnings = await self._detect_common_mistakes(
                code_fragment, cursor_position, user_id
            )
            warnings.extend(mistake_warnings)
            
            return warnings
            
        except Exception as e:
            logger.error(f"Failed to get real-time warnings: {e}")
            return []
    
    async def suggest_fixes(
        self,
        error_data: Dict[str, Any],
        code_context: str,
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Suggest fixes for detected errors"""
        try:
            fix_prompt = f"""
            Suggest fixes for this error:
            
            Error: {error_data.get('message', '')}
            Type: {error_data.get('type', '')}
            Line: {error_data.get('line', '')}
            
            Code context:
            {code_context}
            
            Return JSON with fixes:
            {{
                "fixes": [
                    {{
                        "title": "Fix title",
                        "description": "What this fix does",
                        "difficulty": "easy|medium|hard",
                        "original": "original code",
                        "fixed": "fixed code",
                        "explanation": "Why this fixes the issue"
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(fix_prompt)
            fixes_data = json.loads(response)
            
            return fixes_data.get("fixes", [])
            
        except Exception as e:
            logger.error(f"Failed to suggest fixes: {e}")
            return []
    
    async def validate_dependencies(
        self,
        dependencies: List[str],
        project_type: str = "javascript"
    ) -> Dict[str, Any]:
        """Validate project dependencies for security and compatibility"""
        try:
            validation_prompt = f"""
            Validate these {project_type} dependencies:
            {json.dumps(dependencies)}
            
            Check for:
            - Security vulnerabilities
            - Version compatibility
            - Deprecated packages
            - Better alternatives
            
            Return JSON:
            {{
                "issues": [
                    {{
                        "package": "package-name",
                        "issue_type": "security|deprecated|compatibility",
                        "severity": "high|medium|low",
                        "description": "Issue description",
                        "recommendation": "What to do"
                    }}
                ],
                "suggestions": [
                    {{
                        "package": "suggested-package",
                        "reason": "Why this is better"
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(validation_prompt)
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Failed to validate dependencies: {e}")
            return {"issues": [], "suggestions": []}
    
    async def _static_analysis(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Perform static code analysis"""
        errors = []
        
        if file_type == "python":
            try:
                ast.parse(code)
            except SyntaxError as e:
                errors.append({
                    "type": "syntax_error",
                    "severity": "high",
                    "message": str(e),
                    "line": e.lineno,
                    "column": e.offset
                })
        
        elif file_type in ["javascript", "typescript"]:
            # Basic JS/TS pattern checks
            if "var " in code:
                errors.append({
                    "type": "best_practice",
                    "severity": "medium",
                    "message": "Use 'const' or 'let' instead of 'var'",
                    "line": code.find("var ") + 1
                })
        
        return errors
    
    async def _pattern_based_detection(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Detect errors based on common patterns"""
        errors = []
        
        # Common mistake patterns
        patterns = {
            r'if\s*\([^)]*=\s*[^=]': {
                "message": "Assignment in if condition, did you mean '=='?",
                "severity": "high",
                "type": "logic_error"
            },
            r'console\.log\(': {
                "message": "Remove console.log before production",
                "severity": "low",
                "type": "cleanup"
            },
            r'debugger;': {
                "message": "Remove debugger statement before production",
                "severity": "medium",
                "type": "cleanup"
            }
        }
        
        for pattern, error_info in patterns.items():
            matches = re.finditer(pattern, code, re.IGNORECASE)
            for match in matches:
                line_num = code[:match.start()].count('\n') + 1
                errors.append({
                    **error_info,
                    "line": line_num,
                    "column": match.start() - code.rfind('\n', 0, match.start())
                })
        
        return errors
    
    async def _ai_error_analysis(
        self,
        code: str,
        file_type: str,
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Use AI to detect complex errors and issues"""
        try:
            analysis_prompt = f"""
            Analyze this {file_type} code for potential errors, bugs, and issues:
            
            {code[:3000]}  # Limit context
            
            Look for:
            - Logic errors
            - Performance issues
            - Security vulnerabilities
            - Type errors
            - Memory leaks
            - Race conditions
            
            Return JSON:
            {{
                "errors": [
                    {{
                        "type": "error_type",
                        "severity": "high|medium|low",
                        "message": "Error description",
                        "line": 10,
                        "suggestion": "How to fix it"
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(analysis_prompt)
            ai_data = json.loads(response)
            
            return ai_data.get("errors", [])
            
        except Exception as e:
            logger.error(f"AI error analysis failed: {e}")
            return []
    
    async def _quick_syntax_check(self, code: str, file_type: str) -> List[Dict[str, Any]]:
        """Quick syntax validation for real-time feedback"""
        warnings = []
        
        # Basic syntax checks
        if file_type in ["javascript", "typescript"]:
            # Check for unmatched brackets
            brackets = {"(": ")", "[": "]", "{": "}"}
            stack = []
            
            for i, char in enumerate(code):
                if char in brackets:
                    stack.append((char, i))
                elif char in brackets.values():
                    if not stack or brackets[stack[-1][0]] != char:
                        line_num = code[:i].count('\n') + 1
                        warnings.append({
                            "type": "syntax_warning",
                            "severity": "medium",
                            "message": f"Unmatched bracket: {char}",
                            "line": line_num
                        })
                    else:
                        stack.pop()
        
        return warnings
    
    async def _detect_common_mistakes(
        self,
        code: str,
        cursor_position: int,
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Detect common coding mistakes based on user history"""
        warnings = []
        
        # Get user's common mistake patterns
        user_history = self.user_error_history.get(user_id, {})
        
        # Check for patterns this user commonly makes
        for pattern, frequency in user_history.items():
            if frequency > 3 and pattern in code:  # Frequent mistake
                warnings.append({
                    "type": "personal_pattern",
                    "severity": "medium",
                    "message": f"You often make this mistake: {pattern}",
                    "line": code.find(pattern) + 1
                })
        
        return warnings
    
    def _rank_errors_by_severity(self, errors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank errors by severity and impact"""
        severity_order = {"high": 3, "medium": 2, "low": 1}
        
        return sorted(
            errors,
            key=lambda x: severity_order.get(x.get("severity", "low"), 1),
            reverse=True
        )
    
    async def _load_common_patterns(self):
        """Load common error patterns from database or configuration"""
        # This would typically load from a database
        self.common_patterns = {
            "javascript": [
                {"pattern": "if.*=.*[^=]", "message": "Assignment in condition"},
                {"pattern": "console.log", "message": "Debug code"},
            ],
            "python": [
                {"pattern": "print\\(", "message": "Debug code"},
            ]
        }
    
    async def record_user_error(
        self,
        user_id: str,
        error_type: str,
        error_pattern: str
    ):
        """Record user errors to improve personalized detection"""
        if user_id not in self.user_error_history:
            self.user_error_history[user_id] = {}
        
        if error_pattern not in self.user_error_history[user_id]:
            self.user_error_history[user_id][error_pattern] = 0
        
        self.user_error_history[user_id][error_pattern] += 1
        logger.info(f"Recorded error pattern for user {user_id}: {error_pattern}")