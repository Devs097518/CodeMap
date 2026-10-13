import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import * as progressoService from '../../api/modules/progresso/progresso.service.js'
import { autenticar } from '../../api/middlewares/auth.middleware.js'
import progressoRoutes from '../../api/modules/progresso/progresso.routes.js'
import { autenticarComo, semAutenticacao } from '../helpers/auth.js'

// Integração: route + role (real) + controller reais.
// O middleware de autenticação é simulado pelos helpers e o service é mockado (sem banco).
jest.mock('../../api/middlewares/auth.middleware.js')

jest.mock('../../api/modules/progresso/progresso.service.js', () => ({
  __esModule: true,
  alternarProgresso: jest.fn()
}))

// Role exigida pelas rotas, exatamente como está em progresso.routes.js.
// Confirme que é o mesmo valor gravado em usuario.role no banco.
const ROLE_DA_ROTA = 'client'

// O autenticar é aplicado na montagem, como numa rota protegida do app real.
const app = express()
app.use(express.json())
app.use('/progresso', autenticar, progressoRoutes)

afterEach(() => {
  jest.resetAllMocks()
})

describe('progresso.routes', () => {
  describe.each([
    ['/progresso/topico/5', 'topico'],
    ['/progresso/subitem/5', 'subitem']
  ])('PUT %s', (caminho, tipo) => {
    it('bloqueia com 401 quando não há token e não chega ao service', async () => {
      semAutenticacao()

      const res = await request(app).put(caminho).send({ estudado: true })

      expect(res.status).toBe(401)
      expect(res.body).toEqual({ message: 'Token não fornecido' })
      expect(progressoService.alternarProgresso).not.toHaveBeenCalled()
    })

    it.each([
      ['marca como estudado', true],
      ['desmarca', false]
    ])('%s e responde 200 para o usuário autenticado', async (_acao, estudado) => {
      const progresso = { id_usuario: 7, tipo, item_id: 5, estudado }
      autenticarComo({ id: 7, role: ROLE_DA_ROTA })
      progressoService.alternarProgresso.mockResolvedValue(progresso)

      const res = await request(app).put(caminho).send({ estudado })

      expect(progressoService.alternarProgresso).toHaveBeenCalledWith(7, tipo, '5', estudado)
      expect(res.status).toBe(200)
      expect(res.body).toEqual(progresso)
    })

    it('associa o progresso ao usuário autenticado, sem misturar usuários', async () => {
      progressoService.alternarProgresso.mockResolvedValue({})

      autenticarComo({ id: 7, role: ROLE_DA_ROTA })
      await request(app).put(caminho).send({ estudado: true })

      autenticarComo({ id: 8, role: ROLE_DA_ROTA })
      await request(app).put(caminho).send({ estudado: true })

      expect(progressoService.alternarProgresso.mock.calls[0][0]).toBe(7)
      expect(progressoService.alternarProgresso.mock.calls[1][0]).toBe(8)
    })

    it('ignora um id_usuario enviado no body e usa o do token', async () => {
      autenticarComo({ id: 7, role: ROLE_DA_ROTA })
      progressoService.alternarProgresso.mockResolvedValue({})

      await request(app).put(caminho).send({ estudado: true, id_usuario: 999 })

      expect(progressoService.alternarProgresso).toHaveBeenCalledWith(7, tipo, '5', true)
    })

    it('bloqueia com 403 quem não tem a role exigida (admin, por exemplo)', async () => {
      autenticarComo({ id: 1, role: 'admin' })

      const res = await request(app).put(caminho).send({ estudado: true })

      expect(res.status).toBe(403)
      expect(res.body).toEqual({ message: 'Acesso negado: permissão insuficiente' })
      expect(progressoService.alternarProgresso).not.toHaveBeenCalled()
    })

    it('responde 400 quando estudado não é booleano', async () => {
      autenticarComo({ id: 7, role: ROLE_DA_ROTA })

      const res = await request(app).put(caminho).send({ estudado: 'sim' })

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'estudado deve ser true ou false' })
      expect(progressoService.alternarProgresso).not.toHaveBeenCalled()
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      autenticarComo({ id: 7, role: ROLE_DA_ROTA })
      progressoService.alternarProgresso.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).put(caminho).send({ estudado: true })

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })

  it('só aceita o método PUT: GET na rota de tópico responde 404', async () => {
    autenticarComo({ id: 7, role: ROLE_DA_ROTA })

    const res = await request(app).get('/progresso/topico/5')

    expect(res.status).toBe(404)
    expect(progressoService.alternarProgresso).not.toHaveBeenCalled()
  })
})