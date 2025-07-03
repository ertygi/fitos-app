import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, Autocomplete
} from '@mui/material';
import Header from './common/Header.js';

const API_URL = process.env.REACT_APP_API_URL || '';
const PAGE_SIZE = 50;

const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Core", "Biceps", "Triceps", "Abductors", "Glutes", "Hamstrings", "Quads", "Calves", "Lats"];
const levels = ["Beginner", "Intermediate", "Advanced"];
const equipmentTypes = ["Bodyweight", "Dumbbell", "Barbell", "Kettlebell", "Cable", "Resistance Band"];

export default function ExerciseList({ currentUser, onLogout, onNavigateToWorkouts, onNavigateToGenerator, onNavigateToHistory }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalExercises, setTotalExercises] = useState(0);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [muscle, setMuscle] = useState(null);
    const [level, setLevel] = useState(null);
    const [equipment, setEquipment] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        const offset = (page - 1) * PAGE_SIZE;
        const params = new URLSearchParams({
            limit: PAGE_SIZE,
            offset,
            ...activeFilters
        });

        fetch(`${API_URL}/api/exercises?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                const newExercises = data.exercises || [];
                 setExercises(prev => page === 1 ? newExercises : [...prev, ...newExercises]);
                setTotalExercises(data.total || 0);
            })
            .catch(err => setError("Failed to fetch exercises."))
            .finally(() => setLoading(false));

    }, [page, activeFilters]);

    const handleSearch = () => {
        setPage(1);
        let equipmentToSearch = equipment;
        if (equipment === 'Bodyweight') {
            equipmentToSearch = 'None'; 
        }

        setActiveFilters({
            search: searchTerm,
            muscle: muscle || '',
            level: level || '',
            equipment: equipmentToSearch || ''
        });
    };

    const handleLoadMore = () => {
        if (!loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setMuscle(null);
        setLevel(null);
        setEquipment(null);
        setActiveFilters({});
        setPage(1); 
    };
    
    const hasMore = exercises && exercises.length < totalExercises;

    return (
        <>
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
                            <TableCell>Preview</TableCell>
                            <TableCell>Exercise Name</TableCell>
                            <TableCell>Muscle Group</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Equipment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {exercises.map(ex => (
                            <TableRow key={ex.id}>
                                <TableCell>
                                    {ex.image_url ? (
                                        <img src={ex.image_url} alt={ex.name} style={{ height: '60px', width: 'auto', borderRadius: '4px' }} />
                                    ) : ( "No Preview" )}
                                </TableCell>
                                <TableCell>{ex.name}</TableCell>
                                {/* CORRECTED: Now displays the single target_muscle string */}
                                <TableCell>{ex.target_muscle}</TableCell>
                                <TableCell>{ex.level}</TableCell>
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
