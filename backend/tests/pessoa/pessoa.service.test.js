import { jest } from '@jest/globals'
import db from '../../db/pool.js'
import { listarPessoas } from '../../api/modules/pessoa/pessoa.service.js'

// O service é testado isolado do banco: o pool é mockado.
jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('pessoa.service', () => {
  describe('listarPessoas', () => {
    const pessoas = [
      { id_pessoa: 1, username: 'ana', uf: 'PE', id_usuario: 10 },
      { id_pessoa: 2, username: 'bruno', uf: 'SP', id_usuario: 11 }
    ]

    it('consulta a tabela pessoa e retorna todas as linhas', async () => {
      db.query.mockResolvedValue({ rows: pessoas })

      const resultado = await listarPessoas()

      expect(db.query).toHaveBeenCalledTimes(1)
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM pessoa')
      expect(resultado).toEqual(pessoas)
    })

    it('retorna lista vazia quando não há pessoas cadastradas', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await listarPessoas()

      expect(resultado).toEqual([])
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(listarPessoas()).rejects.toThrow('falha de conexão')
    })
  })
})