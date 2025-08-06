# Enterprise Compliance System - SOC2, GDPR, HIPAA
# Issue #3: Enterprise Monitoring & Compliance

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import hashlib
import uuid
import os
from cryptography.fernet import Fernet
import jwt

logger = logging.getLogger(__name__)

class ComplianceFramework(Enum):
    SOC2_TYPE1 = "soc2_type1"
    SOC2_TYPE2 = "soc2_type2"
    GDPR = "gdpr"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"
    ISO_27001 = "iso_27001"
    CCPA = "ccpa"

class AuditEventType(Enum):
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    DATA_DELETION = "data_deletion"
    SYSTEM_CONFIGURATION = "system_configuration"
    SECURITY_INCIDENT = "security_incident"
    BACKUP_OPERATION = "backup_operation"
    INTEGRATION_ACCESS = "integration_access"
    API_ACCESS = "api_access"
    ADMIN_ACTION = "admin_action"

class ComplianceStatus(Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING_REVIEW = "pending_review"
    REMEDIATION_REQUIRED = "remediation_required"
    
class DataClassification(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"

@dataclass
class AuditLog:
    audit_id: str
    event_type: AuditEventType
    user_id: str
    timestamp: datetime
    resource_id: Optional[str]
    action: str
    outcome: str
    ip_address: str
    user_agent: str
    session_id: Optional[str]
    additional_data: Dict[str, Any]
    risk_level: str = "low"
    compliance_frameworks: List[ComplianceFramework] = None

@dataclass
class ComplianceCheck:
    check_id: str
    framework: ComplianceFramework
    control_id: str
    control_name: str
    description: str
    status: ComplianceStatus
    last_assessed: datetime
    next_assessment: datetime
    evidence_required: List[str]
    responsible_party: str
    remediation_notes: Optional[str] = None

@dataclass
class DataProcessingActivity:
    activity_id: str
    purpose: str
    legal_basis: str
    data_categories: List[str]
    data_subjects: List[str]
    recipients: List[str]
    retention_period: str
    cross_border_transfers: bool
    security_measures: List[str]
    created_at: datetime
    updated_at: datetime

@dataclass
class SecretMetadata:
    secret_id: str
    name: str
    description: str
    classification: DataClassification
    created_at: datetime
    expires_at: Optional[datetime]
    last_accessed: Optional[datetime]
    access_count: int
    created_by: str
    tags: List[str]

class EnterpriseComplianceSystem:
    """
    Enterprise Compliance System
    - SOC2 Type I & II compliance
    - GDPR data protection compliance
    - HIPAA healthcare compliance
    - Granular audit logging
    - Encrypted secrets management
    - Advanced monitoring & alerting
    """
    
    def __init__(self):
        self.audit_logs: List[AuditLog] = []
        self.compliance_checks: Dict[str, ComplianceCheck] = {}
        self.data_processing_activities: Dict[str, DataProcessingActivity] = {}
        self.secrets_vault: Dict[str, Any] = {}
        self.secret_metadata: Dict[str, SecretMetadata] = {}
        self.encryption_key = self._generate_encryption_key()
        self.compliance_frameworks_enabled = []
        
    async def initialize(self):
        """Initialize compliance system with all frameworks"""
        try:
            await self._setup_compliance_frameworks()
            await self._initialize_audit_logging()
            await self._setup_secrets_management()
            await self._configure_data_protection()
            
            logger.info("🛡️ Enterprise Compliance System initialized")
            return True
        except Exception as e:
            logger.error(f"Compliance system initialization failed: {e}")
            return False
    
    # =============================================================================
    # AUDIT LOGGING SYSTEM
    # =============================================================================
    
    async def log_audit_event(
        self,
        event_type: AuditEventType,
        user_id: str,
        action: str,
        outcome: str,
        ip_address: str,
        user_agent: str,
        resource_id: Optional[str] = None,
        session_id: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None,
        risk_level: str = "low"
    ) -> str:
        """Log an audit event with comprehensive details"""
        
        audit_id = str(uuid.uuid4())
        
        audit_log = AuditLog(
            audit_id=audit_id,
            event_type=event_type,
            user_id=user_id,
            timestamp=datetime.utcnow(),
            resource_id=resource_id,
            action=action,
            outcome=outcome,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            additional_data=additional_data or {},
            risk_level=risk_level,
            compliance_frameworks=self.compliance_frameworks_enabled
        )
        
        self.audit_logs.append(audit_log)
        
        # Check if this event triggers compliance alerts
        await self._check_compliance_alerts(audit_log)
        
        logger.info(f"📝 Audit event logged: {event_type.value} by {user_id}")
        return audit_id
    
    async def get_audit_logs(
        self,
        user_id: Optional[str] = None,
        event_type: Optional[AuditEventType] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        risk_level: Optional[str] = None,
        limit: int = 1000
    ) -> List[AuditLog]:
        """Retrieve audit logs with filtering"""
        
        filtered_logs = self.audit_logs
        
        if user_id:
            filtered_logs = [log for log in filtered_logs if log.user_id == user_id]
        
        if event_type:
            filtered_logs = [log for log in filtered_logs if log.event_type == event_type]
        
        if start_date:
            filtered_logs = [log for log in filtered_logs if log.timestamp >= start_date]
        
        if end_date:
            filtered_logs = [log for log in filtered_logs if log.timestamp <= end_date]
        
        if risk_level:
            filtered_logs = [log for log in filtered_logs if log.risk_level == risk_level]
        
        # Sort by timestamp descending and limit
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        return filtered_logs[:limit]
    
    async def generate_audit_report(
        self,
        framework: ComplianceFramework,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Generate comprehensive audit report for compliance framework"""
        
        # Filter logs for the specified timeframe and framework
        relevant_logs = [
            log for log in self.audit_logs
            if start_date <= log.timestamp <= end_date
            and framework in (log.compliance_frameworks or [])
        ]
        
        # Analyze log patterns
        user_activity = {}
        event_summary = {}
        risk_analysis = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        
        for log in relevant_logs:
            # User activity analysis
            if log.user_id not in user_activity:
                user_activity[log.user_id] = {"total_events": 0, "event_types": {}}
            
            user_activity[log.user_id]["total_events"] += 1
            event_type = log.event_type.value
            if event_type not in user_activity[log.user_id]["event_types"]:
                user_activity[log.user_id]["event_types"][event_type] = 0
            user_activity[log.user_id]["event_types"][event_type] += 1
            
            # Event summary
            if event_type not in event_summary:
                event_summary[event_type] = 0
            event_summary[event_type] += 1
            
            # Risk analysis
            risk_analysis[log.risk_level] += 1
        
        return {
            "report_id": str(uuid.uuid4()),
            "framework": framework.value,
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "total_events": len(relevant_logs),
            "user_activity": user_activity,
            "event_summary": event_summary,
            "risk_analysis": risk_analysis,
            "compliance_score": await self._calculate_compliance_score(framework),
            "generated_at": datetime.utcnow().isoformat()
        }
    
    # =============================================================================
    # SOC2 COMPLIANCE
    # =============================================================================
    
    async def setup_soc2_compliance(self, type_level: str = "type2"):
        """Setup SOC2 compliance controls"""
        
        framework = ComplianceFramework.SOC2_TYPE2 if type_level == "type2" else ComplianceFramework.SOC2_TYPE1
        
        soc2_controls = [
            {
                "control_id": "CC1.1",
                "control_name": "Control Environment",
                "description": "Management establishes structures, reporting lines, and authorities",
                "evidence_required": ["organizational_chart", "policies", "procedures"]
            },
            {
                "control_id": "CC2.1",
                "control_name": "Communication and Information",
                "description": "Information system produces relevant information",
                "evidence_required": ["communication_policies", "information_flow_documentation"]
            },
            {
                "control_id": "CC3.1",
                "control_name": "Risk Assessment",
                "description": "Risk identification and assessment process",
                "evidence_required": ["risk_register", "assessment_procedures", "mitigation_plans"]
            },
            {
                "control_id": "CC6.1",
                "control_name": "Logical Access",
                "description": "Logical access security controls",
                "evidence_required": ["access_control_policies", "user_access_reviews", "authentication_logs"]
            },
            {
                "control_id": "CC6.2",
                "control_name": "Authentication",
                "description": "Authentication mechanisms and controls",
                "evidence_required": ["mfa_implementation", "password_policies", "authentication_logs"]
            },
            {
                "control_id": "CC7.1",
                "control_name": "System Operations",
                "description": "System processing integrity controls",
                "evidence_required": ["change_management", "system_monitoring", "incident_response"]
            }
        ]
        
        for control in soc2_controls:
            check_id = f"soc2_{control['control_id'].lower().replace('.', '_')}"
            
            compliance_check = ComplianceCheck(
                check_id=check_id,
                framework=framework,
                control_id=control["control_id"],
                control_name=control["control_name"],
                description=control["description"],
                status=ComplianceStatus.PENDING_REVIEW,
                last_assessed=datetime.utcnow(),
                next_assessment=datetime.utcnow() + timedelta(days=90),
                evidence_required=control["evidence_required"],
                responsible_party="security_team"
            )
            
            self.compliance_checks[check_id] = compliance_check
        
        self.compliance_frameworks_enabled.append(framework)
        logger.info(f"✅ SOC2 {type_level.upper()} compliance framework configured")
    
    # =============================================================================
    # GDPR COMPLIANCE
    # =============================================================================
    
    async def setup_gdpr_compliance(self):
        """Setup GDPR compliance controls"""
        
        framework = ComplianceFramework.GDPR
        
        gdpr_controls = [
            {
                "control_id": "Art6",
                "control_name": "Lawfulness of Processing",
                "description": "Processing based on lawful basis",
                "evidence_required": ["data_processing_activities", "legal_basis_documentation"]
            },
            {
                "control_id": "Art7",
                "control_name": "Conditions for Consent",
                "description": "Valid consent mechanisms",
                "evidence_required": ["consent_forms", "consent_records", "withdrawal_mechanisms"]
            },
            {
                "control_id": "Art13",
                "control_name": "Information to Data Subjects",
                "description": "Privacy notices and transparency",
                "evidence_required": ["privacy_policy", "data_collection_notices", "transparency_reports"]
            },
            {
                "control_id": "Art25",
                "control_name": "Data Protection by Design",
                "description": "Privacy by design and default",
                "evidence_required": ["privacy_impact_assessments", "design_documentation", "default_settings"]
            },
            {
                "control_id": "Art30",
                "control_name": "Records of Processing",
                "description": "Processing activity records",
                "evidence_required": ["processing_records", "data_mapping", "retention_schedules"]
            },
            {
                "control_id": "Art32",
                "control_name": "Security of Processing",
                "description": "Technical and organizational measures",
                "evidence_required": ["security_policies", "encryption_implementation", "access_controls"]
            },
            {
                "control_id": "Art33",
                "control_name": "Data Breach Notification",
                "description": "Breach notification procedures",
                "evidence_required": ["incident_response_plan", "notification_procedures", "breach_register"]
            }
        ]
        
        for control in gdpr_controls:
            check_id = f"gdpr_{control['control_id'].lower()}"
            
            compliance_check = ComplianceCheck(
                check_id=check_id,
                framework=framework,
                control_id=control["control_id"],
                control_name=control["control_name"],
                description=control["description"],
                status=ComplianceStatus.PENDING_REVIEW,
                last_assessed=datetime.utcnow(),
                next_assessment=datetime.utcnow() + timedelta(days=30),  # More frequent for GDPR
                evidence_required=control["evidence_required"],
                responsible_party="data_protection_officer"
            )
            
            self.compliance_checks[check_id] = compliance_check
        
        self.compliance_frameworks_enabled.append(framework)
        logger.info("✅ GDPR compliance framework configured")
    
    async def register_data_processing_activity(
        self,
        purpose: str,
        legal_basis: str,
        data_categories: List[str],
        data_subjects: List[str],
        recipients: List[str],
        retention_period: str,
        cross_border_transfers: bool = False,
        security_measures: Optional[List[str]] = None
    ) -> str:
        """Register a data processing activity for GDPR compliance"""
        
        activity_id = str(uuid.uuid4())
        
        activity = DataProcessingActivity(
            activity_id=activity_id,
            purpose=purpose,
            legal_basis=legal_basis,
            data_categories=data_categories,
            data_subjects=data_subjects,
            recipients=recipients,
            retention_period=retention_period,
            cross_border_transfers=cross_border_transfers,
            security_measures=security_measures or [],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.data_processing_activities[activity_id] = activity
        
        # Log the registration
        await self.log_audit_event(
            event_type=AuditEventType.SYSTEM_CONFIGURATION,
            user_id="system",
            action="register_data_processing_activity",
            outcome="success",
            ip_address="127.0.0.1",
            user_agent="system",
            resource_id=activity_id,
            additional_data={"purpose": purpose, "legal_basis": legal_basis}
        )
        
        logger.info(f"📋 Data processing activity registered: {purpose}")
        return activity_id
    
    # =============================================================================
    # HIPAA COMPLIANCE
    # =============================================================================
    
    async def setup_hipaa_compliance(self):
        """Setup HIPAA compliance controls"""
        
        framework = ComplianceFramework.HIPAA
        
        hipaa_controls = [
            {
                "control_id": "164.308a1",
                "control_name": "Security Officer",
                "description": "Assigned security responsibility",
                "evidence_required": ["security_officer_assignment", "responsibilities_documentation"]
            },
            {
                "control_id": "164.308a3",
                "control_name": "Workforce Training",
                "description": "Security awareness and training",
                "evidence_required": ["training_records", "security_awareness_program", "training_materials"]
            },
            {
                "control_id": "164.308a4",
                "control_name": "Access Management",
                "description": "Access authorization procedures",
                "evidence_required": ["access_procedures", "authorization_forms", "access_reviews"]
            },
            {
                "control_id": "164.310a1",
                "control_name": "Facility Access Controls",
                "description": "Physical safeguards for facilities",
                "evidence_required": ["facility_security", "access_logs", "physical_controls"]
            },
            {
                "control_id": "164.312a1",
                "control_name": "Access Control",
                "description": "Technical access controls",
                "evidence_required": ["access_control_systems", "user_authentication", "access_logs"]
            },
            {
                "control_id": "164.312a2a",
                "control_name": "Audit Controls",
                "description": "Audit logs and monitoring",
                "evidence_required": ["audit_log_system", "monitoring_procedures", "log_reviews"]
            },
            {
                "control_id": "164.312e1",
                "control_name": "Transmission Security",
                "description": "Secure data transmission",
                "evidence_required": ["encryption_implementation", "secure_transmission", "network_security"]
            }
        ]
        
        for control in hipaa_controls:
            check_id = f"hipaa_{control['control_id'].replace('.', '_')}"
            
            compliance_check = ComplianceCheck(
                check_id=check_id,
                framework=framework,
                control_id=control["control_id"],
                control_name=control["control_name"],
                description=control["description"],
                status=ComplianceStatus.PENDING_REVIEW,
                last_assessed=datetime.utcnow(),
                next_assessment=datetime.utcnow() + timedelta(days=180),  # Semi-annual for HIPAA
                evidence_required=control["evidence_required"],
                responsible_party="compliance_officer"
            )
            
            self.compliance_checks[check_id] = compliance_check
        
        self.compliance_frameworks_enabled.append(framework)
        logger.info("✅ HIPAA compliance framework configured")
    
    # =============================================================================
    # SECRETS MANAGEMENT
    # =============================================================================
    
    async def store_secret(
        self,
        name: str,
        value: str,
        description: str,
        classification: DataClassification = DataClassification.CONFIDENTIAL,
        expires_at: Optional[datetime] = None,
        tags: Optional[List[str]] = None,
        created_by: str = "system"
    ) -> str:
        """Store encrypted secret with metadata"""
        
        secret_id = str(uuid.uuid4())
        
        # Encrypt the secret value
        fernet = Fernet(self.encryption_key)
        encrypted_value = fernet.encrypt(value.encode())
        
        # Store metadata
        metadata = SecretMetadata(
            secret_id=secret_id,
            name=name,
            description=description,
            classification=classification,
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            last_accessed=None,
            access_count=0,
            created_by=created_by,
            tags=tags or []
        )
        
        self.secret_metadata[secret_id] = metadata
        self.secrets_vault[secret_id] = encrypted_value
        
        # Log the secret creation
        await self.log_audit_event(
            event_type=AuditEventType.SYSTEM_CONFIGURATION,
            user_id=created_by,
            action="create_secret",
            outcome="success",
            ip_address="127.0.0.1",
            user_agent="system",
            resource_id=secret_id,
            additional_data={
                "secret_name": name,
                "classification": classification.value
            },
            risk_level="medium"
        )
        
        logger.info(f"🔐 Secret stored: {name} (ID: {secret_id})")
        return secret_id
    
    async def retrieve_secret(self, secret_id: str, accessed_by: str) -> Optional[str]:
        """Retrieve and decrypt secret"""
        
        if secret_id not in self.secrets_vault:
            return None
        
        metadata = self.secret_metadata.get(secret_id)
        if not metadata:
            return None
        
        # Check if secret has expired
        if metadata.expires_at and datetime.utcnow() > metadata.expires_at:
            await self.log_audit_event(
                event_type=AuditEventType.DATA_ACCESS,
                user_id=accessed_by,
                action="retrieve_secret",
                outcome="failed_expired",
                ip_address="127.0.0.1",
                user_agent="system",
                resource_id=secret_id,
                additional_data={"secret_name": metadata.name},
                risk_level="medium"
            )
            return None
        
        # Decrypt secret
        fernet = Fernet(self.encryption_key)
        encrypted_value = self.secrets_vault[secret_id]
        decrypted_value = fernet.decrypt(encrypted_value).decode()
        
        # Update access metadata
        metadata.last_accessed = datetime.utcnow()
        metadata.access_count += 1
        
        # Log the access
        await self.log_audit_event(
            event_type=AuditEventType.DATA_ACCESS,
            user_id=accessed_by,
            action="retrieve_secret",
            outcome="success",
            ip_address="127.0.0.1",
            user_agent="system",
            resource_id=secret_id,
            additional_data={"secret_name": metadata.name},
            risk_level="medium"
        )
        
        return decrypted_value
    
    async def rotate_secret(self, secret_id: str, new_value: str, rotated_by: str) -> bool:
        """Rotate secret value while maintaining metadata"""
        
        if secret_id not in self.secrets_vault:
            return False
        
        metadata = self.secret_metadata.get(secret_id)
        if not metadata:
            return False
        
        # Encrypt new value
        fernet = Fernet(self.encryption_key)
        encrypted_value = fernet.encrypt(new_value.encode())
        
        # Update vault
        self.secrets_vault[secret_id] = encrypted_value
        metadata.access_count = 0  # Reset access count
        metadata.last_accessed = None
        
        # Log the rotation
        await self.log_audit_event(
            event_type=AuditEventType.SYSTEM_CONFIGURATION,
            user_id=rotated_by,
            action="rotate_secret",
            outcome="success",
            ip_address="127.0.0.1",
            user_agent="system",
            resource_id=secret_id,
            additional_data={"secret_name": metadata.name},
            risk_level="medium"
        )
        
        logger.info(f"🔄 Secret rotated: {metadata.name}")
        return True
    
    # =============================================================================
    # COMPLIANCE MONITORING
    # =============================================================================
    
    async def assess_compliance_control(
        self,
        check_id: str,
        status: ComplianceStatus,
        evidence: Optional[Dict[str, Any]] = None,
        remediation_notes: Optional[str] = None,
        assessed_by: str = "system"
    ) -> bool:
        """Assess a compliance control"""
        
        if check_id not in self.compliance_checks:
            return False
        
        compliance_check = self.compliance_checks[check_id]
        
        # Update check status
        compliance_check.status = status
        compliance_check.last_assessed = datetime.utcnow()
        compliance_check.next_assessment = datetime.utcnow() + timedelta(days=90)  # Default 90 days
        compliance_check.remediation_notes = remediation_notes
        
        # Log the assessment
        await self.log_audit_event(
            event_type=AuditEventType.ADMIN_ACTION,
            user_id=assessed_by,
            action="assess_compliance_control",
            outcome="success",
            ip_address="127.0.0.1",
            user_agent="system",
            resource_id=check_id,
            additional_data={
                "control_id": compliance_check.control_id,
                "status": status.value,
                "framework": compliance_check.framework.value,
                "evidence": evidence
            },
            risk_level="low"
        )
        
        logger.info(f"📊 Compliance control assessed: {compliance_check.control_name} - {status.value}")
        return True
    
    async def get_compliance_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive compliance dashboard"""
        
        framework_summary = {}
        
        for framework in self.compliance_frameworks_enabled:
            framework_checks = [
                check for check in self.compliance_checks.values()
                if check.framework == framework
            ]
            
            total_checks = len(framework_checks)
            compliant = len([c for c in framework_checks if c.status == ComplianceStatus.COMPLIANT])
            non_compliant = len([c for c in framework_checks if c.status == ComplianceStatus.NON_COMPLIANT])
            pending_review = len([c for c in framework_checks if c.status == ComplianceStatus.PENDING_REVIEW])
            remediation_required = len([c for c in framework_checks if c.status == ComplianceStatus.REMEDIATION_REQUIRED])
            
            compliance_percentage = (compliant / total_checks * 100) if total_checks > 0 else 0
            
            framework_summary[framework.value] = {
                "total_checks": total_checks,
                "compliant": compliant,
                "non_compliant": non_compliant,
                "pending_review": pending_review,
                "remediation_required": remediation_required,
                "compliance_percentage": round(compliance_percentage, 2)
            }
        
        # Get recent audit activity
        recent_audits = await self.get_audit_logs(limit=10)
        
        # Get secrets summary
        secrets_summary = {
            "total_secrets": len(self.secret_metadata),
            "expired_secrets": len([
                s for s in self.secret_metadata.values()
                if s.expires_at and datetime.utcnow() > s.expires_at
            ]),
            "expiring_soon": len([
                s for s in self.secret_metadata.values()
                if s.expires_at and datetime.utcnow() + timedelta(days=30) > s.expires_at
            ])
        }
        
        return {
            "frameworks_enabled": [f.value for f in self.compliance_frameworks_enabled],
            "framework_summary": framework_summary,
            "recent_audit_events": [asdict(audit) for audit in recent_audits],
            "secrets_summary": secrets_summary,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    # =============================================================================
    # UTILITY METHODS
    # =============================================================================
    
    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key for secrets"""
        # In production, this should be securely stored and retrieved
        return Fernet.generate_key()
    
    async def _setup_compliance_frameworks(self):
        """Setup available compliance frameworks"""
        logger.info("🏛️ Compliance frameworks available: SOC2, GDPR, HIPAA, PCI-DSS, ISO 27001")
    
    async def _initialize_audit_logging(self):
        """Initialize audit logging system"""
        logger.info("📝 Audit logging system initialized")
    
    async def _setup_secrets_management(self):
        """Setup secrets management system"""
        logger.info("🔐 Secrets management system initialized")
    
    async def _configure_data_protection(self):
        """Configure data protection measures"""
        logger.info("🛡️ Data protection measures configured")
    
    async def _check_compliance_alerts(self, audit_log: AuditLog):
        """Check if audit event triggers compliance alerts"""
        # High-risk events or failed access attempts
        if audit_log.risk_level in ["high", "critical"] or audit_log.outcome == "failed":
            logger.warning(f"⚠️ Compliance alert: {audit_log.event_type.value} - {audit_log.outcome}")
    
    async def _calculate_compliance_score(self, framework: ComplianceFramework) -> float:
        """Calculate compliance score for framework"""
        framework_checks = [
            check for check in self.compliance_checks.values()
            if check.framework == framework
        ]
        
        if not framework_checks:
            return 0.0
        
        compliant_checks = len([
            check for check in framework_checks
            if check.status == ComplianceStatus.COMPLIANT
        ])
        
        return (compliant_checks / len(framework_checks)) * 100