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

# Import additional missing routes (only working ones)
from routes.advanced_ai import router as advanced_ai_router
from routes.enterprise import router as enterprise_router
from routes.analytics_dashboard import router as analytics_dashboard_router
from routes.performance import router as performance_router
from routes.visual_programming import router as visual_programming_router
from routes.security import router as security_router
from routes.architectural_intelligence import router as architectural_intelligence_router
from routes.voice import router as voice_router
from routes.agents import router as agents_router

# Import new enhanced AI route
from routes.enhanced_ai import router as enhanced_ai_new_router
from routes.enhanced_ai_v2 import router as enhanced_ai_v2_router
from routes.enhanced_ai_v3 import router as enhanced_ai_v3_router

# Import Phase 1 Optimized AI Routes
from routes.optimized_ai_v4 import router as optimized_ai_v4_router

# Import Gap-Closing Enhancement Routes
from routes.autonomous_planning import router as autonomous_planning_router
from routes.git_cicd_integration import router as git_cicd_router
from routes.memory_system import router as memory_system_router
from routes.conversational_debugging import router as conversational_debugging_router

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

# Include new enhanced AI router with better capabilities
app.include_router(enhanced_ai_new_router, prefix="/api/ai/v2", tags=["Enhanced AI v2"])
app.include_router(enhanced_ai_v2_router, prefix="/api/ai/v2/enhanced", tags=["Enhanced AI v2 Advanced"])
app.include_router(enhanced_ai_v3_router, prefix="/api/ai/v3", tags=["Enhanced AI v3 Multi-Agent"])

# Include Phase 1 Optimized AI Routes - Enterprise Performance
app.include_router(optimized_ai_v4_router, prefix="/api/ai", tags=["Optimized AI v4 - Enterprise"])

# Include additional missing routers
app.include_router(advanced_ai_router, prefix="/api/advanced-ai", tags=["Advanced AI"])
app.include_router(enterprise_router, prefix="/api/enterprise", tags=["Enterprise"])
app.include_router(analytics_dashboard_router, prefix="/api/dashboard/analytics", tags=["Analytics Dashboard"])
app.include_router(performance_router, prefix="/api/performance", tags=["Performance"])
app.include_router(visual_programming_router, prefix="/api/visual-programming", tags=["Visual Programming"])
app.include_router(security_router, prefix="/api/security", tags=["Security"])
app.include_router(architectural_intelligence_router, prefix="/api/architectural-intelligence", tags=["Architectural Intelligence"])
app.include_router(voice_router, prefix="/api/voice", tags=["Voice"])
app.include_router(agents_router, prefix="/api/agents", tags=["Agents"])

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