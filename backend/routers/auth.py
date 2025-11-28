from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

from utils.database import get_database
from utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter()

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None

@router.post("/register")
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        db = get_database()
        
        # Check if user already exists
        existing_user = db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_doc = {
            "_id": str(ObjectId()),
            "name": user_data.name,
            "email": user_data.email,
            "password_hash": get_password_hash(user_data.password),
            "role": "user",
            "created_at": datetime.utcnow(),
            "total_predictions": 0,
            "total_comparisons": 0
        }
        
        db.users.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_doc["_id"]})
        
        return {
            "success": True,
            "message": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": user_doc["_id"],
                "name": user_doc["name"],
                "email": user_doc["email"],
                "role": user_doc["role"]
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(credentials: UserLogin):
    """Login user"""
    try:
        db = get_database()
        
        # Find user
        user = db.users.find_one({"email": credentials.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user["_id"])})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user"),
                "total_predictions": user.get("total_predictions", 0),
                "total_comparisons": user.get("total_comparisons", 0)
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    return {
        "success": True,
        "user": {
            "user_id": current_user["user_id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user.get("role", "user"),
            "total_predictions": current_user.get("total_predictions", 0),
            "total_comparisons": current_user.get("total_comparisons", 0)
        }
    }

@router.put("/profile")
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    try:
        db = get_database()
        
        update_fields = {}
        if update_data.name:
            update_fields["name"] = update_data.name
        
        if update_fields:
            db.users.update_one(
                {"_id": current_user["_id"]},
                {"$set": update_fields}
            )
        
        # Fetch updated user
        updated_user = db.users.find_one({"_id": current_user["_id"]})
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "user_id": str(updated_user["_id"]),
                "name": updated_user["name"],
                "email": updated_user["email"],
                "role": updated_user.get("role", "user")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
