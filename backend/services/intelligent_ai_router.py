import logging
import asyncio
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import re
import time

logger = logging.getLogger(__name__)

class TaskComplexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    EXPERT = "expert"

class TaskType(Enum):
    CODE_GENERATION = "code_generation"
    DEBUG_ANALYSIS = "debug_analysis"
    CREATIVE_WRITING = "creative_writing"
    DATA_ANALYSIS = "data_analysis"
    GENERAL_CHAT = "general_chat"
    PROJECT_PLANNING = "project_planning"

@dataclass
class ModelCapabilities:
    name: str
    cost_per_token: float
    max_tokens: int
    strengths: List[str]
    speed_score: float  # 1-10, 10 being fastest
    quality_score: float  # 1-10, 10 being highest quality
    specialized_for: List[TaskType]

@dataclass
class TaskAnalysis:
    complexity: TaskComplexity
    task_type: TaskType
    estimated_tokens: int
    priority: str
    requires_creativity: bool
    requires_code: bool
    context_size: int

class IntelligentAIRouter:
    """Advanced AI model router with intelligent selection and optimization"""
    
    def __init__(self):
        self.models = self._initialize_models()
        self.performance_history = {}
        self.fallback_chains = {}
        self.load_balancer = ModelLoadBalancer()
        self.response_cache = ResponseCache()
        
    async def initialize(self):
        """Initialize the AI router"""
        try:
            await self.load_balancer.initialize()
            await self.response_cache.initialize()
            logger.info("Intelligent AI Router initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AI router: {e}")
            # Continue anyway for graceful degradation
            pass
    
    def _initialize_models(self) -> Dict[str, ModelCapabilities]:
        """Initialize available AI models with their capabilities"""
        return {
            "gpt-4o-mini": ModelCapabilities(
                name="gpt-4o-mini",
                cost_per_token=0.00015,
                max_tokens=128000,
                strengths=["fast", "efficient", "general"],
                speed_score=9.0,
                quality_score=7.0,
                specialized_for=[TaskType.GENERAL_CHAT, TaskType.CODE_GENERATION]
            ),
            "gpt-4": ModelCapabilities(
                name="gpt-4",
                cost_per_token=0.03,
                max_tokens=8192,
                strengths=["creative", "complex_reasoning", "high_quality"],
                speed_score=6.0,
                quality_score=9.5,
                specialized_for=[TaskType.CREATIVE_WRITING, TaskType.PROJECT_PLANNING]
            ),
            "claude-3-sonnet": ModelCapabilities(
                name="claude-3-sonnet",
                cost_per_token=0.015,
                max_tokens=200000,
                strengths=["code", "analysis", "large_context"],
                speed_score=7.0,
                quality_score=9.0,
                specialized_for=[TaskType.CODE_GENERATION, TaskType.DEBUG_ANALYSIS]
            ),
            "gemini-2.5-flash": ModelCapabilities(
                name="gemini-2.5-flash",
                cost_per_token=0.0001,
                max_tokens=1000000,
                strengths=["multimodal", "fast", "large_context"],
                speed_score=8.5,
                quality_score=8.0,
                specialized_for=[TaskType.DATA_ANALYSIS, TaskType.CODE_GENERATION]
            )
        }
    
    async def select_optimal_model(self, task: str, context: Dict[str, Any] = None) -> str:
        """Select the optimal model based on task analysis"""
        try:
            # Analyze the task
            analysis = await self._analyze_task(task, context)
            
            # Get candidate models
            candidates = self._get_candidate_models(analysis)
            
            # Score and rank models
            scored_models = await self._score_models(candidates, analysis, context)
            
            # Select best model considering load balancing
            selected_model = await self.load_balancer.select_best_available(scored_models)
            
            logger.info(f"Selected model: {selected_model} for task type: {analysis.task_type}")
            return selected_model
            
        except Exception as e:
            logger.error(f"Error in model selection: {e}")
            return "gpt-4o-mini"  # Safe fallback
    
    async def _analyze_task(self, task: str, context: Dict[str, Any] = None) -> TaskAnalysis:
        """Analyze task to determine complexity and requirements"""
        task_lower = task.lower()
        
        # Determine task type
        task_type = self._classify_task_type(task_lower)
        
        # Determine complexity
        complexity = self._assess_complexity(task_lower, context)
        
        # Estimate token requirements
        estimated_tokens = len(task.split()) * 1.3  # Rough estimation
        
        # Check requirements
        requires_creativity = any(word in task_lower for word in [
            "creative", "design", "story", "poem", "artistic", "innovative"
        ])
        
        requires_code = any(word in task_lower for word in [
            "code", "function", "class", "api", "database", "frontend", "backend"
        ])
        
        context_size = len(str(context)) if context else 0
        
        return TaskAnalysis(
            complexity=complexity,
            task_type=task_type,
            estimated_tokens=int(estimated_tokens),
            priority="normal",
            requires_creativity=requires_creativity,
            requires_code=requires_code,
            context_size=context_size
        )
    
    def _classify_task_type(self, task_lower: str) -> TaskType:
        """Classify the type of task"""
        if any(word in task_lower for word in ["code", "function", "api", "component"]):
            return TaskType.CODE_GENERATION
        elif any(word in task_lower for word in ["debug", "error", "fix", "issue"]):
            return TaskType.DEBUG_ANALYSIS
        elif any(word in task_lower for word in ["creative", "story", "design", "artistic"]):
            return TaskType.CREATIVE_WRITING
        elif any(word in task_lower for word in ["analyze", "data", "chart", "statistics"]):
            return TaskType.DATA_ANALYSIS
        elif any(word in task_lower for word in ["plan", "project", "architecture", "strategy"]):
            return TaskType.PROJECT_PLANNING
        else:
            return TaskType.GENERAL_CHAT
    
    def _assess_complexity(self, task_lower: str, context: Dict[str, Any] = None) -> TaskComplexity:
        """Assess task complexity"""
        complexity_indicators = {
            TaskComplexity.SIMPLE: ["hello", "what", "how", "simple", "basic"],
            TaskComplexity.MODERATE: ["create", "build", "develop", "implement"],
            TaskComplexity.COMPLEX: ["architecture", "system", "complex", "advanced", "optimize"],
            TaskComplexity.EXPERT: ["enterprise", "scalable", "distributed", "microservices"]
        }
        
        scores = {}
        for complexity, indicators in complexity_indicators.items():
            score = sum(1 for indicator in indicators if indicator in task_lower)
            scores[complexity] = score
        
        # Context complexity
        if context:
            context_complexity = len(str(context)) / 1000  # Rough measure
            if context_complexity > 5:
                scores[TaskComplexity.COMPLEX] += 2
            elif context_complexity > 2:
                scores[TaskComplexity.MODERATE] += 1
        
        return max(scores, key=scores.get)
    
    def _get_candidate_models(self, analysis: TaskAnalysis) -> List[str]:
        """Get candidate models based on task analysis"""
        candidates = []
        
        for model_name, capabilities in self.models.items():
            # Check if model specializes in this task type
            if analysis.task_type in capabilities.specialized_for:
                candidates.append(model_name)
            # Check if model can handle the complexity
            elif analysis.complexity == TaskComplexity.SIMPLE and capabilities.speed_score >= 8:
                candidates.append(model_name)
            elif analysis.complexity == TaskComplexity.EXPERT and capabilities.quality_score >= 9:
                candidates.append(model_name)
        
        # Ensure we always have candidates
        if not candidates:
            candidates = list(self.models.keys())
        
        return candidates
    
    async def _score_models(self, candidates: List[str], analysis: TaskAnalysis, context: Dict[str, Any]) -> List[Tuple[str, float]]:
        """Score and rank candidate models"""
        scored_models = []
        
        for model_name in candidates:
            capabilities = self.models[model_name]
            score = 0.0
            
            # Base score from specialization
            if analysis.task_type in capabilities.specialized_for:
                score += 3.0
            
            # Complexity matching
            if analysis.complexity == TaskComplexity.SIMPLE:
                score += capabilities.speed_score * 0.4
                score += (10 - capabilities.cost_per_token * 1000) * 0.3
            elif analysis.complexity == TaskComplexity.EXPERT:
                score += capabilities.quality_score * 0.5
                score += capabilities.max_tokens / 10000 * 0.2
            
            # Performance history
            history_score = await self._get_historical_performance(model_name, analysis.task_type)
            score += history_score * 0.3
            
            # Load balancing consideration
            load_penalty = await self.load_balancer.get_load_penalty(model_name)
            score -= load_penalty
            
            scored_models.append((model_name, score))
        
        # Sort by score descending
        scored_models.sort(key=lambda x: x[1], reverse=True)
        return scored_models
    
    async def _get_historical_performance(self, model_name: str, task_type: TaskType) -> float:
        """Get historical performance score for model on task type"""
        key = f"{model_name}_{task_type.value}"
        if key in self.performance_history:
            return self.performance_history[key].get("avg_score", 5.0)
        return 5.0  # Neutral score for new models
    
    async def process_with_fallback(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process task with automatic fallback chain"""
        try:
            # Check cache first
            cache_key = self.response_cache.generate_key(task, context)
            cached_response = await self.response_cache.get(cache_key)
            if cached_response:
                logger.info("Returning cached response")
                return cached_response
            
            # Get fallback chain
            primary_model = await self.select_optimal_model(task, context)
            fallback_chain = self._get_fallback_chain(primary_model)
            
            # Try each model in the chain
            for model_name in fallback_chain:
                try:
                    start_time = time.time()
                    response = await self._call_model(model_name, task, context)
                    processing_time = time.time() - start_time
                    
                    # Record performance
                    await self._record_performance(model_name, task, processing_time, True)
                    
                    # Cache successful response
                    await self.response_cache.set(cache_key, response)
                    
                    return {
                        "response": response,
                        "model_used": model_name,
                        "processing_time": processing_time,
                        "cached": False
                    }
                    
                except Exception as model_error:
                    logger.warning(f"Model {model_name} failed: {model_error}")
                    await self._record_performance(model_name, task, 0, False)
                    continue
            
            # If all models fail, return error
            return {
                "response": "I'm experiencing technical difficulties. Please try again later.",
                "model_used": "fallback",
                "error": "All models failed"
            }
            
        except Exception as e:
            logger.error(f"Error in fallback processing: {e}")
            return {
                "response": "I encountered an error processing your request.",
                "error": str(e)
            }
    
    def _get_fallback_chain(self, primary_model: str) -> List[str]:
        """Get fallback chain for a primary model"""
        # Predefined fallback chains based on model characteristics
        fallback_chains = {
            "gpt-4": ["gpt-4", "claude-3-sonnet", "gpt-4o-mini", "gemini-2.5-flash"],
            "claude-3-sonnet": ["claude-3-sonnet", "gpt-4", "gpt-4o-mini", "gemini-2.5-flash"],
            "gpt-4o-mini": ["gpt-4o-mini", "gemini-2.5-flash", "claude-3-sonnet", "gpt-4"],
            "gemini-2.5-flash": ["gemini-2.5-flash", "gpt-4o-mini", "claude-3-sonnet", "gpt-4"]
        }
        
        return fallback_chains.get(primary_model, ["gpt-4o-mini", "gpt-4", "claude-3-sonnet"])
    
    async def _call_model(self, model_name: str, task: str, context: Dict[str, Any] = None) -> str:
        """Call specific AI model"""
        # In production, this would call the actual AI API
        # For now, return a simulated response
        await asyncio.sleep(0.1)  # Simulate API call delay
        
        return f"Response from {model_name}: {task[:100]}..."
    
    async def _record_performance(self, model_name: str, task: str, processing_time: float, success: bool):
        """Record model performance for future optimization"""
        task_type = self._classify_task_type(task.lower())
        key = f"{model_name}_{task_type.value}"
        
        if key not in self.performance_history:
            self.performance_history[key] = {
                "total_calls": 0,
                "successful_calls": 0,
                "avg_time": 0.0,
                "avg_score": 5.0
            }
        
        history = self.performance_history[key]
        history["total_calls"] += 1
        
        if success:
            history["successful_calls"] += 1
            # Update average time
            history["avg_time"] = (history["avg_time"] + processing_time) / 2
            # Update score based on success and speed
            score = 8.0 if processing_time < 2.0 else 6.0
            history["avg_score"] = (history["avg_score"] + score) / 2

class ModelLoadBalancer:
    """Load balancer for AI models"""
    
    def __init__(self):
        self.model_loads = {}
        self.max_concurrent = {
            "gpt-4": 3,
            "claude-3-sonnet": 5,
            "gpt-4o-mini": 10,
            "gemini-2.5-flash": 8
        }
    
    async def select_best_available(self, scored_models: List[Tuple[str, float]]) -> str:
        """Select best available model considering current load"""
        for model_name, score in scored_models:
            current_load = self.model_loads.get(model_name, 0)
            max_load = self.max_concurrent.get(model_name, 5)
            
            if current_load < max_load:
                return model_name
        
        # If all models are at capacity, return the best one anyway
        return scored_models[0][0] if scored_models else "gpt-4o-mini"
    
    async def get_load_penalty(self, model_name: str) -> float:
        """Get load penalty for a model"""
        current_load = self.model_loads.get(model_name, 0)
        max_load = self.max_concurrent.get(model_name, 5)
        load_ratio = current_load / max_load
        
        return load_ratio * 2.0  # 0-2 penalty points

class ResponseCache:
    """Intelligent response caching system"""
    
    def __init__(self):
        self.cache = {}
        self.cache_ttl = timedelta(hours=24)
        self.max_cache_size = 1000
    
    def generate_key(self, task: str, context: Dict[str, Any] = None) -> str:
        """Generate cache key from task and context"""
        import hashlib
        content = task
        if context:
            content += json.dumps(context, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()
    
    async def get(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached response"""
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            if datetime.now() - entry["timestamp"] < self.cache_ttl:
                return entry["response"]
            else:
                del self.cache[cache_key]
        return None
    
    async def set(self, cache_key: str, response: Dict[str, Any]):
        """Set cached response"""
        # Clean old entries if cache is full
        if len(self.cache) >= self.max_cache_size:
            await self._cleanup_cache()
        
        self.cache[cache_key] = {
            "response": response,
            "timestamp": datetime.now()
        }
    
    async def _cleanup_cache(self):
        """Remove old cache entries"""
        now = datetime.now()
        expired_keys = [
            key for key, entry in self.cache.items()
            if now - entry["timestamp"] > self.cache_ttl
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        # If still too full, remove oldest entries
        if len(self.cache) >= self.max_cache_size:
            sorted_entries = sorted(
                self.cache.items(),
                key=lambda x: x[1]["timestamp"]
            )
            for key, _ in sorted_entries[:len(self.cache) - self.max_cache_size + 100]:
                del self.cache[key]