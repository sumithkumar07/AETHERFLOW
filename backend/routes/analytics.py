from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from routes.auth import get_current_user
from services.advanced_analytics import AdvancedAnalytics, EventType, SmartRecommendationEngine

router = APIRouter()
logger = logging.getLogger(__name__)

# Global analytics instances
advanced_analytics: Optional[AdvancedAnalytics] = None
recommendation_engine: Optional[SmartRecommendationEngine] = None

def set_analytics_services(analytics_instance: AdvancedAnalytics, recommendation_instance: SmartRecommendationEngine):
    global advanced_analytics, recommendation_engine
    advanced_analytics = analytics_instance
    recommendation_engine = recommendation_instance

@router.get("/dashboard")
async def get_analytics_dashboard(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get real-time analytics dashboard"""
    try:
        if not advanced_analytics:
            raise HTTPException(status_code=500, detail="Analytics service not initialized")
        
        dashboard_data = await advanced_analytics.get_real_time_dashboard()
        
        return {
            "success": True,
            "dashboard": dashboard_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/track")
async def track_event(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Track a user event"""
    try:
        if not advanced_analytics:
            raise HTTPException(status_code=500, detail="Analytics service not initialized")
        
        event_type = request.get("event_type", "")
        data = request.get("data", {})
        context = request.get("context", {})
        
        if not event_type:
            raise HTTPException(status_code=400, detail="Event type is required")
        
        # Convert string to EventType enum
        try:
            event_type_enum = EventType(event_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid event type: {event_type}")
        
        # Track the event
        await advanced_analytics.track_event(
            user_id=current_user["user_id"],
            event_type=event_type_enum,
            data=data,
            context=context
        )
        
        return {
            "success": True,
            "message": "Event tracked successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error tracking event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-journey")
async def get_user_journey(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user journey analysis"""
    try:
        if not advanced_analytics:
            raise HTTPException(status_code=500, detail="Analytics service not initialized")
        
        journey = await advanced_analytics.track_user_journey(current_user["user_id"])
        
        if not journey:
            return {
                "success": True,
                "message": "No active journey found",
                "journey": None
            }
        
        journey_data = {
            "user_id": journey.user_id,
            "session_id": journey.session_id,
            "start_time": journey.start_time.isoformat(),
            "end_time": journey.end_time.isoformat() if journey.end_time else None,
            "duration": journey.duration.total_seconds() if journey.duration else None,
            "pages_visited": journey.pages_visited,
            "actions_taken": journey.actions_taken,
            "goals_completed": journey.goals_completed,
            "event_count": len(journey.events)
        }
        
        return {
            "success": True,
            "journey": journey_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting user journey: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-profile")
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get comprehensive user profile"""
    try:
        if not advanced_analytics:
            raise HTTPException(status_code=500, detail="Analytics service not initialized")
        
        profile = await advanced_analytics.get_user_profile(current_user["user_id"])
        
        if not profile:
            return {
                "success": True,
                "message": "User profile not found",
                "profile": None
            }
        
        profile_data = {
            "user_id": profile.user_id,
            "segment": profile.segment.value,
            "first_seen": profile.first_seen.isoformat(),
            "last_seen": profile.last_seen.isoformat(),
            "total_sessions": profile.total_sessions,
            "total_time_spent": profile.total_time_spent.total_seconds(),
            "favorite_features": profile.favorite_features,
            "skill_level": profile.skill_level,
            "preferred_ai_models": profile.preferred_ai_models,
            "project_types": profile.project_types,
            "churn_probability": profile.churn_probability,
            "engagement_score": profile.engagement_score
        }
        
        return {
            "success": True,
            "profile": profile_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/churn-prediction")
async def predict_churn(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Predict user churn probability"""
    try:
        if not advanced_analytics:
            raise HTTPException(status_code=500, detail="Analytics service not initialized")
        
        churn_probability = await advanced_analytics.predict_user_churn(current_user["user_id"])
        
        # Categorize risk level
        if churn_probability < 0.3:
            risk_level = "low"
        elif churn_probability < 0.6:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return {
            "success": True,
            "churn_probability": churn_probability,
            "risk_level": risk_level,
            "recommendations": await _get_churn_prevention_recommendations(risk_level),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error predicting churn: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations")
async def get_personalized_recommendations(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get personalized recommendations for user"""
    try:
        if not recommendation_engine:
            raise HTTPException(status_code=500, detail="Recommendation engine not initialized")
        
        recommendations = await recommendation_engine.get_personalized_recommendations(current_user["user_id"])
        
        return {
            "success": True,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ab-test/{experiment_name}")
async def get_ab_test_variant(
    experiment_name: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get A/B test variant for user"""
    try:
        if not advanced_analytics:
            raise HTTPException(status_code=500, detail="Analytics service not initialized")
        
        variant = await advanced_analytics.run_ab_test(experiment_name, current_user["user_id"])
        
        return {
            "success": True,
            "experiment": experiment_name,
            "variant": variant,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting A/B test variant: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_user_metrics(
    time_range: str = Query("7d", description="Time range: 1d, 7d, 30d"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user-specific metrics"""
    try:
        if not advanced_analytics:
            raise HTTPException(status_code=500, detail="Analytics service not initialized")
        
        # Parse time range
        if time_range == "1d":
            start_date = datetime.now() - timedelta(days=1)
        elif time_range == "30d":
            start_date = datetime.now() - timedelta(days=30)
        else:
            start_date = datetime.now() - timedelta(days=7)
        
        # Get metrics (mock data for now)
        metrics = {
            "time_range": time_range,
            "start_date": start_date.isoformat(),
            "page_views": 45,
            "session_count": 8,
            "average_session_duration": 1245,  # seconds
            "feature_usage": {
                "ai_chat": 23,
                "project_creation": 5,
                "template_usage": 3,
                "integrations": 2
            },
            "ai_interactions": {
                "total_messages": 67,
                "models_used": ["gpt-4o-mini", "claude-3-sonnet"],
                "average_response_time": 2.3
            },
            "productivity_score": 8.5,
            "engagement_level": "high"
        }
        
        return {
            "success": True,
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting user metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feature-usage")
async def get_feature_usage_analytics(
    time_range: str = Query("7d", description="Time range: 1d, 7d, 30d"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get feature usage analytics"""
    try:
        # Mock feature usage data
        feature_usage = {
            "time_range": time_range,
            "features": [
                {
                    "name": "AI Chat",
                    "usage_count": 156,
                    "time_spent": 3420,  # seconds
                    "user_satisfaction": 4.8,
                    "trend": "increasing"
                },
                {
                    "name": "Project Creation",
                    "usage_count": 23,
                    "time_spent": 890,
                    "user_satisfaction": 4.6,
                    "trend": "stable"
                },
                {
                    "name": "Templates",
                    "usage_count": 12,
                    "time_spent": 445,
                    "user_satisfaction": 4.9,
                    "trend": "increasing"
                },
                {
                    "name": "Integrations",
                    "usage_count": 8,
                    "time_spent": 234,
                    "user_satisfaction": 4.3,
                    "trend": "stable"
                }
            ],
            "top_features": ["AI Chat", "Project Creation", "Templates"],
            "underutilized_features": ["Integrations", "Advanced Settings"],
            "recommendations": [
                "Try using integrations to enhance your workflow",
                "Explore advanced settings for better customization"
            ]
        }
        
        return {
            "success": True,
            "feature_usage": feature_usage,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting feature usage analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _get_churn_prevention_recommendations(risk_level: str) -> List[str]:
    """Get churn prevention recommendations based on risk level"""
    recommendations = {
        "low": [
            "Keep up the great work!",
            "Consider exploring advanced features",
            "Share your experience with others"
        ],
        "medium": [
            "Try using our AI templates to speed up development",
            "Join our community for tips and support",
            "Set up integrations to enhance your workflow"
        ],
        "high": [
            "Let us help you get the most out of AI Tempo",
            "Schedule a personalized demo",
            "Contact our support team for assistance",
            "Check out our quick start guide"
        ]
    }
    
    return recommendations.get(risk_level, [])