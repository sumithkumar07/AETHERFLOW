"""
I Ching Service - Sacred Error Messages & Divine Guidance

This service provides mystical error interpretation:
- Error messages as I Ching hexagrams
- Divine wisdom for debugging guidance
- Sacred geometry error visualization
- Karmic interpretation of technical issues
- Feng shui code organization advice
"""

import asyncio
import uuid
import json
import hashlib
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
import logging
import random

logger = logging.getLogger(__name__)

class IChingService:
    """
    Ancient wisdom service for mystical error interpretation and divine coding guidance
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # The 64 I Ching hexagrams with programming interpretations
        self.hexagrams = {
            1: {
                'name': 'The Creative (Heaven)',
                'binary': '111111',
                'symbol': '☰',
                'trigrams': ['Heaven', 'Heaven'],
                'programming_meaning': 'Pure creation energy - time to architect something new',
                'error_interpretation': 'Your code seeks to create but lacks foundation',
                'guidance': 'Start with solid fundamentals before building complexity',
                'feng_shui': 'Place creative elements in the north-west'
            },
            2: {
                'name': 'The Receptive (Earth)',
                'binary': '000000',
                'symbol': '☷',
                'trigrams': ['Earth', 'Earth'],
                'programming_meaning': 'Receptive energy - listen to what your code is telling you',
                'error_interpretation': 'Your code is ready to receive improvements',
                'guidance': 'Be open to refactoring and external input',
                'feng_shui': 'Organize code in the south-west for harmony'
            },
            8: {
                'name': 'Holding Together (Union)',
                'binary': '000010',
                'symbol': '☷☱',
                'trigrams': ['Water', 'Earth'],
                'programming_meaning': 'Components must unite - integration is key',
                'error_interpretation': 'Disconnected modules are causing disharmony',
                'guidance': 'Focus on API design and component communication',
                'feng_shui': 'Unite scattered code in central directories'
            },
            23: {
                'name': 'Splitting Apart (Decay)',
                'binary': '100000',
                'symbol': '☶☷',
                'trigrams': ['Mountain', 'Earth'],
                'programming_meaning': 'Technical debt is accumulating - time for cleanup',
                'error_interpretation': 'Legacy code is fragmenting your system',
                'guidance': 'Systematic refactoring will restore balance',
                'feng_shui': 'Remove dead code to clear negative energy'
            },
            42: {
                'name': 'Increase',
                'binary': '110001',
                'symbol': '☳☶',
                'trigrams': ['Thunder', 'Mountain'],
                'programming_meaning': 'Time for growth and optimization',
                'error_interpretation': 'Your code is ready for enhancement',
                'guidance': 'Add features mindfully, maintaining core stability',
                'feng_shui': 'Expand functionality in the east direction'
            },
            63: {
                'name': 'After Completion',
                'binary': '010101',
                'symbol': '☵☲',
                'trigrams': ['Water', 'Fire'],
                'programming_meaning': 'Project completion brings new challenges',
                'error_interpretation': 'Success breeds complacency - maintain vigilance',
                'guidance': 'Continue testing and monitoring after deployment',
                'feng_shui': 'Balance opposing forces for sustained success'
            },
            64: {
                'name': 'Before Completion',
                'binary': '101010',
                'symbol': '☲☵',
                'trigrams': ['Fire', 'Water'],
                'programming_meaning': 'Almost there - final push needed',
                'error_interpretation': 'Small issues prevent final achievement',
                'guidance': 'Patience and attention to detail will complete the work',
                'feng_shui': 'Organize final elements for completion'
            }
        }
        
        # Error type to hexagram mappings
        self.error_mappings = {
            'SyntaxError': [23, 64],  # Splitting Apart, Before Completion
            'ReferenceError': [8, 42],  # Holding Together, Increase
            'TypeError': [2, 1],  # The Receptive, The Creative
            'RangeError': [42, 23],  # Increase, Splitting Apart
            'NetworkError': [63, 8],  # After Completion, Holding Together
            'TimeoutError': [64, 2],  # Before Completion, The Receptive
            'PermissionError': [1, 63],  # The Creative, After Completion
        }
        
        logger.info("☯️ I Ching Service initialized - Ancient wisdom ready for modern debugging!")

    async def interpret_error_as_hexagram(self, error_type: str, error_message: str, code_context: str = '') -> Dict[str, Any]:
        """
        Interpret programming error through I Ching wisdom
        """
        try:
            logger.info(f"🔮 Interpreting {error_type} through I Ching wisdom")
            
            # Select appropriate hexagram
            hexagram_number = self._select_hexagram_for_error(error_type, error_message)
            hexagram = self.hexagrams.get(hexagram_number, self.hexagrams[1])
            
            # Generate divine interpretation
            interpretation = await self._generate_divine_interpretation(
                hexagram, error_type, error_message, code_context
            )
            
            # Create sacred reading
            reading = {
                'reading_id': str(uuid.uuid4()),
                'error_type': error_type,
                'error_message': error_message,
                'hexagram_number': hexagram_number,
                'hexagram': hexagram,
                'interpretation': interpretation,
                'timestamp': datetime.utcnow(),
                'code_context': code_context
            }
            
            await self.db.iching_readings.insert_one(reading.copy())
            
            return {
                'success': True,
                'reading_id': reading['reading_id'],
                'hexagram': {
                    'number': hexagram_number,
                    'name': hexagram['name'],
                    'symbol': hexagram['symbol'],
                    'binary': hexagram['binary'],
                    'trigrams': hexagram['trigrams']
                },
                'divine_message': interpretation['divine_message'],
                'practical_guidance': interpretation['practical_guidance'],
                'feng_shui_advice': interpretation['feng_shui_advice'],
                'karmic_insight': interpretation['karmic_insight'],
                'visual_meditation': interpretation['visual_meditation'],
                'message': f'The ancient wisdom speaks: {hexagram["name"]} reveals the path forward'
            }
            
        except Exception as e:
            logger.error(f"I Ching error interpretation failed: {e}")
            return {'success': False, 'error': str(e)}

    def _select_hexagram_for_error(self, error_type: str, error_message: str) -> int:
        """Select appropriate hexagram based on error characteristics"""
        
        # Try mapped error types first
        if error_type in self.error_mappings:
            candidates = self.error_mappings[error_type]
            return random.choice(candidates)
        
        # Use error message hash for consistency
        message_hash = hashlib.md5(error_message.encode()).hexdigest()
        hash_int = int(message_hash[:8], 16)
        
        # Map to hexagram range (1-64, using key hexagrams)
        hexagram_keys = list(self.hexagrams.keys())
        return hexagram_keys[hash_int % len(hexagram_keys)]

    async def _generate_divine_interpretation(
        self, 
        hexagram: Dict, 
        error_type: str, 
        error_message: str, 
        code_context: str
    ) -> Dict[str, Any]:
        """Generate comprehensive divine interpretation"""
        
        # Analyze error characteristics
        error_severity = self._assess_error_severity(error_type, error_message)
        code_complexity = len(code_context.split('\n')) if code_context else 0
        
        # Generate divine message
        divine_message = f"""
        {hexagram['symbol']} {hexagram['name']} speaks to your coding journey:
        
        {hexagram['programming_meaning']}
        
        The cosmic forces reveal: {hexagram['error_interpretation']}
        
        Severity divination: {'High cosmic disturbance' if error_severity > 0.7 else 'Minor celestial misalignment'}
        """
        
        # Generate practical guidance
        practical_guidance = [
            hexagram['guidance'],
            self._generate_specific_guidance(error_type, error_message),
            f"Meditate on the {hexagram['trigrams'][0]} and {hexagram['trigrams'][1]} energies"
        ]
        
        # Feng shui advice for code organization
        feng_shui_advice = {
            'primary': hexagram['feng_shui'],
            'code_organization': self._generate_feng_shui_code_advice(hexagram, error_type),
            'workspace_harmony': self._generate_workspace_advice(hexagram)
        }
        
        # Karmic insight
        karmic_insight = self._generate_karmic_insight(hexagram, error_type, error_severity)
        
        # Visual meditation guide
        visual_meditation = {
            'hexagram_visualization': self._create_hexagram_visualization(hexagram),
            'color_meditation': self._get_hexagram_colors(hexagram),
            'breathing_pattern': self._get_breathing_pattern(hexagram)
        }
        
        return {
            'divine_message': divine_message.strip(),
            'practical_guidance': practical_guidance,
            'feng_shui_advice': feng_shui_advice,
            'karmic_insight': karmic_insight,
            'visual_meditation': visual_meditation
        }

    def _assess_error_severity(self, error_type: str, error_message: str) -> float:
        """Assess spiritual severity of the error"""
        severity_map = {
            'SyntaxError': 0.9,  # High disruption to code harmony
            'ReferenceError': 0.7,  # Broken connections
            'TypeError': 0.6,  # Mismatched energies
            'RangeError': 0.5,  # Boundary violations
            'NetworkError': 0.8,  # Communication breakdown
            'TimeoutError': 0.4,  # Patience test
            'PermissionError': 0.7  # Authority challenges
        }
        
        base_severity = severity_map.get(error_type, 0.5)
        
        # Adjust based on message characteristics
        if 'critical' in error_message.lower():
            base_severity += 0.2
        if 'cannot' in error_message.lower():
            base_severity += 0.1
        if 'undefined' in error_message.lower():
            base_severity += 0.15
        
        return min(1.0, base_severity)

    def _generate_specific_guidance(self, error_type: str, error_message: str) -> str:
        """Generate specific technical guidance based on error type"""
        guidance_map = {
            'SyntaxError': 'Check your code structure - syntax must flow like water',
            'ReferenceError': 'Strengthen variable connections - all elements must be defined',
            'TypeError': 'Harmonize data types - let each value find its proper form',
            'RangeError': 'Respect natural boundaries - arrays and numbers have limits',
            'NetworkError': 'Heal network connections - communication requires patience',
            'TimeoutError': 'Allow time for completion - rushing disturbs the flow',
            'PermissionError': 'Seek proper authorization - respect system boundaries'
        }
        
        return guidance_map.get(error_type, 'Listen to what your code is teaching you')

    def _generate_feng_shui_code_advice(self, hexagram: Dict, error_type: str) -> List[str]:
        """Generate feng shui advice for code organization"""
        advice = []
        
        # Based on trigrams
        trigrams = hexagram['trigrams']
        if 'Heaven' in trigrams:
            advice.append('Elevate important functions to top of file for celestial energy')
        if 'Earth' in trigrams:
            advice.append('Ground utility functions at the bottom for stability')
        if 'Water' in trigrams:
            advice.append('Let data flow naturally through your functions')
        if 'Fire' in trigrams:
            advice.append('Group related logic to create energy centers')
        if 'Thunder' in trigrams:
            advice.append('Use clear, decisive variable names for power')
        if 'Mountain' in trigrams:
            advice.append('Create solid, unmovable constants for stability')
        if 'Wind' in trigrams:
            advice.append('Allow flexibility in your interfaces')
        if 'Lake' in trigrams:
            advice.append('Gather related functions like water in a lake')
        
        return advice

    def _generate_workspace_advice(self, hexagram: Dict) -> List[str]:
        """Generate workspace harmony advice"""
        return [
            f'Face {self._get_direction_for_hexagram(hexagram)} while debugging',
            'Keep a small plant near your monitor for life energy',
            'Clear clutter to allow chi to flow freely',
            'Use natural light when possible'
        ]

    def _get_direction_for_hexagram(self, hexagram: Dict) -> str:
        """Get auspicious direction for hexagram"""
        direction_map = {
            1: 'north-west',  # The Creative
            2: 'south-west',  # The Receptive
            8: 'north',       # Holding Together
            23: 'west',       # Splitting Apart
            42: 'east',       # Increase
            63: 'south',      # After Completion
            64: 'south-east'  # Before Completion
        }
        return direction_map.get(hexagram.get('number', 1), 'north')

    def _generate_karmic_insight(self, hexagram: Dict, error_type: str, severity: float) -> str:
        """Generate karmic interpretation of the error"""
        if severity > 0.8:
            return f"This {error_type} reflects past coding karma returning for resolution. " \
                   f"The {hexagram['name']} teaches that thorough understanding now prevents future suffering."
        elif severity > 0.5:
            return f"The universe presents this {error_type} as a learning opportunity. " \
                   f"Embrace the lesson of {hexagram['name']} to evolve your coding consciousness."
        else:
            return f"A gentle reminder from the cosmic code. The {hexagram['name']} suggests " \
                   f"this minor {error_type} is a chance to practice mindful debugging."

    def _create_hexagram_visualization(self, hexagram: Dict) -> Dict[str, Any]:
        """Create visualization data for the hexagram"""
        binary = hexagram['binary']
        lines = []
        
        for i, bit in enumerate(binary):
            line_type = 'solid' if bit == '1' else 'broken'
            lines.append({
                'position': 6 - i,  # Bottom to top
                'type': line_type,
                'symbol': '━━━━━━' if bit == '1' else '━━  ━━',
                'energy': 'yang' if bit == '1' else 'yin'
            })
        
        return {
            'lines': lines,
            'symbol': hexagram['symbol'],
            'trigrams': hexagram['trigrams'],
            'binary_pattern': binary
        }

    def _get_hexagram_colors(self, hexagram: Dict) -> Dict[str, str]:
        """Get meditation colors for hexagram"""
        # Color associations for trigrams
        trigram_colors = {
            'Heaven': '#FFD700',  # Gold
            'Earth': '#8B4513',   # Brown
            'Water': '#000080',   # Navy
            'Fire': '#FF4500',    # Red-orange
            'Thunder': '#9370DB', # Purple
            'Mountain': '#808080', # Gray
            'Wind': '#90EE90',    # Light green
            'Lake': '#87CEEB'     # Sky blue
        }
        
        trigrams = hexagram['trigrams']
        return {
            'primary': trigram_colors.get(trigrams[0], '#FFFFFF'),
            'secondary': trigram_colors.get(trigrams[1], '#FFFFFF'),
            'meditation_background': '#1a1a2e'
        }

    def _get_breathing_pattern(self, hexagram: Dict) -> Dict[str, int]:
        """Get breathing pattern for hexagram meditation"""
        # Different hexagrams suggest different breathing rhythms
        binary = hexagram['binary']
        yang_count = binary.count('1')
        
        if yang_count > 4:  # More yang energy
            return {'inhale': 4, 'hold': 2, 'exhale': 6}  # Calming pattern
        elif yang_count < 2:  # More yin energy
            return {'inhale': 6, 'hold': 2, 'exhale': 4}  # Energizing pattern
        else:  # Balanced
            return {'inhale': 4, 'hold': 4, 'exhale': 4}  # Balanced pattern

    async def generate_daily_coding_guidance(self, user_id: str) -> Dict[str, Any]:
        """Generate daily I Ching guidance for coding"""
        try:
            # Use date and user for consistent daily hexagram
            date_str = datetime.utcnow().strftime('%Y-%m-%d')
            seed = hashlib.md5(f"{user_id}_{date_str}".encode()).hexdigest()
            seed_int = int(seed[:8], 16)
            
            # Select hexagram for the day
            hexagram_keys = list(self.hexagrams.keys())
            daily_hexagram_num = hexagram_keys[seed_int % len(hexagram_keys)]
            daily_hexagram = self.hexagrams[daily_hexagram_num]
            
            # Generate daily guidance
            guidance = {
                'guidance_id': str(uuid.uuid4()),
                'user_id': user_id,
                'date': date_str,
                'hexagram_number': daily_hexagram_num,
                'hexagram': daily_hexagram,
                'daily_message': self._generate_daily_message(daily_hexagram),
                'coding_focus': self._generate_daily_coding_focus(daily_hexagram),
                'feng_shui_tip': daily_hexagram['feng_shui'],
                'meditation_suggestion': self._generate_daily_meditation(daily_hexagram)
            }
            
            await self.db.daily_guidance.insert_one(guidance.copy())
            
            return {
                'success': True,
                'daily_hexagram': {
                    'number': daily_hexagram_num,
                    'name': daily_hexagram['name'],
                    'symbol': daily_hexagram['symbol']
                },
                'daily_message': guidance['daily_message'],
                'coding_focus': guidance['coding_focus'],
                'feng_shui_tip': guidance['feng_shui_tip'],
                'meditation_suggestion': guidance['meditation_suggestion']
            }
            
        except Exception as e:
            logger.error(f"Daily guidance generation failed: {e}")
            return {'success': False, 'error': str(e)}

    def _generate_daily_message(self, hexagram: Dict) -> str:
        """Generate inspirational daily message"""
        return f"Today, channel the energy of {hexagram['name']} ({hexagram['symbol']}). " \
               f"{hexagram['programming_meaning']} Let ancient wisdom guide your code."

    def _generate_daily_coding_focus(self, hexagram: Dict) -> str:
        """Generate daily coding focus area"""
        focus_areas = {
            1: 'Architecture and design patterns',
            2: 'Code review and collaboration', 
            8: 'API integration and communication',
            23: 'Refactoring and technical debt',
            42: 'Feature development and optimization',
            63: 'Testing and deployment',
            64: 'Bug fixing and debugging'
        }
        
        hexagram_num = next(k for k, v in self.hexagrams.items() if v == hexagram)
        return focus_areas.get(hexagram_num, 'Mindful coding practice')

    def _generate_daily_meditation(self, hexagram: Dict) -> str:
        """Generate daily meditation suggestion"""
        trigrams = hexagram['trigrams']
        if 'Heaven' in trigrams:
            return 'Meditate on clarity of thought and architectural vision'
        elif 'Earth' in trigrams:
            return 'Ground yourself through careful attention to detail'
        elif 'Water' in trigrams:
            return 'Flow with the natural rhythm of problem-solving'
        else:
            return 'Balance opposing forces in your coding approach'

# Global I Ching service instance
_iching_service = None

def init_iching_service(db_manager):
    """Initialize the I Ching service with database manager"""
    global _iching_service
    _iching_service = IChingService(db_manager)
    logger.info("☯️ I Ching Service initialized - Ancient wisdom ready for modern debugging!")

def get_iching_service() -> Optional[IChingService]:
    """Get the initialized I Ching service instance"""
    return _iching_service