/**
 * Simple timestamped logger utility
 */
const logger = {
    info: (message, data = '') => {
        console.log(`[${new Date().toISOString()}] ℹ️  ${message}`, data);
    },
    warn: (message, data = '') => {
        console.warn(`[${new Date().toISOString()}] ⚠️  ${message}`, data);
    },
    error: (message, data = '') => {
        console.error(`[${new Date().toISOString()}] ❌ ${message}`, data);
    },
    success: (message, data = '') => {
        console.log(`[${new Date().toISOString()}] ✅ ${message}`, data);
    }
};

module.exports = logger;
