from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
client = None
database = None

async def init_db():
    """Initialize database connection and create indexes"""
    global client, database
    
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/aicodestudio")
    client = AsyncIOMotorClient(mongo_url)
    database = client.get_database()
    
    # Create indexes for better performance
    await create_indexes()
    
    return database

async def create_indexes():
    """Create database indexes"""
    global database
    
    # Users collection indexes
    await database.users.create_index("email", unique=True)
    await database.users.create_index("created_at")
    
    # Projects collection indexes
    await database.projects.create_index([("user_id", 1), ("created_at", -1)])
    await database.projects.create_index("name")
    await database.projects.create_index("status")
    
    # Conversations collection indexes
    await database.conversations.create_index([("user_id", 1), ("updated_at", -1)])
    await database.conversations.create_index("project_id")
    
    # Templates collection indexes
    await database.templates.create_index("category")
    await database.templates.create_index("featured")
    await database.templates.create_index([("name", "text"), ("description", "text")])

async def get_database():
    """Get database instance"""
    global database
    if database is None:
        await init_db()
    return database

async def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()