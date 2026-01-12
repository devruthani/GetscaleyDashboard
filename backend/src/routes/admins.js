import express from 'express'
import Joi from 'joi'
import { Op } from 'sequelize'
import { Admin, Role } from '../models/index.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePermission } from '../middleware/authorize.js'

export const adminsRouter = express.Router()

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow(''),
  role: Joi.string(),
  sort: Joi.string().valid('id', 'email', 'name', 'createdAt'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
})

/**
 * @swagger
 * tags:
 *   - name: Admins
 *     description: Admin management
 */
/**
 * @swagger
 * /admins:
 *   get:
 *     summary: List admins with filters and pagination
 *     tags: [Admins]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       uuid:
 *                         type: string
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: string
 */
adminsRouter.get('/', requireAuth, requirePermission('admin:read'), async (req, res, next) => {
  try {
    const { value, error } = paginationSchema.validate(req.query)
    if (error) return res.status(400).json({ message: error.message })
    const where = {}
    if (value.search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${value.search}%` } },
        { name: { [Op.like]: `%${value.search}%` } },
      ]
    }
    const include = []
    if (value.role) {
      include.push({
        model: Role,
        as: 'roles',
        where: { name: value.role },
        through: { attributes: [] },
      })
    } else {
      include.push({ model: Role, as: 'roles', through: { attributes: [] } })
    }
    const order = value.sort ? [[value.sort, value.order]] : [['id', 'asc']]
    const offset = (value.page - 1) * value.pageSize
    const limit = value.pageSize
    const result = await Admin.findAndCountAll({ where, include, order, offset, limit })
    res.json({
      page: value.page,
      pageSize: value.pageSize,
      total: result.count,
      items: result.rows.map(a => ({
        id: a.id,
        uuid: a.uuid,
        email: a.email,
        name: a.name,
        roles: (a.roles || []).map(r => r.name),
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    })
  } catch (err) {
    next(err)
  }
})

const createSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
  roles: Joi.array().items(Joi.string()).default([]),
})

/**
 * @swagger
 * /admins:
 *   post:
 *     summary: Create admin
 *     tags: [Admins]
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
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
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
adminsRouter.post('/', requireAuth, requirePermission('admin:create'), async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })
    const exists = await Admin.findOne({ where: { email: value.email } })
    if (exists) return res.status(409).json({ message: 'Email already in use' })
    const { default: bcrypt } = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(value.password, 10)
    const admin = await Admin.create({ email: value.email, name: value.name, passwordHash })
    if (value.roles?.length) {
      const roles = await Role.findAll({ where: { name: value.roles } })
      await admin.setRoles(roles)
    }
    res.status(201).json({ id: admin.id, uuid: admin.uuid, email: admin.email, name: admin.name })
  } catch (err) {
    next(err)
  }
})

const updateSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8),
  name: Joi.string().min(2),
  roles: Joi.array().items(Joi.string()),
}).min(1)

async function findByIdOrUuid(idOrUuid) {
  if (/^\d+$/.test(idOrUuid)) {
    return await Admin.findByPk(Number(idOrUuid))
  }
  return await Admin.findOne({ where: { uuid: idOrUuid } })
}

adminsRouter.get('/:idOrUuid', requireAuth, requirePermission('admin:read'), async (req, res, next) => {
  try {
    const admin = await Admin.findOne({
      where: /^\d+$/.test(req.params.idOrUuid) ? { id: Number(req.params.idOrUuid) } : { uuid: req.params.idOrUuid },
      include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
    })
    if (!admin) return res.status(404).json({ message: 'Not Found' })
    res.json({
      id: admin.id,
      uuid: admin.uuid,
      email: admin.email,
      name: admin.name,
      roles: (admin.roles || []).map(r => r.name),
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /admins/{idOrUuid}:
 *   get:
 *     summary: Get admin by id or uuid
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: idOrUuid
 *         required: true
 *         schema:
 *           type: string
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
 *       404:
 *         description: Not Found
 */
adminsRouter.put('/:idOrUuid', requireAuth, requirePermission('admin:update'), async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body)
    if (error) return res.status(400).json({ message: error.message })
    const admin = await findByIdOrUuid(req.params.idOrUuid)
    if (!admin) return res.status(404).json({ message: 'Not Found' })
    if (value.email) admin.email = value.email
    if (value.name) admin.name = value.name
    if (value.password) {
      const { default: bcrypt } = await import('bcryptjs')
      admin.passwordHash = await bcrypt.hash(value.password, 10)
    }
    await admin.save()
    if (value.roles) {
      const roles = await Role.findAll({ where: { name: value.roles } })
      await admin.setRoles(roles)
    }
    res.json({ id: admin.id, uuid: admin.uuid, email: admin.email, name: admin.name })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /admins/{idOrUuid}:
 *   put:
 *     summary: Update admin
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: idOrUuid
 *         required: true
 *         schema:
 *           type: string
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
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Admin updated
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
 *       404:
 *         description: Not Found
 */
adminsRouter.delete('/:idOrUuid', requireAuth, requirePermission('admin:delete'), async (req, res, next) => {
  try {
    const admin = await findByIdOrUuid(req.params.idOrUuid)
    if (!admin) return res.status(404).json({ message: 'Not Found' })
    await admin.destroy()
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
