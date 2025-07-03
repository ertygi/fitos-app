import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const API_URL = process.env.REACT_APP_API_URL || '';

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); 
    const [currentView, setCurrentView] = useState('login');
    
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Persistent Login Check
    useEffect(() => {
        const storedUser = localStorage.getItem('fitos-user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
            setCurrentView('list');
        }
        setIsLoading(false);
    }, []);

    // Fetch workouts when user logs in or view changes to 'list'
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

     const handleWorkoutGenerated = (formData) => {
         setIsLoading(true);
         setError(null);
         fetch(`${API_URL}/api/generate-workout`, {
             method: 'POST', headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(formData)
         })
         .then(res => {
             if (!res.ok) { return res.json().then(err => { throw new Error(err.error || 'Failed to generate workout.') }); }
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

    const value = {
        currentUser,
        currentView,
        workouts,
        selectedWorkout,
        workoutHistory,
        currentExerciseIndex,
        isLoading,
        error,
        handleLogin,
        handleLogout,
        fetchHistory,
        viewWorkoutDetail,
        startWorkout,
        endWorkout,
        backToList,
        nextExercise,
        handleWorkoutGenerated,
        setCurrentView,
        setError
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};