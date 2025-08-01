import logging
import asyncio
import json
from typing import Dict, Any, List, Optional, Set
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
import uuid

logger = logging.getLogger(__name__)

class OperationType(Enum):
    INSERT = "insert"
    DELETE = "delete"
    REPLACE = "replace"
    FORMAT = "format"

class CursorType(Enum):
    TEXT = "text"
    SELECTION = "selection"
    POSITION = "position"

@dataclass
class Operation:
    """Represents a single edit operation"""
    id: str
    type: OperationType
    position: int
    content: str = ""
    length: int = 0
    author: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Cursor:
    """Represents a user's cursor position"""
    user_id: str
    user_name: str
    position: int
    selection_start: Optional[int] = None
    selection_end: Optional[int] = None
    type: CursorType = CursorType.POSITION
    color: str = "#3B82F6"
    last_updated: datetime = field(default_factory=datetime.now)

@dataclass
class Document:
    """Represents a collaborative document"""
    id: str
    title: str
    content: str
    version: int = 0
    created_by: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    last_modified: datetime = field(default_factory=datetime.now)
    collaborators: Set[str] = field(default_factory=set)
    operations_history: List[Operation] = field(default_factory=list)
    active_cursors: Dict[str, Cursor] = field(default_factory=dict)

class OperationalTransform:
    """Operational Transformation for conflict resolution"""
    
    @staticmethod
    def transform_operation(op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
        """Transform two concurrent operations"""
        try:
            # If operations don't conflict, return them as-is
            if not OperationalTransform._operations_conflict(op1, op2):
                return op1, op2
            
            # Transform based on operation types
            if op1.type == OperationType.INSERT and op2.type == OperationType.INSERT:
                return OperationalTransform._transform_insert_insert(op1, op2)
            elif op1.type == OperationType.DELETE and op2.type == OperationType.DELETE:
                return OperationalTransform._transform_delete_delete(op1, op2)
            elif op1.type == OperationType.INSERT and op2.type == OperationType.DELETE:
                return OperationalTransform._transform_insert_delete(op1, op2)
            elif op1.type == OperationType.DELETE and op2.type == OperationType.INSERT:
                op2_t, op1_t = OperationalTransform._transform_insert_delete(op2, op1)
                return op1_t, op2_t
            else:
                # For other combinations, use position-based transformation
                return OperationalTransform._transform_by_position(op1, op2)
                
        except Exception as e:
            logger.error(f"Error transforming operations: {e}")
            return op1, op2
    
    @staticmethod
    def _operations_conflict(op1: Operation, op2: Operation) -> bool:
        """Check if two operations conflict"""
        # Operations conflict if they overlap in position
        op1_end = op1.position + (op1.length if op1.type == OperationType.DELETE else len(op1.content))
        op2_end = op2.position + (op2.length if op2.type == OperationType.DELETE else len(op2.content))
        
        return not (op1_end <= op2.position or op2_end <= op1.position)
    
    @staticmethod
    def _transform_insert_insert(op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
        """Transform two concurrent insert operations"""
        if op1.position <= op2.position:
            # op1 comes before op2, adjust op2's position
            new_op2 = Operation(
                id=op2.id,
                type=op2.type,
                position=op2.position + len(op1.content),
                content=op2.content,
                author=op2.author,
                timestamp=op2.timestamp,
                metadata=op2.metadata
            )
            return op1, new_op2
        else:
            # op2 comes before op1, adjust op1's position
            new_op1 = Operation(
                id=op1.id,
                type=op1.type,
                position=op1.position + len(op2.content),
                content=op1.content,
                author=op1.author,
                timestamp=op1.timestamp,
                metadata=op1.metadata
            )
            return new_op1, op2
    
    @staticmethod
    def _transform_delete_delete(op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
        """Transform two concurrent delete operations"""
        # If deletions overlap, need to adjust
        if op1.position < op2.position:
            if op1.position + op1.length > op2.position:
                # Overlapping deletes - adjust op2
                overlap = min(op1.position + op1.length, op2.position + op2.length) - op2.position
                new_op2 = Operation(
                    id=op2.id,
                    type=op2.type,
                    position=op1.position,
                    length=max(0, op2.length - overlap),
                    author=op2.author,
                    timestamp=op2.timestamp,
                    metadata=op2.metadata
                )
                return op1, new_op2
        elif op2.position < op1.position:
            if op2.position + op2.length > op1.position:
                # Overlapping deletes - adjust op1
                overlap = min(op2.position + op2.length, op1.position + op1.length) - op1.position
                new_op1 = Operation(
                    id=op1.id,
                    type=op1.type,
                    position=op2.position,
                    length=max(0, op1.length - overlap),
                    author=op1.author,
                    timestamp=op1.timestamp,
                    metadata=op1.metadata
                )
                return new_op1, op2
        
        return op1, op2
    
    @staticmethod
    def _transform_insert_delete(insert_op: Operation, delete_op: Operation) -> tuple[Operation, Operation]:
        """Transform insert and delete operations"""
        if insert_op.position <= delete_op.position:
            # Insert comes before delete, adjust delete position
            new_delete = Operation(
                id=delete_op.id,
                type=delete_op.type,
                position=delete_op.position + len(insert_op.content),
                length=delete_op.length,
                author=delete_op.author,
                timestamp=delete_op.timestamp,
                metadata=delete_op.metadata
            )
            return insert_op, new_delete
        elif insert_op.position >= delete_op.position + delete_op.length:
            # Insert comes after delete, adjust insert position
            new_insert = Operation(
                id=insert_op.id,
                type=insert_op.type,
                position=insert_op.position - delete_op.length,
                content=insert_op.content,
                author=insert_op.author,
                timestamp=insert_op.timestamp,
                metadata=insert_op.metadata
            )
            return new_insert, delete_op
        else:
            # Insert is within deleted range - complex case
            new_insert = Operation(
                id=insert_op.id,
                type=insert_op.type,
                position=delete_op.position,
                content=insert_op.content,
                author=insert_op.author,
                timestamp=insert_op.timestamp,
                metadata=insert_op.metadata
            )
            return new_insert, delete_op
    
    @staticmethod
    def _transform_by_position(op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
        """Simple position-based transformation"""
        return op1, op2

class CollaborativeEditor:
    """Real-time collaborative editor service"""
    
    def __init__(self, db_client=None):
        self.db_client = db_client
        self.documents: Dict[str, Document] = {}
        self.connections: Dict[str, Set[str]] = {}  # document_id -> set of user_ids
        self.user_colors: Dict[str, str] = {}
        self.operation_queue: Dict[str, List[Operation]] = {}  # document_id -> operations
        self.initialized = False
        
        # Available cursor colors
        self.available_colors = [
            "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
            "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
        ]
    
    async def initialize(self):
        """Initialize collaborative editor"""
        try:
            if self.db_client:
                db = await self.db_client.get_database()
                self.documents_collection = db.collaborative_documents
                self.operations_collection = db.collaborative_operations
                
                # Create indexes
                await self._create_indexes()
            
            # Start background processing
            asyncio.create_task(self._process_operations_queue())
            
            self.initialized = True
            logger.info("Collaborative editor initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize collaborative editor: {e}")
            raise
    
    async def create_document(self, title: str, content: str = "", created_by: str = "anonymous") -> str:
        """Create a new collaborative document"""
        try:
            document_id = str(uuid.uuid4())
            
            document = Document(
                id=document_id,
                title=title,
                content=content,
                created_by=created_by
            )
            
            self.documents[document_id] = document
            self.connections[document_id] = set()
            self.operation_queue[document_id] = []
            
            # Save to database
            if self.db_client:
                await self._save_document(document)
            
            logger.info(f"Created collaborative document: {title} ({document_id})")
            return document_id
            
        except Exception as e:
            logger.error(f"Error creating document: {e}")
            raise
    
    async def join_document(self, document_id: str, user_id: str, user_name: str = "Anonymous") -> Dict[str, Any]:
        """User joins a collaborative document"""
        try:
            if document_id not in self.documents:
                # Try to load from database
                await self._load_document(document_id)
                
                if document_id not in self.documents:
                    raise ValueError(f"Document {document_id} not found")
            
            document = self.documents[document_id]
            
            # Add user to connections
            if document_id not in self.connections:
                self.connections[document_id] = set()
            self.connections[document_id].add(user_id)
            
            # Add to collaborators
            document.collaborators.add(user_id)
            
            # Assign cursor color
            if user_id not in self.user_colors:
                color_index = len(self.user_colors) % len(self.available_colors)
                self.user_colors[user_id] = self.available_colors[color_index]
            
            # Create cursor
            cursor = Cursor(
                user_id=user_id,
                user_name=user_name,
                position=0,
                color=self.user_colors[user_id]
            )
            document.active_cursors[user_id] = cursor
            
            # Broadcast user joined
            await self._broadcast_event(document_id, {
                "type": "user_joined",
                "user_id": user_id,
                "user_name": user_name,
                "cursor": {
                    "user_id": cursor.user_id,
                    "user_name": cursor.user_name,
                    "position": cursor.position,
                    "color": cursor.color
                },
                "timestamp": datetime.now().isoformat()
            }, exclude_user=user_id)
            
            logger.info(f"User {user_name} joined document {document_id}")
            
            return {
                "document_id": document_id,
                "title": document.title,
                "content": document.content,
                "version": document.version,
                "cursor": {
                    "user_id": cursor.user_id,
                    "user_name": cursor.user_name,
                    "position": cursor.position,
                    "color": cursor.color
                },
                "collaborators": [
                    {
                        "user_id": c.user_id,
                        "user_name": c.user_name,
                        "color": c.color,
                        "position": c.position
                    }
                    for c in document.active_cursors.values()
                    if c.user_id != user_id
                ]
            }
            
        except Exception as e:
            logger.error(f"Error joining document: {e}")
            raise
    
    async def leave_document(self, document_id: str, user_id: str):
        """User leaves a collaborative document"""
        try:
            if document_id not in self.documents:
                return
            
            document = self.documents[document_id]
            
            # Remove from connections
            if document_id in self.connections:
                self.connections[document_id].discard(user_id)
            
            # Remove cursor
            if user_id in document.active_cursors:
                user_name = document.active_cursors[user_id].user_name
                del document.active_cursors[user_id]
                
                # Broadcast user left
                await self._broadcast_event(document_id, {
                    "type": "user_left",
                    "user_id": user_id,
                    "user_name": user_name,
                    "timestamp": datetime.now().isoformat()
                })
            
            logger.info(f"User {user_id} left document {document_id}")
            
        except Exception as e:
            logger.error(f"Error leaving document: {e}")
    
    async def apply_operation(self, document_id: str, operation_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Apply an operation to a document"""
        try:
            if document_id not in self.documents:
                raise ValueError(f"Document {document_id} not found")
            
            document = self.documents[document_id]
            
            # Create operation
            operation = Operation(
                id=operation_data.get("id", str(uuid.uuid4())),
                type=OperationType(operation_data["type"]),
                position=operation_data["position"],
                content=operation_data.get("content", ""),
                length=operation_data.get("length", 0),
                author=user_id,
                metadata=operation_data.get("metadata", {})
            )
            
            # Transform operation against pending operations
            transformed_operation = await self._transform_operation(document_id, operation)
            
            # Apply operation to document
            await self._apply_operation_to_document(document, transformed_operation)
            
            # Add to history
            document.operations_history.append(transformed_operation)
            document.version += 1
            document.last_modified = datetime.now()
            
            # Save operation to database
            if self.db_client:
                await self._save_operation(transformed_operation)
            
            # Broadcast to other users
            await self._broadcast_event(document_id, {
                "type": "operation",
                "operation": {
                    "id": transformed_operation.id,
                    "type": transformed_operation.type.value,
                    "position": transformed_operation.position,
                    "content": transformed_operation.content,
                    "length": transformed_operation.length,
                    "author": transformed_operation.author,
                    "timestamp": transformed_operation.timestamp.isoformat()
                },
                "version": document.version,
                "timestamp": datetime.now().isoformat()
            }, exclude_user=user_id)
            
            return {
                "success": True,
                "operation_id": transformed_operation.id,
                "version": document.version,
                "transformed_position": transformed_operation.position
            }
            
        except Exception as e:
            logger.error(f"Error applying operation: {e}")
            raise
    
    async def update_cursor(self, document_id: str, cursor_data: Dict[str, Any], user_id: str):
        """Update user's cursor position"""
        try:
            if document_id not in self.documents:
                return
            
            document = self.documents[document_id]
            
            if user_id not in document.active_cursors:
                return
            
            cursor = document.active_cursors[user_id]
            cursor.position = cursor_data.get("position", cursor.position)
            cursor.selection_start = cursor_data.get("selection_start")
            cursor.selection_end = cursor_data.get("selection_end")
            cursor.last_updated = datetime.now()
            
            # Broadcast cursor update
            await self._broadcast_event(document_id, {
                "type": "cursor_update",
                "cursor": {
                    "user_id": cursor.user_id,
                    "user_name": cursor.user_name,
                    "position": cursor.position,
                    "selection_start": cursor.selection_start,
                    "selection_end": cursor.selection_end,
                    "color": cursor.color
                },
                "timestamp": datetime.now().isoformat()
            }, exclude_user=user_id)
            
        except Exception as e:
            logger.error(f"Error updating cursor: {e}")
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document data"""
        try:
            if document_id not in self.documents:
                await self._load_document(document_id)
                
                if document_id not in self.documents:
                    return None
            
            document = self.documents[document_id]
            
            return {
                "id": document.id,
                "title": document.title,
                "content": document.content,
                "version": document.version,
                "created_by": document.created_by,
                "created_at": document.created_at.isoformat(),
                "last_modified": document.last_modified.isoformat(),
                "collaborators": [
                    {
                        "user_id": c.user_id,
                        "user_name": c.user_name,
                        "color": c.color,
                        "position": c.position,
                        "last_updated": c.last_updated.isoformat()
                    }
                    for c in document.active_cursors.values()
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting document: {e}")
            return None
    
    async def _transform_operation(self, document_id: str, operation: Operation) -> Operation:
        """Transform operation against concurrent operations"""
        try:
            if document_id not in self.operation_queue:
                return operation
            
            transformed_op = operation
            
            # Transform against queued operations
            for queued_op in self.operation_queue[document_id]:
                if queued_op.timestamp <= operation.timestamp:
                    transformed_op, _ = OperationalTransform.transform_operation(transformed_op, queued_op)
            
            return transformed_op
            
        except Exception as e:
            logger.error(f"Error transforming operation: {e}")
            return operation
    
    async def _apply_operation_to_document(self, document: Document, operation: Operation):
        """Apply operation to document content"""
        try:
            content = document.content
            
            if operation.type == OperationType.INSERT:
                document.content = content[:operation.position] + operation.content + content[operation.position:]
            
            elif operation.type == OperationType.DELETE:
                end_pos = operation.position + operation.length
                document.content = content[:operation.position] + content[end_pos:]
            
            elif operation.type == OperationType.REPLACE:
                end_pos = operation.position + operation.length
                document.content = content[:operation.position] + operation.content + content[end_pos:]
            
            # Update cursor positions for all users
            await self._update_cursors_after_operation(document, operation)
            
        except Exception as e:
            logger.error(f"Error applying operation to document: {e}")
    
    async def _update_cursors_after_operation(self, document: Document, operation: Operation):
        """Update cursor positions after an operation"""
        try:
            for cursor in document.active_cursors.values():
                if cursor.user_id == operation.author:
                    continue  # Don't update the author's cursor
                
                if operation.type == OperationType.INSERT:
                    if cursor.position >= operation.position:
                        cursor.position += len(operation.content)
                
                elif operation.type == OperationType.DELETE:
                    if cursor.position >= operation.position + operation.length:
                        cursor.position -= operation.length
                    elif cursor.position > operation.position:
                        cursor.position = operation.position
                
                elif operation.type == OperationType.REPLACE:
                    if cursor.position >= operation.position + operation.length:
                        cursor.position += len(operation.content) - operation.length
                    elif cursor.position > operation.position:
                        cursor.position = operation.position + len(operation.content)
                        
        except Exception as e:
            logger.error(f"Error updating cursors: {e}")
    
    async def _broadcast_event(self, document_id: str, event: Dict[str, Any], exclude_user: str = None):
        """Broadcast event to all connected users"""
        try:
            # In a real implementation, this would use WebSocket connections
            # For now, we'll store events for polling or WebSocket integration
            logger.info(f"Broadcasting event to document {document_id}: {event['type']}")
            
        except Exception as e:
            logger.error(f"Error broadcasting event: {e}")
    
    async def _process_operations_queue(self):
        """Process queued operations"""
        while True:
            try:
                await asyncio.sleep(1)  # Process every second
                
                for document_id in list(self.operation_queue.keys()):
                    if self.operation_queue[document_id]:
                        # Process operations in order
                        operations = self.operation_queue[document_id][:10]  # Process up to 10 at a time
                        self.operation_queue[document_id] = self.operation_queue[document_id][10:]
                        
                        for operation in operations:
                            # Operations are already applied, this is for cleanup
                            pass
                
            except Exception as e:
                logger.error(f"Error processing operations queue: {e}")
    
    async def _create_indexes(self):
        """Create database indexes"""
        try:
            await self.documents_collection.create_index([("id", 1)])
            await self.operations_collection.create_index([("document_id", 1), ("timestamp", 1)])
            logger.info("Collaborative editor database indexes created")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
    
    async def _save_document(self, document: Document):
        """Save document to database"""
        try:
            document_data = {
                "_id": document.id,
                "title": document.title,
                "content": document.content,
                "version": document.version,
                "created_by": document.created_by,
                "created_at": document.created_at,
                "last_modified": document.last_modified,
                "collaborators": list(document.collaborators)
            }
            
            await self.documents_collection.replace_one(
                {"_id": document.id},
                document_data,
                upsert=True
            )
            
        except Exception as e:
            logger.error(f"Error saving document: {e}")
    
    async def _load_document(self, document_id: str):
        """Load document from database"""
        try:
            if not self.db_client:
                return
            
            doc_data = await self.documents_collection.find_one({"_id": document_id})
            if doc_data:
                document = Document(
                    id=doc_data["_id"],
                    title=doc_data["title"],
                    content=doc_data["content"],
                    version=doc_data["version"],
                    created_by=doc_data["created_by"],
                    created_at=doc_data["created_at"],
                    last_modified=doc_data["last_modified"],
                    collaborators=set(doc_data.get("collaborators", []))
                )
                
                self.documents[document_id] = document
                self.connections[document_id] = set()
                self.operation_queue[document_id] = []
                
        except Exception as e:
            logger.error(f"Error loading document: {e}")
    
    async def _save_operation(self, operation: Operation):
        """Save operation to database"""
        try:
            if not self.db_client:
                return
            
            operation_data = {
                "_id": operation.id,
                "type": operation.type.value,
                "position": operation.position,
                "content": operation.content,
                "length": operation.length,
                "author": operation.author,
                "timestamp": operation.timestamp,
                "metadata": operation.metadata
            }
            
            await self.operations_collection.insert_one(operation_data)
            
        except Exception as e:
            logger.error(f"Error saving operation: {e}")
    
    async def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get documents for a user"""
        try:
            user_docs = []
            
            for doc in self.documents.values():
                if user_id in doc.collaborators or doc.created_by == user_id:
                    user_docs.append({
                        "id": doc.id,
                        "title": doc.title,
                        "created_at": doc.created_at.isoformat(),
                        "last_modified": doc.last_modified.isoformat(),
                        "is_owner": doc.created_by == user_id,
                        "collaborators_count": len(doc.collaborators),
                        "version": doc.version
                    })
            
            return sorted(user_docs, key=lambda x: x["last_modified"], reverse=True)
            
        except Exception as e:
            logger.error(f"Error getting user documents: {e}")
            return []