import numpy as np

def calculate_bbb_permeability(log_bb):
    """
    Classify Blood-Brain Barrier (BBB) permeability based on LogBB value.
    
    Args:
        log_bb (float): Logarithm of the brain-to-blood concentration ratio.
        
    Returns:
        dict: {'classification': str, 'details': str}
    """
    if log_bb is None:
        return {"classification": "Unknown", "details": "LogBB value missing"}
    
    if log_bb >= 0.3:
        return {
            "classification": "High",
            "details": "Excellent BBB penetration. Likely to cross readily."
        }
    elif -1.0 <= log_bb < 0.3:
        return {
            "classification": "Moderate",
            "details": "Moderate BBB penetration. May require carrier or enhancement."
        }
    else:
        return {
            "classification": "Low",
            "details": "Poor BBB penetration. Likely restricted by efflux pumps or hydrophilicity."
        }

def check_lipinski(mw, log_p, hbd, hba):
    """
    Check compliance with Lipinski's Rule of 5.
    
    Rules:
    1. Molecular Weight <= 500 Da
    2. LogP <= 5
    3. H-bond donors (HBD) <= 5
    4. H-bond acceptors (HBA) <= 10
    
    Args:
        mw (float): Molecular Weight
        log_p (float): LogP
        hbd (int): Hydrogen Bond Donors
        hba (int): Hydrogen Bond Acceptors
        
    Returns:
        dict: {'passed': bool, 'violations': list}
    """
    violations = []
    
    if mw > 500:
        violations.append(f"MW > 500 ({mw})")
    if log_p > 5:
        violations.append(f"LogP > 5 ({log_p})")
    if hbd > 5:
        violations.append(f"HBD > 5 ({hbd})")
    if hba > 10:
        violations.append(f"HBA > 10 ({hba})")
        
    # Rule allows for 1 violation
    passed = len(violations) <= 1
    
    return {
        "passed": passed,
        "violation_count": len(violations),
        "violations": violations,
        "status": "Compliant" if passed else "Non-Compliant"
    }

def calculate_nbfs(properties):
    """
    Calculate Nasal-to-Brain Feasibility Score (NBFS).
    A weighted score (0-100) indicating suitability for nose-to-brain delivery.
    
    Weights:
    - LogP (Lipophilicity): 30% (Optimal: 1.5 - 3.5)
    - MW (Size): 20% (Optimal: < 400)
    - TPSA (Polarity): 20% (Optimal: < 90)
    - Papp (Permeability): 15% (Higher is better)
    - Solubility: 15% (Higher is better)
    
    Args:
        properties (dict): Dictionary containing drug properties.
        
    Returns:
        dict: {'score': float, 'rating': str}
    """
    score = 0
    
    # 1. LogP (30 points) - Optimal range 1.5 to 3.5
    log_p = properties.get('LogP', 0)
    if 1.5 <= log_p <= 3.5:
        score += 30
    elif 0 <= log_p < 1.5 or 3.5 < log_p <= 5:
        score += 15
    else:
        score += 5
        
    # 2. Molecular Weight (20 points) - Optimal < 400
    mw = properties.get('Mol Wt', 500)
    if mw <= 400:
        score += 20
    elif 400 < mw <= 600:
        score += 10
    else:
        score += 5
        
    # 3. TPSA (20 points) - Optimal < 90
    tpsa = properties.get('TPSA', 100)
    if tpsa <= 90:
        score += 20
    elif 90 < tpsa <= 140:
        score += 10
    else:
        score += 5
        
    # 4. Mucosal Permeability (Papp) (15 points) - Normalized check
    # Assuming Papp is in cm/s * 10^-6, typical range 0.1 to 10+
    papp = properties.get('Mucosal Permeability (Papp)', 0)
    if papp >= 5.0:
        score += 15
    elif 1.0 <= papp < 5.0:
        score += 10
    else:
        score += 5
        
    # 5. Solubility (15 points) - LogS usually negative
    # Optimal > -2 (highly soluble), Acceptable > -4
    solubility = properties.get('Solubility', -5)
    if solubility >= -2:
        score += 15
    elif -4 <= solubility < -2:
        score += 10
    else:
        score += 5
        
    rating = ""
    if score >= 80:
        rating = "Excellent"
    elif score >= 60:
        rating = "Good"
    elif score >= 40:
        rating = "Moderate"
    else:
        rating = "Poor"
        
    return {
        "score": score,
        "rating": rating
    }

def classify_bcs(solubility_log_s, permeability_papp):
    """
    Biopharmaceutics Classification System (BCS) Classification.
    
    Class I: High Solubility, High Permeability
    Class II: Low Solubility, High Permeability
    Class III: High Solubility, Low Permeability
    Class IV: Low Solubility, Low Permeability
    
    Thresholds (Approximated for computational model):
    - High Solubility: LogS > -4
    - High Permeability: Papp > 2.0 (x10^-6 cm/s)
    
    Args:
        solubility_log_s (float): LogS value
        permeability_papp (float): Apparent permeability
        
    Returns:
        dict: {'class': str, 'description': str}
    """
    high_solubility = solubility_log_s >= -4
    high_permeability = permeability_papp >= 2.0
    
    if high_solubility and high_permeability:
        return {"class": "Class I", "description": "High Solubility, High Permeability (Ideal)"}
    elif not high_solubility and high_permeability:
        return {"class": "Class II", "description": "Low Solubility, High Permeability (Permeability limited by dissolution)"}
    elif high_solubility and not high_permeability:
        return {"class": "Class III", "description": "High Solubility, Low Permeability (Absorption limited)"}
    else:
        return {"class": "Class IV", "description": "Low Solubility, Low Permeability (Challenging)"}
