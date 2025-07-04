import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Button, IconButton } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';

function WorkoutCard({ workout, onSelect, currentUser, onDelete }) {
    const isAdmin = currentUser && currentUser.role === 'admin';

    const handleClick = () => {
        console.log(`--- WorkoutCard: Clicked on workout -> ${workout.name} (ID: ${workout.id}) ---`);
        onSelect(workout);
    };

    return (
        <Card sx={{ bgcolor: 'background.paper', position: 'relative' }}>
            {isAdmin && (
                 <IconButton 
                    aria-label="delete"
                    onClick={() => onDelete(workout.id)}
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
                >
                    <DeleteIcon />
                </IconButton>
            )}
            <CardActionArea onClick={handleClick}>
                <CardContent>
                    <Typography variant="h5" component="div" color="primary.main" sx={{ pr: isAdmin ? '40px' : 0 }}>
                        {workout.name}
                    </Typography>
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

export default function WorkoutList({ workouts, onSelectWorkout, onNavigateToExercises, currentUser, onDeleteWorkout }) {
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
                    <WorkoutCard 
                        key={workout.id} 
                        workout={workout} 
                        onSelect={onSelectWorkout}
                        currentUser={currentUser}
                        onDelete={onDeleteWorkout}
                    />
                ))}
            </Box>
        </>
    );
}