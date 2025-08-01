from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from models.user import get_current_user
from services.zero_trust_security import ZeroTrustGateway, ComplianceEngine, AccessRequest, SecurityContext

router = APIRouter()
logger = logging.getLogger(__name__)

# Global security instances
zero_trust_gateway: Optional[ZeroTrustGateway] = None
compliance_engine: Optional[ComplianceEngine] = None

def set_security_services(gateway_instance: ZeroTrustGateway, compliance_instance: ComplianceEngine):
    global zero_trust_gateway, compliance_engine
    zero_trust_gateway = gateway_instance
    compliance_engine = compliance_instance

@router.post("/validate-access")
async def validate_access_request(
    request_data: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Validate access request through Zero Trust gateway"""
    try:
        if not zero_trust_gateway:
            raise HTTPException(status_code=500, detail="Zero Trust gateway not initialized")
        
        # Create security context
        security_context = SecurityContext(
            user_id=current_user["user_id"],
            session_id=request_data.get("session_id", ""),
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent", ""),
            location=request_data.get("location"),
            device_fingerprint=request_data.get("device_fingerprint", ""),
            risk_score=0.0
        )
        
        # Create access request
        access_request = AccessRequest(
            user_id=current_user["user_id"],
            resource=request_data.get("resource", ""),
            action=request_data.get("action", ""),
            context=security_context,
            metadata=request_data.get("metadata", {})
        )
        
        # Validate through Zero Trust
        validation_result = await zero_trust_gateway.validate_request(access_request)
        
        return {
            "success": True,
            "validation_result": validation_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error validating access request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/security-score")
async def get_security_score(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's current security score"""
    try:
        # Mock security score calculation
        security_score = {
            "overall_score": 85,
            "factors": {
                "authentication_strength": 90,
                "device_trust": 80,
                "behavior_consistency": 88,
                "location_patterns": 82,
                "access_patterns": 87
            },
            "recent_activities": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "activity": "Successful login",
                    "risk_level": "low",
                    "location": "San Francisco, CA"
                },
                {
                    "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                    "activity": "API access",
                    "risk_level": "low",
                    "location": "San Francisco, CA"
                }
            ],
            "recommendations": [
                "Enable two-factor authentication for higher security",
                "Review and update your password",
                "Check recent login locations"
            ]
        }
        
        return {
            "success": True,
            "security_score": security_score,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting security score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audit-log")
async def get_audit_log(
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's audit log"""
    try:
        # Mock audit log data
        audit_entries = []
        for i in range(min(limit, 20)):
            audit_entries.append({
                "timestamp": (datetime.now() - timedelta(hours=i)).isoformat(),
                "action": f"Action {i+1}",
                "resource": f"Resource {i+1}",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0...",
                "result": "success" if i % 4 != 0 else "blocked",
                "risk_score": 0.1 + (i % 5) * 0.1
            })
        
        return {
            "success": True,
            "audit_log": audit_entries,
            "total_entries": len(audit_entries),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting audit log: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classify-data")
async def classify_data(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Classify data for compliance"""
    try:
        if not compliance_engine:
            raise HTTPException(status_code=500, detail="Compliance engine not initialized")
        
        data = request.get("data", "")
        context = request.get("context", {})
        
        if not data:
            raise HTTPException(status_code=400, detail="Data is required")
        
        context["owner"] = current_user["user_id"]
        
        classification_result = await compliance_engine.classify_data(data, context)
        
        return {
            "success": True,
            "classification": classification_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error classifying data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/data-subject-request")
async def handle_data_subject_request(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Handle GDPR data subject requests"""
    try:
        if not compliance_engine:
            raise HTTPException(status_code=500, detail="Compliance engine not initialized")
        
        request_type = request.get("type", "")
        details = request.get("details", {})
        
        if not request_type:
            raise HTTPException(status_code=400, detail="Request type is required")
        
        valid_types = ["access", "deletion", "portability", "rectification"]
        if request_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid request type. Must be one of: {valid_types}")
        
        result = await compliance_engine.handle_data_subject_request(
            request_type, current_user["user_id"], details
        )
        
        return {
            "success": True,
            "request_type": request_type,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error handling data subject request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compliance-status")
async def get_compliance_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get compliance status and requirements"""
    try:
        # Mock compliance status
        compliance_status = {
            "overall_status": "compliant",
            "frameworks": {
                "GDPR": {
                    "status": "compliant",
                    "score": 95,
                    "requirements_met": 18,
                    "total_requirements": 19,
                    "issues": ["Data retention policy needs review"]
                },
                "SOC2": {
                    "status": "compliant",
                    "score": 88,
                    "requirements_met": 42,
                    "total_requirements": 48,
                    "issues": ["Access controls need strengthening"]
                },
                "HIPAA": {
                    "status": "not_applicable",
                    "score": 0,
                    "requirements_met": 0,
                    "total_requirements": 0,
                    "issues": []
                }
            },
            "data_classification": {
                "public": 45,
                "internal": 234,
                "confidential": 12,
                "restricted": 3
            },
            "recent_audits": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "type": "automated",
                    "result": "passed",
                    "findings": 0
                }
            ],
            "next_review": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        return {
            "success": True,
            "compliance_status": compliance_status,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/threat-alerts")
async def get_threat_alerts(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get current threat alerts"""
    try:
        # Mock threat alerts data
        alerts = [
            {
                "id": "alert_001",
                "severity": "medium",
                "type": "unusual_location",
                "description": "Login from new location detected",
                "timestamp": datetime.now().isoformat(),
                "resolved": False,
                "details": {
                    "location": "New York, NY",
                    "ip_address": "203.0.113.1",
                    "confidence": 0.7
                }
            },
            {
                "id": "alert_002",
                "severity": "low",
                "type": "rapid_requests",
                "description": "Higher than normal API request rate",
                "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
                "resolved": True,
                "details": {
                    "request_count": 150,
                    "time_window": "5 minutes",
                    "confidence": 0.4
                }
            }
        ]
        
        return {
            "success": True,
            "alerts": alerts,
            "total_alerts": len(alerts),
            "unresolved_count": len([a for a in alerts if not a["resolved"]]),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting threat alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/resolve")
async def resolve_threat_alert(
    alert_id: str,
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Resolve a threat alert"""
    try:
        resolution_notes = request.get("notes", "")
        
        # Mock alert resolution
        return {
            "success": True,
            "alert_id": alert_id,
            "resolved_by": current_user["user_id"],
            "resolution_notes": resolution_notes,
            "resolved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error resolving threat alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))