from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from services.collaborative_editor import CollaborativeEditor
from routes.auth import get_current_user

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter()

# Global collaborative editor instance
collaborative_editor = None

def set_collaborative_editor(editor: CollaborativeEditor):
    """Set the collaborative editor instance"""
    global collaborative_editor
    collaborative_editor = editor

@router.post("/documents")
async def create_document(
    document_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new collaborative document"""
    try:
        if not collaborative_editor:
            raise HTTPException(status_code=503, detail="Collaborative editor not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        # Validate required fields
        if "title" not in document_data:
            raise HTTPException(status_code=400, detail="Title is required")
        
        # Create document
        document_id = await collaborative_editor.create_document(
            title=document_data["title"],
            content=document_data.get("content", ""),
            created_by=user_id
        )
        
        return {
            "success": True,
            "document_id": document_id,
            "message": "Document created successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/documents")
async def get_user_documents(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get documents for current user"""
    try:
        if not collaborative_editor:
            raise HTTPException(status_code=503, detail="Collaborative editor not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        # Get user documents
        documents = await collaborative_editor.get_user_documents(user_id)
        
        return {
            "success": True,
            "documents": documents,
            "total": len(documents),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user documents: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get a specific document"""
    try:
        if not collaborative_editor:
            raise HTTPException(status_code=503, detail="Collaborative editor not available")
        
        # Get document
        document = await collaborative_editor.get_document(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "success": True,
            "document": document,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/documents/{document_id}/join")
async def join_document(
    document_id: str,
    user_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Join a collaborative document"""
    try:
        if not collaborative_editor:
            raise HTTPException(status_code=503, detail="Collaborative editor not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        user_name = user_data.get("user_name", current_user.get("name", "Anonymous"))
        
        # Join document
        result = await collaborative_editor.join_document(document_id, user_id, user_name)
        
        return {
            "success": True,
            "result": result,
            "message": "Joined document successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining document: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/documents/{document_id}/leave")
async def leave_document(
    document_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Leave a collaborative document"""
    try:
        if not collaborative_editor:
            raise HTTPException(status_code=503, detail="Collaborative editor not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        # Leave document
        await collaborative_editor.leave_document(document_id, user_id)
        
        return {
            "success": True,
            "message": "Left document successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving document: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/documents/{document_id}/operations")
async def apply_operation(
    document_id: str,
    operation_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Apply an operation to a document"""
    try:
        if not collaborative_editor:
            raise HTTPException(status_code=503, detail="Collaborative editor not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        # Validate operation data
        required_fields = ["type", "position"]
        for field in required_fields:
            if field not in operation_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Apply operation
        result = await collaborative_editor.apply_operation(document_id, operation_data, user_id)
        
        return {
            "success": True,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error applying operation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/documents/{document_id}/cursor")
async def update_cursor(
    document_id: str,
    cursor_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update cursor position"""
    try:
        if not collaborative_editor:
            raise HTTPException(status_code=503, detail="Collaborative editor not available")
        
        # Get current user
        current_user = await get_current_user(credentials.credentials)
        user_id = current_user.get("user_id", "anonymous")
        
        # Update cursor
        await collaborative_editor.update_cursor(document_id, cursor_data, user_id)
        
        return {
            "success": True,
            "message": "Cursor updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating cursor: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/editor/capabilities")
async def get_editor_capabilities():
    """Get collaborative editor capabilities"""
    try:
        return {
            "success": True,
            "capabilities": {
                "supported_operations": [
                    {
                        "type": "insert",
                        "description": "Insert text at position",
                        "required_fields": ["position", "content"]
                    },
                    {
                        "type": "delete",
                        "description": "Delete text at position",
                        "required_fields": ["position", "length"]
                    },
                    {
                        "type": "replace",
                        "description": "Replace text at position",
                        "required_fields": ["position", "length", "content"]
                    },
                    {
                        "type": "format",
                        "description": "Format text at position",
                        "required_fields": ["position", "length", "metadata"]
                    }
                ],
                "features": {
                    "real_time_collaboration": True,
                    "operational_transform": True,
                    "cursor_tracking": True,
                    "presence_awareness": True,
                    "conflict_resolution": True,
                    "version_control": True,
                    "undo_redo": False,  # Not implemented yet
                    "comments": False,   # Not implemented yet
                    "suggestions": False # Not implemented yet
                },
                "limits": {
                    "max_document_size": "1MB",
                    "max_collaborators": 50,
                    "max_operations_per_second": 100,
                    "operation_history_retention": "7 days"
                },
                "cursor_colors": [
                    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
                    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting editor capabilities: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")