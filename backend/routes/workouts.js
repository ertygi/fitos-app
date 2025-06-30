const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// GET all workouts (top level info only)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, description, duration FROM workouts ORDER BY id');
        res.json({ workouts: result.rows });
    } catch (err) {
        console.error("Error fetching workouts:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET a single workout with its full exercise details using a JOIN
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const workoutRes = await pool.query('SELECT * FROM workouts WHERE id = $1', [id]);
        if (workoutRes.rows.length === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        
        const exercisesRes = await pool.query(`
            SELECT e.* FROM exercises e
            JOIN workout_exercises we ON e.id = we.exercise_id
            WHERE we.workout_id = $1
        `, [id]);

        const workoutData = { ...workoutRes.rows[0], exercises: exercisesRes.rows };
        res.json({ workout: workoutData });
    } catch (err) {
        console.error(`Error fetching workout details for id ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;