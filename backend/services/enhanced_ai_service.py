# Enhanced AI Service for Aether AI Platform
# Provides advanced AI capabilities with improved conversation quality and multi-agent coordination

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from groq import AsyncGroq
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class EnhancedAIService:
    """Enhanced AI service with improved conversation quality and multi-agent coordination"""
    
    def __init__(self):
        self.groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.conversation_history = {}
        self.agent_context = {}
        self.model_config = {
            "llama-3.1-70b-versatile": {
                "max_tokens": 8192,
                "temperature": 0.7,
                "use_case": "complex_reasoning",
                "speed": "medium"
            },
            "llama-3.1-8b-instant": {
                "max_tokens": 8192,
                "temperature": 0.8,
                "use_case": "quick_responses",
                "speed": "ultra_fast"
            },
            "mixtral-8x7b-32768": {
                "max_tokens": 32768,
                "temperature": 0.6,
                "use_case": "long_context",
                "speed": "fast"
            }
        }
        
        # Enhanced agent personalities with better coordination
        self.agents = {
            "developer": {
                "name": "Senior Developer Agent",
                "personality": "Expert full-stack developer with 10+ years experience",
                "specialties": ["Architecture", "Code Review", "Best Practices", "Performance"],
                "system_prompt": """You are a senior software developer with deep expertise in modern web development, architecture patterns, and best practices. You provide clear, actionable solutions with code examples. Always consider scalability, maintainability, and performance. When working with other agents, clearly hand off specific tasks and provide context.""",
                "handoff_triggers": ["design needed", "testing required", "integration needed"],
                "preferred_model": "llama-3.1-70b-versatile"
            },
            "designer": {
                "name": "UI/UX Design Agent",
                "personality": "Creative designer focused on user experience and modern aesthetics",
                "specialties": ["UI Design", "UX Research", "Design Systems", "Accessibility"],
                "system_prompt": """You are a senior UI/UX designer specializing in modern, accessible design. You create beautiful, functional interfaces following current design trends and accessibility standards. Focus on user experience, visual hierarchy, and responsive design. Collaborate effectively with developers by providing clear design specifications.""",
                "handoff_triggers": ["development needed", "testing required", "accessibility review"],
                "preferred_model": "llama-3.1-8b-instant"
            },
            "tester": {
                "name": "QA Testing Agent",
                "personality": "Meticulous QA engineer focused on quality and reliability",
                "specialties": ["Test Strategy", "Automation", "Bug Detection", "Performance Testing"],
                "system_prompt": """You are a senior QA engineer with expertise in comprehensive testing strategies. You identify potential issues, create test plans, and ensure high quality standards. Focus on edge cases, performance implications, and user scenarios. Coordinate with developers and designers to ensure quality throughout the development process.""",
                "handoff_triggers": ["development needed", "design clarification", "performance analysis"],
                "preferred_model": "llama-3.1-70b-versatile"
            },
            "integrator": {
                "name": "Integration Specialist",
                "personality": "Expert in connecting systems and third-party services",
                "specialties": ["API Integration", "Database Design", "System Architecture", "Data Flow"],
                "system_prompt": """You are an integration specialist expert in connecting various systems, APIs, and services. You design robust data flows, handle API integrations, and ensure secure, scalable connections. Focus on reliability, security, and performance of integrations. Work closely with developers to implement integration solutions.""",
                "handoff_triggers": ["development needed", "testing required", "security review"],
                "preferred_model": "llama-3.1-70b-versatile"
            },
            "analyst": {
                "name": "Business Analyst",
                "personality": "Strategic thinker focused on requirements and business value",
                "specialties": ["Requirements Analysis", "User Stories", "Process Optimization", "Strategy"],
                "system_prompt": """You are a senior business analyst who translates business needs into technical requirements. You excel at understanding user needs, creating clear specifications, and optimizing processes. Focus on business value, user experience, and practical solutions. Collaborate with all team members to ensure alignment with business objectives.""",
                "handoff_triggers": ["technical implementation", "design needed", "testing strategy"],
                "preferred_model": "mixtral-8x7b-32768"
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
        """Process message with enhanced AI capabilities and multi-agent coordination"""
        
        try:
            # Initialize conversation history
            conv_key = f"{user_id}_{conversation_id or 'default'}"
            if conv_key not in self.conversation_history:
                self.conversation_history[conv_key] = []
            
            # Get agent configuration
            agent_config = self.agents.get(agent, self.agents["developer"])
            selected_model = model or agent_config["preferred_model"]
            
            # Build enhanced context
            enhanced_context = await self._build_enhanced_context(
                message, agent, context, user_id, project_id, conv_key
            )
            
            # Check for agent handoffs
            handoff_agent = await self._check_agent_handoff(message, agent)
            if handoff_agent and handoff_agent != agent:
                return await self._handle_agent_handoff(
                    message, agent, handoff_agent, enhanced_context, 
                    user_id, project_id, conversation_id, selected_model
                )
            
            # Generate enhanced response
            response = await self._generate_enhanced_response(
                message, agent_config, enhanced_context, selected_model
            )
            
            # Update conversation history
            self.conversation_history[conv_key].extend([
                {"role": "user", "content": message, "timestamp": datetime.utcnow()},
                {"role": "assistant", "content": response["content"], "agent": agent, "timestamp": datetime.utcnow()}
            ])
            
            # Keep history manageable
            if len(self.conversation_history[conv_key]) > 20:
                self.conversation_history[conv_key] = self.conversation_history[conv_key][-20:]
            
            return {
                "response": response["content"],
                "agent": agent,
                "model_used": selected_model,
                "confidence": response.get("confidence", 0.95),
                "suggestions": await self._generate_smart_suggestions(message, agent, response["content"]),
                "agent_insights": response.get("insights", []),
                "next_actions": response.get("next_actions", []),
                "collaboration_opportunities": await self._identify_collaboration_opportunities(message, agent),
                "metadata": {
                    "processing_time": response.get("processing_time", 0),
                    "context_length": len(enhanced_context),
                    "conversation_length": len(self.conversation_history[conv_key]),
                    "agent_specialties": agent_config["specialties"],
                    "model_capabilities": self.model_config.get(selected_model, {})
                }
            }
            
        except Exception as e:
            logger.error(f"Enhanced AI processing error: {e}")
            return {
                "response": f"I apologize, but I encountered an error processing your request. Please try again. Error: {str(e)}",
                "agent": agent,
                "model_used": selected_model or "llama-3.1-8b-instant",
                "confidence": 0.1,
                "error": str(e)
            }

    async def _build_enhanced_context(
        self, message: str, agent: str, context: List[Dict], 
        user_id: str, project_id: str, conv_key: str
    ) -> str:
        """Build enhanced context with conversation history and project information"""
        
        context_parts = []
        
        # Add agent context
        agent_config = self.agents.get(agent, self.agents["developer"])
        context_parts.append(f"AGENT ROLE: {agent_config['name']}")
        context_parts.append(f"SPECIALTIES: {', '.join(agent_config['specialties'])}")
        
        # Add conversation history
        if conv_key in self.conversation_history:
            recent_history = self.conversation_history[conv_key][-6:]  # Last 3 exchanges
            if recent_history:
                context_parts.append("\nRECENT CONVERSATION:")
                for msg in recent_history:
                    role = "User" if msg["role"] == "user" else f"AI ({msg.get('agent', 'assistant')})"
                    context_parts.append(f"{role}: {msg['content'][:200]}...")
        
        # Add project context if available
        if project_id and context:
            context_parts.append("\nPROJECT CONTEXT:")
            for ctx in context[:3]:  # Limit context size
                if isinstance(ctx, dict):
                    context_parts.append(f"- {ctx.get('type', 'info')}: {str(ctx.get('content', ''))[:150]}")
        
        # Add current timestamp
        context_parts.append(f"\nCURRENT TIME: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return "\n".join(context_parts)

    async def _check_agent_handoff(self, message: str, current_agent: str) -> Optional[str]:
        """Check if message should be handed off to a different agent"""
        
        message_lower = message.lower()
        
        # Define handoff keywords for each agent
        handoff_patterns = {
            "designer": ["design", "ui", "ux", "interface", "style", "layout", "visual", "color", "typography"],
            "tester": ["test", "bug", "error", "quality", "validation", "performance", "benchmark"],
            "integrator": ["api", "integration", "database", "connect", "webhook", "third-party", "service"],
            "analyst": ["requirements", "business", "strategy", "analysis", "process", "workflow"],
            "developer": ["code", "implement", "build", "develop", "programming", "architecture"]
        }
        
        # Don't handoff if we're already using the best agent
        current_patterns = handoff_patterns.get(current_agent, [])
        if any(pattern in message_lower for pattern in current_patterns):
            return current_agent
        
        # Find best agent for this message
        best_agent = current_agent
        best_score = 0
        
        for agent, patterns in handoff_patterns.items():
            if agent != current_agent:
                score = sum(1 for pattern in patterns if pattern in message_lower)
                if score > best_score:
                    best_score = score
                    best_agent = agent
        
        # Only handoff if there's a clear better agent (score > 1)
        return best_agent if best_score > 1 else current_agent

    async def _handle_agent_handoff(
        self, message: str, from_agent: str, to_agent: str, 
        context: str, user_id: str, project_id: str, 
        conversation_id: str, model: str
    ) -> Dict[str, Any]:
        """Handle agent handoff with proper context transfer"""
        
        handoff_message = f"""I'm handing this over to our {self.agents[to_agent]['name']} who specializes in {', '.join(self.agents[to_agent]['specialties'])}.

HANDOFF CONTEXT:
- Previous agent: {self.agents[from_agent]['name']}
- User request: {message}
- Reason for handoff: Better expertise match

{to_agent.title()} Agent, please take over and provide your expert assistance."""

        return await self.process_enhanced_message(
            handoff_message + "\n\nOriginal request: " + message,
            agent=to_agent,
            context=[{"type": "handoff", "content": f"From {from_agent} to {to_agent}"}],
            user_id=user_id,
            project_id=project_id,
            conversation_id=conversation_id,
            model=model
        )

    async def _generate_enhanced_response(
        self, message: str, agent_config: Dict, context: str, model: str
    ) -> Dict[str, Any]:
        """Generate enhanced response using Groq with improved prompting"""
        
        start_time = datetime.utcnow()
        
        # Build enhanced system prompt
        system_prompt = f"""{agent_config['system_prompt']}

ENHANCED CAPABILITIES:
- Provide specific, actionable solutions
- Include code examples when relevant
- Consider scalability and best practices
- Suggest next steps and improvements
- Collaborate effectively with other agents

CONTEXT:
{context}

RESPONSE GUIDELINES:
- Be concise but comprehensive
- Use markdown formatting for code
- Provide specific examples
- Include relevant suggestions
- Mention collaboration opportunities when appropriate"""

        try:
            # Call Groq API with enhanced configuration
            completion = await self.groq_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=self.model_config.get(model, {}).get("max_tokens", 4096),
                temperature=self.model_config.get(model, {}).get("temperature", 0.7),
                stream=False
            )
            
            response_content = completion.choices[0].message.content
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Extract insights and next actions from response
            insights = await self._extract_insights(response_content, agent_config)
            next_actions = await self._extract_next_actions(response_content)
            
            return {
                "content": response_content,
                "confidence": 0.95,
                "processing_time": processing_time,
                "insights": insights,
                "next_actions": next_actions
            }
            
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return {
                "content": f"I apologize, but I'm having trouble processing your request right now. Please try again in a moment. Technical details: {str(e)}",
                "confidence": 0.1,
                "processing_time": 0,
                "error": str(e)
            }

    async def _generate_smart_suggestions(
        self, message: str, agent: str, response: str
    ) -> List[Dict[str, str]]:
        """Generate smart suggestions based on the conversation"""
        
        suggestions = []
        
        # Agent-specific suggestions
        if agent == "developer":
            suggestions.extend([
                {"type": "code_review", "text": "Review code for best practices", "action": "review_code"},
                {"type": "testing", "text": "Add unit tests for this code", "action": "add_tests"},
                {"type": "optimization", "text": "Optimize for performance", "action": "optimize"}
            ])
        elif agent == "designer":
            suggestions.extend([
                {"type": "accessibility", "text": "Check accessibility compliance", "action": "check_a11y"},
                {"type": "responsive", "text": "Make design responsive", "action": "make_responsive"},
                {"type": "user_testing", "text": "Conduct user testing", "action": "user_test"}
            ])
        elif agent == "tester":
            suggestions.extend([
                {"type": "automation", "text": "Automate these tests", "action": "automate_tests"},
                {"type": "coverage", "text": "Check test coverage", "action": "check_coverage"},
                {"type": "performance", "text": "Add performance benchmarks", "action": "add_benchmarks"}
            ])
        
        # Context-based suggestions
        message_lower = message.lower()
        if "error" in message_lower or "bug" in message_lower:
            suggestions.append({"type": "debug", "text": "Debug this issue", "action": "debug"})
        
        if "deploy" in message_lower or "production" in message_lower:
            suggestions.append({"type": "deployment", "text": "Review deployment checklist", "action": "deploy_check"})
        
        return suggestions[:5]  # Limit to 5 suggestions

    async def _extract_insights(self, response: str, agent_config: Dict) -> List[str]:
        """Extract key insights from the response"""
        
        insights = []
        
        # Look for key phrases that indicate insights
        if "best practice" in response.lower():
            insights.append("Contains best practice recommendations")
        
        if "performance" in response.lower():
            insights.append("Includes performance considerations")
        
        if "scalability" in response.lower():
            insights.append("Addresses scalability concerns")
        
        if "security" in response.lower():
            insights.append("Mentions security implications")
        
        # Agent-specific insights
        specialties = agent_config.get("specialties", [])
        for specialty in specialties:
            if specialty.lower() in response.lower():
                insights.append(f"Leverages {specialty} expertise")
        
        return insights

    async def _extract_next_actions(self, response: str) -> List[str]:
        """Extract suggested next actions from response"""
        
        actions = []
        
        # Look for action-oriented phrases
        action_indicators = [
            "next step", "should", "recommend", "suggest", "consider",
            "implement", "create", "add", "update", "modify", "test"
        ]
        
        sentences = response.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower().strip()
            if any(indicator in sentence_lower for indicator in action_indicators):
                if len(sentence_lower) > 10 and len(sentence_lower) < 100:
                    actions.append(sentence.strip())
        
        return actions[:3]  # Limit to 3 next actions

    async def _identify_collaboration_opportunities(
        self, message: str, current_agent: str
    ) -> List[Dict[str, str]]:
        """Identify opportunities for multi-agent collaboration"""
        
        opportunities = []
        message_lower = message.lower()
        
        # Cross-functional opportunities
        collaborations = {
            "developer": {
                "designer": ["ui", "interface", "user experience", "design"],
                "tester": ["test", "quality", "bug", "validation"],
                "integrator": ["api", "integration", "connect", "service"]
            },
            "designer": {
                "developer": ["implement", "code", "build"],
                "tester": ["usability", "accessibility", "user test"],
                "analyst": ["requirements", "user story", "workflow"]
            },
            "tester": {
                "developer": ["fix", "debug", "implement"],
                "designer": ["usability", "user experience"],
                "integrator": ["api test", "integration test"]
            }
        }
        
        if current_agent in collaborations:
            for other_agent, keywords in collaborations[current_agent].items():
                if any(keyword in message_lower for keyword in keywords):
                    agent_info = self.agents[other_agent]
                    opportunities.append({
                        "agent": other_agent,
                        "reason": f"Could benefit from {agent_info['name']} expertise",
                        "specialties": ", ".join(agent_info["specialties"])
                    })
        
        return opportunities[:2]  # Limit to 2 opportunities

    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get available Groq models with enhanced information"""
        
        models = []
        for model_id, config in self.model_config.items():
            models.append({
                "id": model_id,
                "name": model_id.replace("-", " ").title(),
                "description": f"Optimized for {config['use_case'].replace('_', ' ')}",
                "max_tokens": config["max_tokens"],
                "speed": config["speed"],
                "use_case": config["use_case"],
                "provider": "Groq",
                "available": True
            })
        
        return models

    async def get_enhanced_agents(self) -> List[Dict[str, Any]]:
        """Get enhanced agent information"""
        
        agents = []
        for agent_id, config in self.agents.items():
            agents.append({
                "id": agent_id,
                "name": config["name"],
                "personality": config["personality"],
                "specialties": config["specialties"],
                "preferred_model": config["preferred_model"],
                "handoff_triggers": config["handoff_triggers"],
                "collaboration_strength": len(config["specialties"]) * 20  # Simple metric
            })
        
        return agents

    async def get_conversation_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics for user conversations"""
        
        user_conversations = [
            conv for conv_key, conv in self.conversation_history.items() 
            if conv_key.startswith(user_id)
        ]
        
        if not user_conversations:
            return {"total_conversations": 0, "message_count": 0}
        
        total_messages = sum(len(conv) for conv in user_conversations)
        agent_usage = {}
        
        for conv in user_conversations:
            for msg in conv:
                if msg["role"] == "assistant":
                    agent = msg.get("agent", "unknown")
                    agent_usage[agent] = agent_usage.get(agent, 0) + 1
        
        return {
            "total_conversations": len(user_conversations),
            "message_count": total_messages,
            "agent_usage": agent_usage,
            "most_used_agent": max(agent_usage.items(), key=lambda x: x[1])[0] if agent_usage else None
        }