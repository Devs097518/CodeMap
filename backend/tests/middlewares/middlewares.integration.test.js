import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { autenticar } from '../../api/middlewares/auth.middleware.js'
import { role } from '../../api/middlewares/role.middleware.js'

// Integração real: cookie -> autenticar (JWT verdadeiro) -> role -> handler.
const SEGREDO_TESTE = 'segredo-de-teste'
const segredoOriginal = process.env.JWT_SECRET

beforeAll(() => {
  process.env.JWT_SECRET = SEGREDO_TESTE
})

afterAll(() => {
  process.env.JWT_SECRET = segredoOriginal
})

const app = express()
app.use(cookieParser())
app.get('/qualquer-perfil', autenticar, (req, res) => res.json({ ok: true }))
app.get('/somente-admin', autenticar, role('admin'), (req, res) => res.json({ ok: true }))
app.get('/somente-cliente', autenticar, role('cliente'), (req, res) => res.json({ ok: true }))

const gerarToken = (payload, opcoes = { expiresIn: '15m' }) =>
  jwt.sign(payload, SEGREDO_TESTE, opcoes)

const comToken = (rota, token) => request(app).get(rota).set('Cookie', [`token=${token}`])

describe('integração: autenticar + role', () => {
  it('bloqueia com 401 quando não há token', async () => {
    const res = await request(app).get('/somente-admin')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ message: 'Token não fornecido' })
  })

  it('bloqueia com 401 quando o token está expirado', async () => {
    const token = gerarToken({
      id: 1,
      role: 'admin'
    }, { 
        expiresIn: '-10s' 
    }
    )

    const res = await comToken('/somente-admin', token)

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ message: 'Token inválido ou expirado' })
  })

  it('libera o acesso com token válido em rota sem restrição de role', async () => {
    const res = await comToken('/qualquer-perfil', gerarToken({ id: 7, role: 'cliente' }))

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  it('libera admin na rota exclusiva de admin', async () => {
    const res = await comToken('/somente-admin', gerarToken({ id: 1, role: 'admin' }))

    expect(res.status).toBe(200)
  })

  it('bloqueia cliente na rota exclusiva de admin com 403', async () => {
    const res = await comToken('/somente-admin', gerarToken({ id: 7, role: 'cliente' }))

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ message: 'Acesso negado: permissão insuficiente' })
  })

  it('libera cliente na rota exclusiva de cliente', async () => {
    const res = await comToken('/somente-cliente', gerarToken({ id: 7, role: 'cliente' }))

    expect(res.status).toBe(200)
  })

  it('bloqueia admin na rota exclusiva de cliente com 403 (não há hierarquia de roles)', async () => {
    const res = await comToken('/somente-cliente', gerarToken({ id: 1, role: 'admin' }))

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ message: 'Acesso negado: permissão insuficiente' })
  })
})