import React from 'react';
import { Box, Button, Typography, IconButton, Grid, Alert, Paper, List, Link } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

export default function WorkoutDetail({ workout, onStart, onBack, onSave, onRegenerate }) {
    // DEBUG: Log the props received by the component
    console.log("--- WorkoutDetail.js: Received props ---", { workout });

    if (!workout || !workout.exercises) {
        // This log will tell us if the component is rendering before data is ready
        console.error("--- WorkoutDetail.js: Rendering with invalid workout data! ---");
        return <Alert severity="warning">Workout details could not be loaded.</Alert>;
    }
    
    const isGenerated = typeof workout.id === 'string' && workout.id.startsWith('gen-');

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={onBack} sx={{ mr: 1 }}><ChevronLeftIcon /></IconButton>
                <Typography variant="h4">{workout.name}</Typography>
            </Box>
            
            <Typography variant="h5" gutterBottom sx={{ pl: 1, mb: 2 }}>Exercises</Typography>
            
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {workout.exercises.map((ex, index) => (
                    <Paper key={ex.id || index} elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={4}>
                                {ex.image_url ? (
                                    <img src={ex.image_url} alt={ex.name} style={{ width: '100%', borderRadius: '8px' }}/>
                                ) : ex.video_urls && ex.video_urls.length > 0 ? (
                                    <video style={{ width: '100%', borderRadius: '8px' }} autoPlay loop muted playsInline key={ex.video_urls[0]}>
                                        <source src={ex.video_urls[0]} type="video/mp4" />
                                    </video>
                                ) : (
                                    <Box sx={{ bgcolor: 'action.hover', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                                        <Typography variant="caption">No Media</Typography>
                                    </Box>
                                )}
                            </Grid>
                            <Grid item xs={5}>
                                <Link href="#" underline="hover" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                                    <Typography variant="h6">{ex.name}</Typography>
                                </Link>
                                <Typography variant="body2" color="text.secondary">{ex.level}</Typography>
                                <Typography variant="body1" sx={{ my: 1 }}>{ex.reps}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessibilityNewIcon sx={{ color: 'text.secondary' }}/>
                                    <Typography variant="body2" color="text.secondary">{ex.equipment}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <img src="[https://placehold.co/60x120/1e1e1e/00e5ff?text=Front](https://placehold.co/60x120/1e1e1e/00e5ff?text=Front)" alt="Front muscle diagram" />
                                <img src="[https://placehold.co/60x120/1e1e1e/00e5ff?text=Back](https://placehold.co/60x120/1e1e1e/00e5ff?text=Back)" alt="Back muscle diagram" />
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
            </List>

            {isGenerated ? (
                <Grid container spacing={2} sx={{ mt: 4 }}>
                    <Grid item xs={6}>
                        <Button variant="outlined" fullWidth size="large" onClick={onRegenerate}>
                            Generate Another
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button variant="contained" fullWidth size="large" onClick={() => onSave(workout)}>
                            Save This Workout
                        </Button>
                    </Grid>
                </Grid>
            ) : (
                <Button variant="contained" color="primary" fullWidth size="large" onClick={onStart}>
                    Start Workout
                </Button>
            )}
        </>
    );
}