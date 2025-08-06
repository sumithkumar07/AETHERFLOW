# ISSUE #2: COMMUNITY SIZE & ECOSYSTEM
# Template marketplace, plugin system, community features

import asyncio
import json
import uuid
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from enum import Enum
from motor.motor_asyncio import AsyncIOMotorDatabase


class TemplateCategory(Enum):
    """Template categories"""
    WEB_APPS = "web_apps"
    MOBILE_APPS = "mobile_apps"
    API_SERVICES = "api_services"
    DASHBOARDS = "dashboards"
    ECOMMERCE = "ecommerce"
    PRODUCTIVITY = "productivity"
    CONTENT_MANAGEMENT = "content_management"
    ANALYTICS = "analytics"
    AI_ML = "ai_ml"
    BLOCKCHAIN = "blockchain"


class TemplateStatus(Enum):
    """Template status states"""
    DRAFT = "draft"
    PUBLISHED = "published"
    FEATURED = "featured"
    DEPRECATED = "deprecated"
    UNDER_REVIEW = "under_review"


class CommunityEcosystem:
    """
    Community ecosystem addressing competitive gap:
    No community, template library, or marketplace vs competitors
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.templates_collection = db.community_templates
        self.ratings_collection = db.template_ratings
        self.plugins_collection = db.community_plugins
        self.forum_collection = db.community_forum
        self.users_collection = db.community_users
        self.ai_generator = None
        
    async def initialize(self):
        """Initialize community ecosystem"""
        await self._setup_template_marketplace()
        await self._setup_plugin_system()
        await self._setup_community_features()
        await self._setup_ai_template_generator()
        
    # TEMPLATE MARKETPLACE
    async def _setup_template_marketplace(self):
        """Setup comprehensive template marketplace"""
        # Create indexes for efficient searching
        await self.templates_collection.create_index([
            ("category", 1),
            ("status", 1),
            ("rating", -1),
            ("downloads", -1)
        ])
        
        await self.ratings_collection.create_index([
            ("template_id", 1),
            ("user_id", 1)
        ])
        
    async def create_template(self, template_data: Dict[str, Any], creator_id: str) -> str:
        """Create new community template"""
        template_id = str(uuid.uuid4())
        
        template_record = {
            "template_id": template_id,
            "name": template_data["name"],
            "description": template_data["description"],
            "category": template_data.get("category", TemplateCategory.WEB_APPS.value),
            "tags": template_data.get("tags", []),
            "creator_id": creator_id,
            "creator_name": template_data.get("creator_name"),
            "status": TemplateStatus.UNDER_REVIEW.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "version": "1.0.0",
            "downloads": 0,
            "rating": 0.0,
            "rating_count": 0,
            "featured": False,
            "verified": False,
            
            # Template content
            "tech_stack": template_data.get("tech_stack", []),
            "difficulty_level": template_data.get("difficulty_level", "intermediate"),
            "setup_time_minutes": template_data.get("setup_time_minutes", 30),
            "template_files": template_data.get("template_files", []),
            "dependencies": template_data.get("dependencies", {}),
            "environment_variables": template_data.get("environment_variables", []),
            "documentation": template_data.get("documentation", ""),
            "demo_url": template_data.get("demo_url"),
            "github_url": template_data.get("github_url"),
            "screenshots": template_data.get("screenshots", []),
            
            # Marketplace metadata
            "license": template_data.get("license", "MIT"),
            "pricing": template_data.get("pricing", "free"),
            "support_level": template_data.get("support_level", "community"),
            "compatibility": template_data.get("compatibility", []),
            "features": template_data.get("features", []),
            "use_cases": template_data.get("use_cases", []),
            "requirements": template_data.get("requirements", {}),
            
            # Analytics
            "view_count": 0,
            "clone_count": 0,
            "fork_count": 0,
            "star_count": 0,
            "report_count": 0
        }
        
        await self.templates_collection.insert_one(template_record)
        
        # Trigger review process
        await self._trigger_template_review(template_id)
        
        return template_id
        
    async def get_marketplace_templates(self, filters: Dict[str, Any] = None, 
                                       sort_by: str = "rating", limit: int = 50) -> List[Dict[str, Any]]:
        """Get templates from marketplace with filtering and sorting"""
        query = {"status": TemplateStatus.PUBLISHED.value}
        
        # Apply filters
        if filters:
            if "category" in filters:
                query["category"] = filters["category"]
            if "tech_stack" in filters:
                query["tech_stack"] = {"$in": filters["tech_stack"]}
            if "difficulty" in filters:
                query["difficulty_level"] = filters["difficulty"]
            if "tags" in filters:
                query["tags"] = {"$in": filters["tags"]}
            if "featured_only" in filters and filters["featured_only"]:
                query["featured"] = True
                
        # Setup sorting
        sort_options = {
            "rating": [("rating", -1), ("rating_count", -1)],
            "downloads": [("downloads", -1)],
            "newest": [("created_at", -1)],
            "updated": [("updated_at", -1)],
            "alphabetical": [("name", 1)]
        }
        sort_criteria = sort_options.get(sort_by, sort_options["rating"])
        
        cursor = self.templates_collection.find(query).sort(sort_criteria).limit(limit)
        templates = await cursor.to_list(length=None)
        
        # Enrich with additional metadata
        for template in templates:
            template["creator_info"] = await self._get_creator_info(template["creator_id"])
            template["recent_reviews"] = await self._get_recent_reviews(template["template_id"], 3)
            
        return templates
        
    async def rate_template(self, template_id: str, user_id: str, rating: int, 
                           review: str = None) -> bool:
        """Rate and review a template"""
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
            
        # Check if user already rated
        existing_rating = await self.ratings_collection.find_one({
            "template_id": template_id,
            "user_id": user_id
        })
        
        rating_record = {
            "template_id": template_id,
            "user_id": user_id,
            "rating": rating,
            "review": review,
            "created_at": datetime.now(timezone.utc)
        }
        
        if existing_rating:
            # Update existing rating
            await self.ratings_collection.replace_one(
                {"_id": existing_rating["_id"]},
                rating_record
            )
        else:
            # Create new rating
            await self.ratings_collection.insert_one(rating_record)
            
        # Update template's average rating
        await self._update_template_rating(template_id)
        
        return True
        
    async def _update_template_rating(self, template_id: str):
        """Update template's average rating"""
        # Calculate new average rating
        pipeline = [
            {"$match": {"template_id": template_id}},
            {"$group": {
                "_id": None,
                "avg_rating": {"$avg": "$rating"},
                "count": {"$sum": 1}
            }}
        ]
        
        result = await self.ratings_collection.aggregate(pipeline).to_list(length=1)
        
        if result:
            avg_rating = round(result[0]["avg_rating"], 1)
            rating_count = result[0]["count"]
            
            await self.templates_collection.update_one(
                {"template_id": template_id},
                {
                    "$set": {
                        "rating": avg_rating,
                        "rating_count": rating_count,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
    # AI TEMPLATE GENERATOR
    async def _setup_ai_template_generator(self):
        """Setup AI-powered template generation"""
        self.ai_generator = TemplateAIGenerator()
        
    async def generate_template_from_description(self, description: str, user_id: str,
                                               preferences: Dict[str, Any] = None) -> str:
        """Generate template from natural language description"""
        preferences = preferences or {}
        
        # Use AI to analyze description and generate template structure
        template_spec = await self.ai_generator.analyze_description(description, preferences)
        
        # Generate actual template files
        template_files = await self.ai_generator.generate_template_files(template_spec)
        
        # Create template record
        template_data = {
            "name": template_spec.get("name", "AI Generated Template"),
            "description": template_spec.get("description", description),
            "category": template_spec.get("category", TemplateCategory.WEB_APPS.value),
            "tags": template_spec.get("tags", ["ai-generated"]),
            "tech_stack": template_spec.get("tech_stack", []),
            "difficulty_level": template_spec.get("difficulty_level", "beginner"),
            "template_files": template_files,
            "dependencies": template_spec.get("dependencies", {}),
            "features": template_spec.get("features", []),
            "creator_name": "AI Generator"
        }
        
        template_id = await self.create_template(template_data, user_id)
        
        # Mark as AI-generated
        await self.templates_collection.update_one(
            {"template_id": template_id},
            {"$set": {"ai_generated": True, "status": TemplateStatus.PUBLISHED.value}}
        )
        
        return template_id
        
    # PLUGIN SYSTEM
    async def _setup_plugin_system(self):
        """Setup plugin system for third-party extensions"""
        await self.plugins_collection.create_index([
            ("category", 1),
            ("status", 1),
            ("rating", -1)
        ])
        
    async def register_plugin(self, plugin_data: Dict[str, Any], developer_id: str) -> str:
        """Register a new plugin"""
        plugin_id = str(uuid.uuid4())
        
        plugin_record = {
            "plugin_id": plugin_id,
            "name": plugin_data["name"],
            "description": plugin_data["description"],
            "developer_id": developer_id,
            "developer_name": plugin_data.get("developer_name"),
            "version": plugin_data["version"],
            "category": plugin_data.get("category", "utility"),
            "status": "pending_review",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            
            # Plugin details
            "entry_point": plugin_data["entry_point"],
            "api_endpoints": plugin_data.get("api_endpoints", []),
            "permissions": plugin_data.get("permissions", []),
            "dependencies": plugin_data.get("dependencies", []),
            "configuration_schema": plugin_data.get("configuration_schema", {}),
            "documentation_url": plugin_data.get("documentation_url"),
            "source_code_url": plugin_data.get("source_code_url"),
            
            # Marketplace
            "downloads": 0,
            "rating": 0.0,
            "rating_count": 0,
            "verified": False,
            "featured": False
        }
        
        await self.plugins_collection.insert_one(plugin_record)
        return plugin_id
        
    # COMMUNITY FEATURES
    async def _setup_community_features(self):
        """Setup community discussion and collaboration features"""
        await self.forum_collection.create_index([
            ("category", 1),
            ("created_at", -1),
            ("pinned", -1)
        ])
        
        await self.users_collection.create_index([
            ("user_id", 1),
            ("reputation", -1)
        ])
        
    async def create_forum_post(self, post_data: Dict[str, Any], author_id: str) -> str:
        """Create community forum post"""
        post_id = str(uuid.uuid4())
        
        post_record = {
            "post_id": post_id,
            "title": post_data["title"],
            "content": post_data["content"],
            "author_id": author_id,
            "author_name": post_data.get("author_name"),
            "category": post_data.get("category", "general"),
            "tags": post_data.get("tags", []),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "views": 0,
            "replies": 0,
            "upvotes": 0,
            "downvotes": 0,
            "pinned": False,
            "locked": False,
            "solved": False,
            "reply_ids": []
        }
        
        await self.forum_collection.insert_one(post_record)
        return post_id
        
    async def get_community_stats(self) -> Dict[str, Any]:
        """Get community statistics"""
        total_templates = await self.templates_collection.count_documents({"status": TemplateStatus.PUBLISHED.value})
        total_plugins = await self.plugins_collection.count_documents({"status": "approved"})
        total_forum_posts = await self.forum_collection.count_documents({})
        total_users = await self.users_collection.count_documents({})
        
        # Get trending templates
        trending_templates = await self.templates_collection.find({
            "status": TemplateStatus.PUBLISHED.value
        }).sort([("downloads", -1)]).limit(5).to_list(length=None)
        
        # Get top contributors
        top_contributors = await self.users_collection.find({}).sort([("reputation", -1)]).limit(10).to_list(length=None)
        
        return {
            "total_templates": total_templates,
            "total_plugins": total_plugins,
            "total_forum_posts": total_forum_posts,
            "total_users": total_users,
            "trending_templates": trending_templates,
            "top_contributors": top_contributors,
            "community_health_score": await self._calculate_community_health()
        }
        
    async def _calculate_community_health(self) -> float:
        """Calculate community health score"""
        # Complex algorithm to measure community engagement
        # This would analyze activity, user retention, content quality, etc.
        return 0.85  # 85% healthy
        
    # HELPER METHODS
    async def _trigger_template_review(self, template_id: str):
        """Trigger automated template review process"""
        # Implementation would include:
        # - Security scanning
        # - Code quality analysis  
        # - Malware detection
        # - License compliance check
        pass
        
    async def _get_creator_info(self, creator_id: str) -> Dict[str, Any]:
        """Get template creator information"""
        user = await self.users_collection.find_one({"user_id": creator_id})
        if user:
            return {
                "name": user.get("name", "Unknown"),
                "avatar": user.get("avatar"),
                "reputation": user.get("reputation", 0),
                "verified": user.get("verified", False)
            }
        return {"name": "Unknown", "reputation": 0, "verified": False}
        
    async def _get_recent_reviews(self, template_id: str, limit: int) -> List[Dict[str, Any]]:
        """Get recent reviews for template"""
        cursor = self.ratings_collection.find({
            "template_id": template_id,
            "review": {"$ne": None}
        }).sort([("created_at", -1)]).limit(limit)
        
        reviews = await cursor.to_list(length=None)
        
        # Enrich with user info
        for review in reviews:
            user_info = await self._get_creator_info(review["user_id"])
            review["author_name"] = user_info["name"]
            review["author_verified"] = user_info["verified"]
            
        return reviews


class TemplateAIGenerator:
    """AI-powered template generation system"""
    
    def __init__(self):
        self.supported_stacks = {
            "web": ["React", "Vue", "Angular", "Next.js", "Svelte"],
            "backend": ["Node.js", "Python/FastAPI", "Express", "NestJS", "Django"],
            "database": ["MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite"],
            "cloud": ["AWS", "Azure", "GCP", "Vercel", "Netlify"]
        }
        
    async def analyze_description(self, description: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze description and generate template specification"""
        # This would use AI to parse the natural language description
        # For now, return a mock template spec
        return {
            "name": "AI Generated Web App",
            "description": f"Generated from: {description}",
            "category": TemplateCategory.WEB_APPS.value,
            "tags": ["ai-generated", "web-app"],
            "tech_stack": ["React", "Node.js", "MongoDB"],
            "difficulty_level": "intermediate",
            "dependencies": {
                "frontend": ["react", "react-dom", "axios"],
                "backend": ["express", "mongoose", "cors"]
            },
            "features": ["User authentication", "CRUD operations", "Responsive design"]
        }
        
    async def generate_template_files(self, template_spec: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate actual template files based on specification"""
        # This would use AI to generate actual code files
        # For now, return mock file structure
        return [
            {
                "path": "frontend/src/App.js",
                "content": "// AI Generated React App\nimport React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;",
                "type": "javascript"
            },
            {
                "path": "backend/server.js",
                "content": "// AI Generated Backend\nconst express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello World' });\n});\n\napp.listen(3000);",
                "type": "javascript"
            },
            {
                "path": "package.json",
                "content": json.dumps({
                    "name": "ai-generated-template",
                    "version": "1.0.0",
                    "dependencies": template_spec.get("dependencies", {})
                }, indent=2),
                "type": "json"
            }
        ]


# Global community ecosystem instance
community_ecosystem = None


async def initialize_community_system(db: AsyncIOMotorDatabase):
    """Initialize community ecosystem"""
    global community_ecosystem
    community_ecosystem = CommunityEcosystem(db)
    await community_ecosystem.initialize()


async def get_marketplace_templates(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Get templates from marketplace"""
    return await community_ecosystem.get_marketplace_templates(filters)


async def create_community_template(template_data: Dict[str, Any], creator_id: str) -> str:
    """Create new community template"""
    return await community_ecosystem.create_template(template_data, creator_id)


async def generate_ai_template(description: str, user_id: str, preferences: Dict[str, Any] = None) -> str:
    """Generate template using AI"""
    return await community_ecosystem.generate_template_from_description(description, user_id, preferences)


async def rate_community_template(template_id: str, user_id: str, rating: int, review: str = None) -> bool:
    """Rate template"""
    return await community_ecosystem.rate_template(template_id, user_id, rating, review)


async def get_community_statistics() -> Dict[str, Any]:
    """Get community stats"""
    return await community_ecosystem.get_community_stats()