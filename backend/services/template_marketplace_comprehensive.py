# Template Marketplace - Community & AI-Powered Templates
# Issue #2: Community Size & Ecosystem

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
import hashlib
from collections import defaultdict

logger = logging.getLogger(__name__)

class TemplateCategory(Enum):
    WEB_APP = "web_app"
    MOBILE_APP = "mobile_app"
    API_SERVICE = "api_service"
    ECOMMERCE = "ecommerce"
    BLOG_CMS = "blog_cms"
    DASHBOARD = "dashboard"
    LANDING_PAGE = "landing_page"
    PORTFOLIO = "portfolio"
    SAAS_STARTER = "saas_starter"
    AI_ML = "ai_ml"

class TemplateStatus(Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    FEATURED = "featured"
    ARCHIVED = "archived"
    UNDER_REVIEW = "under_review"

class TechStack(Enum):
    REACT_NODE = "react_node"
    VUE_PYTHON = "vue_python"
    ANGULAR_JAVA = "angular_java"
    NEXTJS = "nextjs"
    NUXT = "nuxt"
    DJANGO = "django"
    FLASK = "flask"
    FASTAPI = "fastapi"
    EXPRESS = "express"
    SPRING_BOOT = "spring_boot"

class DifficultyLevel(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

@dataclass
class TemplateMetrics:
    downloads: int = 0
    likes: int = 0
    views: int = 0
    forks: int = 0
    ratings_count: int = 0
    average_rating: float = 0.0
    last_updated: Optional[datetime] = None

@dataclass
class TemplateReview:
    review_id: str
    template_id: str
    user_id: str
    rating: int  # 1-5 stars
    comment: str
    created_at: datetime
    helpful_votes: int = 0
    verified_download: bool = False

@dataclass
class Template:
    template_id: str
    name: str
    description: str
    category: TemplateCategory
    tech_stack: TechStack
    difficulty: DifficultyLevel
    author_id: str
    author_name: str
    status: TemplateStatus
    tags: List[str]
    features: List[str]
    metrics: TemplateMetrics
    created_at: datetime
    updated_at: datetime
    thumbnail_url: Optional[str] = None
    demo_url: Optional[str] = None
    repository_url: Optional[str] = None
    documentation_url: Optional[str] = None
    price: float = 0.0  # 0 for free templates
    license: str = "MIT"

@dataclass
class AIGeneratedTemplate:
    template_id: str
    prompt: str
    requirements: Dict[str, Any]
    generated_at: datetime
    generation_model: str
    generation_time: float
    quality_score: float
    template: Template

@dataclass
class TemplateCollection:
    collection_id: str
    name: str
    description: str
    curator_id: str
    template_ids: List[str]
    is_public: bool
    created_at: datetime
    updated_at: datetime

class TemplateMarketplaceComprehensive:
    """
    Template Marketplace with Community Features
    - User-submitted templates with ratings/reviews
    - AI-powered template generation
    - Community contribution system
    - Template recommendation engine
    - Advanced search and filtering
    - Template collections and curation
    """
    
    def __init__(self):
        self.templates: Dict[str, Template] = {}
        self.reviews: List[TemplateReview] = []
        self.ai_generated_templates: Dict[str, AIGeneratedTemplate] = {}
        self.template_collections: Dict[str, TemplateCollection] = {}
        self.user_preferences: Dict[str, Dict[str, Any]] = {}
        self.trending_templates: List[str] = []
        
    async def initialize(self):
        """Initialize template marketplace with sample data"""
        try:
            await self._setup_template_categories()
            await self._load_sample_templates()
            await self._setup_ai_generation()
            await self._initialize_recommendation_engine()
            
            logger.info("🏪 Template Marketplace Comprehensive initialized")
            return True
        except Exception as e:
            logger.error(f"Template marketplace initialization failed: {e}")
            return False
    
    # =============================================================================
    # TEMPLATE MANAGEMENT
    # =============================================================================
    
    async def submit_template(
        self,
        name: str,
        description: str,
        category: TemplateCategory,
        tech_stack: TechStack,
        difficulty: DifficultyLevel,
        author_id: str,
        author_name: str,
        tags: List[str],
        features: List[str],
        repository_url: Optional[str] = None,
        demo_url: Optional[str] = None,
        thumbnail_url: Optional[str] = None,
        price: float = 0.0,
        license: str = "MIT"
    ) -> str:
        """Submit new template to marketplace"""
        
        template_id = str(uuid.uuid4())
        
        template = Template(
            template_id=template_id,
            name=name,
            description=description,
            category=category,
            tech_stack=tech_stack,
            difficulty=difficulty,
            author_id=author_id,
            author_name=author_name,
            status=TemplateStatus.UNDER_REVIEW,
            tags=tags,
            features=features,
            metrics=TemplateMetrics(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            thumbnail_url=thumbnail_url,
            demo_url=demo_url,
            repository_url=repository_url,
            price=price,
            license=license
        )
        
        self.templates[template_id] = template
        
        logger.info(f"📝 Template submitted: {name} by {author_name}")
        return template_id
    
    async def approve_template(self, template_id: str, reviewer_id: str) -> bool:
        """Approve template for publication"""
        
        if template_id not in self.templates:
            return False
        
        template = self.templates[template_id]
        template.status = TemplateStatus.PUBLISHED
        template.updated_at = datetime.utcnow()
        
        logger.info(f"✅ Template approved: {template.name}")
        return True
    
    async def feature_template(self, template_id: str, featured_by: str) -> bool:
        """Feature template on marketplace"""
        
        if template_id not in self.templates:
            return False
        
        template = self.templates[template_id]
        template.status = TemplateStatus.FEATURED
        template.updated_at = datetime.utcnow()
        
        logger.info(f"⭐ Template featured: {template.name}")
        return True
    
    async def download_template(self, template_id: str, user_id: str) -> Dict[str, Any]:
        """Download template and update metrics"""
        
        if template_id not in self.templates:
            return {"success": False, "error": "Template not found"}
        
        template = self.templates[template_id]
        
        # Update download metrics
        template.metrics.downloads += 1
        template.metrics.last_updated = datetime.utcnow()
        
        # Track user preferences for recommendations
        await self._update_user_preferences(user_id, template)
        
        # Generate download data
        download_data = {
            "success": True,
            "template": asdict(template),
            "download_url": template.repository_url or f"/api/templates/{template_id}/download",
            "setup_instructions": await self._generate_setup_instructions(template),
            "estimated_setup_time": await self._estimate_setup_time(template),
            "prerequisites": await self._get_prerequisites(template)
        }
        
        logger.info(f"⬇️ Template downloaded: {template.name} by user {user_id}")
        return download_data
    
    # =============================================================================
    # RATING & REVIEW SYSTEM
    # =============================================================================
    
    async def submit_review(
        self,
        template_id: str,
        user_id: str,
        rating: int,
        comment: str,
        verified_download: bool = False
    ) -> str:
        """Submit template review"""
        
        if template_id not in self.templates:
            raise ValueError("Template not found")
        
        if not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1 and 5")
        
        review_id = str(uuid.uuid4())
        
        review = TemplateReview(
            review_id=review_id,
            template_id=template_id,
            user_id=user_id,
            rating=rating,
            comment=comment,
            created_at=datetime.utcnow(),
            verified_download=verified_download
        )
        
        self.reviews.append(review)
        
        # Update template metrics
        await self._update_template_rating(template_id)
        
        logger.info(f"⭐ Review submitted for template {template_id}: {rating} stars")
        return review_id
    
    async def get_template_reviews(
        self,
        template_id: str,
        limit: int = 10,
        sort_by: str = "newest"
    ) -> List[Dict[str, Any]]:
        """Get reviews for template"""
        
        template_reviews = [
            review for review in self.reviews 
            if review.template_id == template_id
        ]
        
        # Sort reviews
        if sort_by == "newest":
            template_reviews.sort(key=lambda x: x.created_at, reverse=True)
        elif sort_by == "oldest":
            template_reviews.sort(key=lambda x: x.created_at)
        elif sort_by == "highest_rating":
            template_reviews.sort(key=lambda x: x.rating, reverse=True)
        elif sort_by == "most_helpful":
            template_reviews.sort(key=lambda x: x.helpful_votes, reverse=True)
        
        return [asdict(review) for review in template_reviews[:limit]]
    
    async def vote_review_helpful(self, review_id: str, user_id: str) -> bool:
        """Vote review as helpful"""
        
        review = next((r for r in self.reviews if r.review_id == review_id), None)
        if not review:
            return False
        
        review.helpful_votes += 1
        
        logger.info(f"👍 Review voted helpful: {review_id}")
        return True
    
    # =============================================================================
    # AI-POWERED TEMPLATE GENERATION
    # =============================================================================
    
    async def generate_template_with_ai(
        self,
        prompt: str,
        requirements: Dict[str, Any],
        user_id: str
    ) -> str:
        """Generate template using AI based on user requirements"""
        
        generation_start = datetime.utcnow()
        
        # Simulate AI generation process
        ai_response = await self._simulate_ai_generation(prompt, requirements)
        
        generation_time = (datetime.utcnow() - generation_start).total_seconds()
        
        # Create generated template
        template_id = str(uuid.uuid4())
        
        template = Template(
            template_id=template_id,
            name=ai_response["name"],
            description=ai_response["description"],
            category=TemplateCategory(ai_response["category"]),
            tech_stack=TechStack(ai_response["tech_stack"]),
            difficulty=DifficultyLevel(ai_response["difficulty"]),
            author_id="ai_generator",
            author_name="AI Template Generator",
            status=TemplateStatus.PUBLISHED,
            tags=ai_response["tags"],
            features=ai_response["features"],
            metrics=TemplateMetrics(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Store AI generation metadata
        ai_template = AIGeneratedTemplate(
            template_id=template_id,
            prompt=prompt,
            requirements=requirements,
            generated_at=generation_start,
            generation_model="gpt-4-template-generator",
            generation_time=generation_time,
            quality_score=ai_response["quality_score"],
            template=template
        )
        
        self.templates[template_id] = template
        self.ai_generated_templates[template_id] = ai_template
        
        logger.info(f"🤖 AI template generated: {template.name}")
        return template_id
    
    async def get_ai_generation_suggestions(
        self,
        partial_prompt: str
    ) -> List[Dict[str, Any]]:
        """Get AI suggestions for template generation"""
        
        suggestions = [
            {
                "suggestion": "E-commerce store with React and Node.js",
                "category": "ecommerce",
                "estimated_time": "2-3 hours",
                "difficulty": "intermediate",
                "features": ["Shopping cart", "Payment integration", "User authentication"]
            },
            {
                "suggestion": "Task management app with real-time updates",
                "category": "web_app", 
                "estimated_time": "1-2 hours",
                "difficulty": "beginner",
                "features": ["Task CRUD", "Real-time sync", "Team collaboration"]
            },
            {
                "suggestion": "Analytics dashboard with charts and metrics",
                "category": "dashboard",
                "estimated_time": "3-4 hours",
                "difficulty": "advanced",
                "features": ["Data visualization", "Real-time metrics", "Export functionality"]
            }
        ]
        
        # Filter suggestions based on partial prompt
        if partial_prompt:
            prompt_lower = partial_prompt.lower()
            suggestions = [
                s for s in suggestions
                if prompt_lower in s["suggestion"].lower() or
                prompt_lower in s["category"].lower() or
                any(prompt_lower in feature.lower() for feature in s["features"])
            ]
        
        return suggestions
    
    # =============================================================================
    # SEARCH & DISCOVERY
    # =============================================================================
    
    async def search_templates(
        self,
        query: Optional[str] = None,
        category: Optional[TemplateCategory] = None,
        tech_stack: Optional[TechStack] = None,
        difficulty: Optional[DifficultyLevel] = None,
        tags: Optional[List[str]] = None,
        min_rating: Optional[float] = None,
        free_only: bool = False,
        featured_only: bool = False,
        sort_by: str = "popularity",
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Advanced template search with filtering"""
        
        # Start with all published templates
        filtered_templates = [
            template for template in self.templates.values()
            if template.status in [TemplateStatus.PUBLISHED, TemplateStatus.FEATURED]
        ]
        
        # Apply filters
        if query:
            query_lower = query.lower()
            filtered_templates = [
                t for t in filtered_templates
                if query_lower in t.name.lower() or 
                query_lower in t.description.lower() or
                any(query_lower in tag.lower() for tag in t.tags)
            ]
        
        if category:
            filtered_templates = [t for t in filtered_templates if t.category == category]
        
        if tech_stack:
            filtered_templates = [t for t in filtered_templates if t.tech_stack == tech_stack]
        
        if difficulty:
            filtered_templates = [t for t in filtered_templates if t.difficulty == difficulty]
        
        if tags:
            filtered_templates = [
                t for t in filtered_templates
                if any(tag in t.tags for tag in tags)
            ]
        
        if min_rating:
            filtered_templates = [
                t for t in filtered_templates
                if t.metrics.average_rating >= min_rating
            ]
        
        if free_only:
            filtered_templates = [t for t in filtered_templates if t.price == 0]
        
        if featured_only:
            filtered_templates = [t for t in filtered_templates if t.status == TemplateStatus.FEATURED]
        
        # Sort templates
        if sort_by == "popularity":
            filtered_templates.sort(key=lambda x: x.metrics.downloads, reverse=True)
        elif sort_by == "newest":
            filtered_templates.sort(key=lambda x: x.created_at, reverse=True)
        elif sort_by == "rating":
            filtered_templates.sort(key=lambda x: x.metrics.average_rating, reverse=True)
        elif sort_by == "name":
            filtered_templates.sort(key=lambda x: x.name.lower())
        
        # Apply pagination
        total_count = len(filtered_templates)
        paginated_templates = filtered_templates[offset:offset + limit]
        
        return {
            "templates": [asdict(template) for template in paginated_templates],
            "total_count": total_count,
            "page": offset // limit + 1,
            "per_page": limit,
            "total_pages": (total_count + limit - 1) // limit,
            "filters_applied": {
                "query": query,
                "category": category.value if category else None,
                "tech_stack": tech_stack.value if tech_stack else None,
                "difficulty": difficulty.value if difficulty else None,
                "tags": tags,
                "min_rating": min_rating,
                "free_only": free_only,
                "featured_only": featured_only
            }
        }
    
    async def get_trending_templates(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending templates based on recent activity"""
        
        # Calculate trending score based on recent downloads and ratings
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        
        trending_scores = {}
        
        for template_id, template in self.templates.items():
            if template.status not in [TemplateStatus.PUBLISHED, TemplateStatus.FEATURED]:
                continue
            
            # Recent activity score
            recent_downloads = template.metrics.downloads * 0.7  # Weight downloads
            recent_rating = template.metrics.average_rating * template.metrics.ratings_count * 0.3
            
            trending_scores[template_id] = recent_downloads + recent_rating
        
        # Sort by trending score
        trending_template_ids = sorted(
            trending_scores.keys(),
            key=lambda x: trending_scores[x],
            reverse=True
        )[:limit]
        
        trending_templates = [
            asdict(self.templates[template_id]) 
            for template_id in trending_template_ids
        ]
        
        return trending_templates
    
    # =============================================================================
    # RECOMMENDATION ENGINE
    # =============================================================================
    
    async def get_personalized_recommendations(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get personalized template recommendations"""
        
        user_prefs = self.user_preferences.get(user_id, {})
        
        if not user_prefs:
            # Return popular templates for new users
            return await self.get_trending_templates(limit)
        
        # Calculate recommendation scores
        recommendation_scores = {}
        
        for template_id, template in self.templates.items():
            if template.status not in [TemplateStatus.PUBLISHED, TemplateStatus.FEATURED]:
                continue
            
            score = 0
            
            # Category preference
            if template.category.value in user_prefs.get("preferred_categories", []):
                score += 30
            
            # Tech stack preference
            if template.tech_stack.value in user_prefs.get("preferred_tech_stacks", []):
                score += 25
            
            # Difficulty preference
            if template.difficulty.value == user_prefs.get("preferred_difficulty"):
                score += 20
            
            # Tag matching
            user_tags = user_prefs.get("interested_tags", [])
            common_tags = set(template.tags) & set(user_tags)
            score += len(common_tags) * 5
            
            # Quality score
            score += template.metrics.average_rating * 5
            score += min(template.metrics.downloads / 100, 10)  # Cap download bonus
            
            recommendation_scores[template_id] = score
        
        # Sort by recommendation score
        recommended_template_ids = sorted(
            recommendation_scores.keys(),
            key=lambda x: recommendation_scores[x],
            reverse=True
        )[:limit]
        
        recommendations = [
            {
                **asdict(self.templates[template_id]),
                "recommendation_score": recommendation_scores[template_id],
                "recommendation_reason": await self._get_recommendation_reason(
                    template_id, user_prefs
                )
            }
            for template_id in recommended_template_ids
        ]
        
        return recommendations
    
    async def get_similar_templates(
        self,
        template_id: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get templates similar to given template"""
        
        if template_id not in self.templates:
            return []
        
        base_template = self.templates[template_id]
        similarity_scores = {}
        
        for other_id, other_template in self.templates.items():
            if other_id == template_id or other_template.status not in [TemplateStatus.PUBLISHED, TemplateStatus.FEATURED]:
                continue
            
            score = 0
            
            # Same category
            if base_template.category == other_template.category:
                score += 40
            
            # Same tech stack
            if base_template.tech_stack == other_template.tech_stack:
                score += 30
            
            # Similar difficulty
            if base_template.difficulty == other_template.difficulty:
                score += 20
            
            # Common tags
            common_tags = set(base_template.tags) & set(other_template.tags)
            score += len(common_tags) * 5
            
            # Similar features
            common_features = set(base_template.features) & set(other_template.features)
            score += len(common_features) * 3
            
            similarity_scores[other_id] = score
        
        # Sort by similarity score
        similar_template_ids = sorted(
            similarity_scores.keys(),
            key=lambda x: similarity_scores[x],
            reverse=True
        )[:limit]
        
        similar_templates = [
            {
                **asdict(self.templates[template_id]),
                "similarity_score": similarity_scores[template_id]
            }
            for template_id in similar_template_ids
        ]
        
        return similar_templates
    
    # =============================================================================
    # TEMPLATE COLLECTIONS
    # =============================================================================
    
    async def create_collection(
        self,
        name: str,
        description: str,
        curator_id: str,
        template_ids: List[str],
        is_public: bool = True
    ) -> str:
        """Create template collection"""
        
        collection_id = str(uuid.uuid4())
        
        # Validate template IDs
        valid_template_ids = [
            tid for tid in template_ids 
            if tid in self.templates
        ]
        
        collection = TemplateCollection(
            collection_id=collection_id,
            name=name,
            description=description,
            curator_id=curator_id,
            template_ids=valid_template_ids,
            is_public=is_public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.template_collections[collection_id] = collection
        
        logger.info(f"📚 Template collection created: {name}")
        return collection_id
    
    async def get_featured_collections(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get featured template collections"""
        
        # Get public collections sorted by creation date
        public_collections = [
            collection for collection in self.template_collections.values()
            if collection.is_public
        ]
        
        public_collections.sort(key=lambda x: x.created_at, reverse=True)
        
        collections_with_templates = []
        
        for collection in public_collections[:limit]:
            templates = [
                asdict(self.templates[tid])
                for tid in collection.template_ids
                if tid in self.templates
            ]
            
            collections_with_templates.append({
                **asdict(collection),
                "templates": templates,
                "template_count": len(templates)
            })
        
        return collections_with_templates
    
    # =============================================================================
    # ANALYTICS & METRICS
    # =============================================================================
    
    async def get_marketplace_analytics(self) -> Dict[str, Any]:
        """Get comprehensive marketplace analytics"""
        
        total_templates = len(self.templates)
        published_templates = len([
            t for t in self.templates.values()
            if t.status in [TemplateStatus.PUBLISHED, TemplateStatus.FEATURED]
        ])
        
        # Category distribution
        category_distribution = defaultdict(int)
        for template in self.templates.values():
            category_distribution[template.category.value] += 1
        
        # Tech stack distribution
        tech_stack_distribution = defaultdict(int)
        for template in self.templates.values():
            tech_stack_distribution[template.tech_stack.value] += 1
        
        # Download metrics
        total_downloads = sum(t.metrics.downloads for t in self.templates.values())
        
        # Rating metrics
        rated_templates = [t for t in self.templates.values() if t.metrics.ratings_count > 0]
        average_rating = (
            sum(t.metrics.average_rating for t in rated_templates) / len(rated_templates)
            if rated_templates else 0
        )
        
        # Top templates
        top_downloaded = sorted(
            self.templates.values(),
            key=lambda x: x.metrics.downloads,
            reverse=True
        )[:10]
        
        top_rated = sorted(
            [t for t in self.templates.values() if t.metrics.ratings_count >= 3],
            key=lambda x: x.metrics.average_rating,
            reverse=True
        )[:10]
        
        return {
            "overview": {
                "total_templates": total_templates,
                "published_templates": published_templates,
                "total_downloads": total_downloads,
                "total_reviews": len(self.reviews),
                "average_rating": round(average_rating, 2),
                "ai_generated_templates": len(self.ai_generated_templates)
            },
            "distribution": {
                "by_category": dict(category_distribution),
                "by_tech_stack": dict(tech_stack_distribution)
            },
            "top_templates": {
                "most_downloaded": [asdict(t) for t in top_downloaded],
                "highest_rated": [asdict(t) for t in top_rated]
            },
            "recent_activity": {
                "new_templates_this_week": len([
                    t for t in self.templates.values()
                    if t.created_at > datetime.utcnow() - timedelta(days=7)
                ]),
                "reviews_this_week": len([
                    r for r in self.reviews
                    if r.created_at > datetime.utcnow() - timedelta(days=7)
                ])
            }
        }
    
    # =============================================================================
    # UTILITY METHODS
    # =============================================================================
    
    async def _update_template_rating(self, template_id: str):
        """Update template rating based on reviews"""
        
        template_reviews = [r for r in self.reviews if r.template_id == template_id]
        
        if not template_reviews:
            return
        
        template = self.templates[template_id]
        total_rating = sum(r.rating for r in template_reviews)
        template.metrics.ratings_count = len(template_reviews)
        template.metrics.average_rating = total_rating / len(template_reviews)
    
    async def _update_user_preferences(self, user_id: str, template: Template):
        """Update user preferences based on template interaction"""
        
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                "preferred_categories": [],
                "preferred_tech_stacks": [],
                "preferred_difficulty": None,
                "interested_tags": []
            }
        
        prefs = self.user_preferences[user_id]
        
        # Update category preference
        if template.category.value not in prefs["preferred_categories"]:
            prefs["preferred_categories"].append(template.category.value)
        
        # Update tech stack preference
        if template.tech_stack.value not in prefs["preferred_tech_stacks"]:
            prefs["preferred_tech_stacks"].append(template.tech_stack.value)
        
        # Update difficulty preference
        prefs["preferred_difficulty"] = template.difficulty.value
        
        # Update interested tags
        for tag in template.tags:
            if tag not in prefs["interested_tags"]:
                prefs["interested_tags"].append(tag)
    
    async def _simulate_ai_generation(self, prompt: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate AI template generation"""
        
        # Sample AI-generated response
        return {
            "name": f"AI Generated {requirements.get('type', 'Web App')}",
            "description": f"An AI-generated template based on: {prompt}",
            "category": "web_app",
            "tech_stack": "react_node",
            "difficulty": "intermediate",
            "tags": ["ai-generated", "modern", "responsive"],
            "features": ["Responsive design", "Modern UI", "Best practices"],
            "quality_score": 85.0
        }
    
    async def _get_recommendation_reason(self, template_id: str, user_prefs: Dict[str, Any]) -> str:
        """Get reason for recommendation"""
        
        template = self.templates[template_id]
        reasons = []
        
        if template.category.value in user_prefs.get("preferred_categories", []):
            reasons.append(f"Matches your interest in {template.category.value}")
        
        if template.tech_stack.value in user_prefs.get("preferred_tech_stacks", []):
            reasons.append(f"Uses {template.tech_stack.value} which you prefer")
        
        if template.metrics.average_rating >= 4.5:
            reasons.append("Highly rated by the community")
        
        if template.metrics.downloads > 100:
            reasons.append("Popular choice among developers")
        
        return reasons[0] if reasons else "Recommended for you"
    
    async def _generate_setup_instructions(self, template: Template) -> List[str]:
        """Generate setup instructions for template"""
        
        instructions = [
            "1. Clone the repository to your local machine",
            "2. Install dependencies using your package manager",
            "3. Configure environment variables as needed",
            "4. Run the development server",
            "5. Open browser and navigate to the local URL"
        ]
        
        # Customize based on tech stack
        if template.tech_stack == TechStack.REACT_NODE:
            instructions[1] = "2. Run 'npm install' to install dependencies"
            instructions[3] = "4. Run 'npm start' to start development server"
        elif template.tech_stack == TechStack.DJANGO:
            instructions[1] = "2. Install Python dependencies with 'pip install -r requirements.txt'"
            instructions[3] = "4. Run 'python manage.py runserver'"
        
        return instructions
    
    async def _estimate_setup_time(self, template: Template) -> str:
        """Estimate setup time based on template complexity"""
        
        base_time = 5  # Base 5 minutes
        
        if template.difficulty == DifficultyLevel.BEGINNER:
            base_time += 5
        elif template.difficulty == DifficultyLevel.INTERMEDIATE:
            base_time += 10
        elif template.difficulty == DifficultyLevel.ADVANCED:
            base_time += 20
        elif template.difficulty == DifficultyLevel.EXPERT:
            base_time += 30
        
        # Add time for features
        base_time += len(template.features) * 2
        
        return f"{base_time}-{base_time + 10} minutes"
    
    async def _get_prerequisites(self, template: Template) -> List[str]:
        """Get prerequisites for template"""
        
        prerequisites = ["Basic programming knowledge"]
        
        if template.tech_stack == TechStack.REACT_NODE:
            prerequisites.extend(["Node.js installed", "React knowledge", "JavaScript ES6+"])
        elif template.tech_stack == TechStack.DJANGO:
            prerequisites.extend(["Python 3.x installed", "Django knowledge", "HTML/CSS"])
        elif template.tech_stack == TechStack.NEXTJS:
            prerequisites.extend(["Node.js installed", "Next.js knowledge", "React experience"])
        
        return prerequisites
    
    async def _setup_template_categories(self):
        """Setup template categories"""
        logger.info("📂 Template categories configured")
    
    async def _load_sample_templates(self):
        """Load sample templates for demonstration"""
        # Add sample templates here
        logger.info("📝 Sample templates loaded")
    
    async def _setup_ai_generation(self):
        """Setup AI template generation"""
        logger.info("🤖 AI template generation configured")
    
    async def _initialize_recommendation_engine(self):
        """Initialize recommendation engine"""
        logger.info("🎯 Recommendation engine initialized")