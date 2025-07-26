"""
Enhanced Real-time Collaboration Service
Provides comprehensive real-time collaborative editing capabilities
"""

import asyncio
import json
import logging
import time
import uuid
from typing import Dict, List, Optional, Set, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class UserCursor:
    user_id: str
    user_name: str
    position: int
    selection_start: int
    selection_end: int
    color: str
    last_updated: float

@dataclass
class CodeEdit:
    edit_id: str
    user_id: str
    file_id: str
    operation: str  # 'insert', 'delete', 'replace'
    position: int
    content: str
    length: int
    timestamp: float
    applied: bool = False

@dataclass
class CollaboratorInfo:
    user_id: str
    user_name: str
    avatar_url: str
    status: str  # 'online', 'typing', 'away'
    cursor_position: int
    last_seen: float
    permissions: List[str]

class EnhancedCollaborationService:
    """
    Real-time collaborative editing service with operational transformation
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # Active sessions and connections
        self.active_sessions: Dict[str, Dict] = {}  # file_id -> session_data
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> set of file_ids
        self.file_collaborators: Dict[str, Dict[str, CollaboratorInfo]] = {}  # file_id -> {user_id: info}
        self.user_cursors: Dict[str, Dict[str, UserCursor]] = {}  # file_id -> {user_id: cursor}
        
        # Operational transformation
        self.operation_queue: Dict[str, List[CodeEdit]] = {}  # file_id -> operations
        self.document_states: Dict[str, str] = {}  # file_id -> current_content
        
        # Collaboration metrics
        self.collaboration_stats = {
            'total_edits': 0,
            'active_sessions': 0,
            'peak_collaborators': 0
        }
        
        # User color assignments
        self.user_colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
        ]
        
        logger.info("🚀 Enhanced Collaboration Service initialized")

    async def join_collaborative_session(self, file_id: str, user_id: str, user_name: str, avatar_url: str = "") -> Dict[str, Any]:
        """Join a collaborative editing session for a file"""
        try:
            # Initialize session if it doesn't exist
            if file_id not in self.active_sessions:
                await self._initialize_session(file_id)
            
            # Add user to session
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(file_id)
            
            # Create collaborator info
            if file_id not in self.file_collaborators:
                self.file_collaborators[file_id] = {}
            
            # Assign color to user
            existing_users = len(self.file_collaborators[file_id])
            user_color = self.user_colors[existing_users % len(self.user_colors)]
            
            collaborator = CollaboratorInfo(
                user_id=user_id,
                user_name=user_name,
                avatar_url=avatar_url,
                status='online',
                cursor_position=0,
                last_seen=time.time(),
                permissions=['edit', 'comment']
            )
            
            self.file_collaborators[file_id][user_id] = collaborator
            
            # Initialize cursor for user
            if file_id not in self.user_cursors:
                self.user_cursors[file_id] = {}
            
            self.user_cursors[file_id][user_id] = UserCursor(
                user_id=user_id,
                user_name=user_name,
                position=0,
                selection_start=0,
                selection_end=0,
                color=user_color,
                last_updated=time.time()
            )
            
            # Update session stats
            self.active_sessions[file_id]['collaborator_count'] = len(self.file_collaborators[file_id])
            self.collaboration_stats['active_sessions'] = len(self.active_sessions)
            self.collaboration_stats['peak_collaborators'] = max(
                self.collaboration_stats['peak_collaborators'],
                len(self.file_collaborators[file_id])
            )
            
            # Get current file content
            file_doc = await self.db.files.find_one({"id": file_id})
            current_content = file_doc.get('content', '') if file_doc else ''
            self.document_states[file_id] = current_content
            
            # Save session to database
            await self._save_session_state(file_id)
            
            return {
                'success': True,
                'session_id': self.active_sessions[file_id]['session_id'],
                'collaborators': [asdict(c) for c in self.file_collaborators[file_id].values()],
                'user_color': user_color,
                'current_content': current_content,
                'operation_count': len(self.operation_queue.get(file_id, [])),
                'message': f'{user_name} joined the collaborative session'
            }
            
        except Exception as e:
            logger.error(f"Failed to join collaborative session: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def leave_collaborative_session(self, file_id: str, user_id: str) -> Dict[str, Any]:
        """Leave a collaborative editing session"""
        try:
            # Remove user from connections
            if user_id in self.user_connections:
                self.user_connections[user_id].discard(file_id)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            
            # Remove from collaborators
            if file_id in self.file_collaborators and user_id in self.file_collaborators[file_id]:
                user_name = self.file_collaborators[file_id][user_id].user_name
                del self.file_collaborators[file_id][user_id]
            else:
                user_name = "Unknown User"
            
            # Remove cursor
            if file_id in self.user_cursors and user_id in self.user_cursors[file_id]:
                del self.user_cursors[file_id][user_id]
            
            # Update session stats
            if file_id in self.active_sessions:
                self.active_sessions[file_id]['collaborator_count'] = len(self.file_collaborators.get(file_id, {}))
                
                # Clean up empty session
                if len(self.file_collaborators.get(file_id, {})) == 0:
                    await self._cleanup_session(file_id)
            
            self.collaboration_stats['active_sessions'] = len(self.active_sessions)
            
            # Save session state
            if file_id in self.active_sessions:
                await self._save_session_state(file_id)
            
            return {
                'success': True,
                'message': f'{user_name} left the collaborative session',
                'remaining_collaborators': len(self.file_collaborators.get(file_id, {}))
            }
            
        except Exception as e:
            logger.error(f"Failed to leave collaborative session: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def apply_collaborative_edit(self, file_id: str, user_id: str, operation: str, position: int, content: str, selection_start: int = None, selection_end: int = None) -> Dict[str, Any]:
        """Apply a collaborative edit with operational transformation"""
        try:
            # Validate session and user
            if file_id not in self.active_sessions:
                return {'success': False, 'error': 'No active session for this file'}
            
            if file_id not in self.file_collaborators or user_id not in self.file_collaborators[file_id]:
                return {'success': False, 'error': 'User not in collaborative session'}
            
            # Create edit operation
            edit = CodeEdit(
                edit_id=str(uuid.uuid4()),
                user_id=user_id,
                file_id=file_id,
                operation=operation,
                position=position,
                content=content,
                length=len(content),
                timestamp=time.time(),
                applied=False
            )
            
            # Add to operation queue
            if file_id not in self.operation_queue:
                self.operation_queue[file_id] = []
            self.operation_queue[file_id].append(edit)
            
            # Apply operational transformation
            transformed_edit = await self._apply_operational_transformation(edit)
            
            # Update document state
            current_content = self.document_states.get(file_id, '')
            new_content = self._apply_edit_to_content(current_content, transformed_edit)
            self.document_states[file_id] = new_content
            
            # Update cursor position if provided
            if selection_start is not None and selection_end is not None:
                await self.update_cursor_position(file_id, user_id, position, selection_start, selection_end)
            
            # Mark as applied
            transformed_edit.applied = True
            self.collaboration_stats['total_edits'] += 1
            
            # Save to database
            await self._save_edit_operation(transformed_edit)
            
            # Update file content in database
            await self.db.files.update_one(
                {"id": file_id},
                {
                    "$set": {
                        "content": new_content,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return {
                'success': True,
                'edit_id': transformed_edit.edit_id,
                'transformed_position': transformed_edit.position,
                'new_content': new_content,
                'operation_count': len(self.operation_queue[file_id]),
                'collaborators': [asdict(c) for c in self.file_collaborators[file_id].values()]
            }
            
        except Exception as e:
            logger.error(f"Failed to apply collaborative edit: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def update_cursor_position(self, file_id: str, user_id: str, position: int, selection_start: int, selection_end: int) -> Dict[str, Any]:
        """Update user's cursor position in collaborative session"""
        try:
            if file_id not in self.user_cursors:
                self.user_cursors[file_id] = {}
            
            if user_id in self.user_cursors[file_id]:
                cursor = self.user_cursors[file_id][user_id]
                cursor.position = position
                cursor.selection_start = selection_start
                cursor.selection_end = selection_end
                cursor.last_updated = time.time()
            
            # Update user status
            if file_id in self.file_collaborators and user_id in self.file_collaborators[file_id]:
                self.file_collaborators[file_id][user_id].cursor_position = position
                self.file_collaborators[file_id][user_id].last_seen = time.time()
                self.file_collaborators[file_id][user_id].status = 'typing'
            
            return {
                'success': True,
                'cursors': {uid: asdict(cursor) for uid, cursor in self.user_cursors[file_id].items()},
                'collaborators': [asdict(c) for c in self.file_collaborators.get(file_id, {}).values()]
            }
            
        except Exception as e:
            logger.error(f"Failed to update cursor position: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_collaboration_state(self, file_id: str) -> Dict[str, Any]:
        """Get current collaboration state for a file"""
        try:
            return {
                'success': True,
                'session_active': file_id in self.active_sessions,
                'collaborators': [asdict(c) for c in self.file_collaborators.get(file_id, {}).values()],
                'cursors': {uid: asdict(cursor) for uid, cursor in self.user_cursors.get(file_id, {}).items()},
                'operation_count': len(self.operation_queue.get(file_id, [])),
                'current_content': self.document_states.get(file_id, ''),
                'session_stats': self.active_sessions.get(file_id, {})
            }
            
        except Exception as e:
            logger.error(f"Failed to get collaboration state: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def add_comment(self, file_id: str, user_id: str, line_number: int, comment_text: str, position: int = 0) -> Dict[str, Any]:
        """Add a comment to a specific line in collaborative session"""
        try:
            comment = {
                'comment_id': str(uuid.uuid4()),
                'file_id': file_id,
                'user_id': user_id,
                'line_number': line_number,
                'position': position,
                'comment_text': comment_text,
                'timestamp': datetime.utcnow(),
                'resolved': False,
                'replies': []
            }
            
            # Save comment to database
            await self.db.collaboration_comments.insert_one(comment)
            
            # Get user info
            user_info = self.file_collaborators.get(file_id, {}).get(user_id)
            user_name = user_info.user_name if user_info else 'Unknown User'
            
            return {
                'success': True,
                'comment': comment,
                'message': f'{user_name} added a comment'
            }
            
        except Exception as e:
            logger.error(f"Failed to add comment: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _initialize_session(self, file_id: str):
        """Initialize a new collaborative session"""
        session_data = {
            'session_id': str(uuid.uuid4()),
            'file_id': file_id,
            'created_at': time.time(),
            'collaborator_count': 0,
            'total_edits': 0,
            'last_activity': time.time()
        }
        
        self.active_sessions[file_id] = session_data
        self.operation_queue[file_id] = []
        
        # Save to database
        await self.db.collaboration_sessions.insert_one(session_data)

    async def _cleanup_session(self, file_id: str):
        """Clean up an empty collaborative session"""
        if file_id in self.active_sessions:
            # Update session end time in database
            await self.db.collaboration_sessions.update_one(
                {'session_id': self.active_sessions[file_id]['session_id']},
                {'$set': {'ended_at': datetime.utcnow()}}
            )
            
            del self.active_sessions[file_id]
        
        # Clean up related data
        self.operation_queue.pop(file_id, None)
        self.file_collaborators.pop(file_id, None)
        self.user_cursors.pop(file_id, None)
        self.document_states.pop(file_id, None)

    async def _apply_operational_transformation(self, edit: CodeEdit) -> CodeEdit:
        """Apply operational transformation to resolve conflicts"""
        # Get all pending operations for this file
        pending_ops = [op for op in self.operation_queue.get(edit.file_id, []) if not op.applied and op.timestamp < edit.timestamp]
        
        transformed_edit = edit
        
        # Apply transformations based on pending operations
        for pending_op in pending_ops:
            if pending_op.operation == 'insert':
                if pending_op.position <= transformed_edit.position:
                    # Shift position right for insertions before current position
                    transformed_edit.position += pending_op.length
            elif pending_op.operation == 'delete':
                if pending_op.position < transformed_edit.position:
                    # Shift position left for deletions before current position
                    transformed_edit.position -= min(pending_op.length, transformed_edit.position - pending_op.position)
                elif pending_op.position < transformed_edit.position + transformed_edit.length:
                    # Handle overlapping deletes - adjust content length
                    overlap = min(pending_op.position + pending_op.length, transformed_edit.position + transformed_edit.length) - max(pending_op.position, transformed_edit.position)
                    if overlap > 0:
                        transformed_edit.length -= overlap
        
        return transformed_edit

    def _apply_edit_to_content(self, content: str, edit: CodeEdit) -> str:
        """Apply an edit operation to content string"""
        if edit.operation == 'insert':
            return content[:edit.position] + edit.content + content[edit.position:]
        elif edit.operation == 'delete':
            return content[:edit.position] + content[edit.position + edit.length:]
        elif edit.operation == 'replace':
            return content[:edit.position] + edit.content + content[edit.position + edit.length:]
        return content

    async def _save_edit_operation(self, edit: CodeEdit):
        """Save edit operation to database"""
        await self.db.collaboration_edits.insert_one(asdict(edit))

    async def _save_session_state(self, file_id: str):
        """Save current session state to database"""
        if file_id in self.active_sessions:
            session_data = self.active_sessions[file_id].copy()
            session_data['last_activity'] = time.time()
            session_data['collaborators'] = [asdict(c) for c in self.file_collaborators.get(file_id, {}).values()]
            
            await self.db.collaboration_sessions.update_one(
                {'session_id': session_data['session_id']},
                {'$set': session_data},
                upsert=True
            )

# Global collaboration service instance
_enhanced_collaboration_service = None

def init_enhanced_collaboration_service(db_manager):
    """Initialize the enhanced collaboration service"""
    global _enhanced_collaboration_service
    _enhanced_collaboration_service = EnhancedCollaborationService(db_manager)
    logger.info("🚀 Enhanced Collaboration Service initialized!")

def get_enhanced_collaboration_service() -> Optional[EnhancedCollaborationService]:
    """Get the enhanced collaboration service instance"""
    return _enhanced_collaboration_service