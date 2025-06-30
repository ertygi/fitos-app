// -----------------------------------------------------------------
// FILE: src/components/ExerciseList.js (Updated)
// This version correctly displays the exercise preview image.
// -----------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, Autocomplete
} from '@mui/material';
import Header from './common/Header.js';

const API_URL = process.env.REACT_APP_API_URL || '';
const PAGE_SIZE = 50;

// Mock filter options
const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Core", "Biceps", "Triceps", "Abductors", "Glutes", "Hamstrings", "Quads", "Calves", "Lats"];
const levels = ["Beginner", "Intermediate", "Advanced"];
const equipmentTypes = ["Bodyweight", "Dumbbell", "Barbell", "Kettlebell", "Cable", "Resistance Band"];

export default function ExerciseList({ onViewHistory }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalExercises, setTotalExercises] = useState(0);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [muscle, setMuscle] = useState(null);
    const [level, setLevel] = useState(null);
    const [equipment, setEquipment] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    // This effect runs whenever the page or filters change
    useEffect(() => {
        setLoading(true);
        setError(null);
        
        const offset = (page - 1) * PAGE_SIZE;
        const params = new URLSearchParams({
            limit: PAGE_SIZE,
            offset,
            ...activeFilters // Use the committed filters
        });

        fetch(`${API_URL}/api/exercises?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setExercises(prev => page === 1 ? data.exercises : [...prev, ...data.exercises]);
                setTotalExercises(data.total);
            })
            .catch(err => setError("Failed to fetch exercises."))
            .finally(() => setLoading(false));

    }, [page, activeFilters]);

    const handleSearch = () => {
        setPage(1); // Reset to the first page for a new search

        // Map "Bodyweight" from the UI to "None" for the API query
        let equipmentToSearch = equipment;
        if (equipment === 'Bodyweight') {
            equipmentToSearch = 'None';
        }

        setActiveFilters({
            search: searchTerm,
            muscle: muscle ? muscle.toLowerCase().replace(/ /g, '_') : '',
            level: level || '',
            equipment: equipmentToSearch || ''
        });
    };

    const handleLoadMore = () => {
        // We only increment the page number. The useEffect will handle the fetch.
        if (!loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setMuscle(null);
        setLevel(null);
        setEquipment(null);
        // Resetting active filters and page will trigger a fresh fetch
        setActiveFilters({});
        setPage(1); 
    };
    
    const hasMore = exercises.length < totalExercises;

    return (
        <>
            <Header title="Exercises" onHistoryClick={onViewHistory} />
            <Typography variant="h4" gutterBottom>Exercise List</Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                         <TextField fullWidth label="Search for exercise name..." variant="outlined" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                         <Autocomplete options={muscleGroups} getOptionLabel={(option) => option} value={muscle} onChange={(e, val) => setMuscle(val)} renderInput={(params) => <TextField {...params} label="Filter by Muscle Group" />} />
                    </Grid>
                     <Grid item xs={12} sm={4}>
                        <Autocomplete options={levels} getOptionLabel={(option) => option} value={level} onChange={(e, val) => setLevel(val)} renderInput={(params) => <TextField {...params} label="Filter by Level" />} />
                    </Grid>
                     <Grid item xs={12} sm={4}>
                        <Autocomplete options={equipmentTypes} getOptionLabel={(option) => option} value={equipment} onChange={(e, val) => setEquipment(val)} renderInput={(params) => <TextField {...params} label="Filter by Equipment" />} />
                    </Grid>
                    <Grid item xs={6}>
                        <Button onClick={handleSearch} variant="contained" color="primary">Search</Button>
                    </Grid>
                    <Grid item xs={6} sx={{textAlign: 'right'}}>
                        <Button onClick={clearFilters} color="secondary">Clear Filters</Button>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Preview</TableCell> {/* Added Preview header */}
                            <TableCell>Exercise Name</TableCell>
                            <TableCell>Muscle Group</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Equipment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {exercises.map(ex => (
                            <TableRow key={ex.id}>
                                {/* CORRECTED: Render an image tag for the preview */}
                                <TableCell>
                                    {ex.image_url ? (
                                        <img 
                                            src={ex.image_url} 
                                            alt={ex.name} 
                                            style={{ height: '60px', width: 'auto', borderRadius: '4px' }} 
                                        />
                                    ) : (
                                        "No Preview"
                                    )}
                                </TableCell>
                                <TableCell>{ex.name}</TableCell>
                                <TableCell>{(ex.target_muscles || []).join(', ')}</TableCell>
                                <TableCell>{ex.difficulty}</TableCell>
                                <TableCell>{ex.equipment}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            
            {hasMore && !loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <Button variant="contained" onClick={handleLoadMore}>Load More</Button>
                </Box>
            )}
        </>
    );
}
