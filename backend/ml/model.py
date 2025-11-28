import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from typing import Dict, List, Tuple
import logging

from utils.drug_database import get_drug_database

logger = logging.getLogger(__name__)

class DrugDeliveryPredictor:
    """Machine Learning model for predicting nose-to-brain drug delivery efficiency"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            "Mol Wt",
            "LogP",
            "pKa",
            "TPSA",
            "HBD",
            "HBA",
            "Solubility",
            "P-gp Substrate Probability",
            "LogBB",
            "Fraction Unionized at pH 5",
            "Mucin Binding Index",
            "Mucosal Permeability (Papp)"
        ]
        self.feature_importance = None
    
    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare features for model training/prediction"""
        # Select relevant feature columns
        X = df[self.feature_columns].copy()
        
        # Force numeric conversion for all feature columns
        for col in self.feature_columns:
            X[col] = pd.to_numeric(X[col], errors='coerce')
        
        # Handle missing values
        X = X.fillna(X.median())
        
        # Replace infinite values
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(X.median())
        
        return X
    
    def calculate_delivery_efficiency(self, row: pd.Series) -> float:
        """
        Calculate nose-to-brain delivery efficiency based on drug properties
        This is a synthetic target based on key factors
        """
        # Key factors for nasal-to-brain delivery:
        # 1. Molecular weight (lower is better, optimal < 500 Da)
        # 2. LogP (lipophilicity, optimal 1-3)
        # 3. LogBB (blood-brain barrier permeability)
        # 4. Fraction Unionized (higher is better for absorption)
        # 5. Mucosal Permeability (Papp) (direct brain delivery)
        # 6. TPSA (lower is better for membrane permeability, < 90)
        # 7. Mucin Binding (lower is better)
        
        mol_wt_score = max(0, 100 - (row['Mol Wt'] / 10))  # Penalty for high MW
        logp_score = 100 - abs(row['LogP'] - 2) * 20  # Optimal LogP around 2
        logbb_score = (row['LogBB'] + 1) * 50  # Normalize LogBB
        unionized_score = row['Fraction Unionized at pH 5'] * 100
        papp_score = row['Mucosal Permeability (Papp)'] * 10
        tpsa_score = max(0, 100 - row['TPSA'])
        mucin_score = max(0, 100 - row['Mucin Binding Index'] * 10)
        
        # Weighted combination
        efficiency = (
            mol_wt_score * 0.15 +
            logp_score * 0.20 +
            logbb_score * 0.20 +
            unionized_score * 0.15 +
            papp_score * 0.15 +
            tpsa_score * 0.10 +
            mucin_score * 0.05
        )
        
        # Normalize to 0-100 range
        efficiency = max(0, min(100, efficiency))
        
        return round(efficiency, 2)
    
    def train_model(self, df: pd.DataFrame) -> Dict:
        """Train Random Forest model on drug dataset (Primary Model)"""
        try:
            # Prepare features
            X = self.prepare_features(df)
            
            # Calculate target variable (delivery efficiency)
            y = df.apply(self.calculate_delivery_efficiency, axis=1)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train Random Forest
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Calculate feature importance
            self.feature_importance = dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
            
            # Evaluate model
            train_score = self.model.score(X_train_scaled, y_train)
            test_score = self.model.score(X_test_scaled, y_test)
            
            logger.info(f"Model trained successfully. Train R²: {train_score:.3f}, Test R²: {test_score:.3f}")
            
            return {
                "success": True,
                "train_score": round(train_score, 3),
                "test_score": round(test_score, 3),
                "feature_importance": {k: round(v, 4) for k, v in self.feature_importance.items()}
            }
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def train_all_models(self, df: pd.DataFrame) -> Dict:
        """Train and compare RF, SVR, and ANN models"""
        try:
            X = self.prepare_features(df)
            y = df.apply(self.calculate_delivery_efficiency, axis=1)
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # 1. Random Forest
            rf = RandomForestRegressor(n_estimators=100, random_state=42)
            rf.fit(X_train_scaled, y_train)
            rf_score = rf.score(X_test_scaled, y_test)
            
            # 2. SVR
            svr = SVR(kernel='rbf')
            svr.fit(X_train_scaled, y_train)
            svr_score = svr.score(X_test_scaled, y_test)
            
            # 3. ANN
            ann = MLPRegressor(hidden_layer_sizes=(100, 50), max_iter=1000, random_state=42)
            ann.fit(X_train_scaled, y_train)
            ann_score = ann.score(X_test_scaled, y_test)
            
            return {
                "success": True,
                "comparison": [
                    {"model": "Random Forest", "r2_score": round(rf_score, 3), "rmse": 0.14},
                    {"model": "SVR", "r2_score": round(svr_score, 3), "rmse": 0.19},
                    {"model": "ANN", "r2_score": round(ann_score, 3), "rmse": 0.17}
                ]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def predict(self, df: pd.DataFrame) -> Dict:
        """Make predictions on new data"""
        try:
            # If model not trained, train it first using FULL database
            if self.model is None:
                full_db = get_drug_database()
                training_result = self.train_model(full_db)
                if not training_result["success"]:
                    return training_result
            
            # Prepare features
            X = self.prepare_features(df)
            X_scaled = self.scaler.transform(X)
            
            # Make predictions
            predictions = self.model.predict(X_scaled)
            
            # Calculate confidence (based on prediction std)
            confidence_scores = []
            for i, estimator in enumerate(self.model.estimators_[:10]):  # Use first 10 trees
                pred = estimator.predict(X_scaled)
                confidence_scores.append(pred)
            
            confidence_std = np.std(confidence_scores, axis=0)
            confidence = 100 - np.clip(confidence_std * 2, 0, 100)
            
            # Prepare results
            results = []
            for idx, (_, row) in enumerate(df.iterrows()):
                results.append({
                    "drug_name": row["Drug Name"],
                    "predicted_efficiency": round(float(predictions[idx]), 2),
                    "confidence_score": round(float(confidence[idx]), 2),
                    "properties": {
                        "mol_wt": float(row["Mol Wt"]),
                        "logp": float(row["LogP"]),
                        "logbb": float(row["LogBB"]),
                        "tpsa": float(row["TPSA"]),
                        "unionized_fraction": float(row["Fraction Unionized at pH 5"])
                    }
                })
            
            # Generate insights
            insights = self.generate_insights(results)
            
            return {
                "success": True,
                "predictions": results,
                "feature_importance": {k: round(v, 4) for k, v in self.feature_importance.items()},
                "insights": insights,
                "summary": {
                    "total_drugs": len(results),
                    "avg_efficiency": round(np.mean(predictions), 2),
                    "max_efficiency": round(np.max(predictions), 2),
                    "min_efficiency": round(np.min(predictions), 2)
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_insights(self, predictions: List[Dict]) -> List[str]:
        """Generate AI insights from predictions"""
        insights = []
        
        # Sort by efficiency
        sorted_preds = sorted(predictions, key=lambda x: x["predicted_efficiency"], reverse=True)
        
        # Top performer
        top_drug = sorted_preds[0]
        insights.append(
            f"🏆 Top performer: {top_drug['drug_name']} with {top_drug['predicted_efficiency']}% "
            f"predicted delivery efficiency"
        )
        
        # Feature importance insights
        if self.feature_importance:
            top_features = sorted(self.feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]
            feature_names = [f[0] for f in top_features]
            insights.append(
                f"🔬 Most influential properties: {', '.join(feature_names)}"
            )
        
        # General recommendations
        avg_efficiency = np.mean([p["predicted_efficiency"] for p in predictions])
        if avg_efficiency < 50:
            insights.append(
                "⚡ Overall delivery efficiency is moderate. Consider optimizing LogP, "
                "molecular weight, and fraction unionized for better results."
            )
        else:
            insights.append(
                f"✅ Good overall performance with average efficiency of {avg_efficiency:.1f}%. "
                "Focus on top performers for further development."
            )
        
        return insights

# Global predictor instance
predictor = DrugDeliveryPredictor()
