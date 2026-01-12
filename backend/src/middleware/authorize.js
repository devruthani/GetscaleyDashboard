import { Role, Admin } from '../models/index.js'

export function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findByPk(req.admin.id, { include: [{ model: Role, as: 'roles' }] })
      if (!admin) return res.status(401).json({ message: 'Unauthorized' })
      const perms = new Set()
      for (const role of admin.roles || []) {
        if (Array.isArray(role.permissions)) {
          for (const p of role.permissions) perms.add(p)
        }
      }
      if (perms.has('*') || perms.has(permission)) return next()
      return res.status(403).json({ message: 'Forbidden' })
    } catch {
      return res.status(401).json({ message: 'Unauthorized' })
    }
  }
}

