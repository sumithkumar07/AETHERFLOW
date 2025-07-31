import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import os
import httpx
from enum import Enum

from services.ai_service import AIService
from services.compliance_engine import ComplianceEngine

logger = logging.getLogger(__name__)

class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    PUTER = "puter"
    CUSTOM = "custom"

class ModelTier(str, Enum):
    BASIC = "basic"
    ADVANCED = "advanced"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class EnhancedAIService(AIService):
    """Enhanced AI service with multiple providers, compliance, and enterprise features"""
    
    def __init__(self, db_client=None):
        super().__init__()
        self.db = db_client
        self.compliance_engine = ComplianceEngine(db_client) if db_client else None
        self.providers = {}
        self.model_configs = {}
        self.usage_tracking = {}
        self.load_balancer = ModelLoadBalancer()
        
    async def initialize(self):
        """Initialize enhanced AI service with multiple providers"""
        try:
            await super().initialize()
            
            if self.compliance_engine:
                await self.compliance_engine.initialize()
            
            # Initialize AI providers
            await self._initialize_providers()
            
            # Setup model configurations
            await self._setup_model_configurations()
            
            # Initialize usage tracking
            self.usage_tracking = {
                "requests_count": 0,
                "tokens_used": 0,
                "cost_estimate": 0.0,
                "provider_usage": {},
                "model_usage": {}
            }
            
            logger.info("Enhanced AI service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize enhanced AI service: {e}")
            raise
    
    async def _initialize_providers(self):
        """Initialize multiple AI providers"""
        # OpenAI Provider
        if os.environ.get("OPENAI_API_KEY"):
            self.providers[AIProvider.OPENAI] = OpenAIProvider(os.environ.get("OPENAI_API_KEY"))
        
        # Anthropic Provider
        if os.environ.get("ANTHROPIC_API_KEY"):
            self.providers[AIProvider.ANTHROPIC] = AnthropicProvider(os.environ.get("ANTHROPIC_API_KEY"))
        
        # Google Provider
        if os.environ.get("GOOGLE_API_KEY"):
            self.providers[AIProvider.GOOGLE] = GoogleProvider(os.environ.get("GOOGLE_API_KEY"))
        
        # Puter.js Provider (always available, free)
        self.providers[AIProvider.PUTER] = PuterProvider()
        
        logger.info(f"Initialized {len(self.providers)} AI providers")
    
    async def _setup_model_configurations(self):
        """Setup detailed model configurations"""
        self.model_configs = {
            # OpenAI Models
            "gpt-4o": {
                "provider": AIProvider.OPENAI,
                "tier": ModelTier.PREMIUM,
                "context_length": 128000,
                "capabilities": ["text", "vision", "code", "reasoning"],
                "cost_per_1k_tokens": {"input": 0.005, "output": 0.015},
                "rate_limits": {"requests_per_minute": 10000, "tokens_per_minute": 30000}
            },
            "gpt-4o-mini": {
                "provider": AIProvider.OPENAI,
                "tier": ModelTier.ADVANCED,
                "context_length": 128000,
                "capabilities": ["text", "vision", "code"],
                "cost_per_1k_tokens": {"input": 0.00015, "output": 0.0006},
                "rate_limits": {"requests_per_minute": 10000, "tokens_per_minute": 200000}
            },
            "gpt-4": {
                "provider": AIProvider.OPENAI,
                "tier": ModelTier.PREMIUM,
                "context_length": 8192,
                "capabilities": ["text", "code", "reasoning"],
                "cost_per_1k_tokens": {"input": 0.03, "output": 0.06},
                "rate_limits": {"requests_per_minute": 10000, "tokens_per_minute": 10000}
            },
            
            # Anthropic Models
            "claude-3.5-sonnet": {
                "provider": AIProvider.ANTHROPIC,
                "tier": ModelTier.PREMIUM,
                "context_length": 200000,
                "capabilities": ["text", "code", "reasoning", "analysis"],
                "cost_per_1k_tokens": {"input": 0.003, "output": 0.015},
                "rate_limits": {"requests_per_minute": 4000, "tokens_per_minute": 40000}
            },
            "claude-3-haiku": {
                "provider": AIProvider.ANTHROPIC,
                "tier": ModelTier.ADVANCED,
                "context_length": 200000,
                "capabilities": ["text", "code"],
                "cost_per_1k_tokens": {"input": 0.00025, "output": 0.00125},
                "rate_limits": {"requests_per_minute": 4000, "tokens_per_minute": 100000}
            },
            
            # Google Models
            "gemini-2.0-flash": {
                "provider": AIProvider.GOOGLE,
                "tier": ModelTier.PREMIUM,
                "context_length": 1000000,
                "capabilities": ["text", "vision", "audio", "code", "multimodal"],
                "cost_per_1k_tokens": {"input": 0.00075, "output": 0.003},
                "rate_limits": {"requests_per_minute": 2000, "tokens_per_minute": 32000}
            },
            "gemini-1.5-pro": {
                "provider": AIProvider.GOOGLE,
                "tier": ModelTier.PREMIUM,
                "context_length": 2000000,
                "capabilities": ["text", "vision", "audio", "code"],
                "cost_per_1k_tokens": {"input": 0.00125, "output": 0.005},
                "rate_limits": {"requests_per_minute": 360, "tokens_per_minute": 32000}
            },
            
            # Puter.js Models (Free)
            "gpt-4.1-nano": {
                "provider": AIProvider.PUTER,
                "tier": ModelTier.ADVANCED,
                "context_length": 4096,
                "capabilities": ["text", "code"],
                "cost_per_1k_tokens": {"input": 0.0, "output": 0.0},
                "rate_limits": {"requests_per_minute": -1, "tokens_per_minute": -1}  # Unlimited
            },
            "claude-sonnet-4": {
                "provider": AIProvider.PUTER,
                "tier": ModelTier.PREMIUM,
                "context_length": 8192,
                "capabilities": ["text", "code", "reasoning"],
                "cost_per_1k_tokens": {"input": 0.0, "output": 0.0},
                "rate_limits": {"requests_per_minute": -1, "tokens_per_minute": -1}
            }
        }
    
    async def process_message_enhanced(self, content: str, model: str = "gpt-4o-mini", 
                                     context: Dict[str, Any] = None, 
                                     compliance_check: bool = True) -> Dict[str, Any]:
        """Enhanced message processing with compliance, multi-provider support"""
        try:
            context = context or {}
            
            # 1. Compliance and Safety Check (Input)
            if compliance_check and self.compliance_engine:
                content_validation = await self.compliance_engine.validate_content(content, context)
                
                if not content_validation["is_safe"]:
                    return {
                        "type": "error",
                        "content": "Content blocked by safety filters",
                        "details": content_validation,
                        "compliance_status": "blocked"
                    }
                
                # Use masked content if needed
                content = content_validation["masked_content"]
            
            # 2. Model Selection and Load Balancing
            selected_model, provider = await self.load_balancer.select_optimal_model(
                model, self.model_configs, context
            )
            
            # 3. Generate Response
            response = await self._generate_response_with_provider(
                provider, selected_model, content, context
            )
            
            # 4. Compliance Check (Output)
            if compliance_check and self.compliance_engine and response.get("content"):
                output_validation = await self.compliance_engine.validate_content(
                    response["content"], context
                )
                
                if not output_validation["is_safe"]:
                    response["content"] = output_validation["masked_content"]
                    response["compliance_warnings"] = output_validation["violations"]
                
                # Code validation if response contains code
                if response.get("code"):
                    code_validation = await self.compliance_engine.validate_code(
                        response["code"], 
                        response.get("language", "javascript"), 
                        context
                    )
                    
                    if not code_validation["is_safe"]:
                        response["code"] = code_validation["sanitized_code"]
                        response["security_warnings"] = code_validation["vulnerabilities"]
                        response["security_score"] = code_validation["security_score"]
            
            # 5. Usage Tracking
            await self._track_usage(selected_model, provider, response)
            
            # 6. Audit Logging
            if self.compliance_engine:
                await self.compliance_engine.log_audit_event(
                    user_id=context.get("user_id", "anonymous"),
                    action="ai_request",
                    resource_type="ai_model",
                    resource_id=selected_model,
                    details={
                        "provider": provider.value,
                        "input_length": len(content),
                        "output_length": len(response.get("content", "")),
                        "compliance_checked": compliance_check
                    }
                )
            
            return response
            
        except Exception as e:
            logger.error(f"Enhanced AI processing failed: {e}")
            return {
                "type": "error",
                "content": "AI processing failed",
                "error": str(e)
            }
    
    async def _generate_response_with_provider(self, provider: AIProvider, model: str, 
                                             content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate response using specific provider"""
        provider_instance = self.providers.get(provider)
        if not provider_instance:
            raise ValueError(f"Provider {provider} not available")
        
        return await provider_instance.generate_response(model, content, context)
    
    async def generate_code_enhanced(self, requirements: str, language: str = "javascript",
                                   framework: str = None, model: str = "gpt-4o",
                                   context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Enhanced code generation with security validation"""
        try:
            context = context or {}
            context.update({
                "task_type": "code_generation",
                "language": language,
                "framework": framework
            })
            
            # Enhanced prompt for code generation
            enhanced_prompt = self._create_code_generation_prompt(requirements, language, framework)
            
            # Generate code using enhanced processing
            response = await self.process_message_enhanced(
                enhanced_prompt, 
                model=model, 
                context=context, 
                compliance_check=True
            )
            
            if response.get("type") == "error":
                return response
            
            # Extract and structure code from response
            code_result = await self._extract_and_structure_code(response, language, framework)
            
            # Additional code-specific enhancements
            if code_result.get("code"):
                # Add code documentation
                code_result["documentation"] = await self._generate_code_documentation(
                    code_result["code"], language, context
                )
                
                # Generate tests
                code_result["tests"] = await self._generate_code_tests(
                    code_result["code"], language, framework, context
                )
                
                # Performance analysis
                code_result["performance_analysis"] = await self._analyze_code_performance(
                    code_result["code"], language
                )
            
            return code_result
            
        except Exception as e:
            logger.error(f"Enhanced code generation failed: {e}")
            return {
                "type": "error",
                "content": "Code generation failed",
                "error": str(e)
            }
    
    def _create_code_generation_prompt(self, requirements: str, language: str, framework: str = None) -> str:
        """Create enhanced prompt for code generation"""
        prompt = f"""
        As an expert {language} developer, generate high-quality, production-ready code for the following requirements:

        REQUIREMENTS:
        {requirements}

        SPECIFICATIONS:
        - Language: {language}
        {f"- Framework: {framework}" if framework else ""}
        - Include comprehensive error handling
        - Follow best practices and design patterns
        - Add clear comments and documentation
        - Ensure security considerations
        - Make code maintainable and scalable

        DELIVERY FORMAT:
        1. Main code implementation
        2. Brief explanation of the approach
        3. Usage examples
        4. Potential improvements or considerations

        Generate clean, well-structured code that follows industry standards.
        """
        
        return prompt
    
    async def _generate_code_documentation(self, code: str, language: str, context: Dict[str, Any]) -> str:
        """Generate comprehensive documentation for code"""
        doc_prompt = f"""
        Generate comprehensive documentation for this {language} code:

        ```{language}
        {code}
        ```

        Include:
        1. Overview of what the code does
        2. Function/class descriptions
        3. Parameter explanations
        4. Return value descriptions
        5. Usage examples
        6. Dependencies required
        """
        
        response = await self.process_message_enhanced(doc_prompt, model="gpt-4o-mini", context=context)
        return response.get("content", "Documentation generation failed")
    
    async def _generate_code_tests(self, code: str, language: str, framework: str, context: Dict[str, Any]) -> str:
        """Generate comprehensive tests for code"""
        test_frameworks = {
            "javascript": "Jest",
            "typescript": "Jest",
            "python": "pytest",
            "java": "JUnit",
            "c#": "NUnit"
        }
        
        test_framework = test_frameworks.get(language.lower(), "appropriate testing framework")
        
        test_prompt = f"""
        Generate comprehensive unit tests for this {language} code using {test_framework}:

        ```{language}
        {code}
        ```

        Include:
        1. Test setup and teardown
        2. Positive test cases
        3. Negative test cases (error conditions)
        4. Edge cases
        5. Mock external dependencies if needed
        6. Assertions for all expected behaviors
        """
        
        response = await self.process_message_enhanced(test_prompt, model="gpt-4o-mini", context=context)
        return response.get("content", "Test generation failed")
    
    async def _analyze_code_performance(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code performance characteristics"""
        try:
            analysis_prompt = f"""
            Analyze the performance characteristics of this {language} code:

            ```{language}
            {code}
            ```

            Provide analysis on:
            1. Time complexity (Big O notation)
            2. Space complexity
            3. Potential bottlenecks
            4. Optimization opportunities
            5. Memory usage considerations
            6. Scalability factors

            Format as JSON with clear metrics and recommendations.
            """
            
            response = await self.process_message_enhanced(
                analysis_prompt, 
                model="gpt-4o-mini",
                context={"task_type": "performance_analysis"}
            )
            
            # Try to parse JSON response
            try:
                return json.loads(response.get("content", "{}"))
            except:
                return {
                    "analysis": response.get("content", "Analysis failed"),
                    "complexity": "Unknown",
                    "recommendations": []
                }
                
        except Exception as e:
            return {
                "error": str(e),
                "analysis": "Performance analysis failed"
            }
    
    async def create_specialized_agent_prompt(self, agent_type: str, task: str, context: Dict[str, Any]) -> str:
        """Create specialized prompts for different agent types"""
        agent_prompts = {
            "developer": """
            You are an expert software developer with years of experience in full-stack development.
            You excel at writing clean, efficient, and maintainable code.
            You understand modern development practices, design patterns, and best practices.
            You always consider security, performance, and scalability in your solutions.
            """,
            "architect": """
            You are a senior software architect with expertise in system design and architecture.
            You excel at designing scalable, maintainable, and robust systems.
            You consider all aspects: performance, security, maintainability, and business requirements.
            You provide comprehensive architectural guidance and technical decisions.
            """,
            "tester": """
            You are a quality assurance expert specializing in comprehensive testing strategies.
            You excel at creating thorough test plans, identifying edge cases, and ensuring quality.
            You understand various testing methodologies: unit, integration, end-to-end, and performance testing.
            You always consider user experience and system reliability.
            """,
            "security": """
            You are a cybersecurity expert with deep knowledge of application security.
            You excel at identifying vulnerabilities, implementing security measures, and ensuring compliance.
            You understand OWASP guidelines, security best practices, and threat modeling.
            You always prioritize data protection and system security.
            """,
            "deployer": """
            You are a DevOps engineer expert in deployment automation and infrastructure management.
            You excel at creating CI/CD pipelines, managing cloud infrastructure, and ensuring reliability.
            You understand containerization, orchestration, monitoring, and scalability.
            You always consider automation, reliability, and operational efficiency.
            """
        }
        
        base_prompt = agent_prompts.get(agent_type, agent_prompts["developer"])
        
        return f"""
        {base_prompt}
        
        Current Task: {task}
        
        Context: {json.dumps(context, indent=2)}
        
        Please provide a comprehensive solution that addresses all aspects of this task.
        Consider best practices, potential challenges, and provide actionable guidance.
        """
    
    async def get_ai_metrics_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive AI service metrics"""
        return {
            "providers": {
                provider.value: {
                    "available": provider in self.providers,
                    "models": [model for model, config in self.model_configs.items() 
                             if config["provider"] == provider]
                }
                for provider in AIProvider
            },
            "usage_stats": self.usage_tracking,
            "model_performance": await self._get_model_performance_stats(),
            "compliance_stats": await self._get_compliance_stats() if self.compliance_engine else {},
            "cost_breakdown": await self._calculate_cost_breakdown(),
            "rate_limit_status": await self._get_rate_limit_status()
        }
    
    async def _track_usage(self, model: str, provider: AIProvider, response: Dict[str, Any]):
        """Track AI service usage for analytics and billing"""
        self.usage_tracking["requests_count"] += 1
        
        # Estimate token usage
        input_tokens = len(response.get("input", "")) // 4  # Rough estimation
        output_tokens = len(response.get("content", "")) // 4
        total_tokens = input_tokens + output_tokens
        
        self.usage_tracking["tokens_used"] += total_tokens
        
        # Track provider usage
        if provider.value not in self.usage_tracking["provider_usage"]:
            self.usage_tracking["provider_usage"][provider.value] = {"requests": 0, "tokens": 0}
        
        self.usage_tracking["provider_usage"][provider.value]["requests"] += 1
        self.usage_tracking["provider_usage"][provider.value]["tokens"] += total_tokens
        
        # Track model usage
        if model not in self.usage_tracking["model_usage"]:
            self.usage_tracking["model_usage"][model] = {"requests": 0, "tokens": 0}
        
        self.usage_tracking["model_usage"][model]["requests"] += 1
        self.usage_tracking["model_usage"][model]["tokens"] += total_tokens
        
        # Calculate cost estimate
        model_config = self.model_configs.get(model, {})
        cost_config = model_config.get("cost_per_1k_tokens", {"input": 0, "output": 0})
        
        cost = (input_tokens / 1000 * cost_config["input"]) + (output_tokens / 1000 * cost_config["output"])
        self.usage_tracking["cost_estimate"] += cost


class ModelLoadBalancer:
    """Intelligent model load balancing and selection"""
    
    def __init__(self):
        self.model_performance = {}
        self.current_loads = {}
    
    async def select_optimal_model(self, requested_model: str, model_configs: Dict[str, Any], 
                                 context: Dict[str, Any]) -> tuple[str, AIProvider]:
        """Select optimal model based on availability, performance, and context"""
        # If specific model requested and available, use it
        if requested_model in model_configs:
            config = model_configs[requested_model]
            return requested_model, config["provider"]
        
        # Otherwise, select best alternative
        task_type = context.get("task_type", "general")
        
        # Get models suitable for task type
        suitable_models = []
        for model, config in model_configs.items():
            if self._is_model_suitable(config, task_type, context):
                suitable_models.append((model, config))
        
        if not suitable_models:
            # Fallback to any available model
            suitable_models = list(model_configs.items())
        
        # Select best model based on criteria
        best_model = self._rank_models(suitable_models, context)[0]
        return best_model[0], best_model[1]["provider"]
    
    def _is_model_suitable(self, config: Dict[str, Any], task_type: str, context: Dict[str, Any]) -> bool:
        """Check if model is suitable for the task"""
        capabilities = config.get("capabilities", [])
        
        task_requirements = {
            "code_generation": ["code"],
            "image_analysis": ["vision"],
            "audio_processing": ["audio"],
            "reasoning": ["reasoning"],
            "general": ["text"]
        }
        
        required_caps = task_requirements.get(task_type, ["text"])
        return any(cap in capabilities for cap in required_caps)
    
    def _rank_models(self, models: List[tuple], context: Dict[str, Any]) -> List[tuple]:
        """Rank models by suitability score"""
        scored_models = []
        
        for model, config in models:
            score = self._calculate_model_score(model, config, context)
            scored_models.append((model, config, score))
        
        # Sort by score (highest first)
        scored_models.sort(key=lambda x: x[2], reverse=True)
        
        return [(model, config) for model, config, _ in scored_models]
    
    def _calculate_model_score(self, model: str, config: Dict[str, Any], context: Dict[str, Any]) -> float:
        """Calculate suitability score for a model"""
        score = 0.0
        
        # Tier scoring
        tier_scores = {
            ModelTier.ENTERPRISE: 100,
            ModelTier.PREMIUM: 80,
            ModelTier.ADVANCED: 60,
            ModelTier.BASIC: 40
        }
        score += tier_scores.get(config.get("tier"), 40)
        
        # Cost efficiency (free models get bonus)
        cost = config.get("cost_per_1k_tokens", {}).get("input", 0)
        if cost == 0:
            score += 20  # Bonus for free models
        
        # Context length bonus for long contexts
        context_length = len(context.get("content", ""))
        model_context_limit = config.get("context_length", 4096)
        if context_length < model_context_limit * 0.8:  # Within 80% of limit
            score += 10
        
        # Performance history
        performance = self.model_performance.get(model, {})
        avg_response_time = performance.get("avg_response_time", 5.0)
        score += max(0, 10 - avg_response_time)  # Faster models get higher scores
        
        return score


# Provider implementations would go here
class OpenAIProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def generate_response(self, model: str, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Implementation for OpenAI API calls
        return {"content": "OpenAI response", "model": model}

class AnthropicProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def generate_response(self, model: str, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Implementation for Anthropic API calls
        return {"content": "Anthropic response", "model": model}

class GoogleProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def generate_response(self, model: str, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Implementation for Google API calls
        return {"content": "Google response", "model": model}

class PuterProvider:
    def __init__(self):
        pass
    
    async def generate_response(self, model: str, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Implementation for Puter.js calls
        return {"content": "Puter response", "model": model}