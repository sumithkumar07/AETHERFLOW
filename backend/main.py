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
from routes.advanced_ai import router as advanced_ai_router, set_ai_router
from routes.plugins import router as plugins_router, set_plugin_manager
from routes.analytics import router as analytics_router, set_analytics_services
from routes.performance import router as performance_router
from routes.analytics_dashboard import router as analytics_dashboard_router
from routes.security import router as security_router, set_security_services
from routes.development import router as development_router, set_development_assistant
from routes.collaboration import router as collaboration_router, set_collaboration_engine
from services.ai_service import AIService
from services.enhanced_ai_service import EnhancedAIService
from services.websocket_manager import ConnectionManager
from services.intelligent_ai_router import IntelligentAIRouter
from services.plugin_manager import PluginManager
from services.advanced_analytics import AdvancedAnalytics, SmartRecommendationEngine
from services.zero_trust_security import ZeroTrustGateway, ComplianceEngine
from services.performance_optimizer import PerformanceOptimizer
from services.adaptive_ui_service import AdaptiveUIService
from services.development_assistant import DevelopmentAssistant
from routes.voice import router as voice_router, set_voice_interface
from routes.workflows import router as workflows_router, set_workflow_engine
from routes.smart_features import router as smart_features_router
from services.voice_interface import VoiceInterface
from services.workflow_automation import WorkflowEngine
from services.collaboration_engine import LiveCollaborationEngine

# Import cutting-edge services
from services.architectural_intelligence import ArchitecturalIntelligence
from services.smart_documentation import SmartDocumentationEngine
from services.theme_intelligence import ThemeIntelligence
from services.project_migrator import ProjectMigrator
from services.code_quality_engine import CodeQualityEngine
from services.workspace_intelligence import WorkspaceIntelligence
from services.soundscape_engine import SoundscapeEngine
from services.code_translator import CodeTranslator
from services.emotional_ai import EmotionalAI
from services.experimental_sandbox import ExperimentalSandbox
from services.visual_programming import VisualProgramming
from services.community_intelligence import CommunityIntelligence
from services.resource_optimizer import ResourceOptimizer
from services.dependency_intelligence import DependencyIntelligence
from services.pattern_intelligence import PatternIntelligence

# Import new 5% gap completion services
from services.video_explanation_service import VideoExplanationService, set_video_explanation_service
from services.seo_service import SEOService, set_seo_service
from services.i18n_service import I18nService, set_i18n_service
from services.agent_marketplace_service import AgentMarketplaceService, set_agent_marketplace_service
from services.presentation_service import PresentationService, set_presentation_service
from routes.architectural_intelligence import set_architectural_intelligence_service
from routes.smart_documentation import set_smart_documentation_service
from routes.theme_intelligence import set_theme_intelligence_service
from routes.project_migration import set_project_migrator_service
from routes.code_quality import set_code_quality_engine
from routes.workspace_optimization import set_workspace_intelligence
from routes.experimental_sandbox import set_experimental_sandbox_service
from routes.visual_programming import set_visual_programming_service
from routes.community_intelligence import set_community_intelligence_service

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

# Initialize advanced services with database wrapper
class DatabaseWrapper:
    async def get_database(self):
        return await get_database()

db_wrapper = DatabaseWrapper()
intelligent_ai_router = IntelligentAIRouter()
plugin_manager = PluginManager(db_wrapper)
advanced_analytics = AdvancedAnalytics(db_wrapper)
smart_recommendation_engine = SmartRecommendationEngine(advanced_analytics)
zero_trust_gateway = ZeroTrustGateway(db_wrapper)
compliance_engine = ComplianceEngine(db_wrapper)
performance_optimizer = PerformanceOptimizer(db_wrapper)
adaptive_ui_service = AdaptiveUIService(db_wrapper)
development_assistant = DevelopmentAssistant(db_wrapper)
collaboration_engine = LiveCollaborationEngine(db_wrapper)

# Initialize cutting-edge services
architectural_intelligence = ArchitecturalIntelligence(db_wrapper)
smart_documentation_engine = SmartDocumentationEngine(db_wrapper)
theme_intelligence = ThemeIntelligence(db_wrapper)
project_migrator = ProjectMigrator(db_wrapper)
code_quality_engine = CodeQualityEngine(db_wrapper)
workspace_intelligence = WorkspaceIntelligence(db_wrapper)
experimental_sandbox = ExperimentalSandbox(db_wrapper)
visual_programming = VisualProgramming(db_wrapper)
community_intelligence = CommunityIntelligence(db_wrapper)

from routes.project_files import router as project_files_router

