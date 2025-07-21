from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import json
import asyncio
import logging
from datetime import datetime, timedelta

from models.collaboration_models import (
    Room, User, CreateRoomRequest, JoinRoomRequest, SendChatRequest, 
    UpdatePresenceRequest, ApplyEditRequest, ChatMessage, EditOperation
)
from services.collaboration_service import CollaborationManager
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/collaboration", tags=["collaboration"])

# Global collaboration manager - will be initialized when app starts
collaboration_manager: Optional[CollaborationManager] = None

def init_collaboration_manager(db: AsyncIOMotorDatabase):
    """Initialize the global collaboration manager"""
    global collaboration_manager
    collaboration_manager = CollaborationManager(db)

async def get_collaboration_manager() -> CollaborationManager:
    """Dependency to get collaboration manager"""
    if collaboration_manager is None:
        raise HTTPException(status_code=503, detail="Collaboration service not initialized")
    return collaboration_manager

# Room Management Endpoints
@router.post("/rooms", response_model=Room)
async def create_room(
    request: CreateRoomRequest,
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Create a new collaboration room for a project"""
    try:
        # For now, create anonymous owner - in production you'd get this from auth
        owner_id = f"anonymous_{datetime.utcnow().timestamp()}"
        
        room = await manager.create_room(
            project_id=request.project_id,
            name=request.name,
            owner_id=owner_id,
            description=request.description,
            is_public=request.is_public,
            max_users=request.max_users
        )
        
        return room
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail="Failed to create collaboration room")

@router.get("/rooms/{room_id}")
async def get_room(
    room_id: str,
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Get room information"""
    try:
        room = await manager.db.rooms.find_one({"id": room_id})
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Get room stats
        stats = manager.get_room_stats(room_id)
        
        return {
            "room": Room(**room).dict(),
            "stats": stats
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get room information")

@router.get("/projects/{project_id}/rooms")
async def get_project_rooms(
    project_id: str,
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Get all collaboration rooms for a project"""
    try:
        rooms = await manager.db.rooms.find({"project_id": project_id}).to_list(100)
        
        # Add stats for each room
        rooms_with_stats = []
        for room in rooms:
            stats = manager.get_room_stats(room["id"])
            rooms_with_stats.append({
                **room,
                "stats": stats
            })
        
        return rooms_with_stats
    except Exception as e:
        logger.error(f"Error getting rooms for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get project rooms")

# Chat Endpoints
@router.post("/rooms/{room_id}/chat")
async def send_chat_message(
    room_id: str,
    request: SendChatRequest,
    user_id: str = "anonymous",  # In production, get from auth
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Send a chat message to a room"""
    try:
        message = await manager.send_chat_message(
            room_id=room_id,
            user_id=user_id,
            message=request.message,
            message_type=request.message_type,
            reply_to=request.reply_to,
            metadata=request.metadata
        )
        return message
    except Exception as e:
        logger.error(f"Error sending chat message to room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send chat message")

@router.get("/rooms/{room_id}/chat")
async def get_chat_history(
    room_id: str,
    limit: int = 50,
    before: Optional[str] = None,
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Get chat history for a room"""
    try:
        before_datetime = None
        if before:
            before_datetime = datetime.fromisoformat(before.replace('Z', '+00:00'))
        
        messages = await manager.get_chat_history(
            room_id=room_id,
            limit=limit,
            before=before_datetime
        )
        
        return {"messages": [msg.dict() for msg in messages]}
    except Exception as e:
        logger.error(f"Error getting chat history for room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat history")

# File Editing Endpoints
@router.post("/files/{file_id}/edit")
async def apply_edit_operations(
    file_id: str,
    request: ApplyEditRequest,
    user_id: str = "anonymous",  # In production, get from auth
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Apply edit operations to a file with operational transform"""
    try:
        # Add user_id to all operations
        for op in request.operations:
            op.user_id = user_id
        
        result = await manager.apply_edit_operations(
            file_id=file_id,
            operations=request.operations,
            base_version=request.base_version
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error applying edit operations to file {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply edit operations")

# WebSocket Endpoint for Real-time Collaboration
@router.websocket("/rooms/{room_id}/ws")
async def websocket_collaboration(
    websocket: WebSocket,
    room_id: str,
    user_name: str = "Anonymous",
    avatar_color: str = "#3B82F6",
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """WebSocket endpoint for real-time collaboration"""
    await websocket.accept()
    
    # Create anonymous user
    user = User(
        name=user_name,
        avatar_color=avatar_color,
        is_anonymous=True
    )
    
    try:
        # Join room
        joined = await manager.join_room(room_id, user, websocket)
        if not joined:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Failed to join room",
                "code": "JOIN_FAILED"
            }))
            await websocket.close()
            return
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connected",
            "user_id": user.id,
            "room_id": room_id,
            "message": f"Connected to collaboration room: {room_id}",
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                message_type = message.get("type")
                
                if message_type == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                elif message_type == "presence_update":
                    await manager.update_user_presence(
                        user_id=user.id,
                        room_id=room_id,
                        file_id=message.get("file_id"),
                        cursor_position=message.get("cursor_position"),
                        selection=message.get("selection"),
                        is_typing=message.get("is_typing", False)
                    )
                
                elif message_type == "chat_message":
                    await manager.send_chat_message(
                        room_id=room_id,
                        user_id=user.id,
                        message=message.get("message", ""),
                        message_type=message.get("message_type", "text"),
                        reply_to=message.get("reply_to"),
                        metadata=message.get("metadata")
                    )
                
                elif message_type == "edit_operations":
                    # Handle real-time editing
                    file_id = message.get("file_id")
                    operations = message.get("operations", [])
                    base_version = message.get("base_version", 0)
                    
                    if file_id and operations:
                        edit_ops = []
                        for op_data in operations:
                            op = EditOperation(
                                user_id=user.id,
                                file_id=file_id,
                                operation_type=op_data.get("operation_type"),
                                position=op_data.get("position"),
                                content=op_data.get("content"),
                                length=op_data.get("length"),
                                version=base_version
                            )
                            edit_ops.append(op)
                        
                        result = await manager.apply_edit_operations(file_id, edit_ops, base_version)
                        
                        # Broadcast changes to other users
                        await manager.broadcast_to_room(room_id, {
                            "type": "file_edit",
                            "user_id": user.id,
                            "file_id": file_id,
                            "operations": [op.dict() for op in edit_ops],
                            "new_version": result["new_version"],
                            "timestamp": datetime.utcnow().isoformat()
                        }, exclude_user=user.id)
                        
                        # Send confirmation to sender
                        await websocket.send_text(json.dumps({
                            "type": "edit_applied",
                            "file_id": file_id,
                            "new_version": result["new_version"],
                            "success": True,
                            "timestamp": datetime.utcnow().isoformat()
                        }))
                
                elif message_type == "request_room_state":
                    await manager.send_room_state(room_id, user.id)
                
                else:
                    logger.warning(f"Unknown message type: {message_type}")
                    
            except asyncio.TimeoutError:
                # Send keepalive
                await websocket.send_text(json.dumps({
                    "type": "keepalive",
                    "timestamp": datetime.utcnow().isoformat()
                }))
            
    except WebSocketDisconnect:
        logger.info(f"User {user.id} disconnected from room {room_id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user.id} in room {room_id}: {e}")
    finally:
        await manager.leave_room(room_id, user.id)

# Health and Stats Endpoints
@router.get("/health")
async def collaboration_health(
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Get collaboration service health"""
    total_rooms = len(manager.active_connections)
    total_users = sum(len(users) for users in manager.room_users.values())
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "stats": {
            "active_rooms": total_rooms,
            "active_users": total_users,
            "file_versions_tracked": len(manager.file_versions),
            "operation_queues": len(manager.operation_queue)
        }
    }

@router.get("/stats")
async def collaboration_stats(
    manager: CollaborationManager = Depends(get_collaboration_manager)
):
    """Get detailed collaboration statistics"""
    # Get database stats
    rooms_count = await manager.db.rooms.count_documents({})
    users_count = await manager.db.users.count_documents({})
    messages_count = await manager.db.chat_messages.count_documents({})
    operations_count = await manager.db.edit_operations.count_documents({})
    
    # Get active stats
    active_rooms = len(manager.active_connections)
    active_users = sum(len(users) for users in manager.room_users.values())
    
    # Get room stats
    room_stats = []
    for room_id in manager.active_connections.keys():
        stats = manager.get_room_stats(room_id)
        room_stats.append(stats)
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "database": {
            "total_rooms": rooms_count,
            "total_users": users_count,
            "total_chat_messages": messages_count,
            "total_edit_operations": operations_count
        },
        "active": {
            "rooms": active_rooms,
            "users": active_users,
            "file_versions_tracked": len(manager.file_versions)
        },
        "rooms": room_stats
    }