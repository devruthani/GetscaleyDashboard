import useragent from 'express-useragent'
import { ActivityLog } from '../models/ActivityLog.js'

// Logs route access and key actions for auditing
export function activityLogger(req, res, next) {
  req.activityStart = Date.now()
  next()
  res.on('finish', async () => {
    try {
      const ua = useragent.parse(req.headers['user-agent'] || '')
      await ActivityLog.create({
        adminId: req.admin?.id || null,
        action: `${req.method} ${req.path}`,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: `${ua.browser} ${ua.version}; ${ua.os}`,
        metadata: {
          statusCode: res.statusCode,
          durationMs: Date.now() - req.activityStart,
        },
      })
    } catch (e) {
      // Swallow logging errors; never block requests
    }
  })
}

