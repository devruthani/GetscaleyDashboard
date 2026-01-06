import express from 'express'
import { requireAuth } from '../middleware/auth.js'

export const examplesRouter = express.Router()

/**
 * @swagger
 * /examples/public:
 *   get:
 *     summary: Public example endpoint
 *     tags: [Examples]
 *     responses:
 *       200:
 *         description: Example data
 */
examplesRouter.get('/public', (req, res) => {
  res.json({ message: 'This is a public endpoint.' })
})

/**
 * @swagger
 * /examples/protected:
 *   get:
 *     summary: Protected example endpoint
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Example data
 */
examplesRouter.get('/protected', requireAuth, (req, res) => {
  res.json({ message: `Hello ${req.admin.name}, this is a protected endpoint.` })
})

