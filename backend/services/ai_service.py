"""
AI Service Layer for Puter.js Integration
Handles all AI operations with optimal model selection
"""
import asyncio
import time
import json
from typing import Optional, Dict, Any, List
import aiohttp
from models.ai_models import (
    AIFeature, ModelConfig, AIResponse,
    CodeCompletionRequest, CodeReviewRequest, DebugRequest,
    DocumentationRequest, VulnerabilityRequest, RefactorRequest,
    NLPToCodeRequest, ConversationRequest
)

class PuterAIService:
    """Service for interacting with Puter.js AI models"""
    
    def __init__(self):
        # Puter.js will be called from frontend, this service handles business logic
        self.model_config = ModelConfig()
        self.conversation_history: Dict[str, List[Dict]] = {}
    
    def get_system_prompt(self, feature: AIFeature, language: str = "python") -> str:
        """Get optimized system prompts for each feature"""
        
        prompts = {
            AIFeature.CODE_COMPLETION: f"""You are an expert {language} code completion assistant. 
Provide accurate, contextual code completions. Focus on:
- Syntactically correct code
- Following best practices
- Maintaining code style consistency
- Offering multiple relevant suggestions when appropriate""",

            AIFeature.CODE_REVIEW: f"""You are a senior {language} code reviewer. 
Analyze code thoroughly for:
- Security vulnerabilities
- Performance issues  
- Best practice violations
- Code quality and maintainability
- Potential bugs and edge cases
Provide specific, actionable feedback with examples.""",

            AIFeature.DEBUG_ASSISTANCE: f"""You are an expert {language} debugging assistant.
Help identify and fix issues by:
- Analyzing error messages and stack traces
- Suggesting root causes
- Providing step-by-step debugging strategies
- Recommending fixes with code examples""",

            AIFeature.DOCUMENTATION: f"""You are a technical documentation expert for {language}.
Generate comprehensive, clear documentation including:
- Function/class descriptions
- Parameter explanations
- Return value details
- Usage examples
- Edge cases and considerations""",

            AIFeature.VULNERABILITY_SCAN: f"""You are a security expert specializing in {language} code analysis.
Identify security vulnerabilities including:
- Injection attacks (SQL, XSS, etc.)
- Authentication/authorization flaws
- Data validation issues
- Cryptographic weaknesses
- Dependency vulnerabilities
Provide severity ratings and remediation steps.""",

            AIFeature.REFACTORING: f"""You are a {language} refactoring specialist.
Improve code quality through:
- Performance optimizations
- Code structure improvements
- Design pattern implementation
- Readability enhancements
- Maintainability improvements
Provide before/after examples with explanations.""",

            AIFeature.NLP_TO_CODE: f"""You are an expert {language} code generator.
Convert natural language descriptions to functional code:
- Write clean, efficient code
- Add appropriate comments
- Follow language conventions
- Include error handling
- Provide usage examples""",

            AIFeature.OPTIMIZATION: f"""You are a {language} performance optimization expert.
Analyze and improve code performance:
- Identify bottlenecks
- Suggest algorithmic improvements
- Recommend data structure optimizations
- Provide benchmarking strategies
- Consider memory usage and scalability""",
        }
        
        return prompts.get(feature, "You are a helpful AI assistant.")
    
    def prepare_prompt(self, feature: AIFeature, request_data: Dict, language: str) -> str:
        """Prepare optimized prompts for each feature"""
        
        system_prompt = self.get_system_prompt(feature, language)
        
        if feature == AIFeature.CODE_COMPLETION:
            return f"""{system_prompt}

Code context:
```{language}
{request_data.get('code_context', '')}
```

Cursor position: {request_data.get('cursor_position', 0)}
Provide {request_data.get('max_completions', 3)} relevant completions."""

        elif feature == AIFeature.CODE_REVIEW:
            return f"""{system_prompt}

Review this {language} code:
```{language}
{request_data.get('code', '')}
```

Focus areas: {', '.join(request_data.get('focus_areas', []))}
Provide detailed analysis with specific recommendations."""

        elif feature == AIFeature.DEBUG_ASSISTANCE:
            error_info = f"Error: {request_data.get('error_message', 'No error message provided')}" if request_data.get('error_message') else ""
            context_info = f"Context: {request_data.get('context', '')}" if request_data.get('context') else ""
            
            return f"""{system_prompt}

Code to debug:
```{language}
{request_data.get('code', '')}
```

{error_info}
{context_info}

Provide debugging analysis and solutions."""

        elif feature == AIFeature.DOCUMENTATION:
            return f"""{system_prompt}

Generate documentation for this {language} {request_data.get('doc_type', 'code')}:
```{language}
{request_data.get('code', '')}
```

Provide comprehensive documentation with examples."""

        elif feature == AIFeature.VULNERABILITY_SCAN:
            return f"""{system_prompt}

Scan this {language} code for security vulnerabilities:
```{language}
{request_data.get('code', '')}
```

Scan depth: {request_data.get('scan_depth', 'comprehensive')}
Provide detailed security analysis with severity ratings."""

        elif feature == AIFeature.REFACTORING:
            return f"""{system_prompt}

Refactor this {language} code:
```{language}
{request_data.get('code', '')}
```

Refactoring focus: {request_data.get('refactor_type', 'optimize')}
Provide improved code with explanations."""

        elif feature == AIFeature.NLP_TO_CODE:
            context_info = f"Context: {request_data.get('context', '')}" if request_data.get('context') else ""
            
            return f"""{system_prompt}

Convert this description to {language} code:
"{request_data.get('description', '')}"

{context_info}

Provide functional, well-commented code."""
        
        return f"{system_prompt}\n\nUser request: {request_data}"
    
    async def process_ai_request(
        self, 
        feature: AIFeature, 
        prompt: str, 
        session_id: Optional[str] = None
    ) -> AIResponse:
        """Process AI request and return structured response"""
        
        start_time = time.time()
        model = self.model_config.get_model_for_feature(feature)
        
        try:
            # For conversation features, maintain history
            if feature == AIFeature.CONVERSATION and session_id:
                if session_id not in self.conversation_history:
                    self.conversation_history[session_id] = []
                
                # Add context from previous messages
                context = self.conversation_history[session_id][-5:] if self.conversation_history[session_id] else []
                if context:
                    context_str = "\n".join([f"User: {msg.get('user', '')}\nAI: {msg.get('ai', '')}" for msg in context])
                    prompt = f"Previous conversation:\n{context_str}\n\nCurrent request: {prompt}"
            
            # This will be called via API from frontend using Puter.js
            # For now, return structured response format
            response = {
                "success": True,
                "response": f"[FRONTEND_PUTER_CALL] Feature: {feature.value} | Model: {model} | Ready for Puter.js integration",
                "model_used": model,
                "processing_time": time.time() - start_time,
                "prompt_prepared": prompt[:200] + "..." if len(prompt) > 200 else prompt
            }
            
            # Store conversation history
            if feature == AIFeature.CONVERSATION and session_id:
                self.conversation_history[session_id].append({
                    "user": prompt.split("Current request: ")[-1] if "Current request: " in prompt else prompt,
                    "ai": response["response"]
                })
            
            return AIResponse(**response)
            
        except Exception as e:
            return AIResponse(
                success=False,
                response=f"Error processing AI request: {str(e)}",
                model_used=model,
                processing_time=time.time() - start_time
            )
    
    # Feature-specific methods
    async def code_completion(self, request: CodeCompletionRequest) -> AIResponse:
        """Handle code completion requests"""
        prompt = self.prepare_prompt(
            AIFeature.CODE_COMPLETION, 
            request.dict(), 
            request.language
        )
        return await self.process_ai_request(AIFeature.CODE_COMPLETION, prompt)
    
    async def code_review(self, request: CodeReviewRequest) -> AIResponse:
        """Handle code review requests"""
        prompt = self.prepare_prompt(
            AIFeature.CODE_REVIEW,
            request.dict(),
            request.language
        )
        return await self.process_ai_request(AIFeature.CODE_REVIEW, prompt)
    
    async def debug_assistance(self, request: DebugRequest) -> AIResponse:
        """Handle debugging assistance requests"""
        prompt = self.prepare_prompt(
            AIFeature.DEBUG_ASSISTANCE,
            request.dict(),
            request.language
        )
        return await self.process_ai_request(AIFeature.DEBUG_ASSISTANCE, prompt)
    
    async def generate_documentation(self, request: DocumentationRequest) -> AIResponse:
        """Handle documentation generation requests"""
        prompt = self.prepare_prompt(
            AIFeature.DOCUMENTATION,
            request.dict(),
            request.language
        )
        return await self.process_ai_request(AIFeature.DOCUMENTATION, prompt)
    
    async def vulnerability_scan(self, request: VulnerabilityRequest) -> AIResponse:
        """Handle vulnerability scanning requests"""
        prompt = self.prepare_prompt(
            AIFeature.VULNERABILITY_SCAN,
            request.dict(),
            request.language
        )
        return await self.process_ai_request(AIFeature.VULNERABILITY_SCAN, prompt)
    
    async def code_refactor(self, request: RefactorRequest) -> AIResponse:
        """Handle code refactoring requests"""
        prompt = self.prepare_prompt(
            AIFeature.REFACTORING,
            request.dict(),
            request.language
        )
        return await self.process_ai_request(AIFeature.REFACTORING, prompt)
    
    async def nlp_to_code(self, request: NLPToCodeRequest) -> AIResponse:
        """Handle natural language to code requests"""
        prompt = self.prepare_prompt(
            AIFeature.NLP_TO_CODE,
            request.dict(),
            request.language
        )
        return await self.process_ai_request(AIFeature.NLP_TO_CODE, prompt)
    
    async def conversation(self, request: ConversationRequest) -> AIResponse:
        """Handle multi-turn conversation requests"""
        prompt = self.prepare_prompt(
            AIFeature.CONVERSATION,
            {"message": request.message},
            "general"
        )
        return await self.process_ai_request(
            AIFeature.CONVERSATION, 
            prompt, 
            request.session_id
        )

# Global AI service instance
ai_service = PuterAIService()