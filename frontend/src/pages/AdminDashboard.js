import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Select,
    MenuItem,
    FormControl
} from '@mui/material';
import {
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    TrendingUp as TrendingUpIcon,
    ArrowBack as ArrowBackIcon,
    AdminPanelSettings as AdminIcon,
    Storage as StorageIcon,
    CompareArrows as CompareIcon
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
    PieChart,
    Pie,
    Cell
} from 'recharts';
import api from '../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [analyticsRes, usersRes, predictionsRes] = await Promise.all([
                api.get('/api/admin/analytics'),
                api.get('/api/admin/users?limit=50'),
                api.get('/api/admin/predictions?limit=20')
            ]);

            if (analyticsRes.data.success) {
                setAnalytics(analyticsRes.data.analytics);
            }
            if (usersRes.data.success) {
                setUsers(usersRes.data.users);
            }
            if (predictionsRes.data.success) {
                setPredictions(predictionsRes.data.predictions);
            }
        } catch (err) {
            setError('Failed to load admin data: ' + (err.response?.data?.detail || err.message));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await api.put(`/api/admin/user/${userId}/role?role=${newRole}`);
            if (response.data.success) {
                // Update local state
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, role: newRole } : u
                ));
            }
        } catch (err) {
            setError('Failed to update role: ' + (err.response?.data?.detail || err.message));
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Prepare chart data
    const userActivityData = analytics ? [
        { name: 'Active Users', value: analytics.users.active, color: '#4caf50' },
        { name: 'Inactive Users', value: analytics.users.inactive, color: '#ff9800' }
    ] : [];

    const statsData = analytics ? [
        { name: 'Predictions', count: analytics.predictions.total },
        { name: 'Comparisons', count: analytics.comparisons.total },
        { name: 'Users', count: analytics.users.total }
    ] : [];

    const COLORS = ['#4caf50', '#ff9800'];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminIcon fontSize="large" color="primary" />
                    Admin Dashboard
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4">{analytics?.users.total || 0}</Typography>
                                    <Typography variant="body2">Total Users</Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4">{analytics?.predictions.total || 0}</Typography>
                                    <Typography variant="body2">Total Predictions</Typography>
                                </Box>
                                <AssessmentIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4">{analytics?.comparisons.total || 0}</Typography>
                                    <Typography variant="body2">Drug Comparisons</Typography>
                                </Box>
                                <CompareIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4">{analytics?.users.active || 0}</Typography>
                                    <Typography variant="body2">Active Users</Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Platform Activity
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={statsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            User Activity Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={userActivityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userActivityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* User Management Table */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    User Management
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell align="center"><strong>Role</strong></TableCell>
                                <TableCell align="center"><strong>Predictions</strong></TableCell>
                                <TableCell align="center"><strong>Joined</strong></TableCell>
                                <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id} hover>
                                    <TableCell>{user.name || 'N/A'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={user.role || 'user'}
                                            color={user.role === 'admin' ? 'primary' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">{user.total_predictions || 0}</TableCell>
                                    <TableCell align="center">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                            <Select
                                                value={user.role || 'user'}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            >
                                                <MenuItem value="user">User</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Recent Activity */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Recent Predictions
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Drug Name</strong></TableCell>
                                <TableCell align="center"><strong>Efficiency</strong></TableCell>
                                <TableCell align="center"><strong>Confidence</strong></TableCell>
                                <TableCell align="center"><strong>Type</strong></TableCell>
                                <TableCell><strong>Date</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {predictions.map((pred) => (
                                <TableRow key={pred._id} hover>
                                    <TableCell>{pred.drug_name}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${pred.predicted_efficiency}%`}
                                            color={pred.predicted_efficiency > 70 ? "success" : pred.predicted_efficiency > 40 ? "warning" : "error"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">{pred.confidence_score}%</TableCell>
                                    <TableCell align="center">
                                        {pred.is_custom ? (
                                            <Chip label="Custom" size="small" variant="outlined" color="secondary" />
                                        ) : (
                                            <Chip label="Database" size="small" variant="outlined" color="primary" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(pred.created_at).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default AdminDashboard;
