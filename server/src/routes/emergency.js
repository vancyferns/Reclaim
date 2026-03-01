const express = require('express');
const emergencyController = require('../controllers/emergencyController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// POST /api/emergency/start
router.post('/start', emergencyController.startEmergency);

// PUT /api/emergency/:sessionId/complete
router.put('/:sessionId/complete', emergencyController.completeEmergency);

// GET /api/emergency/history
router.get('/history', emergencyController.getEmergencyHistory);

// GET /api/emergency/motivation
router.get('/motivation', emergencyController.getMotivation);

module.exports = router;
