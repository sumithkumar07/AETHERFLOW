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
from models.database import init_db

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="AI Tempo API",
    description="AI-powered development platform",
    version="1.0.0"
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
        
        logger.info("🎉 AI Tempo API is ready!")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Application shutting down...")

# Include routers with /api prefix
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(templates_router, prefix="/api/templates", tags=["Templates"])
app.include_router(integrations_router, prefix="/api/integrations", tags=["Integrations"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Tempo API",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "ai": "available"
        },
        "timestamp": datetime.utcnow().isoformat()
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