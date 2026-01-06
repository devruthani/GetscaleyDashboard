import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db/sequelize.js'

// ActivityLog captures key actions for audit trails
export class ActivityLog extends Model {}

ActivityLog.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  adminId: { type: DataTypes.INTEGER, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false },
  path: { type: DataTypes.STRING, allowNull: false },
  ip: { type: DataTypes.STRING, allowNull: false },
  userAgent: { type: DataTypes.STRING, allowNull: false },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, {
  sequelize,
  modelName: 'ActivityLog',
  tableName: 'activity_logs',
  timestamps: true,
})

