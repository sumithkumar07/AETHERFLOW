"""
Multi-Layer Performance Caching System
Implements memory, Redis, and intelligent caching strategies
"""

import json
import hashlib
import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union, Callable
from cachetools import TTLCache
import redis.asyncio as redis
from aiocache import Cache
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class PerformanceCacheLayer:
    """Advanced multi-layer caching system for enterprise performance"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis_client = None
        
        # L1 Cache: Memory (fastest, smallest)
        self.memory_cache = TTLCache(maxsize=10000, ttl=300)  # 5 minutes
        
        # L2 Cache: Memory for user sessions (medium, user-specific)
        self.session_cache = TTLCache(maxsize=5000, ttl=1800)  # 30 minutes
        
        # L3 Cache: Redis (fast, shared, persistent)
        self.redis_cache = None
        
        # Cache statistics
        self.stats = {
            'hits': {'l1': 0, 'l2': 0, 'l3': 0},
            'misses': {'l1': 0, 'l2': 0, 'l3': 0},
            'sets': {'l1': 0, 'l2': 0, 'l3': 0}
        }
        
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            self.redis_cache = Cache(Cache.REDIS, endpoint=self.redis_url)
            
            # Test connection
            await self.redis_client.ping()
            logger.info("✅ Performance cache layer initialized")
            
        except Exception as e:
            logger.error(f"❌ Cache initialization failed: {e}")
            raise
    
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate consistent cache key"""
        key_parts = [prefix] + [str(arg) for arg in args]
        if kwargs:
            key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
        
        key_string = ":".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()[:16]
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value from multi-layer cache"""
        try:
            # L1: Memory cache (fastest)
            if key in self.memory_cache:
                self.stats['hits']['l1'] += 1
                return self.memory_cache[key]
            else:
                self.stats['misses']['l1'] += 1
            
            # L2: Session cache  
            if key in self.session_cache:
                self.stats['hits']['l2'] += 1
                # Promote to L1
                value = self.session_cache[key]
                self.memory_cache[key] = value
                self.stats['sets']['l1'] += 1
                return value
            else:
                self.stats['misses']['l2'] += 1
            
            # L3: Redis cache
            if self.redis_client:
                redis_value = await self.redis_client.get(key)
                if redis_value:
                    self.stats['hits']['l3'] += 1
                    try:
                        value = json.loads(redis_value)
                        # Promote to upper layers
                        self.memory_cache[key] = value
                        self.session_cache[key] = value
                        self.stats['sets']['l1'] += 1
                        self.stats['sets']['l2'] += 1
                        return value
                    except json.JSONDecodeError:
                        return redis_value
                else:
                    self.stats['misses']['l3'] += 1
            
            return default
            
        except Exception as e:
            logger.error(f"❌ Cache get error for key {key}: {e}")
            return default
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: int = 300,
        layers: List[str] = ['l1', 'l2', 'l3']
    ):
        """Set value in specified cache layers"""
        try:
            # L1: Memory cache
            if 'l1' in layers:
                self.memory_cache[key] = value
                self.stats['sets']['l1'] += 1
            
            # L2: Session cache
            if 'l2' in layers:
                self.session_cache[key] = value
                self.stats['sets']['l2'] += 1
            
            # L3: Redis cache
            if 'l3' in layers and self.redis_client:
                if isinstance(value, (dict, list)):
                    await self.redis_client.setex(key, ttl, json.dumps(value, default=str))
                else:
                    await self.redis_client.setex(key, ttl, str(value))
                self.stats['sets']['l3'] += 1
                
        except Exception as e:
            logger.error(f"❌ Cache set error for key {key}: {e}")
    
    async def delete(self, key: str):
        """Delete from all cache layers"""
        try:
            # Remove from memory caches
            self.memory_cache.pop(key, None)
            self.session_cache.pop(key, None)
            
            # Remove from Redis
            if self.redis_client:
                await self.redis_client.delete(key)
                
        except Exception as e:
            logger.error(f"❌ Cache delete error for key {key}: {e}")
    
    async def clear_user_cache(self, user_id: str):
        """Clear all cache entries for a specific user"""
        try:
            # Clear from memory caches (need to iterate due to lack of pattern support)
            user_prefix = f"user:{user_id}"
            
            # Clear from memory caches
            keys_to_remove = [k for k in self.memory_cache.keys() if k.startswith(user_prefix)]
            for key in keys_to_remove:
                del self.memory_cache[key]
            
            keys_to_remove = [k for k in self.session_cache.keys() if k.startswith(user_prefix)]
            for key in keys_to_remove:
                del self.session_cache[key]
            
            # Clear from Redis using pattern
            if self.redis_client:
                pattern = f"{user_prefix}:*"
                keys = await self.redis_client.keys(pattern)
                if keys:
                    await self.redis_client.delete(*keys)
                    
            logger.info(f"✅ Cleared cache for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to clear user cache: {e}")

class AIResponseCache:
    """Specialized caching for AI responses"""
    
    def __init__(self, cache_layer: PerformanceCacheLayer):
        self.cache = cache_layer
        
    async def get_cached_ai_response(
        self, 
        query: str, 
        model: str, 
        user_id: str,
        context_hash: str = None
    ) -> Optional[Dict]:
        """Get cached AI response if available"""
        
        # Create cache key based on query, model, and context
        key_components = [query, model]
        if context_hash:
            key_components.append(context_hash)
            
        query_hash = hashlib.md5(
            ":".join(key_components).encode()
        ).hexdigest()
        
        cache_key = f"ai_response:{query_hash}"
        
        cached_response = await self.cache.get(cache_key)
        if cached_response:
            # Add cache hit metadata
            cached_response['cache_hit'] = True
            cached_response['cached_at'] = cached_response.get('cached_at', datetime.utcnow().isoformat())
            return cached_response
        
        return None
    
    async def cache_ai_response(
        self, 
        query: str, 
        model: str, 
        response: Dict,
        user_id: str,
        context_hash: str = None,
        ttl: int = 1800  # 30 minutes
    ):
        """Cache AI response for future use"""
        
        # Create same cache key as in get method
        key_components = [query, model]
        if context_hash:
            key_components.append(context_hash)
            
        query_hash = hashlib.md5(
            ":".join(key_components).encode()
        ).hexdigest()
        
        cache_key = f"ai_response:{query_hash}"
        
        # Add caching metadata
        cached_response = {
            **response,
            'cached_at': datetime.utcnow().isoformat(),
            'cache_key': cache_key,
            'model_used': model
        }
        
        # Cache with shorter TTL for dynamic content
        await self.cache.set(cache_key, cached_response, ttl=ttl, layers=['l2', 'l3'])

class UserSessionCache:
    """Specialized caching for user sessions and preferences"""
    
    def __init__(self, cache_layer: PerformanceCacheLayer):
        self.cache = cache_layer
        
    async def cache_user_session(self, user_id: str, session_data: Dict):
        """Cache user session data"""
        cache_key = f"session:{user_id}"
        await self.cache.set(
            cache_key, 
            session_data, 
            ttl=3600,  # 1 hour
            layers=['l2', 'l3']
        )
        
    async def get_user_session(self, user_id: str) -> Optional[Dict]:
        """Get cached user session"""
        cache_key = f"session:{user_id}"
        return await self.cache.get(cache_key)
        
    async def cache_user_preferences(self, user_id: str, preferences: Dict):
        """Cache user preferences"""
        cache_key = f"preferences:{user_id}"
        await self.cache.set(
            cache_key, 
            preferences, 
            ttl=7200,  # 2 hours
            layers=['l1', 'l2', 'l3']
        )
        
    async def get_user_preferences(self, user_id: str) -> Optional[Dict]:
        """Get cached user preferences"""
        cache_key = f"preferences:{user_id}"
        return await self.cache.get(cache_key)

def cached_response(ttl: int = 300, cache_layers: List[str] = ['l1', 'l2', 'l3']):
    """Decorator for caching function responses"""
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get cache instance (assuming it's available globally)
            cache = await get_performance_cache()
            
            # Generate cache key
            cache_key = cache._generate_cache_key(
                f"func:{func.__name__}", *args, **kwargs
            )
            
            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            await cache.set(cache_key, result, ttl=ttl, layers=cache_layers)
            
            return result
            
        return wrapper
    return decorator

# Performance monitoring decorator
def monitor_cache_performance(func: Callable):
    """Decorator to monitor cache performance"""
    
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = datetime.utcnow()
        
        try:
            result = await func(*args, **kwargs)
            success = True
        except Exception as e:
            logger.error(f"❌ Cache operation failed in {func.__name__}: {e}")
            success = False
            raise
        finally:
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Log performance metrics
            logger.info(
                f"🔍 Cache operation {func.__name__}: "
                f"duration={duration:.3f}s, success={success}"
            )
            
        return result
        
    return wrapper

# Global cache instance
performance_cache = None

async def get_performance_cache() -> PerformanceCacheLayer:
    """Get the global performance cache instance"""
    global performance_cache
    if performance_cache is None:
        from os import getenv
        redis_url = getenv("REDIS_URL", "redis://localhost:6379")
        
        performance_cache = PerformanceCacheLayer(redis_url)
        await performance_cache.initialize()
    
    return performance_cache

async def get_ai_response_cache() -> AIResponseCache:
    """Get AI response cache instance"""
    cache_layer = await get_performance_cache()
    return AIResponseCache(cache_layer)

async def get_user_session_cache() -> UserSessionCache:
    """Get user session cache instance"""
    cache_layer = await get_performance_cache()
    return UserSessionCache(cache_layer)