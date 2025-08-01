from typing import List, Dict, Any, Optional
import json
from datetime import datetime
from services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

class SmartTemplateGeneration:
    """AI-powered project template generation and management"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.template_analytics = {}
        self.user_preferences = {}
        
    async def initialize(self):
        """Initialize the template generation service"""
        try:
            await self.ai_service.initialize()
            logger.info("Smart Template Generation service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize template generation: {e}")
            raise
    
    async def generate_template_from_project(
        self,
        project_data: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """Generate a reusable template from an existing project"""
        try:
            template_prompt = f"""
            Create a reusable project template from this successful project:
            
            Project data: {json.dumps(project_data, indent=2)[:3000]}
            
            Extract:
            - Common patterns and structures
            - Reusable components and utilities
            - Best practices demonstrated
            - Configuration patterns
            - Dependencies and setup
            
            Return JSON template:
            {{
                "template": {{
                    "name": "Template Name",
                    "description": "What this template provides",
                    "category": "frontend|backend|fullstack|mobile",
                    "tags": ["react", "typescript", "tailwind"],
                    "difficulty": "beginner|intermediate|advanced",
                    "estimated_setup_time": "15 minutes",
                    "structure": {{
                        "folders": [
                            {{"name": "src", "description": "Source code"}},
                            {{"name": "components", "description": "Reusable components"}}
                        ],
                        "files": [
                            {{
                                "path": "src/App.jsx",
                                "template_content": "// Template file content",
                                "description": "Main application component"
                            }}
                        ]
                    }},
                    "dependencies": {{
                        "required": ["react", "react-dom"],
                        "optional": ["axios", "react-router-dom"],
                        "dev": ["vite", "eslint"]
                    }},
                    "setup_instructions": [
                        "npm install",
                        "npm run dev"
                    ],
                    "customization_points": [
                        {{
                            "name": "Theme Colors",
                            "description": "Customize the color scheme",
                            "file": "src/styles/theme.js",
                            "options": ["default", "dark", "colorful"]
                        }}
                    ],
                    "features": [
                        "Responsive design",
                        "Dark mode support",
                        "Component library"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(template_prompt)
            template_data = json.loads(response)
            
            # Add metadata
            template = template_data["template"]
            template["id"] = f"template_{datetime.utcnow().timestamp()}"
            template["created_by"] = user_id
            template["created_at"] = datetime.utcnow().isoformat()
            template["usage_count"] = 0
            template["rating"] = 0
            
            return template
            
        except Exception as e:
            logger.error(f"Failed to generate template: {e}")
            return {}
    
    async def suggest_template_improvements(
        self,
        template_id: str,
        usage_analytics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Suggest improvements for existing templates based on usage"""
        try:
            improvement_prompt = f"""
            Suggest improvements for this template based on usage analytics:
            
            Template ID: {template_id}
            Analytics: {json.dumps(usage_analytics)}
            
            Analyze:
            - User feedback and ratings
            - Common customizations made
            - Frequently added dependencies
            - Setup time vs expected time
            - Error patterns during setup
            
            Return JSON:
            {{
                "improvements": [
                    {{
                        "category": "structure|dependencies|documentation|features",
                        "title": "Improvement title",
                        "description": "What to improve and why",
                        "priority": "high|medium|low",
                        "effort": "low|medium|high",
                        "impact": "Positive impact description",
                        "implementation": "How to implement this change"
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(improvement_prompt)
            improvements_data = json.loads(response)
            
            return improvements_data.get("improvements", [])
            
        except Exception as e:
            logger.error(f"Failed to suggest improvements: {e}")
            return []
    
    async def create_custom_template(
        self,
        requirements: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """Create a custom template based on specific requirements"""
        try:
            custom_prompt = f"""
            Create a custom project template based on these requirements:
            
            Requirements: {json.dumps(requirements)}
            
            Include:
            - Complete project structure
            - All necessary configuration files
            - Starter code for main components
            - Proper dependency management
            - Development and build scripts
            - Documentation and README
            
            Return comprehensive template JSON:
            {{
                "template": {{
                    "name": "Custom Template Name",
                    "description": "Detailed description",
                    "category": "category",
                    "files": [
                        {{
                            "path": "package.json",
                            "content": "{{...package.json content...}}",
                            "description": "Project dependencies and scripts"
                        }},
                        {{
                            "path": "src/main.js",
                            "content": "// Main application entry point\\n...",
                            "description": "Application entry point"
                        }}
                    ],
                    "folders": [
                        {{"name": "src", "description": "Source code"}},
                        {{"name": "public", "description": "Static assets"}}
                    ],
                    "variables": [
                        {{
                            "name": "PROJECT_NAME",
                            "description": "Name of the project",
                            "default": "my-app",
                            "type": "string"
                        }}
                    ],
                    "post_generation_steps": [
                        "npm install",
                        "Initialize git repository",
                        "Run initial build"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(custom_prompt)
            template_data = json.loads(response)
            
            template = template_data["template"]
            template["id"] = f"custom_{datetime.utcnow().timestamp()}"
            template["created_by"] = user_id
            template["created_at"] = datetime.utcnow().isoformat()
            template["type"] = "custom"
            
            return template
            
        except Exception as e:
            logger.error(f"Failed to create custom template: {e}")
            return {}
    
    async def get_template_recommendations(
        self,
        project_context: Dict[str, Any],
        user_history: List[Dict[str, Any]],
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Get personalized template recommendations"""
        try:
            recommendation_prompt = f"""
            Recommend templates for this user based on their context:
            
            Current project context: {json.dumps(project_context)}
            User's project history: {json.dumps(user_history[-5:])}  # Last 5 projects
            
            Consider:
            - Technologies they've used before
            - Project types they prefer
            - Complexity level they work at
            - Recent trends in their work
            
            Return JSON:
            {{
                "recommendations": [
                    {{
                        "template_id": "template_123",
                        "name": "Template Name",
                        "match_score": 0.95,
                        "reasons": [
                            "Matches your React experience",
                            "Similar project structure to your recent work"
                        ],
                        "benefits": [
                            "Save 2-3 hours of setup time",
                            "Includes best practices you've used before"
                        ],
                        "customization_suggestions": [
                            "Add your preferred state management",
                            "Include your testing setup"
                        ]
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(recommendation_prompt)
            recommendations_data = json.loads(response)
            
            return recommendations_data.get("recommendations", [])
            
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            return []
    
    async def analyze_template_usage(
        self,
        template_id: str,
        time_period: str = "30d"
    ) -> Dict[str, Any]:
        """Analyze template usage patterns and success metrics"""
        try:
            # Get usage data (would come from database)
            usage_data = self.template_analytics.get(template_id, {})
            
            analysis_prompt = f"""
            Analyze this template's usage and performance:
            
            Template ID: {template_id}
            Usage data: {json.dumps(usage_data)}
            Time period: {time_period}
            
            Provide analysis on:
            - Usage trends and popularity
            - Success rate (completed projects)
            - Common customizations
            - User feedback patterns
            - Performance metrics
            
            Return JSON:
            {{
                "analysis": {{
                    "usage_trend": "increasing|stable|decreasing",
                    "popularity_score": 8.5,
                    "success_rate": 0.85,
                    "completion_rate": 0.92,
                    "average_setup_time": "18 minutes",
                    "user_satisfaction": 4.3,
                    "common_modifications": [
                        "Added authentication",
                        "Changed styling framework"
                    ],
                    "strengths": [
                        "Clear documentation",
                        "Modern dependencies"
                    ],
                    "improvement_areas": [
                        "More customization options",
                        "Better error handling"
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(analysis_prompt)
            analysis_data = json.loads(response)
            
            return analysis_data.get("analysis", {})
            
        except Exception as e:
            logger.error(f"Failed to analyze template usage: {e}")
            return {}
    
    async def generate_template_variations(
        self,
        base_template_id: str,
        variation_types: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate variations of existing templates"""
        try:
            # Get base template (would come from database)
            base_template = {}  # Placeholder
            
            variation_prompt = f"""
            Create variations of this base template:
            
            Base template: {json.dumps(base_template)}
            Requested variations: {json.dumps(variation_types)}
            
            For each variation type, create:
            - Modified structure and dependencies
            - Different configuration options
            - Alternative implementations
            - Specialized features
            
            Return JSON:
            {{
                "variations": [
                    {{
                        "name": "Variation Name",
                        "type": "typescript|minimal|advanced|mobile",
                        "description": "What makes this variation different",
                        "changes": [
                            "Added TypeScript support",
                            "Included advanced routing"
                        ],
                        "additional_dependencies": ["typescript", "@types/node"],
                        "modified_files": [
                            {{
                                "path": "tsconfig.json",
                                "content": "TypeScript configuration"
                            }}
                        ],
                        "setup_differences": [
                            "Run 'npm install --save-dev typescript'",
                            "Rename .js files to .ts"
                        ]
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(variation_prompt)
            variations_data = json.loads(response)
            
            return variations_data.get("variations", [])
            
        except Exception as e:
            logger.error(f"Failed to generate variations: {e}")
            return []
    
    async def update_template_analytics(
        self,
        template_id: str,
        event_type: str,
        event_data: Dict[str, Any]
    ):
        """Update template usage analytics"""
        if template_id not in self.template_analytics:
            self.template_analytics[template_id] = {
                "total_uses": 0,
                "successful_setups": 0,
                "average_setup_time": 0,
                "user_ratings": [],
                "common_customizations": {}
            }
        
        analytics = self.template_analytics[template_id]
        
        if event_type == "template_used":
            analytics["total_uses"] += 1
        elif event_type == "setup_completed":
            analytics["successful_setups"] += 1
            if "setup_time" in event_data:
                # Update average setup time
                current_avg = analytics["average_setup_time"]
                new_time = event_data["setup_time"]
                analytics["average_setup_time"] = (current_avg + new_time) / 2
        elif event_type == "user_rating":
            analytics["user_ratings"].append(event_data["rating"])
        elif event_type == "customization":
            customization = event_data["customization"]
            if customization not in analytics["common_customizations"]:
                analytics["common_customizations"][customization] = 0
            analytics["common_customizations"][customization] += 1
        
        logger.info(f"Updated analytics for template {template_id}: {event_type}")