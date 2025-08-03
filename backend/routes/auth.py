from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import logging

from models.database import get_database
from models.user import User, UserCreate, UserLogin, UserResponse, UserInDB

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise HTTPException(status_code=500, detail="Password processing error")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception
    
    try:
        db = await get_database()
        # Try to find user by string ID first
        user = await db.users.find_one({"_id": user_id})
        
        # If not found, try with ObjectId
        if not user:
            from bson import ObjectId
            try:
                object_id = ObjectId(user_id)
                user = await db.users.find_one({"_id": object_id})
            except Exception:
                pass
        
        if user is None:
            raise credentials_exception
            
        # Convert _id to string for consistency
        user["_id"] = str(user["_id"])
        return User(**user)
        
    except Exception as e:
        logger.error(f"Database error in get_current_user: {e}")
        raise credentials_exception

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    """Register a new user"""
    try:
        db = await get_database()
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        user_id = f"user_{int(datetime.utcnow().timestamp() * 1000)}"
        
        user_dict = {
            "_id": user_id,
            "name": user.name,
            "email": user.email,
            "hashed_password": hashed_password,
            "avatar": None,
            "is_premium": False,
            "projects_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.users.insert_one(user_dict)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user_id,
                email=user.email,
                name=user.name,
                is_premium=False,
                projects_count=0,
                created_at=user_dict["created_at"]
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=dict)
async def login(user_credentials: UserLogin):
    """Login user"""
    try:
        db = await get_database()
        
        # Find user
        user = await db.users.find_one({"email": user_credentials.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(user_credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["_id"])}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                name=user["name"],
                avatar=user.get("avatar"),
                is_premium=user.get("is_premium", False),
                projects_count=user.get("projects_count", 0),
                created_at=user["created_at"]
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    try:
        return UserResponse(
            id=str(current_user.id),
            email=current_user.email,
            name=current_user.name,
            avatar=current_user.avatar,
            is_premium=current_user.is_premium,
            projects_count=current_user.projects_count,
            created_at=current_user.created_at
        )
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.put("/profile", response_model=dict)
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    try:
        db = await get_database()
        
        # Allowed fields for update
        allowed_fields = ['name', 'avatar', 'bio', 'company', 'location', 'website']
        update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
        update_data['updated_at'] = datetime.utcnow()
        
        # Update user
        await db.users.update_one(
            {"_id": str(current_user.id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": str(current_user.id)})
        
        return {
            "message": "Profile updated successfully",
            "user": UserResponse(
                id=str(updated_user["_id"]),
                email=updated_user["email"],
                name=updated_user["name"],
                avatar=updated_user.get("avatar"),
                is_premium=updated_user.get("is_premium", False),
                projects_count=updated_user.get("projects_count", 0),
                created_at=updated_user["created_at"]
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Profile update failed")

@router.post("/refresh", response_model=dict)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    try:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(current_user.id)}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(status_code=500, detail="Token refresh failed")

# Demo user endpoints
@router.post("/create-demo", response_model=dict)
async def create_demo_user():
    """Create demo user for development"""
    try:
        db = await get_database()
        
        # Check if demo user already exists
        existing_user = await db.users.find_one({"email": "demo@aicodestudio.com"})
        if existing_user:
            return {"message": "Demo user already exists"}
        
        # Create demo user
        demo_user = {
            "_id": "demo_user_123",
            "name": "Demo User",
            "email": "demo@aicodestudio.com",
            "hashed_password": get_password_hash("demo123"),
            "avatar": None,
            "is_premium": True,
            "projects_count": 3,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.users.insert_one(demo_user)
        
        return {"message": "Demo user created successfully"}
        
    except Exception as e:
        logger.error(f"Demo user creation error: {e}")
        raise HTTPException(status_code=500, detail="Demo user creation failed")

@router.post("/demo-login", response_model=dict)
async def demo_login():
    """Direct demo login endpoint"""
    try:
        db = await get_database()
        
        # Find or create demo user
        user = await db.users.find_one({"email": "demo@aicodestudio.com"})
        
        if not user:
            # Create demo user if doesn't exist
            demo_user = {
                "_id": "demo_user_123",
                "name": "Demo User",
                "email": "demo@aicodestudio.com",
                "hashed_password": get_password_hash("demo123"),
                "avatar": None,
                "is_premium": True,
                "projects_count": 3,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await db.users.insert_one(demo_user)
            user = demo_user
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["_id"])}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                name=user["name"],
                avatar=user.get("avatar"),
                is_premium=user.get("is_premium", True),
                projects_count=user.get("projects_count", 3),
                created_at=user["created_at"]
            )
        }
        
    except Exception as e:
        logger.error(f"Demo login error: {e}")
        raise HTTPException(status_code=500, detail="Demo login failed")


# Helper function to ensure demo user exists
async def create_demo_user():
    """Utility function to create demo user on startup"""
    try:
        db = await get_database()
        
        # Check if demo user already exists
        existing_user = await db.users.find_one({"email": "demo@aicodestudio.com"})
        if existing_user:
            logger.info("✅ Demo user already exists")
            return
        
        # Create demo user
        demo_user = {
            "_id": "demo_user_123",
            "name": "Demo User",
            "email": "demo@aicodestudio.com",
            "hashed_password": get_password_hash("demo123"),
            "avatar": None,
            "is_premium": True,
            "projects_count": 3,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.users.insert_one(demo_user)
        logger.info("✅ Demo user created successfully")
        
    except Exception as e:
        logger.error(f"Demo user creation error: {e}")