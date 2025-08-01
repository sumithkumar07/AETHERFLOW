import logging
import asyncio
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import statistics
import numpy as np
from collections import defaultdict, deque
import uuid

logger = logging.getLogger(__name__)

class EventType(Enum):
    PAGE_VIEW = "page_view"
    USER_ACTION = "user_action"
    AI_INTERACTION = "ai_interaction"
    PROJECT_CREATED = "project_created"
    FEATURE_USED = "feature_used"
    SESSION_START = "session_start"
    SESSION_END = "session_end"
    ERROR_OCCURRED = "error_occurred"

class UserSegment(Enum):
    NEW_USER = "new_user"
    ACTIVE_USER = "active_user"
    POWER_USER = "power_user"
    AT_RISK = "at_risk"
    CHURNED = "churned"

@dataclass
class AnalyticsEvent:
    event_id: str
    user_id: str
    session_id: str
    event_type: EventType
    timestamp: datetime
    data: Dict[str, Any]
    context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class UserJourney:
    user_id: str
    session_id: str
    events: List[AnalyticsEvent]
    start_time: datetime
    end_time: Optional[datetime]
    duration: Optional[timedelta] = None
    pages_visited: List[str] = field(default_factory=list)
    actions_taken: List[str] = field(default_factory=list)
    goals_completed: List[str] = field(default_factory=list)

@dataclass
class UserProfile:
    user_id: str
    segment: UserSegment
    first_seen: datetime
    last_seen: datetime
    total_sessions: int
    total_time_spent: timedelta
    favorite_features: List[str]
    skill_level: str
    preferred_ai_models: List[str]
    project_types: List[str]
    churn_probability: float
    engagement_score: float

