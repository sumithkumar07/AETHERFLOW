from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import os
import logging
import uuid
import json
import re
from datetime import datetime
import asyncio
import aiohttp
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="VibeCode API", description="Web-based coding IDE like emergent.ai")

# Create API router
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Hugging Face Configuration
HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models"

# === MODELS ===

class FileNode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # 'file' or 'folder'
    content: Optional[str] = None  # Only for files
    parent_id: Optional[str] = None
    project_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None

class CreateFileRequest(BaseModel):
    name: str
    type: str
    parent_id: Optional[str] = None
    content: Optional[str] = ""

class UpdateFileRequest(BaseModel):
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    context: Optional[Dict[str, Any]] = None

class CodeCompletionRequest(BaseModel):
    code: str
    language: str
    position: Dict[str, int]  # {line: int, column: int}
    context: Optional[Dict[str, Any]] = None

class CodeReviewRequest(BaseModel):
    code: str
    language: str
    filename: Optional[str] = None

class DebugRequest(BaseModel):
    code: str
    error_message: Optional[str] = None
    language: str
    filename: Optional[str] = None

class DocumentationRequest(BaseModel):
    code: str
    language: str
    function_name: Optional[str] = None

class SecurityScanRequest(BaseModel):
    code: str
    language: str
    filename: Optional[str] = None

class RefactorRequest(BaseModel):
    code: str
    language: str
    focus_area: Optional[str] = None  # 'performance', 'readability', 'security'

class NaturalLanguageRequest(BaseModel):
    description: str
    language: str
    context: Optional[Dict[str, Any]] = None

# === ADVANCED AI INTEGRATION ===

class AdvancedAIEngine:
    def __init__(self):
        self.api_key = HUGGINGFACE_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"}
        
        # Best models for different tasks
        self.models = {
            "code_completion": "bigcode/starcoder2-15b",
            "code_generation": "codellama/CodeLlama-13b-Instruct-hf",
            "chat": "microsoft/DialoGPT-large",
            "code_review": "bigcode/starcoder2-15b",
            "documentation": "microsoft/DialoGPT-large",
            "security": "bigcode/starcoder2-15b"
        }
        
    async def _call_huggingface_api(self, model: str, payload: Dict) -> Dict:
        """Generic HuggingFace API call"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{HUGGINGFACE_API_URL}/{model}",
                    headers=self.headers,
                    json=payload,
                    timeout=30
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        logger.error(f"HF API Error: {response.status} - {error_text}")
                        return {"error": f"API Error: {response.status}"}
        except Exception as e:
            logger.error(f"HuggingFace API error: {e}")
            return {"error": str(e)}

    async def get_code_completion(self, code: str, language: str, position: Dict) -> Dict:
        """Real-time code completion like GitHub Copilot"""
        try:
            # Extract context around cursor position
            lines = code.split('\n')
            current_line = position.get('line', 0)
            
            # Get context - previous lines for better completion
            context_lines = max(0, current_line - 10)
            context_code = '\n'.join(lines[context_lines:current_line + 1])
            
            completion_prompt = f"""// Language: {language}
// Complete the following code with intelligent suggestions:

{context_code}"""
            
            payload = {
                "inputs": completion_prompt,
                "parameters": {
                    "max_length": 150,
                    "temperature": 0.2,
                    "do_sample": True,
                    "top_p": 0.9,
                    "stop": ["\n\n", "```", "//", "#"]
                }
            }
            
            result = await self._call_huggingface_api(self.models["code_completion"], payload)
            
            if "error" in result:
                return {"suggestions": [], "error": result["error"]}
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(completion_prompt):
                    completion = generated_text[len(completion_prompt):].strip()
                    
                    # Clean and format suggestions
                    suggestions = []
                    if completion:
                        # Split by common delimiters and take first few suggestions
                        parts = completion.split('\n')
                        for part in parts[:3]:  # Top 3 suggestions
                            if part.strip() and not part.strip().startswith('//'):
                                suggestions.append({
                                    "text": part.strip(),
                                    "type": "code",
                                    "confidence": 0.8
                                })
                    
                    return {"suggestions": suggestions}
            
            return {"suggestions": []}
            
        except Exception as e:
            logger.error(f"Code completion error: {e}")
            return {"suggestions": [], "error": str(e)}

    async def review_code(self, code: str, language: str, filename: str = None) -> Dict:
        """Comprehensive code review - security, performance, best practices"""
        try:
            review_prompt = f"""Perform a comprehensive code review for this {language} code:

