from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
from services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

class ContextualLearningAssistant:
    """AI-powered contextual learning and skill development assistant"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.user_skills = {}
        self.learning_paths = {}
        self.progress_tracking = {}
        
    async def initialize(self):
        """Initialize the learning assistant service"""
        try:
            await self.ai_service.initialize()
            await self._load_learning_content()
            logger.info("Contextual Learning Assistant initialized")
        except Exception as e:
            logger.error(f"Failed to initialize learning assistant: {e}")
            raise
    
    async def get_contextual_suggestions(
        self,
        current_code: str,
        user_activity: Dict[str, Any],
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Get learning suggestions based on current work context"""
        try:
            # Analyze current work context
            context_analysis = await self._analyze_work_context(current_code, user_activity)
            
            # Get user skill level
            user_profile = await self._get_user_skill_profile(user_id)
            
            # Generate contextual learning suggestions
            suggestions = await self._generate_learning_suggestions(
                context_analysis, user_profile
            )
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Failed to get contextual suggestions: {e}")
            return []
    
    async def get_skill_assessment(
        self,
        code_samples: List[str],
        user_id: str,
        technology: str = "javascript"
    ) -> Dict[str, Any]:
        """Assess user's skill level in a technology"""
        try:
            assessment_prompt = f"""
            Assess the skill level of this developer in {technology} based on their code:
            
            Code samples:
            {json.dumps(code_samples[:5])}  # Limit to 5 samples
            
            Evaluate:
            - Code quality and style
            - Use of best practices
            - Problem-solving approach
            - Knowledge of advanced concepts
            - Testing and documentation
            
            Return JSON:
            {{
                "overall_level": "beginner|intermediate|advanced|expert",
                "skill_breakdown": {{
                    "syntax_knowledge": {{"level": "intermediate", "score": 7}},
                    "best_practices": {{"level": "beginner", "score": 4}},
                    "problem_solving": {{"level": "advanced", "score": 8}},
                    "testing": {{"level": "beginner", "score": 3}},
                    "documentation": {{"level": "intermediate", "score": 6}}
                }},
                "strengths": ["Good problem solving", "Clean code structure"],
                "improvement_areas": ["Testing", "Documentation", "Error handling"],
                "recommended_next_steps": [
                    "Learn unit testing with Jest",
                    "Practice writing JSDoc comments"
                ]
            }}
            """
            
            response = await self.ai_service.process_message(assessment_prompt)
            assessment = json.loads(response)
            
            # Store assessment for tracking progress
            await self._store_skill_assessment(user_id, technology, assessment)
            
            return assessment
            
        except Exception as e:
            logger.error(f"Failed to assess skills: {e}")
            return {}
    
    async def get_personalized_learning_path(
        self,
        user_id: str,
        goals: List[str],
        current_skills: Dict[str, Any],
        time_commitment: str = "moderate"
    ) -> Dict[str, Any]:
        """Generate personalized learning path"""
        try:
            path_prompt = f"""
            Create a personalized learning path for a developer with:
            
            Goals: {json.dumps(goals)}
            Current skills: {json.dumps(current_skills)}
            Time commitment: {time_commitment} (light/moderate/intensive)
            
            Create a structured learning path with:
            
            Return JSON:
            {{
                "learning_path": {{
                    "title": "Path Name",
                    "duration": "3 months",
                    "difficulty": "intermediate",
                    "phases": [
                        {{
                            "phase": 1,
                            "title": "Foundation Building",
                            "duration": "2 weeks",
                            "topics": [
                                {{
                                    "topic": "React Fundamentals",
                                    "resources": [
                                        {{"type": "tutorial", "title": "React Basics", "url": "#"}},
                                        {{"type": "practice", "title": "Build Todo App", "difficulty": "easy"}}
                                    ],
                                    "estimated_time": "8 hours"
                                }}
                            ]
                        }}
                    ],
                    "milestones": [
                        {{"week": 2, "milestone": "Complete first React app"}},
                        {{"week": 4, "milestone": "Master hooks and state management"}}
                    ],
                    "skills_gained": ["React", "State Management", "Component Architecture"]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(path_prompt)
            learning_path = json.loads(response)
            
            # Store learning path
            self.learning_paths[user_id] = learning_path
            
            return learning_path
            
        except Exception as e:
            logger.error(f"Failed to generate learning path: {e}")
            return {}
    
    async def get_interactive_tutorials(
        self,
        topic: str,
        skill_level: str = "beginner",
        preferred_style: str = "hands-on"
    ) -> List[Dict[str, Any]]:
        """Get interactive tutorials for specific topics"""
        try:
            tutorial_prompt = f"""
            Create interactive tutorials for: {topic}
            Skill level: {skill_level}
            Learning style: {preferred_style}
            
            Return JSON with tutorials:
            {{
                "tutorials": [
                    {{
                        "title": "Tutorial Title",
                        "description": "What you'll learn",
                        "difficulty": "beginner|intermediate|advanced",
                        "duration": "30 minutes",
                        "type": "interactive|video|article|hands-on",
                        "steps": [
                            {{
                                "step": 1,
                                "title": "Step title",
                                "content": "Step content",
                                "code_example": "code here",
                                "interactive_element": "Try modifying this code"
                            }}
                        ],
                        "completion_criteria": "What indicates completion",
                        "next_tutorials": ["Related tutorial suggestions"]
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(tutorial_prompt)
            tutorials_data = json.loads(response)
            
            return tutorials_data.get("tutorials", [])
            
        except Exception as e:
            logger.error(f"Failed to get tutorials: {e}")
            return []
    
    async def track_learning_progress(
        self,
        user_id: str,
        activity: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Track and analyze learning progress"""
        try:
            # Record activity
            if user_id not in self.progress_tracking:
                self.progress_tracking[user_id] = {
                    "activities": [],
                    "skills_practiced": {},
                    "completion_rates": {},
                    "learning_velocity": {}
                }
            
            self.progress_tracking[user_id]["activities"].append({
                **activity,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Analyze progress
            progress_analysis = await self._analyze_learning_progress(user_id)
            
            return progress_analysis
            
        except Exception as e:
            logger.error(f"Failed to track progress: {e}")
            return {}
    
    async def get_skill_challenges(
        self,
        user_id: str,
        technology: str,
        difficulty: str = "appropriate"
    ) -> List[Dict[str, Any]]:
        """Get coding challenges tailored to user's skill level"""
        try:
            user_profile = await self._get_user_skill_profile(user_id)
            
            challenge_prompt = f"""
            Create coding challenges for {technology} at {difficulty} level.
            User profile: {json.dumps(user_profile)}
            
            Return JSON:
            {{
                "challenges": [
                    {{
                        "title": "Challenge Title",
                        "description": "Challenge description",
                        "difficulty": "easy|medium|hard",
                        "estimated_time": "30 minutes",
                        "skills_practiced": ["Array manipulation", "Algorithms"],
                        "starter_code": "// Starting code template",
                        "test_cases": [
                            {{"input": "test input", "expected_output": "expected result"}}
                        ],
                        "hints": ["Hint 1", "Hint 2"],
                        "solution_explanation": "How to approach this problem"
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(challenge_prompt)
            challenges_data = json.loads(response)
            
            return challenges_data.get("challenges", [])
            
        except Exception as e:
            logger.error(f"Failed to get challenges: {e}")
            return []
    
    async def get_mentorship_suggestions(
        self,
        user_id: str,
        current_project: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get AI mentorship suggestions for current work"""
        try:
            mentorship_prompt = f"""
            Act as a senior developer mentor. Review this project and provide guidance:
            
            Project: {json.dumps(current_project)}
            
            Provide mentorship in these areas:
            - Code architecture and design patterns
            - Best practices and conventions
            - Performance optimization opportunities
            - Testing strategies
            - Career development advice
            
            Return JSON:
            {{
                "mentorship_advice": [
                    {{
                        "category": "architecture|best_practices|performance|testing|career",
                        "title": "Advice title",
                        "advice": "Detailed mentorship advice",
                        "actionable_steps": ["Step 1", "Step 2"],
                        "resources": [
                            {{"type": "article", "title": "Resource title", "url": "#"}}
                        ],
                        "priority": "high|medium|low"
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(mentorship_prompt)
            mentorship_data = json.loads(response)
            
            return mentorship_data.get("mentorship_advice", [])
            
        except Exception as e:
            logger.error(f"Failed to get mentorship suggestions: {e}")
            return []
    
    async def _analyze_work_context(
        self,
        code: str,
        activity: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze current work context for learning opportunities"""
        context = {
            "technologies_used": [],
            "complexity_level": "intermediate",
            "patterns_detected": [],
            "learning_opportunities": []
        }
        
        # Basic technology detection
        if "react" in code.lower() or "jsx" in code.lower():
            context["technologies_used"].append("React")
        if "async" in code or "await" in code:
            context["technologies_used"].append("Async Programming")
        if "test" in code.lower() or "expect" in code.lower():
            context["technologies_used"].append("Testing")
        
        return context
    
    async def _get_user_skill_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user's current skill profile"""
        return self.user_skills.get(user_id, {
            "level": "beginner",
            "technologies": {},
            "learning_preferences": {
                "style": "hands-on",
                "pace": "moderate",
                "difficulty_preference": "gradual"
            }
        })
    
    async def _generate_learning_suggestions(
        self,
        context: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate contextual learning suggestions"""
        suggestions = []
        
        for tech in context["technologies_used"]:
            if tech not in user_profile.get("technologies", {}):
                suggestions.append({
                    "type": "tutorial",
                    "title": f"Learn {tech} Fundamentals",
                    "description": f"Get started with {tech} based on your current work",
                    "relevance": "high",
                    "estimated_time": "2 hours"
                })
        
        return suggestions
    
    async def _store_skill_assessment(
        self,
        user_id: str,
        technology: str,
        assessment: Dict[str, Any]
    ):
        """Store skill assessment for progress tracking"""
        if user_id not in self.user_skills:
            self.user_skills[user_id] = {"technologies": {}}
        
        self.user_skills[user_id]["technologies"][technology] = {
            **assessment,
            "assessed_at": datetime.utcnow().isoformat()
        }
    
    async def _analyze_learning_progress(self, user_id: str) -> Dict[str, Any]:
        """Analyze user's learning progress and patterns"""
        user_data = self.progress_tracking.get(user_id, {})
        
        # Basic progress analysis
        activities = user_data.get("activities", [])
        recent_activities = [
            a for a in activities 
            if datetime.fromisoformat(a["timestamp"]) > datetime.utcnow() - timedelta(days=7)
        ]
        
        return {
            "total_activities": len(activities),
            "recent_activity_count": len(recent_activities),
            "learning_streak": self._calculate_learning_streak(activities),
            "top_skills_practiced": self._get_top_skills(activities),
            "progress_trend": "improving"  # Would be calculated based on performance
        }
    
    def _calculate_learning_streak(self, activities: List[Dict]) -> int:
        """Calculate current learning streak"""
        if not activities:
            return 0
        
        # Simple streak calculation
        return len([a for a in activities[-7:] if a])  # Last 7 days
    
    def _get_top_skills(self, activities: List[Dict]) -> List[str]:
        """Get most practiced skills"""
        skills = {}
        for activity in activities:
            skill = activity.get("skill", "general")
            skills[skill] = skills.get(skill, 0) + 1
        
        return sorted(skills.keys(), key=skills.get, reverse=True)[:5]
    
    async def _load_learning_content(self):
        """Load learning content and curriculum"""
        # This would typically load from a database or content management system
        logger.info("Learning content loaded")