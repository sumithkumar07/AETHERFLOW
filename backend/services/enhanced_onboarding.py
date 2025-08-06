# ISSUE #8: ENHANCED ONBOARDING & SAAS EXPERIENCE
# One-click deployment, guided setup, demo environment, free tier management

import asyncio
import json
import uuid
import subprocess
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx
import os


class OnboardingStage(Enum):
    """Onboarding progress stages"""
    WELCOME = "welcome"
    PROFILE_SETUP = "profile_setup" 
    PREFERENCE_SELECTION = "preference_selection"
    DEMO_WALKTHROUGH = "demo_walkthrough"
    FIRST_PROJECT = "first_project"
    INTEGRATION_SETUP = "integration_setup"
    TRIAL_ACTIVATION = "trial_activation"
    COMPLETED = "completed"


class DeploymentPlatform(Enum):
    """Supported deployment platforms"""
    RAILWAY = "railway"
    VERCEL = "vercel"
    NETLIFY = "netlify"
    HEROKU = "heroku"
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    DOCKER = "docker"
    LOCAL = "local"


class DemoEnvironmentType(Enum):
    """Types of demo environments"""
    INTERACTIVE_TOUR = "interactive_tour"
    SANDBOX = "sandbox"  
    SAMPLE_PROJECT = "sample_project"
    VIDEO_WALKTHROUGH = "video_walkthrough"
    GUIDED_TUTORIAL = "guided_tutorial"


