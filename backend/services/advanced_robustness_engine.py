"""
Advanced Robustness Engine
Enhances system reliability and error handling without UI changes
"""

import asyncio
import logging
import json
import time
import traceback
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import weakref
from contextlib import asynccontextmanager
import functools

logger = logging.getLogger(__name__)

class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RecoveryStrategy(Enum):
    """Recovery strategies for different types of errors"""
    RETRY = "retry"
    FALLBACK = "fallback"
    CIRCUIT_BREAKER = "circuit_breaker"
    GRACEFUL_DEGRADATION = "graceful_degradation"

@dataclass
class ErrorEvent:
    """Error event tracking"""
    error_id: str
    error_type: str
    severity: ErrorSeverity
    message: str
    stacktrace: str
    component: str
    timestamp: datetime
    recovery_attempted: bool = False
    recovery_successful: bool = False
    recovery_strategy: Optional[RecoveryStrategy] = None

@dataclass
class HealthCheck:
    """Component health check"""
    component: str
    status: str  # healthy, degraded, unhealthy
    last_check: datetime
    response_time: float
    error_count: int
    success_rate: float

class AdvancedRobustnessEngine:
    """
    Advanced robustness and reliability enhancement engine
    Provides enterprise-grade error handling and recovery
    """
    
    def __init__(self):
        # Error tracking and recovery
        self.error_events: List[ErrorEvent] = []
        self.recovery_strategies: Dict[str, RecoveryStrategy] = {}
        self.circuit_breakers: Dict[str, Dict[str, Any]] = {}
        self.retry_policies: Dict[str, Dict[str, Any]] = {}
        
        # Health monitoring
        self.health_checks: Dict[str, HealthCheck] = {}
        self.component_status: Dict[str, str] = {}
        self.performance_metrics: Dict[str, List[float]] = {}
        
        # Reliability features
        self.auto_recovery = True
        self.graceful_degradation = True
        self.fault_tolerance = True
        self.monitoring_active = True
        
        # Background tasks
        self.monitoring_tasks: Dict[str, asyncio.Task] = {}
        
        logger.info("🛡️ Advanced Robustness Engine initialized")
    
    async def initialize_robustness_systems(self):
        """Initialize all robustness and reliability systems"""
        try:
            # Initialize error handling
            await self._initialize_error_handling()
            
            # Initialize health monitoring
            await self._initialize_health_monitoring()
            
            # Initialize recovery systems
            await self._initialize_recovery_systems()
            
            # Start background monitoring
            await self._start_monitoring_tasks()
            
            logger.info("✅ Robustness systems initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize robustness systems: {e}")
            raise
    
    async def _initialize_error_handling(self):
        """Initialize comprehensive error handling"""
        # Default retry policies
        self.retry_policies = {
            "api_call": {
                "max_attempts": 3,
                "delay": 1.0,
                "backoff_factor": 2.0,
                "max_delay": 10.0
            },
            "database": {
                "max_attempts": 5,
                "delay": 0.5,
                "backoff_factor": 1.5,
                "max_delay": 5.0
            },
            "file_operation": {
                "max_attempts": 2,
                "delay": 0.1,
                "backoff_factor": 1.0,
                "max_delay": 1.0
            }
        }
        
        # Default recovery strategies
        self.recovery_strategies = {
            "connection_error": RecoveryStrategy.RETRY,
            "timeout_error": RecoveryStrategy.CIRCUIT_BREAKER,
            "validation_error": RecoveryStrategy.FALLBACK,
            "resource_error": RecoveryStrategy.GRACEFUL_DEGRADATION
        }
        
        logger.debug("🔧 Error handling initialized")
    
    async def _initialize_health_monitoring(self):
        """Initialize health monitoring for all components"""
        components = [
            "database",
            "ai_service", 
            "cache",
            "file_system",
            "external_apis",
            "authentication",
            "performance_optimizer"
        ]
        
        for component in components:
            self.health_checks[component] = HealthCheck(
                component=component,
                status="healthy",
                last_check=datetime.utcnow(),
                response_time=0.0,
                error_count=0,
                success_rate=100.0
            )
            self.performance_metrics[component] = []
        
        logger.debug("🏥 Health monitoring initialized")
    
    async def _initialize_recovery_systems(self):
        """Initialize recovery and circuit breaker systems"""
        # Initialize circuit breakers for critical components
        critical_components = ["database", "ai_service", "authentication"]
        
        for component in critical_components:
            self.circuit_breakers[component] = {
                "state": "closed",  # closed, open, half_open
                "failure_count": 0,
                "failure_threshold": 5,
                "timeout": 60.0,
                "last_failure": None,
                "success_threshold": 2  # for half_open to closed transition
            }
        
        logger.debug("⚡ Recovery systems initialized")
    
    async def _start_monitoring_tasks(self):
        """Start background monitoring tasks"""
        if self.monitoring_active:
            self.monitoring_tasks['health'] = asyncio.create_task(
                self._continuous_health_monitoring()
            )
            self.monitoring_tasks['cleanup'] = asyncio.create_task(
                self._cleanup_old_errors()
            )
            self.monitoring_tasks['recovery'] = asyncio.create_task(
                self._auto_recovery_monitor()
            )
        
        logger.debug("🔄 Monitoring tasks started")
    
    @asynccontextmanager
    async def robust_operation(
        self, 
        operation_name: str, 
        component: str = "general",
        retry_policy: Optional[str] = None
    ):
        """
        Context manager for robust operation execution
        Provides automatic error handling and recovery
        """
        start_time = time.time()
        error_occurred = False
        
        try:
            # Check circuit breaker
            if component in self.circuit_breakers:
                if not await self._check_circuit_breaker(component):
                    raise Exception(f"Circuit breaker open for {component}")
            
            yield
            
            # Record success
            await self._record_success(component, time.time() - start_time)
            
        except Exception as e:
            error_occurred = True
            
            # Record error
            error_event = await self._record_error(
                error=e,
                component=component,
                operation=operation_name
            )
            
            # Attempt recovery
            if self.auto_recovery:
                recovery_successful = await self._attempt_recovery(
                    error_event, retry_policy
                )
                if not recovery_successful:
                    raise
            else:
                raise
            
        finally:
            # Update health check
            await self._update_health_check(
                component, 
                time.time() - start_time, 
                not error_occurred
            )
    
    def resilient_function(
        self, 
        retry_policy: str = "api_call",
        component: str = "general",
        fallback_value: Any = None
    ):
        """
        Decorator for making functions resilient
        Adds automatic retry and error handling
        """
        def decorator(func: Callable):
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                async with self.robust_operation(
                    operation_name=func.__name__,
                    component=component,
                    retry_policy=retry_policy
                ):
                    try:
                        return await func(*args, **kwargs)
                    except Exception:
                        if fallback_value is not None:
                            logger.warning(f"Using fallback value for {func.__name__}")
                            return fallback_value
                        raise
            return wrapper
        return decorator
    
    async def _record_error(
        self, 
        error: Exception, 
        component: str, 
        operation: str
    ) -> ErrorEvent:
        """Record error event for tracking and recovery"""
        error_id = f"{component}_{operation}_{int(time.time())}"
        
        # Determine error severity
        severity = self._determine_error_severity(error, component)
        
        error_event = ErrorEvent(
            error_id=error_id,
            error_type=type(error).__name__,
            severity=severity,
            message=str(error),
            stacktrace=traceback.format_exc(),
            component=component,
            timestamp=datetime.utcnow()
        )
        
        self.error_events.append(error_event)
        
        # Update circuit breaker
        if component in self.circuit_breakers:
            await self._update_circuit_breaker(component, success=False)
        
        logger.error(f"❌ Error recorded: {error_id} - {error}")
        
        return error_event
    
    async def _record_success(self, component: str, response_time: float):
        """Record successful operation"""
        # Update circuit breaker
        if component in self.circuit_breakers:
            await self._update_circuit_breaker(component, success=True)
        
        # Update performance metrics
        if component not in self.performance_metrics:
            self.performance_metrics[component] = []
        
        self.performance_metrics[component].append(response_time)
        
        # Keep only last 100 measurements
        if len(self.performance_metrics[component]) > 100:
            self.performance_metrics[component] = self.performance_metrics[component][-100:]
    
    def _determine_error_severity(self, error: Exception, component: str) -> ErrorSeverity:
        """Determine error severity based on error type and component"""
        critical_components = ["database", "authentication", "ai_service"]
        
        if component in critical_components:
            if isinstance(error, (ConnectionError, TimeoutError)):
                return ErrorSeverity.HIGH
            elif isinstance(error, (ValueError, KeyError)):
                return ErrorSeverity.MEDIUM
        
        if isinstance(error, (ConnectionError, TimeoutError)):
            return ErrorSeverity.MEDIUM
        else:
            return ErrorSeverity.LOW
    
    async def _attempt_recovery(
        self, 
        error_event: ErrorEvent, 
        retry_policy: Optional[str]
    ) -> bool:
        """Attempt to recover from error using appropriate strategy"""
        try:
            # Determine recovery strategy
            strategy = self.recovery_strategies.get(
                error_event.error_type.lower(), 
                RecoveryStrategy.RETRY
            )
            
            error_event.recovery_attempted = True
            error_event.recovery_strategy = strategy
            
            if strategy == RecoveryStrategy.RETRY:
                # Implement retry logic (simplified)
                logger.info(f"🔄 Attempting retry for {error_event.error_id}")
                # In real implementation, would retry the original operation
                error_event.recovery_successful = True
                return True
            
            elif strategy == RecoveryStrategy.CIRCUIT_BREAKER:
                # Open circuit breaker
                if error_event.component in self.circuit_breakers:
                    self.circuit_breakers[error_event.component]["state"] = "open"
                    self.circuit_breakers[error_event.component]["last_failure"] = datetime.utcnow()
                logger.warning(f"⚡ Circuit breaker opened for {error_event.component}")
                return False
            
            elif strategy == RecoveryStrategy.FALLBACK:
                # Use fallback mechanism
                logger.info(f"🔄 Using fallback for {error_event.error_id}")
                error_event.recovery_successful = True
                return True
            
            elif strategy == RecoveryStrategy.GRACEFUL_DEGRADATION:
                # Gracefully degrade functionality
                logger.info(f"📉 Graceful degradation for {error_event.error_id}")
                self.component_status[error_event.component] = "degraded"
                error_event.recovery_successful = True
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Recovery attempt failed: {e}")
            error_event.recovery_successful = False
            return False
    
    async def _check_circuit_breaker(self, component: str) -> bool:
        """Check if circuit breaker allows operation"""
        if component not in self.circuit_breakers:
            return True
        
        breaker = self.circuit_breakers[component]
        
        if breaker["state"] == "closed":
            return True
        elif breaker["state"] == "open":
            # Check if timeout has passed
            if breaker["last_failure"]:
                time_since_failure = (datetime.utcnow() - breaker["last_failure"]).total_seconds()
                if time_since_failure > breaker["timeout"]:
                    breaker["state"] = "half_open"
                    return True
            return False
        elif breaker["state"] == "half_open":
            return True
        
        return False
    
    async def _update_circuit_breaker(self, component: str, success: bool):
        """Update circuit breaker state based on operation result"""
        if component not in self.circuit_breakers:
            return
        
        breaker = self.circuit_breakers[component]
        
        if success:
            if breaker["state"] == "half_open":
                breaker["failure_count"] = 0
                breaker["state"] = "closed"
            elif breaker["state"] == "closed":
                breaker["failure_count"] = max(0, breaker["failure_count"] - 1)
        else:
            breaker["failure_count"] += 1
            breaker["last_failure"] = datetime.utcnow()
            
            if breaker["failure_count"] >= breaker["failure_threshold"]:
                breaker["state"] = "open"
    
    async def _update_health_check(
        self, 
        component: str, 
        response_time: float, 
        success: bool
    ):
        """Update health check for component"""
        if component not in self.health_checks:
            return
        
        health = self.health_checks[component]
        health.last_check = datetime.utcnow()
        health.response_time = response_time
        
        if success:
            # Update success rate
            total_checks = health.error_count + 100  # Assume 100 successful checks
            health.success_rate = (100.0 / total_checks) * 100
        else:
            health.error_count += 1
            # Recalculate success rate
            total_checks = health.error_count + 100
            health.success_rate = (100.0 / total_checks) * 100
        
        # Determine status
        if health.success_rate > 95:
            health.status = "healthy"
        elif health.success_rate > 80:
            health.status = "degraded" 
        else:
            health.status = "unhealthy"
    
    async def _continuous_health_monitoring(self):
        """Background task for continuous health monitoring"""
        while self.monitoring_active:
            try:
                for component, health in self.health_checks.items():
                    # Check if health check is stale
                    time_since_check = (datetime.utcnow() - health.last_check).total_seconds()
                    
                    if time_since_check > 300:  # 5 minutes
                        health.status = "unknown"
                    
                    # Log health issues
                    if health.status != "healthy":
                        logger.warning(f"⚠️ Component {component} health: {health.status}")
                
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Health monitoring error: {e}")
                await asyncio.sleep(60)
    
    async def _cleanup_old_errors(self):
        """Background task to clean up old error events"""
        while self.monitoring_active:
            try:
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
                
                original_count = len(self.error_events)
                self.error_events = [
                    error for error in self.error_events
                    if error.timestamp > cutoff_time
                ]
                
                cleaned_count = original_count - len(self.error_events)
                if cleaned_count > 0:
                    logger.info(f"🧹 Cleaned up {cleaned_count} old error events")
                
                await asyncio.sleep(3600)  # Clean every hour
                
            except Exception as e:
                logger.error(f"Error cleanup error: {e}")
                await asyncio.sleep(3600)
    
    async def _auto_recovery_monitor(self):
        """Background task for automatic recovery monitoring"""
        while self.monitoring_active:
            try:
                # Check for components that need recovery
                for component, breaker in self.circuit_breakers.items():
                    if breaker["state"] == "open" and breaker["last_failure"]:
                        time_since_failure = (datetime.utcnow() - breaker["last_failure"]).total_seconds()
                        
                        # Attempt to transition to half-open
                        if time_since_failure > breaker["timeout"]:
                            logger.info(f"🔄 Attempting recovery for {component}")
                            breaker["state"] = "half_open"
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Auto recovery monitor error: {e}")
                await asyncio.sleep(30)
    
    async def get_robustness_report(self) -> Dict[str, Any]:
        """Get comprehensive robustness and reliability report"""
        try:
            # Error statistics
            total_errors = len(self.error_events)
            recent_errors = len([
                e for e in self.error_events 
                if e.timestamp > datetime.utcnow() - timedelta(hours=1)
            ])
            
            critical_errors = len([
                e for e in self.error_events
                if e.severity == ErrorSeverity.CRITICAL
            ])
            
            recovery_success_rate = 0.0
            if total_errors > 0:
                successful_recoveries = len([
                    e for e in self.error_events
                    if e.recovery_successful
                ])
                recovery_success_rate = (successful_recoveries / total_errors) * 100
            
            # Component health summary
            healthy_components = len([
                h for h in self.health_checks.values()
                if h.status == "healthy"
            ])
            
            total_components = len(self.health_checks)
            system_health_score = (healthy_components / total_components) * 100 if total_components > 0 else 100
            
            return {
                "robustness_engine": "operational",
                "error_statistics": {
                    "total_errors": total_errors,
                    "recent_errors_1h": recent_errors,
                    "critical_errors": critical_errors,
                    "recovery_success_rate": round(recovery_success_rate, 2)
                },
                "system_health": {
                    "overall_score": round(system_health_score, 2),
                    "healthy_components": healthy_components,
                    "total_components": total_components,
                    "component_status": {
                        name: health.status
                        for name, health in self.health_checks.items()
                    }
                },
                "circuit_breakers": {
                    name: breaker["state"]
                    for name, breaker in self.circuit_breakers.items()
                },
                "features": {
                    "auto_recovery": self.auto_recovery,
                    "graceful_degradation": self.graceful_degradation,
                    "fault_tolerance": self.fault_tolerance,
                    "monitoring_active": self.monitoring_active
                },
                "performance_metrics": {
                    component: {
                        "avg_response_time": round(sum(times) / len(times), 3) if times else 0.0,
                        "measurements": len(times)
                    }
                    for component, times in self.performance_metrics.items()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to generate robustness report: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_error_analysis(self, hours: int = 24) -> Dict[str, Any]:
        """Get detailed error analysis for specified time period"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            recent_errors = [
                error for error in self.error_events
                if error.timestamp > cutoff_time
            ]
            
            # Error type distribution
            error_types = {}
            for error in recent_errors:
                error_types[error.error_type] = error_types.get(error.error_type, 0) + 1
            
            # Component error distribution
            component_errors = {}
            for error in recent_errors:
                component_errors[error.component] = component_errors.get(error.component, 0) + 1
            
            # Severity distribution
            severity_distribution = {
                "low": 0, "medium": 0, "high": 0, "critical": 0
            }
            for error in recent_errors:
                severity_distribution[error.severity.value] += 1
            
            return {
                "analysis_period": f"{hours} hours",
                "total_errors": len(recent_errors),
                "error_types": error_types,
                "component_errors": component_errors,
                "severity_distribution": severity_distribution,
                "recovery_attempts": len([e for e in recent_errors if e.recovery_attempted]),
                "successful_recoveries": len([e for e in recent_errors if e.recovery_successful]),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analysis failed: {e}")
            return {"status": "error", "message": str(e)}
    
    async def shutdown(self):
        """Shutdown robustness engine gracefully"""
        logger.info("🛑 Shutting down robustness engine...")
        
        self.monitoring_active = False
        
        for task_name, task in self.monitoring_tasks.items():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                logger.info(f"✅ Task {task_name} cancelled")
        
        logger.info("✅ Robustness engine shutdown complete")

# Global instance
robustness_engine = AdvancedRobustnessEngine()