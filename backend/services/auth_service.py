"""
Authentication Service - Complete User Management System
Provides secure user authentication, authorization, and profile management
"""

import asyncio
import hashlib
import hmac
import jwt
import secrets
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from email_validator import validate_email, EmailNotValidError
import uuid

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """
    Comprehensive authentication and user management service
    """
    
    def __init__(self, db_manager, jwt_secret: str = None, jwt_algorithm: str = "HS256"):
        self.db_manager = db_manager
        self.db = db_manager.db
        self.jwt_secret = jwt_secret or secrets.token_urlsafe(32)
        self.jwt_algorithm = jwt_algorithm
        self.token_expiry = timedelta(hours=24)
        self.refresh_token_expiry = timedelta(days=30)
        
        # Session management
        self.active_sessions: Dict[str, Dict] = {}
        self.failed_login_attempts: Dict[str, List[datetime]] = {}
        
        logger.info("🔐 Authentication Service initialized")

    async def register_user(self, email: str, password: str, username: str, full_name: str = "") -> Dict[str, Any]:
        """Register a new user with validation"""
        try:
            # Validate email format
            try:
                valid_email = validate_email(email)
                email = valid_email.email
            except EmailNotValidError as e:
                return {
                    'success': False,
                    'error': f'Invalid email format: {str(e)}'
                }
            
            # Validate password strength
            password_validation = self._validate_password_strength(password)
            if not password_validation['valid']:
                return {
                    'success': False,
                    'error': password_validation['message']
                }
            
            # Check if user already exists
            existing_user = await self.db.users.find_one({
                "$or": [
                    {"email": email},
                    {"username": username}
                ]
            })
            
            if existing_user:
                field = "email" if existing_user.get('email') == email else "username"
                return {
                    'success': False,
                    'error': f'User with this {field} already exists'
                }
            
            # Hash password
            password_hash = pwd_context.hash(password)
            
            # Create user document
            user_id = str(uuid.uuid4())
            user_doc = {
                'user_id': user_id,
                'email': email,
                'username': username,
                'full_name': full_name,
                'password_hash': password_hash,
                'avatar_url': '',
                'role': 'user',
                'status': 'active',
                'email_verified': False,
                'created_at': datetime.utcnow(),
                'last_login': None,
                'preferences': {
                    'theme': 'dark',
                    'language': 'en',
                    'notifications': {
                        'email': True,
                        'push': True,
                        'collaboration': True
                    },
                    'editor': {
                        'font_size': 14,
                        'tab_size': 2,
                        'word_wrap': True,
                        'auto_save': True
                    }
                },
                'profile': {
                    'bio': '',
                    'location': '',
                    'website': '',
                    'github_username': '',
                    'linkedin_profile': '',
                    'skills': [],
                    'experience_level': 'beginner'
                },
                'stats': {
                    'projects_created': 0,
                    'files_created': 0,
                    'lines_of_code': 0,
                    'collaboration_sessions': 0,
                    'vibe_tokens': 1000,  # Starting bonus
                    'karma_level': 'Novice'
                }
            }
            
            # Insert user
            await self.db.users.insert_one(user_doc)
            
            # Generate email verification token
            verification_token = self._generate_verification_token(email)
            await self.db.email_verifications.insert_one({
                'email': email,
                'token': verification_token,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(hours=24)
            })
            
            # Remove sensitive data from response
            user_doc.pop('password_hash', None)
            
            logger.info(f"New user registered: {username} ({email})")
            
            return {
                'success': True,
                'user': user_doc,
                'verification_token': verification_token,
                'message': f'User {username} registered successfully. Please verify your email.'
            }
            
        except Exception as e:
            logger.error(f"User registration failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def authenticate_user(self, email_or_username: str, password: str, remember_me: bool = False) -> Dict[str, Any]:
        """Authenticate user with email/username and password"""
        try:
            # Check rate limiting
            if self._is_rate_limited(email_or_username):
                return {
                    'success': False,
                    'error': 'Too many failed login attempts. Please try again later.'
                }
            
            # Find user by email or username
            user = await self.db.users.find_one({
                "$or": [
                    {"email": email_or_username},
                    {"username": email_or_username}
                ]
            })
            
            if not user:
                self._record_failed_attempt(email_or_username)
                return {
                    'success': False,
                    'error': 'Invalid credentials'
                }
            
            # Verify password
            if not pwd_context.verify(password, user['password_hash']):
                self._record_failed_attempt(email_or_username)
                return {
                    'success': False,
                    'error': 'Invalid credentials'
                }
            
            # Check user status
            if user.get('status') != 'active':
                return {
                    'success': False,
                    'error': 'Account is deactivated. Please contact support.'
                }
            
            # Clear failed attempts
            self.failed_login_attempts.pop(email_or_username, None)
            
            # Generate JWT tokens
            access_token = self._generate_access_token(user)
            refresh_token = self._generate_refresh_token(user)
            
            # Update last login
            await self.db.users.update_one(
                {'user_id': user['user_id']},
                {
                    '$set': {'last_login': datetime.utcnow()},
                    '$inc': {'stats.login_count': 1}
                }
            )
            
            # Create session
            session_id = str(uuid.uuid4())
            session_data = {
                'session_id': session_id,
                'user_id': user['user_id'],
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + (self.refresh_token_expiry if remember_me else self.token_expiry),
                'refresh_token': refresh_token,
                'active': True
            }
            
            await self.db.user_sessions.insert_one(session_data)
            self.active_sessions[session_id] = session_data
            
            # Remove sensitive data
            user.pop('password_hash', None)
            
            logger.info(f"User authenticated: {user['username']}")
            
            return {
                'success': True,
                'user': user,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'session_id': session_id,
                'expires_in': int(self.token_expiry.total_seconds()),
                'message': f'Welcome back, {user["username"]}!'
            }
            
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token and return user data"""
        try:
            # Decode JWT token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            
            user_id = payload.get('user_id')
            if not user_id:
                return {
                    'success': False,
                    'error': 'Invalid token payload'
                }
            
            # Get user from database
            user = await self.db.users.find_one({'user_id': user_id})
            if not user:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            # Check user status
            if user.get('status') != 'active':
                return {
                    'success': False,
                    'error': 'Account deactivated'
                }
            
            # Remove sensitive data
            user.pop('password_hash', None)
            
            return {
                'success': True,
                'user': user,
                'token_data': payload
            }
            
        except jwt.ExpiredSignatureError:
            return {
                'success': False,
                'error': 'Token has expired'
            }
        except jwt.InvalidTokenError:
            return {
                'success': False,
                'error': 'Invalid token'
            }
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Generate new access token using refresh token"""
        try:
            # Verify refresh token
            payload = jwt.decode(refresh_token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            
            if payload.get('type') != 'refresh':
                return {
                    'success': False,
                    'error': 'Invalid refresh token'
                }
            
            user_id = payload.get('user_id')
            session = await self.db.user_sessions.find_one({
                'user_id': user_id,
                'refresh_token': refresh_token,
                'active': True
            })
            
            if not session:
                return {
                    'success': False,
                    'error': 'Session not found or expired'
                }
            
            # Get user
            user = await self.db.users.find_one({'user_id': user_id})
            if not user or user.get('status') != 'active':
                return {
                    'success': False,
                    'error': 'User not found or deactivated'
                }
            
            # Generate new access token
            access_token = self._generate_access_token(user)
            
            return {
                'success': True,
                'access_token': access_token,
                'expires_in': int(self.token_expiry.total_seconds())
            }
            
        except jwt.ExpiredSignatureError:
            return {
                'success': False,
                'error': 'Refresh token has expired'
            }
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def logout_user(self, session_id: str) -> Dict[str, Any]:
        """Logout user and invalidate session"""
        try:
            # Find and deactivate session
            session = await self.db.user_sessions.find_one({'session_id': session_id})
            if session:
                await self.db.user_sessions.update_one(
                    {'session_id': session_id},
                    {'$set': {'active': False, 'logged_out_at': datetime.utcnow()}}
                )
                
                # Remove from active sessions
                self.active_sessions.pop(session_id, None)
                
                logger.info(f"User logged out: session {session_id}")
            
            return {
                'success': True,
                'message': 'Logged out successfully'
            }
            
        except Exception as e:
            logger.error(f"Logout failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile information"""
        try:
            # Validate allowed fields
            allowed_fields = ['full_name', 'bio', 'location', 'website', 'github_username', 'linkedin_profile', 'skills', 'experience_level', 'avatar_url']
            
            update_data = {}
            for field, value in profile_data.items():
                if field in allowed_fields:
                    if field in ['bio', 'location', 'website', 'github_username', 'linkedin_profile']:
                        update_data[f'profile.{field}'] = value
                    else:
                        update_data[field] = value
            
            if not update_data:
                return {
                    'success': False,
                    'error': 'No valid fields to update'
                }
            
            # Update user document
            update_data['updated_at'] = datetime.utcnow()
            
            result = await self.db.users.update_one(
                {'user_id': user_id},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            # Get updated user
            user = await self.db.users.find_one({'user_id': user_id})
            user.pop('password_hash', None)
            
            return {
                'success': True,
                'user': user,
                'message': 'Profile updated successfully'
            }
            
        except Exception as e:
            logger.error(f"Profile update failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Update user preferences"""
        try:
            # Validate preference structure
            allowed_preferences = {
                'theme': ['light', 'dark', 'auto'],
                'language': str,
                'notifications': dict,
                'editor': dict
            }
            
            update_data = {}
            for pref, value in preferences.items():
                if pref in allowed_preferences:
                    if pref == 'theme' and value not in allowed_preferences[pref]:
                        continue
                    update_data[f'preferences.{pref}'] = value
            
            if not update_data:
                return {
                    'success': False,
                    'error': 'No valid preferences to update'
                }
            
            # Update preferences
            result = await self.db.users.update_one(
                {'user_id': user_id},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            return {
                'success': True,
                'message': 'Preferences updated successfully'
            }
            
        except Exception as e:
            logger.error(f"Preferences update failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def verify_email(self, email: str, token: str) -> Dict[str, Any]:
        """Verify user email with token"""
        try:
            # Find verification record
            verification = await self.db.email_verifications.find_one({
                'email': email,
                'token': token
            })
            
            if not verification:
                return {
                    'success': False,
                    'error': 'Invalid verification token'
                }
            
            # Check if token is expired
            if verification['expires_at'] < datetime.utcnow():
                return {
                    'success': False,
                    'error': 'Verification token has expired'
                }
            
            # Update user email verification status
            result = await self.db.users.update_one(
                {'email': email},
                {'$set': {'email_verified': True}}
            )
            
            if result.matched_count == 0:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            # Remove verification record
            await self.db.email_verifications.delete_one({'_id': verification['_id']})
            
            return {
                'success': True,
                'message': 'Email verified successfully'
            }
            
        except Exception as e:
            logger.error(f"Email verification failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        if len(password) < 8:
            return {'valid': False, 'message': 'Password must be at least 8 characters long'}
        
        if not any(c.isupper() for c in password):
            return {'valid': False, 'message': 'Password must contain at least one uppercase letter'}
        
        if not any(c.islower() for c in password):
            return {'valid': False, 'message': 'Password must contain at least one lowercase letter'}
        
        if not any(c.isdigit() for c in password):
            return {'valid': False, 'message': 'Password must contain at least one number'}
        
        return {'valid': True, 'message': 'Password is strong'}

    def _generate_access_token(self, user: Dict) -> str:
        """Generate JWT access token"""
        payload = {
            'user_id': user['user_id'],
            'username': user['username'],
            'email': user['email'],
            'role': user.get('role', 'user'),
            'type': 'access',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + self.token_expiry
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)

    def _generate_refresh_token(self, user: Dict) -> str:
        """Generate JWT refresh token"""
        payload = {
            'user_id': user['user_id'],
            'type': 'refresh',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + self.refresh_token_expiry
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)

    def _generate_verification_token(self, email: str) -> str:
        """Generate email verification token"""
        return secrets.token_urlsafe(32)

    def _is_rate_limited(self, identifier: str) -> bool:
        """Check if user is rate limited due to failed attempts"""
        if identifier not in self.failed_login_attempts:
            return False
        
        # Clean old attempts (older than 15 minutes)
        cutoff_time = datetime.utcnow() - timedelta(minutes=15)
        self.failed_login_attempts[identifier] = [
            attempt for attempt in self.failed_login_attempts[identifier]
            if attempt > cutoff_time
        ]
        
        # Check if too many recent attempts (5 attempts in 15 minutes)
        return len(self.failed_login_attempts[identifier]) >= 5

    def _record_failed_attempt(self, identifier: str):
        """Record failed login attempt"""
        if identifier not in self.failed_login_attempts:
            self.failed_login_attempts[identifier] = []
        
        self.failed_login_attempts[identifier].append(datetime.utcnow())

# Global auth service instance
_auth_service = None

def init_auth_service(db_manager, jwt_secret: str = None):
    """Initialize the authentication service"""
    global _auth_service
    _auth_service = AuthService(db_manager, jwt_secret)
    logger.info("🔐 Authentication Service initialized!")

def get_auth_service() -> Optional[AuthService]:
    """Get the authentication service instance"""
    return _auth_service