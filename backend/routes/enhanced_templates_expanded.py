"""
Enhanced Templates System - Expanded Library
Expand from 6 to 25+ professional templates with intelligent categorization
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
from routes.auth import get_current_user
from models.database import get_database
from services.groq_ai_service import GroqAIService
import uuid

router = APIRouter()

class TemplateMetadata(BaseModel):
    name: str
    description: str
    category: str
    subcategory: str
    difficulty: str  # beginner, intermediate, advanced, expert
    estimated_time: str
    tech_stack: List[str]
    features: List[str]
    use_cases: List[str]
    requirements: Dict[str, Any]
    rating: float = 4.0
    download_count: int = 0
    tags: List[str] = []

class EnhancedTemplate(BaseModel):
    id: str
    metadata: TemplateMetadata
    file_structure: Dict[str, Any]
    starter_code: Dict[str, str]  # filename -> code content
    configuration_files: Dict[str, str]
    documentation: str
    setup_instructions: List[str]
    customization_options: Dict[str, Any]
    ai_generated: bool = True
    created_at: datetime
    updated_at: datetime

class TemplateRequest(BaseModel):
    description: str
    tech_stack: Optional[List[str]] = []
    complexity: Optional[str] = "intermediate"
    features: Optional[List[str]] = []
    industry: Optional[str] = "general"

class EnhancedTemplateService:
    def __init__(self):
        self.ai_service = GroqAIService()
        self.template_categories = {
            "Web Applications": {
                "subcategories": ["SaaS Platforms", "E-commerce", "Portfolios", "Blogs", "Dashboards"],
                "tech_stacks": ["React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js"]
            },
            "Mobile Applications": {
                "subcategories": ["Native iOS", "Native Android", "Cross-Platform", "PWA"],
                "tech_stacks": ["React Native", "Flutter", "Swift", "Kotlin", "Ionic"]
            },
            "Backend Services": {
                "subcategories": ["REST APIs", "GraphQL APIs", "Microservices", "Serverless"],
                "tech_stacks": ["FastAPI", "Express.js", "Django", "Spring Boot", "NestJS"]
            },
            "AI/ML Applications": {
                "subcategories": ["Machine Learning", "Computer Vision", "NLP", "Data Science"],
                "tech_stacks": ["Python", "TensorFlow", "PyTorch", "Jupyter", "Streamlit"]
            },
            "DevOps & Infrastructure": {
                "subcategories": ["CI/CD Pipelines", "Containerization", "Monitoring", "Security"],
                "tech_stacks": ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "Ansible"]
            },
            "Blockchain & Web3": {
                "subcategories": ["Smart Contracts", "DApps", "NFT Platforms", "DeFi"],
                "tech_stacks": ["Solidity", "Web3.js", "Ethers.js", "Hardhat", "Truffle"]
            },
            "Desktop Applications": {
                "subcategories": ["Cross-Platform", "Native Windows", "Native macOS", "Native Linux"],
                "tech_stacks": ["Electron", "Tauri", "Qt", "WPF", ".NET MAUI"]
            }
        }
    
    async def generate_comprehensive_template_library(self) -> List[EnhancedTemplate]:
        """Generate 25+ professional templates using AI"""
        
        templates = []
        template_specifications = [
            # Web Applications (8 templates)
            {
                "name": "Modern SaaS Starter",
                "description": "Complete SaaS platform with authentication, billing, and multi-tenancy",
                "category": "Web Applications",
                "subcategory": "SaaS Platforms",
                "tech_stack": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Stripe"],
                "difficulty": "advanced",
                "features": ["user_auth", "subscription_billing", "multi_tenancy", "admin_dashboard", "api_keys"]
            },
            {
                "name": "E-commerce Marketplace",
                "description": "Full-featured e-commerce platform with vendor management",
                "category": "Web Applications", 
                "subcategory": "E-commerce",
                "tech_stack": ["Next.js", "TypeScript", "Node.js", "MongoDB", "Stripe", "AWS S3"],
                "difficulty": "expert",
                "features": ["product_catalog", "vendor_portal", "payment_processing", "inventory_management", "reviews"]
            },
            {
                "name": "Creative Portfolio",
                "description": "Stunning portfolio website for creatives and agencies",
                "category": "Web Applications",
                "subcategory": "Portfolios", 
                "tech_stack": ["React", "Framer Motion", "Sanity CMS", "Vercel"],
                "difficulty": "intermediate",
                "features": ["cms_integration", "animations", "responsive_design", "seo_optimized", "contact_forms"]
            },
            {
                "name": "Modern Blog Platform",
                "description": "Feature-rich blogging platform with editor and analytics",
                "category": "Web Applications",
                "subcategory": "Blogs",
                "tech_stack": ["Next.js", "MDX", "Prisma", "PostgreSQL", "Vercel Analytics"],
                "difficulty": "intermediate", 
                "features": ["rich_editor", "analytics", "comments", "newsletter", "seo_tools"]
            },
            {
                "name": "Analytics Dashboard",
                "description": "Real-time analytics dashboard with charts and reports",
                "category": "Web Applications",
                "subcategory": "Dashboards",
                "tech_stack": ["React", "D3.js", "Chart.js", "FastAPI", "Redis"],
                "difficulty": "advanced",
                "features": ["real_time_data", "custom_charts", "export_reports", "alerts", "user_management"]
            },
            {
                "name": "Task Management App",
                "description": "Collaborative task management with real-time updates",
                "category": "Web Applications",
                "subcategory": "SaaS Platforms",
                "tech_stack": ["Vue.js", "Socket.io", "Express.js", "MongoDB"],
                "difficulty": "intermediate",
                "features": ["real_time_collaboration", "kanban_boards", "notifications", "time_tracking", "team_management"]
            },
            {
                "name": "Learning Management System",
                "description": "Complete LMS with courses, quizzes, and progress tracking",
                "category": "Web Applications",
                "subcategory": "SaaS Platforms",
                "tech_stack": ["React", "Node.js", "PostgreSQL", "AWS S3", "FFmpeg"],
                "difficulty": "expert",
                "features": ["course_creation", "video_streaming", "quiz_engine", "progress_tracking", "certificates"]
            },
            {
                "name": "Social Media Platform",
                "description": "Modern social platform with posts, messaging, and feeds",
                "category": "Web Applications",
                "subcategory": "SaaS Platforms", 
                "tech_stack": ["React", "GraphQL", "Node.js", "PostgreSQL", "Redis", "Socket.io"],
                "difficulty": "expert",
                "features": ["user_profiles", "posts", "messaging", "news_feed", "notifications", "media_uploads"]
            },
            
            # Mobile Applications (4 templates)
            {
                "name": "React Native Starter",
                "description": "Cross-platform mobile app with navigation and state management",
                "category": "Mobile Applications",
                "subcategory": "Cross-Platform",
                "tech_stack": ["React Native", "TypeScript", "Redux Toolkit", "React Navigation"],
                "difficulty": "intermediate",
                "features": ["navigation", "state_management", "async_storage", "push_notifications", "biometric_auth"]
            },
            {
                "name": "Flutter E-commerce",
                "description": "Beautiful e-commerce mobile app with Flutter",
                "category": "Mobile Applications",
                "subcategory": "Cross-Platform",
                "tech_stack": ["Flutter", "Dart", "Firebase", "Stripe"],
                "difficulty": "advanced",
                "features": ["product_catalog", "cart", "payments", "user_auth", "push_notifications"]
            },
            {
                "name": "Fitness Tracking App",
                "description": "Health and fitness tracking with workouts and nutrition",
                "category": "Mobile Applications",
                "subcategory": "Cross-Platform",
                "tech_stack": ["React Native", "TypeScript", "SQLite", "Chart.js"],
                "difficulty": "advanced",
                "features": ["workout_tracking", "nutrition_logging", "progress_charts", "social_features", "wearable_sync"]
            },
            {
                "name": "Progressive Web App",
                "description": "PWA starter with offline capabilities and push notifications",
                "category": "Mobile Applications",
                "subcategory": "PWA",
                "tech_stack": ["React", "Service Worker", "IndexedDB", "Web Push API"],
                "difficulty": "intermediate",
                "features": ["offline_mode", "push_notifications", "install_prompt", "background_sync", "responsive_design"]
            },
            
            # Backend Services (5 templates)
            {
                "name": "FastAPI Microservice",
                "description": "Production-ready microservice with authentication and monitoring",
                "category": "Backend Services",
                "subcategory": "Microservices",
                "tech_stack": ["FastAPI", "Python", "PostgreSQL", "Redis", "Docker"],
                "difficulty": "advanced",
                "features": ["jwt_auth", "rate_limiting", "monitoring", "health_checks", "async_operations"]
            },
            {
                "name": "GraphQL API Server",
                "description": "Modern GraphQL API with subscriptions and real-time updates",
                "category": "Backend Services", 
                "subcategory": "GraphQL APIs",
                "tech_stack": ["GraphQL", "Apollo Server", "Node.js", "PostgreSQL", "Redis"],
                "difficulty": "advanced",
                "features": ["schema_federation", "subscriptions", "dataloader", "authentication", "caching"]
            },
            {
                "name": "Serverless Functions",
                "description": "Serverless API with AWS Lambda and API Gateway",
                "category": "Backend Services",
                "subcategory": "Serverless",
                "tech_stack": ["AWS Lambda", "API Gateway", "DynamoDB", "Node.js"],
                "difficulty": "intermediate", 
                "features": ["auto_scaling", "pay_per_use", "event_driven", "cors_handling", "error_handling"]
            },
            {
                "name": "Real-time Chat API",
                "description": "WebSocket-based chat API with rooms and messaging",
                "category": "Backend Services",
                "subcategory": "REST APIs",
                "tech_stack": ["Socket.io", "Express.js", "MongoDB", "Redis"],
                "difficulty": "advanced",
                "features": ["real_time_messaging", "chat_rooms", "user_presence", "message_history", "file_sharing"]
            },
            {
                "name": "Authentication Service",
                "description": "Comprehensive authentication microservice with OAuth",
                "category": "Backend Services",
                "subcategory": "Microservices",
                "tech_stack": ["FastAPI", "OAuth2", "JWT", "PostgreSQL", "Redis"],
                "difficulty": "advanced",
                "features": ["oauth_providers", "jwt_tokens", "refresh_tokens", "2fa", "password_reset"]
            },
            
            # AI/ML Applications (4 templates)
            {
                "name": "Computer Vision API",
                "description": "Image processing and analysis API with ML models",
                "category": "AI/ML Applications",
                "subcategory": "Computer Vision",
                "tech_stack": ["Python", "OpenCV", "TensorFlow", "FastAPI", "NumPy"],
                "difficulty": "expert",
                "features": ["image_classification", "object_detection", "face_recognition", "image_enhancement", "batch_processing"]
            },
            {
                "name": "Chatbot Platform",
                "description": "AI chatbot with NLP and conversation management",
                "category": "AI/ML Applications",
                "subcategory": "NLP",
                "tech_stack": ["Python", "spaCy", "Transformers", "FastAPI", "PostgreSQL"],
                "difficulty": "expert",
                "features": ["intent_recognition", "entity_extraction", "conversation_flow", "training_interface", "analytics"]
            },
            {
                "name": "Data Science Dashboard",
                "description": "Interactive data analysis and visualization platform",
                "category": "AI/ML Applications", 
                "subcategory": "Data Science",
                "tech_stack": ["Streamlit", "Pandas", "Plotly", "Scikit-learn", "Python"],
                "difficulty": "intermediate",
                "features": ["data_upload", "visualization", "statistical_analysis", "ml_models", "export_reports"]
            },
            {
                "name": "Recommendation Engine",
                "description": "ML-powered recommendation system with collaborative filtering",
                "category": "AI/ML Applications",
                "subcategory": "Machine Learning", 
                "tech_stack": ["Python", "Scikit-learn", "Pandas", "FastAPI", "Redis"],
                "difficulty": "expert",
                "features": ["collaborative_filtering", "content_based", "hybrid_recommendations", "real_time_updates", "a_b_testing"]
            },
            
            # Blockchain & Web3 (2 templates)
            {
                "name": "DeFi Staking Platform",
                "description": "Decentralized staking platform with smart contracts",
                "category": "Blockchain & Web3",
                "subcategory": "DeFi",
                "tech_stack": ["Solidity", "React", "Web3.js", "Hardhat", "IPFS"],
                "difficulty": "expert", 
                "features": ["staking_contracts", "reward_distribution", "governance_tokens", "liquidity_pools", "yield_farming"]
            },
            {
                "name": "NFT Marketplace",
                "description": "Complete NFT marketplace with minting and trading",
                "category": "Blockchain & Web3",
                "subcategory": "NFT Platforms",
                "tech_stack": ["Solidity", "React", "Web3.js", "IPFS", "OpenSea API"],
                "difficulty": "expert",
                "features": ["nft_minting", "marketplace", "auctions", "royalties", "metadata_standards"]
            },
            
            # Desktop Applications (2 templates)
            {
                "name": "Electron Desktop App",
                "description": "Cross-platform desktop application with native features",
                "category": "Desktop Applications", 
                "subcategory": "Cross-Platform",
                "tech_stack": ["Electron", "React", "TypeScript", "SQLite"],
                "difficulty": "advanced",
                "features": ["native_menus", "file_system", "auto_updater", "notifications", "system_tray"]
            },
            {
                "name": "Tauri Lightweight App",
                "description": "Lightweight desktop app built with Rust and web technologies",
                "category": "Desktop Applications",
                "subcategory": "Cross-Platform", 
                "tech_stack": ["Tauri", "React", "Rust", "TypeScript"],
                "difficulty": "advanced",
                "features": ["small_bundle_size", "native_performance", "security_focused", "cross_platform", "system_integration"]
            }
        ]
        
        # Generate each template using AI
        for spec in template_specifications:
            try:
                template = await self._generate_template_from_spec(spec)
                templates.append(template)
            except Exception as e:
                print(f"Failed to generate template {spec['name']}: {str(e)}")
                continue
        
        return templates
    
    async def _generate_template_from_spec(self, spec: Dict[str, Any]) -> EnhancedTemplate:
        """Generate a complete template from specification using AI"""
        
        generation_prompt = f"""
        Generate a complete, production-ready template based on this specification:
        
        TEMPLATE SPEC: {json.dumps(spec, indent=2)}
        
        Create a comprehensive template with:
        
        1. COMPLETE FILE STRUCTURE (folders and files)
        2. STARTER CODE for key files (at least 5-8 files)
        3. CONFIGURATION FILES (package.json, requirements.txt, etc.)
        4. SETUP INSTRUCTIONS (step-by-step)
        5. DOCUMENTATION (README with examples)
        6. CUSTOMIZATION OPTIONS
        
        Return JSON in this exact format:
        {{
            "metadata": {{
                "name": "{spec['name']}",
                "description": "{spec['description']}",
                "category": "{spec['category']}", 
                "subcategory": "{spec['subcategory']}",
                "difficulty": "{spec['difficulty']}",
                "estimated_time": "X hours",
                "tech_stack": {spec['tech_stack']},
                "features": {spec['features']},
                "use_cases": ["use_case_1", "use_case_2", "use_case_3"],
                "requirements": {{"node_version": ">=16", "python_version": ">=3.8"}},
                "rating": 4.8,
                "tags": ["modern", "production_ready", "scalable"]
            }},
            "file_structure": {{
                "src/": {{
                    "components/": {{}},
                    "pages/": {{}},
                    "utils/": {{}},
                    "services/": {{}}
                }},
                "public/": {{}},
                "tests/": {{}},
                "docs/": {{}}
            }},
            "starter_code": {{
                "src/main.js": "// Main application entry point code here",
                "src/components/App.js": "// Main App component code here",
                "src/services/api.js": "// API service code here",
                "package.json": "// Complete package.json content",
                "README.md": "// Comprehensive README content"
            }},
            "configuration_files": {{
                "package.json": "{{...}}",
                "tsconfig.json": "{{...}}",
                ".env.example": "{{...}}"
            }},
            "documentation": "# Template Documentation\\n\\nComprehensive guide with examples...",
            "setup_instructions": [
                "1. Clone the repository",
                "2. Install dependencies: npm install",
                "3. Configure environment variables",
                "4. Run development server: npm run dev"
            ],
            "customization_options": {{
                "themes": ["light", "dark", "custom"],
                "authentication": ["jwt", "oauth", "session"],
                "database": ["postgresql", "mongodb", "sqlite"],
                "deployment": ["vercel", "netlify", "aws"]
            }}
        }}
        """
        
        try:
            template_response = await self.ai_service.generate_response(
                generation_prompt,
                model="llama-3.3-70b-versatile",  # Use best model for code generation
                max_tokens=3000,
                temperature=0.1
            )
            
            template_data = json.loads(template_response)
            
            # Create enhanced template object
            template = EnhancedTemplate(
                id=str(uuid.uuid4()),
                metadata=TemplateMetadata(**template_data["metadata"]),
                file_structure=template_data["file_structure"],
                starter_code=template_data["starter_code"],
                configuration_files=template_data["configuration_files"],
                documentation=template_data["documentation"],
                setup_instructions=template_data["setup_instructions"],
                customization_options=template_data["customization_options"],
                ai_generated=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            return template
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Template generation error: {str(e)}")
    
    async def generate_custom_template(self, request: TemplateRequest) -> EnhancedTemplate:
        """Generate custom template based on user requirements"""
        
        custom_prompt = f"""
        Create a custom template based on these user requirements:
        
        DESCRIPTION: {request.description}
        TECH STACK: {request.tech_stack}
        COMPLEXITY: {request.complexity}
        FEATURES: {request.features}
        INDUSTRY: {request.industry}
        
        Generate a complete, production-ready template with all necessary files, code, and documentation.
        Focus on best practices, modern patterns, and industry standards.
        
        Return the same JSON format as previous templates with complete implementation.
        """
        
        try:
            custom_response = await self.ai_service.generate_response(
                custom_prompt,
                model="llama-3.3-70b-versatile",
                max_tokens=3000,
                temperature=0.2
            )
            
            template_data = json.loads(custom_response)
            
            template = EnhancedTemplate(
                id=str(uuid.uuid4()),
                metadata=TemplateMetadata(**template_data["metadata"]),
                file_structure=template_data["file_structure"],
                starter_code=template_data["starter_code"],
                configuration_files=template_data["configuration_files"],
                documentation=template_data["documentation"],
                setup_instructions=template_data["setup_instructions"],
                customization_options=template_data["customization_options"],
                ai_generated=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            return template
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Custom template generation error: {str(e)}")

template_service = EnhancedTemplateService()

@router.post("/initialize-library")
async def initialize_template_library(
    current_user: dict = Depends(get_current_user)
):
    """Initialize the enhanced template library with 25+ templates"""
    try:
        templates = await template_service.generate_comprehensive_template_library()
        
        # Store templates in database
        db = await get_database()
        template_docs = [template.dict() for template in templates]
        
        # Insert templates (replace existing)
        await db.enhanced_templates.drop()
        await db.enhanced_templates.insert_many(template_docs)
        
        return {
            "message": f"Enhanced template library initialized with {len(templates)} templates",
            "categories": len(template_service.template_categories),
            "templates_by_category": {
                category: len([t for t in templates if t.metadata.category == category])
                for category in template_service.template_categories.keys()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/enhanced", response_model=List[Dict[str, Any]])
async def get_enhanced_templates(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    tech_stack: Optional[str] = None,
    limit: Optional[int] = 50
):
    """Get enhanced templates with filtering"""
    try:
        db = await get_database()
        
        # Build query
        query = {}
        if category:
            query["metadata.category"] = category
        if difficulty:
            query["metadata.difficulty"] = difficulty
        if tech_stack:
            query["metadata.tech_stack"] = {"$in": [tech_stack]}
        
        cursor = db.enhanced_templates.find(query).limit(limit)
        templates = await cursor.to_list(length=limit)
        
        # Return simplified view for listing
        return [
            {
                "id": template["id"],
                "name": template["metadata"]["name"],
                "description": template["metadata"]["description"],
                "category": template["metadata"]["category"],
                "subcategory": template["metadata"]["subcategory"],
                "difficulty": template["metadata"]["difficulty"],
                "tech_stack": template["metadata"]["tech_stack"],
                "features": template["metadata"]["features"][:5],  # Limit for display
                "rating": template["metadata"]["rating"],
                "estimated_time": template["metadata"]["estimated_time"],
                "tags": template["metadata"]["tags"]
            } for template in templates
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/enhanced/{template_id}")
async def get_enhanced_template_details(template_id: str):
    """Get complete template details including code and setup"""
    try:
        db = await get_database()
        template = await db.enhanced_templates.find_one({"id": template_id})
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return EnhancedTemplate(**template)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-custom")
async def generate_custom_template(
    request: TemplateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate custom template based on user requirements"""
    try:
        custom_template = await template_service.generate_custom_template(request)
        
        # Store custom template
        db = await get_database()
        await db.enhanced_templates.insert_one(custom_template.dict())
        
        return {
            "message": "Custom template generated successfully",
            "template": custom_template
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
async def get_template_categories():
    """Get all template categories and subcategories"""
    try:
        return {
            "categories": template_service.template_categories,
            "total_categories": len(template_service.template_categories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhanced/{template_id}/download")
async def download_template(
    template_id: str,
    customization: Optional[Dict[str, Any]] = None,
    current_user: dict = Depends(get_current_user)
):
    """Download template with optional customizations"""
    try:
        db = await get_database()
        template = await db.enhanced_templates.find_one({"id": template_id})
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Increment download count
        await db.enhanced_templates.update_one(
            {"id": template_id},
            {"$inc": {"metadata.download_count": 1}}
        )
        
        # Apply customizations if provided
        if customization:
            # AI-powered customization logic here
            pass
        
        return {
            "message": "Template ready for download",
            "template_id": template_id,
            "files": template["starter_code"],
            "setup_instructions": template["setup_instructions"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))