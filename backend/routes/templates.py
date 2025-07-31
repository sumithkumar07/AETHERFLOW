from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from models.user import User
from models.template import Template, TemplateCreate, TemplateCategory
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

# Sample templates data
SAMPLE_TEMPLATES = [
    {
        "_id": "react-starter",
        "name": "React Starter Kit",
        "description": "A modern React application with routing, state management, and styling setup.",
        "category": TemplateCategory.WEB_APP,
        "tags": ["react", "typescript", "tailwind", "router"],
        "files": [
            {
                "path": "src/App.tsx",
                "content": """import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { About } from './pages/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;""",
                "language": "typescript"
            },
            {
                "path": "src/components/Header.tsx",
                "content": """import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Your App
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};""",
                "language": "typescript"
            },
            {
                "path": "package.json",
                "content": """{
  "name": "react-starter",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.9.0",
    "tailwindcss": "^3.2.0"
  }
}""",
                "language": "json"
            }
        ],
        "requirements": "Node.js 16+, npm or yarn",
        "setup_instructions": "1. Install dependencies: npm install\n2. Start development server: npm start\n3. Open http://localhost:3000",
        "featured": True,
        "downloads": 1250,
        "rating": 4.8,
        "created_by": "system"
    },
    {
        "_id": "fastapi-crud",
        "name": "FastAPI CRUD API",
        "description": "A complete FastAPI application with CRUD operations, authentication, and database integration.",
        "category": TemplateCategory.API,
        "tags": ["fastapi", "python", "crud", "auth", "database"],
        "files": [
            {
                "path": "main.py",
                "content": """from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Item, User
from schemas import ItemCreate, ItemResponse, UserCreate, UserResponse
from auth import get_current_user

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRUD API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI CRUD API"}

@app.post("/items/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_item = Item(**item.dict(), owner_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/items/", response_model=list[ItemResponse])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(Item).offset(skip).limit(limit).all()
    return items""",
                "language": "python"
            },
            {
                "path": "requirements.txt",
                "content": """fastapi==0.104.1
sqlalchemy==2.0.23
alembic==1.13.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
uvicorn[standard]==0.24.0""",
                "language": "text"
            }
        ],
        "requirements": "Python 3.8+, pip",
        "setup_instructions": "1. Install dependencies: pip install -r requirements.txt\n2. Run server: uvicorn main:app --reload\n3. Open http://localhost:8000/docs",
        "featured": True,
        "downloads": 890,
        "rating": 4.6,
        "created_by": "system"
    },
    {
        "_id": "ecommerce-starter",
        "name": "E-commerce Store",
        "description": "Complete e-commerce solution with product catalog, shopping cart, and payment integration.",
        "category": TemplateCategory.ECOMMERCE,
        "tags": ["react", "ecommerce", "stripe", "cart", "shop"],
        "files": [
            {
                "path": "src/App.jsx",
                "content": """import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;""",
                "language": "javascript"
            }
        ],
        "requirements": "Node.js 16+, Stripe account for payments",
        "setup_instructions": "1. Install dependencies: npm install\n2. Set up Stripe keys in .env\n3. Start development: npm start",
        "featured": True,
        "downloads": 675,
        "rating": 4.7,
        "created_by": "system"
    },
    {
        "_id": "dashboard-admin",
        "name": "Admin Dashboard",
        "description": "Professional admin dashboard with charts, tables, and user management.",
        "category": TemplateCategory.DASHBOARD,
        "tags": ["admin", "dashboard", "charts", "tables", "management"],
        "files": [
            {
                "path": "src/Dashboard.jsx",
                "content": """import React from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { StatsCards } from './components/StatsCards';
import { Charts } from './components/Charts';
import { RecentActivity } from './components/RecentActivity';

export const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h3 className="text-gray-700 text-3xl font-medium">Dashboard</h3>
            <StatsCards />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Charts />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};""",
                "language": "javascript"
            }
        ],
        "requirements": "Node.js 16+, Chart.js for visualizations",
        "setup_instructions": "1. Install dependencies: npm install\n2. Start development: npm start\n3. Login with admin credentials",
        "featured": False,
        "downloads": 423,
        "rating": 4.5,
        "created_by": "system"
    }
]

@router.get("/", response_model=dict)
async def get_templates(
    category: Optional[TemplateCategory] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = Query(None, description="Search templates by name or tags"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0)
):
    """Get all templates with filtering options"""
    
    templates = SAMPLE_TEMPLATES.copy()
    
    # Filter by category
    if category:
        templates = [t for t in templates if t["category"] == category]
    
    # Filter by featured
    if featured is not None:
        templates = [t for t in templates if t["featured"] == featured]
    
    # Search filter
    if search:
        search_lower = search.lower()
        templates = [
            t for t in templates 
            if search_lower in t["name"].lower() 
            or search_lower in t["description"].lower()
            or any(search_lower in tag.lower() for tag in t["tags"])
        ]
    
    # Pagination
    total = len(templates)
    templates = templates[offset:offset + limit]
    
    return {
        "templates": templates,
        "total": total,
        "categories": list(TemplateCategory),
        "featured_count": len([t for t in SAMPLE_TEMPLATES if t["featured"]])
    }

@router.get("/categories", response_model=dict)
async def get_template_categories():
    """Get all template categories with counts"""
    categories = {}
    
    for template in SAMPLE_TEMPLATES:
        cat = template["category"]
        if cat not in categories:
            categories[cat] = {"count": 0, "templates": []}
        categories[cat]["count"] += 1
        categories[cat]["templates"].append({
            "id": template["_id"],
            "name": template["name"],
            "featured": template["featured"]
        })
    
    return {
        "categories": categories,
        "total_categories": len(categories)
    }

@router.get("/featured", response_model=dict)
async def get_featured_templates():
    """Get featured templates"""
    featured = [t for t in SAMPLE_TEMPLATES if t["featured"]]
    return {"templates": featured}

@router.get("/{template_id}", response_model=dict)
async def get_template(template_id: str):
    """Get a specific template by ID"""
    template = next((t for t in SAMPLE_TEMPLATES if t["_id"] == template_id), None)
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {"template": template}

@router.post("/{template_id}/use", response_model=dict)
async def use_template(
    template_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark template as used (increment download count)"""
    template = next((t for t in SAMPLE_TEMPLATES if t["_id"] == template_id), None)
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # In a real implementation, increment download count in database
    template["downloads"] += 1
    
    return {
        "message": "Template usage recorded",
        "template_id": template_id,
        "downloads": template["downloads"]
    }

@router.post("/", response_model=dict)
async def create_template(
    template: TemplateCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new template (premium feature)"""
    if not current_user.is_premium:
        raise HTTPException(
            status_code=403, 
            detail="Creating custom templates requires premium subscription"
        )
    
    # In a real implementation, save to database
    db = await get_database()
    
    template_data = {
        **template.dict(),
        "featured": False,
        "downloads": 0,
        "rating": 0.0,
        "created_by": str(current_user.id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.templates.insert_one(template_data)
    template_data["_id"] = str(result.inserted_id)
    
    return {
        "template": template_data,
        "message": "Template created successfully"
    }

@router.get("/user/my-templates", response_model=dict)
async def get_user_templates(
    current_user: User = Depends(get_current_user)
):
    """Get templates created by the current user"""
    db = await get_database()
    
    templates = await db.templates.find(
        {"created_by": str(current_user.id)}
    ).sort("created_at", -1).to_list(length=100)
    
    # Convert ObjectId to string
    for template in templates:
        template["_id"] = str(template["_id"])
    
    return {
        "templates": templates,
        "total": len(templates)
    }