import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Avatar
} from '@mui/material';
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
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
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    NeuroVerse
                </Typography>

                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Button color="inherit" onClick={() => navigate('/batch-analysis')}>
                            Batch Analysis
                        </Button>
                    </Box>
                )}

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
    );
};

export default Navbar;
