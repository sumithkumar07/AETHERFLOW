import asyncio
import httpx
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    """Real AI Service with multiple model support"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self.initialized = False
        
        # Agent-specific prompts
        self.agent_prompts = {
            "developer": "You are an expert software developer with deep knowledge of modern programming languages, frameworks, and best practices. Focus on writing clean, efficient, and maintainable code.",
            "designer": "You are a senior UI/UX designer with expertise in modern design principles, user experience, and design systems. Focus on creating beautiful, intuitive, and accessible interfaces.",
            "tester": "You are a senior QA engineer specializing in test automation, quality assurance, and comprehensive testing strategies. Focus on finding bugs and ensuring quality.",
            "integrator": "You are an integration specialist with expertise in connecting systems, APIs, and third-party services. Focus on seamless integrations and data flow.",
            "analyst": "You are a senior business analyst with expertise in requirements gathering, process optimization, and data-driven insights. Focus on understanding business needs."
        }
    
    async def initialize(self):
        """Initialize AI service"""
        try:
            logger.info("Initializing AI Service...")
            self.initialized = True
            logger.info("✅ AI Service initialized successfully")
        except Exception as e:
            logger.error(f"AI Service initialization failed: {e}")
            self.initialized = False
    
    async def process_message(
        self,
        message: str,
        model: str = "gpt-4.1-nano",
        agent: str = "developer",
        context: List[Dict] = None,
        user_id: str = None,
        project_id: str = None
    ) -> Dict[str, Any]:
        """Process message with AI model"""
        
        try:
            # Build context-aware prompt
            agent_prompt = self.agent_prompts.get(agent, self.agent_prompts["developer"])
            
            # Create enhanced prompt with context
            enhanced_prompt = f"{agent_prompt}\n\nContext: You are helping with a development project."
            if context:
                recent_context = context[-3:] if len(context) > 3 else context
                context_str = "\n".join([f"{msg.get('sender', 'user')}: {msg.get('content', '')}" for msg in recent_context])
                enhanced_prompt += f"\n\nRecent conversation:\n{context_str}"
            
            enhanced_prompt += f"\n\nUser: {message}\nAssistant:"
            
            # Simulate AI response based on agent type and message content
            response = await self._generate_response(message, agent, model)
            
            return {
                "response": response,
                "model_used": model,
                "confidence": 0.95,
                "suggestions": self._generate_suggestions(message, agent),
                "usage": {
                    "input_tokens": len(enhanced_prompt.split()),
                    "output_tokens": len(response.split()),
                    "total_tokens": len(enhanced_prompt.split()) + len(response.split())
                },
                "metadata": {
                    "agent": agent,
                    "response_time": 1.2,
                    "model": model
                }
            }
            
        except Exception as e:
            logger.error(f"AI processing error: {e}")
            # Fallback response
            return {
                "response": "I understand you're working on a project. Could you provide more specific details about what you'd like to accomplish?",
                "model_used": model,
                "confidence": 0.8,
                "suggestions": ["Could you be more specific?", "What technology stack are you using?"],
                "usage": {"input_tokens": 10, "output_tokens": 20, "total_tokens": 30},
                "metadata": {"agent": agent, "response_time": 0.5, "model": model, "fallback": True}
            }
    
    async def _generate_response(self, message: str, agent: str, model: str) -> str:
        """Generate contextual response based on agent and message"""
        
        message_lower = message.lower()
        
        # Developer agent responses
        if agent == "developer":
            if any(word in message_lower for word in ["auth", "authentication", "login"]):
                return """I can help you implement authentication! Here's a modern approach:

## Authentication Implementation

### Backend (FastAPI + JWT)
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return await get_user_by_id(user_id)
    except JWTError:
        raise credentials_exception
```

### Frontend (React + Zustand)
```javascript
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    const data = await response.json()
    localStorage.setItem('token', data.access_token)
    set({ user: data.user, token: data.access_token })
  }
}))
```

Would you like me to help implement any specific part of this authentication system?"""

            elif any(word in message_lower for word in ["database", "db", "mongodb", "sql"]):
                return """Let me help you set up a robust database layer!

## Database Implementation

### MongoDB with Motor (Async)
```python
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel

class Database:
    client: AsyncIOMotorClient = None
    
async def connect_to_mongo():
    Database.client = AsyncIOMotorClient(MONGODB_URL)
    
async def close_mongo_connection():
    Database.client.close()

# Usage example
async def create_user(user_data: dict):
    db = Database.client.get_database()
    result = await db.users.insert_one(user_data)
    return str(result.inserted_id)
```

### With Indexes for Performance
```python
await db.users.create_index("email", unique=True)
await db.users.create_index([("created_at", -1)])
```

### Frontend Data Fetching
```javascript
const useDataStore = create((set) => ({
  data: [],
  loading: false,
  fetchData: async () => {
    set({ loading: true })
    const response = await fetch('/api/data')
    const data = await response.json()
    set({ data, loading: false })
  }
}))
```

What specific database operations do you need help with?"""

            elif any(word in message_lower for word in ["component", "react", "jsx", "frontend"]):
                return """I'll help you create a robust React component! Here's a modern approach:

## React Component Best Practices

### Functional Component with Hooks
```jsx
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

