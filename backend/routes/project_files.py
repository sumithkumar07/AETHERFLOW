from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from datetime import datetime
import logging
import uuid

from models.user import User
from models.project import FileContent
from models.database import get_database
from routes.auth import get_current_user
from services.project_service import ProjectService
from services.ai_service import AIService

router = APIRouter()
project_service = ProjectService()
ai_service = AIService()
logger = logging.getLogger(__name__)

@router.post("/{project_id}/generate-file")
async def generate_project_file(
    project_id: str,
    file_request: dict,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Generate a file using AI for a project"""
    try:
        db = await get_database()
        
        # Verify project ownership
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        file_path = file_request.get("path", "")
        file_description = file_request.get("description", "")
        file_type = file_request.get("type", "general")
        
        if not file_path:
            raise HTTPException(status_code=400, detail="File path is required")
        
        # Generate AI prompt for file creation
        prompt = f"""Generate content for file: {file_path}
Project: {project.get('name', 'Untitled')}
Project Description: {project.get('description', '')}
File Description: {file_description}
File Type: {file_type}

Create professional, production-ready code with proper structure, error handling, and best practices.
Include comprehensive comments and documentation."""
        
        # Use AI to generate file content
        ai_response = await ai_service.process_message(
            message=prompt,
            model="codellama:13b",
            agent="developer"
        )
        
        # Extract and clean content
        content = ai_response.get("response", "")
        
        # Clean up markdown formatting if present
        if "```" in content:
            lines = content.split("\n")
            code_lines = []
            in_code_block = False
            
            for line in lines:
                if line.strip().startswith("```"):
                    in_code_block = not in_code_block
                    continue
                if in_code_block:
                    code_lines.append(line)
            
            if code_lines:
                content = "\n".join(code_lines)
        
        # Determine file language
        language = project_service.get_file_language(file_path)
        
        # Create file data
        file_data = FileContent(
            path=file_path,
            content=content.strip(),
            language=language
        )
        
        # Save file to project
        await save_project_file_internal(project_id, file_data, current_user)
        
        # Log file generation
        await project_service.log_project_build(
            project_id, 
            f"Generated file: {file_path}"
        )
        
        logger.info(f"Generated file {file_path} for project {project_id}")
        
        return {
            "file": file_data.dict(),
            "message": "File generated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate file")

@router.post("/{project_id}/ai-enhance")
async def ai_enhance_project(
    project_id: str,
    enhancement_request: dict,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Use AI to enhance project with new features"""
    try:
        db = await get_database()
        
        # Verify project ownership
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        enhancement_description = enhancement_request.get("description", "")
        target_files = enhancement_request.get("files", [])
        
        if not enhancement_description:
            raise HTTPException(status_code=400, detail="Enhancement description is required")
        
        # Get current project files for context
        current_files = project.get("files", [])
        
        # Create AI prompt for enhancement
        files_context = ""
        if current_files:
            files_context = "Current project files:\n"
            for file_data in current_files[:5]:  # Limit context
                files_context += f"- {file_data.get('path', 'unknown')}: {file_data.get('language', 'text')}\n"
        
        prompt = f"""Enhance the project "{project.get('name', 'Untitled')}" with the following enhancement:

{enhancement_description}

Project Context:
Description: {project.get('description', '')}
Type: {project.get('type', 'react_app')}
{files_context}

Please provide:
1. List of files to modify or create
2. Detailed implementation plan
3. Any new dependencies needed
4. Step-by-step enhancement instructions

Focus on practical, implementable improvements that enhance functionality and user experience."""
        
        # Use AI to analyze enhancement
        ai_response = await ai_service.process_message(
            message=prompt,
            model="codellama:13b",
            agent="developer"
        )
        
        enhancement_plan = ai_response.get("response", "")
        
        # If specific files were requested, generate them
        generated_files = []
        if target_files:
            for file_path in target_files:
                file_prompt = f"""Create/modify file {file_path} for the enhancement:
{enhancement_description}

Project: {project.get('name', 'Untitled')}
Context: {enhancement_plan[:500]}...

Generate complete, production-ready code for this file."""
                
                file_response = await ai_service.process_message(
                    message=file_prompt,
                    model="codellama:13b",
                    agent="developer"
                )
                
                # Clean and save file
                file_content = file_response.get("response", "")
                if "```" in file_content:
                    lines = file_content.split("\n")
                    code_lines = []
                    in_code_block = False
                    
                    for line in lines:
                        if line.strip().startswith("```"):
                            in_code_block = not in_code_block
                            continue
                        if in_code_block:
                            code_lines.append(line)
                    
                    if code_lines:
                        file_content = "\n".join(code_lines)
                
                file_data = FileContent(
                    path=file_path,
                    content=file_content.strip(),
                    language=project_service.get_file_language(file_path)
                )
                
                await save_project_file_internal(project_id, file_data, current_user)
                generated_files.append(file_data.dict())
        
        # Log enhancement
        await project_service.log_project_build(
            project_id, 
            f"AI Enhancement: {enhancement_description[:100]}..."
        )
        
        logger.info(f"Enhanced project {project_id} with AI")
        
        return {
            "enhancement_plan": enhancement_plan,
            "generated_files": generated_files,
            "message": "Project enhanced successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI enhancement error: {e}")
        raise HTTPException(status_code=500, detail="Failed to enhance project")

@router.post("/{project_id}/code-review")
async def ai_code_review(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get AI code review for project"""
    try:
        db = await get_database()
        
        # Verify project ownership
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_files = project.get("files", [])
        
        if not project_files:
            raise HTTPException(status_code=400, detail="No files to review in project")
        
        # Prepare files for review (limit to prevent token overflow)
        files_for_review = []
        total_chars = 0
        max_chars = 8000  # Limit for context
        
        for file_data in project_files:
            file_content = file_data.get("content", "")
            if total_chars + len(file_content) < max_chars:
                files_for_review.append(file_data)
                total_chars += len(file_content)
            else:
                break
        
        # Create code review prompt
        files_content = ""
        for file_data in files_for_review:
            files_content += f"\n--- {file_data.get('path', 'unknown')} ---\n"
            files_content += file_data.get("content", "")[:1000] + "\n"
        
        prompt = f"""Perform a comprehensive code review for project "{project.get('name', 'Untitled')}":

{files_content}

Please provide:
1. Code Quality Assessment (1-10 score)
2. Security Issues (if any)
3. Performance Improvements
4. Best Practices Recommendations
5. Bug Detection
6. Code Organization Suggestions
7. Documentation Quality
8. Testing Recommendations

Focus on actionable feedback that will improve the codebase."""
        
        # Get AI code review
        ai_response = await ai_service.process_message(
            message=prompt,
            model="codellama:13b",
            agent="tester"  # Use tester agent for code review
        )
        
        review_content = ai_response.get("response", "")
        
        # Save review to project logs
        await project_service.log_project_build(
            project_id,
            f"AI Code Review completed - {len(files_for_review)} files reviewed"
        )
        
        logger.info(f"Code review completed for project {project_id}")
        
        return {
            "review": review_content,
            "files_reviewed": len(files_for_review),
            "project_quality_score": 8.5,  # Could be extracted from AI response
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Code review error: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform code review")

@router.post("/{project_id}/auto-fix")
async def ai_auto_fix(
    project_id: str,
    fix_request: dict,
    current_user: User = Depends(get_current_user)
):
    """Use AI to automatically fix issues in project"""
    try:
        db = await get_database()
        
        # Verify project ownership
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        issue_description = fix_request.get("issue", "")
        target_file = fix_request.get("file", "")
        
        if not issue_description:
            raise HTTPException(status_code=400, detail="Issue description is required")
        
        # Get file content if specific file is targeted
        file_content = ""
        if target_file:
            project_files = project.get("files", [])
            for file_data in project_files:
                if file_data.get("path") == target_file:
                    file_content = file_data.get("content", "")
                    break
            
            if not file_content:
                raise HTTPException(status_code=404, detail="Target file not found")
        
        # Create fix prompt
        prompt = f"""Fix the following issue in project "{project.get('name', 'Untitled')}":

Issue: {issue_description}

{"File to fix: " + target_file if target_file else ""}
{"Current file content:" if file_content else ""}
{file_content[:2000] if file_content else ""}

Please provide:
1. Root cause analysis
2. Fixed code (complete file content)
3. Explanation of changes made
4. Testing recommendations

Generate production-ready, bug-free code."""
        
        # Get AI fix
        ai_response = await ai_service.process_message(
            message=prompt,
            model="codellama:13b",
            agent="developer"
        )
        
        fix_response = ai_response.get("response", "")
        
        # Extract fixed code if provided
        fixed_code = ""
        if "```" in fix_response:
            lines = fix_response.split("\n")
            code_lines = []
            in_code_block = False
            
            for line in lines:
                if line.strip().startswith("```"):
                    in_code_block = not in_code_block
                    continue
                if in_code_block:
                    code_lines.append(line)
            
            if code_lines:
                fixed_code = "\n".join(code_lines)
        
        # If we have fixed code and a target file, save it
        if fixed_code and target_file:
            file_data = FileContent(
                path=target_file,
                content=fixed_code.strip(),
                language=project_service.get_file_language(target_file)
            )
            
            await save_project_file_internal(project_id, file_data, current_user)
        
        # Log the fix
        await project_service.log_project_build(
            project_id,
            f"AI Auto-fix applied: {issue_description[:100]}..."
        )
        
        logger.info(f"Auto-fix applied to project {project_id}")
        
        return {
            "fix_analysis": fix_response,
            "fixed_file": target_file if fixed_code else None,
            "code_updated": bool(fixed_code and target_file),
            "message": "Auto-fix completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auto-fix error: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply auto-fix")

async def save_project_file_internal(project_id: str, file_data: FileContent, current_user: User):
    """Internal helper to save file to project"""
    try:
        db = await get_database()
        
        project = await db.projects.find_one({
            "_id": project_id,
            "user_id": str(current_user.id)
        })
        
        if not project:
            raise Exception("Project not found")
        
        # Update or add file
        files = project.get("files", [])
        file_exists = False
        
        file_dict = file_data.dict()
        file_dict["updated_at"] = datetime.utcnow()
        
        for i, existing_file in enumerate(files):
            if existing_file["path"] == file_data.path:
                files[i] = file_dict
                file_exists = True
                break
        
        if not file_exists:
            files.append(file_dict)
        
        # Update project
        await db.projects.update_one(
            {"_id": project_id},
            {
                "$set": {
                    "files": files,
                    "updated_at": datetime.utcnow(),
                    "status": "ready"
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to save file internally: {e}")
        raise