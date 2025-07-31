from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
import uuid

class ComplianceFramework(str, Enum):
    SOC2 = "soc2"
    GDPR = "gdpr"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"
    ISO_27001 = "iso_27001"
    CUSTOM = "custom"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PolicyType(str, Enum):
    CONTENT_FILTERING = "content_filtering"
    ACCESS_CONTROL = "access_control"
    DATA_RETENTION = "data_retention"
    AUDIT_LOGGING = "audit_logging"
    ENCRYPTION = "encryption"
    APPROVAL_WORKFLOW = "approval_workflow"

class CompliancePolicy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    type: PolicyType
    framework: ComplianceFramework
    rules: List[Dict[str, Any]] = []
    enforcement_level: str = "strict"  # "strict", "warn", "monitor"
    applicable_to: List[str] = []  # Entity types this applies to
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    version: str = "1.0.0"
    active: bool = True

class SafetyCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    check_type: str  # "content", "code", "data", "behavior"
    rules: List[Dict[str, Any]] = []
    risk_level: RiskLevel
    auto_block: bool = True
    notification_required: bool = True
    escalation_path: List[str] = []

class ComplianceViolation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    policy_id: str
    entity_type: str  # "user", "agent", "workflow", "integration"
    entity_id: str
    violation_type: str
    description: str
    risk_level: RiskLevel
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    action_taken: str = "pending"
    evidence: Dict[str, Any] = {}

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    success: bool = True
    compliance_relevant: bool = False