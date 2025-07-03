import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function WorkoutCard({ workout, onSelect }) {
    return (
        <Card sx={{ bgcolor: 'background.paper' }}>
            <CardActionArea onClick={() => onSelect(workout)}>
                <CardContent>
                    <Typography variant="h5" component="div" color="primary.main">{workout.name}</Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary" noWrap>{workout.description}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }} color="text.secondary">
                        <AccessTimeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                        <Typography variant="body2">{workout.duration}</Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default function WorkoutList({ workouts, onSelectWorkout, onNavigateToExercises }) {
    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h4" gutterBottom>Workouts</Typography>
                <Button variant="outlined" onClick={onNavigateToExercises}>
                    View All Exercises
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.isArray(workouts) && workouts.map(workout => (
                    <WorkoutCard key={workout.id} workout={workout} onSelect={onSelectWorkout} />
                ))}
            </Box>
        </>
    );
}