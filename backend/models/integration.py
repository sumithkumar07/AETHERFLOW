from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
import uuid

class IntegrationType(str, Enum):
    API = "api"
    DATABASE = "database"
    CLOUD_SERVICE = "cloud_service"
    AUTHENTICATION = "authentication"
    PAYMENT = "payment"
    COMMUNICATION = "communication"
    ANALYTICS = "analytics"
    STORAGE = "storage"
    AI_SERVICE = "ai_service"

class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    CONFIGURING = "configuring"

class IntegrationCredential(BaseModel):
    key: str
    value: str
    encrypted: bool = True
    expires_at: Optional[datetime] = None

class Integration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: IntegrationType
    description: str
    provider: str
    version: str = "1.0.0"
    status: IntegrationStatus = IntegrationStatus.INACTIVE
    configuration: Dict[str, Any] = {}
    credentials: List[IntegrationCredential] = []
    endpoints: List[Dict[str, Any]] = []
    rate_limits: Dict[str, Any] = {}
    health_check_url: Optional[str] = None
    documentation_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    usage_stats: Dict[str, Any] = {}

class IntegrationCreate(BaseModel):
    name: str
    type: IntegrationType
    description: str
    provider: str
    version: str = "1.0.0"
    configuration: Dict[str, Any] = {}
    credentials: List[IntegrationCredential] = []
    endpoints: List[Dict[str, Any]] = []

class BusinessConnector(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    system_type: str  # "jira", "confluence", "salesforce", "hubspot", etc.
    connection_config: Dict[str, Any]
    authentication: Dict[str, Any]
    capabilities: List[str] = []
    status: IntegrationStatus = IntegrationStatus.INACTIVE
    last_sync: Optional[datetime] = None
    sync_frequency: str = "hourly"  # "realtime", "hourly", "daily", "manual"
    
class APIConnector(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    base_url: str
    api_version: str
    authentication_type: str  # "bearer", "api_key", "oauth", "basic"
    openapi_spec: Optional[Dict[str, Any]] = None
    endpoints: List[Dict[str, Any]] = []
    rate_limiting: Dict[str, Any] = {}
    status: IntegrationStatus = IntegrationStatus.INACTIVE