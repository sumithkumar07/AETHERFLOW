import logging
from typing import Dict, Any, Optional
from .ai_service import AIService

logger = logging.getLogger(__name__)

class EnhancedAIService:
    """Enhanced AI service with advanced capabilities"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.initialized = False
    
    async def initialize(self):
        """Initialize enhanced AI service"""
        try:
            await self.ai_service.initialize()
            self.initialized = True
            logger.info("Enhanced AI Service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize enhanced AI service: {e}")
    
    async def process_message(self, content: str, context: Dict[str, Any] = None) -> str:
        """Process message with enhanced capabilities"""
        try:
            if not self.initialized:
                await self.initialize()
            
            # Use the base AI service for now
            result = await self.ai_service.process_message(content, context)
            
            # Return just the content string for compatibility
            if isinstance(result, dict):
                return result.get("content", "I'm here to help you build amazing applications!")
            
            return str(result)
            
        except Exception as e:
            logger.error(f"Enhanced AI service error: {e}")
            return "I'm experiencing some technical difficulties, but I'm here to help you build great applications!"