from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum
import uuid

class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class WorkflowTrigger(str, Enum):
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    EVENT_DRIVEN = "event_driven"
    API_CALL = "api_call"
    WEBHOOK = "webhook"

class WorkflowStepType(str, Enum):
    AI_GENERATION = "ai_generation"
    CODE_EXECUTION = "code_execution"
    API_CALL = "api_call"
    DATA_TRANSFORM = "data_transform"
    NOTIFICATION = "notification"
    APPROVAL = "approval"
    INTEGRATION = "integration"
    DEPLOYMENT = "deployment"

class WorkflowStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: WorkflowStepType
    description: str
    configuration: Dict[str, Any] = {}
    inputs: Dict[str, Any] = {}
    outputs: Dict[str, Any] = {}
    conditions: Dict[str, Any] = {}
    retry_config: Dict[str, Any] = {"max_retries": 3, "delay": 5}
    timeout: int = 300  # seconds
    agent_id: Optional[str] = None
    integration_id: Optional[str] = None
    dependencies: List[str] = []  # Step IDs this step depends on
    order: int = 0

class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    version: str = "1.0.0"
    status: WorkflowStatus = WorkflowStatus.DRAFT
    trigger: WorkflowTrigger = WorkflowTrigger.MANUAL
    trigger_config: Dict[str, Any] = {}
    steps: List[WorkflowStep] = []
    variables: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    team_id: Optional[str] = None
    tags: List[str] = []
    execution_stats: Dict[str, Any] = {}

class WorkflowExecution(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workflow_id: str
    workflow_version: str
    status: WorkflowStatus = WorkflowStatus.ACTIVE
    triggered_by: str
    trigger_data: Dict[str, Any] = {}
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    duration: Optional[float] = None
    step_executions: List[Dict[str, Any]] = []
    variables: Dict[str, Any] = {}
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class BusinessProcess(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # "development", "deployment", "testing", "integration"
    workflows: List[str] = []  # Workflow IDs
    approval_chain: List[str] = []  # User IDs for approval
    compliance_requirements: List[str] = []
    business_rules: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str