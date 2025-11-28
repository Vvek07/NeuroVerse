from typing import Dict, List
import numpy as np

def generate_recommendations(drug_properties: Dict) -> Dict:
    """
    Generate AI-powered recommendations to improve nose-to-brain drug delivery
    
    Args:
        drug_properties: Dictionary containing drug properties
    
    Returns:
        Recommendations with specific suggestions and expected improvements
    """
    
    recommendations = []
    priority_score = 0
    
    # Extract properties
    mol_wt = drug_properties.get("mol_wt", 0)
    logp = drug_properties.get("logp", 0)
    tpsa = drug_properties.get("tpsa", 0)
    logbb = drug_properties.get("logbb", 0)
    unionized_fraction = drug_properties.get("unionized_fraction", 0)
    hbd = drug_properties.get("hbd", 0)
    hba = drug_properties.get("hba", 0)
    
    # 1. Molecular Weight Optimization
    if mol_wt > 500:
        impact = "High"
        priority_score += 3
        recommendations.append({
            "category": "Molecular Weight",
            "issue": f"Current molecular weight ({mol_wt:.1f} Da) exceeds optimal range",
            "recommendation": "Reduce molecular weight to < 500 Da for better nasal absorption",
            "strategy": [
                "Remove non-essential functional groups",
                "Consider prodrug approaches",
                "Simplify molecular structure while maintaining activity"
            ],
            "expected_improvement": "15-25% increase in delivery efficiency",
            "impact": impact
        })
    elif mol_wt < 200:
        impact = "Medium"
        priority_score += 1
        recommendations.append({
            "category": "Molecular Weight",
            "issue": f"Very low molecular weight ({mol_wt:.1f} Da) may lead to rapid clearance",
            "recommendation": "Consider controlled-release formulations",
            "strategy": [
                "Develop extended-release nasal formulations",
                "Use mucoadhesive polymers",
                "Consider nanoparticle encapsulation"
            ],
            "expected_improvement": "10-15% increase in sustained delivery",
            "impact": impact
        })
    
    # 2. LogP Optimization
    optimal_logp_min, optimal_logp_max = 1, 3
    if logp < optimal_logp_min:
        impact = "High"
        priority_score += 3
        recommendations.append({
            "category": "Lipophilicity (LogP)",
            "issue": f"LogP ({logp:.2f}) is too low for optimal membrane permeability",
            "recommendation": f"Increase LogP to range {optimal_logp_min}-{optimal_logp_max}",
            "strategy": [
                "Add lipophilic groups (e.g., alkyl chains, aromatic rings)",
                "Reduce hydrophilic functional groups",
                "Consider lipid-based formulations or conjugates",
                "Use chemical modification to increase lipophilicity"
            ],
            "expected_improvement": "20-30% increase in membrane penetration",
            "impact": impact
        })
    elif logp > optimal_logp_max:
        impact = "High"
        priority_score += 3
        recommendations.append({
            "category": "Lipophilicity (LogP)",
            "issue": f"LogP ({logp:.2f}) is too high, may cause poor solubility",
            "recommendation": f"Decrease LogP to range {optimal_logp_min}-{optimal_logp_max}",
            "strategy": [
                "Add polar functional groups (hydroxyl, carboxyl)",
                "Use hydrophilic substituents",
                "Consider solubility-enhancing formulations",
                "Explore cyclodextrin complexation"
            ],
            "expected_improvement": "15-25% increase in bioavailability",
            "impact": impact
        })
    
    # 3. TPSA Optimization
    if tpsa > 90:
        impact = "Medium"
        priority_score += 2
        recommendations.append({
            "category": "Polar Surface Area (TPSA)",
            "issue": f"TPSA ({tpsa:.1f} Ų) exceeds optimal threshold for CNS penetration",
            "recommendation": "Reduce TPSA to < 90 Ų for better blood-brain barrier crossing",
            "strategy": [
                "Reduce number of hydrogen bond donors/acceptors",
                "Mask polar groups with prodrug approach",
                "Use intramolecular hydrogen bonding to reduce effective TPSA",
                "Consider N-methylation or similar modifications"
            ],
            "expected_improvement": "10-20% increase in brain delivery",
            "impact": impact
        })
    
    # 4. Ionization Optimization
    if unionized_fraction < 0.5:
        impact = "High"
        priority_score += 3
        recommendations.append({
            "category": "Ionization State",
            "issue": f"Low unionized fraction ({unionized_fraction:.2%}) at nasal pH (5-6.5)",
            "recommendation": "Increase fraction of unionized form for better absorption",
            "strategy": [
                "Modify pKa by altering basic/acidic groups",
                "Target pKa to increase neutral species at pH 5-6",
                "Use pH-modifying excipients in formulation",
                "Consider weakly basic or neutral derivatives"
            ],
            "expected_improvement": "20-35% increase in mucosal absorption",
            "impact": impact
        })
    
    # 5. LogBB Optimization
    if logbb < -1:
        impact = "High"
        priority_score += 3
        recommendations.append({
            "category": "Blood-Brain Barrier Permeability",
            "issue": f"Poor BBB permeability (LogBB = {logbb:.2f})",
            "recommendation": "Improve blood-brain barrier crossing ability",
            "strategy": [
                "Optimize LogP and TPSA simultaneously",
                "Reduce P-glycoprotein substrate affinity",
                "Consider lipid nanoparticles or liposomes",
                "Explore nose-to-brain direct pathway (olfactory/trigeminal)"
            ],
            "expected_improvement": "25-40% increase in brain bioavailability",
            "impact": impact
        })
    
    # 6. Hydrogen Bonding
    total_hb = hbd + hba
    if total_hb > 10:
        impact = "Medium"
        priority_score += 2
        recommendations.append({
            "category": "Hydrogen Bonding",
            "issue": f"High number of H-bond donors/acceptors ({total_hb})",
            "recommendation": "Reduce hydrogen bonding capacity for better permeability",
            "strategy": [
                "Replace OH groups with less polar alternatives",
                "Use ester or ether linkages instead of alcohols",
                "Apply N-methylation to reduce NH groups",
                "Follow Lipinski's Rule of 5"
            ],
            "expected_improvement": "10-15% increase in absorption",
            "impact": impact
        })
    
    # 7. Formulation Recommendations
    formulation_recs = {
        "category": "Formulation Strategies",
        "recommendation": "Advanced nasal formulation approaches",
        "strategy": [
            "**Mucoadhesive polymers**: Chitosan, carbopol to increase residence time",
            "**Permeation enhancers**: Bile salts, surfactants, cyclodextrins",
            "**Nanocarriers**: Lipid nanoparticles, polymeric nanoparticles, nanoemulsions",
            "**In-situ gelling systems**: Thermosensitive or pH-sensitive gels",
            "**Direct olfactory targeting**: Use formulations that target olfactory epithelium"
        ],
        "expected_improvement": "30-50% increase with optimal formulation",
        "impact": "High"
    }
    recommendations.append(formulation_recs)
    
    # Sort by impact
    impact_order = {"High": 3, "Medium": 2, "Low": 1}
    recommendations.sort(key=lambda x: impact_order.get(x.get("impact", "Low"), 0), reverse=True)
    
    # Generate summary
    summary = generate_recommendation_summary(recommendations, priority_score)
    
    return {
        "success": True,
        "recommendations": recommendations,
        "summary": summary,
        "priority_score": priority_score,
        "total_recommendations": len(recommendations)
    }

