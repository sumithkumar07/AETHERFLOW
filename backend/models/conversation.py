from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class MessageType(str, Enum):
    TEXT = "text"
    CODE = "code"
    ERROR = "error"
    FILE = "file"
    DEPLOYMENT = "deployment"

class Message(BaseModel):
    id: Optional[str] = None
    role: MessageRole
    content: str
    type: MessageType = MessageType.TEXT
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    project_id: Optional[str] = None

class Conversation(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    project_id: Optional[str] = None
    messages: List[Message] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True