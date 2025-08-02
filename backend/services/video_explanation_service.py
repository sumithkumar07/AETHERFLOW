"""
AI-Powered Video Explanation Service
Generates video walkthroughs and explanations of code, features, and development processes.
"""

import asyncio
import json
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
import tempfile
import os
from dataclasses import dataclass

@dataclass
class VideoExplanationRequest:
    content: str
    type: str  # 'code', 'feature', 'tutorial', 'walkthrough'
    target_audience: str  # 'beginner', 'intermediate', 'advanced'
    duration: int  # seconds
    style: str  # 'professional', 'casual', 'educational'
    include_visuals: bool = True
    include_captions: bool = True

@dataclass
class VideoExplanationResult:
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

class VideoExplanationService:
    """Service for generating AI-powered video explanations and tutorials."""
    
    def __init__(self, db_wrapper=None):
        self.db_wrapper = db_wrapper
        self.video_cache = {}
        self.generation_queue = asyncio.Queue()
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize the video explanation service."""
        try:
            # Initialize video generation capabilities
            self.is_initialized = True
            print("✅ Video Explanation Service initialized successfully")
        except Exception as e:
            print(f"⚠️ Video Explanation Service initialization warning: {e}")
    
    async def generate_code_walkthrough(
        self, 
        code: str, 
        language: str,
        explanation_level: str = 'intermediate',
        style: str = 'professional'
    ) -> VideoExplanationResult:
        """Generate a video walkthrough explaining code functionality."""
        
        request = VideoExplanationRequest(
            content=code,
            type='code',
            target_audience=explanation_level,
            duration=180,  # 3 minutes default
            style=style,
            include_visuals=True,
            include_captions=True
        )
        
        return await self._generate_video_explanation(request, {
            'language': language,
            'code_complexity': self._analyze_code_complexity(code),
            'key_concepts': self._extract_key_concepts(code, language)
        })
    
    async def generate_feature_demo(
        self,
        feature_name: str,
        feature_description: str,
        demo_steps: List[str],
        target_audience: str = 'intermediate'
    ) -> VideoExplanationResult:
        """Generate a video demonstration of a platform feature."""
        
        request = VideoExplanationRequest(
            content=f"Feature: {feature_name}\n\nDescription: {feature_description}\n\nSteps:\n" + 
                   "\n".join([f"{i+1}. {step}" for i, step in enumerate(demo_steps)]),
            type='feature',
            target_audience=target_audience,
            duration=240,  # 4 minutes default
            style='professional',
            include_visuals=True,
            include_captions=True
        )
        
        return await self._generate_video_explanation(request, {
            'feature_type': 'platform_feature',
            'demo_steps': demo_steps,
            'interactive_elements': True
        })
    
    async def generate_tutorial(
        self,
        tutorial_topic: str,
        learning_objectives: List[str],
        content_outline: List[str],
        difficulty: str = 'beginner'
    ) -> VideoExplanationResult:
        """Generate an educational tutorial video."""
        
        request = VideoExplanationRequest(
            content=f"Tutorial: {tutorial_topic}\n\nObjectives:\n" + 
                   "\n".join([f"- {obj}" for obj in learning_objectives]) +
                   f"\n\nOutline:\n" + "\n".join([f"{i+1}. {item}" for i, item in enumerate(content_outline)]),
            type='tutorial',
            target_audience=difficulty,
            duration=300,  # 5 minutes default
            style='educational',
            include_visuals=True,
            include_captions=True
        )
        
        return await self._generate_video_explanation(request, {
            'learning_objectives': learning_objectives,
            'content_structure': content_outline,
            'educational_approach': True
        })
    
    async def generate_project_walkthrough(
        self,
        project_name: str,
        project_description: str,
        key_files: List[str],
        architecture_overview: str
    ) -> VideoExplanationResult:
        """Generate a comprehensive project walkthrough video."""
        
        request = VideoExplanationRequest(
            content=f"Project: {project_name}\n\n{project_description}\n\nArchitecture:\n{architecture_overview}\n\nKey Files:\n" + 
                   "\n".join([f"- {file}" for file in key_files]),
            type='walkthrough',
            target_audience='intermediate',
            duration=420,  # 7 minutes default
            style='professional',
            include_visuals=True,
            include_captions=True
        )
        
        return await self._generate_video_explanation(request, {
            'project_type': 'full_project',
            'key_files': key_files,
            'architecture_focus': True
        })
    
    async def _generate_video_explanation(
        self, 
        request: VideoExplanationRequest, 
        context: Dict[str, Any]
    ) -> VideoExplanationResult:
        """Core video generation logic."""
        
        video_id = str(uuid.uuid4())
        
        try:
            # Generate script based on content type
            script = await self._generate_script(request, context)
            
            # Generate captions and timing
            captions = await self._generate_captions(script, request.duration)
            
            # Create video metadata
            title = self._generate_title(request, context)
            description = self._generate_description(request, context)
            
            # In a real implementation, this would generate actual video content
            # For now, we'll create a comprehensive structure
            
            video_result = VideoExplanationResult(
                video_id=video_id,
                title=title,
                description=description,
                duration=request.duration,
                script=script,
                captions=captions,
                thumbnail_url=f"/api/videos/{video_id}/thumbnail",
                video_url=f"/api/videos/{video_id}/play",
                status="ready",
                created_at=datetime.utcnow()
            )
            
            # Cache the result
            self.video_cache[video_id] = video_result
            
            return video_result
            
        except Exception as e:
            # Return error result
            return VideoExplanationResult(
                video_id=video_id,
                title=f"Error: {request.type.title()} Explanation",
                description=f"Failed to generate video explanation: {str(e)}",
                duration=0,
                script="",
                captions=[],
                thumbnail_url="",
                video_url="",
                status="error",
                created_at=datetime.utcnow()
            )
    
    async def _generate_script(self, request: VideoExplanationRequest, context: Dict[str, Any]) -> str:
        """Generate video script based on content and context."""
        
        if request.type == 'code':
            return await self._generate_code_script(request, context)
        elif request.type == 'feature':
            return await self._generate_feature_script(request, context)
        elif request.type == 'tutorial':
            return await self._generate_tutorial_script(request, context)
        elif request.type == 'walkthrough':
            return await self._generate_walkthrough_script(request, context)
        
        return "Generic video script placeholder"
    
    async def _generate_code_script(self, request: VideoExplanationRequest, context: Dict[str, Any]) -> str:
        """Generate script for code explanation videos."""
        
        language = context.get('language', 'JavaScript')
        complexity = context.get('code_complexity', 'intermediate')
        key_concepts = context.get('key_concepts', [])
        
        script = f"""
