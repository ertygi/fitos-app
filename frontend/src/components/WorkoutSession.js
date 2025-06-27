
// -----------------------------------------------------------------
// FILE: src/components/WorkoutSession.js
// This component handles the live workout view.
// -----------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, CircularProgress } from '@mui/material';

export default function WorkoutSession({ workout, currentExerciseIndex, onNext, onEnd }) {
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
                return () => clearInterval(interval);
            }
        }
    }, [exercise, onNext]);

    if (!exercise) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const isTimeBased = exercise.type === 'time';

    return (
        <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <Typography color="text.secondary">Exercise {currentExerciseIndex + 1} / {workout.exercises.length}</Typography>
             
             <Box sx={{ width: '100%', maxWidth: '600px', my: 3 }}>
                {exercise.video_urls && exercise.video_urls.length > 0 ? (
                    <video 
                        style={{ width: '100%', borderRadius: '8px' }}
                        autoPlay loop muted playsInline key={exercise.video_urls[0]}
                    >
                        <source src={exercise.video_urls[0]} type="video/mp4" />
                    </video>
                ) : (
                    <Box sx={{ bgcolor: 'action.hover', height: 225, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                        <Typography variant="caption">No Video</Typography>
                    </Box>
                )}
            </Box>

             <Typography variant="h4" my={1}>{exercise.name}</Typography>

            <Typography variant="h2" color="primary" my={2} sx={{ fontWeight: 700 }}>
                {isTimeBased ? timer : exercise.reps}
            </Typography>

            {!isTimeBased && (
                <Button variant="contained" size="large" onClick={onNext} sx={{ mb: 2, px: 5, py: 1.5 }}>Next Exercise</Button>
            )}
            <Button variant="outlined" color="error" onClick={onEnd}>End Workout</Button>
        </Box>
    );
}
