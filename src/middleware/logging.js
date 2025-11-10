const winston = require('winston');

// create a simple console logger
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

// middleware
module.exports = (req, res, next) => {
  req.requestId = Math.random().toString(36).substr(2, 9);
  req.startTime = Date.now();

  logger.info(
    `[${req.requestId}] ${req.method} ${req.url} - ${req.ip} - ${req.headers['user-agent']}`
  );

  next();
};
