from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from models.user import User
from routes.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_agents(current_user: User = Depends(get_current_user)):
    """Get available AI agents"""
    
    agents = [
        {
            "id": "developer",
            "name": "Developer Agent", 
            "description": "Code generation and debugging",
            "capabilities": ["coding", "debugging", "architecture"],
            "status": "active"
        },
        {
            "id": "designer",
            "name": "Designer Agent",
            "description": "UI/UX design and styling", 
            "capabilities": ["ui-design", "styling", "components"],
            "status": "available"
        }
    ]
    
    return {"agents": agents}