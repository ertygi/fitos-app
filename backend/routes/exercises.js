// -----------------------------------------------------------------
// FILE: backend/routes/exercises.js (Corrected)
// This is the definitive version for fetching, filtering, and
// paginating all exercises from the database.
// -----------------------------------------------------------------
const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

router.get('/', async (req, res) => {
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
        conditions.push(`level = $${paramIndex++}`);
        params.push(level);
    }
    if (equipment) {
        // Handle the 'Bodyweight' case which maps to 'None' in the DB from the JSON file
        const equipmentToSearch = equipment === 'Bodyweight' ? 'None' : equipment;
        conditions.push(`equipment = $${paramIndex++}`);
        params.push(equipmentToSearch);
    }
    if (muscle) {
        conditions.push(`muscle_group = $${paramIndex++}`);
        params.push(muscle);
    }
    
    if (conditions.length > 0) {
        const whereClause = ` WHERE ` + conditions.join(' AND ');
        baseQuery += whereClause;
        countQuery += whereClause;
    }

    // Use a subquery for counting to ensure it respects the filters
    const countParams = params.slice();
    
    baseQuery += ` ORDER BY name LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));
    
    try {
        const countResult = await pool.query(countQuery, countParams);
        const exercisesResult = await pool.query(baseQuery, params);
        
        const total = countResult.rows[0].total;
        
        res.json({ exercises: exercisesResult.rows, total });

    } catch (err) {
        console.error("Error fetching exercises:", err);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

module.exports = router;
