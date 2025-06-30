import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Header from './common/Header.js';

function WorkoutCard({ workout, onSelect }) {
    return (
        <Card sx={{ bgcolor: 'background.paper' }}>
            <CardActionArea onClick={() => onSelect(workout)}>
                <CardContent>
                    <Typography variant="h5" component="div" color="primary.main">{workout.name}</Typography>
                    {/* A simpler, single-line description is now shown on the list view */}
                    <Typography sx={{ mb: 1.5 }} color="text.secondary" noWrap>
                        {workout.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }} color="text.secondary">
                        <AccessTimeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                        <Typography variant="body2">{workout.duration}</Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default function WorkoutList({ workouts, onSelectWorkout, onViewHistory }) {
    return (
        <>
            <Header title="FitOS" onHistoryClick={onViewHistory} />
            <Typography variant="h4" gutterBottom>Workouts</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.isArray(workouts) && workouts.map(workout => (
                    <WorkoutCard key={workout.id} workout={workout} onSelect={onSelectWorkout} />
                ))}
            </Box>
        </>
    );
}
