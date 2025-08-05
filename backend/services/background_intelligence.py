# Background Intelligence Analysis - Conversation Pattern Learning
# Phase 2: Background Analysis (0 UI changes)

import asyncio
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
from collections import defaultdict, Counter

logger = logging.getLogger(__name__)

class ConversationPattern(Enum):
    SCALABILITY_FOCUSED = "scalability_focused"
    PERFORMANCE_ORIENTED = "performance_oriented"
    COST_CONSCIOUS = "cost_conscious"
    SECURITY_FIRST = "security_first"
    RAPID_PROTOTYPING = "rapid_prototyping"
    ENTERPRISE_GRADE = "enterprise_grade"
    MICROSERVICES_ALIGNED = "microservices_aligned"
    MONOLITH_PREFERRED = "monolith_preferred"

@dataclass
class UserArchitecturalProfile:
    user_id: str
    primary_patterns: List[ConversationPattern]
    scale_preference: str
    technology_stack: List[str]
    architectural_maturity: str  # beginner, intermediate, advanced, expert
    cost_sensitivity: str  # low, medium, high
    performance_priority: str  # low, medium, high, critical
    security_awareness: str  # basic, standard, enhanced, enterprise
    project_complexity: str  # simple, moderate, complex, enterprise
    learning_velocity: float  # How quickly they adopt suggestions
    
@dataclass
class ConversationInsight:
    conversation_id: str
    user_id: str
    patterns_detected: List[ConversationPattern]
    architectural_needs: Dict[str, Any]
    technology_preferences: List[str]
    complexity_level: str
    success_indicators: Dict[str, float]
    timestamp: datetime

