#!/usr/bin/env python3

import asyncio
import sys
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.database import init_db, get_database

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_demo_user():
    """Create demo user if not exists"""
    try:
        db = await get_database()
        
        # Check if demo user already exists
        existing_user = await db.users.find_one({"email": "demo@aicodestudio.com"})
        if existing_user:
            print("✅ Demo user already exists")
            return existing_user["_id"]
        
        # Create demo user
        demo_user = {
            "_id": "demo_user_123",
            "name": "Demo User",
            "email": "demo@aicodestudio.com",
            "hashed_password": pwd_context.hash("demo123"),
            "avatar": None,
            "is_premium": True,
            "projects_count": 3,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.users.insert_one(demo_user)
        print("✅ Demo user created successfully")
        return demo_user["_id"]
        
    except Exception as e:
        print(f"❌ Demo user creation error: {e}")
        return None

async def create_demo_projects(user_id):
    """Create demo projects for the user"""
    try:
        db = await get_database()
        
        # Check if demo projects already exist
        existing_projects = await db.projects.find({"user_id": user_id}).to_list(length=None)
        if existing_projects:
            print(f"✅ Found {len(existing_projects)} existing demo projects")
            return
        
        demo_projects = [
            {
                "_id": "demo_project_1",
                "user_id": user_id,
                "name": "E-commerce Platform",
                "description": "A modern e-commerce platform with React frontend and FastAPI backend",
                "type": "full_stack",
                "status": "active",
                "tech_stack": ["React", "FastAPI", "MongoDB", "Stripe", "Tailwind CSS"],
                "progress": 75,
                "metadata": {
                    "files_count": 24,
                    "created_from_template": True,
                    "template_name": "E-commerce Starter",
                    "estimated_completion": "2 hours"
                },
                "created_at": datetime.utcnow() - timedelta(days=5),
                "updated_at": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "_id": "demo_project_2", 
                "user_id": user_id,
                "name": "Task Management App",
                "description": "Collaborative task management with real-time updates",
                "type": "react_app",
                "status": "active",
                "tech_stack": ["React", "WebSockets", "MongoDB", "Node.js"],
                "progress": 45,
                "metadata": {
                    "files_count": 18,
                    "created_from_template": False,
                    "priority": "high"
                },
                "created_at": datetime.utcnow() - timedelta(days=3),
                "updated_at": datetime.utcnow() - timedelta(hours=6)
            },
            {
                "_id": "demo_project_3",
                "user_id": user_id,
                "name": "AI Blog Platform",
                "description": "Blog platform with AI-powered content generation",
                "type": "full_stack", 
                "status": "draft",
                "tech_stack": ["Next.js", "TypeScript", "OpenAI", "PostgreSQL"],
                "progress": 20,
                "metadata": {
                    "files_count": 8,
                    "created_from_template": True,
                    "template_name": "Blog Starter",
                    "ai_integration": True
                },
                "created_at": datetime.utcnow() - timedelta(days=1),
                "updated_at": datetime.utcnow() - timedelta(minutes=30)
            }
        ]
        
        await db.projects.insert_many(demo_projects)
        print(f"✅ Created {len(demo_projects)} demo projects")
        
    except Exception as e:
        print(f"❌ Demo projects creation error: {e}")

async def create_demo_conversations(user_id):
    """Create demo conversations"""
    try:
        db = await get_database()
        
        # Check if conversations already exist
        existing_convs = await db.conversations.find({"user_id": user_id}).to_list(length=None)
        if existing_convs:
            print(f"✅ Found {len(existing_convs)} existing demo conversations")
            return
        
        demo_conversations = [
            {
                "_id": "demo_conv_1",
                "user_id": user_id,
                "project_id": "demo_project_1",
                "title": "E-commerce Setup Discussion",
                "messages": [
                    {
                        "id": "msg_1",
                        "content": "I need help setting up user authentication for my e-commerce platform",
                        "sender": "user",
                        "timestamp": datetime.utcnow() - timedelta(hours=2),
                        "model": "gpt-4.1-nano",
                        "agent": "developer"
                    },
                    {
                        "id": "msg_2",
                        "content": "I'll help you implement secure authentication for your e-commerce platform! Here's a comprehensive approach using FastAPI and JWT tokens...",
                        "sender": "assistant",
                        "timestamp": datetime.utcnow() - timedelta(hours=2, minutes=1),
                        "model": "gpt-4.1-nano",
                        "agent": "developer"
                    }
                ],
                "created_at": datetime.utcnow() - timedelta(hours=3),
                "updated_at": datetime.utcnow() - timedelta(hours=2)
            }
        ]
        
        await db.conversations.insert_many(demo_conversations)
        print(f"✅ Created {len(demo_conversations)} demo conversations")
        
    except Exception as e:
        print(f"❌ Demo conversations creation error: {e}")

async def main():
    """Main function to set up all demo data"""
    print("🚀 Setting up demo data...")
    
    try:
        # Initialize database
        await init_db()
        print("✅ Database connected")
        
        # Create demo user
        user_id = await create_demo_user()
        if not user_id:
            print("❌ Failed to create demo user")
            return
        
        # Create demo projects
        await create_demo_projects(user_id)
        
        # Create demo conversations
        await create_demo_conversations(user_id)
        
        print("🎉 Demo data setup complete!")
        print("\n📋 Demo Credentials:")
        print("Email: demo@aicodestudio.com")
        print("Password: demo123")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())