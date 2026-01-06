import { Admin } from './Admin.js'
import { ActivityLog } from './ActivityLog.js'

// Define associations
ActivityLog.belongsTo(Admin, { foreignKey: 'adminId' })
Admin.hasMany(ActivityLog, { foreignKey: 'adminId' })

export { Admin, ActivityLog }

