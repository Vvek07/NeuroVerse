import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Button,
    Box,
    Card,
    CardContent,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    Autocomplete,
    TextField
} from '@mui/material';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { ArrowBack as ArrowBackIcon, CompareArrows } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CompareTarget = () => {
    const navigate = useNavigate();
    const [allDrugs, setAllDrugs] = useState([]);
    const [drug1, setDrug1] = useState(null);
    const [drug2, setDrug2] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [comparisonResult, setComparisonResult] = useState(null);

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
            setError('Failed to load drug list');
            console.error(err);
        }
    };

    const runComparison = async () => {
        if (!drug1 || !drug2) {
            setError('Please select two drugs to compare');
            return;
        }

        if (drug1 === drug2) {
            setError('Please select two different drugs');
            return;
        }

        try {
            setError('');
            setLoading(true);
            const response = await api.post('/api/predict/compare', {
                drug1_name: drug1,
                drug2_name: drug2
            });

            if (response.data.success) {
                setComparisonResult(response.data.result);
            }
        } catch (err) {
            let errorMessage = 'Comparison failed';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    // Handle Pydantic validation errors
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

    // Prepare radar chart data
    const radarData = comparisonResult?.radar_chart_data?.categories.map((category, index) => ({
        category,
        [comparisonResult.drug1.drug_name]: comparisonResult.radar_chart_data.drug1_values[index],
        [comparisonResult.drug2.drug_name]: comparisonResult.radar_chart_data.drug2_values[index]
    })) || [];

    // Prepare bar chart data
    const barData = comparisonResult ? [
        {
            name: comparisonResult.drug1.drug_name,
            efficiency: comparisonResult.drug1.predicted_efficiency
        },
        {
            name: comparisonResult.drug2.drug_name,
            efficiency: comparisonResult.drug2.predicted_efficiency
        }
    ] : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompareArrows fontSize="large" color="primary" />
                    Drug Comparison
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Select two drugs from the database to compare their nose-to-brain delivery efficiency and properties.
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={allDrugs}
                            value={drug1}
                            onChange={(event, newValue) => setDrug1(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Drug 1"
                                    placeholder="Type to search..."
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={allDrugs}
                            value={drug2}
                            onChange={(event, newValue) => setDrug2(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Drug 2"
                                    placeholder="Type to search..."
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={runComparison}
                            disabled={!drug1 || !drug2 || loading}
                            fullWidth
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} /> : <CompareArrows />}
                        >
                            {loading ? 'Running Comparison...' : 'Compare Drugs'}
                        </Button>
                    </Grid>
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>

            {comparisonResult && (
                <>
                    {/* Winner Banner */}
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h5" align="center" gutterBottom>
                            🏆 Winner: {comparisonResult.winner}
                        </Typography>
                        <Typography variant="h6" align="center">
                            {comparisonResult.efficiency_difference}% Higher Efficiency
                        </Typography>
                    </Paper>

                    {/* Dual Card Comparison */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', borderTop: '4px solid #1976d2' }}>
                                <CardContent>
                                    <Typography variant="h5" color="primary" gutterBottom>
                                        {comparisonResult.drug1.drug_name}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body1" color="text.secondary">Predicted Efficiency</Typography>
                                        <Typography variant="h4" color="primary">
                                            {comparisonResult.drug1.predicted_efficiency}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Confidence Score</Typography>
                                        <Typography variant="body1">
                                            {comparisonResult.drug1.confidence_score}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', borderTop: '4px solid #ed6c02' }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ color: '#ed6c02' }} gutterBottom>
                                        {comparisonResult.drug2.drug_name}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body1" color="text.secondary">Predicted Efficiency</Typography>
                                        <Typography variant="h4" sx={{ color: '#ed6c02' }}>
                                            {comparisonResult.drug2.predicted_efficiency}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Confidence Score</Typography>
                                        <Typography variant="body1">
                                            {comparisonResult.drug2.confidence_score}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Bar Chart */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Efficiency Comparison
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="efficiency" fill="#1976d2" name="Efficiency" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* Radar Chart */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Property Comparison
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="category" />
                                <PolarRadiusAxis />
                                <Radar
                                    name={comparisonResult.drug1.drug_name}
                                    dataKey={comparisonResult.drug1.drug_name}
                                    stroke="#1976d2"
                                    fill="#1976d2"
                                    fillOpacity={0.6}
                                />
                                <Radar
                                    name={comparisonResult.drug2.drug_name}
                                    dataKey={comparisonResult.drug2.drug_name}
                                    stroke="#ed6c02"
                                    fill="#ed6c02"
                                    fillOpacity={0.6}
                                />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* Detailed Analysis */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Detailed Analysis
                        </Typography>
                        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {comparisonResult.comparison_analysis}
                        </Typography>
                    </Paper>

                    {/* ML Model Performance Info */}
                    <Paper sx={{ p: 3, mt: 3, bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" gutterBottom>
                            🏆 ML Model Used: Random Forest Regressor
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            This comparison uses a Random Forest model, chosen for its superior performance in predicting nose-to-brain delivery efficiency.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary">Random Forest</Typography>
                                        <Typography variant="h5" color="success.main">R² = 0.87</Typography>
                                        <Typography variant="caption">Best Model ✓</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary">ANN (Neural Network)</Typography>
                                        <Typography variant="h5">R² = 0.82</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary">SVR</Typography>
                                        <Typography variant="h5">R² = 0.79</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>
                </>
            )}
        </Container>
    );
};

export default CompareTarget;
