"""
Neuro-Sync API Routes - Brain-Computer Interface Endpoints

This module provides REST API endpoints for BCI features:
- EEG device connection and data processing
- Webcam-based stress detection
- Emotional compiler integration
- Haptic feedback control
- Neural pattern recognition
- Biometric monitoring
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid

# Import neuro sync service
from services.neuro_sync_service import get_neuro_sync_service

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create router
router = APIRouter(prefix="/api/v1/neuro", tags=["Neuro-Sync BCI"])

# === REQUEST MODELS ===

class BCISessionRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    device_type: str = Field(default='muse', pattern="^(muse|neuralink|emotiv|webcam_stress)$")

class EEGDataRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    eeg_data: List[float] = Field(..., min_items=10, max_items=10000)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)

class WebcamStressRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    facial_data: Dict[str, float] = Field(default_factory=dict)

class HapticFeedbackRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    feedback_type: str = Field(..., pattern="^(success|error|flow_state|breakthrough|focus_reminder)$")
    intensity: float = Field(default=0.5, ge=0.0, le=1.0)

# === BCI SESSION ENDPOINTS ===

@router.post("/session/start")
@limiter.limit("10/minute")
async def start_bci_session(
    request: Request,
    session_request: BCISessionRequest
):
    """
    Start a new Brain-Computer Interface session
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        result = await neuro_service.start_bci_session(
            user_id=session_request.user_id,
            device_type=session_request.device_type
        )

        if result.get('success'):
            return {
                "status": "session_started",
                "session_id": result['session_id'],
                "device_info": result['device_info'],
                "calibration_required": result['calibration_required'],
                "message": result['message']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'BCI session start failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BCI session error: {str(e)}")

@router.get("/session/{session_id}/status")
@limiter.limit("30/minute")
async def get_session_status(request: Request, session_id: str):
    """
    Get current BCI session status and metrics
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        if session_id not in neuro_service.active_sessions:
            raise HTTPException(status_code=404, detail="BCI session not found")

        session = neuro_service.active_sessions[session_id]
        
        return {
            "session_id": session_id,
            "status": session.get('status', 'unknown'),
            "device_type": session.get('device_type'),
            "uptime": (datetime.utcnow() - session['started_at']).total_seconds(),
            "patterns_detected": len(session.get('patterns_detected', [])),
            "optimizations_generated": session.get('optimization_count', 0),
            "last_update": session.get('last_update'),
            "calibration_complete": session.get('calibration_complete', False)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session status error: {str(e)}")

# === EEG DATA PROCESSING ENDPOINTS ===

@router.post("/eeg/process")
@limiter.limit("100/minute")
async def process_eeg_data(
    request: Request,
    eeg_request: EEGDataRequest
):
    """
    Process EEG data and generate code optimizations
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        result = await neuro_service.process_eeg_data(
            session_id=eeg_request.session_id,
            eeg_data=eeg_request.eeg_data
        )

        if result.get('success'):
            return {
                "status": "eeg_processed",
                "patterns_detected": result['patterns_detected'],
                "optimizations": result['optimizations'],
                "session_stats": result['session_stats'],
                "processing_time": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'EEG processing failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EEG processing error: {str(e)}")

@router.get("/eeg/patterns/{session_id}")
@limiter.limit("20/minute")
async def get_detected_patterns(request: Request, session_id: str):
    """
    Get all detected EEG patterns for a session
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        if session_id not in neuro_service.active_sessions:
            raise HTTPException(status_code=404, detail="BCI session not found")

        session = neuro_service.active_sessions[session_id]
        patterns = session.get('patterns_detected', [])

        return {
            "session_id": session_id,
            "total_patterns": len(patterns),
            "patterns": patterns[-50:],  # Return last 50 patterns
            "pattern_summary": {
                pattern_type: len([p for p in patterns if p.get('pattern') == pattern_type])
                for pattern_type in ['focus', 'frustration', 'flow', 'creativity', 'problem_solving']
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern retrieval error: {str(e)}")

# === WEBCAM STRESS DETECTION ENDPOINTS ===

@router.post("/stress/analyze")
@limiter.limit("60/minute")
async def analyze_webcam_stress(
    request: Request,
    stress_request: WebcamStressRequest
):
    """
    Analyze webcam data for stress levels and trigger emotional compiler
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        result = await neuro_service.analyze_webcam_stress(
            session_id=stress_request.session_id,
            facial_data=stress_request.facial_data
        )

        if result.get('success'):
            return {
                "status": "stress_analyzed",
                "stress_level": result['stress_level'],
                "emotional_state": result['emotional_state'],
                "compiler_action": result['compiler_action'],
                "recommendations": result['recommendations'],
                "analysis_time": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Stress analysis failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stress analysis error: {str(e)}")

@router.get("/stress/history/{session_id}")
@limiter.limit("15/minute")
async def get_stress_history(request: Request, session_id: str, limit: int = 20):
    """
    Get stress analysis history for a session
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        # Get stress analyses from database
        analyses = await neuro_service.db.stress_analyses.find(
            {"session_id": session_id}
        ).sort("timestamp", -1).limit(limit).to_list(limit)

        return {
            "session_id": session_id,
            "analysis_count": len(analyses),
            "analyses": analyses,
            "average_stress": sum(a['stress_level'] for a in analyses) / max(1, len(analyses)),
            "stress_trend": "increasing" if len(analyses) >= 2 and analyses[0]['stress_level'] > analyses[-1]['stress_level'] else "stable"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stress history error: {str(e)}")

# === HAPTIC FEEDBACK ENDPOINTS ===

@router.post("/haptic/trigger")
@limiter.limit("50/minute")
async def trigger_haptic_feedback(
    request: Request,
    haptic_request: HapticFeedbackRequest
):
    """
    Trigger haptic feedback for enhanced coding experience
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        result = await neuro_service.activate_haptic_feedback(
            session_id=haptic_request.session_id,
            feedback_type=haptic_request.feedback_type,
            intensity=haptic_request.intensity
        )

        if result.get('success'):
            return {
                "status": "haptic_activated",
                "feedback_type": result['feedback_activated'],
                "pattern": result['pattern'],
                "intensity": result['intensity'],
                "activation_time": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Haptic feedback failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Haptic feedback error: {str(e)}")

@router.get("/haptic/events/{session_id}")
@limiter.limit("20/minute")
async def get_haptic_events(request: Request, session_id: str):
    """
    Get haptic feedback event history
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        events = await neuro_service.db.haptic_events.find(
            {"session_id": session_id}
        ).sort("timestamp", -1).limit(50).to_list(50)

        event_summary = {}
        for event in events:
            feedback_type = event.get('feedback_type', 'unknown')
            event_summary[feedback_type] = event_summary.get(feedback_type, 0) + 1

        return {
            "session_id": session_id,
            "total_events": len(events),
            "events": events,
            "event_summary": event_summary,
            "most_common_feedback": max(event_summary.items(), key=lambda x: x[1])[0] if event_summary else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Haptic events error: {str(e)}")

# === SESSION ANALYTICS ENDPOINTS ===

@router.get("/analytics/{session_id}")
@limiter.limit("10/minute")
async def get_session_analytics(request: Request, session_id: str):
    """
    Get comprehensive analytics for a BCI session
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        result = await neuro_service.get_session_analytics(session_id)

        if result.get('success'):
            return {
                "status": "analytics_ready",
                "session_id": session_id,
                "analytics": result,
                "generated_at": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail=result.get('error', 'Session not found'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session analytics error: {str(e)}")

@router.get("/analytics/user/{user_id}")
@limiter.limit("5/minute")
async def get_user_analytics(request: Request, user_id: str):
    """
    Get comprehensive BCI analytics for a user across all sessions
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        # Get user's BCI sessions
        sessions = await neuro_service.db.bci_sessions.find(
            {"user_id": user_id}
        ).sort("started_at", -1).to_list(20)

        if not sessions:
            return {
                "user_id": user_id,
                "total_sessions": 0,
                "message": "No BCI sessions found for user"
            }

        # Calculate aggregated analytics
        total_patterns = sum(len(s.get('patterns_detected', [])) for s in sessions)
        total_optimizations = sum(s.get('optimization_count', 0) for s in sessions)
        total_duration = sum((s.get('last_update', s['started_at']) - s['started_at']).total_seconds() 
                           for s in sessions if s.get('last_update'))

        # Get stress analyses
        stress_analyses = await neuro_service.db.stress_analyses.find(
            {"session_id": {"$in": [s['session_id'] for s in sessions]}}
        ).to_list(100)

        avg_stress = sum(a['stress_level'] for a in stress_analyses) / max(1, len(stress_analyses))

        return {
            "user_id": user_id,
            "total_sessions": len(sessions),
            "total_patterns_detected": total_patterns,
            "total_optimizations_generated": total_optimizations,
            "total_session_time": total_duration,
            "average_stress_level": avg_stress,
            "sessions": sessions[:10],  # Return last 10 sessions
            "performance_metrics": {
                "patterns_per_session": total_patterns / max(1, len(sessions)),
                "optimizations_per_session": total_optimizations / max(1, len(sessions)),
                "optimization_efficiency": total_optimizations / max(1, total_patterns)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User analytics error: {str(e)}")

# === DEVICE MANAGEMENT ENDPOINTS ===

@router.get("/devices/supported")
@limiter.limit("30/minute")
async def get_supported_devices(request: Request):
    """
    Get list of supported BCI devices and their capabilities
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        # This would come from the service, but we'll provide static info
        devices = {
            "muse": {
                "name": "Muse Headband",
                "channels": 4,
                "sample_rate": 256,
                "connection": "bluetooth",
                "capabilities": ["eeg", "gyroscope", "accelerometer"],
                "availability": "consumer",
                "price_range": "$200-$300"
            },
            "neuralink": {
                "name": "Neuralink Dev Kit",
                "channels": 1024,
                "sample_rate": 20000,
                "connection": "wireless",
                "capabilities": ["high_resolution_eeg", "direct_neural_interface", "motor_control"],
                "availability": "experimental",
                "price_range": "TBD"
            },
            "emotiv": {
                "name": "Emotiv EPOC X",
                "channels": 14,
                "sample_rate": 128,
                "connection": "wireless",
                "capabilities": ["eeg", "facial_expression", "mental_commands"],
                "availability": "consumer",
                "price_range": "$800-$1000"
            },
            "webcam_stress": {
                "name": "Webcam Stress Detector",
                "channels": 1,
                "sample_rate": 30,
                "connection": "usb",
                "capabilities": ["facial_analysis", "heart_rate_variability", "stress_detection"],
                "availability": "software_only",
                "price_range": "Free"
            }
        }

        return {
            "supported_devices": devices,
            "total_devices": len(devices),
            "recommended_device": "muse",
            "most_accessible": "webcam_stress"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Device list error: {str(e)}")

@router.post("/session/{session_id}/disconnect")
@limiter.limit("10/minute")
async def disconnect_bci_session(request: Request, session_id: str):
    """
    Disconnect and cleanup BCI session
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        if session_id not in neuro_service.active_sessions:
            raise HTTPException(status_code=404, detail="BCI session not found")

        # Get session analytics before disconnection
        analytics = await neuro_service.get_session_analytics(session_id)
        
        # Remove from active sessions
        session = neuro_service.active_sessions.pop(session_id)
        
        # Update database record
        await neuro_service.db.bci_sessions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "status": "disconnected",
                    "disconnected_at": datetime.utcnow(),
                    "final_analytics": analytics
                }
            }
        )

        return {
            "status": "session_disconnected",
            "session_id": session_id,
            "final_analytics": analytics,
            "disconnection_time": datetime.utcnow().isoformat(),
            "message": "BCI session successfully disconnected"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session disconnection error: {str(e)}")

# === SYSTEM STATUS ENDPOINTS ===

@router.get("/system/status")
@limiter.limit("20/minute")
async def get_neuro_system_status(request: Request):
    """
    Get Neuro-Sync system status and health metrics
    """
    try:
        neuro_service = get_neuro_sync_service()
        if not neuro_service:
            raise HTTPException(status_code=503, detail="Neuro-Sync service unavailable")

        # Count active sessions
        active_sessions = len(neuro_service.active_sessions)
        
        # Get recent activity from database
        recent_sessions = await neuro_service.db.bci_sessions.count_documents(
            {"started_at": {"$gte": datetime.utcnow() - timedelta(hours=24)}}
        )

        return {
            "system_status": "operational",
            "service_version": "1.0.neuro",
            "active_sessions": active_sessions,
            "recent_sessions_24h": recent_sessions,
            "supported_devices": 4,
            "capabilities": [
                "EEG Pattern Recognition",
                "Webcam Stress Detection", 
                "Emotional Compiler",
                "Haptic Feedback",
                "Real-time Biometrics",
                "Code Optimization"
            ],
            "system_health": "excellent",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"System status error: {str(e)}")