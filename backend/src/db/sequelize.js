import { Sequelize } from 'sequelize'
import { config } from '../config/config.js'

// Initialize Sequelize based on config. Defaults to SQLite file for local dev.
let sequelize
if (config.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.storage,
    logging: config.db.logging,
  })
} else {
  sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.db.logging,
  })
}

export { sequelize }

