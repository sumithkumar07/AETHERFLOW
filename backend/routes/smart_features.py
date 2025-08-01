from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime, timedelta
from pydantic import BaseModel
import re
import difflib

router = APIRouter()
security = HTTPBearer()

# Pydantic models for smart features
class SearchRequest(BaseModel):
    query: str
    categories: Optional[List[str]] = None
    project_id: Optional[str] = None

class SearchResult(BaseModel):
    id: str
    name: str
    description: str
    category: str
    score: float
    metadata: Optional[Dict[str, Any]] = None

class AIAssistantRequest(BaseModel):
    message: str
    project_id: str
    context: Optional[Dict[str, Any]] = None

class CollaborationUpdate(BaseModel):
    project_id: str
    user_id: str
    action: str
    data: Optional[Dict[str, Any]] = None

# Mock data for demonstration
MOCK_SEARCH_DATA = {
    "projects": [
        {"id": "proj1", "name": "E-commerce Dashboard", "description": "React-based admin panel with real-time analytics", "tech_stack": ["React", "Node.js", "MongoDB"]},
        {"id": "proj2", "name": "Task Management App", "description": "Collaborative task tracker with team features", "tech_stack": ["Vue.js", "Express", "PostgreSQL"]},
        {"id": "proj3", "name": "Weather Forecast API", "description": "REST API for weather data with caching", "tech_stack": ["Python", "FastAPI", "Redis"]},
    ],
    "templates": [
        {"id": "react-starter", "name": "React Starter Kit", "description": "Modern React app with Tailwind CSS and TypeScript"},
        {"id": "nextjs-blog", "name": "Next.js Blog", "description": "SEO-optimized blog with MDX support"},
        {"id": "vue-dashboard", "name": "Vue Dashboard", "description": "Admin dashboard template with Vue 3 Composition API"},
        {"id": "express-api", "name": "Express REST API", "description": "RESTful API template with authentication"},
        {"id": "python-ml", "name": "Python ML Starter", "description": "Machine learning project template with Jupyter"},
        {"id": "flutter-app", "name": "Flutter Mobile App", "description": "Cross-platform mobile app template"},
    ],
    "integrations": [
        {"id": "stripe", "name": "Stripe Payments", "description": "Payment processing with subscription support"},
        {"id": "auth0", "name": "Auth0 Authentication", "description": "Secure authentication and authorization"},
        {"id": "mongodb", "name": "MongoDB Database", "description": "NoSQL database with ODM integration"},
        {"id": "openai", "name": "OpenAI GPT", "description": "AI language model integration for chat and completion"},
        {"id": "sendgrid", "name": "SendGrid Email", "description": "Transactional email service integration"},
        {"id": "aws-s3", "name": "AWS S3 Storage", "description": "Cloud file storage and CDN integration"},
    ]
}

