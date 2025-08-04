"""
Intelligent Context Manager for Enhanced Conversation Quality
"""
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import uuid
from collections import defaultdict, deque
import numpy as np
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ConversationContext:
    """Structured conversation context"""
    conversation_id: str
    user_id: str
    project_id: Optional[str]
    messages: List[Dict]
    topics: List[str]
    agents_involved: List[str]
    context_score: float
    last_updated: datetime
    user_preferences: Dict
    technical_context: Dict
    
class IntelligentContextManager:
    """Manages intelligent conversation context and memory"""
    
    def __init__(self):
        self.conversations: Dict[str, ConversationContext] = {}
        self.user_profiles: Dict[str, Dict] = {}
        self.topic_embeddings: Dict[str, np.ndarray] = {}
        self.context_cache = {}
        self.max_context_length = 50  # Maximum messages to keep in context
        self.context_decay_hours = 24  # Context relevance decay time
        
    async def get_enhanced_context(
        self, 
        conversation_id: str,
        user_id: str, 
        message: str,
        project_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get enhanced context for better AI responses"""
        
        try:
            # Get or create conversation context
            context = await self._get_or_create_context(conversation_id, user_id, project_id)
            
            # Analyze current message
            message_analysis = await self._analyze_message(message)
            
            # Get relevant context
            relevant_context = await self._get_relevant_context(context, message_analysis)
            
            # Get user preferences
            user_prefs = await self._get_user_preferences(user_id, message_analysis)
            
            # Generate context summary
            context_summary = await self._generate_context_summary(relevant_context, message_analysis)
            
            # Update conversation context
            await self._update_context(context, message, message_analysis)
            
            return {
                "conversation_id": conversation_id,
                "relevant_messages": relevant_context["messages"][-10:],  # Last 10 relevant messages
                "topics": relevant_context["topics"],
                "technical_context": relevant_context["technical_context"],
                "user_preferences": user_prefs,
                "context_summary": context_summary,
                "agents_involved": context.agents_involved,
                "context_score": context.context_score,
                "message_analysis": message_analysis,
                "continuation_suggestions": await self._get_continuation_suggestions(context, message_analysis)
            }
            
        except Exception as e:
            logger.error(f"Enhanced context retrieval error: {e}")
            return {
                "conversation_id": conversation_id,
                "relevant_messages": [],
                "topics": [],
                "technical_context": {},
                "user_preferences": {},
                "context_summary": "Context analysis unavailable",
                "agents_involved": [],
                "context_score": 0.5,
                "error": str(e)
            }
    
    async def _get_or_create_context(
        self, conversation_id: str, user_id: str, project_id: Optional[str]
    ) -> ConversationContext:
        """Get existing context or create new one"""
        
        if conversation_id in self.conversations:
            context = self.conversations[conversation_id]
            # Check if context is still valid (not too old)
            if datetime.utcnow() - context.last_updated < timedelta(hours=self.context_decay_hours):
                return context
        
        # Create new context
        context = ConversationContext(
            conversation_id=conversation_id,
            user_id=user_id,
            project_id=project_id,
            messages=[],
            topics=[],
            agents_involved=[],
            context_score=0.0,
            last_updated=datetime.utcnow(),
            user_preferences={},
            technical_context={}
        )
        
        self.conversations[conversation_id] = context
        return context
    
    async def _analyze_message(self, message: str) -> Dict[str, Any]:
        """Analyze message for context clues"""
        
        analysis = {
            "length": len(message),
            "complexity": "low",
            "technical_terms": [],
            "intent": "unknown",
            "topics": [],
            "urgency": "normal",
            "question_type": "general",
            "code_related": False,
            "design_related": False,
            "testing_related": False
        }
        
        message_lower = message.lower()
        
        # Detect technical terms
        technical_terms = [
            "react", "python", "javascript", "api", "database", "sql", "html", "css",
            "component", "function", "class", "method", "variable", "array", "object",
            "server", "client", "frontend", "backend", "fullstack", "framework"
        ]
        
        analysis["technical_terms"] = [term for term in technical_terms if term in message_lower]
        analysis["code_related"] = len(analysis["technical_terms"]) > 0
        
        # Detect design terms
        design_terms = ["design", "ui", "ux", "layout", "color", "font", "style", "css", "responsive"]
        analysis["design_related"] = any(term in message_lower for term in design_terms)
        
        # Detect testing terms
        testing_terms = ["test", "bug", "error", "debug", "qa", "quality", "issue", "fix"]
        analysis["testing_related"] = any(term in message_lower for term in testing_terms)
        
        # Determine complexity
        if len(message) > 200 or len(analysis["technical_terms"]) > 3:
            analysis["complexity"] = "high"
        elif len(message) > 100 or len(analysis["technical_terms"]) > 1:
            analysis["complexity"] = "medium"
        
        # Detect intent
        if "?" in message:
            analysis["intent"] = "question"
            analysis["question_type"] = "specific" if analysis["technical_terms"] else "general"
        elif any(word in message_lower for word in ["create", "build", "make", "implement"]):
            analysis["intent"] = "creation"
        elif any(word in message_lower for word in ["fix", "debug", "solve", "resolve"]):
            analysis["intent"] = "problem_solving"
        elif any(word in message_lower for word in ["explain", "understand", "learn"]):
            analysis["intent"] = "learning"
        
        # Detect urgency
        urgent_words = ["urgent", "asap", "immediately", "critical", "emergency", "now"]
        if any(word in message_lower for word in urgent_words):
            analysis["urgency"] = "high"
        
        # Extract topics
        analysis["topics"] = self._extract_topics_from_message(message)
        
        return analysis
    
    def _extract_topics_from_message(self, message: str) -> List[str]:
        """Extract key topics from message"""
        
        topic_keywords = {
            "web_development": ["react", "html", "css", "javascript", "frontend", "web"],
            "backend": ["api", "server", "backend", "database", "sql", "python"],
            "ui_design": ["design", "ui", "ux", "layout", "style", "responsive"],
            "testing": ["test", "qa", "bug", "debug", "quality", "automation"],
            "deployment": ["deploy", "production", "hosting", "ci", "cd", "devops"],
            "security": ["security", "auth", "authentication", "encryption", "ssl"],
            "performance": ["performance", "optimization", "speed", "cache", "memory"],
            "mobile": ["mobile", "responsive", "ios", "android", "app"]
        }
        
        detected_topics = []
        message_lower = message.lower()
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_topics.append(topic)
        
        return detected_topics
    
    async def _get_relevant_context(
        self, context: ConversationContext, message_analysis: Dict
    ) -> Dict[str, Any]:
        """Get relevant context based on message analysis"""
        
        relevant_context = {
            "messages": [],
            "topics": [],
            "technical_context": {},
            "patterns": []
        }
        
        # Get messages related to current topics
        current_topics = set(message_analysis["topics"])
        
        for msg in context.messages[-20:]:  # Check last 20 messages
            msg_topics = set(msg.get("topics", []))
            
            # Include message if topics overlap or if it's recent and relevant
            if current_topics.intersection(msg_topics) or msg.get("importance", 0) > 0.7:
                relevant_context["messages"].append(msg)
        
        # Merge topics
        relevant_context["topics"] = list(set(context.topics + message_analysis["topics"]))
        
        # Build technical context
        if message_analysis["code_related"]:
            relevant_context["technical_context"] = {
                "programming_focus": True,
                "languages": message_analysis["technical_terms"],
                "complexity": message_analysis["complexity"]
            }
        
        if message_analysis["design_related"]:
            relevant_context["technical_context"]["design_focus"] = True
        
        if message_analysis["testing_related"]:
            relevant_context["technical_context"]["testing_focus"] = True
        
        return relevant_context
    
    async def _get_user_preferences(self, user_id: str, message_analysis: Dict) -> Dict:
        """Get or infer user preferences"""
        
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                "preferred_complexity": "medium",
                "preferred_explanation_style": "detailed",
                "technical_level": "intermediate",
                "preferred_languages": [],
                "interaction_patterns": {
                    "avg_message_length": 0,
                    "prefers_code_examples": True,
                    "prefers_visual_explanations": False
                }
            }
        
        user_profile = self.user_profiles[user_id]
        
        # Update preferences based on current message
        current_length = message_analysis["length"]
        if "avg_message_length" in user_profile["interaction_patterns"]:
            # Running average
            prev_avg = user_profile["interaction_patterns"]["avg_message_length"]
            user_profile["interaction_patterns"]["avg_message_length"] = (prev_avg + current_length) / 2
        else:
            user_profile["interaction_patterns"]["avg_message_length"] = current_length
        
        # Infer technical level
        if len(message_analysis["technical_terms"]) > 5:
            user_profile["technical_level"] = "advanced"
        elif len(message_analysis["technical_terms"]) > 2:
            user_profile["technical_level"] = "intermediate"
        else:
            user_profile["technical_level"] = "beginner"
        
        return user_profile
    
    async def _generate_context_summary(
        self, relevant_context: Dict, message_analysis: Dict
    ) -> str:
        """Generate a summary of the conversation context"""
        
        topics = relevant_context["topics"]
        message_count = len(relevant_context["messages"])
        
        summary_parts = []
        
        if message_count > 0:
            summary_parts.append(f"Continuing conversation with {message_count} relevant messages")
        
        if topics:
            summary_parts.append(f"Discussing: {', '.join(topics[:3])}")
        
        if message_analysis["complexity"] == "high":
            summary_parts.append("Complex technical discussion")
        
        if message_analysis["code_related"]:
            summary_parts.append("Programming/development focused")
        
        if not summary_parts:
            summary_parts.append("Starting new conversation thread")
        
        return ". ".join(summary_parts) + "."
    
    async def _update_context(
        self, context: ConversationContext, message: str, analysis: Dict
    ):
        """Update conversation context with new message"""
        
        # Add message to context
        context.messages.append({
            "content": message,
            "timestamp": datetime.utcnow().isoformat(),
            "analysis": analysis,
            "topics": analysis["topics"],
            "importance": self._calculate_message_importance(analysis)
        })
        
        # Update topics
        context.topics = list(set(context.topics + analysis["topics"]))
        
        # Update technical context
        if analysis["code_related"]:
            if "programming_languages" not in context.technical_context:
                context.technical_context["programming_languages"] = []
            
            context.technical_context["programming_languages"].extend(analysis["technical_terms"])
            context.technical_context["programming_languages"] = list(set(
                context.technical_context["programming_languages"]
            ))
        
        # Update context score (measure of conversation coherence)
        context.context_score = await self._calculate_context_score(context)
        
        # Update timestamp
        context.last_updated = datetime.utcnow()
        
        # Trim messages if too many
        if len(context.messages) > self.max_context_length:
            # Keep most important and recent messages
            context.messages = self._trim_messages(context.messages)
    
    def _calculate_message_importance(self, analysis: Dict) -> float:
        """Calculate importance score for a message"""
        
        importance = 0.5  # Base importance
        
        # Technical messages are more important
        if analysis["code_related"]:
            importance += 0.2
        
        # Complex messages are more important
        if analysis["complexity"] == "high":
            importance += 0.2
        elif analysis["complexity"] == "medium":
            importance += 0.1
        
        # Questions are important
        if analysis["intent"] == "question":
            importance += 0.1
        
        # Urgent messages are very important
        if analysis["urgency"] == "high":
            importance += 0.3
        
        return min(importance, 1.0)
    
    async def _calculate_context_score(self, context: ConversationContext) -> float:
        """Calculate overall context coherence score"""
        
        if len(context.messages) < 2:
            return 0.5
        
        score = 0.0
        
        # Topic consistency
        recent_topics = []
        for msg in context.messages[-5:]:  # Last 5 messages
            recent_topics.extend(msg.get("topics", []))
        
        if recent_topics:
            unique_topics = set(recent_topics)
            topic_consistency = 1.0 - (len(unique_topics) / len(recent_topics))
            score += topic_consistency * 0.4
        
        # Message flow consistency
        complexity_levels = []
        for msg in context.messages[-10:]:
            complexity = msg.get("analysis", {}).get("complexity", "low")
            complexity_levels.append({"low": 1, "medium": 2, "high": 3}[complexity])
        
        if len(complexity_levels) > 1:
            complexity_variance = np.var(complexity_levels) if complexity_levels else 0
            flow_consistency = max(0, 1.0 - complexity_variance / 2.0)
            score += flow_consistency * 0.3
        
        # Technical coherence
        technical_terms = []
        for msg in context.messages[-10:]:
            technical_terms.extend(msg.get("analysis", {}).get("technical_terms", []))
        
        if technical_terms:
            unique_terms = set(technical_terms)
            term_consistency = len(technical_terms) / (len(unique_terms) + 1)  # Avoid div by zero
            score += min(term_consistency, 1.0) * 0.3
        
        return min(score, 1.0)
    
    def _trim_messages(self, messages: List[Dict]) -> List[Dict]:
        """Trim messages keeping most important ones"""
        
        # Sort by importance and recency
        scored_messages = []
        for i, msg in enumerate(messages):
            importance = msg.get("importance", 0.5)
            recency = i / len(messages)  # More recent = higher score
            combined_score = importance * 0.7 + recency * 0.3
            scored_messages.append((combined_score, msg))
        
        # Sort by score and keep top messages
        scored_messages.sort(key=lambda x: x[0], reverse=True)
        
        # Keep top 80% by importance, ensuring we have some recent messages
        keep_count = min(self.max_context_length, int(len(messages) * 0.8))
        trimmed = [msg for score, msg in scored_messages[:keep_count]]
        
        # Always include the last 5 messages regardless of importance
        recent_messages = messages[-5:]
        for msg in recent_messages:
            if msg not in trimmed:
                trimmed.append(msg)
        
        # Sort by timestamp to maintain chronological order
        trimmed.sort(key=lambda x: x.get("timestamp", ""))
        
        return trimmed[-self.max_context_length:]
    
    async def _get_continuation_suggestions(
        self, context: ConversationContext, message_analysis: Dict
    ) -> List[str]:
        """Get smart suggestions for continuing the conversation"""
        
        suggestions = []
        
        # Based on current message analysis
        if message_analysis["intent"] == "question":
            suggestions.append("💡 Ask follow-up questions for clarification")
            suggestions.append("📝 Request implementation examples")
        
        elif message_analysis["intent"] == "creation":
            suggestions.append("🔧 Get step-by-step implementation guide")
            suggestions.append("🧪 Generate test cases for the solution")
        
        elif message_analysis["intent"] == "problem_solving":
            suggestions.append("🐛 Run diagnostic analysis")
            suggestions.append("🔍 Explore alternative solutions")
        
        # Based on conversation context
        if len(context.agents_involved) < 2 and message_analysis["complexity"] == "high":
            suggestions.append("🤝 Bring in specialist agents for collaboration")
        
        if context.context_score > 0.7:  # Good conversation flow
            suggestions.append("🚀 Continue with advanced topics")
        
        # Technical suggestions
        if message_analysis["code_related"]:
            suggestions.append("📊 Get code quality analysis")
            suggestions.append("⚡ Optimize for performance")
        
        return suggestions[:4]  # Return top 4 suggestions
    
    async def get_conversation_insights(self, conversation_id: str) -> Dict:
        """Get insights about a conversation"""
        
        if conversation_id not in self.conversations:
            return {"error": "Conversation not found"}
        
        context = self.conversations[conversation_id]
        
        insights = {
            "conversation_health": {
                "context_score": context.context_score,
                "message_count": len(context.messages),
                "topics_covered": len(context.topics),
                "agents_involved": len(context.agents_involved),
                "duration": (datetime.utcnow() - context.last_updated).total_seconds() / 3600  # hours
            },
            "topics": context.topics,
            "technical_context": context.technical_context,
            "user_engagement": {
                "avg_message_complexity": self._calculate_avg_complexity(context.messages),
                "technical_depth": len(context.technical_context.get("programming_languages", [])),
                "question_ratio": self._calculate_question_ratio(context.messages)
            },
            "recommendations": await self._generate_conversation_recommendations(context)
        }
        
        return insights
    
    def _calculate_avg_complexity(self, messages: List[Dict]) -> str:
        """Calculate average message complexity"""
        
        if not messages:
            return "low"
        
        complexity_scores = []
        for msg in messages:
            complexity = msg.get("analysis", {}).get("complexity", "low")
            complexity_scores.append({"low": 1, "medium": 2, "high": 3}[complexity])
        
        avg_score = sum(complexity_scores) / len(complexity_scores)
        
        if avg_score >= 2.5:
            return "high"
        elif avg_score >= 1.5:
            return "medium"
        else:
            return "low"
    
    def _calculate_question_ratio(self, messages: List[Dict]) -> float:
        """Calculate ratio of questions in conversation"""
        
        if not messages:
            return 0.0
        
        questions = sum(1 for msg in messages 
                       if msg.get("analysis", {}).get("intent") == "question")
        
        return questions / len(messages)
    
    async def _generate_conversation_recommendations(self, context: ConversationContext) -> List[str]:
        """Generate recommendations for improving conversation"""
        
        recommendations = []
        
        if context.context_score < 0.5:
            recommendations.append("💡 Try focusing on specific topics to improve conversation flow")
        
        if len(context.agents_involved) == 1 and len(context.topics) > 3:
            recommendations.append("🤝 Consider involving multiple agents for better expertise coverage")
        
        if len(context.messages) > 20 and context.context_score > 0.8:
            recommendations.append("📋 Great conversation flow! Consider summarizing key points")
        
        if not context.technical_context:
            recommendations.append("🔧 Add technical details to get more specialized assistance")
        
        return recommendations