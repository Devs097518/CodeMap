import { jest } from '@jest/globals'
import db from '../../db/pool.js'
import {
  buscarRoadmapPublicoPorId,
  listarRoadmapsAdmin,
  buscarRoadmapAdminPorId,
  listarRoadmapsPublicos,
  criarRoadmap,
  editarRoadmap,
  arquivarRoadmap,
  restaurarRoadmap
} from '../../api/modules/roadmap/roadmap.service.js'

jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

afterEach(() => {
  jest.clearAllMocks()
})

describe('buscarRoadmapPublicoPorId', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('retorna o roadmap quando encontrado', async () => {
    const roadmapFake = { id_roadmap: 1, titulo: 'Front-end Básico' }
    db.query.mockResolvedValue({ rows: [roadmapFake] })

    const resultado = await buscarRoadmapPublicoPorId(1)

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE roadmap.id_roadmap = $1'),
      [1]
    )
    expect(resultado).toEqual(roadmapFake)
  })

  it('retorna null quando não encontra nenhuma linha', async () => {
    db.query.mockResolvedValue({ rows: [] })

    const resultado = await buscarRoadmapPublicoPorId(999)

    expect(resultado).toBeNull()
  })
})

describe('listarRoadmapsAdmin', () => {
  it('monta a query sem filtros por padrão (exclui arquivados)', async () => {
    db.query.mockResolvedValue({ rows: [] })

    await listarRoadmapsAdmin()

    const [queryChamada, paramsChamados] = db.query.mock.calls[0]
    expect(queryChamada).toContain('deleted_at IS NULL')
    expect(queryChamada).not.toContain('categoria_id =')
    expect(paramsChamados).toEqual([])
  })

  it('inclui filtro de categoria quando categoria_id é passado', async () => {
    db.query.mockResolvedValue({ rows: [] })

    await listarRoadmapsAdmin({ categoria_id: 5 })

    const [queryChamada, paramsChamados] = db.query.mock.calls[0]
    expect(queryChamada).toContain('categoria_id = $1')
    expect(paramsChamados).toEqual([5])
  })

  it('não filtra deleted_at quando incluirArquivados é true', async () => {
    db.query.mockResolvedValue({ rows: [] })

    await listarRoadmapsAdmin({ incluirArquivados: true })

    const [queryChamada] = db.query.mock.calls[0]
    expect(queryChamada).not.toContain('deleted_at IS NULL')
  })
})

describe('buscarRoadmapAdminPorId', () => {
  it('retorna o roadmap quando encontrado', async () => {
    const roadmapFake = { id_roadmap: 2, titulo: 'Backend Avançado' }
    db.query.mockResolvedValue({ rows: [roadmapFake] })

    const resultado = await buscarRoadmapAdminPorId(2)

    expect(resultado).toEqual(roadmapFake)
  })

  it('retorna null quando não encontra', async () => {
    db.query.mockResolvedValue({ rows: [] })

    const resultado = await buscarRoadmapAdminPorId(999)

    expect(resultado).toBeNull()
  })
})

describe('listarRoadmapsPublicos', () => {
  it('retorna a lista de roadmaps com progresso do usuário', async () => {
    const listaFake = [{ id_roadmap: 1, total_unidades: 10, unidades_estudadas: 3 }]
    db.query.mockResolvedValue({ rows: listaFake })

    const resultado = await listarRoadmapsPublicos(7)

    expect(db.query).toHaveBeenCalledWith(expect.any(String), [7])
    expect(resultado).toEqual(listaFake)
  })
})

describe('criarRoadmap', () => {
  it('cria e retorna o roadmap com os dados corretos', async () => {
    const roadmapCriado = { id_roadmap: 3, categoria_id: 1, titulo: 'Novo', descricao: 'x', is_active: true }
    db.query.mockResolvedValue({ rows: [roadmapCriado] })

    const resultado = await criarRoadmap(1, 'Novo', 'x', true)

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.roadmap'),
      [1, 'Novo', 'x', true]
    )
    expect(resultado).toEqual(roadmapCriado)
  })
})

describe('editarRoadmap', () => {
  it('atualiza e retorna o roadmap quando ele existe', async () => {
    const roadmapEditado = { id_roadmap: 1, titulo: 'Editado' }
    db.query.mockResolvedValue({ rows: [roadmapEditado] })

    const resultado = await editarRoadmap(1, 2, 'Editado', 'desc', false)

    expect(resultado).toEqual(roadmapEditado)
  })

  it('retorna null quando o roadmap não existe (ou já foi deletado)', async () => {
    db.query.mockResolvedValue({ rows: [] })

    const resultado = await editarRoadmap(999, 2, 'x', 'y', true)

    expect(resultado).toBeNull()
  })
})

describe('arquivarRoadmap e restaurarRoadmap', () => {
  it('arquivarRoadmap seta deleted_at e retorna a linha atualizada', async () => {
    const roadmapArquivado = { id_roadmap: 1, deleted_at: '2026-09-07T00:00:00Z' }
    db.query.mockResolvedValue({ rows: [roadmapArquivado] })

    const resultado = await arquivarRoadmap(1)

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('deleted_at = NOW()'), [1])
    expect(resultado).toEqual(roadmapArquivado)
  })

  it('restaurarRoadmap limpa deleted_at e retorna a linha atualizada', async () => {
    const roadmapRestaurado = { id_roadmap: 1, deleted_at: null }
    db.query.mockResolvedValue({ rows: [roadmapRestaurado] })

    const resultado = await restaurarRoadmap(1)

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('deleted_at = NULL'), [1])
    expect(resultado).toEqual(roadmapRestaurado)
  })
})
