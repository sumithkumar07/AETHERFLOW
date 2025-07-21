from fastapi import FastAPI
from routes.ai_routes import router as ai_router, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import os
import logging
import uuid
import json
from datetime import datetime
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="VibeCode API", description="AI-Powered IDE with Puter.js")

# Create API router
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# === MODELS ===

class FileNode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # 'file' or 'folder'
    content: Optional[str] = None  # Only for files
    parent_id: Optional[str] = None
    project_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None

class CreateFileRequest(BaseModel):
    name: str
    type: str
    parent_id: Optional[str] = None
    content: Optional[str] = ""

class UpdateFileRequest(BaseModel):
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    context: Optional[Dict[str, Any]] = None

# === SIMPLE PUTER.JS INTEGRATION ===

class PuterAIEngine:
    """
    Simple AI engine that works with frontend Puter.js integration
    Backend now mainly handles data persistence while frontend does AI processing
    """
    
    def __init__(self):
        logger.info("Puter.js AI Engine initialized - Frontend handles AI processing")
        
    async def save_chat_message(self, session_id: str, message: str, response: str) -> ChatMessage:
        """Save chat message to database"""
        chat_message = ChatMessage(
            session_id=session_id,
            message=message,
            response=response
        )
        await db.chat_messages.insert_one(chat_message.dict())
        return chat_message
    
    async def get_chat_history(self, session_id: str) -> List[ChatMessage]:
        """Get chat history from database"""
        messages = await db.chat_messages.find({"session_id": session_id}).to_list(100)
        return [ChatMessage(**msg) for msg in messages]
    
    async def chat_with_ai(self, message: str, context: Optional[Dict] = None) -> str:
        """Simple fallback chat - main AI processing happens in frontend"""
        return f"Message received: {message}. Please use the frontend AI interface for full AI capabilities."
    
    async def generate_code(self, prompt: str, model: str = None) -> str:
        """Simple fallback - main code generation happens in frontend"""
        return f"Code generation request received: {prompt}. Please use the frontend AI interface for code generation."

# Initialize the Puter.js AI engine
ai_engine = PuterAIEngine()

# === API ENDPOINTS ===

# Health check
@api_router.get("/")
async def root():
    return {"message": "VibeCode API is running!", "status": "healthy"}

# === PROJECT MANAGEMENT ===

@api_router.post("/projects", response_model=Project)
async def create_project(request: CreateProjectRequest):
    project = Project(name=request.name, description=request.description)
    await db.projects.insert_one(project.dict())
    
    # Create root folder for the project
    root_folder = FileNode(
        name=project.name,
        type="folder",
        project_id=project.id,
        parent_id=None
    )
    await db.files.insert_one(root_folder.dict())
    
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find().to_list(100)
    return [Project(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    # Delete project and all associated files
    await db.projects.delete_one({"id": project_id})
    await db.files.delete_many({"project_id": project_id})
    return {"message": "Project deleted successfully"}

# === FILE MANAGEMENT ===

@api_router.get("/projects/{project_id}/files", response_model=List[FileNode])
async def get_project_files(project_id: str):
    files = await db.files.find({"project_id": project_id}).to_list(1000)
    return [FileNode(**file) for file in files]

@api_router.post("/projects/{project_id}/files", response_model=FileNode)
async def create_file(project_id: str, request: CreateFileRequest):
    file_node = FileNode(
        name=request.name,
        type=request.type,
        content=request.content if request.type == "file" else None,
        parent_id=request.parent_id,
        project_id=project_id
    )
    await db.files.insert_one(file_node.dict())
    return file_node

@api_router.get("/files/{file_id}", response_model=FileNode)
async def get_file(file_id: str):
    file = await db.files.find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return FileNode(**file)

@api_router.put("/files/{file_id}")
async def update_file(file_id: str, request: UpdateFileRequest):
    result = await db.files.update_one(
        {"id": file_id},
        {"$set": {"content": request.content, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File updated successfully"}

@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    # Delete file and all child files if it's a folder
    file = await db.files.find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if file["type"] == "folder":
        # Delete all children recursively
        await db.files.delete_many({"parent_id": file_id})
    
    await db.files.delete_one({"id": file_id})
    return {"message": "File deleted successfully"}

# === AI CHAT ENDPOINTS ===

@api_router.post("/ai/chat")
async def chat_with_ai_endpoint(request: ChatRequest):
    try:
        # Simple fallback message - AI processing handled by frontend Puter.js
        response = "This endpoint is now handled by Puter.js on the frontend for unlimited free AI access. Please use the frontend AI interface."
        
        # Save chat message to database
        await ai_engine.save_chat_message(request.session_id, request.message, response)
        
        return {"response": response, "session_id": request.session_id}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat service unavailable")

@api_router.get("/ai/chat/{session_id}")
async def get_chat_history(session_id: str):
    try:
        messages = await ai_engine.get_chat_history(session_id)
        return messages
    except Exception as e:
        logger.error(f"Chat history error: {e}")
        raise HTTPException(status_code=500, detail="Chat history service unavailable")

@api_router.post("/ai/generate-code")
async def generate_code_endpoint(request: ChatRequest):
    try:
        # Frontend Puter.js handles code generation
        code = "// Code generation is now handled by Puter.js in the frontend for better performance and unlimited access"
        return {"generated_code": code, "session_id": request.session_id}
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail="Code generation service unavailable")

# === SIMPLE AI ENDPOINTS ===
# Advanced AI features now handled by frontend Puter.js integration

# === WEBSOCKET FOR REAL-TIME AI ===

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/ai/{session_id}")
async def websocket_ai_chat(websocket: WebSocket, session_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process AI request
            response = await ai_engine.chat_with_ai(
                message_data.get("message", ""),
                message_data.get("context")
            )
            
            # Send response back
            await manager.send_personal_message(
                json.dumps({
                    "type": "ai_response",
                    "message": response,
                    "session_id": session_id
                }),
                websocket
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include the API router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)