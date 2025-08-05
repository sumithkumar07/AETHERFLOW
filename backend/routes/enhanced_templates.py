from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import asyncio
import uuid
import json
from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

class TemplateCategory(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    template_count: int

class Template(BaseModel):
    id: str
    name: str
    description: str
    category: str
    tech_stack: List[str]
    difficulty: str  # beginner, intermediate, advanced, expert
    estimated_time: str
    features: List[str]
    preview_images: List[str]
    github_url: Optional[str]
    demo_url: Optional[str]
    download_count: int
    rating: float
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    creator: str

class TemplateFile(BaseModel):
    path: str
    content: str
    type: str  # file, directory
    language: Optional[str]

class ProjectTemplate(BaseModel):
    id: str
    template_id: str
    user_id: str
    project_name: str
    customizations: Dict[str, Any]
    files: List[TemplateFile]
    status: str  # generating, ready, error
    created_at: datetime

class EnhancedTemplateService:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
        
    async def initialize_templates(self) -> List[Template]:
        """Initialize comprehensive template library"""
        try:
            templates = [
                # Web Applications
                Template(
                    id="react-ts-starter",
                    name="React TypeScript Starter",
                    description="Modern React application with TypeScript, Tailwind CSS, and essential development tools",
                    category="web-apps",
                    tech_stack=["React", "TypeScript", "Tailwind CSS", "Vite", "ESLint", "Prettier"],
                    difficulty="beginner",
                    estimated_time="15-30 minutes",
                    features=["Hot reload", "TypeScript support", "Responsive design", "Dark mode", "Component library"],
                    preview_images=["/templates/react-ts-preview.png"],
                    download_count=1250,
                    rating=4.8,
                    tags=["react", "typescript", "frontend", "modern"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                Template(
                    id="vue-nuxt-app",
                    name="Vue.js with Nuxt.js",
                    description="Full-stack Vue application with Nuxt.js for SSR and modern development",
                    category="web-apps",
                    tech_stack=["Vue.js", "Nuxt.js", "TypeScript", "Pinia", "Tailwind CSS"],
                    difficulty="intermediate",
                    estimated_time="30-45 minutes",
                    features=["Server-side rendering", "Auto-routing", "State management", "SEO optimized"],
                    preview_images=["/templates/vue-nuxt-preview.png"],
                    download_count=890,
                    rating=4.7,
                    tags=["vue", "nuxt", "ssr", "typescript"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                Template(
                    id="angular-material",
                    name="Angular with Material Design",
                    description="Enterprise Angular application with Material UI and best practices",
                    category="web-apps",
                    tech_stack=["Angular", "Angular Material", "TypeScript", "RxJS", "NgRx"],
                    difficulty="advanced",
                    estimated_time="45-60 minutes",
                    features=["Material Design", "State management", "Reactive programming", "Enterprise patterns"],
                    preview_images=["/templates/angular-material-preview.png"],
                    download_count=654,
                    rating=4.6,
                    tags=["angular", "material", "enterprise", "typescript"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # E-commerce
                Template(
                    id="nextjs-ecommerce",
                    name="Next.js E-commerce Store",
                    description="Complete e-commerce solution with Next.js, Stripe integration, and admin panel",
                    category="e-commerce",
                    tech_stack=["Next.js", "React", "Stripe", "Prisma", "Tailwind CSS", "NextAuth"],
                    difficulty="expert",
                    estimated_time="2-3 hours",
                    features=["Payment processing", "Admin dashboard", "Product management", "User authentication", "Order tracking"],
                    preview_images=["/templates/nextjs-ecommerce-preview.png"],
                    download_count=2150,
                    rating=4.9,
                    tags=["ecommerce", "stripe", "nextjs", "fullstack"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Mobile Apps
                Template(
                    id="react-native-starter",
                    name="React Native App",
                    description="Cross-platform mobile app with React Native and modern navigation",
                    category="mobile",
                    tech_stack=["React Native", "TypeScript", "React Navigation", "Redux Toolkit", "Expo"],
                    difficulty="intermediate",
                    estimated_time="45-60 minutes",
                    features=["Cross-platform", "Navigation", "State management", "Push notifications"],
                    preview_images=["/templates/react-native-preview.png"],
                    download_count=1876,
                    rating=4.7,
                    tags=["mobile", "react-native", "cross-platform"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                Template(
                    id="flutter-app",
                    name="Flutter Mobile App",
                    description="Beautiful Flutter application with Material Design and state management",
                    category="mobile",
                    tech_stack=["Flutter", "Dart", "Provider", "Material Design", "Firebase"],
                    difficulty="intermediate",
                    estimated_time="45-60 minutes",
                    features=["Material Design", "State management", "Firebase integration", "Responsive UI"],
                    preview_images=["/templates/flutter-preview.png"],
                    download_count=1432,
                    rating=4.6,
                    tags=["flutter", "dart", "mobile", "firebase"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Backend APIs
                Template(
                    id="fastapi-microservice",
                    name="FastAPI Microservice",
                    description="Production-ready FastAPI microservice with authentication, database, and documentation",
                    category="backend",
                    tech_stack=["FastAPI", "Python", "PostgreSQL", "Docker", "JWT", "SQLAlchemy"],
                    difficulty="advanced",
                    estimated_time="60-90 minutes",
                    features=["JWT authentication", "Database ORM", "API documentation", "Docker deployment", "Testing suite"],
                    preview_images=["/templates/fastapi-preview.png"],
                    download_count=3241,
                    rating=4.8,
                    tags=["api", "fastapi", "microservice", "python"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                Template(
                    id="nodejs-graphql",
                    name="Node.js GraphQL API",
                    description="Scalable GraphQL API with Node.js, Apollo Server, and MongoDB",
                    category="backend",
                    tech_stack=["Node.js", "GraphQL", "Apollo Server", "MongoDB", "TypeScript", "Express"],
                    difficulty="advanced",
                    estimated_time="60-90 minutes",
                    features=["GraphQL schema", "Real-time subscriptions", "Database integration", "Type safety"],
                    preview_images=["/templates/nodejs-graphql-preview.png"],
                    download_count=1987,
                    rating=4.7,
                    tags=["nodejs", "graphql", "apollo", "mongodb"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # AI/ML Templates
                Template(
                    id="python-ml-pipeline",
                    name="Python ML Pipeline",
                    description="Complete machine learning pipeline with data processing, training, and deployment",
                    category="ai-ml",
                    tech_stack=["Python", "Scikit-learn", "Pandas", "NumPy", "Jupyter", "Docker"],
                    difficulty="expert",
                    estimated_time="2-3 hours",
                    features=["Data preprocessing", "Model training", "Evaluation metrics", "Deployment ready"],
                    preview_images=["/templates/ml-pipeline-preview.png"],
                    download_count=876,
                    rating=4.5,
                    tags=["machine-learning", "python", "data-science"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # DevOps
                Template(
                    id="kubernetes-deployment",
                    name="Kubernetes Deployment",
                    description="Complete Kubernetes deployment with CI/CD, monitoring, and scaling",
                    category="devops",
                    tech_stack=["Kubernetes", "Docker", "Helm", "Prometheus", "Grafana", "GitHub Actions"],
                    difficulty="expert",
                    estimated_time="3-4 hours",
                    features=["Auto-scaling", "Monitoring", "CI/CD pipeline", "Load balancing"],
                    preview_images=["/templates/kubernetes-preview.png"],
                    download_count=543,
                    rating=4.4,
                    tags=["kubernetes", "devops", "deployment", "monitoring"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Content Management
                Template(
                    id="strapi-cms",
                    name="Strapi Headless CMS",
                    description="Headless CMS with Strapi, custom content types, and API generation",
                    category="cms",
                    tech_stack=["Strapi", "Node.js", "React", "PostgreSQL", "GraphQL"],
                    difficulty="intermediate",
                    estimated_time="45-60 minutes",
                    features=["Content management", "REST & GraphQL APIs", "Admin panel", "Role-based access"],
                    preview_images=["/templates/strapi-preview.png"],
                    download_count=1234,
                    rating=4.6,
                    tags=["cms", "strapi", "headless", "content"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Analytics & Dashboards
                Template(
                    id="react-analytics-dashboard",
                    name="Analytics Dashboard",
                    description="Modern analytics dashboard with charts, real-time data, and responsive design",
                    category="analytics",
                    tech_stack=["React", "D3.js", "Chart.js", "Material-UI", "WebSocket", "Express"],
                    difficulty="advanced",
                    estimated_time="90-120 minutes",
                    features=["Real-time charts", "Data visualization", "Responsive design", "Export functionality"],
                    preview_images=["/templates/analytics-dashboard-preview.png"],
                    download_count=1654,
                    rating=4.8,
                    tags=["analytics", "dashboard", "charts", "visualization"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Productivity Tools
                Template(
                    id="task-management-app",
                    name="Task Management System",
                    description="Complete task management application with teams, projects, and collaboration",
                    category="productivity",
                    tech_stack=["React", "Node.js", "MongoDB", "Socket.io", "Material-UI", "JWT"],
                    difficulty="advanced",
                    estimated_time="2-3 hours",
                    features=["Team collaboration", "Project management", "Real-time updates", "File attachments"],
                    preview_images=["/templates/task-management-preview.png"],
                    download_count=2876,
                    rating=4.7,
                    tags=["productivity", "collaboration", "management", "real-time"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Blog Platforms
                Template(
                    id="gatsby-blog",
                    name="Gatsby Blog Platform",
                    description="Static blog with Gatsby, MDX support, and optimized performance",
                    category="blog",
                    tech_stack=["Gatsby", "React", "GraphQL", "MDX", "Tailwind CSS", "Netlify CMS"],
                    difficulty="intermediate",
                    estimated_time="60-90 minutes",
                    features=["Static generation", "MDX support", "SEO optimized", "CMS integration"],
                    preview_images=["/templates/gatsby-blog-preview.png"],
                    download_count=1543,
                    rating=4.6,
                    tags=["blog", "gatsby", "static", "mdx"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Fintech
                Template(
                    id="fintech-dashboard",
                    name="Fintech Dashboard",
                    description="Financial dashboard with real-time market data, portfolio tracking, and analytics",
                    category="fintech",
                    tech_stack=["React", "TypeScript", "D3.js", "WebSocket", "Express", "Redis"],
                    difficulty="expert",
                    estimated_time="3-4 hours",
                    features=["Real-time data", "Portfolio tracking", "Risk analytics", "Trading interface"],
                    preview_images=["/templates/fintech-dashboard-preview.png"],
                    download_count=987,
                    rating=4.9,
                    tags=["fintech", "finance", "trading", "analytics"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # SaaS Starters
                Template(
                    id="saas-starter-kit",
                    name="SaaS Starter Kit",
                    description="Complete SaaS application with authentication, billing, and multi-tenancy",
                    category="saas",
                    tech_stack=["Next.js", "React", "Stripe", "Prisma", "NextAuth", "Tailwind CSS"],
                    difficulty="expert",
                    estimated_time="4-5 hours",
                    features=["User authentication", "Subscription billing", "Multi-tenancy", "Admin dashboard"],
                    preview_images=["/templates/saas-starter-preview.png"],
                    download_count=3456,
                    rating=4.9,
                    tags=["saas", "billing", "authentication", "multi-tenant"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Real-time Applications
                Template(
                    id="realtime-chat-app",
                    name="Real-time Chat Application",
                    description="Modern chat application with real-time messaging, file sharing, and video calls",
                    category="real-time",
                    tech_stack=["React", "Socket.io", "Node.js", "WebRTC", "MongoDB", "Material-UI"],
                    difficulty="advanced",
                    estimated_time="2-3 hours",
                    features=["Real-time messaging", "File sharing", "Video calls", "Group chats"],
                    preview_images=["/templates/chat-app-preview.png"],
                    download_count=2134,
                    rating=4.8,
                    tags=["chat", "real-time", "webrtc", "messaging"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Gaming
                Template(
                    id="web-game-engine",
                    name="Web Game Engine",
                    description="2D game engine with physics, audio, and multiplayer support",
                    category="gaming",
                    tech_stack=["JavaScript", "Canvas API", "WebGL", "Socket.io", "Web Audio API"],
                    difficulty="expert",
                    estimated_time="4-6 hours",
                    features=["2D physics", "Audio system", "Multiplayer", "Asset management"],
                    preview_images=["/templates/game-engine-preview.png"],
                    download_count=765,
                    rating=4.5,
                    tags=["gaming", "engine", "multiplayer", "webgl"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # IoT
                Template(
                    id="iot-dashboard",
                    name="IoT Device Dashboard",
                    description="IoT device management dashboard with real-time monitoring and control",
                    category="iot",
                    tech_stack=["React", "MQTT", "InfluxDB", "Grafana", "Node.js", "WebSocket"],
                    difficulty="expert",
                    estimated_time="3-4 hours",
                    features=["Device monitoring", "Real-time data", "Control interface", "Alert system"],
                    preview_images=["/templates/iot-dashboard-preview.png"],
                    download_count=432,
                    rating=4.4,
                    tags=["iot", "monitoring", "mqtt", "real-time"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Blockchain
                Template(
                    id="defi-dapp",
                    name="DeFi DApp",
                    description="Decentralized finance application with smart contracts and Web3 integration",
                    category="blockchain",
                    tech_stack=["React", "Solidity", "Web3.js", "Hardhat", "IPFS", "MetaMask"],
                    difficulty="expert",
                    estimated_time="5-6 hours",
                    features=["Smart contracts", "Wallet integration", "Token swapping", "Yield farming"],
                    preview_images=["/templates/defi-dapp-preview.png"],
                    download_count=345,
                    rating=4.3,
                    tags=["blockchain", "defi", "web3", "smart-contracts"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Learning Management
                Template(
                    id="lms-platform",
                    name="Learning Management System",
                    description="Complete LMS with courses, assessments, and progress tracking",
                    category="education",
                    tech_stack=["React", "Node.js", "MongoDB", "Video.js", "Socket.io", "JWT"],
                    difficulty="expert",
                    estimated_time="4-5 hours",
                    features=["Course management", "Video streaming", "Assessments", "Progress tracking"],
                    preview_images=["/templates/lms-preview.png"],
                    download_count=1876,
                    rating=4.7,
                    tags=["education", "lms", "courses", "learning"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Healthcare
                Template(
                    id="telehealth-platform",
                    name="Telehealth Platform",
                    description="HIPAA-compliant telehealth platform with video consultations and patient management",
                    category="healthcare",
                    tech_stack=["React", "Node.js", "WebRTC", "PostgreSQL", "JWT", "Stripe"],
                    difficulty="expert",
                    estimated_time="5-6 hours",
                    features=["Video consultations", "Patient records", "Appointment scheduling", "HIPAA compliance"],
                    preview_images=["/templates/telehealth-preview.png"],
                    download_count=654,
                    rating=4.6,
                    tags=["healthcare", "telehealth", "hipaa", "webrtc"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                ),
                
                # Security
                Template(
                    id="security-audit-tool",
                    name="Security Audit Tool",
                    description="Comprehensive security audit tool with vulnerability scanning and reporting",
                    category="security",
                    tech_stack=["Python", "Flask", "PostgreSQL", "Celery", "Redis", "Docker"],
                    difficulty="expert",
                    estimated_time="4-5 hours",
                    features=["Vulnerability scanning", "Security reports", "Compliance checks", "Risk assessment"],
                    preview_images=["/templates/security-audit-preview.png"],
                    download_count=321,
                    rating=4.5,
                    tags=["security", "audit", "vulnerability", "compliance"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    creator="Aether AI"
                )
            ]
            
            # Store templates in database
            db = await get_database()
            
            # Clear existing templates
            await db.templates.delete_many({})
            
            # Insert new templates
            template_dicts = [template.dict() for template in templates]
            await db.templates.insert_many(template_dicts)
            
            return templates
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Template initialization failed: {str(e)}")
    
    async def get_template_categories(self) -> List[TemplateCategory]:
        """Get all template categories with counts"""
        try:
            categories = [
                TemplateCategory(id="web-apps", name="Web Applications", description="Modern web applications and SPAs", icon="🌐", template_count=3),
                TemplateCategory(id="e-commerce", name="E-commerce", description="Online stores and marketplaces", icon="🛒", template_count=1),
                TemplateCategory(id="mobile", name="Mobile Apps", description="Cross-platform mobile applications", icon="📱", template_count=2),
                TemplateCategory(id="backend", name="Backend APIs", description="RESTful and GraphQL APIs", icon="⚙️", template_count=2),
                TemplateCategory(id="ai-ml", name="AI & Machine Learning", description="ML pipelines and AI applications", icon="🤖", template_count=1),
                TemplateCategory(id="devops", name="DevOps", description="Deployment and infrastructure", icon="🚀", template_count=1),
                TemplateCategory(id="cms", name="Content Management", description="CMS and content platforms", icon="📝", template_count=1),
                TemplateCategory(id="analytics", name="Analytics", description="Dashboards and data visualization", icon="📊", template_count=1),
                TemplateCategory(id="productivity", name="Productivity", description="Task and project management", icon="✅", template_count=1),
                TemplateCategory(id="blog", name="Blogs & Content", description="Blog platforms and content sites", icon="📰", template_count=1),
                TemplateCategory(id="fintech", name="Fintech", description="Financial and trading applications", icon="💰", template_count=1),
                TemplateCategory(id="saas", name="SaaS Starters", description="Software as a Service platforms", icon="☁️", template_count=1),
                TemplateCategory(id="real-time", name="Real-time Apps", description="Chat and live applications", icon="⚡", template_count=1),
                TemplateCategory(id="gaming", name="Gaming", description="Game engines and interactive apps", icon="🎮", template_count=1),
                TemplateCategory(id="iot", name="IoT", description="Internet of Things dashboards", icon="🔗", template_count=1),
                TemplateCategory(id="blockchain", name="Blockchain", description="Web3 and DeFi applications", icon="⛓️", template_count=1),
                TemplateCategory(id="education", name="Education", description="Learning management systems", icon="🎓", template_count=1),
                TemplateCategory(id="healthcare", name="Healthcare", description="Medical and health platforms", icon="🏥", template_count=1),
                TemplateCategory(id="security", name="Security", description="Security and audit tools", icon="🔒", template_count=1)
            ]
            
            return categories
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Category retrieval failed: {str(e)}")
    
    async def generate_custom_template(self, requirements: Dict[str, Any], user_id: str) -> ProjectTemplate:
        """Generate custom template based on user requirements"""
        try:
            template_id = str(uuid.uuid4())
            
            # Generate template using AI
            generation_prompt = f"""
            Generate a custom project template based on these requirements:
            
            **Requirements**: {json.dumps(requirements, indent=2)}
            
            Create:
            1. Project structure with files and folders
            2. Package.json or requirements.txt
            3. Configuration files
            4. Sample code for main features
            5. README with setup instructions
            6. Docker configuration if needed
            
            Make it production-ready and well-documented.
            """
            
            ai_response = await self.ai_service.process_enhanced_chat(
                message=generation_prompt,
                conversation_id=f"template_gen_{template_id}",
                user_id=user_id,
                agent_coordination="collaborative"
            )
            
            # Generate template files
            files = await self._generate_template_files(requirements, ai_response)
            
            project_template = ProjectTemplate(
                id=template_id,
                template_id="custom",
                user_id=user_id,
                project_name=requirements.get("name", "Custom Project"),
                customizations=requirements,
                files=files,
                status="ready",
                created_at=datetime.utcnow()
            )
            
            # Store in database
            db = await get_database()
            await db.project_templates.insert_one(project_template.dict())
            
            return project_template
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Custom template generation failed: {str(e)}")
    
    async def customize_template(self, template_id: str, customizations: Dict[str, Any], user_id: str) -> ProjectTemplate:
        """Customize existing template with user preferences"""
        try:
            db = await get_database()
            
            # Get base template
            base_template = await db.templates.find_one({"id": template_id})
            if not base_template:
                raise HTTPException(status_code=404, detail="Template not found")
            
            project_id = str(uuid.uuid4())
            
            # Generate customized project files
            customization_prompt = f"""
            Customize this template with user preferences:
            
            **Base Template**: {base_template['name']}
            **Tech Stack**: {base_template['tech_stack']}
            **Customizations**: {json.dumps(customizations, indent=2)}
            
            Apply customizations to:
            1. Project name and branding
            2. Color scheme and styling
            3. Feature selection
            4. Database choice
            5. Deployment configuration
            
            Generate modified files with customizations applied.
            """
            
            ai_response = await self.ai_service.process_enhanced_chat(
                message=customization_prompt,
                conversation_id=f"customize_{project_id}",
                user_id=user_id,
                agent_coordination="single"
            )
            
            # Generate customized files
            files = await self._apply_template_customizations(base_template, customizations)
            
            project_template = ProjectTemplate(
                id=project_id,
                template_id=template_id,
                user_id=user_id,
                project_name=customizations.get("project_name", base_template["name"]),
                customizations=customizations,
                files=files,
                status="ready",
                created_at=datetime.utcnow()
            )
            
            # Store customized template
            await db.project_templates.insert_one(project_template.dict())
            
            return project_template
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Template customization failed: {str(e)}")
    
    # Helper methods
    async def _generate_template_files(self, requirements: Dict[str, Any], ai_response: Dict[str, Any]) -> List[TemplateFile]:
        """Generate template files based on requirements"""
        files = []
        
        # Basic project structure based on requirements
        project_type = requirements.get("type", "web-app")
        
        if project_type == "web-app":
            files.extend([
                TemplateFile(path="package.json", content=self._generate_package_json(requirements), type="file", language="json"),
                TemplateFile(path="src/", content="", type="directory"),
                TemplateFile(path="src/index.js", content=self._generate_index_js(requirements), type="file", language="javascript"),
                TemplateFile(path="src/App.js", content=self._generate_app_js(requirements), type="file", language="javascript"),
                TemplateFile(path="public/", content="", type="directory"),
                TemplateFile(path="public/index.html", content=self._generate_index_html(requirements), type="file", language="html"),
                TemplateFile(path="README.md", content=self._generate_readme(requirements), type="file", language="markdown"),
                TemplateFile(path=".gitignore", content=self._generate_gitignore(), type="file")
            ])
        
        return files
    
    async def _apply_template_customizations(self, base_template: Dict[str, Any], customizations: Dict[str, Any]) -> List[TemplateFile]:
        """Apply customizations to base template"""
        # This would load the actual template files and apply customizations
        # For now, return basic structure
        files = [
            TemplateFile(
                path="README.md",
                content=f"# {customizations.get('project_name', base_template['name'])}\n\nCustomized project based on {base_template['name']} template.",
                type="file",
                language="markdown"
            ),
            TemplateFile(
                path="package.json",
                content=json.dumps({
                    "name": customizations.get("project_name", "custom-project").lower().replace(" ", "-"),
                    "version": "1.0.0",
                    "description": customizations.get("description", ""),
                    "main": "index.js",
                    "scripts": {
                        "start": "react-scripts start",
                        "build": "react-scripts build",
                        "test": "react-scripts test"
                    },
                    "dependencies": {
                        "react": "^18.2.0",
                        "react-dom": "^18.2.0",
                        "react-scripts": "5.0.1"
                    }
                }, indent=2),
                type="file",
                language="json"
            )
        ]
        
        return files
    
    def _generate_package_json(self, requirements: Dict[str, Any]) -> str:
        """Generate package.json based on requirements"""
        return json.dumps({
            "name": requirements.get("name", "custom-project").lower().replace(" ", "-"),
            "version": "1.0.0",
            "description": requirements.get("description", ""),
            "main": "index.js",
            "scripts": {
                "start": "react-scripts start",
                "build": "react-scripts build",
                "test": "react-scripts test",
                "eject": "react-scripts eject"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-scripts": "5.0.1"
            },
            "browserslist": {
                "production": [">0.2%", "not dead", "not op_mini all"],
                "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
            }
        }, indent=2)
    
    def _generate_index_js(self, requirements: Dict[str, Any]) -> str:
        """Generate index.js entry point"""
        return """import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"""
    
    def _generate_app_js(self, requirements: Dict[str, Any]) -> str:
        """Generate main App component"""
        app_name = requirements.get("name", "Custom App")
        return f"""import React from 'react';
import './App.css';

function App() {{
  return (
    <div className="App">
      <header className="App-header">
        <h1>{app_name}</h1>
        <p>Welcome to your custom application!</p>
      </header>
    </div>
  );
}}

export default App;
"""
    
    def _generate_index_html(self, requirements: Dict[str, Any]) -> str:
        """Generate index.html"""
        app_name = requirements.get("name", "Custom App")
        return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="{requirements.get('description', 'Custom application')}" />
    <title>{app_name}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"""
    
    def _generate_readme(self, requirements: Dict[str, Any]) -> str:
        """Generate README.md"""
        app_name = requirements.get("name", "Custom Project")
        return f"""# {app_name}

{requirements.get('description', 'A custom application built with modern web technologies.')}

## Features

- Modern React application
- Responsive design
- Fast development setup

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Learn More

Built with Aether AI template generator.
"""
    
    def _generate_gitignore(self) -> str:
        """Generate .gitignore file"""
        return """# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/

# OS
Thumbs.db
"""

# Initialize service
template_service = EnhancedTemplateService()

@router.get("/categories")
async def get_template_categories():
    """Get all template categories"""
    return await template_service.get_template_categories()

@router.get("/initialize")
async def initialize_templates():
    """Initialize comprehensive template library"""
    return await template_service.initialize_templates()

@router.post("/generate-custom")
async def generate_custom_template(
    requirements: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Generate custom template based on requirements"""
    return await template_service.generate_custom_template(requirements, current_user["id"])

@router.post("/customize/{template_id}")
async def customize_template(
    template_id: str,
    customizations: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Customize existing template"""
    return await template_service.customize_template(template_id, customizations, current_user["id"])

@router.get("/user-templates")
async def get_user_templates(current_user = Depends(get_current_user)):
    """Get all templates created by user"""
    db = await get_database()
    templates = await db.project_templates.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(20).to_list(length=20)
    return templates

@router.get("/popular")
async def get_popular_templates(limit: int = 12):
    """Get most popular templates"""
    db = await get_database()
    templates = await db.templates.find({}).sort("download_count", -1).limit(limit).to_list(length=limit)
    return templates

@router.get("/by-category/{category}")
async def get_templates_by_category(category: str, limit: int = 20):
    """Get templates by category"""
    db = await get_database()
    templates = await db.templates.find({"category": category}).sort("rating", -1).limit(limit).to_list(length=limit)
    return templates

@router.get("/{template_id}")
async def get_template_details(template_id: str):
    """Get detailed template information"""
    db = await get_database()
    template = await db.templates.find_one({"id": template_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.post("/{template_id}/download")
async def download_template(template_id: str, current_user = Depends(get_current_user)):
    """Download template (increment download count)"""
    db = await get_database()
    
    # Increment download count
    result = await db.templates.update_one(
        {"id": template_id},
        {"$inc": {"download_count": 1}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Get updated template
    template = await db.templates.find_one({"id": template_id})
    return {"message": "Template downloaded", "template": template}