from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
import os
import logging
import uuid
import json
import asyncio
import hashlib
import time
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Import collaboration routes
from routes.collaboration_routes import router as collaboration_router, init_collaboration_manager

# Import cosmic routes
from routes.cosmic_routes import router as cosmic_router

# Import neuro routes
from routes.neuro_routes import router as neuro_router

# Import quantum routes  
from routes.quantum_routes import router as quantum_router

# Import NEW cosmic reality routes
from routes.reality_fabric_routes import router as reality_fabric_router
from routes.omniversal_routes import router as omniversal_router
from routes.iching_routes import router as iching_router
from routes.vibranium_routes import router as vibranium_router
from routes.nexus_routes import router as nexus_router
from routes.immortality_routes import router as immortality_router

# Import cosmic service
from services.cosmic_service import init_cosmic_service

# Import neuro sync service
from services.neuro_sync_service import init_neuro_sync_service

# Import quantum service
from services.quantum_service import init_quantum_service

# Import avatar AI service
from services.avatar_ai_service import init_avatar_ai_service

# Import NEW cosmic reality services
from services.reality_fabric_service import init_reality_fabric_service
from services.omniversal_renderer_service import init_omniversal_renderer_service
from services.iching_service import init_iching_service
from services.vibranium_nft_service import init_vibranium_nft_service
from services.nexus_events_service import init_nexus_events_service
from services.quantum_immortality_service import init_quantum_immortality_service

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Enhanced configuration with validation
class Config:
    # Database configuration
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'vibecode_db')
    
    # Security configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'vibecode-secret-change-in-production')
    ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', 100))
    RATE_LIMIT_PERIOD = os.environ.get('RATE_LIMIT_PERIOD', '1/minute')
    
    # File limits
    MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', 5_000_000))  # 5MB
    MAX_FILES_PER_PROJECT = int(os.environ.get('MAX_FILES_PER_PROJECT', 1000))
    
    # AI configuration  
    AI_REQUEST_TIMEOUT = int(os.environ.get('AI_REQUEST_TIMEOUT', 30))
    MAX_AI_REQUESTS_PER_MINUTE = int(os.environ.get('MAX_AI_REQUESTS_PER_MINUTE', 20))
    
    # Environment
    ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
    DEBUG = os.environ.get('DEBUG', 'true').lower() == 'true'

config = Config()

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO if not config.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# MongoDB connection with retry logic
class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.connected = False
        
    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(
                config.MONGO_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                maxPoolSize=10
            )
            
            # Test connection
            await self.client.admin.command('ping')
            self.db = self.client[config.DB_NAME]
            self.connected = True
            logger.info(f"Connected to MongoDB: {config.DB_NAME}")
            
            # Create indexes for better performance
            await self.create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.connected = False
            raise
            
    async def create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Project indexes
            await self.db.projects.create_index("id")
            await self.db.projects.create_index([("created_at", -1)])
            
            # File indexes
            await self.db.files.create_index("id")
            await self.db.files.create_index("project_id")
            await self.db.files.create_index([("project_id", 1), ("parent_id", 1)])
            await self.db.files.create_index([("updated_at", -1)])
            
            # Chat message indexes
            await self.db.chat_messages.create_index("session_id")
            await self.db.chat_messages.create_index([("timestamp", -1)])
            
            # Cosmic indexes
            await self.db.code_evolutions.create_index("user_id")
            await self.db.karma_records.create_index("user_id")
            await self.db.archaeology_sessions.create_index("user_id")
            await self.db.code_immortality.create_index("project_id")
            await self.db.nexus_events.create_index("timestamp")
            await self.db.cosmic_debug_sessions.create_index("user_id")
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning(f"Failed to create indexes: {e}")
            
    async def disconnect(self):
        if self.client:
            self.client.close()
            self.connected = False
            logger.info("Disconnected from MongoDB")

db_manager = DatabaseManager()

# Create the main app with enhanced configuration
app = FastAPI(
    title="VibeCode Cosmic API",
    description="AI-Powered IDE with Cosmic-Level Features & Reality Engine",
    version="2.0.cosmic",
    docs_url="/docs" if config.DEBUG else None,
    redoc_url="/redoc" if config.DEBUG else None,
)

# Create API router
api_router = APIRouter(prefix="/api/v1")

# Enhanced middleware stack
app.add_middleware(GZipMiddleware, minimum_size=1000)

if config.ENVIRONMENT == 'production':
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=config.ALLOWED_HOSTS
    )

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# === ENHANCED MODELS WITH VALIDATION ===

