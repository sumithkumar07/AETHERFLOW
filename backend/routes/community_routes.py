"""
Community & Discovery API Routes
Provides endpoints for public projects, sharing, collaboration, and community features
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import uuid
import random
from enum import Enum

router = APIRouter()

# Enums
class ProjectVisibility(str, Enum):
    public = "public"
    private = "private"
    unlisted = "unlisted"

class ContentType(str, Enum):
    project = "project"
    snippet = "snippet"
    tutorial = "tutorial"
    showcase = "showcase"

class ReactionType(str, Enum):
    like = "like"
    love = "love"
    fire = "fire"
    clap = "clap"

# Pydantic models
class User(BaseModel):
    id: str
    username: str
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    github_username: Optional[str] = None
    followers_count: int = 0
    following_count: int = 0
    projects_count: int = 0
    joined_date: datetime

class PublicProject(BaseModel):
    id: str
    title: str
    description: str
    content_type: ContentType
    visibility: ProjectVisibility
    author: User
    preview_url: Optional[str] = None
    repository_url: Optional[str] = None
    thumbnail: Optional[str] = None
    tags: List[str] = Field(default=[])
    technologies: List[str] = Field(default=[])
    created_at: datetime
    updated_at: datetime
    views_count: int = 0
    likes_count: int = 0
    forks_count: int = 0
    comments_count: int = 0
    featured: bool = False
    difficulty_level: str = "intermediate"

class Comment(BaseModel):
    id: str
    author: User
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    likes_count: int = 0
    replies_count: int = 0
    parent_id: Optional[str] = None

class Reaction(BaseModel):
    id: str
    type: ReactionType
    user: User
    created_at: datetime

class FeaturedContent(BaseModel):
    id: str
    title: str
    description: str
    content_type: ContentType
    thumbnail: str
    author: User
    metrics: Dict[str, int]
    featured_until: datetime

class CreateProjectRequest(BaseModel):
    title: str
    description: str
    content_type: ContentType = ContentType.project
    tags: List[str] = []
    technologies: List[str] = []
    visibility: ProjectVisibility = ProjectVisibility.public

class UpdateProjectRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    visibility: Optional[ProjectVisibility] = None

def generate_mock_users() -> List[User]:
    """Generate mock user data"""
    users = []
    usernames = [
        "codecraftsman", "pixelpioneer", "devdynamo", "syntaxsage", "bytebender",
        "algorithmartist", "stackstorm", "codingcomposer", "digitaldreamer", "hackerheart"
    ]
    
    for i, username in enumerate(usernames):
        user = User(
            id=f"user_{i+1}",
            username=username,
            display_name=username.title().replace("", " "),
            bio=f"Passionate developer building amazing things with code. Love {random.choice(['React', 'Python', 'Vue.js', 'Node.js'])}!",
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            location=random.choice(["San Francisco, CA", "New York, NY", "London, UK", "Berlin, Germany", "Tokyo, Japan"]),
            website=f"https://{username}.dev",
            github_username=username,
            followers_count=random.randint(50, 5000),
            following_count=random.randint(20, 500),
            projects_count=random.randint(5, 50),
            joined_date=datetime.now() - timedelta(days=random.randint(30, 365))
        )
        users.append(user)
    
    return users

def generate_mock_projects() -> List[PublicProject]:
    """Generate mock public project data"""
    users = generate_mock_users()
    projects = []
    
    project_ideas = [
        {
            "title": "AI-Powered Task Manager",
            "description": "Smart productivity app that uses machine learning to prioritize your tasks and optimize your workflow",
            "tags": ["ai", "productivity", "machine-learning"],
            "technologies": ["React", "Python", "TensorFlow", "FastAPI"],
            "content_type": ContentType.project
        },
        {
            "title": "Cryptocurrency Portfolio Tracker", 
            "description": "Real-time crypto portfolio tracking with advanced analytics and profit/loss calculations",
            "tags": ["crypto", "finance", "tracking"],
            "technologies": ["Vue.js", "Node.js", "MongoDB", "WebSockets"],
            "content_type": ContentType.project
        },
        {
            "title": "Social Media Dashboard",
            "description": "Unified dashboard for managing multiple social media accounts with scheduling and analytics",
            "tags": ["social-media", "dashboard", "analytics"],
            "technologies": ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
            "content_type": ContentType.project
        },
        {
            "title": "Custom CSS Animation Library",
            "description": "Lightweight CSS animation library with 50+ beautiful, customizable animations",
            "tags": ["css", "animations", "library"],
            "technologies": ["CSS", "SCSS", "JavaScript", "Webpack"],
            "content_type": ContentType.snippet
        },
        {
            "title": "E-commerce Platform",
            "description": "Full-featured e-commerce solution with payment processing, inventory management, and admin dashboard",
            "tags": ["ecommerce", "full-stack", "payment"],
            "technologies": ["React", "Django", "Stripe", "Redis"],
            "content_type": ContentType.project
        },
        {
            "title": "Weather Forecast Widget",
            "description": "Beautiful, responsive weather widget with location detection and 7-day forecast",
            "tags": ["weather", "widget", "responsive"],
            "technologies": ["Vanilla JS", "CSS Grid", "Weather API"],
            "content_type": ContentType.showcase
        },
        {
            "title": "Learn React Hooks",
            "description": "Complete tutorial series covering all React hooks with practical examples and best practices",
            "tags": ["react", "hooks", "tutorial", "learning"],
            "technologies": ["React", "JavaScript", "CodeSandbox"],
            "content_type": ContentType.tutorial
        },
        {
            "title": "Mobile-First Design System",
            "description": "Comprehensive design system built for mobile-first responsive web applications",
            "tags": ["design-system", "mobile-first", "ui-ux"],
            "technologies": ["Figma", "React", "Storybook", "Tailwind CSS"],
            "content_type": ContentType.showcase
        }
    ]
    
    for i, idea in enumerate(project_ideas):
        project = PublicProject(
            id=f"proj_pub_{i+1}",
            title=idea["title"],
            description=idea["description"],
            content_type=idea["content_type"],
            visibility=ProjectVisibility.public,
            author=random.choice(users),
            preview_url=f"https://preview-{i+1}.aetherflow.dev" if idea["content_type"] != ContentType.tutorial else None,
            repository_url=f"https://github.com/{random.choice(users).username}/{idea['title'].lower().replace(' ', '-')}",
            thumbnail=f"https://images.unsplash.com/photo-{1500000000000 + i}?w=400&h=250&fit=crop",
            tags=idea["tags"],
            technologies=idea["technologies"],
            created_at=datetime.now() - timedelta(days=random.randint(1, 180)),
            updated_at=datetime.now() - timedelta(days=random.randint(0, 30)),
            views_count=random.randint(100, 10000),
            likes_count=random.randint(10, 500),
            forks_count=random.randint(2, 50),
            comments_count=random.randint(5, 100),
            featured=i < 3,  # First 3 projects are featured
            difficulty_level=random.choice(["beginner", "intermediate", "advanced"])
        )
        projects.append(project)
    
    return projects

@router.get("/community/discover", response_model=List[PublicProject])
async def discover_projects(
    content_type: Optional[ContentType] = None,
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    technologies: Optional[str] = Query(None, description="Comma-separated technologies"),
    difficulty: Optional[str] = None,
    sort_by: str = Query(default="trending", regex="^(trending|popular|recent|views)$"),
    featured_only: bool = False,
    limit: int = Query(default=20, le=50)
):
    """Discover public projects and content from the community"""
    try:
        projects = generate_mock_projects()
        
        # Apply filters
        if content_type:
            projects = [p for p in projects if p.content_type == content_type]
        
        if tags:
            tag_list = [tag.strip().lower() for tag in tags.split(",")]
            projects = [p for p in projects if any(tag in [t.lower() for t in p.tags] for tag in tag_list)]
        
        if technologies:
            tech_list = [tech.strip().lower() for tech in technologies.split(",")]
            projects = [p for p in projects if any(tech in [t.lower() for t in p.technologies] for tech in tech_list)]
        
        if difficulty:
            projects = [p for p in projects if p.difficulty_level == difficulty]
        
        if featured_only:
            projects = [p for p in projects if p.featured]
        
        # Apply sorting
        if sort_by == "trending":
            # Trending = recent activity + engagement
            projects.sort(key=lambda x: x.likes_count * 0.5 + x.views_count * 0.3 + x.comments_count * 0.2, reverse=True)
        elif sort_by == "popular":
            projects.sort(key=lambda x: x.likes_count, reverse=True)
        elif sort_by == "recent":
            projects.sort(key=lambda x: x.created_at, reverse=True)
        elif sort_by == "views":
            projects.sort(key=lambda x: x.views_count, reverse=True)
        
        return projects[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error discovering projects: {str(e)}")

@router.get("/community/featured", response_model=List[FeaturedContent])
async def get_featured_content():
    """Get featured community content"""
    try:
        projects = generate_mock_projects()
        featured_projects = [p for p in projects if p.featured]
        
        featured_content = []
        for project in featured_projects:
            content = FeaturedContent(
                id=project.id,
                title=project.title,
                description=project.description,
                content_type=project.content_type,
                thumbnail=project.thumbnail or f"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
                author=project.author,
                metrics={
                    "views": project.views_count,
                    "likes": project.likes_count,
                    "forks": project.forks_count,
                    "comments": project.comments_count
                },
                featured_until=datetime.now() + timedelta(days=7)
            )
            featured_content.append(content)
        
        return featured_content
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching featured content: {str(e)}")

@router.get("/community/projects/{project_id}", response_model=PublicProject)
async def get_public_project(project_id: str):
    """Get detailed information about a public project"""
    try:
        projects = generate_mock_projects()
        project = next((p for p in projects if p.id == project_id), None)
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Increment view count (in production, this would be persisted)
        project.views_count += 1
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project: {str(e)}")

@router.get("/community/projects/{project_id}/comments", response_model=List[Comment])
async def get_project_comments(
    project_id: str,
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0)
):
    """Get comments for a specific project"""
    try:
        users = generate_mock_users()
        
        # Generate mock comments
        comments = []
        for i in range(min(10, limit)):
            comment = Comment(
                id=f"comment_{i+1}",
                author=random.choice(users),
                content=random.choice([
                    "This is an amazing project! Really well implemented.",
                    "Great work on the UI/UX design. Very intuitive.",
                    "Could you add a feature for dark mode?",
                    "The code quality is excellent. Thanks for sharing!",
                    "This solved exactly what I was looking for. Thank you!",
                    "Would love to see this integrated with more APIs.",
                    "The documentation is very clear and helpful.",
                    "Impressive work! How long did this take to build?"
                ]),
                created_at=datetime.now() - timedelta(days=random.randint(0, 30)),
                likes_count=random.randint(0, 25),
                replies_count=random.randint(0, 5)
            )
            comments.append(comment)
        
        # Sort by creation date
        comments.sort(key=lambda x: x.created_at, reverse=True)
        
        return comments[offset:offset + limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching comments: {str(e)}")

@router.post("/community/projects/{project_id}/comments")
async def create_comment(project_id: str, content: str):
    """Create a new comment on a project"""
    try:
        if not content.strip():
            raise HTTPException(status_code=400, detail="Comment content cannot be empty")
        
        comment_id = f"comment_{str(uuid.uuid4())[:8]}"
        
        # In production, this would create a real comment
        return {
            "success": True,
            "message": "Comment created successfully",
            "comment_id": comment_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating comment: {str(e)}")

@router.post("/community/projects/{project_id}/like")
async def like_project(project_id: str):
    """Like/unlike a project"""
    try:
        projects = generate_mock_projects()
        project = next((p for p in projects if p.id == project_id), None)
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Toggle like (in production, this would check user's existing likes)
        project.likes_count += 1
        
        return {
            "success": True,
            "message": "Project liked successfully",
            "likes_count": project.likes_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error liking project: {str(e)}")

@router.post("/community/projects/{project_id}/fork")
async def fork_project(project_id: str):
    """Fork a public project to your account"""
    try:
        projects = generate_mock_projects()
        project = next((p for p in projects if p.id == project_id), None)
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create fork (in production, this would create actual project copy)
        fork_id = f"fork_{str(uuid.uuid4())[:8]}"
        project.forks_count += 1
        
        return {
            "success": True,
            "message": f"Project forked successfully",
            "fork_id": fork_id,
            "original_project": project_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error forking project: {str(e)}")

@router.get("/community/users/{username}", response_model=User)
async def get_user_profile(username: str):
    """Get public user profile"""
    try:
        users = generate_mock_users()
        user = next((u for u in users if u.username == username), None)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user profile: {str(e)}")

@router.get("/community/users/{username}/projects", response_model=List[PublicProject])
async def get_user_projects(
    username: str,
    limit: int = Query(default=20, le=50)
):
    """Get public projects by a specific user"""
    try:
        projects = generate_mock_projects()
        user_projects = [p for p in projects if p.author.username == username]
        
        # Sort by creation date
        user_projects.sort(key=lambda x: x.created_at, reverse=True)
        
        return user_projects[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user projects: {str(e)}")

@router.get("/community/trending/tags")
async def get_trending_tags():
    """Get trending tags in the community"""
    try:
        projects = generate_mock_projects()
        
        # Count tag usage
        tag_counts = {}
        for project in projects:
            for tag in project.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by popularity
        trending_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "trending_tags": [
                {"tag": tag, "count": count, "growth": f"+{random.randint(5, 50)}%"}
                for tag, count in trending_tags[:20]
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending tags: {str(e)}")

@router.get("/community/stats")
async def get_community_stats():
    """Get overall community statistics"""
    try:
        users = generate_mock_users()
        projects = generate_mock_projects()
        
        total_users = len(users)
        total_projects = len(projects)
        total_views = sum(p.views_count for p in projects)
        total_likes = sum(p.likes_count for p in projects)
        
        # Calculate growth (mock data)
        growth_stats = {
            "users_growth": "+15%",
            "projects_growth": "+28%",
            "engagement_growth": "+42%"
        }
        
        top_creators = sorted(users, key=lambda x: x.followers_count, reverse=True)[:5]
        
        popular_technologies = {}
        for project in projects:
            for tech in project.technologies:
                popular_technologies[tech] = popular_technologies.get(tech, 0) + 1
        
        top_technologies = sorted(popular_technologies.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "total_users": total_users,
            "total_projects": total_projects,
            "total_views": total_views,
            "total_likes": total_likes,
            "growth_stats": growth_stats,
            "top_creators": top_creators,
            "popular_technologies": [{"name": tech, "usage": count} for tech, count in top_technologies],
            "content_distribution": {
                "projects": len([p for p in projects if p.content_type == ContentType.project]),
                "snippets": len([p for p in projects if p.content_type == ContentType.snippet]),
                "tutorials": len([p for p in projects if p.content_type == ContentType.tutorial]),
                "showcases": len([p for p in projects if p.content_type == ContentType.showcase])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching community stats: {str(e)}")