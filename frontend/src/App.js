import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Alert } from '@mui/material';

// ... (other imports remain the same)
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

    useEffect(() => {
        const storedUser = localStorage.getItem('fitos-user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
            setCurrentView('list');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (currentUser) {
            setIsLoading(true);
            fetch(`${API_URL}/api/workouts`)
                .then(res => res.json())
                .then(data => { 
                    setWorkouts(data.workouts); 
                })
                .catch(err => setError('Failed to fetch workouts.'))
                .finally(() => setIsLoading(false));
        }
    }, [currentUser]);

    const handleDeleteWorkout = async (workoutId) => {
        try {
            const response = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to delete workout.');
            }
            setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
            alert('Workout deleted successfully.');

        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogin = (user) => {
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
        fetch(`${API_URL}/api/workouts/${workout.id}`)
             .then(res => res.json())
             .then(data => {
                setSelectedWorkout(data.workout);
                setIsLoading(false);
                setCurrentView('detail');
             })
             .catch(err => {
                 setError('Failed to fetch workout details.');
                 setIsLoading(false);
             });
    };
    const saveWorkout = async (workoutToSave) => { /* ... */ };
    const startWorkout = (workoutToStart) => { 
        setSelectedWorkout(workoutToStart);
        setCurrentExerciseIndex(0); 
        setCurrentView('session'); 
    };
    const handleWorkoutGenerated = (formData) => { /* ... */ };
    const endWorkout = () => { /* ... */ };
    const nextExercise = () => { /* ... */ };
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
                            currentUser={currentUser}
                            onDeleteWorkout={handleDeleteWorkout}
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