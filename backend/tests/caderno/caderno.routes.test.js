import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import * as cadernoService from '../../api/modules/caderno/caderno.service.js'
import { autenticar } from '../../api/middlewares/auth.middleware.js'
import cadernoRoutes from '../../api/modules/caderno/caderno.routes.js'
import { autenticarComo, semAutenticacao } from '../helpers/auth.js'

// Integração routes + controller reais; o autenticar é simulado pelos helpers
// e o service é mockado (sem banco).
jest.mock('../../api/middlewares/auth.middleware.js')

jest.mock('../../api/modules/caderno/caderno.service.js', () => ({
  __esModule: true,
  listarCadernos: jest.fn(),
  criarCaderno: jest.fn(),
  editarCaderno: jest.fn(),
  deletarCaderno: jest.fn()
}))

const app = express()
app.use(express.json())
// O autenticar é aplicado na montagem, como em backend/api/index.js
app.use('/caderno', autenticar, cadernoRoutes)

beforeEach(() => {
  autenticarComo({ id: 7, role: 'cliente' })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('caderno.routes', () => {
  const caderno = { id_caderno: 1, id_usuario: 7, titulo: 'Node.js' }

  describe('GET /caderno/listagem', () => {
    it('responde 200 com a lista de cadernos', async () => {
      cadernoService.listarCadernos.mockResolvedValue([caderno])

      const res = await request(app).get('/caderno/listagem')

      expect(cadernoService.listarCadernos).toHaveBeenCalledWith(undefined)
      expect(res.status).toBe(200)
      expect(res.body).toEqual([caderno])
    })

    it('repassa o id_usuario da query string ao service', async () => {
      cadernoService.listarCadernos.mockResolvedValue([caderno])

      const res = await request(app).get('/caderno/listagem').query({ id_usuario: 7 })

      expect(cadernoService.listarCadernos).toHaveBeenCalledWith('7')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([caderno])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      cadernoService.listarCadernos.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).get('/caderno/listagem')

      expect(res.status).toBe(500)
      expect(res.text).toBe('falha de conexão')
    })
  })

  describe('POST /caderno/novo', () => {
    it('cria o caderno com os dados do body e responde 201', async () => {
      cadernoService.criarCaderno.mockResolvedValue(caderno)

      const res = await request(app)
        .post('/caderno/novo')
        .send({ id_usuario: 7, titulo: 'Node.js' })

      expect(cadernoService.criarCaderno).toHaveBeenCalledWith(7, 'Node.js')
      expect(res.status).toBe(201)
      expect(res.body).toEqual(caderno)
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      cadernoService.criarCaderno.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app)
        .post('/caderno/novo')
        .send({ id_usuario: 7, titulo: 'Node.js' })

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  describe('PUT /caderno/editar/:id', () => {
    it('edita o caderno pelo id da rota e responde 200 com o registro atualizado', async () => {
      const atualizado = { ...caderno, titulo: 'Node.js avançado' }
      cadernoService.editarCaderno.mockResolvedValue(atualizado)

      const res = await request(app)
        .put('/caderno/editar/1')
        .send({ titulo: 'Node.js avançado' })

      expect(cadernoService.editarCaderno).toHaveBeenCalledWith('1', 'Node.js avançado')
      expect(res.status).toBe(200)
      expect(res.body).toEqual(atualizado)
    })

    it('responde 404 quando o caderno não existe', async () => {
      cadernoService.editarCaderno.mockResolvedValue(null)

      const res = await request(app).put('/caderno/editar/999').send({ titulo: 'Qualquer' })

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'Caderno não encontrado' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      cadernoService.editarCaderno.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).put('/caderno/editar/1').send({ titulo: 'Novo' })

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  describe('DELETE /caderno/deletar/:id', () => {
    it('remove o caderno pelo id da rota e responde 200 com o registro removido', async () => {
      cadernoService.deletarCaderno.mockResolvedValue(caderno)

      const res = await request(app).delete('/caderno/deletar/1')

      expect(cadernoService.deletarCaderno).toHaveBeenCalledWith('1')
      expect(res.status).toBe(200)
      expect(res.body).toEqual(caderno)
    })

    it('responde 404 quando o caderno não existe', async () => {
      cadernoService.deletarCaderno.mockResolvedValue(null)

      const res = await request(app).delete('/caderno/deletar/999')

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'Caderno não encontrado' })
    })

    it('responde 500 com { status, mensagem } quando o service falha', async () => {
      cadernoService.deletarCaderno.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).delete('/caderno/deletar/1')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  it.each([
    ['get', '/caderno/novo'],
    ['post', '/caderno/listagem'],
    ['get', '/caderno/editar/1'],
    ['post', '/caderno/deletar/1']
  ])('responde 404 quando o método está errado (%s %s)', async (metodo, caminho) => {
    const res = await request(app)[metodo](caminho)

    expect(res.status).toBe(404)
    expect(cadernoService.listarCadernos).not.toHaveBeenCalled()
    expect(cadernoService.criarCaderno).not.toHaveBeenCalled()
    expect(cadernoService.editarCaderno).not.toHaveBeenCalled()
    expect(cadernoService.deletarCaderno).not.toHaveBeenCalled()
  })

  describe('autenticação (aplicada na montagem do router)', () => {
    it.each([
      ['get', '/caderno/listagem'],
      ['post', '/caderno/novo'],
      ['put', '/caderno/editar/1'],
      ['delete', '/caderno/deletar/1']
    ])('bloqueia com 401 sem token e não chega ao service (%s %s)', async (metodo, caminho) => {
      semAutenticacao()

      const res = await request(app)[metodo](caminho)

      expect(res.status).toBe(401)
      expect(res.body).toEqual({ message: 'Token não fornecido' })
      expect(cadernoService.listarCadernos).not.toHaveBeenCalled()
      expect(cadernoService.criarCaderno).not.toHaveBeenCalled()
      expect(cadernoService.editarCaderno).not.toHaveBeenCalled()
      expect(cadernoService.deletarCaderno).not.toHaveBeenCalled()
    })
  })

  // Pendente: o login é exigido, mas nenhuma camada confere o dono do caderno.
  // Transformar em teste real quando a correção for feita (issue separada).
  it.todo('bloqueia com 403 ou 404 a edição e a exclusão de caderno de outro usuário')
})