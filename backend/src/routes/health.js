import express from 'express'
export const healthRouter = express.Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OK
 */
healthRouter.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

