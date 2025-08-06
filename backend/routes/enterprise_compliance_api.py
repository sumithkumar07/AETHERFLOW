"""
Enterprise Compliance API Routes - Complete Implementation
SOC2, GDPR, HIPAA compliance tracking and audit logging endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import logging

from services.enterprise_compliance_complete import get_compliance_system, ComplianceStandard, AuditEventType

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class AuditLogRequest(BaseModel):
    event_type: str = Field(..., description="Type of audit event")
    resource: str = Field(..., description="Resource being accessed")
    action: str = Field(..., description="Action being performed")
    user_id: Optional[str] = Field(None, description="User ID performing the action")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional details")
    ip_address: Optional[str] = Field(None, description="IP address of the user")
    user_agent: Optional[str] = Field(None, description="User agent string")
    compliance_standards: Optional[List[str]] = Field(default_factory=list, description="Applicable compliance standards")

class ComplianceCheckRequest(BaseModel):
    standard: str = Field(..., description="Compliance standard to check")

@router.get("/health")
async def compliance_health_check():
    """Health check for compliance system"""
    try:
        compliance_system = await get_compliance_system()
        return {
            "status": "healthy",
            "service": "Enterprise Compliance System",
            "features": {
                "audit_logging": "active",
                "compliance_monitoring": "active",
                "reporting": "active"
            },
            "standards_supported": ["SOC2", "GDPR", "HIPAA", "ISO27001", "PCI_DSS"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Compliance health check failed: {e}")
        raise HTTPException(status_code=503, detail="Compliance system unavailable")

@router.post("/audit-log")
async def log_audit_event(audit_request: AuditLogRequest):
    """Log an audit event for compliance tracking"""
    try:
        compliance_system = await get_compliance_system()
        
        # Convert string event type to enum
        try:
            event_type = AuditEventType(audit_request.event_type.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid event type: {audit_request.event_type}")
        
        # Convert string standards to enums
        standards = []
        for std_str in audit_request.compliance_standards:
            try:
                standards.append(ComplianceStandard(std_str.upper()))
            except ValueError:
                logger.warning(f"Invalid compliance standard: {std_str}")
        
        if not standards:  # Default to SOC2 and GDPR if none specified
            standards = [ComplianceStandard.SOC2, ComplianceStandard.GDPR]
        
        # Log the audit event
        audit_id = await compliance_system.log_audit_event(
            event_type=event_type,
            resource=audit_request.resource,
            action=audit_request.action,
            user_id=audit_request.user_id,
            details=audit_request.details,
            ip_address=audit_request.ip_address,
            user_agent=audit_request.user_agent,
            compliance_standards=standards
        )
        
        return {
            "success": True,
            "audit_id": audit_id,
            "message": "Audit event logged successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to log audit event: {e}")
        raise HTTPException(status_code=500, detail="Failed to log audit event")

@router.post("/compliance-check")
async def run_compliance_check(check_request: ComplianceCheckRequest):
    """Run compliance check for a specific standard"""
    try:
        compliance_system = await get_compliance_system()
        
        # Convert string to enum
        try:
            standard = ComplianceStandard(check_request.standard.upper())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid compliance standard: {check_request.standard}")
        
        # Run compliance check
        report = await compliance_system.run_compliance_check(standard)
        
        return {
            "success": True,
            "report": {
                "id": report.id,
                "standard": report.standard.value,
                "status": report.status.value,
                "score": report.score,
                "findings": report.findings,
                "recommendations": report.recommendations,
                "timestamp": report.timestamp.isoformat(),
                "next_review_date": report.next_review_date.isoformat()
            },
            "message": f"Compliance check completed for {standard.value}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to run compliance check: {e}")
        raise HTTPException(status_code=500, detail="Failed to run compliance check")

@router.get("/dashboard")
async def get_compliance_dashboard():
    """Get comprehensive compliance dashboard data"""
    try:
        compliance_system = await get_compliance_system()
        dashboard_data = await compliance_system.get_compliance_dashboard()
        
        return {
            "success": True,
            "dashboard": dashboard_data,
            "message": "Compliance dashboard data retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get compliance dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve compliance dashboard")

@router.get("/standards")
async def get_supported_standards():
    """Get list of supported compliance standards"""
    return {
        "success": True,
        "standards": [
            {
                "code": "SOC2",
                "name": "SOC 2 Type II",
                "description": "Service Organization Control 2 - Security, Availability, Processing Integrity, Confidentiality, and Privacy",
                "requirements": [
                    "Security controls and monitoring",
                    "System availability and disaster recovery",
                    "Data processing integrity",
                    "Confidentiality controls",
                    "Privacy protections"
                ]
            },
            {
                "code": "GDPR",
                "name": "General Data Protection Regulation",
                "description": "EU regulation on data protection and privacy",
                "requirements": [
                    "Lawful basis for data processing",
                    "Data subject rights (access, rectification, erasure, portability)",
                    "Privacy by design and default",
                    "Accountability and governance"
                ]
            },
            {
                "code": "HIPAA",
                "name": "Health Insurance Portability and Accountability Act",
                "description": "US healthcare data protection regulation",
                "requirements": [
                    "Administrative safeguards",
                    "Physical safeguards",
                    "Technical safeguards",
                    "Audit controls and logging"
                ]
            }
        ]
    }

@router.post("/audit-logs/export")
async def export_audit_logs(
    start_date: datetime = Body(..., description="Start date for export"),
    end_date: datetime = Body(..., description="End date for export"),
    standards: Optional[List[str]] = Body(default_factory=list, description="Compliance standards to filter by")
):
    """Export audit logs for compliance reporting"""
    try:
        compliance_system = await get_compliance_system()
        
        # Convert string standards to enums
        standard_enums = []
        for std_str in standards:
            try:
                standard_enums.append(ComplianceStandard(std_str.upper()))
            except ValueError:
                logger.warning(f"Invalid compliance standard: {std_str}")
        
        # Export audit logs
        audit_logs = await compliance_system.export_audit_logs(
            start_date=start_date,
            end_date=end_date,
            standards=standard_enums if standard_enums else None
        )
        
        return {
            "success": True,
            "logs": audit_logs,
            "count": len(audit_logs),
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "standards": standards,
            "exported_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to export audit logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to export audit logs")