"""
Enhanced Onboarding System - Priority 5
One-click deployment, guided setup, and demo data population
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
import json
import uuid
import asyncio
import subprocess
from dataclasses import dataclass, asdict
import logging

class OnboardingStage(Enum):
    REGISTRATION = "registration"
    PROFILE_SETUP = "profile_setup"
    ENVIRONMENT_SETUP = "environment_setup"
    DEMO_DATA = "demo_data"
    FIRST_PROJECT = "first_project"
    FEATURE_TOUR = "feature_tour"
    DEPLOYMENT = "deployment"
    COMPLETED = "completed"

class DeploymentProvider(Enum):
    RAILWAY = "railway"
    VERCEL = "vercel"
    NETLIFY = "netlify"
    HEROKU = "heroku"
    AWS = "aws"
    DOCKER = "docker"

class OnboardingStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    FAILED = "failed"

@dataclass
class OnboardingSession:
    session_id: str
    user_id: str
    current_stage: OnboardingStage
    completed_stages: List[OnboardingStage]
    started_at: datetime
    updated_at: datetime
    estimated_completion: datetime
    preferences: Dict[str, Any]
    progress_percentage: float = 0.0

@dataclass
class DeploymentConfig:
    provider: DeploymentProvider
    app_name: str
    environment: str
    config_vars: Dict[str, str]
    domain: Optional[str] = None
    auto_deploy: bool = True

class EnhancedOnboardingSystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.onboarding_sessions: Dict[str, OnboardingSession] = {}
        self.demo_templates = self._initialize_demo_templates()
        self.deployment_providers = self._initialize_deployment_providers()
        self.guided_steps = self._initialize_guided_steps()
        
    def _initialize_demo_templates(self) -> Dict[str, Dict]:
        """Initialize demo project templates"""
        return {
            "portfolio_website": {
                "name": "Personal Portfolio",
                "description": "Modern portfolio website with project showcase",
                "tech_stack": ["React", "Tailwind CSS", "Node.js"],
                "demo_data": {
                    "projects": [
                        {
                            "name": "E-commerce Platform",
                            "description": "Full-stack e-commerce solution",
                            "status": "completed",
                            "technologies": ["React", "Node.js", "MongoDB"]
                        },
                        {
                            "name": "Task Management App", 
                            "description": "Collaborative task management tool",
                            "status": "in_progress",
                            "technologies": ["Vue.js", "Express.js", "PostgreSQL"]
                        }
                    ],
                    "skills": ["JavaScript", "Python", "React", "Node.js", "MongoDB"],
                    "experience": "3 years"
                },
                "deployment_ready": True
            },
            "saas_dashboard": {
                "name": "SaaS Analytics Dashboard",
                "description": "Business intelligence dashboard for SaaS metrics",
                "tech_stack": ["React", "Chart.js", "FastAPI", "PostgreSQL"],
                "demo_data": {
                    "metrics": [
                        {"name": "Monthly Active Users", "value": 12500, "growth": 15.2},
                        {"name": "Revenue", "value": 45600, "growth": 23.8},
                        {"name": "Churn Rate", "value": 4.2, "growth": -8.5}
                    ],
                    "charts": ["revenue_trend", "user_acquisition", "feature_usage"],
                    "time_periods": ["last_7_days", "last_30_days", "last_90_days"]
                },
                "deployment_ready": True
            },
            "blog_platform": {
                "name": "Modern Blog Platform",
                "description": "SEO-optimized blog with CMS features",
                "tech_stack": ["Next.js", "Markdown", "Prisma", "SQLite"],
                "demo_data": {
                    "posts": [
                        {
                            "title": "Getting Started with AI Development",
                            "content": "A comprehensive guide to building AI applications...",
                            "published": True,
                            "views": 1250,
                            "tags": ["AI", "Development", "Tutorial"]
                        },
                        {
                            "title": "The Future of Web Development",
                            "content": "Exploring upcoming trends in web technology...",
                            "published": True,
                            "views": 890,
                            "tags": ["Web", "Trends", "Technology"]
                        }
                    ],
                    "categories": ["Technology", "Tutorials", "Opinion"],
                    "author_info": {"name": "Demo Author", "bio": "Tech enthusiast and blogger"}
                },
                "deployment_ready": True
            }
        }
    
    def _initialize_deployment_providers(self) -> Dict[str, Dict]:
        """Initialize deployment provider configurations"""
        return {
            "railway": {
                "name": "Railway",
                "description": "Deploy with Railway - Simple and fast",
                "one_click": True,
                "estimated_time": "3-5 minutes",
                "requirements": ["GitHub account", "Railway account"],
                "pricing": "Free tier available",
                "supports": ["Node.js", "Python", "React", "Static sites"]
            },
            "vercel": {
                "name": "Vercel", 
                "description": "Deploy with Vercel - Perfect for frontend apps",
                "one_click": True,
                "estimated_time": "2-3 minutes",
                "requirements": ["GitHub account", "Vercel account"],
                "pricing": "Generous free tier",
                "supports": ["React", "Next.js", "Vue.js", "Static sites"]
            },
            "netlify": {
                "name": "Netlify",
                "description": "Deploy with Netlify - Great for static sites",
                "one_click": True,
                "estimated_time": "2-4 minutes", 
                "requirements": ["GitHub account", "Netlify account"],
                "pricing": "Free tier for personal projects",
                "supports": ["Static sites", "JAMstack", "Serverless functions"]
            },
            "docker": {
                "name": "Docker Container",
                "description": "Containerized deployment for any environment",
                "one_click": False,
                "estimated_time": "5-10 minutes",
                "requirements": ["Docker installed", "Container registry"],
                "pricing": "Depends on hosting provider",
                "supports": ["All technologies", "Custom environments"]
            }
        }
    
    def _initialize_guided_steps(self) -> Dict[OnboardingStage, Dict]:
        """Initialize guided onboarding steps"""
        return {
            OnboardingStage.REGISTRATION: {
                "title": "Welcome to Aether AI",
                "description": "Complete your account setup",
                "tasks": [
                    "Verify email address",
                    "Set up profile information",
                    "Choose subscription plan"
                ],
                "estimated_time": 3
            },
            OnboardingStage.PROFILE_SETUP: {
                "title": "Personalize Your Experience", 
                "description": "Tell us about your development preferences",
                "tasks": [
                    "Select primary programming languages",
                    "Choose development experience level", 
                    "Set project type preferences"
                ],
                "estimated_time": 2
            },
            OnboardingStage.ENVIRONMENT_SETUP: {
                "title": "Development Environment",
                "description": "Configure your development workspace",
                "tasks": [
                    "Connect Git repositories",
                    "Set up API integrations",
                    "Configure development tools"
                ],
                "estimated_time": 5
            },
            OnboardingStage.DEMO_DATA: {
                "title": "Explore with Demo Data",
                "description": "Get started with sample projects and data",
                "tasks": [
                    "Choose demo template",
                    "Populate sample data",
                    "Explore features with examples"
                ],
                "estimated_time": 3
            },
            OnboardingStage.FIRST_PROJECT: {
                "title": "Create Your First Project",
                "description": "Build something amazing",
                "tasks": [
                    "Select project template",
                    "Configure project settings",
                    "Initialize development environment"
                ],
                "estimated_time": 7
            },
            OnboardingStage.FEATURE_TOUR: {
                "title": "Platform Tour",
                "description": "Discover key features and capabilities",
                "tasks": [
                    "AI assistance features",
                    "Collaboration tools",
                    "Deployment options"
                ],
                "estimated_time": 5
            },
            OnboardingStage.DEPLOYMENT: {
                "title": "Deploy Your App",
                "description": "Make your project live",
                "tasks": [
                    "Choose deployment provider",
                    "Configure deployment settings",
                    "Deploy and verify"
                ],
                "estimated_time": 10
            }
        }
    
    async def start_onboarding(self, user_id: str, preferences: Dict = None) -> Dict:
        """Start guided onboarding process"""
        session_id = str(uuid.uuid4())
        
        # Calculate estimated completion time
        total_time = sum(step["estimated_time"] for step in self.guided_steps.values())
        estimated_completion = datetime.utcnow() + timedelta(minutes=total_time)
        
        session = OnboardingSession(
            session_id=session_id,
            user_id=user_id,
            current_stage=OnboardingStage.REGISTRATION,
            completed_stages=[],
            started_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            estimated_completion=estimated_completion,
            preferences=preferences or {}
        )
        
        self.onboarding_sessions[session_id] = session
        
        self.logger.info(f"Started onboarding for user {user_id}: {session_id}")
        return {
            "status": "success",
            "session_id": session_id,
            "current_stage": session.current_stage.value,
            "estimated_time_minutes": total_time,
            "estimated_completion": estimated_completion.isoformat(),
            "next_steps": await self._get_stage_instructions(OnboardingStage.REGISTRATION)
        }
    
    async def _get_stage_instructions(self, stage: OnboardingStage) -> Dict:
        """Get instructions for onboarding stage"""
        if stage not in self.guided_steps:
            return {"title": "Unknown Stage", "tasks": []}
            
        stage_info = self.guided_steps[stage]
        return {
            "title": stage_info["title"],
            "description": stage_info["description"], 
            "tasks": stage_info["tasks"],
            "estimated_time": stage_info["estimated_time"]
        }
    
    async def complete_stage(self, session_id: str, stage_data: Dict = None) -> Dict:
        """Complete current onboarding stage"""
        if session_id not in self.onboarding_sessions:
            return {"status": "error", "message": "Onboarding session not found"}
            
        session = self.onboarding_sessions[session_id]
        current_stage = session.current_stage
        
        # Process stage-specific data
        await self._process_stage_completion(session, current_stage, stage_data or {})
        
        # Mark stage as completed
        session.completed_stages.append(current_stage)
        
        # Determine next stage
        next_stage = await self._get_next_stage(current_stage)
        session.current_stage = next_stage
        
        # Update progress
        session.progress_percentage = (len(session.completed_stages) / len(OnboardingStage)) * 100
        session.updated_at = datetime.utcnow()
        
        result = {
            "status": "success",
            "completed_stage": current_stage.value,
            "progress_percentage": session.progress_percentage,
            "session_updated": session.updated_at.isoformat()
        }
        
        if next_stage != OnboardingStage.COMPLETED:
            result["next_stage"] = next_stage.value
            result["next_steps"] = await self._get_stage_instructions(next_stage)
        else:
            result["onboarding_completed"] = True
            result["completion_summary"] = await self._generate_completion_summary(session)
            
        return result
    
    async def _process_stage_completion(self, session: OnboardingSession, 
                                      stage: OnboardingStage, stage_data: Dict):
        """Process stage-specific completion logic"""
        if stage == OnboardingStage.PROFILE_SETUP:
            session.preferences.update(stage_data)
            
        elif stage == OnboardingStage.DEMO_DATA:
            demo_template = stage_data.get("selected_template")
            if demo_template:
                await self._populate_demo_data(session.user_id, demo_template)
                
        elif stage == OnboardingStage.FIRST_PROJECT:
            project_config = stage_data.get("project_config", {})
            await self._create_first_project(session.user_id, project_config)
            
        elif stage == OnboardingStage.DEPLOYMENT:
            deployment_config = stage_data.get("deployment_config", {})
            await self._initiate_deployment(session.user_id, deployment_config)
    
    async def _get_next_stage(self, current_stage: OnboardingStage) -> OnboardingStage:
        """Determine next onboarding stage"""
        stages = list(OnboardingStage)
        current_index = stages.index(current_stage)
        
        if current_index < len(stages) - 1:
            return stages[current_index + 1]
        else:
            return OnboardingStage.COMPLETED
    
    async def _populate_demo_data(self, user_id: str, template_id: str):
        """Populate demo data for selected template"""
        if template_id not in self.demo_templates:
            self.logger.warning(f"Demo template not found: {template_id}")
            return
            
        template = self.demo_templates[template_id]
        demo_data = template["demo_data"]
        
        # Simulate creating demo projects and data
        self.logger.info(f"Populated demo data for user {user_id} using template {template_id}")
        
        # In production, this would:
        # - Create sample projects in database
        # - Populate with demo content
        # - Set up example integrations
    
    async def _create_first_project(self, user_id: str, project_config: Dict):
        """Create user's first project"""
        project_name = project_config.get("name", "My First Project")
        template = project_config.get("template", "basic_web_app")
        
        # Simulate project creation
        project_id = str(uuid.uuid4())
        
        self.logger.info(f"Created first project for user {user_id}: {project_name}")
        
        # In production, this would:
        # - Create project in database
        # - Initialize git repository
        # - Set up project structure
        # - Configure development environment
        
        return project_id
    
    async def _initiate_deployment(self, user_id: str, deployment_config: Dict):
        """Initiate one-click deployment"""
        provider = deployment_config.get("provider", "railway")
        project_name = deployment_config.get("project_name", "my-app")
        
        if provider not in self.deployment_providers:
            self.logger.error(f"Unsupported deployment provider: {provider}")
            return
        
        # Simulate deployment initiation
        deployment_id = str(uuid.uuid4())
        
        self.logger.info(f"Initiated deployment for user {user_id} on {provider}")
        
        # In production, this would:
        # - Connect to deployment provider API
        # - Create deployment configuration  
        # - Trigger deployment process
        # - Monitor deployment status
        
        return deployment_id
    
    async def _generate_completion_summary(self, session: OnboardingSession) -> Dict:
        """Generate onboarding completion summary"""
        completion_time = datetime.utcnow() - session.started_at
        
        return {
            "user_id": session.user_id,
            "completed_at": datetime.utcnow().isoformat(),
            "total_time_minutes": round(completion_time.total_seconds() / 60, 2),
            "stages_completed": len(session.completed_stages),
            "preferences_set": len(session.preferences),
            "demo_data_populated": OnboardingStage.DEMO_DATA in session.completed_stages,
            "first_project_created": OnboardingStage.FIRST_PROJECT in session.completed_stages,
            "deployment_configured": OnboardingStage.DEPLOYMENT in session.completed_stages,
            "next_recommended_actions": [
                "Explore AI features",
                "Invite team members",
                "Connect integrations",
                "Customize workspace"
            ]
        }
    
    async def get_onboarding_status(self, session_id: str) -> Dict:
        """Get current onboarding status"""
        if session_id not in self.onboarding_sessions:
            return {"status": "error", "message": "Onboarding session not found"}
            
        session = self.onboarding_sessions[session_id]
        
        return {
            "status": "success",
            "session": {
                "session_id": session.session_id,
                "user_id": session.user_id,
                "current_stage": session.current_stage.value,
                "progress_percentage": session.progress_percentage,
                "completed_stages": [stage.value for stage in session.completed_stages],
                "started_at": session.started_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
                "estimated_completion": session.estimated_completion.isoformat()
            },
            "current_stage_info": await self._get_stage_instructions(session.current_stage),
            "remaining_stages": len(OnboardingStage) - len(session.completed_stages) - 1
        }
    
    async def skip_stage(self, session_id: str, reason: str = None) -> Dict:
        """Skip current onboarding stage"""
        if session_id not in self.onboarding_sessions:
            return {"status": "error", "message": "Onboarding session not found"}
            
        session = self.onboarding_sessions[session_id]
        current_stage = session.current_stage
        
        # Log skip reason
        self.logger.info(f"Skipped stage {current_stage.value} for session {session_id}: {reason}")
        
        # Move to next stage without completing current one
        next_stage = await self._get_next_stage(current_stage)
        session.current_stage = next_stage
        session.updated_at = datetime.utcnow()
        
        return {
            "status": "success",
            "skipped_stage": current_stage.value,
            "next_stage": next_stage.value if next_stage != OnboardingStage.COMPLETED else "completed",
            "next_steps": await self._get_stage_instructions(next_stage) if next_stage != OnboardingStage.COMPLETED else None
        }
    
    async def get_demo_templates(self) -> Dict:
        """Get available demo templates"""
        templates = []
        for template_id, template in self.demo_templates.items():
            templates.append({
                "id": template_id,
                "name": template["name"],
                "description": template["description"],
                "tech_stack": template["tech_stack"],
                "deployment_ready": template["deployment_ready"],
                "demo_features": list(template["demo_data"].keys())
            })
            
        return {
            "status": "success",
            "templates": templates,
            "total_count": len(templates)
        }
    
    async def get_deployment_options(self) -> Dict:
        """Get available one-click deployment options"""
        providers = []
        for provider_id, provider in self.deployment_providers.items():
            providers.append({
                "id": provider_id,
                "name": provider["name"],
                "description": provider["description"],
                "one_click": provider["one_click"],
                "estimated_time": provider["estimated_time"],
                "requirements": provider["requirements"],
                "pricing": provider["pricing"],
                "supports": provider["supports"]
            })
            
        return {
            "status": "success",
            "providers": providers,
            "recommended": "railway"  # Default recommendation
        }
    
    async def one_click_deploy(self, user_id: str, config: DeploymentConfig) -> Dict:
        """Execute one-click deployment"""
        deployment_id = str(uuid.uuid4())
        
        # Simulate deployment process
        deployment_steps = [
            "Preparing deployment environment",
            "Building application",
            "Deploying to " + config.provider.value,
            "Configuring domain and SSL",
            "Running health checks"
        ]
        
        # In production, this would:
        # 1. Connect to provider API
        # 2. Create/configure app
        # 3. Deploy code
        # 4. Set up environment variables
        # 5. Configure custom domain if provided
        # 6. Monitor deployment status
        
        deployment_result = {
            "deployment_id": deployment_id,
            "status": "success",
            "provider": config.provider.value,
            "app_name": config.app_name,
            "environment": config.environment,
            "deployed_at": datetime.utcnow().isoformat(),
            "deployment_url": f"https://{config.app_name}-{deployment_id[:8]}.{config.provider.value}.app",
            "steps_completed": deployment_steps,
            "estimated_cost": "$0/month (free tier)" if config.provider in [DeploymentProvider.RAILWAY, DeploymentProvider.VERCEL] else "Variable"
        }
        
        # Add custom domain if provided
        if config.domain:
            deployment_result["custom_domain"] = config.domain
            deployment_result["domain_setup_required"] = True
            
        self.logger.info(f"One-click deployment completed for user {user_id}: {deployment_id}")
        
        return {
            "status": "success",
            "deployment": deployment_result
        }
    
    async def get_setup_wizard_config(self, user_preferences: Dict = None) -> Dict:
        """Get personalized setup wizard configuration"""
        preferences = user_preferences or {}
        
        # Customize setup based on user preferences
        experience_level = preferences.get("experience_level", "beginner")
        primary_language = preferences.get("primary_language", "javascript")
        project_type = preferences.get("project_type", "web_app")
        
        # Recommended configuration based on preferences
        recommended_config = {
            "templates": await self._get_recommended_templates(experience_level, primary_language, project_type),
            "integrations": await self._get_recommended_integrations(project_type),
            "deployment": await self._get_recommended_deployment(experience_level),
            "timeline": await self._estimate_setup_timeline(experience_level)
        }
        
        return {
            "status": "success",
            "personalized_config": recommended_config,
            "setup_wizard_steps": len(self.guided_steps),
            "estimated_total_time": recommended_config["timeline"]["total_minutes"]
        }
    
    async def _get_recommended_templates(self, experience: str, language: str, project_type: str) -> List[Dict]:
        """Get recommended templates based on user preferences"""
        # Filter templates based on preferences
        recommended = []
        
        for template_id, template in self.demo_templates.items():
            tech_stack = [tech.lower() for tech in template["tech_stack"]]
            
            # Match based on language and project type
            if language.lower() in str(tech_stack).lower():
                recommended.append({
                    "id": template_id,
                    "name": template["name"],
                    "match_score": 0.9,
                    "reason": f"Matches your {language} preference"
                })
            elif project_type in template_id or project_type in template["name"].lower():
                recommended.append({
                    "id": template_id,
                    "name": template["name"],
                    "match_score": 0.7,
                    "reason": f"Matches your {project_type} project type"
                })
                
        # Sort by match score
        recommended.sort(key=lambda x: x["match_score"], reverse=True)
        return recommended[:3]  # Top 3 recommendations
    
    async def _get_recommended_integrations(self, project_type: str) -> List[Dict]:
        """Get recommended integrations for project type"""
        integration_map = {
            "web_app": ["authentication", "database", "analytics"],
            "saas": ["payment", "authentication", "email", "analytics"],
            "blog": ["cms", "seo", "analytics", "comments"],
            "ecommerce": ["payment", "inventory", "shipping", "analytics"]
        }
        
        integrations = integration_map.get(project_type, ["authentication", "database"])
        
        return [
            {
                "name": integration,
                "priority": "high" if integration in ["authentication", "database"] else "medium",
                "setup_time": "2-5 minutes"
            }
            for integration in integrations
        ]
    
    async def _get_recommended_deployment(self, experience: str) -> Dict:
        """Get recommended deployment based on experience"""
        if experience == "beginner":
            return {
                "provider": "railway",
                "reason": "Easiest setup and great free tier",
                "complexity": "low"
            }
        elif experience == "intermediate":
            return {
                "provider": "vercel",
                "reason": "Great for frontend apps with serverless functions",
                "complexity": "medium"
            }
        else:
            return {
                "provider": "aws",
                "reason": "Full control and enterprise features",
                "complexity": "high"
            }
    
    async def _estimate_setup_timeline(self, experience: str) -> Dict:
        """Estimate setup timeline based on experience"""
        base_times = {
            "beginner": {"multiplier": 1.5, "extra_help_time": 10},
            "intermediate": {"multiplier": 1.0, "extra_help_time": 5},
            "expert": {"multiplier": 0.7, "extra_help_time": 0}
        }
        
        config = base_times.get(experience, base_times["intermediate"])
        base_total = sum(step["estimated_time"] for step in self.guided_steps.values())
        
        adjusted_total = (base_total * config["multiplier"]) + config["extra_help_time"]
        
        return {
            "total_minutes": round(adjusted_total),
            "estimated_sessions": max(1, round(adjusted_total / 30)),  # 30-minute sessions
            "can_complete_today": adjusted_total <= 60,
            "experience_adjustment": config["multiplier"]
        }