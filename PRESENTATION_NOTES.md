# Neuroverse: Nose-to-Brain Drug Delivery Prediction System
## Project Overview for Stakeholders (Pharmacy Institute)

### 🎯 Core Purpose
This system uses **Artificial Intelligence (Machine Learning)** to predict how effectively a drug can be delivered from the **nose directly to the brain** (Nose-to-Brain Delivery). 

Traditionally, determining this requires expensive and time-consuming lab experiments (in vivo/in vitro). This tool provides a **rapid, computational screening** method to identify promising drug candidates *before* physical testing.

---

### 🧪 How It Works (The Workflow)

#### 1. Input: What the Staff Enters
The system accepts standard physicochemical properties of a drug. Staff can either:
*   **Search the Database:** Select an existing drug (e.g., "Donepezil") to auto-fill known values.
*   **Manual Entry:** Input values for a new/experimental compound.

**Key Input Parameters:**
*   **Molecular Weight (Mol Wt):** Size of the molecule (smaller is usually better).
*   **LogP:** Lipophilicity (how well it dissolves in fats/lipids).
*   **pKa:** Acidity/Basicity constant.
*   **TPSA:** Topological Polar Surface Area (related to membrane crossing).
*   **HBD / HBA:** Hydrogen Bond Donors/Acceptors.
*   **Mucosal Permeability (Papp):** How well it passes through the nasal lining.
*   **Solubility:** How well it dissolves in water.

#### 2. The AI Brain (Processing)
*   The system uses a **Random Forest Regressor** model (trained on experimental data).
*   It analyzes complex non-linear relationships between these properties.
*   *Example:* It knows that high solubility alone isn't enough; the drug also needs the right LogP to cross the blood-brain barrier.

#### 3. Output: What the Staff Gets
Once they click **"Analyze Drug"**, they get immediate results:

*   **📊 Predicted Efficiency (%):** The percentage of the drug dose expected to reach the brain.
    *   *Example:* "85.4% Efficiency" (High potential).
*   **✅ Confidence Score:** How certain the AI is about this prediction (e.g., "92% Confidence").
*   **🔍 Feature Importance:** A chart showing *why* the result is high or low.
    *   *Example:* "Mucosal Permeability had the highest impact on this result."
*   **💡 AI Recommendations:** Actionable advice to improve the drug.
    *   *Example:* "Decrease Molecular Weight to improve permeability."
*   **📄 PDF Report:** A professional, downloadable report containing all these details for documentation or research papers.

---

### 🌟 Key Features for Researchers

1.  **Drug Analysis:** Rapidly screen individual compounds.
2.  **Compare Drugs:** Side-by-side comparison of two drugs to see which is better.
3.  **Historical Data:** All predictions are saved. Staff can revisit past analyses and download reports later.
4.  **Admin Dashboard:** Professors can oversee usage, see which drugs are being analyzed most, and manage user access.

### 🎓 Value Proposition for the Institute
*   **Save Time & Money:** Filter out poor candidates before spending resources on lab tests.
*   **Research Acceleration:** Analyze hundreds of hypothetical compounds in minutes.
*   **Educational Tool:** Helps students understand how different chemical properties affect drug delivery.
