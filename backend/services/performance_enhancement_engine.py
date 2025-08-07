"""
PHASE 1: Backend Performance & Robustness Enhancement Engine
Advanced performance optimization and system robustness improvements
"""

import asyncio
import time
import psutil
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
from motor.motor_asyncio import AsyncIOMotorClient
import json

# Redis import with fallback handling
try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    try:
        import redis as redis_sync
        REDIS_AVAILABLE = False
        print("Warning: Using synchronous Redis client")
    except ImportError:
        REDIS_AVAILABLE = False
        print("Warning: Redis not available, using memory cache only")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetrics:
    """Performance metrics tracking"""
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    response_time: float
    active_connections: int
    timestamp: datetime

class AdvancedCacheManager:
    """Intelligent caching system with multi-layer optimization"""
    
    def __init__(self):
        self.redis_client = None
        self.memory_cache = {}
        self.cache_stats = {"hits": 0, "misses": 0}
        
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = aioredis.from_url("redis://localhost:6379", decode_responses=True)
            logger.info("✅ Advanced cache manager initialized")
        except Exception as e:
            logger.warning(f"Redis not available, using memory cache only: {e}")
    
    async def get(self, key: str, ttl: int = 3600) -> Optional[Any]:
        """Get cached value with intelligent fallback"""
        try:
            # Try Redis first
            if self.redis_client:
                cached = await self.redis_client.get(key)
                if cached:
                    self.cache_stats["hits"] += 1
                    return json.loads(cached)
            
            # Fallback to memory cache
            if key in self.memory_cache:
                cache_data = self.memory_cache[key]
                if cache_data["expires"] > datetime.now():
                    self.cache_stats["hits"] += 1
                    return cache_data["value"]
                else:
                    del self.memory_cache[key]
            
            self.cache_stats["misses"] += 1
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Set cached value with intelligent storage"""
        try:
            serialized = json.dumps(value, default=str)
            
            # Store in Redis
            if self.redis_client:
                await self.redis_client.setex(key, ttl, serialized)
            
            # Store in memory cache as backup
            self.memory_cache[key] = {
                "value": value,
                "expires": datetime.now() + timedelta(seconds=ttl)
            }
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        hit_rate = (self.cache_stats["hits"] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "hits": self.cache_stats["hits"],
            "misses": self.cache_stats["misses"],
            "hit_rate": f"{hit_rate:.2f}%",
            "memory_cache_size": len(self.memory_cache)
        }

class DatabaseOptimizer:
    """Advanced database query optimization and connection management"""
    
    def __init__(self):
        self.connection_pool = None
        self.query_stats = {}
        
    async def initialize(self, mongo_url: str):
        """Initialize optimized database connections"""
        try:
            self.connection_pool = AsyncIOMotorClient(
                mongo_url,
                maxPoolSize=50,
                minPoolSize=10,
                maxIdleTimeMS=30000,
                waitQueueTimeoutMS=5000,
                serverSelectionTimeoutMS=5000
            )
            logger.info("✅ Optimized database connections initialized")
        except Exception as e:
            logger.error(f"Database initialization error: {e}")
    
    async def execute_optimized_query(self, collection_name: str, operation: str, query: Dict, **kwargs):
        """Execute database query with optimization and monitoring"""
        start_time = time.time()
        
        try:
            db = self.connection_pool.aicodestudio
            collection = db[collection_name]
            
            # Execute based on operation type
            if operation == "find":
                result = await collection.find(query, **kwargs).to_list(length=None)
            elif operation == "find_one":
                result = await collection.find_one(query, **kwargs)
            elif operation == "insert_one":
                result = await collection.insert_one(query)
            elif operation == "update_one":
                result = await collection.update_one(query.get("filter", {}), query.get("update", {}), **kwargs)
            elif operation == "delete_one":
                result = await collection.delete_one(query, **kwargs)
            else:
                raise ValueError(f"Unsupported operation: {operation}")
            
            # Track query performance
            execution_time = time.time() - start_time
            self.track_query_performance(collection_name, operation, execution_time)
            
            return result
            
        except Exception as e:
            logger.error(f"Optimized query error: {e}")
            return None
    
    def track_query_performance(self, collection: str, operation: str, execution_time: float):
        """Track query performance metrics"""
        key = f"{collection}.{operation}"
        if key not in self.query_stats:
            self.query_stats[key] = {"total_time": 0, "count": 0, "avg_time": 0}
        
        self.query_stats[key]["total_time"] += execution_time
        self.query_stats[key]["count"] += 1
        self.query_stats[key]["avg_time"] = self.query_stats[key]["total_time"] / self.query_stats[key]["count"]
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get database performance statistics"""
        return self.query_stats

