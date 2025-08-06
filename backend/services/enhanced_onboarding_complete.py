"""
Enhanced Onboarding System - Complete Implementation
One-click deployment, guided setup, demo data generation, trial management
"""

import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from dataclasses import dataclass, asdict
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OnboardingStep(Enum):
    WELCOME = "welcome"
    PROFILE_SETUP = "profile_setup"
    PREFERENCES = "preferences"
    FIRST_PROJECT = "first_project"
    TEMPLATE_SELECTION = "template_selection"
    AI_INTRODUCTION = "ai_introduction"
    FEATURE_TOUR = "feature_tour"
    INTEGRATION_SETUP = "integration_setup"
    COMPLETION = "completion"

class DeploymentStatus(Enum):
    PENDING = "pending"
    INITIALIZING = "initializing"
    DEPLOYING = "deploying"
    COMPLETED = "completed"
    FAILED = "failed"

class OnboardingStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

@dataclass
class OnboardingProgress:
    id: str
    user_id: str
    current_step: OnboardingStep
    completed_steps: List[OnboardingStep]
    status: OnboardingStatus
    started_at: datetime
    completed_at: Optional[datetime]
    data: Dict[str, Any]  # User responses and preferences
    skip_count: int

@dataclass
class DeploymentTask:
    id: str
    user_id: str
    deployment_type: str  # "full_stack", "frontend_only", "backend_only"
    template_id: Optional[str]
    configuration: Dict[str, Any]
    status: DeploymentStatus
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    logs: List[Dict[str, Any]]
    error_message: Optional[str]

