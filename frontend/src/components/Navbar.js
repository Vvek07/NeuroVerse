import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Box
} from '@mui/material';
import { AccountCircle, Psychology } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, userDetails, logout } = useAuth();
    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Box sx={{ px: 2, pt: 2 }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px 0 rgba(102, 126, 234, 0.3)',
                }}
            >
                <Toolbar>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                            cursor: 'pointer',
                            gap: 1.5
                        }}
                        onClick={() => navigate('/dashboard')}
                    >
                        <Psychology sx={{ fontSize: 32, color: 'white' }} />
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ fontWeight: 600 }}
                        >
                            NeuroVerse
                        </Typography>
                    </Box>

                    {user && (
                        <>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {userDetails?.name || user.email}
                            </Typography>
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                {userDetails?.role === 'admin' && (
                                    <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                                        Admin Panel
                                    </MenuItem>
                                )}
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;
