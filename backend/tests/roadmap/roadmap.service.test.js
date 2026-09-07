import { jest } from '@jest/globals'
import db from '../../db/pool.js'
import { buscarRoadmapPublicoPorId } from '../../api/modules/roadmap/roadmap.service.js'

jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

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