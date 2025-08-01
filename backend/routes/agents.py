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

@router.get("/orchestration/status")
async def get_orchestration_status(current_user: User = Depends(get_current_user)):
    """Get agent orchestration status"""
    
    status = {
        "orchestrator": {
            "status": "active",
            "uptime": "2h 15m",
            "active_agents": 2,
            "queue_size": 0,
            "last_activity": datetime.utcnow().isoformat()
        },
        "agents": [
            {
                "id": "developer",
                "status": "active",
                "load": 0.3,
                "tasks_completed": 15,
                "last_active": datetime.utcnow().isoformat()
            },
            {
                "id": "designer", 
                "status": "idle",
                "load": 0.0,
                "tasks_completed": 8,
                "last_active": "2024-01-15T10:30:00Z"
            }
        ]
    }
    
    return status

@router.get("/teams")
async def get_agent_teams(current_user: User = Depends(get_current_user)):
    """Get agent teams configuration"""
    
    teams = [
        {
            "id": "fullstack",
            "name": "Full-Stack Development Team",
            "description": "Complete web application development",
            "agents": ["developer", "designer", "tester"],
            "active": True,
            "projects": 3
        },
        {
            "id": "frontend",
            "name": "Frontend Specialists",
            "description": "UI/UX focused development",
            "agents": ["designer", "frontend-dev"],
            "active": True,
            "projects": 2
        },
        {
            "id": "backend",
            "name": "Backend Services",
            "description": "API and server-side development",
            "agents": ["developer", "devops"],
            "active": False,
            "projects": 0
        }
    ]
    
    return teams