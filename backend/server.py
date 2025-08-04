from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

# Import our routes
from routes.auth import router as auth_router
from routes.projects import router as projects_router
from routes.ai import router as ai_router
from routes.templates import router as templates_router
from routes.integrations import router as integrations_router

# Import enhanced routes
from routes.enhanced_ai_workflows import router as enhanced_ai_router
from routes.real_time_collaboration import router as collaboration_router
from routes.enhanced_project_lifecycle import router as lifecycle_router
from routes.enhanced_features import router as enhanced_features_router
from routes.integrations_enhanced import router as integrations_enhanced_router
from routes.subscription import router as subscription_router

from models.database import init_db

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Aether AI API",
    description="Next-generation AI-powered development platform with advanced multi-agent intelligence",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    try:
        await init_db()
        logger.info("✅ Database initialized successfully")
        
        # Create demo user if not exists
        from routes.auth import create_demo_user
        await create_demo_user()
        
        # Initialize AI services
        from services.ai_service import AIService
        ai_service = AIService()
        await ai_service.initialize()
        logger.info("🤖 AI services initialized")
        
        logger.info("🎉 Aether AI API is ready!")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Aether AI shutting down...")

# Include routers with /api prefix
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(templates_router, prefix="/api/templates", tags=["Templates"])
app.include_router(integrations_router, prefix="/api/integrations", tags=["Integrations"])

# Include enhanced routers
app.include_router(enhanced_ai_router, prefix="/api/ai/enhanced", tags=["Enhanced AI Workflows"])
app.include_router(collaboration_router, prefix="/api/collaboration", tags=["Real-time Collaboration"])
app.include_router(lifecycle_router, prefix="/api/projects", tags=["Enhanced Project Lifecycle"])
app.include_router(enhanced_features_router, prefix="/api/enhanced", tags=["Enhanced Features"])
app.include_router(integrations_enhanced_router, prefix="/api/integrations/enhanced", tags=["Enhanced Integrations"])
app.include_router(subscription_router, prefix="/api/subscription", tags=["Subscription Management"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Aether AI API",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "description": "Next-generation AI development platform"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "ai": "available",
            "multimodal": "ready",
            "voice": "enabled"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )