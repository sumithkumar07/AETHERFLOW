"""
Agent Marketplace API Routes
Handles custom AI agent creation, sharing, and marketplace functionality.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

from services.agent_marketplace_service import (
    get_agent_marketplace_service, 
    AgentCategory, 
    AgentStatus,
    AgentCapability
)

router = APIRouter()

class CreateAgentRequest(BaseModel):
    name: str = Field(..., description="Agent name")
    description: str = Field(..., description="Agent description")
    category: AgentCategory = Field(..., description="Agent category")
    system_prompt: str = Field(..., description="System prompt for the agent")
    user_prompt_template: str = Field(..., description="User prompt template with variables")
    capabilities: List[Dict[str, str]] = Field(..., description="Agent capabilities")
    tags: List[str] = Field(..., description="Tags for searchability")
    price: float = Field(default=0.0, description="Price for premium agents")

class AgentResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    status: str
    creator_id: str
    creator_name: str
    capabilities: List[Dict[str, str]]
    tags: List[str]
    version: str
    rating: float
    usage_count: int
    price: float
    created_at: datetime
    updated_at: datetime
    is_verified: bool
    icon_url: Optional[str] = None
    demo_url: Optional[str] = None

class AddReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: str = Field(..., description="Review comment")

class ReviewResponse(BaseModel):
    id: str
    agent_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime

@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    request: CreateAgentRequest,
    creator_id: str = Query(..., description="Creator user ID"),
    creator_name: str = Query(..., description="Creator name")
):
    """Create a new custom agent."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    try:
        agent = await service.create_agent(
            name=request.name,
            description=request.description,
            category=request.category,
            creator_id=creator_id,
            creator_name=creator_name,
            system_prompt=request.system_prompt,
            user_prompt_template=request.user_prompt_template,
            capabilities=request.capabilities,
            tags=request.tags,
            price=request.price
        )
        
        return AgentResponse(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            category=agent.category.value,
            status=agent.status.value,
            creator_id=agent.creator_id,
            creator_name=agent.creator_name,
            capabilities=[
                {"name": cap.name, "description": cap.description, "input_type": cap.input_type, "output_type": cap.output_type}
                for cap in agent.capabilities
            ],
            tags=agent.tags,
            version=agent.version,
            rating=agent.rating,
            usage_count=agent.usage_count,
            price=agent.price,
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            is_verified=agent.is_verified,
            icon_url=agent.icon_url,
            demo_url=agent.demo_url
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

@router.get("/agents", response_model=List[AgentResponse])
async def list_agents(
    category: Optional[AgentCategory] = Query(None, description="Filter by category"),
    status: Optional[AgentStatus] = Query(None, description="Filter by status"),
    creator_id: Optional[str] = Query(None, description="Filter by creator"),
    search: Optional[str] = Query(None, description="Search query"),
    sort_by: str = Query("rating", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order"),
    limit: int = Query(20, description="Number of results"),
    offset: int = Query(0, description="Offset for pagination")
):
    """List agents with filtering and sorting."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    try:
        agents = await service.list_agents(
            category=category,
            status=status,
            creator_id=creator_id,
            search_query=search,
            sort_by=sort_by,
            sort_order=sort_order,
            limit=limit,
            offset=offset
        )
        
        return [
            AgentResponse(
                id=agent.id,
                name=agent.name,
                description=agent.description,
                category=agent.category.value,
                status=agent.status.value,
                creator_id=agent.creator_id,
                creator_name=agent.creator_name,
                capabilities=[
                    {"name": cap.name, "description": cap.description, "input_type": cap.input_type, "output_type": cap.output_type}
                    for cap in agent.capabilities
                ],
                tags=agent.tags,
                version=agent.version,
                rating=agent.rating,
                usage_count=agent.usage_count,
                price=agent.price,
                created_at=agent.created_at,
                updated_at=agent.updated_at,
                is_verified=agent.is_verified,
                icon_url=agent.icon_url,
                demo_url=agent.demo_url
            )
            for agent in agents
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {str(e)}")

@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get a specific agent by ID."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return AgentResponse(
        id=agent.id,
        name=agent.name,
        description=agent.description,
        category=agent.category.value,
        status=agent.status.value,
        creator_id=agent.creator_id,
        creator_name=agent.creator_name,
        capabilities=[
            {"name": cap.name, "description": cap.description, "input_type": cap.input_type, "output_type": cap.output_type}
            for cap in agent.capabilities
        ],
        tags=agent.tags,
        version=agent.version,
        rating=agent.rating,
        usage_count=agent.usage_count,
        price=agent.price,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        is_verified=agent.is_verified,
        icon_url=agent.icon_url,
        demo_url=agent.demo_url
    )

@router.post("/agents/{agent_id}/publish")
async def publish_agent(
    agent_id: str,
    creator_id: str = Query(..., description="Creator user ID")
):
    """Publish an agent to the marketplace."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    success = await service.publish_agent(agent_id, creator_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to publish agent")
    
    return {"message": "Agent published successfully", "agent_id": agent_id}

@router.post("/agents/{agent_id}/feature")
async def feature_agent(agent_id: str):
    """Feature an agent (admin function)."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    success = await service.feature_agent(agent_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to feature agent")
    
    return {"message": "Agent featured successfully", "agent_id": agent_id}

@router.post("/agents/{agent_id}/use")
async def use_agent(
    agent_id: str,
    user_id: str = Query(..., description="User ID")
):
    """Record agent usage (for analytics)."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    success = await service.use_agent(agent_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {"message": "Agent usage recorded", "agent_id": agent_id}

@router.post("/agents/{agent_id}/reviews", response_model=ReviewResponse)
async def add_review(
    agent_id: str,
    request: AddReviewRequest,
    user_id: str = Query(..., description="User ID"),
    user_name: str = Query(..., description="User name")
):
    """Add a review for an agent."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    try:
        review = await service.add_review(
            agent_id=agent_id,
            user_id=user_id,
            user_name=user_name,
            rating=request.rating,
            comment=request.comment
        )
        
        return ReviewResponse(
            id=review.id,
            agent_id=review.agent_id,
            user_id=review.user_id,
            user_name=review.user_name,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add review: {str(e)}")

@router.get("/agents/{agent_id}/reviews", response_model=List[ReviewResponse])
async def get_agent_reviews(agent_id: str):
    """Get reviews for an agent."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    reviews = await service.get_agent_reviews(agent_id)
    
    return [
        ReviewResponse(
            id=review.id,
            agent_id=review.agent_id,
            user_id=review.user_id,
            user_name=review.user_name,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at
        )
        for review in reviews
    ]

@router.get("/featured", response_model=List[AgentResponse])
async def get_featured_agents(limit: int = Query(6, description="Number of featured agents")):
    """Get featured agents."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    agents = await service.get_featured_agents(limit)
    
    return [
        AgentResponse(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            category=agent.category.value,
            status=agent.status.value,
            creator_id=agent.creator_id,
            creator_name=agent.creator_name,
            capabilities=[
                {"name": cap.name, "description": cap.description, "input_type": cap.input_type, "output_type": cap.output_type}
                for cap in agent.capabilities
            ],
            tags=agent.tags,
            version=agent.version,
            rating=agent.rating,
            usage_count=agent.usage_count,
            price=agent.price,
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            is_verified=agent.is_verified,
            icon_url=agent.icon_url,
            demo_url=agent.demo_url
        )
        for agent in agents
    ]

@router.get("/search", response_model=List[AgentResponse])
async def search_agents(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, description="Number of results")
):
    """Advanced search for agents."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    agents = await service.search_agents(query, limit)
    
    return [
        AgentResponse(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            category=agent.category.value,
            status=agent.status.value,
            creator_id=agent.creator_id,
            creator_name=agent.creator_name,
            capabilities=[
                {"name": cap.name, "description": cap.description, "input_type": cap.input_type, "output_type": cap.output_type}
                for cap in agent.capabilities
            ],
            tags=agent.tags,
            version=agent.version,
            rating=agent.rating,
            usage_count=agent.usage_count,
            price=agent.price,
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            is_verified=agent.is_verified,
            icon_url=agent.icon_url,
            demo_url=agent.demo_url
        )
        for agent in agents
    ]

@router.get("/categories")
async def get_categories():
    """Get available agent categories."""
    
    return {
        "categories": [
            {
                "id": category.value,
                "name": category.value.replace("_", " ").title(),
                "description": f"Agents specialized in {category.value.replace('_', ' ')}"
            }
            for category in AgentCategory
        ]
    }

@router.get("/categories/stats")
async def get_categories_stats():
    """Get statistics by category."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    stats = await service.get_categories_stats()
    return stats

@router.get("/stats")
async def get_marketplace_stats():
    """Get overall marketplace statistics."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    stats = await service.get_marketplace_stats()
    return stats

@router.get("/creators/{creator_id}/agents", response_model=List[AgentResponse])
async def get_creator_agents(creator_id: str):
    """Get all agents by a specific creator."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    agents = await service.list_agents(creator_id=creator_id, limit=100)
    
    return [
        AgentResponse(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            category=agent.category.value,
            status=agent.status.value,
            creator_id=agent.creator_id,
            creator_name=agent.creator_name,
            capabilities=[
                {"name": cap.name, "description": cap.description, "input_type": cap.input_type, "output_type": cap.output_type}
                for cap in agent.capabilities
            ],
            tags=agent.tags,
            version=agent.version,
            rating=agent.rating,
            usage_count=agent.usage_count,
            price=agent.price,
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            is_verified=agent.is_verified,
            icon_url=agent.icon_url,
            demo_url=agent.demo_url
        )
        for agent in agents
    ]

@router.post("/bulk-create-demo-agents")
async def bulk_create_demo_agents():
    """Create additional demo agents (admin endpoint)."""
    
    service = get_agent_marketplace_service()
    if not service:
        raise HTTPException(status_code=503, detail="Agent marketplace service not available")
    
    # Additional demo agents for variety
    demo_agents = [
        {
            "name": "API Documentation Generator",
            "description": "Automatically generates comprehensive API documentation from code and specifications.",
            "category": AgentCategory.DEVELOPMENT,
            "system_prompt": "Generate comprehensive API documentation with examples, parameters, and best practices.",
            "user_prompt_template": "Generate documentation for this API: {api_code}",
            "capabilities": [
                {"name": "Code Analysis", "description": "Analyzes API code structure"},
                {"name": "Documentation Generation", "description": "Creates formatted documentation"},
                {"name": "Example Generation", "description": "Provides usage examples"}
            ],
            "tags": ["api", "documentation", "code", "examples"]
        },
        {
            "name": "Brand Identity Designer",
            "description": "Creates cohesive brand identities including colors, typography, and visual guidelines.",
            "category": AgentCategory.DESIGN,
            "system_prompt": "Design comprehensive brand identities with visual consistency and market appeal.",
            "user_prompt_template": "Create a brand identity for: {business_type} targeting {audience}",
            "capabilities": [
                {"name": "Color Palette", "description": "Designs harmonious color schemes"},
                {"name": "Typography", "description": "Selects appropriate fonts and hierarchy"},
                {"name": "Visual Guidelines", "description": "Creates comprehensive brand guidelines"}
            ],
            "tags": ["branding", "identity", "design", "colors", "typography"]
        }
    ]
    
    created_agents = []
    
    for agent_data in demo_agents:
        try:
            agent = await service.create_agent(
                name=agent_data["name"],
                description=agent_data["description"],
                category=agent_data["category"],
                creator_id="demo",
                creator_name="Demo Creator",
                system_prompt=agent_data["system_prompt"],
                user_prompt_template=agent_data["user_prompt_template"],
                capabilities=agent_data["capabilities"],
                tags=agent_data["tags"]
            )
            
            # Publish the agent
            await service.publish_agent(agent.id, "demo")
            created_agents.append(agent.id)
            
        except Exception as e:
            print(f"Failed to create demo agent {agent_data['name']}: {e}")
    
    return {
        "created_agents": created_agents,
        "total_count": len(created_agents),
        "message": f"Successfully created {len(created_agents)} demo agents"
    }