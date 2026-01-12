import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db/sequelize.js'

// Admin model represents privileged users of the dashboard
export class Admin extends Model {}

Admin.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'admin' }, // e.g., 'admin', 'superadmin'
}, {
  sequelize,
  modelName: 'Admin',
  tableName: 'admins',
  timestamps: true,
})
