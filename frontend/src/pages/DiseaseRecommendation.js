import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import {
    LocalHospital as HospitalIcon,
    Medication as MedicationIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DiseaseRecommendation = () => {
    const navigate = useNavigate();
    // Initialize with fallback data to ensure dropdown is never empty
    const [diseases, setDiseases] = useState([
        "Alzheimer's Disease",
        "Parkinson's Disease",
        "Epilepsy",
        "Schizophrenia",
        "Depression",
        "Migraine"
    ]);
    const [selectedDisease, setSelectedDisease] = useState('');
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/predict/diseases/list`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Disease list response:", response.data);
            if (response.data.success) {
                setDiseases(response.data.diseases);
            }
        } catch (err) {
            console.error("Failed to fetch diseases", err);
            setError("Failed to load disease list. Please check your connection.");
        }
    };

    // Hardcoded disease database for robust offline capability
    const DISEASE_DATABASE = {
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
    };

    const handleDiseaseChange = (event) => {
        const disease = event.target.value;
        setSelectedDisease(disease);
        setLoading(true);
        setRecommendation(null);

        // Simulate API delay for UX
        setTimeout(() => {
            const info = DISEASE_DATABASE[disease];
            if (info) {
                setRecommendation(info);
            } else {
                setError("Disease data not found.");
            }
            setLoading(false);
        }, 300);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Premium Gradient Header */}
            <Box
                className="animated-bg"
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(-45deg, #10b981, #06b6d4, #7c3aed, #667eea)',
                    backgroundSize: '400% 400%',
                    borderRadius: '24px',
                    color: 'white',
                    boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                    }
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center' }}>
                            <HospitalIcon sx={{ mr: 2, fontSize: 45 }} />
                            Disease-Based Recommendations
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400 }}>
                            AI-powered drug recommendations for CNS disorders
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Premium Disease Selector Card */}
            <Card
                className="glass-card"
                elevation={0}
                sx={{
                    mb: 4,
                    p: 3,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                    }
                }}>
                <FormControl fullWidth>
                    <InputLabel id="disease-select-label" sx={{ fontWeight: 600 }}>Select CNS Disorder</InputLabel>
                    <Select
                        labelId="disease-select-label"
                        id="disease-select"
                        value={selectedDisease}
                        label="Select CNS Disorder"
                        onChange={handleDiseaseChange}
                        sx={{
                            borderRadius: '12px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e5e7eb',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981',
                                borderWidth: '2px',
                            }
                        }}
                    >
                        {Object.keys(DISEASE_DATABASE).map((disease) => (
                            <MenuItem key={disease} value={disease}>{disease}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Card>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {recommendation && !loading && (
                <Grid container spacing={3}>
                    {/* Disease Info */}
                    <Grid item xs={12}>
                        <Card elevation={3} sx={{ borderLeft: '6px solid #1a237e', borderRadius: '16px' }}>
                            <CardContent>
                                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
                                    {selectedDisease}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" paragraph>
                                    {recommendation.description}
                                </Typography>

                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: '12px', height: '100%' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" gutterBottom>
                                                🩺 Symptoms
                                            </Typography>
                                            <Typography variant="body2">
                                                {recommendation.symptoms}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ p: 2, bgcolor: '#fff0f5', borderRadius: '12px', height: '100%' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="secondary.dark" gutterBottom>
                                                ⚙️ Mechanism
                                            </Typography>
                                            <Typography variant="body2">
                                                {recommendation.mechanism}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ p: 2, bgcolor: '#f0fff4', borderRadius: '12px', height: '100%' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="success.dark" gutterBottom>
                                                🔬 Research Status
                                            </Typography>
                                            <Typography variant="body2">
                                                {recommendation.research_status}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recommended Drugs */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: '16px' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <MedicationIcon sx={{ mr: 1 }} /> Recommended Drugs
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                    {recommendation.recommended_drugs.map((drug) => (
                                        <Chip
                                            key={drug}
                                            label={drug}
                                            color="primary"
                                            variant="outlined"
                                            onClick={() => window.location.href = `/drug-analysis?drug=${drug}`}
                                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                                        />
                                    ))}
                                </Box>
                                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                                    Click a drug to analyze its N2B efficiency.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* N2B Advantage */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', bgcolor: '#e8f5e9', borderRadius: '16px' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircleIcon sx={{ mr: 1 }} /> Nose-to-Brain Advantage
                                </Typography>
                                <Typography variant="body1">
                                    {recommendation.n2b_advantage}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Challenges */}
                    <Grid item xs={12}>
                        <Card elevation={3} sx={{ bgcolor: '#fff3e0', borderRadius: '16px' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <WarningIcon sx={{ mr: 1 }} /> Delivery Challenges
                                </Typography>
                                <Typography variant="body1">
                                    {recommendation.delivery_challenges}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default DiseaseRecommendation;
