"""
Cosmic Service - Core Reality Engine Implementation

This service provides the backend implementation for all cosmic-level features:
- Code evolution with genetic algorithms
- Karma reincarnation cycle management
- Digital archaeology for legacy code mining
- Code immortality system
- Nexus event coordination
- Cosmic debugging with time travel
- VIBE token economy management
- Reality metrics collection
"""

import asyncio
import uuid
import hashlib
import random
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
import logging

logger = logging.getLogger(__name__)

class CosmicService:
    """
    The Core Reality Engine that powers all cosmic-level features
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        self.reality_version = "2.0.cosmic"
        self.quantum_coherence = "stable"
        self.vibe_frequency = 432  # Base frequency in Hz
        self.active_sessions = {}
        
        logger.info("🌌 Cosmic Service initialized - Reality Engine online!")

    # === CODE EVOLUTION WITH GENETIC ALGORITHMS ===
    
    async def evolve_code_genetically(
        self, 
        code: str, 
        language: str, 
        generations: int = 5, 
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evolve code using genetic algorithms with population management,
        fitness scoring, crossover, mutation, and selection mechanisms
        """
        try:
            logger.info(f"🧬 Starting genetic evolution for {language} code ({generations} generations)")
            
            # Create initial population
            population = await self._create_initial_population(code, language)
            evolution_id = str(uuid.uuid4())
            
            best_fitness = 0
            evolution_history = []
            
            for generation in range(generations):
                # Calculate fitness for each individual
                fitness_scores = []
                for individual in population:
                    fitness = self._calculate_code_fitness(individual, language)
                    fitness_scores.append({'code': individual, 'fitness': fitness})
                
                # Sort by fitness (best first)
                fitness_scores.sort(key=lambda x: x['fitness'], reverse=True)
                current_best = fitness_scores[0]['fitness']
                
                if current_best > best_fitness:
                    best_fitness = current_best
                
                evolution_history.append({
                    'generation': generation + 1,
                    'best_fitness': current_best,
                    'average_fitness': sum(f['fitness'] for f in fitness_scores) / len(fitness_scores),
                    'population_size': len(population)
                })
                
                # Selection - keep top 50%
                selected = fitness_scores[:len(fitness_scores) // 2]
                
                # Create next generation through crossover and mutation
                next_population = []
                for i in range(len(population)):
                    parent1 = random.choice(selected)['code']
                    parent2 = random.choice(selected)['code']
                    
                    offspring = self._crossover_code(parent1, parent2, language)
                    mutated = self._mutate_code(offspring, language)
                    next_population.append(mutated)
                
                population = next_population
                
                logger.info(f"🧬 Generation {generation + 1}: Best fitness = {current_best:.2f}")
            
            # Get the final best code
            final_fitness = [(code, self._calculate_code_fitness(code, language)) for code in population]
            final_fitness.sort(key=lambda x: x[1], reverse=True)
            evolved_code = final_fitness[0][0]
            final_fitness_score = final_fitness[0][1]
            
            # Save evolution record
            evolution_record = {
                'evolution_id': evolution_id,
                'user_id': user_id or 'anonymous',
                'original_code': code,
                'evolved_code': evolved_code,
                'language': language,
                'generations': generations,
                'fitness_improvement': final_fitness_score - self._calculate_code_fitness(code, language),
                'evolution_history': evolution_history,
                'created_at': datetime.utcnow()
            }
            
            await self.db.code_evolutions.insert_one(evolution_record)
            
            return {
                'success': True,
                'evolution_id': evolution_id,
                'original_code': code,
                'evolved_code': evolved_code,
                'fitness_improvement': evolution_record['fitness_improvement'],
                'generations': evolution_history,
                'message': f"Code successfully evolved through {generations} generations"
            }
            
        except Exception as e:
            logger.error(f"Code evolution failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _create_initial_population(self, base_code: str, language: str, size: int = 10) -> List[str]:
        """Create initial population with slight variations of the base code"""
        population = [base_code]  # Include original
        
        for _ in range(size - 1):
            variant = self._create_code_variant(base_code, language)
            population.append(variant)
        
        return population

    def _create_code_variant(self, code: str, language: str) -> str:
        """Create a variant of the code with minor modifications"""
        lines = code.split('\n')
        
        # Simple variations based on language
        if language.lower() == 'javascript':
            variations = [
                lambda l: l.replace('var ', 'let ') if 'var ' in l else l,
                lambda l: l.replace('function', 'const') + ' = () =>' if 'function' in l else l,
                lambda l: l.replace('==', '===') if '==' in l else l,
                lambda l: l.replace('console.log', 'console.debug') if 'console.log' in l else l
            ]
        elif language.lower() == 'python':
            variations = [
                lambda l: l.replace('    ', '\t') if l.startswith('    ') else l,
                lambda l: l.replace(' and ', ' && ') if ' and ' in l else l,
                lambda l: l.replace('print(', 'print(f') if 'print(' in l and 'f' not in l else l
            ]
        else:
            variations = [lambda l: l]  # No variations for unknown languages
        
        # Apply random variations
        modified_lines = []
        for line in lines:
            if random.random() < 0.3:  # 30% chance to modify each line
                variation = random.choice(variations)
                modified_lines.append(variation(line))
            else:
                modified_lines.append(line)
        
        return '\n'.join(modified_lines)

    def _calculate_code_fitness(self, code: str, language: str) -> float:
        """Calculate fitness score for code based on quality metrics"""
        fitness = 50.0  # Base fitness
        
        # Common quality indicators
        if 'TODO' in code:
            fitness -= 5
        if 'FIXME' in code:
            fitness -= 10
        if 'hack' in code.lower():
            fitness -= 15
        
        # Language-specific fitness calculations
        if language.lower() == 'javascript':
            fitness += self._calculate_js_fitness(code)
        elif language.lower() == 'python':
            fitness += self._calculate_python_fitness(code)
        
        # General good practices
        if 'async' in code and 'await' in code:
            fitness += 10
        if 'try:' in code or 'catch' in code:
            fitness += 15
        
        # Code complexity (simpler is often better)
        lines = len([l for l in code.split('\n') if l.strip()])
        if lines < 50:
            fitness += 5
        elif lines > 200:
            fitness -= 10
        
        return max(0, min(100, fitness))

    def _calculate_js_fitness(self, code: str) -> float:
        """JavaScript-specific fitness calculation"""
        fitness = 0
        
        # Good practices
        if 'const ' in code or 'let ' in code:
            fitness += 10
        if '=>' in code:  # Arrow functions
            fitness += 5
        if 'async/await' in code:
            fitness += 10
        
        # Bad practices
        if 'var ' in code:
            fitness -= 10
        if 'eval(' in code:
            fitness -= 20
        if '==' in code and '===' not in code:
            fitness -= 5
        
        return fitness

    def _calculate_python_fitness(self, code: str) -> float:
        """Python-specific fitness calculation"""
        fitness = 0
        
        # Good practices
        if 'def ' in code:
            fitness += 5
        if '__name__ == "__main__"' in code:
            fitness += 10
        if 'with open(' in code:
            fitness += 10
        
        # PEP 8 considerations
        if not any(line.strip().startswith('\t') for line in code.split('\n')):
            fitness += 5  # Spaces over tabs
        
        return fitness

    def _crossover_code(self, parent1: str, parent2: str, language: str) -> str:
        """Perform crossover between two code snippets"""
        lines1 = parent1.split('\n')
        lines2 = parent2.split('\n')
        
        # Single-point crossover
        min_length = min(len(lines1), len(lines2))
        if min_length > 1:
            crossover_point = random.randint(1, min_length - 1)
            offspring_lines = lines1[:crossover_point] + lines2[crossover_point:]
        else:
            offspring_lines = lines1 if random.random() < 0.5 else lines2
        
        return '\n'.join(offspring_lines)

    def _mutate_code(self, code: str, language: str, mutation_rate: float = 0.1) -> str:
        """Apply mutations to code"""
        if random.random() > mutation_rate:
            return code  # No mutation
        
        lines = code.split('\n')
        mutated_lines = []
        
        for line in lines:
            if random.random() < 0.1:  # 10% chance to mutate each line
                if language.lower() == 'javascript':
                    line = self._mutate_js_line(line)
                elif language.lower() == 'python':
                    line = self._mutate_python_line(line)
            mutated_lines.append(line)
        
        return '\n'.join(mutated_lines)

    def _mutate_js_line(self, line: str) -> str:
        """Apply JavaScript-specific mutations"""
        mutations = [
            lambda l: l.replace('var ', 'let ') if 'var ' in l else l,
            lambda l: l.replace('==', '===') if '==' in l else l,
            lambda l: l.replace('console.log', 'console.debug') if 'console.log' in l else l
        ]
        
        mutation = random.choice(mutations)
        return mutation(line)

    def _mutate_python_line(self, line: str) -> str:
        """Apply Python-specific mutations"""
        mutations = [
            lambda l: l.replace('    ', '\t') if l.startswith('    ') else l,
            lambda l: l.replace(' and ', ' && ') if ' and ' in l else l,
            lambda l: l.replace('True', 'true') if 'True' in l else l
        ]
        
        mutation = random.choice(mutations)
        return mutation(line)

    # === KARMA REINCARNATION SYSTEM ===
    
    async def process_karma_reincarnation(
        self, 
        code: str, 
        language: str, 
        user_id: str
    ) -> Dict[str, Any]:
        """
        Process code through karma reincarnation cycle based on quality analysis
        """
        try:
            logger.info(f"♻️ Processing karma reincarnation for user {user_id}")
            
            code_hash = hashlib.sha256(code.encode()).hexdigest()[:12]
            quality = self._calculate_code_fitness(code, language)
            karma_debt = max(0, 100 - quality)
            
            # Determine reincarnation path
            if karma_debt > 70:
                path = 'tutorial-example'
                message = 'Code will be reborn as a tutorial example to teach others'
                cycles = 3
            elif karma_debt > 40:
                path = 'refactor-candidate'
                message = 'Code will be reborn as a refactoring exercise'
                cycles = 2
            else:
                path = 'wisdom-archive'
                message = 'Code achieves enlightenment and enters the wisdom archive'
                cycles = 1
            
            # Save karma record
            karma_record = {
                'user_id': user_id,
                'code_hash': code_hash,
                'original_code': code,
                'language': language,
                'quality_score': quality,
                'karma_debt': karma_debt,
                'reincarnation_path': path,
                'cycles': cycles,
                'message': message,
                'timestamp': datetime.utcnow()
            }
            
            await self.db.karma_records.insert_one(karma_record)
            
            return {
                'success': True,
                'code_hash': code_hash,
                'quality': quality,
                'karma_debt': karma_debt,
                'reincarnation_path': path,
                'message': message,
                'cycles': cycles
            }
            
        except Exception as e:
            logger.error(f"Karma reincarnation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_karma_history(self, user_id: str) -> List[Dict]:
        """Get user's karma reincarnation history"""
        try:
            records = await self.db.karma_records.find(
                {'user_id': user_id}
            ).sort('timestamp', -1).limit(50).to_list(50)
            
            return records
        except Exception as e:
            logger.error(f"Failed to get karma history: {e}")
            return []

    # === DIGITAL ARCHAEOLOGY SYSTEM ===
    
    async def mine_legacy_code(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """
        Mine legacy code for VIBE tokens and learning opportunities
        """
        try:
            logger.info(f"⛏️ Starting digital archaeology session for project {project_id}")
            
            session_id = str(uuid.uuid4())
            
            # Get project files for analysis
            files = await self.db.files.find({'project_id': project_id}).to_list(100)
            
            findings = []
            total_vibe_earned = 0
            
            for file in files:
                if file.get('type') == 'file' and file.get('content'):
                    analysis = self._analyze_legacy_code(file['content'], file.get('name', ''))
                    if analysis['findings']:
                        findings.extend(analysis['findings'])
                        total_vibe_earned += analysis['vibe_reward']
            
            # Save archaeology session
            session_record = {
                'session_id': session_id,
                'user_id': user_id,
                'project_id': project_id,
                'files_analyzed': len([f for f in files if f.get('type') == 'file']),
                'findings': findings,
                'total_vibe_earned': total_vibe_earned,
                'timestamp': datetime.utcnow()
            }
            
            await self.db.archaeology_sessions.insert_one(session_record)
            
            return {
                'success': True,
                'session_id': session_id,
                'findings': findings,
                'files_analyzed': len([f for f in files if f.get('type') == 'file']),
                'vibe_earned': total_vibe_earned
            }
            
        except Exception as e:
            logger.error(f"Digital archaeology failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _analyze_legacy_code(self, code: str, filename: str) -> Dict[str, Any]:
        """Analyze code for archaeological findings"""
        findings = []
        vibe_reward = 0
        
        # Look for legacy patterns
        legacy_patterns = [
            ('jQuery usage', r'\$\(', 10, 'Ancient JavaScript framework detected'),
            ('Internet Explorer hacks', r'<!--\[if.*IE.*\]-->', 25, 'Fossil from the browser wars'),
            ('Flash references', r'\.swf|embed.*flash', 30, 'Adobe Flash artifact discovered'),
            ('Deprecated HTML tags', r'<(font|center|marquee)', 15, 'HTML museum pieces found'),
            ('Old PHP tags', r'<\?[^p]', 20, 'Ancient PHP scrolls uncovered'),
            ('Y2K remnants', r'(19|20)\d{2}.*2000', 50, 'Y2K preparation code relic'),
            ('TODO comments', r'TODO|FIXME|HACK', 5, 'Developer confession discovered'),
            ('Magic numbers', r'\b\d{3,}\b', 8, 'Mysterious numerical constants found')
        ]
        
        for pattern_name, regex, reward, description in legacy_patterns:
            import re
            matches = re.findall(regex, code, re.IGNORECASE)
            if matches:
                findings.append({
                    'type': pattern_name,
                    'description': description,
                    'occurrences': len(matches),
                    'vibe_value': reward,
                    'filename': filename
                })
                vibe_reward += reward * min(len(matches), 3)  # Cap at 3x reward per pattern
        
        return {
            'findings': findings,
            'vibe_reward': vibe_reward
        }

    # === CODE IMMORTALITY SYSTEM ===
    
    async def activate_code_immortality(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """
        Activate code immortality for a project to ensure it survives and evolves
        """
        try:
            logger.info(f"🔮 Activating code immortality for project {project_id}")
            
            immortality_id = str(uuid.uuid4())
            
            # Check if already activated
            existing = await self.db.code_immortality.find_one({'project_id': project_id})
            if existing:
                return {
                    'success': False,
                    'error': 'Code immortality already activated for this project'
                }
            
            # Activate immortality features
            features = [
                'Auto-maintenance scheduling',
                'Legacy migration assistance',
                'Cross-platform survival',
                'Documentation preservation',
                'Knowledge transfer protocols',
                'Adaptive architecture evolution'
            ]
            
            immortality_record = {
                'immortality_id': immortality_id,
                'project_id': project_id,
                'user_id': user_id,
                'status': 'Code immortality activated - project will survive and evolve',
                'features': features,
                'activated_at': datetime.utcnow(),
                'auto_maintenance': True,
                'backup_frequency': 'daily',
                'adaptation_enabled': True
            }
            
            await self.db.code_immortality.insert_one(immortality_record)
            
            return {
                'success': True,
                'immortality_id': immortality_id,
                'status': 'Code immortality activated - project will survive and evolve',
                'features': features
            }
            
        except Exception as e:
            logger.error(f"Code immortality activation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    # === NEXUS EVENTS (CROSS-PLATFORM) ===
    
    async def create_nexus_event(
        self, 
        source_platform: str, 
        target_platform: str, 
        action: str, 
        payload: Dict, 
        user_id: str
    ) -> Dict[str, Any]:
        """
        Create a cross-platform nexus event for multi-device coordination
        """
        try:
            logger.info(f"🌐 Creating nexus event: {source_platform} → {target_platform}")
            
            event_id = str(uuid.uuid4())
            quantum_signature = self._generate_quantum_signature()
            
            # Define nexus event types and their results
            nexus_types = {
                'desktop-mobile': 'Code editing session transferred to mobile device',
                'mobile-desktop': 'Mobile changes synchronized to desktop environment',
                'web-vr': 'Project materialized in VR development space',
                'ide-production': 'Changes deployed directly to production server',
                'local-cloud': 'Project migrated to cloud infrastructure',
                'individual-team': 'Collaborative session initiated with team members'
            }
            
            nexus_key = f"{source_platform}-{target_platform}"
            description = nexus_types.get(nexus_key, f"Unknown nexus pattern: {nexus_key}")
            
            # Simulate cross-platform action result
            result = {
                'action_performed': action,
                'data_transferred': len(str(payload)),
                'synchronization_time': f"{random.randint(50, 500)}ms",
                'success_rate': f"{random.randint(85, 99)}%"
            }
            
            # Save nexus event
            event_record = {
                'event_id': event_id,
                'source_platform': source_platform,
                'target_platform': target_platform,
                'action': action,
                'payload': {**payload, 'user_id': user_id},
                'description': description,
                'quantum_signature': quantum_signature,
                'result': result,
                'timestamp': datetime.utcnow()
            }
            
            await self.db.nexus_events.insert_one(event_record)
            
            return {
                'success': True,
                'event_id': event_id,
                'description': description,
                'quantum_signature': quantum_signature,
                'result': result
            }
            
        except Exception as e:
            logger.error(f"Nexus event creation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _generate_quantum_signature(self) -> str:
        """Generate a unique quantum signature for nexus events"""
        timestamp = str(int(datetime.utcnow().timestamp() * 1000000))
        random_component = str(random.randint(100000, 999999))
        signature = hashlib.sha256((timestamp + random_component).encode()).hexdigest()[:16]
        return f"QS-{signature.upper()}"

    # === COSMIC DEBUGGING WITH TIME TRAVEL ===
    
    async def start_cosmic_debug_session(
        self, 
        project_id: str, 
        commit_hash: Optional[str] = None, 
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Start a cosmic debugging session with git time travel capabilities
        """
        try:
            logger.info(f"⏰ Starting cosmic debug session for project {project_id}")
            
            session_id = str(uuid.uuid4())
            
            # Define available time points for debugging
            timepoints = [
                {'name': 'Current Reality', 'hash': 'HEAD', 'description': 'Present moment'},
                {'name': '1 commit ago', 'hash': 'HEAD~1', 'description': 'Recent past'},
                {'name': '1 hour ago', 'hash': None, 'description': 'Short-term history'},
                {'name': '1 day ago', 'hash': None, 'description': 'Yesterday\'s state'},
                {'name': '1 week ago', 'hash': None, 'description': 'Last week\'s version'},
                {'name': 'Last working version', 'hash': None, 'description': 'Most recent stable state'},
                {'name': 'The moment everything was perfect', 'hash': None, 'description': 'Mythical golden age'}
            ]
            
            # Select destination (use provided commit_hash or random selection)
            if commit_hash:
                destination = f"Specific commit: {commit_hash[:8]}"
            else:
                selected_timepoint = random.choice(timepoints)
                destination = selected_timepoint['name']
            
            # Create debug session record
            session_record = {
                'session_id': session_id,
                'project_id': project_id,
                'user_id': user_id or 'anonymous',
                'destination': destination,
                'commit_hash': commit_hash,
                'available_timepoints': timepoints,
                'temporal_status': 'stable',
                'paradox_prevention': True,
                'started_at': datetime.utcnow()
            }
            
            await self.db.cosmic_debug_sessions.insert_one(session_record)
            
            return {
                'success': True,
                'session_id': session_id,
                'destination': destination,
                'available_timepoints': timepoints,
                'temporal_status': 'stable',
                'message': f'Time travel debugging initiated. Destination: {destination}'
            }
            
        except Exception as e:
            logger.error(f"Cosmic debug session failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    # === REALITY METRICS ===
    
    async def get_reality_metrics(self) -> Dict[str, Any]:
        """
        Collect and return current reality metrics and cosmic statistics
        """
        try:
            # Calculate various reality metrics
            current_time = datetime.utcnow()
            
            # Count active cosmic activities
            evolution_count = await self.db.code_evolutions.count_documents(
                {'created_at': {'$gte': current_time - timedelta(hours=24)}}
            )
            
            karma_cycles = await self.db.karma_records.count_documents(
                {'timestamp': {'$gte': current_time - timedelta(hours=24)}}
            )
            
            archaeology_sessions = await self.db.archaeology_sessions.count_documents(
                {'timestamp': {'$gte': current_time - timedelta(hours=24)}}
            )
            
            immortal_projects = await self.db.code_immortality.count_documents({})
            
            nexus_events = await self.db.nexus_events.count_documents(
                {'timestamp': {'$gte': current_time - timedelta(hours=24)}}
            )
            
            debug_sessions = await self.db.cosmic_debug_sessions.count_documents(
                {'started_at': {'$gte': current_time - timedelta(hours=24)}}
            )
            
            # Calculate cosmic harmony index
            activity_total = evolution_count + karma_cycles + archaeology_sessions + nexus_events + debug_sessions
            cosmic_harmony = min(100, (activity_total / 10) * 100)  # Scale to 0-100
            
            # Calculate vibe frequency fluctuation
            time_factor = math.sin(current_time.timestamp() / 3600) * 10  # Hourly fluctuation
            current_vibe_frequency = self.vibe_frequency + time_factor
            
            # Calculate quantum coherence
            coherence_stability = 99.0 + (random.random() * 2 - 1)  # 98-100%
            
            return {
                'reality_version': self.reality_version,
                'cosmic_time': current_time.isoformat(),
                'vibe_frequency': round(current_vibe_frequency, 2),
                'quantum_coherence': f"{coherence_stability:.1f}%",
                'cosmic_harmony_index': round(cosmic_harmony, 1),
                'active_sessions': len(self.active_sessions),
                'daily_activity': {
                    'code_evolutions': evolution_count,
                    'karma_cycles': karma_cycles,
                    'archaeology_sessions': archaeology_sessions,
                    'nexus_events': nexus_events,
                    'debug_sessions': debug_sessions
                },
                'system_status': {
                    'immortal_projects': immortal_projects,
                    'reality_stability': 'optimal',
                    'temporal_flow': 'normal',
                    'dimensional_integrity': 'intact'
                }
            }
            
        except Exception as e:
            logger.error(f"Reality metrics collection failed: {e}")
            return {
                'error': str(e),
                'reality_version': self.reality_version,
                'status': 'metrics_unavailable'
            }

# Global cosmic service instance
_cosmic_service = None

def init_cosmic_service(db_manager):
    """Initialize the cosmic service with database manager"""
    global _cosmic_service
    _cosmic_service = CosmicService(db_manager)
    logger.info("🌌 Cosmic Service initialized and ready!")

def get_cosmic_service() -> Optional[CosmicService]:
    """Get the initialized cosmic service instance"""
    return _cosmic_service