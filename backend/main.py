from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

# Import routers
from routers import auth, drugs, predict, admin, reports, upload

# Initialize FastAPI app
app = FastAPI(
    title="NeuroVerse API",
    description="AI-Powered Nose-to-Brain Drug Delivery Prediction System",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(drugs.router, prefix="/api/drugs", tags=["Drug Database"])
app.include_router(predict.router, prefix="/api/predict", tags=["Predictions"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(upload.router, prefix="/api/upload", tags=["Uploads"])

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    from utils.database import get_database
    db = get_database()
    print(f"✅ Connected to MongoDB database: {db.name}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    from utils.database import close_database
    close_database()
    print("👋 Closed MongoDB connection")

@app.get("/")
async def root():
    return {
        "message": "NeuroVerse API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
