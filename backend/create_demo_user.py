#!/usr/bin/env python3
"""
Script to create demo user in MongoDB
"""
import asyncio
import sys
import os
sys.path.append('/app/backend')

from models.database import get_database
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_demo_user():
    """Create demo user in database"""
    try:
        db = await get_database()
        
        # Check if demo user already exists
        existing_user = await db.users.find_one({"email": "demo@aicodestudio.com"})
        if existing_user:
            print("✅ Demo user already exists")
            return
        
        # Hash password
        hashed_password = pwd_context.hash("demo123")
        
        # Create demo user
        demo_user = {
            "email": "demo@aicodestudio.com",
            "name": "Demo User",
            "hashed_password": hashed_password,
            "avatar": None,
            "created_at": "2025-08-01T06:54:00.000Z",
            "is_active": True
        }
        
        result = await db.users.insert_one(demo_user)
        print(f"✅ Demo user created with ID: {result.inserted_id}")
        
    except Exception as e:
        print(f"❌ Error creating demo user: {e}")

if __name__ == "__main__":
    asyncio.run(create_demo_user())