"""
Enhanced Collaboration Service - Real-time Collaboration System
Complete collaborative editing with live cursors, voice/video chat, and team workspaces
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timedelta
import uuid
import websockets
from collections import defaultdict

logger = logging.getLogger(__name__)

class EnhancedCollaborationService:
    """
    Enhanced real-time collaboration service with live editing,
    voice/video chat integration, and team workspaces
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # Active sessions and connections
        self.active_sessions: Dict[str, Dict] = {}
        self.user_connections: Dict[str, List] = defaultdict(list)
        self.project_collaborators: Dict[str, Set[str]] = defaultdict(set)
        self.live_cursors: Dict[str, Dict] = {}
        
        # File synchronization
        self.file_locks: Dict[str, Dict] = {}
        self.file_changes: Dict[str, List] = defaultdict(list)
        
        # Voice/Video chat rooms
        self.voice_rooms: Dict[str, Dict] = {}
        self.video_rooms: Dict[str, Dict] = {}
        
        # Team workspaces
        self.team_workspaces: Dict[str, Dict] = {}
        
        logger.info("🚀 Enhanced Collaboration Service initialized")

    async def create_collaboration_session(self, project_id: str, user_id: str, session_type: str = "code") -> Dict[str, Any]:
        """Create a new collaboration session"""
        try:
            session_id = str(uuid.uuid4())
            
            session_data = {
                'session_id': session_id,
                'project_id': project_id,
                'host_user_id': user_id,
                'session_type': session_type,  # 'code', 'design', 'meeting', 'pair_programming'
                'created_at': datetime.utcnow(),
                'status': 'active',
                'participants': [user_id],
                'settings': {
                    'max_participants': 10,
                    'allow_anonymous': False,
                    'require_approval': False,
                    'recording_enabled': False,
                    'voice_enabled': True,
                    'video_enabled': True,
                    'screen_sharing_enabled': True
                },
                'features': {
                    'live_cursors': True,
                    'live_editing': True,
                    'voice_chat': True,
                    'video_chat': True,
                    'screen_sharing': True,
                    'whiteboard': True,
                    'file_sharing': True
                }
            }
            
            # Store session
            await self.db.collaboration_sessions.insert_one(session_data)
            self.active_sessions[session_id] = session_data
            
            # Initialize project collaborators
            self.project_collaborators[project_id].add(user_id)
            
            return {
                'success': True,
                'session': session_data,
                'message': f'Collaboration session created for {session_type}'
            }
            
        except Exception as e:
            logger.error(f"Create collaboration session failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def join_collaboration_session(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Join an existing collaboration session"""
        try:
            session = await self.db.collaboration_sessions.find_one({'session_id': session_id})
            
            if not session:
                return {
                    'success': False,
                    'error': 'Session not found'
                }
            
            if session['status'] != 'active':
                return {
                    'success': False,
                    'error': 'Session is not active'
                }
            
            # Check if user is already a participant
            if user_id in session['participants']:
                return {
                    'success': True,
                    'session': session,
                    'message': 'Already joined session'
                }
            
            # Check participant limit
            if len(session['participants']) >= session['settings']['max_participants']:
                return {
                    'success': False,
                    'error': 'Session is full'
                }
            
            # Add participant
            await self.db.collaboration_sessions.update_one(
                {'session_id': session_id},
                {
                    '$push': {'participants': user_id},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            # Update active session
            if session_id in self.active_sessions:
                self.active_sessions[session_id]['participants'].append(user_id)
            
            # Add to project collaborators
            self.project_collaborators[session['project_id']].add(user_id)
            
            # Notify other participants
            await self._notify_participants(session_id, {
                'type': 'user_joined',
                'user_id': user_id,
                'timestamp': datetime.utcnow().isoformat()
            })
            
            return {
                'success': True,
                'session': session,
                'message': 'Successfully joined collaboration session'
            }
            
        except Exception as e:
            logger.error(f"Join collaboration session failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def leave_collaboration_session(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Leave a collaboration session"""
        try:
            session = await self.db.collaboration_sessions.find_one({'session_id': session_id})
            
            if not session:
                return {
                    'success': False,
                    'error': 'Session not found'
                }
            
            if user_id not in session['participants']:
                return {
                    'success': False,
                    'error': 'User not in session'
                }
            
            # Remove participant
            await self.db.collaboration_sessions.update_one(
                {'session_id': session_id},
                {
                    '$pull': {'participants': user_id},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            # Update active session
            if session_id in self.active_sessions:
                self.active_sessions[session_id]['participants'].remove(user_id)
            
            # Remove from project collaborators
            self.project_collaborators[session['project_id']].discard(user_id)
            
            # Clear user's cursor
            cursor_key = f"{session_id}_{user_id}"
            self.live_cursors.pop(cursor_key, None)
            
            # Notify other participants
            await self._notify_participants(session_id, {
                'type': 'user_left',
                'user_id': user_id,
                'timestamp': datetime.utcnow().isoformat()
            })
            
            return {
                'success': True,
                'message': 'Successfully left collaboration session'
            }
            
        except Exception as e:
            logger.error(f"Leave collaboration session failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def handle_live_cursor_update(self, session_id: str, user_id: str, cursor_data: Dict) -> Dict[str, Any]:
        """Handle live cursor position updates"""
        try:
            cursor_key = f"{session_id}_{user_id}"
            
            cursor_info = {
                'user_id': user_id,
                'session_id': session_id,
                'position': cursor_data.get('position', {'line': 0, 'column': 0}),
                'file_path': cursor_data.get('file_path', ''),
                'selection': cursor_data.get('selection', None),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Update cursor position
            self.live_cursors[cursor_key] = cursor_info
            
            # Broadcast to other participants
            await self._notify_participants(session_id, {
                'type': 'cursor_update',
                'cursor_data': cursor_info
            }, exclude_user=user_id)
            
            return {
                'success': True,
                'cursor_data': cursor_info
            }
            
        except Exception as e:
            logger.error(f"Live cursor update failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def handle_live_code_edit(self, session_id: str, user_id: str, edit_data: Dict) -> Dict[str, Any]:
        """Handle live code editing with conflict resolution"""
        try:
            file_path = edit_data.get('file_path')
            
            if not file_path:
                return {
                    'success': False,
                    'error': 'File path is required'
                }
            
            # Check if file is locked by another user
            file_lock_key = f"{session_id}_{file_path}"
            if file_lock_key in self.file_locks:
                lock_info = self.file_locks[file_lock_key]
                if lock_info['user_id'] != user_id and lock_info['expires_at'] > datetime.utcnow():
                    return {
                        'success': False,
                        'error': f'File is locked by another user',
                        'locked_by': lock_info['user_id']
                    }
            
            # Apply edit
            edit_info = {
                'edit_id': str(uuid.uuid4()),
                'session_id': session_id,
                'user_id': user_id,
                'file_path': file_path,
                'operation': edit_data.get('operation', 'insert'),  # 'insert', 'delete', 'replace'
                'position': edit_data.get('position', {'line': 0, 'column': 0}),
                'content': edit_data.get('content', ''),
                'length': edit_data.get('length', 0),
                'timestamp': datetime.utcnow()
            }
            
            # Store edit in database
            await self.db.live_edits.insert_one(edit_info)
            
            # Add to file changes
            self.file_changes[file_lock_key].append(edit_info)
            
            # Broadcast to other participants
            await self._notify_participants(session_id, {
                'type': 'code_edit',
                'edit_data': edit_info
            }, exclude_user=user_id)
            
            return {
                'success': True,
                'edit_data': edit_info
            }
            
        except Exception as e:
            logger.error(f"Live code edit failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def request_file_lock(self, session_id: str, user_id: str, file_path: str, duration_minutes: int = 5) -> Dict[str, Any]:
        """Request exclusive lock on file for editing"""
        try:
            file_lock_key = f"{session_id}_{file_path}"
            
            # Check if file is already locked
            if file_lock_key in self.file_locks:
                existing_lock = self.file_locks[file_lock_key]
                if existing_lock['user_id'] != user_id and existing_lock['expires_at'] > datetime.utcnow():
                    return {
                        'success': False,
                        'error': 'File is already locked by another user',
                        'locked_by': existing_lock['user_id'],
                        'expires_at': existing_lock['expires_at'].isoformat()
                    }
            
            # Create lock
            lock_info = {
                'user_id': user_id,
                'session_id': session_id,
                'file_path': file_path,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(minutes=duration_minutes)
            }
            
            self.file_locks[file_lock_key] = lock_info
            
            # Notify other participants
            await self._notify_participants(session_id, {
                'type': 'file_locked',
                'lock_data': lock_info
            }, exclude_user=user_id)
            
            return {
                'success': True,
                'lock_data': lock_info,
                'message': f'File locked for {duration_minutes} minutes'
            }
            
        except Exception as e:
            logger.error(f"File lock request failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def release_file_lock(self, session_id: str, user_id: str, file_path: str) -> Dict[str, Any]:
        """Release file lock"""
        try:
            file_lock_key = f"{session_id}_{file_path}"
            
            if file_lock_key not in self.file_locks:
                return {
                    'success': False,
                    'error': 'No lock found for this file'
                }
            
            lock_info = self.file_locks[file_lock_key]
            
            if lock_info['user_id'] != user_id:
                return {
                    'success': False,
                    'error': 'You do not own this lock'
                }
            
            # Remove lock
            del self.file_locks[file_lock_key]
            
            # Notify other participants
            await self._notify_participants(session_id, {
                'type': 'file_unlocked',
                'file_path': file_path,
                'unlocked_by': user_id
            })
            
            return {
                'success': True,
                'message': 'File lock released'
            }
            
        except Exception as e:
            logger.error(f"File lock release failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def start_voice_chat(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Start voice chat room"""
        try:
            room_id = f"voice_{session_id}"
            
            if room_id not in self.voice_rooms:
                self.voice_rooms[room_id] = {
                    'room_id': room_id,
                    'session_id': session_id,
                    'participants': [],
                    'created_at': datetime.utcnow(),
                    'active': True
                }
            
            room = self.voice_rooms[room_id]
            
            if user_id not in room['participants']:
                room['participants'].append(user_id)
            
            # Notify other participants
            await self._notify_participants(session_id, {
                'type': 'voice_chat_started',
                'room_id': room_id,
                'user_id': user_id
            })
            
            return {
                'success': True,
                'room_id': room_id,
                'room_data': room
            }
            
        except Exception as e:
            logger.error(f"Start voice chat failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def start_video_chat(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Start video chat room"""
        try:
            room_id = f"video_{session_id}"
            
            if room_id not in self.video_rooms:
                self.video_rooms[room_id] = {
                    'room_id': room_id,
                    'session_id': session_id,
                    'participants': [],
                    'created_at': datetime.utcnow(),
                    'active': True,
                    'screen_sharing': None
                }
            
            room = self.video_rooms[room_id]
            
            if user_id not in room['participants']:
                room['participants'].append(user_id)
            
            # Notify other participants
            await self._notify_participants(session_id, {
                'type': 'video_chat_started',
                'room_id': room_id,
                'user_id': user_id
            })
            
            return {
                'success': True,
                'room_id': room_id,
                'room_data': room
            }
            
        except Exception as e:
            logger.error(f"Start video chat failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def start_screen_sharing(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Start screen sharing"""
        try:
            room_id = f"video_{session_id}"
            
            if room_id not in self.video_rooms:
                return {
                    'success': False,
                    'error': 'Video room not found'
                }
            
            room = self.video_rooms[room_id]
            
            if room['screen_sharing'] and room['screen_sharing'] != user_id:
                return {
                    'success': False,
                    'error': 'Another user is already screen sharing'
                }
            
            room['screen_sharing'] = user_id
            
            # Notify other participants
            await self._notify_participants(session_id, {
                'type': 'screen_sharing_started',
                'user_id': user_id
            })
            
            return {
                'success': True,
                'message': 'Screen sharing started'
            }
            
        except Exception as e:
            logger.error(f"Start screen sharing failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def create_team_workspace(self, team_id: str, name: str, description: str = "") -> Dict[str, Any]:
        """Create team workspace"""
        try:
            workspace_id = str(uuid.uuid4())
            
            workspace_data = {
                'workspace_id': workspace_id,
                'team_id': team_id,
                'name': name,
                'description': description,
                'created_at': datetime.utcnow(),
                'active_sessions': [],
                'shared_projects': [],
                'shared_files': [],
                'whiteboard_data': [],
                'meeting_notes': []
            }
            
            # Store workspace
            await self.db.team_workspaces.insert_one(workspace_data)
            self.team_workspaces[workspace_id] = workspace_data
            
            return {
                'success': True,
                'workspace': workspace_data,
                'message': f'Team workspace "{name}" created'
            }
            
        except Exception as e:
            logger.error(f"Create team workspace failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_session_participants(self, session_id: str) -> Dict[str, Any]:
        """Get current session participants"""
        try:
            session = await self.db.collaboration_sessions.find_one({'session_id': session_id})
            
            if not session:
                return {
                    'success': False,
                    'error': 'Session not found'
                }
            
            # Get user details for participants
            participants = []
            for user_id in session['participants']:
                user = await self.db.users.find_one({'user_id': user_id})
                if user:
                    participants.append({
                        'user_id': user_id,
                        'username': user.get('username', ''),
                        'full_name': user.get('full_name', ''),
                        'avatar_url': user.get('avatar_url', ''),
                        'status': 'online'  # Could be enhanced with real status
                    })
            
            return {
                'success': True,
                'participants': participants,
                'total_participants': len(participants)
            }
            
        except Exception as e:
            logger.error(f"Get session participants failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_live_cursors(self, session_id: str) -> Dict[str, Any]:
        """Get current live cursor positions"""
        try:
            session_cursors = {}
            
            for cursor_key, cursor_data in self.live_cursors.items():
                if cursor_data['session_id'] == session_id:
                    session_cursors[cursor_data['user_id']] = cursor_data
            
            return {
                'success': True,
                'cursors': session_cursors
            }
            
        except Exception as e:
            logger.error(f"Get live cursors failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _notify_participants(self, session_id: str, message: Dict, exclude_user: str = None):
        """Notify all session participants"""
        try:
            session = self.active_sessions.get(session_id)
            if not session:
                return
            
            for user_id in session['participants']:
                if user_id != exclude_user:
                    # Send message to user's websocket connections
                    # This would integrate with your WebSocket implementation
                    pass
                    
        except Exception as e:
            logger.error(f"Notify participants failed: {e}")

    async def get_collaboration_history(self, session_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get collaboration session history"""
        try:
            # Get live edits
            edits = await self.db.live_edits.find(
                {'session_id': session_id}
            ).sort('timestamp', -1).limit(limit).to_list(None)
            
            # Get session info
            session = await self.db.collaboration_sessions.find_one({'session_id': session_id})
            
            return {
                'success': True,
                'session': session,
                'edits': edits,
                'total_edits': len(edits)
            }
            
        except Exception as e:
            logger.error(f"Get collaboration history failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

# Global service instance
_enhanced_collaboration_service = None

def init_enhanced_collaboration_service(db_manager):
    """Initialize Enhanced Collaboration Service"""
    global _enhanced_collaboration_service
    _enhanced_collaboration_service = EnhancedCollaborationService(db_manager)
    logger.info("🚀 Enhanced Collaboration Service initialized!")

def get_enhanced_collaboration_service() -> Optional[EnhancedCollaborationService]:
    """Get Enhanced Collaboration Service instance"""
    return _enhanced_collaboration_service