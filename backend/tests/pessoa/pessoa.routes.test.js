import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import * as pessoaService from '../../api/modules/pessoa/pessoa.service.js'
import pessoaRoutes from '../../api/modules/pessoa/pessoa.routes.js'

// Integração routes + controller reais; só o service é mockado (sem banco).
jest.mock('../../api/modules/pessoa/pessoa.service.js', () => ({
  __esModule: true,
  listarPessoas: jest.fn()
}))

const app = express()
app.use(express.json())
app.use('/pessoas', pessoaRoutes)

afterEach(() => {
  jest.resetAllMocks()
})

describe('pessoa.routes', () => {
  describe('GET /pessoas/listagem', () => {
    const pessoas = [
      { id_pessoa: 1, username: 'ana', uf: 'PE', id_usuario: 10 },
      { id_pessoa: 2, username: 'bruno', uf: 'SP', id_usuario: 11 }
    ]

    it('responde 200 com a lista de pessoas', async () => {
      pessoaService.listarPessoas.mockResolvedValue(pessoas)

      const res = await request(app).get('/pessoas/listagem')

      expect(pessoaService.listarPessoas).toHaveBeenCalledTimes(1)
      expect(res.status).toBe(200)
      expect(res.body).toEqual(pessoas)
    })

    it('responde 200 com lista vazia quando não há pessoas cadastradas', async () => {
      pessoaService.listarPessoas.mockResolvedValue([])

      const res = await request(app).get('/pessoas/listagem')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      pessoaService.listarPessoas.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).get('/pessoas/listagem')

      expect(res.status).toBe(500)
      expect(res.text).toBe('falha de conexão')
    })

    it('só aceita o método GET: POST na mesma rota responde 404', async () => {
      const res = await request(app).post('/pessoas/listagem')

      expect(res.status).toBe(404)
      expect(pessoaService.listarPessoas).not.toHaveBeenCalled()
    })
  })
})