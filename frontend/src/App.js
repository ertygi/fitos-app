// -----------------------------------------------------------------
// FILE: src/App.js (Updated with Tabs)
// -----------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Alert, Tabs, Tab, Box } from '@mui/material';

// Import Views
import WorkoutList from './components/WorkoutList.js';
import WorkoutDetail from './components/WorkoutDetail.js';
import WorkoutSession from './components/WorkoutSession.js';
import History from './components/History.js';
import Complete from './components/Complete.js';
import Loading from './components/common/Loading.js';
import ExerciseList from './components/ExerciseList.js'; // Import new component

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00e5ff' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#ffffff', secondary: '#b0bec5' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
  }
});
const API_URL = process.env.REACT_APP_API_URL || '';

export default function App() {
    const [currentView, setCurrentView] = useState('workouts'); // 'workouts', 'exercises', 'detail', etc.
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    // CORRECTED: Restored missing state variables and handler functions
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    // Fetch initial workouts for the workout list
    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_URL}/api/workouts`)
            .then(res => { if (!res.ok) throw new Error('Network response was not ok'); return res.json(); })
            .then(data => { setWorkouts(data.workouts); setIsLoading(false); })
            .catch(err => {
                setError('Failed to fetch workouts. Is the backend server running?');
                setIsLoading(false); console.error(err);
            });
    }, []);
    
    const fetchHistory = () => {
        setIsLoading(true);
        fetch(`${API_URL}/api/history`)
            .then(res => res.json())
            .then(data => { setWorkoutHistory(data.history); setIsLoading(false); setCurrentView('history'); })
            .catch(err => { setError('Failed to fetch history.'); setIsLoading(false); console.error(err); });
    }

    const viewWorkoutDetail = (workout) => {
        // This function will need to be implemented to fetch full details
        setSelectedWorkout(workout);
        setCurrentView('detail');
    };
    
    const startWorkout = (workoutToStart) => {
        setSelectedWorkout(workoutToStart);
        setCurrentExerciseIndex(0);
        setCurrentView('session');
    };

    const endWorkout = () => {
        if (!selectedWorkout) return;
        fetch(`${API_URL}/api/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workoutId: selectedWorkout.id })
        })
        .then(res => res.json())
        .then(() => { setCurrentView('complete'); })
        .catch(err => { setError('Failed to save workout history.'); console.error(err); });
    };
    
    const nextExercise = () => {
        if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        } else {
            endWorkout();
        }
    };


    const renderView = () => {
        if (isLoading && (currentView === 'workouts' || currentView === 'exercises')) return <Loading />;
        if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

        switch (currentView) {
            case 'detail': return <WorkoutDetail workout={selectedWorkout} onStart={() => startWorkout(selectedWorkout)} onBack={() => setCurrentView('workouts')} />;
            case 'session': return <WorkoutSession workout={selectedWorkout} currentExerciseIndex={currentExerciseIndex} onNext={nextExercise} onEnd={endWorkout} />;
            case 'history': return <History history={workoutHistory} onBack={() => setCurrentView('workouts')} />;
            case 'complete': return <Complete onBack={() => setCurrentView('workouts')} onViewHistory={fetchHistory} />;
            case 'workouts': 
                return <WorkoutList 
                            workouts={workouts} 
                            onSelectWorkout={viewWorkoutDetail}
                            onViewHistory={fetchHistory}
                        />;
            case 'exercises':
                return <ExerciseList onViewHistory={fetchHistory} />;

            default:
                return <WorkoutList workouts={workouts} onSelectWorkout={viewWorkoutDetail} />;
        }
    };
    
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={currentView} onChange={(e, newValue) => setCurrentView(newValue)} centered>
                        <Tab label="Workouts" value="workouts" />
                        <Tab label="Exercises" value="exercises" />
                        <Tab label="History" value="history" />
                    </Tabs>
                </Box>
                {renderView()}
            </Container>
        </ThemeProvider>
    );
}
