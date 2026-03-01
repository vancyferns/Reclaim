const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const config = require('../config/env');

const SALT_ROUNDS = 12;

exports.register = async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, created_at`,
            [email.toLowerCase(), passwordHash, displayName]
        );

        const user = result.rows[0];

        // Initialize streak record
        await pool.query(
            `INSERT INTO streaks (user_id, current_streak, longest_streak, start_date)
       VALUES ($1, 0, 0, NOW())`,
            [user.id]
        );

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.status(201).json({
            message: 'Account created successfully.',
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                createdAt: user.created_at,
            },
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query(
            'SELECT id, email, password_hash, display_name, created_at FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                createdAt: user.created_at,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.email, u.display_name, u.created_at,
              s.current_streak, s.longest_streak, s.last_checkin, s.start_date
       FROM users u
       LEFT JOIN streaks s ON s.user_id = u.id
       WHERE u.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const row = result.rows[0];

        // Count total relapses
        const relapseCount = await pool.query(
            'SELECT COUNT(*) as count FROM relapses WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            user: {
                id: row.id,
                email: row.email,
                displayName: row.display_name,
                createdAt: row.created_at,
                streak: {
                    current: row.current_streak,
                    longest: row.longest_streak,
                    lastCheckin: row.last_checkin,
                    startDate: row.start_date,
                },
                totalRelapses: parseInt(relapseCount.rows[0].count, 10),
            },
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'An error occurred fetching profile.' });
    }
};
