import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HistoryIcon from '@mui/icons-material/History';

export default function Header({ title, onHistoryClick }) {
    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
            <Toolbar>
                <FitnessCenterIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
                <Button color="inherit" startIcon={<HistoryIcon />} onClick={onHistoryClick}>History</Button>
            </Toolbar>
        </AppBar>
    );
}
