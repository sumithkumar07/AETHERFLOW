#!/usr/bin/env python3
"""
Enterprise Compliance API Routes
Provides SOC2, GDPR, HIPAA compliance tracking endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from datetime import datetime
import json

from services.enterprise_compliance_service import enterprise_compliance_service
from routes.auth import get_current_user

router = APIRouter()

@router.get("/compliance/dashboard")
async def get_compliance_dashboard(current_user: dict = Depends(get_current_user)):
    """Get comprehensive compliance dashboard data"""
    try:
        dashboard_data = await enterprise_compliance_service.get_compliance_dashboard()
        return {
            "success": True,
            "data": dashboard_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get compliance dashboard: {str(e)}")

@router.get("/compliance/soc2/status")
async def get_soc2_status(current_user: dict = Depends(get_current_user)):
    """Get SOC2 compliance status"""
    try:
        soc2_status = await enterprise_compliance_service.get_soc2_status()
        return {
            "success": True,
            "compliance_type": "SOC2",
            "data": soc2_status.dict(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get SOC2 status: {str(e)}")

@router.get("/compliance/gdpr/status")
async def get_gdpr_status(current_user: dict = Depends(get_current_user)):
    """Get GDPR compliance status"""
    try:
        gdpr_status = await enterprise_compliance_service.get_gdpr_status()
        return {
            "success": True,
            "compliance_type": "GDPR",
            "data": gdpr_status.dict(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get GDPR status: {str(e)}")

@router.get("/compliance/hipaa/status")
async def get_hipaa_status(current_user: dict = Depends(get_current_user)):
    """Get HIPAA compliance status"""
    try:
        hipaa_status = await enterprise_compliance_service.get_hipaa_status()
        return {
            "success": True,
            "compliance_type": "HIPAA",
            "data": hipaa_status.dict(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get HIPAA status: {str(e)}")

@router.post("/compliance/audit/log")
async def log_audit_event(
    audit_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Log an audit event for compliance tracking"""
    try:
        required_fields = ["action", "resource", "details"]
        for field in required_fields:
            if field not in audit_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        audit_entry = await enterprise_compliance_service.log_audit_event(
            user_id=current_user.get("id", "unknown"),
            action=audit_data["action"],
            resource=audit_data["resource"],
            details=audit_data["details"]
        )
        
        return {
            "success": True,
            "audit_entry": audit_entry.dict(),
            "message": "Audit event logged successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log audit event: {str(e)}")

@router.get("/compliance/audit/logs")
async def get_audit_logs(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get recent audit logs"""
    try:
        # Get recent audit logs from service
        audit_logs = enterprise_compliance_service.audit_logs[-limit:]
        
        return {
            "success": True,
            "logs": [log.dict() for log in reversed(audit_logs)],
            "total_available": len(enterprise_compliance_service.audit_logs),
            "returned": len(audit_logs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get audit logs: {str(e)}")

@router.get("/compliance/frameworks")
async def get_compliance_frameworks():
    """Get supported compliance frameworks and their requirements"""
    try:
        frameworks = {
            "soc2": {
                "name": "SOC 2",
                "description": "Service Organization Control 2 framework for service providers",
                "trust_principles": ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
                "audit_frequency": "Annual",
                "key_controls": [
                    "Access controls and user provisioning",
                    "System operations and change management", 
                    "Risk management and business continuity",
                    "Vendor management",
                    "Data governance and privacy"
                ]
            },
            "gdpr": {
                "name": "General Data Protection Regulation",
                "description": "EU regulation for data protection and privacy",
                "key_principles": ["Lawfulness", "Transparency", "Purpose Limitation", "Data Minimization", "Accuracy", "Storage Limitation", "Security", "Accountability"],
                "data_subject_rights": ["Access", "Rectification", "Erasure", "Portability", "Object", "Restrict Processing"],
                "breach_notification": "72 hours to supervisory authority",
                "key_requirements": [
                    "Lawful basis for processing",
                    "Privacy notices and consent",
                    "Data subject rights procedures",
                    "Data protection impact assessments",
                    "Records of processing activities"
                ]
            },
            "hipaa": {
                "name": "Health Insurance Portability and Accountability Act",
                "description": "US regulation for protecting health information",
                "safeguard_categories": ["Administrative", "Physical", "Technical"],
                "covered_entities": ["Healthcare Providers", "Health Plans", "Healthcare Clearinghouses"],
                "key_requirements": [
                    "Administrative safeguards (security officer, workforce training)",
                    "Physical safeguards (facility access, workstation use)",
                    "Technical safeguards (access control, audit controls, integrity)",
                    "Breach notification procedures",
                    "Business associate agreements"
                ]
            }
        }
        
        return {
            "success": True,
            "frameworks": frameworks,
            "supported_count": len(frameworks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get compliance frameworks: {str(e)}")

@router.get("/compliance/health")
async def get_compliance_health():
    """Get compliance service health status"""
    try:
        return {
            "status": "healthy",
            "services": {
                "soc2_tracking": "active",
                "gdpr_compliance": "active", 
                "hipaa_monitoring": "active",
                "audit_logging": "active"
            },
            "features": {
                "compliance_dashboard": True,
                "automated_monitoring": True,
                "audit_trail": True,
                "risk_assessment": True,
                "framework_support": True,
                "real_time_alerts": True
            },
            "statistics": {
                "total_audit_events": len(enterprise_compliance_service.audit_logs),
                "compliance_frameworks": 3,
                "monitoring_active": True,
                "last_health_check": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get compliance health: {str(e)}")