import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class Role extends Model {}

Role.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  permissions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
  timestamps: true,
})

