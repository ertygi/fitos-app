const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

router.post('/', async (req, res) => {
    const { workoutId, userId } = req.body;
    if (!workoutId || !userId) {
        return res.status(400).json({ error: 'workoutId and userId are required' });
    }
    try {
        const newHistory = await pool.query(
            'INSERT INTO history (workout_id, user_id, completed_at) VALUES ($1, $2, NOW()) RETURNING *',
            [workoutId, userId]
        );
        res.status(201).json(newHistory.rows[0]);
    } catch (err) {
        console.error("Error saving history:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;