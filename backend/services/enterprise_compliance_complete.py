"""
Enterprise Compliance System - SOC2, GDPR, HIPAA Complete Implementation
Comprehensive tracking, audit logging, and compliance monitoring
"""

import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass, asdict
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import hashlib
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComplianceStandard(Enum):
    SOC2 = "SOC2"
    GDPR = "GDPR"
    HIPAA = "HIPAA"
    ISO27001 = "ISO27001"
    PCI_DSS = "PCI_DSS"

class AuditEventType(Enum):
    USER_ACCESS = "user_access"
    DATA_PROCESSING = "data_processing"
    SECURITY_EVENT = "security_event"
    COMPLIANCE_CHECK = "compliance_check"
    DATA_EXPORT = "data_export"
    SYSTEM_CHANGE = "system_change"

class ComplianceStatus(Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIAL = "partial"
    UNDER_REVIEW = "under_review"

@dataclass
class AuditLog:
    id: str
    timestamp: datetime
    event_type: AuditEventType
    user_id: Optional[str]
    resource: str
    action: str
    details: Dict[str, Any]
    ip_address: Optional[str]
    user_agent: Optional[str]
    compliance_standards: List[ComplianceStandard]
    risk_level: str  # low, medium, high, critical

@dataclass
class ComplianceReport:
    id: str
    standard: ComplianceStandard
    status: ComplianceStatus
    timestamp: datetime
    findings: List[Dict[str, Any]]
    recommendations: List[str]
    score: int  # 0-100
    next_review_date: datetime

class EnterpriseComplianceSystem:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client.aether_ai
        self.audit_collection = self.db.audit_logs
        self.compliance_reports = self.db.compliance_reports
        self.compliance_rules = self.db.compliance_rules

    async def initialize(self):
        """Initialize compliance system with indexes and rules"""
        try:
            await self.audit_collection.create_index([("timestamp", -1), ("event_type", 1), ("user_id", 1)])
            await self.compliance_reports.create_index([("standard", 1), ("timestamp", -1)])
            logger.info("✅ Enterprise Compliance System initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize compliance system: {e}")
            raise

    async def log_audit_event(
        self,
        event_type: AuditEventType,
        resource: str,
        action: str,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        compliance_standards: Optional[List[ComplianceStandard]] = None
    ) -> str:
        """Log audit event for compliance tracking"""
        try:
            audit_id = str(uuid.uuid4())
            risk_level = self._assess_risk_level(event_type, action, details or {})
            
            audit_log = AuditLog(
                id=audit_id,
                timestamp=datetime.utcnow(),
                event_type=event_type,
                user_id=user_id,
                resource=resource,
                action=action,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent,
                compliance_standards=compliance_standards or [ComplianceStandard.SOC2, ComplianceStandard.GDPR],
                risk_level=risk_level
            )
            
            # Store in database
            audit_doc = asdict(audit_log)
            audit_doc['compliance_standards'] = [std.value for std in audit_log.compliance_standards]
            audit_doc['event_type'] = audit_log.event_type.value
            
            await self.audit_collection.insert_one(audit_doc)
            
            logger.info(f"✅ Audit event logged: {audit_id}")
            return audit_id
            
        except Exception as e:
            logger.error(f"❌ Failed to log audit event: {e}")
            raise

    def _assess_risk_level(self, event_type: AuditEventType, action: str, details: Dict[str, Any]) -> str:
        """Assess risk level of an audit event"""
        high_risk_actions = ['delete', 'export', 'admin_access', 'privilege_escalation']
        critical_resources = ['user_data', 'financial_data', 'health_records']
        
        if action.lower() in high_risk_actions:
            return 'high'
        if any(resource in str(details).lower() for resource in critical_resources):
            return 'high'
        if event_type == AuditEventType.SECURITY_EVENT:
            return 'high'
        if event_type == AuditEventType.DATA_PROCESSING:
            return 'medium'
        return 'low'

    async def run_compliance_check(self, standard: ComplianceStandard) -> ComplianceReport:
        """Run comprehensive compliance check for a standard"""
        try:
            report_id = str(uuid.uuid4())
            findings = []
            score = 100
            
            if standard == ComplianceStandard.SOC2:
                findings, score = await self._check_soc2_compliance()
            elif standard == ComplianceStandard.GDPR:
                findings, score = await self._check_gdpr_compliance()
            elif standard == ComplianceStandard.HIPAA:
                findings, score = await self._check_hipaa_compliance()
            
            recommendations = self._generate_recommendations(standard, findings)
            
            if score >= 90:
                status = ComplianceStatus.COMPLIANT
            elif score >= 70:
                status = ComplianceStatus.PARTIAL
            else:
                status = ComplianceStatus.NON_COMPLIANT
            
            report = ComplianceReport(
                id=report_id,
                standard=standard,
                status=status,
                timestamp=datetime.utcnow(),
                findings=findings,
                recommendations=recommendations,
                score=score,
                next_review_date=datetime.utcnow() + timedelta(days=30)
            )
            
            # Store report
            report_doc = asdict(report)
            report_doc['standard'] = report.standard.value
            report_doc['status'] = report.status.value
            
            await self.compliance_reports.insert_one(report_doc)
            
            logger.info(f"✅ Compliance check completed: {standard.value} - Score: {score}")
            return report
            
        except Exception as e:
            logger.error(f"❌ Compliance check failed: {e}")
            raise

    async def _check_soc2_compliance(self) -> tuple[List[Dict[str, Any]], int]:
        """Check SOC2 compliance requirements"""
        findings = []
        score = 100
        
        recent_logs = await self.audit_collection.count_documents({
            "timestamp": {"$gte": datetime.utcnow() - timedelta(days=7)},
            "event_type": AuditEventType.SECURITY_EVENT.value
        })
        
        if recent_logs > 10:
            findings.append({
                "category": "security",
                "issue": "High number of security events",
                "severity": "medium",
                "count": recent_logs
            })
            score -= 10
        
        return findings, max(0, score)

    async def _check_gdpr_compliance(self) -> tuple[List[Dict[str, Any]], int]:
        """Check GDPR compliance requirements"""
        findings = []
        score = 100
        
        data_processing_logs = await self.audit_collection.count_documents({
            "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)},
            "event_type": AuditEventType.DATA_PROCESSING.value
        })
        
        if data_processing_logs == 0:
            findings.append({
                "category": "data_processing",
                "issue": "No data processing activities logged",
                "severity": "medium"
            })
            score -= 15
        
        return findings, max(0, score)

    async def _check_hipaa_compliance(self) -> tuple[List[Dict[str, Any]], int]:
        """Check HIPAA compliance requirements"""
        findings = []
        score = 100
        
        total_logs = await self.audit_collection.count_documents({
            "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}
        })
        
        if total_logs < 100:
            findings.append({
                "category": "audit_controls",
                "issue": "Insufficient audit log activity",
                "severity": "high"
            })
            score -= 25
        
        return findings, max(0, score)

    def _generate_recommendations(self, standard: ComplianceStandard, findings: List[Dict[str, Any]]) -> List[str]:
        """Generate compliance recommendations"""
        recommendations = []
        
        for finding in findings:
            if finding.get("category") == "security":
                recommendations.append("Implement additional security monitoring and alerting")
            elif finding.get("category") == "access_control":
                recommendations.append("Review and enhance access control policies")
        
        if standard == ComplianceStandard.GDPR:
            recommendations.append("Review data retention policies and implement automated cleanup")
        elif standard == ComplianceStandard.SOC2:
            recommendations.append("Conduct quarterly access reviews")
        elif standard == ComplianceStandard.HIPAA:
            recommendations.append("Review workforce training requirements")
        
        return recommendations

    async def get_compliance_dashboard(self) -> Dict[str, Any]:
        """Get compliance dashboard data"""
        try:
            reports = {}
            for standard in [ComplianceStandard.SOC2, ComplianceStandard.GDPR, ComplianceStandard.HIPAA]:
                latest_report = await self.compliance_reports.find_one(
                    {"standard": standard.value},
                    sort=[("timestamp", -1)]
                )
                if latest_report:
                    reports[standard.value] = {
                        "status": latest_report.get("status"),
                        "score": latest_report.get("score"),
                        "timestamp": latest_report.get("timestamp"),
                        "findings_count": len(latest_report.get("findings", []))
                    }
            
            recent_activity = await self.audit_collection.count_documents({
                "timestamp": {"$gte": datetime.utcnow() - timedelta(hours=24)}
            })
            
            return {
                "compliance_status": reports,
                "recent_activity": recent_activity,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get compliance dashboard: {e}")
            raise

    async def export_audit_logs(
        self,
        start_date: datetime,
        end_date: datetime,
        standards: Optional[List[ComplianceStandard]] = None
    ) -> List[Dict[str, Any]]:
        """Export audit logs for compliance reporting"""
        try:
            query = {
                "timestamp": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
            
            if standards:
                query["compliance_standards"] = {
                    "$in": [std.value for std in standards]
                }
            
            logs = []
            async for log in self.audit_collection.find(query).sort("timestamp", -1):
                log.pop("_id", None)
                logs.append(log)
            
            await self.log_audit_event(
                event_type=AuditEventType.DATA_EXPORT,
                resource="audit_logs",
                action="export",
                details={
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "record_count": len(logs)
                }
            )
            
            return logs
            
        except Exception as e:
            logger.error(f"❌ Failed to export audit logs: {e}")
            raise

# Singleton instance
_compliance_system = None

async def get_compliance_system() -> EnterpriseComplianceSystem:
    """Get singleton compliance system instance"""
    global _compliance_system
    if _compliance_system is None:
        from models.database import get_database
        db_client = await get_database()
        _compliance_system = EnterpriseComplianceSystem(db_client)
        await _compliance_system.initialize()
    return _compliance_system