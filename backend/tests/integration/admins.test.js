import request from 'supertest'
import { createApp } from '../../src/app.js'
import { Admin, Role } from '../../src/models/index.js'
import bcrypt from 'bcryptjs'

const app = createApp()

describe('Admins Routes', () => {
  let token
  let createdAdminId
  let createdAdminUuid

  beforeAll(async () => {
    const [superRole] = await Role.findOrCreate({ where: { name: 'superadmin' }, defaults: { permissions: ['*'] } })
    const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { permissions: ['admin:read','admin:create','admin:update'] } })
    const passwordHash = await bcrypt.hash('supersecret', 10)
    const superAdmin = await Admin.create({ email: 'super@example.com', name: 'Super Admin', passwordHash })
    await superAdmin.setRoles([superRole])
    const res = await request(app).post('/api/auth/login').send({ email: 'super@example.com', password: 'supersecret' })
    token = res.body.token
  })

  it('should create a new admin', async () => {
    const res = await request(app)
      .post('/api/admins')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'user1@example.com', password: 'password123', name: 'User One', roles: ['admin'] })
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('uuid')
    createdAdminId = res.body.id
    createdAdminUuid = res.body.uuid
  })

  it('should list admins with pagination', async () => {
    const res = await request(app)
      .get('/api/admins?page=1&pageSize=10')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('items')
    expect(Array.isArray(res.body.items)).toBe(true)
    expect(res.body).toHaveProperty('total')
  })

  it('should get admin by id', async () => {
    const res = await request(app)
      .get(`/api/admins/${createdAdminId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id', createdAdminId)
  })

  it('should get admin by uuid', async () => {
    const res = await request(app)
      .get(`/api/admins/${createdAdminUuid}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('uuid', createdAdminUuid)
  })

  it('should update admin name and roles', async () => {
    const res = await request(app)
      .put(`/api/admins/${createdAdminId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'User One Updated', roles: ['admin'] })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('name', 'User One Updated')
  })

  it('should delete admin', async () => {
    const res = await request(app)
      .delete(`/api/admins/${createdAdminId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(204)
  })
})

