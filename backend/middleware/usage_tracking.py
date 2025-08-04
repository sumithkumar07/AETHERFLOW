from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Callable, Dict, Any, Optional
import logging
import json
from datetime import datetime

from models.user import User
from routes.auth import get_current_user
from services.subscription_service import get_subscription_service
from services.usage_tracking_service import get_usage_tracking_service

logger = logging.getLogger(__name__)
security = HTTPBearer()

class UsageTrackingMiddleware:
    def __init__(self):
        self.subscription_service = None
        self.usage_service = None
    
    async def initialize(self):
        """Initialize the middleware"""
        self.subscription_service = await get_subscription_service()
        self.usage_service = await get_usage_tracking_service()
    
    async def track_ai_request(self, user_id: str, tokens_used: int, model_name: str, 
                              operation_type: str = "chat", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Track AI usage and enforce limits"""
        try:
            if not self.usage_service:
                await self.initialize()
            
            # Track usage and check limits
            result = await self.usage_service.track_ai_usage(
                user_id=user_id,
                tokens_used=tokens_used,
                model_name=model_name,
                operation_type=operation_type,
                metadata=metadata or {}
            )
            
            return result
        except Exception as e:
            logger.error(f"Usage tracking failed: {e}")
            return {"success": True, "warning": "Usage tracking temporarily unavailable"}
    
    async def check_api_limits(self, user_id: str, endpoint: str) -> Dict[str, Any]:
        """Check API rate limits for user"""
        try:
            if not self.usage_service:
                await self.initialize()
            
            result = await self.usage_service.track_api_usage(
                user_id=user_id,
                endpoint=endpoint,
                method="POST"
            )
            
            return result
        except Exception as e:
            logger.error(f"API limit check failed: {e}")
            return {"success": True, "warning": "Rate limiting temporarily unavailable"}
    
    def create_usage_dependency(self, operation_type: str = "chat"):
        """Create a FastAPI dependency for usage tracking"""
        async def usage_dependency(
            request: Request,
            current_user: User = Depends(get_current_user)
        ):
            user_id = str(current_user.id)
            
            # Check API limits first
            api_check = await self.check_api_limits(user_id, str(request.url.path))
            if not api_check["success"]:
                raise HTTPException(
                    status_code=429, 
                    detail={
                        "error": "Rate limit exceeded",
                        "message": api_check.get("error", "API rate limit exceeded"),
                        "remaining": api_check.get("remaining", 0)
                    }
                )
            
            # Return user info and tracking functions
            return {
                "user": current_user,
                "user_id": user_id,
                "track_usage": lambda tokens, model, metadata=None: self.track_ai_request(
                    user_id, tokens, model, operation_type, metadata
                )
            }
        
        return usage_dependency

# Global instance
usage_middleware = UsageTrackingMiddleware()

def get_usage_middleware() -> UsageTrackingMiddleware:
    """Get usage middleware instance"""
    return usage_middleware

# Common dependencies
async def get_chat_usage_dependency(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Dependency for AI chat endpoints"""
    return await usage_middleware.create_usage_dependency("chat")(request, current_user)

async def get_code_usage_dependency(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Dependency for code generation endpoints"""
    return await usage_middleware.create_usage_dependency("code_generation")(request, current_user)

async def get_analysis_usage_dependency(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Dependency for analysis endpoints"""
    return await usage_middleware.create_usage_dependency("analysis")(request, current_user)

# Utility function to estimate tokens
def estimate_tokens(text: str) -> int:
    """Estimate token count for text (rough approximation)"""
    # Simple estimation: ~4 characters per token for most models
    return max(1, len(text) // 4)

def estimate_response_tokens(response: str, model_name: str) -> int:
    """Estimate tokens used in response"""
    base_tokens = estimate_tokens(response)
    
    # Add model-specific overhead
    model_overhead = {
        "llama-3.1-8b-instant": 1.1,
        "llama-3.1-70b-versatile": 1.2,
        "mixtral-8x7b-32768": 1.15,
        "llama-3.2-3b-preview": 1.05
    }
    
    multiplier = model_overhead.get(model_name, 1.1)
    return int(base_tokens * multiplier)