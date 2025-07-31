import asyncio
import logging
import time
import psutil
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

class AlertLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

@dataclass
class MetricPoint:
    timestamp: datetime
    value: float
    labels: Dict[str, str] = None

@dataclass
class Alert:
    id: str
    level: AlertLevel
    title: str
    message: str
    timestamp: datetime
    resolved: bool = False
    metric_name: str = None
    threshold: float = None
    current_value: float = None

class MetricsCollector:
    """Collect and store application metrics"""
    
    def __init__(self):
        self.metrics: Dict[str, List[MetricPoint]] = {}
        self.alerts: List[Alert] = []
        self.alert_rules: Dict[str, Dict[str, Any]] = {}
        
        # Default alert rules
        self.setup_default_alert_rules()
        
    def setup_default_alert_rules(self):
        """Setup default alert rules for common metrics"""
        self.alert_rules = {
            "cpu_usage": {
                "warning_threshold": 70.0,
                "critical_threshold": 90.0,
                "window_minutes": 5
            },
            "memory_usage": {
                "warning_threshold": 80.0,
                "critical_threshold": 95.0,
                "window_minutes": 5
            },
            "response_time": {
                "warning_threshold": 1000.0,  # ms
                "critical_threshold": 3000.0,  # ms
                "window_minutes": 10
            },
            "error_rate": {
                "warning_threshold": 5.0,  # %
                "critical_threshold": 10.0,  # %
                "window_minutes": 15
            },
            "disk_usage": {
                "warning_threshold": 80.0,
                "critical_threshold": 95.0,
                "window_minutes": 30
            }
        }
    
    def record_metric(self, name: str, value: float, labels: Dict[str, str] = None):
        """Record a metric point"""
        if name not in self.metrics:
            self.metrics[name] = []
        
        metric_point = MetricPoint(
            timestamp=datetime.utcnow(),
            value=value,
            labels=labels or {}
        )
        
        self.metrics[name].append(metric_point)
        
        # Keep only last 1000 points per metric
        if len(self.metrics[name]) > 1000:
            self.metrics[name] = self.metrics[name][-1000:]
        
        # Check alert rules
        self._check_alert_rules(name, value)
    
    def _check_alert_rules(self, metric_name: str, current_value: float):
        """Check if current metric value triggers any alerts"""
        if metric_name not in self.alert_rules:
            return
        
        rules = self.alert_rules[metric_name]
        warning_threshold = rules.get("warning_threshold")
        critical_threshold = rules.get("critical_threshold")
        
        # Check critical threshold
        if critical_threshold and current_value >= critical_threshold:
            self._create_alert(
                level=AlertLevel.CRITICAL,
                title=f"Critical: High {metric_name.replace('_', ' ').title()}",
                message=f"{metric_name} has reached {current_value:.1f}, exceeding critical threshold of {critical_threshold}",
                metric_name=metric_name,
                threshold=critical_threshold,
                current_value=current_value
            )
        # Check warning threshold
        elif warning_threshold and current_value >= warning_threshold:
            self._create_alert(
                level=AlertLevel.WARNING,
                title=f"Warning: Elevated {metric_name.replace('_', ' ').title()}",
                message=f"{metric_name} has reached {current_value:.1f}, exceeding warning threshold of {warning_threshold}",
                metric_name=metric_name,
                threshold=warning_threshold,
                current_value=current_value
            )
    
    def _create_alert(self, level: AlertLevel, title: str, message: str, 
                     metric_name: str = None, threshold: float = None, 
                     current_value: float = None):
        """Create a new alert"""
        alert_id = f"{metric_name}_{level}_{int(time.time())}"
        
        # Check if similar alert already exists and is not resolved
        existing_alert = next((
            a for a in self.alerts 
            if a.metric_name == metric_name 
            and a.level == level 
            and not a.resolved
        ), None)
        
        if existing_alert:
            # Update existing alert
            existing_alert.current_value = current_value
            existing_alert.timestamp = datetime.utcnow()
            return
        
        alert = Alert(
            id=alert_id,
            level=level,
            title=title,
            message=message,
            timestamp=datetime.utcnow(),
            metric_name=metric_name,
            threshold=threshold,
            current_value=current_value
        )
        
        self.alerts.append(alert)
        
        # Keep only last 100 alerts
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
        
        logger.warning(f"Alert created: {title} - {message}")
    
    def get_metric_stats(self, name: str, window_minutes: int = 60) -> Dict[str, Any]:
        """Get statistics for a metric within a time window"""
        if name not in self.metrics:
            return {}
        
        cutoff_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        recent_points = [
            p for p in self.metrics[name] 
            if p.timestamp > cutoff_time
        ]
        
        if not recent_points:
            return {}
        
        values = [p.value for p in recent_points]
        
        return {
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "avg": sum(values) / len(values),
            "latest": values[-1],
            "window_minutes": window_minutes
        }
    
    def get_active_alerts(self) -> List[Alert]:
        """Get all active (unresolved) alerts"""
        return [a for a in self.alerts if not a.resolved]
    
    def resolve_alert(self, alert_id: str) -> bool:
        """Mark an alert as resolved"""
        alert = next((a for a in self.alerts if a.id == alert_id), None)
        if alert:
            alert.resolved = True
            return True
        return False

