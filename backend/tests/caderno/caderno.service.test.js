import { jest } from '@jest/globals'
import db from '../../db/pool.js'
import {
  listarCadernos,
  criarCaderno,
  editarCaderno,
  deletarCaderno
} from '../../api/modules/caderno/caderno.service.js'

// O service é testado isolado do banco: o pool é mockado.
jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('caderno.service', () => {
  const cadernos = [
    { id_caderno: 1, id_usuario: 7, titulo: 'Node.js' },
    { id_caderno: 2, id_usuario: 8, titulo: 'SQL' }
  ]

  describe('listarCadernos', () => {
    it('filtra pelo usuário dono quando o id_usuario é informado', async () => {
      db.query.mockResolvedValue({ rows: [cadernos[0]] })

      const resultado = await listarCadernos(7)

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM caderno WHERE id_usuario = $1',
        [7]
      )
      expect(resultado).toEqual([cadernos[0]])
    })

    it('lista os cadernos de todos os usuários quando o id_usuario não é informado', async () => {
      db.query.mockResolvedValue({ rows: cadernos })

      const resultado = await listarCadernos()

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM caderno', [])
      expect(resultado).toEqual(cadernos)
    })

    it('retorna lista vazia quando o usuário não tem cadernos', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await listarCadernos(99)

      expect(resultado).toEqual([])
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(listarCadernos(7)).rejects.toThrow('falha de conexão')
    })
  })

  describe('criarCaderno', () => {
    it('cria o caderno associado ao usuário dono e retorna o registro criado', async () => {
      const criado = { id_caderno: 3, id_usuario: 7, titulo: 'Redes' }
      db.query.mockResolvedValue({ rows: [criado] })

      const resultado = await criarCaderno(7, 'Redes')

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO public.caderno (id_usuario, titulo) VALUES ($1, $2) RETURNING *',
        [7, 'Redes']
      )
      expect(resultado).toEqual(criado)
    })

    it('envia o título como parâmetro, nunca dentro do texto do SQL', async () => {
      db.query.mockResolvedValue({ rows: [{}] })
      const tituloMalicioso = "'); DROP TABLE caderno; --"

      await criarCaderno(7, tituloMalicioso)

      const [sql, params] = db.query.mock.calls[0]
      expect(sql).not.toContain(tituloMalicioso)
      expect(params).toEqual([7, tituloMalicioso])
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(criarCaderno(7, 'Redes')).rejects.toThrow('falha de conexão')
    })
  })

  describe('editarCaderno', () => {
    it('atualiza o título do caderno e retorna o registro atualizado', async () => {
      const atualizado = { id_caderno: 1, id_usuario: 7, titulo: 'Node.js avançado' }
      db.query.mockResolvedValue({ rows: [atualizado] })

      const resultado = await editarCaderno(1, 'Node.js avançado')

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE public.caderno SET titulo = $1 WHERE id_caderno = $2 RETURNING *',
        ['Node.js avançado', 1]
      )
      expect(resultado).toEqual(atualizado)
    })

    it('retorna null quando o caderno não existe', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await editarCaderno(999, 'Qualquer')

      expect(resultado).toBeNull()
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(editarCaderno(1, 'Novo')).rejects.toThrow('falha de conexão')
    })

    // Pendente: o UPDATE filtra só por id_caderno, então o service sozinho não
    // impede editar o caderno de outro usuário (a checagem de dono, se existir,
    // precisa estar no controller). Resolver na issue dos pendentes.
    it.todo('só edita o caderno quando ele pertence ao usuário informado')
  })

  describe('deletarCaderno', () => {
    it('remove o caderno e retorna o registro removido', async () => {
      db.query.mockResolvedValue({ rows: [cadernos[0]] })

      const resultado = await deletarCaderno(1)

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM public.caderno WHERE id_caderno = $1 RETURNING *',
        [1]
      )
      expect(resultado).toEqual(cadernos[0])
    })

    it('retorna null quando o caderno não existe', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await deletarCaderno(999)

      expect(resultado).toBeNull()
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(deletarCaderno(1)).rejects.toThrow('falha de conexão')
    })

    // Pendente: mesmo caso do editarCaderno, o DELETE filtra só por id_caderno.
    it.todo('só remove o caderno quando ele pertence ao usuário informado')
  })
})