@router.post("/api/smart-search", response_model=List[SearchResult])
async def smart_search(request: SearchRequest):
    """AI-powered intelligent search across projects, templates, and integrations"""
    try:
        results = []
        query_lower = request.query.lower().strip()
        
        if not query_lower:
            return results
        
        # Search across all categories
        all_items = []
        
        # Add projects
        for proj in MOCK_SEARCH_DATA["projects"]:
            all_items.append({**proj, "category": "project"})
        
        # Add templates  
        for template in MOCK_SEARCH_DATA["templates"]:
            all_items.append({**template, "category": "template"})
            
        # Add integrations
        for integration in MOCK_SEARCH_DATA["integrations"]:
            all_items.append({**integration, "category": "integration"})
        
        # AI-powered scoring algorithm
        for item in all_items:
            score = 0
            
            # Exact name match (highest priority)
            if query_lower in item["name"].lower():
                score += 100
                
            # Description match
            if query_lower in item["description"].lower():
                score += 50
                
            # Fuzzy name matching using difflib
            name_similarity = difflib.SequenceMatcher(None, query_lower, item["name"].lower()).ratio()
            score += name_similarity * 30
            
            # Tech stack matching for projects
            if "tech_stack" in item:
                for tech in item["tech_stack"]:
                    if query_lower in tech.lower():
                        score += 40
            
            # Category filtering
            if request.categories and item["category"] not in request.categories:
                continue
                
            if score > 0:
                results.append(SearchResult(
                    id=item["id"],
                    name=item["name"],
                    description=item["description"],
                    category=item["category"],
                    score=score,
                    metadata={"tech_stack": item.get("tech_stack")}
                ))
        
        # Sort by score and return top results
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:10]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/api/ai-assistant/chat")
async def ai_assistant_chat(request: AIAssistantRequest):
    """AI Code Assistant chat endpoint with contextual responses"""
    try:
        # Simulate AI processing delay
        await asyncio.sleep(0.5)
        
        message_lower = request.message.lower()
        
        # Context-aware response generation
        if "optimize" in message_lower or "performance" in message_lower:
            response = {
                "content": f"""I've analyzed your project and found several optimization opportunities:

🚀 **Performance Improvements:**
1. **Component Memoization**: Use React.memo for components that receive stable props
2. **State Batching**: Combine related state updates to reduce re-renders
3. **Code Splitting**: Implement lazy loading for routes and heavy components
4. **Bundle Analysis**: Remove unused dependencies and optimize imports

**Example Optimization:**
```jsx
// Before
const ExpensiveComponent = (props) => {{
  const processedData = processLargeData(props.data, props.filters)
  return <div>{{/* render */}}</div>
}}

// After  
const ExpensiveComponent = React.memo((props) => {{
  const processedData = useMemo(() => 
    processLargeData(props.data, props.filters), [props.data, props.filters]
  )
  return <div>{{/* render */}}</div>
}})
```

Would you like me to analyze specific components or provide more detailed optimizations?""",
                "suggestions": ["Analyze specific component", "Show bundle analysis", "Performance checklist"],
                "type": "code_analysis"
            }
            
        elif "debug" in message_lower or "error" in message_lower:
            response = {
                "content": f"""🐛 **Debug Analysis Complete**

I've identified common debugging patterns for your project:

**Common Issues Found:**
1. **Missing Error Boundaries**: Add React error boundaries for better error handling
2. **Async Race Conditions**: Use AbortController for cleanup
3. **Memory Leaks**: Cleanup event listeners and subscriptions
4. **State Management**: Avoid direct state mutations

**Debug Helper:**
```jsx
// Error Boundary Component
class ErrorBoundary extends React.Component {{
  constructor(props) {{
    super(props)
    this.state = {{ hasError: false }}
  }}
  
  static getDerivedStateFromError(error) {{
    return {{ hasError: true }}
  }}
  
  render() {{
    if (this.state.hasError) {{
      return <div>Something went wrong.</div>
    }}
    return this.props.children
  }}
}}
```

What specific error are you encountering?""",
                "suggestions": ["Show error logs", "Add error boundary", "Check network issues"],
                "type": "debugging"
            }
            
        elif "refactor" in message_lower or "clean" in message_lower:
            response = {
                "content": f"""✨ **Code Refactoring Suggestions**

Based on modern React patterns, here are refactoring opportunities:

**Refactoring Checklist:**
1. **Custom Hooks**: Extract reusable logic into custom hooks
2. **Component Composition**: Break down large components
3. **TypeScript**: Add type safety for better development experience  
4. **File Organization**: Group related components and utilities

**Example Refactor:**
```jsx
// Before - Mixed concerns
const UserProfile = () => {{
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {{
    fetch('/api/user').then(res => res.json()).then(setUser)
    setLoading(false)
  }}, [])
  
  return loading ? <div>Loading...</div> : <div>{{user.name}}</div>
}}

// After - Custom hook
const useUser = () => {{
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // ... fetch logic
  return {{ user, loading }}
}}

const UserProfile = () => {{
  const {{ user, loading }} = useUser()
  if (loading) return <LoadingSpinner />
  return <UserCard user={{user}} />
}}
```

Which area would you like to refactor first?""",
                "suggestions": ["Extract custom hooks", "Break down components", "Add TypeScript"],
                "type": "refactoring"
            }
            
        else:
            # General helpful response
            response = {
                "content": f"""👋 I'm here to help with your project development!

**I can assist with:**
• **Code Review**: Analyze your code for improvements
• **Bug Fixing**: Help identify and resolve issues
• **Performance**: Optimize for better user experience  
• **Best Practices**: Suggest modern development patterns
• **Architecture**: Help design scalable solutions

**Quick Actions:**
- Type "optimize" for performance improvements
- Type "debug" for troubleshooting help
- Type "refactor" for code organization tips

What would you like to work on today?""",
                "suggestions": ["Review my code", "Help with bugs", "Performance tips", "Best practices"],
                "type": "general"
            }
        
        return {
            "response": response["content"],
            "suggestions": response["suggestions"],
            "type": response["type"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI assistant error: {str(e)}")

@router.get("/api/collaboration/online-users/{project_id}")
async def get_online_users(project_id: str):
    """Get list of users currently online in a project"""
    # Mock data for demonstration
    online_users = [
        {
            "id": "user2",
            "name": "Alex Chen", 
            "avatar": "👨‍💻",
            "status": "editing",
            "color": "#3B82F6",
            "last_active": (datetime.utcnow() - timedelta(seconds=10)).isoformat(),
            "current_file": "components/App.jsx"
        },
        {
            "id": "user3",
            "name": "Sarah Wilson",
            "avatar": "👩‍💼", 
            "status": "viewing",
            "color": "#10B981",
            "last_active": (datetime.utcnow() - timedelta(minutes=1)).isoformat(),
            "current_file": "styles/index.css"
        },
        {
            "id": "user4",
            "name": "Mike Johnson",
            "avatar": "👨‍🎨",
            "status": "idle", 
            "color": "#F59E0B",
            "last_active": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
            "current_file": None
        }
    ]
    
    return {
        "project_id": project_id,
        "online_users": online_users,
        "total_count": len(online_users) + 1,  # +1 for current user
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/api/collaboration/activity/{project_id}")  
async def get_project_activity(project_id: str, limit: int = Query(10, ge=1, le=50)):
    """Get recent collaboration activity for a project"""
    # Mock recent activity
    activities = [
        {
            "id": "act1",
            "user": "Alex Chen",
            "action": "started editing App.jsx",
            "timestamp": (datetime.utcnow() - timedelta(minutes=1)).isoformat(),
            "file": "components/App.jsx",
            "type": "file_edit"
        },
        {
            "id": "act2", 
            "user": "Sarah Wilson",
            "action": "added new styles to button component",
            "timestamp": (datetime.utcnow() - timedelta(minutes=3)).isoformat(),
            "file": "styles/button.css",
            "type": "file_create"
        },
        {
            "id": "act3",
            "user": "Mike Johnson", 
            "action": "opened project workspace",
            "timestamp": (datetime.utcnow() - timedelta(minutes=8)).isoformat(),
            "file": None,
            "type": "project_access"
        }
    ]
    
    return {
        "project_id": project_id,
        "activities": activities[:limit],
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/api/collaboration/cursor-update")
async def update_cursor_position(request: CollaborationUpdate):
    """Update user cursor position for real-time collaboration"""
    # In a real implementation, this would broadcast to other users via WebSocket
    return {
        "status": "success", 
        "message": "Cursor position updated",
        "timestamp": datetime.utcnow().isoformat()
    }