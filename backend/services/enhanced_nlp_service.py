"""
Enhanced Natural Language Processing Service
Handles advanced NLP for better conversation understanding
"""
import asyncio
import re
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class IntentResult:
    intent: str
    confidence: float
    entities: Dict[str, Any]
    context: Dict[str, Any]
    suggestions: List[str]

@dataclass
class ConversationContext:
    user_id: str
    project_history: List[Dict]
    preferences: Dict[str, Any]
    skill_level: str
    conversation_memory: List[Dict]

class EnhancedNLPService:
    def __init__(self, db_wrapper):
        self.db_wrapper = db_wrapper
        self.intent_patterns = self._load_intent_patterns()
        self.domain_vocabulary = self._load_domain_vocabulary()
        self.context_memory = {}
        
    async def initialize(self):
        """Initialize the Enhanced NLP Service"""
        logger.info("🧠 Initializing Enhanced NLP Service...")
        await self._load_user_preferences()
        await self._initialize_language_models()
        logger.info("✅ Enhanced NLP Service initialized")
        
    def _load_intent_patterns(self) -> Dict[str, List[str]]:
        """Load intent recognition patterns"""
        return {
            "create_app": [
                r"build\s+(?:a|an)?\s*(.+?)(?:\s+app|\s+application|\s+website)",
                r"create\s+(?:a|an)?\s*(.+?)(?:\s+app|\s+application|\s+website)",
                r"make\s+(?:a|an)?\s*(.+?)(?:\s+app|\s+application|\s+website)",
                r"develop\s+(?:a|an)?\s*(.+?)(?:\s+app|\s+application|\s+website)"
            ],
            "modify_code": [
                r"change\s+(.+)",
                r"modify\s+(.+)",
                r"update\s+(.+)",
                r"fix\s+(.+)",
                r"improve\s+(.+)"
            ],
            "deploy_app": [
                r"deploy\s+(.+)",
                r"publish\s+(.+)",
                r"launch\s+(.+)",
                r"go\s+live\s+(.+)"
            ],
            "explain_code": [
                r"explain\s+(.+)",
                r"what\s+does\s+(.+)\s+do",
                r"how\s+does\s+(.+)\s+work",
                r"tell\s+me\s+about\s+(.+)"
            ],
            "optimize_performance": [
                r"optimize\s+(.+)",
                r"make\s+(.+)\s+faster",
                r"improve\s+performance\s+(.+)",
                r"speed\s+up\s+(.+)"
            ]
        }
    
    def _load_domain_vocabulary(self) -> Dict[str, List[str]]:
        """Load domain-specific vocabulary"""
        return {
            "frameworks": ["react", "vue", "angular", "next.js", "nuxt", "svelte", "fastapi", "django", "flask", "express"],
            "databases": ["mongodb", "postgresql", "mysql", "sqlite", "redis", "dynamodb", "firestore"],
            "languages": ["javascript", "typescript", "python", "java", "c#", "php", "ruby", "go", "rust"],
            "platforms": ["web", "mobile", "desktop", "api", "microservice", "serverless"],
            "industries": ["ecommerce", "fintech", "healthcare", "education", "saas", "portfolio", "blog", "cms"],
            "features": ["authentication", "payment", "chat", "search", "analytics", "dashboard", "crud", "realtime"]
        }
        
    async def process_natural_language(self, message: str, user_context: ConversationContext) -> IntentResult:
        """Process natural language input with enhanced understanding"""
        try:
            # Clean and normalize message
            cleaned_message = self._clean_message(message)
            
            # Detect intent
            intent, confidence = await self._detect_intent(cleaned_message)
            
            # Extract entities
            entities = await self._extract_entities(cleaned_message)
            
            # Build context
            context = await self._build_context(cleaned_message, user_context)
            
            # Generate suggestions
            suggestions = await self._generate_suggestions(intent, entities, context)
            
            # Update conversation memory
            await self._update_conversation_memory(user_context.user_id, message, intent, entities)
            
            return IntentResult(
                intent=intent,
                confidence=confidence,
                entities=entities,
                context=context,
                suggestions=suggestions
            )
            
        except Exception as e:
            logger.error(f"NLP processing error: {e}")
            return IntentResult(
                intent="general",
                confidence=0.5,
                entities={},
                context={},
                suggestions=["Could you provide more details about what you'd like to build?"]
            )
    
    async def ask_clarifying_questions(self, intent_result: IntentResult) -> List[str]:
        """Generate clarifying questions based on intent analysis"""
        questions = []
        
        if intent_result.intent == "create_app":
            if "platform" not in intent_result.entities:
                questions.append("Would you like this to be a web app, mobile app, or desktop application?")
            
            if "framework" not in intent_result.entities:
                questions.append("Do you have a preferred framework or technology stack?")
                
            if "features" not in intent_result.entities:
                questions.append("What key features should this application have?")
        
        elif intent_result.intent == "modify_code":
            questions.append("Which specific file or component would you like to modify?")
            questions.append("What changes would you like to make?")
            
        elif intent_result.intent == "deploy_app":
            questions.append("Where would you like to deploy this application?")
            questions.append("Do you need any specific deployment configurations?")
            
        return questions[:2]  # Limit to 2 questions to avoid overwhelming
    
    async def detect_skill_level(self, conversation_history: List[Dict]) -> str:
        """Detect user's technical skill level from conversation"""
        if not conversation_history:
            return "beginner"
            
        technical_terms = 0
        total_messages = len(conversation_history)
        
        technical_keywords = [
            "api", "database", "framework", "deployment", "authentication", "microservice",
            "docker", "kubernetes", "ci/cd", "testing", "orm", "middleware", "cors"
        ]
        
        for message in conversation_history[-10:]:  # Check last 10 messages
            content = message.get("content", "").lower()
            for keyword in technical_keywords:
                if keyword in content:
                    technical_terms += 1
        
        if technical_terms / max(total_messages, 1) > 0.3:
            return "advanced"
        elif technical_terms / max(total_messages, 1) > 0.1:
            return "intermediate"
        else:
            return "beginner"
    
    async def generate_contextual_response(self, message: str, intent_result: IntentResult, user_context: ConversationContext) -> str:
        """Generate contextually aware response"""
        skill_level = user_context.skill_level
        
        if intent_result.intent == "create_app":
            if skill_level == "beginner":
                return self._generate_beginner_response(intent_result)
            elif skill_level == "intermediate":
                return self._generate_intermediate_response(intent_result)
            else:
                return self._generate_advanced_response(intent_result)
        
        return "I understand you'd like help with that. Let me assist you!"
    
    def _clean_message(self, message: str) -> str:
        """Clean and normalize input message"""
        # Remove extra whitespace
        message = re.sub(r'\s+', ' ', message.strip())
        # Convert to lowercase for processing
        return message.lower()
    
    async def _detect_intent(self, message: str) -> Tuple[str, float]:
        """Detect user intent from message"""
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message, re.IGNORECASE):
                    return intent, 0.9
        
        # Default intent
        return "general", 0.5
    
    async def _extract_entities(self, message: str) -> Dict[str, Any]:
        """Extract entities from message"""
        entities = {}
        
        for domain, terms in self.domain_vocabulary.items():
            found_terms = []
            for term in terms:
                if term in message:
                    found_terms.append(term)
            if found_terms:
                entities[domain] = found_terms
        
        return entities
    
    async def _build_context(self, message: str, user_context: ConversationContext) -> Dict[str, Any]:
        """Build conversation context"""
        return {
            "skill_level": user_context.skill_level,
            "recent_projects": user_context.project_history[-3:] if user_context.project_history else [],
            "preferences": user_context.preferences,
            "conversation_length": len(user_context.conversation_memory)
        }
    
    async def _generate_suggestions(self, intent: str, entities: Dict, context: Dict) -> List[str]:
        """Generate helpful suggestions"""
        suggestions = []
        
        if intent == "create_app":
            suggestions.extend([
                "I can help you create a modern web application",
                "Would you like me to suggest a suitable tech stack?",
                "I can show you similar successful projects"
            ])
        
        elif intent == "modify_code":
            suggestions.extend([
                "I can help you refactor and improve your code",
                "Would you like me to suggest optimizations?",
                "I can add new features to your existing code"
            ])
        
        return suggestions[:3]
    
    async def _update_conversation_memory(self, user_id: str, message: str, intent: str, entities: Dict):
        """Update conversation memory"""
        if user_id not in self.context_memory:
            self.context_memory[user_id] = []
        
        self.context_memory[user_id].append({
            "message": message,
            "intent": intent,
            "entities": entities,
            "timestamp": datetime.utcnow()
        })
        
        # Keep only last 50 messages
        if len(self.context_memory[user_id]) > 50:
            self.context_memory[user_id] = self.context_memory[user_id][-50:]
    
    async def _load_user_preferences(self):
        """Load user preferences from database"""
        # This would connect to the database to load user preferences
        pass
        
    async def _initialize_language_models(self):
        """Initialize language models"""
        # This would initialize any ML models for NLP
        pass
    
    def _generate_beginner_response(self, intent_result: IntentResult) -> str:
        """Generate beginner-friendly response"""
        return "Great idea! I'll help you build this step by step. Let me start with a simple approach and explain everything as we go."
    
    def _generate_intermediate_response(self, intent_result: IntentResult) -> str:
        """Generate intermediate-level response"""
        return "I can help you build that! I'll use modern best practices and show you some advanced techniques along the way."
    
    def _generate_advanced_response(self, intent_result: IntentResult) -> str:
        """Generate advanced-level response"""
        return "Excellent! I'll implement this with enterprise-grade patterns, optimization, and scalability in mind."