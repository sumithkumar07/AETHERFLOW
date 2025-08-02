from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

router = APIRouter()

# Global service instance (will be set by main.py)
community_intelligence_service = None

def set_community_intelligence_service(service):
    global community_intelligence_service
    community_intelligence_service = service

# Pydantic models
class DeveloperSearchRequest(BaseModel):
    technologies: Optional[List[str]] = None
    problem_domains: Optional[List[str]] = None
    experience_level: Optional[str] = None
    collaboration_type: Optional[str] = "project"
    min_match_score: Optional[float] = 0.6
    privacy: Optional[str] = "public"

class ProblemPatternRequest(BaseModel):
    category: str
    problem_type: str
    description: str
    solution_approach: Optional[str] = None
    technologies: List[str] = []
    difficulty: Optional[str] = "intermediate"
    privacy_level: Optional[str] = "public"

class NetworkCreationRequest(BaseModel):
    name: str
    description: str
    focus_areas: List[str]
    privacy: Optional[str] = "public"
    goals: Optional[List[str]] = []
    enable_project_management: Optional[bool] = True

class KnowledgeContributionRequest(BaseModel):
    type: str  # "solution", "tutorial", "best_practice", "code_snippet"
    title: str
    content: str
    tags: List[str]
    technologies: List[str]
    difficulty: Optional[str] = "intermediate"

class MentorshipRequest(BaseModel):
    role_preference: str  # "mentor", "mentee", "both"
    skill_areas: Optional[List[str]] = None
    time_commitment: Optional[str] = "2_hours_per_week"
    experience_level: Optional[str] = None

@router.post("/find-developers")
async def find_similar_developers(request: DeveloperSearchRequest, user_id: str = "demo_user"):
    """Find developers with similar technologies or complementary skills"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    search_criteria = {
        "technologies": request.technologies or [],
        "problem_domains": request.problem_domains or [],
        "experience_level": request.experience_level,
        "collaboration_type": request.collaboration_type,
        "min_match_score": request.min_match_score,
        "privacy": request.privacy
    }
    
    result = await community_intelligence_service.find_similar_developers(user_id, search_criteria)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/share-problem-pattern")
async def share_problem_pattern(request: ProblemPatternRequest, user_id: str = "demo_user"):
    """Share a problem pattern with the community"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    problem_data = {
        "category": request.category,
        "problem_type": request.problem_type,
        "description": request.description,
        "solution_approach": request.solution_approach,
        "technologies": request.technologies,
        "difficulty": request.difficulty
    }
    
    result = await community_intelligence_service.share_problem_pattern(
        user_id, problem_data, request.privacy_level
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/discover-patterns")
async def discover_code_patterns(
    user_id: str = "demo_user",
    technologies: Optional[str] = None
):
    """Discover reusable code patterns from the community"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    technology_focus = technologies.split(",") if technologies else None
    
    result = await community_intelligence_service.discover_code_patterns(user_id, technology_focus)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/create-network")
async def create_collaboration_network(request: NetworkCreationRequest, user_id: str = "demo_user"):
    """Create a collaboration network for projects or interests"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    network_config = {
        "name": request.name,
        "description": request.description,
        "focus_areas": request.focus_areas,
        "privacy": request.privacy,
        "goals": request.goals,
        "enable_project_management": request.enable_project_management
    }
    
    result = await community_intelligence_service.create_collaboration_network(user_id, network_config)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/insights")