class FileNode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern="^(file|folder)$")
    content: Optional[str] = Field(None, max_length=config.MAX_FILE_SIZE)
    parent_id: Optional[str] = None
    project_id: str
    size: int = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('name')
    def validate_name(cls, v):
        # Prevent path traversal and invalid characters
        invalid_chars = ['/', '\\', '..', '<', '>', ':', '"', '|', '?', '*']
        if any(char in v for char in invalid_chars):
            raise ValueError('Invalid characters in file name')
        return v.strip()
    
    @validator('content')
    def validate_content_size(cls, v, values):
        if v and values.get('type') == 'file' and len(v) > config.MAX_FILE_SIZE:
            raise ValueError(f'File content too large. Maximum size: {config.MAX_FILE_SIZE} bytes')
        return v

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    file_count: int = Field(default=0, ge=0)
    total_size: int = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('name')
    def validate_project_name(cls, v):
        if not v.strip():
            raise ValueError('Project name cannot be empty')
        # Prevent special characters that could cause issues
        invalid_chars = ['<', '>', ':', '"', '|', '?', '*', '/', '\\']
        if any(char in v for char in invalid_chars):
            raise ValueError('Invalid characters in project name')
        return v.strip()

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1, max_length=10000)
    response: Optional[str] = Field(None, max_length=50000)
    model_used: str = Field(default="meta-llama/llama-4-maverick")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('message', 'response')
    def validate_message_content(cls, v):
        if v and len(v.strip()) == 0:
            raise ValueError('Message content cannot be empty')
        return v

class CreateProjectRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class CreateFileRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern="^(file|folder)$")
    parent_id: Optional[str] = None
    content: Optional[str] = Field("", max_length=config.MAX_FILE_SIZE)

class UpdateFileRequest(BaseModel):
    content: str = Field(..., max_length=config.MAX_FILE_SIZE)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    session_id: str = Field(..., min_length=1)
    context: Optional[Dict[str, Any]] = None

# === DEPENDENCY INJECTION ===

async def get_database():
    """Dependency to get database connection"""
    if not db_manager.connected:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    return db_manager.db

# === ENHANCED PUTER.JS AI ENGINE ===

