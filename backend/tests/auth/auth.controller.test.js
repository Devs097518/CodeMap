import { jest } from '@jest/globals'
import * as authService from '../../api/modules/auth/auth.service.js'
import { login, logout, me } from '../../api/modules/auth/auth.controller.js'

jest.mock('../../api/modules/auth/auth.service.js', () => ({
  __esModule: true,
  login: jest.fn(),
  buscarUsuarioLogado: jest.fn()
}))

const criarRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.clearCookie = jest.fn().mockReturnValue(res)
  return res
}

const nodeEnvOriginal = process.env.NODE_ENV

afterEach(() => {
  jest.resetAllMocks()
  process.env.NODE_ENV = nodeEnvOriginal
})

describe('auth.controller', () => {
  describe('login', () => {
    const req = { body: { email: 'dayvson@email.com', senha: 'senha123' } }

    it('chama o service com email e senha do body', async () => {
      authService.login.mockResolvedValue('token-falso')

      await login(req, criarRes())

      expect(authService.login).toHaveBeenCalledWith('dayvson@email.com', 'senha123')
    })

    it('grava o token em cookie e responde com mensagem de sucesso', async () => {
      authService.login.mockResolvedValue('token-falso')
      const res = criarRes()

      await login(req, res)

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token-falso',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
      )
      expect(res.json).toHaveBeenCalledWith({ message: 'Login realizado' })
      expect(res.status).not.toHaveBeenCalled()
    })

    it('marca o cookie como secure em produção', async () => {
      process.env.NODE_ENV = 'production'
      authService.login.mockResolvedValue('token-falso')
      const res = criarRes()

      await login(req, res)

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token-falso',
        expect.objectContaining({ secure: true })
      )
    })

    it('não marca o cookie como secure fora de produção', async () => {
      process.env.NODE_ENV = 'development'
      authService.login.mockResolvedValue('token-falso')
      const res = criarRes()

      await login(req, res)

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token-falso',
        expect.objectContaining({ secure: false })
      )
    })

    it('responde 401 com a mensagem do erro quando o login falha', async () => {
      authService.login.mockRejectedValue(new Error('Usuário ou senha incorretos'))
      const res = criarRes()

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário ou senha incorretos' })
      expect(res.cookie).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('limpa o cookie do token e responde com mensagem de sucesso', () => {
      const res = criarRes()

      logout({}, res)

      expect(res.clearCookie).toHaveBeenCalledWith('token')
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout realizado' })
    })
  })

  describe('me', () => {
    const req = { user: { id: 7 } }

    it('busca o usuário pelo id do token e responde com os dados', async () => {
      const usuario = { id_usuario: 7, email: 'dayvson@email.com', role: 'cliente' }
      authService.buscarUsuarioLogado.mockResolvedValue(usuario)
      const res = criarRes()

      await me(req, res)

      expect(authService.buscarUsuarioLogado).toHaveBeenCalledWith(7)
      expect(res.json).toHaveBeenCalledWith(usuario)
      expect(res.status).not.toHaveBeenCalled()
    })

    it('responde 404 quando o usuário não é encontrado', async () => {
      authService.buscarUsuarioLogado.mockResolvedValue(null)
      const res = criarRes()

      await me(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' })
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      authService.buscarUsuarioLogado.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await me(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ message: 'falha de conexão' })
    })
  })
})