class AdvancedAnalytics:
    """Real-time usage analytics and business intelligence system"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.event_queue = deque(maxlen=10000)
        self.user_sessions = {}
        self.real_time_metrics = {}
        self.predictive_models = PredictiveModels()
        self.experiment_manager = ABTestManager()
        self.recommendation_engine = None  # Will be set externally
        self.initialized = False
    
    async def initialize(self):
        """Initialize analytics system"""
        try:
            db = await self.db_client.get_database()
            self.events_collection = db.analytics_events
            self.user_profiles_collection = db.user_profiles
            self.experiments_collection = db.ab_experiments
            
            # Create indexes for performance
            await self._create_indexes()
            
            # Initialize predictive models
            await self.predictive_models.initialize()
            
            # Start background processing
            asyncio.create_task(self._process_events_batch())
            asyncio.create_task(self._update_real_time_metrics())
            
            self.initialized = True
            logger.info("Advanced analytics system initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize advanced analytics: {e}")
            raise
    
    async def track_event(self, user_id: str, event_type: EventType, data: Dict[str, Any], context: Dict[str, Any] = None):
        """Track a user event"""
        try:
            session_id = self._get_or_create_session(user_id)
            
            event = AnalyticsEvent(
                event_id=str(uuid.uuid4()),
                user_id=user_id,
                session_id=session_id,
                event_type=event_type,
                timestamp=datetime.now(),
                data=data,
                context=context or {}
            )
            
            # Add to queue for batch processing
            self.event_queue.append(event)
            
            # Update real-time metrics
            await self._update_real_time_metrics_for_event(event)
            
            # Update user session
            await self._update_user_session(event)
            
        except Exception as e:
            logger.error(f"Error tracking event: {e}")
    
    async def track_user_journey(self, user_id: str) -> UserJourney:
        """Track and analyze user journey"""
        try:
            # Get current session
            session_id = self._get_current_session(user_id)
            if not session_id:
                return None
            
            # Get session events
            events = await self._get_session_events(user_id, session_id)
            
            if not events:
                return None
            
            # Build journey
            journey = UserJourney(
                user_id=user_id,
                session_id=session_id,
                events=events,
                start_time=events[0].timestamp,
                end_time=events[-1].timestamp if len(events) > 1 else None
            )
            
            # Calculate duration
            if journey.end_time:
                journey.duration = journey.end_time - journey.start_time
            
            # Extract pages and actions
            for event in events:
                if event.event_type == EventType.PAGE_VIEW:
                    page = event.data.get('page')
                    if page and page not in journey.pages_visited:
                        journey.pages_visited.append(page)
                
                elif event.event_type == EventType.USER_ACTION:
                    action = event.data.get('action')
                    if action:
                        journey.actions_taken.append(action)
            
            return journey
            
        except Exception as e:
            logger.error(f"Error tracking user journey for {user_id}: {e}")
            return None
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get comprehensive user profile"""
        try:
            # Try to get from cache first
            cached_profile = await self._get_cached_profile(user_id)
            if cached_profile:
                return cached_profile
            
            # Build profile from historical data
            profile = await self._build_user_profile(user_id)
            
            # Cache the profile
            if profile:
                await self._cache_user_profile(profile)
            
            return profile
            
        except Exception as e:
            logger.error(f"Error getting user profile for {user_id}: {e}")
            return None
    
    async def predict_user_churn(self, user_id: str) -> float:
        """Predict probability of user churn"""
        try:
            profile = await self.get_user_profile(user_id)
            if not profile:
                return 0.5  # Neutral probability
            
            features = await self._extract_user_features(profile)
            churn_probability = await self.predictive_models.predict_churn(features)
            
            return churn_probability
            
        except Exception as e:
            logger.error(f"Error predicting churn for {user_id}: {e}")
            return 0.5
    
    async def get_real_time_dashboard(self) -> Dict[str, Any]:
        """Get real-time analytics dashboard data"""
        try:
            current_time = datetime.now()
            
            # Active users (last 5 minutes)
            active_users = await self._count_active_users(minutes=5)
            
            # Page views (last hour)
            hourly_pageviews = await self._get_hourly_pageviews()
            
            # Feature usage (last 24 hours)
            feature_usage = await self._get_feature_usage(hours=24)
            
            # AI interactions (last hour)
            ai_interactions = await self._get_ai_interactions(hours=1)
            
            # Error rate (last hour)
            error_rate = await self._calculate_error_rate(hours=1)
            
            # Conversion metrics
            conversion_metrics = await self._get_conversion_metrics()
            
            return {
                "timestamp": current_time.isoformat(),
                "active_users": active_users,
                "pageviews": {
                    "last_hour": hourly_pageviews,
                    "trend": await self._calculate_pageview_trend()
                },
                "feature_usage": feature_usage,
                "ai_interactions": {
                    "count": ai_interactions,
                    "models": await self._get_model_usage_stats()
                },
                "error_rate": error_rate,
                "conversion": conversion_metrics,
                "user_segments": await self._get_user_segment_distribution()
            }
            
        except Exception as e:
            logger.error(f"Error getting real-time dashboard: {e}")
            return {}
    
    async def run_ab_test(self, experiment_name: str, user_id: str) -> str:
        """Get A/B test variant for user"""
        return await self.experiment_manager.get_variant(experiment_name, user_id)
    
    async def _get_or_create_session(self, user_id: str) -> str:
        """Get or create user session"""
        current_time = datetime.now()
        
        if user_id in self.user_sessions:
            session = self.user_sessions[user_id]
            # Check if session is still active (last activity within 30 minutes)
            if current_time - session["last_activity"] < timedelta(minutes=30):
                session["last_activity"] = current_time
                return session["session_id"]
        
        # Create new session
        session_id = str(uuid.uuid4())
        self.user_sessions[user_id] = {
            "session_id": session_id,
            "start_time": current_time,
            "last_activity": current_time
        }
        
        # Track session start
        await self.track_event(user_id, EventType.SESSION_START, {"session_id": session_id})
        
        return session_id
    
    async def _build_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Build user profile from historical data"""
        try:
            # Get user events from database
            events_cursor = self.events_collection.find({"user_id": user_id}).sort("timestamp", 1)
            events = await events_cursor.to_list(length=None)
            
            if not events:
                return None
            
            # Calculate basic metrics
            first_seen = events[0]["timestamp"]
            last_seen = events[-1]["timestamp"]
            
            # Count sessions
            unique_sessions = set(event["session_id"] for event in events)
            total_sessions = len(unique_sessions)
            
            # Calculate time spent (rough estimation)
            session_durations = []
            for session_id in unique_sessions:
                session_events = [e for e in events if e["session_id"] == session_id]
                if len(session_events) > 1:
                    duration = session_events[-1]["timestamp"] - session_events[0]["timestamp"]
                    session_durations.append(duration)
            
            total_time_spent = sum(session_durations, timedelta())
            
            # Find favorite features
            feature_usage = defaultdict(int)
            for event in events:
                if event["event_type"] == "feature_used":
                    feature = event["data"].get("feature")
                    if feature:
                        feature_usage[feature] += 1
            
            favorite_features = sorted(feature_usage.keys(), key=feature_usage.get, reverse=True)[:5]
            
            # Determine segment
            segment = await self._determine_user_segment(user_id, events, total_sessions, total_time_spent)
            
            # Calculate engagement score
            engagement_score = await self._calculate_engagement_score(events, total_sessions, total_time_spent)
            
            # Predict churn
            churn_probability = await self.predict_user_churn(user_id)
            
            return UserProfile(
                user_id=user_id,
                segment=segment,
                first_seen=first_seen,
                last_seen=last_seen,
                total_sessions=total_sessions,
                total_time_spent=total_time_spent,
                favorite_features=favorite_features,
                skill_level=await self._determine_skill_level(events),
                preferred_ai_models=await self._get_preferred_ai_models(events),
                project_types=await self._get_project_types(events),
                churn_probability=churn_probability,
                engagement_score=engagement_score
            )
            
        except Exception as e:
            logger.error(f"Error building user profile for {user_id}: {e}")
            return None
    
    async def _determine_user_segment(self, user_id: str, events: List[Dict], sessions: int, time_spent: timedelta) -> UserSegment:
        """Determine user segment based on behavior"""
        days_since_first = (datetime.now() - events[0]["timestamp"]).days
        days_since_last = (datetime.now() - events[-1]["timestamp"]).days
        
        # New user (less than 7 days old)
        if days_since_first < 7:
            return UserSegment.NEW_USER
        
        # Churned user (no activity in 30+ days)
        if days_since_last > 30:
            return UserSegment.CHURNED
        
        # At risk (low recent activity)
        if days_since_last > 7 and sessions < 5:
            return UserSegment.AT_RISK
        
        # Power user (high activity)
        if sessions > 20 and time_spent.total_seconds() > 3600 * 10:  # 10+ hours
            return UserSegment.POWER_USER
        
        # Default to active user
        return UserSegment.ACTIVE_USER
    
    async def _process_events_batch(self):
        """Process events in batches"""
        while True:
            try:
                await asyncio.sleep(10)  # Process every 10 seconds
                
                if not self.event_queue:
                    continue
                
                # Get batch of events
                batch_size = min(100, len(self.event_queue))
                batch = []
                for _ in range(batch_size):
                    if self.event_queue:
                        batch.append(self.event_queue.popleft())
                
                if batch:
                    # Convert to database format
                    db_events = []
                    for event in batch:
                        db_events.append({
                            "event_id": event.event_id,
                            "user_id": event.user_id,
                            "session_id": event.session_id,
                            "event_type": event.event_type.value,
                            "timestamp": event.timestamp,
                            "data": event.data,
                            "context": event.context
                        })
                    
                    # Insert batch
                    if db_events:
                        await self.events_collection.insert_many(db_events)
                        logger.debug(f"Processed {len(db_events)} analytics events")
                
            except Exception as e:
                logger.error(f"Error processing events batch: {e}")
    
    async def _create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Events collection indexes
            await self.events_collection.create_index([("user_id", 1), ("timestamp", -1)])
            await self.events_collection.create_index([("session_id", 1)])
            await self.events_collection.create_index([("event_type", 1), ("timestamp", -1)])
            
            # User profiles collection indexes
            await self.user_profiles_collection.create_index([("user_id", 1)])
            await self.user_profiles_collection.create_index([("segment", 1)])
            
            logger.info("Analytics database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
    
    async def _update_real_time_metrics(self):
        """Update real-time metrics continuously"""
        while True:
            try:
                await asyncio.sleep(60)  # Update every minute
                
                # Update active user count
                current_time = datetime.now()
                five_minutes_ago = current_time - timedelta(minutes=5)
                
                # Count recent events as proxy for active users
                recent_count = await self.events_collection.count_documents({
                    "timestamp": {"$gte": five_minutes_ago}
                })
                
                self.real_time_metrics["active_users"] = recent_count
                
            except Exception as e:
                logger.error(f"Error updating real-time metrics: {e}")
    async def _count_active_users(self, minutes: int) -> int:
        """Count active users in the last N minutes"""
        try:
            cutoff_time = datetime.now() - timedelta(minutes=minutes)
            count = await self.events_collection.distinct("user_id", {
                "timestamp": {"$gte": cutoff_time}
            })
            return len(count)
        except Exception as e:
            logger.error(f"Error counting active users: {e}")
            return 0
    
    async def _get_hourly_pageviews(self) -> int:
        """Get page views in the last hour"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=1)
            count = await self.events_collection.count_documents({
                "event_type": EventType.PAGE_VIEW.value,
                "timestamp": {"$gte": cutoff_time}
            })
            return count
        except Exception as e:
            logger.error(f"Error getting hourly pageviews: {e}")
            return 0
    
    async def _get_feature_usage(self, hours: int) -> Dict[str, int]:
        """Get feature usage in the last N hours"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            pipeline = [
                {"$match": {
                    "event_type": EventType.FEATURE_USED.value,
                    "timestamp": {"$gte": cutoff_time}
                }},
                {"$group": {
                    "_id": "$data.feature",
                    "count": {"$sum": 1}
                }}
            ]
            
            cursor = self.events_collection.aggregate(pipeline)
            result = {}
            async for doc in cursor:
                if doc["_id"]:
                    result[doc["_id"]] = doc["count"]
            
            return result
        except Exception as e:
            logger.error(f"Error getting feature usage: {e}")
            return {}
    
    async def _get_ai_interactions(self, hours: int) -> int:
        """Get AI interactions in the last N hours"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            count = await self.events_collection.count_documents({
                "event_type": EventType.AI_INTERACTION.value,
                "timestamp": {"$gte": cutoff_time}
            })
            return count
        except Exception as e:
            logger.error(f"Error getting AI interactions: {e}")
            return 0
    
    async def _calculate_error_rate(self, hours: int) -> float:
        """Calculate error rate in the last N hours"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            total_events = await self.events_collection.count_documents({
                "timestamp": {"$gte": cutoff_time}
            })
            
            error_events = await self.events_collection.count_documents({
                "event_type": EventType.ERROR_OCCURRED.value,
                "timestamp": {"$gte": cutoff_time}
            })
            
            if total_events == 0:
                return 0.0
            
            return (error_events / total_events) * 100
            
        except Exception as e:
            logger.error(f"Error calculating error rate: {e}")
            return 0.0
    
    async def _get_conversion_metrics(self) -> Dict[str, Any]:
        """Get conversion metrics"""
        try:
            # Simple conversion metrics
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            signups = await self.events_collection.count_documents({
                "event_type": EventType.USER_ACTION.value,
                "data.action": "signup",
                "timestamp": {"$gte": today}
            })
            
            project_creations = await self.events_collection.count_documents({
                "event_type": EventType.PROJECT_CREATED.value,
                "timestamp": {"$gte": today}
            })
            
            return {
                "daily_signups": signups,
                "daily_projects": project_creations,
                "conversion_rate": (project_creations / max(signups, 1)) * 100
            }
            
        except Exception as e:
            logger.error(f"Error getting conversion metrics: {e}")
            return {"daily_signups": 0, "daily_projects": 0, "conversion_rate": 0.0}
    
    async def _calculate_pageview_trend(self) -> str:
        """Calculate pageview trend"""
        try:
            # Simple trend calculation
            current_hour = await self._get_hourly_pageviews()
            previous_hour_start = datetime.now() - timedelta(hours=2)
            previous_hour_end = datetime.now() - timedelta(hours=1)
            
            previous_count = await self.events_collection.count_documents({
                "event_type": EventType.PAGE_VIEW.value,
                "timestamp": {"$gte": previous_hour_start, "$lt": previous_hour_end}
            })
            
            if previous_count == 0:
                return "stable"
            
            change = ((current_hour - previous_count) / previous_count) * 100
            
            if change > 10:
                return "increasing"
            elif change < -10:
                return "decreasing"
            else:
                return "stable"
                
        except Exception as e:
            logger.error(f"Error calculating pageview trend: {e}")
            return "stable"
    
    async def _get_model_usage_stats(self) -> Dict[str, int]:
        """Get AI model usage statistics"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=1)
            pipeline = [
                {"$match": {
                    "event_type": EventType.AI_INTERACTION.value,
                    "timestamp": {"$gte": cutoff_time}
                }},
                {"$group": {
                    "_id": "$data.model",
                    "count": {"$sum": 1}
                }}
            ]
            
            cursor = self.events_collection.aggregate(pipeline)
            result = {}
            async for doc in cursor:
                if doc["_id"]:
                    result[doc["_id"]] = doc["count"]
            
            return result
        except Exception as e:
            logger.error(f"Error getting model usage stats: {e}")
            return {}
    
    async def _get_user_segment_distribution(self) -> Dict[str, int]:
        """Get user segment distribution"""
        try:
            pipeline = [
                {"$group": {
                    "_id": "$segment",
                    "count": {"$sum": 1}
                }}
            ]
            
            cursor = self.user_profiles_collection.aggregate(pipeline)
            result = {}
            async for doc in cursor:
                if doc["_id"]:
                    result[doc["_id"]] = doc["count"]
            
            return result
        except Exception as e:
            logger.error(f"Error getting user segment distribution: {e}")
            return {}
    
    async def _update_real_time_metrics_for_event(self, event: AnalyticsEvent):
        """Update real-time metrics for a specific event"""
        try:
            # Update counters based on event type
            if event.event_type == EventType.PAGE_VIEW:
                self.real_time_metrics["pageviews"] = self.real_time_metrics.get("pageviews", 0) + 1
            elif event.event_type == EventType.AI_INTERACTION:
                self.real_time_metrics["ai_interactions"] = self.real_time_metrics.get("ai_interactions", 0) + 1
                
        except Exception as e:
            logger.error(f"Error updating real-time metrics for event: {e}")
    
    async def _update_user_session(self, event: AnalyticsEvent):
        """Update user session with new event"""
        try:
            if event.user_id in self.user_sessions:
                self.user_sessions[event.user_id]["last_activity"] = event.timestamp
                
        except Exception as e:
            logger.error(f"Error updating user session: {e}")
    
    def _get_current_session(self, user_id: str) -> Optional[str]:
        """Get current session ID for user"""
        if user_id in self.user_sessions:
            return self.user_sessions[user_id]["session_id"]
        return None
    
    async def _get_session_events(self, user_id: str, session_id: str) -> List[AnalyticsEvent]:
        """Get events for a specific session"""
        try:
            cursor = self.events_collection.find({
                "user_id": user_id,
                "session_id": session_id
            }).sort("timestamp", 1)
            
            events = []
            async for doc in cursor:
                event = AnalyticsEvent(
                    event_id=doc["event_id"],
                    user_id=doc["user_id"],
                    session_id=doc["session_id"],
                    event_type=EventType(doc["event_type"]),
                    timestamp=doc["timestamp"],
                    data=doc["data"],
                    context=doc.get("context", {})
                )
                events.append(event)
            
            return events
            
        except Exception as e:
            logger.error(f"Error getting session events: {e}")
            return []
    
    async def _get_cached_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get cached user profile"""
        # Simple in-memory cache for now
        return None
    
    async def _cache_user_profile(self, profile: UserProfile):
        """Cache user profile"""
        # Simple in-memory cache for now
        pass
    
    async def _extract_user_features(self, profile: UserProfile) -> Dict[str, Any]:
        """Extract features for ML models"""
        days_since_last = (datetime.now() - profile.last_seen).days
        
        return {
            "days_since_last_activity": days_since_last,
            "session_count": profile.total_sessions,
            "avg_session_length": profile.total_time_spent.total_seconds() / max(profile.total_sessions, 1),
            "engagement_score": profile.engagement_score,
            "skill_level": profile.skill_level,
            "favorite_features_count": len(profile.favorite_features)
        }
    
    async def _determine_skill_level(self, events: List[Dict]) -> str:
        """Determine user skill level from events"""
        # Simple heuristic based on complexity of actions
        advanced_actions = sum(1 for event in events 
                             if event.get("data", {}).get("action") in ["deploy", "integrate", "optimize"])
        
        if advanced_actions > 10:
            return "advanced"
        elif advanced_actions > 3:
            return "intermediate"
        else:
            return "beginner"
    
    async def _get_preferred_ai_models(self, events: List[Dict]) -> List[str]:
        """Get user's preferred AI models"""
        model_usage = defaultdict(int)
        for event in events:
            if event.get("event_type") == "ai_interaction":
                model = event.get("data", {}).get("model")
                if model:
                    model_usage[model] += 1
        
        return sorted(model_usage.keys(), key=model_usage.get, reverse=True)[:3]
    
    async def _get_project_types(self, events: List[Dict]) -> List[str]:
        """Get user's project types"""
        project_types = set()
        for event in events:
            if event.get("event_type") == "project_created":
                project_type = event.get("data", {}).get("type")
                if project_type:
                    project_types.add(project_type)
        
        return list(project_types)
    
    async def _calculate_engagement_score(self, events: List[Dict], sessions: int, time_spent: timedelta) -> float:
        """Calculate user engagement score"""
        try:
            # Simple engagement calculation
            base_score = min(sessions * 0.5, 10)  # Max 10 from sessions
            time_score = min(time_spent.total_seconds() / 3600, 5)  # Max 5 from hours
            action_score = min(len(events) * 0.1, 5)  # Max 5 from actions
            
            return base_score + time_score + action_score
            
        except Exception as e:
            logger.error(f"Error calculating engagement score: {e}")
            return 5.0
    
    async def _get_usage_data(self, days: int) -> List[Dict]:
        """Get usage data for the last N days"""
        try:
            cutoff_time = datetime.now() - timedelta(days=days)
            cursor = self.events_collection.find({
                "timestamp": {"$gte": cutoff_time}
            }).sort("timestamp", 1)
            
            return await cursor.to_list(length=None)
            
        except Exception as e:
            logger.error(f"Error getting usage data: {e}")
            return []
    
    def _analyze_hourly_patterns(self, usage_data: List[Dict]) -> Dict[str, float]:
        """Analyze hourly usage patterns"""
        hourly_counts = defaultdict(int)
        
        for event in usage_data:
            hour = event["timestamp"].hour
            hourly_counts[str(hour)] += 1
        
        # Normalize to percentage
        total = sum(hourly_counts.values())
        if total > 0:
            return {hour: (count / total) * 100 for hour, count in hourly_counts.items()}
        
        return {}
    
    def _analyze_daily_patterns(self, usage_data: List[Dict]) -> Dict[str, float]:
        """Analyze daily usage patterns"""
        daily_counts = defaultdict(int)
        
        for event in usage_data:
            day = str(event["timestamp"].weekday())  # 0=Monday, 6=Sunday
            daily_counts[day] += 1
        
        # Calculate relative multipliers
        avg_daily = sum(daily_counts.values()) / 7 if daily_counts else 1
        return {day: count / avg_daily for day, count in daily_counts.items()}
    
    def _analyze_weekly_patterns(self, usage_data: List[Dict]) -> Dict[str, Any]:
        """Analyze weekly usage patterns"""
        # Simple weekly analysis
        weekly_totals = []
        current_week_start = datetime.now() - timedelta(days=datetime.now().weekday())
        
        for i in range(4):  # Last 4 weeks
            week_start = current_week_start - timedelta(weeks=i)
            week_end = week_start + timedelta(days=7)
            
            week_count = sum(1 for event in usage_data 
                           if week_start <= event["timestamp"] < week_end)
            weekly_totals.append(week_count)
        
        return {"weekly_totals": weekly_totals}
    
    def _analyze_seasonal_patterns(self, usage_data: List[Dict]) -> Dict[str, Any]:
        """Analyze seasonal patterns"""
        # Simple monthly analysis
        monthly_counts = defaultdict(int)
        
        for event in usage_data:
            month = str(event["timestamp"].month)
            monthly_counts[month] += 1
        
        return dict(monthly_counts)
    
    def _analyze_trends(self, usage_data: List[Dict]) -> Dict[str, Any]:
        """Analyze usage trends"""
        if len(usage_data) < 2:
            return {"growth_rate": 0.0}
        
        # Simple trend calculation
        first_half = usage_data[:len(usage_data)//2]
        second_half = usage_data[len(usage_data)//2:]
        
        first_half_count = len(first_half)
        second_half_count = len(second_half)
        
        if first_half_count == 0:
            growth_rate = 0.0
        else:
            growth_rate = (second_half_count - first_half_count) / first_half_count
        
        return {"growth_rate": growth_rate}

class PredictiveModels:
    """Predictive analytics models"""
    
    def __init__(self):
        self.churn_model = None
        self.engagement_model = None
        self.recommendation_model = None
    
    async def initialize(self):
        """Initialize predictive models"""
        # In production, load pre-trained models
        logger.info("Predictive models initialized")
    
    async def predict_churn(self, features: Dict[str, Any]) -> float:
        """Predict user churn probability"""
        try:
            # Simple heuristic model (replace with ML model in production)
            days_since_last = features.get("days_since_last_activity", 0)
            session_count = features.get("session_count", 0)
            avg_session_length = features.get("avg_session_length", 0)
            
            # Higher churn probability with less activity
            churn_score = 0.0
            
            if days_since_last > 14:
                churn_score += 0.4
            elif days_since_last > 7:
                churn_score += 0.2
            
            if session_count < 3:
                churn_score += 0.3
            
            if avg_session_length < 300:  # 5 minutes
                churn_score += 0.2
            
            return min(churn_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error predicting churn: {e}")
            return 0.5

class ABTestManager:
    """A/B testing framework"""
    
    def __init__(self):
        self.experiments = {}
    
    async def get_variant(self, experiment_name: str, user_id: str) -> str:
        """Get A/B test variant for user"""
        try:
            if experiment_name not in self.experiments:
                # Load experiment configuration
                await self._load_experiment(experiment_name)
            
            experiment = self.experiments.get(experiment_name)
            if not experiment:
                return "control"
            
            # Simple hash-based assignment
            import hashlib
            hash_input = f"{experiment_name}_{user_id}"
            hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
            
            # Determine variant based on hash
            variant_threshold = hash_value % 100
            
            if variant_threshold < experiment.get("variant_a_percentage", 50):
                return "variant_a"
            else:
                return "control"
            
        except Exception as e:
            logger.error(f"Error getting A/B test variant: {e}")
            return "control"
    
    async def _load_experiment(self, experiment_name: str):
        """Load experiment configuration"""
        # Default experiments
        default_experiments = {
            "new_user_onboarding": {
                "variant_a_percentage": 50,
                "description": "New onboarding flow"
            },
            "ai_model_selection": {
                "variant_a_percentage": 30,
                "description": "Different default AI model"
            }
        }
        
        self.experiments[experiment_name] = default_experiments.get(experiment_name, {})

class SmartRecommendationEngine:
    """Personalized recommendation system"""
    
    def __init__(self, analytics_system: AdvancedAnalytics):
        self.analytics = analytics_system
        self.user_preferences = {}
        self.item_similarity = {}
        self.collaborative_filters = {}
    
    async def get_personalized_recommendations(self, user_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """Get personalized recommendations for user"""
        try:
            user_profile = await self.analytics.get_user_profile(user_id)
            if not user_profile:
                return await self._get_default_recommendations()
            
            recommendations = {
                "templates": await self._recommend_templates(user_profile),
                "integrations": await self._recommend_integrations(user_profile),
                "ai_prompts": await self._suggest_better_prompts(user_profile),
                "optimizations": await self._identify_bottlenecks(user_profile),
                "learning_resources": await self._recommend_learning_resources(user_profile)
            }
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting recommendations for {user_id}: {e}")
            return await self._get_default_recommendations()
    
    async def _recommend_templates(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Recommend templates based on user profile"""
        recommendations = []
        
        # Based on skill level
        if user_profile.skill_level == "beginner":
            recommendations.extend([
                {"name": "Simple React App", "reason": "Great for beginners"},
                {"name": "Basic API", "reason": "Learn backend development"}
            ])
        elif user_profile.skill_level == "advanced":
            recommendations.extend([
                {"name": "Microservices Architecture", "reason": "Perfect for advanced users"},
                {"name": "Full-Stack E-commerce", "reason": "Complex project for your skill level"}
            ])
        
        # Based on project types
        if "react" in user_profile.project_types:
            recommendations.append({
                "name": "React + TypeScript Starter",
                "reason": "You frequently work with React"
            })
        
        return recommendations[:5]  # Limit to top 5
    
    async def _recommend_integrations(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Recommend integrations based on user behavior"""
        recommendations = []
        
        # Based on project types
        if "e-commerce" in user_profile.project_types:
            recommendations.extend([
                {"name": "Stripe", "reason": "Essential for e-commerce projects"},
                {"name": "PayPal", "reason": "Additional payment option"}
            ])
        
        if "authentication" in user_profile.favorite_features:
            recommendations.append({
                "name": "Auth0",
                "reason": "You frequently work with authentication"
            })
        
        # Based on segment
        if user_profile.segment == UserSegment.POWER_USER:
            recommendations.extend([
                {"name": "GitHub Actions", "reason": "Advanced CI/CD for power users"},
                {"name": "Sentry", "reason": "Error monitoring for production apps"}
            ])
        
        return recommendations[:5]
    
    async def _suggest_better_prompts(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Suggest better AI prompts based on usage patterns"""
        suggestions = []
        
        # Based on preferred AI models
        if "gpt-4" in user_profile.preferred_ai_models:
            suggestions.append({
                "prompt": "Be more specific about code architecture",
                "reason": "GPT-4 works better with detailed requirements"
            })
        
        if "claude-3-sonnet" in user_profile.preferred_ai_models:
            suggestions.append({
                "prompt": "Ask for code explanations and documentation",
                "reason": "Claude excels at explaining complex code"
            })
        
        return suggestions[:3]
    
    async def _identify_bottlenecks(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Identify user workflow bottlenecks"""
        bottlenecks = []
        
        # Low engagement score indicates potential issues
        if user_profile.engagement_score < 5.0:
            bottlenecks.append({
                "issue": "Low engagement with platform",
                "suggestion": "Try using templates to get started faster",
                "impact": "high"
            })
        
        # High churn probability
        if user_profile.churn_probability > 0.7:
            bottlenecks.append({
                "issue": "At risk of churning",
                "suggestion": "Explore our onboarding resources",
                "impact": "critical"
            })
        
        return bottlenecks
    
    async def _recommend_learning_resources(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Recommend learning resources"""
        resources = []
        
        if user_profile.skill_level == "beginner":
            resources.extend([
                {"title": "React Basics Tutorial", "type": "tutorial", "duration": "2 hours"},
                {"title": "API Development Guide", "type": "guide", "duration": "1 hour"}
            ])
        
        return resources[:3]
    
    async def _get_default_recommendations(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get default recommendations for new users"""
        return {
            "templates": [
                {"name": "React Starter", "reason": "Popular choice for beginners"},
                {"name": "Simple API", "reason": "Learn backend development"}
            ],
            "integrations": [
                {"name": "MongoDB", "reason": "Popular database choice"},
                {"name": "Stripe", "reason": "Handle payments easily"}
            ],
            "ai_prompts": [
                {"prompt": "Be specific about your requirements", "reason": "Get better results"}
            ],
            "optimizations": [],
            "learning_resources": [
                {"title": "Getting Started Guide", "type": "guide", "duration": "30 min"}
            ]
        }