import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Alert } from '@mui/material';

// Import Views
import WorkoutList from './components/WorkoutList.js';
import WorkoutDetail from './components/WorkoutDetail.js';
import WorkoutSession from './components/WorkoutSession.js';
import History from './components/History.js';
import Complete from './components/Complete.js';
import Loading from './components/common/Loading.js';
import Login from './components/Login.js';
import Generator from './components/Generator.js'; // Import the new Generator component
import ExerciseList from './components/ExerciseList.js';

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
    const [currentUser, setCurrentUser] = useState(null); 
    const [currentView, setCurrentView] = useState('login');
    
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentUser && currentView === 'list') { 
            setIsLoading(true);
            fetch(`${API_URL}/api/workouts`)
                .then(res => res.json())
                .then(data => { 
                    const topLevelWorkouts = data.workouts.map(({ exercises, ...rest }) => rest);
                    setWorkouts(topLevelWorkouts); 
                })
                .catch(err => setError('Failed to fetch workouts.'))
                .finally(() => setIsLoading(false));
        }
    }, [currentUser, currentView]);

    const handleLogin = (user) => {
        setCurrentUser(user);
        setCurrentView('list');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView('login');
    };
    
    const fetchHistory = () => {
        if (!currentUser) return;
        setIsLoading(true);
        fetch(`${API_URL}/api/users/${currentUser.id}/history`)
            .then(res => res.json())
            .then(data => { setWorkoutHistory(data.history); setIsLoading(false); setCurrentView('history'); })
            .catch(err => { setError('Failed to fetch history.'); setIsLoading(false); });
    };

    const viewWorkoutDetail = (workout) => {
        setIsLoading(true);
        fetch(`${API_URL}/api/workouts/${workout.id}`)
             .then(res => res.json())
             .then(data => {
                setSelectedWorkout(data.workout);
                setIsLoading(false);
                setCurrentView('detail');
             })
             .catch(err => { setError('Failed to fetch workout details.'); setIsLoading(false); });
    };

    const startWorkout = (workoutToStart) => { 
        setSelectedWorkout(workoutToStart);
        setCurrentExerciseIndex(0); 
        setCurrentView('session'); 
    };
    
    const endWorkout = () => {
        if (!selectedWorkout || !currentUser) return;
        fetch(`${API_URL}/api/history`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workoutId: selectedWorkout.id, userId: currentUser.id })
        })
        .then(res => res.json()).then(() => { setCurrentView('complete'); })
        .catch(err => { setError('Failed to save workout history.'); });
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
        } else {
            endWorkout();
        }
     };

     // Placeholder for when the generator form is submitted
     const handleWorkoutGenerated = (formData) => {
         alert(`Workout generated with the following options: ${JSON.stringify(formData)}`);
         setCurrentView('list');
     }

    const renderView = () => {
        if (isLoading) return <Loading />;
        if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

        if (!currentUser) {
            return <Login onLogin={handleLogin} />;
        }

        const commonNavProps = {
            currentUser,
            onLogout: handleLogout,
            onNavigateToWorkouts: () => setCurrentView('list'),
            onNavigateToGenerator: () => setCurrentView('generator'),
            onNavigateToHistory: fetchHistory,
            onNavigateToExercises: () => setCurrentView('exercises'),
        };

        switch (currentView) {
            case 'detail': return <WorkoutDetail workout={selectedWorkout} onStart={() => startWorkout(selectedWorkout)} onBack={backToList} />;
            case 'session': return <WorkoutSession workout={selectedWorkout} currentExerciseIndex={currentExerciseIndex} onNext={nextExercise} onEnd={endWorkout} />;
            case 'history': return <History history={workoutHistory} onBack={backToList} />;
            case 'complete': return <Complete onBack={backToList} onViewHistory={fetchHistory} />;
            case 'generator': return <Generator onWorkoutGenerated={handleWorkoutGenerated} onBack={backToList} />;
            case 'exercises': return <ExerciseList {...commonNavProps} />;
            case 'list': 
            default: 
                return <WorkoutList 
                            workouts={workouts} 
                            onSelectWorkout={viewWorkoutDetail}
                            {...commonNavProps}
                        />;
        }
    };
    
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 2 }}>
                {renderView()}
            </Container>
        </ThemeProvider>
    );
}