import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Divider,
    Autocomplete,
    Link,
    IconButton
} from '@mui/material';
import {
    Science,
    Assessment,
    Download,
    Article,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdvancedAnalysis from '../components/AdvancedAnalysis';
import { TrafficLightScore, PropertyRadarChart, PropertyHeatmap } from '../components/Visualizations';
import ScoreComparisonChart from '../components/ScoreComparisonChart';



const DrugAnalysis = () => {
    const navigate = useNavigate();
    const [drugName, setDrugName] = useState('');
    const [properties, setProperties] = useState({
        mol_wt: '',
        logp: '',
        logbb: '',
        tpsa: '',
        hbd: '',
        hba: '',
        solubility: '',
        papp: '',
        unionized_fraction: '',
        mucin: '',
        pka: '',
        p_gp: '',
        bbb_prob: '',
        cns_mpo: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [drugOptions, setDrugOptions] = useState([]);
    const [persona, setPersona] = useState('General');
    const [pubmedData, setPubmedData] = useState(null);
    const [pubmedLoading, setPubmedLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);


    // Fetch drug database for autocomplete
    useEffect(() => {
        const fetchDrugs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/drugs/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    // Map backend data to Autocomplete format
                    const options = response.data.drugs.map(drug => ({
                        label: drug['Drug Name'],
                        properties: {
                            mol_wt: drug['Mol Wt'],
                            logp: drug['LogP'],
                            logbb: drug['LogBB'],
                            tpsa: drug['TPSA'],
                            hbd: drug['HBD'],
                            hba: drug['HBA'],
                            solubility: drug['Solubility'],
                            papp: drug['Mucosal Permeability (Papp)'],
                            unionized_fraction: drug['Fraction Unionized at pH 5'],
                            mucin: drug['Mucin Binding Index'],
                            pka: drug['pKa'],
                            p_gp: drug['P-gp Substrate Probability'],
                            bbb_prob: drug['BBB Permeation Probability'],
                            cns_mpo: drug['CNS MPO Score']
                        }
                    }));
                    setDrugOptions(options);
                }
            } catch (err) {
                console.error('Failed to fetch drug list:', err);
            }
        };
        fetchDrugs();
    }, []);

    const handleInputChange = (e) => {
        setProperties({
            ...properties,
            [e.target.name]: e.target.value
        });
    };

    const handleDrugSelect = (event, newValue) => {
        if (newValue) {
            setDrugName(newValue.label);
            // Pre-fill properties if available
            setProperties({
                mol_wt: newValue.properties?.mol_wt || '',
                logp: newValue.properties?.logp || '',
                logbb: newValue.properties?.logbb || '',
                tpsa: newValue.properties?.tpsa || '',
                hbd: newValue.properties?.hbd || '',
                hba: newValue.properties?.hba || '',
                solubility: newValue.properties?.solubility || '',
                papp: newValue.properties?.papp || '',
                unionized_fraction: newValue.properties?.unionized_fraction || '',
                mucin: newValue.properties?.mucin || '',
                pka: newValue.properties?.pka || '',
                p_gp: newValue.properties?.p_gp || '',
                bbb_prob: newValue.properties?.bbb_prob || '',
                cns_mpo: newValue.properties?.cns_mpo || ''
            });
            // Reset previous results
            setResult(null);
            setPubmedData(null);
        }
    };

    const fetchPubmedData = async (name) => {
        setPubmedLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/predict/pubmed/${name}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                setPubmedData(response.data.papers);
            }
        } catch (err) {
            console.error('Failed to fetch PubMed data:', err);
        } finally {
            setPubmedLoading(false);
        }
    };



    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        setPubmedData(null);


        try {
            // Convert properties to numbers
            const numericProperties = {};
            for (const [key, value] of Object.entries(properties)) {
                numericProperties[key] = parseFloat(value) || 0;
            }

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/predict/custom`,
                {
                    drug_name: drugName || 'Unknown Drug',
                    properties: numericProperties,
                    persona: persona
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (response.data.success) {
                setResult(response.data);
                // Fetch PubMed data if we have a valid drug name
                if (drugName && drugName !== 'Unknown Drug') {
                    fetchPubmedData(drugName);
                }

                // Fetch Comparison Data
                try {
                    const compResponse = await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/predict/compare-standard`,
                        {
                            drug_name: drugName || 'Unknown Drug',
                            properties: numericProperties
                        },
                        {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        }
                    );
                    if (compResponse.data.success) {
                        setComparisonData(compResponse.data.comparison);
                    }
                } catch (compErr) {
                    console.error('Comparison fetch failed:', compErr);
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!result?.prediction_id) return;

        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/predict/download-report/${result.prediction_id}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `DrugAnalysis_${drugName || 'Report'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            setError('Failed to download report');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Premium Gradient Header */}
            <Box
                className="animated-bg premium-page-header"
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(-45deg, #667eea, #764ba2, #1e3a8a, #06b6d4)',
                    backgroundSize: '400% 400%',
                    borderRadius: '24px',
                    color: 'white',
                    boxShadow: '0 20px 60px rgba(103, 126, 234, 0.3)',
                }}
            >
                <Box className="premium-page-header-content" sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center' }}>
                            <Science sx={{ mr: 2, fontSize: 45 }} />
                            Drug Analysis & Prediction
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400 }}>
                            AI-powered nose-to-brain delivery efficiency prediction
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Input Section */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Drug Parameters
                        </Typography>

                        <Autocomplete
                            options={drugOptions}
                            getOptionLabel={(option) => option.label}
                            onChange={handleDrugSelect}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Database (Optional)"
                                    fullWidth
                                    margin="normal"
                                    size="small"
                                />
                            )}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            label="Drug Name"
                            fullWidth
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            margin="normal"
                            size="small"
                        />

                        <Divider sx={{ my: 2 }}>Physicochemical Properties</Divider>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Molecular Weight"
                                    name="mol_wt"
                                    value={properties.mol_wt}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="LogP"
                                    name="logp"
                                    value={properties.logp}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="LogBB"
                                    name="logbb"
                                    value={properties.logbb}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="TPSA"
                                    name="tpsa"
                                    value={properties.tpsa}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="H-Bond Donors"
                                    name="hbd"
                                    value={properties.hbd}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="H-Bond Acceptors"
                                    name="hba"
                                    value={properties.hba}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Solubility (LogS)"
                                    name="solubility"
                                    value={properties.solubility}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Mucosal Perm. (Papp)"
                                    name="papp"
                                    value={properties.papp}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Unionized Fraction"
                                    name="unionized_fraction"
                                    value={properties.unionized_fraction}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Mucin Binding"
                                    name="mucin"
                                    value={properties.mucin}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="pKa"
                                    name="pka"
                                    value={properties.pka}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="P-gp Probability"
                                    name="p_gp"
                                    value={properties.p_gp}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="BBB Probability"
                                    name="bbb_prob"
                                    value={properties.bbb_prob}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="CNS MPO Score"
                                    name="cns_mpo"
                                    value={properties.cns_mpo}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                        </Grid>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleAnalyze}
                            disabled={loading}
                            sx={{ mt: 3 }}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                        >
                            {loading ? 'Analyzing...' : 'Analyze Drug'}
                        </Button>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Paper>
                </Grid >

                {/* Results Section */}
                < Grid item xs={12} md={8} >
                    {
                        result ? (
                            <Box>
                                {/* Main Prediction Card */}
                                < Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
                                    <CardContent>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item>
                                                <Typography variant="h5" gutterBottom color="primary.dark">
                                                    Prediction Result
                                                </Typography>
                                                <Typography variant="h3" color="primary.main" fontWeight="bold">
                                                    {result.result.predicted_efficiency}%
                                                </Typography>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    Nose-to-Brain Delivery Efficiency
                                                </Typography>
                                                <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                    <Typography variant="caption" display="block" fontWeight="bold">
                                                        Feasibility Scale:
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="success.main">
                                                        &gt; 75% : High Feasibility
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="warning.main">
                                                        50% - 75% : Moderate Feasibility
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="error.main">
                                                        &lt; 50% : Low Feasibility
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="h6" color="secondary.main">
                                                        {result.result.confidence_score}%
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Confidence Score
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${drugName}`, '_blank')}
                                                            startIcon={<Article />}
                                                        >
                                                            Search on PubMed
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<Download />}
                                                            onClick={handleDownloadReport}
                                                        >
                                                            Download Report
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card >

                                {/* Visualization Dashboard */}
                                < Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={12} md={4}>
                                        <TrafficLightScore
                                            score={result.advanced_analysis?.nbfs_score?.score || 0}
                                            label="NBFS Score"
                                            description="Nose-to-Brain Feasibility Score based on key physicochemical properties."
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <PropertyHeatmap properties={result.result.properties} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <PropertyRadarChart properties={result.result.properties} />
                                    </Grid>
                                </Grid >

                                {/* Score Comparison Chart */}
                                {
                                    comparisonData && (
                                        <ScoreComparisonChart data={comparisonData} />
                                    )
                                }

                                {/* Advanced Analysis Component */}
                                {
                                    result.advanced_analysis && (
                                        <AdvancedAnalysis data={result.advanced_analysis} />
                                    )
                                }

                                {/* Detailed Drug Properties Card */}
                                <Card sx={{ mb: 3, mt: 4 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a', mb: 3 }}>
                                            📊 Detailed Drug Properties Analysis
                                        </Typography>

                                        <Grid container spacing={3}>
                                            {/* Molecular Properties */}
                                            <Grid item xs={12} md={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'linear-gradient(145deg, #f0f4ff 0%, #e8eeff 100%)', border: '1px solid #e3e8ef' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#667eea', mb: 2 }}>
                                                        🧬 Molecular Properties
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Molecular Weight:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.mol_wt} Da</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">LogP (Lipophilicity):</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.logp}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">TPSA (Polar Surface Area):</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.tpsa} Ų</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">H-Bond Donors:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.hbd}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">H-Bond Acceptors:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.hba}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            {/* BBB & CNS Properties */}
                                            <Grid item xs={12} md={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'linear-gradient(145deg, #fff0f5 0%, #ffe8f0 100%)', border: '1px solid #f0e3e8' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f5576c', mb: 2 }}>
                                                        🧠 BBB & CNS Properties
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">LogBB (BBB Permeation):</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.logbb}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">BBB Permeation Probability:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.bbb_prob}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">CNS MPO Score:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.cns_mpo}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">P-gp Substrate Probability:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.p_gp}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            {/* Nasal Delivery Properties */}
                                            <Grid item xs={12} md={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'linear-gradient(145deg, #f0fff4 0%, #e8f5e9 100%)', border: '1px solid #e3f0e8' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#43e97b', mb: 2 }}>
                                                        👃 Nasal Delivery Properties
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Mucosal Permeability (Papp):</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.papp} cm/s</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Fraction Unionized (pH 5):</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.unionized_fraction}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Mucin Binding Index:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.mucin}</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">pKa:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.pka}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            {/* Pharmaceutical Properties */}
                                            <Grid item xs={12} md={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'linear-gradient(145deg, #fffaf0 0%, #fff5e8 100%)', border: '1px solid #f0ebe3' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ff9a56', mb: 2 }}>
                                                        💊 Pharmaceutical Properties
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Solubility:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{properties.solubility} mg/mL</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Predicted Efficiency:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>{result.result.predicted_efficiency}%</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Confidence Score:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#f5576c' }}>{result.result.confidence_score}%</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Drug Name:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{drugName}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>


                            </Box >
                        ) : (
                            <Paper sx={{ p: 5, textAlign: 'center', color: 'text.secondary', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Assessment sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                                <Typography variant="h6">
                                    Enter drug parameters or select a drug to begin analysis
                                </Typography>
                                <Typography variant="body2">
                                    Select a persona above to tailor the insights to your role.
                                </Typography>
                            </Paper>
                        )}
                </Grid >
            </Grid >
        </Container >
    );
};

export default DrugAnalysis;
