import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Autocomplete,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Divider,
    Chip,
    IconButton,
    Tooltip as MuiTooltip
} from '@mui/material';
import {
    Science as ScienceIcon,
    TrendingUp,
    Assessment,
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const DrugAnalysis = () => {
    const navigate = useNavigate();
    const [allDrugs, setAllDrugs] = useState([]);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    // Custom Analysis State (Unified Form)
    const [customParams, setCustomParams] = useState({
        "Mol Wt": 350,
        "LogP": 2.5,
        "pKa": 7.4,
        "TPSA": 60,
        "HBD": 2,
        "HBA": 4,
        "Solubility": -3.0,
        "P-gp Substrate Probability": 0.1,
        "LogBB": 0.2,
        "Fraction Unionized at pH 5": 0.8,
        "Mucin Binding Index": 0.3,
        "Mucosal Permeability (Papp)": 0.5
    });
    const [customName, setCustomName] = useState("New Compound");

    useEffect(() => {
        fetchAllDrugs();
    }, []);

    const fetchAllDrugs = async () => {
        try {
            const response = await api.get('/api/drugs/drugs');
            if (response.data.success) {
                setAllDrugs(response.data.drugs);
            }
        } catch (err) {
            console.error('Error fetching drugs:', err);
        }
    };

    const handleDrugSelect = async (event, newValue) => {
        setSelectedDrug(newValue);
        if (newValue) {
            try {
                // Fetch drug details to autofill form
                const response = await api.get(`/api/drugs/drugs/${newValue}`);
                if (response.data.success) {
                    const drugData = response.data.drug;
                    setCustomName(drugData["Drug Name"]);

                    // Filter out non-numeric properties for the form
                    const newParams = { ...customParams };
                    Object.keys(newParams).forEach(key => {
                        if (drugData[key] !== undefined) {
                            newParams[key] = drugData[key];
                        }
                    });
                    setCustomParams(newParams);
                    setAnalysisResult(null); // Reset result on new selection
                }
            } catch (err) {
                console.error("Error fetching drug details", err);
                setError("Failed to load drug details");
            }
        }
    };

    const handleParamChange = (key, value) => {
        setCustomParams(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAnalyze = async () => {
        try {
            setError('');
            setLoading(true);

            // Convert parameters to numbers for the API
            const numericParams = {};
            Object.entries(customParams).forEach(([key, value]) => {
                const numVal = parseFloat(value);
                numericParams[key] = isNaN(numVal) ? 0 : numVal;
            });

            // Always use custom endpoint to support edited parameters
            const response = await api.post('/api/predict/custom', {
                drug_name: customName,
                properties: numericParams
            });

            if (response.data.success) {
                setAnalysisResult(response.data);
            }
        } catch (err) {
            let errorMessage = 'Analysis failed';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    errorMessage = detail.map(e => e.msg).join(', ');
                } else if (typeof detail === 'object') {
                    errorMessage = JSON.stringify(detail);
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const predictionId = analysisResult?.prediction_id;
            if (!predictionId) {
                setError('No prediction ID available');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/predict/download-report/${predictionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download report');
            }

            // Get filename from header or create default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'DrugAnalysis_Report.pdf';
            if (contentDisposition) {
                const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
                if (matches && matches[1]) {
                    filename = matches[1];
                }
            }

            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download report: ' + err.message);
        }
    };

    // Prepare chart data
    const featureImportanceData = analysisResult?.feature_importance
        ? Object.entries(analysisResult.feature_importance)
            .map(([name, value]) => ({ name, importance: value }))
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 8)
        : [];

    const prediction = analysisResult?.prediction || analysisResult?.result;
    const recommendations = analysisResult?.recommendations;

    // Parameter Definitions for Tooltips and Guide
    const parameterDefinitions = {
        "Mol Wt": "Molecular Weight: The mass of a molecule. Smaller molecules (<400-500 Da) generally penetrate the nasal mucosa better.",
        "LogP": "Partition Coefficient: Measures lipophilicity. Optimal range for nasal absorption is usually 1-3. High LogP means more lipid-soluble.",
        "pKa": "Acid Dissociation Constant: Determines the ionization state at a given pH. Un-ionized drugs cross membranes more easily.",
        "TPSA": "Topological Polar Surface Area: Related to hydrogen bonding. Lower TPSA (<140 Å²) favors better membrane permeability.",
        "HBD": "Hydrogen Bond Donors: Number of hydrogen atoms attached to electronegative atoms. Fewer HBDs (<5) favor permeability.",
        "HBA": "Hydrogen Bond Acceptors: Number of electronegative atoms (N, O). Fewer HBAs (<10) favor permeability.",
        "Solubility": "LogS (Solubility): Essential for the drug to dissolve in the nasal mucus layer before absorption.",
        "P-gp Substrate Probability": "P-glycoprotein Substrate: High probability means the drug might be pumped back out of the brain/cells, reducing efficiency.",
        "LogBB": "Blood-Brain Barrier Permeability: Indicates ability to cross the BBB. Positive values suggest better brain penetration.",
        "Fraction Unionized at pH 5": "Fraction of drug un-ionized at nasal pH (approx 5.0). Only the un-ionized form typically crosses membranes.",
        "Mucin Binding Index": "Tendency to bind to mucus. High binding can trap the drug in mucus, preventing it from reaching the epithelium.",
        "Mucosal Permeability (Papp)": "Apparent Permeability Coefficient: A direct measure of the rate at which the drug crosses the nasal membrane."
    };

    const ParameterGuide = () => (
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon color="info" />
                Parameter Guide for Students
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Understanding these physicochemical properties is crucial for predicting nose-to-brain drug delivery efficiency.
            </Typography>
            <Grid container spacing={2}>
                {Object.entries(parameterDefinitions).map(([key, desc]) => (
                    <Grid item xs={12} md={6} key={key}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    {key}
                                </Typography>
                                <Typography variant="body2">
                                    {desc}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon fontSize="large" color="primary" />
                    Drug Analysis
                </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
                Search for a drug to autofill parameters, or manually enter values to analyze a new compound.
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Autocomplete
                            options={allDrugs}
                            value={selectedDrug}
                            onChange={handleDrugSelect}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Database to Autofill"
                                    placeholder="Type drug name (e.g., Donepezil...)"
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }}>OR ENTER MANUALLY</Divider>
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            label="Drug Name"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            fullWidth
                            variant="outlined"
                        />
                        {customName && customName !== "New Compound" && (
                            <Button
                                variant="outlined"
                                color="info"
                                href={`https://pubchem.ncbi.nlm.nih.gov/#query=${customName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                View on PubChem
                            </Button>
                        )}
                    </Grid>
                    {Object.entries(customParams).map(([key, value]) => (
                        <Grid item xs={6} md={3} key={key}>
                            <MuiTooltip title={parameterDefinitions[key] || "Enter value"} arrow placement="top">
                                <TextField
                                    label={key}
                                    type="number"
                                    value={value}
                                    onChange={(e) => handleParamChange(key, e.target.value)}
                                    fullWidth
                                    size="small"
                                    inputProps={{ step: 0.1 }}
                                />
                            </MuiTooltip>
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleAnalyze}
                            disabled={loading}
                            fullWidth
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                        >
                            {loading ? 'Analyzing...' : 'Analyze Drug'}
                        </Button>
                    </Grid>
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>

            {analysisResult && prediction && (
                <>
                    {/* Main Result Banner */}
                    <Paper
                        sx={{
                            p: 4,
                            mb: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h3" align="center" gutterBottom>
                            {prediction.predicted_efficiency}%
                        </Typography>
                        <Typography variant="h6" align="center">
                            Predicted Nose-to-Brain Delivery Efficiency
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.9 }}>
                            Confidence Score: {prediction.confidence_score}%
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadReport}
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                Download Report
                            </Button>
                        </Box>
                    </Paper>

                    {/* Drug Properties Display */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Analyzed Properties
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {Object.entries(prediction.properties || customParams).map(([key, value]) => (
                                <Grid item xs={6} sm={4} md={3} key={key}>
                                    <MuiTooltip title={parameterDefinitions[key] || ""} arrow>
                                        <Card variant="outlined" sx={{ cursor: 'help' }}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Typography variant="caption" color="text.secondary" display="block" noWrap title={key}>
                                                    {key}
                                                </Typography>
                                                <Typography variant="h6">
                                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </MuiTooltip>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    {/* Feature Importance */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Feature Importance Analysis
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={featureImportanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="importance" fill="#1976d2" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* AI Insights */}
                    {analysisResult.insights && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUp color="primary" />
                                AI Insights
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {analysisResult.insights.map((insight, index) => (
                                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                                    {insight}
                                </Alert>
                            ))}
                        </Paper>
                    )}

                    {/* Recommendations */}
                    {recommendations && recommendations.recommendations && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                💡 AI Recommendations for Improvement
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {recommendations.summary}
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {recommendations.recommendations.map((rec, index) => (
                                <Card key={index} sx={{ mb: 2 }} variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                            <Typography variant="h6" color="primary">
                                                {rec.category}
                                            </Typography>
                                            <Chip
                                                label={rec.impact}
                                                color={rec.impact === 'High' ? 'error' : rec.impact === 'Medium' ? 'warning' : 'info'}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" paragraph>
                                            <strong>Recommendation:</strong> {rec.recommendation}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Paper>
                    )}
                </>
            )}

            {/* Parameter Guide Section */}
            <ParameterGuide />
        </Container>
    );
};

export default DrugAnalysis;
