"""
Agent Marketplace Service
Handles custom AI agent creation, sharing, and marketplace functionality.
"""

import json
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

class AgentCategory(str, Enum):
    DEVELOPMENT = "development"
    DESIGN = "design"
    TESTING = "testing"
    MARKETING = "marketing"
    ANALYTICS = "analytics"
    CONTENT = "content"
    BUSINESS = "business"
    EDUCATION = "education"
    PRODUCTIVITY = "productivity"
    SPECIALIZED = "specialized"

class AgentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    FEATURED = "featured"
    DEPRECATED = "deprecated"
    PRIVATE = "private"

@dataclass
class AgentPrompt:
    system_prompt: str
    user_prompt_template: str
    variables: List[str]
    examples: List[Dict[str, str]]

@dataclass
class AgentCapability:
    name: str
    description: str
    input_type: str
    output_type: str

@dataclass
class CustomAgent:
    id: str
    name: str
    description: str
    category: AgentCategory
    status: AgentStatus
    creator_id: str
    creator_name: str
    prompt: AgentPrompt
    capabilities: List[AgentCapability]
    tags: List[str]
    version: str
    rating: float
    usage_count: int
    price: float  # 0 for free agents
    created_at: datetime
    updated_at: datetime
    is_verified: bool
    icon_url: Optional[str] = None
    demo_url: Optional[str] = None
    documentation: Optional[str] = None

@dataclass
class AgentReview:
    id: str
    agent_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime

