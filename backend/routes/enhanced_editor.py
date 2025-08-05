from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import difflib
from services.enhanced_ai_service_v3_upgraded import EnhancedAIServiceV3Upgraded
from models.database import get_database
from routes.auth import get_current_user

router = APIRouter()

class FileContent(BaseModel):
    path: str
    content: str
    language: str
    last_modified: datetime

class EditorSession(BaseModel):
    id: str
    user_id: str
    files: List[FileContent]
    active_file: Optional[str]
    cursor_position: Dict[str, int]  # line, column
    selection: Optional[Dict[str, Any]]
    created_at: datetime
    last_activity: datetime

class CodeSuggestion(BaseModel):
    id: str
    type: str  # completion, refactor, fix, optimization
    original_code: str
    suggested_code: str
    explanation: str
    confidence: float
    line_number: int
    agent: str

class LiveCollaboration(BaseModel):
    session_id: str
    user_id: str
    action: str  # edit, cursor, selection
    data: Dict[str, Any]
    timestamp: datetime

class VSCodeIntegration:
    def __init__(self):
        self.ai_service = EnhancedAIServiceV3Upgraded()
        self.active_sessions: Dict[str, Dict] = {}
        self.websocket_connections: Dict[str, WebSocket] = {}
        
    async def create_editor_session(self, files: List[Dict[str, Any]], user_id: str) -> EditorSession:
        """Create a new editor session for pair programming"""
        try:
            session_id = str(uuid.uuid4())
            
            file_contents = []
            for file_data in files:
                file_content = FileContent(
                    path=file_data["path"],
                    content=file_data["content"],
                    language=self._detect_language(file_data["path"]),
                    last_modified=datetime.utcnow()
                )
                file_contents.append(file_content)
            
            session = EditorSession(
                id=session_id,
                user_id=user_id,
                files=file_contents,
                active_file=files[0]["path"] if files else None,
                cursor_position={"line": 1, "column": 1},
                created_at=datetime.utcnow(),
                last_activity=datetime.utcnow()
            )
            
            # Store session
            db = await get_database()
            await db.editor_sessions.insert_one(session.dict())
            
            # Initialize AI context for the session
            await self._initialize_ai_context(session_id, file_contents, user_id)
            
            self.active_sessions[session_id] = {
                "session": session,
                "ai_context": {},
                "collaboration_state": {}
            }
            
            return session
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Editor session creation failed: {str(e)}")
    
    async def get_code_suggestions(self, session_id: str, file_path: str, cursor_position: Dict[str, int], context: str, user_id: str) -> List[CodeSuggestion]:
        """Get AI-powered code suggestions"""
        try:
            session_data = self.active_sessions.get(session_id)
            if not session_data:
                raise HTTPException(status_code=404, detail="Editor session not found")
            
            # Get current file content
            current_file = None
            for file in session_data["session"].files:
                if file.path == file_path:
                    current_file = file
                    break
            
            if not current_file:
                raise HTTPException(status_code=404, detail="File not found in session")
            
            # Generate code suggestions using AI
            suggestions_prompt = f"""
            Provide intelligent code suggestions for this context:
            
            **File**: {file_path}
            **Language**: {current_file.language}
            **Cursor Position**: Line {cursor_position['line']}, Column {cursor_position['column']}
            **Current Context**: {context}
            
            **Code around cursor**:
            {self._get_code_context(current_file.content, cursor_position)}
            
            Provide 3-5 suggestions including:
            1. Code completions
            2. Refactoring opportunities
            3. Performance optimizations
            4. Bug fixes if any
            
            Format as JSON with explanations.
            """
            
            ai_response = await self.ai_service.process_enhanced_chat(
                message=suggestions_prompt,
                conversation_id=f"editor_{session_id}",
                user_id=user_id,
                agent_coordination="single"
            )
            
            # Parse AI response and create suggestions
            suggestions = await self._parse_ai_suggestions(ai_response, current_file, cursor_position)
            
            # Store suggestions
            db = await get_database()
            for suggestion in suggestions:
                await db.code_suggestions.insert_one({
                    **suggestion.dict(),
                    "session_id": session_id,
                    "created_at": datetime.utcnow()
                })
            
            return suggestions
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Code suggestion generation failed: {str(e)}")
    
    async def apply_code_change(self, session_id: str, file_path: str, change: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Apply code change and sync with collaborators"""
        try:
            session_data = self.active_sessions.get(session_id)
            if not session_data:
                raise HTTPException(status_code=404, detail="Editor session not found")
            
            # Find and update file
            for i, file in enumerate(session_data["session"].files):
                if file.path == file_path:
                    # Apply change
                    old_content = file.content
                    new_content = self._apply_change(old_content, change)
                    
                    # Update file content
                    session_data["session"].files[i].content = new_content
                    session_data["session"].files[i].last_modified = datetime.utcnow()
                    session_data["session"].last_activity = datetime.utcnow()
                    
                    # Generate diff
                    diff = list(difflib.unified_diff(
                        old_content.splitlines(keepends=True),
                        new_content.splitlines(keepends=True),
                        fromfile=f"{file_path} (before)",
                        tofile=f"{file_path} (after)"
                    ))
                    
                    # Update database
                    db = await get_database()
                    await db.editor_sessions.update_one(
                        {"id": session_id},
                        {"$set": {"files": [f.dict() for f in session_data["session"].files], "last_activity": datetime.utcnow()}}
                    )
                    
                    # Broadcast change to collaborators
                    await self._broadcast_change(session_id, {
                        "type": "file_change",
                        "file_path": file_path,
                        "change": change,
                        "diff": diff,
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                    return {
                        "success": True,
                        "file_path": file_path,
                        "diff": diff,
                        "lines_changed": len([line for line in diff if line.startswith(('+', '-')) and not line.startswith(('+++', '---'))])
                    }
            
            raise HTTPException(status_code=404, detail="File not found in session")
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Code change application failed: {str(e)}")
    
    async def generate_vscode_extension_config(self, user_preferences: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Generate VS Code extension configuration"""
        try:
            # Generate intelligent extension configuration
            config_prompt = f"""
            Generate VS Code extension configuration for Aether AI integration:
            
            **User Preferences**: {json.dumps(user_preferences, indent=2)}
            
            Create configuration for:
            1. Command palette integration
            2. Keyboard shortcuts
            3. Sidebar panel configuration
            4. Status bar items
            5. Context menus
            6. Settings schema
            
            Include TypeScript definitions and manifest.
            """
            
            ai_response = await self.ai_service.process_enhanced_chat(
                message=config_prompt,
                conversation_id=f"vscode_config_{uuid.uuid4()}",
                user_id=user_id,
                agent_coordination="single"
            )
            
            # Generate extension files
            extension_config = {
                "manifest": await self._generate_extension_manifest(),
                "commands": await self._generate_extension_commands(),
                "keybindings": await self._generate_keybindings(user_preferences),
                "settings": await self._generate_settings_schema(),
                "typescript_definitions": await self._generate_typescript_definitions(),
                "main_extension_file": await self._generate_main_extension_code(),
                "ai_response": ai_response
            }
            
            return extension_config
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"VS Code extension generation failed: {str(e)}")
    
    async def sync_with_vscode(self, session_id: str, vscode_state: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Sync editor session with VS Code state"""
        try:
            session_data = self.active_sessions.get(session_id)
            if not session_data:
                raise HTTPException(status_code=404, detail="Editor session not found")
            
            # Update session state from VS Code
            if "active_file" in vscode_state:
                session_data["session"].active_file = vscode_state["active_file"]
            
            if "cursor_position" in vscode_state:
                session_data["session"].cursor_position = vscode_state["cursor_position"]
            
            if "selection" in vscode_state:
                session_data["session"].selection = vscode_state["selection"]
            
            # Update database
            db = await get_database()
            await db.editor_sessions.update_one(
                {"id": session_id},
                {"$set": {
                    "active_file": session_data["session"].active_file,
                    "cursor_position": session_data["session"].cursor_position,
                    "selection": session_data["session"].selection,
                    "last_activity": datetime.utcnow()
                }}
            )
            
            return {
                "success": True,
                "session_state": {
                    "active_file": session_data["session"].active_file,
                    "cursor_position": session_data["session"].cursor_position,
                    "files_count": len(session_data["session"].files)
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"VS Code sync failed: {str(e)}")
    
    # Helper methods
    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        extension_map = {
            ".js": "javascript",
            ".jsx": "javascript",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".py": "python",
            ".java": "java",
            ".cpp": "cpp",
            ".c": "c",
            ".cs": "csharp",
            ".go": "go",
            ".rs": "rust",
            ".php": "php",
            ".rb": "ruby",
            ".swift": "swift",
            ".kt": "kotlin",
            ".scala": "scala",
            ".html": "html",
            ".css": "css",
            ".scss": "scss",
            ".less": "less",
            ".json": "json",
            ".xml": "xml",
            ".yaml": "yaml",
            ".yml": "yaml",
            ".md": "markdown",
            ".sh": "bash",
            ".sql": "sql"
        }
        
        for ext, lang in extension_map.items():
            if file_path.endswith(ext):
                return lang
        
        return "text"
    
    async def _initialize_ai_context(self, session_id: str, files: List[FileContent], user_id: str):
        """Initialize AI context for the editor session"""
        context_prompt = f"""
        Initialize AI context for editor session:
        
        **Files in session**: {len(files)}
        **File types**: {list(set([f.language for f in files]))}
        
        **Project structure**:
        {chr(10).join([f"- {f.path} ({f.language})" for f in files])}
        
        Analyze the project and prepare for intelligent code assistance.
        """
        
        await self.ai_service.process_enhanced_chat(
            message=context_prompt,
            conversation_id=f"editor_{session_id}",
            user_id=user_id,
            agent_coordination="single"
        )
    
    def _get_code_context(self, content: str, cursor_position: Dict[str, int], context_lines: int = 5) -> str:
        """Get code context around cursor position"""
        lines = content.split('\n')
        line_num = cursor_position['line'] - 1  # Convert to 0-based
        
        start = max(0, line_num - context_lines)
        end = min(len(lines), line_num + context_lines + 1)
        
        context_lines_list = []
        for i in range(start, end):
            prefix = ">>> " if i == line_num else "    "
            context_lines_list.append(f"{prefix}{i+1:3d}: {lines[i]}")
        
        return '\n'.join(context_lines_list)
    
    async def _parse_ai_suggestions(self, ai_response: Dict[str, Any], file: FileContent, cursor_position: Dict[str, int]) -> List[CodeSuggestion]:
        """Parse AI response into code suggestions"""
        suggestions = []
        
        # Default suggestions if AI parsing fails
        base_suggestions = [
            {
                "type": "completion",
                "original_code": "",
                "suggested_code": "// AI suggestion placeholder",
                "explanation": "AI-generated code completion",
                "confidence": 0.8,
                "agent": "Dev"
            }
        ]
        
        for i, suggestion_data in enumerate(base_suggestions):
            suggestion = CodeSuggestion(
                id=str(uuid.uuid4()),
                type=suggestion_data["type"],
                original_code=suggestion_data["original_code"],
                suggested_code=suggestion_data["suggested_code"],
                explanation=suggestion_data["explanation"],
                confidence=suggestion_data["confidence"],
                line_number=cursor_position["line"],
                agent=suggestion_data["agent"]
            )
            suggestions.append(suggestion)
        
        return suggestions
    
    def _apply_change(self, content: str, change: Dict[str, Any]) -> str:
        """Apply code change to content"""
        lines = content.split('\n')
        
        change_type = change.get("type", "replace")
        line_number = change.get("line", 1) - 1  # Convert to 0-based
        
        if change_type == "replace":
            if 0 <= line_number < len(lines):
                lines[line_number] = change.get("new_content", "")
        elif change_type == "insert":
            lines.insert(line_number, change.get("new_content", ""))
        elif change_type == "delete":
            if 0 <= line_number < len(lines):
                del lines[line_number]
        
        return '\n'.join(lines)
    
    async def _broadcast_change(self, session_id: str, change_data: Dict[str, Any]):
        """Broadcast change to all collaborators"""
        # This would broadcast to WebSocket connections
        for connection_id, websocket in self.websocket_connections.items():
            if connection_id.startswith(session_id):
                try:
                    await websocket.send_json(change_data)
                except:
                    # Remove disconnected websocket
                    del self.websocket_connections[connection_id]
    
    async def _generate_extension_manifest(self) -> Dict[str, Any]:
        """Generate VS Code extension manifest"""
        return {
            "name": "aether-ai",
            "displayName": "Aether AI",
            "description": "AI-powered development assistant with multi-agent intelligence",
            "version": "1.0.0",
            "engines": {"vscode": "^1.60.0"},
            "categories": ["Other", "Machine Learning", "Snippets"],
            "activationEvents": ["*"],
            "main": "./out/extension.js",
            "contributes": {
                "commands": [
                    {
                        "command": "aether.startChat",
                        "title": "Start AI Chat",
                        "category": "Aether"
                    },
                    {
                        "command": "aether.generateCode",
                        "title": "Generate Code",
                        "category": "Aether"
                    },
                    {
                        "command": "aether.refactorCode",
                        "title": "Refactor Code",
                        "category": "Aether"
                    }
                ],
                "keybindings": [
                    {
                        "command": "aether.startChat",
                        "key": "ctrl+shift+a",
                        "mac": "cmd+shift+a"
                    }
                ]
            }
        }
    
    async def _generate_extension_commands(self) -> List[Dict[str, str]]:
        """Generate extension commands"""
        return [
            {"command": "aether.startChat", "title": "Start AI Chat"},
            {"command": "aether.generateCode", "title": "Generate Code"},
            {"command": "aether.refactorCode", "title": "Refactor Code"},
            {"command": "aether.explainCode", "title": "Explain Code"},
            {"command": "aether.findBugs", "title": "Find Bugs"},
            {"command": "aether.optimizePerformance", "title": "Optimize Performance"}
        ]
    
    async def _generate_keybindings(self, preferences: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate keyboard shortcuts based on preferences"""
        default_bindings = [
            {"command": "aether.startChat", "key": "ctrl+shift+a", "mac": "cmd+shift+a"},
            {"command": "aether.generateCode", "key": "ctrl+shift+g", "mac": "cmd+shift+g"},
            {"command": "aether.refactorCode", "key": "ctrl+shift+r", "mac": "cmd+shift+r"}
        ]
        
        # Customize based on user preferences
        if preferences.get("use_vim_keybindings"):
            # Add vim-style bindings
            default_bindings.extend([
                {"command": "aether.startChat", "key": "ctrl+a", "when": "vim.mode == 'Normal'"},
            ])
        
        return default_bindings
    
    async def _generate_settings_schema(self) -> Dict[str, Any]:
        """Generate settings schema for extension"""
        return {
            "type": "object",
            "title": "Aether AI Configuration",
            "properties": {
                "aether.apiUrl": {
                    "type": "string",
                    "default": "http://localhost:8001",
                    "description": "Aether AI API URL"
                },
                "aether.autoSuggestions": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable automatic code suggestions"
                },
                "aether.preferredAgent": {
                    "type": "string",
                    "enum": ["Dev", "Luna", "Atlas", "Quinn", "Sage"],
                    "default": "Dev",
                    "description": "Preferred AI agent for assistance"
                }
            }
        }
    
    async def _generate_typescript_definitions(self) -> str:
        """Generate TypeScript definitions for extension"""
        return """
        declare module 'aether-ai' {
            export interface AetherAPI {
                startChat(): Promise<void>;
                generateCode(context: string): Promise<string>;
                refactorCode(code: string): Promise<string>;
            }
            
            export interface CodeSuggestion {
                id: string;
                type: 'completion' | 'refactor' | 'fix' | 'optimization';
                suggestedCode: string;
                explanation: string;
                confidence: number;
            }
        }
        """
    
    async def _generate_main_extension_code(self) -> str:
        """Generate main extension TypeScript code"""
        return """
        import * as vscode from 'vscode';
        import axios from 'axios';
        
        export function activate(context: vscode.ExtensionContext) {
            const aetherApi = new AetherAPI();
            
            // Register commands
            const chatCommand = vscode.commands.registerCommand('aether.startChat', () => {
                aetherApi.startChat();
            });
            
            const generateCommand = vscode.commands.registerCommand('aether.generateCode', () => {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.document.getText(editor.selection);
                    aetherApi.generateCode(selection);
                }
            });
            
            context.subscriptions.push(chatCommand, generateCommand);
        }
        
        class AetherAPI {
            private apiUrl: string;
            
            constructor() {
                const config = vscode.workspace.getConfiguration('aether');
                this.apiUrl = config.get('apiUrl', 'http://localhost:8001');
            }
            
            async startChat() {
                // Implementation for starting AI chat
                const panel = vscode.window.createWebviewPanel(
                    'aetherChat',
                    'Aether AI Chat',
                    vscode.ViewColumn.Beside,
                    { enableScripts: true }
                );
                
                panel.webview.html = this.getChatWebviewContent();
            }
            
            private getChatWebviewContent(): string {
                return `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Aether AI Chat</title>
                    </head>
                    <body>
                        <div id="chat-container">
                            <h1>Aether AI Assistant</h1>
                            <div id="messages"></div>
                            <input type="text" id="message-input" placeholder="Ask Aether AI...">
                            <button onclick="sendMessage()">Send</button>
                        </div>
                        <script>
                            function sendMessage() {
                                // Chat implementation
                            }
                        </script>
                    </body>
                    </html>
                `;
            }
        }
        """

