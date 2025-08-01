from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from models.user import User
from routes.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_integrations(current_user: User = Depends(get_current_user)):
    """Get available integrations"""
    
    integrations = [
        {
            "id": "stripe",
            "name": "Stripe",
            "description": "Payment processing",
            "category": "payment",
            "status": "available",
            "setup_time": "5 min"
        },
        {
            "id": "mongodb",
            "name": "MongoDB",
            "description": "NoSQL database",
            "category": "database", 
            "status": "connected",
            "setup_time": "2 min"
        }
    ]
    
    return {"integrations": integrations}