from typing import Dict, List, Optional, Any
import asyncio
import json
from datetime import datetime
import math
import random

class SoundscapeEngine:
    """AI service for generating ambient development soundscapes"""
    
    def __init__(self, db_wrapper):
        self.db = db_wrapper
        self.user_preferences = {}
        self.soundscape_cache = {}
        self.binaural_frequencies = {}
    
    async def initialize(self):
        """Initialize the soundscape engine"""
        try:
            await self._load_sound_library()
            await self._initialize_binaural_beats()
            await self._load_focus_patterns()
            return True
        except Exception as e:
            print(f"Soundscape Engine initialization error: {e}")
            return False
    
    async def generate_focus_soundscape(self, user_id: str, activity_type: str, duration_minutes: int) -> Dict[str, Any]:
        """Generate personalized focus soundscape for coding activity"""
        try:
            soundscape = {
                "user_id": user_id,
                "activity_type": activity_type,
                "duration": duration_minutes,
                "timestamp": datetime.utcnow().isoformat(),
                "soundscape_id": f"soundscape_{user_id}_{int(datetime.utcnow().timestamp())}",
                "audio_layers": [],
                "binaural_beats": {},
                "ambient_sounds": [],
                "adaptive_elements": {},
                "focus_zones": []
            }
            
            # Generate base ambient layer
            soundscape["ambient_sounds"] = await self._generate_ambient_layer(activity_type, user_id)
            
            # Add binaural beats for focus enhancement
            soundscape["binaural_beats"] = await self._generate_binaural_beats(activity_type)
            
            # Create adaptive audio layers
            soundscape["audio_layers"] = await self._create_audio_layers(activity_type, duration_minutes)
            
            # Add adaptive elements that respond to coding rhythm
            soundscape["adaptive_elements"] = await self._create_adaptive_elements(user_id, activity_type)
            
            # Define focus enhancement zones
            soundscape["focus_zones"] = await self._create_focus_zones(duration_minutes)
            
            # Cache the soundscape
            self.soundscape_cache[soundscape["soundscape_id"]] = soundscape
            
            return soundscape
        except Exception as e:
            return {"error": str(e), "user_id": user_id}
    
    async def adapt_to_coding_rhythm(self, user_id: str, coding_activity: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt soundscape based on real-time coding activity"""
        try:
            adaptation = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "activity_analysis": await self._analyze_coding_activity(coding_activity),
                "sound_adjustments": [],
                "tempo_changes": {},
                "volume_adjustments": {},
                "focus_enhancement": {}
            }
            
            activity_analysis = adaptation["activity_analysis"]
            
            # Adjust tempo based on typing speed
            if activity_analysis["typing_speed"] > 80:  # Fast typing
                adaptation["tempo_changes"] = {
                    "base_tempo": 120,  # BPM
                    "variation": "minimal",
                    "sync_to_typing": True
                }
            elif activity_analysis["typing_speed"] < 30:  # Slow/thoughtful
                adaptation["tempo_changes"] = {
                    "base_tempo": 60,
                    "variation": "gentle",
                    "ambient_focus": True
                }
            
            # Adjust volume based on focus level
            focus_level = activity_analysis.get("focus_level", 0.7)
            adaptation["volume_adjustments"] = {
                "master_volume": min(1.0, focus_level + 0.3),
                "ambient_volume": focus_level * 0.8,
                "binaural_volume": (1 - focus_level) * 0.6  # Increase when focus is low
            }
            
            # Dynamic focus enhancement
            if activity_analysis.get("distraction_level", 0) > 0.3:
                adaptation["focus_enhancement"] = {
                    "increase_binaural": True,
                    "reduce_complexity": True,
                    "add_white_noise": True,
                    "frequency": "alpha_waves"  # 8-13 Hz for relaxed focus
                }
            
            return adaptation
        except Exception as e:
            return {"error": str(e)}
    
    async def create_personalized_library(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Create personalized sound library based on user preferences"""
        try:
            library = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "sound_categories": {},
                "preferred_frequencies": {},
                "custom_soundscapes": [],
                "ai_recommendations": []
            }
            
            # Categorize sounds based on preferences
            if preferences.get("environment") == "nature":
                library["sound_categories"]["nature"] = [
                    {"name": "Forest Rain", "file": "forest_rain.mp3", "mood": "calm", "focus_level": 8},
                    {"name": "Ocean Waves", "file": "ocean_waves.mp3", "mood": "relaxed", "focus_level": 7},
                    {"name": "Mountain Stream", "file": "stream.mp3", "mood": "peaceful", "focus_level": 9}
                ]
            
            if preferences.get("environment") == "urban":
                library["sound_categories"]["urban"] = [
                    {"name": "Coffee Shop", "file": "coffee_shop.mp3", "mood": "social", "focus_level": 6},
                    {"name": "City Rain", "file": "city_rain.mp3", "mood": "cozy", "focus_level": 8},
                    {"name": "Distant Traffic", "file": "traffic.mp3", "mood": "neutral", "focus_level": 5}
                ]
            
            if preferences.get("genre") == "ambient":
                library["sound_categories"]["ambient"] = [
                    {"name": "Ethereal Pads", "file": "ethereal.mp3", "mood": "creative", "focus_level": 7},
                    {"name": "Minimal Textures", "file": "minimal.mp3", "mood": "focused", "focus_level": 9},
                    {"name": "Drone Layers", "file": "drone.mp3", "mood": "deep_focus", "focus_level": 10}
                ]
            
            # Set preferred frequencies for binaural beats
            library["preferred_frequencies"] = await self._determine_optimal_frequencies(preferences)
            
            # Generate AI recommendations
            library["ai_recommendations"] = await self._generate_sound_recommendations(user_id, preferences)
            
            return library
        except Exception as e:
            return {"error": str(e)}
    
    async def analyze_productivity_correlation(self, user_id: str, soundscape_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze correlation between soundscapes and productivity"""
        try:
            analysis = {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "productivity_correlations": {},
                "optimal_soundscapes": [],
                "performance_metrics": {},
                "recommendations": []
            }
            
            # Analyze productivity by soundscape type
            soundscape_performance = {}
            for session in soundscape_history:
                soundscape_type = session.get("activity_type", "general")
                productivity = session.get("productivity_score", 0)
                
                if soundscape_type not in soundscape_performance:
                    soundscape_performance[soundscape_type] = []
                soundscape_performance[soundscape_type].append(productivity)
            
            # Calculate correlations
            for soundscape_type, scores in soundscape_performance.items():
                avg_productivity = sum(scores) / len(scores) if scores else 0
                analysis["productivity_correlations"][soundscape_type] = {
                    "average_productivity": avg_productivity,
                    "session_count": len(scores),
                    "consistency": self._calculate_consistency(scores),
                    "effectiveness_rating": self._rate_effectiveness(avg_productivity)
                }
            
            # Identify optimal soundscapes
            sorted_types = sorted(
                analysis["productivity_correlations"].items(),
                key=lambda x: x[1]["average_productivity"],
                reverse=True
            )
            analysis["optimal_soundscapes"] = [
                {
                    "type": soundscape_type,
                    "productivity_score": data["average_productivity"],
                    "recommended_for": await self._get_activity_recommendations(soundscape_type)
                }
                for soundscape_type, data in sorted_types[:3]
            ]
            
            # Generate personalized recommendations
            analysis["recommendations"] = await self._generate_productivity_recommendations(analysis)
            
            return analysis
        except Exception as e:
            return {"error": str(e)}
    
    async def _generate_ambient_layer(self, activity_type: str, user_id: str) -> List[Dict[str, Any]]:
        """Generate ambient sound layer based on activity"""
        user_prefs = self.user_preferences.get(user_id, {})
        
        ambient_sounds = []
        
        if activity_type == "deep_focus":
            ambient_sounds = [
                {"name": "Deep Ocean", "volume": 0.3, "frequency_range": "20-200Hz", "mood": "calm"},
                {"name": "White Noise", "volume": 0.2, "frequency_range": "full_spectrum", "mood": "neutral"},
                {"name": "Minimal Drone", "volume": 0.4, "frequency_range": "40-400Hz", "mood": "focused"}
            ]
        elif activity_type == "creative_coding":
            ambient_sounds = [
                {"name": "Forest Ambience", "volume": 0.4, "frequency_range": "50-8000Hz", "mood": "creative"},
                {"name": "Gentle Rain", "volume": 0.3, "frequency_range": "200-6000Hz", "mood": "inspiring"},
                {"name": "Soft Synth Pads", "volume": 0.2, "frequency_range": "100-2000Hz", "mood": "dreamy"}
            ]
        elif activity_type == "debugging":
            ambient_sounds = [
                {"name": "Coffee Shop", "volume": 0.3, "frequency_range": "100-4000Hz", "mood": "alert"},
                {"name": "Subtle Pink Noise", "volume": 0.4, "frequency_range": "full_spectrum", "mood": "focused"},
                {"name": "Distant Conversations", "volume": 0.1, "frequency_range": "200-3000Hz", "mood": "social"}
            ]
        
        return ambient_sounds
    
    async def _generate_binaural_beats(self, activity_type: str) -> Dict[str, Any]:
        """Generate binaural beats for cognitive enhancement"""
        binaural_config = {
            "enabled": True,
            "base_frequency": 200,  # Hz
            "beat_frequency": 10,   # Hz difference between ears
            "wave_type": "sine",
            "volume": 0.15
        }
        
        if activity_type == "deep_focus":
            binaural_config.update({
                "beat_frequency": 10,  # Alpha waves (8-13 Hz)
                "description": "Alpha waves for relaxed focus"
            })
        elif activity_type == "creative_coding":
            binaural_config.update({
                "beat_frequency": 6,   # Theta waves (4-8 Hz)
                "description": "Theta waves for creativity"
            })
        elif activity_type == "debugging":
            binaural_config.update({
                "beat_frequency": 15,  # Beta waves (13-30 Hz)
                "description": "Beta waves for analytical thinking"
            })
        elif activity_type == "learning":
            binaural_config.update({
                "beat_frequency": 40,  # Gamma waves (30-100 Hz)
                "description": "Gamma waves for learning and memory"
            })
        
        return binaural_config
    
    async def _create_audio_layers(self, activity_type: str, duration: int) -> List[Dict[str, Any]]:
        """Create multiple audio layers for rich soundscape"""
        layers = []
        
        # Base layer - always present
        layers.append({
            "name": "Base Ambience",
            "type": "ambient",
            "volume": 0.5,
            "fade_in": 10,  # seconds
            "fade_out": 10,
            "loop": True,
            "duration": duration * 60
        })
        
        # Rhythm layer - subtle rhythmic elements
        if activity_type in ["creative_coding", "debugging"]:
            layers.append({
                "name": "Subtle Rhythm",
                "type": "rhythmic",
                "volume": 0.2,
                "tempo": 60,  # BPM
                "complexity": "minimal",
                "sync_to_typing": True
            })
        
        # Harmonic layer - for creativity
        if activity_type == "creative_coding":
            layers.append({
                "name": "Harmonic Textures",
                "type": "harmonic",
                "volume": 0.3,
                "key": "C_major",
                "progression": "ambient",
                "evolution": "slow"
            })
        
        # Focus enhancement layer
        layers.append({
            "name": "Focus Enhancement",
            "type": "binaural",
            "volume": 0.15,
            "adaptive": True,
            "responds_to": ["focus_level", "distraction_events"]
        })
        
        return layers
    
    async def _create_adaptive_elements(self, user_id: str, activity_type: str) -> Dict[str, Any]:
        """Create elements that adapt to user behavior"""
        return {
            "typing_sync": {
                "enabled": True,
                "sync_threshold": 10,  # keystrokes per 10 seconds
                "response_type": "tempo_adjustment",
                "sensitivity": 0.7
            },
            "focus_detection": {
                "enabled": True,
                "indicators": ["typing_rhythm", "mouse_movement", "window_focus"],
                "response": "binaural_adjustment",
                "adaptation_speed": "gradual"
            },
            "break_detection": {
                "enabled": True,
                "idle_threshold": 300,  # seconds
                "response": "gentle_fade",
                "resume_behavior": "smooth_return"
            },
            "productivity_correlation": {
                "enabled": True,
                "learning_rate": 0.1,
                "adjustment_frequency": "session_based"
            }
        }
    
    async def _create_focus_zones(self, duration: int) -> List[Dict[str, Any]]:
        """Create time-based focus zones throughout session"""
        zones = []
        zone_duration = duration // 4  # Split into 4 zones
        
        # Warm-up zone (first 25%)
        zones.append({
            "name": "Warm-up",
            "start_time": 0,
            "duration": zone_duration,
            "characteristics": {
                "volume_ramp": "gradual_increase",
                "complexity": "simple",
                "binaural_intensity": "low"
            },
            "purpose": "Ease into focus state"
        })
        
        # Prime focus zone (middle 50%)
        zones.append({
            "name": "Prime Focus",
            "start_time": zone_duration,
            "duration": zone_duration * 2,
            "characteristics": {
                "volume_ramp": "stable_optimal",
                "complexity": "rich",
                "binaural_intensity": "optimal"
            },
            "purpose": "Peak productivity period"
        })
        
        # Wind-down zone (last 25%)
        zones.append({
            "name": "Wind-down",
            "start_time": zone_duration * 3,
            "duration": zone_duration,
            "characteristics": {
                "volume_ramp": "gradual_decrease",
                "complexity": "simple",
                "binaural_intensity": "low"
            },
            "purpose": "Gentle session conclusion"
        })
        
        return zones
    
    async def _analyze_coding_activity(self, activity: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze coding activity patterns"""
        return {
            "typing_speed": activity.get("keystrokes_per_minute", 40),
            "focus_level": activity.get("focus_score", 0.7),
            "distraction_level": activity.get("distraction_events", 0) / 10,
            "complexity_level": activity.get("code_complexity", 0.5),
            "session_duration": activity.get("duration_minutes", 30)
        }
    
    async def _load_sound_library(self):
        """Load available sound files and metadata"""
        self.sound_library = {
            "nature": [
                {"name": "Forest Rain", "file": "forest_rain.mp3", "duration": 600, "mood": "calm"},
                {"name": "Ocean Waves", "file": "ocean.mp3", "duration": 480, "mood": "relaxed"},
                {"name": "Mountain Stream", "file": "stream.mp3", "duration": 420, "mood": "peaceful"}
            ],
            "ambient": [
                {"name": "Deep Space", "file": "space.mp3", "duration": 720, "mood": "focused"},
                {"name": "Ethereal Pads", "file": "pads.mp3", "duration": 540, "mood": "creative"},
                {"name": "Minimal Textures", "file": "minimal.mp3", "duration": 360, "mood": "concentrated"}
            ],
            "urban": [
                {"name": "Coffee Shop", "file": "coffee.mp3", "duration": 450, "mood": "social"},
                {"name": "City Rain", "file": "city_rain.mp3", "duration": 380, "mood": "cozy"},
                {"name": "Library Ambience", "file": "library.mp3", "duration": 520, "mood": "studious"}
            ]
        }
    
    async def _initialize_binaural_beats(self):
        """Initialize binaural beat frequencies"""
        self.binaural_frequencies = {
            "delta": {"range": "0.5-4", "use": "deep_sleep", "not_for_coding": True},
            "theta": {"range": "4-8", "use": "creativity_meditation", "coding_activity": "creative_coding"},
            "alpha": {"range": "8-13", "use": "relaxed_focus", "coding_activity": "deep_focus"},
            "beta": {"range": "13-30", "use": "analytical_thinking", "coding_activity": "debugging"},
            "gamma": {"range": "30-100", "use": "learning_memory", "coding_activity": "learning"}
        }
    
    async def _load_focus_patterns(self):
        """Load focus enhancement patterns"""
        self.focus_patterns = {
            "pomodoro": {"work": 25, "break": 5, "long_break": 15},
            "ultradian": {"work": 90, "break": 20},
            "custom": {"work": 45, "break": 10}
        }
    
    async def _determine_optimal_frequencies(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Determine optimal binaural frequencies for user"""
        if preferences.get("focus_style") == "deep":
            return {"primary": "alpha", "secondary": "theta", "avoid": "beta"}
        elif preferences.get("focus_style") == "analytical":
            return {"primary": "beta", "secondary": "alpha", "avoid": "theta"}
        else:
            return {"primary": "alpha", "secondary": "beta", "avoid": "gamma"}
    
    async def _generate_sound_recommendations(self, user_id: str, preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI-powered sound recommendations"""
        recommendations = []
        
        if preferences.get("environment") == "nature":
            recommendations.append({
                "type": "soundscape",
                "name": "Forest Focus Session",
                "description": "Deep forest ambience with gentle rain and binaural alpha waves",
                "confidence": 0.9,
                "expected_focus_improvement": "15-25%"
            })
        
        if preferences.get("genre") == "ambient":
            recommendations.append({
                "type": "binaural",
                "name": "Creative Flow State",
                "description": "Theta wave binaural beats with ethereal ambient textures",
                "confidence": 0.8,
                "expected_creativity_boost": "20-30%"
            })
        
        return recommendations
    
    def _calculate_consistency(self, scores: List[float]) -> float:
        """Calculate consistency score from productivity scores"""
        if len(scores) < 2:
            return 1.0
        
        avg = sum(scores) / len(scores)
        variance = sum((score - avg) ** 2 for score in scores) / len(scores)
        std_dev = math.sqrt(variance)
        
        # Consistency is inverse of coefficient of variation
        if avg > 0:
            cv = std_dev / avg
            return max(0, 1 - cv)
        return 0.5
    
    def _rate_effectiveness(self, productivity: float) -> str:
        """Rate effectiveness based on productivity score"""
        if productivity >= 0.8:
            return "highly_effective"
        elif productivity >= 0.6:
            return "effective"
        elif productivity >= 0.4:
            return "moderately_effective"
        else:
            return "low_effectiveness"
    
    async def _get_activity_recommendations(self, soundscape_type: str) -> List[str]:
        """Get activity recommendations for soundscape type"""
        recommendations = {
            "deep_focus": ["Complex algorithms", "Code refactoring", "Architecture design"],
            "creative_coding": ["UI/UX development", "Creative projects", "Prototyping"],
            "debugging": ["Bug fixing", "Code review", "Testing", "Problem solving"],
            "learning": ["New technology exploration", "Documentation reading", "Tutorial following"]
        }
        
        return recommendations.get(soundscape_type, ["General development tasks"])
    
    async def _generate_productivity_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate personalized productivity recommendations"""
        recommendations = []
        
        best_soundscape = max(
            analysis["productivity_correlations"].items(),
            key=lambda x: x[1]["average_productivity"]
        )[0]
        
        recommendations.append(f"Use '{best_soundscape}' soundscapes for maximum productivity")
        
        # Find low-performing soundscapes
        low_performers = [
            soundscape for soundscape, data in analysis["productivity_correlations"].items()
            if data["average_productivity"] < 0.5
        ]
        
        if low_performers:
            recommendations.append(f"Consider avoiding {', '.join(low_performers)} during important tasks")
        
        recommendations.append("Try 25-minute focus sessions with 5-minute ambient breaks")
        recommendations.append("Experiment with binaural beats during analytical tasks")
        
        return recommendations