class BackgroundArchitecturalAnalyzer:
    """
    Background Intelligence Analysis System
    - Runs invisibly, no user interaction
    - Analyzes conversation patterns
    - Builds architectural knowledge base
    - Prepares enhanced context for future responses
    """
    
    def __init__(self):
        self.conversation_database = {}  # conversation_id -> messages
        self.user_profiles = {}  # user_id -> UserArchitecturalProfile
        self.pattern_detection_rules = self._initialize_pattern_rules()
        self.knowledge_base = defaultdict(list)
        self.learning_enabled = True
        
    async def analyze_conversation(self, conversation_id: str, user_id: str = None) -> ConversationInsight:
        """
        Analyze conversation patterns in background
        - Detects architectural preferences
        - Identifies scalability needs
        - Builds user profile
        - No user interaction required
        """
        try:
            messages = await self._get_conversation_messages(conversation_id)
            if not messages:
                return None
                
            # Step 1: Detect conversation patterns
            patterns_detected = await self._detect_conversation_patterns(messages)
            
            # Step 2: Analyze architectural needs
            architectural_needs = await self._analyze_architectural_needs(messages)
            
            # Step 3: Extract technology preferences
            tech_preferences = await self._extract_technology_preferences(messages)
            
            # Step 4: Assess complexity level
            complexity_level = await self._assess_complexity_level(messages)
            
            # Step 5: Calculate success indicators
            success_indicators = await self._calculate_success_indicators(messages, patterns_detected)
            
            # Step 6: Create conversation insight
            insight = ConversationInsight(
                conversation_id=conversation_id,
                user_id=user_id or "anonymous",
                patterns_detected=patterns_detected,
                architectural_needs=architectural_needs,
                technology_preferences=tech_preferences,
                complexity_level=complexity_level,
                success_indicators=success_indicators,
                timestamp=datetime.utcnow()
            )
            
            # Step 7: Update user profile
            if user_id:
                await self._update_user_profile(user_id, insight)
            
            # Step 8: Update knowledge base
            await self._update_knowledge_base(insight)
            
            logger.info(f"Background analysis completed for conversation {conversation_id}")
            return insight
            
        except Exception as e:
            logger.error(f"Background conversation analysis failed: {e}")
            return None
    
    async def get_enhanced_context(self, user_id: str, current_request: str) -> Dict[str, Any]:
        """
        Get enhanced context for current user request
        - Based on conversation history analysis
        - Personalized architectural recommendations
        - No UI changes, invisible intelligence
        """
        try:
            user_profile = self.user_profiles.get(user_id)
            if not user_profile:
                return await self._get_default_context(current_request)
            
            # Generate personalized context
            context = {
                "user_architectural_maturity": user_profile.architectural_maturity,
                "preferred_patterns": [p.value for p in user_profile.primary_patterns],
                "scale_preference": user_profile.scale_preference,
                "technology_stack": user_profile.technology_stack,
                "cost_sensitivity": user_profile.cost_sensitivity,
                "performance_priority": user_profile.performance_priority,
                "security_awareness": user_profile.security_awareness,
                "learning_velocity": user_profile.learning_velocity,
                "personalized_recommendations": await self._generate_personalized_recommendations(user_profile, current_request),
                "architectural_guidance_level": await self._determine_guidance_level(user_profile),
                "suggested_next_steps": await self._suggest_personalized_next_steps(user_profile, current_request)
            }
            
            return context
            
        except Exception as e:
            logger.error(f"Enhanced context generation failed: {e}")
            return await self._get_default_context(current_request)
    
    async def detect_scalability_requirements(self, messages: List[Dict]) -> Dict[str, Any]:
        """
        Detect scalability requirements from conversation
        - Analyze user's scalability mindset
        - Identify growth expectations
        - Assess performance requirements
        """
        if not messages:
            return {"scale_level": "small", "growth_indicators": []}
        
        combined_text = " ".join([msg.get("content", "") for msg in messages]).lower()
        
        scalability_indicators = {
            "high_scale": ["millions", "global", "viral", "massive", "enterprise", "scale"],
            "performance": ["fast", "performance", "optimize", "speed", "latency", "throughput"],
            "growth": ["grow", "expand", "scaling", "users", "traffic", "load"],
            "distributed": ["microservices", "distributed", "cluster", "nodes", "replicas"]
        }
        
        detected_indicators = {}
        for category, keywords in scalability_indicators.items():
            detected_indicators[category] = sum(1 for keyword in keywords if keyword in combined_text)
        
        # Determine scale level
        total_indicators = sum(detected_indicators.values())
        if total_indicators >= 8:
            scale_level = "enterprise"
        elif total_indicators >= 5:
            scale_level = "large"
        elif total_indicators >= 2:
            scale_level = "medium"
        else:
            scale_level = "small"
        
        return {
            "scale_level": scale_level,
            "growth_indicators": detected_indicators,
            "scalability_mindset": "high" if detected_indicators["high_scale"] > 2 else "moderate" if detected_indicators["growth"] > 1 else "basic"
        }
    
    async def prepare_enhanced_context(self, conversation_id: str, scalability_needs: Dict[str, Any]):
        """
        Prepare enhanced context for next responses
        - Cache intelligent context
        - Pre-compute recommendations
        - No user-facing changes
        """
        try:
            enhanced_context = {
                "conversation_id": conversation_id,
                "scalability_profile": scalability_needs,
                "pre_computed_recommendations": await self._precompute_recommendations(scalability_needs),
                "architectural_shortcuts": await self._generate_architectural_shortcuts(scalability_needs),
                "performance_benchmarks": await self._get_performance_benchmarks(scalability_needs["scale_level"]),
                "cost_estimates": await self._generate_cost_estimates(scalability_needs["scale_level"]),
                "preparation_timestamp": datetime.utcnow()
            }
            
            # Cache for immediate retrieval
            self.conversation_database[conversation_id] = enhanced_context
            
            logger.info(f"Enhanced context prepared for conversation {conversation_id}")
            
        except Exception as e:
            logger.error(f"Enhanced context preparation failed: {e}")
    
    async def _detect_conversation_patterns(self, messages: List[Dict]) -> List[ConversationPattern]:
        """Detect architectural conversation patterns"""
        if not messages:
            return []
        
        combined_text = " ".join([msg.get("content", "") for msg in messages]).lower()
        detected_patterns = []
        
        for pattern, rules in self.pattern_detection_rules.items():
            score = 0
            for keyword in rules["keywords"]:
                score += combined_text.count(keyword) * rules["weight"]
            
            if score >= rules["threshold"]:
                detected_patterns.append(pattern)
        
        return detected_patterns
    
    async def _analyze_architectural_needs(self, messages: List[Dict]) -> Dict[str, Any]:
        """Analyze architectural needs from conversation"""
        combined_text = " ".join([msg.get("content", "") for msg in messages]).lower()
        
        needs = {
            "scalability": self._assess_scalability_need(combined_text),
            "performance": self._assess_performance_need(combined_text),
            "security": self._assess_security_need(combined_text),
            "maintainability": self._assess_maintainability_need(combined_text),
            "cost_optimization": self._assess_cost_optimization_need(combined_text),
            "reliability": self._assess_reliability_need(combined_text)
        }
        
        return needs
    
    async def _extract_technology_preferences(self, messages: List[Dict]) -> List[str]:
        """Extract technology preferences from conversation"""
        combined_text = " ".join([msg.get("content", "") for msg in messages]).lower()
        
        tech_keywords = {
            "react": ["react", "jsx", "hooks"],
            "vue": ["vue", "vuejs"],
            "angular": ["angular"],
            "node": ["node", "nodejs", "express"],
            "python": ["python", "django", "flask", "fastapi"],
            "java": ["java", "spring"],
            "docker": ["docker", "container"],
            "kubernetes": ["kubernetes", "k8s"],
            "aws": ["aws", "amazon"],
            "mongodb": ["mongo", "mongodb"],
            "postgresql": ["postgres", "postgresql"],
            "redis": ["redis"],
            "microservices": ["microservice", "microservices"]
        }
        
        preferences = []
        for tech, keywords in tech_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                preferences.append(tech)
        
        return preferences
    
    async def _assess_complexity_level(self, messages: List[Dict]) -> str:
        """Assess project complexity level from conversation"""
        combined_text = " ".join([msg.get("content", "") for msg in messages]).lower()
        
        complexity_indicators = {
            "simple": ["simple", "basic", "quick", "prototype", "demo"],
            "moderate": ["business", "production", "users", "features"],
            "complex": ["enterprise", "scale", "performance", "architecture", "distributed"],
            "enterprise": ["enterprise", "compliance", "security", "global", "millions"]
        }
        
        scores = {}
        for level, keywords in complexity_indicators.items():
            scores[level] = sum(1 for keyword in keywords if keyword in combined_text)
        
        return max(scores, key=scores.get) if scores else "simple"
    
    async def _calculate_success_indicators(self, messages: List[Dict], patterns: List[ConversationPattern]) -> Dict[str, float]:
        """Calculate success indicators for the conversation"""
        return {
            "engagement_score": len(messages) / 10.0,  # Normalized engagement
            "pattern_confidence": len(patterns) / len(ConversationPattern) if patterns else 0.1,
            "architectural_depth": await self._calculate_architectural_depth(messages),
            "implementation_readiness": await self._calculate_implementation_readiness(messages)
        }
    
    async def _update_user_profile(self, user_id: str, insight: ConversationInsight):
        """Update user architectural profile based on conversation insight"""
        if user_id not in self.user_profiles:
            # Create new profile
            self.user_profiles[user_id] = UserArchitecturalProfile(
                user_id=user_id,
                primary_patterns=insight.patterns_detected,
                scale_preference=insight.architectural_needs.get("scalability", {}).get("level", "small"),
                technology_stack=insight.technology_preferences,
                architectural_maturity=await self._assess_architectural_maturity(insight),
                cost_sensitivity=insight.architectural_needs.get("cost_optimization", {}).get("level", "medium"),
                performance_priority=insight.architectural_needs.get("performance", {}).get("level", "medium"),
                security_awareness=insight.architectural_needs.get("security", {}).get("level", "standard"),
                project_complexity=insight.complexity_level,
                learning_velocity=0.5  # Default learning velocity
            )
        else:
            # Update existing profile
            profile = self.user_profiles[user_id]
            profile.primary_patterns = list(set(profile.primary_patterns + insight.patterns_detected))
            profile.technology_stack = list(set(profile.technology_stack + insight.technology_preferences))
            profile.learning_velocity = min(1.0, profile.learning_velocity + 0.1)  # Increase learning velocity
    
    async def _update_knowledge_base(self, insight: ConversationInsight):
        """Update architectural knowledge base with insights"""
        self.knowledge_base["patterns"].append({
            "patterns": [p.value for p in insight.patterns_detected],
            "complexity": insight.complexity_level,
            "technologies": insight.technology_preferences,
            "timestamp": insight.timestamp.isoformat()
        })
        
        # Keep knowledge base size manageable
        if len(self.knowledge_base["patterns"]) > 1000:
            self.knowledge_base["patterns"] = self.knowledge_base["patterns"][-500:]
    
    # Helper methods for assessment
    def _assess_scalability_need(self, text: str) -> Dict[str, Any]:
        """Assess scalability needs from text"""
        keywords = ["scale", "scaling", "users", "traffic", "load", "performance", "grow"]
        count = sum(1 for keyword in keywords if keyword in text)
        
        if count >= 4:
            level = "high"
        elif count >= 2:
            level = "medium"
        else:
            level = "low"
        
        return {"level": level, "indicators": count}
    
    def _assess_performance_need(self, text: str) -> Dict[str, Any]:
        """Assess performance needs from text"""
        keywords = ["fast", "speed", "performance", "optimize", "latency", "response", "throughput"]
        count = sum(1 for keyword in keywords if keyword in text)
        
        if count >= 3:
            level = "critical"
        elif count >= 2:
            level = "high"
        elif count >= 1:
            level = "medium"
        else:
            level = "low"
        
        return {"level": level, "indicators": count}
    
    def _assess_security_need(self, text: str) -> Dict[str, Any]:
        """Assess security needs from text"""
        keywords = ["security", "secure", "auth", "encryption", "compliance", "privacy", "vulnerability"]
        count = sum(1 for keyword in keywords if keyword in text)
        
        if count >= 3:
            level = "enterprise"
        elif count >= 2:
            level = "enhanced"
        elif count >= 1:
            level = "standard"
        else:
            level = "basic"
        
        return {"level": level, "indicators": count}
    
    def _assess_maintainability_need(self, text: str) -> Dict[str, Any]:
        """Assess maintainability needs from text"""
        keywords = ["maintain", "clean", "code quality", "refactor", "technical debt", "documentation"]
        count = sum(1 for keyword in keywords if keyword in text)
        return {"level": "high" if count >= 2 else "medium" if count >= 1 else "low", "indicators": count}
    
    def _assess_cost_optimization_need(self, text: str) -> Dict[str, Any]:
        """Assess cost optimization needs from text"""
        keywords = ["cost", "budget", "cheap", "expensive", "optimize", "efficient", "resource"]
        count = sum(1 for keyword in keywords if keyword in text)
        return {"level": "high" if count >= 2 else "medium" if count >= 1 else "low", "indicators": count}
    
    def _assess_reliability_need(self, text: str) -> Dict[str, Any]:
        """Assess reliability needs from text"""
        keywords = ["reliable", "uptime", "availability", "redundancy", "backup", "recovery", "failover"]
        count = sum(1 for keyword in keywords if keyword in text)
        return {"level": "critical" if count >= 3 else "high" if count >= 2 else "medium" if count >= 1 else "low", "indicators": count}
    
    def _initialize_pattern_rules(self) -> Dict[ConversationPattern, Dict]:
        """Initialize pattern detection rules"""
        return {
            ConversationPattern.SCALABILITY_FOCUSED: {
                "keywords": ["scale", "scaling", "performance", "load", "users", "traffic"],
                "weight": 1.5,
                "threshold": 3.0
            },
            ConversationPattern.PERFORMANCE_ORIENTED: {
                "keywords": ["fast", "speed", "optimize", "performance", "latency", "throughput"],
                "weight": 1.2,
                "threshold": 2.5
            },
            ConversationPattern.COST_CONSCIOUS: {
                "keywords": ["cost", "budget", "cheap", "optimize", "efficient", "resource"],
                "weight": 1.0,
                "threshold": 2.0
            },
            ConversationPattern.SECURITY_FIRST: {
                "keywords": ["security", "secure", "auth", "encryption", "compliance", "privacy"],
                "weight": 1.3,
                "threshold": 2.5
            },
            ConversationPattern.RAPID_PROTOTYPING: {
                "keywords": ["quick", "fast", "prototype", "mvp", "demo", "simple"],
                "weight": 1.0,
                "threshold": 2.0
            },
            ConversationPattern.ENTERPRISE_GRADE: {
                "keywords": ["enterprise", "production", "compliance", "governance", "standards"],
                "weight": 2.0,
                "threshold": 3.0
            },
            ConversationPattern.MICROSERVICES_ALIGNED: {
                "keywords": ["microservice", "distributed", "api", "service", "container", "kubernetes"],
                "weight": 1.5,
                "threshold": 3.0
            },
            ConversationPattern.MONOLITH_PREFERRED: {
                "keywords": ["simple", "monolith", "single", "unified", "straightforward"],
                "weight": 1.0,
                "threshold": 2.0
            }
        }
    
    async def _get_conversation_messages(self, conversation_id: str) -> List[Dict]:
        """Get conversation messages (placeholder - integrate with actual database)"""
        # This would integrate with your actual conversation database
        # For now, return empty list
        return []
    
    async def _get_default_context(self, current_request: str) -> Dict[str, Any]:
        """Get default context for new users"""
        return {
            "user_architectural_maturity": "intermediate",
            "preferred_patterns": ["layered"],
            "scale_preference": "medium",
            "technology_stack": [],
            "cost_sensitivity": "medium",
            "performance_priority": "medium",
            "security_awareness": "standard",
            "learning_velocity": 0.5,
            "personalized_recommendations": ["Start with solid architectural foundation"],
            "architectural_guidance_level": "enhanced",
            "suggested_next_steps": ["Define requirements clearly", "Choose appropriate tech stack"]
        }
    
    async def _generate_personalized_recommendations(self, profile: UserArchitecturalProfile, request: str) -> List[str]:
        """Generate personalized recommendations based on user profile"""
        recommendations = []
        
        if profile.architectural_maturity == "beginner":
            recommendations.extend([
                "Start with simple, well-documented patterns",
                "Focus on learning one technology stack deeply",
                "Use proven architectural patterns"
            ])
        elif profile.architectural_maturity == "expert":
            recommendations.extend([
                "Consider advanced architectural patterns",
                "Evaluate cutting-edge technologies",
                "Focus on architectural innovation and optimization"
            ])
        
        if profile.cost_sensitivity == "high":
            recommendations.append("Prioritize cost-effective solutions and resource optimization")
        
        if profile.performance_priority == "critical":
            recommendations.append("Implement comprehensive performance monitoring and optimization")
        
        return recommendations
    
    async def _determine_guidance_level(self, profile: UserArchitecturalProfile) -> str:
        """Determine appropriate guidance level for user"""
        if profile.architectural_maturity in ["beginner", "intermediate"]:
            return "detailed"
        elif profile.architectural_maturity == "advanced":
            return "enhanced"
        else:
            return "expert"
    
    async def _suggest_personalized_next_steps(self, profile: UserArchitecturalProfile, request: str) -> List[str]:
        """Suggest personalized next steps"""
        steps = []
        
        if "microservices" in profile.technology_stack and ConversationPattern.MICROSERVICES_ALIGNED in profile.primary_patterns:
            steps.append("Consider service mesh for advanced microservices management")
        
        if profile.learning_velocity > 0.8:
            steps.append("Explore advanced architectural patterns and emerging technologies")
        
        if profile.project_complexity == "enterprise":
            steps.extend([
                "Plan for compliance and governance requirements",
                "Design for multi-region deployment",
                "Implement comprehensive monitoring and observability"
            ])
        
        return steps or ["Define clear architectural requirements", "Choose appropriate technology stack"]
    
    async def _assess_architectural_maturity(self, insight: ConversationInsight) -> str:
        """Assess user's architectural maturity from conversation insight"""
        complexity = insight.complexity_level
        patterns_count = len(insight.patterns_detected)
        tech_count = len(insight.technology_preferences)
        
        score = 0
        if complexity == "enterprise":
            score += 3
        elif complexity == "complex":
            score += 2
        elif complexity == "moderate":
            score += 1
        
        score += min(patterns_count, 3)
        score += min(tech_count, 2)
        
        if score >= 7:
            return "expert"
        elif score >= 5:
            return "advanced"
        elif score >= 3:
            return "intermediate"
        else:
            return "beginner"
    
    async def _calculate_architectural_depth(self, messages: List[Dict]) -> float:
        """Calculate architectural depth of conversation"""
        architectural_keywords = [
            "architecture", "pattern", "design", "scalability", "performance",
            "security", "maintainability", "reliability", "availability"
        ]
        
        combined_text = " ".join([msg.get("content", "") for msg in messages]).lower()
        depth_score = sum(1 for keyword in architectural_keywords if keyword in combined_text)
        
        return min(1.0, depth_score / 10.0)
    
    async def _calculate_implementation_readiness(self, messages: List[Dict]) -> float:
        """Calculate implementation readiness score"""
        implementation_keywords = [
            "implement", "build", "create", "develop", "code", "deploy",
            "setup", "configure", "install", "start"
        ]
        
        combined_text = " ".join([msg.get("content", "") for msg in messages]).lower()
        readiness_score = sum(1 for keyword in implementation_keywords if keyword in combined_text)
        
        return min(1.0, readiness_score / 8.0)
    
    async def _precompute_recommendations(self, scalability_needs: Dict) -> List[str]:
        """Pre-compute architectural recommendations"""
        scale = scalability_needs.get("scale_level", "small")
        recommendations = []
        
        if scale in ["large", "enterprise"]:
            recommendations.extend([
                "Consider microservices architecture for better scalability",
                "Implement comprehensive monitoring and observability",
                "Plan for multi-region deployment",
                "Use container orchestration (Kubernetes)"
            ])
        elif scale == "medium":
            recommendations.extend([
                "Implement load balancing and auto-scaling",
                "Add database read replicas",
                "Use distributed caching",
                "Plan for horizontal scaling"
            ])
        else:
            recommendations.extend([
                "Start with monolithic architecture for simplicity",
                "Implement basic monitoring and logging",
                "Plan for vertical scaling initially",
                "Focus on code quality and maintainability"
            ])
        
        return recommendations
    
    async def _generate_architectural_shortcuts(self, scalability_needs: Dict) -> Dict[str, str]:
        """Generate architectural shortcuts based on needs"""
        scale = scalability_needs.get("scale_level", "small")
        
        if scale == "enterprise":
            return {
                "database": "Use distributed database with sharding",
                "caching": "Multi-layer caching with CDN and Redis",
                "monitoring": "Full observability stack with distributed tracing",
                "deployment": "Blue-green deployment with canary releases"
            }
        elif scale == "large":
            return {
                "database": "Master-slave replication with read replicas",
                "caching": "Redis cluster for distributed caching",
                "monitoring": "APM with custom dashboards",
                "deployment": "Rolling deployment with health checks"
            }
        else:
            return {
                "database": "Single database with proper indexing",
                "caching": "In-memory caching for frequently accessed data",
                "monitoring": "Basic application and server monitoring",
                "deployment": "Simple CI/CD pipeline"
            }
    
    async def _get_performance_benchmarks(self, scale_level: str) -> Dict[str, str]:
        """Get performance benchmarks for scale level"""
        benchmarks = {
            "small": {
                "response_time": "<500ms",
                "throughput": "100 req/sec",
                "concurrent_users": "1,000",
                "uptime": "99.5%"
            },
            "medium": {
                "response_time": "<300ms",
                "throughput": "500 req/sec",
                "concurrent_users": "5,000",
                "uptime": "99.9%"
            },
            "large": {
                "response_time": "<200ms",
                "throughput": "2,000 req/sec",
                "concurrent_users": "20,000",
                "uptime": "99.95%"
            },
            "enterprise": {
                "response_time": "<100ms",
                "throughput": "10,000 req/sec",
                "concurrent_users": "100,000",
                "uptime": "99.99%"
            }
        }
        
        return benchmarks.get(scale_level, benchmarks["small"])
    
    async def _generate_cost_estimates(self, scale_level: str) -> Dict[str, str]:
        """Generate cost estimates for scale level"""
        estimates = {
            "small": {
                "infrastructure": "$50-200/month",
                "database": "$20-50/month",
                "monitoring": "$10-30/month",
                "total": "$80-280/month"
            },
            "medium": {
                "infrastructure": "$200-800/month",
                "database": "$100-300/month",
                "monitoring": "$50-150/month",
                "total": "$350-1,250/month"
            },
            "large": {
                "infrastructure": "$1,000-5,000/month",
                "database": "$500-2,000/month",
                "monitoring": "$200-500/month",
                "total": "$1,700-7,500/month"
            },
            "enterprise": {
                "infrastructure": "$5,000-20,000/month",
                "database": "$2,000-10,000/month",
                "monitoring": "$500-2,000/month",
                "total": "$7,500-32,000/month"
            }
        }
        
        return estimates.get(scale_level, estimates["small"])