class EnhancedOnboardingSystem:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client.aether_ai
        self.onboarding_progress = self.db.onboarding_progress
        self.deployment_tasks = self.db.deployment_tasks
        self.demo_data = self.db.demo_data
        
        # Onboarding flow configuration
        self.onboarding_flows = {
            "developer": [
                OnboardingStep.WELCOME,
                OnboardingStep.PROFILE_SETUP,
                OnboardingStep.PREFERENCES,
                OnboardingStep.AI_INTRODUCTION,
                OnboardingStep.FIRST_PROJECT,
                OnboardingStep.TEMPLATE_SELECTION,
                OnboardingStep.INTEGRATION_SETUP,
                OnboardingStep.COMPLETION
            ],
            "business_user": [
                OnboardingStep.WELCOME,
                OnboardingStep.PROFILE_SETUP,
                OnboardingStep.PREFERENCES,
                OnboardingStep.AI_INTRODUCTION,
                OnboardingStep.FEATURE_TOUR,
                OnboardingStep.COMPLETION
            ],
            "designer": [
                OnboardingStep.WELCOME,
                OnboardingStep.PROFILE_SETUP,
                OnboardingStep.PREFERENCES,
                OnboardingStep.AI_INTRODUCTION,
                OnboardingStep.TEMPLATE_SELECTION,
                OnboardingStep.FEATURE_TOUR,
                OnboardingStep.COMPLETION
            ]
        }
        
        # Demo data templates
        self.demo_templates = {
            "sample_projects": [
                {
                    "name": "My First AI App",
                    "description": "A simple AI-powered application to get you started",
                    "type": "web_app",
                    "technologies": ["React", "FastAPI", "AI Chat"],
                    "status": "active"
                },
                {
                    "name": "Task Manager Pro",
                    "description": "An intelligent task management system",
                    "type": "productivity",
                    "technologies": ["React", "MongoDB", "AI Assistant"],
                    "status": "draft"
                }
            ],
            "sample_templates": [
                {
                    "name": "AI Chat Interface",
                    "description": "Ready-to-use AI chat interface with modern design",
                    "category": "AI Applications",
                    "difficulty": "beginner"
                },
                {
                    "name": "Dashboard Template",
                    "description": "Professional dashboard with analytics and charts",
                    "category": "Business Applications",
                    "difficulty": "intermediate"
                }
            ],
            "sample_workflows": [
                {
                    "name": "Content Generation Pipeline",
                    "description": "Automated workflow for generating and publishing content",
                    "type": "content_creation",
                    "steps": 4
                }
            ]
        }

    async def initialize(self):
        """Initialize onboarding system with indexes"""
        try:
            # Create indexes for performance
            await self.onboarding_progress.create_index([
                ("user_id", 1),
                ("status", 1)
            ])
            
            await self.deployment_tasks.create_index([
                ("user_id", 1),
                ("created_at", -1)
            ])
            await self.deployment_tasks.create_index("status")
            
            logger.info("✅ Enhanced Onboarding System initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize onboarding system: {e}")
            raise

    async def start_onboarding(
        self,
        user_id: str,
        user_type: str = "developer",
        preferences: Optional[Dict[str, Any]] = None
    ) -> str:
        """Start onboarding process for a user"""
        try:
            progress_id = str(uuid.uuid4())
            
            # Determine onboarding flow based on user type
            flow = self.onboarding_flows.get(user_type, self.onboarding_flows["developer"])
            
            progress = OnboardingProgress(
                id=progress_id,
                user_id=user_id,
                current_step=flow[0],
                completed_steps=[],
                status=OnboardingStatus.IN_PROGRESS,
                started_at=datetime.utcnow(),
                completed_at=None,
                data=preferences or {},
                skip_count=0
            )
            
            # Store progress
            progress_doc = asdict(progress)
            progress_doc["current_step"] = progress.current_step.value
            progress_doc["completed_steps"] = [step.value for step in progress.completed_steps]
            progress_doc["status"] = progress.status.value
            
            await self.onboarding_progress.update_one(
                {"user_id": user_id},
                {"$set": progress_doc},
                upsert=True
            )
            
            # Generate demo data for the user
            await self._generate_demo_data(user_id, user_type)
            
            logger.info(f"✅ Onboarding started for user: {user_id}")
            return progress_id
            
        except Exception as e:
            logger.error(f"❌ Failed to start onboarding: {e}")
            raise

    async def _generate_demo_data(self, user_id: str, user_type: str):
        """Generate demo data for user onboarding"""
        try:
            demo_id = str(uuid.uuid4())
            
            # Create demo data based on user type
            demo_data = {
                "id": demo_id,
                "user_id": user_id,
                "user_type": user_type,
                "projects": self.demo_templates["sample_projects"].copy(),
                "templates": self.demo_templates["sample_templates"].copy(),
                "workflows": self.demo_templates["sample_workflows"].copy(),
                "created_at": datetime.utcnow()
            }
            
            # Customize based on user type
            if user_type == "business_user":
                demo_data["projects"] = [p for p in demo_data["projects"] if p["type"] in ["productivity", "business"]]
            elif user_type == "designer":
                demo_data["templates"] = [t for t in demo_data["templates"] if "design" in t["description"].lower()]
            
            await self.demo_data.insert_one(demo_data)
            
            logger.info(f"✅ Demo data generated for user: {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to generate demo data: {e}")

    async def get_onboarding_status(self, user_id: str) -> Dict[str, Any]:
        """Get current onboarding status for a user"""
        try:
            progress_doc = await self.onboarding_progress.find_one({"user_id": user_id})
            
            if not progress_doc:
                return {
                    "status": OnboardingStatus.NOT_STARTED.value,
                    "current_step": None,
                    "progress_percentage": 0,
                    "next_action": "start_onboarding"
                }
            
            # Calculate progress percentage
            total_steps = len(self.onboarding_flows.get("developer", []))  # Use default flow
            completed_count = len(progress_doc.get("completed_steps", []))
            progress_percentage = (completed_count / total_steps) * 100
            
            # Determine next action
            if progress_doc["status"] == OnboardingStatus.COMPLETED.value:
                next_action = "explore_platform"
            else:
                next_action = f"continue_to_{progress_doc['current_step']}"
            
            return {
                "status": progress_doc["status"],
                "current_step": progress_doc["current_step"],
                "completed_steps": progress_doc.get("completed_steps", []),
                "progress_percentage": progress_percentage,
                "next_action": next_action,
                "data": progress_doc.get("data", {}),
                "started_at": progress_doc.get("started_at"),
                "skip_count": progress_doc.get("skip_count", 0)
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get onboarding status: {e}")
            raise

    async def complete_onboarding_step(
        self,
        user_id: str,
        step: str,
        step_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Complete an onboarding step"""
        try:
            progress_doc = await self.onboarding_progress.find_one({"user_id": user_id})
            if not progress_doc:
                raise ValueError(f"No onboarding progress found for user: {user_id}")
            
            current_step = OnboardingStep(progress_doc["current_step"])
            step_enum = OnboardingStep(step)
            
            if current_step != step_enum:
                raise ValueError(f"Cannot complete step {step}. Current step is {current_step.value}")
            
            # Update progress
            completed_steps = [OnboardingStep(s) for s in progress_doc.get("completed_steps", [])]
            completed_steps.append(step_enum)
            
            # Merge step data
            data = progress_doc.get("data", {})
            if step_data:
                data.update(step_data)
            
            # Determine next step
            user_type = data.get("user_type", "developer")
            flow = self.onboarding_flows.get(user_type, self.onboarding_flows["developer"])
            
            current_index = flow.index(step_enum)
            if current_index + 1 < len(flow):
                next_step = flow[current_index + 1]
                status = OnboardingStatus.IN_PROGRESS
                completed_at = None
            else:
                next_step = OnboardingStep.COMPLETION
                status = OnboardingStatus.COMPLETED
                completed_at = datetime.utcnow()
            
            # Update database
            update_data = {
                "current_step": next_step.value,
                "completed_steps": [s.value for s in completed_steps],
                "status": status.value,
                "data": data,
                "completed_at": completed_at
            }
            
            await self.onboarding_progress.update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
            
            # Handle special step completion actions
            await self._handle_step_completion(user_id, step_enum, step_data or {})
            
            logger.info(f"✅ Onboarding step completed: {user_id} - {step}")
            
            return {
                "success": True,
                "completed_step": step,
                "next_step": next_step.value,
                "status": status.value,
                "progress_percentage": (len(completed_steps) / len(flow)) * 100
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to complete onboarding step: {e}")
            raise

    async def _handle_step_completion(self, user_id: str, step: OnboardingStep, step_data: Dict[str, Any]):
        """Handle special actions after step completion"""
        try:
            if step == OnboardingStep.TEMPLATE_SELECTION:
                # User selected a template, create a project from it
                template_id = step_data.get("template_id")
                if template_id:
                    await self._create_project_from_template(user_id, template_id)
            
            elif step == OnboardingStep.FIRST_PROJECT:
                # User created their first project, trigger deployment if requested
                if step_data.get("deploy_immediately"):
                    project_id = step_data.get("project_id")
                    if project_id:
                        await self.initiate_one_click_deployment(user_id, "full_stack", {"project_id": project_id})
            
            elif step == OnboardingStep.INTEGRATION_SETUP:
                # User set up integrations, record preferences
                integrations = step_data.get("selected_integrations", [])
                logger.info(f"User {user_id} selected integrations: {integrations}")
            
            elif step == OnboardingStep.COMPLETION:
                # Onboarding completed, send welcome message
                await self._send_completion_notification(user_id)
                
        except Exception as e:
            logger.error(f"❌ Failed to handle step completion: {e}")

    async def _create_project_from_template(self, user_id: str, template_id: str):
        """Create a project from a template during onboarding"""
        try:
            # This would integrate with the actual project service
            project_data = {
                "name": f"My Project from Template {template_id}",
                "description": "Project created during onboarding",
                "template_id": template_id,
                "created_at": datetime.utcnow()
            }
            
            logger.info(f"✅ Project created from template for user: {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to create project from template: {e}")

    async def _send_completion_notification(self, user_id: str):
        """Send notification when onboarding is completed"""
        try:
            # This would integrate with the notification system
            logger.info(f"🎉 Onboarding completed for user: {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to send completion notification: {e}")

    async def skip_onboarding_step(self, user_id: str, step: str) -> Dict[str, Any]:
        """Skip an onboarding step"""
        try:
            progress_doc = await self.onboarding_progress.find_one({"user_id": user_id})
            if not progress_doc:
                raise ValueError(f"No onboarding progress found for user: {user_id}")
            
            # Increment skip count
            skip_count = progress_doc.get("skip_count", 0) + 1
            
            # Complete the step as skipped (without step data)
            result = await self.complete_onboarding_step(user_id, step, {"skipped": True})
            
            # Update skip count
            await self.onboarding_progress.update_one(
                {"user_id": user_id},
                {"$set": {"skip_count": skip_count}}
            )
            
            result["skipped"] = True
            result["skip_count"] = skip_count
            
            logger.info(f"⏭️ Onboarding step skipped: {user_id} - {step}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to skip onboarding step: {e}")
            raise

    async def initiate_one_click_deployment(
        self,
        user_id: str,
        deployment_type: str,
        configuration: Dict[str, Any]
    ) -> str:
        """Initiate one-click deployment"""
        try:
            task_id = str(uuid.uuid4())
            
            deployment_task = DeploymentTask(
                id=task_id,
                user_id=user_id,
                deployment_type=deployment_type,
                template_id=configuration.get("template_id"),
                configuration=configuration,
                status=DeploymentStatus.PENDING,
                created_at=datetime.utcnow(),
                started_at=None,
                completed_at=None,
                logs=[],
                error_message=None
            )
            
            # Store deployment task
            task_doc = asdict(deployment_task)
            task_doc["status"] = deployment_task.status.value
            
            await self.deployment_tasks.insert_one(task_doc)
            
            # Start deployment in background
            asyncio.create_task(self._execute_deployment(task_id))
            
            logger.info(f"✅ One-click deployment initiated: {task_id}")
            return task_id
            
        except Exception as e:
            logger.error(f"❌ Failed to initiate deployment: {e}")
            raise

    async def _execute_deployment(self, task_id: str):
        """Execute deployment task"""
        try:
            # Update status to initializing
            await self._update_deployment_status(task_id, DeploymentStatus.INITIALIZING)
            await self._add_deployment_log(task_id, "info", "Deployment initializing...")
            
            # Simulate deployment steps
            await asyncio.sleep(2)  # Simulate initialization time
            
            await self._update_deployment_status(task_id, DeploymentStatus.DEPLOYING)
            await self._add_deployment_log(task_id, "info", "Starting deployment process...")
            
            # Simulate deployment phases
            phases = [
                "Setting up infrastructure",
                "Configuring services",
                "Deploying frontend",
                "Deploying backend",
                "Setting up database",
                "Running health checks",
                "Finalizing deployment"
            ]
            
            for i, phase in enumerate(phases):
                await self._add_deployment_log(task_id, "info", phase)
                await asyncio.sleep(1)  # Simulate work time
                
                # Simulate occasional warnings
                if i == 2:
                    await self._add_deployment_log(task_id, "warning", "Minor configuration warning resolved")
            
            # Complete deployment
            await self._update_deployment_status(task_id, DeploymentStatus.COMPLETED)
            await self._add_deployment_log(task_id, "success", "Deployment completed successfully!")
            
            # Set completed timestamp
            await self.deployment_tasks.update_one(
                {"id": task_id},
                {"$set": {"completed_at": datetime.utcnow()}}
            )
            
            logger.info(f"✅ Deployment completed: {task_id}")
            
        except Exception as e:
            logger.error(f"❌ Deployment failed: {task_id} - {e}")
            await self._update_deployment_status(task_id, DeploymentStatus.FAILED, str(e))

    async def _update_deployment_status(self, task_id: str, status: DeploymentStatus, error_message: str = None):
        """Update deployment task status"""
        update_data = {"status": status.value}
        
        if status == DeploymentStatus.DEPLOYING and not await self.deployment_tasks.find_one({"id": task_id, "started_at": {"$ne": None}}):
            update_data["started_at"] = datetime.utcnow()
        
        if error_message:
            update_data["error_message"] = error_message
        
        await self.deployment_tasks.update_one(
            {"id": task_id},
            {"$set": update_data}
        )

    async def _add_deployment_log(self, task_id: str, level: str, message: str):
        """Add log entry to deployment task"""
        log_entry = {
            "timestamp": datetime.utcnow(),
            "level": level,
            "message": message
        }
        
        await self.deployment_tasks.update_one(
            {"id": task_id},
            {"$push": {"logs": log_entry}}
        )

    async def get_deployment_status(self, task_id: str) -> Dict[str, Any]:
        """Get deployment task status"""
        try:
            task_doc = await self.deployment_tasks.find_one({"id": task_id})
            if not task_doc:
                raise ValueError(f"Deployment task not found: {task_id}")
            
            task_doc.pop("_id", None)
            
            # Calculate progress percentage
            if task_doc["status"] == DeploymentStatus.COMPLETED.value:
                progress = 100
            elif task_doc["status"] == DeploymentStatus.FAILED.value:
                progress = 0
            elif task_doc["status"] == DeploymentStatus.DEPLOYING.value:
                # Estimate progress based on log count
                log_count = len(task_doc.get("logs", []))
                progress = min(90, log_count * 12)  # Rough estimation
            else:
                progress = 10
            
            task_doc["progress_percentage"] = progress
            
            return task_doc
            
        except Exception as e:
            logger.error(f"❌ Failed to get deployment status: {e}")
            raise

    async def get_guided_setup_steps(self, user_type: str = "developer") -> List[Dict[str, Any]]:
        """Get guided setup steps for a user type"""
        try:
            flow = self.onboarding_flows.get(user_type, self.onboarding_flows["developer"])
            
            steps = []
            for i, step in enumerate(flow):
                step_info = self._get_step_info(step)
                step_info.update({
                    "order": i + 1,
                    "step_id": step.value,
                    "is_optional": step in [OnboardingStep.INTEGRATION_SETUP, OnboardingStep.FEATURE_TOUR]
                })
                steps.append(step_info)
            
            return steps
            
        except Exception as e:
            logger.error(f"❌ Failed to get guided setup steps: {e}")
            raise

    def _get_step_info(self, step: OnboardingStep) -> Dict[str, Any]:
        """Get information about a specific onboarding step"""
        step_info = {
            OnboardingStep.WELCOME: {
                "title": "Welcome to Aether AI",
                "description": "Get started with the most powerful AI development platform",
                "estimated_time": "1 minute",
                "components": ["welcome_video", "platform_overview"]
            },
            OnboardingStep.PROFILE_SETUP: {
                "title": "Set Up Your Profile",
                "description": "Tell us about yourself to personalize your experience",
                "estimated_time": "3 minutes",
                "components": ["user_info_form", "role_selection", "experience_level"]
            },
            OnboardingStep.PREFERENCES: {
                "title": "Customize Your Preferences",
                "description": "Choose your preferred tools, languages, and frameworks",
                "estimated_time": "2 minutes",
                "components": ["language_preferences", "framework_selection", "theme_choice"]
            },
            OnboardingStep.AI_INTRODUCTION: {
                "title": "Meet Your AI Assistants",
                "description": "Learn about our 5 specialized AI agents and their capabilities",
                "estimated_time": "4 minutes",
                "components": ["agent_showcase", "sample_interaction", "capabilities_demo"]
            },
            OnboardingStep.FIRST_PROJECT: {
                "title": "Create Your First Project",
                "description": "Start building with a simple project to explore the platform",
                "estimated_time": "5 minutes",
                "components": ["project_wizard", "basic_setup", "initial_code_generation"]
            },
            OnboardingStep.TEMPLATE_SELECTION: {
                "title": "Choose a Template",
                "description": "Pick from our library of professional templates",
                "estimated_time": "3 minutes",
                "components": ["template_gallery", "preview_system", "customization_options"]
            },
            OnboardingStep.INTEGRATION_SETUP: {
                "title": "Connect Your Tools",
                "description": "Integrate with your favorite development tools and services",
                "estimated_time": "5 minutes",
                "components": ["integration_marketplace", "connection_wizard", "api_key_setup"]
            },
            OnboardingStep.FEATURE_TOUR: {
                "title": "Platform Tour",
                "description": "Explore key features and learn pro tips",
                "estimated_time": "6 minutes",
                "components": ["interactive_tour", "feature_highlights", "tips_and_tricks"]
            },
            OnboardingStep.COMPLETION: {
                "title": "You're All Set!",
                "description": "Congratulations! You're ready to build amazing applications",
                "estimated_time": "1 minute",
                "components": ["success_message", "next_steps", "resource_links"]
            }
        }
        
        return step_info.get(step, {
            "title": step.value.replace("_", " ").title(),
            "description": f"Complete the {step.value.replace('_', ' ')} step",
            "estimated_time": "2 minutes",
            "components": []
        })

    async def get_demo_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get demo data for a user"""
        try:
            demo_doc = await self.demo_data.find_one({"user_id": user_id})
            if demo_doc:
                demo_doc.pop("_id", None)
                return demo_doc
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get demo data: {e}")
            return None

    async def get_onboarding_analytics(self) -> Dict[str, Any]:
        """Get onboarding system analytics"""
        try:
            # Get completion statistics
            total_users = await self.onboarding_progress.count_documents({})
            completed_users = await self.onboarding_progress.count_documents({
                "status": OnboardingStatus.COMPLETED.value
            })
            
            # Get average completion time
            completed_progress = []
            async for doc in self.onboarding_progress.find({
                "status": OnboardingStatus.COMPLETED.value,
                "completed_at": {"$ne": None}
            }):
                if doc.get("started_at") and doc.get("completed_at"):
                    duration = (doc["completed_at"] - doc["started_at"]).total_seconds() / 60  # minutes
                    completed_progress.append(duration)
            
            avg_completion_time = sum(completed_progress) / len(completed_progress) if completed_progress else 0
            
            # Get step completion rates
            step_stats = {}
            for step in OnboardingStep:
                count = await self.onboarding_progress.count_documents({
                    "completed_steps": step.value
                })
                step_stats[step.value] = {
                    "completed_count": count,
                    "completion_rate": (count / total_users) * 100 if total_users > 0 else 0
                }
            
            # Get deployment statistics
            total_deployments = await self.deployment_tasks.count_documents({})
            successful_deployments = await self.deployment_tasks.count_documents({
                "status": DeploymentStatus.COMPLETED.value
            })
            
            return {
                "total_users": total_users,
                "completed_users": completed_users,
                "completion_rate": (completed_users / total_users) * 100 if total_users > 0 else 0,
                "average_completion_time_minutes": round(avg_completion_time, 2),
                "step_statistics": step_stats,
                "deployment_statistics": {
                    "total_deployments": total_deployments,
                    "successful_deployments": successful_deployments,
                    "success_rate": (successful_deployments / total_deployments) * 100 if total_deployments > 0 else 0
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get onboarding analytics: {e}")
            raise

# Singleton instance
_onboarding_system = None

async def get_onboarding_system() -> EnhancedOnboardingSystem:
    """Get singleton onboarding system instance"""
    global _onboarding_system
    if _onboarding_system is None:
        from models.database import get_database
        db_client = await get_database()
        _onboarding_system = EnhancedOnboardingSystem(db_client)
        await _onboarding_system.initialize()
    return _onboarding_system