import request from 'supertest'
import { createApp } from '../../src/app.js'

const app = createApp()

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/health')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('status', 'ok')
    expect(res.body).toHaveProperty('timestamp')
  })
})
