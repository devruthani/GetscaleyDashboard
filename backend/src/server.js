import http from 'http'
import { createApp } from './app.js'
import { sequelize } from './db/sequelize.js'
import { Admin, Role } from './models/index.js'
import { config } from './config/config.js'
import { logger } from './logging/logger.js'
import { initSockets } from './sockets/index.js'
import { initJobs } from './jobs/index.js'

async function start() {
  try {
    // 1. Initialize DB schema
    if (config.env === 'development') {
      await sequelize.sync({ alter: true })
    } else {
      await sequelize.sync()
    }

    // 2. Seed a dev admin if none exists (for local testing)
    if (config.env === 'development') {
      // Seed default roles
      const [superRole] = await Role.findOrCreate({ where: { name: 'superadmin' }, defaults: { permissions: ['*'] } })
      const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { permissions: ['admin:read', 'admin:create', 'admin:update'] } })
      const count = await Admin.count()
      if (count === 0) {
        const { default: bcrypt } = await import('bcryptjs')
        const passwordHash = await bcrypt.hash('admin123', 10)
        const admin = await Admin.create({ email: 'admin@example.com', name: 'Admin', passwordHash })
        await admin.setRoles([superRole])
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
