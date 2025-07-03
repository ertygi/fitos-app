import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Paper, CircularProgress } from '@mui/material';

export default function WorkoutSession({ workout, currentExerciseIndex, onNext, onEnd }) {
    // Safely access the current exercise object to prevent crashes
    const exercise = workout?.exercises?.[currentExerciseIndex];

    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (exercise) {
            setTimer(exercise.duration_seconds || 0);
            if (exercise.type === 'time') {
                const interval = setInterval(() => {
                    setTimer(prev => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setTimeout(onNext, 1000);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                // Cleanup function to clear the interval
                return () => clearInterval(interval);
            }
        }
    }, [exercise, onNext]);

    // If data is not ready, show a loading spinner
    if (!exercise) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const isTimeBased = exercise.type === 'time';

    return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Exercise {currentExerciseIndex + 1} / {workout.exercises.length}</Typography>
            <Typography variant="h4" my={2}>{exercise.name}</Typography>

            <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
                <Grid item xs={12} md={7}>
                    {exercise.image_url ? (
                        <img src={exercise.image_url} alt={exercise.name} style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }} />
                    ) : (
                        <Box sx={{ bgcolor: 'action.hover', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                            <Typography variant="caption">No Media</Typography>
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12} md={5}>
                    <Typography variant="h2" color="primary" sx={{ fontWeight: 700, my: 2 }}>
                        {isTimeBased ? `${timer}s` : exercise.reps}
                    </Typography>
                    {exercise.instructions && (
                        <Paper sx={{ p: 2, textAlign: 'left', bgcolor: 'background.paper' }}>
                            <Typography variant="h6" gutterBottom>Instructions:</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                {exercise.instructions}
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            <Box mt={4}>
                {!isTimeBased && (
                    <Button variant="contained" size="large" onClick={onNext} sx={{ mb: 2, px: 5, py: 1.5 }}>
                        Next Exercise
                    </Button>
                )}
                <Button variant="outlined" color="error" onClick={onEnd}>
                    End Workout
                </Button>
            </Box>
        </Box>
    );
}