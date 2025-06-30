require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// --- DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));


// --- API ENDPOINTS ---

app.get('/api/workouts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM workouts ORDER BY id');
        res.json({ workouts: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/workouts/:id', async (req, res) => {
    // ... (This endpoint is unchanged)
});

// --- NEW ENDPOINT with filtering, search, and pagination ---
app.get('/api/exercises', async (req, res) => {
    const { search = '', level, equipment, muscle, limit = 50, offset = 0 } = req.query;

    let baseQuery = `SELECT * FROM exercises`;
    let countQuery = `SELECT COUNT(*) as total FROM exercises`;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
        conditions.push(`name ILIKE $${paramIndex++}`);
        params.push(`%${search}%`);
    }
    if (level) {
        conditions.push(`difficulty = $${paramIndex++}`);
        params.push(level);
    }
    if (equipment) {
        conditions.push(`equipment = $${paramIndex++}`);
        params.push(equipment);
    }
    if (muscle) {
        conditions.push(`target_muscles LIKE $${paramIndex++}`);
        params.push(`%${muscle}%`);
    }
    
    if (conditions.length > 0) {
        const whereClause = ` WHERE ` + conditions.join(' AND ');
        baseQuery += whereClause;
        countQuery += whereClause;
    }

    // Add pagination to the main query
    baseQuery += ` ORDER BY name LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));

    try {
        // Execute both queries
        const totalResult = await pool.query(countQuery, params.slice(0, paramIndex - 3));
        const exercisesResult = await pool.query(baseQuery, params);

        const total = totalResult.rows[0].total;
        const exercises = exercisesResult.rows.map(ex => ({
            ...ex,
            video_urls: JSON.parse(ex.video_urls || '[]'),
            target_muscles: JSON.parse(ex.target_muscles || '[]'),
        }));
        
        res.json({ exercises, total });

    } catch (err) {
        console.error("Error fetching exercises:", err);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});


app.get('/api/history', async (req, res) => { /* ... (endpoint unchanged) ... */ });
app.post('/api/history', async (req, res) => { /* ... (endpoint unchanged) ... */ });


// --- CATCH-ALL FOR FRONTEND ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});