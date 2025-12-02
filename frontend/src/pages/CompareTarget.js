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
            const response = await api.get('/api/drugs/list');
            if (response.data.success) {
                // Map to drug names for autocomplete
                const drugNames = response.data.drugs.map(drug => drug['Drug Name']);
                setAllDrugs(drugNames);
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

    // Advanced Pharmaceutical Analysis Logic
    const calculateLipinski = (drug) => {
        if (!drug) return null;
        const violations = [];
        const props = drug.properties;
        if (props['mol_wt'] > 500) violations.push('MW > 500');
        if (props['logp'] > 5) violations.push('LogP > 5');
        if (props['hbd'] > 5) violations.push('HBD > 5');
        if (props['hba'] > 10) violations.push('HBA > 10');
        return {
            compliant: violations.length <= 1,
            violations,
            score: 4 - violations.length
        };
    };

    const calculateDrugLikeness = (drug) => {
        if (!drug) return 0;
        let score = 100;
        const props = drug.properties;
        // Penalize for Lipinski violations
        const lipinski = calculateLipinski(drug);
        score -= lipinski.violations.length * 20;
        // Penalize for low solubility
        if (props['solubility'] && props['solubility'] < -4) score -= 10;
        // Bonus for good BBB permeation
        if (props['logbb'] && props['logbb'] > -1) score += 10;
        return Math.max(0, Math.min(100, score));
    };

    const getPropertyDelta = (prop, val1, val2) => {
        const diff = val1 - val2;
        const percent = val2 !== 0 ? ((diff / Math.abs(val2)) * 100).toFixed(1) : '0';
        return { diff: diff.toFixed(2), percent, higher: diff > 0 };
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            {/* Premium Gradient Header */}
            <Box
                className="animated-bg premium-page-header"
                sx={{
                    p: 5,
                    mb: 5,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #f50057 100%)',
                    borderRadius: '32px',
                    color: 'white',
                    boxShadow: '0 20px 80px rgba(124, 58, 237, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 3, color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                            Advanced Drug Comparison
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: '800px' }}>
                            Comprehensive pharmaceutical profiling, Lipinski compliance analysis, and nose-to-brain delivery efficiency benchmarking.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Paper className="premium-input-card" sx={{ p: 4, mb: 6, borderRadius: '24px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <Autocomplete
                            options={allDrugs}
                            value={drug1}
                            onChange={(e, v) => setDrug1(v)}
                            renderInput={(params) => <TextField {...params} label="Reference Drug (A)" variant="filled" />}
                        />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#f0f4ff', display: 'inline-flex' }}>
                            <CompareArrows sx={{ fontSize: 40, color: '#1e3a8a' }} />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Autocomplete
                            options={allDrugs}
                            value={drug2}
                            onChange={(e, v) => setDrug2(v)}
                            renderInput={(params) => <TextField {...params} label="Comparator Drug (B)" variant="filled" />}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={runComparison}
                            disabled={!drug1 || !drug2 || loading}
                            fullWidth
                            size="large"
                            sx={{
                                py: 2,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(90deg, #1e3a8a, #7c3aed)',
                                boxShadow: '0 10px 30px rgba(30, 58, 138, 0.3)'
                            }}
                        >
                            {loading ? <CircularProgress size={26} color="inherit" /> : 'Run Advanced Analysis'}
                        </Button>
                    </Grid>
                </Grid>
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            </Paper>

            {comparisonResult && (
                <Box className="fade-in">
                    {/* 1. Executive Summary & Winner */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', borderRadius: '24px', background: 'linear-gradient(145deg, #00c853, #64dd17)', color: 'white', boxShadow: '0 15px 40px rgba(0, 200, 83, 0.3)' }}>
                                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                    <Typography variant="overline" sx={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 600 }}>Superior Candidate</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 800, my: 2 }}>{comparisonResult.winner}</Typography>
                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', py: 1, px: 3, borderRadius: '50px', display: 'inline-block' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>+{comparisonResult.efficiency_difference}% Efficiency</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: '100%', borderRadius: '24px', p: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="text.secondary">AI Analysis Summary</Typography>
                                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#334155' }}>
                                        {comparisonResult.comparison_analysis}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* 2. Detailed Property Comparison Table */}
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>🔬 Physicochemical Profile Delta</Typography>
                    <Paper sx={{ mb: 6, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr', bgcolor: '#f8fafc', p: 3, borderBottom: '1px solid #e2e8f0' }}>
                            <Typography variant="subtitle2" color="text.secondary">PROPERTY</Typography>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>{comparisonResult.drug1.drug_name}</Typography>
                            <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700 }}>{comparisonResult.drug2.drug_name}</Typography>
                            <Typography variant="subtitle2" color="text.secondary">DIFFERENCE</Typography>
                            <Typography variant="subtitle2" color="text.secondary" textAlign="center">BETTER</Typography>
                        </Box>
                        {[
                            { key: 'mol_wt', label: 'Molecular Weight (g/mol)', lowerIsBetter: true },
                            { key: 'logp', label: 'LogP (Lipophilicity)', optimal: 2 },
                            { key: 'tpsa', label: 'TPSA (Å²)', lowerIsBetter: true },
                            { key: 'hbd', label: 'H-Bond Donors', lowerIsBetter: true },
                            { key: 'hba', label: 'H-Bond Acceptors', lowerIsBetter: true },
                            { key: 'logbb', label: 'LogBB (Brain Permeation)', lowerIsBetter: false },
                            { key: 'papp', label: 'Mucosal Permeability', lowerIsBetter: false }
                        ].map((item, i) => {
                            const val1 = comparisonResult.drug1.properties[item.key];
                            const val2 = comparisonResult.drug2.properties[item.key];
                            const delta = getPropertyDelta(item.key, val1, val2);

                            // Determine which is better based on property type
                            let drug1Better = false;
                            if (item.optimal !== undefined) {
                                // Optimal value - closer is better
                                drug1Better = Math.abs(val1 - item.optimal) < Math.abs(val2 - item.optimal);
                            } else if (item.lowerIsBetter) {
                                drug1Better = val1 < val2;
                            } else {
                                drug1Better = val1 > val2;
                            }

                            return (
                                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr', p: 3, borderBottom: '1px solid #f1f5f9', '&:hover': { bgcolor: '#f8fafc' } }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e3a8a' }}>{Number(val1).toFixed(2)}</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#7c3aed' }}>{Number(val2).toFixed(2)}</Typography>
                                    <Typography variant="body1" sx={{ color: delta.higher ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                        {delta.diff > 0 ? '+' : ''}{delta.diff} ({delta.diff > 0 ? '+' : ''}{delta.percent}%)
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            bgcolor: drug1Better ? '#1e3a8a' : '#7c3aed',
                                            boxShadow: `0 0 8px ${drug1Better ? '#1e3a8a' : '#7c3aed'}`
                                        }} />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Paper>

                    {/* Traffic Light Efficiency Analysis */}
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>🚦 Efficiency Traffic Light Analysis</Typography>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {[comparisonResult.drug1, comparisonResult.drug2].map((drug, idx) => {
                            const eff = drug.predicted_efficiency;
                            const color = idx === 0 ? '#1e3a8a' : '#7c3aed';

                            // Traffic light logic
                            let trafficColor, trafficLabel, trafficExplanation;
                            if (eff >= 70) {
                                trafficColor = '#10b981';
                                trafficLabel = 'EXCELLENT';
                                trafficExplanation = 'High efficiency for nose-to-brain delivery. This drug shows outstanding potential for direct CNS targeting via the nasal route.';
                            } else if (eff >= 50) {
                                trafficColor = '#f59e0b';
                                trafficLabel = 'MODERATE';
                                trafficExplanation = 'Acceptable efficiency but may require formulation optimization. Consider using permeation enhancers or nanocarrier systems.';
                            } else {
                                trafficColor = '#ef4444';
                                trafficLabel = 'LOW';
                                trafficExplanation = 'Limited nose-to-brain delivery potential. Significant formulation challenges expected. May need structural modification.';
                            }

                            return (
                                <Grid item xs={12} md={6} key={idx}>
                                    <Card sx={{ borderRadius: '24px', borderLeft: `8px solid ${color}`, height: '100%' }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Typography variant="h5" sx={{ color, fontWeight: 700, mb: 3 }}>{drug.drug_name}</Typography>

                                            {/* Traffic Light Indicator */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                                <Box sx={{
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: '50%',
                                                    bgcolor: trafficColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: `0 0 30px ${trafficColor}`,
                                                    animation: 'pulse 2s ease-in-out infinite',
                                                    '@keyframes pulse': {
                                                        '0%, 100%': { opacity: 1 },
                                                        '50%': { opacity: 0.7 }
                                                    }
                                                }}>
                                                    <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '1.75rem' }}>{eff}%</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: trafficColor, mb: 0.5 }}>{trafficLabel}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Efficiency Rating</Typography>
                                                </Box>
                                            </Box>

                                            {/* Explanation */}
                                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${trafficColor}` }}>
                                                <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#475569' }}>
                                                    {trafficExplanation}
                                                </Typography>
                                            </Box>

                                            {/* Confidence */}
                                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Model Confidence</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ flex: 1, height: 8, bgcolor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                                                        <Box sx={{ width: `${drug.confidence_score}%`, height: '100%', bgcolor: color, transition: 'width 0.5s' }} />
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: '60px' }}>{drug.confidence_score}%</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* 3. Advanced Metrics: Lipinski & Drug-Likeness */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        {[comparisonResult.drug1, comparisonResult.drug2].map((drug, idx) => {
                            const lipinski = calculateLipinski(drug);
                            const likeness = calculateDrugLikeness(drug);
                            const color = idx === 0 ? '#1e3a8a' : '#7c3aed';

                            return (
                                <Grid item xs={12} md={6} key={idx}>
                                    <Card sx={{ height: '100%', borderRadius: '24px', borderTop: `6px solid ${color}` }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Typography variant="h5" sx={{ color, fontWeight: 700, mb: 3 }}>{drug.drug_name}</Typography>

                                            {/* Drug Likeness Score */}
                                            <Box sx={{ mb: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="subtitle2" color="text.secondary">Drug-Likeness Score</Typography>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{likeness}/100</Typography>
                                                </Box>
                                                <Box sx={{ height: 10, bgcolor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                                                    <Box sx={{ width: `${likeness}%`, height: '100%', bgcolor: likeness > 70 ? '#10b981' : '#f59e0b' }} />
                                                </Box>
                                            </Box>

                                            {/* Lipinski Rules */}
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>LIPINSKI'S RULE OF 5</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                <Box sx={{ px: 2, py: 1, borderRadius: '12px', bgcolor: lipinski.compliant ? '#ecfdf5' : '#fef2f2', color: lipinski.compliant ? '#059669' : '#dc2626', border: `1px solid ${lipinski.compliant ? '#a7f3d0' : '#fecaca'}` }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {lipinski.compliant ? '✅ Compliant' : '⚠️ Non-Compliant'}
                                                    </Typography>
                                                </Box>
                                                {lipinski.violations.map(v => (
                                                    <Box key={v} sx={{ px: 2, py: 1, borderRadius: '12px', bgcolor: '#fff1f2', color: '#e11d48', border: '1px solid #fda4af' }}>
                                                        <Typography variant="caption" fontWeight="bold">❌ {v}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* 4. Visualizations */}
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
                                <Typography variant="h6" gutterBottom fontWeight="bold">Efficiency Benchmark</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="efficiency" fill="#1e3a8a" radius={[10, 10, 0, 0]} barSize={60} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
                                <Typography variant="h6" gutterBottom fontWeight="bold">Multi-Parameter Radar</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="category" />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} />
                                        <Radar name={comparisonResult.drug1.drug_name} dataKey={comparisonResult.drug1.drug_name} stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.4} />
                                        <Radar name={comparisonResult.drug2.drug_name} dataKey={comparisonResult.drug2.drug_name} stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Container>
    );
};

export default CompareTarget;
