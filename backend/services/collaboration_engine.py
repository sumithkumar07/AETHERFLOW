import logging
import asyncio
import json
from typing import Dict, Any, List, Optional, Set, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import uuid
import hashlib
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class OperationType(Enum):
    INSERT = "insert"
    DELETE = "delete"
    RETAIN = "retain"
    REPLACE = "replace"

class CollaboratorRole(Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"
    COMMENTER = "commenter"

class PresenceStatus(Enum):
    ACTIVE = "active"
    IDLE = "idle"
    AWAY = "away"
    OFFLINE = "offline"

@dataclass
class Operation:
    operation_id: str
    user_id: str
    operation_type: OperationType
    position: int
    content: str
    timestamp: datetime
    document_version: int

@dataclass
class DocumentState:
    document_id: str
    content: str
    version: int
    last_modified: datetime
    operations_history: List[Operation] = field(default_factory=list)
    pending_operations: List[Operation] = field(default_factory=list)

@dataclass
class CollaboratorPresence:
    user_id: str
    user_name: str
    status: PresenceStatus
    cursor_position: Optional[int]
    current_selection: Optional[Tuple[int, int]]
    current_file: Optional[str]
    last_seen: datetime
    color: str

@dataclass
class ConflictResolution:
    conflict_id: str
    conflicting_operations: List[Operation]
    resolution_strategy: str
    resolved_operation: Operation
    resolved_at: datetime

class LiveCollaborationEngine:
    """Real-time collaboration engine with operational transformation"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.document_states = {}
        self.active_collaborators = defaultdict(dict)
        self.presence_manager = PresenceManager()
        self.conflict_resolver = ConflictResolver()
        self.operational_transformer = OperationalTransformer()
        self.change_notifier = ChangeNotifier()
        self.version_controller = VersionController()
        self.permission_manager = PermissionManager()
        self.initialized = False
    
    async def initialize(self):
        """Initialize collaboration engine"""
        try:
            db = await self.db_client.get_database()
            self.documents_collection = db.collaborative_documents
            self.operations_collection = db.operations_history
            self.presence_collection = db.user_presence
            self.conflicts_collection = db.conflict_resolutions
            
            await self.presence_manager.initialize()
            await self.conflict_resolver.initialize()
            await self.operational_transformer.initialize()
            await self.version_controller.initialize()
            await self.permission_manager.initialize()
            
            # Start background processes
            asyncio.create_task(self._presence_cleanup_loop())
            asyncio.create_task(self._conflict_resolution_loop())
            asyncio.create_task(self._version_cleanup_loop())
            
            self.initialized = True
            logger.info("Live collaboration engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize collaboration engine: {e}")
            raise
    
    async def _version_cleanup_loop(self):
        """Clean up old document versions"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                await self.version_controller.cleanup_old_versions(days=30)
            except Exception as e:
                logger.error(f"Error in version cleanup loop: {e}")
    
    async def apply_operation(self, document_id: str, operation: Operation) -> Dict[str, Any]:
        """Apply operation to document with operational transformation"""
        try:
            # Check permissions
            if not await self.permission_manager.can_edit(operation.user_id, document_id):
                return {
                    "success": False,
                    "error": "Insufficient permissions",
                    "code": "PERMISSION_DENIED"
                }
            
            # Get current document state
            document_state = await self._get_document_state(document_id)
            
            # Transform operation against pending operations
            transformed_operation = await self.operational_transformer.transform_operation(
                operation, document_state.pending_operations
            )
            
            # Apply transformation
            new_content, success = await self._apply_transformed_operation(
                document_state.content, transformed_operation
            )
            
            if not success:
                return {
                    "success": False,
                    "error": "Operation could not be applied",
                    "code": "OPERATION_FAILED"
                }
            
            # Update document state
            document_state.content = new_content
            document_state.version += 1
            document_state.last_modified = datetime.now()
            document_state.operations_history.append(transformed_operation)
            
            # Store in database
            await self._store_document_state(document_state)
            await self._store_operation(transformed_operation)
            
            # Notify other collaborators
            await self.change_notifier.notify_collaborators(
                document_id, transformed_operation, document_state
            )
            
            # Update presence
            await self.presence_manager.update_user_activity(
                operation.user_id, document_id, operation.position
            )
            
            return {
                "success": True,
                "operation_id": transformed_operation.operation_id,
                "document_version": document_state.version,
                "transformed": transformed_operation != operation
            }
            
        except Exception as e:
            logger.error(f"Error applying operation: {e}")
            return {
                "success": False,
                "error": str(e),
                "code": "INTERNAL_ERROR"
            }
    
    async def track_user_activity(self, user_id: str, activity: Dict[str, Any]) -> Dict[str, Any]:
        """Track user activity for presence awareness"""
        try:
            presence_update = await self.presence_manager.update_presence(user_id, activity)
            
            # Notify other collaborators about presence change
            if presence_update.get("changed", False):
                await self.change_notifier.notify_presence_change(
                    activity.get("document_id"), user_id, presence_update["presence"]
                )
            
            return {
                "success": True,
                "presence": presence_update["presence"],
                "collaborators": await self._get_active_collaborators(activity.get("document_id"))
            }
            
        except Exception as e:
            logger.error(f"Error tracking user activity: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_document_with_collaborators(self, document_id: str, user_id: str) -> Dict[str, Any]:
        """Get document content with current collaborators"""
        try:
            # Check permissions
            if not await self.permission_manager.can_view(user_id, document_id):
                return {
                    "success": False,
                    "error": "Insufficient permissions",
                    "code": "PERMISSION_DENIED"
                }
            
            # Get document state
            document_state = await self._get_document_state(document_id)
            
            # Get active collaborators
            collaborators = await self._get_active_collaborators(document_id)
            
            # Get recent operations for synchronization
            recent_operations = await self._get_recent_operations(document_id, limit=100)
            
            return {
                "success": True,
                "document": {
                    "id": document_id,
                    "content": document_state.content,
                    "version": document_state.version,
                    "last_modified": document_state.last_modified.isoformat()
                },
                "collaborators": collaborators,
                "recent_operations": recent_operations,
                "permissions": await self.permission_manager.get_user_permissions(user_id, document_id)
            }
            
        except Exception as e:
            logger.error(f"Error getting document with collaborators: {e}")
            return {"success": False, "error": str(e)}
    
    async def resolve_conflicts(self, document_id: str, conflicting_operations: List[Operation]) -> Dict[str, Any]:
        """Resolve conflicts between operations"""
        try:
            resolution = await self.conflict_resolver.resolve_conflicts(
                document_id, conflicting_operations
            )
            
            # Store conflict resolution
            await self.conflicts_collection.insert_one({
                "conflict_id": resolution.conflict_id,
                "document_id": document_id,
                "conflicting_operations": [op.__dict__ for op in resolution.conflicting_operations],
                "resolution_strategy": resolution.resolution_strategy,
                "resolved_operation": resolution.resolved_operation.__dict__,
                "resolved_at": resolution.resolved_at
            })
            
            return {
                "success": True,
                "resolution": {
                    "conflict_id": resolution.conflict_id,
                    "strategy": resolution.resolution_strategy,
                    "resolved_operation": resolution.resolved_operation.__dict__
                }
            }
            
        except Exception as e:
            logger.error(f"Error resolving conflicts: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_document_snapshot(self, document_id: str, user_id: str, description: str = "") -> Dict[str, Any]:
        """Create a snapshot of the document for version control"""
        try:
            document_state = await self._get_document_state(document_id)
            
            snapshot = await self.version_controller.create_snapshot(
                document_id, document_state, user_id, description
            )
            
            return {
                "success": True,
                "snapshot": {
                    "id": snapshot["snapshot_id"],
                    "version": snapshot["version"],
                    "created_at": snapshot["created_at"],
                    "description": snapshot["description"]
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating document snapshot: {e}")
            return {"success": False, "error": str(e)}
    
    async def _get_document_state(self, document_id: str) -> DocumentState:
        """Get or create document state"""
        if document_id in self.document_states:
            return self.document_states[document_id]
        
        # Try to load from database
        doc_data = await self.documents_collection.find_one({"document_id": document_id})
        
        if doc_data:
            document_state = DocumentState(
                document_id=document_id,
                content=doc_data["content"],
                version=doc_data["version"],
                last_modified=doc_data["last_modified"]
            )
        else:
            # Create new document
            document_state = DocumentState(
                document_id=document_id,
                content="",
                version=0,
                last_modified=datetime.now()
            )
        
        self.document_states[document_id] = document_state
        return document_state
    
    async def _apply_transformed_operation(self, content: str, operation: Operation) -> Tuple[str, bool]:
        """Apply transformed operation to content"""
        try:
            if operation.operation_type == OperationType.INSERT:
                new_content = content[:operation.position] + operation.content + content[operation.position:]
                return new_content, True
            
            elif operation.operation_type == OperationType.DELETE:
                delete_length = len(operation.content)
                new_content = content[:operation.position] + content[operation.position + delete_length:]
                return new_content, True
            
            elif operation.operation_type == OperationType.REPLACE:
                # Replace operation: delete then insert
                delete_length = len(operation.content.split('|')[0])  # Assuming format: "old|new"
                new_text = operation.content.split('|')[1]
                new_content = content[:operation.position] + new_text + content[operation.position + delete_length:]
                return new_content, True
            
            return content, False
            
        except Exception as e:
            logger.error(f"Error applying operation: {e}")
            return content, False
    
    async def _get_active_collaborators(self, document_id: str) -> List[Dict[str, Any]]:
        """Get list of active collaborators for document"""
        try:
            collaborators = []
            
            # Get from presence manager
            active_presences = await self.presence_manager.get_active_users(document_id)
            
            for presence in active_presences:
                collaborators.append({
                    "user_id": presence.user_id,
                    "user_name": presence.user_name,
                    "status": presence.status.value,
                    "cursor_position": presence.cursor_position,
                    "current_selection": presence.current_selection,
                    "color": presence.color,
                    "last_seen": presence.last_seen.isoformat()
                })
            
            return collaborators
            
        except Exception as e:
            logger.error(f"Error getting active collaborators: {e}")
            return []
    
    async def _presence_cleanup_loop(self):
        """Clean up inactive presence records"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                await self.presence_manager.cleanup_inactive_users(minutes=30)
            except Exception as e:
                logger.error(f"Error in presence cleanup loop: {e}")
    
    async def _conflict_resolution_loop(self):
        """Continuously resolve conflicts"""
        while True:
            try:
                await asyncio.sleep(10)  # Check every 10 seconds
                # Check for pending conflicts and resolve them
                await self.conflict_resolver.resolve_pending_conflicts()
            except Exception as e:
                logger.error(f"Error in conflict resolution loop: {e}")

class OperationalTransformer:
    """Operational transformation for conflict-free collaboration"""
    
    async def initialize(self):
        logger.info("Operational transformer initialized")
    
    async def transform_operation(self, operation: Operation, pending_operations: List[Operation]) -> Operation:
        """Transform operation against pending operations"""
        try:
            transformed_op = operation
            
            for pending_op in pending_operations:
                if pending_op.timestamp <= operation.timestamp:
                    transformed_op = await self._transform_against_operation(transformed_op, pending_op)
            
            return transformed_op
            
        except Exception as e:
            logger.error(f"Error transforming operation: {e}")
            return operation
    
    async def _transform_against_operation(self, op1: Operation, op2: Operation) -> Operation:
        """Transform one operation against another"""
        try:
            # Handle INSERT vs INSERT
            if op1.operation_type == OperationType.INSERT and op2.operation_type == OperationType.INSERT:
                if op2.position <= op1.position:
                    # Shift position by length of inserted content
                    new_position = op1.position + len(op2.content)
                    return Operation(
                        operation_id=op1.operation_id,
                        user_id=op1.user_id,
                        operation_type=op1.operation_type,
                        position=new_position,
                        content=op1.content,
                        timestamp=op1.timestamp,
                        document_version=op1.document_version
                    )
            
            # Handle INSERT vs DELETE
            elif op1.operation_type == OperationType.INSERT and op2.operation_type == OperationType.DELETE:
                if op2.position < op1.position:
                    # Shift position by length of deleted content
                    new_position = max(op2.position, op1.position - len(op2.content))
                    return Operation(
                        operation_id=op1.operation_id,
                        user_id=op1.user_id,
                        operation_type=op1.operation_type,
                        position=new_position,
                        content=op1.content,
                        timestamp=op1.timestamp,
                        document_version=op1.document_version
                    )
            
            # Handle DELETE vs INSERT
            elif op1.operation_type == OperationType.DELETE and op2.operation_type == OperationType.INSERT:
                if op2.position <= op1.position:
                    # Shift position by length of inserted content
                    new_position = op1.position + len(op2.content)
                    return Operation(
                        operation_id=op1.operation_id,
                        user_id=op1.user_id,
                        operation_type=op1.operation_type,
                        position=new_position,
                        content=op1.content,
                        timestamp=op1.timestamp,
                        document_version=op1.document_version
                    )
            
            # Handle DELETE vs DELETE
            elif op1.operation_type == OperationType.DELETE and op2.operation_type == OperationType.DELETE:
                # Complex case - may need to adjust delete range
                if op2.position < op1.position:
                    overlap = max(0, min(op1.position + len(op1.content), op2.position + len(op2.content)) - max(op1.position, op2.position))
                    if overlap > 0:
                        # Operations overlap - adjust accordingly
                        new_position = max(op2.position, op1.position - len(op2.content))
                        new_content = op1.content[overlap:] if overlap < len(op1.content) else ""
                        
                        if new_content:
                            return Operation(
                                operation_id=op1.operation_id,
                                user_id=op1.user_id,
                                operation_type=op1.operation_type,
                                position=new_position,
                                content=new_content,
                                timestamp=op1.timestamp,
                                document_version=op1.document_version
                            )
                        else:
                            # Operation is completely consumed - return no-op
                            return Operation(
                                operation_id=op1.operation_id,
                                user_id=op1.user_id,
                                operation_type=OperationType.RETAIN,
                                position=op1.position,
                                content="",
                                timestamp=op1.timestamp,
                                document_version=op1.document_version
                            )
            
            return op1
            
        except Exception as e:
            logger.error(f"Error in operation transformation: {e}")
            return op1

class PresenceManager:
    """Manage user presence and activity"""
    
    def __init__(self):
        self.active_users = {}
        self.user_colors = {}
        self._color_palette = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57",
            "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43"
        ]
        self._color_index = 0
    
    async def initialize(self):
        logger.info("Presence manager initialized")
    
    async def update_presence(self, user_id: str, activity: Dict[str, Any]) -> Dict[str, Any]:
        """Update user presence information"""
        try:
            current_time = datetime.now()
            
            # Get or assign color
            if user_id not in self.user_colors:
                self.user_colors[user_id] = self._color_palette[self._color_index % len(self._color_palette)]
                self._color_index += 1
            
            # Create or update presence
            presence = CollaboratorPresence(
                user_id=user_id,
                user_name=activity.get("user_name", f"User {user_id[:8]}"),
                status=PresenceStatus.ACTIVE,
                cursor_position=activity.get("cursor_position"),
                current_selection=activity.get("current_selection"),
                current_file=activity.get("current_file"),
                last_seen=current_time,
                color=self.user_colors[user_id]
            )
            
            # Check if presence changed
            changed = user_id not in self.active_users or self.active_users[user_id] != presence
            
            self.active_users[user_id] = presence
            
            return {
                "presence": {
                    "user_id": presence.user_id,
                    "user_name": presence.user_name,
                    "status": presence.status.value,
                    "cursor_position": presence.cursor_position,
                    "current_selection": presence.current_selection,
                    "current_file": presence.current_file,
                    "color": presence.color,
                    "last_seen": presence.last_seen.isoformat()
                },
                "changed": changed
            }
            
        except Exception as e:
            logger.error(f"Error updating presence: {e}")
            return {"changed": False}
    
    async def get_active_users(self, document_id: str = None) -> List[CollaboratorPresence]:
        """Get list of active users"""
        try:
            active_users = []
            current_time = datetime.now()
            
            for user_id, presence in self.active_users.items():
                # Check if user is still active (last seen within 5 minutes)
                if current_time - presence.last_seen < timedelta(minutes=5):
                    if document_id is None or presence.current_file == document_id:
                        active_users.append(presence)
            
            return active_users
            
        except Exception as e:
            logger.error(f"Error getting active users: {e}")
            return []
    
    async def cleanup_inactive_users(self, minutes: int = 30):
        """Remove inactive users from presence"""
        try:
            current_time = datetime.now()
            inactive_threshold = timedelta(minutes=minutes)
            
            inactive_users = [
                user_id for user_id, presence in self.active_users.items()
                if current_time - presence.last_seen > inactive_threshold
            ]
            
            for user_id in inactive_users:
                del self.active_users[user_id]
            
            logger.info(f"Cleaned up {len(inactive_users)} inactive users")
            
        except Exception as e:
            logger.error(f"Error cleaning up inactive users: {e}")

class ConflictResolver:
    """Resolve conflicts between operations"""
    
    async def initialize(self):
        logger.info("Conflict resolver initialized")
    
    async def resolve_conflicts(self, document_id: str, conflicting_operations: List[Operation]) -> ConflictResolution:
        """Resolve conflicts using various strategies"""
        try:
            # Sort operations by timestamp
            sorted_operations = sorted(conflicting_operations, key=lambda op: op.timestamp)
            
            # Use last-write-wins strategy for now
            winning_operation = sorted_operations[-1]
            
            resolution = ConflictResolution(
                conflict_id=str(uuid.uuid4()),
                conflicting_operations=conflicting_operations,
                resolution_strategy="last_write_wins",
                resolved_operation=winning_operation,
                resolved_at=datetime.now()
            )
            
            return resolution
            
        except Exception as e:
            logger.error(f"Error resolving conflicts: {e}")
            # Return first operation as fallback
            return ConflictResolution(
                conflict_id=str(uuid.uuid4()),
                conflicting_operations=conflicting_operations,
                resolution_strategy="fallback",
                resolved_operation=conflicting_operations[0] if conflicting_operations else None,
                resolved_at=datetime.now()
            )

class ChangeNotifier:
    """Notify collaborators of changes"""
    
    async def notify_collaborators(self, document_id: str, operation: Operation, document_state: DocumentState):
        """Notify other collaborators of changes"""
        # Implementation would use WebSocket or similar real-time communication
        logger.info(f"Notifying collaborators of change in document {document_id}")
    
    async def notify_presence_change(self, document_id: str, user_id: str, presence: Dict[str, Any]):
        """Notify collaborators of presence changes"""
        logger.info(f"Notifying presence change for user {user_id} in document {document_id}")

class VersionController:
    """Handle document versioning and snapshots"""
    
    async def initialize(self):
        logger.info("Version controller initialized")
    
    async def cleanup_old_versions(self, days: int = 30):
        """Clean up document versions older than specified days"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            logger.info(f"Cleaning up document versions older than {cutoff_date}")
            # Implementation would remove old versions from database
        except Exception as e:
            logger.error(f"Error cleaning up old versions: {e}")
    
    async def create_snapshot(self, document_id: str, document_state: DocumentState, 
                            user_id: str, description: str) -> Dict[str, Any]:
        """Create a document snapshot"""
        snapshot = {
            "snapshot_id": str(uuid.uuid4()),
            "document_id": document_id,
            "version": document_state.version,
            "content": document_state.content,
            "created_by": user_id,
            "created_at": datetime.now().isoformat(),
            "description": description
        }
        
        return snapshot

class PermissionManager:
    """Manage document permissions"""
    
    async def initialize(self):
        logger.info("Permission manager initialized")
    
    async def can_edit(self, user_id: str, document_id: str) -> bool:
        """Check if user can edit document"""
        # Simplified permission check
        return True
    
    async def can_view(self, user_id: str, document_id: str) -> bool:
        """Check if user can view document"""
        # Simplified permission check
        return True
    
    async def get_user_permissions(self, user_id: str, document_id: str) -> Dict[str, Any]:
        """Get user permissions for document"""
        return {
            "can_view": True,
            "can_edit": True,
            "can_comment": True,
            "can_share": False
        }