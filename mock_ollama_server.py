#!/usr/bin/env python3
"""
Mock Ollama Server for Testing
Simulates Ollama API for development and testing purposes
"""

import asyncio
import json
import time
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Mock Ollama Server
app = FastAPI(title="Mock Ollama Server", version="1.0.0")

# Available models
AVAILABLE_MODELS = {
    "codellama:13b": {
        "name": "codellama:13b",
        "size": 7365960935,
        "modified_at": "2024-01-15T12:00:00Z",
        "digest": "sha256:abc123def456"
    },
    "llama3.1:8b": {
        "name": "llama3.1:8b", 
        "size": 4661224676,
        "modified_at": "2024-01-15T12:00:00Z",
        "digest": "sha256:def456abc123"
    },
    "deepseek-coder:6.7b": {
        "name": "deepseek-coder:6.7b",
        "size": 3811912421,
        "modified_at": "2024-01-15T12:00:00Z",
        "digest": "sha256:ghi789jkl012"
    }
}

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = False
    options: Optional[Dict[str, Any]] = {}

class PullRequest(BaseModel):
    name: str

@app.get("/api/tags")
async def list_models():
    """List available models"""
    return {
        "models": [
            {
                "name": model_name,
                "size": model_info["size"],
                "modified_at": model_info["modified_at"],
                "digest": model_info["digest"]
            }
            for model_name, model_info in AVAILABLE_MODELS.items()
        ]
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Process chat request"""
    
    # Simulate processing time based on model
    if "13b" in request.model:
        await asyncio.sleep(1.5)  # Larger model = more time
    elif "8b" in request.model:
        await asyncio.sleep(1.0)  # Medium model
    else:
        await asyncio.sleep(0.7)  # Smaller model = faster
    
    # Get the user's message
    user_message = ""
    for msg in request.messages:
        if msg.role == "user":
            user_message = msg.content
            break
    
    # Generate mock response based on model
    if "codellama" in request.model:
        response = generate_code_response(user_message)
    elif "deepseek-coder" in request.model:
        response = generate_fast_code_response(user_message)
    else:  # llama3.1
        response = generate_general_response(user_message)
    
    # Calculate mock metrics
    prompt_tokens = sum(len(msg.content.split()) for msg in request.messages)
    completion_tokens = len(response.split())
    
    return {
        "message": {
            "role": "assistant",
            "content": response
        },
        "done": True,
        "total_duration": int(time.time() * 1e9),
        "load_duration": 1000000000,
        "prompt_eval_count": prompt_tokens,
        "prompt_eval_duration": 500000000,
        "eval_count": completion_tokens,
        "eval_duration": 1500000000
    }

@app.post("/api/pull")
async def pull_model(request: PullRequest):
    """Simulate model download"""
    model_name = request.name
    
    if model_name not in AVAILABLE_MODELS:
        return {"error": f"Model {model_name} not found"}
    
    # Simulate download progress
    progress_steps = [
        {"status": "pulling manifest"},
        {"status": "downloading", "completed": 0, "total": AVAILABLE_MODELS[model_name]["size"]},
        {"status": "downloading", "completed": AVAILABLE_MODELS[model_name]["size"] // 4, "total": AVAILABLE_MODELS[model_name]["size"]},
        {"status": "downloading", "completed": AVAILABLE_MODELS[model_name]["size"] // 2, "total": AVAILABLE_MODELS[model_name]["size"]},
        {"status": "downloading", "completed": AVAILABLE_MODELS[model_name]["size"] * 3 // 4, "total": AVAILABLE_MODELS[model_name]["size"]},
        {"status": "downloading", "completed": AVAILABLE_MODELS[model_name]["size"], "total": AVAILABLE_MODELS[model_name]["size"]},
        {"status": "verifying sha256 digest"},
        {"status": "writing manifest"},
        {"status": "removing any unused layers"},
        {"status": "success"}
    ]
    
    return {"status": "success"}

def generate_code_response(user_message: str) -> str:
    """Generate coding-focused response"""
    message_lower = user_message.lower()
    
    if "error" in message_lower or "bug" in message_lower:
        return f"""🐛 I'll help you debug this issue! Here's my analysis:

**Problem Analysis:**
{user_message[:200]}{'...' if len(user_message) > 200 else ''}

**Potential Solutions:**
```python
# Enhanced debugging approach with local CodeLlama
async def debug_solution():
    try:
        # Add proper error handling
        result = await process_request()
        logger.info(f"Success: {{result}}")
        return result
    except Exception as e:
        logger.error(f"Error occurred: {{e}}")
        # Add specific error handling
        raise
```

**Debugging Steps:**
1. Check the error logs for specific details
2. Verify input validation
3. Test with minimal reproducible case
4. Add comprehensive logging

**Local AI Benefits:**
✅ Unlimited debugging sessions
✅ Private code analysis
✅ No API rate limits
✅ Instant responses

Ready to dive deeper into the debugging process!"""

    elif "function" in message_lower or "class" in message_lower or "code" in message_lower:
        return f"""💻 I'll help you build that code! Here's my implementation:

**Your Request:**
{user_message[:200]}{'...' if len(user_message) > 200 else ''}

**Implementation:**
```python
# Generated by CodeLlama - Unlimited Local AI
class Solution:
    def __init__(self):
        self.initialized = True
    
    async def process(self, data):
        # Implement your logic here
        result = await self.optimize_with_local_ai(data)
        return self.validate_output(result)
    
    def validate_output(self, result):
        # Add validation logic
        if not result:
            raise ValueError("Invalid result")
        return result
```

**Key Features:**
- Modern Python async/await patterns
- Proper error handling
- Type hints for better code quality
- Modular design for maintainability

**Testing:**
```python
# Unit tests
async def test_solution():
    solution = Solution()
    result = await solution.process(test_data)
    assert result is not None
    assert isinstance(result, expected_type)
```

**Benefits of Local AI Coding:**
✅ Unlimited code generation
✅ Private code review
✅ No external dependencies
✅ Instant code suggestions

Ready to refine this implementation further!"""

    else:
        return f"""🚀 CodeLlama here! I'm specialized in helping with coding tasks.

**Your Request:**
{user_message[:200]}{'...' if len(user_message) > 200 else ''}

**My Expertise:**
- Code generation and optimization
- Debugging and error analysis
- Software architecture design
- Best practices implementation

**How I Can Help:**
1. **Code Generation**: Create functions, classes, and modules
2. **Code Review**: Analyze existing code for improvements
3. **Debugging**: Help identify and fix issues
4. **Architecture**: Design scalable solutions
5. **Best Practices**: Apply modern coding standards

**Next Steps:**
Could you provide more specific details about what you'd like to build? For example:
- What programming language?
- What specific functionality?
- Any constraints or requirements?

**Unlimited Local AI Advantages:**
✅ No rate limits - ask as many questions as needed
✅ Complete privacy - your code never leaves your system
✅ Instant responses - no API delays
✅ Cost-free forever - no subscription fees

Ready to help you build amazing code! 💻"""

def generate_fast_code_response(user_message: str) -> str:
    """Generate quick coding response from DeepSeek Coder"""
    return f"""⚡ DeepSeek Coder - Fast Code Assistant!

**Quick Analysis:**
{user_message[:150]}{'...' if len(user_message) > 150 else ''}

**Fast Implementation:**
```python
# Quick solution with DeepSeek Coder
def quick_solution(input_data):
    # Optimized for speed and efficiency
    return process_efficiently(input_data)

# One-liner alternative
result = lambda x: optimize(x) if validate(x) else handle_error(x)
```

**Speed Benefits:**
✅ Fastest local model responses
✅ Perfect for quick fixes
✅ Efficient code completions
✅ Rapid prototyping

Need more detailed implementation? Just ask! 🚀"""

def generate_general_response(user_message: str) -> str:
    """Generate general response from LLaMA"""
    return f"""🧠 LLaMA 3.1 here! I'm ready to help with your request.

**Your Message:**
{user_message[:200]}{'...' if len(user_message) > 200 else ''}

**My Analysis:**
This is an interesting question that involves several considerations. Let me break this down:

**Key Insights:**
- Understanding the context and requirements
- Considering different approaches and solutions
- Evaluating trade-offs and best practices
- Providing actionable recommendations

**Recommendations:**
1. **Approach**: Start with a clear understanding of the problem
2. **Implementation**: Use proven patterns and best practices  
3. **Testing**: Validate the solution thoroughly
4. **Optimization**: Refine based on performance needs

**Local AI Benefits:**
✅ Unlimited conversations
✅ Complete privacy and security
✅ No external dependencies
✅ Consistent availability

Would you like me to elaborate on any specific aspect? I'm here to help with unlimited local AI power! 🌟"""

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Mock Ollama Server...")
    print("📍 Available at: http://localhost:11434")
    print("🤖 Models: codellama:13b, llama3.1:8b, deepseek-coder:6.7b")
    uvicorn.run(app, host="0.0.0.0", port=11434)