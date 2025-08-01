from typing import List, Dict, Any, Optional
import json
from datetime import datetime
from services.ai_service import AIService
from services.voice_interface import VoiceInterface
import logging

logger = logging.getLogger(__name__)

class VoiceCodeReview:
    """Voice-powered code review and analysis service"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.voice_interface = VoiceInterface()
        self.review_history = {}
        
    async def initialize(self):
        """Initialize the voice code review service"""
        try:
            await self.ai_service.initialize()
            await self.voice_interface.initialize()
            logger.info("Voice Code Review service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize voice code review: {e}")
            raise
    
    async def start_voice_review(
        self,
        code_content: str,
        review_type: str = "general",
        user_id: str = None
    ) -> Dict[str, Any]:
        """Start a voice-guided code review session"""
        try:
            # Analyze code first
            code_analysis = await self._analyze_code_for_review(code_content, review_type)
            
            # Generate voice review script
            review_script = await self._generate_voice_review_script(
                code_analysis, review_type
            )
            
            # Start voice session
            session_id = f"voice_review_{datetime.utcnow().timestamp()}"
            
            review_session = {
                "session_id": session_id,
                "code_content": code_content,
                "review_type": review_type,
                "analysis": code_analysis,
                "voice_script": review_script,
                "status": "started",
                "current_section": 0,
                "user_id": user_id,
                "started_at": datetime.utcnow().isoformat()
            }
            
            self.review_history[session_id] = review_session
            
            return {
                "session_id": session_id,
                "review_session": review_session,
                "first_audio": review_script["sections"][0]["audio_text"],
                "total_sections": len(review_script["sections"])
            }
            
        except Exception as e:
            logger.error(f"Failed to start voice review: {e}")
            return {}
    
    async def process_voice_command(
        self,
        session_id: str,
        voice_command: str,
        user_id: str = None
    ) -> Dict[str, Any]:
        """Process voice commands during review session"""
        try:
            session = self.review_history.get(session_id)
            if not session:
                return {"error": "Session not found"}
            
            # Process the voice command
            response = await self._process_review_command(session, voice_command)
            
            # Update session
            self.review_history[session_id] = session
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to process voice command: {e}")
            return {"error": "Failed to process command"}
    
    async def get_voice_explanation(
        self,
        code_snippet: str,
        explanation_type: str = "walkthrough",
        user_level: str = "intermediate"
    ) -> Dict[str, Any]:
        """Get voice explanation of code snippet"""
        try:
            explanation_prompt = f"""
            Create a voice explanation for this code:
            
            Code: {code_snippet}
            Explanation type: {explanation_type}
            User level: {user_level}
            
            Generate natural, conversational explanation suitable for voice:
            - Use simple, clear language
            - Break into digestible segments
            - Include pauses for comprehension
            - Use analogies where helpful
            
            Return JSON:
            {{
                "voice_explanation": {{
                    "title": "Code Walkthrough",
                    "segments": [
                        {{
                            "segment_id": 1,
                            "audio_text": "Let's start by looking at this function declaration. This creates a new function called calculateTotal that takes two parameters.",
                            "code_highlight": "function calculateTotal(price, tax)",
                            "pause_duration": 2,
                            "emphasis": ["function", "calculateTotal", "parameters"]
                        }}
                    ],
                    "interactive_points": [
                        {{
                            "trigger": "explain more",
                            "response": "This function uses the standard JavaScript function syntax..."
                        }}
                    ],
                    "total_duration": "3 minutes",
                    "complexity_level": "beginner-friendly"
                }}
            }}
            """
            
            response = await self.ai_service.process_message(explanation_prompt)
            explanation_data = json.loads(response)
            
            return explanation_data.get("voice_explanation", {})
            
        except Exception as e:
            logger.error(f"Failed to get voice explanation: {e}")
            return {}
    
    async def conduct_interactive_debugging(
        self,
        code_with_error: str,
        error_message: str,
        user_id: str = None
    ) -> Dict[str, Any]:
        """Conduct interactive voice-guided debugging session"""
        try:
            debug_prompt = f"""
            Create an interactive voice debugging session:
            
            Code with error: {code_with_error}
            Error message: {error_message}
            
            Create step-by-step voice-guided debugging:
            - Identify the problem
            - Explain what's happening
            - Guide through troubleshooting steps
            - Provide fix suggestions
            
            Return JSON:
            {{
                "debug_session": {{
                    "problem_identification": {{
                        "audio_text": "I can see there's an error in your code. Let's work through this together.",
                        "error_analysis": "The error suggests a type mismatch on line 5",
                        "severity": "medium"
                    }},
                    "debugging_steps": [
                        {{
                            "step": 1,
                            "instruction": "First, let's examine the variable types. Can you tell me what type you expect 'userData' to be?",
                            "code_focus": "line 5: userData.map()",
                            "expected_response": "user_input",
                            "hints": ["Check if userData is an array", "Look at where userData is defined"]
                        }}
                    ],
                    "solutions": [
                        {{
                            "solution_type": "fix",
                            "description": "Add a null check before calling map",
                            "code_fix": "userData && userData.map(item => ...)",
                            "explanation": "This ensures userData exists and is not null before trying to use map"
                        }}
                    ],
                    "prevention_tips": [
                        "Always validate data types before using array methods",
                        "Consider using TypeScript for better type safety"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(debug_prompt)
            debug_data = json.loads(response)
            
            # Create debugging session
            session_id = f"debug_{datetime.utcnow().timestamp()}"
            debug_session = {
                "session_id": session_id,
                "user_id": user_id,
                "debug_data": debug_data.get("debug_session", {}),
                "current_step": 0,
                "status": "active",
                "started_at": datetime.utcnow().isoformat()
            }
            
            self.review_history[session_id] = debug_session
            
            return debug_session
            
        except Exception as e:
            logger.error(f"Failed to create debug session: {e}")
            return {}
    
    async def generate_voice_code_summary(
        self,
        codebase: str,
        summary_focus: str = "overview"
    ) -> Dict[str, Any]:
        """Generate voice summary of codebase or file"""
        try:
            summary_prompt = f"""
            Create a voice summary of this codebase:
            
            Code: {codebase[:2000]}  # Limit context
            Focus: {summary_focus}
            
            Generate conversational summary for voice delivery:
            - High-level overview
            - Key components and their purposes
            - Architecture highlights
            - Notable patterns or techniques
            
            Return JSON:
            {{
                "voice_summary": {{
                    "overview": {{
                        "audio_text": "This appears to be a React application with several key components...",
                        "duration": "30 seconds",
                        "key_points": ["React app", "Multiple components", "State management"]
                    }},
                    "detailed_sections": [
                        {{
                            "section": "Components",
                            "audio_text": "The main components include a Header, Navigation, and Content area...",
                            "code_references": ["Header.jsx", "Navigation.jsx"],
                            "duration": "45 seconds"
                        }}
                    ],
                    "architecture_insights": {{
                        "audio_text": "The architecture follows a typical React pattern with...",
                        "patterns": ["Component composition", "Props drilling", "State lifting"]
                    }},
                    "recommendations": [
                        "Consider using React Context for global state",
                        "Components could be broken down further for reusability"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(summary_prompt)
            summary_data = json.loads(response)
            
            return summary_data.get("voice_summary", {})
            
        except Exception as e:
            logger.error(f"Failed to generate voice summary: {e}")
            return {}
    
    async def _analyze_code_for_review(
        self,
        code: str,
        review_type: str
    ) -> Dict[str, Any]:
        """Analyze code to prepare for voice review"""
        analysis_prompt = f"""
        Analyze this code for {review_type} review:
        
        Code: {code}
        
        Provide analysis covering:
        - Code structure and organization
        - Best practices adherence
        - Potential improvements
        - Security considerations
        - Performance aspects
        - Readability and maintainability
        
        Return JSON analysis suitable for voice review.
        """
        
        try:
            response = await self.ai_service.process_message(analysis_prompt)
            return json.loads(response)
        except:
            return {"error": "Analysis failed"}
    
    async def _generate_voice_review_script(
        self,
        analysis: Dict[str, Any],
        review_type: str
    ) -> Dict[str, Any]:
        """Generate voice script for code review"""
        return {
            "sections": [
                {
                    "section_id": 1,
                    "title": "Code Overview",
                    "audio_text": "Let's start by reviewing the overall structure of your code. I can see this is a well-organized piece of code with clear function definitions.",
                    "duration": "30 seconds"
                },
                {
                    "section_id": 2,
                    "title": "Best Practices",
                    "audio_text": "Now let's look at some best practices. I notice a few areas where we can make improvements...",
                    "duration": "45 seconds"
                }
            ],
            "interactive_commands": [
                "next section",
                "repeat",
                "explain more",
                "skip this",
                "end review"
            ]
        }
    
    async def _process_review_command(
        self,
        session: Dict[str, Any],
        command: str
    ) -> Dict[str, Any]:
        """Process voice commands during review"""
        command_lower = command.lower()
        
        if "next" in command_lower:
            # Move to next section
            current = session.get("current_section", 0)
            max_sections = len(session.get("voice_script", {}).get("sections", []))
            
            if current < max_sections - 1:
                session["current_section"] = current + 1
                next_section = session["voice_script"]["sections"][current + 1]
                return {
                    "action": "next_section",
                    "audio_text": next_section["audio_text"],
                    "section_title": next_section["title"]
                }
            else:
                return {
                    "action": "review_complete",
                    "audio_text": "That completes our code review. Great job working through this with me!"
                }
        
        elif "repeat" in command_lower:
            # Repeat current section
            current = session.get("current_section", 0)
            current_section = session["voice_script"]["sections"][current]
            return {
                "action": "repeat",
                "audio_text": current_section["audio_text"]
            }
        
        elif "explain" in command_lower:
            # Provide more detailed explanation
            return {
                "action": "detailed_explanation",
                "audio_text": "Let me dive deeper into this concept. This pattern is commonly used because..."
            }
        
        else:
            return {
                "action": "unknown_command",
                "audio_text": "I didn't understand that command. You can say 'next', 'repeat', or 'explain more'."
            }