"""
Enhanced AI Service V2 - Full AI Integration with Multiple Providers
Connects all cosmic features with real AI capabilities using emergentintegrations
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import uuid
import re
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

class EnhancedAIServiceV2:
    """
    Enhanced AI Service V2 - Full AI Integration with Multiple Providers
    Supports OpenAI, Anthropic, Gemini, and local models
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # Available AI providers and models
        self.ai_providers = {
            'openai': {
                'models': ['gpt-4.1', 'gpt-4o', 'gpt-4.1-mini', 'o1-mini', 'o3-mini'],
                'default': 'gpt-4o'
            },
            'anthropic': {
                'models': ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
                'default': 'claude-sonnet-4-20250514'
            },
            'gemini': {
                'models': ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
                'default': 'gemini-2.0-flash'
            },
            'local': {
                'models': ['mistral-7b', 'codellama-13b', 'llama-3.1-8b'],
                'default': 'mistral-7b'
            }
        }
        
        # Current configuration
        self.current_config = {
            'provider': 'openai',
            'model': 'gpt-4o',
            'api_key': None
        }
        
        # Chat instances cache
        self.chat_instances: Dict[str, LlmChat] = {}
        
        # Avatar AI personalities
        self.avatar_personalities = {
            'linus-torvalds': {
                'provider': 'openai',
                'model': 'gpt-4o',
                'personality': """You are Linus Torvalds, creator of Linux and Git. 
                Review code with direct technical precision, focus on system architecture, 
                performance, and maintainability. Be brutally honest about inefficiencies.
                Always end with your signature directness."""
            },
            'ada-lovelace': {
                'provider': 'anthropic',
                'model': 'claude-sonnet-4-20250514',
                'personality': """You are Ada Lovelace, the world's first computer programmer. 
                Approach code with mathematical elegance, algorithmic beauty, and analytical precision.
                Focus on logical structure and mathematical correctness."""
            },
            'grace-hopper': {
                'provider': 'openai',
                'model': 'gpt-4o',
                'personality': """You are Grace Hopper, pioneer of compiler design. 
                Focus on practical innovation, usability, and human-readable code.
                Emphasize compiler efficiency and breakthrough solutions."""
            },
            'donald-knuth': {
                'provider': 'anthropic',
                'model': 'claude-sonnet-4-20250514',
                'personality': """You are Donald Knuth, author of "The Art of Computer Programming". 
                Provide meticulous academic analysis, focus on algorithmic complexity,
                and emphasize literate programming principles."""
            },
            'margaret-hamilton': {
                'provider': 'openai',
                'model': 'gpt-4o',
                'personality': """You are Margaret Hamilton, Apollo flight software engineer. 
                Focus on mission-critical reliability, systematic error handling,
                and safety-first programming principles."""
            }
        }
        
        logger.info("🚀 Enhanced AI Service V2 initialized with multi-provider support")

    async def set_ai_provider(self, provider: str, model: str, api_key: str) -> Dict[str, Any]:
        """Set AI provider and model configuration"""
        try:
            if provider not in self.ai_providers:
                return {
                    'success': False,
                    'error': f'Unsupported provider: {provider}',
                    'supported_providers': list(self.ai_providers.keys())
                }
            
            if model not in self.ai_providers[provider]['models']:
                return {
                    'success': False,
                    'error': f'Unsupported model: {model} for provider {provider}',
                    'supported_models': self.ai_providers[provider]['models']
                }
            
            self.current_config = {
                'provider': provider,
                'model': model,
                'api_key': api_key
            }
            
            # Clear chat instances cache
            self.chat_instances.clear()
            
            return {
                'success': True,
                'provider': provider,
                'model': model,
                'message': f'AI provider set to {provider} with model {model}'
            }
            
        except Exception as e:
            logger.error(f"Failed to set AI provider: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_chat_instance(self, session_id: str, system_message: str = None) -> LlmChat:
        """Get or create chat instance for session"""
        if session_id in self.chat_instances:
            return self.chat_instances[session_id]
        
        # Create new chat instance
        chat = LlmChat(
            api_key=self.current_config['api_key'],
            session_id=session_id,
            system_message=system_message or "You are a helpful AI assistant specialized in software development."
        )
        
        # Configure provider and model
        chat.with_model(self.current_config['provider'], self.current_config['model'])
        
        self.chat_instances[session_id] = chat
        return chat

    async def ai_code_completion(self, code_context: str, cursor_position: int, language: str, session_id: str) -> Dict[str, Any]:
        """Advanced AI-powered code completion"""
        try:
            # Extract code before and after cursor
            code_before = code_context[:cursor_position]
            code_after = code_context[cursor_position:]
            
            system_message = f"""You are an expert {language} code completion assistant. 
            Provide contextually appropriate code completions that:
            1. Are syntactically correct
            2. Follow best practices
            3. Maintain code style consistency
            4. Are semantically meaningful
            
            Return completions as JSON array with 'text' and 'description' fields."""
            
            user_message = f"""Complete this {language} code at cursor position:

CODE BEFORE CURSOR:
```{language}
{code_before}
```

CODE AFTER CURSOR:
```{language}
{code_after}
```

Provide 3-5 intelligent completion suggestions."""
            
            # Get chat instance
            chat = await self.get_chat_instance(session_id, system_message)
            
            # Send message
            response = await chat.send_message(UserMessage(text=user_message))
            
            # Parse response
            try:
                completions = json.loads(response)
                if not isinstance(completions, list):
                    completions = [{"text": response, "description": "AI completion"}]
            except:
                completions = [{"text": response, "description": "AI completion"}]
            
            # Save completion request
            completion_record = {
                'completion_id': str(uuid.uuid4()),
                'session_id': session_id,
                'code_context': code_context,
                'cursor_position': cursor_position,
                'language': language,
                'completions': completions,
                'timestamp': datetime.utcnow()
            }
            
            await self.db.ai_completions.insert_one(completion_record)
            
            return {
                'success': True,
                'completions': completions,
                'completion_id': completion_record['completion_id'],
                'provider': self.current_config['provider'],
                'model': self.current_config['model']
            }
            
        except Exception as e:
            logger.error(f"AI code completion failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'completions': []
            }

    async def avatar_code_review(self, avatar_id: str, code: str, language: str, context: str = "") -> Dict[str, Any]:
        """AI-powered code review by avatar personality"""
        try:
            if avatar_id not in self.avatar_personalities:
                return {
                    'success': False,
                    'error': f'Unknown avatar: {avatar_id}',
                    'available_avatars': list(self.avatar_personalities.keys())
                }
            
            avatar_config = self.avatar_personalities[avatar_id]
            
            # Create chat instance with avatar personality
            session_id = f"avatar_{avatar_id}_{uuid.uuid4().hex[:8]}"
            chat = LlmChat(
                api_key=self.current_config['api_key'],
                session_id=session_id,
                system_message=avatar_config['personality']
            ).with_model(avatar_config['provider'], avatar_config['model'])
            
            review_prompt = f"""Review this {language} code with your expertise:

```{language}
{code}
```

Context: {context}

Provide a comprehensive code review including:
1. Overall assessment
2. Specific improvements needed
3. Architecture recommendations
4. Performance considerations
5. Security implications
6. Your signature perspective

Stay in character as your historical persona."""
            
            # Get review
            response = await chat.send_message(UserMessage(text=review_prompt))
            
            # Save review
            review_record = {
                'review_id': str(uuid.uuid4()),
                'avatar_id': avatar_id,
                'code': code,
                'language': language,
                'context': context,
                'review': response,
                'provider': avatar_config['provider'],
                'model': avatar_config['model'],
                'timestamp': datetime.utcnow()
            }
            
            await self.db.avatar_reviews.insert_one(review_record)
            
            return {
                'success': True,
                'avatar_id': avatar_id,
                'review': response,
                'review_id': review_record['review_id'],
                'provider': avatar_config['provider'],
                'model': avatar_config['model']
            }
            
        except Exception as e:
            logger.error(f"Avatar code review failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def ai_code_generation(self, description: str, language: str, context: str = "", session_id: str = None) -> Dict[str, Any]:
        """Generate code from natural language description"""
        try:
            if not session_id:
                session_id = f"codegen_{uuid.uuid4().hex[:8]}"
            
            system_message = f"""You are an expert {language} developer. Generate clean, efficient, 
            well-documented code based on natural language descriptions. Always:
            1. Write production-ready code
            2. Include proper error handling
            3. Follow language best practices
            4. Add meaningful comments
            5. Provide usage examples"""
            
            user_message = f"""Generate {language} code for:

DESCRIPTION: {description}
CONTEXT: {context}

Requirements:
- Clean, readable code
- Proper error handling
- Best practices compliance
- Comprehensive comments
- Usage examples

Return the code with explanations."""
            
            # Get chat instance
            chat = await self.get_chat_instance(session_id, system_message)
            
            # Generate code
            response = await chat.send_message(UserMessage(text=user_message))
            
            # Extract code from response
            code_match = re.search(r'```(?:\w+\n)?(.*?)```', response, re.DOTALL)
            generated_code = code_match.group(1).strip() if code_match else response
            
            # Save generation
            generation_record = {
                'generation_id': str(uuid.uuid4()),
                'session_id': session_id,
                'description': description,
                'language': language,
                'context': context,
                'generated_code': generated_code,
                'full_response': response,
                'provider': self.current_config['provider'],
                'model': self.current_config['model'],
                'timestamp': datetime.utcnow()
            }
            
            await self.db.ai_generations.insert_one(generation_record)
            
            return {
                'success': True,
                'generated_code': generated_code,
                'full_response': response,
                'generation_id': generation_record['generation_id'],
                'provider': self.current_config['provider'],
                'model': self.current_config['model']
            }
            
        except Exception as e:
            logger.error(f"AI code generation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def ai_code_analysis(self, code: str, language: str, analysis_type: str = "full", session_id: str = None) -> Dict[str, Any]:
        """Comprehensive AI-powered code analysis"""
        try:
            if not session_id:
                session_id = f"analysis_{uuid.uuid4().hex[:8]}"
            
            analysis_prompts = {
                'security': f"Analyze this {language} code for security vulnerabilities and provide detailed security recommendations",
                'performance': f"Analyze this {language} code for performance bottlenecks and optimization opportunities",
                'quality': f"Analyze this {language} code quality, maintainability, and adherence to best practices",
                'bugs': f"Find potential bugs, logical errors, and edge cases in this {language} code",
                'full': f"Provide comprehensive analysis of this {language} code covering security, performance, quality, and potential issues"
            }
            
            system_message = f"""You are an expert {language} code analyst with deep knowledge of:
            - Security best practices and vulnerability detection
            - Performance optimization techniques
            - Code quality and maintainability principles
            - Common bug patterns and edge cases
            
            Provide structured, actionable analysis with severity levels."""
            
            user_message = f"""{analysis_prompts.get(analysis_type, analysis_prompts['full'])}

```{language}
{code}
```

Provide detailed analysis with:
1. Issues found (with severity: Critical/High/Medium/Low)
2. Specific recommendations
3. Code examples for fixes
4. Best practices suggestions
5. Overall quality score (1-10)

Format as structured analysis with clear sections."""
            
            # Get chat instance
            chat = await self.get_chat_instance(session_id, system_message)
            
            # Analyze code
            response = await chat.send_message(UserMessage(text=user_message))
            
            # Save analysis
            analysis_record = {
                'analysis_id': str(uuid.uuid4()),
                'session_id': session_id,
                'code': code,
                'language': language,
                'analysis_type': analysis_type,
                'analysis': response,
                'provider': self.current_config['provider'],
                'model': self.current_config['model'],
                'timestamp': datetime.utcnow()
            }
            
            await self.db.ai_analyses.insert_one(analysis_record)
            
            return {
                'success': True,
                'analysis': response,
                'analysis_id': analysis_record['analysis_id'],
                'analysis_type': analysis_type,
                'provider': self.current_config['provider'],
                'model': self.current_config['model']
            }
            
        except Exception as e:
            logger.error(f"AI code analysis failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def ai_pair_programming(self, code_context: str, user_message: str, language: str, session_id: str) -> Dict[str, Any]:
        """AI pair programming assistant"""
        try:
            system_message = f"""You are an expert {language} pair programming partner. 
            You help developers by:
            1. Suggesting improvements to code
            2. Explaining complex concepts
            3. Debugging issues together
            4. Providing alternative approaches
            5. Teaching best practices
            
            Be collaborative, encouraging, and educational."""
            
            pair_message = f"""Current code context:
```{language}
{code_context}
```

Developer message: {user_message}

Please provide helpful pair programming assistance."""
            
            # Get chat instance
            chat = await self.get_chat_instance(session_id, system_message)
            
            # Get response
            response = await chat.send_message(UserMessage(text=pair_message))
            
            # Save session
            session_record = {
                'session_id': session_id,
                'code_context': code_context,
                'user_message': user_message,
                'ai_response': response,
                'language': language,
                'provider': self.current_config['provider'],
                'model': self.current_config['model'],
                'timestamp': datetime.utcnow()
            }
            
            await self.db.pair_programming_sessions.insert_one(session_record)
            
            return {
                'success': True,
                'response': response,
                'session_id': session_id,
                'provider': self.current_config['provider'],
                'model': self.current_config['model']
            }
            
        except Exception as e:
            logger.error(f"AI pair programming failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def ai_voice_to_code(self, voice_command: str, current_context: str, language: str, session_id: str) -> Dict[str, Any]:
        """Convert voice commands to code"""
        try:
            system_message = f"""You are an expert voice-to-code converter for {language}. 
            Convert natural language voice commands into executable code.
            
            Common patterns:
            - "create function" -> function definition
            - "add loop" -> loop structure
            - "make variable" -> variable declaration
            - "import library" -> import statement
            - "log message" -> console/print statement
            - "if condition" -> conditional statement"""
            
            voice_message = f"""Convert this voice command to {language} code:

Voice Command: "{voice_command}"
Current Context: {current_context}

Generate clean, executable code that fulfills the voice command."""
            
            # Get chat instance
            chat = await self.get_chat_instance(session_id, system_message)
            
            # Convert voice to code
            response = await chat.send_message(UserMessage(text=voice_message))
            
            # Extract code
            code_match = re.search(r'```(?:\w+\n)?(.*?)```', response, re.DOTALL)
            generated_code = code_match.group(1).strip() if code_match else response
            
            # Save conversion
            voice_record = {
                'voice_id': str(uuid.uuid4()),
                'session_id': session_id,
                'voice_command': voice_command,
                'current_context': current_context,
                'generated_code': generated_code,
                'full_response': response,
                'language': language,
                'provider': self.current_config['provider'],
                'model': self.current_config['model'],
                'timestamp': datetime.utcnow()
            }
            
            await self.db.voice_to_code.insert_one(voice_record)
            
            return {
                'success': True,
                'generated_code': generated_code,
                'full_response': response,
                'voice_id': voice_record['voice_id'],
                'provider': self.current_config['provider'],
                'model': self.current_config['model']
            }
            
        except Exception as e:
            logger.error(f"Voice to code conversion failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_available_models(self) -> Dict[str, Any]:
        """Get available AI models and providers"""
        return {
            'success': True,
            'providers': self.ai_providers,
            'current_config': self.current_config,
            'available_avatars': list(self.avatar_personalities.keys())
        }

    async def get_ai_usage_stats(self, user_id: str = None) -> Dict[str, Any]:
        """Get AI usage statistics"""
        try:
            stats = {
                'total_completions': await self.db.ai_completions.count_documents({}),
                'total_reviews': await self.db.avatar_reviews.count_documents({}),
                'total_generations': await self.db.ai_generations.count_documents({}),
                'total_analyses': await self.db.ai_analyses.count_documents({}),
                'total_pair_sessions': await self.db.pair_programming_sessions.count_documents({}),
                'total_voice_commands': await self.db.voice_to_code.count_documents({})
            }
            
            if user_id:
                # Add user-specific stats
                stats['user_completions'] = await self.db.ai_completions.count_documents({'user_id': user_id})
                stats['user_reviews'] = await self.db.avatar_reviews.count_documents({'user_id': user_id})
                stats['user_generations'] = await self.db.ai_generations.count_documents({'user_id': user_id})
            
            return {
                'success': True,
                'stats': stats,
                'current_provider': self.current_config['provider'],
                'current_model': self.current_config['model']
            }
            
        except Exception as e:
            logger.error(f"Failed to get AI usage stats: {e}")
            return {
                'success': False,
                'error': str(e)
            }

# Global service instance
_enhanced_ai_service_v2 = None

def init_enhanced_ai_service_v2(db_manager):
    """Initialize Enhanced AI Service V2"""
    global _enhanced_ai_service_v2
    _enhanced_ai_service_v2 = EnhancedAIServiceV2(db_manager)
    logger.info("🚀 Enhanced AI Service V2 initialized!")

def get_enhanced_ai_service_v2() -> Optional[EnhancedAIServiceV2]:
    """Get Enhanced AI Service V2 instance"""
    return _enhanced_ai_service_v2