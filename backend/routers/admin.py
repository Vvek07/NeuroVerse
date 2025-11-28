from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime
from bson import ObjectId

from utils.auth import require_admin
from utils.database import get_database

router = APIRouter()

@router.get("/users")
async def get_all_users(
    limit: Optional[int] = 100,
    admin_user: dict = Depends(require_admin)
):
    """Get all users (admin only)"""
    try:
        db = get_database()
        cursor = db.users.find().limit(limit)
        users = list(cursor)
        
        # Convert ObjectId
        for u in users:
            u["_id"] = str(u["_id"])
        
        return {
            "success": True,
            "users": users,
            "total": len(users)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/datasets")
async def get_all_datasets(
    limit: Optional[int] = 100,
    admin_user: dict = Depends(require_admin)
):
    """Get all datasets across platform (admin only)"""
    try:
        db = get_database()
        cursor = db.datasets.find().sort("uploaded_at", -1).limit(limit)
        datasets = list(cursor)
        
        # Convert ObjectId
        for d in datasets:
            d["_id"] = str(d["_id"])
            if "uploaded_by" in d:
                d["uploaded_by"] = str(d["uploaded_by"])
        
        return {
            "success": True,
            "datasets": datasets,
            "total": len(datasets)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions")
async def get_all_predictions(
    limit: Optional[int] = 100,
    admin_user: dict = Depends(require_admin)
):
    """Get all predictions across platform (admin only)"""
    try:
        db = get_database()
        cursor = db.predictions.find().sort("created_at", -1).limit(limit)
        predictions = list(cursor)
        
        # Convert ObjectId
        for p in predictions:
            p["_id"] = str(p["_id"])
            if "user_id" in p:
                p["user_id"] = str(p["user_id"])
        
        return {
            "success": True,
            "predictions": predictions,
            "total": len(predictions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/dataset/{file_id}")
async def admin_delete_dataset(
    file_id: str,
    admin_user: dict = Depends(require_admin)
):
    """Delete any dataset (admin only)"""
    try:
        db = get_database()
        
        # Get dataset
        dataset = db.datasets.find_one({"file_id": file_id})
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Delete from Firestore (MongoDB)
        db.datasets.delete_one({"file_id": file_id})
        
        # Delete associated predictions
        db.predictions.delete_many({"file_id": file_id})
        
        return {
            "success": True,
            "message": "Dataset deleted successfully"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_platform_analytics(admin_user: dict = Depends(require_admin)):
    """Get platform-wide analytics (admin only)"""
    try:
        db = get_database()
        
        # Get counts
        total_users = db.users.count_documents({})
        total_datasets = db.datasets.count_documents({})
        total_predictions = db.predictions.count_documents({})
        total_comparisons = db.comparisons.count_documents({})
        
        # User activity
        active_users = db.users.count_documents({"total_predictions": {"$gt": 0}})
        
        # Recent activity
        cursor = db.predictions.find().sort("created_at", -1).limit(10)
        recent_predictions = list(cursor)
        for p in recent_predictions:
            p["_id"] = str(p["_id"])
            if "user_id" in p:
                p["user_id"] = str(p["user_id"])
        
        return {
            "success": True,
            "analytics": {
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "inactive": total_users - active_users
                },
                "datasets": {
                    "total": total_datasets,
                    "storage_mb": 0  # Not tracking storage size in MongoDB for now
                },
                "predictions": {
                    "total": total_predictions
                },
                "comparisons": {
                    "total": total_comparisons
                },
                "recent_activity": recent_predictions
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/user/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    admin_user: dict = Depends(require_admin)
):
    """Update user role (admin only)"""
    try:
        if role not in ['user', 'admin']:
            raise HTTPException(status_code=400, detail="Invalid role")
        
        db = get_database()
        
        # Convert string ID to ObjectId
        try:
            obj_id = ObjectId(user_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
            
        result = db.users.update_one(
            {"_id": obj_id},
            {"$set": {"role": role}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "message": f"User role updated to {role}"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
