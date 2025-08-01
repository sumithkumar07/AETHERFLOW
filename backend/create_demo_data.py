import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta
import uuid

# Database connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/aicodestudio')

async def create_demo_data():
    """Create demo user and sample data"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.get_default_database()
    
    try:
        # Create demo user
        demo_user = {
            "id": str(uuid.uuid4()),
            "email": "demo@aicodestudio.com",
            "name": "Demo User",
            "hashed_password": bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "profile": {
                "bio": "Demo user for AI Tempo platform",
                "avatar": None,
                "preferences": {
                    "theme": "light",
                    "notifications": True
                }
            }
        }
        
        # Insert demo user (replace if exists)
        await db.users.replace_one(
            {"email": "demo@aicodestudio.com"}, 
            demo_user, 
            upsert=True
        )
        print("✅ Demo user created/updated")
        
        # Create sample projects
        sample_projects = [
            {
                "id": str(uuid.uuid4()),
                "name": "E-commerce Platform",
                "description": "Building a modern e-commerce platform with React, FastAPI, and MongoDB. Features include product catalog, shopping cart, user authentication, and payment processing.",
                "user_id": demo_user["id"],
                "status": "active",
                "tech_stack": ["React", "FastAPI", "MongoDB", "Stripe"],
                "created_at": datetime.utcnow() - timedelta(days=3),
                "updated_at": datetime.utcnow() - timedelta(hours=2),
                "progress": 65,
                "metadata": {
                    "files_count": 24,
                    "last_activity": datetime.utcnow() - timedelta(hours=2)
                }
            },
            {
                "id": str(uuid.uuid4()),
                "name": "AI Chat Dashboard",
                "description": "An intelligent dashboard for managing AI conversations with multiple models. Includes conversation history, model switching, and analytics.",
                "user_id": demo_user["id"],
                "status": "active",
                "tech_stack": ["React", "Python", "OpenAI", "Anthropic"],
                "created_at": datetime.utcnow() - timedelta(days=7),
                "updated_at": datetime.utcnow() - timedelta(days=1),
                "progress": 45,
                "metadata": {
                    "files_count": 18,
                    "last_activity": datetime.utcnow() - timedelta(days=1)
                }
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Task Management App",
                "description": "A collaborative task management application with real-time updates, team management, and progress tracking.",
                "user_id": demo_user["id"],
                "status": "completed",
                "tech_stack": ["React", "Node.js", "Socket.io", "PostgreSQL"],
                "created_at": datetime.utcnow() - timedelta(days=14),
                "updated_at": datetime.utcnow() - timedelta(days=5),
                "progress": 100,
                "metadata": {
                    "files_count": 32,
                    "last_activity": datetime.utcnow() - timedelta(days=5)
                }
            }
        ]
        
        # Insert sample projects (replace if exists)
        for project in sample_projects:
            await db.projects.replace_one(
                {"name": project["name"], "user_id": demo_user["id"]},
                project,
                upsert=True
            )
        print("✅ Sample projects created/updated")
        
        # Create sample templates
        sample_templates = [
            {
                "id": str(uuid.uuid4()),
                "name": "React Starter Kit",
                "description": "Production-ready React template with authentication, routing, and state management",
                "category": "Web Apps",
                "difficulty": "Intermediate",
                "tech_stack": ["React", "TypeScript", "Tailwind CSS", "Zustand"],
                "featured": True,
                "downloads": 1250,
                "rating": 4.9,
                "author": "AI Tempo Team",
                "setup_time": "10 minutes",
                "preview_url": None,
                "created_at": datetime.utcnow() - timedelta(days=30),
                "updated_at": datetime.utcnow() - timedelta(days=5)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "FastAPI Backend",
                "description": "Complete FastAPI backend with MongoDB, authentication, and API documentation",
                "category": "APIs",
                "difficulty": "Advanced",
                "tech_stack": ["FastAPI", "MongoDB", "JWT", "Docker"],
                "featured": True,
                "downloads": 890,
                "rating": 4.8,
                "author": "AI Tempo Team",
                "setup_time": "15 minutes",
                "preview_url": None,
                "created_at": datetime.utcnow() - timedelta(days=25),
                "updated_at": datetime.utcnow() - timedelta(days=3)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "E-commerce Store",
                "description": "Full-featured online store with payment integration and admin dashboard",
                "category": "E-commerce",
                "difficulty": "Advanced",
                "tech_stack": ["React", "Node.js", "Stripe", "MongoDB"],
                "featured": True,
                "downloads": 2100,
                "rating": 4.7,
                "author": "Community",
                "setup_time": "30 minutes",
                "preview_url": None,
                "created_at": datetime.utcnow() - timedelta(days=45),
                "updated_at": datetime.utcnow() - timedelta(days=1)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Mobile App Starter",
                "description": "Cross-platform mobile app template with React Native",
                "category": "Mobile",
                "difficulty": "Intermediate",
                "tech_stack": ["React Native", "Expo", "TypeScript"],
                "featured": False,
                "downloads": 650,
                "rating": 4.6,
                "author": "Community",
                "setup_time": "20 minutes",
                "preview_url": None,
                "created_at": datetime.utcnow() - timedelta(days=20),
                "updated_at": datetime.utcnow() - timedelta(days=7)
            }
        ]
        
        # Insert sample templates
        for template in sample_templates:
            await db.templates.replace_one(
                {"name": template["name"]},
                template,
                upsert=True
            )
        print("✅ Sample templates created/updated")
        
        # Create sample integrations
        sample_integrations = [
            {
                "id": str(uuid.uuid4()),
                "name": "Stripe",
                "description": "Accept payments online with Stripe's secure payment processing",
                "category": "Payments",
                "provider": "Stripe Inc.",
                "icon": "💳",
                "status": "available",
                "setup_complexity": "easy",
                "documentation_url": "https://stripe.com/docs",
                "features": ["Payment Processing", "Subscriptions", "Invoicing", "Analytics"],
                "pricing": "2.9% + 30¢ per transaction",
                "rating": 4.8,
                "installs": 15000,
                "created_at": datetime.utcnow() - timedelta(days=60),
                "updated_at": datetime.utcnow() - timedelta(days=10)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "SendGrid",
                "description": "Reliable email delivery service for transactional and marketing emails",
                "category": "Email",
                "provider": "Twilio SendGrid",
                "icon": "📧",
                "status": "available",
                "setup_complexity": "medium",
                "documentation_url": "https://docs.sendgrid.com",
                "features": ["Email API", "Email Templates", "Analytics", "Webhooks"],
                "pricing": "Free for 100 emails/day",
                "rating": 4.5,
                "installs": 8500,
                "created_at": datetime.utcnow() - timedelta(days=50),
                "updated_at": datetime.utcnow() - timedelta(days=5)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "MongoDB Atlas",
                "description": "Fully managed cloud database service built for modern applications",
                "category": "Database",
                "provider": "MongoDB Inc.",
                "icon": "🍃",
                "status": "available",
                "setup_complexity": "easy",
                "documentation_url": "https://docs.atlas.mongodb.com",
                "features": ["Global Clusters", "Auto-Scaling", "Backup", "Security"],
                "pricing": "Free tier available",
                "rating": 4.7,
                "installs": 12000,
                "created_at": datetime.utcnow() - timedelta(days=40),
                "updated_at": datetime.utcnow() - timedelta(days=8)
            }
        ]
        
        # Insert sample integrations
        for integration in sample_integrations:
            await db.integrations.replace_one(
                {"name": integration["name"]},
                integration,
                upsert=True
            )
        print("✅ Sample integrations created/updated")
        
        print("🎉 All demo data created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating demo data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_demo_data())