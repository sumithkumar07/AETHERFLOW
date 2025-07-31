import json
import asyncio
import logging
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
import hashlib
import pickle
import redis.asyncio as redis
import os

logger = logging.getLogger(__name__)

class CacheService:
    """Advanced caching service with Redis backend and fallback to memory"""
    
    def __init__(self):
        self.redis_client = None
        self.memory_cache = {}
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "deletes": 0
        }
        
    async def initialize(self):
        """Initialize Redis connection with fallback to memory cache"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            
            # Test connection
            await self.redis_client.ping()
            logger.info("Redis cache initialized successfully")
            
        except Exception as e:
            logger.warning(f"Redis unavailable, using memory cache: {e}")
            self.redis_client = None
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache"""
        try:
            if self.redis_client:
                value = await self.redis_client.get(key)
                if value is not None:
                    self.cache_stats["hits"] += 1
                    return json.loads(value) if value != "null" else None
            else:
                # Memory cache fallback
                cache_item = self.memory_cache.get(key)
                if cache_item and cache_item["expires_at"] > datetime.utcnow():
                    self.cache_stats["hits"] += 1
                    return cache_item["value"]
                elif cache_item:
                    # Remove expired item
                    del self.memory_cache[key]
            
            self.cache_stats["misses"] += 1
            return default
            
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (seconds)"""
        try:
            if self.redis_client:
                serialized_value = json.dumps(value) if value is not None else "null"
                await self.redis_client.setex(key, ttl, serialized_value)
            else:
                # Memory cache fallback
                self.memory_cache[key] = {
                    "value": value,
                    "expires_at": datetime.utcnow() + timedelta(seconds=ttl)
                }
                
                # Cleanup old entries (simple LRU)
                if len(self.memory_cache) > 1000:
                    await self._cleanup_memory_cache()
            
            self.cache_stats["sets"] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            if self.redis_client:
                await self.redis_client.delete(key)
            else:
                self.memory_cache.pop(key, None)
            
            self.cache_stats["deletes"] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values from cache"""
        result = {}
        
        if self.redis_client:
            try:
                values = await self.redis_client.mget(keys)
                for key, value in zip(keys, values):
                    if value is not None:
                        result[key] = json.loads(value) if value != "null" else None
                        self.cache_stats["hits"] += 1
                    else:
                        self.cache_stats["misses"] += 1
            except Exception as e:
                logger.error(f"Cache get_many error: {e}")
        else:
            # Memory cache fallback
            for key in keys:
                value = await self.get(key)
                if value is not None:
                    result[key] = value
        
        return result
    
    async def set_many(self, mapping: Dict[str, Any], ttl: int = 3600) -> bool:
        """Set multiple values in cache"""
        try:
            if self.redis_client:
                pipe = self.redis_client.pipeline()
                for key, value in mapping.items():
                    serialized_value = json.dumps(value) if value is not None else "null"
                    pipe.setex(key, ttl, serialized_value)
                await pipe.execute()
            else:
                # Memory cache fallback
                expires_at = datetime.utcnow() + timedelta(seconds=ttl)
                for key, value in mapping.items():
                    self.memory_cache[key] = {
                        "value": value,
                        "expires_at": expires_at
                    }
            
            self.cache_stats["sets"] += len(mapping)
            return True
            
        except Exception as e:
            logger.error(f"Cache set_many error: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        count = 0
        
        try:
            if self.redis_client:
                keys = await self.redis_client.keys(pattern)
                if keys:
                    count = await self.redis_client.delete(*keys)
            else:
                # Memory cache pattern matching
                import fnmatch
                keys_to_delete = [key for key in self.memory_cache.keys() 
                                if fnmatch.fnmatch(key, pattern)]
                for key in keys_to_delete:
                    del self.memory_cache[key]
                count = len(keys_to_delete)
            
            self.cache_stats["deletes"] += count
            return count
            
        except Exception as e:
            logger.error(f"Cache clear_pattern error for pattern {pattern}: {e}")
            return 0
    
    async def increment(self, key: str, amount: int = 1, ttl: int = 3600) -> int:
        """Increment a numeric value in cache"""
        try:
            if self.redis_client:
                # Use Redis atomic increment
                result = await self.redis_client.incr(key, amount)
                await self.redis_client.expire(key, ttl)
                return result
            else:
                # Memory cache increment
                current = await self.get(key, 0)
                new_value = current + amount
                await self.set(key, new_value, ttl)
                return new_value
                
        except Exception as e:
            logger.error(f"Cache increment error for key {key}: {e}")
            return 0
    
    async def _cleanup_memory_cache(self):
        """Clean up expired entries from memory cache"""
        current_time = datetime.utcnow()
        keys_to_remove = []
        
        for key, cache_item in self.memory_cache.items():
            if cache_item["expires_at"] <= current_time:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.memory_cache[key]
            
        logger.info(f"Cleaned up {len(keys_to_remove)} expired cache entries")
    
    def generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a consistent cache key"""
        key_data = f"{prefix}:{':'.join(str(arg) for arg in args)}"
        if kwargs:
            sorted_kwargs = sorted(kwargs.items())
            key_data += f":{':'.join(f'{k}={v}' for k, v in sorted_kwargs)}"
        
        # Hash long keys to avoid key length limits
        if len(key_data) > 200:
            key_hash = hashlib.md5(key_data.encode()).hexdigest()
            return f"{prefix}:hash:{key_hash}"
        
        return key_data
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        hit_rate = (self.cache_stats["hits"] / total_requests) * 100 if total_requests > 0 else 0
        
        stats = {
            "backend": "redis" if self.redis_client else "memory",
            "stats": self.cache_stats.copy(),
            "hit_rate": round(hit_rate, 2),
            "memory_cache_size": len(self.memory_cache) if not self.redis_client else 0
        }
        
        # Get Redis info if available
        if self.redis_client:
            try:
                redis_info = await self.redis_client.info("memory")
                stats["redis_memory"] = redis_info.get("used_memory_human", "unknown")
            except Exception as e:
                logger.warning(f"Could not get Redis memory info: {e}")
        
        return stats

# Caching decorators
def cache_result(ttl: int = 3600, key_prefix: str = "func"):
    """Decorator to cache function results"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            cache_key = cache_service.generate_cache_key(
                f"{key_prefix}:{func.__name__}", 
                *args, 
                **kwargs
            )
            
            # Try to get from cache
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_service.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Global cache service instance
cache_service = CacheService()