```{language}
{code}
```

Analyze for:
1. Security vulnerabilities
2. Performance issues  
3. Code quality and best practices
4. Bug potential
5. Maintainability concerns

Provide specific, actionable feedback with line references where possible."""

            payload = {
                "inputs": review_prompt,
                "parameters": {
                    "max_length": 800,
                    "temperature": 0.3,
                    "do_sample": True,
                    "top_p": 0.9
                }
            }
            
            result = await self._call_huggingface_api(self.models["code_review"], payload)
            
            if "error" in result:
                return {"issues": [], "error": result["error"]}
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(review_prompt):
                    review_text = generated_text[len(review_prompt):].strip()
                    
                    # Parse review into structured issues
                    issues = self._parse_code_review(review_text)
                    return {
                        "issues": issues,
                        "overall_score": self._calculate_code_score(issues),
                        "summary": review_text[:200] + "..." if len(review_text) > 200 else review_text
                    }
            
            return {"issues": [], "summary": "No issues found"}
            
        except Exception as e:
            logger.error(f"Code review error: {e}")
            return {"issues": [], "error": str(e)}

    def _parse_code_review(self, review_text: str) -> List[Dict]:
        """Parse AI review text into structured issues"""
        issues = []
        lines = review_text.split('\n')
        
        current_issue = {}
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect issue types
            if any(keyword in line.lower() for keyword in ['security', 'vulnerability', 'injection']):
                if current_issue:
                    issues.append(current_issue)
                current_issue = {
                    "type": "security",
                    "severity": "high",
                    "message": line,
                    "line": None
                }
            elif any(keyword in line.lower() for keyword in ['performance', 'slow', 'inefficient']):
                if current_issue:
                    issues.append(current_issue)
                current_issue = {
                    "type": "performance", 
                    "severity": "medium",
                    "message": line,
                    "line": None
                }
            elif any(keyword in line.lower() for keyword in ['bug', 'error', 'issue']):
                if current_issue:
                    issues.append(current_issue)
                current_issue = {
                    "type": "bug",
                    "severity": "high", 
                    "message": line,
                    "line": None
                }
            elif current_issue:
                current_issue["message"] += f" {line}"
        
        if current_issue:
            issues.append(current_issue)
            
        return issues[:10]  # Limit to 10 issues

    def _calculate_code_score(self, issues: List[Dict]) -> int:
        """Calculate code quality score (0-100)"""
        if not issues:
            return 95
            
        score = 100
        for issue in issues:
            if issue["severity"] == "high":
                score -= 15
            elif issue["severity"] == "medium":
                score -= 10
            else:
                score -= 5
                
        return max(score, 0)

    async def debug_code(self, code: str, error_message: str = None, language: str = "python") -> Dict:
        """AI-powered debugging assistance"""
        try:
            debug_prompt = f"""Debug this {language} code and provide solutions:

Code:
```{language}
{code}
```

{'Error message: ' + error_message if error_message else ''}

