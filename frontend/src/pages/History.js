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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon fontSize="large" color="primary" />
                        Prediction History
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCSV}
                    disabled={predictions.length === 0}
                >
                    Export CSV
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Date</TableCell>
                            <TableCell>Drug Name</TableCell>
                            <TableCell align="center">Efficiency</TableCell>
                            <TableCell align="center">Confidence</TableCell>
                            <TableCell align="center">Type</TableCell>
                            <TableCell align="center">Actions</TableCell>
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
                                    <TableCell>{formatDate(pred.created_at)}</TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {pred.drug_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${pred.predicted_efficiency}%`}
                                            color={pred.predicted_efficiency > 70 ? "success" : pred.predicted_efficiency > 40 ? "warning" : "error"}
                                            size="small"
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
