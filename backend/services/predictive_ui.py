from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
from services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

class PredictiveUIService:
    """AI-powered predictive user interface service"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.user_behavior_patterns = {}
        self.ui_predictions = {}
        self.interaction_history = {}
        
    async def initialize(self):
        """Initialize the predictive UI service"""
        try:
            await self.ai_service.initialize()
            logger.info("Predictive UI service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize predictive UI: {e}")
            raise
    
    async def predict_next_actions(
        self,
        user_id: str,
        current_context: Dict[str, Any],
        interaction_history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Predict user's next likely actions"""
        try:
            prediction_prompt = f"""
            Predict the user's next likely actions based on their behavior:
            
            Current context: {json.dumps(current_context)}
            Recent interactions: {json.dumps(interaction_history[-10:])}
            
            Analyze patterns and predict:
            - Most likely next actions
            - Probability scores
            - Suggested shortcuts or quick actions
            - UI elements to preload or highlight
            
            Return JSON:
            {{
                "predictions": [
                    {{
                        "action": "open_file",
                        "description": "User likely to open a specific file",
                        "probability": 0.85,
                        "context": {{"file_path": "/src/components/Button.jsx"}},
                        "suggested_ui": {{
                            "preload": true,
                            "highlight": false,
                            "quick_action": "Show in recent files"
                        }}
                    }},
                    {{
                        "action": "run_command",
                        "description": "User likely to run a build command",
                        "probability": 0.72,
                        "context": {{"command": "npm run build"}},
                        "suggested_ui": {{
                            "show_shortcut": true,
                            "prepare_terminal": true
                        }}
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(prediction_prompt)
            predictions_data = json.loads(response)
            
            # Store predictions for validation
            self.ui_predictions[user_id] = {
                "predictions": predictions_data["predictions"],
                "created_at": datetime.utcnow().isoformat(),
                "context": current_context
            }
            
            return predictions_data["predictions"]
            
        except Exception as e:
            logger.error(f"Failed to predict actions: {e}")
            return []
    
    async def get_adaptive_layout(
        self,
        user_id: str,
        device_info: Dict[str, Any],
        usage_patterns: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get adaptive UI layout based on user patterns"""
        try:
            layout_prompt = f"""
            Generate adaptive UI layout for this user:
            
            Device info: {json.dumps(device_info)}
            Usage patterns: {json.dumps(usage_patterns)}
            
            Optimize for:
            - User's most common actions
            - Screen size and device type
            - Accessibility preferences
            - Workflow efficiency
            
            Return JSON:
            {{
                "layout": {{
                    "primary_panel": {{
                        "type": "code_editor",
                        "width": "70%",
                        "features": ["syntax_highlighting", "autocomplete"]
                    }},
                    "secondary_panel": {{
                        "type": "file_explorer",
                        "width": "20%",
                        "position": "left"
                    }},
                    "bottom_panel": {{
                        "type": "terminal",
                        "height": "30%",
                        "auto_hide": true
                    }},
                    "floating_elements": [
                        {{
                            "type": "ai_assistant",
                            "position": "bottom-right",
                            "size": "compact"
                        }}
                    ],
                    "quick_actions": [
                        {{"action": "save", "shortcut": "Ctrl+S", "priority": 1}},
                        {{"action": "run", "shortcut": "F5", "priority": 2}}
                    ],
                    "customizations": {{
                        "theme": "dark",
                        "font_size": 14,
                        "line_height": 1.5
                    }}
                }}
            }}
            """
            
            response = await self.ai_service.process_message(layout_prompt)
            layout_data = json.loads(response)
            
            return layout_data["layout"]
            
        except Exception as e:
            logger.error(f"Failed to get adaptive layout: {e}")
            return {}
    
    async def suggest_workflow_optimizations(
        self,
        user_id: str,
        current_workflow: Dict[str, Any],
        performance_metrics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Suggest workflow optimizations based on usage analysis"""
        try:
            optimization_prompt = f"""
            Analyze workflow and suggest optimizations:
            
            Current workflow: {json.dumps(current_workflow)}
            Performance metrics: {json.dumps(performance_metrics)}
            
            Look for:
            - Repeated action patterns
            - Time-consuming sequences
            - Inefficient navigation
            - Underused features
            - Automation opportunities
            
            Return JSON:
            {{
                "optimizations": [
                    {{
                        "type": "shortcut|automation|layout|workflow",
                        "title": "Optimization title",
                        "description": "What this optimization does",
                        "current_steps": ["Step 1", "Step 2", "Step 3"],
                        "optimized_steps": ["Optimized step 1", "Optimized step 2"],
                        "time_saved": "30 seconds per action",
                        "implementation": "How to implement this optimization",
                        "impact_score": 8.5
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(optimization_prompt)
            optimizations_data = json.loads(response)
            
            return optimizations_data.get("optimizations", [])
            
        except Exception as e:
            logger.error(f"Failed to suggest optimizations: {e}")
            return []
    
    async def get_contextual_suggestions(
        self,
        user_id: str,
        current_state: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get contextual UI suggestions based on current state"""
        try:
            context_prompt = f"""
            Provide contextual UI suggestions for current state:
            
            Current state: {json.dumps(current_state)}
            
            Suggest:
            - Relevant tools and features
            - Contextual help and tips
            - Related actions
            - Smart shortcuts
            
            Return JSON:
            {{
                "suggestions": [
                    {{
                        "type": "tool|tip|action|shortcut",
                        "title": "Suggestion title",
                        "description": "Why this is relevant now",
                        "action": "What happens when user accepts",
                        "priority": "high|medium|low",
                        "dismissible": true,
                        "learn_more_url": "Optional URL for more info"
                    }}
                ]
            }}
            """
            
            response = await self.ai_service.process_message(context_prompt)
            suggestions_data = json.loads(response)
            
            return suggestions_data.get("suggestions", [])
            
        except Exception as e:
            logger.error(f"Failed to get contextual suggestions: {e}")
            return []
    
    async def predict_content_needs(
        self,
        user_id: str,
        project_context: Dict[str, Any],
        upcoming_tasks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Predict what content/files user will need next"""
        try:
            content_prompt = f"""
            Predict content needs for upcoming work:
            
            Project context: {json.dumps(project_context)}
            Upcoming tasks: {json.dumps(upcoming_tasks)}
            
            Predict:
            - Files likely to be opened
            - Resources to preload
            - Tools to prepare
            - Dependencies to check
            
            Return JSON:
            {{
                "content_predictions": {{
                    "files_to_preload": [
                        {{"path": "/src/components/Header.jsx", "probability": 0.9}},
                        {{"path": "/src/styles/main.css", "probability": 0.7}}
                    ],
                    "resources_to_cache": [
                        {{"type": "api_docs", "url": "...", "relevance": "high"}},
                        {{"type": "library_docs", "library": "react", "relevance": "medium"}}
                    ],
                    "tools_to_prepare": [
                        {{"tool": "debugger", "reason": "Complex bug fix task"}},
                        {{"tool": "performance_profiler", "reason": "Optimization task"}}
                    ],
                    "suggested_workspace": {{
                        "layout": "debug_layout",
                        "panels": ["code", "console", "network"],
                        "theme": "high_contrast"
                    }}
                }}
            }}
            """
            
            response = await self.ai_service.process_message(content_prompt)
            predictions_data = json.loads(response)
            
            return predictions_data.get("content_predictions", {})
            
        except Exception as e:
            logger.error(f"Failed to predict content needs: {e}")
            return {}
    
    async def analyze_user_efficiency(
        self,
        user_id: str,
        time_period: str = "7d"
    ) -> Dict[str, Any]:
        """Analyze user's efficiency patterns and suggest improvements"""
        try:
            # Get user interaction history
            user_history = self.interaction_history.get(user_id, [])
            
            efficiency_prompt = f"""
            Analyze user efficiency patterns:
            
            Interaction history: {json.dumps(user_history[-100:])}  # Last 100 interactions
            Time period: {time_period}
            
            Analyze:
            - Most common action sequences
            - Time spent on different tasks
            - Navigation patterns
            - Tool usage efficiency
            - Areas for improvement
            
            Return JSON:
            {{
                "efficiency_analysis": {{
                    "overall_score": 7.5,
                    "strengths": [
                        "Fast keyboard navigation",
                        "Efficient use of shortcuts"
                    ],
                    "improvement_areas": [
                        "Could use more automation",
                        "Repetitive manual tasks"
                    ],
                    "time_breakdown": {{
                        "coding": 60,
                        "debugging": 25,
                        "navigation": 10,
                        "other": 5
                    }},
                    "productivity_trends": {{
                        "most_productive_hours": ["9-11 AM", "2-4 PM"],
                        "efficiency_by_day": {{
                            "monday": 8.2,
                            "tuesday": 7.8,
                            "wednesday": 8.5
                        }}
                    }},
                    "recommendations": [
                        {{
                            "category": "automation",
                            "suggestion": "Set up code snippets for common patterns",
                            "potential_time_saved": "15 minutes/day"
                        }}
                    ]
                }}
            }}
            """
            
            response = await self.ai_service.process_message(efficiency_prompt)
            analysis_data = json.loads(response)
            
            return analysis_data.get("efficiency_analysis", {})
            
        except Exception as e:
            logger.error(f"Failed to analyze efficiency: {e}")
            return {}
    
    async def record_interaction(
        self,
        user_id: str,
        interaction_data: Dict[str, Any]
    ):
        """Record user interaction for learning and prediction"""
        if user_id not in self.interaction_history:
            self.interaction_history[user_id] = []
        
        interaction_record = {
            **interaction_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.interaction_history[user_id].append(interaction_record)
        
        # Keep only last 1000 interactions per user
        if len(self.interaction_history[user_id]) > 1000:
            self.interaction_history[user_id] = self.interaction_history[user_id][-1000:]
        
        logger.info(f"Recorded interaction for user {user_id}: {interaction_data.get('action', 'unknown')}")
    
    async def validate_predictions(
        self,
        user_id: str,
        actual_action: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate previous predictions against actual user actions"""
        user_predictions = self.ui_predictions.get(user_id, {})
        
        if not user_predictions:
            return {"validation": "no_predictions"}
        
        predictions = user_predictions.get("predictions", [])
        actual_action_type = actual_action.get("action")
        
        # Check if any prediction matched
        matched_prediction = None
        for prediction in predictions:
            if prediction["action"] == actual_action_type:
                matched_prediction = prediction
                break
        
        validation_result = {
            "prediction_matched": matched_prediction is not None,
            "matched_prediction": matched_prediction,
            "actual_action": actual_action,
            "accuracy_score": matched_prediction["probability"] if matched_prediction else 0
        }
        
        logger.info(f"Validated prediction for user {user_id}: {'Match' if matched_prediction else 'No match'}")
        
        return validation_result
    
    async def get_smart_defaults(
        self,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get smart default values based on user patterns"""
        try:
            defaults_prompt = f"""
            Generate smart defaults for this context:
            
            Context: {json.dumps(context)}
            User patterns: {json.dumps(self.user_behavior_patterns.get(user_id, {}))}
            
            Provide intelligent defaults for:
            - Form fields
            - Configuration options
            - File names and paths
            - Project settings
            
            Return JSON:
            {{
                "smart_defaults": {{
                    "form_fields": {{
                        "project_name": "my-react-app",
                        "author": "user@example.com",
                        "license": "MIT"
                    }},
                    "settings": {{
                        "theme": "dark",
                        "font_size": 14,
                        "auto_save": true
                    }},
                    "file_suggestions": {{
                        "component_name": "MyComponent",
                        "test_file": "MyComponent.test.js"
                    }}
                }}
            }}
            """
            
            response = await self.ai_service.process_message(defaults_prompt)
            defaults_data = json.loads(response)
            
            return defaults_data.get("smart_defaults", {})
            
        except Exception as e:
            logger.error(f"Failed to get smart defaults: {e}")
            return {}