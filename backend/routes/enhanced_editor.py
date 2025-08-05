"""
Enhanced Editor Capabilities - Addresses Gap #2
Advanced file editing, pair programming features, and IDE-like functionality
"""

from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
from datetime import datetime
import uuid
import asyncio

from routes.auth import get_current_user
from models.database import get_database
from services.ai_service_v3_enhanced import EnhancedAIServiceV3

router = APIRouter()

class FileEdit(BaseModel):
    file_path: str
    content: str
    line_number: Optional[int] = None
    selection_start: Optional[int] = None
    selection_end: Optional[int] = None

class CodeSuggestion(BaseModel):
    file_path: str
    line_number: int
    suggestion_type: str  # completion, refactor, fix, optimize
    context: Optional[str] = None

class PairProgrammingSession(BaseModel):
    session_id: str
    project_id: str
    participants: List[str]
    active_file: Optional[str] = None
    cursor_positions: Dict[str, Dict] = {}

class EnhancedEditorService:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3()
        self.active_sessions: Dict[str, Dict] = {}
        self.file_watchers: Dict[str, List[WebSocket]] = {}
    
    async def get_intelligent_suggestions(self, user_id: str, request: CodeSuggestion) -> Dict[str, Any]:
        """Get AI-powered code suggestions and completions"""
        try:
            # Get file content and context
            db = await get_database()
            project = await db.projects.find_one({
                "user_id": user_id,
                "files": {"$elemMatch": {"path": request.file_path}}
            })
            
            if not project:
                raise HTTPException(status_code=404, detail="File not found")
            
            # Find the file in the project
            file_content = ""
            for file in project.get("files", []):
                if file["path"] == request.file_path:
                    file_content = file.get("content", "")
                    break
            
            # Get surrounding context
            lines = file_content.split('\n')
            context_start = max(0, request.line_number - 10)
            context_end = min(len(lines), request.line_number + 10)
            context_lines = lines[context_start:context_end]
            
            # Create AI prompt based on suggestion type
            if request.suggestion_type == "completion":
                prompt = f"""
                Provide intelligent code completion for this context:
                
                FILE: {request.file_path}
                LINE: {request.line_number}
                
                CONTEXT:
                {chr(10).join(f"{i+context_start}: {line}" for i, line in enumerate(context_lines))}
                
                CURRENT LINE: {lines[request.line_number - 1] if request.line_number <= len(lines) else ""}
                
                Provide 3-5 relevant completions considering:
                1. Variable and function names in scope
                2. Language syntax and conventions
                3. Common patterns for this context
                4. Import statements and available libraries
                
                Return JSON format:
                {{
                    "suggestions": [
                        {{"text": "completion text", "description": "what this does", "priority": 1}}
                    ]
                }}
                """
            elif request.suggestion_type == "refactor":
                prompt = f"""
                Suggest refactoring improvements for this code:
                
                FILE: {request.file_path}
                CONTEXT:
                {chr(10).join(context_lines)}
                
                Analyze and suggest:
                1. Code simplification opportunities
                2. Performance improvements
                3. Better variable/function names
                4. Design pattern applications
                5. Bug fixes or potential issues
                
                Return JSON with specific refactoring suggestions.
                """
            elif request.suggestion_type == "fix":
                prompt = f"""
                Identify and fix potential issues in this code:
                
                FILE: {request.file_path}
                CONTEXT:
                {chr(10).join(context_lines)}
                
                Look for:
                1. Syntax errors
                2. Logic bugs
                3. Performance issues
                4. Security vulnerabilities
                5. Best practice violations
                
                Return JSON with fixes and explanations.
                """
            else:  # optimize
                prompt = f"""
                Suggest performance optimizations for this code:
                
                FILE: {request.file_path}
                CONTEXT:
                {chr(10).join(context_lines)}
                
                Focus on:
                1. Algorithm efficiency
                2. Memory usage
                3. Database queries
                4. API calls
                5. Rendering performance
                
                Return JSON with optimization suggestions.
                """
            
            # Get AI suggestions
            ai_response = await self.ai_service.get_enhanced_response(
                message=prompt,
                session_id=f"editor_{user_id}_{request.file_path}",
                user_id=user_id,
                agent_preference="Dev",  # Developer agent for coding
                include_context=True
            )
            
            # Parse AI response
            try:
                if "```json" in ai_response['content']:
                    json_start = ai_response['content'].find("```json") + 7
                    json_end = ai_response['content'].find("```", json_start)
                    suggestions_data = json.loads(ai_response['content'][json_start:json_end])
                else:
                    # Try to extract JSON from the response
                    suggestions_data = {"suggestions": [{"text": ai_response['content'][:100], "description": "AI suggestion", "priority": 1}]}
            except:
                suggestions_data = {"suggestions": [{"text": "// AI suggestion available in chat", "description": "Check AI chat for details", "priority": 1}]}
            
            return {
                "file_path": request.file_path,
                "line_number": request.line_number,
                "suggestion_type": request.suggestion_type,
                "suggestions": suggestions_data.get("suggestions", []),
                "ai_agent": ai_response.get('agent', 'Dev')
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")
    
    async def apply_intelligent_edit(self, user_id: str, edit: FileEdit) -> Dict[str, Any]:
        """Apply AI-assisted file edit with context understanding"""
        try:
            db = await get_database()
            
            # Find project containing the file
            project = await db.projects.find_one({
                "user_id": user_id,
                "files": {"$elemMatch": {"path": edit.file_path}}
            })
            
            if not project:
                raise HTTPException(status_code=404, detail="File not found")
            
            # Get AI analysis of the edit
            analysis_prompt = f"""
            Analyze this code edit and provide feedback:
            
            FILE: {edit.file_path}
            NEW CONTENT: {edit.content[:500]}...
            
            Check for:
            1. Syntax correctness
            2. Potential improvements
            3. Security issues
            4. Performance considerations
            5. Integration with existing code
            
            Provide brief analysis and any warnings or suggestions.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=analysis_prompt,
                session_id=f"edit_analysis_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Dev",
                include_context=False
            )
            
            # Update file content
            updated_files = []
            for file in project.get("files", []):
                if file["path"] == edit.file_path:
                    file["content"] = edit.content
                    file["last_modified"] = datetime.utcnow()
                    file["modified_by"] = user_id
                updated_files.append(file)
            
            # Save to database
            await db.projects.update_one(
                {"_id": project["_id"]},
                {
                    "$set": {
                        "files": updated_files,
                        "last_updated": datetime.utcnow()
                    }
                }
            )
            
            # Notify connected watchers
            await self._notify_file_watchers(edit.file_path, {
                "type": "file_updated",
                "file_path": edit.file_path,
                "modified_by": user_id,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {
                "status": "success",
                "file_path": edit.file_path,
                "ai_analysis": ai_response['content'],
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Edit failed: {str(e)}")
    
    async def start_pair_programming_session(self, user_id: str, project_id: str) -> Dict[str, Any]:
        """Start a pair programming session"""
        try:
            session_id = f"pair_{uuid.uuid4().hex[:12]}"
            
            session_data = {
                "session_id": session_id,
                "project_id": project_id,
                "host_user_id": user_id,
                "participants": [user_id],
                "active_file": None,
                "cursor_positions": {},
                "created_at": datetime.utcnow(),
                "status": "active"
            }
            
            # Store session
            self.active_sessions[session_id] = session_data
            
            # Store in database
            db = await get_database()
            await db.pair_programming_sessions.insert_one(session_data)
            
            return {
                "session_id": session_id,
                "project_id": project_id,
                "host": user_id,
                "status": "active",
                "share_url": f"/pair/{session_id}"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start pair programming: {str(e)}")
    
    async def join_pair_programming_session(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Join an existing pair programming session"""
        try:
            if session_id not in self.active_sessions:
                db = await get_database()
                session = await db.pair_programming_sessions.find_one({"session_id": session_id})
                if not session:
                    raise HTTPException(status_code=404, detail="Session not found")
                self.active_sessions[session_id] = session
            
            session = self.active_sessions[session_id]
            
            # Add user to participants
            if user_id not in session["participants"]:
                session["participants"].append(user_id)
                
                # Update database
                db = await get_database()
                await db.pair_programming_sessions.update_one(
                    {"session_id": session_id},
                    {"$addToSet": {"participants": user_id}}
                )
            
            return {
                "session_id": session_id,
                "project_id": session["project_id"],
                "participants": session["participants"],
                "active_file": session.get("active_file"),
                "status": "joined"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to join session: {str(e)}")
    
    async def get_file_diff_analysis(self, user_id: str, file_path: str, old_content: str, new_content: str) -> Dict[str, Any]:
        """Get AI analysis of file changes"""
        try:
            diff_prompt = f"""
            Analyze the changes in this file:
            
            FILE: {file_path}
            
            OLD CONTENT:
            {old_content[:1000]}...
            
            NEW CONTENT:
            {new_content[:1000]}...
            
            Provide:
            1. Summary of changes made
            2. Impact assessment
            3. Potential issues or improvements
            4. Testing recommendations
            5. Code quality rating (1-10)
            
            Be concise and focus on the most important changes.
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=diff_prompt,
                session_id=f"diff_analysis_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Quinn",  # QA engineer for code review
                include_context=False
            )
            
            return {
                "file_path": file_path,
                "analysis": ai_response['content'],
                "agent": ai_response.get('agent', 'Quinn'),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Diff analysis failed: {str(e)}")
    
    async def get_code_documentation(self, user_id: str, file_path: str, function_name: Optional[str] = None) -> Dict[str, Any]:
        """Generate documentation for code"""
        try:
            db = await get_database()
            project = await db.projects.find_one({
                "user_id": user_id,
                "files": {"$elemMatch": {"path": file_path}}
            })
            
            if not project:
                raise HTTPException(status_code=404, detail="File not found")
            
            # Get file content
            file_content = ""
            for file in project.get("files", []):
                if file["path"] == file_path:
                    file_content = file.get("content", "")
                    break
            
            doc_prompt = f"""
            Generate comprehensive documentation for this code:
            
            FILE: {file_path}
            {f"FUNCTION: {function_name}" if function_name else ""}
            
            CODE:
            {file_content[:2000]}
            
            Generate:
            1. Overview and purpose
            2. Function/class documentation
            3. Parameters and return values
            4. Usage examples
            5. Dependencies and requirements
            
            Use proper documentation format for the language (JSDoc, docstring, etc.).
            """
            
            ai_response = await self.ai_service.get_enhanced_response(
                message=doc_prompt,
                session_id=f"docs_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                agent_preference="Dev",
                include_context=False
            )
            
            return {
                "file_path": file_path,
                "function_name": function_name,
                "documentation": ai_response['content'],
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Documentation generation failed: {str(e)}")
    
    async def _notify_file_watchers(self, file_path: str, notification: Dict[str, Any]):
        """Notify WebSocket connections watching a file"""
        if file_path in self.file_watchers:
            for websocket in self.file_watchers[file_path][:]:  # Copy list to avoid modification during iteration
                try:
                    await websocket.send_text(json.dumps(notification))
                except:
                    # Remove disconnected websockets
                    self.file_watchers[file_path].remove(websocket)

# Initialize enhanced editor service
enhanced_editor_service = EnhancedEditorService()

@router.post("/suggestions")
async def get_code_suggestions(
    request: CodeSuggestion,
    current_user = Depends(get_current_user)
):
    """Get intelligent code suggestions"""
    return await enhanced_editor_service.get_intelligent_suggestions(str(current_user["_id"]), request)

@router.post("/edit")
async def apply_edit(
    edit: FileEdit,
    current_user = Depends(get_current_user)
):
    """Apply intelligent file edit"""
    return await enhanced_editor_service.apply_intelligent_edit(str(current_user["_id"]), edit)

@router.post("/pair-programming/start")
async def start_pair_programming(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """Start pair programming session"""
    return await enhanced_editor_service.start_pair_programming_session(str(current_user["_id"]), project_id)

@router.post("/pair-programming/join/{session_id}")
async def join_pair_programming(
    session_id: str,
    current_user = Depends(get_current_user)
):
    """Join pair programming session"""
    return await enhanced_editor_service.join_pair_programming_session(str(current_user["_id"]), session_id)

@router.post("/diff-analysis")
async def analyze_diff(
    file_path: str,
    old_content: str,
    new_content: str,
    current_user = Depends(get_current_user)
):
    """Get AI analysis of file changes"""
    return await enhanced_editor_service.get_file_diff_analysis(
        str(current_user["_id"]), file_path, old_content, new_content
    )

@router.post("/documentation")
async def generate_documentation(
    file_path: str,
    function_name: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Generate code documentation"""
    return await enhanced_editor_service.get_code_documentation(
        str(current_user["_id"]), file_path, function_name
    )

@router.websocket("/file-watch/{file_path:path}")
async def watch_file(websocket: WebSocket, file_path: str):
    """WebSocket endpoint for real-time file watching"""
    await websocket.accept()
    
    # Add to file watchers
    if file_path not in enhanced_editor_service.file_watchers:
        enhanced_editor_service.file_watchers[file_path] = []
    enhanced_editor_service.file_watchers[file_path].append(websocket)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types (cursor position, selection, etc.)
            if message.get("type") == "cursor_update":
                # Broadcast cursor position to other watchers
                for other_ws in enhanced_editor_service.file_watchers[file_path]:
                    if other_ws != websocket:
                        try:
                            await other_ws.send_text(json.dumps({
                                "type": "cursor_update",
                                "user_id": message.get("user_id"),
                                "position": message.get("position")
                            }))
                        except:
                            pass
                            
    except WebSocketDisconnect:
        # Remove from file watchers
        if file_path in enhanced_editor_service.file_watchers:
            enhanced_editor_service.file_watchers[file_path].remove(websocket)

@router.get("/pair-programming/sessions")
async def get_active_sessions(
    current_user = Depends(get_current_user)
):
    """Get active pair programming sessions for user"""
    try:
        db = await get_database()
        sessions = await db.pair_programming_sessions.find({
            "participants": str(current_user["_id"]),
            "status": "active"
        }).to_list(20)
        
        return {"sessions": sessions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@router.get("/file-history/{file_path:path}")
async def get_file_history(
    file_path: str,
    limit: int = 10,
    current_user = Depends(get_current_user)
):
    """Get file edit history"""
    try:
        db = await get_database()
        
        # Get file edit history from project updates
        history = await db.file_history.find({
            "user_id": str(current_user["_id"]),
            "file_path": file_path
        }).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return {"file_path": file_path, "history": history}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file history: {str(e)}")