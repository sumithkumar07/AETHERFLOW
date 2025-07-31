import asyncio
import json
import logging
import re
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import hashlib
from enum import Enum

from models.compliance import CompliancePolicy, SafetyCheck, ComplianceViolation, AuditLog, RiskLevel, PolicyType

logger = logging.getLogger(__name__)

class ComplianceEngine:
    """Enterprise-grade compliance and safety framework"""
    
    def __init__(self, db_client):
        self.db = db_client
        self.active_policies = {}
        self.safety_checks = {}
        self.violation_handlers = {}
        self.audit_queue = asyncio.Queue()
        
    async def initialize(self):
        """Initialize compliance engine with default policies"""
        try:
            # Load active compliance policies
            policies_collection = self.db.compliance_policies
            active_policies = await policies_collection.find({"active": True}).to_list(None)
            
            for policy_data in active_policies:
                policy = CompliancePolicy(**policy_data)
                self.active_policies[policy.id] = policy
            
            # Initialize default safety checks
            await self._initialize_default_safety_checks()
            
            # Start audit log processor
            asyncio.create_task(self._process_audit_queue())
            
            # Start compliance monitoring
            asyncio.create_task(self._compliance_monitor())
            
            logger.info(f"Initialized compliance engine with {len(self.active_policies)} policies")
            
        except Exception as e:
            logger.error(f"Failed to initialize compliance engine: {e}")
            raise
    
    async def _initialize_default_safety_checks(self):
        """Initialize default safety checks for common scenarios"""
        default_checks = [
            {
                "name": "Content Safety Filter",
                "description": "Filter inappropriate, harmful, or malicious content",
                "check_type": "content",
                "rules": [
                    {"pattern": r"(?i)(hack|exploit|malware|virus)", "action": "block", "risk": "high"},
                    {"pattern": r"(?i)(password|secret|token|key)\s*[=:]\s*[\w\-]{8,}", "action": "mask", "risk": "medium"},
                    {"pattern": r"(?i)(credit card|ssn|social security)", "action": "block", "risk": "high"},
                    {"pattern": r"(?i)(kill|harm|violence|suicide)", "action": "escalate", "risk": "critical"}
                ],
                "risk_level": RiskLevel.HIGH,
                "auto_block": True
            },
            {
                "name": "Code Safety Analyzer",
                "description": "Analyze generated code for security vulnerabilities",
                "check_type": "code",
                "rules": [
                    {"pattern": r"eval\s*\(", "action": "warn", "risk": "high", "message": "eval() usage detected"},
                    {"pattern": r"exec\s*\(", "action": "warn", "risk": "high", "message": "exec() usage detected"},
                    {"pattern": r"os\.system\s*\(", "action": "warn", "risk": "high", "message": "os.system() usage detected"},
                    {"pattern": r"subprocess\.(call|run|Popen)", "action": "review", "risk": "medium"},
                    {"pattern": r"(?i)(drop|delete|truncate)\s+table", "action": "block", "risk": "critical"}
                ],
                "risk_level": RiskLevel.HIGH,
                "auto_block": False
            },
            {
                "name": "Data Privacy Guardian",
                "description": "Protect sensitive data and ensure privacy compliance",
                "check_type": "data",
                "rules": [
                    {"field_types": ["email", "phone", "address"], "action": "encrypt", "risk": "medium"},
                    {"field_types": ["password", "token", "secret"], "action": "hash", "risk": "high"},
                    {"field_types": ["ssn", "tax_id", "credit_card"], "action": "block", "risk": "critical"},
                    {"retention_days": 365, "action": "archive", "risk": "low"}
                ],
                "risk_level": RiskLevel.MEDIUM,
                "auto_block": False
            },
            {
                "name": "Behavioral Anomaly Detector",
                "description": "Detect unusual user or agent behavior patterns",
                "check_type": "behavior",
                "rules": [
                    {"metric": "requests_per_minute", "threshold": 100, "action": "throttle", "risk": "medium"},
                    {"metric": "failed_attempts", "threshold": 5, "action": "block", "risk": "high"},
                    {"metric": "data_access_volume", "threshold": "10GB", "action": "review", "risk": "high"},
                    {"metric": "unusual_time_access", "pattern": "2AM-5AM", "action": "alert", "risk": "medium"}
                ],
                "risk_level": RiskLevel.MEDIUM,
                "auto_block": False
            }
        ]
        
        for check_data in default_checks:
            safety_check = SafetyCheck(
                name=check_data["name"],
                description=check_data["description"],
                check_type=check_data["check_type"],
                rules=check_data["rules"],
                risk_level=check_data["risk_level"],
                auto_block=check_data["auto_block"]
            )
            
            self.safety_checks[safety_check.id] = safety_check
    
    async def validate_content(self, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Validate content against all applicable safety checks"""
        try:
            validation_results = {
                "is_safe": True,
                "risk_level": "low",
                "violations": [],
                "actions_taken": [],
                "masked_content": content
            }
            
            # Run content through all applicable safety checks
            for check_id, safety_check in self.safety_checks.items():
                if safety_check.check_type == "content":
                    check_result = await self._run_safety_check(safety_check, content, context)
                    
                    if check_result["violations"]:
                        validation_results["violations"].extend(check_result["violations"])
                        validation_results["actions_taken"].extend(check_result["actions"])
                        
                        # Update risk level
                        if check_result["max_risk"] == "critical":
                            validation_results["risk_level"] = "critical"
                            validation_results["is_safe"] = False
                        elif check_result["max_risk"] == "high" and validation_results["risk_level"] != "critical":
                            validation_results["risk_level"] = "high"
                            validation_results["is_safe"] = False
                        
                        # Update masked content
                        validation_results["masked_content"] = check_result.get("masked_content", content)
            
            # Log validation for audit
            await self._log_content_validation(content, validation_results, context)
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Content validation failed: {e}")
            return {
                "is_safe": False,
                "risk_level": "high",
                "violations": [{"type": "validation_error", "message": str(e)}],
                "actions_taken": ["blocked"],
                "masked_content": "[CONTENT BLOCKED DUE TO VALIDATION ERROR]"
            }
    
    async def _run_safety_check(self, safety_check: SafetyCheck, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run a specific safety check against content"""
        violations = []
        actions = []
        masked_content = content
        max_risk = "low"
        
        for rule in safety_check.rules:
            if "pattern" in rule:
                # Regex pattern matching
                pattern = rule["pattern"]
                matches = re.finditer(pattern, content)
                
                for match in matches:
                    violation = {
                        "rule": pattern,
                        "match": match.group(),
                        "position": match.span(),
                        "risk": rule["risk"],
                        "action": rule["action"]
                    }
                    violations.append(violation)
                    
                    # Update max risk
                    if self._risk_level_value(rule["risk"]) > self._risk_level_value(max_risk):
                        max_risk = rule["risk"]
                    
                    # Apply action
                    if rule["action"] == "mask":
                        # Replace matched content with asterisks
                        masked_content = masked_content.replace(match.group(), "*" * len(match.group()))
                        actions.append(f"masked: {match.group()[:10]}...")
                    elif rule["action"] == "block":
                        actions.append(f"blocked: {match.group()[:10]}...")
                        if safety_check.auto_block:
                            masked_content = "[CONTENT BLOCKED BY SAFETY FILTER]"
        
        return {
            "violations": violations,
            "actions": actions,
            "masked_content": masked_content,
            "max_risk": max_risk
        }
    
    def _risk_level_value(self, risk_level: str) -> int:
        """Convert risk level to numeric value for comparison"""
        risk_values = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        return risk_values.get(risk_level.lower(), 1)
    
    async def validate_code(self, code: str, language: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Validate generated code for security and compliance"""
        try:
            validation_results = {
                "is_safe": True,
                "security_score": 100,
                "vulnerabilities": [],
                "recommendations": [],
                "sanitized_code": code
            }
            
            # Run code-specific safety checks
            for check_id, safety_check in self.safety_checks.items():
                if safety_check.check_type == "code":
                    check_result = await self._run_code_safety_check(safety_check, code, language, context)
                    
                    if check_result["violations"]:
                        validation_results["vulnerabilities"].extend(check_result["violations"])
                        validation_results["recommendations"].extend(check_result["recommendations"])
                        validation_results["security_score"] -= len(check_result["violations"]) * 10
                        
                        if check_result["critical_issues"]:
                            validation_results["is_safe"] = False
            
            # Ensure security score doesn't go below 0
            validation_results["security_score"] = max(0, validation_results["security_score"])
            
            # Log code validation
            await self._log_code_validation(code, language, validation_results, context)
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Code validation failed: {e}")
            return {
                "is_safe": False,
                "security_score": 0,
                "vulnerabilities": [{"type": "validation_error", "message": str(e)}],
                "recommendations": ["Review code manually due to validation error"],
                "sanitized_code": code
            }
    
    async def _run_code_safety_check(self, safety_check: SafetyCheck, code: str, language: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run code-specific safety check"""
        violations = []
        recommendations = []
        critical_issues = []
        
        for rule in safety_check.rules:
            if "pattern" in rule:
                pattern = rule["pattern"]
                matches = re.finditer(pattern, code, re.MULTILINE)
                
                for match in matches:
                    line_number = code[:match.start()].count('\n') + 1
                    
                    violation = {
                        "type": "security_vulnerability",
                        "pattern": pattern,
                        "match": match.group(),
                        "line": line_number,
                        "risk": rule["risk"],
                        "message": rule.get("message", "Potential security issue detected"),
                        "action": rule["action"]
                    }
                    violations.append(violation)
                    
                    # Generate recommendation
                    recommendation = self._generate_security_recommendation(violation, language)
                    recommendations.append(recommendation)
                    
                    # Track critical issues
                    if rule["risk"] in ["critical", "high"]:
                        critical_issues.append(violation)
        
        return {
            "violations": violations,
            "recommendations": recommendations,
            "critical_issues": critical_issues
        }
    
    def _generate_security_recommendation(self, violation: Dict[str, Any], language: str) -> str:
        """Generate security recommendation based on violation"""
        pattern = violation["pattern"]
        
        recommendations = {
            r"eval\s*\(": "Avoid using eval(). Use safer alternatives like JSON.parse() or specific parsing functions.",
            r"exec\s*\(": "Avoid using exec(). Consider using specific function calls or safer evaluation methods.",
            r"os\.system\s*\(": "Avoid os.system(). Use subprocess with shell=False for better security.",
            r"subprocess\.(call|run|Popen)": "When using subprocess, avoid shell=True and validate all inputs.",
            r"(?i)(drop|delete|truncate)\s+table": "Direct SQL table operations detected. Use ORM or parameterized queries."
        }
        
        for regex, recommendation in recommendations.items():
            if re.search(regex, pattern):
                return recommendation
        
        return f"Review the flagged code pattern for potential security implications."
    
    async def create_compliance_policy(self, policy_data: Dict[str, Any], creator_id: str) -> CompliancePolicy:
        """Create a new compliance policy"""
        try:
            policy = CompliancePolicy(
                name=policy_data["name"],
                description=policy_data["description"],
                type=PolicyType(policy_data["type"]),
                framework=policy_data.get("framework", "custom"),
                rules=policy_data.get("rules", []),
                enforcement_level=policy_data.get("enforcement_level", "strict"),
                applicable_to=policy_data.get("applicable_to", []),
                created_by=creator_id
            )
            
            # Save to database
            policies_collection = self.db.compliance_policies
            await policies_collection.insert_one(policy.dict())
            
            # Activate policy
            if policy.active:
                self.active_policies[policy.id] = policy
            
            logger.info(f"Created compliance policy: {policy.name}")
            return policy
            
        except Exception as e:
            logger.error(f"Failed to create compliance policy: {e}")
            raise
    
    async def log_audit_event(self, user_id: str, action: str, resource_type: str, resource_id: str, 
                             details: Dict[str, Any] = None, ip_address: str = None, user_agent: str = None):
        """Log audit event for compliance tracking"""
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            compliance_relevant=self._is_compliance_relevant(action, resource_type)
        )
        
        # Queue for async processing
        await self.audit_queue.put(audit_log)
    
    def _is_compliance_relevant(self, action: str, resource_type: str) -> bool:
        """Determine if an action is relevant for compliance"""
        compliance_actions = ["create", "update", "delete", "access", "export", "share"]
        sensitive_resources = ["user", "payment", "integration", "workflow", "agent"]
        
        return action.lower() in compliance_actions or resource_type.lower() in sensitive_resources
    
    async def _process_audit_queue(self):
        """Process audit log queue"""
        while True:
            try:
                # Get audit event from queue
                audit_log = await self.audit_queue.get()
                
                # Save to database
                audit_collection = self.db.audit_logs
                await audit_collection.insert_one(audit_log.dict())
                
                # Process compliance checks if relevant
                if audit_log.compliance_relevant:
                    await self._process_compliance_audit(audit_log)
                
                # Mark as processed
                self.audit_queue.task_done()
                
            except Exception as e:
                logger.error(f"Error processing audit queue: {e}")
                await asyncio.sleep(5)
    
    async def _process_compliance_audit(self, audit_log: AuditLog):
        """Process compliance-relevant audit events"""
        # Check against active policies
        for policy_id, policy in self.active_policies.items():
            if self._audit_matches_policy(audit_log, policy):
                await self._enforce_policy(policy, audit_log)
    
    def _audit_matches_policy(self, audit_log: AuditLog, policy: CompliancePolicy) -> bool:
        """Check if audit event matches policy criteria"""
        # Check if resource type is applicable
        if policy.applicable_to and audit_log.resource_type not in policy.applicable_to:
            return False
        
        # Check policy rules against audit event
        for rule in policy.rules:
            if self._rule_matches_audit(rule, audit_log):
                return True
        
        return False
    
    def _rule_matches_audit(self, rule: Dict[str, Any], audit_log: AuditLog) -> bool:
        """Check if a specific rule matches the audit event"""
        if "action" in rule and rule["action"] != audit_log.action:
            return False
        
        if "resource_type" in rule and rule["resource_type"] != audit_log.resource_type:
            return False
        
        # Add more rule matching logic as needed
        return True
    
    async def _enforce_policy(self, policy: CompliancePolicy, audit_log: AuditLog):
        """Enforce policy based on audit event"""
        if policy.enforcement_level == "strict":
            # Create violation record
            violation = ComplianceViolation(
                policy_id=policy.id,
                entity_type=audit_log.resource_type,
                entity_id=audit_log.resource_id,
                violation_type=policy.type.value,
                description=f"Policy violation: {policy.name}",
                risk_level=RiskLevel.MEDIUM,
                evidence=audit_log.dict()
            )
            
            # Save violation
            violations_collection = self.db.compliance_violations
            await violations_collection.insert_one(violation.dict())
            
            # Notify relevant parties
            await self._notify_compliance_violation(violation, policy)
    
    async def _notify_compliance_violation(self, violation: ComplianceViolation, policy: CompliancePolicy):
        """Notify relevant parties of compliance violation"""
        # This would integrate with notification systems
        logger.warning(f"Compliance violation detected: {violation.description}")
    
    async def _compliance_monitor(self):
        """Monitor ongoing compliance status"""
        while True:
            try:
                # Check for policy violations
                await self._check_policy_violations()
                
                # Update compliance metrics
                await self._update_compliance_metrics()
                
                # Generate compliance reports
                await self._generate_compliance_reports()
                
                # Wait before next check (hourly)
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"Compliance monitor error: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    async def get_compliance_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive compliance dashboard data"""
        # Get violation statistics
        violations_collection = self.db.compliance_violations
        recent_violations = await violations_collection.count_documents({
            "detected_at": {"$gte": datetime.utcnow() - timedelta(days=30)}
        })
        
        # Get audit statistics
        audit_collection = self.db.audit_logs
        audit_count = await audit_collection.count_documents({
            "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}
        })
        
        return {
            "active_policies": len(self.active_policies),
            "safety_checks": len(self.safety_checks),
            "recent_violations": recent_violations,
            "audit_events_30d": audit_count,
            "compliance_score": await self._calculate_compliance_score(),
            "policy_breakdown": await self._get_policy_breakdown(),
            "violation_trends": await self._get_violation_trends()
        }
    
    async def _calculate_compliance_score(self) -> int:
        """Calculate overall compliance score (0-100)"""
        # Base score
        score = 100
        
        # Deduct points for recent violations
        violations_collection = self.db.compliance_violations
        recent_violations = await violations_collection.count_documents({
            "detected_at": {"$gte": datetime.utcnow() - timedelta(days=30)},
            "resolved_at": None
        })
        
        # Each unresolved violation reduces score
        score -= min(recent_violations * 5, 50)  # Max 50 points deduction
        
        return max(0, score)
    
    async def _log_content_validation(self, content: str, results: Dict[str, Any], context: Dict[str, Any]):
        """Log content validation for audit purposes"""
        content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
        
        await self.log_audit_event(
            user_id=context.get("user_id", "system"),
            action="validate_content",
            resource_type="content",
            resource_id=content_hash,
            details={
                "content_length": len(content),
                "is_safe": results["is_safe"],
                "risk_level": results["risk_level"],
                "violations_count": len(results["violations"])
            }
        )
    
    async def _log_code_validation(self, code: str, language: str, results: Dict[str, Any], context: Dict[str, Any]):
        """Log code validation for audit purposes"""
        code_hash = hashlib.sha256(code.encode()).hexdigest()[:16]
        
        await self.log_audit_event(
            user_id=context.get("user_id", "system"),
            action="validate_code",
            resource_type="code",
            resource_id=code_hash,
            details={
                "language": language,
                "code_length": len(code),
                "is_safe": results["is_safe"],
                "security_score": results["security_score"],
                "vulnerabilities_count": len(results["vulnerabilities"])
            }
        )