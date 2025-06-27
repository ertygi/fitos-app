import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function Complete({ onBack, onViewHistory }) {
    return (
        <Box sx={{ textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main' }} />
            <Typography variant="h4" mt={2}>Workout Complete!</Typography>
            <Typography color="text.secondary" mt={1}>Great job. You've earned it!</Typography>
            <Box mt={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '80%' }}>
                <Button variant="contained" onClick={onViewHistory}>View History</Button>
                <Button variant="outlined" onClick={onBack}>Back to Workouts</Button>
            </Box>
        </Box>
    );
}
