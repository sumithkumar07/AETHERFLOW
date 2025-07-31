from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
import time
import hashlib
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    """Comprehensive security middleware for the application"""
    
    def __init__(self):
        self.jwt_secret = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
        self.jwt_algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
        self.rate_limit_storage = {}  # In production, use Redis
        
    def generate_tokens(self, user_id: str, user_data: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        """Generate access and refresh tokens"""
        
        now = datetime.utcnow()
        
        # Access token (short-lived)
        access_payload = {
            "user_id": user_id,
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=self.access_token_expire_minutes)
        }
        
        if user_data:
            access_payload["user_data"] = user_data
            
        access_token = jwt.encode(access_payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        
        # Refresh token (long-lived)
        refresh_payload = {
            "user_id": user_id,
            "type": "refresh",
            "iat": now,
            "exp": now + timedelta(days=self.refresh_token_expire_days)
        }
        
        refresh_token = jwt.encode(refresh_payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": self.access_token_expire_minutes * 60
        }
    
    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify and decode JWT token"""
        
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            
            if payload.get("type") != token_type:
                raise HTTPException(status_code=401, detail="Invalid token type")
                
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, str]:
        """Generate new access token using refresh token"""
        
        payload = self.verify_token(refresh_token, "refresh")
        user_id = payload["user_id"]
        
        return self.generate_tokens(user_id)
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        import bcrypt
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def check_rate_limit(self, request: Request, limit: int = 100, window: int = 3600) -> bool:
        """Check if request is within rate limits"""
        
        # Get client identifier
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "unknown")
        client_id = hashlib.md5(f"{client_ip}:{user_agent}".encode()).hexdigest()
        
        current_time = int(time.time())
        window_start = current_time - (current_time % window)
        
        key = f"{client_id}:{window_start}"
        
        if key not in self.rate_limit_storage:
            self.rate_limit_storage[key] = 0
            
        self.rate_limit_storage[key] += 1
        
        # Clean up old entries
        self._cleanup_rate_limit_storage(current_time, window)
        
        return self.rate_limit_storage[key] <= limit
    
    def _cleanup_rate_limit_storage(self, current_time: int, window: int):
        """Clean up expired rate limit entries"""
        
        cutoff_time = current_time - window
        keys_to_remove = []
        
        for key in self.rate_limit_storage:
            try:
                window_start = int(key.split(':')[1])
                if window_start < cutoff_time:
                    keys_to_remove.append(key)
            except (IndexError, ValueError):
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.rate_limit_storage[key]
    
    def validate_request_size(self, request: Request, max_size: int = 10 * 1024 * 1024) -> bool:
        """Validate request content length"""
        
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
                return size <= max_size
            except ValueError:
                return False
        return True
    
    def add_security_headers(self, response):
        """Add security headers to response"""
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

class AuthenticationBearer(HTTPBearer):
    """Custom JWT authentication handler"""
    
    def __init__(self, auto_error: bool = True):
        super(AuthenticationBearer, self).__init__(auto_error=auto_error)
        self.security = SecurityMiddleware()

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(AuthenticationBearer, self).__call__(request)
        
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=401, detail="Invalid authentication scheme")
            
            payload = self.security.verify_token(credentials.credentials)
            return payload
        else:
            raise HTTPException(status_code=401, detail="Invalid authorization code")

# Global security instance
security = SecurityMiddleware()
auth_bearer = AuthenticationBearer()