from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    BUILDING = "building"
    DEPLOYED = "deployed"
    ERROR = "error"

class ProjectType(str, Enum):
    REACT_APP = "react_app"
    API_SERVICE = "api_service"
    FULL_STACK = "full_stack"
    STATIC_SITE = "static_site"
    MOBILE_APP = "mobile_app"

class FileContent(BaseModel):
    path: str
    content: str
    language: str = "text"

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    type: ProjectType = ProjectType.REACT_APP
    template_id: Optional[str] = None
    requirements: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    files: Optional[List[FileContent]] = None
    deployment_url: Optional[str] = None

class Project(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    name: str
    description: Optional[str] = None
    type: ProjectType
    status: ProjectStatus = ProjectStatus.DRAFT
    template_id: Optional[str] = None
    requirements: Optional[str] = None
    files: List[FileContent] = Field(default_factory=list)
    deployment_url: Optional[str] = None
    build_logs: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True