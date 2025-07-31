from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback
from datetime import datetime
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Centralized error handling and logging system"""
    
    @staticmethod
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions with consistent formatting"""
        
        error_response = {
            "error": {
                "type": "http_error",
                "code": exc.status_code,
                "message": exc.detail,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path)
            }
        }
        
        # Log error for monitoring
        logger.error(f"HTTP {exc.status_code}: {exc.detail} - Path: {request.url.path}")
        
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response
        )
    
    @staticmethod
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle request validation errors"""
        
        validation_errors = []
        for error in exc.errors():
            validation_errors.append({
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })
        
        error_response = {
            "error": {
                "type": "validation_error",
                "code": 422,
                "message": "Request validation failed",
                "details": validation_errors,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path)
            }
        }
        
        logger.warning(f"Validation error: {validation_errors} - Path: {request.url.path}")
        
        return JSONResponse(
            status_code=422,
            content=error_response
        )
    
    @staticmethod
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions"""
        
        error_id = f"err_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
        
        error_response = {
            "error": {
                "type": "internal_error",
                "code": 500,
                "message": "An internal server error occurred",
                "error_id": error_id,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path)
            }
        }
        
        # Log detailed error information
        logger.error(f"Internal error {error_id}: {str(exc)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return JSONResponse(
            status_code=500,
            content=error_response
        )
    
    @staticmethod
    def create_error_response(
        status_code: int,
        message: str,
        error_type: str = "api_error",
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a standardized error response"""
        
        error_response = {
            "error": {
                "type": error_type,
                "code": status_code,
                "message": message,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        if details:
            error_response["error"]["details"] = details
            
        return error_response

class BusinessLogicError(Exception):
    """Custom exception for business logic errors"""
    
    def __init__(self, message: str, status_code: int = 400, error_type: str = "business_error"):
        self.message = message
        self.status_code = status_code
        self.error_type = error_type
        super().__init__(self.message)

class AuthenticationError(Exception):
    """Custom exception for authentication errors"""
    
    def __init__(self, message: str = "Authentication failed"):
        self.message = message
        self.status_code = 401
        self.error_type = "authentication_error"
        super().__init__(self.message)

class AuthorizationError(Exception):
    """Custom exception for authorization errors"""
    
    def __init__(self, message: str = "Access denied"):
        self.message = message
        self.status_code = 403
        self.error_type = "authorization_error"
        super().__init__(self.message)

class ValidationError(Exception):
    """Custom exception for data validation errors"""
    
    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field
        self.status_code = 422
        self.error_type = "validation_error"
        super().__init__(self.message)

class ResourceNotFoundError(Exception):
    """Custom exception for resource not found errors"""
    
    def __init__(self, resource_type: str, resource_id: str):
        self.message = f"{resource_type} with ID '{resource_id}' not found"
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.status_code = 404
        self.error_type = "resource_not_found"
        super().__init__(self.message)

class RateLimitError(Exception):
    """Custom exception for rate limiting errors"""
    
    def __init__(self, message: str = "Rate limit exceeded"):
        self.message = message
        self.status_code = 429
        self.error_type = "rate_limit_error"
        super().__init__(self.message)

# Error handler instance
error_handler = ErrorHandler()