import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import re

logger = logging.getLogger(__name__)

class AIService:
    """Advanced AI service with multiple capabilities"""
    
    def __init__(self):
        self.initialized = False
        self.models = {
            "chat": "gpt-4o-mini",
            "code": "gpt-4",
            "creative": "claude-3-sonnet"
        }
        
    async def initialize(self):
        """Initialize AI service"""
        try:
            # In production, initialize real AI providers here
            self.initialized = True
            logger.info("AI Service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AI service: {e}")
            raise
    
    async def process_message(self, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a user message and generate AI response"""
        try:
            # Analyze the message to determine the appropriate response type
            response_type = self._analyze_message_type(content)
            
            if response_type == "code_generation":
                return await self._generate_code(content, context)
            elif response_type == "project_creation":
                return await self._create_project_plan(content, context)
            elif response_type == "debugging":
                return await self._debug_code(content, context)
            elif response_type == "deployment":
                return await self._deployment_help(content, context)
            else:
                return await self._general_chat(content, context)
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "type": "error",
                "content": "I encountered an error processing your request. Please try again.",
                "error": str(e)
            }
    
    def _analyze_message_type(self, content: str) -> str:
        """Analyze message to determine response type"""
        content_lower = content.lower()
        
        if any(word in content_lower for word in ["build", "create", "make", "develop", "app", "website", "api"]):
            if any(word in content_lower for word in ["react", "vue", "angular", "frontend", "backend", "full-stack"]):
                return "project_creation"
        
        if any(word in content_lower for word in ["code", "function", "class", "component", "generate"]):
            return "code_generation"
            
        if any(word in content_lower for word in ["error", "bug", "debug", "fix", "issue", "problem"]):
            return "debugging"
            
        if any(word in content_lower for word in ["deploy", "deployment", "host", "hosting", "publish"]):
            return "deployment"
            
        return "general_chat"
    
    async def _generate_code(self, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate code based on user request"""
        # Extract programming language and requirements
        language = self._extract_language(content)
        
        # Generate comprehensive code response
        if "react" in content.lower():
            code = self._generate_react_code(content)
            explanation = "I've created a React component for you. This includes modern React patterns with hooks and proper styling."
        elif "api" in content.lower() or "backend" in content.lower():
            code = self._generate_api_code(content)
            explanation = "I've created a FastAPI backend structure for you. This includes proper routing, validation, and error handling."
        elif "database" in content.lower():
            code = self._generate_database_code(content)
            explanation = "I've created database models and queries for you. This includes proper indexing and relationships."
        else:
            code = self._generate_generic_code(content, language)
            explanation = f"I've generated {language} code based on your requirements. The code follows best practices and includes error handling."
        
        return {
            "type": "code",
            "content": explanation,
            "code": code,
            "language": language,
            "metadata": {
                "can_save": True,
                "can_run": True,
                "suggestions": self._get_code_suggestions(content)
            }
        }
    
    async def _create_project_plan(self, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a comprehensive project plan"""
        project_type = self._determine_project_type(content)
        
        plan = {
            "type": "project_plan",
            "content": f"I'll help you build a {project_type}! Here's a comprehensive plan:",
            "project_type": project_type,
            "structure": self._generate_project_structure(project_type),
            "files": self._generate_initial_files(project_type),
            "next_steps": [
                "Set up the project structure",
                "Install dependencies",
                "Create the core components",
                "Add styling and UI",
                "Test the application",
                "Deploy to production"
            ],
            "metadata": {
                "can_create": True,
                "estimated_time": "30-60 minutes",
                "difficulty": "Beginner to Intermediate"
            }
        }
        
        return plan
    
    async def _debug_code(self, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Help debug code issues"""
        return {
            "type": "debugging",
            "content": """I can help you debug that issue! Here are some common solutions:

**Common Issues & Solutions:**
1. **Import Errors**: Check if all dependencies are installed
2. **Syntax Errors**: Review brackets, semicolons, and indentation
3. **Runtime Errors**: Add proper error handling and validation
4. **Performance Issues**: Optimize algorithms and database queries

**Debugging Steps:**
1. Check the console/logs for error messages
2. Verify all imports and dependencies
3. Test with smaller data sets
4. Add logging and breakpoints
5. Review recent changes

Would you like me to look at specific code or error messages?""",
            "suggestions": [
                "Share the error message",
                "Show the problematic code",
                "Describe what you expected vs what happened"
            ],
            "metadata": {
                "type": "debugging_help"
            }
        }
    
    async def _deployment_help(self, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Help with deployment"""
        return {
            "type": "deployment",
            "content": """I'll help you deploy your application! Here are popular deployment options:

**Frontend Deployment:**
- **Vercel**: Perfect for React/Next.js apps
- **Netlify**: Great for static sites and SPAs
- **GitHub Pages**: Free hosting for static sites

**Backend Deployment:**
- **Railway**: Simple and modern platform
- **Heroku**: Traditional PaaS platform
- **DigitalOcean**: VPS for full control

**Database Options:**
- **MongoDB Atlas**: Cloud MongoDB
- **Supabase**: PostgreSQL with real-time features
- **PlanetScale**: Serverless MySQL

**Deployment Steps:**
1. Prepare your code for production
2. Set up environment variables
3. Choose a hosting platform
4. Configure build settings
5. Deploy and test
6. Set up custom domain (optional)

Which type of application are you looking to deploy?""",
            "platforms": ["Vercel", "Netlify", "Railway", "Heroku"],
            "metadata": {
                "type": "deployment_guide"
            }
        }
    
    async def _general_chat(self, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle general chat messages"""
        responses = [
            "I'm here to help you build amazing applications! I can assist with:",
            "• Creating React, Vue, or Angular applications",
            "• Building APIs and backend services", 
            "• Setting up databases and authentication",
            "• Deploying your applications",
            "• Debugging and troubleshooting",
            "",
            "What would you like to work on today?"
        ]
        
        return {
            "type": "chat",
            "content": "\n".join(responses),
            "suggestions": [
                "Build a React app",
                "Create an API",
                "Set up authentication", 
                "Deploy my app"
            ],
            "metadata": {
                "type": "general_help"
            }
        }
    
    def _extract_language(self, content: str) -> str:
        """Extract programming language from content"""
        language_keywords = {
            "python": ["python", "django", "flask", "fastapi"],
            "javascript": ["javascript", "js", "react", "vue", "angular", "node"],
            "typescript": ["typescript", "ts"],
            "html": ["html", "markup"],
            "css": ["css", "styling", "styles"],
            "sql": ["sql", "database", "query"]
        }
        
        content_lower = content.lower()
        for lang, keywords in language_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                return lang
        
        return "javascript"  # Default
    
    def _determine_project_type(self, content: str) -> str:
        """Determine the type of project to create"""
        content_lower = content.lower()
        
        if "react" in content_lower:
            return "React Application"
        elif "api" in content_lower or "backend" in content_lower:
            return "API Service"
        elif "full-stack" in content_lower or "fullstack" in content_lower:
            return "Full-Stack Application"
        elif "mobile" in content_lower:
            return "Mobile Application"
        elif "website" in content_lower or "landing" in content_lower:
            return "Website"
        else:
            return "Web Application"
    
    def _generate_react_code(self, content: str) -> str:
        """Generate React component code"""
        return """import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data or initialize component
    const initializeApp = async () => {
      try {
        // Add your initialization logic here
        setLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Your React App</h1>
        <p>Start building something amazing!</p>
      </header>
      <main className="App-main">
        {/* Add your main content here */}
      </main>
    </div>
  );
}

export default App;"""
    
    def _generate_api_code(self, content: str) -> str:
        """Generate API code"""
        return """from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Your API", version="1.0.0")

# Pydantic models
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    
    class Config:
        orm_mode = True

# In-memory storage (replace with database)
items = []
next_id = 1

@app.get("/")
async def root():
    return {"message": "Welcome to your API!"}

@app.get("/items/", response_model=List[Item])
async def get_items():
    return items

@app.post("/items/", response_model=Item)
async def create_item(item: ItemCreate):
    global next_id
    new_item = Item(id=next_id, **item.dict())
    items.append(new_item)
    next_id += 1
    return new_item

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)"""
    
    def _generate_database_code(self, content: str) -> str:
        """Generate database code"""
        return """from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()"""
    
    def _generate_generic_code(self, content: str, language: str) -> str:
        """Generate generic code"""
        if language == "python":
            return """def main():
    \"\"\"Main function for your application\"\"\"
    print("Hello, World!")
    
    # Add your code here
    pass

if __name__ == "__main__":
    main()"""
        else:
            return """function main() {
    // Your code here
    console.log("Hello, World!");
}

main();"""
    
    def _generate_project_structure(self, project_type: str) -> Dict[str, Any]:
        """Generate project structure based on type"""
        if "React" in project_type:
            return {
                "src/": {
                    "components/": ["Header.jsx", "Footer.jsx", "Layout.jsx"],
                    "pages/": ["Home.jsx", "About.jsx"],
                    "hooks/": ["useApi.js"],
                    "utils/": ["helpers.js"],
                    "styles/": ["App.css", "index.css"]
                },
                "public/": ["index.html", "favicon.ico"],
                "package.json": "dependencies",
                "README.md": "documentation"
            }
        elif "API" in project_type:
            return {
                "app/": {
                    "models/": ["user.py", "item.py"],
                    "routes/": ["auth.py", "api.py"],
                    "services/": ["database.py"],
                    "utils/": ["helpers.py"]
                },
                "requirements.txt": "dependencies",
                "main.py": "entry point",
                ".env": "environment variables"
            }
        else:
            return {
                "src/": "source code",
                "assets/": "static files", 
                "config/": "configuration",
                "README.md": "documentation"
            }
    
    def _generate_initial_files(self, project_type: str) -> List[Dict[str, str]]:
        """Generate initial files for the project"""
        if "React" in project_type:
            return [
                {
                    "path": "src/App.jsx",
                    "content": self._generate_react_code(""),
                    "language": "javascript"
                },
                {
                    "path": "package.json",
                    "content": """{
  "name": "react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}""",
                    "language": "json"
                }
            ]
        return []
    
    def _get_code_suggestions(self, content: str) -> List[str]:
        """Get suggestions for the generated code"""
        return [
            "Add error handling",
            "Include unit tests",
            "Add TypeScript types",
            "Implement validation",
            "Add documentation"
        ]