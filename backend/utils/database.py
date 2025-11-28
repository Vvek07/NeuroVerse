from pymongo import MongoClient
from pymongo.database import Database
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "neuroverse")

_client = None
_db = None

def get_database() -> Database:
    """Get MongoDB database instance"""
    global _client, _db
    
    if _db is None:
        _client = MongoClient(MONGODB_URL)
        _db = _client[MONGODB_DB_NAME]
        
        # Create indexes
        _db.users.create_index("email", unique=True)
        _db.predictions.create_index("user_id")
        _db.comparisons.create_index("user_id")
    
    return _db

def close_database():
    """Close MongoDB connection"""
    global _client
    if _client:
        _client.close()
