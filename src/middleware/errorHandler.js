const winston = require('winston');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
    )
  )
});

module.exports = (err, req, res, next) => {
  const requestId = req.requestId || 'N/A';
  const method = req.method || 'N/A';
  const url = req.originalUrl || 'N/A';

  // log all errors
  logger.error(`[${requestId}] ${method} ${url} - ${err.message}`);

  // map specific errors
  if (err.message === 'Invalid comic ID') {
    return res.status(400).json({ error: 'Comic ID must be a positive integer' });
  }

  if (err.message === 'Comic not found') {
    return res.status(404).json({ error: 'Comic not found' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.isOperational && err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // fallback
  res.status(500).json({ error: 'Internal Server Error' });
};
