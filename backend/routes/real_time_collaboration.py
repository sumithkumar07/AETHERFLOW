from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging
import json

from models.user import User
from models.database import get_database
from routes.auth import get_current_user
from services.websocket_manager import WebSocketManager
from services.smart_collaboration_service import SmartCollaborationService
from services.real_time_performance import RealTimePerformanceService

router = APIRouter()
logger = logging.getLogger(__name__)

# Services
websocket_manager = WebSocketManager()
collab_service = SmartCollaborationService()
perf_service = RealTimePerformanceService()

class CollaborationSession(BaseModel):
    project_id: str
    session_name: str
    description: Optional[str] = None
    max_participants: int = 10
    collaboration_type: str = "development"  # development, review, planning, design

class JoinSessionRequest(BaseModel):
    session_id: str
    user_role: str = "contributor"  # owner, contributor, viewer

class RealTimeUpdate(BaseModel):
    type: str  # code_change, cursor_move, chat_message, ai_suggestion
    data: Dict[str, Any]
    user_id: str
    timestamp: datetime

@router.post("/sessions/create")
async def create_collaboration_session(
    session_data: CollaborationSession,
    current_user: User = Depends(get_current_user)
):
    """Create a new real-time collaboration session"""
    try:
        db = await get_database()
        
        session = {
            "_id": f"session_{uuid.uuid4().hex[:12]}",
            "project_id": session_data.project_id,
            "owner_id": str(current_user.id),
            "session_name": session_data.session_name,
            "description": session_data.description,
            "max_participants": session_data.max_participants,
            "collaboration_type": session_data.collaboration_type,
            "participants": [{
                "user_id": str(current_user.id),
                "role": "owner",
                "joined_at": datetime.utcnow(),
                "status": "active"
            }],
            "real_time_features": {
                "ai_assistance": True,
                "live_code_sharing": True,
                "voice_chat": True,
                "screen_sharing": True,
                "collaborative_whiteboard": True
            },
            "ai_settings": {
                "shared_context": True,
                "multi_agent_support": True,
                "real_time_suggestions": True,
                "collaborative_debugging": True
            },
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.collaboration_sessions.insert_one(session)
        
        # Initialize real-time services for session
        await collab_service.initialize_session(session["_id"], session_data.project_id)
        
        logger.info(f"Created collaboration session {session['_id']} for project {session_data.project_id}")
        
        return {
            "session_id": session["_id"],
            "session": session,
            "websocket_url": f"/api/collaboration/sessions/{session['_id']}/ws",
            "real_time_features": session["real_time_features"],
            "ai_capabilities": {
                "unlimited_local_ai": True,
                "multi_agent_collaboration": True,
                "real_time_code_generation": True,
                "collaborative_debugging": True,
                "shared_ai_context": True
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to create collaboration session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")

@router.post("/sessions/{session_id}/join")
async def join_collaboration_session(
    session_id: str,
    join_data: JoinSessionRequest,
    current_user: User = Depends(get_current_user)
):
    """Join an existing collaboration session"""
    try:
        db = await get_database()
        
        # Get session
        session = await db.collaboration_sessions.find_one({"_id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check if user already in session
        existing_participant = next(
            (p for p in session.get("participants", []) if p["user_id"] == str(current_user.id)),
            None
        )
        
        if existing_participant:
            # Update existing participant status
            await db.collaboration_sessions.update_one(
                {"_id": session_id, "participants.user_id": str(current_user.id)},
                {"$set": {
                    "participants.$.status": "active",
                    "participants.$.last_active": datetime.utcnow()
                }}
            )
        else:
            # Add new participant
            if len(session.get("participants", [])) >= session.get("max_participants", 10):
                raise HTTPException(status_code=400, detail="Session is full")
            
            await db.collaboration_sessions.update_one(
                {"_id": session_id},
                {"$push": {
                    "participants": {
                        "user_id": str(current_user.id),
                        "role": join_data.user_role,
                        "joined_at": datetime.utcnow(),
                        "status": "active"
                    }
                }}
            )
        
        # Get updated session
        updated_session = await db.collaboration_sessions.find_one({"_id": session_id})
        
        return {
            "session": updated_session,
            "user_role": join_data.user_role,
            "collaboration_capabilities": {
                "can_edit": join_data.user_role in ["owner", "contributor"],
                "can_use_ai": True,
                "can_share_screen": True,
                "can_voice_chat": True,
                "unlimited_ai_access": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to join session: {e}")
        raise HTTPException(status_code=500, detail="Failed to join session")

@router.websocket("/sessions/{session_id}/ws") 
async def collaboration_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time collaboration"""
    try:
        await websocket.accept()
        
        # Add user to websocket manager
        user_id = "temp_user"  # In production, extract from auth token
        await websocket_manager.connect(websocket, user_id, session_id)
        
        logger.info(f"User {user_id} connected to collaboration session {session_id}")
        
        # Send initial session state
        session_state = await collab_service.get_session_state(session_id)
        await websocket.send_text(json.dumps({
            "type": "session_state",
            "data": session_state
        }))
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Process different message types
                await _handle_collaboration_message(
                    websocket_manager, session_id, user_id, message
                )
                
        except WebSocketDisconnect:
            logger.info(f"User {user_id} disconnected from session {session_id}")
            await websocket_manager.disconnect(user_id, session_id)
            
    except Exception as e:
        logger.error(f"WebSocket error in session {session_id}: {e}")
        await websocket.close(code=1000)

@router.get("/sessions/{session_id}/state")
async def get_session_state(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get current state of collaboration session"""
    try:
        session_state = await collab_service.get_session_state(session_id)
        
        # Add real-time performance metrics
        performance_metrics = await perf_service.get_session_metrics(session_id)
        
        return {
            "session_id": session_id,
            "state": session_state,
            "performance": performance_metrics,
            "real_time_features": {
                "active_users": len(session_state.get("participants", [])),
                "ai_agents_active": session_state.get("ai_agents_count", 0),
                "live_features": {
                    "code_sync": True,
                    "cursor_tracking": True,
                    "ai_suggestions": True,
                    "voice_chat": True,
                    "screen_sharing": True
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get session state: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session state")

@router.post("/sessions/{session_id}/ai-assist")
async def request_ai_assistance(
    session_id: str,
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Request AI assistance in collaboration session"""
    try:
        # Get collaborative AI response
        ai_response = await collab_service.get_collaborative_ai_response(
            session_id=session_id,
            request=request,
            user_id=str(current_user.id)
        )
        
        # Broadcast AI response to all session participants
        await websocket_manager.broadcast_to_session(session_id, {
            "type": "ai_response",
            "data": ai_response,
            "from_user": str(current_user.id)
        })
        
        return {
            "ai_response": ai_response,
            "shared_with_session": True,
            "collaborative_context": True,
            "unlimited_usage": True
        }
        
    except Exception as e:
        logger.error(f"AI assistance error: {e}")
        raise HTTPException(status_code=500, detail="AI assistance failed")

@router.get("/sessions/active")
async def get_active_sessions(
    current_user: User = Depends(get_current_user),
    project_id: Optional[str] = None
):
    """Get active collaboration sessions for user"""
    try:
        db = await get_database()
        
        query = {
            "participants.user_id": str(current_user.id),
            "status": "active"
        }
        
        if project_id:
            query["project_id"] = project_id
            
        sessions_cursor = db.collaboration_sessions.find(query)
        sessions = await sessions_cursor.to_list(length=50)
        
        # Add real-time metrics for each session
        enhanced_sessions = []
        for session in sessions:
            metrics = await perf_service.get_session_metrics(session["_id"])
            session["real_time_metrics"] = metrics
            enhanced_sessions.append(session)
        
        return {
            "active_sessions": enhanced_sessions,
            "total_count": len(enhanced_sessions),
            "user_role_summary": _get_user_role_summary(enhanced_sessions, str(current_user.id))
        }
        
    except Exception as e:
        logger.error(f"Failed to get active sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sessions")

async def _handle_collaboration_message(manager, session_id, user_id, message):
    """Handle different types of collaboration messages"""
    message_type = message.get("type")
    
    if message_type == "code_change":
        # Handle real-time code changes
        await manager.broadcast_to_session(session_id, {
            "type": "code_change",
            "data": message.get("data"),
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)
        
    elif message_type == "cursor_move":
        # Handle cursor movements
        await manager.broadcast_to_session(session_id, {
            "type": "cursor_move", 
            "data": message.get("data"),
            "user_id": user_id
        }, exclude_user=user_id)
        
    elif message_type == "ai_request":
        # Handle collaborative AI requests
        ai_response = await collab_service.process_collaborative_ai_request(
            session_id, message.get("data"), user_id
        )
        
        await manager.broadcast_to_session(session_id, {
            "type": "ai_response",
            "data": ai_response,
            "requested_by": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    elif message_type == "chat_message":
        # Handle chat messages
        await manager.broadcast_to_session(session_id, {
            "type": "chat_message",
            "data": message.get("data"),
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)

def _get_user_role_summary(sessions, user_id):
    """Get summary of user roles across sessions"""
    role_count = {"owner": 0, "contributor": 0, "viewer": 0}
    
    for session in sessions:
        for participant in session.get("participants", []):
            if participant["user_id"] == user_id:
                role = participant.get("role", "contributor")
                role_count[role] = role_count.get(role, 0) + 1
                break
                
    return role_count