"""
Presentation Templates Service
Handles automated client presentation generation and demo creation.
"""

import json
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

class PresentationTheme(str, Enum):
    PROFESSIONAL = "professional"
    MODERN = "modern"
    CREATIVE = "creative"
    MINIMALIST = "minimalist"
    CORPORATE = "corporate"
    STARTUP = "startup"

class PresentationType(str, Enum):
    PROJECT_DEMO = "project_demo"
    CLIENT_PITCH = "client_pitch"
    STAKEHOLDER_UPDATE = "stakeholder_update"
    TECHNICAL_REVIEW = "technical_review"
    PRODUCT_SHOWCASE = "product_showcase"

@dataclass
class PresentationSlide:
    id: str
    type: str
    title: str
    content: Dict[str, Any]
    speaker_notes: str
    duration: int  # in seconds
    animations: List[str]
    order: int

@dataclass
class PresentationTemplate:
    id: str
    name: str
    description: str
    type: PresentationType
    theme: PresentationTheme
    slides: List[PresentationSlide]
    total_duration: int
    target_audience: str
    created_at: datetime
    updated_at: datetime

@dataclass
class GeneratedPresentation:
    id: str
    title: str
    project_id: str
    template_id: str
    slides: List[PresentationSlide]
    generated_at: datetime
    presenter_name: str
    client_name: Optional[str]
    presentation_url: str
    pdf_url: str
    video_url: Optional[str]

