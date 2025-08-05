import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from groq import AsyncGroq
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class AgentRole(Enum):
    DEVELOPER = "developer"
    DESIGNER = "designer"
    ARCHITECT = "architect"
    TESTER = "tester"
    PROJECT_MANAGER = "project_manager"

@dataclass
class ConversationContext:
    session_id: str
    user_id: str
    project_id: Optional[str] = None
    active_agents: List[AgentRole] = None
    conversation_history: List[Dict] = None
    current_focus: Optional[str] = None
    collaboration_mode: bool = False

class EnhancedAIService:
    """Enhanced AI Service with multi-agent coordination and intelligent conversation management"""
    
    def __init__(self):
        self.groq_client = AsyncGroq(api_key=os.environ.get('GROQ_API_KEY'))
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        
        # Agent personalities and capabilities
        self.agent_configs = {
            AgentRole.DEVELOPER: {
                "name": "Dev",
                "personality": "Technical expert focused on clean, efficient code",
                "capabilities": ["coding", "debugging", "architecture", "best_practices"],
                "model": "llama-3.3-70b-versatile",  # Use best model for complex development tasks
                "system_prompt": """You are Dev, a senior software developer with expertise in modern web technologies, clean code practices, and system architecture. You focus on:
- Writing efficient, maintainable code
- Following best practices and design patterns
- Providing technical solutions with clear explanations
- Code reviews and optimization suggestions
- Integration patterns and API design

Always provide practical, working solutions with code examples when relevant."""
            },
            AgentRole.DESIGNER: {
                "name": "Luna",
                "personality": "Creative UX/UI expert focused on user experience",
                "capabilities": ["ui_design", "ux_patterns", "accessibility", "user_research"],
                "model": "llama-3.1-8b-instant",  # Fast model for design suggestions
                "system_prompt": """You are Luna, a creative UX/UI designer with expertise in modern design systems, user experience, and accessibility. You focus on:
- Creating intuitive, beautiful user interfaces
- Following design system principles and patterns
- Ensuring accessibility and inclusive design
- User journey optimization
- Visual hierarchy and typography

Always consider user needs first and provide design rationale with your suggestions."""
            },
            AgentRole.ARCHITECT: {
                "name": "Atlas",
                "personality": "System architect focused on scalable solutions",
                "capabilities": ["system_design", "scalability", "performance", "integration"],
                "model": "llama-3.3-70b-versatile",  # Complex architectural decisions need best model
                "system_prompt": """You are Atlas, a system architect with expertise in scalable applications, cloud architecture, and system integration. You focus on:
- Designing scalable, maintainable system architectures
- Database design and optimization
- API architecture and microservices
- Performance optimization strategies
- Security and compliance considerations

Always think about long-term maintainability and scalability in your architectural decisions."""
            },
            AgentRole.TESTER: {
                "name": "Quinn",
                "personality": "Quality assurance expert focused on reliability",
                "capabilities": ["testing", "quality_assurance", "automation", "performance_testing"],
                "model": "mixtral-8x7b-32768",  # Good balance for testing strategies
                "system_prompt": """You are Quinn, a quality assurance expert with expertise in testing strategies, automation, and ensuring application reliability. You focus on:
- Comprehensive testing strategies (unit, integration, e2e)
- Test automation and CI/CD integration
- Performance and load testing
- Security testing and vulnerability assessment
- Quality metrics and reporting

Always think about edge cases and potential failure scenarios."""
            },
            AgentRole.PROJECT_MANAGER: {
                "name": "Sage",
                "personality": "Strategic project coordinator focused on delivery",
                "capabilities": ["project_planning", "coordination", "communication", "delivery"],
                "model": "llama-3.1-8b-instant",  # Fast for coordination tasks
                "system_prompt": """You are Sage, a project manager with expertise in agile methodologies, team coordination, and successful project delivery. You focus on:
- Breaking down complex projects into manageable tasks
- Coordinating between different team members and stakeholders
- Risk assessment and mitigation strategies
- Timeline planning and resource allocation
- Clear communication and progress tracking

Always focus on practical next steps and clear deliverables."""
            }
        }

    async def initialize_conversation(
        self, 
        session_id: str, 
        user_id: str, 
        project_id: Optional[str] = None,
        initial_context: Optional[str] = None
    ) -> ConversationContext:
        """Initialize a new conversation context with intelligent agent selection"""
        
        # Determine which agents should be active based on context
        active_agents = await self._select_initial_agents(initial_context)
        
        context = ConversationContext(
            session_id=session_id,
            user_id=user_id,
            project_id=project_id,
            active_agents=active_agents,
            conversation_history=[],
            current_focus=initial_context,
            collaboration_mode=len(active_agents) > 1
        )
        
        self.conversation_contexts[session_id] = context
        
        logger.info(f"✅ Initialized conversation {session_id} with agents: {[agent.value for agent in active_agents]}")
        
        return context

    async def _select_initial_agents(self, context: Optional[str]) -> List[AgentRole]:
        """Intelligently select which agents should be active based on initial context"""
        
        if not context:
            return [AgentRole.DEVELOPER]  # Default to developer
        
        context_lower = context.lower()
        active_agents = []
        
        # Smart agent selection based on keywords and context
        if any(word in context_lower for word in ['code', 'function', 'api', 'database', 'implementation']):
            active_agents.append(AgentRole.DEVELOPER)
        
        if any(word in context_lower for word in ['ui', 'design', 'user', 'interface', 'layout', 'style']):
            active_agents.append(AgentRole.DESIGNER)
        
        if any(word in context_lower for word in ['architecture', 'system', 'scalability', 'performance', 'infrastructure']):
            active_agents.append(AgentRole.ARCHITECT)
        
        if any(word in context_lower for word in ['test', 'bug', 'quality', 'validation', 'error']):
            active_agents.append(AgentRole.TESTER)
        
        if any(word in context_lower for word in ['project', 'plan', 'timeline', 'organize', 'manage']):
            active_agents.append(AgentRole.PROJECT_MANAGER)
        
        # If no specific agents detected, use developer as default
        if not active_agents:
            active_agents.append(AgentRole.DEVELOPER)
        
        # Limit to max 3 agents for better coordination
        return active_agents[:3]

    async def enhance_conversation(
        self,
        session_id: str,
        user_message: str,
        include_context: bool = True
    ) -> Dict[str, Any]:
        """Process user message with enhanced multi-agent coordination"""
        
        if session_id not in self.conversation_contexts:
            await self.initialize_conversation(session_id, "unknown_user", initial_context=user_message)
        
        context = self.conversation_contexts[session_id]
        
        # Add user message to history
        context.conversation_history.append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Determine if agent handoff or collaboration is needed
        response_strategy = await self._determine_response_strategy(context, user_message)
        
        if response_strategy["type"] == "single_agent":
            response = await self._single_agent_response(context, user_message, response_strategy["agent"])
        elif response_strategy["type"] == "collaboration":
            response = await self._collaborative_response(context, user_message, response_strategy["agents"])
        else:  # handoff
            response = await self._agent_handoff_response(context, user_message, response_strategy)
        
        # Update conversation context
        context.conversation_history.append({
            "role": "assistant",
            "content": response["content"],
            "agents": response.get("agents", []),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return response

    async def _determine_response_strategy(
        self, 
        context: ConversationContext, 
        user_message: str
    ) -> Dict[str, Any]:
        """Determine the best strategy for responding to the user message"""
        
        message_lower = user_message.lower()
        current_agents = context.active_agents
        
        # Check if user is asking for a different type of expertise
        requested_agents = await self._select_initial_agents(user_message)
        
        # If user needs different expertise, consider handoff
        if not any(agent in current_agents for agent in requested_agents):
            return {
                "type": "handoff",
                "from_agents": current_agents,
                "to_agents": requested_agents,
                "primary_agent": requested_agents[0]
            }
        
        # If user message requires multiple perspectives
        collaboration_keywords = ['compare', 'options', 'alternatives', 'different approaches', 'pros and cons']
        if any(keyword in message_lower for keyword in collaboration_keywords) and len(current_agents) > 1:
            return {
                "type": "collaboration",
                "agents": current_agents[:2]  # Limit collaboration to 2 agents for clarity
            }
        
        # Default to single agent response from most relevant agent
        best_agent = self._select_best_agent_for_message(current_agents, user_message)
        return {
            "type": "single_agent",
            "agent": best_agent
        }

    def _select_best_agent_for_message(self, available_agents: List[AgentRole], message: str) -> AgentRole:
        """Select the best agent to handle a specific message"""
        
        message_lower = message.lower()
        
        # Score each agent based on message content
        agent_scores = {}
        
        for agent in available_agents:
            score = 0
            capabilities = self.agent_configs[agent]["capabilities"]
            
            for capability in capabilities:
                if capability.replace('_', ' ') in message_lower:
                    score += 2
                # Partial matches
                if capability.split('_')[0] in message_lower:
                    score += 1
            
            agent_scores[agent] = score
        
        # Return agent with highest score, or first agent if tie
        if agent_scores:
            return max(agent_scores.items(), key=lambda x: x[1])[0]
        
        return available_agents[0]

    async def _single_agent_response(
        self, 
        context: ConversationContext, 
        user_message: str, 
        agent: AgentRole
    ) -> Dict[str, Any]:
        """Generate response from a single agent"""
        
        agent_config = self.agent_configs[agent]
        
        # Build conversation history for context
        messages = [{"role": "system", "content": agent_config["system_prompt"]}]
        
        # Add recent conversation history (last 5 messages for context)
        recent_history = context.conversation_history[-10:] if context.conversation_history else []
        for msg in recent_history:
            if msg["role"] in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        try:
            completion = await self.groq_client.chat.completions.create(
                model=agent_config["model"],
                messages=messages,
                temperature=0.7,
                max_tokens=1500,
                top_p=0.9,
                stream=False
            )
            
            response_content = completion.choices[0].message.content
            
            return {
                "content": response_content,
                "agent": agent_config["name"],
                "agent_role": agent.value,
                "model_used": agent_config["model"],
                "type": "single_agent",
                "agents": [agent.value]
            }
            
        except Exception as e:
            logger.error(f"Error in single agent response: {e}")
            return {
                "content": f"Sorry, I encountered an error while processing your request. Please try again.",
                "agent": agent_config["name"],
                "agent_role": agent.value,
                "error": str(e),
                "type": "error"
            }

    async def _collaborative_response(
        self, 
        context: ConversationContext, 
        user_message: str, 
        agents: List[AgentRole]
    ) -> Dict[str, Any]:
        """Generate collaborative response from multiple agents"""
        
        responses = []
        
        # Get responses from each agent
        for agent in agents:
            response = await self._single_agent_response(context, user_message, agent)
            if "error" not in response:
                responses.append({
                    "agent": response["agent"],
                    "role": agent.value,
                    "content": response["content"]
                })
        
        if not responses:
            return {
                "content": "I apologize, but I'm having trouble processing your request right now. Please try again.",
                "type": "error"
            }
        
        # Combine responses in a structured way
        combined_content = "Here are perspectives from different team members:\n\n"
        
        for i, response in enumerate(responses):
            combined_content += f"**{response['agent']} ({response['role'].replace('_', ' ').title()}):**\n"
            combined_content += f"{response['content']}\n\n"
        
        return {
            "content": combined_content,
            "type": "collaboration",
            "agents": [agent.value for agent in agents],
            "individual_responses": responses
        }

    async def _agent_handoff_response(
        self, 
        context: ConversationContext, 
        user_message: str, 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle agent handoff with explanation"""
        
        primary_agent = strategy["primary_agent"]
        from_agents = [agent.value for agent in strategy["from_agents"]]
        to_agents = [agent.value for agent in strategy["to_agents"]]
        
        # Update active agents in context
        context.active_agents = strategy["to_agents"]
        
        # Get response from new primary agent
        response = await self._single_agent_response(context, user_message, primary_agent)
        
        if "error" not in response:
            # Add handoff explanation
            agent_name = self.agent_configs[primary_agent]["name"]
            handoff_intro = f"I'm bringing in {agent_name} who specializes in this area.\n\n"
            response["content"] = handoff_intro + response["content"]
            response["type"] = "handoff"
            response["handoff_info"] = {
                "from": from_agents,
                "to": to_agents,
                "reason": "Specialized expertise required"
            }
        
        return response

    async def get_conversation_summary(self, session_id: str) -> Dict[str, Any]:
        """Get intelligent summary of conversation"""
        
        if session_id not in self.conversation_contexts:
            return {"error": "Conversation not found"}
        
        context = self.conversation_contexts[session_id]
        
        if not context.conversation_history:
            return {"summary": "No conversation history available"}
        
        # Use Sage (Project Manager) to summarize the conversation
        summary_prompt = f"""Please provide a concise summary of this conversation, including:
1. Main topics discussed
2. Key decisions made
3. Action items or next steps
4. Areas that might need follow-up

Conversation history:
{json.dumps(context.conversation_history[-20:], indent=2)}"""
        
        try:
            sage_config = self.agent_configs[AgentRole.PROJECT_MANAGER]
            completion = await self.groq_client.chat.completions.create(
                model=sage_config["model"],
                messages=[
                    {"role": "system", "content": sage_config["system_prompt"]},
                    {"role": "user", "content": summary_prompt}
                ],
                temperature=0.5,
                max_tokens=800
            )
            
            return {
                "summary": completion.choices[0].message.content,
                "total_messages": len(context.conversation_history),
                "active_agents": [agent.value for agent in context.active_agents],
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error generating conversation summary: {e}")
            return {"error": "Failed to generate summary"}

    def get_active_agents(self, session_id: str) -> List[str]:
        """Get list of currently active agents for a session"""
        
        if session_id not in self.conversation_contexts:
            return []
        
        context = self.conversation_contexts[session_id]
        return [
            {
                "role": agent.value,
                "name": self.agent_configs[agent]["name"],
                "capabilities": self.agent_configs[agent]["capabilities"]
            }
            for agent in context.active_agents
        ]

    async def cleanup_old_conversations(self, max_age_hours: int = 24):
        """Clean up old conversation contexts to free memory"""
        
        current_time = datetime.utcnow()
        sessions_to_remove = []
        
        for session_id, context in self.conversation_contexts.items():
            if context.conversation_history:
                last_message_time = datetime.fromisoformat(
                    context.conversation_history[-1]["timestamp"]
                )
                hours_since_last_message = (current_time - last_message_time).total_seconds() / 3600
                
                if hours_since_last_message > max_age_hours:
                    sessions_to_remove.append(session_id)
        
        for session_id in sessions_to_remove:
            del self.conversation_contexts[session_id]
        
        logger.info(f"Cleaned up {len(sessions_to_remove)} old conversation contexts")