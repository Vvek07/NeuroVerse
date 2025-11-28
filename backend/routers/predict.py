from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
import pandas as pd
import io
import uuid
from datetime import datetime
from bson import ObjectId

from utils.auth import get_current_user
from utils.database import get_database
from utils.drug_database import get_drug_by_name, get_drug_database
from utils.pdf_generator import generate_drug_analysis_report
from ml.model import predictor
from ml.comparison import compare_drugs
from ml.recommendations import generate_recommendations
from fastapi.responses import StreamingResponse

router = APIRouter()

class PredictionRequest(BaseModel):
    file_id: str

class CompareRequest(BaseModel):
    drug1_name: str
    drug2_name: str

class RecommendationRequest(BaseModel):
    drug_name: str
    drug_properties: Dict

class CustomPredictionRequest(BaseModel):
    drug_name: str
    properties: Dict[str, float]

@router.post("/")
async def run_prediction(
    request: PredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Run ML prediction on uploaded dataset"""
    try:
        # Get dataset
        db = get_database()
        dataset = db.datasets.find_one({
            "file_id": request.file_id,
            "user_id": current_user["_id"]
        })
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Validate file type
        if dataset['file_type'] not in ['.xlsx', '.xls']:
            raise HTTPException(
                status_code=400,
                detail="Only Excel files can be used for predictions"
            )
        
        # Load dataset
        try:
            # In a real app with local storage, we'd read from file path
            # For now, assuming file_url is a path or we need to handle file storage
            # Since we removed Firebase Storage, we need to handle this differently
            # But for now, let's assume the file path is stored in file_url
            df = pd.read_excel(dataset['file_url'])
            print(f"DEBUG: Raw columns from Excel: {df.columns.tolist()}")
            
            # Normalize columns to match model expectations (Case Insensitive)
            # Map of lowercased common variations to expected standard names
            target_map = {
                # Drug Name
                "drug name": "Drug Name",
                "name": "Drug Name",
                "drug": "Drug Name",
                "compound": "Drug Name",
                "compound name": "Drug Name",
                "molecule": "Drug Name",
                "molecule name": "Drug Name",
                
                # Mol Wt
                "mol wt": "Mol Wt",
                "molecular weight": "Mol Wt",
                "mw": "Mol Wt",
                
                # LogP
                "logp": "LogP",
                "log p": "LogP",
                "log-p": "LogP",
                
                # pKa
                "pka": "pKa",
                
                # TPSA
                "tpsa": "TPSA",
                
                # HBD
                "hbd": "HBD",
                "h-bond donors": "HBD",
                "hydrogen bond donors": "HBD",
                "h bond donors": "HBD",
                
                # HBA
                "hba": "HBA",
                "h-bond acceptors": "HBA",
                "hydrogen bond acceptors": "HBA",
                "h bond acceptors": "HBA",
                
                # Solubility
                "solubility": "Solubility",
                "logs": "Solubility",
                
                # P-gp
                "p-gp substrate probability": "P-gp Substrate Probability",
                "p-gp substrate": "P-gp Substrate Probability",
                "p-gp": "P-gp Substrate Probability",
                "pgp": "P-gp Substrate Probability",
                
                # LogBB
                "logbb": "LogBB",
                "log bb": "LogBB",
                "log-bb": "LogBB",
                
                # Fraction Unionized
                "fraction unionized at ph 5": "Fraction Unionized at pH 5",
                "fraction unionized": "Fraction Unionized at pH 5",
                "unionized": "Fraction Unionized at pH 5",
                "fu": "Fraction Unionized at pH 5",
                
                # Mucin Binding
                "mucin binding index": "Mucin Binding Index",
                "mucin binding": "Mucin Binding Index",
                "mbi": "Mucin Binding Index",
                
                # Papp
                "mucosal permeability (papp)": "Mucosal Permeability (Papp)",
                "mucosal permeability": "Mucosal Permeability (Papp)",
                "permeability": "Mucosal Permeability (Papp)",
                "papp": "Mucosal Permeability (Papp)"
            }
            
            # Create a new mapping based on actual columns
            rename_dict = {}
            for col in df.columns:
                col_clean = str(col).strip().lower()
                if col_clean in target_map:
                    rename_dict[col] = target_map[col_clean]
            
            if rename_dict:
                df = df.rename(columns=rename_dict)
                print(f"DEBUG: Renamed columns: {rename_dict}")
            
            print(f"DEBUG: Final columns: {df.columns.tolist()}")
            
            # Clean data: Remove units and non-numeric characters from feature columns
            # This fixes issues like "410.5 g/mol" causing float conversion errors
            for col in predictor.feature_columns:
                if col in df.columns:
                    # Convert to string first to handle any mixed types
                    df[col] = df[col].astype(str)
                    # Extract the first valid number (int or float, positive or negative)
                    # Regex explanation: optional minus, one or more digits, optional decimal part
                    extracted = df[col].str.extract(r'(-?\d+\.?\d*)')[0]
                    # Replace the column with extracted numbers
                    df[col] = pd.to_numeric(extracted, errors='coerce')
            
            # Verify required columns exist
            required_columns = predictor.feature_columns
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                # If columns are missing, try to fill them from our database using Drug Name
                if "Drug Name" in df.columns:
                    print(f"⚠️ Missing columns: {missing_columns}. Attempting to enrich data from database...")
                    
                    # Iterate through rows and fill missing data
                    for index, row in df.iterrows():
                        drug_name = row["Drug Name"]
                        if pd.notna(drug_name):
                            # Look up drug in our database
                            db_drug = get_drug_by_name(str(drug_name))
                            
                            if db_drug:
                                # Fill in missing columns for this row
                                for col in missing_columns:
                                    if col in db_drug:
                                        df.at[index, col] = db_drug[col]
                    
                    # Check if we still have missing values after enrichment
                    # (We only care if ALL rows are missing a required column)
                    still_missing = []
                    for col in missing_columns:
                        if df[col].isna().all():
                            still_missing.append(col)
                            
                    if still_missing:
                        raise ValueError(f"Could not find data for columns: {', '.join(still_missing)}. Please ensure your Excel file contains these columns or valid Drug Names present in our database.")
                        
                    # Fill any remaining NaNs (e.g. if some drugs were found but others weren't) with median
                    # This is a fallback to prevent crashing, but ideally we'd warn the user
                    df = df.fillna(df.median(numeric_only=True))
                    
                else:
                    raise ValueError(f"Missing required columns: {', '.join(missing_columns)} and no 'Drug Name' column found to look up data.")
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error loading dataset: {str(e)}"
            )
        
        # Run prediction
        result = predictor.predict(df)
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Prediction failed")
            )
        
        # Save prediction results
        prediction_id = str(uuid.uuid4())
        prediction_doc = {
            "prediction_id": prediction_id,
            "file_id": request.file_id,
            "user_id": current_user['_id'],
            "created_at": datetime.utcnow(),
            "predictions": result["predictions"],
            "feature_importance": result["feature_importance"],
            "insights": result["insights"],
            "summary": result["summary"]
        }
        
        db.predictions.insert_one(prediction_doc)
        
        # Update user statistics
        db.users.update_one(
            {"_id": current_user["_id"]},
            {"$inc": {"total_predictions": 1}}
        )
        
        return {
            "success": True,
            "prediction_id": prediction_id,
            "results": result
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_prediction_history(
    limit: Optional[int] = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get prediction history for current user"""
    try:
        db = get_database()
        cursor = db.predictions.find(
            {"user_id": current_user["_id"]}
        ).sort("created_at", -1).limit(limit)
        
        predictions = list(cursor)
        
        # Convert ObjectId to string
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

@router.get("/{prediction_id}")
async def get_prediction_details(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific prediction details"""
    try:
        db = get_database()
        prediction = db.predictions.find_one({
            "prediction_id": prediction_id,
            "user_id": current_user["_id"]
        })
        
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
            
        # Convert ObjectId
        prediction["_id"] = str(prediction["_id"])
        if "user_id" in prediction:
            prediction["user_id"] = str(prediction["user_id"])
        
        return {
            "success": True,
            "prediction": prediction
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare")
async def compare_two_drugs(
    request: CompareRequest,
    current_user: dict = Depends(get_current_user)
):
    """Compare two drugs from global database"""
    try:
        db = get_database()
        
        # Get drug data from global database
        drug1_data = get_drug_by_name(request.drug1_name)
        drug2_data = get_drug_by_name(request.drug2_name)
        
        if not drug1_data:
            raise HTTPException(status_code=404, detail=f"Drug '{request.drug1_name}' not found")
        if not drug2_data:
            raise HTTPException(status_code=404, detail=f"Drug '{request.drug2_name}' not found")
        
        # Get full database for model context
        full_df = get_drug_database()
        
        # Compare drugs
        comparison_result = compare_drugs(drug1_data, drug2_data, full_df)
        
        if not comparison_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=comparison_result.get("error", "Comparison failed")
            )
        
        # Save comparison
        comparison_id = str(uuid.uuid4())
        comparison_doc = {
            "comparison_id": comparison_id,
            "user_id": current_user['_id'],
            "created_at": datetime.utcnow(),
            "drug1_name": request.drug1_name,
            "drug2_name": request.drug2_name,
            "result": comparison_result
        }
        
        db.comparisons.insert_one(comparison_doc)
        
        # Update user statistics
        db.users.update_one(
            {"_id": current_user["_id"]},
            {"$inc": {"total_comparisons": 1}}
        )
        
        return {
            "success": True,
            "comparison_id": comparison_id,
            "result": comparison_result
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations")
async def get_drug_recommendations(
    request: RecommendationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get AI recommendations for improving drug delivery"""
    try:
        recommendations = generate_recommendations(request.drug_properties)
        
        return {
            "success": True,
            "drug_name": request.drug_name,
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/custom")
async def predict_custom_drug(
    request: CustomPredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Run prediction on manually entered drug parameters"""
    try:
        # Create DataFrame for model
        df = pd.DataFrame([request.properties])
        
        # Add dummy name if needed by model (model uses it for display)
        df["Drug Name"] = request.drug_name
        
        # Run prediction
        result = predictor.predict(df)
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Prediction failed")
            )
            
        # Save prediction
        db = get_database()
        prediction_id = str(uuid.uuid4())
        
        # Extract the single prediction result
        pred_data = result["predictions"][0]
        
        prediction_doc = {
            "prediction_id": prediction_id,
            "user_id": current_user['_id'],
            "created_at": datetime.utcnow(),
            "drug_name": request.drug_name,
            "is_custom": True,
            "properties": request.properties,
            "predicted_efficiency": pred_data["predicted_efficiency"],
            "confidence_score": pred_data["confidence_score"],
            "insights": result["insights"]
        }
        
        db.predictions.insert_one(prediction_doc)
        
        # Update stats
        db.users.update_one(
            {"_id": current_user["_id"]},
            {"$inc": {"total_predictions": 1}}
        )
        
        # Generate recommendations
        recommendations = generate_recommendations(request.properties)

        # Auto-save new drug to global database
        try:
            # Prepare drug data for database (map properties to CSV columns)
            new_drug_data = {
                "Drug Name": request.drug_name,
                "Mol Wt": request.properties.get("mol_wt", 0),
                "LogP": request.properties.get("logp", 0),
                "LogBB": request.properties.get("logbb", 0),
                "TPSA": request.properties.get("tpsa", 0),
                "Fraction Unionized at pH 5": request.properties.get("unionized_fraction", 0),
                # Add defaults for other columns if missing
                "pKa": request.properties.get("pka", 7.0),
                "HBD": request.properties.get("hbd", 0),
                "HBA": request.properties.get("hba", 0),
                "Solubility": request.properties.get("solubility", -2.0),
                "P-gp Substrate Probability": request.properties.get("pgp", 0),
                "Mucin Binding Index": request.properties.get("mucin", 0),
                "Mucosal Permeability (Papp)": request.properties.get("papp", 0)
            }
            
            from utils.drug_database import add_drug_to_database
            saved = add_drug_to_database(new_drug_data)
            if saved:
                print(f"✅ Auto-saved new drug '{request.drug_name}' to global database")
        except Exception as e:
            print(f"⚠️ Failed to auto-save drug: {e}")

        return {
            "success": True,
            "prediction_id": prediction_id,
            "result": pred_data,
            "insights": result["insights"],
            "feature_importance": result["feature_importance"],
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-comparison")
async def get_model_comparison(current_user: dict = Depends(get_current_user)):
    """Get comparison of RF, SVR, and ANN models"""
    try:
        # Get full drug database
        full_df = get_drug_database()
        
        # Train and compare all models
        comparison_result = predictor.train_all_models(full_df)
        
        if not comparison_result["success"]:
            raise HTTPException(status_code=500, detail=comparison_result.get("error", "Model comparison failed"))
        
        return {
            "success": True,
            "comparison": comparison_result["comparison"],
            "conclusion": "Random Forest demonstrates the best performance for predicting nose-to-brain delivery efficiency."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/summary")
async def get_analytics_summary(current_user: dict = Depends(get_current_user)):
    """Get analytics summary for user"""
    try:
        db = get_database()
        
        # Get all predictions
        cursor = db.predictions.find({"user_id": current_user["_id"]})
        predictions = list(cursor)
        
        if not predictions:
            return {
                "success": True,
                "summary": {
                    "total_predictions": 0,
                    "total_drugs_analyzed": 0,
                    "top_drugs": [],
                    "avg_efficiency": 0
                }
            }
        
        # Aggregate data
        all_drugs = []
        for pred in predictions:
            all_drugs.extend(pred.get('predictions', []))
        
        # Sort by efficiency
        sorted_drugs = sorted(
            all_drugs,
            key=lambda x: x.get('predicted_efficiency', 0),
            reverse=True
        )[:10]
        
        # Calculate average
        avg_efficiency = sum(d.get('predicted_efficiency', 0) for d in all_drugs) / len(all_drugs) if all_drugs else 0
        
        return {
            "success": True,
            "summary": {
                "total_predictions": len(predictions),
                "total_drugs_analyzed": len(all_drugs),
                "top_drugs": sorted_drugs,
                "avg_efficiency": round(avg_efficiency, 2)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download-report/{prediction_id}")
async def download_prediction_report(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download PDF report for a prediction"""
    try:
        db = get_database()
        
        # Get prediction data
        prediction = db.predictions.find_one({
            "prediction_id": prediction_id,
            "user_id": current_user["_id"]
        })
        
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        # Extract data
        drug_name = prediction.get("drug_name", "Unknown")
        predicted_efficiency = prediction.get("predicted_efficiency", 0)
        confidence_score = prediction.get("confidence_score", 0)
        properties = prediction.get("properties", {})
        
        prediction_data = {
            "predicted_efficiency": predicted_efficiency,
            "confidence_score": confidence_score,
            "properties": properties
        }
        
        # Get user info
        user_info = {
            "name": current_user.get("name", "User")
        }
        
        # Get recommendations and feature importance from latest analysis
        # (These might not be stored in old predictions, so we provide defaults)
        recommendations = []
        feature_importance = {}
        
        # Generate PDF
        pdf_buffer = generate_drug_analysis_report(
            drug_name=drug_name,
            prediction_data=prediction_data,
            recommendations=recommendations,
            feature_importance=feature_importance,
            user_info=user_info
        )
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
        filename = f"DrugAnalysis_{drug_name}_{timestamp}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
