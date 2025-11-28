from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
import io

from utils.auth import get_current_user
from utils.database import get_database
from utils.pdf_generator import generate_prediction_report, generate_comparison_report

router = APIRouter()

@router.get("/prediction/{prediction_id}")
async def download_prediction_report(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download PDF report for a prediction"""
    try:
        db = get_database()
        
        # Get prediction data
        prediction_data = db.predictions.find_one({
            "prediction_id": prediction_id,
            "user_id": current_user["_id"]
        })
        
        if not prediction_data:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        # Get dataset info (if applicable, though we moved away from datasets)
        # For now, we'll pass empty dataset info or modify the generator
        dataset_info = {}
        
        # Generate PDF
        pdf_buffer = generate_prediction_report(
            prediction_data,
            current_user,
            dataset_info
        )
        
        # Return as downloadable file
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=prediction_report_{prediction_id}.pdf"
            }
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/comparison/{comparison_id}")
async def download_comparison_report(
    comparison_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download PDF report for a drug comparison"""
    try:
        db = get_database()
        
        # Get comparison data
        comparison_data = db.comparisons.find_one({
            "comparison_id": comparison_id,
            "user_id": current_user["_id"]
        })
        
        if not comparison_data:
            raise HTTPException(status_code=404, detail="Comparison not found")
        
        # Generate PDF
        pdf_buffer = generate_comparison_report(
            comparison_data.get('result', {}),
            current_user
        )
        
        # Return as downloadable file
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=comparison_report_{comparison_id}.pdf"
            }
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
