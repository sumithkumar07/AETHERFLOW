"""
Enhanced AI Service - Phase 1: AI Abilities Enhancement
Builds upon the existing Groq integration with improved conversation quality,
intelligent code generation, and enhanced multi-agent coordination.
"""

import os
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import re
import uuid

from .groq_ai_service import GroqAIService

logger = logging.getLogger(__name__)


@dataclass
class ConversationContext:
    """Enhanced conversation context tracking"""
    user_id: str
    session_id: str
    project_id: Optional[str] = None
    conversation_history: List[Dict] = None
    current_topic: Optional[str] = None
    technical_context: Dict = None
    preferences: Dict = None
    agent_specializations: List[str] = None
    created_at: datetime = None
    updated_at: datetime = None
    
    def __post_init__(self):
        if self.conversation_history is None:
            self.conversation_history = []
        if self.technical_context is None:
            self.technical_context = {}
        if self.preferences is None:
            self.preferences = {}
        if self.agent_specializations is None:
            self.agent_specializations = []
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()


@dataclass
class AgentCapability:
    """Enhanced agent capability definition"""
    agent_id: str
    name: str
    specialization: str
    expertise_areas: List[str]
    handoff_triggers: List[str]
    collaboration_patterns: List[str]
    prompt_template: str
    confidence_threshold: float = 0.8
    priority_score: int = 1


