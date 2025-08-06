"""
Advanced Analytics System - Priority 4
User journey tracking, deep tracing, third-party integrations, and predictive analytics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
import json
import uuid
import asyncio
from collections import defaultdict
import statistics
from dataclasses import dataclass, asdict
import logging

class AnalyticsEventType(Enum):
    PAGE_VIEW = "page_view"
    USER_ACTION = "user_action"
    API_CALL = "api_call"
    ERROR = "error"
    PERFORMANCE = "performance"
    BUSINESS = "business"
    SYSTEM = "system"

class UserJourneyStage(Enum):
    AWARENESS = "awareness"
    CONSIDERATION = "consideration"
    TRIAL = "trial"
    ADOPTION = "adoption"
    RETENTION = "retention"
    ADVOCACY = "advocacy"

class MetricType(Enum):
    COUNTER = "counter"
    GAUGE = "gauge" 
    HISTOGRAM = "histogram"
    TIMER = "timer"

@dataclass
class AnalyticsEvent:
    id: str
    user_id: Optional[str]
    session_id: str
    event_type: AnalyticsEventType
    event_name: str
    properties: Dict[str, Any]
    timestamp: datetime
    device_info: Optional[Dict] = None
    location: Optional[Dict] = None
    
@dataclass
class UserJourney:
    user_id: str
    session_id: str
    journey_id: str
    stage: UserJourneyStage
    events: List[AnalyticsEvent]
    started_at: datetime
    updated_at: datetime
    conversion_events: List[str] = None
    
@dataclass
class PerformanceTrace:
    trace_id: str
    operation: str
    duration_ms: float
    status: str
    spans: List[Dict]
    metadata: Dict[str, Any]
    timestamp: datetime

class AdvancedAnalyticsSystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.events: List[AnalyticsEvent] = []
        self.user_journeys: Dict[str, UserJourney] = {}
        self.performance_traces: List[PerformanceTrace] = []
        self.custom_metrics: Dict[str, List] = defaultdict(list)
        self.dashboards: Dict[str, Dict] = {}
        self.third_party_integrations = self._initialize_integrations()
        
    def _initialize_integrations(self) -> Dict[str, Dict]:
        """Initialize third-party analytics integrations"""
        return {
            "google_analytics": {
                "enabled": False,
                "tracking_id": None,
                "events_sent": 0
            },
            "mixpanel": {
                "enabled": False,
                "project_token": None,
                "events_sent": 0
            },
            "amplitude": {
                "enabled": False,
                "api_key": None,
                "events_sent": 0
            },
            "datadog": {
                "enabled": False,
                "api_key": None,
                "traces_sent": 0
            },
            "newrelic": {
                "enabled": False,
                "license_key": None,
                "metrics_sent": 0
            },
            "grafana": {
                "enabled": False,
                "endpoint": None,
                "dashboards_synced": 0
            }
        }
    
    async def track_event(self, user_id: Optional[str], session_id: str,
                         event_type: AnalyticsEventType, event_name: str,
                         properties: Dict[str, Any] = None,
                         device_info: Dict = None) -> str:
        """Track analytics event"""
        event_id = str(uuid.uuid4())
        
        event = AnalyticsEvent(
            id=event_id,
            user_id=user_id,
            session_id=session_id,
            event_type=event_type,
            event_name=event_name,
            properties=properties or {},
            timestamp=datetime.utcnow(),
            device_info=device_info
        )
        
        self.events.append(event)
        
        # Update user journey if user is identified
        if user_id:
            await self._update_user_journey(user_id, session_id, event)
            
        # Send to third-party integrations
        await self._send_to_integrations(event)
        
        self.logger.debug(f"Tracked event: {event_name} for user {user_id}")
        return event_id
    
    async def _update_user_journey(self, user_id: str, session_id: str, event: AnalyticsEvent):
        """Update user journey with new event"""
        journey_key = f"{user_id}_{session_id}"
        
        if journey_key not in self.user_journeys:
            # Create new journey
            journey_stage = self._determine_journey_stage(event)
            journey = UserJourney(
                user_id=user_id,
                session_id=session_id,
                journey_id=str(uuid.uuid4()),
                stage=journey_stage,
                events=[event],
                started_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            self.user_journeys[journey_key] = journey
        else:
            # Update existing journey
            journey = self.user_journeys[journey_key]
            journey.events.append(event)
            journey.updated_at = datetime.utcnow()
            
            # Update stage if needed
            new_stage = self._determine_journey_stage(event)
            if new_stage != journey.stage:
                journey.stage = new_stage
    
    def _determine_journey_stage(self, event: AnalyticsEvent) -> UserJourneyStage:
        """Determine user journey stage from event"""
        event_name = event.event_name.lower()
        
        # Awareness stage
        if any(keyword in event_name for keyword in ["landing", "homepage", "first_visit"]):
            return UserJourneyStage.AWARENESS
        
        # Consideration stage  
        elif any(keyword in event_name for keyword in ["features", "pricing", "demo", "tour"]):
            return UserJourneyStage.CONSIDERATION
            
        # Trial stage
        elif any(keyword in event_name for keyword in ["signup", "register", "trial"]):
            return UserJourneyStage.TRIAL
            
        # Adoption stage
        elif any(keyword in event_name for keyword in ["create_project", "use_feature", "complete_setup"]):
            return UserJourneyStage.ADOPTION
            
        # Retention stage
        elif any(keyword in event_name for keyword in ["daily_active", "weekly_active", "return_user"]):
            return UserJourneyStage.RETENTION
            
        # Advocacy stage
        elif any(keyword in event_name for keyword in ["share", "invite", "review", "upgrade"]):
            return UserJourneyStage.ADVOCACY
            
        return UserJourneyStage.AWARENESS  # Default
    
    async def _send_to_integrations(self, event: AnalyticsEvent):
        """Send event to configured third-party integrations"""
        integrations = self.third_party_integrations
        
        # Google Analytics
        if integrations["google_analytics"]["enabled"]:
            await self._send_to_google_analytics(event)
            integrations["google_analytics"]["events_sent"] += 1
            
        # Mixpanel
        if integrations["mixpanel"]["enabled"]:
            await self._send_to_mixpanel(event)
            integrations["mixpanel"]["events_sent"] += 1
            
        # Amplitude
        if integrations["amplitude"]["enabled"]:
            await self._send_to_amplitude(event)
            integrations["amplitude"]["events_sent"] += 1
    
    async def _send_to_google_analytics(self, event: AnalyticsEvent):
        """Send event to Google Analytics (simulation)"""
        # In production, use Google Analytics Measurement Protocol
        await asyncio.sleep(0.01)
        self.logger.debug(f"Sent event to Google Analytics: {event.event_name}")
    
    async def _send_to_mixpanel(self, event: AnalyticsEvent):
        """Send event to Mixpanel (simulation)"""
        # In production, use Mixpanel HTTP API
        await asyncio.sleep(0.01)
        self.logger.debug(f"Sent event to Mixpanel: {event.event_name}")
    
    async def _send_to_amplitude(self, event: AnalyticsEvent):
        """Send event to Amplitude (simulation)"""
        # In production, use Amplitude HTTP API
        await asyncio.sleep(0.01)
        self.logger.debug(f"Sent event to Amplitude: {event.event_name}")
    
    async def start_performance_trace(self, operation: str, metadata: Dict = None) -> str:
        """Start performance tracing"""
        trace_id = str(uuid.uuid4())
        
        trace = PerformanceTrace(
            trace_id=trace_id,
            operation=operation,
            duration_ms=0.0,
            status="started",
            spans=[],
            metadata=metadata or {},
            timestamp=datetime.utcnow()
        )
        
        # Store start time for duration calculation
        trace.metadata["start_time"] = datetime.utcnow().timestamp()
        self.performance_traces.append(trace)
        
        return trace_id
    
    async def end_performance_trace(self, trace_id: str, status: str = "success") -> Dict:
        """End performance trace and calculate duration"""
        trace = next((t for t in self.performance_traces if t.trace_id == trace_id), None)
        
        if not trace:
            return {"status": "error", "message": "Trace not found"}
            
        end_time = datetime.utcnow().timestamp()
        start_time = trace.metadata.get("start_time", end_time)
        
        trace.duration_ms = (end_time - start_time) * 1000
        trace.status = status
        
        # Send to performance monitoring integrations
        await self._send_trace_to_integrations(trace)
        
        return {
            "trace_id": trace_id,
            "duration_ms": trace.duration_ms,
            "status": status,
            "operation": trace.operation
        }
    
    async def _send_trace_to_integrations(self, trace: PerformanceTrace):
        """Send performance trace to monitoring integrations"""
        integrations = self.third_party_integrations
        
        # Datadog APM
        if integrations["datadog"]["enabled"]:
            await self._send_to_datadog(trace)
            integrations["datadog"]["traces_sent"] += 1
            
        # New Relic
        if integrations["newrelic"]["enabled"]:
            await self._send_to_newrelic(trace)
            integrations["newrelic"]["metrics_sent"] += 1
    
    async def _send_to_datadog(self, trace: PerformanceTrace):
        """Send trace to Datadog (simulation)"""
        await asyncio.sleep(0.01)
        self.logger.debug(f"Sent trace to Datadog: {trace.operation}")
    
    async def _send_to_newrelic(self, trace: PerformanceTrace):
        """Send trace to New Relic (simulation)"""
        await asyncio.sleep(0.01)
        self.logger.debug(f"Sent trace to New Relic: {trace.operation}")
    
    async def record_metric(self, name: str, value: Union[int, float], 
                          metric_type: MetricType, tags: Dict[str, str] = None):
        """Record custom metric"""
        metric_entry = {
            "name": name,
            "value": value,
            "type": metric_type.value,
            "tags": tags or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.custom_metrics[name].append(metric_entry)
        
        # Send to monitoring integrations
        await self._send_metric_to_integrations(metric_entry)
    
    async def _send_metric_to_integrations(self, metric: Dict):
        """Send custom metric to monitoring integrations"""
        integrations = self.third_party_integrations
        
        if integrations["datadog"]["enabled"]:
            await self._send_metric_to_datadog(metric)
            
        if integrations["newrelic"]["enabled"]:
            await self._send_metric_to_newrelic(metric)
    
    async def _send_metric_to_datadog(self, metric: Dict):
        """Send metric to Datadog (simulation)"""
        await asyncio.sleep(0.01)
    
    async def _send_metric_to_newrelic(self, metric: Dict):
        """Send metric to New Relic (simulation)"""
        await asyncio.sleep(0.01)
    
    async def get_user_analytics(self, user_id: str, days: int = 30) -> Dict:
        """Get detailed analytics for specific user"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        user_events = [e for e in self.events if e.user_id == user_id and e.timestamp > cutoff_date]
        
        if not user_events:
            return {"status": "error", "message": "No events found for user"}
        
        # User journey analysis
        user_journeys = [j for j in self.user_journeys.values() if j.user_id == user_id]
        
        # Event analysis
        event_counts = defaultdict(int)
        for event in user_events:
            event_counts[event.event_name] += 1
            
        # Session analysis
        sessions = set(e.session_id for e in user_events)
        
        analytics = {
            "user_id": user_id,
            "period": {
                "days": days,
                "start_date": cutoff_date.isoformat(),
                "end_date": datetime.utcnow().isoformat()
            },
            "summary": {
                "total_events": len(user_events),
                "unique_sessions": len(sessions),
                "total_journeys": len(user_journeys),
                "most_frequent_event": max(event_counts.items(), key=lambda x: x[1])[0] if event_counts else None
            },
            "event_breakdown": dict(event_counts),
            "journey_stages": {
                stage.value: len([j for j in user_journeys if j.stage == stage])
                for stage in UserJourneyStage
            },
            "activity_timeline": await self._generate_activity_timeline(user_events),
            "conversion_funnel": await self._analyze_conversion_funnel(user_events)
        }
        
        return {"status": "success", "analytics": analytics}
    
    async def _generate_activity_timeline(self, events: List[AnalyticsEvent]) -> List[Dict]:
        """Generate user activity timeline"""
        timeline = []
        
        # Group events by day
        daily_events = defaultdict(list)
        for event in events:
            day = event.timestamp.date().isoformat()
            daily_events[day].append(event)
            
        for day, day_events in daily_events.items():
            timeline.append({
                "date": day,
                "event_count": len(day_events),
                "unique_event_types": len(set(e.event_name for e in day_events)),
                "top_events": [e.event_name for e in day_events[:3]]
            })
            
        return sorted(timeline, key=lambda x: x["date"])
    
    async def _analyze_conversion_funnel(self, events: List[AnalyticsEvent]) -> Dict:
        """Analyze conversion funnel for user"""
        funnel_steps = [
            "page_view",
            "feature_exploration", 
            "trial_signup",
            "project_creation",
            "first_success",
            "subscription"
        ]
        
        funnel_data = {}
        for step in funnel_steps:
            step_events = [e for e in events if step in e.event_name.lower()]
            funnel_data[step] = {
                "count": len(step_events),
                "completed": len(step_events) > 0
            }
            
        return funnel_data
    
    async def get_platform_analytics(self, days: int = 7) -> Dict:
        """Get platform-wide analytics"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recent_events = [e for e in self.events if e.timestamp > cutoff_date]
        
        # User metrics
        unique_users = set(e.user_id for e in recent_events if e.user_id)
        unique_sessions = set(e.session_id for e in recent_events)
        
        # Event metrics
        event_counts = defaultdict(int)
        for event in recent_events:
            event_counts[event.event_name] += 1
            
        # Performance metrics
        recent_traces = [t for t in self.performance_traces if t.timestamp > cutoff_date]
        avg_response_time = statistics.mean([t.duration_ms for t in recent_traces]) if recent_traces else 0
        
        # Journey metrics
        recent_journeys = [j for j in self.user_journeys.values() if j.updated_at > cutoff_date]
        journey_stage_counts = defaultdict(int)
        for journey in recent_journeys:
            journey_stage_counts[journey.stage.value] += 1
            
        analytics = {
            "period": {
                "days": days,
                "start_date": cutoff_date.isoformat(),
                "end_date": datetime.utcnow().isoformat()
            },
            "user_metrics": {
                "total_events": len(recent_events),
                "unique_users": len(unique_users),
                "unique_sessions": len(unique_sessions),
                "events_per_user": len(recent_events) / len(unique_users) if unique_users else 0,
                "events_per_session": len(recent_events) / len(unique_sessions) if unique_sessions else 0
            },
            "top_events": dict(sorted(event_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            "performance": {
                "total_traces": len(recent_traces),
                "avg_response_time_ms": round(avg_response_time, 2),
                "slow_requests": len([t for t in recent_traces if t.duration_ms > 1000]),
                "error_rate": len([t for t in recent_traces if t.status == "error"]) / len(recent_traces) if recent_traces else 0
            },
            "user_journey": {
                "total_journeys": len(recent_journeys),
                "stage_distribution": dict(journey_stage_counts)
            },
            "integrations_status": {
                name: {
                    "enabled": config["enabled"],
                    "events_sent": config.get("events_sent", 0),
                    "traces_sent": config.get("traces_sent", 0),
                    "metrics_sent": config.get("metrics_sent", 0)
                }
                for name, config in self.third_party_integrations.items()
            }
        }
        
        return {"status": "success", "analytics": analytics}
    
    async def create_dashboard(self, name: str, config: Dict) -> str:
        """Create analytics dashboard"""
        dashboard_id = str(uuid.uuid4())
        
        dashboard = {
            "id": dashboard_id,
            "name": name,
            "config": config,
            "created_at": datetime.utcnow().isoformat(),
            "widgets": config.get("widgets", []),
            "refresh_interval": config.get("refresh_interval", 300),  # 5 minutes
            "data_sources": config.get("data_sources", ["internal"])
        }
        
        self.dashboards[dashboard_id] = dashboard
        
        # Sync with Grafana if enabled
        if self.third_party_integrations["grafana"]["enabled"]:
            await self._sync_dashboard_to_grafana(dashboard)
            
        return dashboard_id
    
    async def _sync_dashboard_to_grafana(self, dashboard: Dict):
        """Sync dashboard to Grafana (simulation)"""
        await asyncio.sleep(0.1)
        self.third_party_integrations["grafana"]["dashboards_synced"] += 1
        self.logger.debug(f"Synced dashboard to Grafana: {dashboard['name']}")
    
    async def get_dashboard_data(self, dashboard_id: str) -> Dict:
        """Get data for analytics dashboard"""
        if dashboard_id not in self.dashboards:
            return {"status": "error", "message": "Dashboard not found"}
            
        dashboard = self.dashboards[dashboard_id]
        dashboard_data = {"widgets": []}
        
        # Generate data for each widget
        for widget in dashboard["widgets"]:
            widget_data = await self._generate_widget_data(widget)
            dashboard_data["widgets"].append({
                "widget_id": widget.get("id", str(uuid.uuid4())),
                "type": widget["type"],
                "title": widget.get("title", ""),
                "data": widget_data
            })
            
        return {
            "status": "success",
            "dashboard": {
                "id": dashboard_id,
                "name": dashboard["name"],
                "last_updated": datetime.utcnow().isoformat(),
                "data": dashboard_data
            }
        }
    
    async def _generate_widget_data(self, widget_config: Dict) -> Dict:
        """Generate data for dashboard widget"""
        widget_type = widget_config["type"]
        
        if widget_type == "event_count":
            return await self._get_event_count_data(widget_config)
        elif widget_type == "user_journey":
            return await self._get_journey_data(widget_config)
        elif widget_type == "performance":
            return await self._get_performance_data(widget_config)
        else:
            return {"error": "Unknown widget type"}
    
    async def _get_event_count_data(self, config: Dict) -> Dict:
        """Get event count data for widget"""
        days = config.get("days", 7)
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        events = [e for e in self.events if e.timestamp > cutoff_date]
        
        return {
            "total_events": len(events),
            "daily_breakdown": await self._get_daily_event_breakdown(events)
        }
    
    async def _get_daily_event_breakdown(self, events: List[AnalyticsEvent]) -> List[Dict]:
        """Get daily breakdown of events"""
        daily_counts = defaultdict(int)
        for event in events:
            day = event.timestamp.date().isoformat()
            daily_counts[day] += 1
            
        return [{"date": date, "count": count} for date, count in daily_counts.items()]
    
    async def _get_journey_data(self, config: Dict) -> Dict:
        """Get user journey data for widget"""
        journeys = list(self.user_journeys.values())
        
        stage_counts = defaultdict(int)
        for journey in journeys:
            stage_counts[journey.stage.value] += 1
            
        return {"stage_distribution": dict(stage_counts)}
    
    async def _get_performance_data(self, config: Dict) -> Dict:
        """Get performance data for widget"""
        days = config.get("days", 7)
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        traces = [t for t in self.performance_traces if t.timestamp > cutoff_date]
        
        if not traces:
            return {"avg_response_time": 0, "total_traces": 0}
            
        return {
            "avg_response_time": statistics.mean([t.duration_ms for t in traces]),
            "total_traces": len(traces),
            "error_rate": len([t for t in traces if t.status == "error"]) / len(traces)
        }
    
    async def configure_integration(self, integration_name: str, config: Dict) -> Dict:
        """Configure third-party integration"""
        if integration_name not in self.third_party_integrations:
            return {"status": "error", "message": "Integration not supported"}
            
        integration = self.third_party_integrations[integration_name]
        integration.update(config)
        integration["configured_at"] = datetime.utcnow().isoformat()
        
        return {
            "status": "success",
            "integration": integration_name,
            "configured": True
        }
    
    async def get_predictive_insights(self, metric: str, days: int = 30) -> Dict:
        """Get predictive insights using simple trend analysis"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        if metric == "user_growth":
            return await self._predict_user_growth(cutoff_date)
        elif metric == "engagement":
            return await self._predict_engagement(cutoff_date)
        elif metric == "performance":
            return await self._predict_performance(cutoff_date)
        else:
            return {"status": "error", "message": "Metric not supported for predictions"}
    
    async def _predict_user_growth(self, cutoff_date: datetime) -> Dict:
        """Predict user growth trend"""
        recent_events = [e for e in self.events if e.timestamp > cutoff_date]
        daily_users = defaultdict(set)
        
        for event in recent_events:
            if event.user_id:
                day = event.timestamp.date()
                daily_users[day].add(event.user_id)
                
        daily_counts = [len(users) for users in daily_users.values()]
        
        if len(daily_counts) >= 2:
            # Simple linear trend
            growth_rate = (daily_counts[-1] - daily_counts[0]) / len(daily_counts)
            predicted_users = daily_counts[-1] + (growth_rate * 7)  # 7 days ahead
            
            return {
                "status": "success",
                "metric": "user_growth",
                "current_trend": growth_rate,
                "prediction_7_days": max(0, predicted_users),
                "confidence": "medium"
            }
            
        return {"status": "insufficient_data"}
    
    async def _predict_engagement(self, cutoff_date: datetime) -> Dict:
        """Predict engagement trends"""
        recent_events = [e for e in self.events if e.timestamp > cutoff_date]
        daily_events = defaultdict(int)
        
        for event in recent_events:
            day = event.timestamp.date()
            daily_events[day] += 1
            
        daily_counts = list(daily_events.values())
        
        if len(daily_counts) >= 3:
            avg_engagement = statistics.mean(daily_counts)
            trend = (daily_counts[-1] - daily_counts[0]) / len(daily_counts)
            
            return {
                "status": "success",
                "metric": "engagement",
                "current_avg": avg_engagement,
                "trend": trend,
                "prediction_7_days": max(0, avg_engagement + (trend * 7)),
                "confidence": "medium"
            }
            
        return {"status": "insufficient_data"}
    
    async def _predict_performance(self, cutoff_date: datetime) -> Dict:
        """Predict performance trends"""
        recent_traces = [t for t in self.performance_traces if t.timestamp > cutoff_date]
        
        if len(recent_traces) >= 10:
            response_times = [t.duration_ms for t in recent_traces]
            avg_response_time = statistics.mean(response_times)
            
            # Simple trend analysis
            first_half = response_times[:len(response_times)//2]
            second_half = response_times[len(response_times)//2:]
            
            trend = statistics.mean(second_half) - statistics.mean(first_half)
            
            return {
                "status": "success",
                "metric": "performance",
                "current_avg_ms": avg_response_time,
                "trend_ms": trend,
                "prediction_7_days": max(0, avg_response_time + trend),
                "confidence": "medium"
            }
            
        return {"status": "insufficient_data"}