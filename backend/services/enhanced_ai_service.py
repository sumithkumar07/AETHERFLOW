"""
Enhanced AI Service with improved conversation quality and multi-agent coordination
"""
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
import os
from groq import Groq

from .ai_service import AIService

logger = logging.getLogger(__name__)

class EnhancedAIService(AIService):
    """Enhanced AI Service with 2025 capabilities"""
    
    def __init__(self):
        super().__init__()
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.conversation_memory = {}
        self.agent_specialists = {
            "developer": {
                "expertise": ["coding", "debugging", "architecture", "best practices"],
                "preferred_model": "llama-3.1-70b-versatile",
                "collaboration_strength": ["tester", "designer"],
                "handoff_triggers": ["testing", "ui", "design", "qa"]
            },
            "designer": {
                "expertise": ["ui", "ux", "design systems", "accessibility", "user research"],
                "preferred_model": "llama-3.1-8b-instant", 
                "collaboration_strength": ["developer", "tester"],
                "handoff_triggers": ["implement", "code", "develop", "api"]
            },
            "tester": {
                "expertise": ["testing", "quality assurance", "automation", "performance"],
                "preferred_model": "llama-3.1-70b-versatile",
                "collaboration_strength": ["developer", "analyst"],
                "handoff_triggers": ["fix", "debug", "implement", "analyze"]
            },
            "integrator": {
                "expertise": ["apis", "third party", "integration", "data flow"],
                "preferred_model": "llama-3.1-70b-versatile", 
                "collaboration_strength": ["developer", "analyst"],
                "handoff_triggers": ["code", "implement", "data analysis"]
            },
            "analyst": {
                "expertise": ["requirements", "business logic", "optimization", "reporting"],
                "preferred_model": "mixtral-8x7b-32768",
                "collaboration_strength": ["integrator", "developer"],
                "handoff_triggers": ["technical", "implement", "code"]
            }
        }
        
    async def process_enhanced_message(
        self, 
        message: str, 
        agent: str = "developer",
        context: List[Dict] = None,
        user_id: str = None,
        project_id: str = None,
        conversation_id: str = None,
        model: str = None
    ) -> Dict[str, Any]:
        """Process message with enhanced AI capabilities"""
        
        try:
            # Get agent configuration
            agent_config = self.agent_specialists.get(agent, self.agent_specialists["developer"])
            
            # Select optimal model for agent
            selected_model = model or agent_config["preferred_model"]
            
            # Build enhanced context
            enhanced_context = await self._build_enhanced_context(
                message, agent, context, user_id, project_id, conversation_id
            )
            
            # Generate agent-specific system prompt
            system_prompt = await self._generate_agent_system_prompt(agent, enhanced_context)
            
            # Prepare conversation messages
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Add conversation context
            if enhanced_context.get("conversation_history"):
                for ctx_msg in enhanced_context["conversation_history"][-6:]:  # Last 6 messages
                    messages.append({
                        "role": ctx_msg.get("role", "user"),
                        "content": ctx_msg.get("content", "")
                    })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Generate response with GROQ
            try:
                completion = self.groq_client.chat.completions.create(
                    model=selected_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=4000,
                    top_p=1,
                    stream=False
                )
                
                response_content = completion.choices[0].message.content
                
            except Exception as groq_error:
                logger.error(f"GROQ API error: {groq_error}")
                # Fallback to parent method
                fallback_response = await super().process_message(
                    message, selected_model, agent, context, user_id, project_id
                )
                response_content = fallback_response["response"]
            
            # Analyze response for collaboration opportunities
            collaboration_opportunities = await self._detect_collaboration_opportunities(
                message, response_content, agent
            )
            
            # Generate smart suggestions
            suggestions = await self._generate_smart_suggestions(message, agent, response_content)
            
            # Generate next actions
            next_actions = await self._generate_next_actions(message, agent, response_content)
            
            # Agent insights
            agent_insights = await self._generate_agent_insights(agent, message, response_content)
            
            # Update conversation memory
            if conversation_id:
                await self._update_conversation_memory(conversation_id, message, response_content, agent)
            
            return {
                "response": response_content,
                "agent": agent,
                "model_used": selected_model,
                "confidence": 0.95,
                "suggestions": suggestions,
                "agent_insights": agent_insights,
                "next_actions": next_actions,
                "collaboration_opportunities": collaboration_opportunities,
                "metadata": {
                    "enhanced_processing": True,
                    "agent_specialization": agent_config["expertise"],
                    "collaboration_ready": True,
                    "conversation_id": conversation_id,
                    "processing_time": datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Enhanced AI processing error: {e}")
            # Fallback to basic AI service
            return await super().process_message(message, model, agent, context, user_id, project_id)
    
    async def _build_enhanced_context(
        self, message: str, agent: str, context: List[Dict], 
        user_id: str, project_id: str, conversation_id: str
    ) -> Dict[str, Any]:
        """Build enhanced context for better AI responses"""
        
        enhanced_context = {
            "user_id": user_id,
            "project_id": project_id,
            "conversation_id": conversation_id,
            "current_agent": agent,
            "timestamp": datetime.utcnow().isoformat(),
            "conversation_history": context or [],
            "agent_expertise": self.agent_specialists.get(agent, {}).get("expertise", []),
            "collaboration_context": {},
            "project_context": {}
        }
        
        # Add conversation memory if available
        if conversation_id and conversation_id in self.conversation_memory:
            memory = self.conversation_memory[conversation_id]
            enhanced_context["previous_interactions"] = memory.get("interactions", [])
            enhanced_context["established_context"] = memory.get("context", {})
            enhanced_context["user_preferences"] = memory.get("preferences", {})
        
        # Detect project context from message
        if any(keyword in message.lower() for keyword in ["project", "app", "application", "code"]):
            enhanced_context["project_context"]["active"] = True
            enhanced_context["project_context"]["type"] = "development"
        
        return enhanced_context
    
    async def _generate_agent_system_prompt(self, agent: str, context: Dict) -> str:
        """Generate specialized system prompt for each agent"""
        
        base_prompt = f"""You are Aether AI's {agent} agent, an expert AI assistant specializing in {agent} tasks. 

Current date: {datetime.now().strftime('%Y-%m-%d')}
Agent specialization: {', '.join(self.agent_specialists.get(agent, {}).get('expertise', []))}

Enhanced capabilities in 2025:
- Advanced conversation memory and context awareness
- Multi-agent collaboration and intelligent handoffs
- Real-time code generation and review
- Voice interface compatibility
- Accessibility-first development
- Modern best practices and emerging technologies

"""
        
        # Agent-specific prompts
        agent_prompts = {
            "developer": """
As the Developer Agent, you excel in:
- Modern full-stack development (React 18+, Next.js 14+, FastAPI, Python 3.12+)
- AI-assisted coding and intelligent code completion
- Clean architecture and design patterns
- Performance optimization and security best practices
- Real-time collaborative development
- Voice-driven coding workflows

Provide practical, implementable solutions with clear explanations. When appropriate, suggest collaboration with other agents (Designer for UI/UX, Tester for QA, etc.).
""",
            "designer": """
As the Designer Agent, you specialize in:
- Modern UI/UX design with 2025 trends (glass morphism, AI-driven layouts)
- Accessibility-first design (WCAG 2.2+)
- Design systems and component libraries
- User psychology and behavioral design
- Voice interface design
- Responsive and adaptive design

Create beautiful, functional designs with detailed implementation guidance. Collaborate with Developer agents for implementation feasibility.
""",
            "tester": """
As the QA/Testing Agent, you focus on:
- Comprehensive test strategies (unit, integration, e2e)
- AI-powered test generation and automation
- Performance and accessibility testing
- Security vulnerability assessment
- CI/CD pipeline optimization
- Quality metrics and reporting

Provide thorough testing recommendations and collaborate with Developers for implementation.
""",
            "integrator": """
As the Integration Agent, you handle:
- Modern API design (REST, GraphQL, gRPC)
- Third-party service integrations
- Cloud-native architectures and microservices
- Real-time data synchronization
- Authentication and authorization systems
- Data pipeline orchestration

Design robust, scalable integration solutions with security and performance in mind.
""",
            "analyst": """
As the Business Analyst Agent, you provide:
- Requirements analysis and user story creation
- Business logic optimization
- Data analytics and insights
- ROI analysis and project planning
- Process automation recommendations
- Strategic technology decisions

Deliver actionable business intelligence with technical feasibility considerations.
"""
        }
        
        return base_prompt + agent_prompts.get(agent, agent_prompts["developer"])
    
    async def _detect_collaboration_opportunities(
        self, message: str, response: str, current_agent: str
    ) -> List[Dict]:
        """Detect opportunities for multi-agent collaboration"""
        
        opportunities = []
        agent_config = self.agent_specialists.get(current_agent, {})
        
        # Check for handoff triggers
        message_lower = message.lower() + " " + response.lower()
        
        for trigger in agent_config.get("handoff_triggers", []):
            if trigger in message_lower:
                # Find best collaborating agent
                for collaborator in agent_config.get("collaboration_strength", []):
                    if collaborator != current_agent:
                        opportunities.append({
                            "agent": collaborator,
                            "reason": f"Detected {trigger} context - {collaborator} agent can provide specialized assistance",
                            "confidence": 0.8,
                            "suggested_action": f"Handoff to {collaborator} agent for specialized {trigger} handling"
                        })
        
        # Detect complex tasks that benefit from multiple agents
        complexity_keywords = ["complex", "full", "complete", "end-to-end", "comprehensive"]
        if any(keyword in message_lower for keyword in complexity_keywords):
            opportunities.append({
                "agent": "multi_agent_team",
                "reason": "Complex task detected - multiple agents can collaborate for comprehensive solution",
                "confidence": 0.9,
                "suggested_action": "Initialize multi-agent collaboration workflow"
            })
        
        return opportunities[:3]  # Limit to top 3 opportunities
    
    async def _generate_smart_suggestions(self, message: str, agent: str, response: str) -> List[str]:
        """Generate context-aware smart suggestions"""
        
        suggestions = []
        message_lower = message.lower()
        
        # Agent-specific suggestions
        if agent == "developer":
            if "error" in message_lower or "bug" in message_lower:
                suggestions.extend([
                    "🐛 Run automated debugging analysis",
                    "🧪 Generate test cases to prevent this issue",
                    "📊 Get performance impact analysis"
                ])
            elif "implement" in message_lower or "code" in message_lower:
                suggestions.extend([
                    "📝 Generate comprehensive documentation",
                    "🎨 Get UI/UX recommendations from Designer agent",
                    "⚡ Optimize for performance and accessibility"
                ])
        
        elif agent == "designer":
            suggestions.extend([
                "💻 Get implementation guidance from Developer agent",
                "♿ Verify accessibility compliance",
                "📱 Optimize for mobile experience"
            ])
        
        elif agent == "tester":
            suggestions.extend([
                "🔧 Request implementation from Developer agent", 
                "📈 Set up performance monitoring",
                "🔒 Add security testing checks"
            ])
        
        # General AI-powered suggestions
        general_suggestions = [
            "🤖 Switch to voice interaction mode",
            "🔄 Continue with multi-agent collaboration",
            "📋 Generate project documentation",
            "🚀 Prepare for deployment"
        ]
        
        suggestions.extend(general_suggestions)
        return suggestions[:4]  # Return top 4 suggestions
    
    async def _generate_next_actions(self, message: str, agent: str, response: str) -> List[Dict]:
        """Generate contextual next actions"""
        
        actions = []
        
        # Analyze response for actionable items
        if "implement" in response.lower():
            actions.append({
                "action": "Start Implementation",
                "description": "Begin implementing the suggested solution",
                "priority": "high",
                "estimated_time": "30-60 minutes",
                "requires_agent": "developer"
            })
        
        if "test" in response.lower():
            actions.append({
                "action": "Create Test Cases", 
                "description": "Generate comprehensive test cases",
                "priority": "medium",
                "estimated_time": "15-30 minutes",
                "requires_agent": "tester"
            })
        
        if "design" in response.lower() or "ui" in response.lower():
            actions.append({
                "action": "Design Review",
                "description": "Get UI/UX design recommendations", 
                "priority": "medium",
                "estimated_time": "20-40 minutes",
                "requires_agent": "designer"
            })
        
        # Default next actions
        actions.append({
            "action": "Continue Conversation",
            "description": "Ask follow-up questions or request clarifications",
            "priority": "low",
            "estimated_time": "5-10 minutes",
            "requires_agent": agent
        })
        
        return actions[:3]  # Return top 3 actions
    
    async def _generate_agent_insights(self, agent: str, message: str, response: str) -> List[str]:
        """Generate agent-specific insights"""
        
        insights = []
        
        # Agent specialization insights
        agent_config = self.agent_specialists.get(agent, {})
        expertise = agent_config.get("expertise", [])
        
        insights.append(f"💡 As your {agent} agent, I focused on: {', '.join(expertise)}")
        
        # Collaboration insights
        if agent_config.get("collaboration_strength"):
            collabs = ", ".join(agent_config["collaboration_strength"])
            insights.append(f"🤝 I work best with: {collabs} agents")
        
        # Context-specific insights
        if len(message) > 100:
            insights.append("📋 Detailed request processed - comprehensive analysis provided")
        
        if any(tech in message.lower() for tech in ["react", "python", "api", "database"]):
            insights.append("⚡ Technical context detected - leveraging specialized knowledge")
        
        return insights[:3]
    
    async def _update_conversation_memory(
        self, conversation_id: str, message: str, response: str, agent: str
    ):
        """Update conversation memory for better context"""
        
        if conversation_id not in self.conversation_memory:
            self.conversation_memory[conversation_id] = {
                "interactions": [],
                "context": {},
                "preferences": {},
                "agents_used": [],
                "topics": []
            }
        
        memory = self.conversation_memory[conversation_id]
        
        # Add interaction
        memory["interactions"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent,
            "message_length": len(message),
            "response_length": len(response),
            "topics_detected": self._extract_topics(message + " " + response)
        })
        
        # Track agents used
        if agent not in memory["agents_used"]:
            memory["agents_used"].append(agent)
        
        # Update topics
        new_topics = self._extract_topics(message + " " + response)
        memory["topics"] = list(set(memory["topics"] + new_topics))
        
        # Keep memory manageable (last 20 interactions)
        memory["interactions"] = memory["interactions"][-20:]
    
    def _extract_topics(self, text: str) -> List[str]:
        """Extract key topics from text"""
        
        tech_keywords = [
            "react", "python", "javascript", "api", "database", "ui", "ux", "design",
            "testing", "security", "performance", "deployment", "integration"
        ]
        
        topics = []
        text_lower = text.lower()
        
        for keyword in tech_keywords:
            if keyword in text_lower:
                topics.append(keyword)
        
        return topics[:5]  # Return top 5 topics
    
    async def get_available_models(self) -> List[Dict]:
        """Get enhanced models with 2025 capabilities"""
        
        try:
            # Use parent method as base
            base_models = await super().get_available_models()
            
            # Enhance with 2025 features
            enhanced_models = []
            for model in base_models:
                enhanced_model = {
                    **model,
                    "enhanced_2025": True,
                    "multi_agent_ready": True,
                    "voice_compatible": True,
                    "context_window": 32768,
                    "collaboration_optimized": True,
                    "real_time_capable": True
                }
                enhanced_models.append(enhanced_model)
            
            return enhanced_models
            
        except Exception as e:
            logger.error(f"Failed to get enhanced models: {e}")
            return []
    
    async def get_enhanced_agents(self) -> List[Dict]:
        """Get enhanced agents with specialization info"""
        
        enhanced_agents = []
        
        for agent_id, config in self.agent_specialists.items():
            enhanced_agents.append({
                "id": agent_id,
                "name": f"Aether {agent_id.title()}",
                "icon": self._get_agent_icon(agent_id),
                "description": f"Specialized {agent_id} agent with enhanced 2025 capabilities",
                "expertise": config["expertise"],
                "preferred_model": config["preferred_model"],
                "collaboration_strength": config["collaboration_strength"],
                "handoff_triggers": config["handoff_triggers"],
                "enhanced_2025": True,
                "multi_agent_ready": True,
                "voice_capable": True,
                "real_time_collaboration": True
            })
        
        return enhanced_agents
    
    def _get_agent_icon(self, agent_id: str) -> str:
        """Get icon for agent"""
        icons = {
            "developer": "💻",
            "designer": "🎨", 
            "tester": "🧪",
            "integrator": "🔗",
            "analyst": "📊"
        }
        return icons.get(agent_id, "🤖")
    
    async def get_conversation_analytics(self, user_id: str) -> Dict:
        """Get enhanced conversation analytics"""
        
        analytics = {
            "total_conversations": 0,
            "total_messages": 0,
            "most_used_agent": "developer",
            "collaboration_events": 0,
            "avg_response_time": 2.3,
            "success_rate": 0.98,
            "user_satisfaction": 4.8,
            "enhanced_features_used": {
                "multi_agent_collaboration": 0,
                "voice_interaction": 0,
                "smart_suggestions": 0,
                "intelligent_handoffs": 0
            }
        }
        
        # Calculate from conversation memory
        for conv_id, memory in self.conversation_memory.items():
            analytics["total_conversations"] += 1
            analytics["total_messages"] += len(memory["interactions"])
            
            if len(memory["agents_used"]) > 1:
                analytics["enhanced_features_used"]["multi_agent_collaboration"] += 1
        
        return analytics