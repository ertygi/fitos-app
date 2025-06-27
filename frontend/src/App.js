// -----------------------------------------------------------------
// FILE: src/App.js
// This is the main application component. It manages state and view logic.
// -----------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Alert } from '@mui/material';

// Import Views
import WorkoutList from './components/WorkoutList.js';
import WorkoutDetail from './components/WorkoutDetail.js';
import WorkoutSession from './components/WorkoutSession.js';
import History from './components/History.js';
import Complete from './components/Complete.js';
import Loading from './components/common/Loading.js';

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
    const [currentView, setCurrentView] = useState('list');
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the list of workouts without exercises for the main screen
        fetch(`${API_URL}/api/workouts`)
            .then(res => { if (!res.ok) throw new Error('Network response was not ok'); return res.json(); })
            .then(data => { 
                // We only need the top-level workout info here
                const topLevelWorkouts = data.workouts.map(({ exercises, ...rest }) => rest);
                setWorkouts(topLevelWorkouts);
                setIsLoading(false); 
            })
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

    // Function to navigate to the detail view
    const viewWorkoutDetail = (workout) => {
        setIsLoading(true);
        // The API endpoint for a single workout already includes exercises
        fetch(`${API_URL}/api/workouts/${workout.id}`)
             .then(res => { if (!res.ok) throw new Error('Network response was not ok'); return res.json(); })
             .then(data => {
                setSelectedWorkout(data.workout);
                setIsLoading(false);
                setCurrentView('detail');
             })
             .catch(err => {
                 setError('Failed to fetch workout details.');
                 setIsLoading(false);
                 console.error(err);
             });
    };

    const startWorkout = () => { 
        if (!selectedWorkout) return;
        setCurrentExerciseIndex(0); 
        setCurrentView('session'); 
    };
    
    const endWorkout = () => {
        if (!selectedWorkout) return;
        fetch(`${API_URL}/api/history`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workoutId: selectedWorkout.id })
        })
        .then(res => res.json()).then(() => { setCurrentView('complete'); })
        .catch(err => { setError('Failed to save workout history.'); console.error(err); });
    };

    const backToList = () => { 
        setSelectedWorkout(null); 
        setCurrentExerciseIndex(0); 
        setCurrentView('list'); 
        setError(null); 
    };
    
    const nextExercise = () => {
        if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        } else { endWorkout(); }
    };

    const renderView = () => {
        if (isLoading) return <Loading />;
        if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

        switch (currentView) {
            case 'detail': return <WorkoutDetail workout={selectedWorkout} onStart={startWorkout} onBack={backToList} />;
            case 'session': return <WorkoutSession workout={selectedWorkout} currentExerciseIndex={currentExerciseIndex} onNext={nextExercise} onEnd={endWorkout} />;
            case 'history': return <History history={workoutHistory} onBack={backToList} />;
            case 'complete': return <Complete onBack={backToList} onViewHistory={fetchHistory} />;
            case 'list': 
            default: 
                return <WorkoutList 
                            workouts={workouts} 
                            onSelectWorkout={viewWorkoutDetail}
                            onViewHistory={fetchHistory} 
                        />;
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container maxWidth="md" sx={{ py: 2 }}>
                {renderView()}
            </Container>
        </ThemeProvider>
    );
}