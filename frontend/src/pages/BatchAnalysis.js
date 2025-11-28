import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    LinearProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    ArrowBack as ArrowBackIcon,
    TableChart as TableChartIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../services/api';

const BatchAnalysis = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [results, setResults] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile);
                setError('');
                setResults(null);
                setSuccess('');
            } else {
                setFile(null);
                setError('Please select a valid Excel file (.xlsx or .xls)');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const uploadRes = await api.post('/api/upload/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data.success) {
                const fileId = uploadRes.data.file_id;

                // 2. Run Prediction on Uploaded File
                const predictRes = await api.post('/api/predict/', {
                    file_id: fileId
                });

                if (predictRes.data.success) {
                    setResults(predictRes.data.results);
                    setSuccess('Batch analysis completed successfully!');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to process file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableChartIcon fontSize="large" color="primary" />
                    Batch Analysis
                </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
                Upload an Excel file containing multiple drugs to analyze them all at once.
                The file must contain columns for: Mol Wt, LogP, pKa, TPSA, etc.
            </Typography>

            <Paper sx={{ p: 4, mb: 4, textAlign: 'center', border: '2px dashed #ccc' }}>
                <input
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        size="large"
                        sx={{ mb: 2 }}
                    >
                        Select Excel File
                    </Button>
                </label>
                {file && (
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        Selected: <strong>{file.name}</strong>
                    </Typography>
                )}

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        size="large"
                    >
                        {uploading ? 'Processing...' : 'Run Batch Analysis'}
                    </Button>
                </Box>

                {uploading && (
                    <Box sx={{ width: '100%', mt: 3 }}>
                        <LinearProgress />
                        <Typography variant="caption" color="text.secondary">
                            Analyzing drugs... This may take a moment.
                        </Typography>
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
            </Paper>

            {results && results.predictions && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" />
                        Analysis Results ({results.predictions.length} Drugs)
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell><strong>Drug Name</strong></TableCell>
                                    <TableCell align="center"><strong>Efficiency (%)</strong></TableCell>
                                    <TableCell align="center"><strong>Confidence (%)</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.predictions.map((row, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{row.drug_name || `Drug ${index + 1}`}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={`${row.predicted_efficiency}%`}
                                                color={row.predicted_efficiency > 70 ? "success" : row.predicted_efficiency > 40 ? "warning" : "error"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">{row.confidence_score}%</TableCell>
                                        <TableCell align="center">
                                            <Chip label="Analyzed" size="small" variant="outlined" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
};

export default BatchAnalysis;
