import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { Admin } from '../models/Admin.js'

// Verifies JWT and attaches admin to request
export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Missing token' })
    const payload = jwt.verify(token, config.jwt.secret)
    const admin = await Admin.findByPk(payload.sub)
    if (!admin) return res.status(401).json({ message: 'Invalid token' })
    req.admin = admin
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

