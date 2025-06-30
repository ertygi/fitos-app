import React from 'react';
import { Box, Button, Typography, IconButton, Grid, Alert, Paper, List, Link } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

// Helper component to format the description
const FormattedDescription = ({ description }) => {
    if (!description) return null;

    // A more robust way to parse the description based on keywords
    const parts = description.split('.').map(p => p.trim()).filter(p => p);
    const structuredInfo = {};
    let structureDetails = [];

    parts.forEach(part => {
        if (part.startsWith('Workout Type:')) {
            structuredInfo.type = part.replace('Workout Type:', '').trim();
        } else if (part.startsWith('Goal:')) {
            structuredInfo.goal = part.replace('Goal:', '').trim();
        } else if (part.startsWith('Structure:')) {
            const structureParts = part.split(',');
            structureParts.forEach(sp => {
                const trimmedPart = sp.replace('Structure:', '').trim();
                let icon = '';
                if (trimmedPart.toLowerCase().includes('round')) icon = '🔥';
                else if (trimmedPart.toLowerCase().includes('exercise')) icon = '⏱️';
                else if (trimmedPart.toLowerCase().includes('rest')) icon = '💧';
                structureDetails.push({ text: trimmedPart, icon });
            });
        }
    });

    return (
        <Box sx={{ mt: 1, mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {structuredInfo.type && <Typography variant="body1" color="text.secondary"><strong>Workout Type:</strong> {structuredInfo.type}</Typography>}
            {structuredInfo.goal && <Typography variant="body1" color="text.secondary"><strong>Goal:</strong> {structuredInfo.goal}</Typography>}
            {structureDetails.length > 0 && (
                <Box mt={1}>
                    <Typography variant="body1" color="text.secondary"><strong>Structure:</strong></Typography>
                    <List dense sx={{ pl: 2 }}>
                        {structureDetails.map((item, index) => (
                             <Typography key={index} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.icon} {item.text}
                             </Typography>
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    );
};


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
            
            {/* Structured Description is now here */}
            <FormattedDescription description={workout.description} />
            
            <Typography variant="h5" gutterBottom sx={{ pl: 1, mb: 2 }}>Exercises</Typography>
            
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {workout.exercises.map((ex) => (
                    <Paper key={ex.id} elevation={3} sx={{ p: 2, bgcolor: '#303030' }}>
                        <Grid container spacing={2} alignItems="center">
                            {/* Thumbnail Section */}
                            <Grid item xs={4}>
                                {ex.video_urls && ex.video_urls.length > 0 ? (
                                    <video 
                                        style={{ width: '100%', borderRadius: '8px' }}
                                        autoPlay loop muted playsInline key={ex.video_urls[0]}
                                    >
                                        <source src={ex.video_urls[0]} type="video/mp4" />
                                    </video>
                                ) : (
                                    <Box sx={{ bgcolor: 'action.hover', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                                        <Typography variant="caption">No Video</Typography>
                                    </Box>
                                )}
                            </Grid>
                            
                            {/* Information Section */}
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
                            
                            {/* Muscle Map Section */}
                            <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
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