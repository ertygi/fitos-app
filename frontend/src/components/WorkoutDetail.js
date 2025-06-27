
// -----------------------------------------------------------------
// FILE: src/components/WorkoutDetail.js
// This component now correctly displays the rich list of exercises for the selected workout.
// -----------------------------------------------------------------
import React from 'react';
import { Box, Button, Typography, IconButton, Grid, Alert, Paper, List, Link } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

export default function WorkoutDetail({ workout, onStart, onBack }) {
    if (!workout || !workout.exercises) {
        return <Alert severity="warning">Workout details could not be loaded.</Alert>;
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={onBack} sx={{ mr: 1 }}><ChevronLeftIcon /></IconButton>
                <Typography variant="h4">{workout.name}</Typography>
            </Box>
            <Typography variant="h5" gutterBottom sx={{ pl: 1, mb: 2 }}>Exercises</Typography>
            
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {workout.exercises.map((ex) => (
                    <Paper key={ex.id} elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                        <Grid container spacing={2} alignItems="center">
                            {/* Thumbnail Section - Forcing single row layout */}
                            <Grid item xs={4}>
                                {ex.video_urls && ex.video_urls.length > 0 ? (
                                    <video 
                                        style={{ width: '100%', borderRadius: '8px' }}
                                        autoPlay loop muted playsInline key={ex.video_urls[0]}
                                    >
                                        <source src={ex.video_urls[0]} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <Box sx={{ bgcolor: 'action.hover', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                                        <Typography variant="caption">No Video</Typography>
                                    </Box>
                                )}
                            </Grid>
                            
                            {/* Information Section - Forcing single row layout */}
                            <Grid item xs={5}>
                                <Link href="#" underline="hover" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                                    <Typography variant="h6">{ex.name}</Typography>
                                </Link>
                                <Typography variant="body2" color="text.secondary">{ex.difficulty}</Typography>
                                <Typography variant="body1" sx={{ my: 1 }}>{ex.reps}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessibilityNewIcon sx={{ color: 'text.secondary' }}/>
                                    <Typography variant="body2" color="text.secondary">{ex.equipment}</Typography>
                                </Box>
                            </Grid>
                            
                            {/* Muscle Map Section - Forcing single row layout */}
                            <Grid item xs={3}>
                               <img src={ex.svg_front_url} alt="Front muscle diagram" style={{ height: '120px' }} />
                               <img src={ex.svg_back_url} alt="Back muscle diagram" style={{ height: '120px' }} />
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
            </List>

            <Button variant="contained" color="primary" fullWidth size="large" onClick={onStart} sx={{ mt: 4, py: 1.5 }}>
                Start Workout
            </Button>
        </>
    );
}