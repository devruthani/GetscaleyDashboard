import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { Admin, Role } from '../models/index.js'

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 uuid:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 */
authRouter.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })
    const exists = await Admin.findOne({ where: { email: value.email } })
    if (exists) return res.status(409).json({ message: 'Email already in use' })
    const passwordHash = await bcrypt.hash(value.password, 10)
    const admin = await Admin.create({ email: value.email, name: value.name, passwordHash })
    const defaultRole = await Role.findOne({ where: { name: 'admin' } })
    if (defaultRole) await admin.setRoles([defaultRole])
    res.status(201).json({ id: admin.id, uuid: admin.uuid, email: admin.email, name: admin.name })
  } catch (err) {
    console.error('Login error:', err)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     uuid:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })
    const admin = await Admin.findOne({ where: { email: value.email }, include: [{ model: Role, as: 'roles' }] })
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(value.password, admin.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const roles = (admin.roles || []).map(r => r.name)
    const token = jwt.sign({ sub: admin.id, roles }, config.jwt.secret, { expiresIn: config.jwt.expiresIn })
    res.json({ token, user: { id: admin.id, uuid: admin.uuid, email: admin.email, name: admin.name, roles } })
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 uuid:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 */
authRouter.get('/me', requireAuth, async (req, res) => {
  const admin = await Admin.findByPk(req.admin.id, { include: [{ model: Role, as: 'roles' }] })
  const roles = (admin?.roles || []).map(r => r.name)
  res.json({ id: req.admin.id, uuid: req.admin.uuid, email: req.admin.email, name: req.admin.name, roles })
})
