import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; 
import ViewListIcon from '@mui/icons-material/ViewList'; 

export default function Header({ currentUser, onLogout, onNavigateToWorkouts, onNavigateToGenerator, onNavigateToHistory }) {
    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
            <Toolbar>
                <FitnessCenterIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                    FitOS
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {currentUser && <Typography>Welcome, {currentUser.name}</Typography>}
                    <Button color="inherit" startIcon={<ViewListIcon />} onClick={onNavigateToWorkouts}>
                        My Workouts
                    </Button>
                    <Button color="inherit" startIcon={<AutoAwesomeIcon />} onClick={onNavigateToGenerator}>
                        Generator
                    </Button>
                    <Button color="inherit" startIcon={<HistoryIcon />} onClick={onNavigateToHistory}>
                        History
                    </Button>
                     <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}