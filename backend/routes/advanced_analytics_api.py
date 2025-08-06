"""
Advanced Analytics API Routes - Complete Implementation
Analytics dashboard, metrics tracking, custom reports, third-party integrations
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import logging

from services.advanced_analytics_complete import get_analytics_system, MetricType

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class MetricRequest(BaseModel):
    name: str = Field(..., description="Metric name")
    value: Union[int, float] = Field(..., description="Metric value")
    type: str = Field(..., description="Metric type: counter, gauge, histogram, timer")
    dimensions: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metric dimensions/tags")
    user_id: Optional[str] = Field(None, description="User ID associated with metric")
    session_id: Optional[str] = Field(None, description="Session ID associated with metric")

class EventRequest(BaseModel):
    event_type: str = Field(..., description="Type of event")
    properties: Dict[str, Any] = Field(..., description="Event properties")
    user_id: Optional[str] = Field(None, description="User ID")
    session_id: Optional[str] = Field(None, description="Session ID")

class DashboardRequest(BaseModel):
    name: str = Field(..., description="Dashboard name")
    description: str = Field(..., description="Dashboard description")
    widgets: List[Dict[str, Any]] = Field(..., description="Dashboard widgets configuration")
    is_public: bool = Field(False, description="Whether dashboard is public")

class ReportRequest(BaseModel):
    report_type: str = Field(..., description="Type of report to generate")
    parameters: Dict[str, Any] = Field(..., description="Report parameters")

@router.get("/health")
async def analytics_health_check():
    """Health check for analytics system"""
    try:
        analytics_system = await get_analytics_system()
        return {
            "status": "healthy",
            "service": "Advanced Analytics System",
            "features": {
                "metrics_tracking": "active",
                "custom_dashboards": "active",
                "third_party_integrations": "active",
                "real_time_analytics": "active"
            },
            "supported_providers": ["Datadog", "New Relic", "Grafana", "Mixpanel", "Amplitude"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Analytics health check failed: {e}")
        raise HTTPException(status_code=503, detail="Analytics system unavailable")

@router.post("/metrics")
async def record_metric(metric_request: MetricRequest):
    """Record a metric data point"""
    try:
        analytics_system = await get_analytics_system()
        
        # Convert string type to enum
        try:
            metric_type = MetricType(metric_request.type.upper())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid metric type: {metric_request.type}")
        
        # Record the metric
        metric_id = await analytics_system.record_metric(
            name=metric_request.name,
            value=metric_request.value,
            metric_type=metric_type,
            dimensions=metric_request.dimensions,
            user_id=metric_request.user_id,
            session_id=metric_request.session_id
        )
        
        return {
            "success": True,
            "metric_id": metric_id,
            "message": "Metric recorded successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to record metric: {e}")
        raise HTTPException(status_code=500, detail="Failed to record metric")

@router.post("/events")
async def track_event(event_request: EventRequest):
    """Track an analytics event"""
    try:
        analytics_system = await get_analytics_system()
        
        # Track the event
        event_id = await analytics_system.track_event(
            event_type=event_request.event_type,
            properties=event_request.properties,
            user_id=event_request.user_id,
            session_id=event_request.session_id
        )
        
        return {
            "success": True,
            "event_id": event_id,
            "message": "Event tracked successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to track event: {e}")
        raise HTTPException(status_code=500, detail="Failed to track event")

@router.get("/dashboards")
async def get_available_dashboards(user_id: str = Query("demo_user", description="User ID")):
    """Get available analytics dashboards"""
    try:
        analytics_system = await get_analytics_system()
        dashboards = await analytics_system.get_available_dashboards(user_id)
        
        return {
            "success": True,
            "dashboards": dashboards,
            "count": len(dashboards),
            "message": "Available dashboards retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get available dashboards: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboards")

@router.get("/dashboards/{dashboard_id}")
async def get_dashboard_data(dashboard_id: str):
    """Get data for a specific dashboard"""
    try:
        analytics_system = await get_analytics_system()
        dashboard_data = await analytics_system.get_dashboard_data(dashboard_id)
        
        return {
            "success": True,
            "dashboard": dashboard_data,
            "message": "Dashboard data retrieved successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Failed to get dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard data")

@router.post("/dashboards")
async def create_custom_dashboard(
    dashboard_request: DashboardRequest,
    owner_id: str = Query("demo_user", description="Dashboard owner ID")
):
    """Create a custom analytics dashboard"""
    try:
        analytics_system = await get_analytics_system()
        
        dashboard_id = await analytics_system.create_custom_dashboard(
            name=dashboard_request.name,
            description=dashboard_request.description,
            owner_id=owner_id,
            widgets=dashboard_request.widgets,
            is_public=dashboard_request.is_public
        )
        
        return {
            "success": True,
            "dashboard_id": dashboard_id,
            "message": "Custom dashboard created successfully",
            "name": dashboard_request.name
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to create custom dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to create custom dashboard")

@router.post("/reports")
async def generate_report(report_request: ReportRequest):
    """Generate analytics report"""
    try:
        analytics_system = await get_analytics_system()
        
        report = await analytics_system.generate_report(
            report_type=report_request.report_type,
            parameters=report_request.parameters
        )
        
        return {
            "success": True,
            "report": report,
            "message": f"Report '{report_request.report_type}' generated successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Failed to generate report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.get("/summary")
async def get_analytics_summary():
    """Get overall analytics system summary"""
    try:
        analytics_system = await get_analytics_system()
        summary = await analytics_system.get_analytics_summary()
        
        return {
            "success": True,
            "summary": summary,
            "message": "Analytics summary retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get analytics summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics summary")

@router.get("/metrics/types")
async def get_metric_types():
    """Get available metric types"""
    return {
        "success": True,
        "metric_types": [
            {
                "type": "COUNTER",
                "description": "A metric that only increases (e.g., requests count, errors count)",
                "example": "api_requests_total"
            },
            {
                "type": "GAUGE",
                "description": "A metric that can go up and down (e.g., CPU usage, memory usage)",
                "example": "cpu_usage_percent"
            },
            {
                "type": "HISTOGRAM",
                "description": "A metric that samples observations (e.g., request durations, response sizes)",
                "example": "request_duration_seconds"
            },
            {
                "type": "TIMER",
                "description": "A metric that measures timing information",
                "example": "database_query_time"
            }
        ]
    }

@router.get("/providers")
async def get_third_party_providers():
    """Get available third-party analytics providers"""
    return {
        "success": True,
        "providers": [
            {
                "name": "Datadog",
                "description": "Infrastructure monitoring and analytics platform",
                "features": ["Metrics", "Logs", "APM", "Alerting"],
                "status": "configured"
            },
            {
                "name": "New Relic",
                "description": "Application performance monitoring",
                "features": ["APM", "Browser Monitoring", "Mobile Monitoring"],
                "status": "available"
            },
            {
                "name": "Grafana",
                "description": "Open source analytics and monitoring solution",
                "features": ["Dashboards", "Alerting", "Data Sources"],
                "status": "configured"
            },
            {
                "name": "Mixpanel",
                "description": "Product analytics platform",
                "features": ["Event Tracking", "Funnel Analysis", "Cohort Analysis"],
                "status": "available"
            },
            {
                "name": "Amplitude",
                "description": "Digital analytics platform",
                "features": ["User Analytics", "Behavioral Cohorts", "Retention Analysis"],
                "status": "available"
            }
        ]
    }

@router.get("/dashboard-templates")
async def get_dashboard_templates():
    """Get available dashboard templates"""
    return {
        "success": True,
        "templates": [
            {
                "id": "system_overview",
                "name": "System Overview",
                "description": "Overall platform performance and usage metrics",
                "widgets": ["active_users", "ai_requests", "response_times", "error_rate"],
                "category": "System Monitoring"
            },
            {
                "id": "user_engagement",
                "name": "User Engagement Analytics",
                "description": "User behavior and engagement patterns",
                "widgets": ["session_duration", "feature_usage", "user_retention"],
                "category": "User Analytics"
            },
            {
                "id": "performance_monitoring",
                "name": "Performance Monitoring",
                "description": "System performance and infrastructure metrics",
                "widgets": ["cpu_usage", "memory_usage", "api_latency"],
                "category": "Performance"
            }
        ]
    }

# Convenience endpoints for common metrics
@router.post("/metrics/page-view")
async def track_page_view(
    page: str = Body(..., description="Page URL or identifier"),
    user_id: Optional[str] = Body(None, description="User ID"),
    session_id: Optional[str] = Body(None, description="Session ID"),
    referrer: Optional[str] = Body(None, description="Referrer URL"),
    user_agent: Optional[str] = Body(None, description="User agent")
):
    """Convenience endpoint for tracking page views"""
    try:
        analytics_system = await get_analytics_system()
        
        # Record page view metric
        await analytics_system.record_metric(
            name="page_views",
            value=1,
            metric_type=MetricType.COUNTER,
            dimensions={
                "page": page,
                "referrer": referrer,
                "user_agent": user_agent
            },
            user_id=user_id,
            session_id=session_id
        )
        
        # Track page view event
        event_id = await analytics_system.track_event(
            event_type="page_view",
            properties={
                "page": page,
                "referrer": referrer,
                "user_agent": user_agent
            },
            user_id=user_id,
            session_id=session_id
        )
        
        return {
            "success": True,
            "event_id": event_id,
            "message": "Page view tracked successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to track page view: {e}")
        raise HTTPException(status_code=500, detail="Failed to track page view")

@router.post("/metrics/user-action")
async def track_user_action(
    action: str = Body(..., description="Action name"),
    category: str = Body(..., description="Action category"),
    value: Optional[Union[int, float]] = Body(None, description="Action value"),
    user_id: Optional[str] = Body(None, description="User ID"),
    session_id: Optional[str] = Body(None, description="Session ID"),
    properties: Optional[Dict[str, Any]] = Body(default_factory=dict, description="Additional properties")
):
    """Convenience endpoint for tracking user actions"""
    try:
        analytics_system = await get_analytics_system()
        
        # Track user action event
        event_id = await analytics_system.track_event(
            event_type="user_action",
            properties={
                "action": action,
                "category": category,
                "value": value,
                **properties
            },
            user_id=user_id,
            session_id=session_id
        )
        
        return {
            "success": True,
            "event_id": event_id,
            "message": "User action tracked successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to track user action: {e}")
        raise HTTPException(status_code=500, detail="Failed to track user action")