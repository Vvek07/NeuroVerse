import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';
import { Box, Typography, Paper, Grid, Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';

// --- Traffic Light Score Component ---
export const TrafficLightScore = ({ score, label, description }) => {
    let color = '#e0e0e0'; // Grey (default)
    let status = 'Unknown';

    if (score >= 80) {
        color = '#4caf50'; // Green
        status = 'Excellent';
    } else if (score >= 50) {
        color = '#ff9800'; // Orange
        status = 'Moderate';
    } else if (score > 0) {
        color = '#f44336'; // Red
        status = 'Poor';
    }

    return (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {label}
                </Typography>
                <Tooltip title={description}>
                    <Info fontSize="small" sx={{ ml: 1, color: 'text.secondary', cursor: 'pointer' }} />
                </Tooltip>
            </Box>

            <Box
                sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: color,
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    mb: 1
                }}
            >
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {score}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
                {status}
            </Typography>
        </Paper>
    );
};

// --- Radar Chart Component ---
export const PropertyRadarChart = ({ properties }) => {
    // Normalize data for chart (0-100 scale approximation)
    // This is a simplification for visualization
    const data = [
        { subject: 'Lipophilicity', A: Math.min(100, Math.max(0, (properties.logp + 2) * 20)), fullMark: 100 }, // LogP -2 to 3 -> 0-100
        { subject: 'Mol Weight', A: Math.min(100, Math.max(0, 100 - (properties.mol_wt / 10))), fullMark: 100 }, // Lower is better
        { subject: 'Permeability', A: Math.min(100, Math.max(0, properties.papp * 10)), fullMark: 100 },
        { subject: 'Solubility', A: Math.min(100, Math.max(0, (properties.solubility + 6) * 20)), fullMark: 100 },
        { subject: 'Unionized', A: properties.unionized_fraction * 100, fullMark: 100 },
        { subject: 'LogBB', A: Math.min(100, Math.max(0, (properties.logbb + 2) * 25)), fullMark: 100 },
    ];

    return (
        <Paper elevation={2} sx={{ p: 2, height: '100%', minHeight: 300 }}>
            <Typography variant="h6" gutterBottom textAlign="center">
                Property Profile
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                        name="Drug Properties"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                    />
                    <RechartsTooltip />
                </RadarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

// --- Simple Heatmap Component (Grid) ---
export const PropertyHeatmap = ({ properties }) => {
    // Define ranges for color coding
    const getLogPColor = (val) => val >= 1 && val <= 3 ? '#4caf50' : (val > 3 ? '#ff9800' : '#f44336');
    const getMWColor = (val) => val < 400 ? '#4caf50' : (val < 500 ? '#ff9800' : '#f44336');
    const getPappColor = (val) => val > 10 ? '#4caf50' : (val > 5 ? '#ff9800' : '#f44336');

    const items = [
        { label: 'LogP', value: properties.logp, color: getLogPColor(properties.logp) },
        { label: 'Mol Wt', value: properties.mol_wt, color: getMWColor(properties.mol_wt) },
        { label: 'Papp', value: properties.papp, color: getPappColor(properties.papp) },
        { label: 'LogBB', value: properties.logbb, color: properties.logbb > 0 ? '#4caf50' : '#ff9800' },
        { label: 'TPSA', value: properties.tpsa, color: properties.tpsa < 90 ? '#4caf50' : '#ff9800' },
        { label: 'HBD', value: properties.hbd, color: properties.hbd < 5 ? '#4caf50' : '#ff9800' },
    ];

    return (
        <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Key Property Heatmap
            </Typography>
            <Grid container spacing={1}>
                {items.map((item, index) => (
                    <Grid item xs={4} sm={2} key={index}>
                        <Box
                            sx={{
                                bgcolor: item.color,
                                color: '#fff',
                                p: 1,
                                borderRadius: 1,
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                {item.label}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {item.value}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};
