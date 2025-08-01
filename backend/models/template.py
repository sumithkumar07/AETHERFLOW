from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TemplateCategory(str, Enum):
    WEB_APP = "web_app"
    API = "api"
    ECOMMERCE = "ecommerce"
    DASHBOARD = "dashboard"
    MOBILE = "mobile"
    LANDING = "landing"

class FileTemplate(BaseModel):
    path: str
    content: str
    language: str = "text"

class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str
    category: TemplateCategory
    tags: List[str] = Field(default_factory=list)
    files: List[FileTemplate] = Field(default_factory=list)
    requirements: Optional[str] = None
    setup_instructions: Optional[str] = None

class Template(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    description: str
    category: TemplateCategory
    tags: List[str] = Field(default_factory=list)
    files: List[FileTemplate] = Field(default_factory=list)
    requirements: Optional[str] = None
    setup_instructions: Optional[str] = None
    featured: bool = False
    downloads: int = 0
    rating: float = 0.0
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True