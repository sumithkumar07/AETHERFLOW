from typing import List, Dict, Any, Optional
import json
from datetime import datetime
from services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

class EnhancedIntegrationsService:
    """AI-powered integration recommendations and management"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.integration_analytics = {}
        self.user_preferences = {}
        self.compatibility_matrix = {}
        
    async def initialize(self):
        """Initialize the enhanced integrations service"""
        try:
            await self.ai_service.initialize()
            await self._load_integration_data()
            logger.info("Enhanced Integrations service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize enhanced integrations: {e}")
            raise
    
    async def get_smart_recommendations(
        self,
        project_context: Dict[str, Any],
        user_id: str,
        project_stage: str = "development"
    ) -> List[Dict[str, Any]]:
        """Get AI-powered integration recommendations"""
        try:
            recommendation_prompt = f"""
            Recommend integrations for this project:
            
            Project context: {json.dumps(project_context)}
            Project stage: {project_stage}
            
            Consider:
            - Technology stack compatibility
            - Project requirements and goals
            - Development stage needs
            - Security and performance implications
            - Cost-effectiveness
            - Ease of implementation
            
            Return JSON:
            {{
                "recommendations": [
                    {{
                        "integration_name": "Stripe",
                        "category": "payment",
                        "relevance_score": 0.95,
                        "implementation_difficulty": "medium",
                        "benefits": [
                            "Secure payment processing",
                            "Global payment support",
                            "Strong developer tools"
                        ],
                        "use_cases": [
                            "E-commerce checkout",
                            "Subscription billing",
                            "Marketplace payments"
                        ],
                        "setup_time": "2-4 hours",
                        "monthly_cost": "$0-29/month",
                        "compatibility": {{
                            "frontend": ["React", "Vue", "Angular"],
                            "backend": ["Node.js", "Python", "PHP"]
                        }},
                        "alternatives": [
                            {{"name": "PayPal", "reason": "Simpler setup, less features"}},
                            {{"name": "Square", "reason": "Better for physical stores"}}
                        ],
                        "getting_started": {{
                            "documentation_url": "https://stripe.com/docs",
                            "tutorial_difficulty": "intermediate",
                            "key_features": ["Payment intents", "Webhooks", "Dashboard"]
                        }}
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(recommendation_prompt)
            recommendations_data = json.loads(response)
            
            # Enhance with user-specific data
            enhanced_recommendations = await self._enhance_recommendations_with_user_data(
                recommendations_data["recommendations"], user_id, project_context
            )
            
            return enhanced_recommendations
            
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            return []
    
    async def analyze_integration_compatibility(
        self,
        integration_name: str,
        project_stack: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze compatibility between integration and project stack"""
        try:
            compatibility_prompt = f"""
            Analyze compatibility between {integration_name} and this tech stack:
            
            Project stack: {json.dumps(project_stack)}
            Integration: {integration_name}
            
            Evaluate:
            - Direct SDK/library support
            - API compatibility
            - Version requirements
            - Potential conflicts
            - Performance implications
            - Security considerations
            
            Return JSON:
            {{
                "compatibility_analysis": {{
                    "overall_score": 0.9,
                    "compatibility_level": "excellent|good|fair|poor",
                    "supported_platforms": ["React", "Node.js"],
                    "version_requirements": {{
                        "node": ">=14.0.0",
                        "react": ">=16.8.0"
                    }},
                    "potential_issues": [
                        {{
                            "issue": "Version conflict with existing library",
                            "severity": "medium",
                            "solution": "Update to compatible version"
                        }}
                    ],
                    "setup_complexity": "low|medium|high",
                    "dependencies": [
                        {{"name": "@stripe/stripe-js", "version": "^1.54.0", "required": true}}
                    ],
                    "configuration_steps": [
                        "Install npm package",
                        "Set up API keys",
                        "Configure webhooks"
                    ],
                    "performance_impact": {{
                        "bundle_size_increase": "45KB",
                        "runtime_overhead": "minimal",
                        "network_requests": "API calls only"
                    }}
                }}
            }}
            """
            
            response = await self.ai_service.process_message(compatibility_prompt)
            analysis_data = json.loads(response)
            
            return analysis_data.get("compatibility_analysis", {})
            
        except Exception as e:
            logger.error(f"Failed to analyze compatibility: {e}")
            return {}
    
    async def get_integration_alternatives(
        self,
        current_integration: str,
        requirements: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get alternative integrations based on requirements"""
        try:
            alternatives_prompt = f"""
            Find alternatives to {current_integration} based on these requirements:
            
            Current integration: {current_integration}
            Requirements: {json.dumps(requirements)}
            
            Consider:
            - Similar functionality
            - Different pricing models
            - Various complexity levels
            - Different feature sets
            - Regional availability
            
            Return JSON:
            {{
                "alternatives": [
                    {{
                        "name": "Alternative Name",
                        "category": "same|similar|different",
                        "advantages": [
                            "Lower cost",
                            "Easier setup"
                        ],
                        "disadvantages": [
                            "Fewer features",
                            "Less documentation"
                        ],
                        "comparison": {{
                            "cost": "cheaper|similar|expensive",
                            "features": "fewer|similar|more",
                            "complexity": "simpler|similar|complex",
                            "documentation": "poor|good|excellent"
                        }},
                        "migration_effort": "low|medium|high",
                        "use_case_fit": 0.85
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(alternatives_prompt)
            alternatives_data = json.loads(response)
            
            return alternatives_data.get("alternatives", [])
            
        except Exception as e:
            logger.error(f"Failed to get alternatives: {e}")
            return []
    
    async def generate_integration_guide(
        self,
        integration_name: str,
        project_context: Dict[str, Any],
        user_level: str = "intermediate"
    ) -> Dict[str, Any]:
        """Generate step-by-step integration guide"""
        try:
            guide_prompt = f"""
            Create a comprehensive integration guide for {integration_name}:
            
            Project context: {json.dumps(project_context)}
            User level: {user_level}
            
            Create detailed guide with:
            - Prerequisites and requirements
            - Step-by-step setup instructions
            - Code examples specific to their stack
            - Configuration options
            - Testing procedures
            - Troubleshooting tips
            - Best practices
            
            Return JSON:
            {{
                "integration_guide": {{
                    "title": "Integrating {integration_name} with React App",
                    "difficulty": "beginner|intermediate|advanced",
                    "estimated_time": "2 hours",
                    "prerequisites": [
                        "Node.js installed",
                        "React project setup",
                        "API keys from provider"
                    ],
                    "steps": [
                        {{
                            "step_number": 1,
                            "title": "Install Dependencies",
                            "description": "Install required packages",
                            "code": "npm install @stripe/stripe-js",
                            "explanation": "This installs the official Stripe SDK",
                            "common_issues": [
                                "Version conflicts with existing packages"
                            ]
                        }}
                    ],
                    "configuration": {{
                        "environment_variables": [
                            {{"name": "STRIPE_PUBLIC_KEY", "description": "Your publishable key"}}
                        ],
                        "config_files": [
                            {{
                                "file": "stripe.config.js",
                                "content": "// Configuration code here"
                            }}
                        ]
                    }},
                    "examples": [
                        {{
                            "title": "Basic Payment Form",
                            "code": "// React component code",
                            "description": "Simple payment form implementation"
                        }}
                    ],
                    "testing": {{
                        "test_mode": "Use test API keys",
                        "test_cards": ["4242424242424242"],
                        "verification_steps": [
                            "Test successful payment",
                            "Test failed payment",
                            "Verify webhook handling"
                        ]
                    }},
                    "troubleshooting": [
                        {{
                            "problem": "API key not working",
                            "solution": "Check if using correct environment keys",
                            "resources": ["Link to documentation"]
                        }}
                    ],
                    "best_practices": [
                        "Never expose secret keys in frontend",
                        "Always validate on server side",
                        "Implement proper error handling"
                    ],
                    "next_steps": [
                        "Set up webhooks for payment confirmation",
                        "Implement subscription billing",
                        "Add analytics and reporting"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(guide_prompt)
            guide_data = json.loads(response)
            
            return guide_data.get("integration_guide", {})
            
        except Exception as e:
            logger.error(f"Failed to generate guide: {e}")
            return {}
    
    async def predict_integration_success(
        self,
        integration_name: str,
        project_data: Dict[str, Any],
        team_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Predict likelihood of successful integration"""
        try:
            prediction_prompt = f"""
            Predict success likelihood for this integration:
            
            Integration: {integration_name}
            Project: {json.dumps(project_data)}
            Team: {json.dumps(team_data)}
            
            Analyze:
            - Team's technical expertise
            - Project complexity vs integration complexity
            - Available time and resources
            - Similar past integrations
            - Potential roadblocks
            
            Return JSON:
            {{
                "success_prediction": {{
                    "success_probability": 0.85,
                    "confidence_level": "high|medium|low",
                    "risk_factors": [
                        {{
                            "factor": "Limited team experience with payments",
                            "impact": "medium",
                            "mitigation": "Allocate extra learning time"
                        }}
                    ],
                    "success_factors": [
                        "Good documentation available",
                        "Strong community support",
                        "Team has React experience"
                    ],
                    "timeline_prediction": {{
                        "optimistic": "1 week",
                        "realistic": "2 weeks",
                        "pessimistic": "1 month"
                    }},
                    "resource_requirements": {{
                        "developer_hours": "20-40 hours",
                        "learning_curve": "moderate",
                        "ongoing_maintenance": "2-4 hours/month"
                    }},
                    "recommendations": [
                        "Start with basic implementation",
                        "Plan for thorough testing phase",
                        "Consider bringing in expert consultant"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(prediction_prompt)
            prediction_data = json.loads(response)
            
            return prediction_data.get("success_prediction", {})
            
        except Exception as e:
            logger.error(f"Failed to predict success: {e}")
            return {}
    
    async def get_integration_trends(
        self,
        category: str = "all",
        time_period: str = "6m"
    ) -> Dict[str, Any]:
        """Get trending integrations and market insights"""
        try:
            trends_prompt = f"""
            Provide integration trends and insights:
            
            Category: {category}
            Time period: {time_period}
            
            Analyze:
            - Popular integrations in this category
            - Emerging technologies and services
            - Market shifts and user preferences
            - Adoption rates and growth trends
            
            Return JSON:
            {{
                "trends": {{
                    "trending_integrations": [
                        {{
                            "name": "Supabase",
                            "category": "backend_as_a_service",
                            "growth_rate": "+150%",
                            "popularity_score": 8.5,
                            "key_features": ["Real-time subscriptions", "Built-in auth"],
                            "why_trending": "Great alternative to Firebase with SQL support"
                        }}
                    ],
                    "declining_integrations": [
                        {{
                            "name": "Legacy Service",
                            "reason": "Superseded by newer alternatives",
                            "alternatives": ["Modern Service A", "Modern Service B"]
                        }}
                    ],
                    "emerging_categories": [
                        {{
                            "category": "AI/ML APIs",
                            "description": "Growing demand for AI integration",
                            "examples": ["OpenAI", "Anthropic", "Replicate"]
                        }}
                    ],
                    "market_insights": [
                        "Developers prefer all-in-one solutions",
                        "Security and privacy concerns driving choices",
                        "Cost optimization becoming more important"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(trends_prompt)
            trends_data = json.loads(response)
            
            return trends_data.get("trends", {})
            
        except Exception as e:
            logger.error(f"Failed to get trends: {e}")
            return {}
    
    async def _enhance_recommendations_with_user_data(
        self,
        recommendations: List[Dict[str, Any]],
        user_id: str,
        project_context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Enhance recommendations with user-specific data"""
        enhanced_recommendations = []
        
        for rec in recommendations:
            # Add user preference score
            user_prefs = self.user_preferences.get(user_id, {})
            preference_score = self._calculate_preference_score(rec, user_prefs)
            
            # Add past experience indicator
            past_experience = self._check_user_experience(user_id, rec["integration_name"])
            
            enhanced_rec = {
                **rec,
                "user_preference_score": preference_score,
                "user_experience": past_experience,
                "personalized_benefits": self._get_personalized_benefits(rec, project_context),
                "custom_setup_time": self._adjust_setup_time(rec, past_experience),
            }
            
            enhanced_recommendations.append(enhanced_rec)
        
        # Sort by combined relevance and preference score
        enhanced_recommendations.sort(
            key=lambda x: (x["relevance_score"] + x["user_preference_score"]) / 2,
            reverse=True
        )
        
        return enhanced_recommendations
    
    def _calculate_preference_score(
        self,
        recommendation: Dict[str, Any],
        user_prefs: Dict[str, Any]
    ) -> float:
        """Calculate user preference score for recommendation"""
        score = 0.5  # Base score
        
        # Adjust based on user preferences
        if user_prefs.get("prefers_simple_setup") and recommendation.get("implementation_difficulty") == "easy":
            score += 0.2
        
        if user_prefs.get("cost_conscious") and "free" in recommendation.get("monthly_cost", "").lower():
            score += 0.2
        
        return min(score, 1.0)
    
    def _check_user_experience(self, user_id: str, integration_name: str) -> Dict[str, Any]:
        """Check if user has experience with this integration"""
        # This would typically query a database
        return {
            "has_used_before": False,
            "similar_integrations": [],
            "experience_level": "none"
        }
    
    def _get_personalized_benefits(
        self,
        recommendation: Dict[str, Any],
        project_context: Dict[str, Any]
    ) -> List[str]:
        """Get personalized benefits based on project context"""
        benefits = recommendation.get("benefits", [])
        
        # Add context-specific benefits
        if project_context.get("type") == "ecommerce":
            benefits.append("Perfect fit for e-commerce projects")
        
        return benefits
    
    def _adjust_setup_time(
        self,
        recommendation: Dict[str, Any],
        experience: Dict[str, Any]
    ) -> str:
        """Adjust setup time based on user experience"""
        base_time = recommendation.get("setup_time", "2-4 hours")
        
        if experience.get("has_used_before"):
            return "1-2 hours (you have experience)"
        elif experience.get("experience_level") == "expert":
            return "30 minutes - 1 hour (expert level)"
        
        return base_time
    
    async def _load_integration_data(self):
        """Load integration compatibility and analytics data"""
        # This would typically load from database
        self.compatibility_matrix = {
            "stripe": {
                "react": "excellent",
                "vue": "good",
                "angular": "good",
                "node": "excellent"
            }
        }
        
        logger.info("Integration data loaded")