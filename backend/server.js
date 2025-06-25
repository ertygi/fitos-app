// Filename: backend/server.js
// Description: This is the main backend server that connects to the SQLite database
// and provides API endpoints for the React frontend to consume.

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001; // We'll run the backend on this port

// --- MIDDLEWARE ---
app.use(cors()); // Allows requests from our React app (which will run on port 3000)
app.use(express.json()); // Allows the server to understand JSON formatted request bodies

// --- DATABASE CONNECTION ---
// Connect to the SQLite database file.
const db = new sqlite3.Database('./fitness.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Successfully connected to the database.');
    }
});

// --- API ENDPOINTS ---

// GET: Fetch all workouts
// Example URL: http://localhost:3001/api/workouts
app.get('/api/workouts', (req, res) => {
    const sql = `SELECT * FROM workouts`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ workouts: rows });
    });
});

// GET: Fetch a single workout and its exercises
// Example URL: http://localhost:3001/api/workouts/1
app.get('/api/workouts/:id', (req, res) => {
    const workoutId = req.params.id;
    const workoutSql = `SELECT * FROM workouts WHERE id = ?`;
    const exercisesSql = `SELECT * FROM exercises WHERE workout_id = ?`;

    // Use a Promise to handle nested database calls cleanly
    let workoutData = {};

    new Promise((resolve, reject) => {
        db.get(workoutSql, [workoutId], (err, row) => {
            if (err) reject(err);
            if (!row) {
                res.status(404).json({ error: 'Workout not found.' });
                return;
            }
            workoutData = row;
            resolve();
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            db.all(exercisesSql, [workoutId], (err, rows) => {
                if (err) reject(err);
                workoutData.exercises = rows;
                resolve();
            });
        });
    }).then(() => {
        res.json({ workout: workoutData });
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// GET: Fetch workout history
// Example URL: http://localhost:3001/api/history
app.get('/api/history', (req, res) => {
    // Join history with workouts to get workout names
    const sql = `
        SELECT 
            h.id, 
            h.completed_at, 
            w.name, 
            w.description,
            w.duration
        FROM history h
        JOIN workouts w ON h.workout_id = w.id
        ORDER BY h.completed_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ history: rows });
    });
});

// POST: Add a workout to the history
// Example URL: http://localhost:3001/api/history
// Request Body: { "workoutId": 1 }
app.post('/api/history', (req, res) => {
    const { workoutId } = req.body;
    if (!workoutId) {
        return res.status(400).json({ error: 'workoutId is required' });
    }

    const completed_at = new Date().toISOString();
    const sql = `INSERT INTO history (workout_id, completed_at) VALUES (?, ?)`;
    
    db.run(sql, [workoutId, completed_at], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Return the newly created history item
        res.status(201).json({ 
            id: this.lastID, 
            workout_id: workoutId,
            completed_at: completed_at 
        });
    });
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

