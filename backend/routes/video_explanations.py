"""
Video Explanations API Routes
Handles AI-powered video generation for code explanations, tutorials, and demos.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from services.video_explanation_service import get_video_explanation_service, VideoExplanationRequest

router = APIRouter()

class CodeWalkthroughRequest(BaseModel):
    code: str = Field(..., description="Code to explain")
    language: str = Field(..., description="Programming language")
    explanation_level: str = Field(default="intermediate", description="beginner, intermediate, or advanced")
    style: str = Field(default="professional", description="Video style")

class FeatureDemoRequest(BaseModel):
    feature_name: str = Field(..., description="Name of the feature")
    feature_description: str = Field(..., description="Description of the feature")
    demo_steps: List[str] = Field(..., description="Steps to demonstrate")
    target_audience: str = Field(default="intermediate", description="Target audience level")

class TutorialRequest(BaseModel):
    tutorial_topic: str = Field(..., description="Tutorial topic")
    learning_objectives: List[str] = Field(..., description="Learning objectives")
    content_outline: List[str] = Field(..., description="Content structure outline")
    difficulty: str = Field(default="beginner", description="Difficulty level")

class ProjectWalkthroughRequest(BaseModel):
    project_name: str = Field(..., description="Project name")
    project_description: str = Field(..., description="Project description")
    key_files: List[str] = Field(..., description="List of key files to explain")
    architecture_overview: str = Field(..., description="Architecture description")

class VideoResponse(BaseModel):
    video_id: str
    title: str
    description: str
    duration: int
    script: str
    captions: List[Dict[str, Any]]
    thumbnail_url: str
    video_url: str
    status: str
    created_at: datetime

@router.post("/code-walkthrough", response_model=VideoResponse)
async def generate_code_walkthrough(request: CodeWalkthroughRequest):
    """Generate a video walkthrough explaining code functionality."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    try:
        result = await service.generate_code_walkthrough(
            code=request.code,
            language=request.language,
            explanation_level=request.explanation_level,
            style=request.style
        )
        
        return VideoResponse(
            video_id=result.video_id,
            title=result.title,
            description=result.description,
            duration=result.duration,
            script=result.script,
            captions=result.captions,
            thumbnail_url=result.thumbnail_url,
            video_url=result.video_url,
            status=result.status,
            created_at=result.created_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate code walkthrough: {str(e)}")

@router.post("/feature-demo", response_model=VideoResponse)
async def generate_feature_demo(request: FeatureDemoRequest):
    """Generate a video demonstration of a platform feature."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    try:
        result = await service.generate_feature_demo(
            feature_name=request.feature_name,
            feature_description=request.feature_description,
            demo_steps=request.demo_steps,
            target_audience=request.target_audience
        )
        
        return VideoResponse(
            video_id=result.video_id,
            title=result.title,
            description=result.description,
            duration=result.duration,
            script=result.script,
            captions=result.captions,
            thumbnail_url=result.thumbnail_url,
            video_url=result.video_url,
            status=result.status,
            created_at=result.created_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate feature demo: {str(e)}")

@router.post("/tutorial", response_model=VideoResponse)
async def generate_tutorial(request: TutorialRequest):
    """Generate an educational tutorial video."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    try:
        result = await service.generate_tutorial(
            tutorial_topic=request.tutorial_topic,
            learning_objectives=request.learning_objectives,
            content_outline=request.content_outline,
            difficulty=request.difficulty
        )
        
        return VideoResponse(
            video_id=result.video_id,
            title=result.title,
            description=result.description,
            duration=result.duration,
            script=result.script,
            captions=result.captions,
            thumbnail_url=result.thumbnail_url,
            video_url=result.video_url,
            status=result.status,
            created_at=result.created_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate tutorial: {str(e)}")

@router.post("/project-walkthrough", response_model=VideoResponse)
async def generate_project_walkthrough(request: ProjectWalkthroughRequest):
    """Generate a comprehensive project walkthrough video."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    try:
        result = await service.generate_project_walkthrough(
            project_name=request.project_name,
            project_description=request.project_description,
            key_files=request.key_files,
            architecture_overview=request.architecture_overview
        )
        
        return VideoResponse(
            video_id=result.video_id,
            title=result.title,
            description=result.description,
            duration=result.duration,
            script=result.script,
            captions=result.captions,
            thumbnail_url=result.thumbnail_url,
            video_url=result.video_url,
            status=result.status,
            created_at=result.created_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate project walkthrough: {str(e)}")

@router.get("/video/{video_id}", response_model=VideoResponse)
async def get_video(video_id: str):
    """Get a specific video by ID."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    video = await service.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return VideoResponse(
        video_id=video.video_id,
        title=video.title,
        description=video.description,
        duration=video.duration,
        script=video.script,
        captions=video.captions,
        thumbnail_url=video.thumbnail_url,
        video_url=video.video_url,
        status=video.status,
        created_at=video.created_at
    )

@router.get("/videos", response_model=List[VideoResponse])
async def list_videos(video_type: Optional[str] = Query(None, description="Filter by video type")):
    """List all generated videos."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    videos = await service.list_videos(video_type)
    
    return [
        VideoResponse(
            video_id=video.video_id,
            title=video.title,
            description=video.description,
            duration=video.duration,
            script=video.script,
            captions=video.captions,
            thumbnail_url=video.thumbnail_url,
            video_url=video.video_url,
            status=video.status,
            created_at=video.created_at
        )
        for video in videos
    ]

@router.get("/video/{video_id}/analytics")
async def get_video_analytics(video_id: str):
    """Get analytics for a specific video."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    analytics = await service.get_video_analytics(video_id)
    return analytics

@router.get("/video/{video_id}/play")
async def play_video(video_id: str):
    """Stream video content (placeholder endpoint)."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    video = await service.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # In a real implementation, this would stream video content
    return {
        "message": "Video streaming would be implemented here",
        "video_id": video_id,
        "duration": video.duration,
        "status": video.status
    }

@router.get("/video/{video_id}/thumbnail")
async def get_video_thumbnail(video_id: str):
    """Get video thumbnail (placeholder endpoint)."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    video = await service.get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # In a real implementation, this would return thumbnail image
    return {
        "message": "Thumbnail generation would be implemented here",
        "video_id": video_id,
        "title": video.title
    }

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported programming languages for code walkthroughs."""
    
    return {
        "languages": [
            "JavaScript", "TypeScript", "Python", "Java", "C#", "Go", 
            "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "C++", 
            "C", "Scala", "Clojure", "Haskell", "R", "Julia", "MATLAB"
        ]
    }

@router.get("/video-styles")
async def get_video_styles():
    """Get list of available video styles."""
    
    return {
        "styles": [
            {
                "id": "professional",
                "name": "Professional",
                "description": "Formal, business-oriented presentation style"
            },
            {
                "id": "casual",
                "name": "Casual",
                "description": "Relaxed, conversational presentation style"
            },
            {
                "id": "educational",
                "name": "Educational",
                "description": "Teaching-focused with detailed explanations"
            },
            {
                "id": "quick",
                "name": "Quick Overview",
                "description": "Fast-paced, highlights key points only"
            }
        ]
    }

@router.get("/bulk-generate")
async def bulk_generate_videos():
    """Generate multiple videos for platform features (admin endpoint)."""
    
    service = get_video_explanation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Video explanation service not available")
    
    # Generate videos for key platform features
    features_to_demo = [
        {
            "name": "Smart Suggestions Panel",
            "description": "AI-powered development suggestions that adapt to your coding patterns",
            "steps": [
                "Open the Smart Suggestions panel in your project",
                "See contextual recommendations appear automatically",
                "Click on a suggestion to apply it instantly",
                "Customize suggestion preferences in settings"
            ]
        },
        {
            "name": "Multi-Agent Collaboration",
            "description": "Work with specialized AI agents for different aspects of development",
            "steps": [
                "Select your preferred agent (Developer, Designer, Tester)",
                "Ask questions specific to their expertise area",
                "Switch between agents seamlessly during conversation",
                "See how different agents collaborate on complex tasks"
            ]
        },
        {
            "name": "Visual Programming",
            "description": "Convert diagrams and sketches directly into working code",
            "steps": [
                "Access the Visual Programming feature",
                "Upload a diagram or sketch your idea",
                "Choose the target framework and style",
                "Generate code automatically from your visual design"
            ]
        }
    ]
    
    generated_videos = []
    
    for feature in features_to_demo:
        try:
            result = await service.generate_feature_demo(
                feature_name=feature["name"],
                feature_description=feature["description"],
                demo_steps=feature["steps"],
                target_audience="intermediate"
            )
            generated_videos.append(result.video_id)
        except Exception as e:
            print(f"Failed to generate video for {feature['name']}: {e}")
    
    return {
        "generated_videos": generated_videos,
        "total_count": len(generated_videos),
        "message": f"Successfully generated {len(generated_videos)} demo videos"
    }