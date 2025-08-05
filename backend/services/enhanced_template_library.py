"""
Enhanced Template Library - Addresses Gap #4
Expanding from 6 to 25+ production-ready templates with categories
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

class EnhancedTemplateLibrary:
    def __init__(self):
        self.templates = self._initialize_enhanced_templates()
    
    def _initialize_enhanced_templates(self) -> List[Dict[str, Any]]:
        """Initialize comprehensive template library"""
        return [
            # ============ SAAS TEMPLATES ============
            {
                "id": "saas-starter-kit",
                "name": "SaaS Starter Kit",
                "category": "SaaS",
                "subcategory": "Multi-tenant",
                "description": "Complete SaaS application with multi-tenancy, subscription management, and admin dashboard",
                "tech_stack": ["React", "Node.js", "MongoDB", "Stripe", "JWT"],
                "features": [
                    "Multi-tenant architecture",
                    "Subscription billing with Stripe",
                    "Admin dashboard",
                    "User management",
                    "API rate limiting",
                    "Email notifications",
                    "Analytics integration"
                ],
                "difficulty": "Advanced",
                "setup_time": "2-3 hours",
                "rating": 4.8,
                "downloads": 2850,
                "preview_url": "/templates/saas-starter-kit/preview",
                "created_at": "2024-01-15",
                "tags": ["saas", "multi-tenant", "stripe", "subscription"]
            },
            {
                "id": "micro-saas-template",
                "name": "Micro-SaaS Template",
                "category": "SaaS",
                "subcategory": "Single-product",
                "description": "Lightweight SaaS template for single-product solutions",
                "tech_stack": ["React", "FastAPI", "SQLite", "Paddle"],
                "features": [
                    "Simple subscription model",
                    "One-time payment option",
                    "Basic analytics",
                    "User onboarding",
                    "API documentation"
                ],
                "difficulty": "Intermediate",
                "setup_time": "1-2 hours",
                "rating": 4.6,
                "downloads": 1890,
                "preview_url": "/templates/micro-saas/preview",
                "created_at": "2024-01-20",
                "tags": ["micro-saas", "simple", "fast-setup"]
            },
            
            # ============ FINTECH TEMPLATES ============
            {
                "id": "fintech-dashboard",
                "name": "FinTech Dashboard",
                "category": "FinTech",
                "subcategory": "Analytics",
                "description": "Financial data dashboard with real-time market data and portfolio management",
                "tech_stack": ["React", "Python", "PostgreSQL", "Redis", "WebSockets"],
                "features": [
                    "Real-time market data",
                    "Portfolio tracking",
                    "Risk analytics",
                    "Trading signals",
                    "Compliance reporting",
                    "Multi-currency support"
                ],
                "difficulty": "Expert",
                "setup_time": "3-4 hours",
                "rating": 4.9,
                "downloads": 1250,
                "preview_url": "/templates/fintech-dashboard/preview",
                "created_at": "2024-01-25",
                "tags": ["fintech", "trading", "analytics", "real-time"]
            },
            {
                "id": "payment-gateway-integration",
                "name": "Payment Gateway Integration",
                "category": "FinTech",
                "subcategory": "Payments",
                "description": "Multi-gateway payment processing system with fraud detection",
                "tech_stack": ["Node.js", "Express", "MongoDB", "Stripe", "PayPal"],
                "features": [
                    "Multiple payment gateways",
                    "Fraud detection",
                    "Recurring payments",
                    "Refund management",
                    "PCI compliance",
                    "Webhook handling"
                ],
                "difficulty": "Advanced",
                "setup_time": "2-3 hours",
                "rating": 4.7,
                "downloads": 1680,
                "preview_url": "/templates/payment-gateway/preview",
                "created_at": "2024-02-01",
                "tags": ["payments", "fraud-detection", "pci-compliant"]
            },
            {
                "id": "crypto-wallet-app",
                "name": "Crypto Wallet App",
                "category": "FinTech",
                "subcategory": "Blockchain",
                "description": "Multi-currency crypto wallet with DeFi integration",
                "tech_stack": ["React Native", "Node.js", "Web3.js", "MongoDB"],
                "features": [
                    "Multi-currency wallet",
                    "DeFi integration",
                    "NFT support",
                    "Staking rewards",
                    "Hardware wallet support",
                    "Portfolio analytics"
                ],
                "difficulty": "Expert",
                "setup_time": "4-5 hours",
                "rating": 4.5,
                "downloads": 890,
                "preview_url": "/templates/crypto-wallet/preview",
                "created_at": "2024-02-05",
                "tags": ["crypto", "defi", "nft", "blockchain"]
            },
            
            # ============ ML/AI API TEMPLATES ============
            {
                "id": "ml-model-api",
                "name": "ML Model API Server",
                "category": "ML/AI",
                "subcategory": "Model Serving",
                "description": "Production-ready API server for serving machine learning models",
                "tech_stack": ["FastAPI", "PyTorch", "Docker", "Redis", "PostgreSQL"],
                "features": [
                    "Model versioning",
                    "A/B testing",
                    "Real-time inference",
                    "Batch processing",
                    "Model monitoring",
                    "Auto-scaling"
                ],
                "difficulty": "Expert",
                "setup_time": "3-4 hours",
                "rating": 4.8,
                "downloads": 1420,
                "preview_url": "/templates/ml-api/preview",
                "created_at": "2024-02-10",
                "tags": ["ml", "pytorch", "model-serving", "api"]
            },
            {
                "id": "computer-vision-api",
                "name": "Computer Vision API",
                "category": "ML/AI",
                "subcategory": "Computer Vision",
                "description": "Image processing and computer vision API with pre-trained models",
                "tech_stack": ["Python", "OpenCV", "TensorFlow", "FastAPI", "S3"],
                "features": [
                    "Object detection",
                    "Image classification",
                    "Face recognition",
                    "Image enhancement",
                    "Batch processing",
                    "Cloud storage integration"
                ],
                "difficulty": "Advanced",
                "setup_time": "2-3 hours",
                "rating": 4.7,
                "downloads": 1150,
                "preview_url": "/templates/cv-api/preview",
                "created_at": "2024-02-12",
                "tags": ["computer-vision", "image-processing", "tensorflow"]
            },
            {
                "id": "nlp-text-analysis-api",
                "name": "NLP Text Analysis API",
                "category": "ML/AI",
                "subcategory": "Natural Language",
                "description": "Natural language processing API for text analysis and generation",
                "tech_stack": ["Python", "Transformers", "spaCy", "FastAPI", "Redis"],
                "features": [
                    "Sentiment analysis",
                    "Named entity recognition",
                    "Text summarization",
                    "Language translation",
                    "Content generation",
                    "Custom model training"
                ],
                "difficulty": "Advanced",
                "setup_time": "2-3 hours",
                "rating": 4.6,
                "downloads": 980,
                "preview_url": "/templates/nlp-api/preview",
                "created_at": "2024-02-15",
                "tags": ["nlp", "transformers", "text-analysis"]
            },
            
            # ============ E-COMMERCE TEMPLATES ============
            {
                "id": "marketplace-platform",
                "name": "Multi-Vendor Marketplace",
                "category": "E-commerce",
                "subcategory": "Marketplace",
                "description": "Complete multi-vendor marketplace with vendor management and commission system",
                "tech_stack": ["React", "Node.js", "MongoDB", "Stripe", "S3"],
                "features": [
                    "Vendor registration",
                    "Commission management",
                    "Order fulfillment",
                    "Rating system",
                    "Dispute resolution",
                    "Analytics dashboard"
                ],
                "difficulty": "Expert",
                "setup_time": "4-5 hours",
                "rating": 4.9,
                "downloads": 1890,
                "preview_url": "/templates/marketplace/preview",
                "created_at": "2024-02-18",
                "tags": ["marketplace", "multi-vendor", "commission"]
            },
            {
                "id": "subscription-box-ecommerce",
                "name": "Subscription Box E-commerce",
                "category": "E-commerce",
                "subcategory": "Subscription",
                "description": "Subscription-based e-commerce platform with recurring orders",
                "tech_stack": ["Vue.js", "Laravel", "MySQL", "Stripe", "Mailgun"],
                "features": [
                    "Subscription management",
                    "Recurring billing",
                    "Box customization",
                    "Inventory tracking",
                    "Customer portal",
                    "Email automation"
                ],
                "difficulty": "Advanced",
                "setup_time": "3-4 hours",
                "rating": 4.7,
                "downloads": 1340,
                "preview_url": "/templates/subscription-box/preview",
                "created_at": "2024-02-20",
                "tags": ["subscription", "recurring", "ecommerce"]
            },
            
            # ============ PRODUCTIVITY TEMPLATES ============
            {
                "id": "team-collaboration-suite",
                "name": "Team Collaboration Suite",
                "category": "Productivity",
                "subcategory": "Collaboration",
                "description": "Complete team collaboration platform with chat, file sharing, and project management",
                "tech_stack": ["React", "Node.js", "Socket.io", "MongoDB", "S3"],
                "features": [
                    "Real-time chat",
                    "File sharing",
                    "Video conferencing",
                    "Task management",
                    "Calendar integration",
                    "Team analytics"
                ],
                "difficulty": "Expert",
                "setup_time": "4-5 hours",
                "rating": 4.8,
                "downloads": 1670,
                "preview_url": "/templates/collaboration-suite/preview",
                "created_at": "2024-02-22",
                "tags": ["collaboration", "team", "chat", "productivity"]
            },
            {
                "id": "crm-system",
                "name": "Customer Relationship Management",
                "category": "Productivity",
                "subcategory": "CRM",
                "description": "Full-featured CRM system with sales pipeline and customer analytics",
                "tech_stack": ["Angular", "Django", "PostgreSQL", "Redis", "Celery"],
                "features": [
                    "Lead management",
                    "Sales pipeline",
                    "Customer analytics",
                    "Email campaigns",
                    "Reporting dashboard",
                    "Mobile app"
                ],
                "difficulty": "Advanced",
                "setup_time": "3-4 hours",
                "rating": 4.6,
                "downloads": 1450,
                "preview_url": "/templates/crm-system/preview",
                "created_at": "2024-02-25",
                "tags": ["crm", "sales", "analytics", "pipeline"]
            },
            {
                "id": "project-management-tool",
                "name": "Agile Project Management",
                "category": "Productivity",
                "subcategory": "Project Management",
                "description": "Agile project management tool with Kanban boards and sprint planning",
                "tech_stack": ["React", "Express", "MongoDB", "WebSockets"],
                "features": [
                    "Kanban boards",
                    "Sprint planning",
                    "Time tracking",
                    "Burndown charts",
                    "Team velocity",
                    "Reporting"
                ],
                "difficulty": "Intermediate",
                "setup_time": "2-3 hours",
                "rating": 4.7,
                "downloads": 1820,
                "preview_url": "/templates/project-mgmt/preview",
                "created_at": "2024-02-28",
                "tags": ["agile", "kanban", "project-management"]
            },
            
            # ============ CONTENT MANAGEMENT ============
            {
                "id": "headless-cms",
                "name": "Headless CMS",
                "category": "Content Management",
                "subcategory": "CMS",
                "description": "API-first headless CMS with flexible content modeling",
                "tech_stack": ["Strapi", "React", "GraphQL", "MongoDB", "S3"],
                "features": [
                    "Flexible content types",
                    "GraphQL API",
                    "Media management",
                    "User roles",
                    "Internationalization",
                    "Webhook support"
                ],
                "difficulty": "Intermediate",
                "setup_time": "1-2 hours",
                "rating": 4.5,
                "downloads": 1230,
                "preview_url": "/templates/headless-cms/preview",
                "created_at": "2024-03-01",
                "tags": ["cms", "headless", "graphql", "api-first"]
            },
            {
                "id": "blog-platform",
                "name": "Modern Blog Platform",
                "category": "Content Management",
                "subcategory": "Publishing",
                "description": "Feature-rich blog platform with SEO optimization and social features",
                "tech_stack": ["Next.js", "Sanity", "Vercel", "MongoDB"],
                "features": [
                    "SEO optimization",
                    "Social sharing",
                    "Comments system",
                    "Newsletter signup",
                    "Analytics integration",
                    "Dark mode"
                ],
                "difficulty": "Intermediate",
                "setup_time": "1-2 hours",
                "rating": 4.8,
                "downloads": 2100,
                "preview_url": "/templates/blog-platform/preview",
                "created_at": "2024-03-05",
                "tags": ["blog", "seo", "social", "newsletter"]
            },
            {
                "id": "documentation-site",
                "name": "Documentation Site Generator",
                "category": "Content Management",
                "subcategory": "Documentation",
                "description": "Beautiful documentation site with search and navigation",
                "tech_stack": ["Docusaurus", "React", "Algolia", "Netlify"],
                "features": [
                    "Search functionality",
                    "API documentation",
                    "Version control",
                    "Multi-language",
                    "Code highlighting",
                    "Interactive examples"
                ],
                "difficulty": "Beginner",
                "setup_time": "30-60 minutes",
                "rating": 4.6,
                "downloads": 1560,
                "preview_url": "/templates/docs-site/preview",
                "created_at": "2024-03-08",
                "tags": ["documentation", "api-docs", "search"]
            },
            
            # ============ MOBILE TEMPLATES ============
            {
                "id": "react-native-starter",
                "name": "React Native App Starter",
                "category": "Mobile",
                "subcategory": "Cross-platform",
                "description": "Complete React Native app with navigation, state management, and API integration",
                "tech_stack": ["React Native", "Redux", "Firebase", "AsyncStorage"],
                "features": [
                    "Navigation system",
                    "Authentication",
                    "Push notifications",
                    "Offline support",
                    "App store ready",
                    "Testing setup"
                ],
                "difficulty": "Intermediate",
                "setup_time": "2-3 hours",
                "rating": 4.7,
                "downloads": 1890,
                "preview_url": "/templates/rn-starter/preview",
                "created_at": "2024-03-10",
                "tags": ["react-native", "mobile", "firebase", "redux"]
            },
            {
                "id": "flutter-ecommerce-app",
                "name": "Flutter E-commerce App",
                "category": "Mobile",
                "subcategory": "E-commerce",
                "description": "Feature-complete Flutter e-commerce app with payment integration",
                "tech_stack": ["Flutter", "Dart", "Firebase", "Stripe"],
                "features": [
                    "Product catalog",
                    "Shopping cart",
                    "Payment processing",
                    "Order tracking",
                    "User profiles",
                    "Push notifications"
                ],
                "difficulty": "Advanced",
                "setup_time": "3-4 hours",
                "rating": 4.8,
                "downloads": 1450,
                "preview_url": "/templates/flutter-ecommerce/preview",
                "created_at": "2024-03-12",
                "tags": ["flutter", "ecommerce", "mobile", "payments"]
            },
            
            # ============ DATA & ANALYTICS ============
            {
                "id": "analytics-dashboard",
                "name": "Business Analytics Dashboard",
                "category": "Data & Analytics",
                "subcategory": "Business Intelligence",
                "description": "Comprehensive analytics dashboard with real-time data visualization",
                "tech_stack": ["React", "D3.js", "Node.js", "ClickHouse", "Redis"],
                "features": [
                    "Real-time charts",
                    "Custom metrics",
                    "Data filtering",
                    "Export reports",
                    "Alert system",
                    "Multi-user access"
                ],
                "difficulty": "Advanced",
                "setup_time": "3-4 hours",
                "rating": 4.9,
                "downloads": 1680,
                "preview_url": "/templates/analytics-dashboard/preview",
                "created_at": "2024-03-15",
                "tags": ["analytics", "dashboard", "real-time", "bi"]
            },
            {
                "id": "data-pipeline-template",
                "name": "Data Pipeline & ETL",
                "category": "Data & Analytics",
                "subcategory": "Data Engineering",
                "description": "Scalable data pipeline with ETL processes and data warehousing",
                "tech_stack": ["Apache Airflow", "Python", "Pandas", "PostgreSQL", "Docker"],
                "features": [
                    "ETL workflows",
                    "Data validation",
                    "Error handling",
                    "Monitoring",
                    "Scheduling",
                    "Data quality checks"
                ],
                "difficulty": "Expert",
                "setup_time": "4-5 hours",
                "rating": 4.6,
                "downloads": 890,
                "preview_url": "/templates/data-pipeline/preview",
                "created_at": "2024-03-18",
                "tags": ["etl", "data-pipeline", "airflow", "data-engineering"]
            },
            
            # ============ HEALTHCARE TEMPLATES ============
            {
                "id": "telemedicine-platform",
                "name": "Telemedicine Platform",
                "category": "Healthcare",
                "subcategory": "Telehealth",
                "description": "HIPAA-compliant telemedicine platform with video consultations",
                "tech_stack": ["React", "Node.js", "WebRTC", "PostgreSQL", "AWS"],
                "features": [
                    "Video consultations",
                    "Appointment booking",
                    "Medical records",
                    "Prescription management",
                    "HIPAA compliance",
                    "Payment processing"
                ],
                "difficulty": "Expert",
                "setup_time": "5-6 hours",
                "rating": 4.7,
                "downloads": 650,
                "preview_url": "/templates/telemedicine/preview",
                "created_at": "2024-03-20",
                "tags": ["healthcare", "hipaa", "telemedicine", "webrtc"]
            },
            {
                "id": "health-tracking-app",
                "name": "Personal Health Tracker",
                "category": "Healthcare",
                "subcategory": "Wellness",
                "description": "Personal health and fitness tracking application with wearable integration",
                "tech_stack": ["React Native", "Node.js", "MongoDB", "HealthKit", "Google Fit"],
                "features": [
                    "Activity tracking",
                    "Health metrics",
                    "Wearable integration",
                    "Goal setting",
                    "Progress reports",
                    "Social features"
                ],
                "difficulty": "Advanced",
                "setup_time": "3-4 hours",
                "rating": 4.5,
                "downloads": 1120,
                "preview_url": "/templates/health-tracker/preview",
                "created_at": "2024-03-22",
                "tags": ["health", "fitness", "tracking", "wearables"]
            },
            
            # ============ IOT TEMPLATES ============
            {
                "id": "iot-device-management",
                "name": "IoT Device Management Platform",
                "category": "IoT",
                "subcategory": "Device Management",
                "description": "Comprehensive IoT platform for device management and data collection",
                "tech_stack": ["React", "Node.js", "MQTT", "InfluxDB", "Docker"],
                "features": [
                    "Device provisioning",
                    "Real-time monitoring",
                    "Data visualization",
                    "Firmware updates",
                    "Alert system",
                    "API gateway"
                ],
                "difficulty": "Expert",
                "setup_time": "4-5 hours",
                "rating": 4.6,
                "downloads": 720,
                "preview_url": "/templates/iot-platform/preview",
                "created_at": "2024-03-25",
                "tags": ["iot", "mqtt", "device-management", "real-time"]
            },
            {
                "id": "smart-home-dashboard",
                "name": "Smart Home Dashboard",
                "category": "IoT",
                "subcategory": "Home Automation",
                "description": "Smart home control dashboard with device automation and scheduling",
                "tech_stack": ["Vue.js", "Python", "MQTT", "SQLite", "WebSockets"],
                "features": [
                    "Device control",
                    "Automation rules",
                    "Energy monitoring",
                    "Security cameras",
                    "Weather integration",
                    "Mobile app"
                ],
                "difficulty": "Advanced",
                "setup_time": "3-4 hours",
                "rating": 4.8,
                "downloads": 980,
                "preview_url": "/templates/smart-home/preview",
                "created_at": "2024-03-28",
                "tags": ["smart-home", "automation", "iot", "energy"]
            },
            
            # ============ EDUCATION TEMPLATES ============
            {
                "id": "lms-platform",
                "name": "Learning Management System",
                "category": "Education",
                "subcategory": "E-learning",
                "description": "Complete LMS with course creation, student tracking, and assessments",
                "tech_stack": ["React", "Django", "PostgreSQL", "S3", "WebRTC"],
                "features": [
                    "Course builder",
                    "Video streaming",
                    "Quiz system",
                    "Progress tracking",
                    "Certificates",
                    "Discussion forums"
                ],
                "difficulty": "Expert",
                "setup_time": "4-5 hours",
                "rating": 4.7,
                "downloads": 1340,
                "preview_url": "/templates/lms-platform/preview",
                "created_at": "2024-03-30",
                "tags": ["education", "lms", "elearning", "courses"]
            },
            {
                "id": "online-coding-platform",
                "name": "Online Coding Platform",
                "category": "Education",
                "subcategory": "Programming",
                "description": "Interactive coding platform with code execution and real-time collaboration",
                "tech_stack": ["React", "Node.js", "Docker", "Monaco Editor", "WebSockets"],
                "features": [
                    "Code editor",
                    "Multiple languages",
                    "Real-time collaboration",
                    "Code execution",
                    "Problem sets",
                    "Leaderboards"
                ],
                "difficulty": "Expert",
                "setup_time": "4-5 hours",
                "rating": 4.8,
                "downloads": 1890,
                "preview_url": "/templates/coding-platform/preview",
                "created_at": "2024-04-01",
                "tags": ["coding", "education", "collaboration", "docker"]
            },
            
            # ============ ORIGINAL TEMPLATES (Enhanced) ============
            {
                "id": "react-starter-kit-enhanced",
                "name": "React Starter Kit Pro",
                "category": "Web Development",
                "subcategory": "Frontend",
                "description": "Enhanced React application with TypeScript, advanced state management, and performance optimizations",
                "tech_stack": ["React 18", "TypeScript", "Zustand", "React Query", "Vite"],
                "features": [
                    "TypeScript setup",
                    "Advanced state management",
                    "Performance optimizations",
                    "Testing framework",
                    "Storybook integration",
                    "PWA ready"
                ],
                "difficulty": "Intermediate",
                "setup_time": "1-2 hours",
                "rating": 4.9,
                "downloads": 3250,
                "preview_url": "/templates/react-pro/preview",
                "created_at": "2024-01-10",
                "tags": ["react", "typescript", "performance", "pwa"]
            }
        ]
    
    def get_all_templates(self) -> List[Dict[str, Any]]:
        """Get all available templates"""
        return self.templates
    
    def get_templates_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get templates by category"""
        return [t for t in self.templates if t["category"] == category]
    
    def get_categories(self) -> List[Dict[str, Any]]:
        """Get all template categories with counts"""
        categories = {}
        for template in self.templates:
            cat = template["category"]
            if cat not in categories:
                categories[cat] = {
                    "name": cat,
                    "count": 0,
                    "subcategories": set()
                }
            categories[cat]["count"] += 1
            if "subcategory" in template:
                categories[cat]["subcategories"].add(template["subcategory"])
        
        # Convert to list and sort by popularity
        result = []
        for cat_name, cat_data in categories.items():
            result.append({
                "name": cat_name,
                "count": cat_data["count"],
                "subcategories": list(cat_data["subcategories"])
            })
        
        return sorted(result, key=lambda x: x["count"], reverse=True)
    
    def search_templates(self, query: str, category: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search templates by query, category, and difficulty"""
        results = []
        query_lower = query.lower() if query else ""
        
        for template in self.templates:
            # Category filter
            if category and template["category"] != category:
                continue
            
            # Difficulty filter  
            if difficulty and template["difficulty"] != difficulty:
                continue
            
            # Text search in name, description, and tags
            if query_lower:
                searchable_text = (
                    template["name"] + " " + 
                    template["description"] + " " + 
                    " ".join(template.get("tags", [])) + " " +
                    " ".join(template.get("tech_stack", []))
                ).lower()
                
                if query_lower in searchable_text:
                    results.append(template)
            else:
                results.append(template)
        
        # Sort by relevance (downloads and rating)
        return sorted(results, key=lambda x: (x["rating"], x["downloads"]), reverse=True)
    
    def get_template_by_id(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get specific template by ID"""
        for template in self.templates:
            if template["id"] == template_id:
                return template
        return None
    
    def get_popular_templates(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular templates"""
        return sorted(self.templates, key=lambda x: x["downloads"], reverse=True)[:limit]
    
    def get_recent_templates(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most recently added templates"""
        return sorted(self.templates, key=lambda x: x["created_at"], reverse=True)[:limit]

# Global instance
enhanced_template_library = EnhancedTemplateLibrary()