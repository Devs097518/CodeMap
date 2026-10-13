import { jest } from '@jest/globals'
import * as notaService from '../../api/modules/nota/nota.service.js'
import {
  listagem,
  porUsuario,
  novo,
  editar,
  deletar
} from '../../api/modules/nota/nota.controller.js'

// O controller é testado isolado: o service é mockado e req/res são simulados.
jest.mock('../../api/modules/nota/nota.service.js', () => ({
  __esModule: true,
  listarNotas: jest.fn(),
  listarNotaPorUsuario: jest.fn(),
  criarNota: jest.fn(),
  editarNota: jest.fn(),
  deletarNota: jest.fn()
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

describe('nota.controller', () => {
  const nota = { id_nota: 1, id_caderno: 3, titulo: 'Closures', conteudo: 'Escopo léxico' }

  describe('listagem', () => {
    it('repassa o id_caderno da query ao service e responde com a lista', async () => {
      notaService.listarNotas.mockResolvedValue([nota])
      const res = criarRes()

      await listagem({ query: { id_caderno: '3' } }, res)

      expect(notaService.listarNotas).toHaveBeenCalledWith('3')
      expect(res.json).toHaveBeenCalledWith([nota])
      expect(res.status).not.toHaveBeenCalled()
    })

    it('chama o service sem filtro quando não há id_caderno na query', async () => {
      notaService.listarNotas.mockResolvedValue([nota])
      const res = criarRes()

      await listagem({ query: {} }, res)

      expect(notaService.listarNotas).toHaveBeenCalledWith(undefined)
      expect(res.json).toHaveBeenCalledWith([nota])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      notaService.listarNotas.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await listagem({ query: {} }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith('falha de conexão')
    })

    // Pendente: hoje o filtro vem da query e, sem ele, a listagem devolve as notas de todos.
    it.todo('lista apenas as notas de cadernos do usuário autenticado')
  })

  describe('porUsuario', () => {
    const req = { params: { id_usuario: '7' } }

    it('busca pelo id_usuario da rota e responde 200 com a nota', async () => {
      notaService.listarNotaPorUsuario.mockResolvedValue(nota)
      const res = criarRes()

      await porUsuario(req, res)

      expect(notaService.listarNotaPorUsuario).toHaveBeenCalledWith('7')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(nota)
    })

    it('responde 404 quando nenhuma nota é encontrada', async () => {
      notaService.listarNotaPorUsuario.mockResolvedValue(null)
      const res = criarRes()

      await porUsuario(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        status: 'erro',
        mensagem: 'Nenhuma nota encontrada'
      })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.listarNotaPorUsuario.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await porUsuario(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })

    // Pendente: o id vem da URL, então qualquer usuário consulta as notas de outro.
    it.todo('consulta apenas as notas do usuário autenticado (req.user.id), ignorando o id da URL')
  })

  describe('novo', () => {
    const req = { body: { conteudo: 'Escopo léxico', id_caderno: 3, titulo: 'Closures' } }

    it('cria a nota associada ao caderno pai, na ordem esperada pelo service, e responde 201', async () => {
      notaService.criarNota.mockResolvedValue(nota)
      const res = criarRes()

      await novo(req, res)

      expect(notaService.criarNota).toHaveBeenCalledWith('Escopo léxico', 3, 'Closures')
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(nota)
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.criarNota.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await novo(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })

    // Pendente: o id_caderno vem do body sem conferir o dono do caderno.
    it.todo('só cria a nota em um caderno que pertence ao usuário autenticado')
  })

  describe('editar', () => {
    const req = { params: { id: '1' }, body: { conteudo: 'Novo texto', titulo: 'Closures II' } }

    it('edita a nota pelo id da rota e responde 200 com o registro atualizado', async () => {
      const atualizada = { ...nota, conteudo: 'Novo texto', titulo: 'Closures II' }
      notaService.editarNota.mockResolvedValue(atualizada)
      const res = criarRes()

      await editar(req, res)

      expect(notaService.editarNota).toHaveBeenCalledWith('1', 'Novo texto', 'Closures II')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(atualizada)
    })

    it('responde 404 quando a nota não existe', async () => {
      notaService.editarNota.mockResolvedValue(null)
      const res = criarRes()

      await editar(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'Nota não encontrada' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.editarNota.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await editar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })

    // Pendente: não há verificação de dono do caderno pai.
    it.todo('não edita (403 ou 404) a nota de um caderno que pertence a outro usuário')
  })

  describe('deletar', () => {
    const req = { params: { id: '1' } }

    it('remove a nota pelo id da rota e responde 200 com o registro removido', async () => {
      notaService.deletarNota.mockResolvedValue(nota)
      const res = criarRes()

      await deletar(req, res)

      expect(notaService.deletarNota).toHaveBeenCalledWith('1')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(nota)
    })

    it('responde 404 quando a nota não existe', async () => {
      notaService.deletarNota.mockResolvedValue(null)
      const res = criarRes()

      await deletar(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'Nota não encontrada' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.deletarNota.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await deletar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })

    // Pendente: não há verificação de dono do caderno pai.
    it.todo('não remove (403 ou 404) a nota de um caderno que pertence a outro usuário')
  })
})