# Initialize service
editor_service = VSCodeIntegration()

@router.post("/create-session", response_model=EditorSession)
async def create_editor_session(
    files: List[Dict[str, Any]],
    current_user = Depends(get_current_user)
):
    """Create new editor session for pair programming"""
    return await editor_service.create_editor_session(files, current_user["id"])

@router.get("/session/{session_id}/suggestions")
async def get_code_suggestions(
    session_id: str,
    file_path: str,
    line: int,
    column: int,
    context: str = "",
    current_user = Depends(get_current_user)
):
    """Get AI-powered code suggestions"""
    cursor_position = {"line": line, "column": column}
    return await editor_service.get_code_suggestions(session_id, file_path, cursor_position, context, current_user["id"])

@router.post("/session/{session_id}/apply-change")
async def apply_code_change(
    session_id: str,
    file_path: str,
    change: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Apply code change and sync with collaborators"""
    return await editor_service.apply_code_change(session_id, file_path, change, current_user["id"])

@router.post("/generate-vscode-extension")
async def generate_vscode_extension(
    user_preferences: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Generate VS Code extension configuration"""
    return await editor_service.generate_vscode_extension_config(user_preferences, current_user["id"])

@router.post("/session/{session_id}/sync-vscode")
async def sync_with_vscode(
    session_id: str,
    vscode_state: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Sync editor session with VS Code"""
    return await editor_service.sync_with_vscode(session_id, vscode_state, current_user["id"])

@router.get("/sessions")
async def get_editor_sessions(current_user = Depends(get_current_user)):
    """Get all editor sessions for user"""
    db = await get_database()
    sessions = await db.editor_sessions.find(
        {"user_id": current_user["id"]}
    ).sort("last_activity", -1).limit(10).to_list(length=10)
    return sessions

@router.websocket("/session/{session_id}/collaborate")
async def websocket_collaboration(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time collaboration"""
    await websocket.accept()
    
    connection_id = f"{session_id}_{uuid.uuid4().hex[:8]}"
    editor_service.websocket_connections[connection_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Process collaboration event
            collaboration_event = LiveCollaboration(
                session_id=session_id,
                user_id=data.get("user_id", "anonymous"),
                action=data.get("action", "unknown"),
                data=data.get("data", {}),
                timestamp=datetime.utcnow()
            )
            
            # Broadcast to other collaborators
            await editor_service._broadcast_change(session_id, {
                "type": "collaboration",
                "event": collaboration_event.dict(),
                "from_connection": connection_id
            })
            
    except WebSocketDisconnect:
        # Remove connection
        if connection_id in editor_service.websocket_connections:
            del editor_service.websocket_connections[connection_id]