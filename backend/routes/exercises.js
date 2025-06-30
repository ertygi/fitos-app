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
        conditions.push(`difficulty = $${paramIndex++}`);
        params.push(level);
    }
    if (equipment) {
        conditions.push(`equipment = $${paramIndex++}`);
        params.push(equipment);
    }
    if (muscle) {
        // Use the @> operator for JSONB contains
        conditions.push(`target_muscles @> $${paramIndex++}`);
        params.push(JSON.stringify([muscle]));
    }
    
    if (conditions.length > 0) {
        const whereClause = ` WHERE ` + conditions.join(' AND ');
        baseQuery += whereClause;
        countQuery += whereClause;
    }

    baseQuery += ` ORDER BY name LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));
    
    try {
        const totalResult = await pool.query(countQuery, params.slice(0, paramIndex - 3));
        const exercisesResult = await pool.query(baseQuery, params);
        
        const total = totalResult.rows[0].total;
        res.json({ exercises: exercisesResult.rows, total });

    } catch (err) {
        console.error("Error fetching exercises:", err);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

module.exports = router;