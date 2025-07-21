import asyncio
import json
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
from fastapi import WebSocket
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.collaboration_models import (
    User, Room, UserPresence, CollaborationCursor, EditOperation, 
    ChatMessage, FileVersion, RoomInvite
)
import logging

logger = logging.getLogger(__name__)

class OperationalTransform:
    """Handles operational transforms for real-time collaborative editing"""
    
    @staticmethod
    def transform_operations(op1: EditOperation, op2: EditOperation) -> tuple[EditOperation, EditOperation]:
        """Transform two concurrent operations to maintain consistency"""
        
        # If operations are on different positions and don't conflict
        if op1.position != op2.position:
            if op1.position < op2.position:
                if op1.operation_type == "insert":
                    # op2 position shifts right by insert length
                    op2.position += len(op1.content or "")
                elif op1.operation_type == "delete":
                    # op2 position shifts left by delete length
                    op2.position -= min(op1.length or 0, op2.position - op1.position)
                return op1, op2
            else:
                if op2.operation_type == "insert":
                    # op1 position shifts right by insert length
                    op1.position += len(op2.content or "")
                elif op2.operation_type == "delete":
                    # op1 position shifts left by delete length
                    op1.position -= min(op2.length or 0, op1.position - op2.position)
                return op1, op2
        
        # Handle same position operations
        if op1.position == op2.position:
            if op1.operation_type == "insert" and op2.operation_type == "insert":
                # Both insertions at same position - prioritize by user_id or timestamp
                if op1.user_id < op2.user_id:  # Consistent ordering
                    op2.position += len(op1.content or "")
                else:
                    op1.position += len(op2.content or "")
                return op1, op2
            
            elif op1.operation_type == "delete" and op2.operation_type == "delete":
                # Both deletions at same position - merge or prioritize
                return op1, EditOperation(
                    user_id=op2.user_id,
                    file_id=op2.file_id,
                    operation_type="retain",  # Convert to retain to avoid double deletion
                    position=op2.position,
                    timestamp=op2.timestamp,
                    version=op2.version
                )
        
        return op1, op2

