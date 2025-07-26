"""
Enhanced Search Service - Global Intelligent Search
AI-powered semantic search across projects, code, and content
"""

import asyncio
import json
import logging
import re
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import uuid
from collections import defaultdict
import math

logger = logging.getLogger(__name__)

class EnhancedSearchService:
    """
    Enhanced search service with AI-powered semantic search,
    intelligent code navigation, and project-wide search capabilities
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        
        # Search configuration
        self.search_config = {
            'max_results': 100,
            'min_score': 0.1,
            'fuzzy_threshold': 0.7,
            'context_lines': 3,
            'search_timeout': 30  # seconds
        }
        
        # Search indexes
        self.search_indexes = {
            'code': {},
            'projects': {},
            'files': {},
            'comments': {},
            'documentation': {}
        }
        
        # Search history
        self.search_history = defaultdict(list)
        
        # Search filters
        self.search_filters = {
            'file_types': ['js', 'py', 'java', 'cpp', 'css', 'html', 'json', 'md', 'txt'],
            'project_types': ['web', 'mobile', 'desktop', 'library', 'tool'],
            'content_types': ['code', 'documentation', 'comments', 'readme', 'config']
        }
        
        logger.info("🔍 Enhanced Search Service initialized")

    async def global_search(self, query: str, user_id: str, filters: Dict = None, search_type: str = "all") -> Dict[str, Any]:
        """Global search across all content types"""
        try:
            start_time = datetime.utcnow()
            
            # Parse and validate query
            parsed_query = self._parse_search_query(query)
            
            if not parsed_query['terms']:
                return {
                    'success': False,
                    'error': 'Empty search query'
                }
            
            # Apply filters
            search_filters = self._apply_filters(filters or {}, user_id)
            
            # Execute search based on type
            results = {}
            
            if search_type in ['all', 'code']:
                results['code'] = await self._search_code(parsed_query, search_filters)
            
            if search_type in ['all', 'projects']:
                results['projects'] = await self._search_projects(parsed_query, search_filters)
            
            if search_type in ['all', 'files']:
                results['files'] = await self._search_files(parsed_query, search_filters)
            
            if search_type in ['all', 'documentation']:
                results['documentation'] = await self._search_documentation(parsed_query, search_filters)
            
            if search_type in ['all', 'comments']:
                results['comments'] = await self._search_comments(parsed_query, search_filters)
            
            # Combine and rank results
            combined_results = self._combine_and_rank_results(results, parsed_query)
            
            # Calculate search time
            search_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Store search history
            await self._store_search_history(user_id, query, search_type, len(combined_results))
            
            return {
                'success': True,
                'query': query,
                'search_type': search_type,
                'results': combined_results,
                'total_results': len(combined_results),
                'search_time': search_time,
                'filters_applied': search_filters
            }
            
        except Exception as e:
            logger.error(f"Global search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def semantic_search(self, query: str, user_id: str, context: str = None) -> Dict[str, Any]:
        """AI-powered semantic search"""
        try:
            # This would integrate with the AI service for semantic understanding
            # For now, implement enhanced keyword matching with context
            
            # Get AI service for semantic analysis
            # ai_service = get_enhanced_ai_service_v2()
            
            # Expand query with synonyms and related terms
            expanded_query = await self._expand_query_semantically(query)
            
            # Search with expanded terms
            results = await self.global_search(expanded_query, user_id, search_type="all")
            
            # Re-rank results based on semantic similarity
            if results['success']:
                results['results'] = await self._rerank_semantic_results(results['results'], query, context)
                results['search_type'] = 'semantic'
                results['expanded_query'] = expanded_query
            
            return results
            
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def code_search(self, query: str, user_id: str, language: str = None, project_id: str = None) -> Dict[str, Any]:
        """Advanced code search with syntax awareness"""
        try:
            # Parse code search patterns
            code_patterns = self._parse_code_patterns(query, language)
            
            # Build search filter
            search_filter = {'user_id': user_id}
            
            if project_id:
                search_filter['project_id'] = project_id
            
            if language:
                search_filter['language'] = language
            
            # Search code files
            code_results = []
            
            # Search in file contents
            files_cursor = self.db.files.find({
                **search_filter,
                'type': 'code',
                'status': 'completed'
            })
            
            async for file_doc in files_cursor:
                file_results = await self._search_in_file_content(file_doc, code_patterns)
                if file_results:
                    code_results.extend(file_results)
            
            # Search in code snippets
            snippets_cursor = self.db.code_snippets.find({
                **search_filter,
                '$or': [
                    {'code': {'$regex': pattern, '$options': 'i'}} for pattern in code_patterns['regex_patterns']
                ]
            })
            
            async for snippet in snippets_cursor:
                code_results.append({
                    'type': 'snippet',
                    'id': snippet['snippet_id'],
                    'title': snippet.get('title', 'Code Snippet'),
                    'code': snippet['code'],
                    'language': snippet.get('language', 'unknown'),
                    'matches': self._find_matches_in_text(snippet['code'], code_patterns),
                    'file_path': 'snippet',
                    'project_id': snippet.get('project_id')
                })
            
            # Rank results by relevance
            ranked_results = self._rank_code_results(code_results, code_patterns)
            
            return {
                'success': True,
                'query': query,
                'language': language,
                'project_id': project_id,
                'results': ranked_results,
                'total_results': len(ranked_results),
                'patterns_matched': code_patterns
            }
            
        except Exception as e:
            logger.error(f"Code search failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def search_and_replace(self, search_query: str, replace_text: str, user_id: str, 
                                project_id: str = None, file_types: List[str] = None) -> Dict[str, Any]:
        """Project-wide search and replace"""
        try:
            # Find all matching occurrences
            search_results = await self.code_search(search_query, user_id, project_id=project_id)
            
            if not search_results['success']:
                return search_results
            
            # Filter by file types if specified
            if file_types:
                filtered_results = []
                for result in search_results['results']:
                    if result.get('language') in file_types:
                        filtered_results.append(result)
                search_results['results'] = filtered_results
            
            # Prepare replacement operations
            replacement_operations = []
            
            for result in search_results['results']:
                if result['type'] == 'file':
                    # Read file content
                    file_content = await self._read_file_content(result['file_path'])
                    
                    # Perform replacements
                    new_content = re.sub(search_query, replace_text, file_content, flags=re.MULTILINE)
                    
                    if new_content != file_content:
                        replacement_operations.append({
                            'file_path': result['file_path'],
                            'file_id': result['id'],
                            'original_content': file_content,
                            'new_content': new_content,
                            'changes_count': len(re.findall(search_query, file_content))
                        })
            
            # Execute replacements (in transaction-like manner)
            successful_replacements = []
            failed_replacements = []
            
            for operation in replacement_operations:
                try:
                    # Update file content
                    await self._update_file_content(operation['file_id'], operation['new_content'], user_id)
                    successful_replacements.append(operation)
                except Exception as e:
                    failed_replacements.append({
                        'file_path': operation['file_path'],
                        'error': str(e)
                    })
            
            return {
                'success': True,
                'search_query': search_query,
                'replace_text': replace_text,
                'total_files_found': len(search_results['results']),
                'successful_replacements': len(successful_replacements),
                'failed_replacements': len(failed_replacements),
                'replacement_details': successful_replacements,
                'errors': failed_replacements
            }
            
        except Exception as e:
            logger.error(f"Search and replace failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_search_suggestions(self, partial_query: str, user_id: str) -> Dict[str, Any]:
        """Get search suggestions based on partial query"""
        try:
            suggestions = []
            
            # Get suggestions from search history
            history_suggestions = await self._get_history_suggestions(partial_query, user_id)
            suggestions.extend(history_suggestions)
            
            # Get suggestions from recent files
            file_suggestions = await self._get_file_suggestions(partial_query, user_id)
            suggestions.extend(file_suggestions)
            
            # Get suggestions from project names
            project_suggestions = await self._get_project_suggestions(partial_query, user_id)
            suggestions.extend(project_suggestions)
            
            # Get suggestions from code patterns
            code_suggestions = await self._get_code_suggestions(partial_query, user_id)
            suggestions.extend(code_suggestions)
            
            # Remove duplicates and limit results
            unique_suggestions = list({s['text']: s for s in suggestions}.values())[:20]
            
            return {
                'success': True,
                'partial_query': partial_query,
                'suggestions': unique_suggestions
            }
            
        except Exception as e:
            logger.error(f"Get search suggestions failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_search_history(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get user's search history"""
        try:
            history = await self.db.search_history.find(
                {'user_id': user_id}
            ).sort('timestamp', -1).limit(limit).to_list(None)
            
            return {
                'success': True,
                'history': history,
                'total_entries': len(history)
            }
            
        except Exception as e:
            logger.error(f"Get search history failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def get_search_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get search analytics and insights"""
        try:
            # Get search statistics
            total_searches = await self.db.search_history.count_documents({'user_id': user_id})
            
            # Get top queries
            top_queries_pipeline = [
                {'$match': {'user_id': user_id}},
                {'$group': {'_id': '$query', 'count': {'$sum': 1}, 'last_searched': {'$max': '$timestamp'}}},
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
            
            top_queries = await self.db.search_history.aggregate(top_queries_pipeline).to_list(None)
            
            # Get search patterns
            search_patterns = await self.db.search_history.aggregate([
                {'$match': {'user_id': user_id}},
                {'$group': {'_id': '$search_type', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]).to_list(None)
            
            # Get recent activity
            recent_activity = await self.db.search_history.find(
                {'user_id': user_id}
            ).sort('timestamp', -1).limit(20).to_list(None)
            
            return {
                'success': True,
                'analytics': {
                    'total_searches': total_searches,
                    'top_queries': top_queries,
                    'search_patterns': search_patterns,
                    'recent_activity': recent_activity
                }
            }
            
        except Exception as e:
            logger.error(f"Get search analytics failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _parse_search_query(self, query: str) -> Dict[str, Any]:
        """Parse search query into structured format"""
        parsed = {
            'original': query,
            'terms': [],
            'phrases': [],
            'filters': {},
            'operators': []
        }
        
        # Extract quoted phrases
        phrases = re.findall(r'"([^"]*)"', query)
        parsed['phrases'] = phrases
        
        # Remove phrases from query for term extraction
        query_without_phrases = re.sub(r'"[^"]*"', '', query)
        
        # Extract individual terms
        terms = re.findall(r'\b\w+\b', query_without_phrases.lower())
        parsed['terms'] = [term for term in terms if len(term) > 1]
        
        # Extract filters (file:, project:, type:, etc.)
        filters = re.findall(r'(\w+):(\w+)', query)
        parsed['filters'] = dict(filters)
        
        # Extract operators (AND, OR, NOT)
        operators = re.findall(r'\b(AND|OR|NOT)\b', query.upper())
        parsed['operators'] = operators
        
        return parsed

    def _apply_filters(self, filters: Dict, user_id: str) -> Dict[str, Any]:
        """Apply search filters"""
        applied_filters = {'user_id': user_id}
        
        if filters.get('project_id'):
            applied_filters['project_id'] = filters['project_id']
        
        if filters.get('file_type'):
            applied_filters['type'] = filters['file_type']
        
        if filters.get('language'):
            applied_filters['language'] = filters['language']
        
        if filters.get('date_from'):
            applied_filters['created_at'] = {'$gte': filters['date_from']}
        
        if filters.get('date_to'):
            if 'created_at' not in applied_filters:
                applied_filters['created_at'] = {}
            applied_filters['created_at']['$lte'] = filters['date_to']
        
        return applied_filters

    async def _search_code(self, parsed_query: Dict, filters: Dict) -> List[Dict]:
        """Search in code files"""
        results = []
        
        # Search in files
        search_terms = parsed_query['terms'] + parsed_query['phrases']
        
        for term in search_terms:
            files_cursor = self.db.files.find({
                **filters,
                'type': 'code',
                '$text': {'$search': term}
            }).limit(50)
            
            async for file_doc in files_cursor:
                results.append({
                    'type': 'code',
                    'id': file_doc['file_id'],
                    'title': file_doc['name'],
                    'content': file_doc.get('content', ''),
                    'file_path': file_doc['name'],
                    'language': file_doc.get('language', 'unknown'),
                    'project_id': file_doc.get('project_id'),
                    'score': 0.8,
                    'matches': []
                })
        
        return results

    async def _search_projects(self, parsed_query: Dict, filters: Dict) -> List[Dict]:
        """Search in projects"""
        results = []
        
        search_terms = parsed_query['terms'] + parsed_query['phrases']
        
        for term in search_terms:
            projects_cursor = self.db.projects.find({
                **filters,
                '$or': [
                    {'name': {'$regex': term, '$options': 'i'}},
                    {'description': {'$regex': term, '$options': 'i'}},
                    {'tags': {'$regex': term, '$options': 'i'}}
                ]
            }).limit(20)
            
            async for project in projects_cursor:
                results.append({
                    'type': 'project',
                    'id': project['project_id'],
                    'title': project['name'],
                    'description': project.get('description', ''),
                    'score': 0.7,
                    'matches': []
                })
        
        return results

    async def _search_files(self, parsed_query: Dict, filters: Dict) -> List[Dict]:
        """Search in files"""
        results = []
        
        search_terms = parsed_query['terms'] + parsed_query['phrases']
        
        for term in search_terms:
            files_cursor = self.db.files.find({
                **filters,
                'name': {'$regex': term, '$options': 'i'}
            }).limit(50)
            
            async for file_doc in files_cursor:
                results.append({
                    'type': 'file',
                    'id': file_doc['file_id'],
                    'title': file_doc['name'],
                    'file_path': file_doc['name'],
                    'size': file_doc.get('size', 0),
                    'type_ext': file_doc.get('type', 'unknown'),
                    'project_id': file_doc.get('project_id'),
                    'score': 0.6,
                    'matches': []
                })
        
        return results

    async def _search_documentation(self, parsed_query: Dict, filters: Dict) -> List[Dict]:
        """Search in documentation"""
        results = []
        
        # Search in documentation files
        search_terms = parsed_query['terms'] + parsed_query['phrases']
        
        for term in search_terms:
            docs_cursor = self.db.files.find({
                **filters,
                'name': {'$regex': r'\.(md|txt|rst|doc)$', '$options': 'i'},
                '$text': {'$search': term}
            }).limit(30)
            
            async for doc in docs_cursor:
                results.append({
                    'type': 'documentation',
                    'id': doc['file_id'],
                    'title': doc['name'],
                    'content': doc.get('content', ''),
                    'file_path': doc['name'],
                    'project_id': doc.get('project_id'),
                    'score': 0.5,
                    'matches': []
                })
        
        return results

    async def _search_comments(self, parsed_query: Dict, filters: Dict) -> List[Dict]:
        """Search in comments"""
        results = []
        
        search_terms = parsed_query['terms'] + parsed_query['phrases']
        
        for term in search_terms:
            comments_cursor = self.db.comments.find({
                **filters,
                'content': {'$regex': term, '$options': 'i'}
            }).limit(30)
            
            async for comment in comments_cursor:
                results.append({
                    'type': 'comment',
                    'id': comment['comment_id'],
                    'title': f"Comment in {comment.get('file_name', 'Unknown')}",
                    'content': comment['content'],
                    'file_path': comment.get('file_name', ''),
                    'project_id': comment.get('project_id'),
                    'score': 0.4,
                    'matches': []
                })
        
        return results

    def _combine_and_rank_results(self, results: Dict, parsed_query: Dict) -> List[Dict]:
        """Combine and rank all search results"""
        combined = []
        
        # Flatten results
        for result_type, result_list in results.items():
            combined.extend(result_list)
        
        # Calculate relevance scores
        for result in combined:
            result['relevance_score'] = self._calculate_relevance_score(result, parsed_query)
        
        # Sort by relevance score
        combined.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return combined[:self.search_config['max_results']]

    def _calculate_relevance_score(self, result: Dict, parsed_query: Dict) -> float:
        """Calculate relevance score for search result"""
        score = result.get('score', 0.5)
        
        # Boost score based on title matches
        title = result.get('title', '').lower()
        for term in parsed_query['terms']:
            if term in title:
                score += 0.3
        
        # Boost score for exact phrase matches
        for phrase in parsed_query['phrases']:
            if phrase.lower() in title:
                score += 0.5
        
        # Boost score based on result type
        type_boost = {
            'code': 0.2,
            'project': 0.15,
            'file': 0.1,
            'documentation': 0.05,
            'comment': 0.0
        }
        
        score += type_boost.get(result['type'], 0.0)
        
        return min(score, 1.0)

    async def _expand_query_semantically(self, query: str) -> str:
        """Expand query with semantic synonyms"""
        # For now, implement basic synonym expansion
        # This could be enhanced with AI-powered semantic analysis
        
        synonyms = {
            'function': ['method', 'procedure', 'routine'],
            'variable': ['var', 'field', 'attribute'],
            'class': ['object', 'type', 'struct'],
            'error': ['exception', 'bug', 'issue'],
            'database': ['db', 'storage', 'persistence']
        }
        
        expanded_terms = [query]
        words = query.lower().split()
        
        for word in words:
            if word in synonyms:
                expanded_terms.extend(synonyms[word])
        
        return ' '.join(expanded_terms)

    async def _rerank_semantic_results(self, results: List[Dict], original_query: str, context: str) -> List[Dict]:
        """Re-rank results based on semantic similarity"""
        # For now, implement basic contextual ranking
        # This could be enhanced with AI-powered semantic similarity
        
        if context:
            context_words = context.lower().split()
            
            for result in results:
                title = result.get('title', '').lower()
                content = result.get('content', '').lower()
                
                context_matches = sum(1 for word in context_words if word in title or word in content)
                result['relevance_score'] = result.get('relevance_score', 0.5) + (context_matches * 0.1)
        
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results

    def _parse_code_patterns(self, query: str, language: str) -> Dict[str, Any]:
        """Parse code-specific search patterns"""
        patterns = {
            'regex_patterns': [],
            'function_patterns': [],
            'class_patterns': [],
            'variable_patterns': [],
            'language': language
        }
        
        # Function patterns
        if 'function' in query.lower() or 'def' in query.lower():
            if language == 'python':
                patterns['function_patterns'].append(r'def\s+\w+\s*\(')
            elif language == 'javascript':
                patterns['function_patterns'].append(r'function\s+\w+\s*\(')
        
        # Class patterns
        if 'class' in query.lower():
            patterns['class_patterns'].append(r'class\s+\w+')
        
        # Variable patterns
        if 'var' in query.lower() or 'let' in query.lower() or 'const' in query.lower():
            patterns['variable_patterns'].append(r'(var|let|const)\s+\w+')
        
        # Add general regex patterns
        patterns['regex_patterns'] = [re.escape(term) for term in query.split()]
        
        return patterns

    async def _search_in_file_content(self, file_doc: Dict, code_patterns: Dict) -> List[Dict]:
        """Search for patterns in file content"""
        results = []
        
        # This would read the actual file content
        # For now, simulate with stored content
        content = file_doc.get('content', '')
        
        if not content:
            return results
        
        # Search for patterns
        for pattern in code_patterns['regex_patterns']:
            matches = list(re.finditer(pattern, content, re.IGNORECASE))
            
            for match in matches:
                # Get context around match
                lines = content.split('\n')
                line_num = content[:match.start()].count('\n')
                
                context_start = max(0, line_num - self.search_config['context_lines'])
                context_end = min(len(lines), line_num + self.search_config['context_lines'] + 1)
                
                context = '\n'.join(lines[context_start:context_end])
                
                results.append({
                    'type': 'file',
                    'id': file_doc['file_id'],
                    'title': file_doc['name'],
                    'file_path': file_doc['name'],
                    'line_number': line_num + 1,
                    'match_text': match.group(),
                    'context': context,
                    'language': file_doc.get('language', 'unknown'),
                    'project_id': file_doc.get('project_id'),
                    'score': 0.8
                })
        
        return results

    def _find_matches_in_text(self, text: str, patterns: Dict) -> List[Dict]:
        """Find pattern matches in text"""
        matches = []
        
        for pattern in patterns['regex_patterns']:
            regex_matches = list(re.finditer(pattern, text, re.IGNORECASE))
            
            for match in regex_matches:
                matches.append({
                    'pattern': pattern,
                    'match': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'line': text[:match.start()].count('\n') + 1
                })
        
        return matches

    def _rank_code_results(self, results: List[Dict], patterns: Dict) -> List[Dict]:
        """Rank code search results"""
        for result in results:
            score = 0.5
            
            # Boost score based on number of matches
            matches = result.get('matches', [])
            score += len(matches) * 0.1
            
            # Boost score for exact pattern matches
            for match in matches:
                if match['pattern'] in patterns['regex_patterns']:
                    score += 0.2
            
            # Boost score based on language match
            if result.get('language') == patterns.get('language'):
                score += 0.3
            
            result['relevance_score'] = min(score, 1.0)
        
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results

    async def _store_search_history(self, user_id: str, query: str, search_type: str, results_count: int):
        """Store search in history"""
        try:
            history_entry = {
                'user_id': user_id,
                'query': query,
                'search_type': search_type,
                'results_count': results_count,
                'timestamp': datetime.utcnow()
            }
            
            await self.db.search_history.insert_one(history_entry)
            
        except Exception as e:
            logger.error(f"Store search history failed: {e}")

    async def _get_history_suggestions(self, partial_query: str, user_id: str) -> List[Dict]:
        """Get suggestions from search history"""
        try:
            history_cursor = self.db.search_history.find({
                'user_id': user_id,
                'query': {'$regex': f'^{re.escape(partial_query)}', '$options': 'i'}
            }).sort('timestamp', -1).limit(5)
            
            suggestions = []
            async for entry in history_cursor:
                suggestions.append({
                    'text': entry['query'],
                    'type': 'history',
                    'subtitle': f"Searched {entry['results_count']} results"
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Get history suggestions failed: {e}")
            return []

    async def _get_file_suggestions(self, partial_query: str, user_id: str) -> List[Dict]:
        """Get suggestions from file names"""
        try:
            files_cursor = self.db.files.find({
                'user_id': user_id,
                'name': {'$regex': partial_query, '$options': 'i'}
            }).limit(5)
            
            suggestions = []
            async for file_doc in files_cursor:
                suggestions.append({
                    'text': file_doc['name'],
                    'type': 'file',
                    'subtitle': f"{file_doc.get('type', 'unknown')} file"
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Get file suggestions failed: {e}")
            return []

    async def _get_project_suggestions(self, partial_query: str, user_id: str) -> List[Dict]:
        """Get suggestions from project names"""
        try:
            projects_cursor = self.db.projects.find({
                'user_id': user_id,
                'name': {'$regex': partial_query, '$options': 'i'}
            }).limit(5)
            
            suggestions = []
            async for project in projects_cursor:
                suggestions.append({
                    'text': project['name'],
                    'type': 'project',
                    'subtitle': 'Project'
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Get project suggestions failed: {e}")
            return []

    async def _get_code_suggestions(self, partial_query: str, user_id: str) -> List[Dict]:
        """Get suggestions from code patterns"""
        try:
            # Common code patterns
            code_patterns = [
                'function', 'class', 'variable', 'method', 'import', 'export',
                'const', 'let', 'var', 'def', 'async', 'await', 'return',
                'if', 'else', 'for', 'while', 'try', 'catch', 'finally'
            ]
            
            suggestions = []
            for pattern in code_patterns:
                if pattern.startswith(partial_query.lower()):
                    suggestions.append({
                        'text': pattern,
                        'type': 'code_pattern',
                        'subtitle': 'Code pattern'
                    })
            
            return suggestions[:5]
            
        except Exception as e:
            logger.error(f"Get code suggestions failed: {e}")
            return []

    async def _read_file_content(self, file_path: str) -> str:
        """Read file content"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Read file content failed: {e}")
            return ""

    async def _update_file_content(self, file_id: str, content: str, user_id: str):
        """Update file content"""
        try:
            await self.db.files.update_one(
                {'file_id': file_id},
                {
                    '$set': {
                        'content': content,
                        'updated_at': datetime.utcnow(),
                        'updated_by': user_id
                    }
                }
            )
        except Exception as e:
            logger.error(f"Update file content failed: {e}")
            raise

# Global service instance
_enhanced_search_service = None

def init_enhanced_search_service(db_manager):
    """Initialize Enhanced Search Service"""
    global _enhanced_search_service
    _enhanced_search_service = EnhancedSearchService(db_manager)
    logger.info("🔍 Enhanced Search Service initialized!")

def get_enhanced_search_service() -> Optional[EnhancedSearchService]:
    """Get Enhanced Search Service instance"""
    return _enhanced_search_service