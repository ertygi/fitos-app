import React, { useState } from 'react';
import {
    Box, Button, Typography, IconButton, Paper, Grid,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    FormGroup, Checkbox, Stepper, Step, StepLabel, StepContent, Select, MenuItem
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const steps = [
    'Your Profile & Goal',
    'Equipment & Duration',
    'Target Muscles'
];

const fitnessGoals = ['Lose Weight', 'Gain Strength', 'Gain Muscle'];
const fitnessLevels = ['Novice', 'Beginner', 'Intermediate', 'Advanced'];
const equipmentList = ['Bodyweight', 'Dumbbell', 'Barbell', 'Kettlebell', 'Cable', 'Resistance Band'];
const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Core', 'Biceps', 'Triceps'];
const durations = ['15 min', '30 min', '45 min', '60 min'];

export default function Generator({ onWorkoutGenerated, onBack }) {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        gender: 'Male',
        goal: 'Gain Strength',
        level: 'Beginner',
        duration: '30 min',
        equipment: { Bodyweight: true },
        muscles: { Chest: true, Back: true, Legs: true },
    });

    const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (group, name) => (e) => {
        setFormData(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [name]: e.target.checked,
            },
        }));
    };
    
    // The submit button now calls the prop passed from App.js
    const handleSubmit = () => {
        onWorkoutGenerated(formData); 
    };
    
    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                     <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" margin="normal">
                                <FormLabel component="legend">Primary Fitness Goal</FormLabel>
                                <RadioGroup row name="goal" value={formData.goal} onChange={handleChange}>
                                    {fitnessGoals.map(goal => <FormControlLabel key={goal} value={goal} control={<Radio />} label={goal} />)}
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" margin="normal">
                                <FormLabel component="legend">Your Fitness Level</FormLabel>
                                <RadioGroup row name="level" value={formData.level} onChange={handleChange}>
                                    {fitnessLevels.map(level => <FormControlLabel key={level} value={level} control={<Radio />} label={level} />)}
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                     <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" margin="normal" fullWidth>
                                <FormLabel component="legend">How long do you want to work out?</FormLabel>
                                <Select name="duration" value={formData.duration} onChange={handleChange}>
                                    {durations.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             <FormControl component="fieldset" margin="normal">
                                <FormLabel component="legend">Available Equipment</FormLabel>
                                <FormGroup row>
                                    {equipmentList.map(item => <FormControlLabel key={item} control={<Checkbox checked={!!formData.equipment[item]} onChange={handleCheckboxChange('equipment', item)} name={item} />} label={item} />)}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <FormControl component="fieldset" margin="normal">
                        <FormLabel component="legend">Which muscles do you want to train?</FormLabel>
                        <FormGroup row>
                            {muscleGroups.map(item => <FormControlLabel key={item} control={<Checkbox checked={!!formData.muscles[item]} onChange={handleCheckboxChange('muscles', item)} name={item} />} label={item} />)}
                        </FormGroup>
                    </FormControl>
                );
            default:
                return 'Unknown step';
        }
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={onBack} sx={{ mr: 1 }}><ChevronLeftIcon /></IconButton>
                <Typography variant="h4">Workout Generator</Typography>
            </Box>
            <Paper sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                        <Step key={label} active>
                            <StepLabel><Typography variant="h6">{label}</Typography></StepLabel>
                            <StepContent>
                                <Box sx={{ my: 2 }}>{getStepContent(index)}</Box>
                                <Box sx={{ mb: 2 }}>
                                    <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                                        Back
                                    </Button>
                                    <Button variant="contained" onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} sx={{ mt: 1, mr: 1 }}>
                                        {index === steps.length - 1 ? 'Generate Workout' : 'Continue'}
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper>
        </>
    );
}