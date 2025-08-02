"""
Instant Development Environment Service
Provides immediate coding environments and live preview capabilities
"""
import asyncio
import json
import uuid
import tempfile
import subprocess
import shutil
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class EnvironmentType(Enum):
    REACT = "react"
    PYTHON = "python"
    NODE = "node"
    FULLSTACK = "fullstack"
    STATIC = "static"
    DOCKER = "docker"

class EnvironmentStatus(Enum):
    CREATING = "creating"
    READY = "ready"
    BUILDING = "building"
    RUNNING = "running"
    ERROR = "error"
    STOPPED = "stopped"

@dataclass
class DevEnvironment:
    id: str
    name: str
    type: EnvironmentType
    status: EnvironmentStatus
    files: Dict[str, str]  # filename -> content
    dependencies: List[str]
    environment_vars: Dict[str, str]
    ports: Dict[str, int]  # service -> port
    preview_url: Optional[str]
    created_at: datetime
    last_accessed: datetime
    user_id: str

@dataclass
class CodeExecution:
    id: str
    environment_id: str
    code: str
    language: str
    output: str
    error: Optional[str]
    execution_time: float
    timestamp: datetime

@dataclass
class LivePreview:
    environment_id: str
    preview_url: str
    auto_refresh: bool
    last_updated: datetime
    
