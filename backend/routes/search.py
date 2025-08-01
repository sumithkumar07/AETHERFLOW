from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from models.database import get_database
from services.search_service import SearchService, SearchResult
from models.user import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize search service
search_service = SearchService()

@router.get("/search", response_model=List[SearchResult])
async def global_search(
    query: str = Query(..., description="Search query"),
    search_type: str = Query("all", description="Type of search: all, projects, code, templates, integrations"),
    limit: int = Query(20, description="Maximum number of results"),
    offset: int = Query(0, description="Results offset for pagination"),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    AI-powered global search across projects, code, templates, and integrations
    """
    try:
        results = await search_service.search(
            query=query,
            search_type=search_type,
            user_id=current_user["id"],
            limit=limit,
            offset=offset,
            db=db
        )
        
        logger.info(f"Search completed: {len(results)} results for query '{query}'")
        return results
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail="Search operation failed")

@router.get("/search/suggestions")
async def get_search_suggestions(
    query: str = Query(..., description="Partial search query"),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get intelligent search suggestions based on partial query
    """
    try:
        suggestions = await search_service.get_suggestions(
            query=query,
            user_id=current_user["id"],
            db=db
        )
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error(f"Failed to get suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get search suggestions")

@router.get("/search/recent")
async def get_recent_searches(
    limit: int = Query(10, description="Number of recent searches to return"),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get user's recent search queries
    """
    try:
        recent_searches = await search_service.get_recent_searches(
            user_id=current_user["id"],
            limit=limit,
            db=db
        )
        
        return {"recent_searches": recent_searches}
        
    except Exception as e:
        logger.error(f"Failed to get recent searches: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recent searches")

@router.post("/search/analytics")
async def track_search_analytics(
    search_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Track search analytics for improving search quality
    """
    try:
        await search_service.track_search(
            user_id=current_user["id"],
            query=search_data.get("query"),
            search_type=search_data.get("type"),
            results_count=search_data.get("results_count"),
            selected_result=search_data.get("selected_result"),
            db=db
        )
        
        return {"status": "success", "message": "Search analytics tracked"}
        
    except Exception as e:
        logger.error(f"Failed to track search analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to track search analytics")

@router.get("/search/trending")
async def get_trending_searches(
    limit: int = Query(10, description="Number of trending searches to return"),
    timeframe: str = Query("7d", description="Timeframe: 1d, 7d, 30d"),
    db = Depends(get_database)
):
    """
    Get trending search queries across all users
    """
    try:
        trending = await search_service.get_trending_searches(
            limit=limit,
            timeframe=timeframe,
            db=db
        )
        
        return {"trending_searches": trending}
        
    except Exception as e:
        logger.error(f"Failed to get trending searches: {e}")
        raise HTTPException(status_code=500, detail="Failed to get trending searches")