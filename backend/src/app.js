import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config/config.js'
import { ipAllowlist } from './middleware/ipAllowlist.js'
import { activityLogger } from './middleware/activityLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { setupSwagger } from './swagger.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  // Security headers
  app.use(helmet())
  // CORS - allow provided origins or all in dev
  app.use(cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    credentials: true,
  }))
  // Body parsing
  app.use(express.json())

  // Logging
  app.use(morgan('combined'))

  // Rate limiting
  app.use(rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  }))

  // IP allowlist
  app.use(ipAllowlist)

  // Activity logging
  app.use(activityLogger)

  // Swagger documentation
  setupSwagger(app)

  // Routes under /api
  app.use('/api', apiRouter)

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' })
  })

  // Error handler
  app.use(errorHandler)

  return app
}