class EnhancedOnboarding:
    """
    Enhanced onboarding system addressing competitive gap:
    Technical setup vs one-click start, needs better onboarding experience
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.onboarding_collection = db.user_onboarding
        self.deployments_collection = db.deployment_configs
        self.demo_sessions_collection = db.demo_sessions
        self.quick_starts_collection = db.quick_start_templates
        self.trial_management_collection = db.enhanced_trials
        
    async def initialize(self):
        """Initialize enhanced onboarding system"""
        await self._setup_onboarding_tracking()
        await self._setup_deployment_automation()
        await self._setup_demo_environments()
        await self._setup_guided_tutorials()
        await self._setup_enhanced_trial_system()
        await self._populate_quick_start_templates()
        
    # ONBOARDING TRACKING & PERSONALIZATION
    async def _setup_onboarding_tracking(self):
        """Setup onboarding progress tracking"""
        await self.onboarding_collection.create_index([
            ("user_id", 1),
            ("current_stage", 1),
            ("created_at", -1)
        ])
        
    async def start_onboarding(self, user_id: str, user_data: Dict[str, Any] = None) -> str:
        """Start personalized onboarding experience"""
        onboarding_id = str(uuid.uuid4())
        
        # Analyze user profile for personalization
        user_profile = await self._analyze_user_profile(user_data or {})
        
        # Generate personalized onboarding path
        onboarding_path = await self._generate_onboarding_path(user_profile)
        
        onboarding_record = {
            "onboarding_id": onboarding_id,
            "user_id": user_id,
            "current_stage": OnboardingStage.WELCOME.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "completed": False,
            "completion_rate": 0.0,
            "estimated_time_minutes": await self._estimate_completion_time(onboarding_path),
            
            # Personalization
            "user_profile": user_profile,
            "onboarding_path": onboarding_path,
            "preferences": user_data.get("preferences", {}),
            
            # Progress tracking
            "stages_completed": [],
            "current_step": 0,
            "total_steps": len(onboarding_path),
            "time_spent_minutes": 0,
            "help_requests": 0,
            "skip_requests": 0,
            
            # Customization
            "demo_environment_created": False,
            "sample_project_generated": False,
            "integrations_configured": [],
            "trial_activated": False,
            
            # Analytics
            "engagement_score": 0.0,
            "difficulty_rating": None,
            "feedback_provided": False,
            "conversion_likelihood": await self._predict_conversion_likelihood(user_profile)
        }
        
        await self.onboarding_collection.insert_one(onboarding_record)
        
        # Initialize demo environment
        await self._prepare_demo_environment(onboarding_id, user_id, user_profile)
        
        return onboarding_id
        
    async def _analyze_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user profile for personalized onboarding"""
        profile = {
            "experience_level": "intermediate",  # beginner, intermediate, advanced
            "primary_use_case": "web_development",  # web_development, ai_projects, automation, learning
            "technical_background": "developer",  # developer, designer, product_manager, student
            "company_size": "startup",  # individual, startup, small_business, enterprise
            "goals": [],
            "preferred_stack": [],
            "time_availability": "moderate"  # limited, moderate, extensive
        }
        
        # Analyze provided data
        if "experience" in user_data:
            profile["experience_level"] = user_data["experience"]
        if "use_case" in user_data:
            profile["primary_use_case"] = user_data["use_case"] 
        if "role" in user_data:
            profile["technical_background"] = user_data["role"]
        if "company_size" in user_data:
            profile["company_size"] = user_data["company_size"]
        if "tech_stack" in user_data:
            profile["preferred_stack"] = user_data["tech_stack"]
        if "goals" in user_data:
            profile["goals"] = user_data["goals"]
            
        return profile
        
    async def _generate_onboarding_path(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized onboarding path based on user profile"""
        base_path = [
            {
                "stage": OnboardingStage.WELCOME.value,
                "title": "Welcome to Aether AI",
                "description": "Let's get you started with the most powerful AI development platform",
                "estimated_minutes": 2,
                "required": True
            },
            {
                "stage": OnboardingStage.PROFILE_SETUP.value,
                "title": "Complete Your Profile",
                "description": "Help us personalize your experience",
                "estimated_minutes": 5,
                "required": True
            }
        ]
        
        # Customize based on experience level
        if profile["experience_level"] == "beginner":
            base_path.extend([
                {
                    "stage": OnboardingStage.DEMO_WALKTHROUGH.value,
                    "title": "Interactive Demo",
                    "description": "Take a guided tour of key features",
                    "estimated_minutes": 10,
                    "required": True
                },
                {
                    "stage": OnboardingStage.GUIDED_TUTORIAL.value,
                    "title": "Your First AI Project",
                    "description": "Build your first project step-by-step",
                    "estimated_minutes": 15,
                    "required": False
                }
            ])
        else:
            base_path.append({
                "stage": OnboardingStage.FIRST_PROJECT.value,
                "title": "Create Your First Project",
                "description": "Jump right into building with AI agents",
                "estimated_minutes": 8,
                "required": True
            })
            
        # Add integration setup for business users
        if profile["company_size"] in ["small_business", "enterprise"]:
            base_path.append({
                "stage": OnboardingStage.INTEGRATION_SETUP.value,
                "title": "Connect Your Tools",
                "description": "Integrate with your existing workflow",
                "estimated_minutes": 10,
                "required": False
            })
            
        # Add trial activation
        base_path.append({
            "stage": OnboardingStage.TRIAL_ACTIVATION.value,
            "title": "Activate Your Trial",
            "description": "Unlock full platform capabilities",
            "estimated_minutes": 3,
            "required": True
        })
        
        return base_path
        
    async def advance_onboarding_stage(self, onboarding_id: str, stage_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Advance user to next onboarding stage"""
        onboarding = await self.onboarding_collection.find_one({"onboarding_id": onboarding_id})
        if not onboarding:
            raise ValueError(f"Onboarding {onboarding_id} not found")
            
        current_stage_index = next(
            (i for i, stage in enumerate(onboarding["onboarding_path"]) 
             if stage["stage"] == onboarding["current_stage"]), 
            -1
        )
        
        if current_stage_index == -1:
            raise ValueError(f"Current stage {onboarding['current_stage']} not found in path")
            
        # Mark current stage as completed
        completed_stages = onboarding.get("stages_completed", [])
        if onboarding["current_stage"] not in completed_stages:
            completed_stages.append(onboarding["current_stage"])
            
        # Calculate completion rate
        completion_rate = len(completed_stages) / len(onboarding["onboarding_path"]) * 100
        
        # Determine next stage
        next_stage_index = current_stage_index + 1
        is_completed = next_stage_index >= len(onboarding["onboarding_path"])
        
        next_stage = None
        if not is_completed:
            next_stage = onboarding["onboarding_path"][next_stage_index]["stage"]
            
        # Update onboarding record
        update_data = {
            "stages_completed": completed_stages,
            "completion_rate": completion_rate,
            "current_step": current_stage_index + 1,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if is_completed:
            update_data.update({
                "completed": True,
                "current_stage": OnboardingStage.COMPLETED.value,
                "completed_at": datetime.now(timezone.utc)
            })
        else:
            update_data["current_stage"] = next_stage
            
        # Store stage-specific data
        if stage_data:
            update_data[f"{onboarding['current_stage']}_data"] = stage_data
            
        await self.onboarding_collection.update_one(
            {"onboarding_id": onboarding_id},
            {"$set": update_data}
        )
        
        # Trigger stage-specific actions
        await self._handle_stage_completion(onboarding_id, onboarding["current_stage"], stage_data)
        
        return {
            "current_stage": next_stage if next_stage else OnboardingStage.COMPLETED.value,
            "completion_rate": completion_rate,
            "completed": is_completed,
            "next_steps": await self._get_next_steps(next_stage) if next_stage else []
        }
        
    async def _handle_stage_completion(self, onboarding_id: str, completed_stage: str, stage_data: Dict[str, Any] = None):
        """Handle stage-specific completion actions"""
        if completed_stage == OnboardingStage.PROFILE_SETUP.value and stage_data:
            # Update user preferences based on profile setup
            await self._apply_profile_preferences(onboarding_id, stage_data)
            
        elif completed_stage == OnboardingStage.DEMO_WALKTHROUGH.value:
            # Generate sample project based on demo interactions
            await self._generate_sample_project(onboarding_id)
            
        elif completed_stage == OnboardingStage.INTEGRATION_SETUP.value and stage_data:
            # Configure selected integrations
            await self._setup_user_integrations(onboarding_id, stage_data.get("integrations", []))
            
        elif completed_stage == OnboardingStage.TRIAL_ACTIVATION.value:
            # Activate enhanced trial
            await self._activate_enhanced_trial(onboarding_id)
            
    # ONE-CLICK DEPLOYMENT AUTOMATION
    async def _setup_deployment_automation(self):
        """Setup automated deployment system"""
        await self.deployments_collection.create_index([
            ("user_id", 1),
            ("platform", 1),
            ("status", 1)
        ])
        
    async def deploy_one_click(self, user_id: str, platform: str, project_config: Dict[str, Any] = None) -> str:
        """One-click deployment to cloud platform"""
        deployment_id = str(uuid.uuid4())
        
        project_config = project_config or await self._get_default_project_config(user_id)
        
        deployment_record = {
            "deployment_id": deployment_id,
            "user_id": user_id,
            "platform": platform,
            "status": "initiating",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "completed_at": None,
            
            # Configuration
            "project_config": project_config,
            "environment_variables": await self._get_deployment_env_vars(user_id),
            "build_settings": await self._get_platform_build_settings(platform),
            
            # Deployment details
            "repository_url": None,
            "deployment_url": None,
            "build_logs": [],
            "error_message": None,
            
            # Platform-specific
            "platform_project_id": None,
            "platform_config": {}
        }
        
        await self.deployments_collection.insert_one(deployment_record)
        
        # Start deployment process asynchronously
        asyncio.create_task(self._execute_deployment(deployment_id, platform, project_config))
        
        return deployment_id
        
    async def _execute_deployment(self, deployment_id: str, platform: str, project_config: Dict[str, Any]):
        """Execute deployment process"""
        try:
            # Update status to deploying
            await self.deployments_collection.update_one(
                {"deployment_id": deployment_id},
                {"$set": {"status": "deploying", "updated_at": datetime.now(timezone.utc)}}
            )
            
            if platform == DeploymentPlatform.RAILWAY.value:
                result = await self._deploy_to_railway(deployment_id, project_config)
            elif platform == DeploymentPlatform.VERCEL.value:
                result = await self._deploy_to_vercel(deployment_id, project_config)
            elif platform == DeploymentPlatform.NETLIFY.value:
                result = await self._deploy_to_netlify(deployment_id, project_config)
            elif platform == DeploymentPlatform.HEROKU.value:
                result = await self._deploy_to_heroku(deployment_id, project_config)
            else:
                raise ValueError(f"Unsupported platform: {platform}")
                
            # Update with success
            await self.deployments_collection.update_one(
                {"deployment_id": deployment_id},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.now(timezone.utc),
                        "deployment_url": result.get("url"),
                        "platform_project_id": result.get("project_id")
                    }
                }
            )
            
        except Exception as e:
            # Update with failure
            await self.deployments_collection.update_one(
                {"deployment_id": deployment_id},
                {
                    "$set": {
                        "status": "failed",
                        "completed_at": datetime.now(timezone.utc),
                        "error_message": str(e)
                    }
                }
            )
            
    async def _deploy_to_railway(self, deployment_id: str, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy to Railway platform"""
        # This would contain actual Railway API integration
        await asyncio.sleep(2)  # Simulate deployment time
        
        return {
            "url": f"https://{deployment_id}.up.railway.app",
            "project_id": f"railway_{deployment_id[:8]}"
        }
        
    async def _deploy_to_vercel(self, deployment_id: str, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy to Vercel platform"""
        # This would contain actual Vercel API integration
        await asyncio.sleep(1.5)  # Simulate deployment time
        
        return {
            "url": f"https://{deployment_id}.vercel.app",
            "project_id": f"vercel_{deployment_id[:8]}"
        }
        
    # DEMO ENVIRONMENT SYSTEM
    async def _setup_demo_environments(self):
        """Setup demo environment management"""
        await self.demo_sessions_collection.create_index([
            ("user_id", 1),
            ("demo_type", 1),
            ("created_at", -1)
        ])
        
    async def _prepare_demo_environment(self, onboarding_id: str, user_id: str, user_profile: Dict[str, Any]):
        """Prepare personalized demo environment"""
        demo_session_id = str(uuid.uuid4())
        
        # Determine demo type based on user profile
        demo_type = await self._select_demo_type(user_profile)
        
        # Generate demo data
        demo_data = await self._generate_demo_data(user_profile)
        
        demo_session = {
            "demo_session_id": demo_session_id,
            "onboarding_id": onboarding_id,
            "user_id": user_id,
            "demo_type": demo_type.value,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "status": "active",
            
            # Demo configuration
            "demo_data": demo_data,
            "interactive_steps": await self._generate_interactive_steps(user_profile),
            "sample_projects": await self._generate_sample_projects(user_profile),
            
            # Progress tracking
            "steps_completed": 0,
            "total_steps": len(await self._generate_interactive_steps(user_profile)),
            "time_spent_minutes": 0,
            "interactions": [],
            
            # Personalization
            "user_profile": user_profile,
            "customizations": await self._generate_demo_customizations(user_profile)
        }
        
        await self.demo_sessions_collection.insert_one(demo_session)
        
        return demo_session_id
        
    async def _select_demo_type(self, user_profile: Dict[str, Any]) -> DemoEnvironmentType:
        """Select appropriate demo type based on user profile"""
        experience = user_profile.get("experience_level", "intermediate")
        time_availability = user_profile.get("time_availability", "moderate")
        
        if experience == "beginner" and time_availability == "extensive":
            return DemoEnvironmentType.GUIDED_TUTORIAL
        elif experience == "beginner":
            return DemoEnvironmentType.INTERACTIVE_TOUR
        elif experience == "advanced" or time_availability == "limited":
            return DemoEnvironmentType.SANDBOX
        else:
            return DemoEnvironmentType.SAMPLE_PROJECT
            
    async def _generate_demo_data(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate demo data tailored to user profile"""
        use_case = user_profile.get("primary_use_case", "web_development")
        
        if use_case == "web_development":
            return {
                "sample_conversation": "Create a responsive landing page for a SaaS product",
                "expected_output": "React component with Tailwind CSS styling",
                "ai_agents": ["Luna (Designer)", "Dev (Developer)"],
                "demo_files": ["App.jsx", "styles.css", "package.json"]
            }
        elif use_case == "ai_projects":
            return {
                "sample_conversation": "Build a chatbot with natural language processing",
                "expected_output": "Python application with AI integration",
                "ai_agents": ["Dev (Developer)", "Atlas (Architect)"],
                "demo_files": ["chatbot.py", "requirements.txt", "config.yaml"]
            }
        else:
            return {
                "sample_conversation": "Help me automate my workflow",
                "expected_output": "Automation script and configuration",
                "ai_agents": ["Sage (Project Manager)", "Dev (Developer)"],
                "demo_files": ["workflow.py", "automation_config.json"]
            }
            
    # ENHANCED TRIAL SYSTEM
    async def _setup_enhanced_trial_system(self):
        """Setup enhanced trial management"""
        await self.trial_management_collection.create_index([
            ("user_id", 1),
            ("trial_type", 1),
            ("status", 1)
        ])
        
    async def _activate_enhanced_trial(self, onboarding_id: str):
        """Activate enhanced trial based on onboarding progress"""
        onboarding = await self.onboarding_collection.find_one({"onboarding_id": onboarding_id})
        if not onboarding:
            return
            
        user_id = onboarding["user_id"]
        user_profile = onboarding.get("user_profile", {})
        
        # Determine trial tier based on profile and engagement
        trial_tier = await self._determine_trial_tier(user_profile, onboarding)
        
        trial_record = {
            "trial_id": str(uuid.uuid4()),
            "user_id": user_id,
            "onboarding_id": onboarding_id,
            "trial_type": trial_tier,
            "status": "active",
            "activated_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=14),  # 14-day trial
            
            # Enhanced benefits
            "token_limit": await self._get_trial_token_limit(trial_tier),
            "feature_access": await self._get_trial_features(trial_tier),
            "support_level": await self._get_trial_support_level(trial_tier),
            "personalized_onboarding": True,
            
            # Usage tracking
            "tokens_used": 0,
            "projects_created": 0,
            "ai_conversations": 0,
            "integrations_used": 0,
            "support_requests": 0,
            
            # Conversion optimization
            "conversion_score": onboarding.get("conversion_likelihood", 0.5),
            "engagement_milestones": [],
            "upgrade_reminders": []
        }
        
        await self.trial_management_collection.insert_one(trial_record)
        
        # Schedule conversion optimization activities
        await self._schedule_conversion_activities(trial_record)
        
    async def _determine_trial_tier(self, user_profile: Dict[str, Any], onboarding: Dict[str, Any]) -> str:
        """Determine appropriate trial tier"""
        company_size = user_profile.get("company_size", "individual")
        completion_rate = onboarding.get("completion_rate", 0)
        conversion_likelihood = onboarding.get("conversion_likelihood", 0.5)
        
        if company_size == "enterprise" or conversion_likelihood > 0.8:
            return "premium_trial"
        elif company_size in ["small_business", "startup"] or completion_rate > 80:
            return "enhanced_trial"
        else:
            return "standard_trial"
            
    async def _get_trial_token_limit(self, trial_tier: str) -> int:
        """Get token limit for trial tier"""
        limits = {
            "standard_trial": 100000,    # 100K tokens
            "enhanced_trial": 250000,    # 250K tokens  
            "premium_trial": 500000      # 500K tokens
        }
        return limits.get(trial_tier, 100000)
        
    # QUICK START TEMPLATES
    async def _populate_quick_start_templates(self):
        """Populate quick start templates for instant setup"""
        quick_starts = [
            {
                "template_id": "landing_page_saas",
                "name": "SaaS Landing Page",
                "description": "Complete SaaS landing page with pricing, features, and CTA",
                "category": "web_development",
                "difficulty": "beginner",
                "setup_time_minutes": 5,
                "tech_stack": ["React", "Tailwind CSS", "Framer Motion"],
                "includes": ["Responsive design", "Pricing table", "Contact forms", "SEO optimization"],
                "demo_url": "https://demo.aether.ai/landing-saas",
                "popularity_score": 95
            },
            {
                "template_id": "ai_chatbot_integration", 
                "name": "AI Chatbot Integration",
                "description": "Intelligent chatbot with natural language understanding",
                "category": "ai_projects",
                "difficulty": "intermediate", 
                "setup_time_minutes": 10,
                "tech_stack": ["Python", "FastAPI", "OpenAI", "MongoDB"],
                "includes": ["Conversation memory", "Context awareness", "Multi-language support"],
                "demo_url": "https://demo.aether.ai/chatbot",
                "popularity_score": 88
            },
            {
                "template_id": "workflow_automation",
                "name": "Workflow Automation", 
                "description": "Automate repetitive tasks with AI-powered workflows",
                "category": "automation",
                "difficulty": "intermediate",
                "setup_time_minutes": 8,
                "tech_stack": ["Node.js", "Zapier Integration", "Slack API"],
                "includes": ["Task scheduling", "Email notifications", "Data processing"],
                "demo_url": "https://demo.aether.ai/automation",
                "popularity_score": 82
            },
            {
                "template_id": "data_dashboard",
                "name": "Analytics Dashboard",
                "description": "Interactive data visualization and analytics dashboard", 
                "category": "data_analysis",
                "difficulty": "advanced",
                "setup_time_minutes": 15,
                "tech_stack": ["React", "D3.js", "Python", "PostgreSQL"],
                "includes": ["Real-time charts", "Data filtering", "Export capabilities"],
                "demo_url": "https://demo.aether.ai/dashboard",
                "popularity_score": 76
            }
        ]
        
        for template in quick_starts:
            # Check if template already exists
            existing = await self.quick_starts_collection.find_one({"template_id": template["template_id"]})
            if not existing:
                template["created_at"] = datetime.now(timezone.utc)
                template["usage_count"] = 0
                await self.quick_starts_collection.insert_one(template)
                
    async def get_quick_start_templates(self, user_profile: Dict[str, Any] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get personalized quick start templates"""
        query = {}
        sort_criteria = [("popularity_score", -1)]
        
        # Personalize based on user profile
        if user_profile:
            primary_use_case = user_profile.get("primary_use_case")
            if primary_use_case:
                query["category"] = primary_use_case
                
            experience_level = user_profile.get("experience_level")
            if experience_level == "beginner":
                query["difficulty"] = {"$in": ["beginner", "intermediate"]}
            elif experience_level == "advanced":
                # Advanced users might want all difficulty levels
                pass
                
        cursor = self.quick_starts_collection.find(query).sort(sort_criteria).limit(limit)
        templates = await cursor.to_list(length=None)
        
        return templates
        
    async def deploy_quick_start(self, template_id: str, user_id: str, customizations: Dict[str, Any] = None) -> str:
        """Deploy quick start template instantly"""
        template = await self.quick_starts_collection.find_one({"template_id": template_id})
        if not template:
            raise ValueError(f"Template {template_id} not found")
            
        # Generate project from template
        project_config = {
            "name": template["name"],
            "description": template["description"],
            "tech_stack": template["tech_stack"],
            "template_id": template_id,
            "customizations": customizations or {}
        }
        
        # Start instant deployment
        deployment_id = await self.deploy_one_click(user_id, "vercel", project_config)
        
        # Update template usage
        await self.quick_starts_collection.update_one(
            {"template_id": template_id},
            {"$inc": {"usage_count": 1}}
        )
        
        return deployment_id
        
    # ANALYTICS & OPTIMIZATION
    async def get_onboarding_analytics(self, user_id: str = None) -> Dict[str, Any]:
        """Get onboarding analytics and optimization insights"""
        query = {}
        if user_id:
            query["user_id"] = user_id
            
        # Overall completion rates
        total_onboardings = await self.onboarding_collection.count_documents(query)
        completed_onboardings = await self.onboarding_collection.count_documents({**query, "completed": True})
        
        completion_rate = (completed_onboardings / total_onboardings * 100) if total_onboardings > 0 else 0
        
        # Stage completion analysis
        pipeline = [
            {"$match": query},
            {"$unwind": "$stages_completed"},
            {"$group": {
                "_id": "$stages_completed",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        
        stage_completion = await self.onboarding_collection.aggregate(pipeline).to_list(length=None)
        
        # Drop-off points
        drop_off_analysis = await self._analyze_drop_off_points(query)
        
        # Conversion predictions
        conversion_analysis = await self._analyze_conversion_patterns(query)
        
        return {
            "overview": {
                "total_onboardings": total_onboardings,
                "completed_onboardings": completed_onboardings,
                "completion_rate": round(completion_rate, 2),
                "average_time_minutes": await self._calculate_average_completion_time(query)
            },
            "stage_performance": {item["_id"]: item["count"] for item in stage_completion},
            "drop_off_analysis": drop_off_analysis,
            "conversion_insights": conversion_analysis,
            "optimization_recommendations": await self._generate_optimization_recommendations(query)
        }
        
    async def _analyze_drop_off_points(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze where users drop off during onboarding"""
        # Implementation would analyze stage progression patterns
        return {
            "highest_drop_off_stage": "integration_setup",
            "drop_off_rate": 25.3,
            "common_reasons": ["Too many steps", "Technical complexity", "Time constraints"]
        }
        
    async def _generate_optimization_recommendations(self, query: Dict[str, Any]) -> List[str]:
        """Generate onboarding optimization recommendations"""
        return [
            "Reduce integration setup complexity by 40% to improve completion rates",
            "Add progress indicators to increase user engagement by 25%",
            "Implement smart defaults to reduce setup time by 60%",
            "Create mobile-optimized onboarding for 30% of users on mobile devices"
        ]
        
    # HELPER METHODS
    async def _predict_conversion_likelihood(self, user_profile: Dict[str, Any]) -> float:
        """Predict likelihood of trial-to-paid conversion"""
        score = 0.5  # Base score
        
        # Company size factor
        company_size = user_profile.get("company_size", "individual")
        if company_size == "enterprise":
            score += 0.3
        elif company_size in ["startup", "small_business"]:
            score += 0.2
            
        # Experience level factor
        experience = user_profile.get("experience_level", "intermediate")
        if experience == "advanced":
            score += 0.1
        elif experience == "intermediate":
            score += 0.05
            
        # Use case factor
        use_case = user_profile.get("primary_use_case", "web_development")
        if use_case in ["ai_projects", "automation"]:
            score += 0.15
            
        return min(1.0, score)
        
    async def _estimate_completion_time(self, onboarding_path: List[Dict[str, Any]]) -> int:
        """Estimate total onboarding completion time"""
        return sum(step.get("estimated_minutes", 5) for step in onboarding_path)
        
    async def _get_next_steps(self, stage: str) -> List[str]:
        """Get next steps for current onboarding stage"""
        steps = {
            OnboardingStage.WELCOME.value: [
                "Complete your profile setup",
                "Tell us about your goals",
                "Select your preferred tech stack"
            ],
            OnboardingStage.PROFILE_SETUP.value: [
                "Take the interactive demo",
                "Or skip to create your first project"
            ],
            OnboardingStage.DEMO_WALKTHROUGH.value: [
                "Create your first AI-powered project",
                "Explore available templates"
            ],
            OnboardingStage.FIRST_PROJECT.value: [
                "Connect your favorite tools",
                "Activate your extended trial"
            ]
        }
        
        return steps.get(stage, ["Continue to the next step"])


# Global enhanced onboarding instance
enhanced_onboarding = None


async def initialize_onboarding_system(db: AsyncIOMotorDatabase):
    """Initialize enhanced onboarding system"""
    global enhanced_onboarding
    enhanced_onboarding = EnhancedOnboarding(db)
    await enhanced_onboarding.initialize()


async def start_user_onboarding(user_id: str, user_data: Dict[str, Any] = None) -> str:
    """Start personalized onboarding"""
    return await enhanced_onboarding.start_onboarding(user_id, user_data)


async def advance_onboarding(onboarding_id: str, stage_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Advance onboarding stage"""
    return await enhanced_onboarding.advance_onboarding_stage(onboarding_id, stage_data)


async def deploy_instant_project(user_id: str, platform: str, project_config: Dict[str, Any] = None) -> str:
    """One-click project deployment"""
    return await enhanced_onboarding.deploy_one_click(user_id, platform, project_config)


async def get_personalized_templates(user_profile: Dict[str, Any] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """Get personalized quick start templates"""
    return await enhanced_onboarding.get_quick_start_templates(user_profile, limit)


async def deploy_template_instantly(template_id: str, user_id: str, customizations: Dict[str, Any] = None) -> str:
    """Deploy quick start template"""
    return await enhanced_onboarding.deploy_quick_start(template_id, user_id, customizations)


async def get_onboarding_insights(user_id: str = None) -> Dict[str, Any]:
    """Get onboarding analytics"""
    return await enhanced_onboarding.get_onboarding_analytics(user_id)