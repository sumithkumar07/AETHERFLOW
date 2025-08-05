"""
Enhanced Conversation Manager with Advanced Context and Memory
"""
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from collections import defaultdict
import uuid

logger = logging.getLogger(__name__)

class EnhancedConversationManager:
    """Advanced conversation manager with context awareness and learning"""
    
    def __init__(self):
        self.conversation_contexts = {}
        self.user_preferences = defaultdict(dict)
        self.learning_data = defaultdict(list)
        self.semantic_memory = {}
        
    async def enhance_conversation_context(
        self, 
        conversation_id: str, 
        message: str, 
        response: str,
        agent: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Build enhanced context for better conversation quality"""
        
        # Initialize conversation context if new
        if conversation_id not in self.conversation_contexts:
            self.conversation_contexts[conversation_id] = {
                "started_at": datetime.utcnow(),
                "participants": [user_id],
                "active_agents": [],
                "conversation_flow": [],
                "topics_discussed": [],
                "complexity_level": "medium",
                "user_expertise": self._assess_user_expertise(user_id),
                "current_context": {},
                "memory_markers": []
            }
        
        context = self.conversation_contexts[conversation_id]
        
        # Add agent to active list
        if agent not in context["active_agents"]:
            context["active_agents"].append(agent)
        
        # Analyze conversation flow
        flow_entry = {
            "timestamp": datetime.utcnow(),
            "message": message[:200],  # Truncate for storage
            "response": response[:300],
            "agent": agent,
            "topics": self._extract_topics(message + " " + response),
            "sentiment": self._analyze_sentiment(message),
            "complexity": self._assess_complexity(message),
            "engagement_score": self._calculate_engagement(message, response)
        }
        
        context["conversation_flow"].append(flow_entry)
        
        # Update topics discussed
        new_topics = flow_entry["topics"]
        for topic in new_topics:
            if topic not in context["topics_discussed"]:
                context["topics_discussed"].append(topic)
        
        # Update complexity level
        avg_complexity = sum([entry["complexity"] for entry in context["conversation_flow"][-5:]]) / min(5, len(context["conversation_flow"]))
        context["complexity_level"] = "high" if avg_complexity > 0.7 else "medium" if avg_complexity > 0.4 else "low"
        
        # Update user preferences based on interaction patterns
        await self._update_user_preferences(user_id, flow_entry)
        
        # Create memory markers for important moments
        if self._is_important_moment(flow_entry):
            context["memory_markers"].append({
                "type": "important_insight",
                "timestamp": datetime.utcnow(),
                "content": flow_entry,
                "importance_score": flow_entry["engagement_score"]
            })
        
        # Maintain manageable context size
        context["conversation_flow"] = context["conversation_flow"][-20:]
        context["topics_discussed"] = context["topics_discussed"][-15:]
        context["memory_markers"] = context["memory_markers"][-10:]
        
        return context
    
    def _extract_topics(self, text: str) -> List[str]:
        """Extract key topics from conversation text"""
        tech_keywords = {
            # Development
            "react": "React Development",
            "python": "Python Programming", 
            "javascript": "JavaScript",
            "typescript": "TypeScript",
            "api": "API Development",
            "database": "Database Design",
            "sql": "SQL/Database",
            "nosql": "NoSQL Database",
            "mongodb": "MongoDB",
            "postgresql": "PostgreSQL",
            
            # Frontend
            "ui": "User Interface",
            "ux": "User Experience", 
            "css": "CSS Styling",
            "html": "HTML/Markup",
            "tailwind": "Tailwind CSS",
            "bootstrap": "Bootstrap",
            "responsive": "Responsive Design",
            "mobile": "Mobile Development",
            
            # Backend
            "server": "Server Development",
            "fastapi": "FastAPI",
            "django": "Django",
            "flask": "Flask",
            "node": "Node.js",
            "express": "Express.js",
            
            # Testing & QA
            "test": "Testing",
            "testing": "Quality Assurance",
            "bug": "Bug Fixing",
            "debug": "Debugging",
            "performance": "Performance",
            "security": "Security",
            
            # DevOps & Deployment
            "deploy": "Deployment",
            "docker": "Docker",
            "kubernetes": "Kubernetes",
            "aws": "AWS Cloud",
            "azure": "Azure Cloud",
            "gcp": "Google Cloud",
            
            # Business & Analysis
            "requirements": "Requirements Analysis",
            "business": "Business Logic",
            "analytics": "Analytics",
            "optimization": "Optimization",
            "strategy": "Strategy Planning"
        }
        
        topics = []
        text_lower = text.lower()
        
        for keyword, topic in tech_keywords.items():
            if keyword in text_lower:
                topics.append(topic)
        
        return list(set(topics))[:8]  # Limit to 8 unique topics
    
    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis"""
        positive_words = ["good", "great", "excellent", "perfect", "amazing", "love", "like", "helpful", "useful", "thank"]
        negative_words = ["bad", "terrible", "awful", "hate", "dislike", "error", "problem", "issue", "wrong", "broken"]
        
        text_lower = text.lower()
        positive_score = sum([1 for word in positive_words if word in text_lower])
        negative_score = sum([1 for word in negative_words if word in text_lower])
        
        if positive_score > negative_score:
            return "positive"
        elif negative_score > positive_score:
            return "negative"
        else:
            return "neutral"
    
    def _assess_complexity(self, text: str) -> float:
        """Assess complexity of user message (0.0 - 1.0)"""
        indicators = {
            # High complexity indicators
            "architecture": 0.8,
            "complex": 0.9,
            "advanced": 0.8,
            "enterprise": 0.7,
            "scalable": 0.7,
            "integration": 0.6,
            "microservices": 0.8,
            "optimization": 0.6,
            
            # Medium complexity indicators  
            "implement": 0.5,
            "develop": 0.5,
            "create": 0.4,
            "build": 0.4,
            "design": 0.5,
            
            # Simple indicators
            "hello": 0.1,
            "hi": 0.1,
            "what": 0.2,
            "how": 0.2,
            "help": 0.2
        }
        
        text_lower = text.lower()
        complexity_scores = [score for keyword, score in indicators.items() if keyword in text_lower]
        
        if complexity_scores:
            return min(1.0, sum(complexity_scores) / len(complexity_scores))
        
        # Base complexity on message length and structure
        word_count = len(text.split())
        if word_count > 50:
            return 0.7
        elif word_count > 20:
            return 0.5
        else:
            return 0.3
    
    def _calculate_engagement(self, message: str, response: str) -> float:
        """Calculate engagement score based on message/response quality"""
        engagement_score = 0.5  # Base score
        
        # Message quality indicators
        if len(message) > 20:
            engagement_score += 0.1
        if "?" in message:
            engagement_score += 0.1
        if any(word in message.lower() for word in ["detailed", "comprehensive", "thorough"]):
            engagement_score += 0.2
        
        # Response quality indicators
        if len(response) > 100:
            engagement_score += 0.1
        if "```" in response:  # Code examples
            engagement_score += 0.2
        if any(word in response.lower() for word in ["example", "step", "guide"]):
            engagement_score += 0.1
        
        return min(1.0, engagement_score)
    
    def _is_important_moment(self, flow_entry: Dict) -> bool:
        """Determine if this is an important conversation moment"""
        return (
            flow_entry["engagement_score"] > 0.8 or
            flow_entry["complexity"] > 0.7 or
            len(flow_entry["topics"]) > 3 or
            "breakthrough" in flow_entry["response"].lower() or
            "solution" in flow_entry["response"].lower()
        )
    
    async def _update_user_preferences(self, user_id: str, flow_entry: Dict):
        """Update user preferences based on interaction patterns"""
        prefs = self.user_preferences[user_id]
        
        # Track preferred communication style
        if "communication_style" not in prefs:
            prefs["communication_style"] = {"detailed": 0, "concise": 0, "technical": 0}
        
        if flow_entry["complexity"] > 0.6:
            prefs["communication_style"]["technical"] += 1
        if len(flow_entry["message"]) > 100:
            prefs["communication_style"]["detailed"] += 1
        else:
            prefs["communication_style"]["concise"] += 1
        
        # Track preferred topics
        if "favorite_topics" not in prefs:
            prefs["favorite_topics"] = defaultdict(int)
        
        for topic in flow_entry["topics"]:
            prefs["favorite_topics"][topic] += 1
        
        # Track agent preferences
        if "agent_preferences" not in prefs:
            prefs["agent_preferences"] = defaultdict(int)
        
        if flow_entry["engagement_score"] > 0.7:
            prefs["agent_preferences"][flow_entry["agent"]] += 1
    
    def _assess_user_expertise(self, user_id: str) -> str:
        """Assess user's technical expertise level"""
        if user_id in self.user_preferences:
            prefs = self.user_preferences[user_id]
            technical_score = prefs.get("communication_style", {}).get("technical", 0)
            total_interactions = sum(prefs.get("communication_style", {}).values())
            
            if total_interactions > 0:
                tech_ratio = technical_score / total_interactions
                if tech_ratio > 0.6:
                    return "expert"
                elif tech_ratio > 0.3:
                    return "intermediate"
                else:
                    return "beginner"
        
        return "intermediate"  # Default
    
    async def get_conversation_insights(self, conversation_id: str) -> Dict[str, Any]:
        """Get insights about conversation patterns"""
        if conversation_id not in self.conversation_contexts:
            return {"error": "Conversation not found"}
        
        context = self.conversation_contexts[conversation_id]
        
        return {
            "conversation_stats": {
                "duration_minutes": (datetime.utcnow() - context["started_at"]).total_seconds() / 60,
                "total_exchanges": len(context["conversation_flow"]),
                "agents_involved": len(context["active_agents"]),
                "topics_covered": len(context["topics_discussed"]),
                "avg_complexity": sum([entry["complexity"] for entry in context["conversation_flow"]]) / len(context["conversation_flow"]),
                "avg_engagement": sum([entry["engagement_score"] for entry in context["conversation_flow"]]) / len(context["conversation_flow"])
            },
            "conversation_quality": {
                "complexity_level": context["complexity_level"],
                "user_expertise": context["user_expertise"],
                "most_discussed_topics": context["topics_discussed"][:5],
                "active_agents": context["active_agents"],
                "important_moments": len(context["memory_markers"])
            },
            "recommendations": self._generate_conversation_recommendations(context)
        }
    
    def _generate_conversation_recommendations(self, context: Dict) -> List[str]:
        """Generate recommendations for improving conversation quality"""
        recommendations = []
        
        # Based on complexity
        if context["complexity_level"] == "high":
            recommendations.append("Consider breaking down complex topics into smaller, manageable parts")
            recommendations.append("Multi-agent collaboration might be beneficial for comprehensive coverage")
        
        # Based on agent diversity
        if len(context["active_agents"]) == 1:
            recommendations.append("Try involving different agents for varied perspectives")
        
        # Based on engagement
        avg_engagement = sum([entry["engagement_score"] for entry in context["conversation_flow"]]) / len(context["conversation_flow"])
        if avg_engagement < 0.5:
            recommendations.append("Consider asking more specific questions to get detailed responses")
            recommendations.append("Request examples or code snippets for better understanding")
        
        # Based on topics
        if len(context["topics_discussed"]) > 10:
            recommendations.append("You've covered many topics - consider creating separate conversations for focused discussions")
        
        return recommendations[:4]
    
    async def suggest_next_actions(self, conversation_id: str) -> List[Dict]:
        """Suggest contextually relevant next actions"""
        if conversation_id not in self.conversation_contexts:
            return []
        
        context = self.conversation_contexts[conversation_id]
        latest_entries = context["conversation_flow"][-3:]
        
        actions = []
        
        # Based on recent conversation flow
        recent_topics = set()
        for entry in latest_entries:
            recent_topics.update(entry["topics"])
        
        # Development-focused actions
        if "React Development" in recent_topics or "JavaScript" in recent_topics:
            actions.append({
                "action": "Create Component",
                "description": "Generate a React component based on our discussion",
                "priority": "high",
                "agent": "developer"
            })
        
        # Design-focused actions  
        if "User Interface" in recent_topics or "User Experience" in recent_topics:
            actions.append({
                "action": "Design System Review",
                "description": "Analyze UI/UX patterns and suggest improvements",
                "priority": "medium", 
                "agent": "designer"
            })
        
        # Testing actions
        if "Bug Fixing" in recent_topics or "Testing" in recent_topics:
            actions.append({
                "action": "Generate Test Cases",
                "description": "Create comprehensive tests for discussed functionality",
                "priority": "high",
                "agent": "tester"
            })
        
        # Integration actions
        if "API Development" in recent_topics:
            actions.append({
                "action": "API Documentation",
                "description": "Generate API documentation and integration examples",
                "priority": "medium",
                "agent": "integrator"
            })
        
        return actions[:4]