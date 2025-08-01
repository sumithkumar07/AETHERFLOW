from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from models.user import User
from routes.auth import get_current_user

router = APIRouter()

@router.get("/features")
async def get_enterprise_features(current_user: User = Depends(get_current_user)):
    """Get enterprise features"""
    
    features = [
        {
            "id": "sso",
            "name": "Single Sign-On",
            "description": "SAML/OAuth integration",
            "available": True
        },
        {
            "id": "audit", 
            "name": "Audit Logs",
            "description": "Comprehensive activity logging",
            "available": True
        }
    ]
    
    return {"features": features}