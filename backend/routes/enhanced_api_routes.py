"""
Enhanced API Routes - Integrating All New Services
Provides comprehensive API endpoints for all enhanced features
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import base64

from ..services.enhanced_ai_service import get_enhanced_ai_service
from ..services.collaboration_service_enhanced import get_enhanced_collaboration_service
from ..services.auth_service import get_auth_service
from ..services.file_management_service import get_file_management_service
from ..services.search_service import get_search_service
from ..services.extension_service import get_extension_service

# Security
security = HTTPBearer()

# Create router
enhanced_router = APIRouter(prefix="/api/v1/enhanced", tags=["Enhanced Features"])

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    auth_service = get_auth_service()
    if not auth_service:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    
    token_result = await auth_service.verify_token(credentials.credentials)
    if not token_result['success']:
        raise HTTPException(status_code=401, detail=token_result['error'])
    
    return token_result['user']

# ===== AUTHENTICATION ROUTES =====

@enhanced_router.post("/auth/register")
async def register_user(user_data: Dict[str, Any]):
    """Register a new user"""
    auth_service = get_auth_service()
    if not auth_service:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    
    required_fields = ['email', 'password', 'username']
    for field in required_fields:
        if field not in user_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    result = await auth_service.register_user(
        email=user_data['email'],
        password=user_data['password'],
        username=user_data['username'],
        full_name=user_data.get('full_name', '')
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.post("/auth/login")
async def login_user(credentials: Dict[str, Any]):
    """Authenticate user login"""
    auth_service = get_auth_service()
    if not auth_service:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    
    if 'email_or_username' not in credentials or 'password' not in credentials:
        raise HTTPException(status_code=400, detail="Email/username and password required")
    
    result = await auth_service.authenticate_user(
        email_or_username=credentials['email_or_username'],
        password=credentials['password'],
        remember_me=credentials.get('remember_me', False)
    )
    
    if not result['success']:
        raise HTTPException(status_code=401, detail=result['error'])
    
    return result

@enhanced_router.post("/auth/logout")
async def logout_user(session_data: Dict[str, str], current_user = Depends(get_current_user)):
    """Logout current user"""
    auth_service = get_auth_service()
    if not auth_service:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    
    session_id = session_data.get('session_id')
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    result = await auth_service.logout_user(session_id)
    return result

@enhanced_router.get("/auth/profile")
async def get_user_profile(current_user = Depends(get_current_user)):
    """Get current user profile"""
    return {
        'success': True,
        'user': current_user
    }

@enhanced_router.put("/auth/profile")
async def update_user_profile(profile_data: Dict[str, Any], current_user = Depends(get_current_user)):
    """Update user profile"""
    auth_service = get_auth_service()
    if not auth_service:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    
    result = await auth_service.update_user_profile(current_user['user_id'], profile_data)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

# ===== ENHANCED AI ROUTES =====

@enhanced_router.post("/ai/avatar-review")
async def get_avatar_code_review(
    review_request: Dict[str, Any], 
    current_user = Depends(get_current_user)
):
    """Get AI-powered code review from avatar personality"""
    ai_service = get_enhanced_ai_service()
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    
    required_fields = ['avatar_id', 'code', 'language']
    for field in required_fields:
        if field not in review_request:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    result = await ai_service.avatar_code_review(
        avatar_id=review_request['avatar_id'],
        code=review_request['code'],
        language=review_request['language'],
        context=review_request.get('context', '')
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.post("/ai/code-completion")
async def get_ai_code_completion(
    completion_request: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Get AI-powered code completion suggestions"""
    ai_service = get_enhanced_ai_service()
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    
    required_fields = ['code_context', 'cursor_position', 'language']
    for field in required_fields:
        if field not in completion_request:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    result = await ai_service.ai_code_completion(
        code_context=completion_request['code_context'],
        cursor_position=completion_request['cursor_position'],
        language=completion_request['language']
    )
    
    return result

