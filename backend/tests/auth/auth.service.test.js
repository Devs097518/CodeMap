import { jest } from '@jest/globals'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { login, buscarUsuarioLogado } from '../../api/modules/auth/auth.service.js'
import pool from '../../db/pool.js'

jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: { compare: jest.fn() }
}))

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: { sign: jest.fn() }
}))

const SEGREDO_TESTE = 'segredo-de-teste'
const segredoOriginal = process.env.JWT_SECRET

beforeAll(() => {
  process.env.JWT_SECRET = SEGREDO_TESTE
})

afterAll(() => {
  process.env.JWT_SECRET = segredoOriginal
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('auth.service', () => {
  describe('login', () => {
    const usuarioBanco = {
      id_usuario: 7,
      email: 'dayvson@email.com',
      senha: 'hash-da-senha',
      role: 'cliente'
    }

    it('retorna o token quando email e senha são válidos', async () => {
      pool.query.mockResolvedValue({ rows: [usuarioBanco] })
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue('token-falso')

      const token = await login('dayvson@email.com', 'senha123')

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM usuario WHERE email = $1',
        ['dayvson@email.com']
      )
      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hash-da-senha')
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 7, role: 'cliente' },
        SEGREDO_TESTE,
        { expiresIn: '15m' }
      )
      expect(token).toBe('token-falso')
    })

    it('lança erro quando o usuário não existe', async () => {
      pool.query.mockResolvedValue({ rows: [] })

      await expect(login('naoexiste@email.com', 'senha123')).rejects.toThrow(
        'Usuário ou senha incorretos'
      )

      expect(bcrypt.compare).not.toHaveBeenCalled()
      expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('lança erro quando a senha está incorreta', async () => {
      pool.query.mockResolvedValue({ rows: [usuarioBanco] })
      bcrypt.compare.mockResolvedValue(false)

      await expect(login('dayvson@email.com', 'senha-errada')).rejects.toThrow(
        'Usuário ou senha incorretos'
      )

      expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('usa a mesma mensagem de erro para usuário inexistente e senha incorreta', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] })
      const erroUsuario = await login('x@email.com', 'senha').catch((e) => e)

      pool.query.mockResolvedValueOnce({ rows: [usuarioBanco] })
      bcrypt.compare.mockResolvedValueOnce(false)
      const erroSenha = await login('dayvson@email.com', 'errada').catch((e) => e)

      expect(erroUsuario.message).toBe(erroSenha.message)
    })

    it('propaga o erro quando o banco falha', async () => {
      pool.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(login('dayvson@email.com', 'senha123')).rejects.toThrow(
        'falha de conexão'
      )

      expect(bcrypt.compare).not.toHaveBeenCalled()
    })
  })

  describe('buscarUsuarioLogado', () => {
    it('retorna os dados do usuário quando ele existe', async () => {
      const usuario = {
        id_usuario: 7,
        email: 'dayvson@email.com',
        role: 'cliente',
        username: 'dayvson',
        uf: 'PE'
      }
      pool.query.mockResolvedValue({ rows: [usuario] })

      const resultado = await buscarUsuarioLogado(7)

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.id_usuario = $1'),
        [7]
      )
      expect(resultado).toEqual(usuario)
    })

    it('retorna null quando o usuário não existe', async () => {
      pool.query.mockResolvedValue({ rows: [] })

      const resultado = await buscarUsuarioLogado(999)

      expect(resultado).toBeNull()
    })

    it('propaga o erro quando o banco falha', async () => {
      pool.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(buscarUsuarioLogado(7)).rejects.toThrow('falha de conexão')
    })
  })
})