class AgentMarketplaceService:
    """Service for managing the AI agent marketplace."""
    
    def __init__(self, db_wrapper=None):
        self.db_wrapper = db_wrapper
        self.agents = {}
        self.reviews = {}
        self.featured_agents = []
        self.is_initialized = False
        
        # Marketplace statistics
        self.stats = {
            "total_agents": 0,
            "total_creators": 0,
            "total_downloads": 0,
            "average_rating": 0.0
        }
    
    async def initialize(self):
        """Initialize the agent marketplace service."""
        try:
            await self._load_default_agents()
            await self._calculate_stats()
            self.is_initialized = True
            print("✅ Agent Marketplace Service initialized successfully")
        except Exception as e:
            print(f"⚠️ Agent Marketplace Service initialization warning: {e}")
    
    async def create_agent(
        self,
        name: str,
        description: str,
        category: AgentCategory,
        creator_id: str,
        creator_name: str,
        system_prompt: str,
        user_prompt_template: str,
        capabilities: List[Dict[str, str]],
        tags: List[str],
        price: float = 0.0
    ) -> CustomAgent:
        """Create a new custom agent."""
        
        agent_id = str(uuid.uuid4())
        
        # Parse capabilities
        parsed_capabilities = [
            AgentCapability(
                name=cap["name"],
                description=cap["description"],
                input_type=cap.get("input_type", "text"),
                output_type=cap.get("output_type", "text")
            )
            for cap in capabilities
        ]
        
        # Create agent prompt
        prompt = AgentPrompt(
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            variables=self._extract_template_variables(user_prompt_template),
            examples=[]
        )
        
        agent = CustomAgent(
            id=agent_id,
            name=name,
            description=description,
            category=category,
            status=AgentStatus.DRAFT,
            creator_id=creator_id,
            creator_name=creator_name,
            prompt=prompt,
            capabilities=parsed_capabilities,
            tags=tags,
            version="1.0.0",
            rating=0.0,
            usage_count=0,
            price=price,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=False
        )
        
        self.agents[agent_id] = agent
        await self._calculate_stats()
        
        return agent
    
    async def get_agent(self, agent_id: str) -> Optional[CustomAgent]:
        """Get a specific agent by ID."""
        return self.agents.get(agent_id)
    
    async def list_agents(
        self,
        category: Optional[AgentCategory] = None,
        status: Optional[AgentStatus] = None,
        creator_id: Optional[str] = None,
        search_query: Optional[str] = None,
        sort_by: str = "rating",
        sort_order: str = "desc",
        limit: int = 20,
        offset: int = 0
    ) -> List[CustomAgent]:
        """List agents with filtering and sorting."""
        
        agents = list(self.agents.values())
        
        # Apply filters
        if category:
            agents = [a for a in agents if a.category == category]
        
        if status:
            agents = [a for a in agents if a.status == status]
        else:
            # Default: only show published and featured agents
            agents = [a for a in agents if a.status in [AgentStatus.PUBLISHED, AgentStatus.FEATURED]]
        
        if creator_id:
            agents = [a for a in agents if a.creator_id == creator_id]
        
        if search_query:
            query = search_query.lower()
            agents = [
                a for a in agents 
                if query in a.name.lower() 
                or query in a.description.lower() 
                or any(query in tag.lower() for tag in a.tags)
            ]
        
        # Sort agents
        reverse = sort_order == "desc"
        
        if sort_by == "rating":
            agents.sort(key=lambda a: a.rating, reverse=reverse)
        elif sort_by == "usage":
            agents.sort(key=lambda a: a.usage_count, reverse=reverse)
        elif sort_by == "created":
            agents.sort(key=lambda a: a.created_at, reverse=reverse)
        elif sort_by == "updated":
            agents.sort(key=lambda a: a.updated_at, reverse=reverse)
        elif sort_by == "name":
            agents.sort(key=lambda a: a.name.lower(), reverse=reverse)
        
        # Apply pagination
        return agents[offset:offset + limit]
    
    async def publish_agent(self, agent_id: str, creator_id: str) -> bool:
        """Publish an agent to the marketplace."""
        
        agent = self.agents.get(agent_id)
        if not agent or agent.creator_id != creator_id:
            return False
        
        agent.status = AgentStatus.PUBLISHED
        agent.updated_at = datetime.utcnow()
        
        await self._calculate_stats()
        return True
    
    async def feature_agent(self, agent_id: str) -> bool:
        """Feature an agent (admin function)."""
        
        agent = self.agents.get(agent_id)
        if not agent:
            return False
        
        agent.status = AgentStatus.FEATURED
        agent.updated_at = datetime.utcnow()
        
        if agent_id not in self.featured_agents:
            self.featured_agents.append(agent_id)
        
        return True
    
    async def add_review(
        self,
        agent_id: str,
        user_id: str,
        user_name: str,
        rating: int,
        comment: str
    ) -> AgentReview:
        """Add a review for an agent."""
        
        if not self.agents.get(agent_id):
            raise ValueError("Agent not found")
        
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        
        review_id = str(uuid.uuid4())
        review = AgentReview(
            id=review_id,
            agent_id=agent_id,
            user_id=user_id,
            user_name=user_name,
            rating=rating,
            comment=comment,
            created_at=datetime.utcnow()
        )
        
        if agent_id not in self.reviews:
            self.reviews[agent_id] = []
        
        self.reviews[agent_id].append(review)
        
        # Update agent rating
        await self._update_agent_rating(agent_id)
        
        return review
    
    async def get_agent_reviews(self, agent_id: str) -> List[AgentReview]:
        """Get reviews for an agent."""
        return self.reviews.get(agent_id, [])
    
    async def use_agent(self, agent_id: str, user_id: str) -> bool:
        """Record agent usage (for analytics)."""
        
        agent = self.agents.get(agent_id)
        if not agent:
            return False
        
        agent.usage_count += 1
        agent.updated_at = datetime.utcnow()
        
        await self._calculate_stats()
        return True
    
    async def get_featured_agents(self, limit: int = 6) -> List[CustomAgent]:
        """Get featured agents."""
        
        featured = [
            self.agents[agent_id] 
            for agent_id in self.featured_agents 
            if agent_id in self.agents
        ]
        
        # Fill with highly-rated agents if needed
        if len(featured) < limit:
            other_agents = await self.list_agents(
                status=AgentStatus.PUBLISHED,
                sort_by="rating",
                limit=limit - len(featured)
            )
            featured.extend([a for a in other_agents if a.id not in self.featured_agents])
        
        return featured[:limit]
    
    async def get_categories_stats(self) -> Dict[str, Any]:
        """Get statistics by category."""
        
        category_stats = {}
        
        for category in AgentCategory:
            agents_in_category = [
                a for a in self.agents.values() 
                if a.category == category and a.status in [AgentStatus.PUBLISHED, AgentStatus.FEATURED]
            ]
            
            category_stats[category.value] = {
                "count": len(agents_in_category),
                "average_rating": sum(a.rating for a in agents_in_category) / len(agents_in_category) if agents_in_category else 0,
                "total_usage": sum(a.usage_count for a in agents_in_category)
            }
        
        return category_stats
    
    async def search_agents(self, query: str, limit: int = 10) -> List[CustomAgent]:
        """Advanced search for agents."""
        
        results = await self.list_agents(
            search_query=query,
            sort_by="rating",
            limit=limit
        )
        
        # Enhanced search could include:
        # - Semantic similarity search
        # - Tag matching with weights
        # - Capability-based search
        
        return results
    
    async def get_marketplace_stats(self) -> Dict[str, Any]:
        """Get overall marketplace statistics."""
        
        return {
            **self.stats,
            "categories": await self.get_categories_stats(),
            "recent_agents": len([
                a for a in self.agents.values() 
                if (datetime.utcnow() - a.created_at).days <= 30
            ]),
            "active_creators": len(set(a.creator_id for a in self.agents.values())),
            "featured_count": len(self.featured_agents)
        }
    
    async def _load_default_agents(self):
        """Load some default high-quality agents."""
        
        default_agents = [
            {
                "name": "Advanced Code Reviewer",
                "description": "Provides comprehensive code reviews with security, performance, and best practice analysis.",
                "category": AgentCategory.DEVELOPMENT,
                "creator_id": "system",
                "creator_name": "AI Tempo Team",
                "system_prompt": "You are an expert code reviewer with deep knowledge of software engineering best practices, security vulnerabilities, and performance optimization. Provide detailed, actionable feedback.",
                "user_prompt_template": "Please review this {language} code and provide feedback on: 1) Code quality 2) Security issues 3) Performance concerns 4) Best practices\n\nCode:\n{code}",
                "capabilities": [
                    {"name": "Security Analysis", "description": "Identifies potential security vulnerabilities"},
                    {"name": "Performance Review", "description": "Suggests performance improvements"},
                    {"name": "Best Practices", "description": "Ensures code follows industry standards"}
                ],
                "tags": ["code review", "security", "performance", "best practices"],
                "rating": 4.8
            },
            {
                "name": "UI/UX Design Consultant",
                "description": "Provides expert advice on user interface and user experience design decisions.",
                "category": AgentCategory.DESIGN,
                "creator_id": "system",
                "creator_name": "AI Tempo Team",
                "system_prompt": "You are a senior UI/UX designer with expertise in modern design principles, accessibility, and user psychology. Provide actionable design recommendations.",
                "user_prompt_template": "I need design feedback for: {design_type}\n\nDescription: {description}\n\nTarget audience: {audience}\n\nPlease provide specific recommendations for improving the user experience.",
                "capabilities": [
                    {"name": "Design Critique", "description": "Evaluates design decisions and aesthetics"},
                    {"name": "Accessibility Review", "description": "Ensures designs are accessible to all users"},
                    {"name": "User Flow Analysis", "description": "Optimizes user journey and interactions"}
                ],
                "tags": ["ui", "ux", "design", "accessibility", "user experience"],
                "rating": 4.7
            },
            {
                "name": "Test Strategy Planner",
                "description": "Creates comprehensive testing strategies and generates test cases for any application.",
                "category": AgentCategory.TESTING,
                "creator_id": "system",
                "creator_name": "AI Tempo Team",
                "system_prompt": "You are a QA expert specializing in test strategy, test automation, and comprehensive testing methodologies. Create detailed, practical testing plans.",
                "user_prompt_template": "Create a testing strategy for: {application_type}\n\nKey features: {features}\n\nRisk areas: {risks}\n\nPlease provide a comprehensive testing plan including unit, integration, and end-to-end tests.",
                "capabilities": [
                    {"name": "Test Planning", "description": "Creates comprehensive testing strategies"},
                    {"name": "Test Case Generation", "description": "Generates specific test cases and scenarios"},
                    {"name": "Automation Guidance", "description": "Recommends test automation approaches"}
                ],
                "tags": ["testing", "qa", "test automation", "test strategy"],
                "rating": 4.6
            },
            {
                "name": "Content Marketing Strategist",
                "description": "Develops content marketing strategies and creates engaging copy for different platforms.",
                "category": AgentCategory.MARKETING,
                "creator_id": "system",
                "creator_name": "AI Tempo Team",
                "system_prompt": "You are a content marketing expert with deep knowledge of digital marketing, SEO, and audience engagement. Create compelling, results-driven content strategies.",
                "user_prompt_template": "Create a content marketing strategy for: {business_type}\n\nTarget audience: {audience}\n\nGoals: {goals}\n\nPlatforms: {platforms}\n\nPlease provide a detailed content strategy with specific recommendations.",
                "capabilities": [
                    {"name": "Content Strategy", "description": "Develops comprehensive content marketing plans"},
                    {"name": "Copy Writing", "description": "Creates engaging copy for various platforms"},
                    {"name": "SEO Optimization", "description": "Optimizes content for search engines"}
                ],
                "tags": ["marketing", "content", "seo", "copywriting", "strategy"],
                "rating": 4.5
            },
            {
                "name": "Data Analysis Expert",
                "description": "Analyzes data sets and provides insights, visualizations, and recommendations.",
                "category": AgentCategory.ANALYTICS,
                "creator_id": "system",
                "creator_name": "AI Tempo Team",
                "system_prompt": "You are a data scientist with expertise in statistical analysis, machine learning, and data visualization. Provide clear, actionable insights from data.",
                "user_prompt_template": "Analyze this data and provide insights:\n\nData type: {data_type}\n\nContext: {context}\n\nQuestions: {questions}\n\nPlease provide detailed analysis with visualizations and recommendations.",
                "capabilities": [
                    {"name": "Statistical Analysis", "description": "Performs comprehensive statistical analysis"},
                    {"name": "Data Visualization", "description": "Creates meaningful charts and graphs"},
                    {"name": "Predictive Modeling", "description": "Builds predictive models and forecasts"}
                ],
                "tags": ["data analysis", "statistics", "machine learning", "visualization"],
                "rating": 4.7
            }
        ]
        
        for agent_data in default_agents:
            agent_id = str(uuid.uuid4())
            
            capabilities = [
                AgentCapability(
                    name=cap["name"],
                    description=cap["description"],
                    input_type="text",
                    output_type="text"
                )
                for cap in agent_data["capabilities"]
            ]
            
            prompt = AgentPrompt(
                system_prompt=agent_data["system_prompt"],
                user_prompt_template=agent_data["user_prompt_template"],
                variables=self._extract_template_variables(agent_data["user_prompt_template"]),
                examples=[]
            )
            
            agent = CustomAgent(
                id=agent_id,
                name=agent_data["name"],
                description=agent_data["description"],
                category=agent_data["category"],
                status=AgentStatus.FEATURED,
                creator_id=agent_data["creator_id"],
                creator_name=agent_data["creator_name"],
                prompt=prompt,
                capabilities=capabilities,
                tags=agent_data["tags"],
                version="1.0.0",
                rating=agent_data["rating"],
                usage_count=100 + hash(agent_id) % 500,  # Mock usage data
                price=0.0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_verified=True
            )
            
            self.agents[agent_id] = agent
            self.featured_agents.append(agent_id)
    
    async def _update_agent_rating(self, agent_id: str):
        """Update agent's average rating based on reviews."""
        
        reviews = self.reviews.get(agent_id, [])
        if not reviews:
            return
        
        average_rating = sum(review.rating for review in reviews) / len(reviews)
        self.agents[agent_id].rating = round(average_rating, 1)
    
    async def _calculate_stats(self):
        """Calculate marketplace statistics."""
        
        published_agents = [
            a for a in self.agents.values() 
            if a.status in [AgentStatus.PUBLISHED, AgentStatus.FEATURED]
        ]
        
        self.stats = {
            "total_agents": len(published_agents),
            "total_creators": len(set(a.creator_id for a in published_agents)),
            "total_downloads": sum(a.usage_count for a in published_agents),
            "average_rating": sum(a.rating for a in published_agents) / len(published_agents) if published_agents else 0.0
        }
    
    def _extract_template_variables(self, template: str) -> List[str]:
        """Extract variables from a template string."""
        
        import re
        variables = re.findall(r'\{(\w+)\}', template)
        return list(set(variables))

# Global service instance
agent_marketplace_service = None

def get_agent_marketplace_service():
    """Get the global agent marketplace service instance."""
    return agent_marketplace_service

def set_agent_marketplace_service(service):
    """Set the global agent marketplace service instance."""
    global agent_marketplace_service
    agent_marketplace_service = service