"""
🔐 AETHERFLOW Authentication Routes
Enhanced authentication system with social login support
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
import os
import logging
import httpx
import jwt
from datetime import datetime, timedelta
import hashlib
import secrets
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create router
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# Models
class SocialAuthRequest(BaseModel):
    provider: str = Field(..., regex="^(google|github|microsoft)$")
    user: Dict[str, Any]
    timestamp: datetime

class TokenExchangeRequest(BaseModel):
    code: str
    state: str

class AuthResponse(BaseModel):
    token: str
    user: Dict[str, Any]
    expires_in: int
    refresh_token: Optional[str] = None

class UserModel(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    provider: str
    provider_id: str
    created_at: datetime
    last_login: datetime
    verified: bool = False

# Configuration
class AuthConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'vibecode-secret-change-in-production')
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 30
    
    # Social auth configurations
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')
    MICROSOFT_CLIENT_ID = os.environ.get('MICROSOFT_CLIENT_ID')
    MICROSOFT_CLIENT_SECRET = os.environ.get('MICROSOFT_CLIENT_SECRET')

config = AuthConfig()

# Database dependency
async def get_database():
    # This would be injected by the main app
    pass

# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: str):
    """Create refresh token"""
    data = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(data, config.SECRET_KEY, algorithm=config.ALGORITHM)

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(32)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}:{hashed.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    try:
        salt, stored_hash = hashed.split(':')
        computed_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return computed_hash.hex() == stored_hash
    except:
        return False

# Social authentication endpoints
@router.post("/social")
@limiter.limit("10/minute")
async def social_authentication(
    request: Request,
    auth_request: SocialAuthRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handle social authentication from any provider"""
    try:
        provider = auth_request.provider
        user_data = auth_request.user
        
        logger.info(f"Social authentication attempt: {provider} - {user_data.get('email')}")
        
        # Validate provider
        if provider not in ['google', 'github', 'microsoft']:
            raise HTTPException(status_code=400, detail="Unsupported provider")
        
        # Check if user exists
        existing_user = await db.users.find_one({
            "$or": [
                {"email": user_data.get('email')},
                {"provider_id": user_data.get('providerId'), "provider": provider}
            ]
        })
        
        if existing_user:
            # Update existing user
            await db.users.update_one(
                {"_id": existing_user["_id"]},
                {
                    "$set": {
                        "last_login": datetime.utcnow(),
                        "name": user_data.get('name', existing_user.get('name')),
                        "avatar": user_data.get('avatar', existing_user.get('avatar'))
                    }
                }
            )
            user_id = existing_user["id"]
        else:
            # Create new user
            user_id = secrets.token_urlsafe(32)
            new_user = {
                "id": user_id,
                "email": user_data.get('email'),
                "name": user_data.get('name'),
                "avatar": user_data.get('avatar'),
                "provider": provider,
                "provider_id": user_data.get('providerId'),
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "verified": user_data.get('verified', False),
                "settings": {
                    "theme": "dark",
                    "notifications": True,
                    "language": "en"
                }
            }
            
            await db.users.insert_one(new_user)
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": user_id, "email": user_data.get('email')}
        )
        refresh_token = create_refresh_token(user_id)
        
        # Store refresh token
        await db.refresh_tokens.insert_one({
            "user_id": user_id,
            "token": refresh_token,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
        })
        
        # Get user for response
        user = await db.users.find_one({"id": user_id})
        
        response_user = {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "avatar": user.get("avatar"),
            "provider": user["provider"],
            "verified": user.get("verified", False)
        }
        
        logger.info(f"Social authentication successful: {provider} - {user_data.get('email')}")
        
        return AuthResponse(
            token=access_token,
            user=response_user,
            expires_in=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_token=refresh_token
        )
    
    except Exception as e:
        logger.error(f"Social authentication failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")

# OAuth token exchange endpoints
@router.post("/oauth/github/token")
@limiter.limit("5/minute")
async def github_token_exchange(
    request: Request,
    token_request: TokenExchangeRequest
):
    """Exchange GitHub OAuth code for access token"""
    try:
        if not config.GITHUB_CLIENT_ID or not config.GITHUB_CLIENT_SECRET:
            raise HTTPException(status_code=503, detail="GitHub OAuth not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": config.GITHUB_CLIENT_ID,
                    "client_secret": config.GITHUB_CLIENT_SECRET,
                    "code": token_request.code,
                    "state": token_request.state
                },
                headers={
                    "Accept": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Token exchange failed")
            
            return response.json()
    
    except Exception as e:
        logger.error(f"GitHub token exchange failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Token exchange failed")

@router.post("/oauth/microsoft/token")
@limiter.limit("5/minute")
async def microsoft_token_exchange(
    request: Request,
    token_request: TokenExchangeRequest
):
    """Exchange Microsoft OAuth code for access token"""
    try:
        if not config.MICROSOFT_CLIENT_ID or not config.MICROSOFT_CLIENT_SECRET:
            raise HTTPException(status_code=503, detail="Microsoft OAuth not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                data={
                    "client_id": config.MICROSOFT_CLIENT_ID,
                    "client_secret": config.MICROSOFT_CLIENT_SECRET,
                    "code": token_request.code,
                    "grant_type": "authorization_code",
                    "redirect_uri": f"{request.base_url}auth"
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Token exchange failed")
            
            return response.json()
    
    except Exception as e:
        logger.error(f"Microsoft token exchange failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Token exchange failed")

# User info endpoints
@router.get("/oauth/github/user")
@limiter.limit("10/minute")
async def github_user_info(request: Request):
    """Get GitHub user information"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = auth_header.split(" ")[1]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch user info")
            
            return response.json()
    
    except Exception as e:
        logger.error(f"GitHub user info failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user info")

@router.get("/oauth/microsoft/user")
@limiter.limit("10/minute")
async def microsoft_user_info(request: Request):
    """Get Microsoft user information"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = auth_header.split(" ")[1]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/me",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch user info")
            
            return response.json()
    
    except Exception as e:
        logger.error(f"Microsoft user info failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user info")

# Token refresh endpoint
@router.post("/refresh")
@limiter.limit("10/minute")
async def refresh_token(
    request: Request,
    refresh_token: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Refresh access token"""
    try:
        # Verify refresh token
        try:
            payload = jwt.decode(refresh_token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
            user_id = payload.get("sub")
            token_type = payload.get("type")
            
            if token_type != "refresh":
                raise HTTPException(status_code=401, detail="Invalid token type")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Check if refresh token exists in database
        stored_token = await db.refresh_tokens.find_one({
            "user_id": user_id,
            "token": refresh_token
        })
        
        if not stored_token:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        # Get user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Create new access token
        new_access_token = create_access_token(
            data={"sub": user_id, "email": user["email"]}
        )
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": config.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Token refresh failed")

# Logout endpoint
@router.post("/logout")
@limiter.limit("10/minute")
async def logout(
    request: Request,
    refresh_token: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Logout user and invalidate refresh token"""
    try:
        # Remove refresh token from database
        await db.refresh_tokens.delete_one({"token": refresh_token})
        
        return {"message": "Successfully logged out"}
    
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Logout failed")

# Health check for auth service
@router.get("/health")
@limiter.limit("100/minute")
async def auth_health_check(request: Request):
    """Health check for authentication service"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "providers": {
            "google": bool(config.GOOGLE_CLIENT_ID),
            "github": bool(config.GITHUB_CLIENT_ID),
            "microsoft": bool(config.MICROSOFT_CLIENT_ID)
        }
    }