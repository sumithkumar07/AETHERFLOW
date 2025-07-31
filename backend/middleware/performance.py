import time
import asyncio
import logging
from typing import Callable, Dict, Any
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import psutil
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class PerformanceMiddleware:
    """Performance monitoring and optimization middleware"""
    
    def __init__(self):
        self.request_times = []
        self.performance_metrics = {
            "total_requests": 0,
            "total_response_time": 0,
            "average_response_time": 0,
            "slow_requests": 0,
            "error_count": 0,
            "requests_per_second": 0
        }
        self.start_time = datetime.utcnow()
        
    async def __call__(self, request: Request, call_next: Callable) -> Response:
        """Process request with performance monitoring"""
        
        start_time = time.time()
        
        # Add performance headers
        request.state.start_time = start_time
        request.state.request_id = f"req_{int(start_time * 1000)}"
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate response time
            end_time = time.time()
            response_time = end_time - start_time
            
            # Update metrics
            await self._update_metrics(request, response, response_time)
            
            # Add performance headers to response
            self._add_performance_headers(response, response_time, request.state.request_id)
            
            return response
            
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            
            # Log error with performance data
            logger.error(f"Request failed: {str(e)} (Response time: {response_time:.3f}s)")
            
            # Update error metrics
            self.performance_metrics["error_count"] += 1
            
            # Create error response with performance data
            error_response = JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "request_id": request.state.request_id,
                    "response_time": round(response_time, 3)
                }
            )
            
            self._add_performance_headers(error_response, response_time, request.state.request_id)
            
            return error_response
    
    async def _update_metrics(self, request: Request, response: Response, response_time: float):
        """Update performance metrics"""
        
        self.performance_metrics["total_requests"] += 1
        self.performance_metrics["total_response_time"] += response_time
        
        # Calculate average response time
        self.performance_metrics["average_response_time"] = (
            self.performance_metrics["total_response_time"] / 
            self.performance_metrics["total_requests"]
        )
        
        # Track slow requests (>1 second)
        if response_time > 1.0:
            self.performance_metrics["slow_requests"] += 1
            logger.warning(
                f"Slow request detected: {request.method} {request.url.path} "
                f"took {response_time:.3f}s"
            )
        
        # Keep recent response times for RPS calculation
        self.request_times.append({
            "timestamp": datetime.utcnow(),
            "response_time": response_time
        })
        
        # Clean old entries (keep last 5 minutes)
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        self.request_times = [
            rt for rt in self.request_times 
            if rt["timestamp"] > cutoff_time
        ]
        
        # Calculate requests per second (last 5 minutes)
        if self.request_times:
            time_span = (datetime.utcnow() - self.request_times[0]["timestamp"]).total_seconds()
            if time_span > 0:
                self.performance_metrics["requests_per_second"] = len(self.request_times) / time_span
    
    def _add_performance_headers(self, response: Response, response_time: float, request_id: str):
        """Add performance headers to response"""
        
        response.headers["X-Response-Time"] = f"{response_time:.3f}s"
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Server-Timing"] = f"total;dur={response_time * 1000:.1f}"
        
        # Add system metrics in development
        if os.getenv("NODE_ENV") == "development":
            try:
                cpu_percent = psutil.cpu_percent()
                memory_percent = psutil.virtual_memory().percent
                response.headers["X-System-CPU"] = f"{cpu_percent}%"
                response.headers["X-System-Memory"] = f"{memory_percent}%"
            except Exception:
                pass  # Ignore system metrics errors
    
    async def get_performance_report(self) -> Dict[str, Any]:
        """Get comprehensive performance report"""
        
        uptime = datetime.utcnow() - self.start_time
        
        # Calculate percentiles from recent request times
        recent_times = [rt["response_time"] for rt in self.request_times[-1000:]]  # Last 1000 requests
        recent_times.sort()
        
        percentiles = {}
        if recent_times:
            percentiles = {
                "p50": self._calculate_percentile(recent_times, 50),
                "p75": self._calculate_percentile(recent_times, 75),
                "p90": self._calculate_percentile(recent_times, 90),
                "p95": self._calculate_percentile(recent_times, 95),
                "p99": self._calculate_percentile(recent_times, 99)
            }
        
        # System metrics
        system_metrics = {}
        try:
            system_metrics = {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent,
                "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None
            }
        except Exception as e:
            logger.warning(f"Could not get system metrics: {e}")
        
        return {
            "uptime_seconds": uptime.total_seconds(),
            "metrics": self.performance_metrics.copy(),
            "response_time_percentiles": percentiles,
            "system_metrics": system_metrics,
            "recent_request_count": len(self.request_times),
            "error_rate": (
                self.performance_metrics["error_count"] / 
                max(self.performance_metrics["total_requests"], 1)
            ) * 100
        }
    
    def _calculate_percentile(self, data: list, percentile: int) -> float:
        """Calculate percentile from sorted data"""
        if not data:
            return 0.0
        
        index = (percentile / 100) * (len(data) - 1)
        if index.is_integer():
            return data[int(index)]
        else:
            lower = data[int(index)]
            upper = data[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform application health check"""
        
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {}
        }
        
        # Check response time health
        avg_response_time = self.performance_metrics["average_response_time"]
        if avg_response_time > 2.0:
            health_status["checks"]["response_time"] = {
                "status": "warning",
                "message": f"Average response time is high: {avg_response_time:.3f}s"
            }
        else:
            health_status["checks"]["response_time"] = {
                "status": "healthy",
                "value": f"{avg_response_time:.3f}s"
            }
        
        # Check error rate
        error_rate = (
            self.performance_metrics["error_count"] / 
            max(self.performance_metrics["total_requests"], 1)
        ) * 100
        
        if error_rate > 5.0:
            health_status["checks"]["error_rate"] = {
                "status": "critical",
                "message": f"High error rate: {error_rate:.1f}%"
            }
            health_status["status"] = "unhealthy"
        elif error_rate > 1.0:
            health_status["checks"]["error_rate"] = {
                "status": "warning",
                "message": f"Elevated error rate: {error_rate:.1f}%"
            }
        else:
            health_status["checks"]["error_rate"] = {
                "status": "healthy",
                "value": f"{error_rate:.1f}%"
            }
        
        # Check system resources
        try:
            cpu_percent = psutil.cpu_percent()
            memory_percent = psutil.virtual_memory().percent
            
            if cpu_percent > 90 or memory_percent > 90:
                health_status["checks"]["system_resources"] = {
                    "status": "critical",
                    "message": f"High resource usage - CPU: {cpu_percent}%, Memory: {memory_percent}%"
                }
                health_status["status"] = "unhealthy"
            elif cpu_percent > 70 or memory_percent > 70:
                health_status["checks"]["system_resources"] = {
                    "status": "warning",
                    "message": f"Elevated resource usage - CPU: {cpu_percent}%, Memory: {memory_percent}%"
                }
            else:
                health_status["checks"]["system_resources"] = {
                    "status": "healthy",
                    "cpu": f"{cpu_percent}%",
                    "memory": f"{memory_percent}%"
                }
        except Exception:
            health_status["checks"]["system_resources"] = {
                "status": "unknown",
                "message": "Could not retrieve system metrics"
            }
        
        return health_status
    
    def reset_metrics(self):
        """Reset performance metrics"""
        self.performance_metrics = {
            "total_requests": 0,
            "total_response_time": 0,
            "average_response_time": 0,
            "slow_requests": 0,
            "error_count": 0,
            "requests_per_second": 0
        }
        self.request_times = []
        self.start_time = datetime.utcnow()
        logger.info("Performance metrics reset")

# Global performance middleware instance
performance_middleware = PerformanceMiddleware()