def generate_recommendation_summary(recommendations: List[Dict], priority_score: int) -> str:
    """Generate executive summary of recommendations"""
    
    high_priority = sum(1 for r in recommendations if r.get("impact") == "High")
    
    if priority_score >= 8:
        urgency = "**Critical**"
        message = "Significant optimization needed to achieve effective nose-to-brain delivery."
    elif priority_score >= 5:
        urgency = "**High Priority**"
        message = "Several key properties require modification for improved delivery."
    elif priority_score >= 2:
        urgency = "**Moderate Priority**"
        message = "Some optimization will enhance delivery efficiency."
    else:
        urgency = "**Low Priority**"
        message = "Drug properties are generally favorable for nasal-brain delivery."
    
    summary = f"""
{urgency}: {message}

**Key Focus Areas**: {high_priority} high-impact modifications identified.

**Overall Strategy**: Prioritize modifications to LogP, molecular weight, and ionization state 
for maximum impact on nose-to-brain delivery efficiency. Consider advanced formulation strategies 
to complement chemical modifications.

**Expected Outcome**: Implementing these recommendations could improve delivery efficiency by 
30-60% compared to current profile.
    """.strip()
    
    return summary

def get_optimization_roadmap(current_efficiency: float, drug_properties: Dict) -> Dict:
    """Generate step-by-step optimization roadmap"""
    
    recs = generate_recommendations(drug_properties)
    
    roadmap_phases = []
    
    # Phase 1: Quick wins
    phase1 = {
        "phase": 1,
        "title": "Immediate Formulation Optimization",
        "timeline": "1-3 months",
        "actions": [
            "Test mucoadhesive formulations (chitosan, carbopol)",
            "Evaluate permeation enhancers",
            "Optimize nasal spray device and droplet size",
            "pH optimization of formulation"
        ],
        "expected_efficiency_gain": "10-20%"
    }
    roadmap_phases.append(phase1)
    
    # Phase 2: Chemical modifications
    if any(r.get("impact") == "High" for r in recs["recommendations"]):
        phase2 = {
            "phase": 2,
            "title": "Chemical Structure Optimization",
            "timeline": "6-12 months",
            "actions": [
                "Synthesize analogs with optimized LogP",
                "Modify pKa for better ionization profile",
                "Test prodrug approaches if needed",
                "Reduce TPSA through strategic modifications"
            ],
            "expected_efficiency_gain": "20-35%"
        }
        roadmap_phases.append(phase2)
    
    # Phase 3: Advanced delivery systems
    phase3 = {
        "phase": 3,
        "title": "Nanocarrier Development",
        "timeline": "12-18 months",
        "actions": [
            "Develop lipid nanoparticles or solid lipid nanoparticles",
            "Test polymeric nanoparticle formulations",
            "Evaluate in-situ gelling systems",
            "Target olfactory epithelium for direct brain delivery"
        ],
        "expected_efficiency_gain": "30-50%"
    }
    roadmap_phases.append(phase3)
    
    return {
        "current_efficiency": current_efficiency,
        "target_efficiency": min(95, current_efficiency * 1.6),
        "roadmap": roadmap_phases
    }
