# UPDATED: Now using Groq AI Service for ultra-fast responses
# This file has been updated to use Groq instead of Ollama

from .groq_ai_service import GroqAIService

# For backward compatibility, we alias GroqAIService as AIService
AIService = GroqAIService

# The main AI service is now Groq-powered
# All existing imports of AIService will now use Groq automatically