class InstantDevEnvironmentService:
    def __init__(self, db_wrapper):
        self.db_wrapper = db_wrapper
        self.environments = {}
        self.active_previews = {}
        self.code_executions = {}
        self.base_workspace_path = "/tmp/ai_tempo_workspaces"
        
    async def initialize(self):
        """Initialize the Instant Development Environment Service"""
        logger.info("🚀 Initializing Instant Development Environment Service...")
        await self._setup_workspace_directory()
        await self._initialize_container_runtime()
        await self._start_preview_server()
        await self._cleanup_expired_environments()
        logger.info("✅ Instant Development Environment Service initialized")
    
    async def create_one_click_sandbox(self, project_idea: str, tech_stack: List[str], user_id: str) -> DevEnvironment:
        """Create an instant development environment for any idea"""
        try:
            env_id = f"env_{uuid.uuid4().hex[:8]}"
            env_type = self._determine_environment_type(tech_stack)
            
            # Create workspace directory
            workspace_path = os.path.join(self.base_workspace_path, env_id)
            os.makedirs(workspace_path, exist_ok=True)
            
            # Initialize environment
            environment = DevEnvironment(
                id=env_id,
                name=self._generate_environment_name(project_idea),
                type=env_type,
                status=EnvironmentStatus.CREATING,
                files={},
                dependencies=[],
                environment_vars={},
                ports={},
                preview_url=None,
                created_at=datetime.utcnow(),
                last_accessed=datetime.utcnow(),
                user_id=user_id
            )
            
            # Generate initial project structure
            initial_files = await self._generate_initial_project_structure(project_idea, tech_stack, env_type)
            environment.files = initial_files
            
            # Set up dependencies
            environment.dependencies = await self._determine_dependencies(tech_stack, env_type)
            
            # Create environment files
            await self._create_environment_files(workspace_path, environment)
            
            # Install dependencies and start services
            await self._setup_environment(workspace_path, environment)
            
            # Create live preview
            preview_url = await self._create_live_preview(environment)
            environment.preview_url = preview_url
            
            environment.status = EnvironmentStatus.READY
            self.environments[env_id] = environment
            
            logger.info(f"Created sandbox environment {env_id} for user {user_id}")
            return environment
            
        except Exception as e:
            logger.error(f"Sandbox creation error: {e}")
            if 'environment' in locals():
                environment.status = EnvironmentStatus.ERROR
            raise
    
    async def enable_live_code_streaming(self, environment_id: str) -> Dict[str, Any]:
        """Enable real-time code streaming for an environment"""
        try:
            if environment_id not in self.environments:
                raise ValueError("Environment not found")
            
            environment = self.environments[environment_id]
            
            # Set up WebSocket connection for live streaming
            stream_config = {
                "environment_id": environment_id,
                "websocket_url": f"wss://stream.aitempo.dev/{environment_id}",
                "events": ["file_change", "execution", "output", "error"],
                "auto_save": True,
                "auto_preview": True
            }
            
            # Initialize file watchers
            await self._setup_file_watchers(environment_id)
            
            # Start code execution streaming
            await self._start_execution_streaming(environment_id)
            
            return stream_config
            
        except Exception as e:
            logger.error(f"Live streaming setup error: {e}")
            return {}
    
    async def execute_code_instantly(self, environment_id: str, code: str, language: str) -> CodeExecution:
        """Execute code instantly with real-time output"""
        try:
            if environment_id not in self.environments:
                raise ValueError("Environment not found")
            
            environment = self.environments[environment_id]
            workspace_path = os.path.join(self.base_workspace_path, environment_id)
            
            execution_id = str(uuid.uuid4())
            start_time = datetime.utcnow()
            
            # Execute code based on language
            if language == "python":
                output, error = await self._execute_python_code(workspace_path, code)
            elif language in ["javascript", "js"]:
                output, error = await self._execute_javascript_code(workspace_path, code)
            elif language == "bash":
                output, error = await self._execute_bash_code(workspace_path, code)
            else:
                output, error = "", f"Language {language} not supported"
            
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            execution = CodeExecution(
                id=execution_id,
                environment_id=environment_id,
                code=code,
                language=language,
                output=output,
                error=error,
                execution_time=execution_time,
                timestamp=datetime.utcnow()
            )
            
            # Store execution history
            if environment_id not in self.code_executions:
                self.code_executions[environment_id] = []
            self.code_executions[environment_id].append(execution)
            
            # Update environment last accessed
            environment.last_accessed = datetime.utcnow()
            
            return execution
            
        except Exception as e:
            logger.error(f"Code execution error: {e}")
            return CodeExecution(
                id=str(uuid.uuid4()),
                environment_id=environment_id,
                code=code,
                language=language,
                output="",
                error=str(e),
                execution_time=0.0,
                timestamp=datetime.utcnow()
            )
    
    async def auto_generate_tests(self, environment_id: str, file_path: str) -> Dict[str, str]:
        """Auto-generate tests for code files"""
        try:
            if environment_id not in self.environments:
                raise ValueError("Environment not found")
            
            environment = self.environments[environment_id]
            
            if file_path not in environment.files:
                raise ValueError("File not found in environment")
            
            file_content = environment.files[file_path]
            file_extension = Path(file_path).suffix
            
            # Generate tests based on file type
            if file_extension in ['.py']:
                test_content = await self._generate_python_tests(file_content, file_path)
                test_filename = f"test_{Path(file_path).stem}.py"
            elif file_extension in ['.js', '.jsx', '.ts', '.tsx']:
                test_content = await self._generate_javascript_tests(file_content, file_path)
                test_filename = f"{Path(file_path).stem}.test.js"
            else:
                raise ValueError(f"Test generation not supported for {file_extension}")
            
            # Add test file to environment
            environment.files[test_filename] = test_content
            
            # Write test file to workspace
            workspace_path = os.path.join(self.base_workspace_path, environment_id)
            await self._write_file_to_workspace(workspace_path, test_filename, test_content)
            
            return {test_filename: test_content}
            
        except Exception as e:
            logger.error(f"Test generation error: {e}")
            return {}
    
    async def validate_code_instantly(self, environment_id: str, file_path: str) -> Dict[str, Any]:
        """Instant code validation and suggestions"""
        try:
            if environment_id not in self.environments:
                raise ValueError("Environment not found")
            
            environment = self.environments[environment_id]
            
            if file_path not in environment.files:
                raise ValueError("File not found")
            
            file_content = environment.files[file_path]
            file_extension = Path(file_path).suffix
            
            validation_results = {
                "file_path": file_path,
                "syntax_errors": [],
                "warnings": [],
                "suggestions": [],
                "performance_issues": [],
                "security_issues": [],
                "best_practices": []
            }
            
            # Run language-specific validation
            if file_extension == '.py':
                validation_results.update(await self._validate_python_code(file_content))
            elif file_extension in ['.js', '.jsx']:
                validation_results.update(await self._validate_javascript_code(file_content))
            elif file_extension in ['.ts', '.tsx']:
                validation_results.update(await self._validate_typescript_code(file_content))
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Code validation error: {e}")
            return {"error": str(e)}
    
    async def optimize_performance_automatically(self, environment_id: str) -> Dict[str, Any]:
        """Automatically optimize code performance"""
        try:
            if environment_id not in self.environments:
                raise ValueError("Environment not found")
            
            environment = self.environments[environment_id]
            optimizations = []
            
            # Analyze each file for optimization opportunities
            for file_path, content in environment.files.items():
                file_optimizations = await self._analyze_file_for_optimizations(file_path, content)
                if file_optimizations:
                    optimizations.extend(file_optimizations)
            
            # Apply automatic optimizations
            applied_optimizations = []
            for optimization in optimizations:
                if optimization.get("auto_apply", False):
                    success = await self._apply_optimization(environment_id, optimization)
                    if success:
                        applied_optimizations.append(optimization)
            
            return {
                "total_optimizations_found": len(optimizations),
                "auto_applied": len(applied_optimizations),
                "manual_review_needed": len(optimizations) - len(applied_optimizations),
                "optimizations": optimizations,
                "applied": applied_optimizations
            }
            
        except Exception as e:
            logger.error(f"Performance optimization error: {e}")
            return {"error": str(e)}
    
    async def scan_security_vulnerabilities(self, environment_id: str) -> Dict[str, Any]:
        """Scan for security vulnerabilities"""
        try:
            if environment_id not in self.environments:
                raise ValueError("Environment not found")
            
            environment = self.environments[environment_id]
            vulnerabilities = []
            
            # Scan dependencies for known vulnerabilities
            dependency_vulns = await self._scan_dependency_vulnerabilities(environment.dependencies)
            vulnerabilities.extend(dependency_vulns)
            
            # Scan code for security issues
            code_vulns = await self._scan_code_vulnerabilities(environment.files)
            vulnerabilities.extend(code_vulns)
            
            # Generate security report
            security_report = {
                "environment_id": environment_id,
                "scan_timestamp": datetime.utcnow().isoformat(),
                "total_vulnerabilities": len(vulnerabilities),
                "critical": len([v for v in vulnerabilities if v.get("severity") == "critical"]),
                "high": len([v for v in vulnerabilities if v.get("severity") == "high"]),
                "medium": len([v for v in vulnerabilities if v.get("severity") == "medium"]),
                "low": len([v for v in vulnerabilities if v.get("severity") == "low"]),
                "vulnerabilities": vulnerabilities,
                "recommendations": await self._generate_security_recommendations(vulnerabilities)
            }
            
            return security_report
            
        except Exception as e:
            logger.error(f"Security scan error: {e}")
            return {"error": str(e)}
    
    # Private helper methods
    def _determine_environment_type(self, tech_stack: List[str]) -> EnvironmentType:
        """Determine environment type from tech stack"""
        if any(tech in tech_stack for tech in ["react", "vue", "angular"]):
            if any(tech in tech_stack for tech in ["python", "fastapi", "django", "node", "express"]):
                return EnvironmentType.FULLSTACK
            return EnvironmentType.REACT
        elif any(tech in tech_stack for tech in ["python", "fastapi", "django"]):
            return EnvironmentType.PYTHON
        elif any(tech in tech_stack for tech in ["node", "express", "javascript"]):
            return EnvironmentType.NODE
        elif any(tech in tech_stack for tech in ["html", "css", "javascript"]):
            return EnvironmentType.STATIC
        else:
            return EnvironmentType.DOCKER
    
    def _generate_environment_name(self, project_idea: str) -> str:
        """Generate a friendly name for the environment"""
        # Extract key words from project idea
        words = project_idea.lower().split()[:3]
        name = "_".join(words)
        return f"sandbox_{name}_{uuid.uuid4().hex[:4]}"
    
    async def _generate_initial_project_structure(self, project_idea: str, tech_stack: List[str], env_type: EnvironmentType) -> Dict[str, str]:
        """Generate initial project files"""
        files = {}
        
        if env_type == EnvironmentType.REACT:
            files.update({
                "package.json": json.dumps({
                    "name": "ai-tempo-sandbox",
                    "version": "1.0.0",
                    "scripts": {
                        "start": "react-scripts start",
                        "build": "react-scripts build"
                    },
                    "dependencies": {
                        "react": "^18.0.0",
                        "react-dom": "^18.0.0",
                        "react-scripts": "^5.0.0"
                    }
                }, indent=2),
                "src/App.js": "import React from 'react';\n\nfunction App() {\n  return <div><h1>Hello AI Tempo!</h1></div>;\n}\n\nexport default App;",
                "src/index.js": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);",
                "public/index.html": "<!DOCTYPE html><html><head><title>AI Tempo Sandbox</title></head><body><div id='root'></div></body></html>"
            })
        elif env_type == EnvironmentType.PYTHON:
            files.update({
                "main.py": f"# {project_idea}\nprint('Hello from AI Tempo Sandbox!')\n",
                "requirements.txt": "fastapi==0.100.0\nuvicorn==0.22.0\n",
                "README.md": f"# {project_idea}\n\nGenerated by AI Tempo\n"
            })
        
        return files
    
    async def _determine_dependencies(self, tech_stack: List[str], env_type: EnvironmentType) -> List[str]:
        """Determine required dependencies"""
        dependencies = []
        
        if "react" in tech_stack:
            dependencies.extend(["react", "react-dom", "react-scripts"])
        if "fastapi" in tech_stack:
            dependencies.extend(["fastapi", "uvicorn"])
        if "mongodb" in tech_stack:
            dependencies.extend(["pymongo", "motor"])
        
        return dependencies
    
    async def _create_environment_files(self, workspace_path: str, environment: DevEnvironment):
        """Create physical files in workspace"""
        for file_path, content in environment.files.items():
            full_path = os.path.join(workspace_path, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, 'w') as f:
                f.write(content)
    
    async def _setup_environment(self, workspace_path: str, environment: DevEnvironment):
        """Set up and start the development environment"""
        try:
            if environment.type == EnvironmentType.REACT:
                # Install npm dependencies
                await self._run_command(workspace_path, ["npm", "install"])
                
                # Start development server in background
                process = await self._start_background_process(workspace_path, ["npm", "start"])
                environment.ports["react"] = 3000
                
            elif environment.type == EnvironmentType.PYTHON:
                # Install Python dependencies
                await self._run_command(workspace_path, ["pip", "install", "-r", "requirements.txt"])
                
                # Start FastAPI server if applicable
                if "fastapi" in environment.dependencies:
                    process = await self._start_background_process(workspace_path, ["uvicorn", "main:app", "--reload", "--port", "8000"])
                    environment.ports["api"] = 8000
                    
        except Exception as e:
            logger.error(f"Environment setup error: {e}")
            environment.status = EnvironmentStatus.ERROR
    
    async def _create_live_preview(self, environment: DevEnvironment) -> str:
        """Create live preview URL"""
        preview_id = f"preview_{environment.id}"
        preview_url = f"https://preview.aitempo.dev/{preview_id}"
        
        # Set up preview configuration
        preview_config = {
            "environment_id": environment.id,
            "ports": environment.ports,
            "auto_refresh": True,
            "created_at": datetime.utcnow()
        }
        
        self.active_previews[preview_id] = preview_config
        
        return preview_url
    
    # Placeholder methods for actual implementations
    async def _setup_workspace_directory(self):
        """Set up workspace directory"""
        os.makedirs(self.base_workspace_path, exist_ok=True)
    
    async def _initialize_container_runtime(self):
        """Initialize container runtime for isolated environments"""
        pass
    
    async def _start_preview_server(self):
        """Start preview server for live previews"""
        pass
    
    async def _cleanup_expired_environments(self):
        """Clean up expired environments"""
        pass
    
    async def _setup_file_watchers(self, environment_id: str):
        """Set up file system watchers"""
        pass
    
    async def _start_execution_streaming(self, environment_id: str):
        """Start code execution streaming"""
        pass
    
    async def _execute_python_code(self, workspace_path: str, code: str) -> Tuple[str, str]:
        """Execute Python code"""
        return "Output from Python code", None
    
    async def _execute_javascript_code(self, workspace_path: str, code: str) -> Tuple[str, str]:
        """Execute JavaScript code"""
        return "Output from JavaScript code", None
    
    async def _execute_bash_code(self, workspace_path: str, code: str) -> Tuple[str, str]:
        """Execute Bash code"""
        return "Output from Bash code", None
    
    async def _generate_python_tests(self, code: str, file_path: str) -> str:
        """Generate Python tests"""
        return f"# Test for {file_path}\nimport unittest\n\nclass TestCode(unittest.TestCase):\n    def test_example(self):\n        self.assertTrue(True)\n"
    
    async def _generate_javascript_tests(self, code: str, file_path: str) -> str:
        """Generate JavaScript tests"""
        return f"// Test for {file_path}\ntest('example test', () => {\n  expect(true).toBe(true);\n});\n"
    
    async def _write_file_to_workspace(self, workspace_path: str, filename: str, content: str):
        """Write file to workspace"""
        full_path = os.path.join(workspace_path, filename)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)
    
    async def _validate_python_code(self, content: str) -> Dict:
        """Validate Python code"""
        return {"syntax_errors": [], "warnings": [], "suggestions": []}
    
    async def _validate_javascript_code(self, content: str) -> Dict:
        """Validate JavaScript code"""
        return {"syntax_errors": [], "warnings": [], "suggestions": []}
    
    async def _validate_typescript_code(self, content: str) -> Dict:
        """Validate TypeScript code"""
        return {"syntax_errors": [], "warnings": [], "suggestions": []}
    
    async def _analyze_file_for_optimizations(self, file_path: str, content: str) -> List[Dict]:
        """Analyze file for optimization opportunities"""
        return []
    
    async def _apply_optimization(self, environment_id: str, optimization: Dict) -> bool:
        """Apply optimization to environment"""
        return True
    
    async def _scan_dependency_vulnerabilities(self, dependencies: List[str]) -> List[Dict]:
        """Scan dependencies for vulnerabilities"""
        return []
    
    async def _scan_code_vulnerabilities(self, files: Dict[str, str]) -> List[Dict]:
        """Scan code for vulnerabilities"""
        return []
    
    async def _generate_security_recommendations(self, vulnerabilities: List[Dict]) -> List[str]:
        """Generate security recommendations"""
        return ["Keep dependencies updated", "Use HTTPS", "Validate input data"]
    
    async def _run_command(self, workspace_path: str, command: List[str]) -> Tuple[str, str]:
        """Run command in workspace"""
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=workspace_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            return stdout.decode(), stderr.decode()
        except Exception as e:
            return "", str(e)
    
    async def _start_background_process(self, workspace_path: str, command: List[str]):
        """Start background process"""
        return await asyncio.create_subprocess_exec(
            *command,
            cwd=workspace_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )