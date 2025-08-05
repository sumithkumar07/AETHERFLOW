"""
Enhanced AI Service with Performance Optimizations
Integrates scalable database, caching, and monitoring
"""

import asyncio
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from groq import AsyncGroq
import logging

from .scalable_database import get_scalable_database
from .performance_cache import get_ai_response_cache, get_performance_cache
from .performance_monitor import get_performance_monitor

logger = logging.getLogger(__name__)

class OptimizedAIService:
    """AI Service with enterprise-grade performance optimizations"""
    
    def __init__(self, groq_api_key: str):
        self.groq_client = AsyncGroq(api_key=groq_api_key)
        self.db = None
        self.cache = None
        self.ai_cache = None
        self.monitor = None
        
        # Model configurations with cost optimization
        self.models = {
            "llama-3.1-8b-instant": {
                "cost_per_1k_tokens": 0.05,
                "speed": "ultra-fast",
                "use_case": "Quick responses, simple queries",
                "max_tokens": 8192
            },
            "llama-3.3-70b-versatile": {
                "cost_per_1k_tokens": 0.59,
                "speed": "fast", 
                "use_case": "Complex coding, analysis",
                "max_tokens": 32768
            },
            "mixtral-8x7b-32768": {
                "cost_per_1k_tokens": 0.27,
                "speed": "fast",
                "use_case": "Balanced general purpose",
                "max_tokens": 32768
            },
            "llama-3.2-3b-preview": {
                "cost_per_1k_tokens": 0.06,
                "speed": "ultra-fast",
                "use_case": "Simple tasks, ultra-cheap",
                "max_tokens": 8192
            }
        }
        
        # Agent configurations with specialization
        self.agents = {
            "dev": {
                "name": "Dev",
                "role": "Senior Full-Stack Developer",
                "personality": "Technical expert focused on code quality and best practices",
                "preferred_model": "llama-3.3-70b-versatile",
                "system_prompt": "You are an expert full-stack developer specializing in React, FastAPI, and modern web technologies."
            },
            "luna": {
                "name": "Luna", 
                "role": "UX/UI Designer",
                "personality": "Creative designer focused on user experience and accessibility",
                "preferred_model": "mixtral-8x7b-32768",
                "system_prompt": "You are a creative UX/UI designer focused on creating beautiful, accessible user experiences."
            },
            "atlas": {
                "name": "Atlas",
                "role": "System Architect", 
                "personality": "Strategic thinker focused on scalability and performance",
                "preferred_model": "llama-3.3-70b-versatile",
                "system_prompt": "You are a system architect specializing in scalable, high-performance application design."
            },
            "quinn": {
                "name": "Quinn",
                "role": "QA Engineer",
                "personality": "Detail-oriented tester focused on quality and reliability", 
                "preferred_model": "llama-3.1-8b-instant",
                "system_prompt": "You are a QA engineer focused on testing strategies and quality assurance."
            },
            "sage": {
                "name": "Sage",
                "role": "Project Manager",
                "personality": "Organized coordinator focused on planning and execution",
                "preferred_model": "mixtral-8x7b-32768", 
                "system_prompt": "You are a project manager focused on coordinating development efforts and planning."
            }
        }
        
    async def initialize(self):
        """Initialize optimized AI service"""
        try:
            # Initialize core services
            self.db = await get_scalable_database()
            self.cache = await get_performance_cache()
            self.ai_cache = await get_ai_response_cache()
            self.monitor = await get_performance_monitor()
            
            logger.info("✅ Optimized AI service initialized")
            
        except Exception as e:
            logger.error(f"❌ AI service initialization failed: {e}")
            raise
    
    async def process_ai_request(
        self,
        user_id: str,
        message: str,
        agent_type: str = "dev",
        context: List[Dict] = None,
        use_cache: bool = True
    ) -> Dict:
        """Process AI request with full optimization stack"""
        
        start_time = time.time()
        
        try:
            # Monitor request performance
            async with self.monitor.monitor_request(f"ai_request_{agent_type}", user_id):
                
                # Get agent configuration
                agent_config = self.agents.get(agent_type, self.agents["dev"])
                model = agent_config["preferred_model"]
                
                # Generate context hash for caching
                context_hash = self._generate_context_hash(context) if context else None
                
                # Try to get cached response
                if use_cache:
                    cached_response = await self.ai_cache.get_cached_ai_response(
                        query=message,
                        model=model,
                        user_id=user_id,
                        context_hash=context_hash
                    )
                    
                    if cached_response:
                        # Track cache hit
                        await self.monitor.record_ai_metrics(
                            model=model,
                            tokens=cached_response.get('tokens_used', 0),
                            duration=time.time() - start_time,
                            cost=0.0,  # No cost for cache hit
                            user_id=user_id,
                            success=True
                        )
                        
                        return {
                            **cached_response,
                            'agent': agent_config,
                            'cached': True
                        }
                
                # Prepare messages with context and agent personality
                messages = self._prepare_messages(message, agent_config, context)
                
                # Call Groq API with optimized parameters
                response = await self._call_groq_api(
                    model=model,
                    messages=messages,
                    max_tokens=min(2000, self.models[model]["max_tokens"])
                )
                
                # Calculate metrics
                duration = time.time() - start_time
                tokens_used = response.usage.total_tokens
                cost = self._calculate_cost(model, tokens_used)
                
                # Track AI usage in database
                await self.db.track_ai_usage(
                    user_id=user_id,
                    model=model,
                    tokens_used=tokens_used,
                    response_time=duration,
                    cost=cost
                )
                
                # Record performance metrics
                await self.monitor.record_ai_metrics(
                    model=model,
                    tokens=tokens_used,
                    duration=duration,
                    cost=cost,
                    user_id=user_id,
                    success=True
                )
                
                # Prepare response
                ai_response = {
                    'content': response.choices[0].message.content,
                    'agent': agent_config,
                    'model_used': model,
                    'tokens_used': tokens_used,
                    'cost': cost,
                    'response_time': duration,
                    'cached': False,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                # Cache the response
                if use_cache:
                    await self.ai_cache.cache_ai_response(
                        query=message,
                        model=model,
                        response=ai_response,
                        user_id=user_id,
                        context_hash=context_hash,
                        ttl=1800  # 30 minutes
                    )
                
                return ai_response
                
        except Exception as e:
            logger.error(f"❌ AI request processing failed: {e}")
            
            # Record failure metrics
            duration = time.time() - start_time
            await self.monitor.record_ai_metrics(
                model=agent_config.get("preferred_model", "unknown"),
                tokens=0,
                duration=duration,
                cost=0.0,
                user_id=user_id,
                success=False
            )
            
            raise
    
    async def process_multi_agent_request(
        self,
        user_id: str,
        message: str,
        agents: List[str] = None,
        context: List[Dict] = None
    ) -> Dict:
        """Process request with multiple agents working together"""
        
        if not agents:
            agents = ["dev", "luna", "atlas"]  # Default collaboration
        
        start_time = time.time()
        
        try:
            # Check for cached multi-agent response
            cache_key = f"multi_agent:{':'.join(sorted(agents))}:{hash(message)}"
            cached_response = await self.cache.get(cache_key)
            
            if cached_response:
                return {
                    **cached_response,
                    'cached': True,
                    'response_time': time.time() - start_time
                }
            
            # Process with each agent in parallel
            agent_tasks = [
                self.process_ai_request(
                    user_id=user_id,
                    message=message,
                    agent_type=agent,
                    context=context,
                    use_cache=True
                )
                for agent in agents
            ]
            
            # Execute in parallel for performance
            agent_responses = await asyncio.gather(*agent_tasks, return_exceptions=True)
            
            # Process successful responses
            successful_responses = []
            total_cost = 0.0
            total_tokens = 0
            
            for i, response in enumerate(agent_responses):
                if isinstance(response, Exception):
                    logger.error(f"❌ Agent {agents[i]} failed: {response}")
                    continue
                    
                successful_responses.append({
                    'agent_type': agents[i],
                    'response': response
                })
                total_cost += response.get('cost', 0.0)
                total_tokens += response.get('tokens_used', 0)
            
            # Synthesize responses
            synthesized_response = await self._synthesize_agent_responses(
                message, successful_responses, user_id
            )
            
            # Calculate final metrics
            duration = time.time() - start_time
            
            multi_agent_response = {
                'synthesized_response': synthesized_response,
                'individual_responses': successful_responses,
                'agents_used': agents,
                'total_cost': total_cost,
                'total_tokens': total_tokens,
                'response_time': duration,
                'cached': False,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Cache multi-agent response
            await self.cache.set(cache_key, multi_agent_response, ttl=1800)
            
            return multi_agent_response
            
        except Exception as e:
            logger.error(f"❌ Multi-agent processing failed: {e}")
            raise
    
    async def _call_groq_api(
        self, 
        model: str, 
        messages: List[Dict], 
        max_tokens: int = 2000
    ) -> Any:
        """Call Groq API with error handling and retries"""
        
        for attempt in range(3):  # 3 retry attempts
            try:
                response = await self.groq_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.7,
                    stream=False
                )
                return response
                
            except Exception as e:
                logger.warning(f"⚠️ Groq API attempt {attempt + 1} failed: {e}")
                if attempt == 2:  # Last attempt
                    raise
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
    
    def _prepare_messages(
        self, 
        user_message: str, 
        agent_config: Dict, 
        context: List[Dict] = None
    ) -> List[Dict]:
        """Prepare messages with agent personality and context"""
        
        messages = [
            {
                "role": "system",
                "content": f"{agent_config['system_prompt']} Your name is {agent_config['name']} and you are a {agent_config['role']}. {agent_config['personality']}"
            }
        ]
        
        # Add context if provided
        if context:
            # Limit context to last 5 messages for performance
            recent_context = context[-5:]
            for ctx_msg in recent_context:
                messages.append({
                    "role": ctx_msg.get("role", "user"),
                    "content": ctx_msg.get("content", "")
                })
        
        # Add current user message
        messages.append({
            "role": "user", 
            "content": user_message
        })
        
        return messages
    
    async def _synthesize_agent_responses(
        self,
        original_message: str,
        agent_responses: List[Dict],
        user_id: str
    ) -> Dict:
        """Synthesize multiple agent responses into cohesive answer"""
        
        if len(agent_responses) == 1:
            return agent_responses[0]['response']
        
        # Create synthesis prompt
        synthesis_prompt = f"""
        Original question: {original_message}
        
        I have received responses from multiple specialized agents:
        
        """
        
        for resp in agent_responses:
            agent_name = resp['response']['agent']['name']
            agent_role = resp['response']['agent']['role']
            content = resp['response']['content']
            
            synthesis_prompt += f"**{agent_name} ({agent_role}):**\n{content}\n\n"
        
        synthesis_prompt += """
        Please synthesize these responses into a comprehensive, coherent answer that:
        1. Combines the best insights from each specialist
        2. Resolves any conflicts between responses
        3. Provides a clear, actionable conclusion
        4. Maintains the expertise from each agent
        
        Format the response professionally and clearly.
        """
        
        # Use Atlas (architect) for synthesis with faster model for cost efficiency
        synthesis_response = await self.process_ai_request(
            user_id=user_id,
            message=synthesis_prompt,
            agent_type="atlas",
            use_cache=False  # Don't cache synthesis
        )
        
        return synthesis_response
    
    def _generate_context_hash(self, context: List[Dict]) -> str:
        """Generate hash from context for caching"""
        import hashlib
        
        context_str = json.dumps(context, sort_keys=True)
        return hashlib.md5(context_str.encode()).hexdigest()[:16]
    
    def _calculate_cost(self, model: str, tokens: int) -> float:
        """Calculate cost based on model and token usage"""
        model_config = self.models.get(model, {})
        cost_per_1k = model_config.get("cost_per_1k_tokens", 0.0)
        
        return (tokens / 1000.0) * cost_per_1k
    
    async def get_available_agents(self) -> List[Dict]:
        """Get list of available agents with their capabilities"""
        return [
            {
                "id": agent_id,
                "name": config["name"],
                "role": config["role"],
                "personality": config["personality"],
                "preferred_model": config["preferred_model"],
                "model_cost": self.models[config["preferred_model"]]["cost_per_1k_tokens"],
                "model_speed": self.models[config["preferred_model"]]["speed"]
            }
            for agent_id, config in self.agents.items()
        ]
    
    async def get_user_ai_analytics(self, user_id: str, days: int = 30) -> Dict:
        """Get user AI usage analytics"""
        try:
            analytics = await self.db.get_analytics_data(user_id, days)
            
            # Add cost analysis and recommendations
            total_cost = sum(
                entry.get('total_cost', 0) 
                for entry in analytics.get('usage_data', [])
            )
            
            total_tokens = sum(
                entry.get('total_tokens', 0)
                for entry in analytics.get('usage_data', [])
            )
            
            # Generate cost optimization recommendations
            recommendations = []
            if total_cost > 10:  # If spending over $10/month
                recommendations.append(
                    "Consider using faster models for simple queries to reduce costs"
                )
            
            if analytics.get('summary', {}).get('avg_response_time', 0) > 3:
                recommendations.append(
                    "Enable response caching to improve performance"
                )
            
            return {
                **analytics,
                'cost_analysis': {
                    'total_cost': total_cost,
                    'total_tokens': total_tokens,
                    'avg_cost_per_request': total_cost / len(analytics.get('usage_data', [1])),
                    'recommendations': recommendations
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Analytics generation failed: {e}")
            return {'error': str(e)}

# Global optimized AI service instance
optimized_ai_service = None

async def get_optimized_ai_service() -> OptimizedAIService:
    """Get the global optimized AI service instance"""
    global optimized_ai_service
    if optimized_ai_service is None:
        import os
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        optimized_ai_service = OptimizedAIService(groq_api_key)
        await optimized_ai_service.initialize()
    
    return optimized_ai_service