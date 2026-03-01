const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/register
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain at least one number'),
        body('displayName')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Display name must be 2-100 characters'),
    ],
    validate,
    authController.register
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    authController.login
);

// GET /api/auth/profile
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
