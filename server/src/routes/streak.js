const express = require('express');
const streakController = require('../controllers/streakController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All streak routes require authentication
router.use(authMiddleware);

// GET /api/streak
router.get('/', streakController.getStreak);

// POST /api/streak/checkin
router.post('/checkin', streakController.checkin);

// POST /api/streak/relapse
router.post('/relapse', streakController.logRelapse);

// GET /api/streak/history
router.get('/history', streakController.getRelapseHistory);

// GET /api/streak/checkins
router.get('/checkins', streakController.getCheckinHistory);

// GET /api/streak/analytics
router.get('/analytics', streakController.getAnalytics);

module.exports = router;
