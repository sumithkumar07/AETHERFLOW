from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# Enhanced Models for Template System
class TemplateCategory(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    color: str
    template_count: int

class TemplateAuthor(BaseModel):
    id: str
    name: str
    avatar: str
    bio: str
    verified: bool
    social_links: Dict[str, str]

class TemplateMetrics(BaseModel):
    downloads: int
    rating: float
    reviews_count: int
    stars: int
    forks: int
    last_updated: datetime

class EnhancedTemplate(BaseModel):
    id: str
    name: str
    description: str
    long_description: str
    category_id: str
    author: TemplateAuthor
    tags: List[str]
    tech_stack: List[str]
    difficulty: str  # beginner, intermediate, advanced, expert
    estimated_setup_time: str  # "5-10 minutes", "30-60 minutes", etc.
    metrics: TemplateMetrics
    preview_images: List[str]
    live_demo_url: Optional[str] = None
    github_url: Optional[str] = None
    documentation_url: Optional[str] = None
    features: List[str]
    requirements: List[str]
    installation_steps: List[str]
    is_featured: bool = False
    is_pro: bool = False
    price: Optional[float] = None
    created_at: datetime
    updated_at: datetime

# Enhanced Template System
class EnhancedTemplateEngine:
    def __init__(self):
        # Initialize categories
        self.categories = self._initialize_categories()
        
        # Initialize enhanced template library
        self.templates = self._initialize_enhanced_templates()
        
        # Template usage analytics
        self.usage_stats = {}
    
    def _initialize_categories(self) -> Dict[str, TemplateCategory]:
        """Initialize template categories"""
        categories = {
            "web_apps": TemplateCategory(
                id="web_apps",
                name="Web Applications",
                description="Full-stack web applications with modern frameworks",
                icon="🌐",
                color="blue",
                template_count=8
            ),
            "saas": TemplateCategory(
                id="saas",
                name="SaaS Platforms",
                description="Software-as-a-Service platforms with subscription features",
                icon="💼",
                color="purple",
                template_count=6
            ),
            "ecommerce": TemplateCategory(
                id="ecommerce",
                name="E-Commerce",
                description="Online stores and marketplace platforms",
                icon="🛒",
                color="green",
                template_count=5
            ),
            "fintech": TemplateCategory(
                id="fintech",
                name="FinTech",
                description="Financial technology applications and platforms",
                icon="💰",
                color="yellow",
                template_count=4
            ),
            "ai_ml": TemplateCategory(
                id="ai_ml",
                name="AI & Machine Learning",
                description="AI-powered applications and ML platforms",
                icon="🤖",
                color="indigo",
                template_count=6
            ),
            "mobile": TemplateCategory(
                id="mobile",
                name="Mobile Apps",
                description="Cross-platform mobile applications",
                icon="📱",
                color="pink",
                template_count=4
            ),
            "developer_tools": TemplateCategory(
                id="developer_tools",
                name="Developer Tools",
                description="Development utilities and productivity tools",
                icon="🛠️",
                color="gray",
                template_count=5
            ),
            "landing_pages": TemplateCategory(
                id="landing_pages",
                name="Landing Pages",
                description="Marketing and conversion-focused landing pages",
                icon="📄",
                color="orange",
                template_count=7
            )
        }
        return categories
    
    def _initialize_enhanced_templates(self) -> Dict[str, EnhancedTemplate]:
        """Initialize comprehensive template library"""
        
        # Sample authors
        authors = {
            "aether_team": TemplateAuthor(
                id="aether_team",
                name="Aether AI Team",
                avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                bio="Official Aether AI template creators",
                verified=True,
                social_links={"website": "https://aether.ai", "github": "https://github.com/aether-ai"}
            ),
            "community_dev": TemplateAuthor(
                id="community_dev",
                name="Community Developer",
                avatar="https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
                bio="Active community contributor",
                verified=True,
                social_links={"github": "https://github.com/community-dev"}
            ),
            "enterprise_dev": TemplateAuthor(
                id="enterprise_dev",
                name="Enterprise Solutions",
                avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                bio="Enterprise-grade solution architect",
                verified=True,
                social_links={"linkedin": "https://linkedin.com/in/enterprise-dev"}
            )
        }
        
        templates = {}
        
        # SaaS Templates
        templates["saas_starter_pro"] = EnhancedTemplate(
            id="saas_starter_pro",
            name="SaaS Starter Pro",
            description="Complete SaaS platform with authentication, billing, and team management",
            long_description="A comprehensive SaaS starter kit that includes user authentication, subscription billing with Stripe, team management, role-based permissions, admin dashboard, and email notifications. Built with React, Node.js, and PostgreSQL.",
            category_id="saas",
            author=authors["aether_team"],
            tags=["saas", "authentication", "billing", "teams", "dashboard"],
            tech_stack=["React", "Node.js", "PostgreSQL", "Stripe", "Redis", "Docker"],
            difficulty="advanced",
            estimated_setup_time="45-60 minutes",
            metrics=TemplateMetrics(
                downloads=15420,
                rating=4.8,
                reviews_count=234,
                stars=1890,
                forks=456,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://saas-starter-demo.vercel.app",
            github_url="https://github.com/aether-ai/saas-starter-pro",
            documentation_url="https://docs.saas-starter.com",
            features=[
                "User authentication & authorization",
                "Stripe subscription billing",
                "Team management & invitations",
                "Role-based access control",
                "Admin dashboard",
                "Email notifications",
                "Multi-tenancy support",
                "API rate limiting",
                "Comprehensive testing"
            ],
            requirements=["Node.js 18+", "PostgreSQL 13+", "Redis 6+", "Stripe account"],
            installation_steps=[
                "Clone the repository",
                "Install dependencies with npm install",
                "Setup environment variables",
                "Initialize database with migrations",
                "Configure Stripe webhooks",
                "Start development server"
            ],
            is_featured=True,
            is_pro=True,
            price=99.00,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        templates["ecommerce_marketplace"] = EnhancedTemplate(
            id="ecommerce_marketplace",
            name="E-Commerce Marketplace",
            description="Multi-vendor marketplace with payment processing and seller dashboard",
            long_description="A complete e-commerce marketplace platform supporting multiple vendors, product management, order processing, payment integration, and comprehensive analytics. Features seller onboarding, commission management, and customer reviews.",
            category_id="ecommerce",
            author=authors["enterprise_dev"],
            tags=["ecommerce", "marketplace", "payments", "vendors", "analytics"],
            tech_stack=["Next.js", "FastAPI", "PostgreSQL", "Stripe", "AWS S3", "Redis"],
            difficulty="expert",
            estimated_setup_time="60-90 minutes",
            metrics=TemplateMetrics(
                downloads=8960,
                rating=4.7,
                reviews_count=156,
                stars=1245,
                forks=278,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://marketplace-demo.vercel.app",
            github_url="https://github.com/enterprise/marketplace",
            features=[
                "Multi-vendor support",
                "Product catalog management",
                "Order processing & fulfillment",
                "Payment processing with Stripe",
                "Seller dashboard & analytics",
                "Customer review system",
                "Commission management",
                "Inventory tracking",
                "Mobile-responsive design"
            ],
            requirements=["Node.js 18+", "Python 3.9+", "PostgreSQL 13+", "AWS account", "Stripe account"],
            installation_steps=[
                "Clone the repository",
                "Setup backend API server",
                "Configure frontend application",
                "Initialize database schema",
                "Setup AWS S3 for file storage",
                "Configure payment processing"
            ],
            is_featured=True,
            is_pro=True,
            price=149.00,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # AI & ML Templates
        templates["ai_content_generator"] = EnhancedTemplate(
            id="ai_content_generator",
            name="AI Content Generator Platform",
            description="AI-powered content generation platform with multiple content types",
            long_description="A comprehensive AI content generation platform that can create blog posts, social media content, product descriptions, and more. Features multiple AI models, content templates, and team collaboration tools.",
            category_id="ai_ml",
            author=authors["aether_team"],
            tags=["ai", "content", "generation", "nlp", "automation"],
            tech_stack=["React", "FastAPI", "PostgreSQL", "OpenAI", "Docker", "Redis"],
            difficulty="advanced",
            estimated_setup_time="30-45 minutes",
            metrics=TemplateMetrics(
                downloads=12340,
                rating=4.9,
                reviews_count=189,
                stars=2156,
                forks=387,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://ai-content-demo.vercel.app",
            github_url="https://github.com/aether-ai/content-generator",
            features=[
                "Multiple AI model support",
                "Content type templates",
                "Batch content generation",
                "Team collaboration",
                "Content scheduling",
                "SEO optimization",
                "Export to multiple formats",
                "Usage analytics",
                "API access"
            ],
            requirements=["Node.js 18+", "Python 3.9+", "PostgreSQL 13+", "OpenAI API key"],
            installation_steps=[
                "Clone the repository",
                "Install dependencies",
                "Setup environment variables",
                "Configure AI model APIs",
                "Initialize database",
                "Start the application"
            ],
            is_featured=True,
            is_pro=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # FinTech Templates  
        templates["trading_dashboard"] = EnhancedTemplate(
            id="trading_dashboard",
            name="Crypto Trading Dashboard",
            description="Real-time cryptocurrency trading dashboard with portfolio management",
            long_description="A professional cryptocurrency trading dashboard with real-time market data, portfolio tracking, advanced charting, trade execution, and risk management tools. Integrates with major exchanges and provides comprehensive analytics.",
            category_id="fintech",
            author=authors["enterprise_dev"],
            tags=["fintech", "trading", "crypto", "dashboard", "analytics"],
            tech_stack=["React", "TypeScript", "WebSocket", "Node.js", "MongoDB", "TradingView"],
            difficulty="expert",
            estimated_setup_time="60-90 minutes",
            metrics=TemplateMetrics(
                downloads=6780,
                rating=4.6,
                reviews_count=98,
                stars=890,
                forks=156,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://trading-dashboard-demo.vercel.app",
            github_url="https://github.com/enterprise/trading-dashboard",
            features=[
                "Real-time market data",
                "Advanced charting with TradingView",
                "Portfolio management",
                "Trade execution",
                "Risk management tools",
                "P&L tracking",
                "Alert system",
                "Exchange integration",
                "Mobile-responsive design"
            ],
            requirements=["Node.js 18+", "MongoDB 5+", "Exchange API keys", "WebSocket support"],
            installation_steps=[
                "Clone the repository",
                "Setup environment configuration",
                "Install dependencies",
                "Configure exchange APIs",
                "Initialize database",
                "Setup WebSocket connections"
            ],
            is_featured=True,
            is_pro=True,
            price=199.00,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Web App Templates
        templates["social_media_app"] = EnhancedTemplate(
            id="social_media_app",
            name="Social Media Platform",
            description="Complete social media platform with posts, messaging, and social features",
            long_description="A full-featured social media platform with user profiles, posts, comments, likes, real-time messaging, friend connections, and content moderation. Built for scalability with modern technologies.",
            category_id="web_apps",
            author=authors["community_dev"],
            tags=["social", "messaging", "real-time", "community", "scalable"],
            tech_stack=["React", "Socket.io", "Node.js", "PostgreSQL", "Redis", "AWS S3"],
            difficulty="advanced",
            estimated_setup_time="45-60 minutes",
            metrics=TemplateMetrics(
                downloads=18950,
                rating=4.7,
                reviews_count=342,
                stars=3456,
                forks=678,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://social-media-demo.vercel.app",
            github_url="https://github.com/community/social-media-app",
            features=[
                "User profiles & authentication",
                "Post creation & sharing",
                "Real-time commenting",
                "Direct messaging",
                "Friend connections",
                "News feed algorithm",
                "Content moderation",
                "Media upload & storage",
                "Notification system"
            ],
            requirements=["Node.js 18+", "PostgreSQL 13+", "Redis 6+", "AWS account"],
            installation_steps=[
                "Clone the repository",
                "Install dependencies",
                "Setup database schema",
                "Configure environment variables",
                "Setup file storage",
                "Start development servers"
            ],
            is_featured=True,
            is_pro=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Mobile Templates
        templates["react_native_ecommerce"] = EnhancedTemplate(
            id="react_native_ecommerce",
            name="React Native E-Commerce App",
            description="Cross-platform mobile e-commerce app with native performance",
            long_description="A high-performance React Native e-commerce mobile application with product browsing, shopping cart, secure payments, order tracking, and push notifications. Optimized for both iOS and Android.",
            category_id="mobile",
            author=authors["community_dev"],
            tags=["mobile", "react-native", "ecommerce", "cross-platform", "payments"],
            tech_stack=["React Native", "Expo", "Firebase", "Stripe", "Redux", "React Navigation"],
            difficulty="intermediate",
            estimated_setup_time="30-45 minutes",
            metrics=TemplateMetrics(
                downloads=9870,
                rating=4.5,
                reviews_count=167,
                stars=1567,
                forks=234,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://expo.dev/@demo/rn-ecommerce",
            github_url="https://github.com/community/rn-ecommerce",
            features=[
                "Product catalog browsing",
                "Shopping cart functionality",
                "Secure payment processing",
                "User authentication",
                "Order history & tracking",
                "Push notifications",
                "Wishlist management",
                "Product search & filters",
                "Cross-platform compatibility"
            ],
            requirements=["Node.js 18+", "Expo CLI", "Firebase account", "Stripe account"],
            installation_steps=[
                "Install Expo CLI",
                "Clone the repository",
                "Install dependencies",
                "Setup Firebase configuration",
                "Configure payment processing",
                "Run on device/simulator"
            ],
            is_featured=False,
            is_pro=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Developer Tools Templates
        templates["code_review_tool"] = EnhancedTemplate(
            id="code_review_tool",
            name="AI-Powered Code Review Tool",
            description="Intelligent code review platform with AI analysis and team collaboration",
            long_description="An advanced code review platform that uses AI to analyze code quality, detect potential bugs, suggest improvements, and facilitate team collaboration. Integrates with Git repositories and CI/CD pipelines.",
            category_id="developer_tools",
            author=authors["aether_team"],
            tags=["developer-tools", "ai", "code-review", "collaboration", "quality"],
            tech_stack=["React", "Python", "FastAPI", "PostgreSQL", "Docker", "Git", "OpenAI"],
            difficulty="advanced",
            estimated_setup_time="45-60 minutes",
            metrics=TemplateMetrics(
                downloads=5640,
                rating=4.8,
                reviews_count=89,
                stars=1234,
                forks=156,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://code-review-demo.vercel.app",
            github_url="https://github.com/aether-ai/code-review-tool",
            features=[
                "AI-powered code analysis",
                "Automated bug detection",
                "Code quality metrics",
                "Team collaboration tools",
                "Git integration",
                "CI/CD pipeline integration",
                "Custom rule configuration",
                "Performance analysis",
                "Security vulnerability detection"
            ],
            requirements=["Node.js 18+", "Python 3.9+", "PostgreSQL 13+", "Docker", "OpenAI API key"],
            installation_steps=[
                "Clone the repository",
                "Setup Python backend",
                "Install frontend dependencies",
                "Configure AI services",
                "Initialize database",
                "Setup Git webhooks"
            ],
            is_featured=True,
            is_pro=True,
            price=79.00,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Landing Page Templates
        templates["saas_landing_page"] = EnhancedTemplate(
            id="saas_landing_page",
            name="SaaS Landing Page Kit",
            description="High-converting landing page templates for SaaS products",
            long_description="A collection of professionally designed, conversion-optimized landing page templates specifically crafted for SaaS products. Includes multiple variations, A/B testing setup, and analytics integration.",
            category_id="landing_pages",
            author=authors["aether_team"],
            tags=["landing-page", "saas", "conversion", "marketing", "responsive"],
            tech_stack=["React", "Next.js", "Tailwind CSS", "Framer Motion", "Vercel", "Analytics"],
            difficulty="beginner",
            estimated_setup_time="15-30 minutes",
            metrics=TemplateMetrics(
                downloads=23450,
                rating=4.9,
                reviews_count=456,
                stars=4567,
                forks=890,
                last_updated=datetime.now()
            ),
            preview_images=[
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
            ],
            live_demo_url="https://saas-landing-demo.vercel.app",
            github_url="https://github.com/aether-ai/saas-landing-kit",
            features=[
                "Multiple landing page variants",
                "Conversion-optimized design",
                "Mobile-responsive layouts",
                "A/B testing integration",
                "Analytics tracking",
                "SEO optimization",
                "Contact form integration",
                "Newsletter signup",
                "Social proof sections"
            ],
            requirements=["Node.js 18+", "Vercel account (optional)"],
            installation_steps=[
                "Clone the repository",
                "Install dependencies",
                "Customize content & branding",
                "Setup analytics tracking",
                "Deploy to hosting platform"
            ],
            is_featured=True,
            is_pro=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return templates
    
    async def get_all_templates(self, category: str = None, difficulty: str = None, is_free: bool = None) -> List[EnhancedTemplate]:
        """Get all templates with optional filtering"""
        templates = list(self.templates.values())
        
        if category:
            templates = [t for t in templates if t.category_id == category]
        
        if difficulty:
            templates = [t for t in templates if t.difficulty == difficulty]
        
        if is_free is not None:
            templates = [t for t in templates if (not t.is_pro) == is_free]
        
        return templates
    
    async def get_featured_templates(self) -> List[EnhancedTemplate]:
        """Get featured templates"""
        return [t for t in self.templates.values() if t.is_featured]
    
    async def search_templates(self, query: str) -> List[EnhancedTemplate]:
        """Search templates by name, description, or tags"""
        query_lower = query.lower()
        results = []
        
        for template in self.templates.values():
            # Search in name, description, and tags
            if (query_lower in template.name.lower() or 
                query_lower in template.description.lower() or 
                any(query_lower in tag.lower() for tag in template.tags) or
                any(query_lower in tech.lower() for tech in template.tech_stack)):
                results.append(template)
        
        return results
    
    async def track_template_usage(self, template_id: str, user_id: str):
        """Track template usage for analytics"""
        if template_id not in self.usage_stats:
            self.usage_stats[template_id] = {"downloads": 0, "users": set()}
        
        self.usage_stats[template_id]["downloads"] += 1
        self.usage_stats[template_id]["users"].add(user_id)
        
        # Update template metrics
        if template_id in self.templates:
            self.templates[template_id].metrics.downloads += 1

# Initialize enhanced template engine
enhanced_template_engine = EnhancedTemplateEngine()

@router.get("/categories")
async def get_template_categories():
    """Get all template categories"""
    try:
        categories = list(enhanced_template_engine.categories.values())
        return {"categories": [cat.dict() for cat in categories]}
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/enhanced", response_model=List[EnhancedTemplate])
async def get_enhanced_templates(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    is_free: Optional[bool] = None,
    featured_only: Optional[bool] = False
):
    """Get enhanced templates with filtering"""
    try:
        if featured_only:
            templates = await enhanced_template_engine.get_featured_templates()
        else:
            templates = await enhanced_template_engine.get_all_templates(category, difficulty, is_free)
        
        return templates
    except Exception as e:
        logger.error(f"Error getting enhanced templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_templates(query: str):
    """Search templates"""
    try:
        if not query or len(query.strip()) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
        
        results = await enhanced_template_engine.search_templates(query)
        return {"query": query, "results": [template.dict() for template in results]}
    except Exception as e:
        logger.error(f"Error searching templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/enhanced/{template_id}", response_model=EnhancedTemplate)
async def get_enhanced_template(template_id: str):
    """Get detailed template information"""
    try:
        if template_id not in enhanced_template_engine.templates:
            raise HTTPException(status_code=404, detail="Template not found")
        
        template = enhanced_template_engine.templates[template_id]
        return template
    except Exception as e:
        logger.error(f"Error getting template: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhanced/{template_id}/use")
async def use_enhanced_template(template_id: str, user_data: Dict[str, Any]):
    """Track template usage and provide setup instructions"""
    try:
        if template_id not in enhanced_template_engine.templates:
            raise HTTPException(status_code=404, detail="Template not found")
        
        template = enhanced_template_engine.templates[template_id]
        user_id = user_data.get("user_id", "anonymous")
        
        # Track usage
        await enhanced_template_engine.track_template_usage(template_id, user_id)
        
        # Return setup information
        return {
            "template": template.dict(),
            "setup_guide": {
                "prerequisites": template.requirements,
                "installation_steps": template.installation_steps,
                "estimated_time": template.estimated_setup_time,
                "next_steps": [
                    "Follow the installation steps carefully",
                    "Customize the template to your needs",
                    "Test all functionality before deployment",
                    "Review the documentation for advanced features"
                ]
            },
            "support_resources": {
                "documentation": template.documentation_url,
                "github": template.github_url,
                "demo": template.live_demo_url
            }
        }
    except Exception as e:
        logger.error(f"Error using template: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_template_stats():
    """Get template usage statistics"""
    try:
        total_templates = len(enhanced_template_engine.templates)
        total_categories = len(enhanced_template_engine.categories)
        
        # Calculate aggregated stats
        total_downloads = sum(
            stats["downloads"] for stats in enhanced_template_engine.usage_stats.values()
        )
        
        return {
            "overview": {
                "total_templates": total_templates,
                "total_categories": total_categories,
                "total_downloads": total_downloads,
                "featured_count": len([t for t in enhanced_template_engine.templates.values() if t.is_featured]),
                "free_count": len([t for t in enhanced_template_engine.templates.values() if not t.is_pro]),
                "pro_count": len([t for t in enhanced_template_engine.templates.values() if t.is_pro])
            },
            "popular_templates": sorted(
                enhanced_template_engine.usage_stats.items(),
                key=lambda x: x[1]["downloads"],
                reverse=True
            )[:5]
        }
    except Exception as e:
        logger.error(f"Error getting template stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))