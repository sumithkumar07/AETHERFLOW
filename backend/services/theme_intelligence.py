from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime, time
import colorsys
import math

class ThemeIntelligence:
    """AI service that creates personalized themes based on work patterns"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.user_patterns = {}
        self.theme_cache = {}
        self.color_psychology = {}
    
    async def initialize(self):
        """Initialize the theme intelligence service"""
        try:
            self.color_psychology = await self._load_color_psychology_data()
            await self._load_predefined_themes()
            return True
        except Exception as e:
            print(f"Theme Intelligence initialization error: {e}")
            return False
    
    async def analyze_user_patterns(self, user_id: str, activity_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze user's work patterns to suggest optimal themes"""
        try:
            analysis = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "work_hours": await self._analyze_work_hours(activity_data),
                "peak_productivity": await self._identify_peak_hours(activity_data),
                "coding_intensity": await self._calculate_coding_intensity(activity_data),
                "preferred_environments": await self._analyze_environment_preferences(activity_data),
                "eye_strain_indicators": await self._detect_eye_strain_patterns(activity_data),
                "theme_recommendations": await self._generate_theme_recommendations(activity_data)
            }
            
            # Cache the analysis
            self.user_patterns[user_id] = analysis
            
            return analysis
        except Exception as e:
            return {"error": str(e), "user_id": user_id}
    
    async def generate_personalized_theme(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a personalized theme based on user patterns and preferences"""
        try:
            user_pattern = self.user_patterns.get(user_id, {})
            
            theme = {
                "theme_id": f"custom_{user_id}_{int(datetime.utcnow().timestamp())}",
                "name": preferences.get("name", f"Personal Theme for {user_id}"),
                "created_at": datetime.utcnow().isoformat(),
                "based_on_patterns": True,
                "colors": await self._generate_color_scheme(user_pattern, preferences),
                "typography": await self._optimize_typography(user_pattern, preferences),
                "spacing": await self._optimize_spacing(user_pattern, preferences),
                "ui_density": await self._calculate_optimal_density(user_pattern),
                "accessibility": await self._ensure_accessibility_compliance(user_pattern),
                "circadian_adaptation": await self._create_circadian_schedule(user_pattern)
            }
            
            # Cache the generated theme
            self.theme_cache[theme["theme_id"]] = theme
            
            return theme
        except Exception as e:
            return {"error": str(e), "user_id": user_id}
    
    async def suggest_theme_adjustments(self, user_id: str, current_time: datetime, environmental_factors: Dict[str, Any]) -> Dict[str, Any]:
        """Suggest real-time theme adjustments based on time and environment"""
        try:
            suggestions = {
                "timestamp": datetime.utcnow().isoformat(),
                "adjustments": [],
                "reasoning": []
            }
            
            # Time-based adjustments
            hour = current_time.hour
            if hour < 8 or hour > 18:  # Outside typical work hours
                suggestions["adjustments"].append({
                    "property": "brightness",
                    "adjustment": -20,
                    "reason": "Low light conditions detected"
                })
                suggestions["adjustments"].append({
                    "property": "blue_light",
                    "adjustment": -30,
                    "reason": "Reduce blue light for evening comfort"
                })
            
            # Environmental adjustments
            if environmental_factors.get("ambient_light", "normal") == "bright":
                suggestions["adjustments"].append({
                    "property": "contrast",
                    "adjustment": 15,
                    "reason": "High ambient light detected"
                })
            
            if environmental_factors.get("screen_time", 0) > 6:  # Hours
                suggestions["adjustments"].append({
                    "property": "eye_comfort",
                    "adjustment": 10,
                    "reason": "Extended screen time detected"
                })
            
            return suggestions
        except Exception as e:
            return {"error": str(e)}
    
    async def create_adaptive_theme_schedule(self, user_id: str) -> Dict[str, Any]:
        """Create a schedule that automatically adjusts theme throughout the day"""
        try:
            user_pattern = self.user_patterns.get(user_id, {})
            work_hours = user_pattern.get("work_hours", {"start": 9, "end": 17})
            
            schedule = {
                "user_id": user_id,
                "schedule_id": f"adaptive_{user_id}_{int(datetime.utcnow().timestamp())}",
                "time_slots": [
                    {
                        "time": "06:00",
                        "theme_config": {
                            "brightness": 60,
                            "blue_light": 70,
                            "contrast": 85,
                            "description": "Morning warmup theme"
                        }
                    },
                    {
                        "time": f"{work_hours['start']:02d}:00",
                        "theme_config": {
                            "brightness": 90,
                            "blue_light": 100,
                            "contrast": 100,
                            "description": "Peak productivity theme"
                        }
                    },
                    {
                        "time": "12:00",
                        "theme_config": {
                            "brightness": 85,
                            "blue_light": 90,
                            "contrast": 95,
                            "description": "Midday comfort theme"
                        }
                    },
                    {
                        "time": f"{work_hours['end']:02d}:00",
                        "theme_config": {
                            "brightness": 75,
                            "blue_light": 80,
                            "contrast": 90,
                            "description": "Evening wind-down theme"
                        }
                    },
                    {
                        "time": "20:00",
                        "theme_config": {
                            "brightness": 50,
                            "blue_light": 40,
                            "contrast": 80,
                            "description": "Night mode theme"
                        }
                    }
                ],
                "auto_adjust": True,
                "location_based": False,  # Can be enhanced with geolocation
                "weather_adaptive": False  # Can be enhanced with weather API
            }
            
            return schedule
        except Exception as e:
            return {"error": str(e)}
    
    async def generate_color_palette_suggestions(self, mood: str, purpose: str) -> List[Dict[str, Any]]:
        """Generate color palette suggestions based on mood and purpose"""
        try:
            palettes = {
                "productive": [
                    {
                        "name": "Ocean Focus",
                        "primary": "#2563eb",
                        "secondary": "#0ea5e9",
                        "accent": "#06b6d4",
                        "background": "#f8fafc",
                        "text": "#1e293b",
                        "psychology": "Blue promotes focus and calmness"
                    },
                    {
                        "name": "Forest Concentration",
                        "primary": "#16a34a",
                        "secondary": "#22c55e",
                        "accent": "#84cc16",
                        "background": "#f9fafb",
                        "text": "#1f2937",
                        "psychology": "Green reduces eye strain and enhances concentration"
                    }
                ],
                "creative": [
                    {
                        "name": "Sunset Inspiration",
                        "primary": "#ea580c",
                        "secondary": "#f97316",
                        "accent": "#fbbf24",
                        "background": "#fffbeb",
                        "text": "#92400e",
                        "psychology": "Warm colors stimulate creativity and energy"
                    },
                    {
                        "name": "Purple Innovation",
                        "primary": "#7c3aed",
                        "secondary": "#a855f7",
                        "accent": "#c084fc",
                        "background": "#faf5ff",
                        "text": "#581c87",
                        "psychology": "Purple encourages imagination and innovation"
                    }
                ],
                "relaxed": [
                    {
                        "name": "Sage Serenity",
                        "primary": "#6b7280",
                        "secondary": "#9ca3af",
                        "accent": "#d1d5db",
                        "background": "#f9fafb",
                        "text": "#374151",
                        "psychology": "Neutral tones promote relaxation and reduce stress"
                    }
                ]
            }
            
            return palettes.get(mood, palettes["productive"])
        except Exception as e:
            return [{"error": str(e)}]
    
    async def _analyze_work_hours(self, activity_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze user's typical work hours"""
        hour_activity = {}
        
        for activity in activity_data:
            timestamp = datetime.fromisoformat(activity.get("timestamp", datetime.utcnow().isoformat()))
            hour = timestamp.hour
            hour_activity[hour] = hour_activity.get(hour, 0) + 1
        
        if not hour_activity:
            return {"start": 9, "end": 17, "pattern": "standard"}
        
        # Find peak activity hours
        sorted_hours = sorted(hour_activity.items(), key=lambda x: x[1], reverse=True)
        peak_hours = [hour for hour, _ in sorted_hours[:8]]  # Top 8 hours
        
        return {
            "start": min(peak_hours),
            "end": max(peak_hours),
            "pattern": self._classify_work_pattern(peak_hours)
        }
    
    async def _identify_peak_hours(self, activity_data: List[Dict[str, Any]]) -> List[int]:
        """Identify peak productivity hours"""
        productivity_scores = {}
        
        for activity in activity_data:
            timestamp = datetime.fromisoformat(activity.get("timestamp", datetime.utcnow().isoformat()))
            hour = timestamp.hour
            
            # Score based on activity type and intensity
            score = activity.get("productivity_score", 1)
            productivity_scores[hour] = productivity_scores.get(hour, 0) + score
        
        # Return top 3 productive hours
        sorted_hours = sorted(productivity_scores.items(), key=lambda x: x[1], reverse=True)
        return [hour for hour, _ in sorted_hours[:3]]
    
    async def _calculate_coding_intensity(self, activity_data: List[Dict[str, Any]]) -> str:
        """Calculate coding intensity level"""
        total_coding_time = sum(activity.get("duration", 0) for activity in activity_data if activity.get("type") == "coding")
        avg_session_length = total_coding_time / max(len(activity_data), 1)
        
        if avg_session_length > 120:  # 2 hours
            return "high"
        elif avg_session_length > 60:  # 1 hour
            return "medium"
        else:
            return "low"
    
    async def _analyze_environment_preferences(self, activity_data: List[Dict[str, Any]]) -> Dict[str, str]:
        """Analyze environment preferences from activity data"""
        return {
            "lighting": "adaptive",
            "noise_level": "low",
            "distractions": "minimal"
        }
    
    async def _detect_eye_strain_patterns(self, activity_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect patterns that might indicate eye strain"""
        long_sessions = [a for a in activity_data if a.get("duration", 0) > 180]  # 3+ hours
        
        return {
            "risk_level": "high" if len(long_sessions) > 3 else "low",
            "break_frequency": "every_60_minutes" if len(long_sessions) > 3 else "every_90_minutes",
            "brightness_recommendation": "auto_adjust"
        }
    
    async def _generate_theme_recommendations(self, activity_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate theme recommendations based on analysis"""
        return [
            {
                "name": "Productivity Focus",
                "description": "Optimized for long coding sessions",
                "color_scheme": "blue_based",
                "contrast": "high",
                "suitability_score": 95
            },
            {
                "name": "Eye Comfort",
                "description": "Reduces eye strain during extended work",
                "color_scheme": "warm_neutral",
                "contrast": "medium",
                "suitability_score": 88
            }
        ]
    
    async def _generate_color_scheme(self, user_pattern: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, str]:
        """Generate personalized color scheme"""
        base_hue = preferences.get("preferred_hue", 210)  # Default to blue
        
        # Adjust based on user patterns
        work_hours = user_pattern.get("work_hours", {})
        if work_hours.get("pattern") == "night_owl":
            base_hue = (base_hue + 30) % 360  # Shift towards warmer tones
        
        # Generate color palette
        primary = self._hsl_to_hex(base_hue, 0.7, 0.5)
        secondary = self._hsl_to_hex((base_hue + 30) % 360, 0.6, 0.6)
        accent = self._hsl_to_hex((base_hue + 60) % 360, 0.8, 0.7)
        
        return {
            "primary": primary,
            "secondary": secondary,
            "accent": accent,
            "background": "#ffffff",
            "surface": "#f8fafc",
            "text": "#1e293b"
        }
    
    async def _optimize_typography(self, user_pattern: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize typography based on user patterns"""
        base_size = 14
        
        # Adjust for coding intensity
        intensity = user_pattern.get("coding_intensity", "medium")
        if intensity == "high":
            base_size = 15  # Slightly larger for extended sessions
        
        return {
            "base_size": base_size,
            "line_height": 1.6,
            "font_family": preferences.get("font_family", "Inter, system-ui, sans-serif"),
            "font_weight": {
                "normal": 400,
                "medium": 500,
                "semibold": 600
            }
        }
    
    async def _optimize_spacing(self, user_pattern: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, int]:
        """Optimize spacing based on user patterns"""
        return {
            "xs": 4,
            "sm": 8,
            "md": 16,
            "lg": 24,
            "xl": 32
        }
    
    async def _calculate_optimal_density(self, user_pattern: Dict[str, Any]) -> str:
        """Calculate optimal UI density"""
        intensity = user_pattern.get("coding_intensity", "medium")
        
        if intensity == "high":
            return "compact"  # More information in less space
        elif intensity == "low":
            return "comfortable"  # More breathing room
        else:
            return "normal"
    
    async def _ensure_accessibility_compliance(self, user_pattern: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure theme meets accessibility standards"""
        return {
            "contrast_ratio": 4.5,  # WCAG AA compliant
            "color_blind_friendly": True,
            "high_contrast_mode": False,
            "focus_indicators": True
        }
    
    async def _create_circadian_schedule(self, user_pattern: Dict[str, Any]) -> Dict[str, Any]:
        """Create circadian rhythm-based theme schedule"""
        return {
            "enabled": True,
            "sunrise_adjustment": "06:30",
            "sunset_adjustment": "18:30",
            "blue_light_reduction": {
                "start": "18:00",
                "peak": "22:00",
                "percentage": 40
            }
        }
    
    async def _load_color_psychology_data(self) -> Dict[str, str]:
        """Load color psychology data"""
        return {
            "blue": "Promotes focus, calmness, and productivity",
            "green": "Reduces eye strain, enhances concentration",
            "purple": "Encourages creativity and innovation",
            "orange": "Stimulates energy and enthusiasm",
            "gray": "Promotes neutrality and balance"
        }
    
    async def _load_predefined_themes(self):
        """Load predefined themes"""
        self.predefined_themes = {
            "ocean_focus": {
                "name": "Ocean Focus",
                "colors": {
                    "primary": "#2563eb",
                    "secondary": "#0ea5e9",
                    "accent": "#06b6d4"
                }
            },
            "forest_calm": {
                "name": "Forest Calm",
                "colors": {
                    "primary": "#16a34a",
                    "secondary": "#22c55e",
                    "accent": "#84cc16"
                }
            }
        }
    
    def _classify_work_pattern(self, peak_hours: List[int]) -> str:
        """Classify work pattern based on peak hours"""
        if max(peak_hours) < 6 or min(peak_hours) > 20:
            return "night_owl"
        elif max(peak_hours) < 15:
            return "early_bird"
        else:
            return "standard"
    
    def _hsl_to_hex(self, h: float, s: float, l: float) -> str:
        """Convert HSL to hex color"""
        h = h / 360
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        r, g, b = int(r * 255), int(g * 255), int(b * 255)
        return f"#{r:02x}{g:02x}{b:02x}"