[INTRO - 0:00]
Welcome! Today we're diving into this {language} code to understand exactly how it works and what makes it tick.

[OVERVIEW - 0:10]
Let me start by giving you a high-level overview of what this code does...

[LINE BY LINE - 0:30]
Now let's walk through this code step by step:

{self._format_code_explanation(request.content, language)}

[KEY CONCEPTS - {int(request.duration * 0.6)}s]
The important concepts to understand here are:
{chr(10).join([f"- {concept}" for concept in key_concepts])}

[PRACTICAL APPLICATION - {int(request.duration * 0.8)}s]
Here's how you might use this in a real project...

[WRAP UP - {request.duration - 15}s]
And that's how this {language} code works! The key takeaways are the patterns we discussed and how they solve the specific problem at hand.
"""
        return script.strip()
    
    async def _generate_feature_script(self, request: VideoExplanationRequest, context: Dict[str, Any]) -> str:
        """Generate script for feature demonstration videos."""
        
        demo_steps = context.get('demo_steps', [])
        
        script = f"""
[INTRO - 0:00]
In this demo, I'll show you how to use this powerful feature in the AI Tempo platform.

[FEATURE OVERVIEW - 0:15]
{request.content.split('Description: ')[1].split('Steps:')[0].strip()}

[STEP-BY-STEP DEMONSTRATION - 0:45]
Let me walk you through each step:

