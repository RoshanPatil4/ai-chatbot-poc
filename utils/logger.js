// logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/chat-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/chat-combined.log' }),
    new winston.transports.Console() // log to console during development
  ],
});
