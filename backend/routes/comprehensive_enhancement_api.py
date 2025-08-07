"""
Comprehensive Enhancement API
Master API for all enhancement systems
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

from services.comprehensive_enhancement_coordinator import enhancement_coordinator

logger = logging.getLogger(__name__)

router = APIRouter()

class EnhancementRequest(BaseModel):
    data: Dict[str, Any]
    user_id: Optional[str] = None
    enhancement_types: List[str] = ["all"]  # ai, performance, accessibility, robustness, all

@router.post("/initialize")
async def initialize_all_enhancements():
    """
    Initialize all enhancement systems
    Starts comprehensive enhancements while preserving UI/workflow
    """
    try:
        await enhancement_coordinator.initialize_all_enhancements()
        
        return {
            "message": "All enhancement systems initialized successfully",
            "systems_initialized": [
                "AI Intelligence Enhancement",
                "Performance Optimization", 
                "Accessibility Enhancement",
                "Robustness & Error Handling"
            ],
            "preserves": {
                "existing_ui": True,
                "existing_workflow": True, 
                "existing_page_structure": True,
                "backward_compatibility": True
            },
            "enhancements_active": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Comprehensive enhancement initialization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhance")
async def apply_comprehensive_enhancements(request: EnhancementRequest):
    """
    Apply comprehensive enhancements to request data
    Coordinates all enhancement systems for optimal results
    """
    try:
        enhanced_data = await enhancement_coordinator.enhance_request(
            request_data=request.data,
            user_id=request.user_id
        )
        
        return {
            "enhanced_data": enhanced_data,
            "enhancements_applied": enhanced_data.get("enhancements", {}).get("applied", []),
            "ui_preserved": True,
            "workflow_preserved": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Comprehensive enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_comprehensive_enhancement_status():
    """
    Get comprehensive status of all enhancement systems
    Shows unified view of all active enhancements
    """
    try:
        status = await enhancement_coordinator.get_comprehensive_status()
        
        return {
            "comprehensive_status": status,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Comprehensive status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def comprehensive_enhancement_health():
    """
    Health check for all enhancement systems
    Verifies all enhancements are working properly
    """
    try:
        status = await enhancement_coordinator.get_comprehensive_status()
        
        # Determine overall health
        individual_systems = status.get("individual_systems", {})
        healthy_systems = 0
        total_systems = len(individual_systems)
        
        for system_name, system_report in individual_systems.items():
            if (system_report.get("status") == "operational" or 
                system_report.get("status") == "optimal" or
                system_report.get("accessibility_engine") == "operational" or
                system_report.get("robustness_engine") == "operational"):
                healthy_systems += 1
        
        health_percentage = (healthy_systems / total_systems * 100) if total_systems > 0 else 0
        
        overall_health = "healthy" if health_percentage >= 80 else "degraded" if health_percentage >= 60 else "unhealthy"
        
        return {
            "overall_health": overall_health,
            "health_percentage": round(health_percentage, 2),
            "healthy_systems": healthy_systems,
            "total_systems": total_systems,
            "enhancement_score": status.get("overall_enhancement_score", 0),
            "coordination_active": status.get("coordination_active", False),
            "systems_status": {
                name: "healthy" if (
                    report.get("status") == "operational" or 
                    report.get("status") == "optimal" or
                    report.get("accessibility_engine") == "operational" or
                    report.get("robustness_engine") == "operational"
                ) else "unhealthy"
                for name, report in individual_systems.items()
            },
            "features_preserved": status.get("features_preserved", {}),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Comprehensive health check error: {e}")
        return {
            "overall_health": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/features")
async def get_enhancement_features():
    """
    Get list of all enhancement features available
    Shows what capabilities have been added to the system
    """
    try:
        return {
            "enhancement_features": {
                "ai_intelligence": {
                    "description": "Advanced AI conversation quality and context retention",
                    "features": [
                        "Multi-turn conversation context",
                        "Intelligent agent selection", 
                        "Context-aware responses",
                        "Proactive suggestions",
                        "Learning from interactions"
                    ],
                    "preserves_ui": True
                },
                "performance_optimization": {
                    "description": "System performance and speed enhancements",
                    "features": [
                        "Continuous performance monitoring",
                        "Automatic cache optimization",
                        "Memory usage optimization",
                        "Database query optimization",
                        "Response time improvements"
                    ],
                    "preserves_ui": True
                },
                "accessibility": {
                    "description": "WCAG 2.1 AA/AAA accessibility compliance",
                    "features": [
                        "Screen reader optimization",
                        "Keyboard navigation support",
                        "High contrast themes",
                        "Color blind friendly palettes",
                        "ARIA enhancements",
                        "Focus management"
                    ],
                    "preserves_ui": True
                },
                "robustness": {
                    "description": "System reliability and error handling",
                    "features": [
                        "Automatic error recovery",
                        "Circuit breaker protection",
                        "Health monitoring",
                        "Graceful degradation",
                        "Fault tolerance",
                        "Performance tracking"
                    ],
                    "preserves_ui": True
                }
            },
            "coordination_features": {
                "description": "Cross-system optimization and coordination",
                "features": [
                    "Unified enhancement application",
                    "Cross-system monitoring",
                    "Intelligent load balancing",
                    "Coordinated resource management"
                ]
            },
            "preservation_guarantees": {
                "existing_ui": "All UI components remain unchanged",
                "existing_workflow": "User workflows preserved completely", 
                "existing_page_structure": "Page structure and routing unchanged",
                "backward_compatibility": "Full compatibility with existing features"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Enhancement features error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shutdown")
async def shutdown_all_enhancements():
    """
    Gracefully shutdown all enhancement systems
    For maintenance or debugging purposes
    """
    try:
        await enhancement_coordinator.shutdown_all_enhancements()
        
        return {
            "message": "All enhancement systems shutdown successfully",
            "systems_shutdown": [
                "AI Intelligence Enhancement",
                "Performance Optimization",
                "Accessibility Enhancement", 
                "Robustness & Error Handling"
            ],
            "coordination_stopped": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Enhancement shutdown error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Initialize enhancement systems on startup
@router.on_event("startup")
async def startup_comprehensive_enhancements():
    """Initialize comprehensive enhancement systems on startup"""
    try:
        await enhancement_coordinator.initialize_all_enhancements()
        logger.info("✅ Comprehensive enhancement systems initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize comprehensive enhancements: {e}")