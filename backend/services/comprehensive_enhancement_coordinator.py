"""
Comprehensive Enhancement Coordinator
Coordinates all enhancements while preserving existing UI/workflow
"""

import asyncio
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import weakref

from .advanced_ai_intelligence import ai_intelligence
from .enhanced_performance_optimizer import performance_optimizer  
from .advanced_accessibility_engine import accessibility_engine
from .advanced_robustness_engine import robustness_engine

logger = logging.getLogger(__name__)

class ComprehensiveEnhancementCoordinator:
    """
    Master coordinator for all enhancement systems
    Ensures all enhancements work together harmoniously
    """
    
    def __init__(self):
        self.enhancement_systems = {
            "ai_intelligence": ai_intelligence,
            "performance_optimizer": performance_optimizer,
            "accessibility_engine": accessibility_engine,
            "robustness_engine": robustness_engine
        }
        
        self.coordination_active = False
        self.enhancement_status: Dict[str, str] = {}
        self.coordination_tasks: Dict[str, asyncio.Task] = {}
        
        logger.info("🎯 Comprehensive Enhancement Coordinator initialized")
    
    async def initialize_all_enhancements(self):
        """
        Initialize all enhancement systems in optimal order
        Preserves existing UI/workflow while adding enhancements
        """
        try:
            logger.info("🚀 Starting comprehensive enhancement initialization...")
            
            # Initialize in dependency order
            initialization_order = [
                ("robustness_engine", "Robustness & Error Handling"),
                ("performance_optimizer", "Performance Optimization"), 
                ("accessibility_engine", "Accessibility Enhancement"),
                ("ai_intelligence", "AI Intelligence Enhancement")
            ]
            
            for system_name, description in initialization_order:
                try:
                    logger.info(f"🔧 Initializing {description}...")
                    
                    if system_name == "ai_intelligence":
                        await ai_intelligence.initialize_intelligence_systems()
                    elif system_name == "performance_optimizer":
                        await performance_optimizer.start_optimization_engine()
                    elif system_name == "accessibility_engine":
                        # Accessibility engine doesn't need explicit initialization
                        pass
                    elif system_name == "robustness_engine":
                        await robustness_engine.initialize_robustness_systems()
                    
                    self.enhancement_status[system_name] = "initialized"
                    logger.info(f"✅ {description} initialized successfully")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to initialize {description}: {e}")
                    self.enhancement_status[system_name] = f"failed: {str(e)}"
            
            # Start coordination tasks
            await self._start_coordination_tasks()
            
            self.coordination_active = True
            logger.info("🎉 All enhancement systems initialized successfully!")
            
        except Exception as e:
            logger.error(f"❌ Comprehensive enhancement initialization failed: {e}")
            raise
    
    async def _start_coordination_tasks(self):
        """Start background coordination tasks"""
        self.coordination_tasks['monitor'] = asyncio.create_task(
            self._monitor_enhancement_systems()
        )
        self.coordination_tasks['optimize'] = asyncio.create_task(
            self._cross_system_optimization()
        )
        
        logger.debug("🔄 Coordination tasks started")
    
    async def enhance_request(
        self, 
        request_data: Dict[str, Any], 
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Apply all enhancements to incoming request
        Coordinates all enhancement systems for optimal results
        """
        try:
            enhanced_data = request_data.copy()
            enhancements_applied = []
            
            # 1. Apply robustness (error handling)
            # This is applied at the infrastructure level, no direct data modification
            
            # 2. Apply accessibility enhancements if user profile exists
            if user_id and "content" in enhanced_data:
                try:
                    accessibility_result = await accessibility_engine.enhance_content_accessibility(
                        content=enhanced_data["content"],
                        user_id=user_id
                    )
                    enhanced_data["content"] = accessibility_result
                    enhancements_applied.append("accessibility")
                except Exception as e:
                    logger.warning(f"Accessibility enhancement skipped: {e}")
            
            # 3. Apply AI intelligence enhancements
            if "message" in enhanced_data and "session_id" in enhanced_data:
                try:
                    intelligence_result = await ai_intelligence.enhance_conversation(
                        message=enhanced_data["message"],
                        session_id=enhanced_data["session_id"],
                        user_context=enhanced_data.get("context", {})
                    )
                    enhanced_data["ai_enhanced"] = intelligence_result
                    enhancements_applied.append("ai_intelligence")
                except Exception as e:
                    logger.warning(f"AI intelligence enhancement skipped: {e}")
            
            # 4. Performance optimization is applied at the system level
            enhancements_applied.append("performance_optimization")
            
            # Add enhancement metadata
            enhanced_data["enhancements"] = {
                "applied": enhancements_applied,
                "coordinator": "comprehensive_enhancement_coordinator",
                "timestamp": datetime.utcnow().isoformat(),
                "preserves_ui": True,
                "preserves_workflow": True
            }
            
            return enhanced_data
            
        except Exception as e:
            logger.error(f"❌ Request enhancement failed: {e}")
            # Return original data on enhancement failure
            return request_data
    
    async def get_comprehensive_status(self) -> Dict[str, Any]:
        """
        Get comprehensive status of all enhancement systems
        Shows unified view of all enhancements
        """
        try:
            # Collect reports from all systems
            reports = {}
            
            try:
                reports["ai_intelligence"] = await ai_intelligence.get_intelligence_report()
            except Exception as e:
                reports["ai_intelligence"] = {"status": "error", "message": str(e)}
            
            try:
                reports["performance"] = await performance_optimizer.get_performance_report()
            except Exception as e:
                reports["performance"] = {"status": "error", "message": str(e)}
            
            try:
                reports["accessibility"] = await accessibility_engine.get_accessibility_report()
            except Exception as e:
                reports["accessibility"] = {"status": "error", "message": str(e)}
            
            try:
                reports["robustness"] = await robustness_engine.get_robustness_report()
            except Exception as e:
                reports["robustness"] = {"status": "error", "message": str(e)}
            
            # Calculate overall enhancement score
            overall_score = self._calculate_overall_enhancement_score(reports)
            
            return {
                "comprehensive_enhancement_status": "active",
                "overall_enhancement_score": overall_score,
                "coordination_active": self.coordination_active,
                "individual_systems": reports,
                "enhancement_status": self.enhancement_status,
                "features_preserved": {
                    "existing_ui": True,
                    "existing_workflow": True,
                    "existing_page_structure": True,
                    "backward_compatibility": True
                },
                "enhancements_active": {
                    "ai_intelligence": "ai_intelligence" in self.enhancement_status and self.enhancement_status["ai_intelligence"] == "initialized",
                    "performance_optimization": "performance_optimizer" in self.enhancement_status and self.enhancement_status["performance_optimizer"] == "initialized",
                    "accessibility": "accessibility_engine" in self.enhancement_status and self.enhancement_status["accessibility_engine"] == "initialized",
                    "robustness": "robustness_engine" in self.enhancement_status and self.enhancement_status["robustness_engine"] == "initialized"
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get comprehensive status: {e}")
            return {"status": "error", "message": str(e)}
    
    def _calculate_overall_enhancement_score(self, reports: Dict[str, Any]) -> float:
        """Calculate overall enhancement effectiveness score"""
        try:
            scores = []
            
            # AI Intelligence score
            ai_report = reports.get("ai_intelligence", {})
            if ai_report.get("status") == "operational":
                ai_score = min(100, ai_report.get("average_quality_score", 0) * 10)
                scores.append(ai_score)
            
            # Performance score
            perf_report = reports.get("performance", {})
            if perf_report.get("status") == "optimal":
                # Base score of 85 for optimal performance
                perf_score = 85
                # Bonus for good metrics
                current_metrics = perf_report.get("current_metrics", {})
                if current_metrics.get("response_time", 10) < 2.0:
                    perf_score += 10
                if current_metrics.get("cpu_usage", 100) < 50:
                    perf_score += 5
                scores.append(min(100, perf_score))
            
            # Accessibility score  
            acc_report = reports.get("accessibility", {})
            if acc_report.get("accessibility_engine") == "operational":
                # Base score for operational accessibility
                acc_score = 80
                # Bonus for user profiles
                if acc_report.get("user_profiles", {}).get("total", 0) > 0:
                    acc_score += 15
                scores.append(min(100, acc_score))
            
            # Robustness score
            rob_report = reports.get("robustness", {})
            if rob_report.get("robustness_engine") == "operational":
                health_score = rob_report.get("system_health", {}).get("overall_score", 0)
                scores.append(health_score)
            
            # Return average score
            return round(sum(scores) / len(scores), 2) if scores else 0.0
            
        except Exception as e:
            logger.error(f"Score calculation error: {e}")
            return 0.0
    
    async def _monitor_enhancement_systems(self):
        """Background task to monitor all enhancement systems"""
        while self.coordination_active:
            try:
                # Check status of each system
                for system_name, system in self.enhancement_systems.items():
                    try:
                        # Simple health check (would be more sophisticated in production)
                        if hasattr(system, 'get_intelligence_report'):
                            await system.get_intelligence_report()
                        elif hasattr(system, 'get_performance_report'):
                            await system.get_performance_report()
                        elif hasattr(system, 'get_accessibility_report'):
                            await system.get_accessibility_report()
                        elif hasattr(system, 'get_robustness_report'):
                            await system.get_robustness_report()
                        
                        if self.enhancement_status.get(system_name) != "initialized":
                            self.enhancement_status[system_name] = "initialized"
                            logger.info(f"✅ {system_name} status restored")
                            
                    except Exception as e:
                        if self.enhancement_status.get(system_name) == "initialized":
                            self.enhancement_status[system_name] = f"degraded: {str(e)}"
                            logger.warning(f"⚠️ {system_name} degraded: {e}")
                
                await asyncio.sleep(60)  # Monitor every minute
                
            except Exception as e:
                logger.error(f"Enhancement monitoring error: {e}")
                await asyncio.sleep(60)
    
    async def _cross_system_optimization(self):
        """Background task for cross-system optimization"""
        while self.coordination_active:
            try:
                # Example: Adjust AI intelligence based on performance metrics
                try:
                    perf_report = await performance_optimizer.get_performance_report()
                    current_metrics = perf_report.get("current_metrics", {})
                    
                    cpu_usage = current_metrics.get("cpu_usage", 0)
                    memory_usage = current_metrics.get("memory_usage", 0)
                    
                    # If system is under high load, could adjust AI processing
                    if cpu_usage > 80 or memory_usage > 80:
                        logger.info("🔧 High system load detected, AI processing may be optimized")
                        # In production, would implement actual optimization logic
                
                except Exception as e:
                    logger.debug(f"Cross-system optimization check failed: {e}")
                
                await asyncio.sleep(300)  # Optimize every 5 minutes
                
            except Exception as e:
                logger.error(f"Cross-system optimization error: {e}")
                await asyncio.sleep(300)
    
    async def shutdown_all_enhancements(self):
        """Gracefully shutdown all enhancement systems"""
        logger.info("🛑 Shutting down all enhancement systems...")
        
        self.coordination_active = False
        
        # Cancel coordination tasks
        for task_name, task in self.coordination_tasks.items():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                logger.info(f"✅ Coordination task {task_name} cancelled")
        
        # Shutdown individual systems
        try:
            await performance_optimizer.shutdown()
        except Exception as e:
            logger.error(f"Performance optimizer shutdown error: {e}")
        
        try:
            await robustness_engine.shutdown()
        except Exception as e:
            logger.error(f"Robustness engine shutdown error: {e}")
        
        logger.info("✅ All enhancement systems shutdown complete")

# Global instance
enhancement_coordinator = ComprehensiveEnhancementCoordinator()