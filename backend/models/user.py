from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v, handler=None):
        # Allow both ObjectId format and string IDs for flexibility
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            # If it's a valid ObjectId format, validate it
            if ObjectId.is_valid(v):
                return str(v)
            # Otherwise, allow string IDs (for demo users, etc.)
            return str(v)
        raise ValueError("Invalid objectid")

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    preferences: Optional[dict] = None

class User(UserBase):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    avatar: Optional[str] = None
    is_active: bool = True
    
    # Subscription fields
    subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    
    # Legacy field for backward compatibility
    is_premium: bool = False
    
    # Profile fields
    preferences: dict = Field(default_factory=dict)
    projects_count: int = 0
    
    # Team management fields
    team_role: str = "owner"  # owner, admin, member, viewer
    team_permissions: List[str] = Field(default_factory=list)
    
    # Usage tracking
    current_usage: Dict[str, Any] = Field(default_factory=dict)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: Optional[datetime] = None
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserInDB(User):
    hashed_password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    is_premium: bool = False
    projects_count: int = 0
    created_at: datetime
    
    # Subscription info
    subscription_id: Optional[str] = None
    current_plan: Optional[str] = None
    subscription_status: Optional[str] = None
    
    # Usage info  
    current_usage: Dict[str, Any] = Field(default_factory=dict)
    
class TeamMember(BaseModel):
    id: str = Field(alias="_id")
    team_owner_id: str  # User who owns the team (subscription holder)
    user_id: str
    email: str
    name: str
    role: str = "member"  # owner, admin, member, viewer
    permissions: List[str] = Field(default_factory=list)
    invited_at: datetime = Field(default_factory=datetime.utcnow)
    joined_at: Optional[datetime] = None
    status: str = "pending"  # pending, active, inactive
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class TeamInvitation(BaseModel):
    id: str = Field(alias="_id")
    team_owner_id: str
    email: str
    role: str = "member"
    permissions: List[str] = Field(default_factory=list)
    token: str  # Invitation token
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = None
    status: str = "pending"  # pending, accepted, expired, revoked
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True