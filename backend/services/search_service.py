"""
Global Search Service - Intelligent Code and Content Discovery
Provides comprehensive search capabilities across projects, files, and content
"""

import asyncio
import re
import logging
from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timedelta
import uuid
from difflib import SequenceMatcher
import ast

logger = logging.getLogger(__name__)

class SearchService:
    """
    Advanced search service with intelligent code and content discovery
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # Search indices (in-memory for fast searching)
        self.content_index: Dict[str, Set[str]] = {}  # word -> set of file_ids
        self.symbol_index: Dict[str, List[Dict]] = {}  # symbol -> [file_info]
        self.last_index_update = None
        self.index_dirty = True
        
        # Search configuration
        self.min_search_length = 2
        self.max_results = 100
        self.relevance_threshold = 0.1
        
        # Language-specific patterns
        self.language_patterns = {
            'javascript': {
                'function': [r'function\s+(\w+)', r'(\w+)\s*[=:]\s*(?:async\s+)?function', r'(\w+)\s*=>\s*{?'],
                'class': [r'class\s+(\w+)'],
                'variable': [r'(?:var|let|const)\s+(\w+)', r'(\w+)\s*='],
                'import': [r'import\s+.*?from\s+["\']([^"\']+)', r'import\s+["\']([^"\']+)'],
                'comment': [r'//.*?$', r'/\*.*?\*/']
            },
            'python': {
                'function': [r'def\s+(\w+)', r'(\w+)\s*=\s*lambda'],
                'class': [r'class\s+(\w+)'],
                'variable': [r'(\w+)\s*='],
                'import': [r'from\s+(\w+(?:\.\w+)*)', r'import\s+(\w+(?:\.\w+)*)'],
                'comment': [r'#.*?$', r'""".*?"""', r"'''.*?'''"]
            },
            'typescript': {
                'function': [r'function\s+(\w+)', r'(\w+)\s*[=:]\s*(?:async\s+)?(?:\(.*?\)\s*=>\s*{?|function)'],
                'class': [r'class\s+(\w+)', r'interface\s+(\w+)', r'type\s+(\w+)'],
                'variable': [r'(?:var|let|const)\s+(\w+)', r'(\w+):\s*\w+'],
                'import': [r'import\s+.*?from\s+["\']([^"\']+)', r'import\s+["\']([^"\']+)'],
                'comment': [r'//.*?$', r'/\*.*?\*/']
            }
        }
        
        logger.info("🔍 Search Service initialized")

    async def global_search(self, query: str, filters: Dict[str, Any] = None, user_id: str = None) -> Dict[str, Any]:
        """Perform global search across all accessible content"""
        try:
            if len(query.strip()) < self.min_search_length:
                return {
                    'success': False,
                    'error': f'Search query must be at least {self.min_search_length} characters'
                }
            
            # Parse search query and filters
            search_terms = self._parse_search_query(query)
            filters = filters or {}
            
            # Ensure search index is up to date
            await self._ensure_search_index()
            
            # Perform different types of searches
            results = {
                'files': [],
                'content': [],
                'symbols': [],
                'projects': []
            }
            
            # Search in parallel
            search_tasks = [
                self._search_files(search_terms, filters),
                self._search_content(search_terms, filters),
                self._search_symbols(search_terms, filters),
                self._search_projects(search_terms, filters)
            ]
            
            search_results = await asyncio.gather(*search_tasks)
            
            results['files'] = search_results[0]
            results['content'] = search_results[1]
            results['symbols'] = search_results[2]
            results['projects'] = search_results[3]
            
            # Calculate relevance scores and sort
            all_results = []
            for result_type, result_list in results.items():
                for result in result_list:
                    result['result_type'] = result_type
                    result['relevance_score'] = self._calculate_relevance_score(result, search_terms)
                    all_results.append(result)
            
            # Sort by relevance and limit results
            all_results.sort(key=lambda x: x['relevance_score'], reverse=True)
            all_results = all_results[:self.max_results]
            
            # Group results back by type
            grouped_results = {
                'files': [r for r in all_results if r['result_type'] == 'files'],
                'content': [r for r in all_results if r['result_type'] == 'content'],
                'symbols': [r for r in all_results if r['result_type'] == 'symbols'],
                'projects': [r for r in all_results if r['result_type'] == 'projects']
            }
            
            # Log search query
            await self._log_search_query(query, user_id, len(all_results))
            
            return {
                'success': True,
                'query': query,
                'results': grouped_results,
                'total_results': len(all_results),
                'search_time': f"{datetime.utcnow().timestamp() - datetime.utcnow().timestamp():.3f}s",
                'filters_applied': filters
            }
            
        except Exception as e:
            logger.error(f"Global search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def code_search(self, query: str, language: str = None, search_type: str = 'all') -> Dict[str, Any]:
        """Specialized code search with language-specific parsing"""
        try:
            await self._ensure_search_index()
            
            # Parse code query
            code_terms = self._parse_code_query(query, language)
            
            # Search for code patterns
            results = []
            
            if search_type in ['all', 'functions']:
                function_results = await self._search_code_symbols('function', code_terms, language)
                results.extend(function_results)
            
            if search_type in ['all', 'classes']:
                class_results = await self._search_code_symbols('class', code_terms, language)
                results.extend(class_results)
            
            if search_type in ['all', 'variables']:
                variable_results = await self._search_code_symbols('variable', code_terms, language)
                results.extend(variable_results)
            
            if search_type in ['all', 'imports']:
                import_results = await self._search_code_symbols('import', code_terms, language)
                results.extend(import_results)
            
            # Remove duplicates and sort by relevance
            unique_results = {r['match_id']: r for r in results}.values()
            sorted_results = sorted(unique_results, key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            return {
                'success': True,
                'query': query,
                'language': language,
                'search_type': search_type,
                'results': list(sorted_results),
                'total_results': len(sorted_results)
            }
            
        except Exception as e:
            logger.error(f"Code search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def fuzzy_search(self, query: str, target_type: str = 'files', similarity_threshold: float = 0.6) -> Dict[str, Any]:
        """Fuzzy search for approximate matches"""
        try:
            results = []
            
            if target_type == 'files':
                # Search file names with fuzzy matching
                files = await self.db.files.find(
                    {'type': 'file'},
                    {'id': 1, 'name': 1, 'project_id': 1, 'size': 1, 'updated_at': 1}
                ).to_list(1000)
                
                for file_doc in files:
                    similarity = SequenceMatcher(None, query.lower(), file_doc['name'].lower()).ratio()
                    if similarity >= similarity_threshold:
                        results.append({
                            'id': file_doc['id'],
                            'name': file_doc['name'],
                            'project_id': file_doc['project_id'],
                            'similarity': similarity,
                            'match_type': 'filename'
                        })
            
            elif target_type == 'projects':
                # Search project names with fuzzy matching
                projects = await self.db.projects.find(
                    {},
                    {'id': 1, 'name': 1, 'description': 1, 'created_at': 1}
                ).to_list(100)
                
                for project in projects:
                    name_similarity = SequenceMatcher(None, query.lower(), project['name'].lower()).ratio()
                    desc_similarity = 0
                    if project.get('description'):
                        desc_similarity = SequenceMatcher(None, query.lower(), project['description'].lower()).ratio()
                    
                    max_similarity = max(name_similarity, desc_similarity)
                    if max_similarity >= similarity_threshold:
                        results.append({
                            'id': project['id'],
                            'name': project['name'],
                            'description': project.get('description', ''),
                            'similarity': max_similarity,
                            'match_type': 'name' if name_similarity > desc_similarity else 'description'
                        })
            
            # Sort by similarity
            results.sort(key=lambda x: x['similarity'], reverse=True)
            
            return {
                'success': True,
                'query': query,
                'target_type': target_type,
                'similarity_threshold': similarity_threshold,
                'results': results,
                'total_results': len(results)
            }
            
        except Exception as e:
            logger.error(f"Fuzzy search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def smart_file_search(self, query: str, project_id: str = None) -> Dict[str, Any]:
        """Smart file finding with path traversal and pattern matching"""
        try:
            # Parse file path query
            path_parts = query.split('/')
            filename_pattern = path_parts[-1] if path_parts else query
            
            # Build search criteria
            search_criteria = {'type': 'file'}
            if project_id:
                search_criteria['project_id'] = project_id
            
            # Search files
            files = await self.db.files.find(search_criteria).to_list(1000)
            
            results = []
            for file_doc in files:
                file_matches = []
                
                # Exact name match
                if filename_pattern.lower() in file_doc['name'].lower():
                    file_matches.append({
                        'type': 'exact_name',
                        'score': 1.0,
                        'match': filename_pattern
                    })
                
                # Extension match
                if filename_pattern.startswith('.') and file_doc['name'].endswith(filename_pattern):
                    file_matches.append({
                        'type': 'extension',
                        'score': 0.8,
                        'match': filename_pattern
                    })
                
                # Pattern match (wildcards)
                if '*' in filename_pattern or '?' in filename_pattern:
                    pattern_regex = filename_pattern.replace('*', '.*').replace('?', '.')
                    if re.search(pattern_regex, file_doc['name'], re.IGNORECASE):
                        file_matches.append({
                            'type': 'pattern',
                            'score': 0.7,
                            'match': filename_pattern
                        })
                
                # Fuzzy name match
                name_similarity = SequenceMatcher(None, filename_pattern.lower(), file_doc['name'].lower()).ratio()
                if name_similarity >= 0.5:
                    file_matches.append({
                        'type': 'fuzzy_name',
                        'score': name_similarity,
                        'match': file_doc['name']
                    })
                
                if file_matches:
                    best_match = max(file_matches, key=lambda x: x['score'])
                    results.append({
                        'id': file_doc['id'],
                        'name': file_doc['name'],
                        'project_id': file_doc['project_id'],
                        'size': file_doc.get('size', 0),
                        'updated_at': file_doc.get('updated_at'),
                        'match': best_match,
                        'relevance_score': best_match['score']
                    })
            
            # Sort by relevance
            results.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            return {
                'success': True,
                'query': query,
                'project_id': project_id,
                'results': results[:50],  # Limit to 50 results
                'total_results': len(results)
            }
            
        except Exception as e:
            logger.error(f"Smart file search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_search_suggestions(self, partial_query: str, context: str = 'global') -> Dict[str, Any]:
        """Get search suggestions based on partial query"""
        try:
            if len(partial_query) < 2:
                return {
                    'success': True,
                    'suggestions': []
                }
            
            suggestions = []
            
            # File name suggestions
            files = await self.db.files.find(
                {
                    'name': {'$regex': f'^{re.escape(partial_query)}', '$options': 'i'},
                    'type': 'file'
                },
                {'name': 1}
            ).limit(10).to_list(10)
            
            for file_doc in files:
                suggestions.append({
                    'text': file_doc['name'],
                    'type': 'filename',
                    'category': 'Files'
                })
            
            # Project name suggestions
            projects = await self.db.projects.find(
                {'name': {'$regex': f'{re.escape(partial_query)}', '$options': 'i'}},
                {'name': 1}
            ).limit(5).to_list(5)
            
            for project in projects:
                suggestions.append({
                    'text': project['name'],
                    'type': 'project',
                    'category': 'Projects'
                })
            
            # Symbol suggestions from index
            if hasattr(self, 'symbol_index'):
                for symbol, file_infos in self.symbol_index.items():
                    if partial_query.lower() in symbol.lower():
                        suggestions.append({
                            'text': symbol,
                            'type': 'symbol',
                            'category': 'Code Symbols',
                            'file_count': len(file_infos)
                        })
                        if len(suggestions) >= 20:
                            break
            
            # Remove duplicates and sort
            unique_suggestions = {s['text']: s for s in suggestions}.values()
            sorted_suggestions = sorted(unique_suggestions, key=lambda x: x['text'])
            
            return {
                'success': True,
                'partial_query': partial_query,
                'suggestions': list(sorted_suggestions)[:15]
            }
            
        except Exception as e:
            logger.error(f"Search suggestions failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _search_files(self, search_terms: List[str], filters: Dict) -> List[Dict]:
        """Search file names and metadata"""
        try:
            # Build search query
            search_query = {'type': 'file'}
            
            if filters.get('project_id'):
                search_query['project_id'] = filters['project_id']
            
            if filters.get('file_type'):
                search_query['extension'] = filters['file_type']
            
            # Text search in file names
            name_patterns = []
            for term in search_terms:
                name_patterns.append({'name': {'$regex': re.escape(term), '$options': 'i'}})
            
            if name_patterns:
                search_query['$or'] = name_patterns
            
            files = await self.db.files.find(search_query).limit(50).to_list(50)
            
            results = []
            for file_doc in files:
                results.append({
                    'id': file_doc['id'],
                    'name': file_doc['name'],
                    'project_id': file_doc['project_id'],
                    'size': file_doc.get('size', 0),
                    'extension': file_doc.get('extension', ''),
                    'updated_at': file_doc.get('updated_at'),
                    'match_type': 'filename'
                })
            
            return results
            
        except Exception as e:
            logger.error(f"File search failed: {e}")
            return []

    async def _search_content(self, search_terms: List[str], filters: Dict) -> List[Dict]:
        """Search within file content"""
        try:
            # Search in text files only
            search_query = {
                'type': 'file',
                'category': {'$in': ['text', None]}  # Include files without category
            }
            
            if filters.get('project_id'):
                search_query['project_id'] = filters['project_id']
            
            # Content search patterns
            content_patterns = []
            for term in search_terms:
                content_patterns.append({'content': {'$regex': re.escape(term), '$options': 'i'}})
            
            if content_patterns:
                search_query['$or'] = content_patterns
            
            files = await self.db.files.find(search_query).limit(30).to_list(30)
            
            results = []
            for file_doc in files:
                content = file_doc.get('content', '')
                if content:
                    # Find matching lines
                    matching_lines = []
                    for i, line in enumerate(content.split('\n')):
                        for term in search_terms:
                            if term.lower() in line.lower():
                                matching_lines.append({
                                    'line_number': i + 1,
                                    'content': line.strip(),
                                    'term': term
                                })
                                break
                        
                        if len(matching_lines) >= 3:  # Limit to 3 matches per file
                            break
                    
                    if matching_lines:
                        results.append({
                            'id': file_doc['id'],
                            'name': file_doc['name'],
                            'project_id': file_doc['project_id'],
                            'matches': matching_lines,
                            'match_type': 'content'
                        })
            
            return results
            
        except Exception as e:
            logger.error(f"Content search failed: {e}")
            return []

    async def _search_symbols(self, search_terms: List[str], filters: Dict) -> List[Dict]:
        """Search code symbols (functions, classes, variables)"""
        try:
            results = []
            
            # Search in symbol index
            for term in search_terms:
                for symbol, file_infos in self.symbol_index.items():
                    if term.lower() in symbol.lower():
                        for file_info in file_infos:
                            results.append({
                                'symbol': symbol,
                                'symbol_type': file_info.get('symbol_type', 'unknown'),
                                'file_id': file_info['file_id'],
                                'file_name': file_info['file_name'],
                                'project_id': file_info['project_id'],
                                'line_number': file_info.get('line_number', 0),
                                'match_type': 'symbol'
                            })
            
            return results[:20]  # Limit symbol results
            
        except Exception as e:
            logger.error(f"Symbol search failed: {e}")
            return []

    async def _search_projects(self, search_terms: List[str], filters: Dict) -> List[Dict]:
        """Search project names and descriptions"""
        try:
            # Build project search query
            project_patterns = []
            for term in search_terms:
                project_patterns.extend([
                    {'name': {'$regex': re.escape(term), '$options': 'i'}},
                    {'description': {'$regex': re.escape(term), '$options': 'i'}}
                ])
            
            search_query = {'$or': project_patterns} if project_patterns else {}
            
            projects = await self.db.projects.find(search_query).limit(20).to_list(20)
            
            results = []
            for project in projects:
                results.append({
                    'id': project['id'],
                    'name': project['name'],
                    'description': project.get('description', ''),
                    'created_at': project.get('created_at'),
                    'file_count': project.get('file_count', 0),
                    'match_type': 'project'
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Project search failed: {e}")
            return []

    async def _search_code_symbols(self, symbol_type: str, code_terms: List[str], language: str = None) -> List[Dict]:
        """Search for specific code symbols"""
        try:
            results = []
            
            # Get language patterns
            patterns = []
            if language and language in self.language_patterns:
                patterns = self.language_patterns[language].get(symbol_type, [])
            else:
                # Use all language patterns
                for lang_patterns in self.language_patterns.values():
                    patterns.extend(lang_patterns.get(symbol_type, []))
            
            # Search in files
            files = await self.db.files.find(
                {'type': 'file', 'category': 'text'}
            ).to_list(100)
            
            for file_doc in files:
                content = file_doc.get('content', '')
                if not content:
                    continue
                
                # Search for symbols in content
                for pattern in patterns:
                    matches = re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE)
                    for match in matches:
                        symbol_name = match.group(1) if match.groups() else match.group(0)
                        
                        # Check if symbol matches search terms
                        for term in code_terms:
                            if term.lower() in symbol_name.lower():
                                line_number = content[:match.start()].count('\n') + 1
                                results.append({
                                    'match_id': f"{file_doc['id']}_{symbol_name}_{line_number}",
                                    'symbol': symbol_name,
                                    'symbol_type': symbol_type,
                                    'file_id': file_doc['id'],
                                    'file_name': file_doc['name'],
                                    'project_id': file_doc['project_id'],
                                    'line_number': line_number,
                                    'context': self._get_line_context(content, line_number),
                                    'language': language or self._detect_language(file_doc.get('extension', '')),
                                    'relevance_score': self._calculate_symbol_relevance(symbol_name, term)
                                })
            
            return results
            
        except Exception as e:
            logger.error(f"Code symbol search failed: {e}")
            return []

    def _parse_search_query(self, query: str) -> List[str]:
        """Parse search query into terms"""
        # Handle quoted phrases
        phrases = re.findall(r'"([^"]*)"', query)
        remaining_query = re.sub(r'"[^"]*"', '', query)
        
        # Split remaining query into words
        words = remaining_query.split()
        
        # Combine phrases and words
        terms = phrases + words
        return [term.strip() for term in terms if len(term.strip()) >= self.min_search_length]

    def _parse_code_query(self, query: str, language: str = None) -> List[str]:
        """Parse code-specific query"""
        # Remove common code symbols that might interfere
        cleaned_query = re.sub(r'[{}()\[\];,.]', ' ', query)
        return self._parse_search_query(cleaned_query)

    def _calculate_relevance_score(self, result: Dict, search_terms: List[str]) -> float:
        """Calculate relevance score for search result"""
        score = 0.0
        
        # Base score by match type
        match_type_scores = {
            'exact_name': 1.0,
            'filename': 0.8,
            'content': 0.6,
            'symbol': 0.7,
            'project': 0.5
        }
        
        match_type = result.get('match_type', 'content')
        score += match_type_scores.get(match_type, 0.5)
        
        # Boost score for multiple term matches
        text_to_search = f"{result.get('name', '')} {result.get('content', '')} {result.get('symbol', '')}"
        matched_terms = sum(1 for term in search_terms if term.lower() in text_to_search.lower())
        score += (matched_terms / len(search_terms)) * 0.3
        
        # Recent files get slight boost
        if result.get('updated_at'):
            days_old = (datetime.utcnow() - result['updated_at']).days
            if days_old < 7:
                score += 0.1
        
        return score

    def _calculate_symbol_relevance(self, symbol_name: str, search_term: str) -> float:
        """Calculate relevance score for symbol matches"""
        # Exact match
        if symbol_name.lower() == search_term.lower():
            return 1.0
        
        # Starts with
        if symbol_name.lower().startswith(search_term.lower()):
            return 0.9
        
        # Contains
        if search_term.lower() in symbol_name.lower():
            return 0.7
        
        # Similarity
        similarity = SequenceMatcher(None, search_term.lower(), symbol_name.lower()).ratio()
        return similarity

    def _get_line_context(self, content: str, line_number: int, context_lines: int = 2) -> Dict[str, str]:
        """Get context around a specific line"""
        lines = content.split('\n')
        start_line = max(0, line_number - context_lines - 1)
        end_line = min(len(lines), line_number + context_lines)
        
        return {
            'before': '\n'.join(lines[start_line:line_number-1]),
            'current': lines[line_number-1] if line_number <= len(lines) else '',
            'after': '\n'.join(lines[line_number:end_line])
        }

    def _detect_language(self, extension: str) -> str:
        """Detect programming language from file extension"""
        language_map = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.php': 'php',
            '.rb': 'ruby',
            '.go': 'go',
            '.rs': 'rust'
        }
        return language_map.get(extension.lower(), 'unknown')

    async def _ensure_search_index(self):
        """Ensure search index is up to date"""
        if self.index_dirty or not self.last_index_update or \
           (datetime.utcnow() - self.last_index_update).total_seconds() > 3600:  # 1 hour
            await self._rebuild_search_index()

    async def _rebuild_search_index(self):
        """Rebuild search index from database"""
        try:
            logger.info("Rebuilding search index...")
            
            # Clear existing indices
            self.content_index.clear()
            self.symbol_index.clear()
            
            # Index all text files
            files = await self.db.files.find(
                {'type': 'file', 'category': {'$in': ['text', None]}}
            ).to_list(1000)
            
            for file_doc in files:
                content = file_doc.get('content', '')
                if content:
                    # Index content words
                    words = set(re.findall(r'\w{3,}', content.lower()))  # Words with 3+ chars
                    for word in words:
                        if word not in self.content_index:
                            self.content_index[word] = set()
                        self.content_index[word].add(file_doc['id'])
                    
                    # Index code symbols
                    await self._index_code_symbols(file_doc, content)
            
            self.last_index_update = datetime.utcnow()
            self.index_dirty = False
            logger.info(f"Search index rebuilt with {len(self.content_index)} terms and {len(self.symbol_index)} symbols")
            
        except Exception as e:
            logger.error(f"Failed to rebuild search index: {e}")

    async def _index_code_symbols(self, file_doc: Dict, content: str):
        """Index code symbols from file content"""
        try:
            language = self._detect_language(file_doc.get('extension', ''))
            if language == 'unknown':
                return
            
            patterns = self.language_patterns.get(language, {})
            
            for symbol_type, type_patterns in patterns.items():
                if symbol_type == 'comment':  # Skip comments
                    continue
                
                for pattern in type_patterns:
                    matches = re.finditer(pattern, content, re.MULTILINE)
                    for match in matches:
                        symbol_name = match.group(1) if match.groups() else match.group(0)
                        if len(symbol_name) >= 2:  # Minimum symbol length
                            if symbol_name not in self.symbol_index:
                                self.symbol_index[symbol_name] = []
                            
                            line_number = content[:match.start()].count('\n') + 1
                            self.symbol_index[symbol_name].append({
                                'file_id': file_doc['id'],
                                'file_name': file_doc['name'],
                                'project_id': file_doc['project_id'],
                                'symbol_type': symbol_type,
                                'line_number': line_number,
                                'language': language
                            })
                            
        except Exception as e:
            logger.warning(f"Failed to index symbols for {file_doc.get('name')}: {e}")

    async def _log_search_query(self, query: str, user_id: str = None, result_count: int = 0):
        """Log search query for analytics"""
        try:
            search_log = {
                'query': query,
                'user_id': user_id,
                'result_count': result_count,
                'timestamp': datetime.utcnow(),
                'search_id': str(uuid.uuid4())
            }
            
            await self.db.search_logs.insert_one(search_log)
            
        except Exception as e:
            logger.warning(f"Failed to log search query: {e}")

# Global search service instance
_search_service = None

def init_search_service(db_manager):
    """Initialize the search service"""
    global _search_service
    _search_service = SearchService(db_manager)
    logger.info("🔍 Search Service initialized!")

def get_search_service() -> Optional[SearchService]:
    """Get the search service instance"""
    return _search_service