"""
Advanced Templates Gallery API Routes
Provides endpoints for browsing, creating, and managing project templates
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import json
from datetime import datetime
import uuid

router = APIRouter()

# Pydantic models
class ProjectTemplate(BaseModel):
    id: str = Field(..., description="Template unique identifier")
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Template category")
    framework: str = Field(..., description="Primary framework/technology")
    tags: List[str] = Field(default=[], description="Template tags")
    preview_url: Optional[str] = Field(None, description="Live preview URL")
    thumbnail: Optional[str] = Field(None, description="Template thumbnail")
    author: str = Field(..., description="Template author")
    version: str = Field(default="1.0.0", description="Template version")
    downloads: int = Field(default=0, description="Download count")
    stars: int = Field(default=0, description="Star count")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")
    difficulty: str = Field(default="beginner", description="Difficulty level")
    estimated_time: str = Field(default="5 minutes", description="Estimated setup time")
    features: List[str] = Field(default=[], description="Key features")
    dependencies: Dict[str, str] = Field(default={}, description="Required dependencies")
    file_structure: Dict[str, Any] = Field(default={}, description="Template file structure")

class TemplateCategory(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    count: int
    featured: bool = False

class CreateTemplateRequest(BaseModel):
    name: str
    description: str
    category: str
    framework: str
    tags: List[str] = []
    files: Dict[str, str] = {}

# Mock templates data
MOCK_TEMPLATES = [
    {
        "id": "react-typescript-starter",
        "name": "React TypeScript Starter",
        "description": "Modern React application with TypeScript, Tailwind CSS, and Vite",
        "category": "frontend",
        "framework": "React",
        "tags": ["react", "typescript", "tailwind", "vite"],
        "preview_url": "https://react-typescript-starter.vercel.app",
        "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
        "author": "AETHERFLOW Team",
        "version": "2.1.0",
        "downloads": 15420,
        "stars": 342,
        "difficulty": "beginner",
        "estimated_time": "3 minutes",
        "features": ["TypeScript", "Tailwind CSS", "Vite", "ESLint", "Prettier", "React Router"],
        "dependencies": {
            "react": "^18.2.0",
            "typescript": "^5.0.0",
            "tailwindcss": "^3.3.0",
            "vite": "^4.4.0"
        },
        "file_structure": {
            "src/": {"App.tsx": "main app", "index.tsx": "entry point"},
            "public/": {"index.html": "html template"},
            "package.json": "dependencies"
        }
    },
    {
        "id": "nextjs-fullstack",
        "name": "Next.js Full Stack",
        "description": "Complete full-stack application with Next.js, Prisma, and PostgreSQL",
        "category": "fullstack",
        "framework": "Next.js",
        "tags": ["nextjs", "prisma", "postgresql", "api", "database"],
        "preview_url": "https://nextjs-fullstack-demo.vercel.app",
        "thumbnail": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
        "author": "Community",
        "version": "1.8.2",
        "downloads": 8734,
        "stars": 189,
        "difficulty": "intermediate",
        "estimated_time": "10 minutes",
        "features": ["Next.js 14", "Prisma ORM", "PostgreSQL", "API Routes", "Authentication", "Tailwind CSS"],
        "dependencies": {
            "next": "^14.0.0",
            "prisma": "^5.0.0",
            "next-auth": "^4.24.0"
        },
        "file_structure": {
            "app/": {"page.tsx": "home page", "api/": "api routes"},
            "prisma/": {"schema.prisma": "database schema"},
            "components/": {"ui components": "reusable components"}
        }
    },
    {
        "id": "vue-dashboard",
        "name": "Vue.js Dashboard",
        "description": "Professional admin dashboard with Vue 3, Pinia, and Chart.js",
        "category": "dashboard",
        "framework": "Vue.js",
        "tags": ["vue", "dashboard", "charts", "admin", "pinia"],
        "preview_url": "https://vue-dashboard-demo.netlify.app",
        "thumbnail": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        "author": "Vue Community",
        "version": "3.2.1",
        "downloads": 12567,
        "stars": 256,
        "difficulty": "intermediate",
        "estimated_time": "8 minutes",
        "features": ["Vue 3", "Pinia", "Vue Router", "Chart.js", "Responsive Design", "Dark Mode"],
        "dependencies": {
            "vue": "^3.3.0",
            "pinia": "^2.1.0",
            "chart.js": "^4.0.0"
        },
        "file_structure": {
            "src/": {"views/": "page components", "components/": "ui components", "stores/": "pinia stores"}
        }
    },
    {
        "id": "python-fastapi",
        "name": "Python FastAPI Starter",
        "description": "Fast and modern Python API with FastAPI, SQLAlchemy, and PostgreSQL",
        "category": "backend",
        "framework": "FastAPI",
        "tags": ["python", "fastapi", "sqlalchemy", "api", "postgresql"],
        "preview_url": null,
        "thumbnail": "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=250&fit=crop",
        "author": "Python Guild",
        "version": "1.5.3",
        "downloads": 6789,
        "stars": 145,
        "difficulty": "intermediate",
        "estimated_time": "12 minutes",
        "features": ["FastAPI", "SQLAlchemy", "Pydantic", "OAuth2", "Docker", "Testing"],
        "dependencies": {
            "fastapi": "^0.104.0",
            "sqlalchemy": "^2.0.0",
            "pydantic": "^2.4.0"
        },
        "file_structure": {
            "app/": {"main.py": "app entry", "models/": "database models", "routers/": "api routes"},
            "tests/": {"test files": "unit tests"},
            "Dockerfile": "container config"
        }
    },
    {
        "id": "svelte-portfolio",
        "name": "Svelte Portfolio",
        "description": "Beautiful portfolio website built with SvelteKit and Tailwind CSS",
        "category": "portfolio",
        "framework": "Svelte",
        "tags": ["svelte", "sveltekit", "portfolio", "tailwind", "responsive"],
        "preview_url": "https://svelte-portfolio.surge.sh",
        "thumbnail": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
        "author": "Svelte Society",
        "version": "2.0.0",
        "downloads": 3456,
        "stars": 98,
        "difficulty": "beginner",
        "estimated_time": "5 minutes",
        "features": ["SvelteKit", "Tailwind CSS", "Mobile First", "SEO Optimized", "Contact Form"],
        "dependencies": {
            "@sveltejs/kit": "^1.20.0",
            "tailwindcss": "^3.3.0"
        },
        "file_structure": {
            "src/routes/": {"page layouts", "components": "svelte components"},
            "static/": {"assets": "images and files"}
        }
    },
    {
        "id": "flutter-mobile-app",
        "name": "Flutter Mobile App",
        "description": "Cross-platform mobile app with Flutter, Firebase, and Material Design",
        "category": "mobile",
        "framework": "Flutter",
        "tags": ["flutter", "mobile", "firebase", "material", "dart"],
        "preview_url": null,
        "thumbnail": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
        "author": "Flutter Team",
        "version": "1.3.0",
        "downloads": 9876,
        "stars": 234,
        "difficulty": "advanced",
        "estimated_time": "15 minutes",
        "features": ["Flutter 3.0", "Firebase", "State Management", "Navigation", "Authentication"],
        "dependencies": {
            "flutter": "^3.0.0",
            "firebase_core": "^2.15.0"
        },
        "file_structure": {
            "lib/": {"main.dart": "app entry", "screens/": "app screens", "widgets/": "custom widgets"}
        }
    }
]

TEMPLATE_CATEGORIES = [
    {"id": "frontend", "name": "Frontend", "description": "Client-side applications and websites", "icon": "🌐", "count": 45, "featured": True},
    {"id": "backend", "name": "Backend", "description": "Server-side APIs and services", "icon": "⚙️", "count": 32, "featured": True},
    {"id": "fullstack", "name": "Full Stack", "description": "Complete applications with frontend and backend", "icon": "🚀", "count": 28, "featured": True},
    {"id": "mobile", "name": "Mobile", "description": "Native and cross-platform mobile apps", "icon": "📱", "count": 23, "featured": False},
    {"id": "dashboard", "name": "Dashboard", "description": "Admin panels and data visualization", "icon": "📊", "count": 19, "featured": False},
    {"id": "portfolio", "name": "Portfolio", "description": "Personal and professional portfolios", "icon": "👤", "count": 15, "featured": False},
    {"id": "ecommerce", "name": "E-commerce", "description": "Online stores and shopping platforms", "icon": "🛒", "count": 12, "featured": False},
    {"id": "blog", "name": "Blog", "description": "Content management and blogging platforms", "icon": "📝", "count": 18, "featured": False}
]

@router.get("/templates", response_model=List[ProjectTemplate])
async def get_templates(
    category: Optional[str] = None,
    framework: Optional[str] = None,
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    sort_by: str = "downloads",
    featured_only: bool = False
):
    """Get list of available project templates with filtering and sorting"""
    try:
        templates = MOCK_TEMPLATES.copy()
        
        # Apply filters
        if category and category != "all":
            templates = [t for t in templates if t["category"] == category]
        
        if framework and framework != "all":
            templates = [t for t in templates if t["framework"].lower() == framework.lower()]
        
        if difficulty and difficulty != "all":
            templates = [t for t in templates if t["difficulty"] == difficulty]
        
        if search:
            search_lower = search.lower()
            templates = [t for t in templates 
                        if search_lower in t["name"].lower() 
                        or search_lower in t["description"].lower()
                        or any(search_lower in tag.lower() for tag in t["tags"])]
        
        if featured_only:
            # Featured templates are top downloaded ones
            templates = sorted(templates, key=lambda x: x["downloads"], reverse=True)[:6]
        
        # Apply sorting
        if sort_by == "downloads":
            templates.sort(key=lambda x: x["downloads"], reverse=True)
        elif sort_by == "stars":
            templates.sort(key=lambda x: x["stars"], reverse=True)
        elif sort_by == "name":
            templates.sort(key=lambda x: x["name"])
        elif sort_by == "recent":
            templates.sort(key=lambda x: x["updated_at"], reverse=True)
        elif sort_by == "difficulty":
            difficulty_order = {"beginner": 1, "intermediate": 2, "advanced": 3}
            templates.sort(key=lambda x: difficulty_order.get(x["difficulty"], 4))
        
        return [ProjectTemplate(**template) for template in templates]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching templates: {str(e)}")

@router.get("/templates/categories", response_model=List[TemplateCategory])
async def get_template_categories():
    """Get list of template categories"""
    try:
        return [TemplateCategory(**cat) for cat in TEMPLATE_CATEGORIES]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/templates/{template_id}", response_model=ProjectTemplate)
async def get_template_details(template_id: str):
    """Get detailed information about a specific template"""
    try:
        template = next((t for t in MOCK_TEMPLATES if t["id"] == template_id), None)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return ProjectTemplate(**template)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching template details: {str(e)}")

@router.post("/templates/{template_id}/use")
async def use_template(template_id: str, project_name: str):
    """Create a new project from a template"""
    try:
        template = next((t for t in MOCK_TEMPLATES if t["id"] == template_id), None)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # In production, this would create actual project files
        project_id = str(uuid.uuid4())
        
        # Increment download count
        template["downloads"] += 1
        
        return {
            "success": True,
            "message": f"Project '{project_name}' created from template '{template['name']}'",
            "project_id": project_id,
            "template_id": template_id,
            "project_name": project_name,
            "files_created": len(template.get("file_structure", {}))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error using template: {str(e)}")

@router.get("/templates/{template_id}/preview")
async def get_template_preview(template_id: str):
    """Get template preview files and structure"""
    try:
        template = next((t for t in MOCK_TEMPLATES if t["id"] == template_id), None)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Mock preview files
        preview_files = {
            "package.json": json.dumps({
                "name": template["name"].lower().replace(" ", "-"),
                "version": template["version"],
                "description": template["description"],
                "dependencies": template.get("dependencies", {})
            }, indent=2),
            "README.md": f"""# {template['name']}

