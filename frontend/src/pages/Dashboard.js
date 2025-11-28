import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CardActionArea,
    CircularProgress
} from '@mui/material';
import {
    Analytics,
    Compare,
    History,
    AdminPanelSettings,
    Assessment
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { userDetails } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        drugsAvailable: 0,
        analysesPerformed: 0
    });
    const [loading, setLoading] = useState(true);
    const [predictionHistory, setPredictionHistory] = useState([]);
    const [topDrugs, setTopDrugs] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [drugsRes, analyticsRes, historyRes] = await Promise.all([
                    api.get('/api/drugs/drugs'),
                    api.get('/api/predict/analytics/summary'),
                    api.get('/api/predict/history?limit=50')
                ]);

                setStats({
                    drugsAvailable: drugsRes.data.total || 0,
                    analysesPerformed: analyticsRes.data.summary.total_predictions || 0
                });

                // Process prediction history for time series
                if (historyRes.data.success) {
                    const predictions = historyRes.data.predictions;

                    // Group by date
                    const groupedByDate = {};
                    predictions.forEach(pred => {
                        const date = new Date(pred.created_at).toLocaleDateString();
                        if (!groupedByDate[date]) {
                            groupedByDate[date] = [];
                        }
                        groupedByDate[date].push(pred.predicted_efficiency);
                    });

                    // Create chart data
                    const chartData = Object.keys(groupedByDate).map(date => ({
                        date,
                        avgEfficiency: (groupedByDate[date].reduce((a, b) => a + b, 0) / groupedByDate[date].length).toFixed(1),
                        count: groupedByDate[date].length
                    })).slice(-10); // Last 10 days

                    setPredictionHistory(chartData);

                    // Get top drugs
                    const drugCounts = {};
                    predictions.forEach(pred => {
                        drugCounts[pred.drug_name] = (drugCounts[pred.drug_name] || 0) + 1;
                    });

                    const topDrugsData = Object.entries(drugCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]) => ({ name, count }));

                    setTopDrugs(topDrugsData);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const quickAccessCards = [
        {
            title: 'Analyze Drug',
            icon: <Analytics sx={{ fontSize: 48 }} />,
            path: '/analyze',
            color: '#1976d2'
        },
        {
            title: 'Compare Drugs',
            icon: <Compare sx={{ fontSize: 48 }} />,
            path: '/compare',
            color: '#ed6c02'
        },
        {
            title: 'History & Reports',
            icon: <History sx={{ fontSize: 48 }} />,
            path: '/history',
            color: '#9c27b0'
        }
    ];

    if (userDetails?.role === 'admin') {
        quickAccessCards.push({
            title: 'Admin Panel',
            icon: <AdminPanelSettings sx={{ fontSize: 48 }} />,
            path: '/admin',
            color: '#d32f2f'
        });
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Welcome back, {userDetails?.name || 'User'}!
                </Typography>
                <Typography variant="body1">
                    AI-Powered Nose-to-Brain Drug Delivery Prediction System
                </Typography>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h3" color="primary">
                            {loading ? <CircularProgress size={40} /> : stats.drugsAvailable}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Drugs Available
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h3" color="success.main">
                            {loading ? <CircularProgress size={40} /> : stats.analysesPerformed}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Analyses Performed
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Analytics Visualizations */}
            {!loading && predictionHistory.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                📈 Prediction Trends (Last 10 Days)
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={predictionHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="avgEfficiency"
                                        name="Avg Efficiency (%)"
                                        stroke="#667eea"
                                        strokeWidth={2}
                                        dot={{ fill: '#667eea', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                🏆 Top 5 Most Analyzed Drugs
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={topDrugs} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="count"
                                        name="Analyses Count"
                                        fill="#f5576c"
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Quick Access
            </Typography>
            <Grid container spacing={3}>
                {quickAccessCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            className="dashboard-card"
                            sx={{
                                height: '100%',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            <CardActionArea
                                onClick={() => navigate(card.path)}
                                sx={{ height: '100%' }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Box sx={{ color: card.color, mb: 2 }}>
                                        {card.icon}
                                    </Box>
                                    <Typography variant="h6">
                                        {card.title}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard;