{chr(10).join([f"[Step {i+1} - {30 + i*30}s] {step}" for i, step in enumerate(demo_steps)])}

[TIPS AND TRICKS - {int(request.duration * 0.85)}s]
Here are some pro tips to get the most out of this feature...

[CONCLUSION - {request.duration - 10}s]
That's how you master this feature! Try it out in your own projects.
"""
        return script.strip()
    
    async def _generate_tutorial_script(self, request: VideoExplanationRequest, context: Dict[str, Any]) -> str:
        """Generate script for educational tutorials."""
        
        objectives = context.get('learning_objectives', [])
        structure = context.get('content_structure', [])
        
        script = f"""
[WELCOME - 0:00]
Welcome to this tutorial! By the end of this video, you'll understand everything you need to know about our topic.

[LEARNING OBJECTIVES - 0:15]
Here's what we'll cover today:
{chr(10).join([f"- {obj}" for obj in objectives])}

[MAIN CONTENT]
{chr(10).join([f"[Section {i+1} - {60 + i*45}s] {item}" for i, item in enumerate(structure)])}

[PRACTICE EXERCISE - {int(request.duration * 0.8)}s]
Now it's your turn to try! Here's a hands-on exercise...

[SUMMARY - {request.duration - 20}s]
Let's recap what we've learned and next steps for your learning journey.
"""
        return script.strip()
    
    async def _generate_walkthrough_script(self, request: VideoExplanationRequest, context: Dict[str, Any]) -> str:
        """Generate script for project walkthroughs."""
        
        key_files = context.get('key_files', [])
        
        script = f"""
[PROJECT INTRODUCTION - 0:00]
Welcome to this comprehensive project walkthrough! I'll take you through the entire architecture and show you how everything connects.

[ARCHITECTURE OVERVIEW - 0:30]
Let's start with the big picture - here's how this project is structured...

[KEY FILES EXPLORATION - 1:30]
Now let's dive into the most important files:
{chr(10).join([f"- {file}: [Explanation of purpose and key functionality]" for file in key_files])}

[FLOW AND CONNECTIONS - {int(request.duration * 0.7)}s]
Here's how all these pieces work together in the application flow...

[DEPLOYMENT AND SCALING - {int(request.duration * 0.85)}s]
And finally, let's talk about how this project is deployed and how it scales...

[CONCLUSION - {request.duration - 15}s]
That's the complete walkthrough! You now understand the full architecture and implementation.
"""
        return script.strip()
    
    async def _generate_captions(self, script: str, duration: int) -> List[Dict[str, Any]]:
        """Generate captions with timing for the video script."""
        
        # Split script into timed segments
        lines = [line.strip() for line in script.split('\n') if line.strip()]
        captions = []
        
        current_time = 0
        words_per_second = 2.5  # Average speaking pace
        
        for line in lines:
            if line.startswith('[') and ']' in line:
                # Extract timestamp if present
                if ' - ' in line and 's]' in line:
                    time_part = line.split(' - ')[1].split('s]')[0]
                    try:
                        if ':' in time_part:
                            minutes, seconds = time_part.split(':')
                            current_time = int(minutes) * 60 + int(seconds)
                        else:
                            current_time = int(time_part)
                    except:
                        pass
                
                # Extract caption text
                caption_text = line.split('] ')[1] if '] ' in line else line
            else:
                caption_text = line
            
            if caption_text:
                word_count = len(caption_text.split())
                segment_duration = max(2, word_count / words_per_second)
                
                captions.append({
                    'start': current_time,
                    'end': min(duration, current_time + segment_duration),
                    'text': caption_text
                })
                
                current_time += segment_duration
        
        return captions
    
    def _generate_title(self, request: VideoExplanationRequest, context: Dict[str, Any]) -> str:
        """Generate video title based on content type."""
        
        if request.type == 'code':
            language = context.get('language', 'Code')
            return f"{language} Code Explained - Step by Step Walkthrough"
        elif request.type == 'feature':
            return "AI Tempo Feature Demo - Master This Powerful Tool"
        elif request.type == 'tutorial':
            return "Complete Tutorial - Learn Everything You Need to Know"
        elif request.type == 'walkthrough':
            return "Full Project Walkthrough - Architecture and Implementation"
        
        return f"{request.type.title()} Explanation Video"
    
    def _generate_description(self, request: VideoExplanationRequest, context: Dict[str, Any]) -> str:
        """Generate video description."""
        
        base_description = f"""
