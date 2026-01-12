import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class AdminRole extends Model {}

AdminRole.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  adminId: { type: DataTypes.INTEGER, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  sequelize,
  modelName: 'AdminRole',
  tableName: 'admin_roles',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['adminId', 'roleId'] },
  ],
})

