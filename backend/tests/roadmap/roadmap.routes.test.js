import { jest } from '@jest/globals'
import request from 'supertest'
import app from '../../app.js'
import * as roadmapService from '../../api/modules/roadmap/roadmap.service.js'
import * as topicoController from '../../api/modules/topico/topico.controller.js'
import { autenticar } from '../../api/middlewares/auth.middleware.js'

jest.mock('../../api/modules/roadmap/roadmap.service.js')
jest.mock('../../api/modules/topico/topico.controller.js')
jest.mock('../../api/middlewares/auth.middleware.js')

// Helpers para controlar o middleware de autenticação mockado, teste a teste
const autenticarComo = (user) => {
  autenticar.mockImplementation((req, res, next) => {
    req.user = user
    next()
  })
}

const semAutenticacao = () => {
  autenticar.mockImplementation((req, res) => {
    res.status(401).json({ message: 'Token não fornecido' })
  })
}

afterEach(() => {
  jest.clearAllMocks()
})

// Todas as rotas protegidas por role('admin') — compartilham a mesma regra de acesso
const rotasAdmin = [
  { method: 'get', url: '/api/roadmap/listagemAdmin' },
  { method: 'get', url: '/api/roadmap/detalheAdmin/1' },
  { method: 'get', url: '/api/roadmap/1/topicosAdmin' },
  { method: 'post', url: '/api/roadmap/criarRoadmap' },
  { method: 'put', url: '/api/roadmap/editar/1' },
  { method: 'delete', url: '/api/roadmap/deletar/1' },
  { method: 'put', url: '/api/roadmap/restaurar/1' }
]

describe('proteção comum das rotas admin de roadmap', () => {
  test.each(rotasAdmin)('$method $url retorna 401 quando não autenticado', async ({ method, url }) => {
    semAutenticacao()

    const res = await request(app)[method](url)

    expect(res.status).toBe(401)
  })

  test.each(rotasAdmin)('$method $url retorna 403 quando autenticado mas não é admin', async ({ method, url }) => {
    autenticarComo({ id: 1, role: 'cliente' })

    const res = await request(app)[method](url)

    expect(res.status).toBe(403)
  })
})

describe('GET /api/roadmap/listagem', () => {
  it('retorna 200 com os roadmaps do usuário autenticado', async () => {
    autenticarComo({ id: 7, role: 'cliente' })
    roadmapService.listarRoadmapsPublicos.mockResolvedValue([
      { id_roadmap: 1, titulo: 'A', total_unidades: 10, unidades_estudadas: 5 }
    ])

    const res = await request(app).get('/api/roadmap/listagem')

    expect(res.status).toBe(200)
    expect(roadmapService.listarRoadmapsPublicos).toHaveBeenCalledWith(7)
    expect(res.body[0]).toMatchObject({ id_roadmap: 1, progresso_percentual: 50 })
  })

  it('retorna 401 quando não autenticado (rota não é admin, mas exige login)', async () => {
    semAutenticacao()

    const res = await request(app).get('/api/roadmap/listagem')

    expect(res.status).toBe(401)
    expect(roadmapService.listarRoadmapsPublicos).not.toHaveBeenCalled()
  })
})

describe('GET /api/roadmap/detalhe/:id', () => {
  it('retorna 200 com o roadmap quando encontrado', async () => {
    autenticarComo({ id: 7, role: 'cliente' })
    roadmapService.buscarRoadmapPublicoPorId.mockResolvedValue({ id_roadmap: 1, titulo: 'X' })

    const res = await request(app).get('/api/roadmap/detalhe/1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id_roadmap: 1, titulo: 'X' })
  })

  it('retorna 404 quando não encontrado', async () => {
    autenticarComo({ id: 7, role: 'cliente' })
    roadmapService.buscarRoadmapPublicoPorId.mockResolvedValue(null)

    const res = await request(app).get('/api/roadmap/detalhe/999')

    expect(res.status).toBe(404)
  })
})

describe('GET /api/roadmap/listagemAdmin (caminho de sucesso)', () => {
  it('retorna 200 quando autenticado como admin', async () => {
    autenticarComo({ id: 1, role: 'admin' })
    roadmapService.listarRoadmapsAdmin.mockResolvedValue([{ id_roadmap: 1 }])

    const res = await request(app).get('/api/roadmap/listagemAdmin')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id_roadmap: 1 }])
  })
})

