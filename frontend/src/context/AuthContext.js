import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser({ token });
            setUserDetails(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const signup = async (email, password, name) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                email,
                password,
                name
            });

            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser({ token: access_token });
            setUserDetails(userData);

            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });

            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser({ token: access_token });
            setUserDetails(userData);

            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    };

    const logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserDetails(null);
    };

    const refreshUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const userData = response.data.user;
            localStorage.setItem('user', JSON.stringify(userData));
            setUserDetails(userData);
        } catch (error) {
            console.error('Failed to refresh user details:', error);
        }
    };

    const resetPassword = async (email) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
                email
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to send reset email');
        }
    };

    const value = {
        user,
        userDetails,
        loading,
        signup,
        login,
        logout,
        refreshUserDetails,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
