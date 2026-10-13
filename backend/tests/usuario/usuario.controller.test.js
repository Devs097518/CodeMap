import { jest } from '@jest/globals'
import * as usuarioService from '../../api/modules/usuario/usuario.service.js'
import { listagem } from '../../api/modules/usuario/usuario.controller.js'

//o service é mockado e req/res são simulados.
jest.mock('../../api/modules/usuario/usuario.service.js', () => ({
  __esModule: true,
  listarUsuarios: jest.fn()
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

describe('usuario.controller', () => {
  describe('listagem', () => {
    const usuarios = [
      { id_usuario: 1, email: 'ana@email.com', role: 'admin' },
      { id_usuario: 2, email: 'bruno@email.com', role: 'cliente' }
    ]

    it('lista todos os usuários quando não há email na query', async () => {
      usuarioService.listarUsuarios.mockResolvedValue(usuarios)
      const res = criarRes()

      await listagem({ query: {} }, res)

      expect(usuarioService.listarUsuarios).toHaveBeenCalledWith(undefined)
      expect(res.json).toHaveBeenCalledWith(usuarios)
      expect(res.status).not.toHaveBeenCalled()
    })

    it('repassa o email da query ao service para filtrar a listagem', async () => {
      usuarioService.listarUsuarios.mockResolvedValue([usuarios[0]])
      const res = criarRes()

      await listagem({ query: { email: 'ana@email.com' } }, res)

      expect(usuarioService.listarUsuarios).toHaveBeenCalledWith('ana@email.com')
      expect(res.json).toHaveBeenCalledWith([usuarios[0]])
    })

    it('responde com lista vazia quando nenhum usuário é encontrado', async () => {
      usuarioService.listarUsuarios.mockResolvedValue([])
      const res = criarRes()

      await listagem({ query: { email: 'naoexiste@email.com' } }, res)

      expect(res.json).toHaveBeenCalledWith([])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      usuarioService.listarUsuarios.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await listagem({ query: {} }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith('falha de conexão')
      expect(res.json).not.toHaveBeenCalled()
    })

    // Pendente: hoje o SELECT * do service faz o hash da senha chegar na resposta.
    // Transformar em teste real quando a correção for feita.
    it.todo('não expõe o campo senha (hash) dos usuários na resposta')
  })
})