class SystemMonitor:
    """Monitor system resources and application health"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self.monitoring_active = False
        
    async def start_monitoring(self, interval_seconds: int = 30):
        """Start system monitoring loop"""
        self.monitoring_active = True
        
        while self.monitoring_active:
            try:
                await self._collect_system_metrics()
                await asyncio.sleep(interval_seconds)
            except Exception as e:
                logger.error(f"Error in system monitoring: {e}")
                await asyncio.sleep(interval_seconds)
    
    def stop_monitoring(self):
        """Stop system monitoring"""
        self.monitoring_active = False
    
    async def _collect_system_metrics(self):
        """Collect system resource metrics"""
        try:
            # CPU Usage
            cpu_percent = psutil.cpu_percent(interval=1)
            self.metrics.record_metric("cpu_usage", cpu_percent)
            
            # Memory Usage
            memory = psutil.virtual_memory()
            self.metrics.record_metric("memory_usage", memory.percent)
            self.metrics.record_metric("memory_available", memory.available / (1024**3))  # GB
            
            # Disk Usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            self.metrics.record_metric("disk_usage", disk_percent)
            self.metrics.record_metric("disk_free", disk.free / (1024**3))  # GB
            
            # Network I/O
            network = psutil.net_io_counters()
            self.metrics.record_metric("network_bytes_sent", network.bytes_sent)
            self.metrics.record_metric("network_bytes_recv", network.bytes_recv)
            
            # Process count
            process_count = len(psutil.pids())
            self.metrics.record_metric("process_count", process_count)
            
            # Load average (Unix systems only)
            if hasattr(psutil, 'getloadavg'):
                load_avg = psutil.getloadavg()
                self.metrics.record_metric("load_average_1m", load_avg[0])
                self.metrics.record_metric("load_average_5m", load_avg[1])
                self.metrics.record_metric("load_average_15m", load_avg[2])
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")

class HealthChecker:
    """Application health checking system"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self.health_checks: Dict[str, Dict[str, Any]] = {}
        
    def register_health_check(self, name: str, check_function, 
                            interval_seconds: int = 60, timeout_seconds: int = 10):
        """Register a health check function"""
        self.health_checks[name] = {
            "function": check_function,
            "interval": interval_seconds,
            "timeout": timeout_seconds,
            "last_run": None,
            "last_status": None,
            "last_error": None
        }
    
    async def run_health_checks(self) -> Dict[str, Any]:
        """Run all registered health checks"""
        results = {}
        overall_status = "healthy"
        
        for name, check_config in self.health_checks.items():
            try:
                start_time = time.time()
                
                # Run health check with timeout
                result = await asyncio.wait_for(
                    check_config["function"](),
                    timeout=check_config["timeout"]
                )
                
                end_time = time.time()
                response_time = (end_time - start_time) * 1000  # ms
                
                results[name] = {
                    "status": "healthy",
                    "response_time_ms": round(response_time, 2),
                    "details": result if isinstance(result, dict) else None,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Record metrics
                self.metrics.record_metric(f"health_check_{name}_response_time", response_time)
                self.metrics.record_metric(f"health_check_{name}_status", 1)  # 1 = healthy
                
                # Update check config
                check_config["last_run"] = datetime.utcnow()
                check_config["last_status"] = "healthy"
                check_config["last_error"] = None
                
            except asyncio.TimeoutError:
                results[name] = {
                    "status": "timeout",
                    "error": f"Health check timed out after {check_config['timeout']}s",
                    "timestamp": datetime.utcnow().isoformat()
                }
                overall_status = "unhealthy"
                
                # Record metrics
                self.metrics.record_metric(f"health_check_{name}_status", 0)  # 0 = unhealthy
                
                # Update check config
                check_config["last_status"] = "timeout"
                check_config["last_error"] = "Timeout"
                
            except Exception as e:
                results[name] = {
                    "status": "failed",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
                overall_status = "unhealthy"
                
                # Record metrics
                self.metrics.record_metric(f"health_check_{name}_status", 0)  # 0 = unhealthy
                
                # Update check config
                check_config["last_status"] = "failed"
                check_config["last_error"] = str(e)
        
        return {
            "overall_status": overall_status,
            "checks": results,
            "timestamp": datetime.utcnow().isoformat()
        }

# Global monitoring instances
metrics_collector = MetricsCollector()
system_monitor = SystemMonitor(metrics_collector)
health_checker = HealthChecker(metrics_collector)

# Example health check functions
async def database_health_check():
    """Check database connectivity"""
    try:
        from models.database import get_database
        db = await get_database()
        # Simple ping to database
        await db.command("ping")
        return {"connection": "ok"}
    except Exception as e:
        raise Exception(f"Database connection failed: {str(e)}")

async def redis_health_check():
    """Check Redis connectivity"""
    try:
        from services.cache_service import cache_service
        # Simple ping to Redis
        test_key = "health_check_test"
        await cache_service.set(test_key, "ok", 60)
        result = await cache_service.get(test_key)
        await cache_service.delete(test_key)
        
        if result == "ok":
            return {"connection": "ok"}
        else:
            raise Exception("Redis ping failed")
    except Exception as e:
        raise Exception(f"Redis connection failed: {str(e)}")

# Register default health checks
health_checker.register_health_check("database", database_health_check, 60, 5)
health_checker.register_health_check("redis", redis_health_check, 60, 5)