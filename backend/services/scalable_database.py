"""
Enterprise-Grade Scalable Database Service
Implements advanced indexing, connection pooling, and caching strategies
"""

import asyncio
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel
import redis.asyncio as redis
from aiocache import Cache, cached
from aiocache.serializers import JsonSerializer
import logging

logger = logging.getLogger(__name__)

class ScalableDatabase:
    """Enterprise database layer with advanced performance optimizations"""
    
    def __init__(self, mongo_url: str, redis_url: str = "redis://localhost:6379"):
        self.mongo_url = mongo_url
        self.redis_url = redis_url
        self.client = None
        self.database = None
        self.redis_client = None
        self.connection_pool_size = 100
        self.query_cache = Cache(Cache.REDIS, endpoint=redis_url, serializer=JsonSerializer())
        
    async def initialize(self):
        """Initialize database connections and setup optimizations"""
        try:
            # MongoDB connection with advanced options
            self.client = AsyncIOMotorClient(
                self.mongo_url,
                maxPoolSize=self.connection_pool_size,
                minPoolSize=10,
                maxIdleTimeMS=30000,
                connectTimeoutMS=20000,
                serverSelectionTimeoutMS=20000,
                retryWrites=True,
                w="majority"
            )
            
            self.database = self.client.get_database()
            
            # Redis connection for caching
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            
            # Setup advanced indexing
            await self.setup_advanced_indexing()
            
            logger.info("✅ Scalable database initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    async def setup_advanced_indexing(self):
        """Create optimized indexes for scalability"""
        try:
            # Users collection - Enhanced indexing
            await self.database.users.create_index([
                ("email", 1), ("is_premium", 1), ("created_at", -1)
            ], name="users_email_premium_created")
            
            await self.database.users.create_index([
                ("subscription_status", 1), ("trial_end_date", 1)
            ], name="users_subscription_trial")
            
            # Conversations collection - High-performance queries
            await self.database.conversations.create_index([
                ("user_id", 1), ("updated_at", -1), ("agent_type", 1)
            ], name="conversations_user_updated_agent")
            
            await self.database.conversations.create_index([
                ("user_id", 1), ("project_id", 1), ("created_at", -1)
            ], name="conversations_user_project_created")
            
            # AI Usage Analytics - Performance tracking
            await self.database.ai_usage.create_index([
                ("user_id", 1), ("model", 1), ("timestamp", -1)
            ], name="ai_usage_user_model_time")
            
            await self.database.ai_usage.create_index([
                ("timestamp", -1), ("response_time", 1)
            ], name="ai_usage_performance")
            
            # Projects collection - Enhanced queries
            await self.database.projects.create_index([
                ("user_id", 1), ("status", 1), ("updated_at", -1)
            ], name="projects_user_status_updated")
            
            # Templates collection - Search optimization
            await self.database.templates.create_index([
                ("category", 1), ("featured", 1), ("downloads", -1)
            ], name="templates_category_featured_popularity")
            
            # Full-text search indexes
            await self.database.templates.create_index([
                ("name", "text"), ("description", "text"), ("tags", "text")
            ], name="templates_fulltext_search")
            
            await self.database.conversations.create_index([
                ("messages.content", "text")
            ], name="conversations_content_search")
            
            logger.info("✅ Advanced database indexing completed")
            
        except Exception as e:
            logger.error(f"❌ Database indexing failed: {e}")
            raise
    
    async def get_user_with_cache(self, user_id: str) -> Optional[Dict]:
        """Get user with intelligent caching"""
        cache_key = f"user:{user_id}"
        
        # Try cache first
        cached_user = await self.redis_client.get(cache_key)
        if cached_user:
            return json.loads(cached_user)
        
        # Query database
        user = await self.database.users.find_one({"_id": user_id})
        if user:
            # Convert ObjectId to string if needed
            user["_id"] = str(user["_id"])
            
            # Cache for 1 hour
            await self.redis_client.setex(
                cache_key, 3600, json.dumps(user, default=str)
            )
        
        return user
    
    async def get_user_conversations_optimized(
        self, 
        user_id: str, 
        limit: int = 20, 
        agent_type: Optional[str] = None
    ) -> List[Dict]:
        """Get user conversations with optimized query and caching"""
        
        # Build cache key
        cache_key = f"conversations:{user_id}:{limit}:{agent_type or 'all'}"
        
        # Try cache first
        cached_conversations = await self.redis_client.get(cache_key)
        if cached_conversations:
            return json.loads(cached_conversations)
        
        # Build optimized query
        query = {"user_id": user_id}
        if agent_type:
            query["agent_type"] = agent_type
        
        # Use optimized index
        conversations = await self.database.conversations.find(
            query,
            sort=[("updated_at", -1)],
            limit=limit
        ).to_list(length=None)
        
        # Convert ObjectIds and cache result
        for conv in conversations:
            conv["_id"] = str(conv["_id"])
        
        # Cache for 5 minutes (shorter for dynamic data)
        await self.redis_client.setex(
            cache_key, 300, json.dumps(conversations, default=str)
        )
        
        return conversations
    
    async def track_ai_usage(
        self, 
        user_id: str, 
        model: str, 
        tokens_used: int, 
        response_time: float,
        cost: float = 0.0
    ):
        """Track AI usage for analytics and optimization"""
        usage_record = {
            "user_id": user_id,
            "model": model,
            "tokens_used": tokens_used,
            "response_time": response_time,
            "cost": cost,
            "timestamp": datetime.utcnow()
        }
        
        # Insert usage record
        await self.database.ai_usage.insert_one(usage_record)
        
        # Update user usage statistics in background
        asyncio.create_task(self.update_user_usage_stats(user_id, tokens_used, cost))
    
    async def update_user_usage_stats(self, user_id: str, tokens_used: int, cost: float):
        """Update user usage statistics"""
        try:
            await self.database.users.update_one(
                {"_id": user_id},
                {
                    "$inc": {
                        "total_tokens_used": tokens_used,
                        "total_ai_cost": cost,
                        "ai_requests_count": 1
                    },
                    "$set": {
                        "last_ai_usage": datetime.utcnow()
                    }
                }
            )
            
            # Invalidate user cache
            await self.redis_client.delete(f"user:{user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to update user usage stats: {e}")
    
    async def get_popular_templates_cached(self, category: Optional[str] = None, limit: int = 10) -> List[Dict]:
        """Get popular templates with intelligent caching"""
        cache_key = f"templates:popular:{category or 'all'}:{limit}"
        
        # Try cache first
        cached_templates = await self.redis_client.get(cache_key)
        if cached_templates:
            return json.loads(cached_templates)
        
        # Build optimized query
        query = {"featured": True} if not category else {"category": category, "featured": True}
        
        # Use optimized index for sorting
        templates = await self.database.templates.find(
            query,
            sort=[("downloads", -1), ("rating", -1)]
        ).limit(limit).to_list(length=None)
        
        # Convert ObjectIds
        for template in templates:
            template["_id"] = str(template["_id"])
        
        # Cache for 1 hour (templates don't change frequently)
        await self.redis_client.setex(
            cache_key, 3600, json.dumps(templates, default=str)
        )
        
        return templates
    
    async def search_with_performance(
        self, 
        collection: str, 
        query: Dict, 
        limit: int = 20,
        use_cache: bool = True
    ) -> List[Dict]:
        """Perform search with performance optimization"""
        
        if use_cache:
            # Create cache key from query
            query_hash = hashlib.md5(
                json.dumps(query, sort_keys=True).encode()
            ).hexdigest()
            cache_key = f"search:{collection}:{query_hash}:{limit}"
            
            # Try cache first
            cached_results = await self.redis_client.get(cache_key)
            if cached_results:
                return json.loads(cached_results)
        
        # Execute search
        results = await getattr(self.database, collection).find(
            query
        ).limit(limit).to_list(length=None)
        
        # Convert ObjectIds
        for result in results:
            result["_id"] = str(result["_id"])
        
        if use_cache:
            # Cache results for 10 minutes
            await self.redis_client.setex(
                cache_key, 600, json.dumps(results, default=str)
            )
        
        return results
    
    async def get_analytics_data(self, user_id: str, days: int = 30) -> Dict:
        """Get user analytics with aggregation pipeline"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Aggregation pipeline for analytics
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "timestamp": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "model": "$model",
                        "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}}
                    },
                    "total_tokens": {"$sum": "$tokens_used"},
                    "total_cost": {"$sum": "$cost"},
                    "avg_response_time": {"$avg": "$response_time"},
                    "request_count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id.date": -1}
            }
        ]
        
        results = await self.database.ai_usage.aggregate(pipeline).to_list(length=None)
        
        return {
            "usage_data": results,
            "summary": await self.get_usage_summary(user_id, start_date)
        }
    
    async def get_usage_summary(self, user_id: str, start_date: datetime) -> Dict:
        """Get usage summary statistics"""
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "timestamp": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_tokens": {"$sum": "$tokens_used"},
                    "total_cost": {"$sum": "$cost"},
                    "avg_response_time": {"$avg": "$response_time"},
                    "total_requests": {"$sum": 1},
                    "models_used": {"$addToSet": "$model"}
                }
            }
        ]
        
        result = await self.database.ai_usage.aggregate(pipeline).to_list(length=1)
        return result[0] if result else {}
    
    async def cleanup_old_data(self, days_to_keep: int = 90):
        """Clean up old data to maintain performance"""
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
        
        # Clean up old AI usage records
        result = await self.database.ai_usage.delete_many({
            "timestamp": {"$lt": cutoff_date}
        })
        
        logger.info(f"✅ Cleaned up {result.deleted_count} old AI usage records")
        
    async def get_connection_stats(self) -> Dict:
        """Get database connection and performance statistics"""
        try:
            # MongoDB stats
            db_stats = await self.database.command("dbStats")
            server_status = await self.database.command("serverStatus")
            
            # Redis stats
            redis_info = await self.redis_client.info()
            
            return {
                "mongodb": {
                    "collections": db_stats.get("collections", 0),
                    "dataSize": db_stats.get("dataSize", 0),
                    "indexSize": db_stats.get("indexSize", 0),
                    "connections": server_status.get("connections", {})
                },
                "redis": {
                    "connected_clients": redis_info.get("connected_clients", 0),
                    "used_memory": redis_info.get("used_memory", 0),
                    "keyspace_hits": redis_info.get("keyspace_hits", 0),
                    "keyspace_misses": redis_info.get("keyspace_misses", 0)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get connection stats: {e}")
            return {}
    
    async def close(self):
        """Close database connections"""
        if self.client:
            self.client.close()
        if self.redis_client:
            await self.redis_client.close()
        
        logger.info("✅ Database connections closed")

# Global instance
scalable_db = None

async def get_scalable_database() -> ScalableDatabase:
    """Get the global scalable database instance"""
    global scalable_db
    if scalable_db is None:
        from os import getenv
        mongo_url = getenv("MONGO_URL", "mongodb://localhost:27017/aicodestudio")
        redis_url = getenv("REDIS_URL", "redis://localhost:6379")
        
        scalable_db = ScalableDatabase(mongo_url, redis_url)
        await scalable_db.initialize()
    
    return scalable_db