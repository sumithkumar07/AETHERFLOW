# Advanced Analytics System Complete Implementation
# Feature 7: Analytics & Observability with Third-party Integrations

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import json
import uuid
from dataclasses import dataclass, asdict
from enum import Enum
import statistics
from collections import defaultdict, Counter

logger = logging.getLogger(__name__)

class MetricType(Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"

class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class DashboardType(Enum):
    SYSTEM_OVERVIEW = "system_overview"
    USER_ANALYTICS = "user_analytics"
    PERFORMANCE = "performance"
    BUSINESS_METRICS = "business_metrics"
    CUSTOM = "custom"

@dataclass
class Metric:
    id: str
    name: str
    type: MetricType
    value: Union[float, int, Dict[str, Any]]
    timestamp: datetime
    tags: Dict[str, str]
    dimensions: Dict[str, Any]
    metadata: Dict[str, Any]

@dataclass
class Alert:
    id: str
    name: str
    description: str
    metric_name: str
    condition: Dict[str, Any]
    severity: AlertSeverity
    is_active: bool
    triggered_at: Optional[datetime]
    resolved_at: Optional[datetime]
    notification_channels: List[str]

@dataclass
class Dashboard:
    id: str
    name: str
    description: str
    type: DashboardType
    widgets: List[Dict[str, Any]]
    layout: Dict[str, Any]
    filters: Dict[str, Any]
    refresh_interval: int  # seconds
    created_by: str
    created_at: datetime
    updated_at: datetime

@dataclass
class UserJourney:
    id: str
    user_id: str
    session_id: str
    journey_steps: List[Dict[str, Any]]
    started_at: datetime
    completed_at: Optional[datetime]
    conversion_events: List[str]
    drop_off_point: Optional[str]
    total_duration: Optional[float]  # minutes

class AdvancedAnalyticsSystem:
    """
    Advanced Analytics & Observability System with:
    - Real-time metrics collection and analysis
    - User journey tracking and analytics
    - Performance monitoring and tracing
    - Custom dashboards and visualizations
    - Third-party integrations (Google Analytics, Mixpanel, Amplitude)
    - Predictive analytics and anomaly detection
    - Advanced alerting and notification system
    """
    
    def __init__(self):
        self.metrics: List[Metric] = []
        self.alerts: Dict[str, Alert] = {}
        self.dashboards: Dict[str, Dashboard] = {}
        self.user_journeys: Dict[str, UserJourney] = {}
        self.third_party_integrations: Dict[str, Dict[str, Any]] = {}
        self.metric_aggregations: Dict[str, Any] = {}
        
    async def initialize(self):
        """Initialize analytics system with dashboards and integrations"""
        await self._setup_default_dashboards()
        await self._setup_third_party_integrations()
        await self._setup_default_alerts()
        await self._setup_metric_aggregation()
        logger.info("📊 Advanced Analytics System initialized with dashboards and third-party integrations")
    
    # Metrics Collection
    async def record_metric(
        self,
        name: str,
        value: Union[float, int, Dict[str, Any]],
        metric_type: str = "gauge",
        tags: Dict[str, str] = None,
        dimensions: Dict[str, Any] = None,
        metadata: Dict[str, Any] = None
    ) -> str:
        """Record a new metric"""
        metric_id = str(uuid.uuid4())
        
        metric = Metric(
            id=metric_id,
            name=name,
            type=MetricType(metric_type),
            value=value,
            timestamp=datetime.utcnow(),
            tags=tags or {},
            dimensions=dimensions or {},
            metadata=metadata or {}
        )
        
        self.metrics.append(metric)
        
        # Update aggregations
        await self._update_metric_aggregations(metric)
        
        # Check alerts
        await self._check_alerts(metric)
        
        # Send to third-party integrations
        await self._send_to_third_party_integrations(metric)
        
        return metric_id
    
    async def record_user_event(
        self,
        user_id: str,
        event_name: str,
        event_properties: Dict[str, Any] = None,
        session_id: Optional[str] = None
    ) -> str:
        """Record a user event for analytics"""
        event_id = str(uuid.uuid4())
        
        # Record as metric
        await self.record_metric(
            name=f"user_event.{event_name}",
            value=1,
            metric_type="counter",
            tags={
                "user_id": user_id,
                "event_name": event_name,
                "session_id": session_id or "unknown"
            },
            dimensions=event_properties or {}
        )
        
        # Track user journey
        if session_id:
            await self._track_user_journey(user_id, session_id, event_name, event_properties)
        
        return event_id
    
    async def record_performance_metric(
        self,
        operation_name: str,
        duration_ms: float,
        success: bool = True,
        error_details: Optional[Dict[str, Any]] = None
    ) -> str:
        """Record performance metrics"""
        return await self.record_metric(
            name=f"performance.{operation_name}",
            value=duration_ms,
            metric_type="timer",
            tags={
                "operation": operation_name,
                "success": str(success),
                "status": "success" if success else "error"
            },
            metadata=error_details or {}
        )
    
    # User Journey Tracking
    async def _track_user_journey(
        self,
        user_id: str,
        session_id: str,
        event_name: str,
        event_properties: Dict[str, Any] = None
    ):
        """Track user journey steps"""
        journey_key = f"{user_id}_{session_id}"
        
        if journey_key not in self.user_journeys:
            # Create new journey
            self.user_journeys[journey_key] = UserJourney(
                id=str(uuid.uuid4()),
                user_id=user_id,
                session_id=session_id,
                journey_steps=[],
                started_at=datetime.utcnow(),
                completed_at=None,
                conversion_events=[],
                drop_off_point=None,
                total_duration=None
            )
        
        journey = self.user_journeys[journey_key]
        
        # Add journey step
        journey.journey_steps.append({
            "event_name": event_name,
            "timestamp": datetime.utcnow().isoformat(),
            "properties": event_properties or {},
            "step_number": len(journey.journey_steps) + 1
        })
        
        # Track conversions
        conversion_events = ["signup", "purchase", "subscribe", "download"]
        if event_name.lower() in conversion_events:
            journey.conversion_events.append(event_name)
        
        # Check for session end
        if event_name.lower() in ["logout", "session_end", "page_close"]:
            journey.completed_at = datetime.utcnow()
            journey.total_duration = (journey.completed_at - journey.started_at).total_seconds() / 60
    
    async def get_user_journey_analytics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get user journey analytics"""
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
        
        relevant_journeys = [
            journey for journey in self.user_journeys.values()
            if start_date <= journey.started_at <= end_date
        ]
        
        # Calculate analytics
        total_journeys = len(relevant_journeys)
        completed_journeys = [j for j in relevant_journeys if j.completed_at]
        conversion_journeys = [j for j in relevant_journeys if j.conversion_events]
        
        # Common journey paths
        journey_paths = []
        for journey in relevant_journeys:
            path = " -> ".join([step["event_name"] for step in journey.journey_steps[:5]])  # First 5 steps
            journey_paths.append(path)
        
        path_frequency = Counter(journey_paths).most_common(10)
        
        # Drop-off analysis
        drop_off_points = {}
        for journey in relevant_journeys:
            if len(journey.journey_steps) > 1:
                last_step = journey.journey_steps[-1]["event_name"]
                drop_off_points[last_step] = drop_off_points.get(last_step, 0) + 1
        
        return {
            "summary": {
                "total_journeys": total_journeys,
                "completed_journeys": len(completed_journeys),
                "completion_rate": (len(completed_journeys) / total_journeys * 100) if total_journeys > 0 else 0,
                "conversion_journeys": len(conversion_journeys),
                "conversion_rate": (len(conversion_journeys) / total_journeys * 100) if total_journeys > 0 else 0,
                "avg_journey_duration": statistics.mean([j.total_duration for j in completed_journeys if j.total_duration]) if completed_journeys else 0
            },
            "top_journey_paths": [{"path": path, "frequency": freq} for path, freq in path_frequency],
            "drop_off_analysis": drop_off_points,
            "conversion_funnel": self._calculate_conversion_funnel(relevant_journeys),
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }
    
    def _calculate_conversion_funnel(self, journeys: List[UserJourney]) -> List[Dict[str, Any]]:
        """Calculate conversion funnel stages"""
        funnel_stages = [
            {"stage": "Landing", "events": ["page_view", "visit"], "count": 0},
            {"stage": "Engagement", "events": ["click", "scroll", "interaction"], "count": 0},
            {"stage": "Interest", "events": ["signup_start", "demo_request", "pricing_view"], "count": 0},
            {"stage": "Conversion", "events": ["signup", "purchase", "subscribe"], "count": 0},
            {"stage": "Retention", "events": ["login", "return_visit", "feature_use"], "count": 0}
        ]
        
        for journey in journeys:
            journey_events = [step["event_name"] for step in journey.journey_steps]
            
            for stage in funnel_stages:
                if any(event in journey_events for event in stage["events"]):
                    stage["count"] += 1
        
        # Calculate conversion rates
        total_users = funnel_stages[0]["count"] if funnel_stages else 0
        for i, stage in enumerate(funnel_stages):
            prev_count = funnel_stages[i-1]["count"] if i > 0 else total_users
            stage["conversion_rate"] = (stage["count"] / prev_count * 100) if prev_count > 0 else 0
            stage["drop_off_rate"] = 100 - stage["conversion_rate"]
        
        return funnel_stages
    
    # Dashboard Management
    async def create_dashboard(
        self,
        name: str,
        description: str,
        dashboard_type: str,
        widgets: List[Dict[str, Any]],
        created_by: str,
        layout: Dict[str, Any] = None
    ) -> str:
        """Create a new analytics dashboard"""
        dashboard_id = str(uuid.uuid4())
        
        dashboard = Dashboard(
            id=dashboard_id,
            name=name,
            description=description,
            type=DashboardType(dashboard_type),
            widgets=widgets,
            layout=layout or {"columns": 2, "row_height": 300},
            filters={},
            refresh_interval=30,  # 30 seconds
            created_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.dashboards[dashboard_id] = dashboard
        
        return dashboard_id
    
    async def get_dashboard_data(
        self,
        dashboard_id: str,
        filters: Dict[str, Any] = None,
        time_range: Dict[str, datetime] = None
    ) -> Dict[str, Any]:
        """Get dashboard data with widgets populated"""
        if dashboard_id not in self.dashboards:
            return {"error": "Dashboard not found"}
        
        dashboard = self.dashboards[dashboard_id]
        
        # Apply time range filter
        start_time = time_range.get("start") if time_range else datetime.utcnow() - timedelta(hours=24)
        end_time = time_range.get("end") if time_range else datetime.utcnow()
        
        # Filter metrics by time range
        filtered_metrics = [
            m for m in self.metrics
            if start_time <= m.timestamp <= end_time
        ]
        
        # Apply additional filters
        if filters:
            for filter_key, filter_value in filters.items():
                filtered_metrics = [
                    m for m in filtered_metrics
                    if m.tags.get(filter_key) == filter_value
                ]
        
        # Populate widget data
        widget_data = []
        for widget in dashboard.widgets:
            widget_result = await self._populate_widget_data(widget, filtered_metrics)
            widget_data.append(widget_result)
        
        return {
            "dashboard_id": dashboard_id,
            "name": dashboard.name,
            "description": dashboard.description,
            "type": dashboard.type.value,
            "widgets": widget_data,
            "layout": dashboard.layout,
            "refresh_interval": dashboard.refresh_interval,
            "last_updated": datetime.utcnow().isoformat(),
            "data_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            }
        }
    
    async def _populate_widget_data(
        self,
        widget: Dict[str, Any],
        metrics: List[Metric]
    ) -> Dict[str, Any]:
        """Populate individual widget with data"""
        widget_type = widget.get("type")
        metric_name = widget.get("metric_name")
        
        if widget_type == "counter":
            # Sum all counter metrics
            relevant_metrics = [m for m in metrics if m.name == metric_name and m.type == MetricType.COUNTER]
            total_value = sum(m.value for m in relevant_metrics)
            
            return {
                "widget_id": widget.get("id"),
                "type": widget_type,
                "title": widget.get("title"),
                "value": total_value,
                "format": widget.get("format", "number"),
                "trend": self._calculate_trend(relevant_metrics)
            }
        
        elif widget_type == "line_chart":
            # Time series data
            relevant_metrics = [m for m in metrics if m.name == metric_name]
            
            # Group by time intervals
            time_series = defaultdict(list)
            for metric in relevant_metrics:
                hour_key = metric.timestamp.replace(minute=0, second=0, microsecond=0)
                time_series[hour_key].append(metric.value)
            
            chart_data = []
            for timestamp, values in sorted(time_series.items()):
                avg_value = statistics.mean(values) if values else 0
                chart_data.append({
                    "timestamp": timestamp.isoformat(),
                    "value": avg_value
                })
            
            return {
                "widget_id": widget.get("id"),
                "type": widget_type,
                "title": widget.get("title"),
                "data": chart_data,
                "x_axis": "timestamp",
                "y_axis": "value"
            }
        
        elif widget_type == "pie_chart":
            # Distribution chart
            relevant_metrics = [m for m in metrics if m.name == metric_name]
            
            # Group by tags
            tag_key = widget.get("group_by", "status")
            distribution = defaultdict(float)
            
            for metric in relevant_metrics:
                tag_value = metric.tags.get(tag_key, "unknown")
                distribution[tag_value] += metric.value
            
            chart_data = [
                {"label": label, "value": value}
                for label, value in distribution.items()
            ]
            
            return {
                "widget_id": widget.get("id"),
                "type": widget_type,
                "title": widget.get("title"),
                "data": chart_data
            }
        
        elif widget_type == "table":
            # Data table
            relevant_metrics = [m for m in metrics if m.name == metric_name]
            
            table_data = []
            for metric in relevant_metrics[-10:]:  # Last 10 entries
                row = {
                    "timestamp": metric.timestamp.isoformat(),
                    "value": metric.value,
                    **metric.tags,
                    **metric.dimensions
                }
                table_data.append(row)
            
            return {
                "widget_id": widget.get("id"),
                "type": widget_type,
                "title": widget.get("title"),
                "data": table_data,
                "columns": widget.get("columns", ["timestamp", "value"])
            }
        
        else:
            return {
                "widget_id": widget.get("id"),
                "type": widget_type,
                "title": widget.get("title"),
                "error": f"Unsupported widget type: {widget_type}"
            }
    
    def _calculate_trend(self, metrics: List[Metric]) -> Dict[str, Any]:
        """Calculate trend for metrics"""
        if len(metrics) < 2:
            return {"direction": "stable", "percentage": 0}
        
        # Sort by timestamp
        sorted_metrics = sorted(metrics, key=lambda m: m.timestamp)
        
        # Compare first and second half
        mid_point = len(sorted_metrics) // 2
        first_half_avg = statistics.mean([m.value for m in sorted_metrics[:mid_point]])
        second_half_avg = statistics.mean([m.value for m in sorted_metrics[mid_point:]])
        
        if first_half_avg == 0:
            return {"direction": "stable", "percentage": 0}
        
        percentage_change = ((second_half_avg - first_half_avg) / first_half_avg) * 100
        
        if percentage_change > 5:
            direction = "up"
        elif percentage_change < -5:
            direction = "down"
        else:
            direction = "stable"
        
        return {
            "direction": direction,
            "percentage": abs(percentage_change)
        }
    
    # Third-party Integrations
    async def _setup_third_party_integrations(self):
        """Setup third-party analytics integrations"""
        self.third_party_integrations = {
            "google_analytics": {
                "enabled": False,
                "tracking_id": None,
                "api_key": None,
                "measurement_protocol_endpoint": "https://www.google-analytics.com/mp/collect"
            },
            "mixpanel": {
                "enabled": False,
                "project_token": None,
                "api_endpoint": "https://api.mixpanel.com/track"
            },
            "amplitude": {
                "enabled": False,
                "api_key": None,
                "api_endpoint": "https://api2.amplitude.com/2/httpapi"
            },
            "datadog": {
                "enabled": False,
                "api_key": None,
                "api_endpoint": "https://api.datadoghq.com/api/v1/series"
            },
            "new_relic": {
                "enabled": False,
                "license_key": None,
                "api_endpoint": "https://metric-api.newrelic.com/metric/v1"
            }
        }
    
    async def configure_third_party_integration(
        self,
        integration_name: str,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Configure third-party integration"""
        if integration_name not in self.third_party_integrations:
            return {"error": f"Unknown integration: {integration_name}"}
        
        self.third_party_integrations[integration_name].update(config)
        self.third_party_integrations[integration_name]["enabled"] = True
        
        return {
            "integration": integration_name,
            "status": "configured",
            "enabled": True
        }
    
    async def _send_to_third_party_integrations(self, metric: Metric):
        """Send metric to configured third-party integrations"""
        for integration_name, config in self.third_party_integrations.items():
            if not config.get("enabled"):
                continue
            
            try:
                if integration_name == "google_analytics" and config.get("tracking_id"):
                    await self._send_to_google_analytics(metric, config)
                elif integration_name == "mixpanel" and config.get("project_token"):
                    await self._send_to_mixpanel(metric, config)
                elif integration_name == "amplitude" and config.get("api_key"):
                    await self._send_to_amplitude(metric, config)
                elif integration_name == "datadog" and config.get("api_key"):
                    await self._send_to_datadog(metric, config)
                elif integration_name == "new_relic" and config.get("license_key"):
                    await self._send_to_new_relic(metric, config)
                    
            except Exception as e:
                logger.error(f"Failed to send metric to {integration_name}: {e}")
    
    async def _send_to_google_analytics(self, metric: Metric, config: Dict[str, Any]):
        """Send metric to Google Analytics 4"""
        import httpx
        
        # Convert metric to GA4 event format
        event_data = {
            "client_id": metric.tags.get("user_id", "anonymous"),
            "events": [{
                "name": metric.name.replace(".", "_"),
                "parameters": {
                    "value": metric.value,
                    **metric.tags,
                    **metric.dimensions
                }
            }]
        }
        
        # Send to GA4 Measurement Protocol
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{config['measurement_protocol_endpoint']}?measurement_id={config['tracking_id']}&api_secret={config['api_key']}",
                json=event_data
            )
    
    async def _send_to_mixpanel(self, metric: Metric, config: Dict[str, Any]):
        """Send metric to Mixpanel"""
        import httpx
        import base64
        
        event_data = {
            "event": metric.name,
            "properties": {
                "token": config["project_token"],
                "distinct_id": metric.tags.get("user_id", "anonymous"),
                "value": metric.value,
                "timestamp": int(metric.timestamp.timestamp()),
                **metric.tags,
                **metric.dimensions
            }
        }
        
        # Encode data
        encoded_data = base64.b64encode(json.dumps(event_data).encode()).decode()
        
        async with httpx.AsyncClient() as client:
            await client.post(
                config["api_endpoint"],
                data={"data": encoded_data}
            )
    
    async def _send_to_amplitude(self, metric: Metric, config: Dict[str, Any]):
        """Send metric to Amplitude"""
        import httpx
        
        event_data = {
            "api_key": config["api_key"],
            "events": [{
                "user_id": metric.tags.get("user_id", "anonymous"),
                "event_type": metric.name,
                "event_properties": {
                    "value": metric.value,
                    **metric.tags,
                    **metric.dimensions
                },
                "time": int(metric.timestamp.timestamp() * 1000)
            }]
        }
        
        async with httpx.AsyncClient() as client:
            await client.post(
                config["api_endpoint"],
                json=event_data
            )
    
    async def _send_to_datadog(self, metric: Metric, config: Dict[str, Any]):
        """Send metric to Datadog"""
        import httpx
        
        metric_data = {
            "series": [{
                "metric": metric.name,
                "points": [[int(metric.timestamp.timestamp()), metric.value]],
                "tags": [f"{k}:{v}" for k, v in metric.tags.items()]
            }]
        }
        
        headers = {"DD-API-KEY": config["api_key"]}
        
        async with httpx.AsyncClient() as client:
            await client.post(
                config["api_endpoint"],
                json=metric_data,
                headers=headers
            )
    
    async def _send_to_new_relic(self, metric: Metric, config: Dict[str, Any]):
        """Send metric to New Relic"""
        import httpx
        
        metric_data = [{
            "metrics": [{
                "name": metric.name,
                "type": metric.type.value,
                "value": metric.value,
                "timestamp": int(metric.timestamp.timestamp() * 1000),
                "attributes": {**metric.tags, **metric.dimensions}
            }]
        }]
        
        headers = {"Api-Key": config["license_key"]}
        
        async with httpx.AsyncClient() as client:
            await client.post(
                config["api_endpoint"],
                json=metric_data,
                headers=headers
            )
    
    # Default Setup
    async def _setup_default_dashboards(self):
        """Setup default analytics dashboards"""
        # System Overview Dashboard
        system_overview = await self.create_dashboard(
            name="System Overview",
            description="High-level system performance and usage metrics",
            dashboard_type="system_overview",
            created_by="system",
            widgets=[
                {
                    "id": "total_users",
                    "type": "counter",
                    "title": "Total Users",
                    "metric_name": "user_event.login",
                    "format": "number"
                },
                {
                    "id": "api_response_time",
                    "type": "line_chart",
                    "title": "API Response Time",
                    "metric_name": "performance.api_call"
                },
                {
                    "id": "error_distribution",
                    "type": "pie_chart",
                    "title": "Error Distribution",
                    "metric_name": "system.error",
                    "group_by": "error_type"
                }
            ]
        )
        
        # User Analytics Dashboard
        user_analytics = await self.create_dashboard(
            name="User Analytics",
            description="User behavior and engagement metrics",
            dashboard_type="user_analytics",
            created_by="system",
            widgets=[
                {
                    "id": "active_users",
                    "type": "counter",
                    "title": "Active Users",
                    "metric_name": "user_event.page_view",
                    "format": "number"
                },
                {
                    "id": "user_engagement",
                    "type": "line_chart",
                    "title": "User Engagement Over Time",
                    "metric_name": "user_event.interaction"
                },
                {
                    "id": "feature_usage",
                    "type": "pie_chart",
                    "title": "Feature Usage",
                    "metric_name": "user_event.feature_use",
                    "group_by": "feature_name"
                }
            ]
        )
    
    async def _setup_default_alerts(self):
        """Setup default alert rules"""
        # High error rate alert
        error_alert_id = str(uuid.uuid4())
        self.alerts[error_alert_id] = Alert(
            id=error_alert_id,
            name="High Error Rate",
            description="Alert when error rate exceeds 5%",
            metric_name="system.error",
            condition={"threshold": 0.05, "operator": "greater_than", "window": "5m"},
            severity=AlertSeverity.HIGH,
            is_active=True,
            triggered_at=None,
            resolved_at=None,
            notification_channels=["email", "slack"]
        )
        
        # Slow response time alert
        performance_alert_id = str(uuid.uuid4())
        self.alerts[performance_alert_id] = Alert(
            id=performance_alert_id,
            name="Slow Response Time",
            description="Alert when average response time exceeds 2 seconds",
            metric_name="performance.api_call",
            condition={"threshold": 2000, "operator": "greater_than", "window": "10m"},
            severity=AlertSeverity.MEDIUM,
            is_active=True,
            triggered_at=None,
            resolved_at=None,
            notification_channels=["email"]
        )
    
    async def _setup_metric_aggregation(self):
        """Setup metric aggregation and retention policies"""
        self.metric_aggregations = {
            "retention_policy": {
                "raw_metrics": "7d",      # Keep raw metrics for 7 days
                "hourly_aggregates": "30d", # Keep hourly aggregates for 30 days
                "daily_aggregates": "1y"    # Keep daily aggregates for 1 year
            },
            "aggregation_rules": {
                "performance.*": ["avg", "p95", "p99", "max", "min"],
                "user_event.*": ["count", "unique"],
                "system.*": ["sum", "avg", "max"]
            }
        }
    
    async def _update_metric_aggregations(self, metric: Metric):
        """Update metric aggregations"""
        # This would update pre-aggregated metrics for faster querying
        pass
    
    async def _check_alerts(self, metric: Metric):
        """Check if metric triggers any alerts"""
        for alert in self.alerts.values():
            if not alert.is_active:
                continue
                
            if metric.name == alert.metric_name:
                # Simple threshold checking (in production, implement more sophisticated alerting)
                threshold = alert.condition.get("threshold")
                operator = alert.condition.get("operator")
                
                triggered = False
                if operator == "greater_than" and metric.value > threshold:
                    triggered = True
                elif operator == "less_than" and metric.value < threshold:
                    triggered = True
                elif operator == "equals" and metric.value == threshold:
                    triggered = True
                
                if triggered and not alert.triggered_at:
                    alert.triggered_at = datetime.utcnow()
                    logger.warning(f"Alert triggered: {alert.name} - Value: {metric.value}, Threshold: {threshold}")
                    # In production, send notifications here
                elif not triggered and alert.triggered_at:
                    alert.resolved_at = datetime.utcnow()
                    alert.triggered_at = None
                    logger.info(f"Alert resolved: {alert.name}")
    
    # Public API Methods
    async def get_analytics_summary(
        self,
        time_range: Dict[str, datetime] = None
    ) -> Dict[str, Any]:
        """Get comprehensive analytics summary"""
        start_time = time_range.get("start") if time_range else datetime.utcnow() - timedelta(hours=24)
        end_time = time_range.get("end") if time_range else datetime.utcnow()
        
        filtered_metrics = [
            m for m in self.metrics
            if start_time <= m.timestamp <= end_time
        ]
        
        return {
            "summary": {
                "total_metrics": len(filtered_metrics),
                "active_dashboards": len(self.dashboards),
                "active_alerts": len([a for a in self.alerts.values() if a.is_active]),
                "triggered_alerts": len([a for a in self.alerts.values() if a.triggered_at]),
                "third_party_integrations": len([i for i in self.third_party_integrations.values() if i.get("enabled")]),
                "user_journeys": len(self.user_journeys)
            },
            "time_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            },
            "top_metrics": self._get_top_metrics(filtered_metrics),
            "alert_status": [
                {
                    "name": alert.name,
                    "severity": alert.severity.value,
                    "is_triggered": alert.triggered_at is not None,
                    "last_triggered": alert.triggered_at.isoformat() if alert.triggered_at else None
                }
                for alert in self.alerts.values()
            ]
        }
    
    def _get_top_metrics(self, metrics: List[Metric], limit: int = 10) -> List[Dict[str, Any]]:
        """Get top metrics by frequency"""
        metric_counts = Counter(m.name for m in metrics)
        
        return [
            {
                "metric_name": name,
                "count": count,
                "latest_value": next((m.value for m in reversed(metrics) if m.name == name), None)
            }
            for name, count in metric_counts.most_common(limit)
        ]

# Global advanced analytics system instance
_analytics_system = None

async def get_analytics_system() -> AdvancedAnalyticsSystem:
    """Get the global analytics system instance"""
    global _analytics_system
    if _analytics_system is None:
        _analytics_system = AdvancedAnalyticsSystem()
        await _analytics_system.initialize()
    return _analytics_system