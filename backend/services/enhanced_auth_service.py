"""
Enhanced Authentication Service - Complete OAuth Integration
Using emergentintegrations auth system for seamless authentication
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid
import aiohttp
from .auth_service import AuthService

logger = logging.getLogger(__name__)

class EnhancedAuthService(AuthService):
    """
    Enhanced Authentication Service with OAuth and social login support
    """
    
    def __init__(self, db_manager, jwt_secret: str = None):
        super().__init__(db_manager, jwt_secret)
        
        # OAuth configurations
        self.oauth_providers = {
            'github': {
                'client_id': None,
                'client_secret': None,
                'redirect_uri': None,
                'scopes': ['user:email', 'read:user']
            },
            'google': {
                'client_id': None,
                'client_secret': None,
                'redirect_uri': None,
                'scopes': ['openid', 'profile', 'email']
            },
            'emergent': {
                'auth_url': 'https://auth.emergentagent.com/',
                'api_url': 'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
                'enabled': True
            }
        }
        
        # Team management
        self.team_roles = ['owner', 'admin', 'member', 'viewer']
        
        logger.info("🔐 Enhanced Authentication Service initialized with OAuth support")

    async def configure_oauth(self, provider: str, config: Dict[str, str]) -> Dict[str, Any]:
        """Configure OAuth provider"""
        try:
            if provider not in self.oauth_providers:
                return {
                    'success': False,
                    'error': f'Unsupported OAuth provider: {provider}',
                    'supported_providers': list(self.oauth_providers.keys())
                }
            
            # Update OAuth configuration
            self.oauth_providers[provider].update(config)
            
            return {
                'success': True,
                'provider': provider,
                'message': f'OAuth configuration updated for {provider}'
            }
            
        except Exception as e:
            logger.error(f"OAuth configuration failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_oauth_url(self, provider: str, state: str = None) -> Dict[str, Any]:
        """Get OAuth authorization URL"""
        try:
            if provider not in self.oauth_providers:
                return {
                    'success': False,
                    'error': f'Unsupported OAuth provider: {provider}'
                }
            
            if provider == 'emergent':
                # Emergent auth URL with redirect
                redirect_url = self.oauth_providers[provider]['auth_url']
                if state:
                    redirect_url += f'?redirect={state}'
                
                return {
                    'success': True,
                    'provider': provider,
                    'auth_url': redirect_url,
                    'message': f'Redirect to {provider} for authentication'
                }
            
            elif provider == 'github':
                config = self.oauth_providers[provider]
                auth_url = f"https://github.com/login/oauth/authorize"
                params = {
                    'client_id': config['client_id'],
                    'redirect_uri': config['redirect_uri'],
                    'scope': ' '.join(config['scopes']),
                    'state': state or str(uuid.uuid4())
                }
                
                param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
                full_url = f"{auth_url}?{param_string}"
                
                return {
                    'success': True,
                    'provider': provider,
                    'auth_url': full_url,
                    'state': params['state']
                }
            
            elif provider == 'google':
                config = self.oauth_providers[provider]
                auth_url = f"https://accounts.google.com/o/oauth2/v2/auth"
                params = {
                    'client_id': config['client_id'],
                    'redirect_uri': config['redirect_uri'],
                    'scope': ' '.join(config['scopes']),
                    'response_type': 'code',
                    'state': state or str(uuid.uuid4())
                }
                
                param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
                full_url = f"{auth_url}?{param_string}"
                
                return {
                    'success': True,
                    'provider': provider,
                    'auth_url': full_url,
                    'state': params['state']
                }
            
            return {
                'success': False,
                'error': f'OAuth not configured for {provider}'
            }
            
        except Exception as e:
            logger.error(f"OAuth URL generation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def handle_oauth_callback(self, provider: str, code: str = None, session_id: str = None) -> Dict[str, Any]:
        """Handle OAuth callback and create/login user"""
        try:
            if provider == 'emergent':
                return await self._handle_emergent_oauth(session_id)
            elif provider == 'github':
                return await self._handle_github_oauth(code)
            elif provider == 'google':
                return await self._handle_google_oauth(code)
            else:
                return {
                    'success': False,
                    'error': f'Unsupported OAuth provider: {provider}'
                }
                
        except Exception as e:
            logger.error(f"OAuth callback handling failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _handle_emergent_oauth(self, session_id: str) -> Dict[str, Any]:
        """Handle Emergent OAuth authentication"""
        try:
            if not session_id:
                return {
                    'success': False,
                    'error': 'Session ID is required for Emergent OAuth'
                }
            
            # Call Emergent API to get user data
            headers = {'X-Session-ID': session_id}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.oauth_providers['emergent']['api_url'],
                    headers=headers
                ) as response:
                    if response.status != 200:
                        return {
                            'success': False,
                            'error': f'Failed to get user data from Emergent: {response.status}'
                        }
                    
                    user_data = await response.json()
            
            # Extract user information
            email = user_data.get('email')
            name = user_data.get('name', '')
            picture = user_data.get('picture', '')
            session_token = user_data.get('session_token')
            
            if not email or not session_token:
                return {
                    'success': False,
                    'error': 'Invalid user data from Emergent'
                }
            
            # Check if user exists
            existing_user = await self.db.users.find_one({'email': email})
            
            if existing_user:
                # Update user information
                await self.db.users.update_one(
                    {'user_id': existing_user['user_id']},
                    {
                        '$set': {
                            'last_login': datetime.utcnow(),
                            'oauth_provider': 'emergent',
                            'oauth_session_token': session_token
                        },
                        '$inc': {'stats.login_count': 1}
                    }
                )
                
                user = existing_user
                
            else:
                # Create new user
                user_id = str(uuid.uuid4())
                username = email.split('@')[0]  # Use email prefix as username
                
                user = {
                    'user_id': user_id,
                    'email': email,
                    'username': username,
                    'full_name': name,
                    'avatar_url': picture,
                    'role': 'user',
                    'status': 'active',
                    'email_verified': True,  # OAuth users are pre-verified
                    'oauth_provider': 'emergent',
                    'oauth_session_token': session_token,
                    'created_at': datetime.utcnow(),
                    'last_login': datetime.utcnow(),
                    'preferences': {
                        'theme': 'dark',
                        'language': 'en',
                        'notifications': {
                            'email': True,
                            'push': True,
                            'collaboration': True
                        }
                    },
                    'stats': {
                        'projects_created': 0,
                        'files_created': 0,
                        'lines_of_code': 0,
                        'collaboration_sessions': 0,
                        'vibe_tokens': 1000,
                        'karma_level': 'Novice',
                        'login_count': 1
                    }
                }
                
                await self.db.users.insert_one(user)
            
            # Generate JWT tokens
            access_token = self._generate_access_token(user)
            refresh_token = self._generate_refresh_token(user)
            
            # Create session
            session_data = {
                'session_id': str(uuid.uuid4()),
                'user_id': user['user_id'],
                'oauth_provider': 'emergent',
                'oauth_session_token': session_token,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(days=7),
                'refresh_token': refresh_token,
                'active': True
            }
            
            await self.db.user_sessions.insert_one(session_data)
            
            # Remove sensitive data
            user.pop('password_hash', None)
            user.pop('oauth_session_token', None)
            
            return {
                'success': True,
                'user': user,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'session_id': session_data['session_id'],
                'provider': 'emergent',
                'message': f'Successfully authenticated with Emergent as {user["username"]}'
            }
            
        except Exception as e:
            logger.error(f"Emergent OAuth handling failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _handle_github_oauth(self, code: str) -> Dict[str, Any]:
        """Handle GitHub OAuth authentication"""
        try:
            config = self.oauth_providers['github']
            
            # Exchange code for access token
            token_url = 'https://github.com/login/oauth/access_token'
            token_data = {
                'client_id': config['client_id'],
                'client_secret': config['client_secret'],
                'code': code,
                'redirect_uri': config['redirect_uri']
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    token_url,
                    data=token_data,
                    headers={'Accept': 'application/json'}
                ) as response:
                    token_response = await response.json()
            
            access_token = token_response.get('access_token')
            if not access_token:
                return {
                    'success': False,
                    'error': 'Failed to get access token from GitHub'
                }
            
            # Get user information
            user_url = 'https://api.github.com/user'
            email_url = 'https://api.github.com/user/emails'
            
            async with aiohttp.ClientSession() as session:
                # Get user data
                async with session.get(
                    user_url,
                    headers={'Authorization': f'token {access_token}'}
                ) as response:
                    user_data = await response.json()
                
                # Get user emails
                async with session.get(
                    email_url,
                    headers={'Authorization': f'token {access_token}'}
                ) as response:
                    emails = await response.json()
            
            # Find primary email
            primary_email = None
            for email in emails:
                if email.get('primary'):
                    primary_email = email['email']
                    break
            
            if not primary_email:
                primary_email = user_data.get('email')
            
            if not primary_email:
                return {
                    'success': False,
                    'error': 'No email found in GitHub profile'
                }
            
            # Create or update user
            return await self._create_or_update_oauth_user(
                email=primary_email,
                username=user_data.get('login'),
                full_name=user_data.get('name', ''),
                avatar_url=user_data.get('avatar_url', ''),
                provider='github',
                provider_id=str(user_data.get('id'))
            )
            
        except Exception as e:
            logger.error(f"GitHub OAuth handling failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _handle_google_oauth(self, code: str) -> Dict[str, Any]:
        """Handle Google OAuth authentication"""
        try:
            config = self.oauth_providers['google']
            
            # Exchange code for access token
            token_url = 'https://oauth2.googleapis.com/token'
            token_data = {
                'client_id': config['client_id'],
                'client_secret': config['client_secret'],
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': config['redirect_uri']
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(token_url, data=token_data) as response:
                    token_response = await response.json()
            
            access_token = token_response.get('access_token')
            if not access_token:
                return {
                    'success': False,
                    'error': 'Failed to get access token from Google'
                }
            
            # Get user information
            user_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    user_url,
                    headers={'Authorization': f'Bearer {access_token}'}
                ) as response:
                    user_data = await response.json()
            
            # Create or update user
            return await self._create_or_update_oauth_user(
                email=user_data.get('email'),
                username=user_data.get('name', '').replace(' ', '_').lower(),
                full_name=user_data.get('name', ''),
                avatar_url=user_data.get('picture', ''),
                provider='google',
                provider_id=user_data.get('id')
            )
            
        except Exception as e:
            logger.error(f"Google OAuth handling failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _create_or_update_oauth_user(self, email: str, username: str, full_name: str, avatar_url: str, provider: str, provider_id: str) -> Dict[str, Any]:
        """Create or update OAuth user"""
        try:
            # Check if user exists
            existing_user = await self.db.users.find_one({'email': email})
            
            if existing_user:
                # Update existing user
                await self.db.users.update_one(
                    {'user_id': existing_user['user_id']},
                    {
                        '$set': {
                            'last_login': datetime.utcnow(),
                            'oauth_provider': provider,
                            'oauth_provider_id': provider_id,
                            'avatar_url': avatar_url,
                            'email_verified': True
                        },
                        '$inc': {'stats.login_count': 1}
                    }
                )
                
                user = existing_user
                
            else:
                # Create new user
                user_id = str(uuid.uuid4())
                
                # Ensure unique username
                base_username = username
                counter = 1
                while await self.db.users.find_one({'username': username}):
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = {
                    'user_id': user_id,
                    'email': email,
                    'username': username,
                    'full_name': full_name,
                    'avatar_url': avatar_url,
                    'role': 'user',
                    'status': 'active',
                    'email_verified': True,
                    'oauth_provider': provider,
                    'oauth_provider_id': provider_id,
                    'created_at': datetime.utcnow(),
                    'last_login': datetime.utcnow(),
                    'preferences': {
                        'theme': 'dark',
                        'language': 'en',
                        'notifications': {
                            'email': True,
                            'push': True,
                            'collaboration': True
                        }
                    },
                    'stats': {
                        'projects_created': 0,
                        'files_created': 0,
                        'lines_of_code': 0,
                        'collaboration_sessions': 0,
                        'vibe_tokens': 1000,
                        'karma_level': 'Novice',
                        'login_count': 1
                    }
                }
                
                await self.db.users.insert_one(user)
            
            # Generate JWT tokens
            access_token = self._generate_access_token(user)
            refresh_token = self._generate_refresh_token(user)
            
            # Create session
            session_data = {
                'session_id': str(uuid.uuid4()),
                'user_id': user['user_id'],
                'oauth_provider': provider,
                'oauth_provider_id': provider_id,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(days=7),
                'refresh_token': refresh_token,
                'active': True
            }
            
            await self.db.user_sessions.insert_one(session_data)
            
            # Remove sensitive data
            user.pop('password_hash', None)
            user.pop('oauth_provider_id', None)
            
            return {
                'success': True,
                'user': user,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'session_id': session_data['session_id'],
                'provider': provider,
                'message': f'Successfully authenticated with {provider} as {user["username"]}'
            }
            
        except Exception as e:
            logger.error(f"OAuth user creation/update failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def create_team(self, owner_id: str, name: str, description: str = "") -> Dict[str, Any]:
        """Create a new team"""
        try:
            team_id = str(uuid.uuid4())
            
            team_data = {
                'team_id': team_id,
                'name': name,
                'description': description,
                'owner_id': owner_id,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'members': [
                    {
                        'user_id': owner_id,
                        'role': 'owner',
                        'joined_at': datetime.utcnow(),
                        'permissions': ['*']  # All permissions
                    }
                ],
                'settings': {
                    'visibility': 'private',
                    'allow_public_join': False,
                    'default_member_role': 'member'
                },
                'stats': {
                    'total_members': 1,
                    'total_projects': 0,
                    'total_collaborations': 0
                }
            }
            
            await self.db.teams.insert_one(team_data)
            
            return {
                'success': True,
                'team': team_data,
                'message': f'Team "{name}" created successfully'
            }
            
        except Exception as e:
            logger.error(f"Team creation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def add_team_member(self, team_id: str, user_id: str, role: str = 'member', added_by: str = None) -> Dict[str, Any]:
        """Add member to team"""
        try:
            if role not in self.team_roles:
                return {
                    'success': False,
                    'error': f'Invalid role: {role}',
                    'valid_roles': self.team_roles
                }
            
            # Check if team exists
            team = await self.db.teams.find_one({'team_id': team_id})
            if not team:
                return {
                    'success': False,
                    'error': 'Team not found'
                }
            
            # Check if user is already a member
            existing_member = next((m for m in team['members'] if m['user_id'] == user_id), None)
            if existing_member:
                return {
                    'success': False,
                    'error': 'User is already a team member'
                }
            
            # Add member
            new_member = {
                'user_id': user_id,
                'role': role,
                'joined_at': datetime.utcnow(),
                'added_by': added_by,
                'permissions': self._get_role_permissions(role)
            }
            
            await self.db.teams.update_one(
                {'team_id': team_id},
                {
                    '$push': {'members': new_member},
                    '$inc': {'stats.total_members': 1},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            return {
                'success': True,
                'member': new_member,
                'message': f'User added to team as {role}'
            }
            
        except Exception as e:
            logger.error(f"Add team member failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _get_role_permissions(self, role: str) -> List[str]:
        """Get permissions for role"""
        permissions = {
            'owner': ['*'],
            'admin': ['manage_team', 'manage_projects', 'manage_members', 'view_analytics'],
            'member': ['create_projects', 'collaborate', 'view_team'],
            'viewer': ['view_team', 'view_projects']
        }
        
        return permissions.get(role, ['view_team'])

    async def get_user_teams(self, user_id: str) -> Dict[str, Any]:
        """Get teams for user"""
        try:
            teams = await self.db.teams.find({
                'members.user_id': user_id
            }).to_list(None)
            
            return {
                'success': True,
                'teams': teams,
                'total_teams': len(teams)
            }
            
        except Exception as e:
            logger.error(f"Get user teams failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

# Global enhanced auth service instance
_enhanced_auth_service = None

def init_enhanced_auth_service(db_manager, jwt_secret: str = None):
    """Initialize Enhanced Auth Service"""
    global _enhanced_auth_service
    _enhanced_auth_service = EnhancedAuthService(db_manager, jwt_secret)
    logger.info("🔐 Enhanced Authentication Service initialized!")

def get_enhanced_auth_service() -> Optional[EnhancedAuthService]:
    """Get Enhanced Auth Service instance"""
    return _enhanced_auth_service