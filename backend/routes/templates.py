from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from models.user import User
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_templates(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 20
):
    """Get available templates"""
    try:
        db = await get_database()
        
        # Check if templates collection has data, if not, seed it
        template_count = await db.templates.count_documents({})
        if template_count == 0:
            await seed_templates(db)
        
        # Build query
        query = {}
        if category:
            query["category"] = category
        if featured is not None:
            query["featured"] = featured
        if search:
            query["$text"] = {"$search": search}
        
        templates_cursor = db.templates.find(query).limit(limit)
        templates = await templates_cursor.to_list(length=limit)
        
        for template in templates:
            template["id"] = str(template["_id"])
            template["_id"] = str(template["_id"])
        
        return {
            "templates": templates,
            "total": len(templates)
        }
        
    except Exception as e:
        logger.error(f"Templates fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch templates")

@router.get("/categories")
async def get_template_categories():
    """Get template categories"""
    try:
        db = await get_database()
        
        categories = await db.templates.distinct("category")
        
        # Get counts for each category
        category_data = []
        for category in categories:
            count = await db.templates.count_documents({"category": category})
            category_data.append({
                "name": category,
                "count": count,
                "slug": category.lower().replace(" ", "-")
            })
        
        return {"categories": category_data}
        
    except Exception as e:
        logger.error(f"Categories fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories")

@router.get("/{template_id}")
async def get_template_details(template_id: str):
    """Get template details"""
    try:
        db = await get_database()
        
        template = await db.templates.find_one({"_id": template_id})
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        template["id"] = str(template["_id"])
        template["_id"] = str(template["_id"])
        
        return {"template": template}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch template")

@router.post("/{template_id}/use")
async def use_template(
    template_id: str,
    project_name: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Create project from template"""
    try:
        db = await get_database()
        
        # Get template
        template = await db.templates.find_one({"_id": template_id})
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Create project from template
        project_id = f"proj_{uuid.uuid4().hex[:12]}"
        project_data = {
            "_id": project_id,
            "user_id": str(current_user.id),
            "name": project_name or template["name"],
            "description": f"Project created from {template['name']} template",
            "type": template.get("type", "react_app"),
            "status": "draft",
            "template_id": template_id,
            "tech_stack": template.get("tech_stack", []),
            "files": template.get("starter_files", []),
            "metadata": {
                "created_from_template": True,
                "template_name": template["name"],
                "estimated_completion": template.get("setup_time", "30 minutes")
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.projects.insert_one(project_data)
        
        # Update template usage count
        await db.templates.update_one(
            {"_id": template_id},
            {"$inc": {"downloads": 1, "usage_count": 1}}
        )
        
        # Update user's project count
        await db.users.update_one(
            {"_id": str(current_user.id)},
            {"$inc": {"projects_count": 1}}
        )
        
        project_data["id"] = project_id
        
        return {
            "project": project_data,
            "message": "Project created successfully from template"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template use error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project from template")

async def seed_templates(db):
    """Seed database with sample templates"""
    templates = [
        {
            "_id": "react-starter",
            "name": "React Starter Kit",
            "description": "Modern React application with TypeScript, Tailwind CSS, and essential features",
            "category": "Web Apps",
            "type": "react_app",
            "featured": True,
            "image_url": "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400",
            "tech_stack": ["React", "TypeScript", "Tailwind CSS", "Vite"],
            "difficulty": "Beginner",
            "setup_time": "15 minutes",
            "downloads": 1250,
            "rating": 4.8,
            "author": "AI Tempo Team",
            "features": [
                "Modern React 18 with Hooks",
                "TypeScript for type safety",
                "Tailwind CSS for styling",
                "Vite for fast development",
                "ESLint and Prettier configured",
                "Basic routing with React Router"
            ],
            "starter_files": [
                {"path": "src/App.tsx", "content": "// React App starter", "language": "typescript"},
                {"path": "src/index.css", "content": "/* Tailwind imports */", "language": "css"}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "ecommerce-store",
            "name": "E-commerce Store",
            "description": "Full-featured online store with payment integration and admin panel",
            "category": "E-commerce",
            "type": "full_stack",
            "featured": True,
            "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
            "tech_stack": ["React", "Node.js", "MongoDB", "Stripe", "Tailwind CSS"],
            "difficulty": "Advanced",
            "setup_time": "2 hours",
            "downloads": 890,
            "rating": 4.9,
            "author": "AI Tempo Team",
            "features": [
                "Product catalog with categories",
                "Shopping cart and checkout",
                "Stripe payment integration",
                "User authentication and profiles",
                "Admin dashboard",
                "Order management system"
            ],
            "starter_files": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "task-manager",
            "name": "Task Management App",
            "description": "Collaborative task management with real-time updates",
            "category": "Productivity",
            "type": "full_stack",
            "featured": False,
            "image_url": "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
            "tech_stack": ["React", "FastAPI", "PostgreSQL", "WebSockets"],
            "difficulty": "Intermediate",
            "setup_time": "1 hour",
            "downloads": 650,
            "rating": 4.7,
            "author": "Community",
            "features": [
                "Create and manage tasks",
                "Real-time collaboration",
                "Project organization",
                "Due date tracking",
                "Team member assignment",
                "Progress tracking"
            ],
            "starter_files": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "blog-platform",
            "name": "Blog Platform",
            "description": "Modern blog with markdown support and SEO optimization",
            "category": "Content Management",
            "type": "full_stack",
            "featured": False,
            "image_url": "https://images.unsplash.com/photo-1486312338219-ce68e2c04b49?w=400",
            "tech_stack": ["Next.js", "TypeScript", "MDX", "Prisma"],
            "difficulty": "Intermediate",
            "setup_time": "45 minutes",
            "downloads": 420,
            "rating": 4.6,
            "author": "Community",
            "features": [
                "Markdown blog posts",
                "SEO optimization",
                "Comment system",
                "Author profiles",
                "Categories and tags",
                "RSS feed generation"
            ],
            "starter_files": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "dashboard-analytics",
            "name": "Analytics Dashboard",
            "description": "Data visualization dashboard with charts and real-time metrics",
            "category": "Analytics",
            "type": "web_app",
            "featured": True,
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
            "tech_stack": ["React", "D3.js", "Chart.js", "WebSockets"],
            "difficulty": "Advanced",
            "setup_time": "1.5 hours",
            "downloads": 780,
            "rating": 4.8,
            "author": "AI Tempo Team",
            "features": [
                "Interactive charts and graphs",
                "Real-time data updates",
                "Customizable widgets",
                "Data export functionality",
                "Multiple chart types",
                "Responsive design"
            ],
            "starter_files": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "api-service",
            "name": "REST API Service",
            "description": "Production-ready API with authentication, validation, and documentation",
            "category": "Backend",
            "type": "api_service",
            "featured": False,
            "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
            "tech_stack": ["FastAPI", "PostgreSQL", "Docker", "JWT"],
            "difficulty": "Intermediate",
            "setup_time": "30 minutes",
            "downloads": 560,
            "rating": 4.7,
            "author": "Community",
            "features": [
                "RESTful API endpoints",
                "JWT authentication",
                "Request validation",
                "API documentation",
                "Database migrations",
                "Docker containerization"
            ],
            "starter_files": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.templates.insert_many(templates)
    logger.info(f"✅ Seeded {len(templates)} templates")