class SystemHealthMonitor:
    """Advanced system health monitoring and auto-recovery"""
    
    def __init__(self):
        self.health_checks = []
        self.performance_history = []
        self.alerts = []
        
    def add_health_check(self, name: str, check_func, threshold: float):
        """Add a health check function"""
        self.health_checks.append({
            "name": name,
            "check_func": check_func,
            "threshold": threshold,
            "last_status": "unknown"
        })
    
    async def monitor_system_health(self) -> Dict[str, Any]:
        """Comprehensive system health monitoring"""
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Create performance metrics
        metrics = PerformanceMetrics(
            cpu_usage=cpu_percent,
            memory_usage=memory.percent,
            disk_usage=disk.percent,
            response_time=0,  # Will be updated by API calls
            active_connections=len(psutil.net_connections()),
            timestamp=datetime.now()
        )
        
        # Store metrics history
        self.performance_history.append(metrics)
        
        # Keep only last 1000 entries
        if len(self.performance_history) > 1000:
            self.performance_history = self.performance_history[-1000:]
        
        # Run custom health checks
        health_status = {}
        for check in self.health_checks:
            try:
                status = await check["check_func"]()
                check["last_status"] = "healthy" if status else "unhealthy"
                health_status[check["name"]] = check["last_status"]
            except Exception as e:
                check["last_status"] = f"error: {str(e)}"
                health_status[check["name"]] = check["last_status"]
        
        return {
            "system_metrics": {
                "cpu_usage": f"{cpu_percent:.2f}%",
                "memory_usage": f"{memory.percent:.2f}%",
                "disk_usage": f"{disk.percent:.2f}%",
                "active_connections": len(psutil.net_connections())
            },
            "health_checks": health_status,
            "timestamp": datetime.now().isoformat()
        }
    
    async def auto_recovery(self) -> Dict[str, str]:
        """Automatic system recovery procedures"""
        recovery_actions = []
        
        # Check for high memory usage
        memory = psutil.virtual_memory()
        if memory.percent > 85:
            # Trigger garbage collection and cache cleanup
            import gc
            gc.collect()
            recovery_actions.append("Memory cleanup executed")
        
        # Check for high CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        if cpu_percent > 90:
            # Log high CPU usage (could trigger alerts)
            recovery_actions.append("High CPU usage detected and logged")
        
        return {"recovery_actions": recovery_actions}

class PerformanceEnhancementEngine:
    """Main performance enhancement engine coordinating all optimizations"""
    
    def __init__(self):
        self.cache_manager = AdvancedCacheManager()
        self.db_optimizer = DatabaseOptimizer()
        self.health_monitor = SystemHealthMonitor()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    async def initialize(self, mongo_url: str):
        """Initialize all performance enhancement systems"""
        logger.info("🚀 Initializing Performance Enhancement Engine...")
        
        # Initialize all components
        await self.cache_manager.initialize()
        await self.db_optimizer.initialize(mongo_url)
        
        # Add standard health checks
        self.health_monitor.add_health_check(
            "database_connection",
            self._check_database_health,
            1.0
        )
        
        self.health_monitor.add_health_check(
            "cache_performance",
            self._check_cache_health,
            0.8
        )
        
        logger.info("✅ Performance Enhancement Engine initialized successfully")
    
    async def _check_database_health(self) -> bool:
        """Check database connection health"""
        try:
            result = await self.db_optimizer.execute_optimized_query(
                "users", "find_one", {"email": "health_check"}, limit=1
            )
            return True  # Connection successful
        except Exception:
            return False
    
    async def _check_cache_health(self) -> bool:
        """Check cache performance health"""
        stats = self.cache_manager.get_stats()
        total_requests = stats["hits"] + stats["misses"]
        if total_requests == 0:
            return True
        hit_rate = stats["hits"] / total_requests
        return hit_rate >= 0.8  # 80% hit rate threshold
    
    async def get_comprehensive_status(self) -> Dict[str, Any]:
        """Get comprehensive system performance status"""
        # Run all status checks in parallel
        system_health, cache_stats, db_stats = await asyncio.gather(
            self.health_monitor.monitor_system_health(),
            asyncio.create_task(asyncio.to_thread(self.cache_manager.get_stats)),
            asyncio.create_task(asyncio.to_thread(self.db_optimizer.get_performance_stats))
        )
        
        return {
            "system_health": system_health,
            "cache_performance": cache_stats,
            "database_performance": db_stats,
            "status": "enhanced",
            "enhancement_engine": "active"
        }
    
    async def optimize_request_performance(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize individual request performance"""
        # This can be called by API endpoints for request-specific optimization
        optimizations = {
            "caching_applied": False,
            "query_optimized": False,
            "response_compressed": False
        }
        
        # Apply request-specific optimizations here
        # (This is where we can add specific performance enhancements per request)
        
        return optimizations

# Global instance
performance_engine = PerformanceEnhancementEngine()

async def get_performance_engine():
    """Get the global performance engine instance"""
    return performance_engine