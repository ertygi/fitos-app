const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// GET all users (for login screen)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET workout history for a specific user
router.get('/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT h.id, h.completed_at, w.name, w.description, w.duration 
            FROM history h 
            JOIN workouts w ON h.workout_id = w.id 
            WHERE h.user_id = $1
            ORDER BY h.completed_at DESC
        `, [id]);
        res.json({ history: result.rows });
    } catch (err) {
        console.error(`Error fetching history for user ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;