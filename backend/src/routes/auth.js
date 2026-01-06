import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { Admin } from '../models/Admin.js'
import { config } from '../config/config.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = express.Router()

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
})

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new admin (development use)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created
 */
authRouter.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })
    const exists = await Admin.findOne({ where: { email: value.email } })
    if (exists) return res.status(409).json({ message: 'Email already in use' })
    const passwordHash = await bcrypt.hash(value.password, 10)
    const admin = await Admin.create({ email: value.email, name: value.name, passwordHash })
    res.status(201).json({ id: admin.id, email: admin.email, name: admin.name })
  } catch (err) {
    next(err)
  }
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token returned
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })
    const admin = await Admin.findOne({ where: { email: value.email } })
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(value.password, admin.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ sub: admin.id, role: admin.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn })
    res.json({ token })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin details
 */
authRouter.get('/me', requireAuth, async (req, res) => {
  res.json({ id: req.admin.id, email: req.admin.email, name: req.admin.name, role: req.admin.role })
})

