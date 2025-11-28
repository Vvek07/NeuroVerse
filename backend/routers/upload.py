from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict
import shutil
import os
import uuid
from datetime import datetime
from utils.auth import get_current_user
from utils.database import get_database

router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a file (Excel) for analysis"""
    try:
        # Validate file extension
        if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
            raise HTTPException(status_code=400, detail="Only Excel files are allowed")

        # Generate unique filename
        file_id = str(uuid.uuid4())
        extension = os.path.splitext(file.filename)[1]
        safe_filename = f"{file_id}{extension}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        # Save file locally
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Get absolute path for pandas to read later
        abs_file_path = os.path.abspath(file_path)

        # Save metadata to MongoDB
        db = get_database()
        dataset_doc = {
            "file_id": file_id,
            "user_id": current_user["_id"],
            "filename": file.filename,
            "file_url": abs_file_path,  # Storing local path as URL
            "file_type": extension,
            "uploaded_at": datetime.utcnow(),
            "status": "uploaded"
        }
        
        db.datasets.insert_one(dataset_doc)

        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "message": "File uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
