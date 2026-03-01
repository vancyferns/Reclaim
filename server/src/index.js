const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const { initSQL } = require('./config/initDb');
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const streakRoutes = require('./routes/streak');
const emergencyRoutes = require('./routes/emergency');
const partnerRoutes = require('./routes/partner');

const app = express();

// ─── Security Middleware ──────────────────────
app.use(helmet());
app.use(cors({
    origin: config.clientUrl,
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/partners', partnerRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ─── Error Handling ───────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: config.nodeEnv === 'production'
            ? 'An unexpected error occurred.'
            : err.message,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

// ─── Server Startup ──────────────────────────
async function startServer() {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected');

        // Initialize schema
        await pool.query(initSQL);
        console.log('✅ Database schema initialized');

        app.listen(config.port, () => {
            console.log(`\n🚀 Reclaim server running on port ${config.port}`);
            console.log(`   Environment: ${config.nodeEnv}`);
            console.log(`   Client URL:  ${config.clientUrl}\n`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();

module.exports = app;