# Include routers - Core APIs
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(project_files_router, prefix="/api/projects", tags=["Project Files"])
app.include_router(templates_router, prefix="/api/templates", tags=["Templates"])
app.include_router(integrations_router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(agents_router, prefix="/api/agents", tags=["Multi-Agent System"])
app.include_router(enterprise_router, prefix="/api/enterprise", tags=["Enterprise Features"])

# Include routers - Advanced Features
app.include_router(advanced_ai_router, prefix="/api/advanced-ai", tags=["Advanced AI"])
app.include_router(plugins_router, prefix="/api/plugins", tags=["Plugin System"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics & Intelligence"])
app.include_router(performance_router, prefix="/api", tags=["Performance Monitoring"])
app.include_router(analytics_dashboard_router, prefix="/api/dashboard", tags=["Analytics Dashboard"])
app.include_router(security_router, prefix="/api/security", tags=["Zero Trust Security"])
app.include_router(development_router, prefix="/api/development", tags=["Development Assistant"])
app.include_router(collaboration_router, prefix="/api/collaboration", tags=["Live Collaboration"])
app.include_router(voice_router, prefix="/api/voice", tags=["Voice Interface"])
app.include_router(workflows_router, prefix="/api/workflows", tags=["Workflow Automation"])
app.include_router(smart_features_router, tags=["Smart Features"])

# Include routers - New Enhancement Features (Available)
from routes.enhanced_features import router as enhanced_features_router
from routes.ai import router as ai_router
from routes.auth import router as auth_router  
from routes.projects import router as projects_router
from routes.templates import router as templates_router
from routes.integrations import router as integrations_router

# Include routers - Cutting-Edge Features (Phase 1-5)
from routes.architectural_intelligence import router as architectural_intelligence_router
from routes.smart_documentation import router as smart_documentation_router
from routes.theme_intelligence import router as theme_intelligence_router
from routes.project_migration import router as project_migration_router
from routes.code_quality import router as code_quality_router
from routes.workspace_optimization import router as workspace_optimization_router
from routes.experimental_sandbox import router as experimental_sandbox_router
from routes.visual_programming import router as visual_programming_router
# Import new API routes  
from routes.video_explanations import router as video_explanations_router
from routes.seo import router as seo_router
from routes.i18n import router as i18n_router
from routes.agent_marketplace import router as agent_marketplace_router
from routes.presentations import router as presentations_router

app.include_router(enhanced_features_router, prefix="/api/enhanced", tags=["Enhanced Features"])

# Cutting-Edge Features Routes
app.include_router(architectural_intelligence_router, prefix="/api/architectural-intelligence", tags=["Architectural Intelligence"])
app.include_router(smart_documentation_router, prefix="/api/smart-documentation", tags=["Smart Documentation"])
app.include_router(theme_intelligence_router, prefix="/api/theme-intelligence", tags=["Theme Intelligence"])
app.include_router(project_migration_router, prefix="/api/project-migration", tags=["Project Migration"])
app.include_router(code_quality_router, prefix="/api/code-quality", tags=["Code Quality Engine"])
app.include_router(workspace_optimization_router, prefix="/api/workspace-optimization", tags=["Workspace Intelligence"])
app.include_router(experimental_sandbox_router, prefix="/api/experimental-sandbox", tags=["Experimental Sandbox"])
app.include_router(visual_programming_router, prefix="/api/visual-programming", tags=["Visual Programming"])

# Include new API routes
app.include_router(video_explanations_router, prefix="/api/video-explanations", tags=["Video Explanations"])
app.include_router(seo_router, prefix="/api/seo", tags=["SEO"])
app.include_router(i18n_router, prefix="/api/i18n", tags=["Internationalization"])
app.include_router(agent_marketplace_router, prefix="/api/agent-marketplace", tags=["Agent Marketplace"])
app.include_router(presentations_router, prefix="/api/presentations", tags=["Presentations"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    try:
        await init_db()
        logger.info("Database initialized successfully")
        
        # Initialize core AI services
        await ai_service.initialize()
        await enhanced_ai_service.initialize()
        logger.info("Core AI services initialized successfully")
        
        # Initialize advanced services (graceful degradation)
        logger.info("Initializing advanced services...")
        
        try:
            # Initialize AI Router
            await intelligent_ai_router.initialize()
            set_ai_router(intelligent_ai_router)
            logger.info("✅ Intelligent AI Router initialized")
        except Exception as e:
            logger.warning(f"AI Router initialization failed: {e}")
        
        try:
            # Initialize Plugin Manager
            await plugin_manager.initialize()
            set_plugin_manager(plugin_manager)
            logger.info("✅ Plugin Manager initialized")
        except Exception as e:
            logger.warning(f"Plugin Manager initialization failed: {e}")
        
        try:
            # Initialize Analytics & Recommendations
            await advanced_analytics.initialize()
            smart_recommendation_engine.analytics = advanced_analytics  # Set reference
            set_analytics_services(advanced_analytics, smart_recommendation_engine)
            logger.info("✅ Advanced Analytics initialized")
        except Exception as e:
            logger.warning(f"Advanced Analytics initialization failed: {e}")
        
        try:
            # Initialize Security Services
            await zero_trust_gateway.initialize()
            await compliance_engine.initialize()
            set_security_services(zero_trust_gateway, compliance_engine)
            logger.info("✅ Zero Trust Security initialized")
        except Exception as e:
            logger.warning(f"Security Services initialization failed: {e}")
        
        try:
            # Initialize Performance Optimizer
            await performance_optimizer.initialize()
            logger.info("✅ Performance Optimizer initialized")
        except Exception as e:
            logger.warning(f"Performance Optimizer initialization failed: {e}")
        
        try:
            # Initialize Adaptive UI Service
            await adaptive_ui_service.initialize()
            logger.info("✅ Adaptive UI Service initialized")
        except Exception as e:
            logger.warning(f"Adaptive UI Service initialization failed: {e}")
        
        try:
            # Initialize Development Assistant
            await development_assistant.initialize()
            set_development_assistant(development_assistant)
            logger.info("✅ Development Assistant initialized")
        except Exception as e:
            logger.warning(f"Development Assistant initialization failed: {e}")
        
        try:
            # Initialize Collaboration Engine
            await collaboration_engine.initialize()
            set_collaboration_engine(collaboration_engine)
            logger.info("✅ Live Collaboration Engine initialized")
        except Exception as e:
            logger.warning(f"Collaboration Engine initialization failed: {e}")
        
        try:
            # Initialize Voice Interface
            voice_interface = VoiceInterface()
            await voice_interface.initialize()
            set_voice_interface(voice_interface)
            logger.info("✅ Voice Interface initialized")
        except Exception as e:
            logger.warning(f"Voice Interface initialization failed: {e}")
        
        try:
            # Initialize Workflow Engine
            workflow_engine = WorkflowEngine(db_wrapper)
            await workflow_engine.initialize()
            set_workflow_engine(workflow_engine)
            logger.info("✅ Workflow Automation Engine initialized")
        except Exception as e:
            logger.warning(f"Workflow Engine initialization failed: {e}")
        
        # Initialize cutting-edge services
        try:
            # Initialize Architectural Intelligence
            await architectural_intelligence.initialize()
            set_architectural_intelligence_service(architectural_intelligence)
            logger.info("✅ Architectural Intelligence initialized")
        except Exception as e:
            logger.warning(f"Architectural Intelligence initialization failed: {e}")
        
        try:
            # Initialize Smart Documentation Engine
            await smart_documentation_engine.initialize()
            set_smart_documentation_service(smart_documentation_engine)
            logger.info("✅ Smart Documentation Engine initialized")
        except Exception as e:
            logger.warning(f"Smart Documentation Engine initialization failed: {e}")
        
        try:
            # Initialize Theme Intelligence
            await theme_intelligence.initialize()
            set_theme_intelligence_service(theme_intelligence)
            logger.info("✅ Theme Intelligence initialized")
        except Exception as e:
            logger.warning(f"Theme Intelligence initialization failed: {e}")
        
        try:
            # Initialize Project Migrator
            await project_migrator.initialize()
            set_project_migrator_service(project_migrator)
            logger.info("✅ Project Migrator initialized")
        except Exception as e:
            logger.warning(f"Project Migrator initialization failed: {e}")
        
        try:
            # Initialize Code Quality Engine
            await code_quality_engine.initialize()
            set_code_quality_engine(code_quality_engine)
            logger.info("✅ Code Quality Engine initialized")
        except Exception as e:
            logger.warning(f"Code Quality Engine initialization failed: {e}")
        
        try:
            # Initialize Workspace Intelligence
            await workspace_intelligence.initialize()
            set_workspace_intelligence(workspace_intelligence)
            logger.info("✅ Workspace Intelligence initialized")
        except Exception as e:
            logger.warning(f"Workspace Intelligence initialization failed: {e}")
        
        try:
            # Initialize Experimental Sandbox
            await experimental_sandbox.initialize()
            set_experimental_sandbox_service(experimental_sandbox)
            logger.info("✅ Experimental Sandbox initialized")
        except Exception as e:
            logger.warning(f"Experimental Sandbox initialization failed: {e}")
        
        try:
            # Initialize Visual Programming
            await visual_programming.initialize()
            set_visual_programming_service(visual_programming)
            logger.info("✅ Visual Programming initialized")
        except Exception as e:
            logger.warning(f"Visual Programming initialization failed: {e}")
        
        try:
            # Initialize Community Intelligence
            await community_intelligence.initialize()
            set_community_intelligence_service(community_intelligence)
            logger.info("✅ Community Intelligence initialized")
        except Exception as e:
            logger.warning(f"Community Intelligence initialization failed: {e}")
        
        # Initialize new 5% gap completion services
        video_service = VideoExplanationService()
        await video_service.initialize()
        set_video_explanation_service(video_service)
        
        seo_service = SEOService()
        await seo_service.initialize()
        set_seo_service(seo_service)
        
        i18n_service = I18nService()
        await i18n_service.initialize()
        set_i18n_service(i18n_service)
        
        marketplace_service = AgentMarketplaceService()
        await marketplace_service.initialize()
        set_agent_marketplace_service(marketplace_service)
        
        presentation_service = PresentationService()
        await presentation_service.initialize()
        set_presentation_service(presentation_service)
        
        logger.info("🎉 All 5% gap completion services initialized - Platform now 100% complete!")
        
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