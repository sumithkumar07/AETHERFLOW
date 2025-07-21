<file>
      <absolute_file_name>/app/backend/services/cosmic_service.py</absolute_file_name>
      <content">"""
Cosmic Service - Backend Reality Engine

This service provides server-side cosmic-level features:
- Code Evolution with Genetic Algorithms
- Karma Reincarnation Tracking
- Digital Archaeology System
- Code Immortality Management
- Nexus Event Coordination
- Reality Metrics Collection
- Cosmic Performance Analysis
"""

import asyncio
import json
import random
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import re
import ast


@dataclass
class CodeGenome:
    """Represents a code's genetic makeup for evolution"""
    code: str
    language: str
    fitness: float
    generation: int
    parent_ids: List[str]
    mutations: List[str]
    created_at: datetime
    genome_id: str


@dataclass
class KarmaRecord:
    """Tracks karma and reincarnation cycles"""
    user_id: str
    code_hash: str
    original_quality: float
    karma_debt: int
    reincarnation_path: str
    current_state: str
    cycles: int
    created_at: datetime


@dataclass
class NexusEvent:
    """Cross-platform development events"""
    event_id: str
    source_platform: str
    target_platform: str
    action: str
    payload: Dict[str, Any]
    quantum_signature: str
    timestamp: datetime
    status: str


