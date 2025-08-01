from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime
from services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

class AICodeCompletion:
    """AI-powered code completion and suggestions service"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.completion_cache = {}
        self.user_preferences = {}
        
    async def initialize(self):
        """Initialize the code completion service"""
        try:
            await self.ai_service.initialize()
            logger.info("AI Code Completion service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize code completion: {e}")
            raise
    
    async def get_code_completions(
        self, 
        code_context: str, 
        cursor_position: int,
        file_type: str = "javascript",
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Get intelligent code completions"""
        try:
            # Analyze code context
            context_analysis = await self._analyze_code_context(
                code_context, cursor_position, file_type
            )
            
            # Get user preferences
            user_prefs = self.user_preferences.get(user_id, {})
            
            # Generate completions using AI
            completions = await self._generate_completions(
                context_analysis, user_prefs, file_type
            )
            
            # Rank and filter completions
            ranked_completions = await self._rank_completions(
                completions, context_analysis, user_prefs
            )
            
            return ranked_completions[:10]  # Return top 10 suggestions
            
        except Exception as e:
            logger.error(f"Failed to get code completions: {e}")
            return []
    
    async def get_smart_suggestions(
        self,
        code_context: str,
        issue_type: str = "optimization",
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Get smart code improvement suggestions"""
        try:
            suggestions_prompt = f"""
            Analyze this code and provide smart suggestions for {issue_type}:
            
            Code:
            {code_context}
            
            Provide suggestions in this JSON format:
            {{
                "suggestions": [
                    {{
                        "type": "performance|readability|security|best_practice",
                        "title": "Brief title",
                        "description": "Detailed explanation",
                        "before": "Original code snippet",
                        "after": "Improved code snippet",
                        "impact": "high|medium|low",
                        "confidence": 0.95
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(suggestions_prompt)
            suggestions_data = json.loads(response)
            
            return suggestions_data.get("suggestions", [])
            
        except Exception as e:
            logger.error(f"Failed to get smart suggestions: {e}")
            return []
    
    async def get_contextual_documentation(
        self,
        code_snippet: str,
        language: str = "javascript"
    ) -> Dict[str, Any]:
        """Generate contextual documentation for code"""
        try:
            doc_prompt = f"""
            Generate comprehensive documentation for this {language} code:
            
            {code_snippet}
            
            Return JSON with:
            {{
                "summary": "Brief description",
                "parameters": [
                    {{"name": "param", "type": "string", "description": "desc"}}
                ],
                "returns": {{"type": "object", "description": "return desc"}},
                "examples": ["example usage"],
                "complexity": "O(n)",
                "best_practices": ["tip1", "tip2"]
            }}
            """
            
            response = await self.ai_service.process_message(doc_prompt)
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Failed to generate documentation: {e}")
            return {}
    
    async def detect_code_patterns(
        self,
        codebase: str,
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """Detect reusable patterns in codebase"""
        try:
            pattern_prompt = f"""
            Analyze this codebase and identify reusable patterns:
            
            {codebase[:5000]}  # Limit context
            
            Return JSON with patterns:
            {{
                "patterns": [
                    {{
                        "name": "Pattern Name",
                        "type": "component|function|hook|utility",
                        "description": "What this pattern does",
                        "occurrences": 3,
                        "template": "Code template",
                        "benefits": ["Reusability", "Maintainability"]
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(pattern_prompt)
            patterns_data = json.loads(response)
            
            return patterns_data.get("patterns", [])
            
        except Exception as e:
            logger.error(f"Failed to detect patterns: {e}")
            return []
    
    async def _analyze_code_context(
        self,
        code: str,
        position: int,
        file_type: str
    ) -> Dict[str, Any]:
        """Analyze code context around cursor position"""
        # Get surrounding lines
        lines = code.split('\n')
        line_index = code[:position].count('\n')
        
        # Context window
        start = max(0, line_index - 5)
        end = min(len(lines), line_index + 5)
        context_lines = lines[start:end]
        
        return {
            "current_line": lines[line_index] if line_index < len(lines) else "",
            "context_lines": context_lines,
            "file_type": file_type,
            "cursor_position": position,
            "line_number": line_index + 1,
            "indentation": len(lines[line_index]) - len(lines[line_index].lstrip()) if line_index < len(lines) else 0
        }
    
    async def _generate_completions(
        self,
        context: Dict[str, Any],
        user_prefs: Dict[str, Any],
        file_type: str
    ) -> List[Dict[str, Any]]:
        """Generate code completions using AI"""
        completion_prompt = f"""
        Generate code completions for {file_type} based on this context:
        
        Current line: {context['current_line']}
        Context:
        {chr(10).join(context['context_lines'])}
        
        User preferences: {json.dumps(user_prefs)}
        
        Return JSON with completions:
        {{
            "completions": [
                {{
                    "text": "completion text",
                    "type": "method|variable|keyword|snippet",
                    "description": "What this does",
                    "score": 0.95
                }}
            ]
        }}
        """
        
        try:
            response = await self.ai_service.process_message(completion_prompt)
            completions_data = json.loads(response)
            return completions_data.get("completions", [])
        except:
            return []
    
    async def _rank_completions(
        self,
        completions: List[Dict[str, Any]],
        context: Dict[str, Any],
        user_prefs: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Rank completions by relevance and user preferences"""
        # Sort by AI confidence score and user preferences
        return sorted(
            completions,
            key=lambda x: x.get("score", 0.0),
            reverse=True
        )
    
    async def update_user_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ):
        """Update user-specific completion preferences"""
        self.user_preferences[user_id] = preferences
        logger.info(f"Updated preferences for user {user_id}")
    
    async def learn_from_selection(
        self,
        user_id: str,
        context: Dict[str, Any],
        selected_completion: Dict[str, Any]
    ):
        """Learn from user's completion selections"""
        # This would typically update ML models or preference weights
        logger.info(f"Learning from selection for user {user_id}")