describe('GET /api/roadmap/detalheAdmin/:id (caminho de sucesso)', () => {
  it('retorna 200 quando autenticado como admin e o roadmap existe', async () => {
    autenticarComo({ id: 1, role: 'admin' })
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue({ id_roadmap: 1, titulo: 'X' })

    const res = await request(app).get('/api/roadmap/detalheAdmin/1')

    expect(res.status).toBe(200)
  })
})

describe('rotas delegadas ao módulo topico', () => {
  beforeEach(() => {
    topicoController.listagemComSubitens.mockImplementation((req, res) =>
      res.json({ topicos: 'mock-publico' })
    )
    topicoController.listagemComSubitensAdmin.mockImplementation((req, res) =>
      res.json({ topicos: 'mock-admin' })
    )
  })

  it('GET /:id/topicos exige apenas autenticação e delega ao topicoController', async () => {
    autenticarComo({ id: 7, role: 'cliente' })

    const res = await request(app).get('/api/roadmap/1/topicos')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ topicos: 'mock-publico' })
    expect(topicoController.listagemComSubitens).toHaveBeenCalled()
  })

  it('GET /:id/topicosAdmin exige role admin e delega ao topicoController', async () => {
    autenticarComo({ id: 1, role: 'admin' })

    const res = await request(app).get('/api/roadmap/1/topicosAdmin')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ topicos: 'mock-admin' })
  })
})

describe('POST /api/roadmap/criarRoadmap (caminho de sucesso)', () => {
  it('cria o roadmap quando autenticado como admin com dados válidos', async () => {
    autenticarComo({ id: 1, role: 'admin' })
    const roadmapCriado = { id_roadmap: 5, categoria_id: 1, titulo: 'Novo' }
    roadmapService.criarRoadmap.mockResolvedValue(roadmapCriado)

    const res = await request(app)
      .post('/api/roadmap/criarRoadmap')
      .send({ categoria_id: 1, titulo: 'Novo', descricao: 'desc', is_active: true })

    expect(res.status).toBe(201)
    expect(res.body).toEqual(roadmapCriado)
  })
})

describe('PUT /api/roadmap/editar/:id (caminho de sucesso)', () => {
  it('edita o roadmap quando autenticado como admin', async () => {
    autenticarComo({ id: 1, role: 'admin' })
    roadmapService.editarRoadmap.mockResolvedValue({ id_roadmap: 1, titulo: 'Editado' })

    const res = await request(app)
      .put('/api/roadmap/editar/1')
      .send({ categoria_id: 2, titulo: 'Editado', descricao: 'd', is_active: true })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id_roadmap: 1, titulo: 'Editado' })
  })
})

describe('DELETE /api/roadmap/deletar/:id (caminho de sucesso)', () => {
  it('arquiva o roadmap quando autenticado como admin', async () => {
    autenticarComo({ id: 1, role: 'admin' })
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue({ id_roadmap: 1, deleted_at: null })
    roadmapService.arquivarRoadmap.mockResolvedValue({ id_roadmap: 1, deleted_at: '2026-09-11' })

    const res = await request(app).delete('/api/roadmap/deletar/1')

    expect(res.status).toBe(200)
  })
})

describe('PUT /api/roadmap/restaurar/:id (caminho de sucesso)', () => {
  it('restaura o roadmap quando autenticado como admin', async () => {
    autenticarComo({ id: 1, role: 'admin' })
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue({ id_roadmap: 1, deleted_at: '2026-01-01' })
    roadmapService.restaurarRoadmap.mockResolvedValue({ id_roadmap: 1, deleted_at: null })

    const res = await request(app).put('/api/roadmap/restaurar/1')

    expect(res.status).toBe(200)
  })
})