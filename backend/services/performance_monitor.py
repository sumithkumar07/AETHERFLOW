"""
Real-time Performance Monitoring Service - Phase 1 Implementation
Provides real-time performance metrics and optimization
"""
import asyncio
import time
import psutil
import json
from typing import Dict, List, Any
from datetime import datetime, timedelta
from collections import deque, defaultdict
import os

class PerformanceMonitor:
    def __init__(self):
        self.metrics_history = deque(maxlen=1000)
        self.response_times = deque(maxlen=100)
        self.api_call_counts = defaultdict(int)
        self.error_counts = defaultdict(int)
        self.active_connections = 0
        self.start_time = time.time()
        
        # Real-time monitoring flags
        self.monitoring_active = True
        self.alert_thresholds = {
            'response_time_ms': 2000,  # 2 seconds
            'memory_usage_mb': 512,    # 512 MB
            'cpu_usage_percent': 80,   # 80%
            'error_rate_percent': 5    # 5%
        }

    async def record_api_call(self, endpoint: str, response_time: float, success: bool = True):
        """Record API call metrics for real-time monitoring"""
        timestamp = datetime.now()
        
        # Record response time
        self.response_times.append(response_time)
        self.api_call_counts[endpoint] += 1
        
        if not success:
            self.error_counts[endpoint] += 1
        
        # Record detailed metrics
        metrics = {
            'timestamp': timestamp.isoformat(),
            'endpoint': endpoint,
            'response_time_ms': response_time * 1000,
            'success': success,
            'memory_usage_mb': psutil.Process().memory_info().rss / 1024 / 1024,
            'cpu_usage_percent': psutil.cpu_percent(interval=None),
            'active_connections': self.active_connections
        }
        
        self.metrics_history.append(metrics)
        
        # Check for performance alerts
        await self._check_performance_alerts(metrics)

    def get_real_time_metrics(self) -> Dict[str, Any]:
        """Get current real-time performance metrics"""
        current_time = time.time()
        uptime_seconds = current_time - self.start_time
        
        # Calculate averages
        recent_response_times = list(self.response_times)[-10:]  # Last 10 requests
        avg_response_time = sum(recent_response_times) / len(recent_response_times) if recent_response_times else 0
        
        # Calculate error rate
        total_calls = sum(self.api_call_counts.values())
        total_errors = sum(self.error_counts.values())
        error_rate = (total_errors / total_calls * 100) if total_calls > 0 else 0
        
        # System metrics
        memory_info = psutil.Process().memory_info()
        
        return {
            'timestamp': datetime.now().isoformat(),
            'uptime_seconds': uptime_seconds,
            'uptime_formatted': self._format_uptime(uptime_seconds),
            'performance': {
                'avg_response_time_ms': round(avg_response_time * 1000, 2),
                'fastest_response_ms': round(min(recent_response_times) * 1000, 2) if recent_response_times else 0,
                'slowest_response_ms': round(max(recent_response_times) * 1000, 2) if recent_response_times else 0,
                'requests_per_second': self._calculate_requests_per_second(),
                'error_rate_percent': round(error_rate, 2)
            },
            'system': {
                'memory_usage_mb': round(memory_info.rss / 1024 / 1024, 2),
                'memory_percent': psutil.virtual_memory().percent,
                'cpu_usage_percent': psutil.cpu_percent(interval=None),
                'disk_usage_percent': psutil.disk_usage('/').percent,
                'active_connections': self.active_connections
            },
            'api_stats': {
                'total_requests': total_calls,
                'total_errors': total_errors,
                'endpoint_counts': dict(self.api_call_counts),
                'error_counts': dict(self.error_counts)
            },
            'health_status': self._get_health_status(avg_response_time, error_rate),
            'alerts': self._get_active_alerts()
        }

    def get_performance_trend(self, minutes: int = 5) -> Dict[str, Any]:
        """Get performance trend data for charts"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        
        recent_metrics = [
            m for m in self.metrics_history
            if datetime.fromisoformat(m['timestamp']) > cutoff_time
        ]
        
        if not recent_metrics:
            return {'message': 'No data available for the requested time period'}
        
        # Group by minute for trend analysis
        trend_data = defaultdict(list)
        
        for metric in recent_metrics:
            minute_key = datetime.fromisoformat(metric['timestamp']).strftime('%H:%M')
            trend_data[minute_key].append(metric)
        
        # Calculate averages per minute
        trend_points = []
        for minute, metrics_list in sorted(trend_data.items()):
            avg_response_time = sum(m['response_time_ms'] for m in metrics_list) / len(metrics_list)
            avg_memory = sum(m['memory_usage_mb'] for m in metrics_list) / len(metrics_list)
            avg_cpu = sum(m['cpu_usage_percent'] for m in metrics_list) / len(metrics_list)
            
            trend_points.append({
                'time': minute,
                'response_time_ms': round(avg_response_time, 2),
                'memory_usage_mb': round(avg_memory, 2),
                'cpu_usage_percent': round(avg_cpu, 2),
                'request_count': len(metrics_list)
            })
        
        return {
            'period_minutes': minutes,
            'total_data_points': len(recent_metrics),
            'trend_data': trend_points,
            'summary': {
                'min_response_time': min(m['response_time_ms'] for m in recent_metrics),
                'max_response_time': max(m['response_time_ms'] for m in recent_metrics),
                'avg_response_time': sum(m['response_time_ms'] for m in recent_metrics) / len(recent_metrics)
            }
        }

    async def _check_performance_alerts(self, metrics: Dict[str, Any]):
        """Check for performance issues and generate alerts"""
        alerts = []
        
        # Response time alerts
        if metrics['response_time_ms'] > self.alert_thresholds['response_time_ms']:
            alerts.append({
                'type': 'response_time',
                'severity': 'warning',
                'message': f"Slow response time: {metrics['response_time_ms']}ms",
                'threshold': self.alert_thresholds['response_time_ms'],
                'current_value': metrics['response_time_ms']
            })
        
        # Memory usage alerts
        if metrics['memory_usage_mb'] > self.alert_thresholds['memory_usage_mb']:
            alerts.append({
                'type': 'memory_usage',
                'severity': 'warning',
                'message': f"High memory usage: {metrics['memory_usage_mb']}MB",
                'threshold': self.alert_thresholds['memory_usage_mb'],
                'current_value': metrics['memory_usage_mb']
            })
        
        # CPU usage alerts
        if metrics['cpu_usage_percent'] > self.alert_thresholds['cpu_usage_percent']:
            alerts.append({
                'type': 'cpu_usage',
                'severity': 'warning',
                'message': f"High CPU usage: {metrics['cpu_usage_percent']}%",
                'threshold': self.alert_thresholds['cpu_usage_percent'],
                'current_value': metrics['cpu_usage_percent']
            })
        
        # Store alerts for retrieval
        if alerts:
            setattr(self, '_recent_alerts', getattr(self, '_recent_alerts', []) + alerts)

    def _get_health_status(self, avg_response_time: float, error_rate: float) -> str:
        """Determine overall health status"""
        if error_rate > 10:
            return 'critical'
        elif error_rate > 5 or avg_response_time > 3:
            return 'warning'
        elif avg_response_time < 1:
            return 'excellent'
        else:
            return 'healthy'

    def _get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get currently active performance alerts"""
        return getattr(self, '_recent_alerts', [])[-5:]  # Last 5 alerts

    def _calculate_requests_per_second(self) -> float:
        """Calculate current requests per second"""
        recent_metrics = list(self.metrics_history)[-60:]  # Last minute
        if len(recent_metrics) < 2:
            return 0.0
        
        time_span = 60  # seconds
        return len(recent_metrics) / time_span

    def _format_uptime(self, seconds: float) -> str:
        """Format uptime in human readable format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        seconds = int(seconds % 60)
        
        if hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"

    def increment_connections(self):
        """Increment active connection count"""
        self.active_connections += 1

    def decrement_connections(self):
        """Decrement active connection count"""
        self.active_connections = max(0, self.active_connections - 1)

    def get_optimization_suggestions(self) -> List[Dict[str, Any]]:
        """Phase 2: Get optimization suggestions based on performance data"""
        suggestions = []
        
        if not self.metrics_history:
            return suggestions
        
        recent_metrics = list(self.metrics_history)[-20:]  # Last 20 requests
        avg_response_time = sum(m['response_time_ms'] for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m['memory_usage_mb'] for m in recent_metrics) / len(recent_metrics)
        
        # Response time optimizations
        if avg_response_time > 1500:
            suggestions.append({
                'type': 'response_time',
                'priority': 'high',
                'suggestion': 'Consider implementing response caching for frequently requested data',
                'impact': 'Could reduce response time by 30-50%',
                'effort': 'medium'
            })
        
        # Memory optimizations
        if avg_memory > 400:
            suggestions.append({
                'type': 'memory',
                'priority': 'medium',
                'suggestion': 'Implement memory cleanup for conversation cache',
                'impact': 'Could reduce memory usage by 20-30%',
                'effort': 'low'
            })
        
        # Connection optimizations
        if self.active_connections > 100:
            suggestions.append({
                'type': 'connections',
                'priority': 'medium',
                'suggestion': 'Consider implementing connection pooling',
                'impact': 'Could improve concurrent user handling',
                'effort': 'high'
            })
        
        return suggestions

    async def start_monitoring(self):
        """Start background monitoring task"""
        if not self.monitoring_active:
            return
        
        while self.monitoring_active:
            try:
                # Collect system metrics periodically
                current_metrics = {
                    'timestamp': datetime.now().isoformat(),
                    'endpoint': 'system_monitor',
                    'response_time_ms': 0,
                    'success': True,
                    'memory_usage_mb': psutil.Process().memory_info().rss / 1024 / 1024,
                    'cpu_usage_percent': psutil.cpu_percent(interval=1),
                    'active_connections': self.active_connections
                }
                
                self.metrics_history.append(current_metrics)
                
                # Sleep for 30 seconds before next collection
                await asyncio.sleep(30)
                
            except Exception as e:
                print(f"Monitoring error: {e}")
                await asyncio.sleep(60)  # Wait longer on error

    def stop_monitoring(self):
        """Stop background monitoring"""
        self.monitoring_active = False

# Global instance
performance_monitor = PerformanceMonitor()