Analyze the code and provide:
1. Potential issues and bugs
2. Specific fixes with corrected code
3. Explanation of the problems
4. Best practices to prevent similar issues"""

            payload = {
                "inputs": debug_prompt,
                "parameters": {
                    "max_length": 800,
                    "temperature": 0.3,
                    "do_sample": True,
                    "top_p": 0.9
                }
            }
            
            result = await self._call_huggingface_api(self.models["code_generation"], payload)
            
            if "error" in result:
                return {"fixes": [], "error": result["error"]}
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(debug_prompt):
                    debug_response = generated_text[len(debug_prompt):].strip()
                    
                    return {
                        "analysis": debug_response,
                        "fixes": self._extract_code_fixes(debug_response),
                        "confidence": 0.8
                    }
            
            return {"analysis": "Unable to debug code", "fixes": []}
            
        except Exception as e:
            logger.error(f"Debug error: {e}")
            return {"analysis": f"Debug error: {str(e)}", "fixes": []}

    def _extract_code_fixes(self, debug_text: str) -> List[Dict]:
        """Extract code fixes from debug response"""
        fixes = []
        
        # Look for code blocks in the response
        code_blocks = re.findall(r'```\w*\n(.*?)\n```', debug_text, re.DOTALL)
        
        for i, code_block in enumerate(code_blocks):
            fixes.append({
                "description": f"Fix #{i+1}",
                "code": code_block.strip(),
                "type": "code_replacement"
            })
            
        return fixes

    async def generate_documentation(self, code: str, language: str, function_name: str = None) -> Dict:
        """Generate comprehensive documentation for code"""
        try:
            doc_prompt = f"""Generate comprehensive documentation for this {language} code:

```{language}
{code}
```

Generate:
1. Function/class descriptions
2. Parameter documentation
3. Return value documentation
4. Usage examples
5. Any important notes or warnings

Format as clear, professional documentation."""

            payload = {
                "inputs": doc_prompt,
                "parameters": {
                    "max_length": 600,
                    "temperature": 0.2,
                    "do_sample": True,
                    "top_p": 0.9
                }
            }
            
            result = await self._call_huggingface_api(self.models["documentation"], payload)
            
            if "error" in result:
                return {"documentation": "", "error": result["error"]}
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(doc_prompt):
                    documentation = generated_text[len(doc_prompt):].strip()
                    
                    return {
                        "documentation": documentation,
                        "format": "markdown"
                    }
            
            return {"documentation": "Unable to generate documentation"}
            
        except Exception as e:
            logger.error(f"Documentation error: {e}")
            return {"documentation": f"Documentation error: {str(e)}"}

    async def scan_security(self, code: str, language: str) -> Dict:
        """Security vulnerability scanning"""
        try:
            security_prompt = f"""Scan this {language} code for security vulnerabilities:

```{language}
{code}
```

Identify:
1. SQL injection risks
2. XSS vulnerabilities
3. Authentication issues
4. Input validation problems
5. Data exposure risks
6. Other security concerns

Provide specific line references and fixes."""

            payload = {
                "inputs": security_prompt,
                "parameters": {
                    "max_length": 600,
                    "temperature": 0.2,
                    "do_sample": True,
                    "top_p": 0.9
                }
            }
            
            result = await self._call_huggingface_api(self.models["security"], payload)
            
            if "error" in result:
                return {"vulnerabilities": [], "error": result["error"]}
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(security_prompt):
                    security_analysis = generated_text[len(security_prompt):].strip()
                    
                    vulnerabilities = self._parse_security_issues(security_analysis)
                    return {
                        "vulnerabilities": vulnerabilities,
                        "risk_score": self._calculate_risk_score(vulnerabilities),
                        "analysis": security_analysis
                    }
            
            return {"vulnerabilities": [], "risk_score": 0}
            
        except Exception as e:
            logger.error(f"Security scan error: {e}")
            return {"vulnerabilities": [], "error": str(e)}

    def _parse_security_issues(self, analysis: str) -> List[Dict]:
        """Parse security analysis into structured vulnerabilities"""
        vulnerabilities = []
        lines = analysis.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['injection', 'xss', 'vulnerability', 'security']):
                vulnerabilities.append({
                    "type": "security",
                    "description": line,
                    "severity": "high" if any(high in line.lower() for high in ['critical', 'high', 'severe']) else "medium"
                })
        
        return vulnerabilities[:5]  # Top 5 security issues

    def _calculate_risk_score(self, vulnerabilities: List[Dict]) -> int:
        """Calculate security risk score (0-100, higher is worse)"""
        if not vulnerabilities:
            return 0
            
        risk_score = 0
        for vuln in vulnerabilities:
            if vuln["severity"] == "high":
                risk_score += 25
            elif vuln["severity"] == "medium":
                risk_score += 15
            else:
                risk_score += 10
                
        return min(risk_score, 100)

    async def refactor_code(self, code: str, language: str, focus_area: str = "readability") -> Dict:
        """Suggest code refactoring improvements"""
        try:
            refactor_prompt = f"""Refactor this {language} code focusing on {focus_area}:

