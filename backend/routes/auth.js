const express = require('express');
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
            [name, email, hashedPassword]
        );

        res.status(201).json(newUser.rows[0]);

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'A user with this email already exists.' });
        }
        console.error("Error registering user:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }

    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;