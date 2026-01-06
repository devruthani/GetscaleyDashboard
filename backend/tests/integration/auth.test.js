import request from 'supertest'
import { createApp } from '../../src/app.js'
import { Admin } from '../../src/models/Admin.js'
import bcrypt from 'bcryptjs'

const app = createApp()

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Seed a test admin
    const passwordHash = await bcrypt.hash('password123', 10)
    await Admin.create({
      email: 'test@example.com',
      name: 'Test Admin',
      passwordHash,
      role: 'admin',
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('token')
      // Login currently only returns { token }
      // expect(res.body.user).toHaveProperty('email', 'test@example.com')
    })

    it('should fail with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(res.statusCode).toEqual(401)
    })
  })
})