class CosmicService:
    def __init__(self, db_manager):
        self.db = db_manager
        self.evolution_cache = {}
        self.nexus_events = {}
        self.reality_metrics = {
            'total_evolutions': 0,
            'karma_cycles': 0,
            'nexus_events': 0,
            'code_immortality_saves': 0,
            'cosmic_debug_sessions': 0
        }
        
        # Genetic Algorithm Parameters
        self.ga_config = {
            'population_size': 10,
            'mutation_rate': 0.3,
            'crossover_rate': 0.7,
            'elite_size': 2,
            'max_generations': 5
        }
        
        print("🌌 Cosmic Service initialized - Reality engine online!")

    # === CODE EVOLUTION & GENETIC ALGORITHMS ===

    async def evolve_code_genetically(self, code: str, language: str, generations: int = 5, user_id: str = None) -> Dict[str, Any]:
        """
        Evolve code using genetic algorithms
        """
        try:
            print(f"🧬 Starting genetic evolution for {language} code...")
            
            # Create initial population
            population = self._create_initial_population(code, language)
            evolution_history = []
            
            for gen in range(generations):
                # Evaluate fitness for all individuals
                fitness_scores = []
                for individual in population:
                    fitness = self._calculate_code_fitness(individual['code'], language)
                    individual['fitness'] = fitness
                    fitness_scores.append(fitness)
                
                # Record generation stats
                avg_fitness = sum(fitness_scores) / len(fitness_scores)
                best_fitness = max(fitness_scores)
                
                evolution_history.append({
                    'generation': gen + 1,
                    'average_fitness': avg_fitness,
                    'best_fitness': best_fitness,
                    'population_diversity': self._calculate_diversity(population)
                })
                
                # Selection and reproduction
                if gen < generations - 1:  # Don't evolve on the last generation
                    population = self._evolve_generation(population)
                
                print(f"🧬 Generation {gen + 1}: Best fitness = {best_fitness:.2f}")
            
            # Get the best individual
            best_individual = max(population, key=lambda x: x['fitness'])
            
            # Save evolution to database
            evolution_record = {
                'user_id': user_id,
                'original_code': code,
                'evolved_code': best_individual['code'],
                'language': language,
                'generations': generations,
                'final_fitness': best_individual['fitness'],
                'evolution_history': evolution_history,
                'created_at': datetime.utcnow(),
                'evolution_id': self._generate_id()
            }
            
            await self.db.code_evolutions.insert_one(evolution_record)
            self.reality_metrics['total_evolutions'] += 1
            
            return {
                'success': True,
                'original_code': code,
                'evolved_code': best_individual['code'],
                'fitness_improvement': best_individual['fitness'] - self._calculate_code_fitness(code, language),
                'generations': evolution_history,
                'evolution_id': evolution_record['evolution_id']
            }
            
        except Exception as e:
            print(f"❌ Code evolution error: {e}")
            return {
                'success': False,
                'error': str(e),
                'original_code': code
            }

    def _create_initial_population(self, code: str, language: str) -> List[Dict[str, Any]]:
        """Create initial population for genetic algorithm"""
        population = [{'code': code, 'generation': 0}]  # Include original
        
        # Create variations through mutations
        for i in range(self.ga_config['population_size'] - 1):
            mutated = self._mutate_code(code, language)
            population.append({
                'code': mutated,
                'generation': 0,
                'mutations': [f'initial_mutation_{i}']
            })
        
        return population

    def _evolve_generation(self, population: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Evolve one generation using selection, crossover, and mutation"""
        # Sort by fitness (descending)
        population.sort(key=lambda x: x['fitness'], reverse=True)
        
        # Elite selection - keep best individuals
        new_population = population[:self.ga_config['elite_size']].copy()
        
        # Generate offspring through crossover and mutation
        while len(new_population) < self.ga_config['population_size']:
            if random.random() < self.ga_config['crossover_rate'] and len(population) >= 2:
                # Crossover
                parent1 = self._tournament_selection(population)
                parent2 = self._tournament_selection(population)
                offspring = self._crossover_code(parent1['code'], parent2['code'])
            else:
                # Mutation only
                parent = self._tournament_selection(population)
                offspring = parent['code']
            
            # Apply mutation
            if random.random() < self.ga_config['mutation_rate']:
                offspring = self._mutate_code(offspring, 'javascript')  # Default language
            
            new_population.append({
                'code': offspring,
                'generation': population[0].get('generation', 0) + 1
            })
        
        return new_population

    def _tournament_selection(self, population: List[Dict[str, Any]], tournament_size: int = 3) -> Dict[str, Any]:
        """Select individual using tournament selection"""
        tournament = random.sample(population, min(tournament_size, len(population)))
        return max(tournament, key=lambda x: x['fitness'])

    def _crossover_code(self, code1: str, code2: str) -> str:
        """Perform crossover between two code strings"""
        lines1 = code1.split('\n')
        lines2 = code2.split('\n')
        
        # Single-point crossover
        crossover_point = random.randint(1, min(len(lines1), len(lines2)) - 1)
        
        offspring_lines = lines1[:crossover_point] + lines2[crossover_point:]
        return '\n'.join(offspring_lines)

    def _mutate_code(self, code: str, language: str) -> str:
        """Apply mutations to code"""
        mutations = {
            'javascript': [
                (r'var\s+', 'const '),
                (r'==', '==='),
                (r'function\s+(\w+)', r'const \1 = '),
                (r'console\.log', 'console.debug'),
                (r'if\s*\(\s*(\w+)\s*==\s*true\s*\)', r'if (\1)'),
                (r'if\s*\(\s*(\w+)\s*==\s*false\s*\)', r'if (!\1)')
            ],
            'python': [
                (r'print\s*\(', 'logger.info('),
                (r'==\s*True', 'is True'),
                (r'==\s*False', 'is False'),
                (r'range\(len\((\w+)\)\)', r'range(len(\1))'),
                (r'for\s+(\w+)\s+in\s+range\(len\((\w+)\)\):', r'for \1, item in enumerate(\2):')
            ]
        }
        
        lang_mutations = mutations.get(language, mutations['javascript'])
        mutated_code = code
        
        # Apply a random mutation
        if lang_mutations:
            pattern, replacement = random.choice(lang_mutations)
            mutated_code = re.sub(pattern, replacement, code, count=1)
        
        return mutated_code

    def _calculate_code_fitness(self, code: str, language: str) -> float:
        """Calculate fitness score for code"""
        fitness = 50.0  # Base fitness
        
        # Code quality indicators
        quality_patterns = {
            'javascript': {
                'good': [
                    (r'const\s+', 5),
                    (r'let\s+', 3),
                    (r'=>', 3),
                    (r'async\s+', 5),
                    (r'await\s+', 5),
                    (r'try\s*{', 10),
                    (r'catch\s*\(', 10),
                    (r'/\*\*', 8),  # JSDoc comments
                    (r'===', 3),
                ],
                'bad': [
                    (r'var\s+', -8),
                    (r'==(?!=)', -5),
                    (r'eval\s*\(', -20),
                    (r'document\.write', -15),
                    (r'setTimeout\s*\(\s*.*,\s*0\s*\)', -15),  # setTimeout hack
                    (r'console\.log', -3),
                ]
            },
            'python': {
                'good': [
                    (r'def\s+', 5),
                    (r'class\s+', 8),
                    (r'import\s+', 3),
                    (r'from\s+.*import', 3),
                    (r'try:', 10),
                    (r'except', 10),
                    (r'with\s+', 8),
                    (r'"""', 5),  # Docstrings
                ],
                'bad': [
                    (r'exec\s*\(', -20),
                    (r'eval\s*\(', -20),
                    (r'global\s+', -5),
                    (r'print\s*\(', -2),
                ]
            }
        }
        
        patterns = quality_patterns.get(language, quality_patterns['javascript'])
        
        # Apply good patterns
        for pattern, score in patterns.get('good', []):
            matches = len(re.findall(pattern, code))
            fitness += matches * score
        
        # Apply bad patterns
        for pattern, penalty in patterns.get('bad', []):
            matches = len(re.findall(pattern, code))
            fitness += matches * penalty
        
        # Code length penalty (too short or too long)
        code_length = len(code.strip())
        if code_length < 50:
            fitness -= (50 - code_length) * 0.2
        elif code_length > 2000:
            fitness -= (code_length - 2000) * 0.01
        
        # Complexity analysis
        complexity_score = self._analyze_complexity(code, language)
        fitness += complexity_score
        
        return max(0.0, min(100.0, fitness))

    def _analyze_complexity(self, code: str, language: str) -> float:
        """Analyze code complexity and return fitness modifier"""
        complexity_score = 0
        
        if language == 'javascript' or language == 'python':
            # Count control structures
            control_structures = [
                r'if\s*\(',
                r'for\s*\(',
                r'while\s*\(',
                r'switch\s*\(',
                r'try\s*{',
            ]
            
            total_complexity = 0
            for pattern in control_structures:
                matches = len(re.findall(pattern, code))
                total_complexity += matches
            
            # Optimal complexity range
            if 2 <= total_complexity <= 8:
                complexity_score = 10
            elif total_complexity > 15:
                complexity_score = -5  # Too complex
            elif total_complexity == 0:
                complexity_score = -3  # Too simple
            else:
                complexity_score = 5
        
        return complexity_score

    def _calculate_diversity(self, population: List[Dict[str, Any]]) -> float:
        """Calculate genetic diversity of population"""
        if len(population) < 2:
            return 0.0
        
        total_distance = 0
        comparisons = 0
        
        for i in range(len(population)):
            for j in range(i + 1, len(population)):
                distance = self._calculate_code_distance(
                    population[i]['code'], 
                    population[j]['code']
                )
                total_distance += distance
                comparisons += 1
        
        return total_distance / comparisons if comparisons > 0 else 0.0

    def _calculate_code_distance(self, code1: str, code2: str) -> float:
        """Calculate similarity distance between two code strings"""
        # Simple Levenshtein-like distance
        lines1 = set(code1.split('\n'))
        lines2 = set(code2.split('\n'))
        
        intersection = len(lines1.intersection(lines2))
        union = len(lines1.union(lines2))
        
        return 1.0 - (intersection / union) if union > 0 else 0.0

    # === KARMA REINCARNATION SYSTEM ===

    async def process_karma_reincarnation(self, code: str, language: str, user_id: str) -> Dict[str, Any]:
        """Process code through karma reincarnation cycle"""
        try:
            # Calculate code quality and karma debt
            code_hash = hashlib.sha256(code.encode()).hexdigest()[:16]
            quality = self._calculate_code_fitness(code, language)
            karma_debt = max(0, int(100 - quality))
            
            # Determine reincarnation path
            if karma_debt > 50:
                reincarnation_path = 'tutorial-example'
                message = 'Code will be reborn as a tutorial example for others to learn from'
            elif karma_debt > 20:
                reincarnation_path = 'refactor-candidate'
                message = 'Code will be reincarnated as refactoring practice'
            else:
                reincarnation_path = 'wisdom-archive'
                message = 'Code will be preserved in the wisdom archive'
            
            # Save karma record
            karma_record = KarmaRecord(
                user_id=user_id,
                code_hash=code_hash,
                original_quality=quality,
                karma_debt=karma_debt,
                reincarnation_path=reincarnation_path,
                current_state='processing',
                cycles=1,
                created_at=datetime.utcnow()
            )
            
            await self.db.karma_records.insert_one(asdict(karma_record))
            self.reality_metrics['karma_cycles'] += 1
            
            return {
                'success': True,
                'code_hash': code_hash,
                'quality': quality,
                'karma_debt': karma_debt,
                'reincarnation_path': reincarnation_path,
                'message': message,
                'cycles': 1
            }
            
        except Exception as e:
            print(f"❌ Karma reincarnation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_karma_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's karma reincarnation history"""
        try:
            records = await self.db.karma_records.find(
                {'user_id': user_id}
            ).sort('created_at', -1).limit(50).to_list(50)
            
            return records
        except Exception as e:
            print(f"❌ Karma history error: {e}")
            return []

    # === DIGITAL ARCHAEOLOGY ===

    async def mine_legacy_code(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Mine legacy code for VIBE tokens and learning opportunities"""
        try:
            # Find old or problematic code in the project
            files = await self.db.files.find({
                'project_id': project_id,
                'type': 'file'
            }).to_list(1000)
            
            archaeology_findings = []
            total_vibe_earned = 0
            
            for file in files:
                if file.get('content'):
                    code = file['content']
                    language = self._detect_language(file['name'])
                    
                    # Analyze for archaeological value
                    findings = self._analyze_archaeological_value(code, language, file)
                    if findings['value'] > 0:
                        archaeology_findings.append(findings)
                        total_vibe_earned += findings['vibe_reward']
            
            # Save archaeology session
            session = {
                'user_id': user_id,
                'project_id': project_id,
                'files_analyzed': len(files),
                'findings': archaeology_findings,
                'total_vibe_earned': total_vibe_earned,
                'timestamp': datetime.utcnow(),
                'session_id': self._generate_id()
            }
            
            await self.db.archaeology_sessions.insert_one(session)
            
            return {
                'success': True,
                'findings': archaeology_findings,
                'vibe_earned': total_vibe_earned,
                'files_analyzed': len(files),
                'session_id': session['session_id']
            }
            
        except Exception as e:
            print(f"❌ Digital archaeology error: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _analyze_archaeological_value(self, code: str, language: str, file: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze code for archaeological/learning value"""
        findings = {
            'file_name': file['name'],
            'file_id': file['id'],
            'language': language,
            'value': 0,
            'vibe_reward': 0,
            'issues': [],
            'learning_opportunities': []
        }
        
        # Check for common legacy patterns
        legacy_patterns = {
            'javascript': [
                (r'var\s+', 'Use of deprecated var keyword', 10),
                (r'==(?!=)', 'Loose equality comparison', 5),
                (r'document\.write', 'Deprecated document.write', 15),
                (r'eval\s*\(', 'Dangerous eval usage', 20),
                (r'setTimeout\s*\(\s*.*,\s*0\s*\)', 'setTimeout hack pattern', 8),
            ],
            'python': [
                (r'exec\s*\(', 'Dangerous exec usage', 20),
                (r'import\s+\*', 'Wildcard import', 8),
                (r'print\s+[^(]', 'Python 2 print statement', 12),
            ]
        }
        
        patterns = legacy_patterns.get(language, [])
        
        for pattern, description, reward in patterns:
            matches = re.findall(pattern, code)
            if matches:
                findings['issues'].append({
                    'pattern': pattern,
                    'description': description,
                    'occurrences': len(matches),
                    'reward': reward
                })
                findings['value'] += len(matches) * reward
                findings['vibe_reward'] += len(matches) * reward
        
        # Check file age (older files might have more archaeological value)
        if 'created_at' in file:
            file_age_days = (datetime.utcnow() - file['created_at']).days
            if file_age_days > 30:
                age_bonus = min(file_age_days // 30, 10) * 5
                findings['value'] += age_bonus
                findings['vibe_reward'] += age_bonus
                findings['learning_opportunities'].append(f'Legacy code from {file_age_days} days ago')
        
        # Check for TODO/FIXME comments
        todos = len(re.findall(r'TODO|FIXME|HACK|XXX', code, re.IGNORECASE))
        if todos > 0:
            findings['issues'].append({
                'pattern': 'TODO/FIXME comments',
                'description': 'Unfinished work markers',
                'occurrences': todos,
                'reward': todos * 3
            })
            findings['value'] += todos * 3
            findings['vibe_reward'] += todos * 3
        
        return findings

    def _detect_language(self, filename: str) -> str:
        """Detect programming language from filename"""
        extensions = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.php': 'php',
            '.rb': 'ruby',
            '.go': 'go',
            '.rs': 'rust',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.sql': 'sql'
        }
        
        for ext, lang in extensions.items():
            if filename.endswith(ext):
                return lang
        
        return 'text'

    # === CODE IMMORTALITY SYSTEM ===

    async def activate_code_immortality(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Activate code immortality for a project"""
        try:
            # Create immortality record
            immortality_record = {
                'project_id': project_id,
                'user_id': user_id,
                'activated_at': datetime.utcnow(),
                'status': 'active',
                'auto_maintenance': True,
                'backup_frequency': 'daily',
                'migration_enabled': True,
                'immortality_id': self._generate_id()
            }
            
            await self.db.code_immortality.insert_one(immortality_record)
            self.reality_metrics['code_immortality_saves'] += 1
            
            # Schedule first backup
            await self._schedule_immortality_backup(project_id)
            
            return {
                'success': True,
                'immortality_id': immortality_record['immortality_id'],
                'status': 'Code immortality activated',
                'features': [
                    'Automatic daily backups',
                    'Cross-platform migration ready',
                    'Auto-maintenance enabled',
                    'Quantum preservation protocols'
                ]
            }
            
        except Exception as e:
            print(f"❌ Code immortality error: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _schedule_immortality_backup(self, project_id: str):
        """Schedule immortality backup for project"""
        # In a real implementation, this would integrate with a job scheduler
        print(f"📡 Immortality backup scheduled for project {project_id}")

    # === NEXUS EVENTS (CROSS-PLATFORM) ===

    async def create_nexus_event(self, source_platform: str, target_platform: str, 
                                action: str, payload: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a cross-platform nexus event"""
        try:
            nexus_event = NexusEvent(
                event_id=self._generate_id(),
                source_platform=source_platform,
                target_platform=target_platform,
                action=action,
                payload=payload,
                quantum_signature=self._generate_quantum_signature(),
                timestamp=datetime.utcnow(),
                status='pending'
            )
            
            await self.db.nexus_events.insert_one(asdict(nexus_event))
            self.reality_metrics['nexus_events'] += 1
            
            # Process the nexus event
            result = await self._process_nexus_event(nexus_event, user_id)
            
            return {
                'success': True,
                'event_id': nexus_event.event_id,
                'description': self._get_nexus_description(source_platform, target_platform),
                'result': result,
                'quantum_signature': nexus_event.quantum_signature
            }
            
        except Exception as e:
            print(f"❌ Nexus event error: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _get_nexus_description(self, source: str, target: str) -> str:
        """Get description for nexus event type"""
        descriptions = {
            'web-mobile': 'Code editing continues seamlessly on mobile device',
            'mobile-web': 'Mobile edits sync back to web IDE',
            'ide-production': 'Direct live server patching from IDE',
            'local-cloud': 'Project migrates to cloud infrastructure',
            'cloud-local': 'Cloud project syncs to local environment'
        }
        
        key = f"{source}-{target}"
        return descriptions.get(key, f"Unknown nexus pattern: {key}")

    async def _process_nexus_event(self, event: NexusEvent, user_id: str) -> Dict[str, Any]:
        """Process a nexus event"""
        # Simulate cross-platform action
        processing_result = {
            'processed_at': datetime.utcnow(),
            'success': True,
            'modifications': [],
            'sync_status': 'completed'
        }
        
        # Update event status
        await self.db.nexus_events.update_one(
            {'event_id': event.event_id},
            {'$set': {'status': 'completed', 'result': processing_result}}
        )
        
        return processing_result

    def _generate_quantum_signature(self) -> str:
        """Generate quantum entanglement signature"""
        timestamp = str(time.time())
        random_data = str(random.random())
        return hashlib.sha256((timestamp + random_data).encode()).hexdigest()[:12]

    # === COSMIC DEBUGGING ===

    async def start_cosmic_debug_session(self, project_id: str, commit_hash: str = None, user_id: str = None) -> Dict[str, Any]:
        """Start a cosmic debugging session with time travel"""
        try:
            session_id = self._generate_id()
            
            # Simulate git time travel
            time_points = [
                'Current Reality',
                '1 commit ago',
                '1 hour ago',
                '1 day ago', 
                '1 week ago',
                'Last working version',
                'Genesis commit'
            ]
            
            destination = commit_hash if commit_hash else random.choice(time_points[1:])
            
            debug_session = {
                'session_id': session_id,
                'project_id': project_id,
                'user_id': user_id,
                'destination': destination,
                'time_points': time_points,
                'started_at': datetime.utcnow(),
                'status': 'active',
                'annotations': [],
                'paradox_risk': 'low',
                'temporal_modifications': []
            }
            
            await self.db.cosmic_debug_sessions.insert_one(debug_session)
            self.reality_metrics['cosmic_debug_sessions'] += 1
            
            return {
                'success': True,
                'session_id': session_id,
                'destination': destination,
                'available_timepoints': time_points,
                'message': f'Cosmic debugger activated. Time travel to: {destination}',
                'temporal_status': 'stable'
            }
            
        except Exception as e:
            print(f"❌ Cosmic debug error: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    # === REALITY METRICS ===

    async def get_reality_metrics(self) -> Dict[str, Any]:
        """Get current reality metrics and cosmic statistics"""
        try:
            # Get database counts
            db_metrics = {}
            collections = [
                'code_evolutions', 'karma_records', 'archaeology_sessions',
                'code_immortality', 'nexus_events', 'cosmic_debug_sessions'
            ]
            
            for collection in collections:
                try:
                    count = await getattr(self.db, collection).count_documents({})
                    db_metrics[collection] = count
                except:
                    db_metrics[collection] = 0
            
            return {
                'reality_metrics': self.reality_metrics,
                'database_metrics': db_metrics,
                'cosmic_status': 'operational',
                'reality_version': '2.0.cosmic',
                'quantum_coherence': 'stable',
                'last_updated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Reality metrics error: {e}")
            return {
                'error': str(e),
                'cosmic_status': 'degraded'
            }

    # === UTILITY METHODS ===

    def _generate_id(self) -> str:
        """Generate unique ID"""
        return hashlib.sha256(f"{time.time()}{random.random()}".encode()).hexdigest()[:16]

    async def cleanup_old_records(self, days_old: int = 30):
        """Clean up old cosmic records"""
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        collections = [
            'code_evolutions', 'karma_records', 'archaeology_sessions',
            'nexus_events', 'cosmic_debug_sessions'
        ]
        
        for collection in collections:
            try:
                result = await getattr(self.db, collection).delete_many({
                    'created_at': {'$lt': cutoff_date}
                })
                print(f"🧹 Cleaned {result.deleted_count} old records from {collection}")
            except Exception as e:
                print(f"❌ Cleanup error for {collection}: {e}")


# Global cosmic service instance
cosmic_service = None

def init_cosmic_service(db_manager):
    """Initialize the cosmic service"""
    global cosmic_service
    cosmic_service = CosmicService(db_manager)
    return cosmic_service

def get_cosmic_service():
    """Get the cosmic service instance"""
    global cosmic_service
    return cosmic_service</content>
    </file>