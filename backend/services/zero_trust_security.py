import logging
import asyncio
import json
import hashlib
import hmac
import time
import ipaddress
from typing import Dict, Any, List, Optional, Set, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import jwt
import bcrypt
from cryptography.fernet import Fernet
import re

logger = logging.getLogger(__name__)

class SecurityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high" 
    CRITICAL = "critical"

class ThreatType(Enum):
    BRUTE_FORCE = "brute_force"
    UNUSUAL_LOCATION = "unusual_location"
    RAPID_REQUESTS = "rapid_requests"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    DATA_EXFILTRATION = "data_exfiltration"

class DataClassification(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"

@dataclass
class SecurityContext:
    user_id: str
    session_id: str
    ip_address: str
    user_agent: str
    location: Optional[Dict[str, str]]
    device_fingerprint: str
    risk_score: float = 0.0
    threats_detected: List[ThreatType] = field(default_factory=list)
    last_activity: datetime = field(default_factory=datetime.now)

@dataclass
class AccessRequest:
    user_id: str
    resource: str
    action: str
    context: SecurityContext
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SecurityAlert:
    alert_id: str
    threat_type: ThreatType
    severity: SecurityLevel
    user_id: str
    description: str
    evidence: Dict[str, Any]
    timestamp: datetime
    resolved: bool = False

@dataclass
class DataItem:
    content: Any
    classification: DataClassification
    owner: str
    created_at: datetime
    access_log: List[Dict[str, Any]] = field(default_factory=list)
    encryption_required: bool = False
    retention_period: Optional[timedelta] = None

class ZeroTrustGateway:
    """Zero-Trust Security Architecture - Every request verified, no implicit trust"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.behavioral_analyzer = BehavioralAnalyzer()
        self.threat_detector = ThreatDetector()
        self.access_controller = AccessController()
        self.session_manager = SessionManager()
        self.audit_logger = AuditLogger(db_client)
        self.rate_limiter = RateLimiter()
        self.geo_analyzer = GeoLocationAnalyzer()
        self.initialized = False
    
    async def initialize(self):
        """Initialize Zero Trust Gateway"""
        try:
            await self.audit_logger.initialize()
            await self.behavioral_analyzer.initialize()
            await self.threat_detector.initialize()
            self.initialized = True
            logger.info("Zero Trust Gateway initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Zero Trust Gateway: {e}")
            raise
    
    async def validate_request(self, request: AccessRequest) -> Dict[str, Any]:
        """Validate every request through Zero Trust principles"""
        try:
            validation_result = {
                "allowed": False,
                "confidence": 0.0,
                "reasons": [],
                "additional_verification_required": False,
                "session_actions": []
            }
            
            # 1. Verify user identity
            identity_check = await self._verify_user_identity(request)
            if not identity_check["valid"]:
                validation_result["reasons"].append("Identity verification failed")
                await self._log_security_event(request, "IDENTITY_VERIFICATION_FAILED")
                return validation_result
            
            # 2. Check resource permissions  
            permission_check = await self._check_resource_permissions(request)
            if not permission_check["allowed"]:
                validation_result["reasons"].append("Insufficient permissions")
                await self._log_security_event(request, "PERMISSION_DENIED")
                return validation_result
            
            # 3. Validate request pattern
            pattern_check = await self._validate_request_pattern(request)
            if not pattern_check["valid"]:
                validation_result["reasons"].append("Suspicious request pattern")
                validation_result["additional_verification_required"] = True
            
            # 4. Scan for anomalies
            anomaly_check = await self._scan_for_anomalies(request)
            if anomaly_check["threats_detected"]:
                validation_result["reasons"].extend([
                    f"Threat detected: {threat}" for threat in anomaly_check["threats_detected"]
                ])
                if anomaly_check["severity"] == SecurityLevel.CRITICAL:
                    validation_result["session_actions"].append("TERMINATE_SESSION")
                    return validation_result
            
            # 5. Rate limiting check
            rate_limit_check = await self.rate_limiter.check_rate_limit(
                request.user_id, 
                request.resource, 
                request.context.ip_address
            )
            if not rate_limit_check["allowed"]:
                validation_result["reasons"].append("Rate limit exceeded")
                return validation_result
            
            # Calculate overall confidence
            confidence_factors = [
                identity_check.get("confidence", 0.0),
                permission_check.get("confidence", 0.0),
                pattern_check.get("confidence", 0.0),
                1.0 - anomaly_check.get("risk_score", 0.0)
            ]
            validation_result["confidence"] = sum(confidence_factors) / len(confidence_factors)
            
            # Final decision
            if validation_result["confidence"] > 0.7:
                validation_result["allowed"] = True
                validation_result["reasons"] = ["Access granted - high confidence"]
            elif validation_result["confidence"] > 0.5:
                validation_result["allowed"] = True
                validation_result["additional_verification_required"] = True
                validation_result["reasons"] = ["Access granted - additional verification recommended"]
            
            # Log successful access
            if validation_result["allowed"]:
                await self._log_security_event(request, "ACCESS_GRANTED")
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error in Zero Trust validation: {e}")
            await self._log_security_event(request, "VALIDATION_ERROR", {"error": str(e)})
            return {
                "allowed": False,
                "reasons": ["Security validation error"],
                "confidence": 0.0
            }
    
    async def _verify_user_identity(self, request: AccessRequest) -> Dict[str, Any]:
        """Verify user identity with multiple factors"""
        try:
            # Check JWT token validity
            token = request.metadata.get("token")
            if not token:
                return {"valid": False, "reason": "No authentication token"}
            
            try:
                payload = jwt.decode(token, "secret", algorithms=["HS256"])  # Use proper secret in production
                token_user_id = payload.get("user_id")
                
                if token_user_id != request.user_id:
                    return {"valid": False, "reason": "Token user mismatch"}
                
                # Check token expiration
                exp = payload.get("exp")
                if exp and datetime.fromtimestamp(exp) < datetime.now():
                    return {"valid": False, "reason": "Token expired"}
                
            except jwt.InvalidTokenError:
                return {"valid": False, "reason": "Invalid token"}
            
            # Check session validity
            session_valid = await self.session_manager.validate_session(
                request.user_id, 
                request.context.session_id
            )
            if not session_valid:
                return {"valid": False, "reason": "Invalid session"}
            
            # Device fingerprint check
            device_check = await self._verify_device_fingerprint(request)
            
            # Behavioral analysis
            behavior_score = await self.behavioral_analyzer.analyze_user_behavior(request)
            
            confidence = 0.8  # Base confidence
            if device_check["recognized"]:
                confidence += 0.15
            if behavior_score > 0.8:
                confidence += 0.05
            
            return {
                "valid": True,
                "confidence": min(confidence, 1.0),
                "factors_verified": ["token", "session", "device", "behavior"]
            }
            
        except Exception as e:
            logger.error(f"Error verifying user identity: {e}")
            return {"valid": False, "reason": "Identity verification error"}
    
    async def _check_resource_permissions(self, request: AccessRequest) -> Dict[str, Any]:
        """Check if user has permission to access resource"""
        try:
            # Get user permissions from database
            permissions = await self.access_controller.get_user_permissions(request.user_id)
            
            # Check resource-specific permissions
            resource_permissions = permissions.get(request.resource, [])
            
            # Check if action is allowed
            allowed = request.action in resource_permissions or "all" in resource_permissions
            
            # Check for admin privileges
            if not allowed and "admin" in permissions.get("roles", []):
                allowed = True
            
            # Calculate confidence based on explicit permissions
            confidence = 1.0 if allowed else 0.0
            
            return {
                "allowed": allowed,
                "confidence": confidence,
                "permissions": resource_permissions
            }
            
        except Exception as e:
            logger.error(f"Error checking permissions: {e}")
            return {"allowed": False, "confidence": 0.0}
    
    async def _validate_request_pattern(self, request: AccessRequest) -> Dict[str, Any]:
        """Validate request against normal patterns"""
        try:
            # Get user's historical patterns
            patterns = await self.behavioral_analyzer.get_user_patterns(request.user_id)
            
            # Check timing patterns
            current_hour = request.timestamp.hour
            typical_hours = patterns.get("typical_hours", [])
            time_anomaly = current_hour not in typical_hours if typical_hours else False
            
            # Check location patterns
            location_anomaly = False
            if request.context.location:
                typical_locations = patterns.get("typical_locations", [])
                current_location = f"{request.context.location.get('country', '')}-{request.context.location.get('city', '')}"
                location_anomaly = current_location not in typical_locations if typical_locations else False
            
            # Check frequency patterns
            recent_requests = await self._get_recent_requests(request.user_id, minutes=10)
            frequency_anomaly = len(recent_requests) > patterns.get("max_requests_per_10min", 100)
            
            # Calculate overall validity
            anomalies = sum([time_anomaly, location_anomaly, frequency_anomaly])
            confidence = max(0.0, 1.0 - (anomalies * 0.3))
            
            return {
                "valid": confidence > 0.4,
                "confidence": confidence,
                "anomalies": {
                    "time": time_anomaly,
                    "location": location_anomaly,
                    "frequency": frequency_anomaly
                }
            }
            
        except Exception as e:
            logger.error(f"Error validating request pattern: {e}")
            return {"valid": True, "confidence": 0.5}
    
    async def _scan_for_anomalies(self, request: AccessRequest) -> Dict[str, Any]:
        """Scan for security anomalies and threats"""
        try:
            threats_detected = []
            risk_score = 0.0
            
            # Brute force detection
            if await self.threat_detector.detect_brute_force(request):
                threats_detected.append(ThreatType.BRUTE_FORCE)
                risk_score += 0.8
            
            # Unusual location detection
            if await self.geo_analyzer.is_unusual_location(request.user_id, request.context.ip_address):
                threats_detected.append(ThreatType.UNUSUAL_LOCATION)
                risk_score += 0.4
            
            # Rapid requests detection
            if await self.threat_detector.detect_rapid_requests(request):
                threats_detected.append(ThreatType.RAPID_REQUESTS)
                risk_score += 0.6
            
            # Suspicious pattern detection
            if await self.threat_detector.detect_suspicious_patterns(request):
                threats_detected.append(ThreatType.SUSPICIOUS_PATTERN)
                risk_score += 0.5
            
            # Determine severity
            severity = SecurityLevel.LOW
            if risk_score > 0.8:
                severity = SecurityLevel.CRITICAL
            elif risk_score > 0.6:
                severity = SecurityLevel.HIGH
            elif risk_score > 0.3:
                severity = SecurityLevel.MEDIUM
            
            # Create alerts for significant threats
            if threats_detected and severity != SecurityLevel.LOW:
                await self._create_security_alert(request, threats_detected, severity)
            
            return {
                "threats_detected": threats_detected,
                "risk_score": min(risk_score, 1.0),
                "severity": severity
            }
            
        except Exception as e:
            logger.error(f"Error scanning for anomalies: {e}")
            return {"threats_detected": [], "risk_score": 0.0, "severity": SecurityLevel.LOW}
    
    async def _log_security_event(self, request: AccessRequest, event_type: str, metadata: Dict[str, Any] = None):
        """Log security event for audit trail"""
        await self.audit_logger.log_event({
            "event_type": event_type,
            "user_id": request.user_id,
            "resource": request.resource,
            "action": request.action,
            "ip_address": request.context.ip_address,
            "user_agent": request.context.user_agent,
            "timestamp": request.timestamp,
            "metadata": metadata or {}
        })

class ComplianceEngine:
    """Data Privacy & Compliance Engine - GDPR, SOC2, HIPAA compliance built-in"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.data_classifier = DataClassifier()
        self.retention_manager = RetentionManager()
        self.encryption_service = EncryptionService()
        self.audit_trail = AuditTrail(db_client)
        self.privacy_manager = PrivacyManager()
        self.initialized = False
    
    async def initialize(self):
        """Initialize compliance engine"""
        try:
            await self.audit_trail.initialize()
            await self.data_classifier.initialize()
            self.initialized = True
            logger.info("Compliance engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize compliance engine: {e}")
            raise
    
    async def classify_data(self, data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Automatically classify data for compliance"""
        try:
            classification_result = await self.data_classifier.classify(data, context)
            
            data_item = DataItem(
                content=data,
                classification=classification_result["classification"],
                owner=context.get("owner", "system"),
                created_at=datetime.now(),
                encryption_required=classification_result["encryption_required"],
                retention_period=classification_result.get("retention_period")
            )
            
            # Apply encryption if required
            if data_item.encryption_required:
                encrypted_content = await self.encryption_service.encrypt(data)
                data_item.content = encrypted_content
            
            # Set retention policy
            if data_item.retention_period:
                await self.retention_manager.schedule_deletion(data_item)
            
            return {
                "classification": data_item.classification.value,
                "pii_detected": classification_result.get("pii_detected", False),
                "sensitive_fields": classification_result.get("sensitive_fields", []),
                "encryption_applied": data_item.encryption_required,
                "retention_period": data_item.retention_period.days if data_item.retention_period else None,
                "compliance_requirements": classification_result.get("compliance_requirements", [])
            }
            
        except Exception as e:
            logger.error(f"Error classifying data: {e}")
            return {"classification": "unknown", "error": str(e)}
    
    async def audit_action(self, action: str, user: str, resource: str, context: Dict[str, Any] = None):
        """Record action for compliance audit trail"""
        try:
            client_ip = context.get("ip_address", "unknown") if context else "unknown"
            
            audit_record = {
                "timestamp": datetime.now(),
                "action": action,
                "user": user,
                "resource": resource,
                "ip_address": client_ip,
                "compliance_context": await self._get_compliance_context(resource),
                "metadata": context or {}
            }
            
            await self.audit_trail.record(audit_record)
            
            # Check for compliance violations
            violations = await self._check_compliance_violations(audit_record)
            if violations:
                await self._handle_compliance_violations(violations)
            
        except Exception as e:
            logger.error(f"Error recording audit action: {e}")
    
    async def handle_data_subject_request(self, request_type: str, user_id: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Handle GDPR data subject requests"""
        try:
            if request_type == "access":
                return await self._handle_data_access_request(user_id)
            elif request_type == "deletion":
                return await self._handle_data_deletion_request(user_id, details)
            elif request_type == "portability":
                return await self._handle_data_portability_request(user_id)
            elif request_type == "rectification":
                return await self._handle_data_rectification_request(user_id, details)
            else:
                return {"error": "Unknown request type"}
                
        except Exception as e:
            logger.error(f"Error handling data subject request: {e}")
            return {"error": str(e)}
    
    async def _get_compliance_context(self, resource: str) -> Dict[str, Any]:
        """Get compliance context for a resource"""
        # Determine which compliance frameworks apply
        frameworks = []
        
        # Check if resource contains personal data (GDPR)
        if await self._contains_personal_data(resource):
            frameworks.append("GDPR")
        
        # Check if resource is financial data (SOX, PCI-DSS)
        if await self._contains_financial_data(resource):
            frameworks.extend(["SOX", "PCI-DSS"])
        
        # Check if resource is health data (HIPAA)
        if await self._contains_health_data(resource):
            frameworks.append("HIPAA")
        
        return {
            "applicable_frameworks": frameworks,
            "data_classification": await self._get_resource_classification(resource),
            "retention_requirements": await self._get_retention_requirements(resource)
        }

class BehavioralAnalyzer:
    """Analyze user behavior patterns for anomaly detection"""
    
    def __init__(self):
        self.user_baselines = {}
        self.pattern_cache = {}
    
    async def initialize(self):
        """Initialize behavioral analyzer"""
        logger.info("Behavioral analyzer initialized")
    
    async def analyze_user_behavior(self, request: AccessRequest) -> float:
        """Analyze user behavior and return normalcy score (0-1)"""
        try:
            user_id = request.user_id
            
            # Get or create user baseline
            if user_id not in self.user_baselines:
                await self._build_user_baseline(user_id)
            
            baseline = self.user_baselines.get(user_id, {})
            score = 1.0  # Start with perfect score
            
            # Check timing patterns
            current_hour = request.timestamp.hour
            typical_hours = baseline.get("typical_hours", [])
            if typical_hours and current_hour not in typical_hours:
                score -= 0.2
            
            # Check resource access patterns
            typical_resources = baseline.get("typical_resources", [])
            if typical_resources and request.resource not in typical_resources:
                score -= 0.1
            
            # Check request frequency
            typical_frequency = baseline.get("avg_requests_per_hour", 10)
            recent_requests = await self._count_recent_requests(user_id, hours=1)
            if recent_requests > typical_frequency * 2:
                score -= 0.3
            
            # Update baseline with new data
            await self._update_user_baseline(user_id, request)
            
            return max(0.0, score)
            
        except Exception as e:
            logger.error(f"Error analyzing user behavior: {e}")
            return 0.5  # Neutral score on error
    
    async def _build_user_baseline(self, user_id: str):
        """Build behavioral baseline for user"""
        # In production, this would analyze historical data
        self.user_baselines[user_id] = {
            "typical_hours": list(range(9, 18)),  # 9 AM to 6 PM
            "typical_resources": [],
            "avg_requests_per_hour": 10,
            "typical_locations": [],
            "last_updated": datetime.now()
        }

class ThreatDetector:
    """Advanced threat detection system"""
    
    def __init__(self):
        self.attack_patterns = {}
        self.ip_reputation = {}
    
    async def initialize(self):
        """Initialize threat detector"""
        logger.info("Threat detector initialized")
    
    async def detect_brute_force(self, request: AccessRequest) -> bool:
        """Detect brute force attacks"""
        try:
            # Check for rapid authentication attempts
            key = f"auth_attempts_{request.context.ip_address}"
            attempts = self.attack_patterns.get(key, [])
            
            # Clean old attempts (older than 1 hour)
            current_time = datetime.now()
            attempts = [attempt for attempt in attempts if current_time - attempt < timedelta(hours=1)]
            
            # Add current attempt
            attempts.append(current_time)
            self.attack_patterns[key] = attempts
            
            # Threshold: more than 10 attempts in 10 minutes
            recent_attempts = [attempt for attempt in attempts if current_time - attempt < timedelta(minutes=10)]
            
            return len(recent_attempts) > 10
            
        except Exception as e:
            logger.error(f"Error detecting brute force: {e}")
            return False

# Additional helper classes would be defined here...
class SessionManager:
    def __init__(self):
        self.active_sessions = {}
    
    async def validate_session(self, user_id: str, session_id: str) -> bool:
        return True  # Simplified for demo

class RateLimiter:
    def __init__(self):
        self.request_counts = {}
    
    async def check_rate_limit(self, user_id: str, resource: str, ip: str) -> Dict[str, Any]:
        return {"allowed": True}  # Simplified for demo

class GeoLocationAnalyzer:
    async def is_unusual_location(self, user_id: str, ip_address: str) -> bool:
        return False  # Simplified for demo

class AuditLogger:
    def __init__(self, db_client):
        self.db_client = db_client
        self.collection = None
    
    async def initialize(self):
        db = await self.db_client.get_database()
        self.collection = db.security_audit
    
    async def log_event(self, event: Dict[str, Any]):
        await self.collection.insert_one(event)

class AccessController:
    async def get_user_permissions(self, user_id: str) -> Dict[str, Any]:
        return {"roles": ["user"]}  # Simplified for demo

class DataClassifier:
    async def initialize(self):
        pass
    
    async def classify(self, data: Any, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "classification": DataClassification.INTERNAL,
            "encryption_required": False,
            "pii_detected": False
        }

class RetentionManager:
    async def schedule_deletion(self, data_item: DataItem):
        pass

class EncryptionService:
    async def encrypt(self, data: Any) -> str:
        # Simplified encryption
        return str(data)

class AuditTrail:
    def __init__(self, db_client):
        self.db_client = db_client
    
    async def initialize(self):
        pass
    
    async def record(self, audit_record: Dict[str, Any]):
        pass

class PrivacyManager:
    pass