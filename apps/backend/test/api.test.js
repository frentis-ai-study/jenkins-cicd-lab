import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app, { resetTodos } from '../src/app.js'

beforeEach(() => {
  resetTodos()
})

describe('Health Check', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })
})

describe('Todo CRUD', () => {
  it('GET /api/todos should return empty array initially', async () => {
    const res = await request(app).get('/api/todos')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('POST /api/todos should create a todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Learn Jenkins' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Learn Jenkins')
    expect(res.body.completed).toBe(false)
    expect(res.body.id).toBe(1)
  })

  it('POST /api/todos without title should return 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({})
    expect(res.status).toBe(400)
  })

  it('PUT /api/todos/:id should toggle completed', async () => {
    await request(app).post('/api/todos').send({ title: 'Test todo' })
    const res = await request(app).put('/api/todos/1')
    expect(res.status).toBe(200)
    expect(res.body.completed).toBe(true)
  })

  it('PUT /api/todos/:id for non-existent should return 404', async () => {
    const res = await request(app).put('/api/todos/999')
    expect(res.status).toBe(404)
  })

  it('DELETE /api/todos/:id should remove a todo', async () => {
    await request(app).post('/api/todos').send({ title: 'To delete' })
    const delRes = await request(app).delete('/api/todos/1')
    expect(delRes.status).toBe(204)

    const listRes = await request(app).get('/api/todos')
    expect(listRes.body).toHaveLength(0)
  })

  it('DELETE /api/todos/:id for non-existent should return 404', async () => {
    const res = await request(app).delete('/api/todos/999')
    expect(res.status).toBe(404)
  })
})
