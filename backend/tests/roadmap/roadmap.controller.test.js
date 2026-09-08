import { jest } from '@jest/globals'
import * as roadmapService from '../../api/modules/roadmap/roadmap.service.js'
import {
  listagem,
  listagemAdmin,
  detalhe,
  detalheAdmin,
  novo,
  editar,
  deletar,
  restaurar
} from '../../api/modules/roadmap/roadmap.controller.js'

jest.mock('../../api/modules/roadmap/roadmap.service.js')

const criarResMock = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('listagem', () => {
  it('calcula iniciado e progresso_percentual corretamente', async () => {
    const req = { user: { id: 7 } }
    const res = criarResMock()
    roadmapService.listarRoadmapsPublicos.mockResolvedValue([
      { id_roadmap: 1, titulo: 'A', total_unidades: 10, unidades_estudadas: 5 },
      { id_roadmap: 2, titulo: 'B', total_unidades: 0, unidades_estudadas: 0 }
    ])

    await listagem(req, res)

    expect(roadmapService.listarRoadmapsPublicos).toHaveBeenCalledWith(7)
    expect(res.json).toHaveBeenCalledWith([
      { id_roadmap: 1, titulo: 'A', iniciado: true, progresso_percentual: 50 },
      { id_roadmap: 2, titulo: 'B', iniciado: false, progresso_percentual: 0 }
    ])
  })

  it('retorna 500 se o service lançar erro', async () => {
    const req = { user: { id: 7 } }
    const res = criarResMock()
    roadmapService.listarRoadmapsPublicos.mockRejectedValue(new Error('falha no banco'))

    await listagem(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha no banco' })
  })
})

describe('listagemAdmin', () => {
  it('repassa categoria_id e arquivados=true corretamente pro service', async () => {
    const req = { query: { categoria_id: '3', arquivados: 'true' } }
    const res = criarResMock()
    roadmapService.listarRoadmapsAdmin.mockResolvedValue([{ id_roadmap: 1 }])

    await listagemAdmin(req, res)

    expect(roadmapService.listarRoadmapsAdmin).toHaveBeenCalledWith({
      categoria_id: '3',
      incluirArquivados: true
    })
    expect(res.json).toHaveBeenCalledWith([{ id_roadmap: 1 }])
  })

  it('trata arquivados ausente como false', async () => {
    const req = { query: {} }
    const res = criarResMock()
    roadmapService.listarRoadmapsAdmin.mockResolvedValue([])

    await listagemAdmin(req, res)

    expect(roadmapService.listarRoadmapsAdmin).toHaveBeenCalledWith({
      categoria_id: undefined,
      incluirArquivados: false
    })
  })

  it('retorna 500 se o service lançar erro', async () => {
    const req = { query: {} }
    const res = criarResMock()
    roadmapService.listarRoadmapsAdmin.mockRejectedValue(new Error('falha'))

    await listagemAdmin(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })
})

describe('detalhe', () => {
  it('retorna o roadmap quando encontrado', async () => {
    const req = { params: { id: '1' } }
    const res = criarResMock()
    const roadmapFake = { id_roadmap: 1, titulo: 'X' }
    roadmapService.buscarRoadmapPublicoPorId.mockResolvedValue(roadmapFake)

    await detalhe(req, res)

    expect(res.json).toHaveBeenCalledWith(roadmapFake)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('retorna 404 quando não encontrado', async () => {
    const req = { params: { id: '999' } }
    const res = criarResMock()
    roadmapService.buscarRoadmapPublicoPorId.mockResolvedValue(null)

    await detalhe(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'Roadmap não encontrado' })
  })
})

describe('detalheAdmin', () => {
  it('retorna o roadmap quando encontrado', async () => {
    const req = { params: { id: '1' } }
    const res = criarResMock()
    const roadmapFake = { id_roadmap: 1, titulo: 'X' }
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue(roadmapFake)

    await detalheAdmin(req, res)

    expect(res.json).toHaveBeenCalledWith(roadmapFake)
  })

  it('retorna 404 quando não encontrado', async () => {
    const req = { params: { id: '999' } }
    const res = criarResMock()
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue(null)

    await detalheAdmin(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })
})

describe('novo', () => {
  it('cria o roadmap quando categoria_id e titulo estão presentes', async () => {
    const req = { body: { categoria_id: 1, titulo: 'Novo', descricao: 'desc', is_active: true } }
    const res = criarResMock()
    const roadmapCriado = { id_roadmap: 5, ...req.body }
    roadmapService.criarRoadmap.mockResolvedValue(roadmapCriado)

    await novo(req, res)

    expect(roadmapService.criarRoadmap).toHaveBeenCalledWith(1, 'Novo', 'desc', true)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(roadmapCriado)
  })

  it('retorna 400 quando titulo está faltando', async () => {
    const req = { body: { categoria_id: 1 } }
    const res = criarResMock()

    await novo(req, res)

    expect(roadmapService.criarRoadmap).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('retorna 400 com mensagem específica quando categoria não existe (erro 23503)', async () => {
    const req = { body: { categoria_id: 999, titulo: 'X' } }
    const res = criarResMock()
    const erroPostgres = new Error('violates foreign key constraint')
    erroPostgres.code = '23503'
    roadmapService.criarRoadmap.mockRejectedValue(erroPostgres)

    await novo(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'Categoria informada não existe' })
  })
})

describe('editar', () => {
  it('edita o roadmap quando categoria_id e titulo estão presentes', async () => {
    const req = { params: { id: '1' }, body: { categoria_id: 2, titulo: 'Editado', descricao: 'd', is_active: true } }
    const res = criarResMock()
    const roadmapEditado = { id_roadmap: 1, titulo: 'Editado' }
    roadmapService.editarRoadmap.mockResolvedValue(roadmapEditado)

    await editar(req, res)

    expect(roadmapService.editarRoadmap).toHaveBeenCalledWith('1', 2, 'Editado', 'd', true)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(roadmapEditado)
  })

  it('retorna 400 quando titulo está faltando', async () => {
    const req = { params: { id: '1' }, body: { categoria_id: 2 } }
    const res = criarResMock()

    await editar(req, res)

    expect(roadmapService.editarRoadmap).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('retorna 404 quando o roadmap não existe', async () => {
    const req = { params: { id: '999' }, body: { categoria_id: 2, titulo: 'X' } }
    const res = criarResMock()
    roadmapService.editarRoadmap.mockResolvedValue(null)

    await editar(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('retorna 400 com mensagem específica quando categoria não existe (erro 23503)', async () => {
    const req = { params: { id: '1' }, body: { categoria_id: 999, titulo: 'X' } }
    const res = criarResMock()
    const erroPostgres = new Error('violates foreign key constraint')
    erroPostgres.code = '23503'
    roadmapService.editarRoadmap.mockRejectedValue(erroPostgres)

    await editar(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'Categoria informada não existe' })
  })
})

describe('deletar', () => {
  it('arquiva o roadmap quando ele existe e não está arquivado', async () => {
    const req = { params: { id: '1' } }
    const res = criarResMock()
    const roadmapAtivo = { id_roadmap: 1, deleted_at: null }
    const roadmapArquivado = { id_roadmap: 1, deleted_at: '2026-09-08' }
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue(roadmapAtivo)
    roadmapService.arquivarRoadmap.mockResolvedValue(roadmapArquivado)

    await deletar(req, res)

    expect(roadmapService.arquivarRoadmap).toHaveBeenCalledWith('1')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(roadmapArquivado)
  })

  it('retorna 404 quando o roadmap não existe', async () => {
    const req = { params: { id: '999' } }
    const res = criarResMock()
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue(null)

    await deletar(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(roadmapService.arquivarRoadmap).not.toHaveBeenCalled()
  })

  it('retorna 409 quando o roadmap já está arquivado', async () => {
    const req = { params: { id: '1' } }
    const res = criarResMock()
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue({ id_roadmap: 1, deleted_at: '2026-01-01' })

    await deletar(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(roadmapService.arquivarRoadmap).not.toHaveBeenCalled()
  })
})

describe('restaurar', () => {
  it('restaura o roadmap quando ele existe e está arquivado', async () => {
    const req = { params: { id: '1' } }
    const res = criarResMock()
    const roadmapArquivado = { id_roadmap: 1, deleted_at: '2026-01-01' }
    const roadmapRestaurado = { id_roadmap: 1, deleted_at: null }
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue(roadmapArquivado)
    roadmapService.restaurarRoadmap.mockResolvedValue(roadmapRestaurado)

    await restaurar(req, res)

    expect(roadmapService.restaurarRoadmap).toHaveBeenCalledWith('1')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(roadmapRestaurado)
  })

  it('retorna 404 quando o roadmap não existe', async () => {
    const req = { params: { id: '999' } }
    const res = criarResMock()
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue(null)

    await restaurar(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('retorna 409 quando o roadmap já está ativo', async () => {
    const req = { params: { id: '1' } }
    const res = criarResMock()
    roadmapService.buscarRoadmapAdminPorId.mockResolvedValue({ id_roadmap: 1, deleted_at: null })

    await restaurar(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(roadmapService.restaurarRoadmap).not.toHaveBeenCalled()
  })
})