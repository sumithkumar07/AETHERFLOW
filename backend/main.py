from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from typing import List, Optional
import json

# Import our modules
from models.database import init_db, get_database
from models.user import User, UserCreate, UserLogin
from models.project import Project, ProjectCreate
from models.conversation import Conversation, Message
from routes.auth import router as auth_router
from routes.ai import router as ai_router
from routes.projects import router as projects_router
from routes.templates import router as templates_router
from routes.integrations import router as integrations_router
from routes.agents import router as agents_router
from routes.enterprise import router as enterprise_router
from services.ai_service import AIService
from services.enhanced_ai_service import EnhancedAIService
from services.websocket_manager import ConnectionManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="AI Code Studio API",
    description="Advanced AI-powered development platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
manager = ConnectionManager()
ai_service = AIService()
enhanced_ai_service = EnhancedAIService()

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(templates_router, prefix="/api/templates", tags=["Templates"])
app.include_router(integrations_router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(agents_router, prefix="/api/agents", tags=["Multi-Agent System"])
app.include_router(enterprise_router, prefix="/api/enterprise", tags=["Enterprise Features"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    try:
        await init_db()
        logger.info("Database initialized successfully")
        
        # Initialize AI services
        await ai_service.initialize()
        await enhanced_ai_service.initialize()
        logger.info("AI services initialized successfully")
        
        logger.info("🚀 AI Code Studio fully initialized!")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Application shutting down...")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Code Studio API",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "ai": "available",
            "websocket": "active"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# WebSocket endpoint for real-time features
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket connection for real-time collaboration"""
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data["type"] == "chat":
                # Process AI chat message
                response = await ai_service.process_message(
                    message_data["content"],
                    message_data.get("context", {})
                )
                await manager.send_personal_message(
                    json.dumps({
                        "type": "ai_response",
                        "content": response,
                        "timestamp": datetime.utcnow().isoformat()
                    }),
                    websocket
                )
            elif message_data["type"] == "collaboration":
                # Broadcast to other users in the same project
                await manager.broadcast_to_room(
                    message_data["project_id"],
                    json.dumps(message_data),
                    exclude=websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
        logger.info(f"Client {client_id} disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )