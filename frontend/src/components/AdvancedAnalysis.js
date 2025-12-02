import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    LinearProgress
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    Science as ScienceIcon,
    LocalPharmacy as PharmacyIcon,
    Biotech as BiotechIcon
} from '@mui/icons-material';

const StatusChip = ({ status, label }) => {
    let color = "default";
    if (status === "High" || status === "Excellent" || status === "Good" || status === "Suitable" || status === "Compliant") {
        color = "success";
    } else if (status === "Moderate" || status === "Challenging") {
        color = "warning";
    } else if (status === "Low" || status === "Poor" || status === "Not Suitable" || status === "Non-Compliant") {
        color = "error";
    }

    return (
        <Chip
            label={label || status}
            color={color}
            size="small"
            sx={{ fontWeight: 'bold' }}
        />
    );
};

const AdvancedAnalysis = ({ data }) => {
    if (!data) return null;

    const {
        bbb_permeability,
        nbfs_score,
        lipinski,
        bcs_class,
        suitability,
        prodrug_suggestions,
        polymer_recommendations
    } = data;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                <ScienceIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Advanced Pharmaceutical Analysis
            </Typography>

            <Grid container spacing={3}>
                {/* 1. Delivery Metrics */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Delivery Feasibility
                            </Typography>

                            {/* NBFS Score */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">Nasal-to-Brain Feasibility Score (NBFS)</Typography>
                                    <StatusChip status={nbfs_score.rating} label={`${nbfs_score.score}/100 (${nbfs_score.rating})`} />
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={nbfs_score.score}
                                    color={nbfs_score.score > 60 ? "success" : nbfs_score.score > 40 ? "warning" : "error"}
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* BBB & BCS */}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">BBB Permeability</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <StatusChip status={bbb_permeability.classification} />
                                    </Box>
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        {bbb_permeability.details}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">BCS Classification</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip label={bcs_class.class} color="primary" variant="outlined" size="small" />
                                    </Box>
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        {bcs_class.description}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 2. Lipinski & Suitability */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Drug Suitability
                            </Typography>

                            {/* Lipinski */}
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mr: 1 }}>Lipinski's Rule of 5:</Typography>
                                    <StatusChip status={lipinski.status} />
                                </Box>
                                {lipinski.violations.length > 0 ? (
                                    <Typography variant="caption" color="error">
                                        Violations: {lipinski.violations.join(", ")}
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" color="success.main">
                                        No violations. Good oral bioavailability predicted.
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* N2B Suitability Decision */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Nose-to-Brain Suitability:</Typography>
                                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, borderLeft: '4px solid', borderColor: suitability.status === 'Suitable' ? 'green' : 'orange' }}>
                                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                                        {suitability.status}
                                    </Typography>
                                    <Typography variant="body2">
                                        {suitability.reason}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        Rec: {suitability.recommendation}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 3. Formulation Recommendations */}
                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                <PharmacyIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                                Formulation Strategy
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>Recommended Polymers:</Typography>
                                    <List dense>
                                        {polymer_recommendations.map((poly, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <BiotechIcon color="primary" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={poly.polymer}
                                                    secondary={`${poly.type} - ${poly.reason}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>Prodrug Strategy:</Typography>
                                    <List dense>
                                        {prodrug_suggestions.map((sugg, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <WarningIcon color="warning" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={sugg} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdvancedAnalysis;
