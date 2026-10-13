import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import * as notaService from '../../api/modules/nota/nota.service.js'
import { autenticar } from '../../api/middlewares/auth.middleware.js'
import notaRoutes from '../../api/modules/nota/nota.routes.js'
import { autenticarComo, semAutenticacao } from '../helpers/auth.js'

// Integração routes + controller reais; o autenticar é simulado pelos helpers
// e o service é mockado (sem banco).
jest.mock('../../api/middlewares/auth.middleware.js')

jest.mock('../../api/modules/nota/nota.service.js', () => ({
  __esModule: true,
  listarNotas: jest.fn(),
  listarNotaPorUsuario: jest.fn(),
  criarNota: jest.fn(),
  editarNota: jest.fn(),
  deletarNota: jest.fn()
}))

const app = express()
app.use(express.json())
// O autenticar é aplicado na montagem, como nos demais módulos de backend/api/index.js
app.use('/nota', autenticar, notaRoutes)

beforeEach(() => {
  autenticarComo({ id: 7, role: 'cliente' })
})

afterEach(() => {
  jest.resetAllMocks()
})

const nenhumaFuncaoDoServiceFoiChamada = () => {
  expect(notaService.listarNotas).not.toHaveBeenCalled()
  expect(notaService.listarNotaPorUsuario).not.toHaveBeenCalled()
  expect(notaService.criarNota).not.toHaveBeenCalled()
  expect(notaService.editarNota).not.toHaveBeenCalled()
  expect(notaService.deletarNota).not.toHaveBeenCalled()
}

describe('nota.routes', () => {
  const nota = { id_nota: 1, id_caderno: 3, titulo: 'Closures', conteudo: 'Escopo léxico' }

  describe('GET /nota/listagem', () => {
    it('responde 200 com a lista de notas', async () => {
      notaService.listarNotas.mockResolvedValue([nota])

      const res = await request(app).get('/nota/listagem')

      expect(notaService.listarNotas).toHaveBeenCalledWith(undefined)
      expect(res.status).toBe(200)
      expect(res.body).toEqual([nota])
    })

    it('repassa o id_caderno da query string ao service', async () => {
      notaService.listarNotas.mockResolvedValue([nota])

      const res = await request(app).get('/nota/listagem').query({ id_caderno: 3 })

      expect(notaService.listarNotas).toHaveBeenCalledWith('3')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([nota])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      notaService.listarNotas.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).get('/nota/listagem')

      expect(res.status).toBe(500)
      expect(res.text).toBe('falha de conexão')
    })
  })

  describe('GET /nota/por-usuario/:id_usuario', () => {
    it('busca pelo id_usuario da rota e responde 200 com a nota', async () => {
      notaService.listarNotaPorUsuario.mockResolvedValue(nota)

      const res = await request(app).get('/nota/por-usuario/7')

      expect(notaService.listarNotaPorUsuario).toHaveBeenCalledWith('7')
      expect(res.status).toBe(200)
      expect(res.body).toEqual(nota)
    })

    it('responde 404 quando nenhuma nota é encontrada', async () => {
      notaService.listarNotaPorUsuario.mockResolvedValue(null)

      const res = await request(app).get('/nota/por-usuario/99')

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'Nenhuma nota encontrada' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.listarNotaPorUsuario.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).get('/nota/por-usuario/7')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  describe('POST /nota/novo', () => {
    const corpo = { conteudo: 'Escopo léxico', id_caderno: 3, titulo: 'Closures' }

    it('cria a nota associada ao caderno pai e responde 201', async () => {
      notaService.criarNota.mockResolvedValue(nota)

      const res = await request(app).post('/nota/novo').send(corpo)

      expect(notaService.criarNota).toHaveBeenCalledWith('Escopo léxico', 3, 'Closures')
      expect(res.status).toBe(201)
      expect(res.body).toEqual(nota)
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.criarNota.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).post('/nota/novo').send(corpo)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  describe('PUT /nota/editar/:id', () => {
    const corpo = { conteudo: 'Novo texto', titulo: 'Closures II' }

    it('edita a nota pelo id da rota e responde 200 com o registro atualizado', async () => {
      const atualizada = { ...nota, ...corpo }
      notaService.editarNota.mockResolvedValue(atualizada)

      const res = await request(app).put('/nota/editar/1').send(corpo)

      expect(notaService.editarNota).toHaveBeenCalledWith('1', 'Novo texto', 'Closures II')
      expect(res.status).toBe(200)
      expect(res.body).toEqual(atualizada)
    })

    it('responde 404 quando a nota não existe', async () => {
      notaService.editarNota.mockResolvedValue(null)

      const res = await request(app).put('/nota/editar/999').send(corpo)

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'Nota não encontrada' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.editarNota.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).put('/nota/editar/1').send(corpo)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  describe('DELETE /nota/deletar/:id', () => {
    it('remove a nota pelo id da rota e responde 200 com o registro removido', async () => {
      notaService.deletarNota.mockResolvedValue(nota)

      const res = await request(app).delete('/nota/deletar/1')

      expect(notaService.deletarNota).toHaveBeenCalledWith('1')
      expect(res.status).toBe(200)
      expect(res.body).toEqual(nota)
    })

    it('responde 404 quando a nota não existe', async () => {
      notaService.deletarNota.mockResolvedValue(null)

      const res = await request(app).delete('/nota/deletar/999')

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'Nota não encontrada' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      notaService.deletarNota.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).delete('/nota/deletar/1')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  it.each([
    ['post', '/nota/listagem'],
    ['post', '/nota/por-usuario/7'],
    ['get', '/nota/novo'],
    ['get', '/nota/editar/1'],
    ['post', '/nota/deletar/1']
  ])('responde 404 quando o método está errado (%s %s)', async (metodo, caminho) => {
    const res = await request(app)[metodo](caminho)

    expect(res.status).toBe(404)
    nenhumaFuncaoDoServiceFoiChamada()
  })

  describe('autenticação (aplicada na montagem do router)', () => {
    it.each([
      ['get', '/nota/listagem'],
      ['get', '/nota/por-usuario/7'],
      ['post', '/nota/novo'],
      ['put', '/nota/editar/1'],
      ['delete', '/nota/deletar/1']
    ])('bloqueia com 401 sem token e não chega ao service (%s %s)', async (metodo, caminho) => {
      semAutenticacao()

      const res = await request(app)[metodo](caminho)

      expect(res.status).toBe(401)
      expect(res.body).toEqual({ message: 'Token não fornecido' })
      nenhumaFuncaoDoServiceFoiChamada()
    })
  })

  // Pendente: o login é exigido, mas nenhuma camada confere o dono do caderno pai.
  // Transformar em teste real quando a correção for feita (issue separada).
  it.todo('bloqueia com 403 ou 404 a consulta, a edição e a exclusão de notas de cadernos de outro usuário')
})