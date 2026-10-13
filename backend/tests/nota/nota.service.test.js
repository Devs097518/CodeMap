import { jest } from '@jest/globals'
import db from '../../db/pool.js'
import {
  listarNotas,
  listarNotaPorUsuario,
  criarNota,
  editarNota,
  deletarNota
} from '../../api/modules/nota/nota.service.js'

// O service é testado isolado do banco: o pool é mockado.
jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('nota.service', () => {
  const notas = [
    { id_nota: 1, id_caderno: 3, id_usuario: 7, titulo: 'Closures', conteudo: 'Escopo léxico' },
    { id_nota: 2, id_caderno: 4, id_usuario: 7, titulo: 'Joins', conteudo: 'INNER e LEFT' }
  ]

  describe('listarNotas', () => {
    it('filtra pelo caderno pai quando o id_caderno é informado', async () => {
      db.query.mockResolvedValue({ rows: [notas[0]] })

      const resultado = await listarNotas(3)

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM nota WHERE id_caderno = $1', [3])
      expect(resultado).toEqual([notas[0]])
    })

    it('lista as notas de todos os cadernos quando o id_caderno não é informado', async () => {
      db.query.mockResolvedValue({ rows: notas })

      const resultado = await listarNotas()

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM nota', [])
      expect(resultado).toEqual(notas)
    })

    it('retorna lista vazia quando o caderno não tem notas', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await listarNotas(99)

      expect(resultado).toEqual([])
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(listarNotas(3)).rejects.toThrow('falha de conexão')
    })
  })

  describe('listarNotaPorUsuario', () => {
    it('consulta as notas pelo id_usuario e retorna a nota encontrada', async () => {
      db.query.mockResolvedValue({ rows: [notas[0]] })

      const resultado = await listarNotaPorUsuario(7)

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM public.nota WHERE id_usuario = $1',
        [7]
      )
      expect(resultado).toEqual(notas[0])
    })

    it('devolve apenas a primeira nota quando o usuário tem várias', async () => {
      db.query.mockResolvedValue({ rows: notas })

      const resultado = await listarNotaPorUsuario(7)

      expect(resultado).toEqual(notas[0])
    })

    it('retorna null quando o usuário não tem notas', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await listarNotaPorUsuario(99)

      expect(resultado).toBeNull()
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(listarNotaPorUsuario(7)).rejects.toThrow('falha de conexão')
    })
  })

  describe('criarNota', () => {
    it('cria a nota associada ao caderno pai e retorna o registro criado', async () => {
      const criada = { id_nota: 3, id_caderno: 3, titulo: 'Closures', conteudo: 'Escopo léxico' }
      db.query.mockResolvedValue({ rows: [criada] })

      const resultado = await criarNota('Escopo léxico', 3, 'Closures')

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO public.nota (conteudo, id_caderno, titulo) VALUES ($1, $2, $3) RETURNING *',
        ['Escopo léxico', 3, 'Closures']
      )
      expect(resultado).toEqual(criada)
    })

    it('envia conteúdo e título como parâmetros, nunca dentro do texto do SQL', async () => {
      db.query.mockResolvedValue({ rows: [{}] })
      const malicioso = "'); DROP TABLE nota; --"

      await criarNota(malicioso, 3, malicioso)

      const [sql, params] = db.query.mock.calls[0]
      expect(sql).not.toContain(malicioso)
      expect(params).toEqual([malicioso, 3, malicioso])
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(criarNota('texto', 3, 'Título')).rejects.toThrow('falha de conexão')
    })

    // Pendente: o INSERT usa o id_caderno recebido sem conferir se o caderno é do usuário.
    it.todo('só cria a nota em um caderno que pertence ao usuário')
  })

  describe('editarNota', () => {
    it('atualiza conteúdo e título da nota e retorna o registro atualizado', async () => {
      const atualizada = { ...notas[0], titulo: 'Closures II', conteudo: 'Novo texto' }
      db.query.mockResolvedValue({ rows: [atualizada] })

      const resultado = await editarNota(1, 'Novo texto', 'Closures II')

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE public.nota SET conteudo = $1, titulo = $2 WHERE id_nota = $3 RETURNING *',
        ['Novo texto', 'Closures II', 1]
      )
      expect(resultado).toEqual(atualizada)
    })

    it('retorna null quando a nota não existe', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await editarNota(999, 'texto', 'Título')

      expect(resultado).toBeNull()
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(editarNota(1, 'texto', 'Título')).rejects.toThrow('falha de conexão')
    })

    // Pendente: o UPDATE filtra só por id_nota, sem conferir o dono do caderno pai.
    it.todo('só edita a nota quando o caderno pai pertence ao usuário')
  })

  describe('deletarNota', () => {
    it('remove a nota e retorna o registro removido', async () => {
      db.query.mockResolvedValue({ rows: [notas[0]] })

      const resultado = await deletarNota(1)

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM public.nota WHERE id_nota = $1 RETURNING *',
        [1]
      )
      expect(resultado).toEqual(notas[0])
    })

    it('retorna null quando a nota não existe', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const resultado = await deletarNota(999)

      expect(resultado).toBeNull()
    })

    it('propaga o erro quando o banco falha', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(deletarNota(1)).rejects.toThrow('falha de conexão')
    })

    // Pendente: o DELETE filtra só por id_nota, sem conferir o dono do caderno pai.
    it.todo('só remove a nota quando o caderno pai pertence ao usuário')
  })
})