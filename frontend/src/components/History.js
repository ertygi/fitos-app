import React from 'react';
import { Box, Typography, IconButton, List, Card, CardContent } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export default function History({ history, onBack }) {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={onBack} sx={{ mr: 1 }}><ChevronLeftIcon /></IconButton>
                <Typography variant="h4">Workout History</Typography>
            </Box>
            {history.length > 0 ? (
                <List>
                    {history.map((item) => (
                        <Card key={item.id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" color="primary">{item.name}</Typography>
                                <Typography color="text.secondary">{item.description}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Completed on: {formatDate(item.completed_at)}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </List>
            ) : (
                <Typography sx={{ textAlign: 'center', mt: 10 }} color="text.secondary">
                    No completed workouts yet.
                </Typography>
            )}
        </>
    );
}
