// -----------------------------------------------------------------
// FILE: backend/routes/workouts.js (Updated)
// This version now includes the POST route to save generated workouts.
// -----------------------------------------------------------------
const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// GET all workouts (for the main list)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, description, duration FROM workouts ORDER BY id');
        res.json({ workouts: result.rows });
    } catch (err) {
        console.error("Error fetching workouts:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET a single workout with its exercises
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

// --- CORRECTED: Added the missing POST route ---
router.post('/', async (req, res) => {
    const { workout, userId } = req.body;
    if (!workout || !userId) {
        return res.status(400).json({ error: "Workout data and userId are required." });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const workoutRes = await client.query(
            `INSERT INTO workouts (name, description, duration, is_public, created_by)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [workout.name, workout.description, workout.duration, false, userId]
        );
        const newWorkoutId = workoutRes.rows[0].id;

        for (const ex of workout.exercises) {
            let exerciseResult = await client.query('SELECT id FROM exercises WHERE name = $1', [ex.name]);
            let exerciseId;

            if (exerciseResult.rows.length > 0) {
                exerciseId = exerciseResult.rows[0].id;
            } else {
                // If the exercise from Gemini doesn't exist, add it to our library
                const newExerciseRes = await client.query(
                    `INSERT INTO exercises (name, level, equipment, target_muscle)
                     VALUES ($1, $2, $3, $4) RETURNING id`,
                    [ex.name, ex.level || 'Intermediate', ex.equipment || 'Bodyweight', ex.target_muscle]
                );
                exerciseId = newExerciseRes.rows[0].id;
            }
            
            await client.query(
                'INSERT INTO workout_exercises (workout_id, exercise_id) VALUES ($1, $2)',
                [newWorkoutId, exerciseId]
            );
        }
        
        await client.query('COMMIT');
        res.status(201).json({ ...workout, id: newWorkoutId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error saving workout:", err);
        res.status(500).json({ error: 'Failed to save workout.' });
    } finally {
        client.release();
    }
});

module.exports = router;
