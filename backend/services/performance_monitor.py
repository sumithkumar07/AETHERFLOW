"""
Enterprise Performance Monitoring System
Real-time metrics, alerting, and optimization recommendations
"""

import asyncio
import time
import psutil
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict, deque
from contextlib import asynccontextmanager
import logging

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """Comprehensive performance monitoring and analytics"""
    
    def __init__(self):
        self.metrics = defaultdict(list)
        self.alert_thresholds = {
            'api_response_time': 0.5,      # 500ms
            'ai_response_time': 5.0,       # 5 seconds
            'database_query_time': 0.3,    # 300ms
            'memory_usage': 85.0,          # 85%
            'cpu_usage': 80.0,             # 80%
            'error_rate': 5.0,             # 5%
        }
        
        # Real-time metrics storage (last 1000 entries per metric)
        self.realtime_metrics = defaultdict(lambda: deque(maxlen=1000))
        
        # Performance statistics
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'avg_response_time': 0.0,
            'p95_response_time': 0.0,
            'p99_response_time': 0.0
        }
        
        # Alert history
        self.alerts = deque(maxlen=100)
        
        self.redis_client = None
        
    async def initialize(self, redis_client=None):
        """Initialize performance monitor"""
        self.redis_client = redis_client
        
        # Start background monitoring tasks
        asyncio.create_task(self.system_metrics_collector())
        asyncio.create_task(self.performance_analyzer())
        
        logger.info("✅ Performance monitor initialized")
        
    @asynccontextmanager
    async def monitor_request(self, endpoint: str, user_id: str = None):
        """Context manager for monitoring API requests"""
        start_time = time.time()
        success = False
        error = None
        
        try:
            yield
            success = True
        except Exception as e:
            error = str(e)
            raise
        finally:
            duration = time.time() - start_time
            await self.record_request_metrics(
                endpoint=endpoint,
                duration=duration,
                success=success,
                user_id=user_id,
                error=error
            )
    
    async def record_request_metrics(
        self, 
        endpoint: str, 
        duration: float, 
        success: bool,
        user_id: str = None,
        error: str = None
    ):
        """Record request performance metrics"""
        
        # Update statistics
        self.stats['total_requests'] += 1
        if success:
            self.stats['successful_requests'] += 1
        else:
            self.stats['failed_requests'] += 1
            
        # Record metrics
        metric_data = {
            'endpoint': endpoint,
            'duration': duration,
            'success': success,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat(),
            'error': error
        }
        
        # Add to real-time metrics
        self.realtime_metrics['api_requests'].append(metric_data)
        self.realtime_metrics['response_times'].append(duration)
        
        # Check for alerts
        if duration > self.alert_thresholds['api_response_time']:
            await self.trigger_alert(
                'SLOW_API_RESPONSE',
                f"Slow API response on {endpoint}: {duration:.3f}s",
                {'endpoint': endpoint, 'duration': duration, 'user_id': user_id}
            )
        
        # Store in Redis for persistence
        if self.redis_client:
            try:
                await self.redis_client.lpush(
                    'performance_metrics', 
                    json.dumps(metric_data, default=str)
                )
                # Keep only last 10000 metrics
                await self.redis_client.ltrim('performance_metrics', 0, 9999)
            except Exception as e:
                logger.error(f"❌ Failed to store metrics in Redis: {e}")
    
    async def record_ai_metrics(
        self, 
        model: str, 
        tokens: int, 
        duration: float, 
        cost: float,
        user_id: str,
        success: bool = True
    ):
        """Record AI-specific performance metrics"""
        
        metric_data = {
            'model': model,
            'tokens': tokens,
            'duration': duration,
            'cost': cost,
            'user_id': user_id,
            'success': success,
            'timestamp': datetime.utcnow().isoformat(),
            'tokens_per_second': tokens / duration if duration > 0 else 0
        }
        
        # Add to real-time metrics
        self.realtime_metrics['ai_requests'].append(metric_data)
        self.realtime_metrics['ai_response_times'].append(duration)
        
        # Check for AI-specific alerts
        if duration > self.alert_thresholds['ai_response_time']:
            await self.trigger_alert(
                'SLOW_AI_RESPONSE',
                f"Slow AI response with {model}: {duration:.3f}s",
                {'model': model, 'duration': duration, 'tokens': tokens}
            )
        
        # Store in Redis
        if self.redis_client:
            try:
                await self.redis_client.lpush(
                    'ai_metrics', 
                    json.dumps(metric_data, default=str)
                )
                await self.redis_client.ltrim('ai_metrics', 0, 9999)
            except Exception as e:
                logger.error(f"❌ Failed to store AI metrics: {e}")
    
    async def record_database_metrics(
        self, 
        collection: str, 
        operation: str, 
        duration: float,
        success: bool = True
    ):
        """Record database performance metrics"""
        
        metric_data = {
            'collection': collection,
            'operation': operation,
            'duration': duration,
            'success': success,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add to real-time metrics
        self.realtime_metrics['db_queries'].append(metric_data)
        
        # Check for database alerts
        if duration > self.alert_thresholds['database_query_time']:
            await self.trigger_alert(
                'SLOW_DATABASE_QUERY',
                f"Slow database query on {collection}.{operation}: {duration:.3f}s",
                {'collection': collection, 'operation': operation, 'duration': duration}
            )
    
    async def system_metrics_collector(self):
        """Background task to collect system metrics"""
        while True:
            try:
                # CPU and Memory metrics
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                
                system_metrics = {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_available': memory.available,
                    'disk_percent': (disk.used / disk.total) * 100,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                # Add to real-time metrics
                self.realtime_metrics['system'].append(system_metrics)
                
                # Check for system alerts
                if cpu_percent > self.alert_thresholds['cpu_usage']:
                    await self.trigger_alert(
                        'HIGH_CPU_USAGE',
                        f"High CPU usage: {cpu_percent:.1f}%",
                        {'cpu_percent': cpu_percent}
                    )
                
                if memory.percent > self.alert_thresholds['memory_usage']:
                    await self.trigger_alert(
                        'HIGH_MEMORY_USAGE',
                        f"High memory usage: {memory.percent:.1f}%",
                        {'memory_percent': memory.percent}
                    )
                
                # Store in Redis
                if self.redis_client:
                    await self.redis_client.lpush(
                        'system_metrics',
                        json.dumps(system_metrics, default=str)
                    )
                    await self.redis_client.ltrim('system_metrics', 0, 999)
                
                # Sleep for 30 seconds
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"❌ System metrics collection error: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def performance_analyzer(self):
        """Background task to analyze performance and generate insights"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                
                # Calculate performance statistics
                await self.calculate_performance_stats()
                
                # Generate optimization recommendations
                recommendations = await self.generate_recommendations()
                
                if recommendations:
                    logger.info(f"🔍 Performance recommendations: {recommendations}")
                
            except Exception as e:
                logger.error(f"❌ Performance analysis error: {e}")
    
    async def calculate_performance_stats(self):
        """Calculate real-time performance statistics"""
        try:
            # Response time statistics
            response_times = list(self.realtime_metrics['response_times'])
            if response_times:
                response_times.sort()
                self.stats['avg_response_time'] = sum(response_times) / len(response_times)
                
                # Calculate percentiles
                p95_index = int(len(response_times) * 0.95)
                p99_index = int(len(response_times) * 0.99)
                
                self.stats['p95_response_time'] = response_times[p95_index] if p95_index < len(response_times) else 0
                self.stats['p99_response_time'] = response_times[p99_index] if p99_index < len(response_times) else 0
            
            # Error rate calculation
            total_requests = len(self.realtime_metrics['api_requests'])
            if total_requests > 0:
                error_count = sum(
                    1 for req in self.realtime_metrics['api_requests'] 
                    if not req.get('success', True)
                )
                error_rate = (error_count / total_requests) * 100
                
                if error_rate > self.alert_thresholds['error_rate']:
                    await self.trigger_alert(
                        'HIGH_ERROR_RATE',
                        f"High error rate: {error_rate:.1f}%",
                        {'error_rate': error_rate, 'error_count': error_count}
                    )
                    
        except Exception as e:
            logger.error(f"❌ Performance stats calculation error: {e}")
    
    async def generate_recommendations(self) -> List[str]:
        """Generate performance optimization recommendations"""
        recommendations = []
        
        # Analyze response times
        if self.stats['avg_response_time'] > 0.3:
            recommendations.append(
                "Consider implementing additional caching layers - average response time is high"
            )
        
        if self.stats['p95_response_time'] > 1.0:
            recommendations.append(
                "95th percentile response time is high - consider database query optimization"
            )
        
        # Analyze AI performance
        ai_requests = list(self.realtime_metrics['ai_requests'])
        if ai_requests:
            avg_ai_time = sum(req['duration'] for req in ai_requests) / len(ai_requests)
            if avg_ai_time > 3.0:
                recommendations.append(
                    "AI response times are high - consider model optimization or parallel processing"
                )
        
        # Analyze system resources
        system_metrics = list(self.realtime_metrics['system'])
        if system_metrics:
            latest_system = system_metrics[-1]
            if latest_system['cpu_percent'] > 70:
                recommendations.append(
                    "CPU usage is consistently high - consider horizontal scaling"
                )
            
            if latest_system['memory_percent'] > 80:
                recommendations.append(
                    "Memory usage is high - consider memory optimization or scaling"
                )
        
        return recommendations
    
    async def trigger_alert(self, alert_type: str, message: str, metadata: Dict = None):
        """Trigger performance alert"""
        alert = {
            'type': alert_type,
            'message': message,
            'metadata': metadata or {},
            'timestamp': datetime.utcnow().isoformat(),
            'severity': self.get_alert_severity(alert_type)
        }
        
        self.alerts.append(alert)
        
        # Log alert
        logger.warning(f"🚨 PERFORMANCE ALERT [{alert_type}]: {message}")
        
        # Store in Redis for persistence
        if self.redis_client:
            try:
                await self.redis_client.lpush(
                    'performance_alerts',
                    json.dumps(alert, default=str)
                )
                await self.redis_client.ltrim('performance_alerts', 0, 499)
            except Exception as e:
                logger.error(f"❌ Failed to store alert: {e}")
    
    def get_alert_severity(self, alert_type: str) -> str:
        """Determine alert severity level"""
        critical_alerts = ['HIGH_ERROR_RATE', 'SYSTEM_DOWN']
        warning_alerts = ['SLOW_API_RESPONSE', 'SLOW_AI_RESPONSE', 'HIGH_CPU_USAGE']
        
        if alert_type in critical_alerts:
            return 'CRITICAL'
        elif alert_type in warning_alerts:
            return 'WARNING'
        else:
            return 'INFO'
    
    async def get_performance_dashboard(self) -> Dict:
        """Get comprehensive performance dashboard data"""
        try:
            # Current system status
            cpu_percent = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            
            # Recent metrics summary
            recent_api_requests = list(self.realtime_metrics['api_requests'])[-100:]
            recent_ai_requests = list(self.realtime_metrics['ai_requests'])[-50:]
            recent_alerts = list(self.alerts)[-10:]
            
            return {
                'current_status': {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'total_requests': self.stats['total_requests'],
                    'success_rate': (
                        (self.stats['successful_requests'] / self.stats['total_requests']) * 100
                        if self.stats['total_requests'] > 0 else 100
                    )
                },
                'performance_stats': self.stats,
                'recent_metrics': {
                    'api_requests': recent_api_requests,
                    'ai_requests': recent_ai_requests,
                },
                'recent_alerts': recent_alerts,
                'recommendations': await self.generate_recommendations()
            }
            
        except Exception as e:
            logger.error(f"❌ Dashboard data generation error: {e}")
            return {'error': str(e)}

# Global performance monitor instance
performance_monitor = None

async def get_performance_monitor() -> PerformanceMonitor:
    """Get the global performance monitor instance"""
    global performance_monitor
    if performance_monitor is None:
        performance_monitor = PerformanceMonitor()
        await performance_monitor.initialize()
    
    return performance_monitor

# Decorator for automatic performance monitoring
def monitor_performance(endpoint_name: str = None):
    """Decorator to automatically monitor function performance"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            monitor = await get_performance_monitor()
            endpoint = endpoint_name or func.__name__
            
            async with monitor.monitor_request(endpoint):
                return await func(*args, **kwargs)
                
        return wrapper
    return decorator