// backend/middleware/requestLogger.js
const config = require('config');
const winston = require('winston'); // A robust logging library is standard

// Set up a simple logger (in a real app, this would be more detailed)
const logger = winston.createLogger({
    level: config.get('server.logLevel') || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

/**
 * Express middleware to log details of incoming requests.
 */
const requestLogger = (req, res, next) => {
    // Only log API calls if the configuration allows it (e.g., in development)
    if (config.get('security.logApiCalls')) {
        logger.info('Incoming Request', {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            timestamp: new Date().toISOString(),
            // Log body or query params safely
            bodyKeys: Object.keys(req.body).join(','),
            queryKeys: Object.keys(req.query).join(',')
        });
    }
    next();
};

module.exports = requestLogger;