class PresentationService:
    """Service for generating automated client presentations and demos."""
    
    def __init__(self, db_wrapper=None):
        self.db_wrapper = db_wrapper
        self.templates = {}
        self.presentations = {}
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize the presentation service."""
        try:
            await self._load_default_templates()
            self.is_initialized = True
            print("✅ Presentation Service initialized successfully")
        except Exception as e:
            print(f"⚠️ Presentation Service initialization warning: {e}")
    
    async def generate_presentation(
        self,
        project_id: str,
        project_data: Dict[str, Any],
        presentation_type: PresentationType,
        theme: PresentationTheme = PresentationTheme.PROFESSIONAL,
        presenter_name: str = "AI Tempo Developer",
        client_name: Optional[str] = None,
        custom_requirements: Optional[List[str]] = None
    ) -> GeneratedPresentation:
        """Generate a presentation based on project data."""
        
        presentation_id = str(uuid.uuid4())
        
        # Get appropriate template
        template = await self._get_template_for_type(presentation_type, theme)
        
        # Generate slides based on project data
        generated_slides = await self._generate_slides_from_project(
            template, project_data, custom_requirements
        )
        
        # Create presentation
        presentation = GeneratedPresentation(
            id=presentation_id,
            title=self._generate_presentation_title(project_data, presentation_type),
            project_id=project_id,
            template_id=template.id,
            slides=generated_slides,
            generated_at=datetime.utcnow(),
            presenter_name=presenter_name,
            client_name=client_name,
            presentation_url=f"/presentations/{presentation_id}/view",
            pdf_url=f"/presentations/{presentation_id}/pdf",
            video_url=f"/presentations/{presentation_id}/video" if presentation_type == PresentationType.PRODUCT_SHOWCASE else None
        )
        
        self.presentations[presentation_id] = presentation
        return presentation
    
    async def get_presentation(self, presentation_id: str) -> Optional[GeneratedPresentation]:
        """Get a generated presentation by ID."""
        return self.presentations.get(presentation_id)
    
    async def list_templates(
        self,
        presentation_type: Optional[PresentationType] = None,
        theme: Optional[PresentationTheme] = None
    ) -> List[PresentationTemplate]:
        """List available presentation templates."""
        
        templates = list(self.templates.values())
        
        if presentation_type:
            templates = [t for t in templates if t.type == presentation_type]
        
        if theme:
            templates = [t for t in templates if t.theme == theme]
        
        return templates
    
    async def generate_project_demo(
        self,
        project_data: Dict[str, Any],
        demo_focus: List[str],
        target_audience: str = "technical"
    ) -> GeneratedPresentation:
        """Generate a project demonstration presentation."""
        
        return await self.generate_presentation(
            project_id=project_data.get("id", "demo"),
            project_data=project_data,
            presentation_type=PresentationType.PROJECT_DEMO,
            theme=PresentationTheme.MODERN,
            custom_requirements=demo_focus
        )
    
    async def generate_client_pitch(
        self,
        project_data: Dict[str, Any],
        client_name: str,
        business_value_points: List[str]
    ) -> GeneratedPresentation:
        """Generate a client pitch presentation."""
        
        return await self.generate_presentation(
            project_id=project_data.get("id", "pitch"),
            project_data=project_data,
            presentation_type=PresentationType.CLIENT_PITCH,
            theme=PresentationTheme.PROFESSIONAL,
            client_name=client_name,
            custom_requirements=business_value_points
        )
    
    async def generate_stakeholder_update(
        self,
        project_data: Dict[str, Any],
        progress_metrics: Dict[str, Any],
        next_milestones: List[str]
    ) -> GeneratedPresentation:
        """Generate a stakeholder update presentation."""
        
        enhanced_project_data = {
            **project_data,
            "progress_metrics": progress_metrics,
            "next_milestones": next_milestones
        }
        
        return await self.generate_presentation(
            project_id=project_data.get("id", "update"),
            project_data=enhanced_project_data,
            presentation_type=PresentationType.STAKEHOLDER_UPDATE,
            theme=PresentationTheme.CORPORATE
        )
    
    async def export_presentation_to_pdf(self, presentation_id: str) -> str:
        """Export presentation to PDF format."""
        
        presentation = self.presentations.get(presentation_id)
        if not presentation:
            raise ValueError("Presentation not found")
        
        # In a real implementation, this would generate an actual PDF
        # For now, return a placeholder URL
        return f"/api/presentations/{presentation_id}/download/pdf"
    
    async def create_video_walkthrough(
        self,
        presentation_id: str,
        voiceover_script: Optional[str] = None
    ) -> str:
        """Create an automated video walkthrough of the presentation."""
        
        presentation = self.presentations.get(presentation_id)
        if not presentation:
            raise ValueError("Presentation not found")
        
        # In a real implementation, this would generate an actual video
        # For now, return a placeholder URL
        return f"/api/presentations/{presentation_id}/video"
    
    async def get_presentation_analytics(self, presentation_id: str) -> Dict[str, Any]:
        """Get analytics for a presentation."""
        
        presentation = self.presentations.get(presentation_id)
        if not presentation:
            return {"error": "Presentation not found"}
        
        # Mock analytics data
        return {
            "presentation_id": presentation_id,
            "views": 15,
            "avg_slide_duration": 45,
            "completion_rate": 0.87,
            "feedback_score": 4.3,
            "most_engaging_slide": 3,
            "generated_at": presentation.generated_at.isoformat()
        }
    
    async def _load_default_templates(self):
        """Load default presentation templates."""
        
        templates_data = [
            {
                "name": "Professional Project Demo",
                "description": "Clean, professional template for showcasing project features and capabilities",
                "type": PresentationType.PROJECT_DEMO,
                "theme": PresentationTheme.PROFESSIONAL,
                "target_audience": "Business stakeholders",
                "slides": [
                    {"type": "title", "title": "Project Overview", "duration": 30},
                    {"type": "problem", "title": "Problem Statement", "duration": 45},
                    {"type": "solution", "title": "Our Solution", "duration": 60},
                    {"type": "demo", "title": "Live Demonstration", "duration": 180},
                    {"type": "features", "title": "Key Features", "duration": 90},
                    {"type": "tech_stack", "title": "Technical Architecture", "duration": 60},
                    {"type": "benefits", "title": "Business Value", "duration": 45},
                    {"type": "next_steps", "title": "Next Steps", "duration": 30}
                ]
            },
            {
                "name": "Modern Client Pitch",
                "description": "Engaging template for pitching projects to potential clients",
                "type": PresentationType.CLIENT_PITCH,
                "theme": PresentationTheme.MODERN,
                "target_audience": "Potential clients",
                "slides": [
                    {"type": "welcome", "title": "Welcome", "duration": 20},
                    {"type": "about_us", "title": "About AI Tempo", "duration": 40},
                    {"type": "understanding", "title": "Understanding Your Needs", "duration": 60},
                    {"type": "proposed_solution", "title": "Proposed Solution", "duration": 90},
                    {"type": "project_showcase", "title": "Project Showcase", "duration": 120},
                    {"type": "timeline", "title": "Project Timeline", "duration": 45},
                    {"type": "investment", "title": "Investment & ROI", "duration": 60},
                    {"type": "partnership", "title": "Partnership Benefits", "duration": 45},
                    {"type": "call_to_action", "title": "Let's Get Started", "duration": 30}
                ]
            },
            {
                "name": "Corporate Stakeholder Update",
                "description": "Formal template for regular stakeholder progress updates",
                "type": PresentationType.STAKEHOLDER_UPDATE,
                "theme": PresentationTheme.CORPORATE,
                "target_audience": "Executive stakeholders",
                "slides": [
                    {"type": "executive_summary", "title": "Executive Summary", "duration": 45},
                    {"type": "progress_overview", "title": "Progress Overview", "duration": 60},
                    {"type": "key_achievements", "title": "Key Achievements", "duration": 75},
                    {"type": "metrics", "title": "Success Metrics", "duration": 90},
                    {"type": "challenges", "title": "Challenges & Solutions", "duration": 60},
                    {"type": "upcoming_milestones", "title": "Upcoming Milestones", "duration": 45},
                    {"type": "resource_needs", "title": "Resource Requirements", "duration": 30},
                    {"type": "questions", "title": "Questions & Discussion", "duration": 60}
                ]
            },
            {
                "name": "Technical Review Presentation",
                "description": "Technical template for code reviews and architecture discussions",
                "type": PresentationType.TECHNICAL_REVIEW,
                "theme": PresentationTheme.MINIMALIST,
                "target_audience": "Technical team",
                "slides": [
                    {"type": "overview", "title": "Technical Overview", "duration": 30},
                    {"type": "architecture", "title": "System Architecture", "duration": 90},
                    {"type": "code_structure", "title": "Code Structure", "duration": 60},
                    {"type": "key_components", "title": "Key Components", "duration": 75},
                    {"type": "performance", "title": "Performance Analysis", "duration": 45},
                    {"type": "security", "title": "Security Considerations", "duration": 60},
                    {"type": "testing", "title": "Testing Strategy", "duration": 45},
                    {"type": "deployment", "title": "Deployment Process", "duration": 30},
                    {"type": "maintenance", "title": "Maintenance & Monitoring", "duration": 30}
                ]
            },
            {
                "name": "Creative Product Showcase",
                "description": "Vibrant template for showcasing innovative product features",
                "type": PresentationType.PRODUCT_SHOWCASE,
                "theme": PresentationTheme.CREATIVE,
                "target_audience": "General audience",
                "slides": [
                    {"type": "hero", "title": "Product Introduction", "duration": 40},
                    {"type": "innovation", "title": "What Makes It Special", "duration": 60},
                    {"type": "user_experience", "title": "User Experience", "duration": 90},
                    {"type": "interactive_demo", "title": "Interactive Demo", "duration": 180},
                    {"type": "success_stories", "title": "Success Stories", "duration": 75},
                    {"type": "comparisons", "title": "Competitive Advantages", "duration": 60},
                    {"type": "future_vision", "title": "Future Vision", "duration": 45},
                    {"type": "engagement", "title": "Get Involved", "duration": 30}
                ]
            }
        ]
        
        for template_data in templates_data:
            template_id = str(uuid.uuid4())
            
            # Convert slide data to PresentationSlide objects
            slides = []
            for i, slide_data in enumerate(template_data["slides"]):
                slide = PresentationSlide(
                    id=str(uuid.uuid4()),
                    type=slide_data["type"],
                    title=slide_data["title"],
                    content={"template": True, "type": slide_data["type"]},
                    speaker_notes=f"Speaker notes for {slide_data['title']}",
                    duration=slide_data["duration"],
                    animations=["fadeIn"],
                    order=i
                )
                slides.append(slide)
            
            template = PresentationTemplate(
                id=template_id,
                name=template_data["name"],
                description=template_data["description"],
                type=template_data["type"],
                theme=template_data["theme"],
                slides=slides,
                total_duration=sum(slide.duration for slide in slides),
                target_audience=template_data["target_audience"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.templates[template_id] = template
    
    async def _get_template_for_type(
        self, 
        presentation_type: PresentationType, 
        theme: PresentationTheme
    ) -> PresentationTemplate:
        """Get the best template for a presentation type and theme."""
        
        # Find template matching type and theme
        for template in self.templates.values():
            if template.type == presentation_type and template.theme == theme:
                return template
        
        # Fallback to any template of the right type
        for template in self.templates.values():
            if template.type == presentation_type:
                return template
        
        # Last resort: use any template
        return list(self.templates.values())[0]
    
    async def _generate_slides_from_project(
        self,
        template: PresentationTemplate,
        project_data: Dict[str, Any],
        custom_requirements: Optional[List[str]] = None
    ) -> List[PresentationSlide]:
        """Generate actual slide content based on project data."""
        
        generated_slides = []
        
        for template_slide in template.slides:
            # Generate content based on slide type and project data
            content = await self._generate_slide_content(
                template_slide.type,
                project_data,
                custom_requirements
            )
            
            slide = PresentationSlide(
                id=str(uuid.uuid4()),
                type=template_slide.type,
                title=self._customize_slide_title(template_slide.title, project_data),
                content=content,
                speaker_notes=await self._generate_speaker_notes(
                    template_slide.type, 
                    project_data, 
                    content
                ),
                duration=template_slide.duration,
                animations=template_slide.animations,
                order=template_slide.order
            )
            
            generated_slides.append(slide)
        
        return generated_slides
    
    async def _generate_slide_content(
        self,
        slide_type: str,
        project_data: Dict[str, Any],
        custom_requirements: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Generate specific content for different slide types."""
        
        project_name = project_data.get("name", "AI-Generated Project")
        project_description = project_data.get("description", "Innovative application built with AI Tempo")
        tech_stack = project_data.get("tech_stack", ["React", "FastAPI", "MongoDB"])
        
        if slide_type == "title":
            return {
                "title": project_name,
                "subtitle": "Built with AI Tempo Platform",
                "date": datetime.utcnow().strftime("%B %Y"),
                "logo": "/images/ai-tempo-logo.png"
            }
        
        elif slide_type == "problem":
            return {
                "problem_statement": "Traditional development is slow and complex",
                "pain_points": [
                    "Long development cycles",
                    "Complex tooling setup",
                    "Steep learning curves",
                    "Integration challenges"
                ],
                "impact": "Projects take months instead of days"
            }
        
        elif slide_type == "solution":
            return {
                "solution_overview": project_description,
                "key_benefits": [
                    "AI-powered development",
                    "Natural language interface",
                    "Instant deployment",
                    "Built-in best practices"
                ],
                "unique_value": "Transform ideas into production apps through conversation"
            }
        
        elif slide_type == "demo":
            return {
                "demo_url": f"/projects/{project_data.get('id', 'demo')}/live",
                "demo_features": custom_requirements or [
                    "User authentication",
                    "Core functionality",
                    "Responsive design",
                    "API integration"
                ],
                "demo_duration": "3-5 minutes"
            }
        
        elif slide_type == "features":
            return {
                "features": [
                    {
                        "name": "AI-Powered Development",
                        "description": "Build applications through natural conversation",
                        "icon": "🤖"
                    },
                    {
                        "name": "Multi-Agent Collaboration",
                        "description": "Specialized AI agents for different tasks",
                        "icon": "👥"
                    },
                    {
                        "name": "Instant Deployment",
                        "description": "Deploy to production with a single command",
                        "icon": "🚀"
                    },
                    {
                        "name": "Visual Programming",
                        "description": "Convert diagrams directly to code",
                        "icon": "🎨"
                    }
                ]
            }
        
        elif slide_type == "tech_stack":
            return {
                "architecture": "Modern Full-Stack Architecture",
                "technologies": [
                    {"category": "Frontend", "tech": tech_stack[0] if tech_stack else "React"},
                    {"category": "Backend", "tech": tech_stack[1] if len(tech_stack) > 1 else "FastAPI"},
                    {"category": "Database", "tech": tech_stack[2] if len(tech_stack) > 2 else "MongoDB"},
                    {"category": "AI/ML", "tech": "GPT-4, Claude, Gemini"},
                    {"category": "Deployment", "tech": "Docker, Kubernetes"},
                    {"category": "Monitoring", "tech": "Built-in Analytics"}
                ]
            }
        
        elif slide_type == "benefits":
            return {
                "business_value": [
                    {"metric": "Development Speed", "improvement": "10x faster"},
                    {"metric": "Time to Market", "improvement": "90% reduction"},
                    {"metric": "Developer Productivity", "improvement": "300% increase"},
                    {"metric": "Code Quality", "improvement": "AI-optimized"}
                ],
                "cost_savings": "Reduce development costs by 70%",
                "roi": "Positive ROI within 30 days"
            }
        
        elif slide_type == "next_steps":
            return {
                "immediate_actions": [
                    "Deploy to production environment",
                    "Set up monitoring and analytics",
                    "Prepare user onboarding",
                    "Schedule feedback sessions"
                ],
                "timeline": "Ready to launch in 24 hours",
                "support": "24/7 AI Tempo support included"
            }
        
        # Default fallback content
        return {
            "type": slide_type,
            "content": f"Generated content for {slide_type}",
            "project": project_name
        }
    
    def _customize_slide_title(self, template_title: str, project_data: Dict[str, Any]) -> str:
        """Customize slide titles based on project data."""
        
        project_name = project_data.get("name", "Project")
        
        # Replace generic terms with project-specific ones
        customized = template_title.replace("Project", project_name)
        customized = customized.replace("Our Solution", f"{project_name} Solution")
        customized = customized.replace("Product", project_name)
        
        return customized
    
    async def _generate_speaker_notes(
        self,
        slide_type: str,
        project_data: Dict[str, Any],
        slide_content: Dict[str, Any]
    ) -> str:
        """Generate speaker notes for each slide."""
        
        project_name = project_data.get("name", "the project")
        
        notes_map = {
            "title": f"Welcome everyone to the presentation of {project_name}. This project was built using the AI Tempo platform, demonstrating the power of AI-assisted development.",
            "problem": "Start by establishing the current challenges in traditional development. Make this relatable to the audience's experience.",
            "solution": f"Here's how {project_name} addresses these challenges. Focus on the unique aspects and benefits.",
            "demo": "This is the most important part - show the live application. Be prepared to navigate through key features smoothly.",
            "features": "Highlight the most impressive technical capabilities. Connect each feature to business value.",
            "tech_stack": "For technical audiences, dive deeper into architecture decisions. For business audiences, focus on reliability and scalability.",
            "benefits": "Quantify the value proposition. Use specific metrics and connect to audience priorities.",
            "next_steps": "End with clear, actionable next steps. Make it easy for the audience to move forward."
        }
        
        return notes_map.get(
            slide_type, 
            f"Present the {slide_type} information clearly and engage with the audience for questions."
        )
    
    def _generate_presentation_title(
        self,
        project_data: Dict[str, Any],
        presentation_type: PresentationType
    ) -> str:
        """Generate an appropriate title for the presentation."""
        
        project_name = project_data.get("name", "AI Project")
        
        title_templates = {
            PresentationType.PROJECT_DEMO: f"{project_name} - Live Demonstration",
            PresentationType.CLIENT_PITCH: f"Introducing {project_name} - AI-Powered Solution",
            PresentationType.STAKEHOLDER_UPDATE: f"{project_name} - Progress Update",
            PresentationType.TECHNICAL_REVIEW: f"{project_name} - Technical Deep Dive",
            PresentationType.PRODUCT_SHOWCASE: f"{project_name} - Product Showcase"
        }
        
        return title_templates.get(presentation_type, f"{project_name} Presentation")

# Global service instance
presentation_service = None

def get_presentation_service():
    """Get the global presentation service instance."""
    return presentation_service

def set_presentation_service(service):
    """Set the global presentation service instance."""
    global presentation_service
    presentation_service = service