const pool = require('../config/database');

// Get current streak info
exports.getStreak = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT current_streak, longest_streak, last_checkin, start_date, updated_at
       FROM streaks WHERE user_id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Streak record not found.' });
        }

        const streak = result.rows[0];

        // Calculate days since last check-in
        const now = new Date();
        const lastCheckin = new Date(streak.last_checkin);
        const diffMs = now - lastCheckin;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // If more than 1 day since last check-in without relapse, auto-advance streak
        if (diffDays >= 1) {
            const newStreak = streak.current_streak + diffDays;
            const newLongest = Math.max(newStreak, streak.longest_streak);

            await pool.query(
                `UPDATE streaks SET current_streak = $1, longest_streak = $2,
         last_checkin = NOW(), updated_at = NOW()
         WHERE user_id = $3`,
                [newStreak, newLongest, req.user.id]
            );

            return res.json({
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastCheckin: now,
                startDate: streak.start_date,
            });
        }

        res.json({
            currentStreak: streak.current_streak,
            longestStreak: streak.longest_streak,
            lastCheckin: streak.last_checkin,
            startDate: streak.start_date,
        });
    } catch (err) {
        console.error('Get streak error:', err);
        res.status(500).json({ error: 'Failed to fetch streak data.' });
    }
};

// Daily check-in to advance streak
exports.checkin = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT current_streak, longest_streak, last_checkin FROM streaks WHERE user_id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Streak record not found.' });
        }

        const streak = result.rows[0];
        const newStreak = streak.current_streak + 1;
        const newLongest = Math.max(newStreak, streak.longest_streak);

        await pool.query(
            `UPDATE streaks SET current_streak = $1, longest_streak = $2,
       last_checkin = NOW(), updated_at = NOW()
       WHERE user_id = $3`,
            [newStreak, newLongest, req.user.id]
        );

        res.json({
            message: 'Check-in recorded! Keep going 💪',
            currentStreak: newStreak,
            longestStreak: newLongest,
        });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Failed to record check-in.' });
    }
};

// Log a relapse (resets current streak)
exports.logRelapse = async (req, res) => {
    try {
        const { notes, triggerCategory, moodBefore, moodAfter } = req.body;

        // Insert relapse record
        await pool.query(
            `INSERT INTO relapses (user_id, notes, trigger_category, mood_before, mood_after)
       VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, notes || null, triggerCategory || null, moodBefore || null, moodAfter || null]
        );

        // Reset current streak
        await pool.query(
            `UPDATE streaks SET current_streak = 0, start_date = NOW(),
       last_checkin = NOW(), updated_at = NOW()
       WHERE user_id = $1`,
            [req.user.id]
        );

        // Get updated streak info
        const streakResult = await pool.query(
            `SELECT current_streak, longest_streak FROM streaks WHERE user_id = $1`,
            [req.user.id]
        );

        // Count total relapses
        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM relapses WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            message: 'Relapse logged. Remember: every moment is a new beginning. 🌱',
            currentStreak: 0,
            longestStreak: streakResult.rows[0].longest_streak,
            totalRelapses: parseInt(countResult.rows[0].count, 10),
        });
    } catch (err) {
        console.error('Log relapse error:', err);
        res.status(500).json({ error: 'Failed to log relapse.' });
    }
};

// Get relapse history
exports.getRelapseHistory = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const offset = parseInt(req.query.offset, 10) || 0;

        const result = await pool.query(
            `SELECT id, timestamp, notes, trigger_category, mood_before, mood_after
       FROM relapses WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM relapses WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            relapses: result.rows,
            total: parseInt(countResult.rows[0].count, 10),
            limit,
            offset,
        });
    } catch (err) {
        console.error('Get relapse history error:', err);
        res.status(500).json({ error: 'Failed to fetch relapse history.' });
    }
};

// Get streak analytics (weekly/monthly summary)
exports.getAnalytics = async (req, res) => {
    try {
        // Relapses in the last 30 days grouped by day
        const dailyRelapses = await pool.query(
            `SELECT DATE(timestamp) as date, COUNT(*) as count
       FROM relapses WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '30 days'
       GROUP BY DATE(timestamp) ORDER BY date`,
            [req.user.id]
        );

        // Trigger category breakdown
        const triggerBreakdown = await pool.query(
            `SELECT trigger_category, COUNT(*) as count
       FROM relapses WHERE user_id = $1 AND trigger_category IS NOT NULL
       GROUP BY trigger_category ORDER BY count DESC`,
            [req.user.id]
        );

        // Mood averages
        const moodAvg = await pool.query(
            `SELECT AVG(mood_before) as avg_mood_before, AVG(mood_after) as avg_mood_after
       FROM relapses WHERE user_id = $1 AND mood_before IS NOT NULL`,
            [req.user.id]
        );

        // Streak info
        const streak = await pool.query(
            `SELECT current_streak, longest_streak, start_date FROM streaks WHERE user_id = $1`,
            [req.user.id]
        );

        // Total relapses
        const total = await pool.query(
            'SELECT COUNT(*) as count FROM relapses WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            streak: streak.rows[0] || {},
            totalRelapses: parseInt(total.rows[0].count, 10),
            dailyRelapses: dailyRelapses.rows,
            triggerBreakdown: triggerBreakdown.rows,
            moodAverages: moodAvg.rows[0] || {},
        });
    } catch (err) {
        console.error('Get analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
};