{template['description']}

## Features

{chr(10).join(f"- {feature}" for feature in template.get('features', []))}

## Quick Start

1. Install dependencies
2. Start development server
3. Open http://localhost:3000

## Tech Stack

- **Framework**: {template['framework']}
- **Difficulty**: {template['difficulty'].title()}
- **Estimated Setup**: {template['estimated_time']}

## Tags

{', '.join(template.get('tags', []))}
""",
            "src/App.jsx": f"""// {template['name']} - Main Application Component
import React from 'react';

function App() {{
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {template['name']}
          </h1>
          <p className="text-gray-600 mt-2">
            {template['description']}
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to your new project!</h2>
          <p className="text-gray-600 mb-8">
            This template includes: {', '.join(template.get('features', [])[:3])}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-gray-600">
                Follow the README instructions to set up your development environment.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-gray-600">
                Check out the {template['framework']} documentation for detailed guides.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-gray-600">
                Join our community for support and to share your projects.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}}

export default App;
"""
        }
        
        return {
            "template_id": template_id,
            "files": preview_files,
            "structure": template.get("file_structure", {}),
            "preview_url": template.get("preview_url"),
            "estimated_time": template.get("estimated_time", "5 minutes")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching template preview: {str(e)}")

@router.get("/templates/stats/overview")
async def get_templates_stats():
    """Get overview statistics about templates"""
    try:
        total_templates = len(MOCK_TEMPLATES)
        total_downloads = sum(t["downloads"] for t in MOCK_TEMPLATES)
        avg_rating = 4.5  # Mock average rating
        
        categories_stats = []
        for category in TEMPLATE_CATEGORIES:
            cat_templates = [t for t in MOCK_TEMPLATES if t["category"] == category["id"]]
            cat_downloads = sum(t["downloads"] for t in cat_templates)
            categories_stats.append({
                "category": category["name"],
                "count": len(cat_templates),
                "downloads": cat_downloads
            })
        
        frameworks_stats = {}
        for template in MOCK_TEMPLATES:
            framework = template["framework"]
            if framework not in frameworks_stats:
                frameworks_stats[framework] = {"count": 0, "downloads": 0}
            frameworks_stats[framework]["count"] += 1
            frameworks_stats[framework]["downloads"] += template["downloads"]
        
        return {
            "total_templates": total_templates,
            "total_downloads": total_downloads,
            "average_rating": avg_rating,
            "categories": categories_stats,
            "frameworks": [{"name": k, **v} for k, v in frameworks_stats.items()]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching template stats: {str(e)}")