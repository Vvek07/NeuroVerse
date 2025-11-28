import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    IconButton,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Assessment as AssessmentIcon,
    EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import api from '../services/api';

const ModelComparison = () => {
    const navigate = useNavigate();
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComparison();
    }, []);

    const fetchComparison = async () => {
        try {
            const response = await api.get('/api/predict/model-comparison');
            if (response.data.success) {
                setComparison(response.data.comparison);
            }
        } catch (err) {
            setError('Failed to load model comparison data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Chart colors
    const COLORS = {
        'Random Forest': '#4caf50',
        'SVR': '#ff9800',
        'ANN': '#2196f3'
    };

    // Find best model
    const bestModel = comparison?.reduce((prev, current) =>
        (prev.r2_score > current.r2_score) ? prev : current
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon fontSize="large" color="primary" />
                    Model Performance Comparison
                </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
                Comparison of Random Forest, Support Vector Regression (SVR), and Artificial Neural Network (ANN)
                models for predicting nose-to-brain drug delivery efficiency.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Winner Card */}
            {bestModel && (
                <Card
                    sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <TrophyIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="h5" gutterBottom>
                            Best Performing Model
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
                            {bestModel.model}
                        </Typography>
                        <Typography variant="body1">
                            R² Score: {bestModel.r2_score} | RMSE: {bestModel.rmse}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* R² Score Comparison Chart */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    R² Score Comparison
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Higher R² score indicates better model performance (closer to 1.0 is best)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="r2_score" name="R² Score" radius={[8, 8, 0, 0]}>
                            {comparison?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.model]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            {/* Detailed Metrics Table */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Detailed Performance Metrics
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Model</strong></TableCell>
                                <TableCell align="center"><strong>R² Score</strong></TableCell>
                                <TableCell align="center"><strong>RMSE</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {comparison?.map((model) => (
                                <TableRow key={model.model} hover>
                                    <TableCell>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                            {model.model}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={model.r2_score}
                                            color={model.model === bestModel.model ? "success" : "default"}
                                            variant={model.model === bestModel.model ? "filled" : "outlined"}
                                        />
                                    </TableCell>
                                    <TableCell align="center">{model.rmse}</TableCell>
                                    <TableCell align="center">
                                        {model.model === bestModel.model && (
                                            <Chip
                                                label="Best"
                                                color="success"
                                                size="small"
                                                icon={<TrophyIcon />}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Conclusion */}
            <Paper sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                <Typography variant="h6" gutterBottom>
                    Conclusion
                </Typography>
                <Typography variant="body1" paragraph>
                    Based on comprehensive evaluation, <strong>Random Forest Regressor</strong> demonstrates
                    the best performance for predicting nose-to-brain drug delivery efficiency with an R²
                    score of {bestModel?.r2_score}.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <strong>Key Findings:</strong>
                </Typography>
                <Box component="ul" sx={{ mt: 1 }}>
                    <li>
                        <Typography variant="body2">
                            Random Forest shows superior predictive accuracy
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            Lower RMSE indicates more reliable predictions
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            This model is used for all drug delivery predictions in the system
                        </Typography>
                    </li>
                </Box>
            </Paper>
        </Container>
    );
};

export default ModelComparison;
