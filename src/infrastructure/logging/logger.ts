import winston from 'winston';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Formato de consola para desarrollo: limpio, profesional y legible sin volcado de metadatos repetitivos
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const extraMeta = { ...metadata };
  delete extraMeta.service;

  let msg = `[${timestamp}] [${level}] ${message}`;

  if (Object.keys(extraMeta).length > 0) {
    msg += ` ${JSON.stringify(extraMeta)}`;
  }

  if (stack) {
    msg += `\n${stack}`;
  }

  return msg;
});

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    isProduction ? json() : consoleFormat,
  ),
  defaultMeta: { service: 'bl-fragancias-backend' },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? json()
        : combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            consoleFormat,
          ),
    }),
  ],
});
