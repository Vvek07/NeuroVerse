# Disease to Drug Mapping Database for CNS Disorders

DISEASE_DATABASE = {
    "Alzheimer's Disease": {
        "description": "Progressive neurodegenerative disorder causing memory loss and cognitive decline.",
        "symptoms": "Memory loss, confusion, difficulty planning, personality changes.",
        "mechanism": "Accumulation of amyloid-beta plaques and tau tangles leading to neuronal death.",
        "research_status": "High priority for N2B delivery of antibodies and neuroprotective agents.",
        "recommended_drugs": ["Donepezil", "Rivastigmine", "Galantamine", "Memantine"],
        "delivery_challenges": "BBB is a major barrier; elderly patients may have difficulty with complex devices.",
        "n2b_advantage": "Direct transport bypasses BBB and avoids GI side effects common with AChE inhibitors."
    },
    "Parkinson's Disease": {
        "description": "Neurodegenerative disorder affecting movement due to dopamine deficiency.",
        "symptoms": "Tremors, bradykinesia, rigid muscles, impaired posture.",
        "mechanism": "Loss of dopamine-producing neurons in the substantia nigra.",
        "research_status": "N2B delivery of dopamine agonists and gene therapy vectors is under active investigation.",
        "recommended_drugs": ["Levodopa", "Ropinirole", "Pramipexole", "Rasagiline", "Rotigotine"],
        "delivery_challenges": "Levodopa has low bioavailability and extensive peripheral metabolism.",
        "n2b_advantage": "Rapid onset for 'off' episodes; bypasses first-pass metabolism."
    },
    "Epilepsy": {
        "description": "Neurological disorder characterized by recurrent seizures.",
        "symptoms": "Uncontrollable jerking movements, loss of consciousness, staring spells.",
        "mechanism": "Abnormal excessive or synchronous neuronal activity in the brain.",
        "research_status": "Intranasal benzodiazepines are established; research focuses on chronic antiepileptics.",
        "recommended_drugs": ["Diazepam", "Midazolam", "Lorazepam", "Carbamazepine", "Lamotrigine"],
        "delivery_challenges": "Need for rapid onset during status epilepticus.",
        "n2b_advantage": "Extremely rapid onset (seconds/minutes) comparable to IV, ideal for emergency seizure control."
    },
    "Schizophrenia": {
        "description": "Chronic brain disorder affecting reality perception and emotional regulation.",
        "symptoms": "Delusions, hallucinations, disorganized speech, lack of motivation.",
        "mechanism": "Dysregulation of dopamine and glutamate neurotransmission.",
        "research_status": "Focus on N2B delivery of antipsychotics to reduce metabolic side effects.",
        "recommended_drugs": ["Risperidone", "Olanzapine", "Clozapine", "Haloperidol"],
        "delivery_challenges": "Poor patient adherence; many antipsychotics have poor oral bioavailability.",
        "n2b_advantage": "Improved bioavailability and potential for lower dosing, reducing systemic side effects."
    },
    "Depression": {
        "description": "Mood disorder causing persistent sadness and loss of interest.",
        "symptoms": "Persistent sadness, fatigue, changes in sleep/appetite, suicidal thoughts.",
        "mechanism": "Imbalance of neurotransmitters like serotonin, norepinephrine, and dopamine.",
        "research_status": "Intranasal Ketamine (Spravato) is FDA approved; research on rapid-acting antidepressants continues.",
        "recommended_drugs": ["Fluoxetine", "Sertraline", "Venlafaxine", "Selegiline", "Ketamine"],
        "delivery_challenges": "Delayed onset of action (weeks) with oral antidepressants.",
        "n2b_advantage": "Potential for faster onset of action; avoids GI degradation."
    },
    "Migraine": {
        "description": "Severe recurring headaches often with nausea and light sensitivity.",
        "symptoms": "Throbbing pain, nausea, vomiting, sensitivity to light/sound.",
        "mechanism": "Activation of the trigeminovascular system and release of inflammatory neuropeptides.",
        "research_status": "Intranasal triptans are widely used; research into CGRP inhibitors via N2B route.",
        "recommended_drugs": ["Sumatriptan", "Zolmitriptan", "Dihydroergotamine"],
        "delivery_challenges": "Nausea/vomiting during attacks makes oral administration difficult.",
        "n2b_advantage": "Ideal route when oral intake is not possible due to nausea; rapid relief."
    },
    "Multiple Sclerosis": {
        "description": "Autoimmune disease attacking the protective sheath (myelin) of nerve fibers.",
        "symptoms": "Numbness, weakness, vision problems, fatigue, dizziness.",
        "mechanism": "Immune system attacks myelin, causing communication problems between brain and body.",
        "research_status": "Investigating N2B delivery of anti-inflammatory cytokines and remyelination agents.",
        "recommended_drugs": ["Interferon beta", "Glatiramer acetate", "Fingolimod", "Natalizumab"],
        "delivery_challenges": "Large molecule biologics (interferons) cannot cross BBB efficiently.",
        "n2b_advantage": "Non-invasive delivery of biologics directly to CNS; potential to reduce systemic immunosuppression."
    },
    "Amyotrophic Lateral Sclerosis (ALS)": {
        "description": "Progressive nervous system disease affecting nerve cells in the brain and spinal cord.",
        "symptoms": "Muscle weakness, twitching, slurred speech, difficulty breathing.",
        "mechanism": "Degeneration of motor neurons leading to muscle atrophy.",
        "research_status": "Early stage research on N2B delivery of neurotrophic factors (e.g., IGF-1, GDNF).",
        "recommended_drugs": ["Riluzole", "Edaravone"],
        "delivery_challenges": "Therapeutics often have poor CNS penetration and short half-lives.",
        "n2b_advantage": "Direct delivery of neurotrophic factors to motor cortex and brainstem."
    },
    "Huntington's Disease": {
        "description": "Inherited condition in which nerve cells in the brain break down over time.",
        "symptoms": "Involuntary movements (chorea), cognitive decline, psychiatric problems.",
        "mechanism": "Mutation in HTT gene causes toxic protein accumulation.",
        "research_status": "Gene silencing therapies (ASOs, siRNA) via N2B route are a major research focus.",
        "recommended_drugs": ["Tetrabenazine", "Deutetrabenazine", "Haloperidol"],
        "delivery_challenges": "Gene therapies are large molecules that require invasive intrathecal injection currently.",
        "n2b_advantage": "Non-invasive alternative for delivering gene silencing agents to the brain."
    },
    "Glioblastoma": {
        "description": "Aggressive type of cancer that can occur in the brain or spinal cord.",
        "symptoms": "Headaches, nausea, seizures, personality changes.",
        "mechanism": "Rapidly dividing malignant cells infiltrate brain tissue.",
        "research_status": "Active clinical trials for N2B delivery of chemotherapeutics (e.g., Temozolomide) and oncolytic viruses.",
        "recommended_drugs": ["Temozolomide", "Bevacizumab", "Carmustine"],
        "delivery_challenges": "BBB prevents most chemotherapeutics from reaching the tumor in effective concentrations.",
        "n2b_advantage": "High local concentration at tumor site with reduced systemic toxicity."
    },
    "Stroke (Ischemic)": {
        "description": "Damage to the brain from interruption of its blood supply.",
        "symptoms": "Sudden numbness, confusion, trouble seeing, trouble walking.",
        "mechanism": "Blood clot blocks blood flow, leading to neuronal hypoxia and death.",
        "research_status": "Research on N2B delivery of neuroprotectants immediately after stroke onset.",
        "recommended_drugs": ["Alteplase", "Aspirin", "Clopidogrel"],
        "delivery_challenges": "Time-critical window for treatment; systemic thrombolytics have bleeding risks.",
        "n2b_advantage": "Rapid delivery of neuroprotectants to the ischemic penumbra without systemic bleeding risk."
    },
    "Anxiety Disorders": {
        "description": "Group of mental disorders characterized by significant feelings of anxiety and fear.",
        "symptoms": "Excessive worry, restlessness, fatigue, concentration problems.",
        "mechanism": "Dysregulation of GABA, serotonin, and norepinephrine systems.",
        "research_status": "Intranasal oxytocin and benzodiazepines are well-studied.",
        "recommended_drugs": ["Alprazolam", "Clonazepam", "Buspirone", "Escitalopram"],
        "delivery_challenges": "Need for rapid relief during panic attacks.",
        "n2b_advantage": "Rapid onset for acute anxiety/panic attacks."
    },
    "Insomnia": {
        "description": "Sleep disorder characterized by difficulty falling and/or staying asleep.",
        "symptoms": "Difficulty falling asleep, waking up too early, daytime tiredness.",
        "mechanism": "Hyperarousal of the CNS; disruption of circadian rhythms.",
        "research_status": "N2B delivery of orexin antagonists and melatonin is being explored.",
        "recommended_drugs": ["Zolpidem", "Eszopiclone", "Melatonin", "Ramelteon"],
        "delivery_challenges": "Oral hypnotics can have residual 'hangover' effects.",
        "n2b_advantage": "Faster onset of sleep; potentially shorter duration avoiding morning grogginess."
    },
    "Neuropathic Pain": {
        "description": "Pain caused by damage or disease affecting the somatosensory nervous system.",
        "symptoms": "Shooting/burning pain, tingling, numbness.",
        "mechanism": "Central sensitization and hyperexcitability of pain pathways.",
        "research_status": "N2B delivery of analgesics (ketamine, opioids) to target central pain processing.",
        "recommended_drugs": ["Gabapentin", "Pregabalin", "Duloxetine", "Amitriptyline"],
        "delivery_challenges": "Systemic opioids have high addiction potential and side effects.",
        "n2b_advantage": "Targeted delivery to CNS pain centers allowing lower doses and fewer systemic side effects."
    }
}

def get_disease_recommendations(disease_name):
    """
    Get recommendations based on disease name.
    """
    # Simple fuzzy match or direct lookup
    for key in DISEASE_DATABASE:
        if disease_name.lower() in key.lower():
            return DISEASE_DATABASE[key]
    return None

def get_all_diseases():
    """Return list of all supported diseases."""
    return list(DISEASE_DATABASE.keys())
