require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routers
const usersRouter = require('./routes/users.js');
const workoutsRouter = require('./routes/workouts.js');
const exercisesRouter = require('./routes/exercises.js');
const historyRouter = require('./routes/history.js');
const generatorRouter = require('./routes/generator.js');
const authRouter = require('./routes/auth.js'); // <-- IMPORT NEW ROUTER

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));


// --- API ROUTES ---
// Mount the routers on their respective paths
app.use('/api/auth', authRouter); // <-- USE NEW ROUTER
app.use('/api/users', usersRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/history', historyRouter);
app.use('/api/generate-workout', generatorRouter); 


// --- CATCH-ALL FOR FRONTEND ROUTING ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});