"""
PHASE 2: AI Intelligence Enhancement
Enhanced multi-agent coordination, smarter responses, better context awareness
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import json
import hashlib
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentExpertise(Enum):
    """Agent expertise levels"""
    NOVICE = 1
    INTERMEDIATE = 2
    ADVANCED = 3
    EXPERT = 4
    MASTER = 5

@dataclass
class ConversationContext:
    """Enhanced conversation context with memory"""
    conversation_id: str
    user_id: str
    messages: List[Dict[str, Any]]
    active_agents: List[str]
    context_summary: str
    expertise_required: AgentExpertise
    domain: str
    complexity_score: float
    timestamp: datetime
    
@dataclass
class AgentPerformance:
    """Track individual agent performance metrics"""
    agent_name: str
    total_responses: int
    successful_responses: int
    average_response_time: float
    user_satisfaction_score: float
    expertise_domains: List[str]
    last_updated: datetime

class ConversationMemorySystem:
    """Advanced conversation memory and context management"""
    
    def __init__(self):
        self.conversation_memory = {}
        self.context_embeddings = {}
        self.memory_limit = 1000  # Maximum conversations to keep in memory
        
    async def store_conversation_context(self, context: ConversationContext):
        """Store conversation context with intelligent summarization"""
        try:
            # Store in memory
            self.conversation_memory[context.conversation_id] = context
            
            # Generate context embedding for similarity matching
            context_hash = self._generate_context_hash(context)
            self.context_embeddings[context.conversation_id] = context_hash
            
            # Cleanup old conversations if limit exceeded
            if len(self.conversation_memory) > self.memory_limit:
                await self._cleanup_old_conversations()
                
            logger.info(f"✅ Stored conversation context: {context.conversation_id}")
            
        except Exception as e:
            logger.error(f"Error storing conversation context: {e}")
    
    def _generate_context_hash(self, context: ConversationContext) -> str:
        """Generate a hash for context similarity matching"""
        context_str = f"{context.domain}_{context.expertise_required.name}_{context.complexity_score}"
        return hashlib.md5(context_str.encode()).hexdigest()
    
    async def _cleanup_old_conversations(self):
        """Clean up old conversation contexts"""
        # Keep only the most recent conversations
        sorted_conversations = sorted(
            self.conversation_memory.items(),
            key=lambda x: x[1].timestamp,
            reverse=True
        )
        
        # Keep only the most recent ones
        keep_conversations = dict(sorted_conversations[:self.memory_limit])
        self.conversation_memory = keep_conversations
        
        # Update embeddings accordingly
        valid_ids = set(keep_conversations.keys())
        self.context_embeddings = {
            k: v for k, v in self.context_embeddings.items() 
            if k in valid_ids
        }
    
    async def get_relevant_context(self, current_context: ConversationContext, limit: int = 5) -> List[ConversationContext]:
        """Get relevant conversation contexts for enhanced responses"""
        try:
            current_hash = self._generate_context_hash(current_context)
            
            # Find similar conversations
            similar_conversations = []
            for conv_id, conv_context in self.conversation_memory.items():
                if conv_id == current_context.conversation_id:
                    continue
                
                conv_hash = self.context_embeddings.get(conv_id)
                if conv_hash and self._calculate_similarity(current_hash, conv_hash) > 0.7:
                    similar_conversations.append(conv_context)
            
            # Sort by relevance and timestamp
            similar_conversations.sort(key=lambda x: x.timestamp, reverse=True)
            return similar_conversations[:limit]
            
        except Exception as e:
            logger.error(f"Error getting relevant context: {e}")
            return []
    
    def _calculate_similarity(self, hash1: str, hash2: str) -> float:
        """Calculate similarity between two context hashes"""
        # Simple similarity calculation based on common characters
        common_chars = sum(1 for a, b in zip(hash1, hash2) if a == b)
        return common_chars / len(hash1)

class IntelligentAgentCoordinator:
    """Enhanced multi-agent coordination with intelligent routing"""
    
    def __init__(self):
        self.agent_performances = {}
        self.coordination_history = []
        self.agent_specializations = {
            "Dev": {
                "domains": ["coding", "debugging", "architecture", "backend", "frontend"],
                "complexity_preference": [3, 4, 5],
                "response_style": "technical"
            },
            "Luna": {
                "domains": ["ui", "ux", "design", "frontend", "accessibility"],
                "complexity_preference": [2, 3, 4],
                "response_style": "creative"
            },
            "Atlas": {
                "domains": ["architecture", "scalability", "performance", "infrastructure"],
                "complexity_preference": [4, 5],
                "response_style": "systematic"
            },
            "Quinn": {
                "domains": ["testing", "quality", "validation", "debugging"],
                "complexity_preference": [2, 3, 4],
                "response_style": "analytical"
            },
            "Sage": {
                "domains": ["planning", "management", "coordination", "strategy"],
                "complexity_preference": [3, 4, 5],
                "response_style": "strategic"
            }
        }
    
    async def select_optimal_agent(self, context: ConversationContext) -> Tuple[str, float]:
        """Select the most suitable agent based on context and performance"""
        try:
            agent_scores = {}
            
            for agent_name, specialization in self.agent_specializations.items():
                score = await self._calculate_agent_fitness(agent_name, specialization, context)
                agent_scores[agent_name] = score
            
            # Select agent with highest score
            best_agent = max(agent_scores, key=agent_scores.get)
            confidence = agent_scores[best_agent]
            
            logger.info(f"Selected agent: {best_agent} with confidence: {confidence:.2f}")
            return best_agent, confidence
            
        except Exception as e:
            logger.error(f"Error selecting optimal agent: {e}")
            return "Dev", 0.5  # Default fallback
    
    async def _calculate_agent_fitness(self, agent_name: str, specialization: Dict, context: ConversationContext) -> float:
        """Calculate how well an agent fits the current context"""
        fitness_score = 0.0
        
        # Domain expertise match
        domain_match = 0.0
        for domain in specialization["domains"]:
            if domain.lower() in context.domain.lower():
                domain_match += 1.0
        domain_match = min(domain_match / len(specialization["domains"]), 1.0)
        fitness_score += domain_match * 0.4
        
        # Complexity preference match
        complexity_match = 0.0
        if int(context.complexity_score) in specialization["complexity_preference"]:
            complexity_match = 1.0
        fitness_score += complexity_match * 0.3
        
        # Historical performance
        performance_score = 0.5  # Default
        if agent_name in self.agent_performances:
            perf = self.agent_performances[agent_name]
            success_rate = perf.successful_responses / max(perf.total_responses, 1)
            performance_score = min(success_rate + (perf.user_satisfaction_score / 10), 1.0)
        fitness_score += performance_score * 0.3
        
        return fitness_score
    
    async def coordinate_multi_agent_response(self, context: ConversationContext, primary_agent: str) -> Dict[str, Any]:
        """Coordinate multiple agents for complex queries"""
        try:
            coordination_plan = {
                "primary_agent": primary_agent,
                "supporting_agents": [],
                "coordination_strategy": "sequential"
            }
            
            # Determine if multi-agent coordination is needed
            if context.complexity_score >= 4.0:
                # Select supporting agents
                supporting_agents = await self._select_supporting_agents(primary_agent, context)
                coordination_plan["supporting_agents"] = supporting_agents
                
                if len(supporting_agents) > 1:
                    coordination_plan["coordination_strategy"] = "collaborative"
            
            # Log coordination decision
            self.coordination_history.append({
                "conversation_id": context.conversation_id,
                "coordination_plan": coordination_plan,
                "timestamp": datetime.now()
            })
            
            return coordination_plan
            
        except Exception as e:
            logger.error(f"Error coordinating multi-agent response: {e}")
            return {"primary_agent": primary_agent, "supporting_agents": [], "coordination_strategy": "single"}
    
    async def _select_supporting_agents(self, primary_agent: str, context: ConversationContext) -> List[str]:
        """Select supporting agents for collaborative responses"""
        supporting_agents = []
        
        # Get complementary agents based on domain
        if "coding" in context.domain and primary_agent != "Quinn":
            supporting_agents.append("Quinn")  # Add testing perspective
        
        if "architecture" in context.domain and primary_agent != "Atlas":
            supporting_agents.append("Atlas")  # Add architectural perspective
        
        if "ui" in context.domain and primary_agent != "Luna":
            supporting_agents.append("Luna")  # Add design perspective
        
        if context.complexity_score >= 4.5 and primary_agent != "Sage":
            supporting_agents.append("Sage")  # Add project management perspective
        
        return supporting_agents[:2]  # Limit to 2 supporting agents
    
    async def update_agent_performance(self, agent_name: str, response_time: float, user_feedback: Optional[float] = None):
        """Update agent performance metrics"""
        try:
            if agent_name not in self.agent_performances:
                self.agent_performances[agent_name] = AgentPerformance(
                    agent_name=agent_name,
                    total_responses=0,
                    successful_responses=0,
                    average_response_time=0.0,
                    user_satisfaction_score=7.5,  # Default score
                    expertise_domains=self.agent_specializations.get(agent_name, {}).get("domains", []),
                    last_updated=datetime.now()
                )
            
            perf = self.agent_performances[agent_name]
            perf.total_responses += 1
            
            # Update average response time
            perf.average_response_time = (
                (perf.average_response_time * (perf.total_responses - 1) + response_time) / 
                perf.total_responses
            )
            
            # Update satisfaction score if feedback provided
            if user_feedback is not None:
                perf.user_satisfaction_score = (
                    (perf.user_satisfaction_score * 0.9) + (user_feedback * 0.1)
                )
            
            # Mark as successful if response time is reasonable
            if response_time < 5.0:  # Less than 5 seconds
                perf.successful_responses += 1
            
            perf.last_updated = datetime.now()
            
        except Exception as e:
            logger.error(f"Error updating agent performance: {e}")

class ResponseQualityEnhancer:
    """Enhanced response quality analysis and improvement"""
    
    def __init__(self):
        self.quality_metrics = {}
        self.response_templates = {}
        
    async def analyze_response_quality(self, response: str, context: ConversationContext) -> Dict[str, Any]:
        """Analyze response quality and suggest improvements"""
        try:
            quality_analysis = {
                "relevance_score": 0.0,
                "completeness_score": 0.0,
                "clarity_score": 0.0,
                "technical_accuracy": 0.0,
                "overall_quality": 0.0,
                "suggestions": []
            }
            
            # Analyze relevance
            relevance_score = await self._analyze_relevance(response, context)
            quality_analysis["relevance_score"] = relevance_score
            
            # Analyze completeness
            completeness_score = await self._analyze_completeness(response, context)
            quality_analysis["completeness_score"] = completeness_score
            
            # Analyze clarity
            clarity_score = await self._analyze_clarity(response)
            quality_analysis["clarity_score"] = clarity_score
            
            # Calculate overall quality
            quality_analysis["overall_quality"] = (
                relevance_score * 0.4 + 
                completeness_score * 0.3 + 
                clarity_score * 0.3
            )
            
            # Generate improvement suggestions
            suggestions = await self._generate_improvement_suggestions(quality_analysis)
            quality_analysis["suggestions"] = suggestions
            
            return quality_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing response quality: {e}")
            return {"overall_quality": 0.5, "suggestions": []}
    
    async def _analyze_relevance(self, response: str, context: ConversationContext) -> float:
        """Analyze how relevant the response is to the context"""
        # Simple keyword-based relevance scoring
        domain_keywords = context.domain.lower().split()
        response_lower = response.lower()
        
        relevant_keywords = sum(1 for keyword in domain_keywords if keyword in response_lower)
        relevance_score = min(relevant_keywords / max(len(domain_keywords), 1), 1.0)
        
        return relevance_score
    
    async def _analyze_completeness(self, response: str, context: ConversationContext) -> float:
        """Analyze how complete the response is"""
        # Basic completeness based on response length and complexity match
        expected_length = context.complexity_score * 100  # Expected words
        actual_length = len(response.split())
        
        completeness_score = min(actual_length / max(expected_length, 50), 1.0)
        return completeness_score
    
    async def _analyze_clarity(self, response: str) -> float:
        """Analyze response clarity"""
        # Simple clarity metrics
        sentences = response.split('.')
        avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / max(len(sentences), 1)
        
        # Penalize very long sentences
        clarity_score = max(1.0 - (avg_sentence_length - 15) / 50, 0.3) if avg_sentence_length > 15 else 1.0
        
        return clarity_score
    
    async def _generate_improvement_suggestions(self, quality_analysis: Dict[str, Any]) -> List[str]:
        """Generate suggestions for improving response quality"""
        suggestions = []
        
        if quality_analysis["relevance_score"] < 0.7:
            suggestions.append("Increase focus on the main topic and domain-specific content")
        
        if quality_analysis["completeness_score"] < 0.6:
            suggestions.append("Provide more comprehensive coverage of the topic")
        
        if quality_analysis["clarity_score"] < 0.7:
            suggestions.append("Use shorter sentences and clearer explanations")
        
        if quality_analysis["overall_quality"] < 0.6:
            suggestions.append("Consider breaking down complex concepts into simpler parts")
        
        return suggestions

class AIIntelligenceEnhancer:
    """Main AI Intelligence Enhancement coordinator"""
    
    def __init__(self):
        self.memory_system = ConversationMemorySystem()
        self.agent_coordinator = IntelligentAgentCoordinator()
        self.quality_enhancer = ResponseQualityEnhancer()
        
    async def initialize(self):
        """Initialize AI Intelligence Enhancement systems"""
        logger.info("🧠 Initializing AI Intelligence Enhancement...")
        # Additional initialization if needed
        logger.info("✅ AI Intelligence Enhancement initialized successfully")
    
    async def enhance_conversation_processing(self, 
                                            conversation_data: Dict[str, Any], 
                                            user_message: str) -> Dict[str, Any]:
        """Enhanced conversation processing with intelligence"""
        try:
            # Create enhanced context
            context = ConversationContext(
                conversation_id=conversation_data.get("conversation_id", "default"),
                user_id=conversation_data.get("user_id", "anonymous"),
                messages=conversation_data.get("messages", []),
                active_agents=conversation_data.get("active_agents", []),
                context_summary=user_message[:200],  # First 200 chars as summary
                expertise_required=self._determine_expertise_level(user_message),
                domain=self._extract_domain(user_message),
                complexity_score=self._calculate_complexity_score(user_message),
                timestamp=datetime.now()
            )
            
            # Store conversation context
            await self.memory_system.store_conversation_context(context)
            
            # Select optimal agent
            primary_agent, confidence = await self.agent_coordinator.select_optimal_agent(context)
            
            # Plan multi-agent coordination if needed
            coordination_plan = await self.agent_coordinator.coordinate_multi_agent_response(context, primary_agent)
            
            # Get relevant historical context
            relevant_context = await self.memory_system.get_relevant_context(context)
            
            return {
                "enhanced_context": asdict(context),
                "selected_agent": primary_agent,
                "agent_confidence": confidence,
                "coordination_plan": coordination_plan,
                "relevant_context": [asdict(ctx) for ctx in relevant_context],
                "intelligence_enhancements": {
                    "context_aware": True,
                    "multi_agent_coordination": len(coordination_plan.get("supporting_agents", [])) > 0,
                    "historical_awareness": len(relevant_context) > 0,
                    "quality_monitoring": True
                }
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced conversation processing: {e}")
            return {"error": str(e), "fallback_agent": "Dev"}
    
    def _determine_expertise_level(self, message: str) -> AgentExpertise:
        """Determine required expertise level from message"""
        technical_keywords = ["architecture", "scalability", "optimization", "enterprise", "microservices"]
        intermediate_keywords = ["implement", "create", "build", "develop", "design"]
        
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in technical_keywords):
            return AgentExpertise.EXPERT
        elif any(keyword in message_lower for keyword in intermediate_keywords):
            return AgentExpertise.INTERMEDIATE
        else:
            return AgentExpertise.NOVICE
    
    def _extract_domain(self, message: str) -> str:
        """Extract domain from user message"""
        domains = {
            "coding": ["code", "programming", "function", "algorithm", "debug"],
            "ui": ["interface", "design", "ui", "ux", "frontend"],
            "architecture": ["architecture", "system", "scalability", "infrastructure"],
            "testing": ["test", "testing", "quality", "validation"],
            "management": ["project", "planning", "management", "timeline"]
        }
        
        message_lower = message.lower()
        
        for domain, keywords in domains.items():
            if any(keyword in message_lower for keyword in keywords):
                return domain
        
        return "general"
    
    def _calculate_complexity_score(self, message: str) -> float:
        """Calculate complexity score of the message"""
        # Basic complexity scoring
        base_score = min(len(message.split()) / 20, 3.0)  # Based on length
        
        complexity_indicators = [
            "architecture", "scalability", "microservices", "optimization",
            "enterprise", "integration", "distributed", "performance"
        ]
        
        message_lower = message.lower()
        complexity_boost = sum(0.5 for indicator in complexity_indicators if indicator in message_lower)
        
        return min(base_score + complexity_boost, 5.0)
    
    async def get_enhancement_status(self) -> Dict[str, Any]:
        """Get AI Intelligence Enhancement status"""
        return {
            "memory_system": {
                "conversations_stored": len(self.memory_system.conversation_memory),
                "context_embeddings": len(self.memory_system.context_embeddings)
            },
            "agent_coordinator": {
                "tracked_agents": len(self.agent_coordinator.agent_performances),
                "coordination_history": len(self.agent_coordinator.coordination_history)
            },
            "quality_enhancer": {
                "quality_metrics": len(self.quality_enhancer.quality_metrics)
            },
            "status": "enhanced",
            "intelligence_level": "advanced"
        }

# Global instance
ai_intelligence_enhancer = AIIntelligenceEnhancer()

async def get_ai_intelligence_enhancer():
    """Get the global AI intelligence enhancer instance"""
    return ai_intelligence_enhancer