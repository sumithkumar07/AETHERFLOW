from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import logging

from routes.auth import get_current_user
from services.collaboration_engine import LiveCollaborationEngine, Operation, OperationType

router = APIRouter()
logger = logging.getLogger(__name__)

# Global collaboration engine instance
collaboration_engine: Optional[LiveCollaborationEngine] = None

def set_collaboration_engine(engine_instance: LiveCollaborationEngine):
    global collaboration_engine
    collaboration_engine = engine_instance

@router.post("/documents/{document_id}/operations")
async def apply_operation(
    document_id: str,
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Apply an operation to a collaborative document"""
    try:
        if not collaboration_engine:
            raise HTTPException(status_code=500, detail="Collaboration engine not initialized")
        
        # Extract operation data
        operation_type = request.get("operation_type", "")
        position = request.get("position", 0)
        content = request.get("content", "")
        document_version = request.get("document_version", 0)
        
        if not operation_type:
            raise HTTPException(status_code=400, detail="Operation type is required")
        
        # Convert string to OperationType enum
        try:
            op_type_enum = OperationType(operation_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid operation type: {operation_type}")
        
        # Create operation
        operation = Operation(
            operation_id=f"op_{int(datetime.now().timestamp() * 1000)}",
            user_id=current_user["user_id"],
            operation_type=op_type_enum,
            position=position,
            content=content,
            timestamp=datetime.now(),
            document_version=document_version
        )
        
        # Apply operation
        result = await collaboration_engine.apply_operation(document_id, operation)
        
        return {
            "success": result["success"],
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error applying operation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get document with collaborators"""
    try:
        if not collaboration_engine:
            raise HTTPException(status_code=500, detail="Collaboration engine not initialized")
        
        result = await collaboration_engine.get_document_with_collaborators(document_id, current_user["user_id"])
        
        return {
            "success": result["success"],
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/{document_id}/presence")
async def update_presence(
    document_id: str,
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update user presence for document"""
    try:
        if not collaboration_engine:
            raise HTTPException(status_code=500, detail="Collaboration engine not initialized")
        
        activity = {
            "document_id": document_id,
            "user_name": current_user.get("name", f"User {current_user['user_id'][:8]}"),
            "cursor_position": request.get("cursor_position"),
            "current_selection": request.get("current_selection"),
            "current_file": request.get("current_file", document_id)
        }
        
        result = await collaboration_engine.track_user_activity(current_user["user_id"], activity)
        
        return {
            "success": result["success"],
            "presence": result.get("presence"),
            "collaborators": result.get("collaborators", []),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating presence: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/collaborators")
async def get_collaborators(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get active collaborators for document"""
    try:
        if not collaboration_engine:
            raise HTTPException(status_code=500, detail="Collaboration engine not initialized")
        
        # Get collaborators through presence manager
        collaborators = await collaboration_engine.presence_manager.get_active_users(document_id)
        
        collaborator_data = []
        for collaborator in collaborators:
            collaborator_data.append({
                "user_id": collaborator.user_id,
                "user_name": collaborator.user_name,
                "status": collaborator.status.value,
                "cursor_position": collaborator.cursor_position,
                "current_selection": collaborator.current_selection,
                "color": collaborator.color,
                "last_seen": collaborator.last_seen.isoformat()
            })
        
        return {
            "success": True,
            "document_id": document_id,
            "collaborators": collaborator_data,
            "active_count": len(collaborator_data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting collaborators: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/{document_id}/snapshots")
async def create_snapshot(
    document_id: str,
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a document snapshot"""
    try:
        if not collaboration_engine:
            raise HTTPException(status_code=500, detail="Collaboration engine not initialized")
        
        description = request.get("description", f"Snapshot created by {current_user['user_id']}")
        
        result = await collaboration_engine.create_document_snapshot(
            document_id, current_user["user_id"], description
        )
        
        return {
            "success": result["success"],
            "snapshot": result.get("snapshot"),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating snapshot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/{document_id}/conflicts/resolve")
async def resolve_conflicts(
    document_id: str,
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Resolve conflicts in document"""
    try:
        if not collaboration_engine:
            raise HTTPException(status_code=500, detail="Collaboration engine not initialized")
        
        conflicting_operations_data = request.get("conflicting_operations", [])
        
        # Convert to Operation objects
        conflicting_operations = []
        for op_data in conflicting_operations_data:
            operation = Operation(
                operation_id=op_data["operation_id"],
                user_id=op_data["user_id"],
                operation_type=OperationType(op_data["operation_type"]),
                position=op_data["position"],
                content=op_data["content"],
                timestamp=datetime.fromisoformat(op_data["timestamp"]),
                document_version=op_data["document_version"]
            )
            conflicting_operations.append(operation)
        
        result = await collaboration_engine.resolve_conflicts(document_id, conflicting_operations)
        
        return {
            "success": result["success"],
            "resolution": result.get("resolution"),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error resolving conflicts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/active")
async def get_active_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's active collaboration sessions"""
    try:
        # Mock active sessions data
        active_sessions = [
            {
                "document_id": "doc_123",
                "document_name": "Project Planning.md",
                "project_id": "proj_456",
                "last_active": (datetime.now()).isoformat(),
                "collaborator_count": 3,
                "your_role": "editor",
                "recent_activity": "2 minutes ago"
            },
            {
                "document_id": "doc_789",
                "document_name": "API Documentation.md",
                "project_id": "proj_101",
                "last_active": (datetime.now()).isoformat(),
                "collaborator_count": 1,
                "your_role": "owner",
                "recent_activity": "1 hour ago"
            }
        ]
        
        return {
            "success": True,
            "active_sessions": active_sessions,
            "total_sessions": len(active_sessions),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting active sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_collaboration_history(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's collaboration history"""
    try:
        # Mock collaboration history
        history = [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "document_edit",
                "document_name": "README.md",
                "project_name": "AI Tempo Enhancement",
                "collaborators": ["Alice", "Bob"],
                "changes": 15
            },
            {
                "timestamp": (datetime.now()).isoformat(),
                "action": "conflict_resolution",
                "document_name": "API Spec.yaml",
                "project_name": "Backend Services",
                "collaborators": ["Charlie"],
                "changes": 3
            }
        ]
        
        return {
            "success": True,
            "history": history,
            "total_entries": len(history),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting collaboration history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/documents/{document_id}/ws")
async def websocket_collaboration(websocket: WebSocket, document_id: str):
    """WebSocket endpoint for real-time collaboration"""
    await websocket.accept()
    
    try:
        if not collaboration_engine:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Collaboration engine not initialized"
            }))
            return
        
        # Handle WebSocket messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "operation":
                # Handle collaborative operation
                operation_data = message.get("operation", {})
                
                # Create operation object
                operation = Operation(
                    operation_id=operation_data.get("operation_id", f"op_{int(datetime.now().timestamp() * 1000)}"),
                    user_id=message.get("user_id", "unknown"),
                    operation_type=OperationType(operation_data.get("operation_type", "insert")),
                    position=operation_data.get("position", 0),
                    content=operation_data.get("content", ""),
                    timestamp=datetime.now(),
                    document_version=operation_data.get("document_version", 0)
                )
                
                # Apply operation
                result = await collaboration_engine.apply_operation(document_id, operation)
                
                # Send result back
                await websocket.send_text(json.dumps({
                    "type": "operation_result",
                    "result": result,
                    "timestamp": datetime.now().isoformat()
                }))
                
            elif message_type == "presence":
                # Handle presence update
                user_id = message.get("user_id", "unknown")
                activity = message.get("activity", {})
                activity["document_id"] = document_id
                
                result = await collaboration_engine.track_user_activity(user_id, activity)
                
                # Broadcast presence update to other collaborators
                await websocket.send_text(json.dumps({
                    "type": "presence_update",
                    "presence": result.get("presence"),
                    "collaborators": result.get("collaborators", []),
                    "timestamp": datetime.now().isoformat()
                }))
                
            elif message_type == "cursor":
                # Handle cursor position update
                await websocket.send_text(json.dumps({
                    "type": "cursor_update",
                    "user_id": message.get("user_id"),
                    "position": message.get("position"),
                    "timestamp": datetime.now().isoformat()
                }))
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for document {document_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": str(e)
        }))