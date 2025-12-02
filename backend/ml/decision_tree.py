def evaluate_suitability(properties):
    """
    Evaluate overall suitability for Nose-to-Brain delivery using a decision tree logic.
    
    Args:
        properties (dict): Drug properties
        
    Returns:
        dict: {'status': str, 'reason': str, 'recommendation': str}
    """
    mw = properties.get('Mol Wt', 500)
    log_p = properties.get('LogP', 2.0)
    papp = properties.get('Mucosal Permeability (Papp)', 0)
    
    # Decision Node 1: Molecular Weight
    if mw > 1000:
        return {
            "status": "Not Suitable",
            "reason": "Molecular weight too high (>1000 Da) for effective nasal absorption.",
            "recommendation": "Consider nanocarrier encapsulation or permeation enhancers."
        }
    
    # Decision Node 2: Lipophilicity (LogP)
    if log_p < 0:
        return {
            "status": "Challenging",
            "reason": "Too hydrophilic (LogP < 0), poor membrane crossing.",
            "recommendation": "Lipophilic prodrug approach or lipid-based formulation recommended."
        }
    elif log_p > 5:
        return {
            "status": "Challenging",
            "reason": "Too lipophilic (LogP > 5), likely to get trapped in mucosa or poor solubility.",
            "recommendation": "Use solubility enhancers, cyclodextrins, or nano-emulsions."
        }
        
    # Decision Node 3: Permeability
    if papp < 1.0:
        return {
            "status": "Moderate",
            "reason": "Low mucosal permeability.",
            "recommendation": "Add permeation enhancers (e.g., Chitosan, bile salts)."
        }
        
    return {
        "status": "Suitable",
        "reason": "Physicochemical properties are within optimal range for N2B delivery.",
        "recommendation": "Standard formulation (In-situ gel or spray) likely effective."
    }

def suggest_prodrug(properties):
    """
    Suggest prodrug strategies based on deficiencies.
    """
    log_p = properties.get('LogP', 2.0)
    solubility = properties.get('Solubility', -3.0)
    
    suggestions = []
    
    if log_p < 1.0:
        suggestions.append("Lipophilic Prodrug (Esterification) to increase membrane permeability.")
    
    if solubility < -4.0:
        suggestions.append("Hydrophilic Prodrug (Phosphate/Succinate) to improve solubility.")
        
    if not suggestions:
        suggestions.append("No specific prodrug modification required based on LogP and Solubility.")
        
    return suggestions

def recommend_polymer(properties):
    """
    Recommend polymers for formulation based on drug properties.
    """
    mucoadhesion_needed = properties.get('Mucin Binding Index', 0) < 0.5
    solubility_help_needed = properties.get('Solubility', -3.0) < -4.0
    
    recommendations = []
    
    # Base recommendation
    recommendations.append({
        "polymer": "Poloxamer 407 (Pluronic F127)",
        "type": "Thermo-responsive",
        "reason": "Standard for in-situ gelling systems (liquid at room temp, gel at body temp)."
    })
    
    if mucoadhesion_needed:
        recommendations.append({
            "polymer": "Chitosan",
            "type": "Mucoadhesive / Permeation Enhancer",
            "reason": "Positive charge interacts with negative mucin, increasing residence time and opening tight junctions."
        })
        recommendations.append({
            "polymer": "HPMC (Hydroxypropyl methylcellulose)",
            "type": "Mucoadhesive / Viscosity",
            "reason": "Increases formulation viscosity and residence time."
        })
        
    if solubility_help_needed:
        recommendations.append({
            "polymer": "Cyclodextrins (HP-beta-CD)",
            "type": "Solubility Enhancer",
            "reason": "Forms inclusion complexes to improve solubility of hydrophobic drugs."
        })
    else:
        recommendations.append({
            "polymer": "Carbopol 934P",
            "type": "Mucoadhesive / Gelling",
            "reason": "Excellent mucoadhesive properties and gel strength."
        })
        
    return recommendations
