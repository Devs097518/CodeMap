import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import * as authService from '../../api/modules/auth/auth.service.js'
import { autenticar } from '../../api/middlewares/auth.middleware.js'
import authRoutes from '../../api/modules/auth/auth.routes.js'
import { autenticarComo, semAutenticacao } from '../helpers/auth.js'

jest.mock('../../api/middlewares/auth.middleware.js')

jest.mock('../../api/modules/auth/auth.service.js', () => ({
  __esModule: true,
  login: jest.fn(),
  buscarUsuarioLogado: jest.fn()
}))

const app = express()
app.use(express.json())
app.use('/auth', authRoutes)

afterEach(() => {
  jest.resetAllMocks()
})

describe('auth.routes', () => {
  describe('POST /auth/login', () => {
    const credenciais = { email: 'dayvson@email.com', senha: 'senha123' }

    it('é uma rota pública: não passa pelo middleware de autenticação', async () => {
      semAutenticacao() // se a rota exigisse token, responderia 401
      authService.login.mockResolvedValue('token-falso')

      const res = await request(app).post('/auth/login').send(credenciais)

      expect(res.status).toBe(200)
      expect(autenticar).not.toHaveBeenCalled()
    })

    it('responde 200 e grava o token em cookie httpOnly quando as credenciais são válidas', async () => {
      authService.login.mockResolvedValue('token-falso')

      const res = await request(app).post('/auth/login').send(credenciais)

      expect(authService.login).toHaveBeenCalledWith('dayvson@email.com', 'senha123')
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Login realizado' })
      const cookie = res.headers['set-cookie'][0]
      expect(cookie).toContain('token=token-falso')
      expect(cookie).toContain('HttpOnly')
    })

    it('responde 401 e não grava cookie quando as credenciais são inválidas', async () => {
      authService.login.mockRejectedValue(new Error('Usuário ou senha incorretos'))

      const res = await request(app).post('/auth/login').send(credenciais)

      expect(res.status).toBe(401)
      expect(res.body).toEqual({ message: 'Usuário ou senha incorretos' })
      expect(res.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('POST /auth/logout', () => {
    it('é uma rota pública e expira o cookie do token', async () => {
      semAutenticacao()

      const res = await request(app).post('/auth/logout')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Logout realizado' })
      expect(autenticar).not.toHaveBeenCalled()
      const cookie = res.headers['set-cookie'][0]
      expect(cookie).toContain('token=;')
      expect(cookie).toContain('Expires=Thu, 01 Jan 1970')
    })
  })

  describe('GET /auth/me', () => {
    it('bloqueia o acesso sem token e não chega ao service', async () => {
      semAutenticacao()

      const res = await request(app).get('/auth/me')

      expect(res.status).toBe(401)
      expect(res.body).toEqual({ message: 'Token não fornecido' })
      expect(authService.buscarUsuarioLogado).not.toHaveBeenCalled()
    })

    it('libera o acesso com token válido e responde com os dados do usuário', async () => {
      const usuario = { id_usuario: 7, email: 'dayvson@email.com', role: 'cliente' }
      autenticarComo({ id: 7, role: 'cliente' })
      authService.buscarUsuarioLogado.mockResolvedValue(usuario)

      const res = await request(app).get('/auth/me')

      expect(authService.buscarUsuarioLogado).toHaveBeenCalledWith(7)
      expect(res.status).toBe(200)
      expect(res.body).toEqual(usuario)
    })

    it('responde 404 quando o usuário do token não existe mais', async () => {
      autenticarComo({ id: 999, role: 'cliente' })
      authService.buscarUsuarioLogado.mockResolvedValue(null)

      const res = await request(app).get('/auth/me')

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ message: 'Usuário não encontrado' })
    })

    it.each(['admin', 'cliente'])(
      'não restringe por role: libera o acesso para %s',
      async (role) => {
        autenticarComo({ id: 1, role })
        authService.buscarUsuarioLogado.mockResolvedValue({ id_usuario: 1, role })

        const res = await request(app).get('/auth/me')

        expect(res.status).toBe(200)
        expect(res.body.role).toBe(role)
      }
    )
  })
})