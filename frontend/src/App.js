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
import Register from './components/Register.js';
import Generator from './components/Generator.js'; 
import Header from './components/common/Header.js';
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
    h4: { fontWeight: 700 }, h5: { fontWeight: 700 },
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Effect for persistent login
    useEffect(() => {
        const storedUser = localStorage.getItem('fitos-user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
            setCurrentView('list');
        }
        setIsLoading(false);
    }, []);

    // Effect to fetch workouts once after a user logs in
    useEffect(() => {
        if (currentUser) {
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
    }, [currentUser]);

    const handleLogin = (user) => {
        localStorage.setItem('fitos-user', JSON.stringify(user));
        setCurrentUser(user);
        setCurrentView('list');
    };

    const handleLogout = () => {
        localStorage.removeItem('fitos-user');
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
        // DEBUG: Log the data received from the API
        console.log("--- App.js: Fetching workout details ---");
        fetch(`${API_URL}/api/workouts/${workout.id}`)
            .then(res => res.json())
            .then(data => {
                console.log("--- App.js: Data received from API ---", data);
                setSelectedWorkout(data.workout);
                setIsLoading(false);
                setCurrentView('detail');
            })
            .catch(err => {
                console.error("--- App.js: Error fetching details ---", err);
                setError('Failed to fetch workout details.');
                setIsLoading(false);
            });
    };

    const saveWorkout = async (workoutToSave) => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/workouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workout: workoutToSave, userId: currentUser.id })
            });
            const savedWorkout = await response.json();
            if (!response.ok) {
                throw new Error(savedWorkout.error || 'Failed to save workout.');
            }
            alert('Workout saved successfully!');
            setWorkouts(prev => [...prev, { ...savedWorkout, exercises: undefined }]);
            setCurrentView('list');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const startWorkout = (workoutToStart) => { 
        setSelectedWorkout(workoutToStart);
        setCurrentExerciseIndex(0); 
        setCurrentView('session'); 
    };

    const handleWorkoutGenerated = (formData) => {
        setIsLoading(true);
        setError(null);
        
        fetch(`${API_URL}/api/generate-workout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, userId: currentUser.id })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.error || 'Failed to generate workout.') });
            }
            return res.json();
        })
        .then(data => {
            setSelectedWorkout(data.workout);
            setCurrentView('detail'); 
        })
        .catch(err => {
            setError(err.message);
            setCurrentView('generator'); 
        })
        .finally(() => setIsLoading(false));
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

    const nextExercise = () => {
        if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        } else {
            endWorkout();
        }
    };

    const backToList = () => { 
        setSelectedWorkout(null); 
        setCurrentExerciseIndex(0); 
        setCurrentView('list'); 
        setError(null); 
    };

    const renderMainView = () => {
        if (isLoading) return <Loading />;

        switch (currentView) {
            case 'detail': return <WorkoutDetail workout={selectedWorkout} onStart={() => startWorkout(selectedWorkout)} onBack={backToList} onSave={saveWorkout} onRegenerate={() => setCurrentView('generator')}/>;
            case 'session': return <WorkoutSession workout={selectedWorkout} currentExerciseIndex={currentExerciseIndex} onNext={nextExercise} onEnd={endWorkout} />;
            case 'history': return <History history={workoutHistory} onBack={backToList} />;
            case 'complete': return <Complete onBack={backToList} onViewHistory={fetchHistory} />;
            case 'generator': return <Generator onWorkoutGenerated={handleWorkoutGenerated} onBack={backToList} />;
            case 'exercises': return <ExerciseList />;
            case 'list': 
            default: 
                return <WorkoutList 
                            workouts={workouts} 
                            onSelectWorkout={viewWorkoutDetail}
                            onNavigateToExercises={() => setCurrentView('exercises')}
                        />;
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container maxWidth="md" sx={{ py: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                
                {!currentUser ? (
                    currentView === 'register' ?
                    <Register onRegisterSuccess={() => setCurrentView('login')} onBackToLogin={() => setCurrentView('login')} /> :
                    <Login onLogin={handleLogin} onNavigateToRegister={() => setCurrentView('register')} />
                ) : (
                    <>
                        <Header 
                            currentUser={currentUser} 
                            onLogout={handleLogout}
                            onNavigateToWorkouts={() => setCurrentView('list')}
                            onNavigateToGenerator={() => setCurrentView('generator')}
                            onNavigateToHistory={fetchHistory}
                        />
                        {renderMainView()}
                    </>
                )}
            </Container>
        </ThemeProvider>
    );
}