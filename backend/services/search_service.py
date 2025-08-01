from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import re
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from services.ai_service import AIService

logger = logging.getLogger(__name__)

class SearchResult(BaseModel):
    id: str
    type: str  # project, code, template, integration, function
    title: str
    description: str
    path: str
    category: str
    relevance: float
    last_modified: str
    tags: List[str]
    icon: Optional[str] = None
    metadata: Dict[str, Any] = {}

class SearchService:
    def __init__(self):
        self.ai_service = AIService()
        
    async def search(
        self,
        query: str,
        search_type: str = "all",
        user_id: str = None,
        limit: int = 20,
        offset: int = 0,
        db: AsyncIOMotorDatabase = None
    ) -> List[SearchResult]:
        """
        Perform AI-enhanced global search across all content types
        """
        try:
            # Clean and process query
            processed_query = self._process_query(query)
            
            # Get search results from different sources
            results = []
            
            if search_type in ["all", "projects"]:
                project_results = await self._search_projects(processed_query, user_id, db)
                results.extend(project_results)
            
            if search_type in ["all", "code"]:
                code_results = await self._search_code(processed_query, user_id, db)
                results.extend(code_results)
            
            if search_type in ["all", "templates"]:
                template_results = await self._search_templates(processed_query, db)
                results.extend(template_results)
            
            if search_type in ["all", "integrations"]:
                integration_results = await self._search_integrations(processed_query, db)
                results.extend(integration_results)
            
            if search_type in ["all", "functions"]:
                function_results = await self._search_functions(processed_query, user_id, db)
                results.extend(function_results)
            
            # AI-powered relevance scoring and ranking
            ranked_results = await self._rank_results(results, query)
            
            # Apply pagination
            paginated_results = ranked_results[offset:offset + limit]
            
            # Track search for analytics
            await self._track_search(query, search_type, len(results), user_id, db)
            
            return paginated_results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    async def _search_projects(self, query: str, user_id: str, db: AsyncIOMotorDatabase) -> List[SearchResult]:
        """Search user's projects"""
        try:
            projects_collection = db.projects
            
            # Build search pipeline
            pipeline = [
                {
                    "$match": {
                        "user_id": user_id,
                        "$or": [
                            {"name": {"$regex": query, "$options": "i"}},
                            {"description": {"$regex": query, "$options": "i"}},
                            {"tags": {"$in": [re.compile(query, re.IGNORECASE)]}},
                            {"tech_stack": {"$in": [re.compile(query, re.IGNORECASE)]}}
                        ]
                    }
                },
                {"$sort": {"updated_at": -1}},
                {"$limit": 50}
            ]
            
            cursor = projects_collection.aggregate(pipeline)
            projects = await cursor.to_list(length=None)
            
            results = []
            for project in projects:
                results.append(SearchResult(
                    id=str(project["_id"]),
                    type="project",
                    title=project["name"],
                    description=project.get("description", ""),
                    path=f"/projects/{project['_id']}",
                    category="Projects",
                    relevance=self._calculate_relevance(query, project["name"], project.get("description", "")),
                    last_modified=project["updated_at"].strftime("%Y-%m-%d"),
                    tags=project.get("tags", []),
                    icon="FolderIcon",
                    metadata={
                        "status": project.get("status"),
                        "tech_stack": project.get("tech_stack", [])
                    }
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"Project search failed: {e}")
            return []
    
    async def _search_code(self, query: str, user_id: str, db: AsyncIOMotorDatabase) -> List[SearchResult]:
        """Search code files and snippets"""
        try:
            code_collection = db.code_files
            
            pipeline = [
                {
                    "$match": {
                        "user_id": user_id,
                        "$or": [
                            {"filename": {"$regex": query, "$options": "i"}},
                            {"content": {"$regex": query, "$options": "i"}},
                            {"language": {"$regex": query, "$options": "i"}},
                            {"tags": {"$in": [re.compile(query, re.IGNORECASE)]}}
                        ]
                    }
                },
                {"$sort": {"updated_at": -1}},
                {"$limit": 30}
            ]
            
            cursor = code_collection.aggregate(pipeline)
            code_files = await cursor.to_list(length=None)
            
            results = []
            for file in code_files:
                results.append(SearchResult(
                    id=str(file["_id"]),
                    type="code",
                    title=file["filename"],
                    description=f"{file.get('language', 'Code')} file - {file.get('description', '')}",
                    path=f"/editor/{file['project_id']}/{file['filename']}",
                    category="Code Files",
                    relevance=self._calculate_relevance(query, file["filename"], file.get("content", "")),
                    last_modified=file["updated_at"].strftime("%Y-%m-%d"),
                    tags=file.get("tags", []),
                    icon="CodeBracketIcon",
                    metadata={
                        "language": file.get("language"),
                        "size": len(file.get("content", "")),
                        "project_id": str(file["project_id"])
                    }
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"Code search failed: {e}")
            return []
    
    async def _search_templates(self, query: str, db: AsyncIOMotorDatabase) -> List[SearchResult]:
        """Search project templates"""
        try:
            templates_collection = db.templates
            
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"name": {"$regex": query, "$options": "i"}},
                            {"description": {"$regex": query, "$options": "i"}},
                            {"category": {"$regex": query, "$options": "i"}},
                            {"tags": {"$in": [re.compile(query, re.IGNORECASE)]}}
                        ]
                    }
                },
                {"$sort": {"popularity": -1, "created_at": -1}},
                {"$limit": 20}
            ]
            
            cursor = templates_collection.aggregate(pipeline)
            templates = await cursor.to_list(length=None)
            
            results = []
            for template in templates:
                results.append(SearchResult(
                    id=str(template["_id"]),
                    type="template",
                    title=template["name"],
                    description=template.get("description", ""),
                    path=f"/templates/{template['_id']}",
                    category="Templates",
                    relevance=self._calculate_relevance(query, template["name"], template.get("description", "")),
                    last_modified=template["created_at"].strftime("%Y-%m-%d"),
                    tags=template.get("tags", []),
                    icon="DocumentTextIcon",
                    metadata={
                        "category": template.get("category"),
                        "difficulty": template.get("difficulty"),
                        "popularity": template.get("popularity", 0)
                    }
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"Template search failed: {e}")
            return []
    
    async def _search_integrations(self, query: str, db: AsyncIOMotorDatabase) -> List[SearchResult]:
        """Search available integrations"""
        try:
            integrations_collection = db.integrations
            
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"name": {"$regex": query, "$options": "i"}},
                            {"description": {"$regex": query, "$options": "i"}},
                            {"category": {"$regex": query, "$options": "i"}},
                            {"tags": {"$in": [re.compile(query, re.IGNORECASE)]}}
                        ]
                    }
                },
                {"$sort": {"popularity": -1}},
                {"$limit": 15}
            ]
            
            cursor = integrations_collection.aggregate(pipeline)
            integrations = await cursor.to_list(length=None)
            
            results = []
            for integration in integrations:
                results.append(SearchResult(
                    id=str(integration["_id"]),
                    type="integration",
                    title=integration["name"],
                    description=integration.get("description", ""),
                    path=f"/integrations/{integration['slug']}",
                    category="Integrations",
                    relevance=self._calculate_relevance(query, integration["name"], integration.get("description", "")),
                    last_modified=integration.get("updated_at", datetime.now()).strftime("%Y-%m-%d"),
                    tags=integration.get("tags", []),
                    icon="SparklesIcon",
                    metadata={
                        "category": integration.get("category"),
                        "popularity": integration.get("popularity", 0),
                        "status": integration.get("status", "available")
                    }
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"Integration search failed: {e}")
            return []
    
    async def _search_functions(self, query: str, user_id: str, db: AsyncIOMotorDatabase) -> List[SearchResult]:
        """Search for specific functions and methods in code"""
        try:
            # This would search through parsed function definitions
            # For now, returning mock results
            results = []
            
            if any(keyword in query.lower() for keyword in ['function', 'method', 'api', 'endpoint']):
                results.append(SearchResult(
                    id="func_1",
                    type="function",
                    title="generateApiKey()",
                    description="Utility function to generate secure API keys",
                    path="/projects/utils/apiKey.js:line 45",
                    category="Functions",
                    relevance=85.0,
                    last_modified="2024-03-20",
                    tags=["Security", "API", "Utilities"],
                    icon="CommandLineIcon",
                    metadata={
                        "language": "JavaScript",
                        "parameters": ["length", "options"],
                        "return_type": "string"
                    }
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"Function search failed: {e}")
            return []
    
    def _process_query(self, query: str) -> str:
        """Clean and process search query"""
        # Remove special characters, normalize whitespace
        processed = re.sub(r'[^\w\s-]', '', query.strip())
        return processed
    
    def _calculate_relevance(self, query: str, title: str, description: str) -> float:
        """Calculate relevance score for search results"""
        query_lower = query.lower()
        title_lower = title.lower()
        description_lower = description.lower()
        
        relevance = 0.0
        
        # Exact title match
        if query_lower == title_lower:
            relevance += 100.0
        # Title starts with query
        elif title_lower.startswith(query_lower):
            relevance += 80.0
        # Title contains query
        elif query_lower in title_lower:
            relevance += 60.0
        
        # Description contains query
        if query_lower in description_lower:
            relevance += 30.0
        
        # Word-based matching
        query_words = query_lower.split()
        title_words = title_lower.split()
        description_words = description_lower.split()
        
        for word in query_words:
            if word in title_words:
                relevance += 20.0
            if word in description_words:
                relevance += 10.0
        
        return min(relevance, 100.0)
    
    async def _rank_results(self, results: List[SearchResult], query: str) -> List[SearchResult]:
        """Use AI to rank search results by relevance"""
        try:
            # Sort by relevance score and recency
            results.sort(key=lambda x: (x.relevance, x.last_modified), reverse=True)
            return results
            
        except Exception as e:
            logger.error(f"Result ranking failed: {e}")
            return results
    
    async def get_suggestions(self, query: str, user_id: str, db: AsyncIOMotorDatabase) -> List[str]:
        """Get intelligent search suggestions"""
        try:
            suggestions = []
            
            # Add common search patterns
            common_searches = [
                "React components",
                "API endpoints", 
                "authentication",
                "database models",
                "UI components",
                "error handling",
                "performance optimization"
            ]
            
            # Filter suggestions based on query
            for suggestion in common_searches:
                if query.lower() in suggestion.lower() or suggestion.lower().startswith(query.lower()):
                    suggestions.append(suggestion)
            
            # Add user's recent searches
            recent = await self.get_recent_searches(user_id, 5, db)
            for search in recent:
                if query.lower() in search.lower() and search not in suggestions:
                    suggestions.append(search)
            
            return suggestions[:8]
            
        except Exception as e:
            logger.error(f"Failed to get suggestions: {e}")
            return []
    
    async def get_recent_searches(self, user_id: str, limit: int, db: AsyncIOMotorDatabase) -> List[str]:
        """Get user's recent search queries"""
        try:
            search_history = db.search_history
            
            cursor = search_history.find(
                {"user_id": user_id},
                {"query": 1}
            ).sort("timestamp", -1).limit(limit)
            
            searches = await cursor.to_list(length=None)
            return [search["query"] for search in searches]
            
        except Exception as e:
            logger.error(f"Failed to get recent searches: {e}")
            return []
    
    async def _track_search(self, query: str, search_type: str, results_count: int, user_id: str, db: AsyncIOMotorDatabase):
        """Track search for analytics and improvement"""
        try:
            if db is None:
                return
                
            search_history = db.search_history
            
            await search_history.insert_one({
                "user_id": user_id,
                "query": query,
                "search_type": search_type,
                "results_count": results_count,
                "timestamp": datetime.utcnow()
            })
            
        except Exception as e:
            logger.error(f"Failed to track search: {e}")
    
    async def track_search(self, user_id: str, query: str, search_type: str, results_count: int, selected_result: dict, db: AsyncIOMotorDatabase):
        """Track detailed search analytics"""
        try:
            search_analytics = db.search_analytics
            
            await search_analytics.insert_one({
                "user_id": user_id,
                "query": query,
                "search_type": search_type,
                "results_count": results_count,
                "selected_result": selected_result,
                "timestamp": datetime.utcnow()
            })
            
        except Exception as e:
            logger.error(f"Failed to track search analytics: {e}")
    
    async def get_trending_searches(self, limit: int, timeframe: str, db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
        """Get trending search queries"""
        try:
            # Calculate time threshold
            if timeframe == "1d":
                since = datetime.utcnow() - timedelta(days=1)
            elif timeframe == "7d":
                since = datetime.utcnow() - timedelta(days=7)
            else:  # 30d
                since = datetime.utcnow() - timedelta(days=30)
            
            search_history = db.search_history
            
            pipeline = [
                {"$match": {"timestamp": {"$gte": since}}},
                {"$group": {
                    "_id": "$query",
                    "count": {"$sum": 1},
                    "last_searched": {"$max": "$timestamp"}
                }},
                {"$sort": {"count": -1}},
                {"$limit": limit}
            ]
            
            cursor = search_history.aggregate(pipeline)
            trending = await cursor.to_list(length=None)
            
            return [
                {
                    "query": item["_id"],
                    "count": item["count"],
                    "last_searched": item["last_searched"].isoformat()
                }
                for item in trending
            ]
            
        except Exception as e:
            logger.error(f"Failed to get trending searches: {e}")
            return []