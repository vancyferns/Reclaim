const pool = require('../config/database');

// Log an emergency urge session
exports.startEmergency = async (req, res) => {
    try {
        const result = await pool.query(
            `INSERT INTO emergency_logs (user_id, outcome, technique)
       VALUES ($1, 'ongoing', $2)
       RETURNING id, timestamp`,
            [req.user.id, req.body.technique || 'breathing']
        );

        res.status(201).json({
            message: 'Emergency session started. You are stronger than this urge. 🛡️',
            sessionId: result.rows[0].id,
            timestamp: result.rows[0].timestamp,
        });
    } catch (err) {
        console.error('Start emergency error:', err);
        res.status(500).json({ error: 'Failed to start emergency session.' });
    }
};

// Complete an emergency session
exports.completeEmergency = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { outcome, durationS } = req.body;

        const result = await pool.query(
            `UPDATE emergency_logs SET outcome = $1, duration_s = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
            [outcome, durationS, sessionId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const messages = {
            resisted: 'You did it! The urge passed. You are in control. 🏆',
            relapsed: 'It's okay.Recovery is not linear.You showed courage by trying. 🌱',
    };

        res.json({
            message: messages[outcome] || 'Session recorded.',
            session: result.rows[0],
        });
    } catch (err) {
        console.error('Complete emergency error:', err);
        res.status(500).json({ error: 'Failed to complete session.' });
    }
};

// Get emergency session history
exports.getEmergencyHistory = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

        const result = await pool.query(
            `SELECT id, timestamp, outcome, duration_s, technique
       FROM emergency_logs WHERE user_id = $1
       ORDER BY timestamp DESC LIMIT $2`,
            [req.user.id, limit]
        );

        // Success rate
        const stats = await pool.query(
            `SELECT 
         COUNT(*) FILTER (WHERE outcome = 'resisted') as resisted,
         COUNT(*) FILTER (WHERE outcome = 'relapsed') as relapsed,
         COUNT(*) as total
       FROM emergency_logs WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({
            sessions: result.rows,
            stats: stats.rows[0],
        });
    } catch (err) {
        console.error('Get emergency history error:', err);
        res.status(500).json({ error: 'Failed to fetch emergency history.' });
    }
};

// Quick motivational prompts
exports.getMotivation = async (req, res) => {
    const prompts = [
        "This urge is temporary. You are permanent. 💪",
        "Remember why you started. Your future self will thank you.",
        "Every second you resist builds your strength.",
        "You are not your urges. You are the one who decides.",
        "Progress, not perfection. You've already come so far.",
        "The discomfort you feel now is the price of freedom.",
        "You've survived 100% of your worst moments so far.",
        "This feeling will pass. Let it wash over you like a wave.",
        "You are reclaiming control of your life, one moment at a time.",
        "Breathe. You are here. You are choosing growth.",
        "The chains of habit are too light to be felt until they are too heavy to be broken. — Warren Buffett",
        "Your brain is rewiring itself right now. Keep going.",
    ];

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    res.json({ prompt: randomPrompt });
};
