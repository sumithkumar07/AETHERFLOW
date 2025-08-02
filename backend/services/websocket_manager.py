import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # Active connections: {user_id: {session_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # Session participants: {session_id: [user_ids]}
        self.session_participants: Dict[str, List[str]] = {}
        # Connection metadata
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str, session_id: str):
        """Connect user to websocket and session"""
        try:
            # Initialize user connections if not exists
            if user_id not in self.active_connections:
                self.active_connections[user_id] = {}
            
            # Add websocket connection
            self.active_connections[user_id][session_id] = websocket
            
            # Add user to session participants
            if session_id not in self.session_participants:
                self.session_participants[session_id] = []
            
            if user_id not in self.session_participants[session_id]:
                self.session_participants[session_id].append(user_id)
            
            # Store connection metadata
            connection_key = f"{user_id}:{session_id}"
            self.connection_metadata[connection_key] = {
                "connected_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                "message_count": 0
            }
            
            logger.info(f"WebSocket connected: user {user_id} to session {session_id}")
            
            # Notify other participants about new connection
            await self.broadcast_to_session(session_id, {
                "type": "user_connected",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }, exclude_user=user_id)
            
        except Exception as e:
            logger.error(f"WebSocket connect error: {e}")
            
    async def disconnect(self, user_id: str, session_id: str):
        """Disconnect user from websocket and session"""
        try:
            # Remove websocket connection
            if user_id in self.active_connections:
                if session_id in self.active_connections[user_id]:
                    del self.active_connections[user_id][session_id]
                
                # Clean up empty user entry
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            # Remove user from session participants
            if session_id in self.session_participants:
                if user_id in self.session_participants[session_id]:
                    self.session_participants[session_id].remove(user_id)
                
                # Clean up empty session
                if not self.session_participants[session_id]:
                    del self.session_participants[session_id]
            
            # Clean up connection metadata
            connection_key = f"{user_id}:{session_id}"
            if connection_key in self.connection_metadata:
                del self.connection_metadata[connection_key]
            
            logger.info(f"WebSocket disconnected: user {user_id} from session {session_id}")
            
            # Notify other participants about disconnection
            await self.broadcast_to_session(session_id, {
                "type": "user_disconnected",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"WebSocket disconnect error: {e}")
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str, session_id: str):
        """Send message to specific user in specific session"""
        try:
            if user_id in self.active_connections:
                if session_id in self.active_connections[user_id]:
                    websocket = self.active_connections[user_id][session_id]
                    await websocket.send_text(json.dumps(message))
                    
                    # Update activity metadata
                    connection_key = f"{user_id}:{session_id}"
                    if connection_key in self.connection_metadata:
                        self.connection_metadata[connection_key]["last_activity"] = datetime.utcnow()
                        self.connection_metadata[connection_key]["message_count"] += 1
                    
        except Exception as e:
            logger.error(f"Send personal message error: {e}")
    
    async def broadcast_to_session(self, session_id: str, message: Dict[str, Any], exclude_user: Optional[str] = None):
        """Broadcast message to all users in session"""
        try:
            if session_id not in self.session_participants:
                return
            
            participants = self.session_participants[session_id]
            
            for user_id in participants:
                if exclude_user and user_id == exclude_user:
                    continue
                
                await self.send_personal_message(message, user_id, session_id)
                
        except Exception as e:
            logger.error(f"Broadcast to session error: {e}")
    
    async def broadcast_to_user(self, user_id: str, message: Dict[str, Any]):
        """Broadcast message to user across all their sessions"""
        try:
            if user_id not in self.active_connections:
                return
            
            for session_id in self.active_connections[user_id]:
                await self.send_personal_message(message, user_id, session_id)
                
        except Exception as e:
            logger.error(f"Broadcast to user error: {e}")
    
    def get_session_participants(self, session_id: str) -> List[str]:
        """Get list of participants in session"""
        return self.session_participants.get(session_id, [])
    
    def get_user_sessions(self, user_id: str) -> List[str]:
        """Get list of sessions user is connected to"""
        if user_id not in self.active_connections:
            return []
        return list(self.active_connections[user_id].keys())
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        total_connections = sum(len(sessions) for sessions in self.active_connections.values())
        total_sessions = len(self.session_participants)
        total_users = len(self.active_connections)
        
        return {
            "total_connections": total_connections,
            "total_sessions": total_sessions,
            "total_users": total_users,
            "sessions": {
                session_id: len(participants)
                for session_id, participants in self.session_participants.items()
            }
        }
    
    async def ping_all_connections(self):
        """Ping all connections to check health"""
        disconnected = []
        
        for user_id, sessions in self.active_connections.items():
            for session_id, websocket in sessions.items():
                try:
                    await websocket.ping()
                except Exception:
                    disconnected.append((user_id, session_id))
        
        # Clean up disconnected websockets
        for user_id, session_id in disconnected:
            await self.disconnect(user_id, session_id)
        
        return len(disconnected)
    
    def is_user_connected(self, user_id: str, session_id: Optional[str] = None) -> bool:
        """Check if user is connected"""
        if user_id not in self.active_connections:
            return False
        
        if session_id:
            return session_id in self.active_connections[user_id]
        
        return len(self.active_connections[user_id]) > 0