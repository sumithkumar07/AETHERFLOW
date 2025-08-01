import logging
import asyncio
import time
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import statistics
import psutil
import numpy as np
from collections import defaultdict, deque
# import aioredis  # Temporarily disabled due to compatibility issue
# import aiocache  # Temporarily disabled

logger = logging.getLogger(__name__)

class ServerHealth(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    OVERLOADED = "overloaded"
    CRITICAL = "critical"

class RequestType(Enum):
    API_CALL = "api_call"
    STATIC_CONTENT = "static_content"
    AI_INFERENCE = "ai_inference"
    DATABASE_QUERY = "database_query"
    FILE_UPLOAD = "file_upload"

@dataclass
class ServerMetrics:
    server_id: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Tuple[float, float]  # (bytes_in, bytes_out)
    active_connections: int
    response_time_avg: float
    error_rate: float
    timestamp: datetime
    health_status: ServerHealth

@dataclass
class RequestMetrics:
    request_id: str
    user_id: str
    endpoint: str
    method: str
    request_type: RequestType
    response_time: float
    status_code: int
    data_size: int
    timestamp: datetime
    server_id: str
    user_location: Optional[Dict[str, str]] = None

@dataclass
class CDNNode:
    node_id: str
    location: Dict[str, str]
    capacity: int
    current_load: int
    latency_to_regions: Dict[str, float]
    health_status: ServerHealth

class IntelligentLoadBalancer:
    """Route requests to optimal servers based on real-time conditions"""
    
    def __init__(self):
        self.servers = {}
        self.server_metrics = {}
        self.request_history = deque(maxlen=10000)
        self.geo_database = GeoDatabase()
        self.performance_predictor = PerformancePredictor()
        self.cdn_manager = CDNManager()
        self.circuit_breaker = CircuitBreaker()
    
    async def initialize(self):
        """Initialize load balancer"""
        try:
            await self.geo_database.initialize()
            await self.performance_predictor.initialize()
            await self.cdn_manager.initialize()
            
            # Start monitoring loop
            asyncio.create_task(self._monitoring_loop())
            
            logger.info("Intelligent load balancer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize load balancer: {e}")
            raise
    
    async def route_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Route request to optimal server"""
        try:
            # Extract request information
            user_location = await self.geo_database.get_location(request.get("ip_address"))
            request_type = self._classify_request_type(request)
            
            # Get server health metrics
            server_health = await self._get_server_health()
            
            # Calculate optimal server
            optimal_server = await self._select_optimal_server(
                user_location=user_location,
                request_type=request_type,
                server_health=server_health,
                request_data=request
            )
            
            # Check circuit breaker
            if not await self.circuit_breaker.is_available(optimal_server["server_id"]):
                # Fallback to secondary server
                optimal_server = await self._get_fallback_server(optimal_server["server_id"])
            
            # Record routing decision
            await self._record_routing_decision(request, optimal_server)
            
            return {
                "server_id": optimal_server["server_id"],
                "server_url": optimal_server["url"],
                "expected_response_time": optimal_server["predicted_response_time"],
                "routing_reason": optimal_server["selection_reason"],
                "cdn_node": optimal_server.get("cdn_node"),
                "cache_strategy": optimal_server.get("cache_strategy")
            }
            
        except Exception as e:
            logger.error(f"Error routing request: {e}")
            return await self._get_default_server()
    
    async def _select_optimal_server(self, user_location: Dict, request_type: RequestType, 
                                   server_health: Dict, request_data: Dict) -> Dict[str, Any]:
        """Select optimal server based on multiple factors"""
        try:
            candidates = []
            
            for server_id, server_info in self.servers.items():
                if server_health[server_id]["health_status"] == ServerHealth.CRITICAL:
                    continue
                
                # Calculate score based on multiple factors
                score = await self._calculate_server_score(
                    server_id=server_id,
                    server_info=server_info,
                    server_health=server_health[server_id],
                    user_location=user_location,
                    request_type=request_type,
                    request_data=request_data
                )
                
                candidates.append({
                    "server_id": server_id,
                    "score": score,
                    "url": server_info["url"],
                    "predicted_response_time": score.get("response_time_prediction"),
                    "selection_reason": score.get("primary_factor")
                })
            
            # Sort by score and select best
            candidates.sort(key=lambda x: x["score"]["total_score"], reverse=True)
            
            if candidates:
                selected = candidates[0]
                
                # Add CDN optimization if applicable
                if request_type in [RequestType.STATIC_CONTENT, RequestType.FILE_UPLOAD]:
                    cdn_node = await self.cdn_manager.get_optimal_node(user_location)
                    if cdn_node:
                        selected["cdn_node"] = cdn_node
                        selected["cache_strategy"] = "cdn_edge"
                
                return selected
            
            return await self._get_default_server()
            
        except Exception as e:
            logger.error(f"Error selecting optimal server: {e}")
            return await self._get_default_server()
    
    async def _calculate_server_score(self, server_id: str, server_info: Dict, 
                                    server_health: Dict, user_location: Dict,
                                    request_type: RequestType, request_data: Dict) -> Dict[str, Any]:
        """Calculate comprehensive server score"""
        try:
            score_components = {}
            
            # 1. Health score (40% weight)
            health_score = self._calculate_health_score(server_health)
            score_components["health"] = health_score * 0.4
            
            # 2. Geographic proximity (25% weight)
            geo_score = await self._calculate_geo_score(server_info, user_location)
            score_components["geography"] = geo_score * 0.25
            
            # 3. Specialization score (20% weight)
            specialization_score = self._calculate_specialization_score(server_info, request_type)
            score_components["specialization"] = specialization_score * 0.2
            
            # 4. Historical performance (10% weight)
            performance_score = await self._calculate_performance_score(server_id, request_type)
            score_components["performance"] = performance_score * 0.1
            
            # 5. Current load (5% weight)
            load_score = self._calculate_load_score(server_health)
            score_components["load"] = load_score * 0.05
            
            total_score = sum(score_components.values())
            
            # Predict response time
            response_time_prediction = await self.performance_predictor.predict_response_time(
                server_id, request_type, server_health, user_location
            )
            
            # Determine primary selection factor
            primary_factor = max(score_components, key=score_components.get)
            
            return {
                "total_score": total_score,
                "components": score_components,
                "response_time_prediction": response_time_prediction,
                "primary_factor": primary_factor
            }
            
        except Exception as e:
            logger.error(f"Error calculating server score: {e}")
            return {"total_score": 0.5, "components": {}}
    
    def _calculate_health_score(self, server_health: Dict) -> float:
        """Calculate health score from server metrics"""
        try:
            cpu_score = max(0, 1.0 - server_health["cpu_usage"] / 100.0)
            memory_score = max(0, 1.0 - server_health["memory_usage"] / 100.0)
            error_rate_score = max(0, 1.0 - server_health["error_rate"])
            
            # Weighted average
            health_score = (cpu_score * 0.4 + memory_score * 0.4 + error_rate_score * 0.2)
            
            # Apply health status modifier
            status_modifiers = {
                ServerHealth.HEALTHY: 1.0,
                ServerHealth.DEGRADED: 0.7,
                ServerHealth.OVERLOADED: 0.3,
                ServerHealth.CRITICAL: 0.0
            }
            
            return health_score * status_modifiers.get(server_health["health_status"], 0.5)
            
        except Exception as e:
            logger.error(f"Error calculating health score: {e}")
            return 0.5
    
    async def _monitoring_loop(self):
        """Continuous monitoring of server health"""
        while True:
            try:
                await asyncio.sleep(30)  # Check every 30 seconds
                
                # Update server metrics
                for server_id in self.servers:
                    metrics = await self._collect_server_metrics(server_id)
                    self.server_metrics[server_id] = metrics
                    
                    # Update circuit breaker
                    await self.circuit_breaker.update_server_status(
                        server_id, 
                        metrics.health_status != ServerHealth.CRITICAL
                    )
                
                # Clean old request history
                self._cleanup_request_history()
                
                # Update predictive models
                await self.performance_predictor.update_models(self.request_history)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")

class PredictiveAutoScaler:
    """Scale resources before you need them using predictive analytics"""
    
    def __init__(self):
        self.scaling_history = deque(maxlen=1000)
        self.usage_patterns = {}
        self.prediction_models = {}
        self.scaling_policies = {}
        self.current_capacity = {}
        self.auto_scaling_enabled = True
    
    async def initialize(self):
        """Initialize predictive auto-scaler"""
        try:
            # Load historical data
            await self._load_historical_patterns()
            
            # Initialize prediction models
            await self._initialize_prediction_models()
            
            # Start prediction loop
            asyncio.create_task(self._prediction_loop())
            
            logger.info("Predictive auto-scaler initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize auto-scaler: {e}")
            raise
    
    async def analyze_usage_patterns(self) -> Dict[str, Any]:
        """Analyze historical usage patterns for prediction"""
        try:
            current_time = datetime.now()
            
            # Get usage data for the last 30 days
            usage_data = await self._get_usage_data(days=30)
            
            patterns = {
                "hourly_patterns": self._analyze_hourly_patterns(usage_data),
                "daily_patterns": self._analyze_daily_patterns(usage_data),
                "weekly_patterns": self._analyze_weekly_patterns(usage_data),
                "seasonal_patterns": self._analyze_seasonal_patterns(usage_data),
                "trend_analysis": self._analyze_trends(usage_data)
            }
            
            # Generate predictions
            predictions = await self._generate_predictions(patterns)
            
            # Determine scaling actions
            scaling_actions = await self._determine_scaling_actions(predictions)
            
            return {
                "timestamp": current_time.isoformat(),
                "patterns": patterns,
                "predictions": predictions,
                "recommended_actions": scaling_actions,
                "current_capacity": self.current_capacity,
                "confidence_score": predictions.get("confidence", 0.5)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing usage patterns: {e}")
            return {}
    
    async def execute_scaling_action(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a scaling action"""
        try:
            action_type = action.get("type")
            resource = action.get("resource")
            target_capacity = action.get("target_capacity")
            
            if not self.auto_scaling_enabled:
                return {"status": "disabled", "message": "Auto-scaling is disabled"}
            
            # Validate scaling action
            if not await self._validate_scaling_action(action):
                return {"status": "rejected", "reason": "Validation failed"}
            
            # Execute scaling
            if action_type == "scale_up":
                result = await self._scale_up(resource, target_capacity)
            elif action_type == "scale_down":
                result = await self._scale_down(resource, target_capacity)
            else:
                return {"status": "error", "reason": f"Unknown action type: {action_type}"}
            
            # Record scaling action
            scaling_record = {
                "timestamp": datetime.now(),
                "action": action,
                "result": result,
                "previous_capacity": self.current_capacity.get(resource),
                "new_capacity": target_capacity
            }
            self.scaling_history.append(scaling_record)
            
            # Update current capacity
            if result["status"] == "success":
                self.current_capacity[resource] = target_capacity
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing scaling action: {e}")
            return {"status": "error", "reason": str(e)}
    
    async def _generate_predictions(self, patterns: Dict[str, Any]) -> Dict[str, Any]:
        """Generate load predictions based on patterns"""
        try:
            current_time = datetime.now()
            predictions = {}
            
            # Predict load for next 24 hours
            hourly_predictions = []
            for hour in range(24):
                future_time = current_time + timedelta(hours=hour)
                
                # Base prediction from hourly patterns
                hour_of_day = future_time.hour
                base_load = patterns["hourly_patterns"].get(str(hour_of_day), 50)
                
                # Apply daily pattern modifier
                day_of_week = future_time.weekday()
                daily_modifier = patterns["daily_patterns"].get(str(day_of_week), 1.0)
                
                # Apply trend
                trend_modifier = patterns["trend_analysis"].get("growth_rate", 0.0)
                
                predicted_load = base_load * daily_modifier * (1 + trend_modifier)
                
                hourly_predictions.append({
                    "hour": hour,
                    "timestamp": future_time.isoformat(),
                    "predicted_load": predicted_load,
                    "confidence": self._calculate_prediction_confidence(patterns, hour)
                })
            
            predictions["hourly"] = hourly_predictions
            
            # Find peak load in prediction window
            peak_load = max(pred["predicted_load"] for pred in hourly_predictions)
            peak_time = next(pred["timestamp"] for pred in hourly_predictions 
                           if pred["predicted_load"] == peak_load)
            
            predictions["peak_prediction"] = {
                "load": peak_load,
                "time": peak_time,
                "scaling_needed": peak_load > self._get_current_capacity() * 0.8
            }
            
            # Calculate overall confidence
            avg_confidence = statistics.mean(pred["confidence"] for pred in hourly_predictions)
            predictions["confidence"] = avg_confidence
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error generating predictions: {e}")
            return {"confidence": 0.0}
    
    async def _determine_scaling_actions(self, predictions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Determine what scaling actions should be taken"""
        try:
            actions = []
            
            peak_prediction = predictions.get("peak_prediction", {})
            if not peak_prediction:
                return actions
            
            current_capacity = self._get_current_capacity()
            predicted_peak = peak_prediction["load"]
            
            # Scale up if predicted load exceeds 80% of capacity
            if predicted_peak > current_capacity * 0.8:
                target_capacity = int(predicted_peak * 1.2)  # 20% buffer
                actions.append({
                    "type": "scale_up",
                    "resource": "compute",
                    "current_capacity": current_capacity,
                    "target_capacity": target_capacity,
                    "reason": f"Predicted peak load ({predicted_peak}) exceeds threshold",
                    "urgency": "high" if predicted_peak > current_capacity else "medium",
                    "execute_at": peak_prediction["time"]
                })
            
            # Scale down if predicted load is consistently low
            hourly_predictions = predictions.get("hourly", [])
            avg_predicted_load = statistics.mean(pred["predicted_load"] for pred in hourly_predictions)
            
            if avg_predicted_load < current_capacity * 0.3:
                target_capacity = max(int(avg_predicted_load * 1.5), 10)  # Minimum capacity of 10
                actions.append({
                    "type": "scale_down",
                    "resource": "compute",
                    "current_capacity": current_capacity,
                    "target_capacity": target_capacity,
                    "reason": f"Predicted average load ({avg_predicted_load}) is low",
                    "urgency": "low",
                    "execute_at": (datetime.now() + timedelta(hours=1)).isoformat()
                })
            
            return actions
            
        except Exception as e:
            logger.error(f"Error determining scaling actions: {e}")
            return []
    
    async def _prediction_loop(self):
        """Continuous prediction and scaling loop"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                
                if not self.auto_scaling_enabled:
                    continue
                
                # Analyze patterns and generate predictions
                analysis = await self.analyze_usage_patterns()
                
                # Execute recommended actions
                for action in analysis.get("recommended_actions", []):
                    if action.get("urgency") == "high":
                        # Execute immediately for high urgency
                        await self.execute_scaling_action(action)
                    else:
                        # Schedule for later execution
                        await self._schedule_scaling_action(action)
                
            except Exception as e:
                logger.error(f"Error in prediction loop: {e}")

class PerformanceOptimizer:
    """Advanced performance optimization system"""
    
    def __init__(self, db_client):
        self.db_client = db_client
        self.load_balancer = IntelligentLoadBalancer()
        self.auto_scaler = PredictiveAutoScaler()
        self.cache_optimizer = CacheOptimizer()
        self.database_optimizer = DatabaseOptimizer(db_client)
        self.network_optimizer = NetworkOptimizer()
        self.initialized = False
    
    async def initialize(self):
        """Initialize performance optimizer"""
        try:
            await self.load_balancer.initialize()
            await self.auto_scaler.initialize()
            await self.cache_optimizer.initialize()
            await self.database_optimizer.initialize()
            await self.network_optimizer.initialize()
            
            # Start optimization loop
            asyncio.create_task(self._optimization_loop())
            
            self.initialized = True
            logger.info("Performance optimizer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize performance optimizer: {e}")
            raise
    
    async def optimize_request_routing(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize request routing for best performance"""
        return await self.load_balancer.route_request(request)
    
    async def optimize_caching_strategy(self, content_type: str, access_patterns: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize caching strategy based on content and access patterns"""
        return await self.cache_optimizer.optimize_strategy(content_type, access_patterns)
    
    async def get_performance_recommendations(self) -> Dict[str, Any]:
        """Get comprehensive performance recommendations"""
        try:
            recommendations = {
                "scaling": await self.auto_scaler.analyze_usage_patterns(),
                "caching": await self.cache_optimizer.get_optimization_recommendations(),
                "database": await self.database_optimizer.get_optimization_recommendations(),
                "network": await self.network_optimizer.get_optimization_recommendations(),
                "timestamp": datetime.now().isoformat()
            }
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting performance recommendations: {e}")
            return {}
    
    async def _optimization_loop(self):
        """Continuous performance optimization"""
        while True:
            try:
                await asyncio.sleep(600)  # Run every 10 minutes
                
                # Get current performance metrics
                metrics = await self._collect_performance_metrics()
                
                # Identify optimization opportunities
                opportunities = await self._identify_optimization_opportunities(metrics)
                
                # Execute safe optimizations automatically
                for opportunity in opportunities:
                    if opportunity.get("safety_level") == "safe":
                        await self._execute_optimization(opportunity)
                
            except Exception as e:
                logger.error(f"Error in optimization loop: {e}")

# Helper classes for performance optimization
class GeoDatabase:
    async def initialize(self):
        pass
    
    async def get_location(self, ip_address: str) -> Dict[str, str]:
        return {"country": "US", "city": "San Francisco"}

class PerformancePredictor:
    async def initialize(self):
        pass
    
    async def predict_response_time(self, server_id: str, request_type: RequestType, 
                                  server_health: Dict, user_location: Dict) -> float:
        return 0.1  # 100ms prediction

class CDNManager:
    async def initialize(self):
        pass
    
    async def get_optimal_node(self, user_location: Dict) -> Optional[str]:
        return "cdn-us-west-1"

class CircuitBreaker:
    def __init__(self):
        self.server_status = {}
    
    async def is_available(self, server_id: str) -> bool:
        return True
    
    async def update_server_status(self, server_id: str, is_healthy: bool):
        self.server_status[server_id] = is_healthy

class CacheOptimizer:
    async def initialize(self):
        pass
    
    async def optimize_strategy(self, content_type: str, access_patterns: Dict) -> Dict[str, Any]:
        return {"strategy": "redis", "ttl": 3600}
    
    async def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        return [{"type": "cache_tuning", "recommendation": "Increase Redis memory"}]

class DatabaseOptimizer:
    def __init__(self, db_client):
        self.db_client = db_client
    
    async def initialize(self):
        pass
    
    async def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        return [{"type": "index_optimization", "recommendation": "Add compound index"}]

class NetworkOptimizer:
    async def initialize(self):
        pass
    
    async def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        return [{"type": "connection_pooling", "recommendation": "Increase pool size"}]