class CollaborationManager:
    """Manages real-time collaboration features"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}  # room_id -> {user_id: websocket}
        self.user_presence: Dict[str, UserPresence] = {}  # user_id -> presence
        self.room_users: Dict[str, Set[str]] = {}  # room_id -> set of user_ids
        self.file_versions: Dict[str, int] = {}  # file_id -> current_version
        self.operation_queue: Dict[str, List[EditOperation]] = {}  # file_id -> operations
        
    async def create_room(self, project_id: str, name: str, owner_id: str, 
                         description: Optional[str] = None, is_public: bool = True, 
                         max_users: int = 10) -> Room:
        """Create a new collaboration room"""
        room = Room(
            project_id=project_id,
            name=name,
            owner_id=owner_id,
            description=description,
            is_public=is_public,
            max_users=max_users
        )
        
        await self.db.rooms.insert_one(room.dict())
        self.room_users[room.id] = set()
        
        logger.info(f"Created collaboration room: {room.id} for project: {project_id}")
        return room
    
    async def join_room(self, room_id: str, user: User, websocket: WebSocket, 
                       invite_code: Optional[str] = None) -> bool:
        """Add user to collaboration room"""
        # Check if room exists
        room = await self.db.rooms.find_one({"id": room_id})
        if not room:
            logger.warning(f"Attempt to join non-existent room: {room_id}")
            return False
        
        room_obj = Room(**room)
        
        # Check room capacity
        current_users = len(self.room_users.get(room_id, set()))
        if current_users >= room_obj.max_users:
            logger.warning(f"Room {room_id} is at capacity ({current_users}/{room_obj.max_users})")
            return False
        
        # Initialize room connections if needed
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
            self.room_users[room_id] = set()
        
        # Add user to room
        self.active_connections[room_id][user.id] = websocket
        self.room_users[room_id].add(user.id)
        
        # Create user presence
        presence = UserPresence(user_id=user.id, room_id=room_id)
        self.user_presence[user.id] = presence
        await self.db.user_presence.replace_one(
            {"user_id": user.id, "room_id": room_id},
            presence.dict(),
            upsert=True
        )
        
        # Save user to database
        await self.db.users.replace_one({"id": user.id}, user.dict(), upsert=True)
        
        # Notify other users in the room
        await self.broadcast_to_room(room_id, {
            "type": "user_joined",
            "user": user.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user.id)
        
        # Send current room state to new user
        await self.send_room_state(room_id, user.id)
        
        logger.info(f"User {user.id} joined room {room_id}")
        return True
    
    async def leave_room(self, room_id: str, user_id: str):
        """Remove user from collaboration room"""
        if room_id in self.active_connections and user_id in self.active_connections[room_id]:
            del self.active_connections[room_id][user_id]
            
        if room_id in self.room_users and user_id in self.room_users[room_id]:
            self.room_users[room_id].discard(user_id)
            
        # Clean up presence
        if user_id in self.user_presence:
            del self.user_presence[user_id]
            
        await self.db.user_presence.delete_many({"user_id": user_id, "room_id": room_id})
        
        # Notify other users
        await self.broadcast_to_room(room_id, {
            "type": "user_left",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Clean up empty room connections
        if room_id in self.active_connections and not self.active_connections[room_id]:
            del self.active_connections[room_id]
        if room_id in self.room_users and not self.room_users[room_id]:
            del self.room_users[room_id]
        
        logger.info(f"User {user_id} left room {room_id}")
    
    async def update_user_presence(self, user_id: str, room_id: str, 
                                 file_id: Optional[str] = None,
                                 cursor_position: Optional[Dict] = None,
                                 selection: Optional[Dict] = None,
                                 is_typing: bool = False):
        """Update user's presence information"""
        if user_id in self.user_presence:
            presence = self.user_presence[user_id]
            presence.file_id = file_id
            presence.cursor_position = cursor_position
            presence.selection = selection
            presence.is_typing = is_typing
            presence.last_seen = datetime.utcnow()
            
            # Save to database
            await self.db.user_presence.replace_one(
                {"user_id": user_id, "room_id": room_id},
                presence.dict(),
                upsert=True
            )
            
            # Broadcast to room
            await self.broadcast_to_room(room_id, {
                "type": "presence_update",
                "user_id": user_id,
                "presence": presence.dict(),
                "timestamp": datetime.utcnow().isoformat()
            }, exclude_user=user_id)
    
    async def apply_edit_operations(self, file_id: str, operations: List[EditOperation], 
                                  base_version: int) -> Dict:
        """Apply edit operations with operational transform"""
        current_version = self.file_versions.get(file_id, 0)
        
        if base_version != current_version:
            # Need to transform operations against concurrent changes
            if file_id in self.operation_queue:
                # Transform new operations against queued operations
                concurrent_ops = [op for op in self.operation_queue[file_id] 
                                if op.version > base_version]
                
                for new_op in operations:
                    for existing_op in concurrent_ops:
                        new_op, _ = OperationalTransform.transform_operations(new_op, existing_op)
        
        # Apply operations to file
        file_doc = await self.db.files.find_one({"id": file_id})
        if not file_doc:
            raise ValueError(f"File {file_id} not found")
        
        content = file_doc.get("content", "")
        
        # Sort operations by position (reverse for deletions to maintain positions)
        sorted_operations = sorted(operations, key=lambda op: op.position, 
                                 reverse=(operations[0].operation_type == "delete"))
        
        for op in sorted_operations:
            if op.operation_type == "insert":
                content = content[:op.position] + (op.content or "") + content[op.position:]
            elif op.operation_type == "delete":
                end_pos = op.position + (op.length or 0)
                content = content[:op.position] + content[end_pos:]
            # retain operations don't change content
        
        # Update file version
        new_version = current_version + 1
        self.file_versions[file_id] = new_version
        
        # Save to database
        await self.db.files.update_one(
            {"id": file_id},
            {
                "$set": {
                    "content": content,
                    "updated_at": datetime.utcnow(),
                    "version": new_version
                }
            }
        )
        
        # Save operations to database
        for op in operations:
            op.version = new_version
            await self.db.edit_operations.insert_one(op.dict())
        
        # Add to operation queue for conflict resolution
        if file_id not in self.operation_queue:
            self.operation_queue[file_id] = []
        self.operation_queue[file_id].extend(operations)
        
        # Keep only recent operations (last 100)
        self.operation_queue[file_id] = self.operation_queue[file_id][-100:]
        
        return {
            "success": True,
            "new_version": new_version,
            "content": content,
            "operations": [op.dict() for op in operations]
        }
    
    async def send_chat_message(self, room_id: str, user_id: str, message: str, 
                               message_type: str = "text", reply_to: Optional[str] = None,
                               metadata: Optional[Dict] = None) -> ChatMessage:
        """Send chat message to room"""
        chat_msg = ChatMessage(
            room_id=room_id,
            user_id=user_id,
            message=message,
            message_type=message_type,
            reply_to=reply_to,
            metadata=metadata
        )
        
        await self.db.chat_messages.insert_one(chat_msg.dict())
        
        # Broadcast to room
        await self.broadcast_to_room(room_id, {
            "type": "chat_message",
            "message": chat_msg.dict(),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return chat_msg
    
    async def get_chat_history(self, room_id: str, limit: int = 50, 
                              before: Optional[datetime] = None) -> List[ChatMessage]:
        """Get chat history for room"""
        query = {"room_id": room_id, "is_deleted": False}
        if before:
            query["timestamp"] = {"$lt": before}
        
        messages = await self.db.chat_messages.find(query).sort("timestamp", -1).limit(limit).to_list(limit)
        return [ChatMessage(**msg) for msg in reversed(messages)]
    
    async def broadcast_to_room(self, room_id: str, message: Dict, exclude_user: Optional[str] = None):
        """Broadcast message to all users in room"""
        if room_id not in self.active_connections:
            return
        
        message_str = json.dumps(message)
        
        for user_id, websocket in self.active_connections[room_id].items():
            if exclude_user and user_id == exclude_user:
                continue
            
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id} in room {room_id}: {e}")
                # Remove disconnected websocket
                await self.leave_room(room_id, user_id)
    
    async def send_room_state(self, room_id: str, user_id: str):
        """Send current room state to user"""
        if room_id not in self.active_connections or user_id not in self.active_connections[room_id]:
            return
        
        # Get room info
        room = await self.db.rooms.find_one({"id": room_id})
        if not room:
            return
        
        # Get active users
        active_users = []
        for uid in self.room_users.get(room_id, set()):
            user = await self.db.users.find_one({"id": uid})
            if user:
                active_users.append(user)
        
        # Get user presences
        presences = []
        for uid in self.room_users.get(room_id, set()):
            if uid in self.user_presence:
                presences.append(self.user_presence[uid].dict())
        
        # Get recent chat messages
        chat_messages = await self.get_chat_history(room_id, limit=50)
        
        state_message = {
            "type": "room_state",
            "room": room,
            "users": active_users,
            "presences": presences,
            "chat_messages": [msg.dict() for msg in chat_messages],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            websocket = self.active_connections[room_id][user_id]
            await websocket.send_text(json.dumps(state_message))
        except Exception as e:
            logger.error(f"Failed to send room state to user {user_id}: {e}")
    
    async def cleanup_inactive_users(self, max_inactive_minutes: int = 30):
        """Clean up inactive users from rooms"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=max_inactive_minutes)
        
        inactive_presences = await self.db.user_presence.find({
            "last_seen": {"$lt": cutoff_time}
        }).to_list(1000)
        
        for presence_doc in inactive_presences:
            presence = UserPresence(**presence_doc)
            await self.leave_room(presence.room_id, presence.user_id)
            
        logger.info(f"Cleaned up {len(inactive_presences)} inactive users")
    
    def get_room_stats(self, room_id: str) -> Dict:
        """Get statistics for a room"""
        return {
            "room_id": room_id,
            "active_users": len(self.room_users.get(room_id, set())),
            "connections": len(self.active_connections.get(room_id, {})),
            "timestamp": datetime.utcnow().isoformat()
        }