```{language}
{code}
```

Provide:
1. Refactored code
2. Explanation of changes
3. Benefits of the refactoring
4. Any trade-offs to consider

Focus on {focus_area} improvements."""

            payload = {
                "inputs": refactor_prompt,
                "parameters": {
                    "max_length": 700,
                    "temperature": 0.3,
                    "do_sample": True,
                    "top_p": 0.9
                }
            }
            
            result = await self._call_huggingface_api(self.models["code_generation"], payload)
            
            if "error" in result:
                return {"refactored_code": "", "error": result["error"]}
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(refactor_prompt):
                    refactor_response = generated_text[len(refactor_prompt):].strip()
                    
                    refactored_code = self._extract_refactored_code(refactor_response)
                    return {
                        "refactored_code": refactored_code,
                        "explanation": refactor_response,
                        "focus_area": focus_area
                    }
            
            return {"refactored_code": code, "explanation": "No refactoring suggestions"}
            
        except Exception as e:
            logger.error(f"Refactor error: {e}")
            return {"refactored_code": code, "error": str(e)}

    def _extract_refactored_code(self, refactor_text: str) -> str:
        """Extract refactored code from response"""
        # Look for code blocks in the response
        code_blocks = re.findall(r'```\w*\n(.*?)\n```', refactor_text, re.DOTALL)
        
        if code_blocks:
            return code_blocks[0].strip()
        
        return ""

    async def natural_language_to_code(self, description: str, language: str, context: Dict = None) -> Dict:
        """Generate code from natural language description"""
        try:
            context_info = ""
            if context:
                if context.get('current_file'):
                    context_info = f"\nCurrent file context:\n{context['current_file'][:500]}"
                if context.get('project_structure'):
                    context_info += f"\nProject structure: {context['project_structure']}"

            nl_prompt = f"""Generate {language} code based on this description:

Description: {description}
{context_info}

Requirements:
- Write clean, functional {language} code
- Include error handling where appropriate
- Add comments explaining key parts
- Follow {language} best practices
- Make the code production-ready

Generate the complete code:"""

            payload = {
                "inputs": nl_prompt,
                "parameters": {
                    "max_length": 800,
                    "temperature": 0.4,
                    "do_sample": True,
                    "top_p": 0.9
                }
            }
            
            result = await self._call_huggingface_api(self.models["code_generation"], payload)
            
            if "error" in result:
                return {"code": "", "error": result["error"]}
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(nl_prompt):
                    generated_code = generated_text[len(nl_prompt):].strip()
                    
                    # Extract code blocks if present
                    code_blocks = re.findall(r'```\w*\n(.*?)\n```', generated_code, re.DOTALL)
                    if code_blocks:
                        generated_code = code_blocks[0].strip()
                    
                    return {
                        "code": generated_code,
                        "language": language,
                        "description": description
                    }
            
            return {"code": "// Unable to generate code from description", "language": language}
            
        except Exception as e:
            logger.error(f"Natural language to code error: {e}")
            return {"code": f"// Error: {str(e)}", "error": str(e)}

    async def chat_with_ai(self, message: str, context: Optional[Dict] = None) -> str:
        """Enhanced AI chat with better context understanding"""
        try:
            # Build comprehensive system prompt
            system_prompt = """You are an expert programming assistant with deep knowledge of:
- Multiple programming languages and frameworks
- Code architecture and design patterns
- Debugging and optimization techniques
- Security best practices
- Modern development workflows

