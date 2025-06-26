const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- DATABASE CONNECTION ---
const dbPath = path.resolve(__dirname, './fitness.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('FATAL: Error opening database', err.message);
    } else {
        console.log('Successfully connected to the database.');
    }
});

// --- API ENDPOINTS ---
app.get('/api/workouts', (req, res) => {
    const workoutsSql = `SELECT * FROM workouts`;
    const exercisesSql = `SELECT * FROM exercises`;

    db.all(workoutsSql, [], (err, workouts) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        
        // This endpoint sends only top-level workout info now
        res.json({ workouts: workouts });
    });
});

app.get('/api/workouts/:id', (req, res) => {
    const workoutId = req.params.id;
    const workoutSql = `SELECT * FROM workouts WHERE id = ?`;
    const exercisesSql = `SELECT * FROM exercises WHERE workout_id = ?`;
    let workoutData = {};

    db.get(workoutSql, [workoutId], (err, row) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        if (!row) { res.status(404).json({ error: 'Workout not found.'}); return; }
        
        workoutData = row;

        db.all(exercisesSql, [workoutId], (err, exercises) => {
            if (err) { res.status(500).json({ error: err.message }); return; }
            
            const parsedExercises = exercises.map(ex => {
                try {
                    return { ...ex, video_urls: JSON.parse(ex.video_urls || '[]') };
                } catch (e) {
                    return { ...ex, video_urls: [] };
                }
            });

            workoutData.exercises = parsedExercises;
            res.json({ workout: workoutData });
        });
    });
});

app.get('/api/history', (req, res) => {
    const sql = `
        SELECT h.id, h.completed_at, w.name, w.description, w.duration
        FROM history h JOIN workouts w ON h.workout_id = w.id
        ORDER BY h.completed_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ history: rows });
    });
});

app.post('/api/history', (req, res) => {
    const { workoutId } = req.body;
    if (!workoutId) { return res.status(400).json({ error: 'workoutId is required' }); }
    const completed_at = new Date().toISOString();
    const sql = `INSERT INTO history (workout_id, completed_at) VALUES (?, ?)`;
    db.run(sql, [workoutId, completed_at], function(err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.status(201).json({ id: this.lastID, workout_id: workoutId, completed_at: completed_at });
    });
});

// --- EXPORT FOR VERCEL ---
module.exports = app;