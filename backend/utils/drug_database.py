import pandas as pd
import os
from typing import Dict, List, Optional

# Load drug database at module level (singleton)
DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'drug_database.csv')
_drug_database = None

def load_drug_database() -> pd.DataFrame:
    """Load the pre-loaded drug database"""
    global _drug_database
    if _drug_database is None:
        _drug_database = pd.read_csv(DATABASE_PATH)
    return _drug_database

def reload_drug_database() -> pd.DataFrame:
    """Force reload the drug database (clears cache)"""
    global _drug_database
    _drug_database = pd.read_csv(DATABASE_PATH)
    return _drug_database

def get_all_drugs() -> List[str]:
    """Get list of all drug names"""
    df = load_drug_database()
    return sorted(df['Drug Name'].unique().tolist())

def search_drugs(query: str) -> List[Dict]:
    """Search drugs by name (case-insensitive partial match)"""
    df = load_drug_database()
    mask = df['Drug Name'].str.contains(query, case=False, na=False)
    results = df[mask]['Drug Name'].unique().tolist()
    return [{"name": name} for name in sorted(results)]

def get_drug_by_name(drug_name: str) -> Optional[Dict]:
    """Get drug data by exact name"""
    df = load_drug_database()
    drug_data = df[df['Drug Name'].str.lower() == drug_name.lower()]
    
    if drug_data.empty:
        return None
    
    return drug_data.iloc[0].to_dict()

def get_drug_database() -> pd.DataFrame:
    """Get the full drug database DataFrame"""
    return load_drug_database()

def add_drug_to_database(drug_data: Dict) -> bool:
    """Add a new drug to the database if it doesn't exist"""
    try:
        df = load_drug_database()
        
        # Check if drug already exists (case-insensitive)
        drug_name = drug_data.get("Drug Name")
        if not drug_name:
            return False
            
        if drug_name.lower() in df['Drug Name'].str.lower().values:
            return False  # Already exists
            
        # Prepare new row
        new_row = {col: drug_data.get(col, 0) for col in df.columns}
        new_row['Drug Name'] = drug_name  # Ensure name is set correctly
        
        # Append to DataFrame
        new_df = pd.DataFrame([new_row])
        # Append to CSV file
        new_df.to_csv(DATABASE_PATH, mode='a', header=False, index=False)
        
        # Reload cache
        reload_drug_database()
        return True
        
    except Exception as e:
        print(f"Error adding drug to database: {e}")
        return False

def get_database_stats() -> Dict:
    """Get statistics about the drug database"""
    df = load_drug_database()
    return {
        "total_drugs": len(df),
        "unique_drugs": df['Drug Name'].nunique(),
        "columns": list(df.columns),
        "avg_mol_wt": round(df['Mol Wt'].mean(), 2),
        "avg_logp": round(df['LogP'].mean(), 2)
    }
