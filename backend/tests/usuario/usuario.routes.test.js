import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import * as usuarioService from '../../api/modules/usuario/usuario.service.js'
import usuarioRoutes from '../../api/modules/usuario/usuario.routes.js'

// Integração routes + controller reais; só o service é mockado.
jest.mock('../../api/modules/usuario/usuario.service.js', () => ({
  __esModule: true,
  listarUsuarios: jest.fn()
}))

const app = express()
app.use(express.json())
app.use('/usuarios', usuarioRoutes)

afterEach(() => {
  jest.resetAllMocks()
})

describe('usuario.routes', () => {
  describe('GET /usuarios/listagem', () => {
    const usuarios = [
      { id_usuario: 1, email: 'ana@email.com', role: 'admin' },
      { id_usuario: 2, email: 'bruno@email.com', role: 'cliente' }
    ]

    it('responde 200 com a lista completa quando não há filtro', async () => {
      usuarioService.listarUsuarios.mockResolvedValue(usuarios)

      const res = await request(app).get('/usuarios/listagem')

      expect(usuarioService.listarUsuarios).toHaveBeenCalledWith(undefined)
      expect(res.status).toBe(200)
      expect(res.body).toEqual(usuarios)
    })

    it('repassa o email da query string ao service e responde com o resultado filtrado', async () => {
      usuarioService.listarUsuarios.mockResolvedValue([usuarios[0]])

      const res = await request(app)
        .get('/usuarios/listagem')
        .query({ email: 'ana@email.com' })

      expect(usuarioService.listarUsuarios).toHaveBeenCalledWith('ana@email.com')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([usuarios[0]])
    })

    it('responde 200 com lista vazia quando nenhum usuário é encontrado', async () => {
      usuarioService.listarUsuarios.mockResolvedValue([])

      const res = await request(app)
        .get('/usuarios/listagem')
        .query({ email: 'naoexiste@email.com' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      usuarioService.listarUsuarios.mockRejectedValue(new Error('falha de conexão'))

      const res = await request(app).get('/usuarios/listagem')

      expect(res.status).toBe(500)
      expect(res.text).toBe('falha de conexão')
    })

    it('só aceita o método GET: POST na mesma rota responde 404', async () => {
      const res = await request(app).post('/usuarios/listagem')

      expect(res.status).toBe(404)
      expect(usuarioService.listarUsuarios).not.toHaveBeenCalled()
    })

    // Pendente: hoje a rota é pública e o SELECT * expõe o hash da senha.
    // Transformar em testes reais quando a correção for feita.
    it.todo('bloqueia com 401 quando a requisição não tem token')
    it.todo('bloqueia com 403 quando o usuário não tem a role permitida')
    it.todo('não expõe o campo senha (hash) dos usuários na resposta')
  })
})