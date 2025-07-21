from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=50)
    email: Optional[str] = None
    avatar_color: str = Field(default="#3B82F6")  # Default blue
    is_anonymous: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)

class Room(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    is_public: bool = Field(default=True)
    max_users: int = Field(default=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserPresence(BaseModel):
    user_id: str
    room_id: str
    file_id: Optional[str] = None
    cursor_position: Optional[Dict[str, Any]] = None  # {line, column}
    selection: Optional[Dict[str, Any]] = None  # {start, end}
    is_typing: bool = Field(default=False)
    last_seen: datetime = Field(default_factory=datetime.utcnow)

class CollaborationCursor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    file_id: str
    position: Dict[str, int]  # {line, column}
    selection: Optional[Dict[str, Dict[str, int]]] = None  # {start: {line, column}, end: {line, column}}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class EditOperation(BaseModel):
    """Operational Transform model for real-time collaborative editing"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    file_id: str
    operation_type: str = Field(..., pattern="^(insert|delete|retain)$")
    position: int  # Character position in document
    content: Optional[str] = None  # For insert operations
    length: Optional[int] = None  # For delete operations
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: int = Field(default=0)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    user_id: str
    message: str = Field(..., min_length=1, max_length=2000)
    message_type: str = Field(default="text", pattern="^(text|system|code|file_share)$")
    reply_to: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None
    is_deleted: bool = Field(default=False)

class RoomInvite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    invited_by: str
    invited_user: Optional[str] = None  # User ID if registered user
    invite_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    expires_at: datetime
    max_uses: int = Field(default=1)
    uses_count: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FileVersion(BaseModel):
    """Track file versions for conflict resolution"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_id: str
    content: str
    version: int = Field(default=1)
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    operations: List[str] = Field(default_factory=list)  # Operation IDs that led to this version

# Request/Response models for API endpoints
class CreateRoomRequest(BaseModel):
    project_id: str
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_public: bool = Field(default=True)
    max_users: int = Field(default=10, ge=2, le=50)

class JoinRoomRequest(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=50)
    avatar_color: Optional[str] = "#3B82F6"
    invite_code: Optional[str] = None

class SendChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    message_type: str = Field(default="text")
    reply_to: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class UpdatePresenceRequest(BaseModel):
    file_id: Optional[str] = None
    cursor_position: Optional[Dict[str, int]] = None
    selection: Optional[Dict[str, Dict[str, int]]] = None
    is_typing: bool = Field(default=False)

class ApplyEditRequest(BaseModel):
    file_id: str
    operations: List[EditOperation]
    base_version: int = Field(default=0)