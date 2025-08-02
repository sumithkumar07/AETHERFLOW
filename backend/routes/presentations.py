"""
Presentations API Routes
Handles automated client presentation generation and demo creation.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

from services.presentation_service import (
    get_presentation_service,
    PresentationType,
    PresentationTheme
)

router = APIRouter()

class GeneratePresentationRequest(BaseModel):
    project_id: str = Field(..., description="Project ID")
    project_data: Dict[str, Any] = Field(..., description="Project information")
    presentation_type: PresentationType = Field(..., description="Type of presentation")
    theme: PresentationTheme = Field(default=PresentationTheme.PROFESSIONAL, description="Presentation theme")
    presenter_name: str = Field(default="AI Tempo Developer", description="Presenter name")
    client_name: Optional[str] = Field(None, description="Client name")
    custom_requirements: Optional[List[str]] = Field(None, description="Custom requirements")

class ProjectDemoRequest(BaseModel):
    project_data: Dict[str, Any] = Field(..., description="Project information")
    demo_focus: List[str] = Field(..., description="Areas to focus on in demo")
    target_audience: str = Field(default="technical", description="Target audience")

class ClientPitchRequest(BaseModel):
    project_data: Dict[str, Any] = Field(..., description="Project information")
    client_name: str = Field(..., description="Client name")
    business_value_points: List[str] = Field(..., description="Key business value points")

class StakeholderUpdateRequest(BaseModel):
    project_data: Dict[str, Any] = Field(..., description="Project information")
    progress_metrics: Dict[str, Any] = Field(..., description="Progress metrics")
    next_milestones: List[str] = Field(..., description="Upcoming milestones")

class PresentationResponse(BaseModel):
    id: str
    title: str
    project_id: str
    template_id: str
    generated_at: datetime
    presenter_name: str
    client_name: Optional[str]
    presentation_url: str
    pdf_url: str
    video_url: Optional[str]
    total_slides: int
    estimated_duration: int

class SlideResponse(BaseModel):
    id: str
    type: str
    title: str
    content: Dict[str, Any]
    speaker_notes: str
    duration: int
    order: int

class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    type: str
    theme: str
    total_duration: int
    target_audience: str
    slide_count: int

@router.post("/generate", response_model=PresentationResponse)
async def generate_presentation(request: GeneratePresentationRequest):
    """Generate a presentation based on project data."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    try:
        presentation = await service.generate_presentation(
            project_id=request.project_id,
            project_data=request.project_data,
            presentation_type=request.presentation_type,
            theme=request.theme,
            presenter_name=request.presenter_name,
            client_name=request.client_name,
            custom_requirements=request.custom_requirements
        )
        
        return PresentationResponse(
            id=presentation.id,
            title=presentation.title,
            project_id=presentation.project_id,
            template_id=presentation.template_id,
            generated_at=presentation.generated_at,
            presenter_name=presentation.presenter_name,
            client_name=presentation.client_name,
            presentation_url=presentation.presentation_url,
            pdf_url=presentation.pdf_url,
            video_url=presentation.video_url,
            total_slides=len(presentation.slides),
            estimated_duration=sum(slide.duration for slide in presentation.slides)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate presentation: {str(e)}")

@router.post("/project-demo", response_model=PresentationResponse)
async def generate_project_demo(request: ProjectDemoRequest):
    """Generate a project demonstration presentation."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    try:
        presentation = await service.generate_project_demo(
            project_data=request.project_data,
            demo_focus=request.demo_focus,
            target_audience=request.target_audience
        )
        
        return PresentationResponse(
            id=presentation.id,
            title=presentation.title,
            project_id=presentation.project_id,
            template_id=presentation.template_id,
            generated_at=presentation.generated_at,
            presenter_name=presentation.presenter_name,
            client_name=presentation.client_name,
            presentation_url=presentation.presentation_url,
            pdf_url=presentation.pdf_url,
            video_url=presentation.video_url,
            total_slides=len(presentation.slides),
            estimated_duration=sum(slide.duration for slide in presentation.slides)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate project demo: {str(e)}")

@router.post("/client-pitch", response_model=PresentationResponse)
async def generate_client_pitch(request: ClientPitchRequest):
    """Generate a client pitch presentation."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    try:
        presentation = await service.generate_client_pitch(
            project_data=request.project_data,
            client_name=request.client_name,
            business_value_points=request.business_value_points
        )
        
        return PresentationResponse(
            id=presentation.id,
            title=presentation.title,
            project_id=presentation.project_id,
            template_id=presentation.template_id,
            generated_at=presentation.generated_at,
            presenter_name=presentation.presenter_name,
            client_name=presentation.client_name,
            presentation_url=presentation.presentation_url,
            pdf_url=presentation.pdf_url,
            video_url=presentation.video_url,
            total_slides=len(presentation.slides),
            estimated_duration=sum(slide.duration for slide in presentation.slides)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate client pitch: {str(e)}")

@router.post("/stakeholder-update", response_model=PresentationResponse)
async def generate_stakeholder_update(request: StakeholderUpdateRequest):
    """Generate a stakeholder update presentation."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    try:
        presentation = await service.generate_stakeholder_update(
            project_data=request.project_data,
            progress_metrics=request.progress_metrics,
            next_milestones=request.next_milestones
        )
        
        return PresentationResponse(
            id=presentation.id,
            title=presentation.title,
            project_id=presentation.project_id,
            template_id=presentation.template_id,
            generated_at=presentation.generated_at,
            presenter_name=presentation.presenter_name,
            client_name=presentation.client_name,
            presentation_url=presentation.presentation_url,
            pdf_url=presentation.pdf_url,
            video_url=presentation.video_url,
            total_slides=len(presentation.slides),
            estimated_duration=sum(slide.duration for slide in presentation.slides)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate stakeholder update: {str(e)}")

@router.get("/presentations/{presentation_id}", response_model=PresentationResponse)
async def get_presentation(presentation_id: str):
    """Get a specific presentation."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    presentation = await service.get_presentation(presentation_id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")
    
    return PresentationResponse(
        id=presentation.id,
        title=presentation.title,
        project_id=presentation.project_id,
        template_id=presentation.template_id,
        generated_at=presentation.generated_at,
        presenter_name=presentation.presenter_name,
        client_name=presentation.client_name,
        presentation_url=presentation.presentation_url,
        pdf_url=presentation.pdf_url,
        video_url=presentation.video_url,
        total_slides=len(presentation.slides),
        estimated_duration=sum(slide.duration for slide in presentation.slides)
    )

@router.get("/presentations/{presentation_id}/slides", response_model=List[SlideResponse])
async def get_presentation_slides(presentation_id: str):
    """Get slides for a presentation."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    presentation = await service.get_presentation(presentation_id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")
    
    return [
        SlideResponse(
            id=slide.id,
            type=slide.type,
            title=slide.title,
            content=slide.content,
            speaker_notes=slide.speaker_notes,
            duration=slide.duration,
            order=slide.order
        )
        for slide in presentation.slides
    ]

@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates(
    presentation_type: Optional[PresentationType] = Query(None, description="Filter by type"),
    theme: Optional[PresentationTheme] = Query(None, description="Filter by theme")
):
    """List available presentation templates."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    templates = await service.list_templates(presentation_type, theme)
    
    return [
        TemplateResponse(
            id=template.id,
            name=template.name,
            description=template.description,
            type=template.type.value,
            theme=template.theme.value,
            total_duration=template.total_duration,
            target_audience=template.target_audience,
            slide_count=len(template.slides)
        )
        for template in templates
    ]

@router.post("/presentations/{presentation_id}/export/pdf")
async def export_to_pdf(presentation_id: str):
    """Export presentation to PDF."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    try:
        pdf_url = await service.export_presentation_to_pdf(presentation_id)
        
        return {
            "presentation_id": presentation_id,
            "pdf_url": pdf_url,
            "message": "PDF export initiated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export PDF: {str(e)}")

@router.post("/presentations/{presentation_id}/create-video")
async def create_video_walkthrough(
    presentation_id: str,
    voiceover_script: Optional[str] = Query(None, description="Custom voiceover script")
):
    """Create an automated video walkthrough."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    try:
        video_url = await service.create_video_walkthrough(presentation_id, voiceover_script)
        
        return {
            "presentation_id": presentation_id,
            "video_url": video_url,
            "message": "Video walkthrough creation initiated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create video: {str(e)}")

@router.get("/presentations/{presentation_id}/analytics")
async def get_presentation_analytics(presentation_id: str):
    """Get analytics for a presentation."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    analytics = await service.get_presentation_analytics(presentation_id)
    return analytics

@router.get("/presentation-types")
async def get_presentation_types():
    """Get available presentation types."""
    
    return {
        "types": [
            {
                "id": ptype.value,
                "name": ptype.value.replace("_", " ").title(),
                "description": f"Presentation optimized for {ptype.value.replace('_', ' ')}"
            }
            for ptype in PresentationType
        ]
    }

@router.get("/themes")
async def get_presentation_themes():
    """Get available presentation themes."""
    
    return {
        "themes": [
            {
                "id": theme.value,
                "name": theme.value.title(),
                "description": f"{theme.value.title()} presentation styling"
            }
            for theme in PresentationTheme
        ]
    }

@router.post("/bulk-generate-demos")
async def bulk_generate_demo_presentations():
    """Generate demo presentations for showcase (admin endpoint)."""
    
    service = get_presentation_service()
    if not service:
        raise HTTPException(status_code=503, detail="Presentation service not available")
    
    # Sample projects for demo presentations
    demo_projects = [
        {
            "id": "ecommerce-demo",
            "name": "E-Commerce Platform",
            "description": "Modern e-commerce solution with AI-powered recommendations",
            "tech_stack": ["React", "Node.js", "PostgreSQL"]
        },
        {
            "id": "healthcare-app",
            "name": "HealthCare Manager",
            "description": "Patient management system with telemedicine capabilities",
            "tech_stack": ["Vue.js", "Python", "MongoDB"]
        },
        {
            "id": "fintech-solution",
            "name": "FinTech Dashboard",
            "description": "Financial analytics platform with real-time data visualization",
            "tech_stack": ["Angular", "Java", "MySQL"]
        }
    ]
    
    generated_presentations = []
    
    for project_data in demo_projects:
        try:
            # Generate project demo
            demo_presentation = await service.generate_project_demo(
                project_data=project_data,
                demo_focus=["Core Features", "User Experience", "Technical Architecture"],
                target_audience="mixed"
            )
            
            # Generate client pitch
            pitch_presentation = await service.generate_client_pitch(
                project_data=project_data,
                client_name="Prospective Client",
                business_value_points=["ROI", "Scalability", "User Engagement"]
            )
            
            generated_presentations.extend([demo_presentation.id, pitch_presentation.id])
            
        except Exception as e:
            print(f"Failed to generate presentations for {project_data['name']}: {e}")
    
    return {
        "generated_presentations": generated_presentations,
        "total_count": len(generated_presentations),
        "message": f"Successfully generated {len(generated_presentations)} demo presentations"
    }