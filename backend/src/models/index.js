import { Admin } from './Admin.js'
import { ActivityLog } from './ActivityLog.js'
import { Role } from './Role.js'
import { AdminRole } from './AdminRole.js'

// Define associations
ActivityLog.belongsTo(Admin, { foreignKey: 'adminId' })
Admin.hasMany(ActivityLog, { foreignKey: 'adminId' })

// Roles associations
Admin.belongsToMany(Role, { through: AdminRole, foreignKey: 'adminId', as: 'roles' })
Role.belongsToMany(Admin, { through: AdminRole, foreignKey: 'roleId', as: 'admins' })

export { Admin, ActivityLog, Role, AdminRole }
