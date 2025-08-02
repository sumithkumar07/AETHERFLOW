"""
SEO API Routes
Handles SEO meta tags, structured data, and search optimization.
"""

from fastapi import APIRouter, HTTPException, Response, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from fastapi.responses import PlainTextResponse

from services.seo_service import get_seo_service

router = APIRouter()

class SEOAnalysisRequest(BaseModel):
    content: str = Field(..., description="Content to analyze")
    target_keywords: List[str] = Field(..., description="Target keywords for SEO")

class DynamicSEORequest(BaseModel):
    page_path: str = Field(..., description="Page path")
    title: Optional[str] = Field(None, description="Dynamic title")
    description: Optional[str] = Field(None, description="Dynamic description")
    image: Optional[str] = Field(None, description="Dynamic image URL")
    keywords: Optional[List[str]] = Field(None, description="Dynamic keywords")

@router.get("/meta-tags/{page_path:path}")
async def get_meta_tags(page_path: str, dynamic_data: Optional[Dict[str, Any]] = None):
    """Get HTML meta tags for a specific page."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        # Ensure page path starts with /
        if not page_path.startswith('/'):
            page_path = f'/{page_path}'
        
        meta_tags = await service.generate_meta_tags(page_path, dynamic_data)
        
        return {
            "page_path": page_path,
            "meta_tags": meta_tags
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate meta tags: {str(e)}")

@router.post("/meta-tags")
async def get_dynamic_meta_tags(request: DynamicSEORequest):
    """Get HTML meta tags with dynamic data."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        dynamic_data = {}
        if request.title:
            dynamic_data['title'] = request.title
        if request.description:
            dynamic_data['description'] = request.description
        if request.image:
            dynamic_data['image'] = request.image
        if request.keywords:
            dynamic_data['keywords'] = request.keywords
        
        meta_tags = await service.generate_meta_tags(request.page_path, dynamic_data)
        
        return {
            "page_path": request.page_path,
            "meta_tags": meta_tags,
            "dynamic_data": dynamic_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dynamic meta tags: {str(e)}")

@router.get("/sitemap.xml")
async def get_sitemap():
    """Get XML sitemap for the website."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        sitemap_xml = await service.generate_sitemap_xml()
        
        return Response(
            content=sitemap_xml,
            media_type="application/xml",
            headers={"Content-Disposition": "inline; filename=sitemap.xml"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate sitemap: {str(e)}")

@router.get("/robots.txt")
async def get_robots_txt():
    """Get robots.txt file."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        robots_txt = await service.generate_robots_txt()
        
        return PlainTextResponse(
            content=robots_txt,
            headers={"Content-Type": "text/plain"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate robots.txt: {str(e)}")

@router.post("/analyze-content")
async def analyze_content_seo(request: SEOAnalysisRequest):
    """Analyze content for SEO optimization."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        analysis = await service.optimize_content_seo(
            content=request.content,
            target_keywords=request.target_keywords
        )
        
        return {
            "content_length": len(request.content),
            "analysis": analysis,
            "optimization_score": min(100, max(0, 100 - len(analysis['recommendations']) * 10))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze content: {str(e)}")

@router.get("/structured-data/{page_type}")
async def get_structured_data(page_type: str, data: Optional[Dict[str, Any]] = None):
    """Get structured data markup for a page type."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        if not data:
            data = {}
        
        schema_markup = await service.generate_schema_markup(page_type, data)
        
        return {
            "page_type": page_type,
            "schema_markup": schema_markup
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate structured data: {str(e)}")

@router.get("/page-seo/{page_path:path}")
async def get_page_seo_data(page_path: str):
    """Get complete SEO data for a page."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        if not page_path.startswith('/'):
            page_path = f'/{page_path}'
        
        seo_data = await service.get_page_seo(page_path)
        
        return {
            "page_path": page_path,
            "seo_data": {
                "title": seo_data.title,
                "description": seo_data.description,
                "keywords": seo_data.keywords,
                "canonical_url": seo_data.canonical_url,
                "og_title": seo_data.og_title,
                "og_description": seo_data.og_description,
                "og_image": seo_data.og_image,
                "og_type": seo_data.og_type,
                "twitter_card": seo_data.twitter_card,
                "twitter_title": seo_data.twitter_title,
                "twitter_description": seo_data.twitter_description,
                "twitter_image": seo_data.twitter_image,
                "structured_data": seo_data.structured_data,
                "robots": seo_data.robots,
                "lang": seo_data.lang
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get page SEO data: {str(e)}")

@router.get("/seo-health-check")
async def seo_health_check():
    """Perform SEO health check across the platform."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        # Check key pages
        key_pages = ["/", "/templates", "/chat", "/integrations"]
        health_report = {
            "overall_score": 0,
            "pages_checked": len(key_pages),
            "page_reports": {},
            "issues": [],
            "recommendations": []
        }
        
        total_score = 0
        
        for page in key_pages:
            seo_data = await service.get_page_seo(page)
            page_score = 100
            page_issues = []
            
            # Check title length
            if len(seo_data.title) < 30:
                page_issues.append("Title too short (< 30 characters)")
                page_score -= 15
            elif len(seo_data.title) > 60:
                page_issues.append("Title too long (> 60 characters)")
                page_score -= 10
            
            # Check description length
            if len(seo_data.description) < 120:
                page_issues.append("Meta description too short (< 120 characters)")
                page_score -= 15
            elif len(seo_data.description) > 160:
                page_issues.append("Meta description too long (> 160 characters)")
                page_score -= 10
            
            # Check keywords
            if len(seo_data.keywords) < 3:
                page_issues.append("Too few keywords (< 3)")
                page_score -= 10
            elif len(seo_data.keywords) > 10:
                page_issues.append("Too many keywords (> 10)")
                page_score -= 5
            
            health_report["page_reports"][page] = {
                "score": max(0, page_score),
                "issues": page_issues
            }
            
            total_score += max(0, page_score)
        
        health_report["overall_score"] = round(total_score / len(key_pages), 1)
        
        # Generate general recommendations
        if health_report["overall_score"] < 80:
            health_report["recommendations"].append("Optimize meta titles and descriptions")
        if health_report["overall_score"] < 70:
            health_report["recommendations"].append("Review keyword strategy")
        if health_report["overall_score"] < 60:
            health_report["recommendations"].append("Implement comprehensive SEO audit")
        
        return health_report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform SEO health check: {str(e)}")

@router.get("/keywords/suggestions")
async def get_keyword_suggestions(
    topic: str = Query(..., description="Topic or main keyword"),
    count: int = Query(10, description="Number of suggestions")
):
    """Get keyword suggestions for SEO optimization."""
    
    # In a real implementation, this would use keyword research APIs
    keyword_suggestions = [
        f"{topic} tutorial",
        f"how to use {topic}",
        f"{topic} guide",
        f"best {topic}",
        f"{topic} examples",
        f"{topic} tips",
        f"learn {topic}",
        f"{topic} for beginners",
        f"advanced {topic}",
        f"{topic} tools"
    ]
    
    return {
        "topic": topic,
        "suggestions": keyword_suggestions[:count],
        "search_volume": {
            keyword: f"{1000 + hash(keyword) % 9000}" for keyword in keyword_suggestions[:count]
        },
        "difficulty": {
            keyword: f"{20 + hash(keyword) % 60}" for keyword in keyword_suggestions[:count]
        }
    }

@router.post("/bulk-optimize-pages")
async def bulk_optimize_pages():
    """Bulk optimize SEO for all main pages (admin endpoint)."""
    
    service = get_seo_service()
    if not service:
        raise HTTPException(status_code=503, detail="SEO service not available")
    
    try:
        # Re-generate SEO data for all pages
        await service._generate_page_seo_data()
        await service._generate_sitemap()
        
        # Generate optimized meta tags for all pages
        optimized_pages = []
        
        for page_path in service.page_seo_data.keys():
            meta_tags = await service.generate_meta_tags(page_path)
            optimized_pages.append({
                "page": page_path,
                "optimized": True,
                "meta_tags_length": len(meta_tags)
            })
        
        return {
            "optimized_pages": optimized_pages,
            "total_count": len(optimized_pages),
            "sitemap_entries": len(service.sitemap_entries),
            "message": "All pages optimized successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bulk optimize pages: {str(e)}")