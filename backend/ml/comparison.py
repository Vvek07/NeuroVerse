import pandas as pd
import numpy as np
from typing import Dict, List
from ml.model import predictor

def compare_drugs(drug1_data: Dict, drug2_data: Dict, df: pd.DataFrame) -> Dict:
    """
    Compare two drugs and predict which has better nose-to-brain delivery
    
    Args:
        drug1_data: First drug properties
        drug2_data: Second drug properties
        df: Full dataset for model training
    
    Returns:
        Comparison results with predictions and analysis
    """
    try:
        # Ensure model is trained
        if predictor.model is None:
            predictor.train_model(df)
        
        # Create DataFrame for drugs to compare
        compare_df = pd.DataFrame([drug1_data, drug2_data])
        
        # Make predictions
        result = predictor.predict(compare_df)
        
        if not result["success"]:
            return result
        
        drug1_pred = result["predictions"][0]
        drug2_pred = result["predictions"][1]
        
        # Determine winner
        if drug1_pred["predicted_efficiency"] > drug2_pred["predicted_efficiency"]:
            winner = drug1_pred["drug_name"]
            difference = drug1_pred["predicted_efficiency"] - drug2_pred["predicted_efficiency"]
        else:
            winner = drug2_pred["drug_name"]
            difference = drug2_pred["predicted_efficiency"] - drug1_pred["predicted_efficiency"]
        
        # Generate detailed comparison
        comparison_analysis = generate_comparison_analysis(drug1_pred, drug2_pred, predictor.feature_importance)
        
        # Prepare radar chart data
        radar_data = prepare_radar_chart_data(drug1_pred, drug2_pred)
        
        return {
            "success": True,
            "drug1": drug1_pred,
            "drug2": drug2_pred,
            "winner": winner,
            "efficiency_difference": round(difference, 2),
            "comparison_analysis": comparison_analysis,
            "radar_chart_data": radar_data
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def generate_comparison_analysis(drug1: Dict, drug2: Dict, feature_importance: Dict) -> str:
    """Generate detailed text analysis of drug comparison"""
    
    analysis = []
    
    # Overall comparison
    if drug1["predicted_efficiency"] > drug2["predicted_efficiency"]:
        diff = drug1["predicted_efficiency"] - drug2["predicted_efficiency"]
        analysis.append(
            f"**{drug1['drug_name']}** shows superior nose-to-brain delivery potential "
            f"with {diff:.1f}% higher predicted efficiency than {drug2['drug_name']}."
        )
    else:
        diff = drug2["predicted_efficiency"] - drug1["predicted_efficiency"]
        analysis.append(
            f"**{drug2['drug_name']}** shows superior nose-to-brain delivery potential "
            f"with {diff:.1f}% higher predicted efficiency than {drug1['drug_name']}."
        )
    
    # Property-wise comparison
    prop1 = drug1["properties"]
    prop2 = drug2["properties"]
    
    # Molecular weight
    if abs(prop1["mol_wt"] - prop2["mol_wt"]) > 50:
        if prop1["mol_wt"] < prop2["mol_wt"]:
            analysis.append(
                f"• **Molecular Weight**: {drug1['drug_name']} ({prop1['mol_wt']} Da) has a "
                f"lower molecular weight, which generally favors nasal absorption."
            )
        else:
            analysis.append(
                f"• **Molecular Weight**: {drug2['drug_name']} ({prop2['mol_wt']} Da) has a "
                f"lower molecular weight, which generally favors nasal absorption."
            )
    
    # LogP
    if abs(prop1["logp"] - prop2["logp"]) > 0.5:
        optimal_logp = 2.0
        logp1_diff = abs(prop1["logp"] - optimal_logp)
        logp2_diff = abs(prop2["logp"] - optimal_logp)
        
        if logp1_diff < logp2_diff:
            analysis.append(
                f"• **Lipophilicity (LogP)**: {drug1['drug_name']} (LogP={prop1['logp']}) is "
                f"closer to the optimal range for membrane permeability."
            )
        else:
            analysis.append(
                f"• **Lipophilicity (LogP)**: {drug2['drug_name']} (LogP={prop2['logp']}) is "
                f"closer to the optimal range for membrane permeability."
            )
    
    # LogBB
    if abs(prop1["logbb"] - prop2["logbb"]) > 0.2:
        if prop1["logbb"] > prop2["logbb"]:
            analysis.append(
                f"• **Blood-Brain Barrier**: {drug1['drug_name']} (LogBB={prop1['logbb']}) "
                f"shows better CNS penetration potential."
            )
        else:
            analysis.append(
                f"• **Blood-Brain Barrier**: {drug2['drug_name']} (LogBB={prop2['logbb']}) "
                f"shows better CNS penetration potential."
            )
    
    # TPSA
    if abs(prop1["tpsa"] - prop2["tpsa"]) > 20:
        if prop1["tpsa"] < prop2["tpsa"]:
            analysis.append(
                f"• **Polar Surface Area**: {drug1['drug_name']} (TPSA={prop1['tpsa']}) has "
                f"lower TPSA, enhancing membrane permeability."
            )
        else:
            analysis.append(
                f"• **Polar Surface Area**: {drug2['drug_name']} (TPSA={prop2['tpsa']}) has "
                f"lower TPSA, enhancing membrane permeability."
            )
    
    # Confidence comparison
    conf_diff = abs(drug1["confidence_score"] - drug2["confidence_score"])
    if conf_diff > 10:
        if drug1["confidence_score"] > drug2["confidence_score"]:
            analysis.append(
                f"• **Prediction Confidence**: Higher confidence for {drug1['drug_name']} "
                f"({drug1['confidence_score']}% vs {drug2['confidence_score']}%)"
            )
        else:
            analysis.append(
                f"• **Prediction Confidence**: Higher confidence for {drug2['drug_name']} "
                f"({drug2['confidence_score']}% vs {drug1['confidence_score']}%)"
            )
    
    return "\n".join(analysis)

def prepare_radar_chart_data(drug1: Dict, drug2: Dict) -> Dict:
    """Prepare data for radar chart visualization"""
    
    # Normalize properties to 0-100 scale for visualization
    def normalize(value, min_val, max_val):
        return ((value - min_val) / (max_val - min_val)) * 100
    
    prop1 = drug1["properties"]
    prop2 = drug2["properties"]
    
    # Define normalization ranges (based on typical drug properties)
    ranges = {
        "mol_wt": (100, 1000),
        "logp": (-2, 6),
        "logbb": (-3, 2),
        "tpsa": (0, 200),
        "unionized_fraction": (0, 1)
    }
    
    # Prepare radar data
    categories = ["Molecular Weight", "LogP", "LogBB", "TPSA", "Unionized Fraction"]
    
    drug1_values = [
        100 - normalize(prop1["mol_wt"], *ranges["mol_wt"]),  # Lower is better
        normalize(prop1["logp"], *ranges["logp"]),
        normalize(prop1["logbb"], *ranges["logbb"]),
        100 - normalize(prop1["tpsa"], *ranges["tpsa"]),  # Lower is better
        normalize(prop1["unionized_fraction"], *ranges["unionized_fraction"])
    ]
    
    drug2_values = [
        100 - normalize(prop2["mol_wt"], *ranges["mol_wt"]),
        normalize(prop2["logp"], *ranges["logp"]),
        normalize(prop2["logbb"], *ranges["logbb"]),
        100 - normalize(prop2["tpsa"], *ranges["tpsa"]),
        normalize(prop2["unionized_fraction"], *ranges["unionized_fraction"])
    ]
    
    return {
        "categories": categories,
        "drug1_name": drug1["drug_name"],
        "drug1_values": [max(0, min(100, v)) for v in drug1_values],
        "drug2_name": drug2["drug_name"],
        "drug2_values": [max(0, min(100, v)) for v in drug2_values]
    }
