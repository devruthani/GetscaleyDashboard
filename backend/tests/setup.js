import { sequelize } from '../src/db/sequelize.js'
import { logger } from '../src/logging/logger.js'

// Silence logs during tests
logger.transports.forEach((t) => (t.silent = true))

beforeAll(async () => {
  // Use a separate in-memory DB or test file for isolation
  // For SQLite, ':memory:' is fast
  if (process.env.NODE_ENV === 'test') {
    // Re-sync to ensure clean slate
    await sequelize.sync({ force: true })
  }
})

afterAll(async () => {
  await sequelize.close()
})
