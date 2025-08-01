import logging
import asyncio
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import re
from enum import Enum

logger = logging.getLogger(__name__)

class Intent(Enum):
    CREATE_PROJECT = "create_project"
    DEPLOY_APP = "deploy_app"
    AI_CHAT = "ai_chat"
    SEARCH_TEMPLATES = "search_templates" 
    GET_INTEGRATIONS = "get_integrations"
    PROJECT_STATUS = "project_status"
    HELP = "help"
    UNKNOWN = "unknown"

class VoiceInterface:
    """Voice & Natural Language Interface for AI Tempo Platform"""
    
    def __init__(self):
        self.intent_patterns = self._initialize_intent_patterns()
        self.context_memory = {}
        self.conversation_history = {}
        self.voice_enabled = True
        
    def _initialize_intent_patterns(self) -> Dict[Intent, List[str]]:
        """Initialize natural language patterns for intent recognition"""
        return {
            Intent.CREATE_PROJECT: [
                r"create\s+(a\s+)?(?:new\s+)?project",
                r"start\s+(a\s+)?(?:new\s+)?project",
                r"build\s+(a\s+)?(?:new\s+)?(?:app|application)",
                r"make\s+(a\s+)?(?:new\s+)?project",
                r"generate\s+(a\s+)?project"
            ],
            Intent.DEPLOY_APP: [
                r"deploy\s+(?:my\s+)?(?:app|application|project)",
                r"publish\s+(?:my\s+)?(?:app|application|project)",
                r"go\s+live\s+with",
                r"launch\s+(?:my\s+)?(?:app|application|project)"
            ],
            Intent.AI_CHAT: [
                r"(?:talk\s+to\s+)?ai\s+(?:assistant|helper)",
                r"chat\s+with\s+ai",
                r"ask\s+(?:the\s+)?ai",
                r"help\s+me\s+(?:with|build|create)",
                r"generate\s+code"
            ],
            Intent.SEARCH_TEMPLATES: [
                r"find\s+(?:a\s+)?template",
                r"search\s+(?:for\s+)?templates",
                r"show\s+me\s+templates",
                r"browse\s+templates",
                r"what\s+templates\s+(?:do\s+you\s+have|are\s+available)"
            ],
            Intent.GET_INTEGRATIONS: [
                r"(?:show|list)\s+integrations",
                r"what\s+integrations\s+(?:do\s+you\s+have|are\s+available)",
                r"find\s+(?:an\s+)?integration",
                r"connect\s+to\s+(?:a\s+)?service"
            ],
            Intent.PROJECT_STATUS: [
                r"(?:project|app)\s+status",
                r"how\s+is\s+my\s+project",
                r"check\s+(?:my\s+)?project",
                r"project\s+progress"
            ],
            Intent.HELP: [
                r"help",
                r"what\s+can\s+you\s+do",
                r"how\s+do\s+i",
                r"tutorial",
                r"guide"
            ]
        }
    
    async def process_voice_command(self, audio_data: bytes = None, text_input: str = None, 
                                  user_id: str = "default") -> Dict[str, Any]:
        """Process voice command or text input"""
        try:
            # Convert speech to text if audio provided
            if audio_data:
                transcript = await self._speech_to_text(audio_data)
            else:
                transcript = text_input or ""
            
            if not transcript:
                return self._create_response("I didn't understand that. Could you try again?", "error")
            
            # Parse intent and entities
            intent_result = await self._parse_intent(transcript, user_id)
            
            # Execute command based on intent
            response = await self._execute_command(intent_result, user_id)
            
            # Store in conversation history
            await self._store_interaction(user_id, transcript, response)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing voice command: {e}")
            return self._create_response("I encountered an error processing your request.", "error")
    
    async def _speech_to_text(self, audio_data: bytes) -> str:
        """Convert speech to text"""
        try:
            # In production, integrate with speech-to-text service like:
            # - OpenAI Whisper
            # - Google Speech-to-Text
            # - Azure Speech Services
            
            # For now, simulate speech recognition
            await asyncio.sleep(0.5)  # Simulate processing time
            
            # Return simulated transcript based on audio length
            audio_length = len(audio_data)
            
            if audio_length < 1000:
                return "help"
            elif audio_length < 3000:
                return "create a new project"
            elif audio_length < 5000:
                return "show me templates for react"
            else:
                return "deploy my application to production"
                
        except Exception as e:
            logger.error(f"Error in speech-to-text: {e}")
            return ""
    
    async def _parse_intent(self, text: str, user_id: str) -> Dict[str, Any]:
        """Parse intent and extract entities from text"""
        try:
            text_lower = text.lower().strip()
            
            # Find matching intent
            detected_intent = Intent.UNKNOWN
            confidence = 0.0
            matched_pattern = None
            
            for intent, patterns in self.intent_patterns.items():
                for pattern in patterns:
                    match = re.search(pattern, text_lower)
                    if match:
                        detected_intent = intent
                        confidence = 0.8 + (len(match.group()) / len(text_lower) * 0.2)
                        matched_pattern = pattern
                        break
                if detected_intent != Intent.UNKNOWN:
                    break
            
            # Extract entities
            entities = await self._extract_entities(text_lower, detected_intent)
            
            # Get context from previous interactions
            context = self._get_conversation_context(user_id)
            
            return {
                "intent": detected_intent,
                "confidence": min(confidence, 1.0),
                "entities": entities,
                "original_text": text,
                "matched_pattern": matched_pattern,
                "context": context
            }
            
        except Exception as e:
            logger.error(f"Error parsing intent: {e}")
            return {
                "intent": Intent.UNKNOWN,
                "confidence": 0.0,
                "entities": {},
                "original_text": text,
                "context": {}
            }
    
    async def _extract_entities(self, text: str, intent: Intent) -> Dict[str, Any]:
        """Extract entities from text based on intent"""
        entities = {}
        
        try:
            if intent == Intent.CREATE_PROJECT:
                # Extract project type
                project_types = ["react", "vue", "angular", "node", "python", "api", "frontend", "backend", "fullstack"]
                for proj_type in project_types:
                    if proj_type in text:
                        entities["project_type"] = proj_type
                        break
                
                # Extract project name
                name_patterns = [
                    r"(?:called|named)\s+([a-zA-Z0-9\-_]+)",
                    r"(?:project|app)\s+([a-zA-Z0-9\-_]+)",
                ]
                
                for pattern in name_patterns:
                    match = re.search(pattern, text)
                    if match:
                        entities["project_name"] = match.group(1)
                        break
            
            elif intent == Intent.SEARCH_TEMPLATES:
                # Extract template type/technology
                tech_keywords = ["react", "vue", "angular", "node", "python", "api", "ecommerce", "blog", "portfolio"]
                for tech in tech_keywords:
                    if tech in text:
                        entities["technology"] = tech
                        break
            
            elif intent == Intent.DEPLOY_APP:
                # Extract deployment target
                deploy_targets = ["production", "staging", "development", "vercel", "netlify", "aws", "heroku"]
                for target in deploy_targets:
                    if target in text:
                        entities["deploy_target"] = target
                        break
            
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return {}
    
    async def _execute_command(self, intent_result: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute command based on parsed intent"""
        try:
            intent = intent_result["intent"]
            entities = intent_result["entities"]
            confidence = intent_result["confidence"]
            
            # Low confidence - ask for clarification
            if confidence < 0.5:
                return self._create_response(
                    "I'm not sure what you want to do. Could you be more specific?",
                    "clarification_needed",
                    suggestions=["Create a project", "Search templates", "Deploy app", "Get help"]
                )
            
            # Execute based on intent
            if intent == Intent.CREATE_PROJECT:
                return await self._handle_create_project(entities, user_id)
            
            elif intent == Intent.SEARCH_TEMPLATES:
                return await self._handle_search_templates(entities, user_id)
            
            elif intent == Intent.DEPLOY_APP:
                return await self._handle_deploy_app(entities, user_id)
            
            elif intent == Intent.AI_CHAT:
                return await self._handle_ai_chat(intent_result, user_id)
            
            elif intent == Intent.GET_INTEGRATIONS:
                return await self._handle_get_integrations(entities, user_id)
            
            elif intent == Intent.PROJECT_STATUS:
                return await self._handle_project_status(entities, user_id)
            
            elif intent == Intent.HELP:
                return await self._handle_help(entities, user_id)
            
            else:
                return self._create_response(
                    "I understand you want to do something, but I'm not sure what. Try saying 'help' to see what I can do.",
                    "unknown_intent"
                )
                
        except Exception as e:
            logger.error(f"Error executing command: {e}")
            return self._create_response("I encountered an error executing your command.", "error")
    
    async def _handle_create_project(self, entities: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle project creation command"""
        try:
            project_type = entities.get("project_type", "react")
            project_name = entities.get("project_name", f"project-{datetime.now().strftime('%Y%m%d%H%M%S')}")
            
            # Simulate project creation
            project_data = {
                "id": f"proj_{user_id}_{datetime.now().timestamp()}",
                "name": project_name,
                "type": project_type,
                "status": "created",
                "created_at": datetime.now().isoformat()
            }
            
            response_text = f"Great! I've created a new {project_type} project called '{project_name}'. "
            response_text += "Would you like me to set up the initial structure or add any integrations?"
            
            return self._create_response(
                response_text,
                "success",
                data=project_data,
                actions=["setup_structure", "add_integrations", "open_editor"],
                next_suggestions=["Set up the project structure", "Add integrations", "Open in editor"]
            )
            
        except Exception as e:
            logger.error(f"Error handling create project: {e}")
            return self._create_response("I had trouble creating the project. Please try again.", "error")
    
    async def _handle_search_templates(self, entities: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle template search command"""
        try:
            technology = entities.get("technology", "")
            
            # Simulate template search
            all_templates = [
                {"name": "React Starter", "type": "react", "description": "Modern React app with hooks"},
                {"name": "Vue Portfolio", "type": "vue", "description": "Professional portfolio site"},
                {"name": "Node.js API", "type": "node", "description": "RESTful API with Express"},
                {"name": "Python FastAPI", "type": "python", "description": "High-performance API"},
                {"name": "E-commerce Store", "type": "ecommerce", "description": "Full-featured online store"},
                {"name": "Blog Platform", "type": "blog", "description": "Content management system"}
            ]
            
            # Filter by technology if specified
            if technology:
                filtered_templates = [t for t in all_templates if technology in t["type"].lower() or technology in t["name"].lower()]
            else:
                filtered_templates = all_templates
            
            if not filtered_templates:
                return self._create_response(
                    f"I couldn't find any templates matching '{technology}'. Here are some popular options:",
                    "no_results",
                    data=all_templates[:3]
                )
            
            response_text = f"I found {len(filtered_templates)} template(s)"
            if technology:
                response_text += f" for {technology}"
            response_text += ". Which one interests you?"
            
            return self._create_response(
                response_text,
                "success",
                data=filtered_templates,
                actions=["select_template", "view_details", "create_from_template"]
            )
            
        except Exception as e:
            logger.error(f"Error handling search templates: {e}")
            return self._create_response("I had trouble searching templates. Please try again.", "error")
    
    async def _handle_deploy_app(self, entities: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle app deployment command"""
        try:
            deploy_target = entities.get("deploy_target", "production")
            
            # Check if user has projects
            # In production, this would query the database
            has_projects = True  # Simulate having projects
            
            if not has_projects:
                return self._create_response(
                    "You don't have any projects to deploy yet. Would you like to create one first?",
                    "no_projects",
                    actions=["create_project"],
                    next_suggestions=["Create a new project"]
                )
            
            response_text = f"I'll help you deploy your app to {deploy_target}. "
            response_text += "Let me check your project configuration and deployment settings."
            
            # Simulate deployment process
            deployment_steps = [
                "Checking project configuration",
                "Running build process",
                "Preparing deployment package",
                f"Deploying to {deploy_target}",
                "Configuring domain and SSL",
                "Running post-deployment tests"
            ]
            
            return self._create_response(
                response_text,
                "deployment_started",
                data={
                    "target": deploy_target,
                    "steps": deployment_steps,
                    "estimated_time": "5-10 minutes"
                },
                actions=["monitor_deployment", "cancel_deployment"]
            )
            
        except Exception as e:
            logger.error(f"Error handling deploy app: {e}")
            return self._create_response("I had trouble starting the deployment. Please try again.", "error")
    
    async def _handle_ai_chat(self, intent_result: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle AI chat command"""
        try:
            original_text = intent_result["original_text"]
            
            # Extract the actual question/request from the text
            chat_patterns = [
                r"ai[,\s]+(.+)",
                r"help\s+me\s+(?:with\s+)?(.+)",
                r"generate\s+(.+)",
                r"create\s+(.+)",
                r"build\s+(.+)"
            ]
            
            actual_request = original_text
            for pattern in chat_patterns:
                match = re.search(pattern, original_text.lower())
                if match:
                    actual_request = match.group(1)
                    break
            
            response_text = f"I'll help you with: {actual_request}. "
            response_text += "Let me process this and provide you with a detailed response."
            
            return self._create_response(
                response_text,
                "ai_processing",
                data={
                    "request": actual_request,
                    "processing": True
                },
                actions=["get_ai_response", "refine_request"],
                next_suggestions=["Get detailed AI response", "Refine your request"]
            )
            
        except Exception as e:
            logger.error(f"Error handling AI chat: {e}")
            return self._create_response("I had trouble understanding your request. Please try again.", "error")
    
    async def _handle_get_integrations(self, entities: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle get integrations command"""
        try:
            # Simulate integration search
            integrations = [
                {"name": "Stripe", "category": "payments", "description": "Accept online payments"},
                {"name": "Auth0", "category": "authentication", "description": "User authentication"},
                {"name": "MongoDB", "category": "database", "description": "NoSQL database"},
                {"name": "SendGrid", "category": "email", "description": "Email delivery service"},
                {"name": "Google Analytics", "category": "analytics", "description": "Website analytics"},
                {"name": "GitHub", "category": "development", "description": "Code repository"}
            ]
            
            response_text = f"Here are {len(integrations)} popular integrations you can add to your project. "
            response_text += "Which type of integration are you looking for?"
            
            return self._create_response(
                response_text,
                "success",
                data=integrations,
                actions=["select_integration", "search_integrations", "view_categories"],
                next_suggestions=["Select an integration", "Search for specific integration", "Browse by category"]
            )
            
        except Exception as e:
            logger.error(f"Error handling get integrations: {e}")
            return self._create_response("I had trouble retrieving integrations. Please try again.", "error")
    
    async def _handle_project_status(self, entities: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle project status command"""
        try:
            # Simulate project status check
            project_status = {
                "total_projects": 3,
                "active_projects": 2,
                "deployed_projects": 1,
                "recent_activity": [
                    {"action": "Created React project", "time": "2 hours ago"},
                    {"action": "Added Stripe integration", "time": "1 day ago"},
                    {"action": "Deployed to production", "time": "3 days ago"}
                ]
            }
            
            response_text = f"You have {project_status['total_projects']} projects total, "
            response_text += f"{project_status['active_projects']} are currently active, "
            response_text += f"and {project_status['deployed_projects']} is deployed. "
            response_text += "Would you like details on any specific project?"
            
            return self._create_response(
                response_text,
                "success",
                data=project_status,
                actions=["view_project_details", "manage_projects", "create_new_project"],
                next_suggestions=["View project details", "Manage existing projects", "Create new project"]
            )
            
        except Exception as e:
            logger.error(f"Error handling project status: {e}")
            return self._create_response("I had trouble checking your project status. Please try again.", "error")
    
    async def _handle_help(self, entities: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle help command"""
        try:
            help_topics = {
                "Creating Projects": [
                    "Say 'create a new React project' or 'build a Node.js app'",
                    "I can help you set up projects with different technologies"
                ],
                "Finding Templates": [
                    "Say 'show me templates' or 'find React templates'",
                    "Browse pre-built templates to get started quickly"
                ],
                "Deploying Apps": [
                    "Say 'deploy my app' or 'publish to production'",
                    "I'll guide you through the deployment process"
                ],
                "AI Assistance": [
                    "Say 'help me build a login form' or 'generate API code'",
                    "Get AI-powered code generation and development help"
                ],
                "Managing Integrations": [
                    "Say 'show integrations' or 'connect to Stripe'",
                    "Add third-party services to your projects"
                ]
            }
            
            response_text = "I'm your AI development assistant! Here's what I can help you with:"
            
            return self._create_response(
                response_text,
                "help",
                data=help_topics,
                actions=["try_example", "get_started", "view_tutorials"],
                next_suggestions=["Try an example command", "Get started with a project", "View tutorials"]
            )
            
        except Exception as e:
            logger.error(f"Error handling help: {e}")
            return self._create_response("I had trouble providing help information. Please try again.", "error")
    
    def _create_response(self, text: str, response_type: str, data: Any = None, 
                        actions: List[str] = None, next_suggestions: List[str] = None) -> Dict[str, Any]:
        """Create a standardized response"""
        return {
            "response_text": text,
            "response_type": response_type,
            "data": data,
            "actions": actions or [],
            "next_suggestions": next_suggestions or [],
            "timestamp": datetime.now().isoformat(),
            "voice_enabled": self.voice_enabled
        }
    
    def _get_conversation_context(self, user_id: str) -> Dict[str, Any]:
        """Get conversation context for user"""
        return self.conversation_history.get(user_id, {})
    
    async def _store_interaction(self, user_id: str, input_text: str, response: Dict[str, Any]):
        """Store interaction in conversation history"""
        try:
            if user_id not in self.conversation_history:
                self.conversation_history[user_id] = {
                    "interactions": [],
                    "context": {}
                }
            
            interaction = {
                "timestamp": datetime.now().isoformat(),
                "input": input_text,
                "response": response,
                "intent": response.get("intent")
            }
            
            self.conversation_history[user_id]["interactions"].append(interaction)
            
            # Keep only last 10 interactions
            if len(self.conversation_history[user_id]["interactions"]) > 10:
                self.conversation_history[user_id]["interactions"] = \
                    self.conversation_history[user_id]["interactions"][-10:]
                    
        except Exception as e:
            logger.error(f"Error storing interaction: {e}")
    
    async def get_conversation_history(self, user_id: str) -> Dict[str, Any]:
        """Get conversation history for user"""
        return self.conversation_history.get(user_id, {"interactions": [], "context": {}})
    
    async def clear_conversation_history(self, user_id: str):
        """Clear conversation history for user"""
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]
    
    def set_voice_enabled(self, enabled: bool):
        """Enable or disable voice processing"""
        self.voice_enabled = enabled
    
    async def initialize(self):
        """Initialize voice interface"""
        try:
            logger.info("Voice Interface initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize voice interface: {e}")
            raise