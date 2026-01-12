import dotenv from 'dotenv'
dotenv.config()

// Central configuration for the backend.
// All values can be overridden via environment variables.
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),

  // CORS - limit origins in production
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),

  // Rate limiting settings
  rateLimit: {
    windowMs: Number(process.env.RATE_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
    max: Number(process.env.RATE_MAX || 100), // limit each IP
  },

  // IP allowlist - if empty, allow all
  ipAllowlist: (process.env.IP_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean),

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-env',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  // Database configuration. Defaults to SQLite for local dev.
  db: {
    dialect: process.env.DB_DIALECT || 'sqlite', // 'sqlite' | 'postgres' | 'mysql' | 'mariadb' | 'mssql'
    storage: (process.env.NODE_ENV === 'test') ? ':memory:' : (process.env.DB_STORAGE || './data/dev.sqlite'), // only used for sqlite
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'getscaley',
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },

  // Email Configuration (SMTP)
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASS || 'password',
    },
    from: process.env.EMAIL_FROM || '"GetScaley Team" <no-reply@example.com>',
  },

  // Socket.io Configuration
  socket: {
    pingTimeout: Number(process.env.SOCKET_PING_TIMEOUT || 60000),
    pingInterval: Number(process.env.SOCKET_PING_INTERVAL || 25000),
    corsOrigins: (process.env.SOCKET_CORS_ORIGINS || process.env.CORS_ORIGINS || '*').split(','),
  },

  // Cron Jobs Configuration
  jobs: {
    enabled: process.env.JOBS_ENABLED !== 'false', // Enabled by default
    timezone: process.env.JOBS_TIMEZONE || 'UTC',
  },
}
