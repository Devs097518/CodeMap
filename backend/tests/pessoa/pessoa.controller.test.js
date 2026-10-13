import { jest } from '@jest/globals'
import * as pessoaService from '../../api/modules/pessoa/pessoa.service.js'
import { listagem } from '../../api/modules/pessoa/pessoa.controller.js'

// O controller é testado isolado: o service é mockado e req/res são simulados.
jest.mock('../../api/modules/pessoa/pessoa.service.js', () => ({
  __esModule: true,
  listarPessoas: jest.fn()
}))

// Cria um res falso cujos métodos encadeáveis retornam o próprio res
const criarRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('pessoa.controller', () => {
  describe('listagem', () => {
    const pessoas = [
      { id_pessoa: 1, username: 'ana', uf: 'PE', id_usuario: 10 },
      { id_pessoa: 2, username: 'bruno', uf: 'SP', id_usuario: 11 }
    ]

    it('chama o service e responde com a lista de pessoas', async () => {
      pessoaService.listarPessoas.mockResolvedValue(pessoas)
      const res = criarRes()

      await listagem({}, res)

      expect(pessoaService.listarPessoas).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(pessoas)
      expect(res.status).not.toHaveBeenCalled()
    })

    it('responde com lista vazia quando não há pessoas cadastradas', async () => {
      pessoaService.listarPessoas.mockResolvedValue([])
      const res = criarRes()

      await listagem({}, res)

      expect(res.json).toHaveBeenCalledWith([])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      pessoaService.listarPessoas.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await listagem({}, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith('falha de conexão')
      expect(res.json).not.toHaveBeenCalled()
    })
  })
})