Provide helpful, accurate, and practical responses. When showing code, make it production-ready."""
            
            context_info = ""
            if context:
                if context.get('current_file'):
                    context_info = f"\n\nCurrent file context:\n```\n{context['current_file'][:500]}...\n```"
                if context.get('recent_errors'):
                    context_info += f"\nRecent errors: {context['recent_errors']}"
                if context.get('project_type'):
                    context_info += f"\nProject type: {context['project_type']}"
            
            full_prompt = f"{system_prompt}\n\nUser: {message}{context_info}\n\nAssistant:"
            
            return await self.generate_code(full_prompt, "microsoft/DialoGPT-large")
            
        except Exception as e:
            logger.error(f"Enhanced chat error: {e}")
            return f"Sorry, I encountered an error: {str(e)}"

    async def generate_code(self, prompt: str, model: str = "bigcode/starcoder2-15b") -> str:
        """Enhanced code generation with better formatting"""
        try:
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_length": 512,
                    "temperature": 0.3,
                    "do_sample": True,
                    "top_p": 0.95
                }
            }
            
            result = await self._call_huggingface_api(model, payload)
            
            if "error" in result:
                return f"Error: {result['error']}"
                
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text.startswith(prompt):
                    generated_text = generated_text[len(prompt):].strip()
                return generated_text
            
            return "No response generated"
            
        except Exception as e:
            logger.error(f"Code generation error: {e}")
            return f"Error: {str(e)}"

# Initialize the advanced AI engine
ai_engine = AdvancedAIEngine()

# === API ENDPOINTS ===

# Health check
@api_router.get("/")
async def root():
    return {"message": "VibeCode API is running!", "status": "healthy"}

# === PROJECT MANAGEMENT ===

@api_router.post("/projects", response_model=Project)
async def create_project(request: CreateProjectRequest):
    project = Project(name=request.name, description=request.description)
    await db.projects.insert_one(project.dict())
    
    # Create root folder for the project
    root_folder = FileNode(
        name=project.name,
        type="folder",
        project_id=project.id,
        parent_id=None
    )
    await db.files.insert_one(root_folder.dict())
    
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find().to_list(100)
    return [Project(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    # Delete project and all associated files
    await db.projects.delete_one({"id": project_id})
    await db.files.delete_many({"project_id": project_id})
    return {"message": "Project deleted successfully"}

# === FILE MANAGEMENT ===

@api_router.get("/projects/{project_id}/files", response_model=List[FileNode])
async def get_project_files(project_id: str):
    files = await db.files.find({"project_id": project_id}).to_list(1000)
    return [FileNode(**file) for file in files]

@api_router.post("/projects/{project_id}/files", response_model=FileNode)
async def create_file(project_id: str, request: CreateFileRequest):
    file_node = FileNode(
        name=request.name,
        type=request.type,
        content=request.content if request.type == "file" else None,
        parent_id=request.parent_id,
        project_id=project_id
    )
    await db.files.insert_one(file_node.dict())
    return file_node

@api_router.get("/files/{file_id}", response_model=FileNode)
async def get_file(file_id: str):
    file = await db.files.find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return FileNode(**file)

@api_router.put("/files/{file_id}")
async def update_file(file_id: str, request: UpdateFileRequest):
    result = await db.files.update_one(
        {"id": file_id},
        {"$set": {"content": request.content, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File updated successfully"}

@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    # Delete file and all child files if it's a folder
    file = await db.files.find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if file["type"] == "folder":
        # Delete all children recursively
        await db.files.delete_many({"parent_id": file_id})
    
    await db.files.delete_one({"id": file_id})
    return {"message": "File deleted successfully"}

# === AI CHAT ENDPOINTS ===

@api_router.post("/ai/chat")
async def chat_with_ai_endpoint(request: ChatRequest):
    try:
        response = await ai_engine.chat_with_ai(request.message, request.context)
        
        # Save chat message to database
        chat_message = ChatMessage(
            session_id=request.session_id,
            message=request.message,
            response=response
        )
        await db.chat_messages.insert_one(chat_message.dict())
        
        return {"response": response, "session_id": request.session_id}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat service unavailable")

@api_router.get("/ai/chat/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find({"session_id": session_id}).to_list(100)
    return [ChatMessage(**msg) for msg in messages]

@api_router.post("/ai/generate-code")
async def generate_code_endpoint(request: ChatRequest):
    try:
        code = await ai_engine.generate_code(request.message)
        return {"generated_code": code, "session_id": request.session_id}
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail="Code generation service unavailable")

# === ADVANCED AI ENDPOINTS ===

@api_router.post("/ai/code-completion")
async def code_completion_endpoint(request: CodeCompletionRequest):
    """Real-time code completion like GitHub Copilot"""
    try:
        result = await ai_engine.get_code_completion(
            request.code, 
            request.language, 
            request.position
        )
        return result
    except Exception as e:
        logger.error(f"Code completion error: {e}")
        raise HTTPException(status_code=500, detail="Code completion service unavailable")

@api_router.post("/ai/code-review")
async def code_review_endpoint(request: CodeReviewRequest):
    """Comprehensive code review - security, performance, best practices"""
    try:
        result = await ai_engine.review_code(
            request.code,
            request.language,
            request.filename
        )
        return result
    except Exception as e:
        logger.error(f"Code review error: {e}")
        raise HTTPException(status_code=500, detail="Code review service unavailable")

@api_router.post("/ai/debug")
async def debug_code_endpoint(request: DebugRequest):
    """AI-powered debugging assistance"""
    try:
        result = await ai_engine.debug_code(
            request.code,
            request.error_message,
            request.language
        )
        return result
    except Exception as e:
        logger.error(f"Debug error: {e}")
        raise HTTPException(status_code=500, detail="Debug service unavailable")

@api_router.post("/ai/documentation")
async def generate_documentation_endpoint(request: DocumentationRequest):
    """Generate comprehensive documentation for code"""
    try:
        result = await ai_engine.generate_documentation(
            request.code,
            request.language,
            request.function_name
        )
        return result
    except Exception as e:
        logger.error(f"Documentation error: {e}")
        raise HTTPException(status_code=500, detail="Documentation service unavailable")

@api_router.post("/ai/security-scan")
async def security_scan_endpoint(request: SecurityScanRequest):
    """Security vulnerability scanning"""
    try:
        result = await ai_engine.scan_security(
            request.code,
            request.language
        )
        return result
    except Exception as e:
        logger.error(f"Security scan error: {e}")
        raise HTTPException(status_code=500, detail="Security scan service unavailable")

@api_router.post("/ai/refactor")
async def refactor_code_endpoint(request: RefactorRequest):
    """Suggest code refactoring improvements"""
    try:
        result = await ai_engine.refactor_code(
            request.code,
            request.language,
            request.focus_area or "readability"
        )
        return result
    except Exception as e:
        logger.error(f"Refactor error: {e}")
        raise HTTPException(status_code=500, detail="Refactor service unavailable")

@api_router.post("/ai/natural-language-to-code")
async def natural_language_to_code_endpoint(request: NaturalLanguageRequest):
    """Generate code from natural language description"""
    try:
        result = await ai_engine.natural_language_to_code(
            request.description,
            request.language,
            request.context
        )
        return result
    except Exception as e:
        logger.error(f"Natural language to code error: {e}")
        raise HTTPException(status_code=500, detail="Natural language to code service unavailable")

# === WEBSOCKET FOR REAL-TIME AI ===

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/ai/{session_id}")
async def websocket_ai_chat(websocket: WebSocket, session_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process AI request
            response = await ai_engine.chat_with_ai(
                message_data.get("message", ""),
                message_data.get("context")
            )
            
            # Send response back
            await manager.send_personal_message(
                json.dumps({
                    "type": "ai_response",
                    "message": response,
                    "session_id": session_id
                }),
                websocket
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include the API router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)