async def get_community_insights(user_id: str = "demo_user", insight_type: str = "general"):
    """Get community insights and trends"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    result = await community_intelligence_service.get_community_insights(user_id, insight_type)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/mentorship")
async def get_mentorship_opportunities(request: MentorshipRequest, user_id: str = "demo_user"):
    """Get mentorship opportunities as mentor or mentee"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    result = await community_intelligence_service.suggest_mentorship_opportunities(
        user_id, request.role_preference
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/contribute")
async def contribute_knowledge(request: KnowledgeContributionRequest, user_id: str = "demo_user"):
    """Contribute knowledge, solutions, or insights to community"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    contribution = {
        "type": request.type,
        "title": request.title,
        "content": request.content,
        "tags": request.tags,
        "technologies": request.technologies,
        "difficulty": request.difficulty
    }
    
    result = await community_intelligence_service.contribute_to_knowledge_base(user_id, contribution)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/my-profile")
async def get_developer_profile(user_id: str = "demo_user"):
    """Get current user's developer profile and community standing"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    try:
        profile = await community_intelligence_service._get_developer_profile(user_id)
        
        # Add community-specific metrics
        community_metrics = {
            "contribution_count": len([k for k in community_intelligence_service.knowledge_base.keys() if user_id in str(k)]),
            "collaboration_count": len([n for n in community_intelligence_service.collaboration_networks.values() if user_id in n.get("members", [])]),
            "pattern_shares": len([p for p in community_intelligence_service.problem_patterns.values() if p.get("contributor_id") == user_id]),
            "community_rating": profile.get("contribution_score", 75) / 100,
            "expertise_areas": profile.get("skills", []),
            "recent_activity": "active"  # Simplified
        }
        
        return {
            "profile": profile,
            "community_metrics": community_metrics,
            "recommendations": [
                "Consider mentoring junior developers",
                "Share your React expertise in tutorials",
                "Join the FastAPI community network"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/networks")
async def get_collaboration_networks(user_id: str = "demo_user"):
    """Get collaboration networks user is part of"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    user_networks = []
    for network_id, network in community_intelligence_service.collaboration_networks.items():
        if user_id in network.get("members", []):
            user_networks.append({
                "network_id": network_id,
                "name": network.get("name"),
                "description": network.get("description"),
                "member_count": len(network.get("members", [])),
                "focus_areas": network.get("focus_areas", []),
                "created_at": network.get("created_at"),
                "recent_activity": "2 days ago"  # Simplified
            })
    
    return {
        "user_networks": user_networks,
        "network_invitations": [],  # Would implement invitation system
        "recommended_networks": [
            {
                "network_id": "rec_001",
                "name": "React Developers United",
                "description": "Community for React developers sharing best practices",
                "member_count": 247,
                "match_score": 0.85
            }
        ]
    }

@router.get("/trending")
async def get_trending_content():
    """Get trending discussions, patterns, and solutions"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    return {
        "trending_patterns": [
            {
                "pattern_id": "pattern_001",
                "title": "JWT Authentication with Refresh Tokens",
                "weekly_views": 1247,
                "growth_rate": 0.34,
                "category": "authentication"
            },
            {
                "pattern_id": "pattern_002",
                "title": "React Context for State Management",
                "weekly_views": 892,
                "growth_rate": 0.28,
                "category": "frontend"
            }
        ],
        "trending_technologies": [
            {"name": "Next.js 13", "mention_growth": 0.45, "adoption_score": 0.78},
            {"name": "Tailwind CSS", "mention_growth": 0.38, "adoption_score": 0.82},
            {"name": "TypeScript", "mention_growth": 0.22, "adoption_score": 0.91}
        ],
        "hot_discussions": [
            {
                "topic": "Best practices for microservices communication",
                "participants": 23,
                "messages": 156,
                "last_activity": "2 hours ago"
            },
            {
                "topic": "React 18 concurrent features",
                "participants": 31,
                "messages": 203,
                "last_activity": "1 hour ago"
            }
        ],
        "featured_contributors": [
            {
                "contributor": "Alex Chen",
                "contributions_this_week": 5,
                "expertise": ["system_design", "backend_architecture"],
                "reputation_score": 4.8
            }
        ]
    }

@router.get("/search")
async def search_community_content(
    query: str,
    content_type: Optional[str] = None,
    technologies: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """Search community knowledge base and patterns"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    # Simplified search implementation
    results = []
    
    # Search in problem patterns
    for pattern_id, pattern in community_intelligence_service.problem_patterns.items():
        if isinstance(pattern, dict):
            title = str(pattern.get("title", "")).lower()
            description = str(pattern.get("description", "")).lower()
            
            if query.lower() in title or query.lower() in description:
                results.append({
                    "type": "pattern",
                    "id": pattern_id,
                    "title": pattern.get("title", "Unknown"),
                    "description": pattern.get("description", ""),
                    "relevance_score": 0.8,
                    "category": pattern.get("category", "general")
                })
    
    # Search in knowledge base
    for kb_id, content in community_intelligence_service.knowledge_base.items():
        if isinstance(content, dict):
            title = str(content.get("title", "")).lower()
            content_text = str(content.get("content", "")).lower()
            
            if query.lower() in title or query.lower() in content_text:
                results.append({
                    "type": "knowledge",
                    "id": kb_id,
                    "title": content.get("title", "Unknown"),
                    "content_preview": content.get("content", "")[:200] + "...",
                    "relevance_score": 0.7,
                    "tags": content.get("tags", [])
                })
    
    # Sort by relevance score
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return {
        "query": query,
        "total_results": len(results),
        "results": results[:20],  # Return top 20 results
        "search_suggestions": [
            "Try more specific keywords",
            "Include technology names",
            "Search by category"
        ] if len(results) < 5 else []
    }

@router.get("/statistics")
async def get_community_statistics():
    """Get overall community statistics and health metrics"""
    if not community_intelligence_service:
        raise HTTPException(status_code=503, detail="Community Intelligence service not available")
    
    return {
        "community_overview": {
            "total_developers": 15647,
            "active_this_month": 3421,
            "new_joiners_this_week": 89,
            "collaboration_networks": len(community_intelligence_service.collaboration_networks),
            "shared_patterns": len(community_intelligence_service.problem_patterns),
            "knowledge_base_items": len(community_intelligence_service.knowledge_base)
        },
        "engagement_metrics": {
            "daily_active_users": 1247,
            "patterns_shared_this_week": 23,
            "collaborations_started": 15,
            "mentorship_connections": 31,
            "knowledge_contributions": 67
        },
        "technology_distribution": {
            "javascript": 0.34,
            "python": 0.28,
            "typescript": 0.22,
            "react": 0.31,
            "nodejs": 0.25
        },
        "geographic_distribution": {
            "north_america": 0.42,
            "europe": 0.31,
            "asia": 0.18,
            "other": 0.09
        },
        "experience_levels": {
            "junior": 0.35,
            "mid_level": 0.42,
            "senior": 0.18,
            "expert": 0.05
        }
    }