This {request.type} video is designed for {request.target_audience} developers and provides a comprehensive explanation with visual demonstrations.

🎯 Perfect for: {request.target_audience.title()} developers
⏱️ Duration: {request.duration // 60}:{request.duration % 60:02d}
🎨 Style: {request.style.title()}
📝 Includes: Professional narration and captions

Generated by AI Tempo Platform - The future of AI-powered development.
"""
        return base_description.strip()
    
    def _analyze_code_complexity(self, code: str) -> str:
        """Analyze code complexity level."""
        
        lines = len(code.split('\n'))
        
        if lines < 20:
            return 'beginner'
        elif lines < 100:
            return 'intermediate'
        else:
            return 'advanced'
    
    def _extract_key_concepts(self, code: str, language: str) -> List[str]:
        """Extract key programming concepts from code."""
        
        concepts = []
        code_lower = code.lower()
        
        # Common programming concepts
        if 'async' in code_lower or 'await' in code_lower:
            concepts.append('Asynchronous Programming')
        if 'class' in code_lower:
            concepts.append('Object-Oriented Programming')
        if 'function' in code_lower or 'def' in code_lower:
            concepts.append('Functions and Methods')
        if 'import' in code_lower or 'require' in code_lower:
            concepts.append('Modules and Dependencies')
        if 'try' in code_lower and 'catch' in code_lower:
            concepts.append('Error Handling')
        if 'map' in code_lower or 'filter' in code_lower or 'reduce' in code_lower:
            concepts.append('Functional Programming')
        
        return concepts[:5]  # Limit to top 5 concepts
    
    def _format_code_explanation(self, code: str, language: str) -> str:
        """Format code with line-by-line explanations."""
        
        lines = code.split('\n')[:10]  # Limit for video length
        explanations = []
        
        for i, line in enumerate(lines):
            if line.strip():
                explanations.append(f"Line {i+1}: {line.strip()}")
                explanations.append(f"  → This line [explanation of what the line does]")
        
        return '\n'.join(explanations)
    
    async def get_video(self, video_id: str) -> Optional[VideoExplanationResult]:
        """Retrieve a generated video by ID."""
        return self.video_cache.get(video_id)
    
    async def list_videos(self, video_type: Optional[str] = None) -> List[VideoExplanationResult]:
        """List all generated videos, optionally filtered by type."""
        videos = list(self.video_cache.values())
        
        if video_type:
            videos = [v for v in videos if v.type == video_type]
        
        return sorted(videos, key=lambda v: v.created_at, reverse=True)
    
    async def get_video_analytics(self, video_id: str) -> Dict[str, Any]:
        """Get analytics for a specific video."""
        
        video = await self.get_video(video_id)
        if not video:
            return {'error': 'Video not found'}
        
        return {
            'video_id': video_id,
            'views': 0,  # Would be tracked in real implementation
            'duration': video.duration,
            'completion_rate': 0.85,  # Mock data
            'engagement_score': 0.92,  # Mock data
            'generated_at': video.created_at.isoformat()
        }

# Global service instance
video_explanation_service = None

def get_video_explanation_service():
    """Get the global video explanation service instance."""
    return video_explanation_service

def set_video_explanation_service(service):
    """Set the global video explanation service instance."""
    global video_explanation_service
    video_explanation_service = service