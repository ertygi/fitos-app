// Filename: backend/server.js
// Description: Updated backend server for production deployment.
// It now serves the static React app files in addition to handling API calls.

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path'); // Import the 'path' module

const app = express();
// Render will set the PORT environment variable.
const PORT = process.env.PORT || 3001; 

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- SERVE STATIC REACT APP ---
// This section is new. It tells Express to serve the built React files.
// '__dirname' is the current directory (backend). We go up one level and then into 'frontend/build'.
console.log('Attempting to serve static files from:', path.join(__dirname, '../frontend/build'));
app.use(express.static(path.join(__dirname, '../frontend/build')));

// --- DATABASE CONNECTION ---
// The database file path needs to be correct for the server environment.
const dbPath = path.resolve(__dirname, './fitness.db');
console.log(`Connecting to database at: ${dbPath}`);
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('FATAL: Error opening database', err.message);
    } else {
        console.log('Successfully connected to the database.');
    }
});

// --- API ENDPOINTS (These remain the same) ---

// GET: Fetch all workouts
app.get('/api/workouts', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/workouts - Request received`);
    const sql = `SELECT * FROM workouts`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(`[${new Date().toISOString()}] GET /api/workouts - Database error:`, err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`[${new Date().toISOString()}] GET /api/workouts - Successfully fetched ${rows.length} workouts.`);
        res.json({ workouts: rows });
    });
});

// GET: Fetch a single workout and its exercises
app.get('/api/workouts/:id', (req, res) => {
    const workoutId = req.params.id;
    console.log(`[${new Date().toISOString()}] GET /api/workouts/${workoutId} - Request received`);
    const workoutSql = `SELECT * FROM workouts WHERE id = ?`;
    const exercisesSql = `SELECT * FROM exercises WHERE workout_id = ?`;
    let workoutData = {};
    db.get(workoutSql, [workoutId], (err, row) => {
        if (err) {
            console.error(`[${new Date().toISOString()}] GET /api/workouts/${workoutId} - Database error on workout fetch:`, err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            console.warn(`[${new Date().toISOString()}] GET /api/workouts/${workoutId} - Workout not found.`);
            res.status(404).json({ error: 'Workout not found.'});
            return;
        }
        workoutData = row;
        db.all(exercisesSql, [workoutId], (err, rows) => {
            if (err) {
                console.error(`[${new Date().toISOString()}] GET /api/workouts/${workoutId} - Database error on exercises fetch:`, err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            workoutData.exercises = rows;
            console.log(`[${new Date().toISOString()}] GET /api/workouts/${workoutId} - Successfully fetched workout and ${rows.length} exercises.`);
            res.json({ workout: workoutData });
        });
    });
});

// GET: Fetch workout history
app.get('/api/history', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/history - Request received`);
    const sql = `
        SELECT h.id, h.completed_at, w.name, w.description, w.duration
        FROM history h JOIN workouts w ON h.workout_id = w.id
        ORDER BY h.completed_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(`[${new Date().toISOString()}] GET /api/history - Database error:`, err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`[${new Date().toISOString()}] GET /api/history - Successfully fetched ${rows.length} history items.`);
        res.json({ history: rows });
    });
});

// POST: Add a workout to the history
app.post('/api/history', (req, res) => {
    const { workoutId } = req.body;
    console.log(`[${new Date().toISOString()}] POST /api/history - Request received with workoutId: ${workoutId}`);
    if (!workoutId) {
        console.warn(`[${new Date().toISOString()}] POST /api/history - Bad request: workoutId is missing.`);
        return res.status(400).json({ error: 'workoutId is required' });
    }
    const completed_at = new Date().toISOString();
    const sql = `INSERT INTO history (workout_id, completed_at) VALUES (?, ?)`;
    db.run(sql, [workoutId, completed_at], function(err) {
        if (err) {
            console.error(`[${new Date().toISOString()}] POST /api/history - Database error:`, err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`[${new Date().toISOString()}] POST /api/history - Successfully saved new history item with ID: ${this.lastID}`);
        res.status(201).json({ id: this.lastID, workout_id: workoutId, completed_at: completed_at });
    });
});

// --- CATCH-ALL ROUTE ---
// This is the final piece. It ensures that if the user refreshes the page on a
// route like '/history', the server will send back the main index.html file,
// allowing the React router to take over.
app.get('*', (req, res) => {
  console.log(`[${new Date().toISOString()}] CATCH-ALL - Serving index.html for non-API route: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