@enhanced_router.post("/ai/code-analysis")
async def analyze_code_with_ai(
    analysis_request: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Perform comprehensive AI code analysis"""
    ai_service = get_enhanced_ai_service()
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    
    required_fields = ['code', 'language']
    for field in required_fields:
        if field not in analysis_request:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    result = await ai_service.ai_code_analysis(
        code=analysis_request['code'],
        language=analysis_request['language'],
        analysis_type=analysis_request.get('analysis_type', 'full')
    )
    
    return result

@enhanced_router.post("/ai/code-generation")
async def generate_code_with_ai(
    generation_request: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Generate code from natural language description"""
    ai_service = get_enhanced_ai_service()
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    
    required_fields = ['description', 'language']
    for field in required_fields:
        if field not in generation_request:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    result = await ai_service.ai_code_generation(
        description=generation_request['description'],
        language=generation_request['language'],
        context=generation_request.get('context', '')
    )
    
    return result

@enhanced_router.post("/ai/voice-to-code")
async def convert_voice_to_code(
    voice_request: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Convert voice commands to code"""
    ai_service = get_enhanced_ai_service()
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    
    if 'voice_command' not in voice_request:
        raise HTTPException(status_code=400, detail="Voice command required")
    
    result = await ai_service.ai_voice_to_code(
        voice_command=voice_request['voice_command'],
        current_context=voice_request.get('current_context', ''),
        language=voice_request.get('language', 'javascript')
    )
    
    return result

# ===== COLLABORATION ROUTES =====

@enhanced_router.post("/collaboration/join/{file_id}")
async def join_collaborative_session(
    file_id: str,
    session_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Join collaborative editing session"""
    collab_service = get_enhanced_collaboration_service()
    if not collab_service:
        raise HTTPException(status_code=503, detail="Collaboration service unavailable")
    
    result = await collab_service.join_collaborative_session(
        file_id=file_id,
        user_id=current_user['user_id'],
        user_name=current_user['username'],
        avatar_url=current_user.get('avatar_url', '')
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.post("/collaboration/leave/{file_id}")
async def leave_collaborative_session(
    file_id: str,
    current_user = Depends(get_current_user)
):
    """Leave collaborative editing session"""
    collab_service = get_enhanced_collaboration_service()
    if not collab_service:
        raise HTTPException(status_code=503, detail="Collaboration service unavailable")
    
    result = await collab_service.leave_collaborative_session(
        file_id=file_id,
        user_id=current_user['user_id']
    )
    
    return result

@enhanced_router.post("/collaboration/edit/{file_id}")
async def apply_collaborative_edit(
    file_id: str,
    edit_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Apply collaborative edit with operational transformation"""
    collab_service = get_enhanced_collaboration_service()
    if not collab_service:
        raise HTTPException(status_code=503, detail="Collaboration service unavailable")
    
    required_fields = ['operation', 'position', 'content']
    for field in required_fields:
        if field not in edit_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    result = await collab_service.apply_collaborative_edit(
        file_id=file_id,
        user_id=current_user['user_id'],
        operation=edit_data['operation'],
        position=edit_data['position'],
        content=edit_data['content'],
        selection_start=edit_data.get('selection_start'),
        selection_end=edit_data.get('selection_end')
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.put("/collaboration/cursor/{file_id}")
async def update_cursor_position(
    file_id: str,
    cursor_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Update user cursor position in collaborative session"""
    collab_service = get_enhanced_collaboration_service()
    if not collab_service:
        raise HTTPException(status_code=503, detail="Collaboration service unavailable")
    
    result = await collab_service.update_cursor_position(
        file_id=file_id,
        user_id=current_user['user_id'],
        position=cursor_data.get('position', 0),
        selection_start=cursor_data.get('selection_start', 0),
        selection_end=cursor_data.get('selection_end', 0)
    )
    
    return result

@enhanced_router.get("/collaboration/state/{file_id}")
async def get_collaboration_state(
    file_id: str,
    current_user = Depends(get_current_user)
):
    """Get current collaboration state for file"""
    collab_service = get_enhanced_collaboration_service()
    if not collab_service:
        raise HTTPException(status_code=503, detail="Collaboration service unavailable")
    
    result = await collab_service.get_collaboration_state(file_id)
    return result

# ===== FILE MANAGEMENT ROUTES =====

@enhanced_router.post("/files/upload")
async def upload_file(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    parent_id: Optional[str] = Form(None),
    current_user = Depends(get_current_user)
):
    """Upload file with advanced handling"""
    file_service = get_file_management_service()
    if not file_service:
        raise HTTPException(status_code=503, detail="File service unavailable")
    
    # Read file content
    file_content = await file.read()
    
    result = await file_service.upload_file(
        project_id=project_id,
        file_data=file_content,
        filename=file.filename,
        parent_id=parent_id,
        user_id=current_user['user_id']
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.get("/files/{file_id}/content")
async def get_file_content(
    file_id: str,
    include_binary: bool = True,
    current_user = Depends(get_current_user)
):
    """Get file content with proper binary handling"""
    file_service = get_file_management_service()
    if not file_service:
        raise HTTPException(status_code=503, detail="File service unavailable")
    
    result = await file_service.get_file_content(file_id, include_binary)
    
    if not result['success']:
        raise HTTPException(status_code=404, detail=result['error'])
    
    return result

@enhanced_router.get("/files/{file_id}/versions")
async def get_file_versions(
    file_id: str,
    current_user = Depends(get_current_user)
):
    """Get file version history"""
    file_service = get_file_management_service()
    if not file_service:
        raise HTTPException(status_code=503, detail="File service unavailable")
    
    result = await file_service.get_file_versions(file_id)
    return result

@enhanced_router.post("/files/{file_id}/restore/{version}")
async def restore_file_version(
    file_id: str,
    version: int,
    current_user = Depends(get_current_user)
):
    """Restore file to previous version"""
    file_service = get_file_management_service()
    if not file_service:
        raise HTTPException(status_code=503, detail="File service unavailable")
    
    result = await file_service.restore_file_version(
        file_id=file_id,
        version=version,
        user_id=current_user['user_id']
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.post("/files/{file_id}/preview")
async def generate_file_preview(
    file_id: str,
    current_user = Depends(get_current_user)
):
    """Generate file preview"""
    file_service = get_file_management_service()
    if not file_service:
        raise HTTPException(status_code=503, detail="File service unavailable")
    
    result = await file_service.generate_file_preview(file_id)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

# ===== SEARCH ROUTES =====

@enhanced_router.get("/search/global")
async def global_search(
    q: str,
    project_id: Optional[str] = None,
    file_type: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Perform global search across all content"""
    search_service = get_search_service()
    if not search_service:
        raise HTTPException(status_code=503, detail="Search service unavailable")
    
    filters = {}
    if project_id:
        filters['project_id'] = project_id
    if file_type:
        filters['file_type'] = file_type
    
    result = await search_service.global_search(
        query=q,
        filters=filters,
        user_id=current_user['user_id']
    )
    
    return result

@enhanced_router.get("/search/code")
async def code_search(
    q: str,
    language: Optional[str] = None,
    search_type: str = 'all',
    current_user = Depends(get_current_user)
):
    """Specialized code search with language-specific parsing"""
    search_service = get_search_service()
    if not search_service:
        raise HTTPException(status_code=503, detail="Search service unavailable")
    
    result = await search_service.code_search(
        query=q,
        language=language,
        search_type=search_type
    )
    
    return result

@enhanced_router.get("/search/fuzzy")
async def fuzzy_search(
    q: str,
    target_type: str = 'files',
    similarity_threshold: float = 0.6,
    current_user = Depends(get_current_user)
):
    """Fuzzy search for approximate matches"""
    search_service = get_search_service()
    if not search_service:
        raise HTTPException(status_code=503, detail="Search service unavailable")
    
    result = await search_service.fuzzy_search(
        query=q,
        target_type=target_type,
        similarity_threshold=similarity_threshold
    )
    
    return result

@enhanced_router.get("/search/files")
async def smart_file_search(
    q: str,
    project_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Smart file finding with path traversal"""
    search_service = get_search_service()
    if not search_service:
        raise HTTPException(status_code=503, detail="Search service unavailable")
    
    result = await search_service.smart_file_search(
        query=q,
        project_id=project_id
    )
    
    return result

@enhanced_router.get("/search/suggestions")
async def get_search_suggestions(
    q: str,
    context: str = 'global',
    current_user = Depends(get_current_user)
):
    """Get search suggestions for partial query"""
    search_service = get_search_service()
    if not search_service:
        raise HTTPException(status_code=503, detail="Search service unavailable")
    
    result = await search_service.get_search_suggestions(
        partial_query=q,
        context=context
    )
    
    return result

# ===== EXTENSION ROUTES =====

@enhanced_router.get("/extensions/marketplace")
async def get_marketplace_extensions(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    current_user = Depends(get_current_user)
):
    """Get extensions marketplace with filtering"""
    extension_service = get_extension_service()
    if not extension_service:
        raise HTTPException(status_code=503, detail="Extension service unavailable")
    
    result = await extension_service.get_marketplace_extensions(
        category=category,
        search=search,
        page=page,
        per_page=per_page
    )
    
    return result

@enhanced_router.post("/extensions/install/{extension_id}")
async def install_extension(
    extension_id: str,
    install_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Install extension from marketplace"""
    extension_service = get_extension_service()
    if not extension_service:
        raise HTTPException(status_code=503, detail="Extension service unavailable")
    
    result = await extension_service.install_extension(
        extension_id=extension_id,
        user_id=current_user['user_id'],
        version=install_data.get('version', 'latest')
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.delete("/extensions/uninstall/{extension_id}")
async def uninstall_extension(
    extension_id: str,
    current_user = Depends(get_current_user)
):
    """Uninstall extension"""
    extension_service = get_extension_service()
    if not extension_service:
        raise HTTPException(status_code=503, detail="Extension service unavailable")
    
    result = await extension_service.uninstall_extension(
        extension_id=extension_id,
        user_id=current_user['user_id']
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.get("/extensions/installed")
async def get_user_extensions(current_user = Depends(get_current_user)):
    """Get user's installed extensions"""
    extension_service = get_extension_service()
    if not extension_service:
        raise HTTPException(status_code=503, detail="Extension service unavailable")
    
    result = await extension_service.get_user_extensions(current_user['user_id'])
    return result

@enhanced_router.put("/extensions/{extension_id}/toggle")
async def toggle_extension(
    extension_id: str,
    toggle_data: Dict[str, bool],
    current_user = Depends(get_current_user)
):
    """Enable or disable extension"""
    extension_service = get_extension_service()
    if not extension_service:
        raise HTTPException(status_code=503, detail="Extension service unavailable")
    
    if 'enabled' not in toggle_data:
        raise HTTPException(status_code=400, detail="Enabled status required")
    
    result = await extension_service.toggle_extension(
        extension_id=extension_id,
        user_id=current_user['user_id'],
        enabled=toggle_data['enabled']
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@enhanced_router.put("/extensions/{extension_id}/config")
async def update_extension_config(
    extension_id: str,
    config_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Update extension configuration"""
    extension_service = get_extension_service()
    if not extension_service:
        raise HTTPException(status_code=503, detail="Extension service unavailable")
    
    result = await extension_service.update_extension_config(
        extension_id=extension_id,
        user_id=current_user['user_id'],
        config=config_data
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

# ===== ANALYTICS & TESTING ROUTES =====

@enhanced_router.get("/analytics/usage")
async def get_usage_analytics(
    period: str = '7d',
    current_user = Depends(get_current_user)
):
    """Get user usage analytics"""
    # Implementation would depend on analytics service
    return {
        'success': True,
        'period': period,
        'metrics': {
            'projects_created': 5,
            'files_edited': 23,
            'lines_of_code': 1247,
            'collaboration_sessions': 8,
            'ai_requests': 15,
            'extensions_used': 7
        },
        'trends': {
            'daily_activity': [12, 18, 15, 22, 19, 25, 21],
            'top_languages': ['JavaScript', 'Python', 'TypeScript'],
            'productivity_score': 85
        }
    }

@enhanced_router.post("/testing/run")
async def run_tests(
    test_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Run integrated tests"""
    # Mock test runner - real implementation would integrate with testing frameworks
    return {
        'success': True,
        'test_run_id': 'test_' + str(datetime.now().timestamp()),
        'results': {
            'total_tests': 45,
            'passed': 42,
            'failed': 2,
            'skipped': 1,
            'duration': '3.42s',
            'coverage': 87.5
        },
        'failed_tests': [
            {
                'name': 'test_user_authentication',
                'error': 'AssertionError: Expected 200, got 401',
                'file': 'tests/auth_test.py',
                'line': 25
            },
            {
                'name': 'test_file_upload',
                'error': 'FileNotFoundError: test_file.txt not found',
                'file': 'tests/file_test.py',
                'line': 42
            }
        ]
    }

# Export router
__all__ = ['enhanced_router']