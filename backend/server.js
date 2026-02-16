require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { initMailer } = require('./utils/mailer');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth');
const inviteRoutes = require('./routes/invite');
const transactionRoutes = require('./routes/transaction');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow exact matches and Vercel preview URLs
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));
app.use(apiLimiter);

// --- Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check (supports both /health and /api/health for Render)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', err.message);
    res.status(500).json({ message: 'Internal server error' });
});

// --- Start Server ---
const startServer = async () => {
    try {
        await connectDB();
        await initMailer();

        app.listen(PORT, () => {
            logger.success(`🛡️  ElderGuard backend running on port ${PORT}`);
            logger.info(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
    } catch (error) {
        logger.error('Failed to start server', error.message);
        process.exit(1);
    }
};

startServer();
