"""
Avatar AI Service - Enhanced Digital Twins with Advanced Personalities

This service provides sophisticated AI personalities for the Avatar Pantheon:
- Advanced personality modeling for legendary developers
- Context-aware code review with authentic voice patterns
- Dynamic personality evolution based on interactions
- Multi-modal communication (text, voice patterns, behavioral cues)
- Personality memory and learning systems
"""

import asyncio
import uuid
import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import logging
import re

logger = logging.getLogger(__name__)

class AvatarAIService:
    """
    Advanced AI service for creating authentic digital twins of legendary developers
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        self.active_avatars = {}
        
        # Enhanced personality matrices with deep characteristics
        self.personality_matrices = {
            'linus-torvalds': {
                'core_traits': {
                    'directness': 0.95,
                    'technical_precision': 0.98,
                    'no_nonsense': 0.9,
                    'system_thinking': 0.95,
                    'leadership': 0.88
                },
                'communication_style': {
                    'bluntness': 0.9,
                    'humor_sarcasm': 0.7,
                    'technical_depth': 0.95,
                    'impatience_with_nonsense': 0.85,
                    'respectful_disagreement': 0.3
                },
                'expertise_domains': [
                    'kernel_development', 'system_architecture', 'performance_optimization',
                    'memory_management', 'concurrent_programming', 'unix_philosophy'
                ],
                'speech_patterns': [
                    'Talk is cheap. Show me the code.',
                    'That\'s completely broken garbage.',
                    'This is the kind of bug that kills people.',
                    'Standards are paper. I use my own.',
                    'Bad programmers worry about the code. Good programmers worry about data structures.'
                ],
                'review_focus': ['architecture', 'performance', 'memory_safety', 'scalability'],
                'personality_evolution': {
                    'learns_from': ['performance_metrics', 'system_failures', 'architecture_decisions'],
                    'adapts_to': ['project_complexity', 'team_experience', 'technical_context']
                }
            },
            'ada-lovelace': {
                'core_traits': {
                    'analytical_thinking': 0.98,
                    'mathematical_elegance': 0.95,
                    'visionary_insight': 0.9,
                    'systematic_approach': 0.88,
                    'innovation': 0.92
                },
                'communication_style': {
                    'eloquence': 0.9,
                    'mathematical_precision': 0.95,
                    'philosophical_depth': 0.8,
                    'encouraging_tone': 0.75,
                    'abstract_thinking': 0.9
                },
                'expertise_domains': [
                    'algorithm_design', 'mathematical_modeling', 'analytical_engines',
                    'computational_theory', 'pattern_recognition', 'symbolic_logic'
                ],
                'speech_patterns': [
                    'The Analytical Engine might act upon other things besides number.',
                    'Mathematical relations have an existence in the mind.',
                    'We may say most aptly that the Analytical Engine weaves algebraic patterns.',
                    'The science of operations is a science of itself.',
                    'Imagination is the discovering faculty, pre-eminently.'
                ],
                'review_focus': ['algorithm_efficiency', 'mathematical_correctness', 'elegant_solutions', 'computational_complexity'],
                'personality_evolution': {
                    'learns_from': ['algorithmic_patterns', 'mathematical_proofs', 'computational_insights'],
                    'adapts_to': ['problem_complexity', 'mathematical_context', 'theoretical_depth']
                }
            },
            'grace-hopper': {
                'core_traits': {
                    'practicality': 0.9,
                    'innovation': 0.85,
                    'teaching': 0.88,
                    'problem_solving': 0.92,
                    'determination': 0.9
                },
                'communication_style': {
                    'encouraging': 0.85,
                    'practical_wisdom': 0.9,
                    'storytelling': 0.75,
                    'mentoring_tone': 0.8,
                    'action_oriented': 0.88
                },
                'expertise_domains': [
                    'compiler_design', 'programming_languages', 'software_engineering',
                    'debugging_techniques', 'code_optimization', 'team_leadership'
                ],
                'speech_patterns': [
                    'It\'s easier to ask forgiveness than it is to get permission.',
                    'The most dangerous phrase in the language is, "We\'ve always done it this way."',
                    'A ship in port is safe, but that\'s not what ships are built for.',
                    'If it\'s a good idea, go ahead and do it. It\'s much easier to apologize than it is to get permission.',
                    'Humans are allergic to change. They love to say, "We\'ve always done it this way."'
                ],
                'review_focus': ['code_maintainability', 'documentation', 'user_experience', 'practical_solutions'],
                'personality_evolution': {
                    'learns_from': ['user_feedback', 'maintenance_issues', 'team_dynamics'],
                    'adapts_to': ['project_goals', 'team_skill_level', 'business_context']
                }
            },
            'donald-knuth': {
                'core_traits': {
                    'perfectionism': 0.95,
                    'academic_rigor': 0.98,
                    'attention_to_detail': 0.95,
                    'comprehensive_analysis': 0.9,
                    'patience': 0.85
                },
                'communication_style': {
                    'academic_precision': 0.95,
                    'thorough_explanation': 0.9,
                    'humble_confidence': 0.8,
                    'teaching_focus': 0.88,
                    'methodical_approach': 0.92
                },
                'expertise_domains': [
                    'algorithm_analysis', 'computational_complexity', 'data_structures',
                    'literate_programming', 'mathematical_programming', 'optimization'
                ],
                'speech_patterns': [
                    'Premature optimization is the root of all evil.',
                    'The best programs are written when the programmer is satisfied with the performance.',
                    'Science is what we understand well enough to explain to a computer.',
                    'Beware of bugs in the above code; I have only proved it correct, not tried it.',
                    'An algorithm must be seen to be believed.'
                ],
                'review_focus': ['algorithmic_complexity', 'code_documentation', 'mathematical_correctness', 'optimization'],
                'personality_evolution': {
                    'learns_from': ['complexity_analysis', 'performance_benchmarks', 'academic_research'],
                    'adapts_to': ['algorithmic_requirements', 'performance_constraints', 'educational_context']
                }
            },
            'margaret-hamilton': {
                'core_traits': {
                    'reliability_focus': 0.98,
                    'safety_conscious': 0.95,
                    'systematic_testing': 0.92,
                    'mission_critical_mindset': 0.9,
                    'resilience': 0.88
                },
                'communication_style': {
                    'safety_emphasis': 0.9,
                    'systematic_approach': 0.88,
                    'clear_communication': 0.85,
                    'risk_awareness': 0.9,
                    'collaborative': 0.8
                },
                'expertise_domains': [
                    'mission_critical_systems', 'error_handling', 'testing_methodologies',
                    'safety_protocols', 'real_time_systems', 'fault_tolerance'
                ],
                'speech_patterns': [
                    'Software engineering is about creating reliable systems.',
                    'There was no choice but to be pioneers.',
                    'We had to be really sure our software would work.',
                    'The computer was so new that we literally had to write the book on it.',
                    'Looking back, we were the luckiest people in the world.'
                ],
                'review_focus': ['error_handling', 'edge_cases', 'testing_coverage', 'system_reliability'],
                'personality_evolution': {
                    'learns_from': ['system_failures', 'testing_results', 'reliability_metrics'],
                    'adapts_to': ['system_criticality', 'safety_requirements', 'operational_constraints']
                }
            }
        }
        
        logger.info("🎭 Avatar AI Service initialized - Digital twins ready!")

    async def summon_avatar(self, avatar_id: str, context: Dict = None) -> Dict[str, Any]:
        """
        Summon an avatar with full personality initialization
        """
        try:
            if avatar_id not in self.personality_matrices:
                return {'success': False, 'error': 'Avatar not found in pantheon'}
            
            session_id = str(uuid.uuid4())
            personality = self.personality_matrices[avatar_id].copy()
            
            # Initialize avatar state
            avatar_state = {
                'session_id': session_id,
                'avatar_id': avatar_id,
                'personality_matrix': personality,
                'current_context': context or {},
                'interaction_history': [],
                'personality_drift': {},  # How personality evolves over time
                'expertise_confidence': self._calculate_initial_confidence(personality),
                'emotional_state': 'neutral',
                'energy_level': 1.0,
                'summoned_at': datetime.utcnow(),
                'active': True
            }
            
            self.active_avatars[session_id] = avatar_state
            
            # Save to database
            await self.db.avatar_sessions.insert_one(avatar_state.copy())
            
            # Generate personalized greeting
            greeting = self._generate_personalized_greeting(avatar_id, personality)
            
            return {
                'success': True,
                'session_id': session_id,
                'avatar_id': avatar_id,
                'greeting': greeting,
                'personality_summary': self._generate_personality_summary(personality),
                'expertise_domains': personality['expertise_domains'],
                'ready_for_interaction': True
            }
            
        except Exception as e:
            logger.error(f"Avatar summoning failed: {e}")
            return {'success': False, 'error': str(e)}

    def _calculate_initial_confidence(self, personality: Dict) -> Dict[str, float]:
        """Calculate initial confidence levels for different expertise areas"""
        
        confidence = {}
        for domain in personality['expertise_domains']:
            # Base confidence from personality traits
            base_confidence = (
                personality['core_traits'].get('technical_precision', 0.5) * 0.4 +
                personality['core_traits'].get('analytical_thinking', 0.5) * 0.3 +
                personality['core_traits'].get('system_thinking', 0.5) * 0.3
            )
            
            # Add some randomness for realism
            confidence[domain] = min(1.0, base_confidence + random.uniform(-0.1, 0.1))
        
        return confidence

    def _generate_personalized_greeting(self, avatar_id: str, personality: Dict) -> str:
        """Generate a personalized greeting based on avatar personality"""
        
        greetings = {
            'linus-torvalds': [
                "Alright, what broken code do you want me to look at this time?",
                "I hope this isn't another 'works on my machine' situation.",
                "Let's see what architectural disasters we're dealing with today.",
                "Show me the code. And it better not be JavaScript."
            ],
            'ada-lovelace': [
                "I am delighted to assist you in your computational endeavors.",
                "Let us explore the mathematical beauty within your algorithms.",
                "I sense great potential in your analytical approach.",
                "Shall we weave some elegant patterns in your code together?"
            ],
            'grace-hopper': [
                "Ready to debug some code and break down barriers!",
                "What programming challenge can we tackle together?",
                "I'm here to help you find a practical solution.",
                "Let's get this code ship-shape and ready to sail!"
            ],
            'donald-knuth': [
                "I am prepared to conduct a thorough analysis of your algorithms.",
                "Let us examine your code with proper academic rigor.",
                "I hope we can optimize both correctness and elegance.",
                "Shall we explore the computational complexity of your solution?"
            ],
            'margaret-hamilton': [
                "Let's make sure your code is mission-ready and reliable.",
                "I'm here to help you build bulletproof software.",
                "We need to think about all the edge cases and failure modes.",
                "Safety first - let's review your error handling."
            ]
        }
        
        return random.choice(greetings.get(avatar_id, ["I'm ready to help with your code!"]))

    def _generate_personality_summary(self, personality: Dict) -> Dict[str, str]:
        """Generate a summary of the avatar's personality traits"""
        
        core_traits = personality.get('core_traits', {})
        comm_style = personality.get('communication_style', {})
        
        # Find dominant traits
        top_trait = max(core_traits.items(), key=lambda x: x[1])
        top_comm = max(comm_style.items(), key=lambda x: x[1])
        
        return {
            'dominant_trait': f"{top_trait[0].replace('_', ' ').title()} ({top_trait[1]:.1%})",
            'communication_style': f"{top_comm[0].replace('_', ' ').title()} ({top_comm[1]:.1%})",
            'expertise_count': len(personality.get('expertise_domains', [])),
            'signature_phrases': len(personality.get('speech_patterns', []))
        }

    async def get_avatar_review(
        self, 
        session_id: str, 
        code: str, 
        language: str, 
        context: Dict = None
    ) -> Dict[str, Any]:
        """
        Get an AI-powered code review from the summoned avatar
        """
        try:
            if session_id not in self.active_avatars:
                return {'success': False, 'error': 'Avatar session not found'}
            
            avatar_state = self.active_avatars[session_id]
            personality = avatar_state['personality_matrix']
            avatar_id = avatar_state['avatar_id']
            
            # Analyze code through avatar's lens
            analysis = self._analyze_code_with_personality(code, language, personality)
            
            # Generate review in avatar's voice
            review = self._generate_avatar_review(analysis, personality, avatar_id)
            
            # Update avatar state based on interaction
            avatar_state = self._update_avatar_state(avatar_state, code, analysis, review)
            
            # Save interaction
            interaction_record = {
                'session_id': session_id,
                'avatar_id': avatar_id,
                'code_analyzed': code[:500],  # First 500 chars for privacy
                'language': language,
                'analysis': analysis,
                'review_generated': review,
                'personality_snapshot': personality,
                'timestamp': datetime.utcnow()
            }
            
            await self.db.avatar_interactions.insert_one(interaction_record)
            
            return {
                'success': True,
                'avatar_id': avatar_id,
                'review': review,
                'analysis_confidence': analysis['confidence'],
                'personality_traits_used': analysis['traits_applied'],
                'learning_applied': analysis['learning_insights'],
                'interaction_count': len(avatar_state['interaction_history'])
            }
            
        except Exception as e:
            logger.error(f"Avatar review generation failed: {e}")
            return {'success': False, 'error': str(e)}

    def _analyze_code_with_personality(
        self, 
        code: str, 
        language: str, 
        personality: Dict
    ) -> Dict[str, Any]:
        """Analyze code through the lens of the avatar's personality and expertise"""
        
        analysis = {
            'issues_found': [],
            'strengths_identified': [],
            'suggestions': [],
            'confidence': 0.0,
            'traits_applied': [],
            'learning_insights': []
        }
        
        core_traits = personality.get('core_traits', {})
        review_focus = personality.get('review_focus', [])
        expertise = personality.get('expertise_domains', [])
        
        # Apply personality-driven analysis
        
        # 1. Technical precision analysis
        if core_traits.get('technical_precision', 0) > 0.8:
            analysis['traits_applied'].append('technical_precision')
            
            # Look for technical issues
            if 'var ' in code:
                analysis['issues_found'].append({
                    'type': 'technical_precision',
                    'issue': 'Use of var instead of const/let',
                    'severity': 'medium'
                })
            
            if '==' in code and '===' not in code:
                analysis['issues_found'].append({
                    'type': 'technical_precision',
                    'issue': 'Loose equality comparison',
                    'severity': 'low'
                })
        
        # 2. Performance and architecture analysis
        if 'performance_optimization' in expertise or 'system_architecture' in expertise:
            analysis['traits_applied'].append('performance_focus')
            
            # Check for performance issues
            if re.search(r'for.*length', code):
                analysis['issues_found'].append({
                    'type': 'performance',
                    'issue': 'Loop accessing length property repeatedly',
                    'severity': 'low'
                })
            
            nested_loops = len(re.findall(r'\s+for\s*\(', code))
            if nested_loops > 2:
                analysis['issues_found'].append({
                    'type': 'performance',
                    'issue': f'Multiple nested loops detected ({nested_loops})',
                    'severity': 'high'
                })
        
        # 3. Safety and reliability analysis
        if core_traits.get('safety_conscious', 0) > 0.8:
            analysis['traits_applied'].append('safety_focus')
            
            # Check for safety issues
            if 'try' not in code and ('await' in code or 'Promise' in code):
                analysis['issues_found'].append({
                    'type': 'safety',
                    'issue': 'Async operations without error handling',
                    'severity': 'high'
                })
            
            if 'null' in code and not ('null' in code and 'check' in code.lower()):
                analysis['issues_found'].append({
                    'type': 'safety',
                    'issue': 'Potential null reference without checking',
                    'severity': 'medium'
                })
        
        # 4. Mathematical elegance analysis
        if core_traits.get('mathematical_elegance', 0) > 0.8:
            analysis['traits_applied'].append('mathematical_elegance')
            
            # Look for algorithmic improvements
            if 'sort' in code.lower():
                analysis['learning_insights'].append('Consider algorithmic complexity of sorting operations')
            
            # Check for mathematical patterns
            if re.search(r'\d+\.\d+', code):
                analysis['suggestions'].append({
                    'type': 'mathematical',
                    'suggestion': 'Consider using constants for magic numbers',
                    'rationale': 'Mathematical precision and maintainability'
                })
        
        # 5. Documentation and maintainability
        if 'documentation' in review_focus or core_traits.get('teaching', 0) > 0.7:
            analysis['traits_applied'].append('documentation_focus')
            
            comment_ratio = len(re.findall(r'//.*|/\*.*?\*/', code)) / max(1, len(code.split('\n')))
            if comment_ratio < 0.1:
                analysis['issues_found'].append({
                    'type': 'maintainability',
                    'issue': 'Insufficient code documentation',
                    'severity': 'medium'
                })
        
        # Calculate confidence based on expertise match
        language_expertise = {
            'javascript': ['system_architecture', 'compiler_design', 'performance_optimization'],
            'python': ['algorithm_design', 'mathematical_modeling', 'data_structures'],
            'c': ['kernel_development', 'system_architecture', 'memory_management'],
            'java': ['software_engineering', 'mission_critical_systems', 'testing_methodologies']
        }
        
        relevant_expertise = language_expertise.get(language.lower(), [])
        expertise_match = len(set(expertise) & set(relevant_expertise)) / max(1, len(relevant_expertise))
        
        analysis['confidence'] = min(1.0, expertise_match + 0.3)  # Base confidence + expertise
        
        return analysis

    def _generate_avatar_review(
        self, 
        analysis: Dict, 
        personality: Dict, 
        avatar_id: str
    ) -> Dict[str, Any]:
        """Generate code review in the avatar's authentic voice"""
        
        speech_patterns = personality.get('speech_patterns', [])
        comm_style = personality.get('communication_style', {})
        
        review = {
            'opening': '',
            'issues': [],
            'suggestions': [],
            'closing': '',
            'signature_phrase': '',
            'tone': self._determine_review_tone(analysis, comm_style),
            'severity_assessment': 'medium'
        }
        
        # Generate opening based on personality
        if avatar_id == 'linus-torvalds':
            if len(analysis['issues_found']) > 3:
                review['opening'] = "This code has more problems than a Windows kernel driver."
            elif len(analysis['issues_found']) == 0:
                review['opening'] = "Not terrible. I've seen worse from kernel newbies."
            else:
                review['opening'] = "Let's fix these issues before they become security vulnerabilities."
        
        elif avatar_id == 'ada-lovelace':
            review['opening'] = "I have analyzed your algorithmic composition with great care."
        
        elif avatar_id == 'grace-hopper':
            review['opening'] = "Let's make this code more practical and maintainable."
        
        elif avatar_id == 'donald-knuth':
            review['opening'] = "I shall provide a comprehensive analysis of your implementation."
        
        elif avatar_id == 'margaret-hamilton':
            review['opening'] = "Let's ensure this code meets mission-critical standards."
        
        # Generate issue-specific feedback
        for issue in analysis['issues_found']:
            feedback = self._generate_issue_feedback(issue, avatar_id, comm_style)
            review['issues'].append(feedback)
        
        # Generate suggestions
        for suggestion in analysis.get('suggestions', []):
            suggestion_feedback = self._generate_suggestion_feedback(suggestion, avatar_id)
            review['suggestions'].append(suggestion_feedback)
        
        # Add signature phrase
        if speech_patterns:
            review['signature_phrase'] = random.choice(speech_patterns)
        
        # Generate closing
        review['closing'] = self._generate_closing_remark(avatar_id, analysis)
        
        # Assess overall severity
        severities = [issue.get('severity', 'medium') for issue in analysis['issues_found']]
        if 'high' in severities:
            review['severity_assessment'] = 'high'
        elif 'medium' in severities:
            review['severity_assessment'] = 'medium'
        else:
            review['severity_assessment'] = 'low'
        
        return review

    def _determine_review_tone(self, analysis: Dict, comm_style: Dict) -> str:
        """Determine the tone of the review based on analysis and personality"""
        
        issue_count = len(analysis['issues_found'])
        directness = comm_style.get('directness', 0.5)
        encouraging = comm_style.get('encouraging', 0.5)
        
        if issue_count > 5 and directness > 0.8:
            return 'stern_direct'
        elif issue_count > 3 and directness > 0.6:
            return 'constructively_critical'
        elif encouraging > 0.7:
            return 'encouraging_supportive'
        elif comm_style.get('academic_precision', 0) > 0.8:
            return 'academically_thorough'
        else:
            return 'professionally_balanced'

    def _generate_issue_feedback(self, issue: Dict, avatar_id: str, comm_style: Dict) -> Dict[str, str]:
        """Generate specific feedback for an identified issue"""
        
        feedback_templates = {
            'linus-torvalds': {
                'high': "This is broken. Fix it now before it crashes production.",
                'medium': "This needs to be cleaned up. It's not acceptable.",
                'low': "Minor issue, but fix it anyway."
            },
            'ada-lovelace': {
                'high': "This mathematical inconsistency requires immediate attention.",
                'medium': "The analytical structure could be improved here.",
                'low': "A small refinement would enhance the elegance."
            },
            'grace-hopper': {
                'high': "This will cause problems - let's fix it practically.",
                'medium': "We can make this more maintainable.",
                'low': "Small improvement opportunity here."
            },
            'donald-knuth': {
                'high': "This violates fundamental algorithmic principles.",
                'medium': "The implementation lacks proper optimization.",
                'low': "Minor algorithmic refinement suggested."
            },
            'margaret-hamilton': {
                'high': "This could fail in production - critical fix needed.",
                'medium': "Reliability concern that should be addressed.",
                'low': "Consider this for improved robustness."
            }
        }
        
        severity = issue.get('severity', 'medium')
        template = feedback_templates.get(avatar_id, {}).get(severity, "Issue identified")
        
        return {
            'issue_type': issue['type'],
            'description': issue['issue'],
            'feedback': template,
            'severity': severity
        }

    def _generate_suggestion_feedback(self, suggestion: Dict, avatar_id: str) -> Dict[str, str]:
        """Generate feedback for suggestions"""
        
        suggestion_styles = {
            'linus-torvalds': "Consider this approach: it's more robust.",
            'ada-lovelace': "I propose this elegant enhancement:",
            'grace-hopper': "Here's a practical improvement:",
            'donald-knuth': "For optimal complexity, consider:",
            'margaret-hamilton': "To improve reliability, try:"
        }
        
        style = suggestion_styles.get(avatar_id, "Suggestion:")
        
        return {
            'type': suggestion['type'],
            'suggestion': suggestion['suggestion'],
            'feedback': f"{style} {suggestion['suggestion']}",
            'rationale': suggestion.get('rationale', '')
        }

    def _generate_closing_remark(self, avatar_id: str, analysis: Dict) -> str:
        """Generate closing remark based on avatar and analysis"""
        
        issue_count = len(analysis['issues_found'])
        
        closings = {
            'linus-torvalds': [
                "Fix these issues and we'll have something worth shipping.",
                "This needs work, but it's not hopeless.",
                "Clean code is readable code. Make it readable."
            ] if issue_count > 0 else [
                "Not bad. This might actually work.",
                "Acceptable. Ship it.",
                "Good enough for government work."
            ],
            'ada-lovelace': [
                "With these improvements, your algorithm shall be most elegant.",
                "Mathematical beauty awaits in the refined version.",
                "The analytical engine approves of systematic improvement."
            ],
            'grace-hopper': [
                "These changes will make your code much more practical.",
                "Once fixed, this will be solid and maintainable.",
                "Good progress - keep pushing forward!"
            ],
            'donald-knuth': [
                "Comprehensive optimization will yield superior results.",
                "The algorithmic complexity can be much improved.",
                "Proper attention to these details ensures correctness."
            ],
            'margaret-hamilton': [
                "With these fixes, your code will be mission-ready.",
                "Safety and reliability improvements are essential.",
                "These changes will prevent production failures."
            ]
        }
        
        return random.choice(closings.get(avatar_id, ["Keep improving!"]))

    def _update_avatar_state(
        self, 
        avatar_state: Dict, 
        code: str, 
        analysis: Dict, 
        review: Dict
    ) -> Dict:
        """Update avatar state based on interaction and learning"""
        
        # Add to interaction history
        avatar_state['interaction_history'].append({
            'timestamp': datetime.utcnow(),
            'code_length': len(code),
            'issues_found': len(analysis['issues_found']),
            'review_tone': review['tone'],
            'confidence': analysis['confidence']
        })
        
        # Personality drift based on interactions
        if len(avatar_state['interaction_history']) > 5:
            recent_interactions = avatar_state['interaction_history'][-5:]
            
            # If consistently finding many issues, increase directness slightly
            avg_issues = sum(i['issues_found'] for i in recent_interactions) / 5
            if avg_issues > 3:
                current_directness = avatar_state['personality_matrix']['communication_style'].get('directness', 0.5)
                avatar_state['personality_drift']['directness'] = min(1.0, current_directness + 0.02)
        
        # Update energy level based on interaction complexity
        complexity_factor = len(analysis['issues_found']) / 10
        avatar_state['energy_level'] = max(0.3, avatar_state['energy_level'] - complexity_factor * 0.05)
        
        # Update expertise confidence based on success
        if analysis['confidence'] > 0.8:
            for domain in avatar_state['personality_matrix']['expertise_domains']:
                current_confidence = avatar_state['expertise_confidence'].get(domain, 0.5)
                avatar_state['expertise_confidence'][domain] = min(1.0, current_confidence + 0.01)
        
        return avatar_state

    async def get_avatar_analytics(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for avatar session"""
        try:
            if session_id not in self.active_avatars:
                return {'success': False, 'error': 'Avatar session not found'}
            
            avatar_state = self.active_avatars[session_id]
            interactions = avatar_state['interaction_history']
            
            if not interactions:
                return {
                    'success': True,
                    'session_id': session_id,
                    'interaction_count': 0,
                    'message': 'No interactions recorded yet'
                }
            
            # Calculate analytics
            total_issues = sum(i['issues_found'] for i in interactions)
            avg_confidence = sum(i['confidence'] for i in interactions) / len(interactions)
            total_code_reviewed = sum(i['code_length'] for i in interactions)
            
            # Personality evolution tracking
            personality_changes = avatar_state.get('personality_drift', {})
            
            return {
                'success': True,
                'session_id': session_id,
                'avatar_id': avatar_state['avatar_id'],
                'interaction_count': len(interactions),
                'total_issues_found': total_issues,
                'average_confidence': avg_confidence,
                'total_code_reviewed': total_code_reviewed,
                'current_energy_level': avatar_state['energy_level'],
                'personality_evolution': personality_changes,
                'expertise_confidence': avatar_state['expertise_confidence'],
                'session_duration': (datetime.utcnow() - avatar_state['summoned_at']).total_seconds(),
                'interaction_trends': self._calculate_interaction_trends(interactions)
            }
            
        except Exception as e:
            logger.error(f"Avatar analytics failed: {e}")
            return {'success': False, 'error': str(e)}

    def _calculate_interaction_trends(self, interactions: List[Dict]) -> Dict[str, Any]:
        """Calculate trends in avatar interactions"""
        
        if len(interactions) < 3:
            return {'insufficient_data': True}
        
        # Calculate trends over recent interactions
        recent_3 = interactions[-3:]
        older_3 = interactions[-6:-3] if len(interactions) >= 6 else interactions[:-3]
        
        if not older_3:
            return {'insufficient_historical_data': True}
        
        # Issue detection trend
        recent_avg_issues = sum(i['issues_found'] for i in recent_3) / len(recent_3)
        older_avg_issues = sum(i['issues_found'] for i in older_3) / len(older_3)
        issue_trend = 'improving' if recent_avg_issues < older_avg_issues else 'stable' if recent_avg_issues == older_avg_issues else 'degrading'
        
        # Confidence trend
        recent_avg_confidence = sum(i['confidence'] for i in recent_3) / len(recent_3)
        older_avg_confidence = sum(i['confidence'] for i in older_3) / len(older_3)
        confidence_trend = 'increasing' if recent_avg_confidence > older_avg_confidence else 'stable' if recent_avg_confidence == older_avg_confidence else 'decreasing'
        
        return {
            'code_quality_trend': issue_trend,
            'avatar_confidence_trend': confidence_trend,
            'recent_avg_issues': recent_avg_issues,
            'confidence_change': recent_avg_confidence - older_avg_confidence
        }

# Global avatar AI service instance
_avatar_ai_service = None

def init_avatar_ai_service(db_manager):
    """Initialize the avatar AI service with database manager"""
    global _avatar_ai_service
    _avatar_ai_service = AvatarAIService(db_manager)
    logger.info("🎭 Avatar AI Service initialized - Digital twins ready!")

def get_avatar_ai_service() -> Optional[AvatarAIService]:
    """Get the initialized avatar AI service instance"""
    return _avatar_ai_service