class EnhancedAIService(GroqAIService):
    """
    Enhanced AI Service with improved conversation quality,
    intelligent code generation, and multi-agent coordination
    """
    
    def __init__(self):
        super().__init__()
        
        # Enhanced conversation tracking
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        
        # Enhanced agent capabilities
        self.enhanced_agents = self._initialize_enhanced_agents()
        
        # Code generation intelligence
        self.code_patterns = self._initialize_code_patterns()
        
        # Multi-agent coordination rules
        self.coordination_rules = self._initialize_coordination_rules()
        
        # Conversation quality metrics
        self.quality_metrics = {
            "context_retention": 0.95,
            "response_relevance": 0.92,
            "code_accuracy": 0.90,
            "agent_coordination": 0.88
        }
        
    def _initialize_enhanced_agents(self) -> Dict[str, AgentCapability]:
        """Initialize enhanced agent capabilities with better specialization"""
        return {
            "senior_developer": AgentCapability(
                agent_id="senior_developer",
                name="Senior Developer AI",
                specialization="Advanced Software Development",
                expertise_areas=[
                    "Complex architecture design", "Performance optimization", 
                    "Code review and refactoring", "Advanced debugging",
                    "System design patterns", "Enterprise-level solutions"
                ],
                handoff_triggers=[
                    "architecture", "complex system", "performance issue",
                    "enterprise", "scalability", "optimization"
                ],
                collaboration_patterns=[
                    "works_with_integrator", "leads_technical_decisions",
                    "mentors_junior_agents", "reviews_code_quality"
                ],
                prompt_template="""You are a Senior Developer AI with 10+ years of experience in enterprise software development.
Your expertise includes system architecture, performance optimization, and leading technical teams.

Key Strengths:
- Advanced architectural patterns and design principles
- Performance optimization and scalability solutions
- Code quality and best practices enforcement
- Complex problem-solving and technical leadership
- Enterprise-level system design and integration

Always provide:
1. Strategic technical guidance with long-term considerations
2. Performance-optimized solutions with benchmarks
3. Comprehensive error handling and edge case coverage
4. Clear documentation and maintainability focus
5. Mentoring insights for junior developers

Current context: {context}
Technical focus: {technical_context}""",
                confidence_threshold=0.85,
                priority_score=5
            ),
            
            "fullstack_specialist": AgentCapability(
                agent_id="fullstack_specialist", 
                name="Full-Stack Specialist AI",
                specialization="Full-Stack Development",
                expertise_areas=[
                    "React & TypeScript", "FastAPI & Python", "MongoDB & SQL",
                    "Real-time applications", "API design", "Frontend optimization"
                ],
                handoff_triggers=[
                    "full-stack", "frontend", "backend", "api", "database",
                    "react", "fastapi", "mongodb", "typescript", "python"
                ],
                collaboration_patterns=[
                    "coordinates_frontend_backend", "designs_apis",
                    "optimizes_full_stack", "handles_data_flow"
                ],
                prompt_template="""You are a Full-Stack Specialist AI expert in modern web development.
You excel at creating cohesive full-stack solutions with React, FastAPI, and MongoDB.

Expertise Areas:
- React 18+ with hooks, context, and modern patterns
- FastAPI with async/await and advanced features  
- MongoDB with aggregation and optimization
- Real-time features with WebSockets
- Modern TypeScript and Python patterns
- DevOps and deployment strategies

Always provide:
1. Complete full-stack solutions with frontend and backend code
2. API design with proper error handling and validation
3. Database schema and query optimization
4. Real-time integration patterns when applicable
5. Testing strategies for full-stack applications

Current context: {context}
Stack focus: React + FastAPI + MongoDB""",
                confidence_threshold=0.80,
                priority_score=4
            ),
            
            "ai_integration_expert": AgentCapability(
                agent_id="ai_integration_expert",
                name="AI Integration Expert",
                specialization="AI/ML Integration & Development",
                expertise_areas=[
                    "Groq AI optimization", "Multi-model strategies", "AI workflows",
                    "Machine learning pipelines", "AI system architecture"
                ],
                handoff_triggers=[
                    "ai", "machine learning", "groq", "model", "artificial intelligence",
                    "neural", "llm", "chatbot", "automation", "intelligent"
                ],
                collaboration_patterns=[
                    "optimizes_ai_usage", "designs_ai_workflows",
                    "coordinates_multi_agents", "enhances_ai_responses"
                ],
                prompt_template="""You are an AI Integration Expert specializing in modern AI system design.
You optimize AI workflows, implement multi-model strategies, and enhance AI-powered applications.

Core Expertise:
- Groq AI integration and optimization
- Multi-agent coordination and handoff strategies  
- AI workflow design and automation
- Cost optimization for AI services
- Real-time AI response systems
- AI performance monitoring and analytics

Always provide:
1. Optimized AI integration patterns
2. Cost-effective model selection strategies
3. Multi-agent coordination solutions
4. Performance metrics and monitoring
5. Scalable AI architecture recommendations

Current context: {context}
AI focus: Groq integration and multi-agent systems""",
                confidence_threshold=0.85,
                priority_score=4
            ),
            
            "devops_architect": AgentCapability(
                agent_id="devops_architect",
                name="DevOps Architect AI", 
                specialization="DevOps & Infrastructure",
                expertise_areas=[
                    "Docker & Kubernetes", "CI/CD pipelines", "Cloud architecture",
                    "Monitoring & observability", "Security & compliance"
                ],
                handoff_triggers=[
                    "deploy", "docker", "kubernetes", "devops", "infrastructure",
                    "ci/cd", "pipeline", "cloud", "monitoring", "security"
                ],
                collaboration_patterns=[
                    "designs_deployment_strategies", "ensures_security",
                    "optimizes_infrastructure", "monitors_performance"
                ],
                prompt_template="""You are a DevOps Architect AI with expertise in modern infrastructure and deployment.
You design scalable, secure, and efficient deployment strategies for applications.

Specializations:
- Container orchestration with Docker and Kubernetes
- CI/CD pipeline design and optimization
- Cloud architecture (AWS, GCP, Azure)
- Infrastructure as Code (IaC)
- Monitoring, logging, and observability
- Security and compliance best practices

Always provide:
1. Production-ready deployment configurations
2. Scalable infrastructure designs
3. Security-first architectural decisions
4. Monitoring and alerting strategies
5. Cost optimization recommendations

Current context: {context}
Infrastructure focus: Production-ready deployments""",
                confidence_threshold=0.82,
                priority_score=3
            ),
            
            "ux_architect": AgentCapability(
                agent_id="ux_architect",
                name="UX Architect AI",
                specialization="User Experience & Interface Design",
                expertise_areas=[
                    "Modern UI patterns", "Accessibility (a11y)", "Mobile-first design",
                    "Design systems", "User research", "Conversion optimization"
                ],
                handoff_triggers=[
                    "design", "ui", "ux", "interface", "user experience",
                    "accessibility", "mobile", "responsive", "usability"
                ],
                collaboration_patterns=[
                    "designs_user_interfaces", "ensures_accessibility",
                    "optimizes_user_flows", "creates_design_systems"
                ],
                prompt_template="""You are a UX Architect AI specializing in modern user experience and interface design.
You create intuitive, accessible, and conversion-optimized user experiences.

Design Expertise:
- Modern UI/UX patterns and best practices
- Accessibility (WCAG 2.1 AA) and inclusive design
- Mobile-first and responsive design strategies
- Design system creation and maintenance
- User research and behavioral analysis
- Conversion rate optimization techniques

Always provide:
1. User-centered design solutions
2. Accessible and inclusive interface patterns
3. Mobile-optimized responsive layouts
4. Design system components and guidelines  
5. Usability testing and optimization recommendations

Current context: {context}
Design focus: User-centered and accessible experiences""",
                confidence_threshold=0.80,
                priority_score=3
            )
        }
    
    def _initialize_code_patterns(self) -> Dict[str, Dict]:
        """Initialize intelligent code generation patterns"""
        return {
            "react_patterns": {
                "hooks": ["useState", "useEffect", "useContext", "useCallback", "useMemo", "useReducer"],
                "patterns": ["custom_hooks", "compound_components", "render_props", "hoc"],
                "optimization": ["lazy_loading", "code_splitting", "memoization", "virtualization"]
            },
            "python_patterns": {
                "async": ["asyncio", "async_generators", "concurrent_futures", "aiohttp"],
                "patterns": ["dependency_injection", "factory", "observer", "strategy"],
                "optimization": ["caching", "connection_pooling", "batch_processing", "profiling"]
            },
            "database_patterns": {
                "mongodb": ["aggregation", "indexing", "sharding", "replication"],
                "optimization": ["query_optimization", "index_strategies", "data_modeling", "caching"]
            },
            "api_patterns": {
                "rest": ["resource_design", "error_handling", "versioning", "rate_limiting"],
                "graphql": ["schema_design", "resolvers", "data_loading", "caching"],
                "realtime": ["websockets", "server_sent_events", "polling", "pubsub"]
            }
        }
    
    def _initialize_coordination_rules(self) -> Dict[str, Dict]:
        """Initialize multi-agent coordination rules"""
        return {
            "handoff_conditions": {
                "complexity_threshold": 0.8,
                "expertise_mismatch": 0.7,
                "collaborative_benefit": 0.6
            },
            "collaboration_patterns": {
                "parallel_processing": ["different_aspects", "independent_components"],
                "sequential_handoff": ["design_then_implement", "analyze_then_code"],
                "review_cycles": ["peer_review", "expert_validation", "quality_check"]
            },
            "coordination_triggers": {
                "architecture_design": ["senior_developer", "devops_architect"],
                "full_stack_implementation": ["fullstack_specialist", "ux_architect"], 
                "ai_integration": ["ai_integration_expert", "senior_developer"],
                "deployment_strategy": ["devops_architect", "senior_developer"]
            }
        }
    
    async def get_conversation_context(self, user_id: str, session_id: str) -> ConversationContext:
        """Get or create conversation context"""
        context_key = f"{user_id}_{session_id}"
        
        if context_key not in self.conversation_contexts:
            self.conversation_contexts[context_key] = ConversationContext(
                user_id=user_id,
                session_id=session_id
            )
        
        return self.conversation_contexts[context_key]
    
    async def enhanced_process_message(
        self,
        message: str,
        user_id: str,
        session_id: str = None,
        project_id: str = None,
        requested_agent: str = None,
        model: str = None
    ) -> Dict[str, Any]:
        """Enhanced message processing with improved conversation quality"""
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        try:
            # Get conversation context
            context = await self.get_conversation_context(user_id, session_id)
            if project_id:
                context.project_id = project_id
            
            # Select optimal agent with enhanced coordination
            selected_agent = await self.select_optimal_agent(message, context, requested_agent)
            agent_capability = self.enhanced_agents.get(selected_agent)
            
            if not agent_capability:
                # Fallback to base implementation
                return await self.process_message(
                    message=message,
                    model=model,
                    agent=selected_agent,
                    user_id=user_id,
                    project_id=project_id
                )
            
            # Build enhanced context for the prompt
            enhanced_context = self._build_enhanced_context(context, message)
            
            # Format the agent prompt with context
            formatted_prompt = agent_capability.prompt_template.format(
                context=enhanced_context,
                technical_context=context.technical_context
            )
            
            # Prepare conversation history for better context
            conversation_context = []
            for msg in context.conversation_history[-5:]:  # Last 5 messages
                conversation_context.append({
                    "role": "user",
                    "content": msg.get("user_message", "")
                })
                conversation_context.append({
                    "role": "assistant", 
                    "content": msg.get("ai_response", "")
                })
            
            # Call the base AI processing with enhanced context
            response = await self.process_message(
                message=message,
                model=model,
                agent=selected_agent,
                context=conversation_context,
                user_id=user_id,
                project_id=project_id
            )
            
            # Enhance the response with additional metadata
            response["enhanced_ai"] = {
                "agent_capability": asdict(agent_capability),
                "conversation_context_used": True,
                "technical_context": context.technical_context,
                "current_topic": context.current_topic,
                "session_id": session_id,
                "coordination_opportunities": await self._check_coordination_needed(message, context, selected_agent)
            }
            
            # Update conversation context
            await self.update_conversation_context(
                context, message, response["response"], selected_agent
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Enhanced AI processing error: {e}")
            # Fallback to base implementation
            return await self.process_message(
                message=message,
                model=model,
                agent=requested_agent or "developer",
                user_id=user_id,
                project_id=project_id
            )
    
    async def select_optimal_agent(
        self, 
        message: str, 
        context: ConversationContext,
        requested_agent: str = None
    ) -> str:
        """Select optimal agent based on enhanced coordination rules"""
        
        if requested_agent and requested_agent in self.enhanced_agents:
            return requested_agent
        
        # Analyze message for agent selection
        message_lower = message.lower()
        agent_scores = {}
        
        # Score agents based on expertise match
        for agent_id, agent_capability in self.enhanced_agents.items():
            score = 0
            
            # Check handoff triggers
            for trigger in agent_capability.handoff_triggers:
                if trigger in message_lower:
                    score += 2
            
            # Check expertise areas match
            for expertise in agent_capability.expertise_areas:
                expertise_keywords = expertise.lower().split()
                for keyword in expertise_keywords:
                    if keyword in message_lower:
                        score += 1
            
            # Consider conversation context
            if context.current_topic:
                if context.current_topic in agent_capability.expertise_areas[0].lower():
                    score += 3
            
            # Consider recent agent usage for coordination
            if agent_id in context.agent_specializations:
                score += 1  # Slight preference for continuity
            
            agent_scores[agent_id] = score * agent_capability.priority_score
        
        # Select agent with highest score
        if agent_scores:
            selected_agent = max(agent_scores.items(), key=lambda x: x[1])[0]
            
            # Check if multi-agent coordination is beneficial
            coordination_needed = await self._check_coordination_needed(
                message, context, selected_agent
            )
            
            if coordination_needed:
                return await self._coordinate_multi_agents(message, context, selected_agent)
            
            return selected_agent
        
        # Default to fullstack specialist
        return "fullstack_specialist"
    
    def _build_enhanced_context(self, context: ConversationContext, message: str) -> str:
        """Build enhanced context string from conversation context"""
        context_parts = []
        
        # Add basic context information
        context_parts.append(f"User ID: {context.user_id}")
        context_parts.append(f"Session ID: {context.session_id}")
        
        if context.project_id:
            context_parts.append(f"Project ID: {context.project_id}")
        
        if context.current_topic:
            context_parts.append(f"Current Topic: {context.current_topic}")
        
        # Add conversation history summary
        if context.conversation_history:
            context_parts.append(f"Conversation Length: {len(context.conversation_history)} messages")
            
        # Add technical context
        if context.technical_context:
            context_parts.append("Technical Context:")
            for key, value in context.technical_context.items():
                context_parts.append(f"  {key}: {value}")
        
        # Add agent specializations
        if context.agent_specializations:
            context_parts.append(f"Previous Agents: {', '.join(context.agent_specializations)}")
        
        return "\n".join(context_parts)
    
    async def update_conversation_context(
        self, 
        context: ConversationContext, 
        user_message: str, 
        ai_response: str, 
        agent: str
    ):
        """Update conversation context with new message exchange"""
        
        # Add to conversation history
        context.conversation_history.append({
            "user_message": user_message,
            "ai_response": ai_response,
            "agent": agent,
            "timestamp": datetime.utcnow()
        })
        
        # Update agent specializations
        if agent not in context.agent_specializations:
            context.agent_specializations.append(agent)
        
        # Update technical context based on message content
        await self._update_technical_context(context, user_message, ai_response)
        
        # Update current topic
        context.current_topic = await self._extract_topic(user_message)
        
        # Update timestamp
        context.updated_at = datetime.utcnow()
        
        # Keep conversation history manageable
        if len(context.conversation_history) > 50:
            context.conversation_history = context.conversation_history[-50:]
    
    async def _update_technical_context(
        self, 
        context: ConversationContext, 
        user_message: str, 
        ai_response: str
    ):
        """Update technical context based on conversation content"""
        
        # Extract technical keywords and concepts
        technical_keywords = [
            "react", "fastapi", "mongodb", "typescript", "python", "javascript",
            "api", "database", "frontend", "backend", "deployment", "docker",
            "kubernetes", "aws", "gcp", "azure", "microservices", "architecture"
        ]
        
        message_lower = user_message.lower()
        response_lower = ai_response.lower()
        
        for keyword in technical_keywords:
            if keyword in message_lower or keyword in response_lower:
                context.technical_context[keyword] = context.technical_context.get(keyword, 0) + 1
    
    async def _extract_topic(self, message: str) -> str:
        """Extract current topic from message"""
        
        # Simple topic extraction based on keywords
        topic_patterns = {
            "development": ["code", "develop", "build", "implement", "programming"],
            "design": ["design", "ui", "ux", "interface", "layout", "style"],
            "testing": ["test", "bug", "error", "quality", "validation"],
            "deployment": ["deploy", "production", "server", "hosting", "infrastructure"],
            "architecture": ["architecture", "system", "design pattern", "scalability"],
            "integration": ["api", "integration", "connect", "service", "webhook"]
        }
        
        message_lower = message.lower()
        
        for topic, keywords in topic_patterns.items():
            if any(keyword in message_lower for keyword in keywords):
                return topic
        
        return "general"
    
    async def _check_coordination_needed(
        self, 
        message: str, 
        context: ConversationContext, 
        selected_agent: str
    ) -> List[Dict[str, str]]:
        """Check if multi-agent coordination would be beneficial"""
        
        coordination_opportunities = []
        
        # Check coordination triggers
        for trigger, agents in self.coordination_rules["coordination_triggers"].items():
            if selected_agent in agents and len(agents) > 1:
                other_agents = [a for a in agents if a != selected_agent]
                if any(keyword in message.lower() for keyword in trigger.split("_")):
                    coordination_opportunities.append({
                        "type": trigger,
                        "agents": other_agents,
                        "reason": f"Complex {trigger.replace('_', ' ')} task detected"
                    })
        
        return coordination_opportunities
    
    async def _coordinate_multi_agents(
        self, 
        message: str, 
        context: ConversationContext, 
        primary_agent: str
    ) -> str:
        """Coordinate multiple agents for complex tasks"""
        
        # For now, return the primary agent
        # TODO: Implement actual multi-agent coordination
        return primary_agent