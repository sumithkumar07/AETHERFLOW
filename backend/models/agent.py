from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
import uuid

class AgentType(str, Enum):
    DEVELOPER = "developer"
    INTEGRATOR = "integrator"
    TESTER = "tester"
    DEPLOYER = "deployer"
    ANALYST = "analyst"
    COORDINATOR = "coordinator"
    SECURITY = "security"
    BUSINESS = "business"

class AgentStatus(str, Enum):
    IDLE = "idle"
    ACTIVE = "active"
    BUSY = "busy"
    ERROR = "error"
    PAUSED = "paused"

class AgentCapability(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = {}
    required_integrations: List[str] = []

class Agent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: AgentType
    description: str
    capabilities: List[AgentCapability] = []
    status: AgentStatus = AgentStatus.IDLE
    model_config: Dict[str, Any] = {}
    integrations: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    team_id: Optional[str] = None
    configuration: Dict[str, Any] = {}
    performance_metrics: Dict[str, Any] = {}

class AgentCreate(BaseModel):
    name: str
    type: AgentType
    description: str
    capabilities: List[AgentCapability] = []
    model_config: Dict[str, Any] = {}
    integrations: List[str] = []
    configuration: Dict[str, Any] = {}

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capabilities: Optional[List[AgentCapability]] = None
    status: Optional[AgentStatus] = None
    model_config: Optional[Dict[str, Any]] = None
    integrations: Optional[List[str]] = None
    configuration: Optional[Dict[str, Any]] = None

class AgentTeam(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    agents: List[str] = []  # Agent IDs
    workflow_config: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str

class TaskExecution(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str
    task_type: str
    task_data: Dict[str, Any]
    status: str = "pending"
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_time: Optional[float] = None