const express = require('express');
const { body } = require('express-validator');
const partnerController = require('../controllers/partnerController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Public consent endpoints (no auth required)
router.get('/consent/:token/accept', partnerController.acceptConsent);
router.get('/consent/:token/decline', partnerController.declineConsent);

// Authenticated routes
router.use(authMiddleware);

// POST /api/partners
router.post(
    '/',
    [
        body('partnerEmail').isEmail().withMessage('Valid partner email is required'),
        body('partnerName').optional().trim().isLength({ max: 100 }),
    ],
    validate,
    partnerController.addPartner
);

// GET /api/partners
router.get('/', partnerController.getPartners);

// DELETE /api/partners/:id
router.delete('/:id', partnerController.removePartner);

module.exports = router;
