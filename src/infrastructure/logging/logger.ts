import winston from 'winston';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `[${timestamp}] [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` | Meta: ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    msg += `\nStack: ${stack}`;
  }
  return msg;
});

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    isProduction ? json() : customFormat,
  ),
  defaultMeta: { service: 'bl-fragancias-backend' },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? json()
        : combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            customFormat,
          ),
    }),
  ],
});
