from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from routes.auth import get_current_user
from services.development_assistant import DevelopmentAssistant, TestType

router = APIRouter()
logger = logging.getLogger(__name__)

# Global development assistant instance
development_assistant: Optional[DevelopmentAssistant] = None

def set_development_assistant(assistant_instance: DevelopmentAssistant):
    global development_assistant
    development_assistant = assistant_instance

@router.post("/analyze-code")
async def analyze_code(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Analyze code for quality, bugs, and improvements"""
    try:
        if not development_assistant:
            raise HTTPException(status_code=500, detail="Development assistant not initialized")
        
        code = request.get("code", "")
        file_path = request.get("file_path", "unknown")
        context = request.get("context", {})
        
        if not code:
            raise HTTPException(status_code=400, detail="Code is required")
        
        # Add user context
        context["user_id"] = current_user["user_id"]
        
        # Analyze code
        analysis_result = await development_assistant.analyze_code(code, file_path, context)
        
        return {
            "success": True,
            "analysis": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-tests")
async def generate_tests(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate test suite for code"""
    try:
        if not development_assistant:
            raise HTTPException(status_code=500, detail="Development assistant not initialized")
        
        code = request.get("code", "")
        language = request.get("language", "python")
        test_type = request.get("test_type", "unit")
        
        if not code:
            raise HTTPException(status_code=400, detail="Code is required")
        
        # Convert string to TestType enum
        try:
            test_type_enum = TestType(test_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid test type: {test_type}")
        
        # Generate tests
        test_result = await development_assistant.generate_tests(code, language, test_type_enum)
        
        return {
            "success": True,
            "tests": test_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating tests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-documentation")
async def generate_documentation(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate documentation for code"""
    try:
        if not development_assistant:
            raise HTTPException(status_code=500, detail="Development assistant not initialized")
        
        code = request.get("code", "")
        language = request.get("language", "python")
        context = request.get("context", {})
        
        if not code:
            raise HTTPException(status_code=400, detail="Code is required")
        
        # Add user context
        context["user_id"] = current_user["user_id"]
        
        # Generate documentation
        doc_result = await development_assistant.generate_documentation(code, language, context)
        
        return {
            "success": True,
            "documentation": doc_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating documentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-issues")
async def predict_project_issues(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Predict potential issues in project"""
    try:
        if not development_assistant:
            raise HTTPException(status_code=500, detail="Development assistant not initialized")
        
        project_id = request.get("project_id", "")
        context = request.get("context", {})
        
        if not project_id:
            raise HTTPException(status_code=400, detail="Project ID is required")
        
        # Add user context
        context["user_id"] = current_user["user_id"]
        
        # Predict issues
        prediction_result = await development_assistant.predict_issues(project_id, context)
        
        return {
            "success": True,
            "predictions": prediction_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error predicting issues: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-refactoring")
async def suggest_refactoring(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Suggest code refactoring opportunities"""
    try:
        if not development_assistant:
            raise HTTPException(status_code=500, detail="Development assistant not initialized")
        
        code = request.get("code", "")
        language = request.get("language", "python")
        context = request.get("context", {})
        
        if not code:
            raise HTTPException(status_code=400, detail="Code is required")
        
        # Add user context
        context["user_id"] = current_user["user_id"]
        
        # Get refactoring suggestions
        refactoring_result = await development_assistant.suggest_refactoring(code, language, context)
        
        return {
            "success": True,
            "refactoring": refactoring_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error suggesting refactoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-file-analysis")
async def upload_file_for_analysis(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload and analyze a code file"""
    try:
        if not development_assistant:
            raise HTTPException(status_code=500, detail="Development assistant not initialized")
        
        # Read file content
        content = await file.read()
        code = content.decode('utf-8')
        
        # Analyze the uploaded file
        analysis_result = await development_assistant.analyze_code(
            code, 
            file.filename or "uploaded_file", 
            {"user_id": current_user["user_id"]}
        )
        
        return {
            "success": True,
            "filename": file.filename,
            "file_size": len(content),
            "analysis": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing uploaded file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/code-quality-trends")
async def get_code_quality_trends(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get code quality trends for a project"""
    try:
        # Mock code quality trends data
        trends = {
            "project_id": project_id,
            "time_range": "30d",
            "quality_score_trend": [
                {"date": "2025-01-01", "score": 7.2},
                {"date": "2025-01-08", "score": 7.5},
                {"date": "2025-01-15", "score": 7.8},
                {"date": "2025-01-22", "score": 8.1},
                {"date": "2025-01-29", "score": 8.3}
            ],
            "metrics": {
                "current_quality_score": 8.3,
                "previous_quality_score": 7.2,
                "improvement": 1.1,
                "bugs_fixed": 15,
                "new_bugs_introduced": 3,
                "test_coverage": 85.5,
                "code_complexity": "medium",
                "technical_debt": "low"
            },
            "top_issues": [
                {
                    "type": "performance",
                    "count": 5,
                    "trend": "decreasing"
                },
                {
                    "type": "maintainability", 
                    "count": 3,
                    "trend": "stable"
                },
                {
                    "type": "security",
                    "count": 1,
                    "trend": "decreasing"
                }
            ],
            "recommendations": [
                "Great progress on code quality improvement!",
                "Consider addressing the remaining performance issues",
                "Maintain current testing practices"
            ]
        }
        
        return {
            "success": True,
            "trends": trends,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting code quality trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/smart-template-generation")
async def generate_smart_template(
    request: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate template from successful projects"""
    try:
        if not development_assistant:
            raise HTTPException(status_code=500, detail="Development assistant not initialized")
        
        successful_projects = request.get("successful_projects", [])
        template_name = request.get("template_name", "Generated Template")
        
        if not successful_projects:
            raise HTTPException(status_code=400, detail="Successful projects data is required")
        
        # Generate smart template
        template_result = await development_assistant.template_generator.generate_template(successful_projects)
        
        return {
            "success": True,
            "template_name": template_name,
            "template": template_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating smart template: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/development-insights")
async def get_development_insights(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get personalized development insights"""
    try:
        # Mock development insights
        insights = {
            "user_id": current_user["user_id"],
            "coding_patterns": {
                "most_used_languages": ["Python", "JavaScript", "TypeScript"],
                "preferred_frameworks": ["React", "FastAPI", "Express"],
                "code_quality_average": 8.2,
                "productivity_score": 85,
                "learning_progress": "advancing"
            },
            "recent_achievements": [
                {
                    "type": "quality_improvement",
                    "description": "Improved code quality by 15% this month",
                    "date": "2025-01-29"
                },
                {
                    "type": "bug_reduction",
                    "description": "Reduced bug count by 40% in last project",
                    "date": "2025-01-25"
                }
            ],
            "skill_development": {
                "strengths": ["API Development", "Frontend Design", "Testing"],
                "areas_for_improvement": ["Performance Optimization", "Security Best Practices"],
                "recommended_learning": [
                    "Advanced React Patterns",
                    "Database Optimization Techniques",
                    "Security Vulnerability Assessment"
                ]
            },
            "productivity_metrics": {
                "lines_of_code_per_day": 150,
                "bugs_per_100_lines": 2.1,
                "test_coverage_average": 78,
                "code_review_participation": 92
            },
            "ai_assistance_usage": {
                "total_interactions": 234,
                "most_helpful_features": ["Code Analysis", "Bug Detection", "Test Generation"],
                "time_saved_estimate": "12 hours this month"
            }
        }
        
        return {
            "success": True,
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting development insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/best-practices")
async def get_best_practices(
    language: str = "python",
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get language-specific best practices"""
    try:
        # Mock best practices data
        best_practices = {
            "language": language,
            "categories": {
                "code_style": [
                    "Use consistent indentation (4 spaces for Python)",
                    "Follow PEP 8 naming conventions",
                    "Keep line length under 88 characters",
                    "Use meaningful variable and function names"
                ],
                "performance": [
                    "Use list comprehensions for simple transformations",
                    "Avoid premature optimization",
                    "Profile code before optimizing",
                    "Use appropriate data structures"
                ],
                "security": [
                    "Validate and sanitize all user inputs",
                    "Use parameterized queries for databases",
                    "Implement proper error handling",
                    "Keep dependencies updated"
                ],
                "testing": [
                    "Write tests before or alongside code",
                    "Aim for high test coverage (>80%)",
                    "Use descriptive test names",
                    "Test edge cases and error conditions"
                ],
                "maintainability": [
                    "Write self-documenting code",
                    "Keep functions small and focused",
                    "Use version control effectively",
                    "Refactor regularly to reduce technical debt"
                ]
            },
            "common_antipatterns": [
                "God objects (classes that do too much)",
                "Magic numbers (unexplained numeric constants)",
                "Copy-paste programming",
                "Ignoring exceptions silently"
            ],
            "recommended_tools": [
                "Black (code formatting)",
                "Pylint (static analysis)",
                "pytest (testing framework)",
                "mypy (type checking)"
            ]
        }
        
        return {
            "success": True,
            "best_practices": best_practices,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting best practices: {e}")
        raise HTTPException(status_code=500, detail=str(e))