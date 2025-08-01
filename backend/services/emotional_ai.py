from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime, timedelta
import math

class EmotionalAI:
    """AI service that adapts to user mood and energy levels"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.user_emotional_profiles = {}
        self.mood_patterns = {}
        self.intervention_strategies = {}
    
    async def initialize(self):
        """Initialize the emotional AI service"""
        try:
            await self._load_emotional_models()
            await self._initialize_mood_detection()
            await self._load_intervention_strategies()
            return True
        except Exception as e:
            print(f"Emotional AI initialization error: {e}")
            return False
    
    async def analyze_emotional_state(self, user_id: str, behavioral_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user's current emotional state from behavioral indicators"""
        try:
            analysis = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "emotional_state": {},
                "mood_indicators": {},
                "energy_level": 0.0,
                "stress_level": 0.0,
                "focus_capacity": 0.0,
                "recommended_adjustments": [],
                "confidence_score": 0.0
            }
            
            # Analyze typing patterns for emotional indicators
            typing_analysis = await self._analyze_typing_patterns(behavioral_data.get("typing_data", {}))
            
            # Analyze interaction patterns
            interaction_analysis = await self._analyze_interaction_patterns(behavioral_data.get("interactions", []))
            
            # Analyze work patterns
            work_analysis = await self._analyze_work_patterns(behavioral_data.get("work_sessions", []))
            
            # Combine indicators to determine emotional state
            analysis["emotional_state"] = await self._determine_emotional_state(
                typing_analysis, interaction_analysis, work_analysis
            )
            
            # Calculate specific metrics
            analysis["energy_level"] = await self._calculate_energy_level(behavioral_data)
            analysis["stress_level"] = await self._calculate_stress_level(behavioral_data)
            analysis["focus_capacity"] = await self._calculate_focus_capacity(behavioral_data)
            
            # Generate recommendations
            analysis["recommended_adjustments"] = await self._generate_recommendations(analysis)
            
            # Calculate confidence in analysis
            analysis["confidence_score"] = await self._calculate_confidence(analysis, behavioral_data)
            
            # Update user's emotional profile
            await self._update_emotional_profile(user_id, analysis)
            
            return analysis
        except Exception as e:
            return {"error": str(e), "user_id": user_id}
    
    async def provide_adaptive_feedback(self, user_id: str, current_task: str, emotional_state: Dict[str, Any]) -> Dict[str, Any]:
        """Provide contextual feedback based on emotional state"""
        try:
            feedback = {
                "user_id": user_id,
                "task_context": current_task,
                "timestamp": datetime.utcnow().isoformat(),
                "communication_style": {},
                "motivation_messages": [],
                "break_suggestions": [],
                "environment_adjustments": [],
                "workflow_modifications": []
            }
            
            # Adapt communication style based on mood
            feedback["communication_style"] = await self._adapt_communication_style(emotional_state)
            
            # Generate appropriate motivation messages
            feedback["motivation_messages"] = await self._generate_motivation_messages(
                emotional_state, current_task
            )
            
            # Suggest breaks if needed
            if emotional_state.get("stress_level", 0) > 0.7:
                feedback["break_suggestions"] = await self._suggest_stress_relief_breaks(emotional_state)
            elif emotional_state.get("energy_level", 0) < 0.3:
                feedback["break_suggestions"] = await self._suggest_energy_boosting_breaks(emotional_state)
            
            # Recommend environment adjustments
            feedback["environment_adjustments"] = await self._recommend_environment_adjustments(emotional_state)
            
            # Suggest workflow modifications
            feedback["workflow_modifications"] = await self._suggest_workflow_modifications(
                emotional_state, current_task
            )
            
            return feedback
        except Exception as e:
            return {"error": str(e)}
    
    async def detect_burnout_patterns(self, user_id: str, activity_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect patterns that might indicate burnout or excessive stress"""
        try:
            detection = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "burnout_risk": "low",
                "warning_signals": [],
                "trend_analysis": {},
                "intervention_recommendations": [],
                "recovery_suggestions": []
            }
            
            # Analyze work intensity trends
            intensity_trends = await self._analyze_intensity_trends(activity_history)
            detection["trend_analysis"]["intensity"] = intensity_trends
            
            # Analyze break patterns
            break_patterns = await self._analyze_break_patterns(activity_history)
            detection["trend_analysis"]["breaks"] = break_patterns
            
            # Analyze emotional stability
            emotional_trends = await self._analyze_emotional_trends(activity_history)
            detection["trend_analysis"]["emotional"] = emotional_trends
            
            # Detect warning signals
            detection["warning_signals"] = await self._identify_warning_signals(
                intensity_trends, break_patterns, emotional_trends
            )
            
            # Assess overall burnout risk
            detection["burnout_risk"] = await self._assess_burnout_risk(detection["warning_signals"])
            
            # Generate intervention recommendations
            if detection["burnout_risk"] in ["medium", "high"]:
                detection["intervention_recommendations"] = await self._generate_burnout_interventions(
                    detection["burnout_risk"], detection["warning_signals"]
                )
            
            # Suggest recovery strategies
            detection["recovery_suggestions"] = await self._suggest_recovery_strategies(detection)
            
            return detection
        except Exception as e:
            return {"error": str(e)}
    
    async def suggest_optimal_work_schedule(self, user_id: str, emotional_patterns: Dict[str, Any]) -> Dict[str, Any]:
        """Suggest optimal work schedule based on emotional patterns"""
        try:
            schedule = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "optimal_work_blocks": [],
                "recommended_breaks": [],
                "energy_management": {},
                "mood_optimization": {},
                "personalization_factors": []
            }
            
            # Identify peak energy periods
            energy_peaks = await self._identify_energy_peaks(emotional_patterns)
            
            # Create optimal work blocks
            schedule["optimal_work_blocks"] = await self._create_work_blocks(energy_peaks)
            
            # Schedule appropriate breaks
            schedule["recommended_breaks"] = await self._schedule_optimal_breaks(
                schedule["optimal_work_blocks"], emotional_patterns
            )
            
            # Energy management strategies
            schedule["energy_management"] = await self._create_energy_management_plan(emotional_patterns)
            
            # Mood optimization techniques
            schedule["mood_optimization"] = await self._create_mood_optimization_plan(emotional_patterns)
            
            # Personalization factors
            schedule["personalization_factors"] = await self._identify_personalization_factors(
                user_id, emotional_patterns
            )
            
            return schedule
        except Exception as e:
            return {"error": str(e)}
    
    async def provide_encouragement(self, user_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Provide personalized encouragement based on current situation"""
        try:
            encouragement = {
                "user_id": user_id,
                "context": context,
                "timestamp": datetime.utcnow().isoformat(),
                "message_type": "encouragement",
                "primary_message": "",
                "supporting_messages": [],
                "actionable_suggestions": [],
                "tone": "supportive"
            }
            
            # Determine appropriate tone based on situation
            encouragement["tone"] = await self._determine_appropriate_tone(context)
            
            # Generate primary encouraging message
            encouragement["primary_message"] = await self._generate_primary_encouragement(context)
            
            # Generate supporting messages
            encouragement["supporting_messages"] = await self._generate_supporting_messages(context)
            
            # Provide actionable suggestions
            encouragement["actionable_suggestions"] = await self._generate_actionable_encouragement(context)
            
            return encouragement
        except Exception as e:
            return {"error": str(e)}
    
    async def _analyze_typing_patterns(self, typing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze typing patterns for emotional indicators"""
        analysis = {
            "typing_speed": typing_data.get("speed", 40),
            "rhythm_consistency": typing_data.get("rhythm_score", 0.7),
            "pause_patterns": typing_data.get("pause_frequency", 0.5),
            "backspace_frequency": typing_data.get("backspace_ratio", 0.1),
            "emotional_indicators": []
        }
        
        # Detect stress from typing patterns
        if analysis["backspace_frequency"] > 0.15:
            analysis["emotional_indicators"].append("high_correction_rate")
        
        if analysis["rhythm_consistency"] < 0.4:
            analysis["emotional_indicators"].append("irregular_rhythm")
        
        if analysis["typing_speed"] < 20:
            analysis["emotional_indicators"].append("slow_processing")
        elif analysis["typing_speed"] > 80:
            analysis["emotional_indicators"].append("high_energy")
        
        return analysis
    
    async def _analyze_interaction_patterns(self, interactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze user interactions for emotional indicators"""
        analysis = {
            "interaction_frequency": len(interactions),
            "help_seeking_behavior": 0,
            "error_patterns": [],
            "tool_switching_frequency": 0,
            "emotional_indicators": []
        }
        
        for interaction in interactions:
            if interaction.get("type") == "help_request":
                analysis["help_seeking_behavior"] += 1
            elif interaction.get("type") == "error":
                analysis["error_patterns"].append(interaction)
            elif interaction.get("type") == "tool_switch":
                analysis["tool_switching_frequency"] += 1
        
        # Interpret patterns
        if analysis["help_seeking_behavior"] > 5:
            analysis["emotional_indicators"].append("struggling")
        
        if len(analysis["error_patterns"]) > 10:
            analysis["emotional_indicators"].append("frustration")
        
        if analysis["tool_switching_frequency"] > 20:
            analysis["emotional_indicators"].append("restlessness")
        
        return analysis
    
    async def _analyze_work_patterns(self, work_sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze work session patterns"""
        analysis = {
            "session_length_avg": 0,
            "break_frequency": 0,
            "productivity_trend": "stable",
            "focus_consistency": 0.7,
            "emotional_indicators": []
        }
        
        if work_sessions:
            # Calculate average session length
            total_duration = sum(session.get("duration", 0) for session in work_sessions)
            analysis["session_length_avg"] = total_duration / len(work_sessions)
            
            # Analyze productivity trend
            recent_productivity = [s.get("productivity_score", 0.5) for s in work_sessions[-5:]]
            if len(recent_productivity) >= 2:
                if recent_productivity[-1] < recent_productivity[0]:
                    analysis["productivity_trend"] = "declining"
                elif recent_productivity[-1] > recent_productivity[0]:
                    analysis["productivity_trend"] = "improving"
        
        # Interpret patterns
        if analysis["session_length_avg"] > 180:  # 3 hours
            analysis["emotional_indicators"].append("overworking")
        elif analysis["session_length_avg"] < 30:  # 30 minutes
            analysis["emotional_indicators"].append("difficulty_focusing")
        
        if analysis["productivity_trend"] == "declining":
            analysis["emotional_indicators"].append("fatigue")
        
        return analysis
    
    async def _determine_emotional_state(self, typing_analysis: Dict[str, Any], 
                                       interaction_analysis: Dict[str, Any], 
                                       work_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Combine analyses to determine overall emotional state"""
        emotional_state = {
            "primary_mood": "neutral",
            "secondary_emotions": [],
            "confidence": 0.5
        }
        
        # Collect all indicators
        all_indicators = (
            typing_analysis.get("emotional_indicators", []) +
            interaction_analysis.get("emotional_indicators", []) +
            work_analysis.get("emotional_indicators", [])
        )
        
        # Determine primary mood
        if "frustration" in all_indicators or "struggling" in all_indicators:
            emotional_state["primary_mood"] = "frustrated"
            emotional_state["confidence"] = 0.8
        elif "fatigue" in all_indicators or "overworking" in all_indicators:
            emotional_state["primary_mood"] = "tired"
            emotional_state["confidence"] = 0.7
        elif "high_energy" in all_indicators:
            emotional_state["primary_mood"] = "energetic"
            emotional_state["confidence"] = 0.6
        elif "difficulty_focusing" in all_indicators or "restlessness" in all_indicators:
            emotional_state["primary_mood"] = "distracted"
            emotional_state["confidence"] = 0.7
        
        # Identify secondary emotions
        emotional_state["secondary_emotions"] = list(set(all_indicators))
        
        return emotional_state
    
    async def _calculate_energy_level(self, behavioral_data: Dict[str, Any]) -> float:
        """Calculate user's current energy level"""
        base_energy = 0.7
        
        # Adjust based on typing speed
        typing_speed = behavioral_data.get("typing_data", {}).get("speed", 40)
        if typing_speed > 60:
            base_energy += 0.2
        elif typing_speed < 30:
            base_energy -= 0.2
        
        # Adjust based on session length
        recent_session_length = behavioral_data.get("current_session_duration", 60)
        if recent_session_length > 120:  # Over 2 hours
            base_energy -= 0.3
        elif recent_session_length < 30:
            base_energy += 0.1
        
        return max(0.0, min(1.0, base_energy))
    
    async def _calculate_stress_level(self, behavioral_data: Dict[str, Any]) -> float:
        """Calculate user's current stress level"""
        base_stress = 0.3
        
        # Increase stress based on error frequency
        error_count = len(behavioral_data.get("recent_errors", []))
        base_stress += error_count * 0.1
        
        # Increase stress based on correction rate
        backspace_ratio = behavioral_data.get("typing_data", {}).get("backspace_ratio", 0.1)
        if backspace_ratio > 0.15:
            base_stress += 0.2
        
        # Increase stress based on help-seeking
        help_requests = behavioral_data.get("help_requests", 0)
        base_stress += help_requests * 0.05
        
        return max(0.0, min(1.0, base_stress))
    
    async def _calculate_focus_capacity(self, behavioral_data: Dict[str, Any]) -> float:
        """Calculate user's current focus capacity"""
        base_focus = 0.7
        
        # Adjust based on rhythm consistency
        rhythm_score = behavioral_data.get("typing_data", {}).get("rhythm_score", 0.7)
        base_focus = (base_focus + rhythm_score) / 2
        
        # Adjust based on tool switching
        tool_switches = behavioral_data.get("tool_switches", 0)
        if tool_switches > 10:
            base_focus -= 0.2
        
        # Adjust based on break frequency
        breaks_taken = behavioral_data.get("breaks_taken", 0)
        if breaks_taken == 0 and behavioral_data.get("session_duration", 0) > 60:
            base_focus -= 0.1
        
        return max(0.0, min(1.0, base_focus))
    
    async def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized recommendations based on emotional analysis"""
        recommendations = []
        
        emotional_state = analysis.get("emotional_state", {})
        primary_mood = emotional_state.get("primary_mood", "neutral")
        
        if primary_mood == "frustrated":
            recommendations.append({
                "type": "break_suggestion",
                "priority": "high",
                "message": "Take a 10-minute break to reset your focus",
                "action": "suggest_break"
            })
            recommendations.append({
                "type": "environment",
                "priority": "medium",
                "message": "Try changing your music or workspace lighting",
                "action": "environment_change"
            })
        
        elif primary_mood == "tired":
            recommendations.append({
                "type": "energy_boost",
                "priority": "high",
                "message": "Consider a short walk or some light stretching",
                "action": "physical_activity"
            })
            recommendations.append({
                "type": "task_adjustment",
                "priority": "medium",
                "message": "Switch to less demanding tasks for now",
                "action": "task_simplification"
            })
        
        elif analysis.get("stress_level", 0) > 0.7:
            recommendations.append({
                "type": "stress_relief",
                "priority": "high",
                "message": "Practice deep breathing for 2 minutes",
                "action": "breathing_exercise"
            })
        
        if analysis.get("focus_capacity", 0) < 0.4:
            recommendations.append({
                "type": "focus_enhancement",
                "priority": "medium",
                "message": "Try the Pomodoro technique for better focus",
                "action": "pomodoro_timer"
            })
        
        return recommendations
    
    async def _calculate_confidence(self, analysis: Dict[str, Any], behavioral_data: Dict[str, Any]) -> float:
        """Calculate confidence in emotional analysis"""
        base_confidence = 0.5
        
        # More data points increase confidence
        data_points = len(behavioral_data.get("interactions", [])) + len(behavioral_data.get("work_sessions", []))
        if data_points > 10:
            base_confidence += 0.2
        elif data_points < 3:
            base_confidence -= 0.2
        
        # Clear emotional indicators increase confidence
        indicators_count = len(analysis.get("emotional_state", {}).get("secondary_emotions", []))
        if indicators_count > 3:
            base_confidence += 0.3
        elif indicators_count == 0:
            base_confidence -= 0.3
        
        return max(0.1, min(1.0, base_confidence))
    
    # Additional helper methods (simplified implementations)
    async def _load_emotional_models(self):
        """Load emotional analysis models"""
        self.emotional_models = {
            "mood_detection": {"accuracy": 0.8},
            "stress_analysis": {"accuracy": 0.75},
            "energy_prediction": {"accuracy": 0.7}
        }
    
    async def _initialize_mood_detection(self):
        """Initialize mood detection algorithms"""
        self.mood_indicators = {
            "typing_speed": {"low": "tired", "high": "energetic"},
            "error_rate": {"high": "frustrated"},
            "session_length": {"very_long": "obsessive", "very_short": "distracted"}
        }
    
    async def _load_intervention_strategies(self):
        """Load intervention strategies for different emotional states"""
        self.intervention_strategies = {
            "frustrated": ["take_break", "change_task", "seek_help"],
            "tired": ["physical_activity", "change_environment", "reduce_complexity"],
            "distracted": ["pomodoro", "eliminate_distractions", "simplify_task"],
            "stressed": ["breathing_exercise", "progressive_relaxation", "prioritize_tasks"]
        }
    
    async def _update_emotional_profile(self, user_id: str, analysis: Dict[str, Any]):
        """Update user's long-term emotional profile"""
        if user_id not in self.user_emotional_profiles:
            self.user_emotional_profiles[user_id] = {
                "patterns": [],
                "preferences": {},
                "effective_interventions": []
            }
        
        # Add current analysis to patterns
        self.user_emotional_profiles[user_id]["patterns"].append({
            "timestamp": analysis["timestamp"],
            "mood": analysis["emotional_state"]["primary_mood"],
            "energy": analysis["energy_level"],
            "stress": analysis["stress_level"]
        })
        
        # Keep only recent patterns (last 30 days)
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        self.user_emotional_profiles[user_id]["patterns"] = [
            p for p in self.user_emotional_profiles[user_id]["patterns"]
            if datetime.fromisoformat(p["timestamp"]) > cutoff_date
        ]
    
    # Additional placeholder methods for comprehensive functionality
    async def _adapt_communication_style(self, emotional_state: Dict[str, Any]) -> Dict[str, str]:
        return {"tone": "supportive", "formality": "casual", "encouragement_level": "medium"}
    
    async def _generate_motivation_messages(self, emotional_state: Dict[str, Any], task: str) -> List[str]:
        return ["You're making great progress!", "Keep up the excellent work!"]
    
    async def _suggest_stress_relief_breaks(self, emotional_state: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [{"type": "breathing", "duration": 5, "description": "Deep breathing exercise"}]
    
    async def _suggest_energy_boosting_breaks(self, emotional_state: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [{"type": "movement", "duration": 10, "description": "Light physical activity"}]
    
    async def _recommend_environment_adjustments(self, emotional_state: Dict[str, Any]) -> List[str]:
        return ["Adjust lighting", "Change background music", "Organize workspace"]
    
    async def _suggest_workflow_modifications(self, emotional_state: Dict[str, Any], task: str) -> List[str]:
        return ["Break task into smaller parts", "Switch to less demanding tasks"]
    
    async def _analyze_intensity_trends(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {"trend": "stable", "average_intensity": 0.7}
    
    async def _analyze_break_patterns(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {"frequency": "adequate", "duration": "appropriate"}
    
    async def _analyze_emotional_trends(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {"stability": "stable", "dominant_mood": "focused"}
    
    async def _identify_warning_signals(self, intensity: Dict[str, Any], breaks: Dict[str, Any], emotional: Dict[str, Any]) -> List[str]:
        return []
    
    async def _assess_burnout_risk(self, signals: List[str]) -> str:
        return "low" if len(signals) < 3 else "medium" if len(signals) < 6 else "high"
    
    async def _generate_burnout_interventions(self, risk: str, signals: List[str]) -> List[str]:
        return ["Take longer breaks", "Reduce workload", "Seek support"]
    
    async def _suggest_recovery_strategies(self, detection: Dict[str, Any]) -> List[str]:
        return ["Maintain work-life balance", "Practice mindfulness", "Get adequate sleep"]
    
    async def _identify_energy_peaks(self, patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [{"time": "10:00", "energy": 0.9}, {"time": "14:00", "energy": 0.8}]
    
    async def _create_work_blocks(self, energy_peaks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [{"start": "09:00", "end": "11:00", "type": "focused_work"}]
    
    async def _schedule_optimal_breaks(self, work_blocks: List[Dict[str, Any]], patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [{"time": "11:00", "duration": 15, "type": "rest"}]
    
    async def _create_energy_management_plan(self, patterns: Dict[str, Any]) -> Dict[str, Any]:
        return {"strategy": "match_tasks_to_energy", "techniques": ["power_naps", "exercise"]}
    
    async def _create_mood_optimization_plan(self, patterns: Dict[str, Any]) -> Dict[str, Any]:
        return {"techniques": ["music", "lighting", "aromatherapy"], "triggers": ["positive_affirmations"]}
    
    async def _identify_personalization_factors(self, user_id: str, patterns: Dict[str, Any]) -> List[str]:
        return ["morning_person", "prefers_breaks", "responds_well_to_encouragement"]
    
    async def _determine_appropriate_tone(self, context: Dict[str, Any]) -> str:
        return "supportive"
    
    async def _generate_primary_encouragement(self, context: Dict[str, Any]) -> str:
        return "You're doing great! Keep up the excellent work."
    
    async def _generate_supporting_messages(self, context: Dict[str, Any]) -> List[str]:
        return ["Every line of code brings you closer to your goal", "Progress, not perfection"]
    
    async def _generate_actionable_encouragement(self, context: Dict[str, Any]) -> List[str]:
        return ["Take a moment to celebrate this progress", "Consider sharing your achievement"]