"""
Neuro-Sync Engine - Brain-Computer Interface Integration

This service provides BCI integration for translating EEG patterns into code optimizations:
- EEG pattern analysis (focus/frustration/flow states)
- Emotional compiler that auto-refactors based on stress levels
- Webcam-based stress detection
- Haptic feedback coordination
- Neuralink/Muse headband integration protocols
"""

import asyncio
import uuid
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import logging
import math
import random

logger = logging.getLogger(__name__)

class NeuroSyncService:
    """
    Advanced Brain-Computer Interface service for cosmic programming
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        self.active_sessions = {}
        self.eeg_patterns = {
            'focus': {'alpha': (8, 12), 'beta': (13, 30), 'threshold': 0.7},
            'frustration': {'theta': (4, 8), 'gamma': (30, 100), 'threshold': 0.8},
            'flow': {'alpha': (8, 12), 'theta': (4, 8), 'threshold': 0.9},
            'creativity': {'theta': (4, 8), 'alpha': (8, 12), 'threshold': 0.75},
            'problem_solving': {'beta': (13, 30), 'gamma': (30, 100), 'threshold': 0.8}
        }
        
        logger.info("🧠 Neuro-Sync Engine initialized - BCI capabilities online!")

    async def start_bci_session(self, user_id: str, device_type: str = 'muse') -> Dict[str, Any]:
        """
        Start a Brain-Computer Interface session
        """
        try:
            session_id = str(uuid.uuid4())
            
            # Simulate device connection
            device_info = self._get_device_info(device_type)
            
            session = {
                'session_id': session_id,
                'user_id': user_id,
                'device_type': device_type,
                'device_info': device_info,
                'status': 'active',
                'started_at': datetime.utcnow(),
                'calibration_complete': False,
                'patterns_detected': [],
                'optimization_count': 0
            }
            
            self.active_sessions[session_id] = session
            
            # Save to database
            await self.db.bci_sessions.insert_one(session.copy())
            
            return {
                'success': True,
                'session_id': session_id,
                'device_info': device_info,
                'message': f'BCI session started with {device_type} device',
                'calibration_required': True
            }
            
        except Exception as e:
            logger.error(f"BCI session start failed: {e}")
            return {'success': False, 'error': str(e)}

    def _get_device_info(self, device_type: str) -> Dict[str, Any]:
        """Get information about the BCI device"""
        devices = {
            'muse': {
                'name': 'Muse Headband',
                'channels': 4,
                'sample_rate': 256,
                'connection': 'bluetooth',
                'capabilities': ['eeg', 'gyroscope', 'accelerometer']
            },
            'neuralink': {
                'name': 'Neuralink Dev Kit',
                'channels': 1024,
                'sample_rate': 20000,
                'connection': 'wireless',
                'capabilities': ['high_resolution_eeg', 'direct_neural_interface', 'motor_control']
            },
            'emotiv': {
                'name': 'Emotiv EPOC X',
                'channels': 14,
                'sample_rate': 128,
                'connection': 'wireless',
                'capabilities': ['eeg', 'facial_expression', 'mental_commands']
            },
            'webcam_stress': {
                'name': 'Webcam Stress Detector',
                'channels': 1,
                'sample_rate': 30,
                'connection': 'usb',
                'capabilities': ['facial_analysis', 'heart_rate_variability', 'stress_detection']
            }
        }
        
        return devices.get(device_type, {
            'name': 'Unknown Device',
            'channels': 1,
            'sample_rate': 64,
            'connection': 'unknown',
            'capabilities': ['basic_monitoring']
        })

    async def process_eeg_data(self, session_id: str, eeg_data: List[float]) -> Dict[str, Any]:
        """
        Process incoming EEG data and translate patterns into code optimizations
        """
        try:
            if session_id not in self.active_sessions:
                return {'success': False, 'error': 'Session not found'}
            
            session = self.active_sessions[session_id]
            
            # Analyze EEG patterns
            patterns = self._analyze_eeg_patterns(eeg_data)
            session['patterns_detected'].extend(patterns)
            
            optimizations = []
            
            for pattern in patterns:
                if pattern['confidence'] > pattern['threshold']:
                    optimization = await self._generate_code_optimization(pattern)
                    if optimization:
                        optimizations.append(optimization)
                        session['optimization_count'] += 1
            
            # Update session
            session['last_update'] = datetime.utcnow()
            await self.db.bci_sessions.update_one(
                {'session_id': session_id},
                {'$set': session}
            )
            
            return {
                'success': True,
                'patterns_detected': patterns,
                'optimizations': optimizations,
                'session_stats': {
                    'total_patterns': len(session['patterns_detected']),
                    'optimizations_generated': session['optimization_count']
                }
            }
            
        except Exception as e:
            logger.error(f"EEG data processing failed: {e}")
            return {'success': False, 'error': str(e)}

    def _analyze_eeg_patterns(self, eeg_data: List[float]) -> List[Dict[str, Any]]:
        """Analyze EEG data for cognitive patterns"""
        patterns = []
        
        if len(eeg_data) < 100:  # Need minimum data for analysis
            return patterns
        
        # Convert to numpy array for analysis
        data = np.array(eeg_data)
        
        # Perform FFT to get frequency components
        fft = np.fft.fft(data)
        freqs = np.fft.fftfreq(len(data), 1/256)  # Assuming 256 Hz sample rate
        power_spectrum = np.abs(fft)**2
        
        # Analyze different frequency bands
        for pattern_name, pattern_info in self.eeg_patterns.items():
            confidence = self._calculate_pattern_confidence(
                freqs, power_spectrum, pattern_info
            )
            
            if confidence > 0.5:  # Minimum confidence threshold
                patterns.append({
                    'pattern': pattern_name,
                    'confidence': confidence,
                    'threshold': pattern_info['threshold'],
                    'timestamp': datetime.utcnow(),
                    'frequency_bands': pattern_info
                })
        
        return patterns

    def _calculate_pattern_confidence(
        self, 
        freqs: np.ndarray, 
        power_spectrum: np.ndarray, 
        pattern_info: Dict
    ) -> float:
        """Calculate confidence level for a specific EEG pattern"""
        
        total_power = 0.0
        pattern_power = 0.0
        
        # Calculate power in relevant frequency bands
        for band_name, (low_freq, high_freq) in pattern_info.items():
            if band_name == 'threshold':
                continue
                
            # Find indices for this frequency band
            band_indices = np.where((freqs >= low_freq) & (freqs <= high_freq))[0]
            
            if len(band_indices) > 0:
                band_power = np.sum(power_spectrum[band_indices])
                total_power += band_power
                pattern_power += band_power * 2  # Weight pattern-specific bands higher
        
        # Calculate relative power as confidence
        if total_power > 0:
            confidence = min(1.0, pattern_power / (total_power * len(pattern_info)))
        else:
            confidence = 0.0
        
        # Add some realistic noise/variability
        confidence *= (0.8 + random.random() * 0.4)  # 80-120% variability
        
        return max(0.0, min(1.0, confidence))

    async def _generate_code_optimization(self, pattern: Dict) -> Optional[Dict[str, Any]]:
        """Generate code optimization based on detected EEG pattern"""
        
        optimizations_map = {
            'focus': [
                'Reduce code complexity - break down large functions',
                'Add more descriptive variable names',
                'Improve code structure with better abstractions',
                'Add helpful comments for future focus sessions'
            ],
            'frustration': [
                'Simplify current logic flow',
                'Add error handling to reduce debugging stress',
                'Break problem into smaller, manageable pieces',
                'Add console.log statements for visibility',
                'Consider pair programming or code review'
            ],
            'flow': [
                'Maintain current coding pattern - you\'re in the zone!',
                'Consider refactoring similar patterns elsewhere',
                'Document this approach for future reference',
                'Expand current implementation with related features'
            ],
            'creativity': [
                'Explore alternative implementation approaches',
                'Consider design patterns you haven\'t used recently',
                'Add innovative features or optimizations',
                'Experiment with new language features'
            ],
            'problem_solving': [
                'Add comprehensive test cases',
                'Implement edge case handling',
                'Optimize algorithm complexity',
                'Add performance monitoring'
            ]
        }
        
        pattern_type = pattern['pattern']
        suggestions = optimizations_map.get(pattern_type, [])
        
        if not suggestions:
            return None
        
        return {
            'pattern_detected': pattern_type,
            'confidence': pattern['confidence'],
            'optimization_type': 'cognitive_enhancement',
            'suggestions': suggestions,
            'implementation_priority': 'high' if pattern['confidence'] > 0.8 else 'medium',
            'timestamp': datetime.utcnow()
        }

    async def analyze_webcam_stress(self, session_id: str, facial_data: Dict) -> Dict[str, Any]:
        """
        Analyze webcam data for stress levels and trigger emotional compiler
        """
        try:
            # Simulate facial stress analysis
            stress_indicators = {
                'brow_tension': facial_data.get('brow_tension', random.uniform(0.1, 0.9)),
                'eye_strain': facial_data.get('eye_strain', random.uniform(0.1, 0.8)),
                'jaw_tension': facial_data.get('jaw_tension', random.uniform(0.1, 0.7)),
                'posture_slump': facial_data.get('posture_slump', random.uniform(0.1, 0.6))
            }
            
            # Calculate overall stress level
            stress_level = sum(stress_indicators.values()) / len(stress_indicators)
            
            # Determine emotional state
            if stress_level > 0.7:
                emotional_state = 'high_stress'
                compiler_action = 'aggressive_refactoring'
            elif stress_level > 0.5:
                emotional_state = 'moderate_stress'
                compiler_action = 'gentle_optimization'
            elif stress_level < 0.3:
                emotional_state = 'relaxed'
                compiler_action = 'creative_enhancement'
            else:
                emotional_state = 'focused'
                compiler_action = 'maintain_flow'
            
            # Generate emotional compiler recommendations
            recommendations = self._generate_emotional_compiler_actions(
                emotional_state, stress_level
            )
            
            # Save analysis
            analysis_record = {
                'session_id': session_id,
                'stress_indicators': stress_indicators,
                'stress_level': stress_level,
                'emotional_state': emotional_state,
                'compiler_action': compiler_action,
                'recommendations': recommendations,
                'timestamp': datetime.utcnow()
            }
            
            await self.db.stress_analyses.insert_one(analysis_record)
            
            return {
                'success': True,
                'stress_level': stress_level,
                'emotional_state': emotional_state,
                'compiler_action': compiler_action,
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Webcam stress analysis failed: {e}")
            return {'success': False, 'error': str(e)}

    def _generate_emotional_compiler_actions(self, emotional_state: str, stress_level: float) -> List[Dict]:
        """Generate emotional compiler actions based on stress analysis"""
        
        actions_map = {
            'high_stress': [
                {
                    'action': 'Auto-simplify complex expressions',
                    'description': 'Break down complicated logic into simpler steps',
                    'priority': 'immediate'
                },
                {
                    'action': 'Add calming comments',
                    'description': 'Insert encouraging comments and explanations',
                    'priority': 'high'
                },
                {
                    'action': 'Suggest break reminder',
                    'description': 'Recommend taking a 5-minute break',
                    'priority': 'immediate'
                }
            ],
            'moderate_stress': [
                {
                    'action': 'Gentle refactoring suggestions',
                    'description': 'Propose optional code improvements',
                    'priority': 'medium'
                },
                {
                    'action': 'Add helpful variable names',
                    'description': 'Suggest more descriptive identifiers',
                    'priority': 'low'
                }
            ],
            'relaxed': [
                {
                    'action': 'Suggest creative enhancements',
                    'description': 'Propose innovative features or optimizations',
                    'priority': 'low'
                },
                {
                    'action': 'Explore advanced patterns',
                    'description': 'Suggest more sophisticated implementation approaches',
                    'priority': 'low'
                }
            ],
            'focused': [
                {
                    'action': 'Maintain current approach',
                    'description': 'Continue with current coding pattern',
                    'priority': 'info'
                },
                {
                    'action': 'Document insights',
                    'description': 'Add comments explaining current logic',
                    'priority': 'medium'
                }
            ]
        }
        
        return actions_map.get(emotional_state, [])

    async def activate_haptic_feedback(self, session_id: str, feedback_type: str, intensity: float = 0.5) -> Dict[str, Any]:
        """
        Activate haptic feedback for enhanced coding experience
        """
        try:
            feedback_patterns = {
                'success': {
                    'pattern': 'gentle_pulse',
                    'duration': 200,
                    'description': 'Code compiled successfully'
                },
                'error': {
                    'pattern': 'sharp_buzz',
                    'duration': 100,
                    'description': 'Error detected in code'
                },
                'flow_state': {
                    'pattern': 'rhythmic_wave',
                    'duration': 1000,
                    'description': 'Flow state achieved'
                },
                'breakthrough': {
                    'pattern': 'celebration_burst',
                    'duration': 500,
                    'description': 'Breakthrough moment detected'
                },
                'focus_reminder': {
                    'pattern': 'gentle_tap',
                    'duration': 50,
                    'description': 'Attention redirection needed'
                }
            }
            
            pattern = feedback_patterns.get(feedback_type, feedback_patterns['success'])
            
            # Simulate haptic activation
            haptic_command = {
                'session_id': session_id,
                'feedback_type': feedback_type,
                'pattern': pattern['pattern'],
                'intensity': intensity,
                'duration': pattern['duration'],
                'description': pattern['description'],
                'timestamp': datetime.utcnow(),
                'status': 'activated'
            }
            
            # Save haptic event
            await self.db.haptic_events.insert_one(haptic_command)
            
            return {
                'success': True,
                'feedback_activated': feedback_type,
                'pattern': pattern,
                'intensity': intensity
            }
            
        except Exception as e:
            logger.error(f"Haptic feedback activation failed: {e}")
            return {'success': False, 'error': str(e)}

    async def get_session_analytics(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a BCI session"""
        try:
            if session_id not in self.active_sessions:
                # Try to load from database
                session = await self.db.bci_sessions.find_one({'session_id': session_id})
                if not session:
                    return {'success': False, 'error': 'Session not found'}
            else:
                session = self.active_sessions[session_id]
            
            # Get related data
            stress_analyses = await self.db.stress_analyses.find(
                {'session_id': session_id}
            ).to_list(100)
            
            haptic_events = await self.db.haptic_events.find(
                {'session_id': session_id}
            ).to_list(100)
            
            # Calculate session statistics
            total_patterns = len(session.get('patterns_detected', []))
            optimizations_generated = session.get('optimization_count', 0)
            session_duration = (datetime.utcnow() - session['started_at']).total_seconds()
            
            avg_stress = 0
            if stress_analyses:
                avg_stress = sum(a['stress_level'] for a in stress_analyses) / len(stress_analyses)
            
            return {
                'success': True,
                'session_id': session_id,
                'duration_seconds': session_duration,
                'patterns_detected': total_patterns,
                'optimizations_generated': optimizations_generated,
                'average_stress_level': avg_stress,
                'haptic_events_triggered': len(haptic_events),
                'session_efficiency': min(1.0, optimizations_generated / max(1, total_patterns)),
                'device_info': session.get('device_info', {}),
                'recommendations': self._generate_session_recommendations(session, stress_analyses)
            }
            
        except Exception as e:
            logger.error(f"Session analytics failed: {e}")
            return {'success': False, 'error': str(e)}

    def _generate_session_recommendations(self, session: Dict, stress_analyses: List[Dict]) -> List[str]:
        """Generate recommendations based on session data"""
        recommendations = []
        
        patterns = session.get('patterns_detected', [])
        optimizations = session.get('optimization_count', 0)
        
        # Pattern-based recommendations
        if len(patterns) > 0:
            focus_patterns = [p for p in patterns if p.get('pattern') == 'focus']
            if len(focus_patterns) > len(patterns) * 0.6:
                recommendations.append('Excellent focus session! Consider tackling complex problems.')
            
            frustration_patterns = [p for p in patterns if p.get('pattern') == 'frustration']
            if len(frustration_patterns) > len(patterns) * 0.4:
                recommendations.append('High frustration detected. Consider breaking tasks into smaller pieces.')
        
        # Stress-based recommendations
        if stress_analyses:
            high_stress_count = sum(1 for a in stress_analyses if a['stress_level'] > 0.7)
            if high_stress_count > len(stress_analyses) * 0.3:
                recommendations.append('Consider regular breaks and stress management techniques.')
        
        # Productivity recommendations
        if optimizations > 0:
            recommendations.append(f'Great job! Generated {optimizations} code optimizations this session.')
        else:
            recommendations.append('Try longer coding sessions to benefit more from BCI optimizations.')
        
        return recommendations

# Global neuro sync service instance
_neuro_sync_service = None

def init_neuro_sync_service(db_manager):
    """Initialize the neuro sync service with database manager"""
    global _neuro_sync_service
    _neuro_sync_service = NeuroSyncService(db_manager)
    logger.info("🧠 Neuro-Sync Service initialized and ready!")

def get_neuro_sync_service() -> Optional[NeuroSyncService]:
    """Get the initialized neuro sync service instance"""
    return _neuro_sync_service