class PuterAIEngine:
    """
    Enhanced AI engine with better error handling and monitoring
    """
    
    def __init__(self):
        self.request_counts = {}  # Simple in-memory rate limiting
        logger.info("Enhanced Puter.js AI Engine initialized")
        
    def _check_rate_limit(self, session_id: str) -> bool:
        """Simple rate limiting for AI requests"""
        now = time.time()
        minute_ago = now - 60
        
        if session_id not in self.request_counts:
            self.request_counts[session_id] = []
            
        # Clean old requests
        self.request_counts[session_id] = [
            req_time for req_time in self.request_counts[session_id] 
            if req_time > minute_ago
        ]
        
        # Check if under limit
        if len(self.request_counts[session_id]) >= config.MAX_AI_REQUESTS_PER_MINUTE:
            return False
            
        self.request_counts[session_id].append(now)
        return True
        
    async def save_chat_message(self, session_id: str, message: str, response: str, model_used: str = "meta-llama/llama-4-maverick") -> ChatMessage:
        """Save chat message to database with enhanced validation"""
        try:
            chat_message = ChatMessage(
                session_id=session_id,
                message=message,
                response=response,
                model_used=model_used
            )
            await db_manager.db.chat_messages.insert_one(chat_message.dict())
            return chat_message
        except Exception as e:
            logger.error(f"Failed to save chat message: {e}")
            raise HTTPException(status_code=500, detail="Failed to save chat message")
    
    async def get_chat_history(self, session_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get chat history with limit and proper error handling"""
        try:
            messages = await db_manager.db.chat_messages.find(
                {"session_id": session_id}
            ).sort("timestamp", -1).limit(limit).to_list(limit)
            
            return [ChatMessage(**msg) for msg in reversed(messages)]
        except Exception as e:
            logger.error(f"Failed to get chat history: {e}")
            return []
    
    async def chat_with_ai(self, message: str, context: Optional[Dict] = None, session_id: str = None) -> dict:
        """Enhanced AI chat with rate limiting and error handling"""
        if session_id and not self._check_rate_limit(session_id):
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded. Maximum {config.MAX_AI_REQUESTS_PER_MINUTE} requests per minute."
            )
        
        try:
            response = "This endpoint now provides enhanced message routing to frontend Puter.js for unlimited free AI access with advanced cosmic-level features and reality modification capabilities."
            return {
                "response": response,
                "session_id": session_id,
                "model": "meta-llama/llama-4-maverick",
                "frontend_processing": True,
                "cosmic_mode": True
            }
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

# Initialize the enhanced AI engine
ai_engine = PuterAIEngine()

# === ENHANCED API ENDPOINTS ===

# Health check with detailed status
@api_router.get("/health")
@limiter.limit("100/minute")
async def health_check(request: Request, db = Depends(get_database)):
    try:
        # Test database connection
        await db.command('ping')
        db_status = "healthy"
    except:
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.cosmic",
        "database": db_status,
        "ai_engine": "operational",
        "cosmic_engine": "reality_stable",
        "environment": config.ENVIRONMENT,
        "features": ["AI Integration", "Real-time Collaboration", "Cosmic Reality Engine", "Advanced Security"]
    }

@api_router.get("/")
async def root():
    return {
        "message": "VibeCode Cosmic API v2.0 - Reality Engine Online!", 
        "status": "healthy",
        "version": "2.0.cosmic",
        "features": [
            "AI Integration", 
            "Real-time Collaboration", 
            "Cosmic Reality Engine",
            "Code Evolution",
            "Karma Reincarnation",
            "Digital Archaeology",
            "VIBE Token Economy",
            "Sacred Geometry UI",
            "Avatar Pantheon",
            "Quantum Vibe Shifting",
            "Neuro-Sync BCI",
            "Parallel Universe Debugging",
            "Emotional Compiler",
            "Haptic Feedback"
        ]
    }

# === ENHANCED PROJECT MANAGEMENT ===

@api_router.post("/projects", response_model=Project)
@limiter.limit("10/minute")
async def create_project(request: Request, project_request: CreateProjectRequest, db = Depends(get_database)):
    try:
        project = Project(name=project_request.name, description=project_request.description)
        
        # Check if project name already exists for basic collision detection
        existing = await db.projects.find_one({"name": project.name})
        if existing:
            raise HTTPException(status_code=409, detail="Project with this name already exists")
            
        await db.projects.insert_one(project.dict())
        
        # Create root folder for the project
        root_folder = FileNode(
            name=project.name,
            type="folder",
            project_id=project.id,
            parent_id=None
        )
        await db.files.insert_one(root_folder.dict())
        
        logger.info(f"Created project: {project.name} ({project.id})")
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create project: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project")

@api_router.get("/projects", response_model=List[Project])
@limiter.limit("200/minute")
async def get_projects(request: Request, skip: int = 0, limit: int = 50, db = Depends(get_database)):
    try:
        # Add pagination and sorting
        projects = await db.projects.find().sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
        result = []
        
        for project_data in projects:
            # Calculate file count and total size
            file_stats = await db.files.aggregate([
                {"$match": {"project_id": project_data["id"]}},
                {"$group": {
                    "_id": None,
                    "count": {"$sum": 1},
                    "total_size": {"$sum": {"$ifNull": ["$size", 0]}}
                }}
            ]).to_list(1)
            
            if file_stats:
                project_data["file_count"] = file_stats[0]["count"]
                project_data["total_size"] = file_stats[0]["total_size"]
            
            result.append(Project(**project_data))
            
        return result
    except Exception as e:
        logger.error(f"Failed to get projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve projects")

@api_router.get("/projects/{project_id}", response_model=Project)
@limiter.limit("60/minute")
async def get_project(request: Request, project_id: str, db = Depends(get_database)):
    try:
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        # Add file statistics
        file_stats = await db.files.aggregate([
            {"$match": {"project_id": project_id}},
            {"$group": {
                "_id": None,
                "count": {"$sum": 1},
                "total_size": {"$sum": {"$ifNull": ["$size", 0]}}
            }}
        ]).to_list(1)
        
        if file_stats:
            project["file_count"] = file_stats[0]["count"]
            project["total_size"] = file_stats[0]["total_size"]
            
        return Project(**project)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve project")

@api_router.delete("/projects/{project_id}")
@limiter.limit("5/minute")
async def delete_project(request: Request, project_id: str, db = Depends(get_database)):
    try:
        # Check if project exists
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete project and all associated files
        files_deleted = await db.files.delete_many({"project_id": project_id})
        project_deleted = await db.projects.delete_one({"id": project_id})
        
        if project_deleted.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
            
        logger.info(f"Deleted project {project_id} with {files_deleted.deleted_count} files")
        return {
            "message": "Project deleted successfully",
            "files_deleted": files_deleted.deleted_count
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete project")

# === ENHANCED FILE MANAGEMENT ===

@api_router.get("/projects/{project_id}/files", response_model=List[FileNode])
@limiter.limit("60/minute")
async def get_project_files(request: Request, project_id: str, db = Depends(get_database)):
    try:
        # Verify project exists
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        files = await db.files.find({"project_id": project_id}).sort("name", 1).to_list(1000)
        return [FileNode(**file) for file in files]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get files for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve files")

@api_router.post("/projects/{project_id}/files", response_model=FileNode)
@limiter.limit("30/minute")
async def create_file(request: Request, project_id: str, file_request: CreateFileRequest, db = Depends(get_database)):
    try:
        # Verify project exists
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check file count limit
        file_count = await db.files.count_documents({"project_id": project_id})
        if file_count >= config.MAX_FILES_PER_PROJECT:
            raise HTTPException(
                status_code=413, 
                detail=f"Maximum files per project exceeded ({config.MAX_FILES_PER_PROJECT})"
            )
        
        # Verify parent folder exists if specified
        if file_request.parent_id:
            parent = await db.files.find_one({"id": file_request.parent_id, "type": "folder"})
            if not parent:
                raise HTTPException(status_code=404, detail="Parent folder not found")
        
        # Check for duplicate names in the same directory
        existing = await db.files.find_one({
            "project_id": project_id,
            "parent_id": file_request.parent_id,
            "name": file_request.name
        })
        if existing:
            raise HTTPException(status_code=409, detail="File with this name already exists in this location")
        
        file_size = len(file_request.content or "") if file_request.type == "file" else 0
        
        file_node = FileNode(
            name=file_request.name,
            type=file_request.type,
            content=file_request.content if file_request.type == "file" else None,
            parent_id=file_request.parent_id,
            project_id=project_id,
            size=file_size
        )
        
        await db.files.insert_one(file_node.dict())
        
        # Update project statistics
        await db.projects.update_one(
            {"id": project_id},
            {
                "$inc": {"file_count": 1, "total_size": file_size},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        logger.info(f"Created {file_request.type}: {file_request.name} in project {project_id}")
        return file_node
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create file in project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create file")

@api_router.get("/files/{file_id}", response_model=FileNode)
@limiter.limit("100/minute")
async def get_file(request: Request, file_id: str, db = Depends(get_database)):
    try:
        file = await db.files.find_one({"id": file_id})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        return FileNode(**file)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get file {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve file")

@api_router.put("/files/{file_id}")
@limiter.limit("30/minute")
async def update_file(request: Request, file_id: str, update_request: UpdateFileRequest, db = Depends(get_database)):
    try:
        # Get existing file
        file = await db.files.find_one({"id": file_id})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        if file["type"] != "file":
            raise HTTPException(status_code=400, detail="Cannot update content of a folder")
        
        old_size = file.get("size", 0)
        new_size = len(update_request.content)
        size_diff = new_size - old_size
        
        result = await db.files.update_one(
            {"id": file_id},
            {
                "$set": {
                    "content": update_request.content,
                    "size": new_size,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Update project size
        await db.projects.update_one(
            {"id": file["project_id"]},
            {
                "$inc": {"total_size": size_diff},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        logger.info(f"Updated file {file_id} (size change: {size_diff} bytes)")
        return {"message": "File updated successfully", "size": new_size}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update file {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update file")

@api_router.delete("/files/{file_id}")
@limiter.limit("20/minute")  
async def delete_file(request: Request, file_id: str, db = Depends(get_database)):
    try:
        # Get file details
        file = await db.files.find_one({"id": file_id})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        files_deleted = 1
        total_size_deleted = file.get("size", 0)
        
        if file["type"] == "folder":
            # Delete all children recursively
            child_files = await db.files.find({"parent_id": file_id}).to_list(None)
            for child in child_files:
                total_size_deleted += child.get("size", 0)
                files_deleted += 1
                
            await db.files.delete_many({"parent_id": file_id})
        
        await db.files.delete_one({"id": file_id})
        
        # Update project statistics
        await db.projects.update_one(
            {"id": file["project_id"]},
            {
                "$inc": {
                    "file_count": -files_deleted,
                    "total_size": -total_size_deleted
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        logger.info(f"Deleted {file['type']} {file_id} and {files_deleted - 1} children")
        return {
            "message": "File deleted successfully",
            "files_deleted": files_deleted,
            "size_freed": total_size_deleted
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete file {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")

# === ENHANCED AI CHAT ENDPOINTS ===

@api_router.post("/ai/chat")
@limiter.limit("20/minute")
async def chat_with_ai_endpoint(request: Request, chat_request: ChatRequest, db = Depends(get_database)):
    try:
        result = await ai_engine.chat_with_ai(
            chat_request.message,
            chat_request.context,
            chat_request.session_id
        )
        
        # Save chat message to database
        await ai_engine.save_chat_message(
            chat_request.session_id,
            chat_request.message,
            result["response"],
            result["model"]
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat service unavailable")

@api_router.get("/ai/chat/{session_id}")
@limiter.limit("30/minute")
async def get_chat_history(request: Request, session_id: str, limit: int = 50, db = Depends(get_database)):
    try:
        messages = await ai_engine.get_chat_history(session_id, limit)
        return {"messages": messages, "count": len(messages)}
    except Exception as e:
        logger.error(f"Chat history error: {e}")
        raise HTTPException(status_code=500, detail="Chat history service unavailable")

# === ENHANCED WEBSOCKET ===

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_stats = {"total": 0, "active": 0}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.connection_stats["total"] += 1
        self.connection_stats["active"] = len(self.active_connections)
        logger.info(f"WebSocket connected: {session_id} (Active: {self.connection_stats['active']})")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            self.connection_stats["active"] = len(self.active_connections)
            logger.info(f"WebSocket disconnected: {session_id} (Active: {self.connection_stats['active']})")

    async def send_personal_message(self, message: str, session_id: str):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(message)
                return True
            except Exception as e:
                logger.error(f"Error sending message to {session_id}: {e}")
                self.disconnect(session_id)
                return False
        return False

manager = ConnectionManager()

@app.websocket("/ws/ai/{session_id}")
async def websocket_ai_chat(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    
    try:
        # Send enhanced connection confirmation with cosmic features
        await manager.send_personal_message(
            json.dumps({
                "type": "connection_established",
                "message": "Cosmic WebSocket connection established with reality engine access",
                "session_id": session_id,
                "status": "connected",
                "features": [
                    "rate_limiting", 
                    "error_recovery", 
                    "enhanced_logging",
                    "cosmic_reality_engine",
                    "vibe_token_integration",
                    "quantum_communication"
                ],
                "ai_model": "meta-llama/llama-4-maverick",
                "cosmic_mode": True,
                "reality_version": "2.0.cosmic"
            }),
            session_id
        )
        
        while True:
            try:
                # Enhanced timeout and error handling
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                
                try:
                    message_data = json.loads(data)
                    message_type = message_data.get("type", "chat")
                    
                    if message_type == "ping":
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "pong",
                                "timestamp": datetime.utcnow().isoformat(),
                                "server_time": time.time(),
                                "cosmic_status": "reality_stable"
                            }),
                            session_id
                        )
                    elif message_type == "chat":
                        user_message = message_data.get("message", "")
                        if user_message:
                            # Enhanced AI response with cosmic features
                            response = {
                                "type": "ai_response",
                                "message": "Enhanced message processing with cosmic-grade error handling, reality manipulation, and unlimited AI access via Puter.js. The reality engine is operational.",
                                "session_id": session_id,
                                "frontend_ai": True,
                                "cosmic_mode": True,
                                "timestamp": datetime.utcnow().isoformat(),
                                "model": "meta-llama/llama-4-maverick",
                                "reality_coherence": "99.7%"
                            }
                            
                            await ai_engine.save_chat_message(session_id, user_message, response["message"])
                            await manager.send_personal_message(json.dumps(response), session_id)
                    elif message_type == "cosmic_command":
                        command = message_data.get("command", "")
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "cosmic_response",
                                "command": command,
                                "message": f"Cosmic command '{command}' processed by reality engine",
                                "session_id": session_id,
                                "cosmic_status": "command_executed"
                            }),
                            session_id
                        )
                    else:
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "error",
                                "message": f"Unknown message type: {message_type}",
                                "session_id": session_id
                            }),
                            session_id
                        )
                        
                except json.JSONDecodeError:
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "error",
                            "message": "Invalid JSON format",
                            "session_id": session_id
                        }),
                        session_id
                    )
                except Exception as e:
                    logger.error(f"Error processing WebSocket message: {e}")
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "error",
                            "message": "Error processing message",
                            "session_id": session_id,
                            "error_type": type(e).__name__
                        }),
                        session_id
                    )
                    
            except asyncio.TimeoutError:
                # Send cosmic keepalive
                await manager.send_personal_message(
                    json.dumps({
                        "type": "keepalive",
                        "message": "Cosmic connection active",
                        "timestamp": datetime.utcnow().isoformat(),
                        "reality_status": "stable",
                        "quantum_coherence": "optimal"
                    }),
                    session_id
                )
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected normally: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
    finally:
        manager.disconnect(session_id)

# === STARTUP AND SHUTDOWN EVENTS ===

@app.on_event("startup")
async def startup_event():
    """Initialize database connection and setup"""
    logger.info("Starting VibeCode Cosmic API v2.0...")
    await db_manager.connect()
    
    # Initialize collaboration manager
    init_collaboration_manager(db_manager.db)
    logger.info("Collaboration manager initialized")
    
    # Initialize cosmic service
    init_cosmic_service(db_manager)
    logger.info("Cosmic service initialized - Reality engine online!")
    
    # Initialize neuro sync service
    init_neuro_sync_service(db_manager)
    logger.info("Neuro-Sync service initialized - BCI capabilities ready!")
    
    # Initialize quantum service
    init_quantum_service(db_manager)
    logger.info("Quantum service initialized - Multiverse access enabled!")
    
    # Initialize avatar AI service
    init_avatar_ai_service(db_manager)
    logger.info("Avatar AI service initialized - Digital twins ready!")
    
    # Initialize NEW cosmic reality services
    init_reality_fabric_service(db_manager)
    logger.info("Reality Fabric service initialized - Spacetime manipulation ready!")
    
    init_omniversal_renderer_service(db_manager)
    logger.info("Omniversal Renderer service initialized - Multidimensional reality ready!")
    
    init_iching_service(db_manager)
    logger.info("I Ching service initialized - Ancient wisdom for modern debugging!")
    
    init_vibranium_nft_service(db_manager)
    logger.info("Vibranium NFT service initialized - Cosmic blockchain economy ready!")
    
    init_nexus_events_service(db_manager)
    logger.info("Nexus Events service initialized - Cross-platform interventions ready!")
    
    init_quantum_immortality_service(db_manager)
    logger.info("Quantum Immortality service initialized - Code preservation eternal!")
    
    logger.info("🌌⚛️🧠🎭💎🌉♾️ ALL COSMIC-LEVEL DIFFERENTIATORS ONLINE! 🌌⚛️🧠🎭💎🌉♾️")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources"""
    logger.info("Shutting down VibeCode Cosmic API...")
    await db_manager.disconnect()
    logger.info("VibeCode Cosmic API shutdown complete")

# Include the API router
app.include_router(api_router)

# Include collaboration router
app.include_router(collaboration_router)

# Include cosmic router
app.include_router(cosmic_router)

# Include neuro router
app.include_router(neuro_router)

# Include quantum router
app.include_router(quantum_router)

# Include NEW cosmic reality routers
app.include_router(reality_fabric_router)
app.include_router(omniversal_router)
app.include_router(iching_router)
app.include_router(vibranium_router)
app.include_router(nexus_router)
app.include_router(immortality_router)

# Add a legacy API route for backward compatibility
@app.get("/api/")
async def legacy_root():
    return {
        "message": "VibeCode Cosmic API v3.0 - Ultimate Reality Engine Online!", 
        "status": "transcendent",
        "version": "3.0.cosmic-singularity",
        "features": [
            "🤖 AI Integration", 
            "👥 Real-time Collaboration", 
            "🌌 Cosmic Reality Engine", 
            "🔒 Advanced Security",
            "🧬 Code Evolution",
            "☯️ Karma Reincarnation",
            "🏛️ Digital Archaeology",
            "💎 VIBE Token Economy",
            "🧠 Neuro-Sync Engine (BCI)",
            "⚛️ Quantum Vibe Shifting", 
            "⏰ Reality Fabric (Time Control)",
            "🌐 Omniversal Renderer (3D/AR/Audio)",
            "🔮 I Ching Error Interpretation", 
            "💎 Vibranium NFT Marketplace",
            "🌉 Nexus Cross-Platform Events",
            "♾️ Quantum Immortality System",
            "🕉️ Trinity AI Altar",
            "📊 Divine Bio-Metrics",
            "🎭 Avatar Pantheon",
            "🌊 AETHERFLOW Interface"
        ],
        "cosmic_level": "DEITY MODE",
        "dimensions_accessible": 5,
        "reality_coherence": 0.99
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001,
        log_level="info",
        access_log=True
    )