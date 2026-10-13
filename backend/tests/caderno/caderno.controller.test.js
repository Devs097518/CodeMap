import { jest } from '@jest/globals'
import * as cadernoService from '../../api/modules/caderno/caderno.service.js'
import {
  listagem,
  novo,
  editar,
  deletar
} from '../../api/modules/caderno/caderno.controller.js'

// O controller é testado isolado: o service é mockado e req/res são simulados.
jest.mock('../../api/modules/caderno/caderno.service.js', () => ({
  __esModule: true,
  listarCadernos: jest.fn(),
  criarCaderno: jest.fn(),
  editarCaderno: jest.fn(),
  deletarCaderno: jest.fn()
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

describe('caderno.controller', () => {
  const caderno = { id_caderno: 1, id_usuario: 7, titulo: 'Node.js' }

  describe('listagem', () => {
    it('repassa o id_usuario da query ao service e responde com a lista', async () => {
      cadernoService.listarCadernos.mockResolvedValue([caderno])
      const res = criarRes()

      await listagem({ query: { id_usuario: '7' } }, res)

      expect(cadernoService.listarCadernos).toHaveBeenCalledWith('7')
      expect(res.json).toHaveBeenCalledWith([caderno])
      expect(res.status).not.toHaveBeenCalled()
    })

    it('chama o service sem filtro quando não há id_usuario na query', async () => {
      cadernoService.listarCadernos.mockResolvedValue([caderno])
      const res = criarRes()

      await listagem({ query: {} }, res)

      expect(cadernoService.listarCadernos).toHaveBeenCalledWith(undefined)
      expect(res.json).toHaveBeenCalledWith([caderno])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      cadernoService.listarCadernos.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await listagem({ query: {} }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith('falha de conexão')
    })

    // Pendente: hoje o id_usuario vem da query (controlado pelo cliente) e, sem ele,
    // a listagem devolve os cadernos de todos os usuários.
    it.todo('lista apenas os cadernos do usuário autenticado (req.user.id), ignorando a query')
  })

  describe('novo', () => {
    const req = { body: { id_usuario: 7, titulo: 'Node.js' } }

    it('cria o caderno com id_usuario e titulo do body e responde 201', async () => {
      cadernoService.criarCaderno.mockResolvedValue(caderno)
      const res = criarRes()

      await novo(req, res)

      expect(cadernoService.criarCaderno).toHaveBeenCalledWith(7, 'Node.js')
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(caderno)
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      cadernoService.criarCaderno.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await novo(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })

    // Pendente: hoje o dono do caderno vem do body, então um usuário pode criar
    // cadernos em nome de outro.
    it.todo('cria o caderno para o usuário autenticado (req.user.id), ignorando o id_usuario do body')
  })

  describe('editar', () => {
    const req = { params: { id: '1' }, body: { titulo: 'Node.js avançado' } }

    it('edita o caderno pelo id da rota e responde 200 com o registro atualizado', async () => {
      const atualizado = { ...caderno, titulo: 'Node.js avançado' }
      cadernoService.editarCaderno.mockResolvedValue(atualizado)
      const res = criarRes()

      await editar(req, res)

      expect(cadernoService.editarCaderno).toHaveBeenCalledWith('1', 'Node.js avançado')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(atualizado)
    })

    it('responde 404 quando o caderno não existe', async () => {
      cadernoService.editarCaderno.mockResolvedValue(null)
      const res = criarRes()

      await editar(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'Caderno não encontrado' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      cadernoService.editarCaderno.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await editar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })

    // Pendente: não há verificação de dono, então qualquer usuário edita qualquer caderno.
    it.todo('não edita (403 ou 404) o caderno que pertence a outro usuário')
  })

  describe('deletar', () => {
    const req = { params: { id: '1' } }

    it('remove o caderno pelo id da rota e responde 200 com o registro removido', async () => {
      cadernoService.deletarCaderno.mockResolvedValue(caderno)
      const res = criarRes()

      await deletar(req, res)

      expect(cadernoService.deletarCaderno).toHaveBeenCalledWith('1')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(caderno)
    })

    it('responde 404 quando o caderno não existe', async () => {
      cadernoService.deletarCaderno.mockResolvedValue(null)
      const res = criarRes()

      await deletar(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'Caderno não encontrado' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      cadernoService.deletarCaderno.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await deletar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })

    // Pendente: não há verificação de dono, então qualquer usuário remove qualquer caderno.
    it.todo('não remove (403 ou 404) o caderno que pertence a outro usuário')
  })
})