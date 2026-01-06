import { config } from '../config/config.js'

// Allows only IPs in the configured allowlist. If empty, allow all.
export function ipAllowlist(req, res, next) {
  if (!config.ipAllowlist.length) return next()
  const ip = req.ip || req.connection.remoteAddress
  const allowed = config.ipAllowlist.includes(ip)
  if (!allowed) {
    return res.status(403).json({ message: 'IP not allowed' })
  }
  next()
}

