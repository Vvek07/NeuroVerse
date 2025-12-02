from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from datetime import datetime
from bson import ObjectId

from utils.auth import get_current_user
from utils.database import get_database
from utils.drug_database import (
    get_all_drugs,
    search_drugs,
    get_drug_by_name,
    get_drug_database,
    get_database_stats
)
from ml.model import predictor
from ml.recommendations import generate_recommendations

router = APIRouter()

class DrugSearchResponse(BaseModel):
    name: str

@router.get("/list")
async def list_all_drugs(current_user: dict = Depends(get_current_user)):
    """Get list of all available drugs"""
    try:
        df = get_drug_database()
        # Convert to list of dicts
        drugs = df.to_dict(orient='records')
        return {
            "success": True,
            "drugs": drugs,
            "total": len(drugs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drugs/search")
async def search_drug(
    q: str,
    current_user: dict = Depends(get_current_user)
):
    """Search drugs by name"""
    try:
        if not q or len(q) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
        
        results = search_drugs(q)
        return {
            "success": True,
            "results": results,
            "count": len(results)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drugs/{drug_name}")
async def get_drug_details(
    drug_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific drug"""
    try:
        drug_data = get_drug_by_name(drug_name)
        
        if not drug_data:
            raise HTTPException(status_code=404, detail=f"Drug '{drug_name}' not found")
        
        return {
            "success": True,
            "drug": drug_data
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/{drug_name}")
async def analyze_drug(
    drug_name: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Comprehensive drug analysis:
    - Predict nose-to-brain delivery efficiency
    - Generate recommendations
    - Provide insights
    """
    try:
        db = get_database()
        
        # Get drug data
        drug_data = get_drug_by_name(drug_name)
        if not drug_data:
            raise HTTPException(status_code=404, detail=f"Drug '{drug_name}' not found")
        
        # Get full database for model training
        df = get_drug_database()
        
        # Create single-row dataframe for this drug
        drug_df = pd.DataFrame([drug_data])
        
        # Run prediction
        prediction_result = predictor.predict(drug_df)
        
        if not prediction_result["success"]:
            raise HTTPException(status_code=500, detail="Prediction failed")
        
        # Get the prediction for this drug
        drug_prediction = prediction_result["predictions"][0]
        
        # Generate recommendations
        recommendations = generate_recommendations(drug_data)
        
        # Save prediction to database
        prediction_doc = {
            "_id": str(ObjectId()),
            "user_id": current_user["_id"],
            "drug_name": drug_name,
            "predicted_efficiency": drug_prediction["predicted_efficiency"],
            "confidence_score": drug_prediction["confidence_score"],
            "properties": drug_prediction["properties"],
            "created_at": datetime.utcnow()
        }
        
        db.predictions.insert_one(prediction_doc)
        
        # Update user prediction count
        db.users.update_one(
            {"_id": current_user["_id"]},
            {"$inc": {"total_predictions": 1}}
        )
        
        return {
            "success": True,
            "drug_name": drug_name,
            "prediction": drug_prediction,
            "recommendations": recommendations,
            "feature_importance": prediction_result["feature_importance"],
            "insights": prediction_result["insights"]
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/database/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Get database statistics"""
    try:
        stats = get_database_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
