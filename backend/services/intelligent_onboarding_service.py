"""
Intelligent Onboarding Service
Provides conversation-based setup, skill detection, and personalized learning paths
"""
import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class SkillLevel(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class LearningStyle(Enum):
    VISUAL = "visual"
    HANDS_ON = "hands_on"
    THEORETICAL = "theoretical"
    EXAMPLE_BASED = "example_based"

@dataclass
class UserProfile:
    user_id: str
    skill_level: SkillLevel
    learning_style: LearningStyle
    interests: List[str]
    goals: List[str]
    experience: Dict[str, int]  # technology -> years
    preferences: Dict[str, Any]
    onboarding_completed: bool
    created_at: datetime

@dataclass
class OnboardingStep:
    step_id: str
    title: str
    description: str
    type: str  # "question", "demo", "tutorial", "setup"
    content: Dict[str, Any]
    required: bool
    estimated_time: int  # minutes
    completion_rate: float  # 0.0 to 1.0

@dataclass
class LearningPath:
    path_id: str
    name: str
    description: str
    skill_level: SkillLevel
    steps: List[str]  # step IDs
    estimated_duration: int  # hours
    prerequisites: List[str]
    outcomes: List[str]

class IntelligentOnboardingService:
    def __init__(self, db_wrapper):
        self.db_wrapper = db_wrapper
        self.user_profiles = {}
        self.onboarding_flows = {}
        self.learning_paths = {}
        self.achievement_system = {}
        
    async def initialize(self):
        """Initialize the Intelligent Onboarding Service"""
        logger.info("🎓 Initializing Intelligent Onboarding Service...")
        await self._load_onboarding_flows()
        await self._initialize_learning_paths()
        await self._setup_achievement_system()
        logger.info("✅ Intelligent Onboarding Service initialized")
    
    async def start_conversational_onboarding(self, user_id: str) -> Dict[str, Any]:
        """Start conversation-based onboarding process"""
        try:
            onboarding_session = {
                "session_id": f"onboard_{uuid.uuid4().hex[:8]}",
                "user_id": user_id,
                "current_step": 0,
                "responses": [],
                "detected_profile": {},
                "started_at": datetime.utcnow(),
                "estimated_completion": datetime.utcnow() + timedelta(minutes=15)
            }
            
            # Start with welcome and skill detection
            first_question = await self._get_skill_detection_question(0)
            
            onboarding_session["current_question"] = first_question
            self.onboarding_flows[onboarding_session["session_id"]] = onboarding_session
            
            return {
                "session_id": onboarding_session["session_id"],
                "message": "Welcome to AI Tempo! I'm here to personalize your experience. Let's start with a few quick questions.",
                "question": first_question,
                "progress": 0.0,
                "estimated_time_remaining": 15
            }
            
        except Exception as e:
            logger.error(f"Conversational onboarding error: {e}")
            return {"error": str(e)}
    
    async def process_onboarding_response(self, session_id: str, response: str) -> Dict[str, Any]:
        """Process user response and continue onboarding"""
        try:
            if session_id not in self.onboarding_flows:
                raise ValueError("Onboarding session not found")
            
            session = self.onboarding_flows[session_id]
            
            # Analyze response
            analysis = await self._analyze_onboarding_response(response, session["current_step"])
            session["responses"].append({
                "step": session["current_step"],
                "response": response,
                "analysis": analysis,
                "timestamp": datetime.utcnow()
            })
            
            # Update detected profile
            await self._update_detected_profile(session, analysis)
            
            # Move to next step
            session["current_step"] += 1
            
            # Check if onboarding is complete
            if session["current_step"] >= len(await self._get_onboarding_questions()):
                return await self._complete_onboarding(session)
            
            # Get next question
            next_question = await self._get_skill_detection_question(session["current_step"])
            session["current_question"] = next_question
            
            progress = session["current_step"] / len(await self._get_onboarding_questions())
            time_remaining = max(1, 15 - (session["current_step"] * 2))
            
            return {
                "session_id": session_id,
                "question": next_question,
                "progress": progress,
                "estimated_time_remaining": time_remaining,
                "insights": analysis.get("insights", [])
            }
            
        except Exception as e:
            logger.error(f"Onboarding response processing error: {e}")
            return {"error": str(e)}
    
    async def detect_skill_level_from_conversation(self, user_id: str, conversation_history: List[Dict]) -> SkillLevel:
        """Detect user skill level from conversation patterns"""
        try:
            if not conversation_history:
                return SkillLevel.BEGINNER
            
            skill_indicators = {
                "beginner": 0,
                "intermediate": 0,
                "advanced": 0,
                "expert": 0
            }
            
            # Analyze conversation for technical terms and concepts
            for message in conversation_history[-20:]:  # Last 20 messages
                content = message.get("content", "").lower()
                
                # Beginner indicators
                if any(term in content for term in ["how to", "what is", "tutorial", "help me", "explain"]):
                    skill_indicators["beginner"] += 1
                
                # Intermediate indicators
                if any(term in content for term in ["implement", "create", "build", "framework", "library"]):
                    skill_indicators["intermediate"] += 1
                
                # Advanced indicators
                if any(term in content for term in ["optimize", "architecture", "pattern", "scalability", "performance"]):
                    skill_indicators["advanced"] += 1
                
                # Expert indicators
                if any(term in content for term in ["microservices", "kubernetes", "ci/cd", "distributed", "concurrency"]):
                    skill_indicators["expert"] += 1
            
            # Determine skill level based on indicators
            max_score = max(skill_indicators.values())
            if max_score == 0:
                return SkillLevel.BEGINNER
            
            for level, score in skill_indicators.items():
                if score == max_score:
                    return SkillLevel(level)
            
            return SkillLevel.BEGINNER
            
        except Exception as e:
            logger.error(f"Skill detection error: {e}")
            return SkillLevel.BEGINNER
    
    # Helper methods
    async def _get_skill_detection_question(self, step: int) -> Dict[str, Any]:
        """Get skill detection question for specific step"""
        questions = await self._get_onboarding_questions()
        if step < len(questions):
            return questions[step]
        return {}
    
    async def _get_onboarding_questions(self) -> List[Dict[str, Any]]:
        """Get all onboarding questions"""
        return [
            {
                "id": "experience",
                "type": "choice",
                "question": "What's your experience with software development?",
                "options": [
                    "I'm completely new to programming",
                    "I have some basic knowledge",
                    "I'm comfortable with coding",
                    "I'm an experienced developer"
                ]
            },
            {
                "id": "goals",
                "type": "multiple_choice",
                "question": "What would you like to build with AI Tempo?",
                "options": [
                    "Personal websites/portfolios",
                    "Business applications",
                    "E-commerce stores",
                    "APIs and backends",
                    "Mobile apps",
                    "Just exploring and learning"
                ]
            }
        ]
    
    # Additional placeholder methods
    async def _load_onboarding_flows(self): pass
    async def _initialize_learning_paths(self): pass
    async def _setup_achievement_system(self): pass
    async def _analyze_onboarding_response(self, response: str, step: int) -> Dict[str, Any]: return {}
    async def _update_detected_profile(self, session: Dict, analysis: Dict): pass
    async def _complete_onboarding(self, session: Dict) -> Dict[str, Any]: 
        return {"status": "completed", "message": "Onboarding completed successfully!"}