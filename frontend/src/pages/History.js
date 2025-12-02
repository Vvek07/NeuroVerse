import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Box,
    Tooltip,
    Button
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    History as HistoryIcon,
    Science as ScienceIcon,
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const History = () => {
    const navigate = useNavigate();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/api/predict/history');
            if (response.data.success) {
                setPredictions(response.data.predictions);
            }
        } catch (err) {
            setError('Failed to load history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async (predictionId, drugName) => {
        try {
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

            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DrugAnalysis_${drugName}_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download report: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleExportCSV = () => {
        if (!predictions.length) return;

        // Create CSV content
        const headers = ['Date', 'Drug Name', 'Efficiency (%)', 'Confidence (%)', 'Type'];
        const csvRows = [headers.join(',')];

        predictions.forEach(pred => {
            const row = [
                new Date(pred.created_at).toLocaleDateString(),
                `"${pred.drug_name}"`, // Quote to handle commas in names
                pred.predicted_efficiency,
                pred.confidence_score,
                pred.is_custom ? 'Custom' : 'Database'
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'NeuroVerse_History.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Premium Gradient Header */}
            <Box
                className="animated-bg premium-page-header"
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(-45deg, #4facfe, #00f2fe, #667eea, #06b6d4)',
                    backgroundSize: '400% 400%',
                    borderRadius: '24px',
                    color: 'white',
                    boxShadow: '0 20px 60px rgba(79, 172, 254, 0.3)',
                }}
            >
                <Box className="premium-page-header-content" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center' }}>
                                <HistoryIcon sx={{ mr: 2, fontSize: 45 }} />
                                Prediction History
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400 }}>
                                View and manage your past drug analysis predictions
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportCSV}
                        disabled={predictions.length === 0}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        Export CSV
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#141212ff' }}>
                            <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Drug Name</TableCell>
                            <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Efficiency</TableCell>
                            <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Confidence</TableCell>
                            <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                            <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {predictions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">
                                        No predictions yet. Start analyzing drugs!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            predictions.map((pred) => (
                                <TableRow key={pred.prediction_id} hover>
                                    <TableCell sx={{ color: '#000' }}>{formatDate(pred.created_at)}</TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ color: '#000' }}>
                                            {pred.drug_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${pred.predicted_efficiency}%`}
                                            color={pred.predicted_efficiency > 70 ? "success" : pred.predicted_efficiency > 40 ? "warning" : "error"}
                                            size="small"
                                            sx={{ color: '#000', fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {pred.confidence_score}%
                                    </TableCell>
                                    <TableCell align="center">
                                        {pred.is_custom ? (
                                            <Chip label="Custom" size="small" variant="outlined" color="secondary" />
                                        ) : (
                                            <Chip label="Database" size="small" variant="outlined" color="primary" />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Download Report">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleDownloadReport(pred.prediction_id, pred.drug_name)}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default History;