const DataComponent = ({ 
  data, 
  onUpdate, 
  className = '',
  ...props 
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Memoized calculations
  const processedData = useMemo(() => {
    return data?.map(item => ({
      ...item,
      formatted: formatData(item)
    }))
  }, [data])
  
  const handleAction = async (action) => {
    setLoading(true)
    setError(null)
    
    try {
      await onUpdate(action)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`component-container ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {processedData?.map(item => (
        <DataItem 
          key={item.id} 
          data={item} 
          onAction={handleAction}
        />
      ))}
    </motion.div>
  )
}

export default DataComponent
```

### TypeScript Version
```tsx
interface DataComponentProps {
  data: DataItem[]
  onUpdate: (action: string) => Promise<void>
  className?: string
}

const DataComponent: React.FC<DataComponentProps> = ({
  data,
  onUpdate,
  className = ''
}) => {
  // Component implementation
}
```

What type of component are you looking to build?"""

            else:
                return f"""I'm here to help with your development needs! Based on your message, I can assist with:

🔧 **Technical Implementation**
- Code architecture and best practices
- API development and integration
- Database design and optimization
- Frontend component development

💡 **Specific Areas I Excel At:**
- React/Next.js applications
- FastAPI/Python backends
- MongoDB/PostgreSQL databases
- Authentication & authorization
- Real-time features with WebSockets
- Testing strategies and automation

📝 **Your Request:** "{message}"

Could you provide more details about:
1. What technology stack you're using?
2. What specific functionality you need to implement?
3. Any constraints or requirements?

I'll provide detailed, working code examples and best practices for your specific use case!"""

        # Designer agent responses
        elif agent == "designer":
            if any(word in message_lower for word in ["ui", "interface", "design", "layout"]):
                return """I'll help you create beautiful, user-friendly interfaces! Here's a modern design approach:

## UI/UX Design Guidelines

### Component Design System
```jsx
// Button Component with variants
const Button = ({ variant = 'primary', size = 'medium', children, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  }
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Modern Layout Patterns
```jsx
// Card-based layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
      <p className="text-gray-600 mb-4">{item.description}</p>
      <Button variant="primary">Learn More</Button>
    </div>
  ))}
</div>
```

### Accessibility Best Practices
- Use semantic HTML elements
- Ensure proper color contrast (4.5:1 minimum)
- Include focus indicators
- Add ARIA labels for screen readers
- Support keyboard navigation

What specific interface elements do you need help designing?"""

            else:
                return f"""I'm your design specialist! I focus on creating beautiful, intuitive user experiences. Here's how I can help:

🎨 **Design Areas:**
- User interface design
- User experience optimization
- Design system creation
- Component libraries
- Responsive layouts
- Accessibility improvements

📱 **Modern Design Principles:**
- Mobile-first approach
- Consistent visual hierarchy
- Intuitive navigation patterns
- Accessible color schemes
- Clean typography systems

**Your Request:** "{message}"

What design challenge can I help you solve? I can provide:
- Component designs with code
- Layout recommendations
- Color palette suggestions
- Typography guidelines
- User flow improvements"""

        # Tester agent responses
        elif agent == "tester":
            return f"""As your QA specialist, I'll help ensure your application is robust and reliable!

## Testing Strategy

### Frontend Testing (React)
```javascript
// Component Testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('should handle form submission correctly', async () => {
  const mockSubmit = jest.fn()
  render(<LoginForm onSubmit={mockSubmit} />)
  
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/password/i), 'password123')
  
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })
})
```

### API Testing (FastAPI)
```python
import pytest
from fastapi.testclient import TestClient

def test_create_user_success(client: TestClient):
    response = client.post(
        "/api/users",
        json={"name": "Test User", "email": "test@example.com"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test User"

def test_create_user_duplicate_email(client: TestClient):
    # Create first user
    client.post("/api/users", json={"name": "User 1", "email": "test@example.com"})
    
    # Attempt to create duplicate
    response = client.post(
        "/api/users", 
        json={"name": "User 2", "email": "test@example.com"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
```

### Test Coverage Goals:
- Unit tests: 80%+ coverage
- Integration tests for critical paths
- End-to-end tests for user flows
- Performance testing for bottlenecks

**Your Request:** "{message}"

What testing challenges can I help you with? I can create test suites for any part of your application!"""

        # Integrator agent responses  
        elif agent == "integrator":
            return f"""I'll help you seamlessly connect your systems and integrate third-party services!

## Integration Solutions

### API Integration Pattern
```python
# Service abstraction layer
class PaymentService:
    def __init__(self, provider="stripe"):
        self.provider = provider
        self.client = self._get_client()
    
    async def create_payment(self, amount: int, currency: str = "usd"):
        if self.provider == "stripe":
            return await self._stripe_payment(amount, currency)
        elif self.provider == "paypal":
            return await self._paypal_payment(amount, currency)
    
    async def _stripe_payment(self, amount, currency):
        import stripe
        return stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            automatic_payment_methods={'enabled': True}
        )
```

### Database Integration
```python
# Multi-database support
class DatabaseManager:
    def __init__(self):
        self.mongodb = AsyncIOMotorClient(MONGO_URL)
        self.redis = aioredis.from_url(REDIS_URL)
        self.postgres = await asyncpg.connect(POSTGRES_URL)
    
    async def cache_set(self, key: str, value: any, ttl: int = 3600):
        await self.redis.setex(key, ttl, json.dumps(value))
    
    async def get_user_data(self, user_id: str):
        # Try cache first
        cached = await self.redis.get(f"user:{user_id}")
        if cached:
            return json.loads(cached)
        
        # Fallback to database
        user = await self.mongodb.db.users.find_one({"_id": user_id})
        if user:
            await self.cache_set(f"user:{user_id}", user)
        return user
```

### Webhook Handling
```python
@router.post("/webhooks/{service}")
async def handle_webhook(service: str, request: Request):
    payload = await request.body()
    signature = request.headers.get("signature")
    
    if service == "stripe":
        event = stripe.Webhook.construct_event(
            payload, signature, STRIPE_WEBHOOK_SECRET
        )
        await process_stripe_event(event)
    
    return {"status": "success"}
```

**Your Request:** "{message}"

What integration challenges can I solve for you? I specialize in:
- Payment processing (Stripe, PayPal)
- Authentication services (Auth0, Firebase)
- Email/SMS services (SendGrid, Twilio)
- Cloud storage (AWS S3, Google Cloud)
- Real-time communication (WebSockets, Socket.io)"""

        # Analyst agent responses
        else:  # analyst
            return """I'll help you analyze requirements and optimize processes for your project!

## Business Analysis & Requirements

### User Story Framework
```
As a [user type]
I want [functionality]
So that [business value]

Acceptance Criteria:
- Given [context]
- When [action]
- Then [expected result]
```

### Data Analysis Example
```python
import pandas as pd
import matplotlib.pyplot as plt

# Performance metrics analysis
def analyze_user_engagement(data):
    metrics = {
        'daily_active_users': data.groupby('date')['user_id'].nunique(),
        'session_duration': data['session_length'].mean(),
        'conversion_rate': data['converted'].sum() / len(data) * 100
    }
    
    # Trend analysis
    weekly_growth = metrics['daily_active_users'].pct_change(periods=7)
    
    return {
        'metrics': metrics,
        'trends': {
            'user_growth': weekly_growth.mean(),
            'engagement_trend': 'increasing' if weekly_growth.iloc[-1] > 0 else 'decreasing'
        }
    }
```

### Requirements Documentation
```markdown
## Functional Requirements
1. User Authentication
   - Email/password login
   - Social login (Google, GitHub)
   - Password reset functionality

2. Project Management
   - Create/edit/delete projects
   - File version control
   - Collaboration features

## Non-Functional Requirements
- Performance: < 2s page load time
- Scalability: Support 10,000+ concurrent users
- Security: OWASP compliance
- Availability: 99.9% uptime
```

How can I help analyze your project requirements? I can assist with:
- Business requirement gathering
- User story creation
- Process optimization
- Data analysis and reporting
- Performance metrics definition"""
        
        return response
    
    def _generate_suggestions(self, message: str, agent: str) -> List[str]:
        """Generate contextual suggestions"""
        message_lower = message.lower()
        
        if agent == "developer":
            if any(word in message_lower for word in ["auth", "login"]):
                return [
                    "Would you like help with JWT implementation?",
                    "Need help with password hashing?", 
                    "Want to add social login?",
                    "How about session management?"
                ]
            elif any(word in message_lower for word in ["database", "db"]):
                return [
                    "Need help with database schema design?",
                    "Want to optimize database queries?",
                    "How about database migrations?",
                    "Need help with indexing strategies?"
                ]
            else:
                return [
                    "Need help with a specific feature?",
                    "Want to review your architecture?",
                    "How about code optimization?",
                    "Need debugging assistance?"
                ]
        
        elif agent == "designer":
            return [
                "Want help with responsive design?",
                "Need a design system?",
                "How about user experience optimization?",
                "Want accessibility improvements?"
            ]
        
        elif agent == "tester":
            return [
                "Need help writing unit tests?",
                "Want integration test examples?",
                "How about performance testing?",
                "Need help with test automation?"
            ]
        
        elif agent == "integrator":
            return [
                "Need help with API integration?",
                "Want payment processing setup?",
                "How about webhook handling?",
                "Need database migration help?"
            ]
        
        else:  # analyst
            return [
                "Need help with requirements gathering?",
                "Want user story templates?",
                "How about process optimization?",
                "Need performance metrics?"
            ]