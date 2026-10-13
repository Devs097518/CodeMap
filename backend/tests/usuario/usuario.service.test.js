import { jest } from '@jest/globals'
import db from '../../db/pool.js'
import { listarUsuarios } from '../../api/modules/usuario/usuario.service.js'

// O service é testado isolado do banco: o pool é mockado.
jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('usuario.service', () => {
  describe('listarUsuarios', () => {
    const usuarios = [
      { id_usuario: 1, email: 'ana@email.com', role: 'admin' },
      { id_usuario: 2, email: 'bruno@email.com', role: 'cliente' }
    ]

    it('lista todos os usuários, sem filtro, quando o email não é informado', async () => {
      db.query.mockResolvedValue({ rows: usuarios })

      const resultado = await listarUsuarios()

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM usuario', [])
      expect(resultado).toEqual(usuarios)
    })

    it('filtra por email com query parametrizada quando o email é informado', async () => {
      db.query.mockResolvedValue({ rows: [usuarios[0]] })

      const resultado = await listarUsuarios('ana@email.com')

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM usuario WHERE email = $1',
        ['ana@email.com']
      )
      expect(resultado).toEqual([usuarios[0]])
    })

    it('não inclui o email na query SQL (evita SQL injection)', async () => {
      db.query.mockResolvedValue({ rows: [] })
      const emailMalicioso = "'; DROP TABLE usuario; --"

      await listarUsuarios(emailMalicioso)

      const [sql, params] = db.query.mock.calls[0]
      expect(sql).not.toContain(emailMalicioso)
      expect(params).toEqual([emailMalicioso])
    })

    it('retorna lista vazia quando nenhum usuário é encontrado', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await listarUsuarios('naoexiste@email.com')

      expect(resultado).toEqual([])
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(listarUsuarios()).rejects.toThrow('falha de conexão')
    })
  })
})