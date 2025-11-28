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

// Components
import Navbar from './components/Navbar';

// Styles
import './styles/global.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
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

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
