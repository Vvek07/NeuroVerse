import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import DrugAnalysis from './pages/DrugAnalysis';
import CompareTarget from './pages/CompareTarget';
import History from './pages/History';
import ModelComparison from './pages/ModelComparison';
import AdminDashboard from './pages/AdminDashboard';
import BatchAnalysis from './pages/BatchAnalysis';
import DiseaseRecommendation from './pages/DiseaseRecommendation';

// Components
import Navbar from './components/Navbar';

// Styles
import './styles/global.css';
import './styles/pharma-theme.css';
import './styles/premium-enhancements.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1e3a8a', // Deep Medical Blue
            light: '#3b82f6',
            dark: '#1e40af',
        },
        secondary: {
            main: '#7c3aed', // Medical Purple
            light: '#a78bfa',
            dark: '#6d28d9',
        },
        success: {
            main: '#10b981',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#ef4444',
        },
        background: {
            default: '#f5f7fa',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h3: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        ...Array(19).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)'),
    ],
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Navbar />
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/analyze"
                            element={
                                <PrivateRoute>
                                    <Navbar />
                                    <DrugAnalysis />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/compare"
                            element={
                                <PrivateRoute>
                                    <Navbar />
                                    <CompareTarget />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <PrivateRoute>
                                    <Navbar />
                                    <History />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/model-comparison"
                            element={
                                <PrivateRoute>
                                    <Navbar />
                                    <ModelComparison />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <Navbar />
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/batch-analysis"
                            element={
                                <PrivateRoute>
                                    <Navbar />
                                    <BatchAnalysis />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/disease-recommendation"
                            element={
                                <PrivateRoute>
                                    <Navbar />
                                    <DiseaseRecommendation />
                                </PrivateRoute>
                            }
                        />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
