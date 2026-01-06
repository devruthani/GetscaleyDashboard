import http from 'http'
import { createApp } from './app.js'
import { sequelize } from './db/sequelize.js'
import { Admin } from './models/Admin.js'
import { config } from './config/config.js'
import { logger } from './logging/logger.js'
import { initSockets } from './sockets/index.js'
import { initJobs } from './jobs/index.js'

async function start() {
  try {
    // 1. Initialize DB schema
    await sequelize.sync()

    // 2. Seed a dev admin if none exists (for local testing)
    if (config.env === 'development') {
      const count = await Admin.count()
      if (count === 0) {
        const { default: bcrypt } = await import('bcryptjs')
        const passwordHash = await bcrypt.hash('admin123', 10)
        await Admin.create({ email: 'admin@example.com', name: 'Admin', passwordHash, role: 'superadmin' })
        logger.info({ message: 'Seeded default admin: admin@example.com / admin123' })
      }
    }

    // 3. Create Express App
    const app = createApp()

    // 4. Create HTTP Server (needed for Socket.io)
    const server = http.createServer(app)

    // 5. Initialize Socket.io
    initSockets(server)
    logger.info({ message: 'Socket.io initialized' })

    // 6. Initialize Cron Jobs
    initJobs()

    // 7. Start Server
    server.listen(config.port, () => {
      logger.info({ message: `Server listening on http://localhost:${config.port}` })
      logger.info({ message: `Swagger docs at http://localhost:${config.port}/docs` })
    })
  } catch (err) {
    logger.error({ message: err.message, stack: err.stack })
    process.exit(1)
  }
}

start()
