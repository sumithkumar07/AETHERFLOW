"""
Robustness API Routes
Provides system reliability and error handling enhancements
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

from services.advanced_robustness_engine import robustness_engine

logger = logging.getLogger(__name__)

router = APIRouter()

class RobustOperationRequest(BaseModel):
    operation_name: str
    component: str = "general"
    retry_policy: Optional[str] = "api_call"
    timeout: Optional[float] = 30.0

@router.get("/health")
async def robustness_health_check():
    """
    Comprehensive system health check
    Shows reliability status for all components
    """
    try:
        report = await robustness_engine.get_robustness_report()
        
        return {
            "system_health": report.get("system_health", {}),
            "circuit_breakers": report.get("circuit_breakers", {}),
            "features": report.get("features", {}),
            "overall_status": "healthy" if report.get("system_health", {}).get("overall_score", 0) > 80 else "degraded",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Robustness health check error: {e}")
        return {
            "overall_status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/report")
async def get_robustness_report():
    """
    Get comprehensive robustness and reliability report
    Shows error statistics, recovery rates, and system health
    """
    try:
        report = await robustness_engine.get_robustness_report()
        
        return {
            "robustness_report": report,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Robustness report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/errors/analysis")
async def get_error_analysis(hours: int = 24):
    """
    Get detailed error analysis for specified time period
    Shows error patterns, component issues, and recovery success rates
    """
    try:
        analysis = await robustness_engine.get_error_analysis(hours=hours)
        
        return {
            "error_analysis": analysis,
            "analysis_period_hours": hours,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/initialize")
async def initialize_robustness_systems():
    """
    Initialize or reinitialize robustness systems
    Starts all monitoring and recovery systems
    """
    try:
        await robustness_engine.initialize_robustness_systems()
        
        return {
            "message": "Robustness systems initialized successfully",
            "features": {
                "auto_recovery": robustness_engine.auto_recovery,
                "graceful_degradation": robustness_engine.graceful_degradation,
                "fault_tolerance": robustness_engine.fault_tolerance,
                "monitoring_active": robustness_engine.monitoring_active
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Robustness initialization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/circuit-breakers")
async def get_circuit_breaker_status():
    """
    Get status of all circuit breakers
    Shows which components are protected and their current state
    """
    try:
        return {
            "circuit_breakers": robustness_engine.circuit_breakers,
            "total_breakers": len(robustness_engine.circuit_breakers),
            "states": {
                "closed": len([b for b in robustness_engine.circuit_breakers.values() if b["state"] == "closed"]),
                "open": len([b for b in robustness_engine.circuit_breakers.values() if b["state"] == "open"]),
                "half_open": len([b for b in robustness_engine.circuit_breakers.values() if b["state"] == "half_open"])
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Circuit breaker status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/circuit-breakers/{component}/reset")
async def reset_circuit_breaker(component: str):
    """
    Reset circuit breaker for specific component
    Forces circuit breaker back to closed state
    """
    try:
        if component not in robustness_engine.circuit_breakers:
            raise HTTPException(status_code=404, detail=f"Circuit breaker for {component} not found")
        
        robustness_engine.circuit_breakers[component]["state"] = "closed"
        robustness_engine.circuit_breakers[component]["failure_count"] = 0
        robustness_engine.circuit_breakers[component]["last_failure"] = None
        
        return {
            "message": f"Circuit breaker reset for {component}",
            "component": component,
            "new_state": "closed",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Circuit breaker reset error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance/metrics")
async def get_performance_metrics():
    """
    Get performance metrics for all components
    Shows response times and performance trends
    """
    try:
        metrics = {}
        
        for component, times in robustness_engine.performance_metrics.items():
            if times:
                metrics[component] = {
                    "average_response_time": round(sum(times) / len(times), 3),
                    "min_response_time": round(min(times), 3),
                    "max_response_time": round(max(times), 3),
                    "measurement_count": len(times),
                    "recent_performance": times[-10:] if len(times) >= 10 else times
                }
            else:
                metrics[component] = {
                    "average_response_time": 0.0,
                    "min_response_time": 0.0,
                    "max_response_time": 0.0,
                    "measurement_count": 0,
                    "recent_performance": []
                }
        
        return {
            "performance_metrics": metrics,
            "total_components": len(metrics),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Performance metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monitoring/status")
async def get_monitoring_status():
    """
    Get status of all monitoring and background tasks
    Shows which robustness features are active
    """
    try:
        active_tasks = len(robustness_engine.monitoring_tasks)
        
        return {
            "monitoring_active": robustness_engine.monitoring_active,
            "active_tasks": active_tasks,
            "task_names": list(robustness_engine.monitoring_tasks.keys()),
            "features": {
                "auto_recovery": robustness_engine.auto_recovery,
                "graceful_degradation": robustness_engine.graceful_degradation,
                "fault_tolerance": robustness_engine.fault_tolerance
            },
            "health_checks": len(robustness_engine.health_checks),
            "error_events_tracked": len(robustness_engine.error_events),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Monitoring status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recovery/trigger/{component}")
async def trigger_recovery(component: str):
    """
    Manually trigger recovery for specific component
    Forces recovery attempt for degraded components
    """
    try:
        # Check if component exists in health checks
        if component not in robustness_engine.health_checks:
            raise HTTPException(status_code=404, detail=f"Component {component} not found")
        
        health = robustness_engine.health_checks[component]
        
        # Reset component status
        health.error_count = 0
        health.success_rate = 100.0
        health.status = "healthy"
        health.last_check = datetime.utcnow()
        
        # Reset circuit breaker if exists
        if component in robustness_engine.circuit_breakers:
            robustness_engine.circuit_breakers[component]["state"] = "closed"
            robustness_engine.circuit_breakers[component]["failure_count"] = 0
        
        return {
            "message": f"Recovery triggered for {component}",
            "component": component,
            "new_status": health.status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recovery trigger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Initialize robustness engine on startup
@router.on_event("startup")
async def startup_robustness_engine():
    """Initialize robustness engine on startup"""
    try:
        await robustness_engine.initialize_robustness_systems()
        logger.info("✅ Robustness engine initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize robustness engine: {e}")