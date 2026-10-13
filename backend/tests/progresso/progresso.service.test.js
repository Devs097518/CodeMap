import { jest } from '@jest/globals'
import db from '../../db/pool.js'
import {
  alternarProgresso,
  excluirProgressoPorItem,
  buscarProgressoTopicos,
  buscarProgressoSubitens
} from '../../api/modules/progresso/progresso.service.js'

// O service é testado isolado do banco: o pool é mockado.
jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('progresso.service', () => {
  describe('tipos polimórficos (topico e subitem)', () => {
    describe('alternarProgresso', () => {
      it.each(['topico', 'subitem'])('grava o progresso com o tipo %s', async (tipo) => {
        const linha = { id_usuario: 1, tipo, item_id: 5, estudado: true }
        db.query.mockResolvedValue({ rows: [linha] })

        const resultado = await alternarProgresso(1, tipo, 5, true)

        expect(db.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO public.progresso'),
          [1, tipo, 5, true]
        )
        expect(resultado).toEqual(linha)
      })

      it('inclui o tipo na chave de conflito, então topico e subitem com o mesmo item_id não se sobrescrevem', async () => {
        db.query.mockResolvedValue({ rows: [{}] })

        await alternarProgresso(1, 'subitem', 5, true)

        expect(db.query.mock.calls[0][0]).toContain('ON CONFLICT (id_usuario, tipo, item_id)')
      })
    })

    describe('excluirProgressoPorItem', () => {
      it.each(['topico', 'subitem'])('remove o progresso do item do tipo %s', async (tipo) => {
        db.query.mockResolvedValue({})

        const resultado = await excluirProgressoPorItem(tipo, 5)

        expect(db.query).toHaveBeenCalledWith(
          'DELETE FROM public.progresso WHERE tipo = $1 AND item_id = $2',
          [tipo, 5]
        )
        expect(resultado).toBeUndefined()
      })

      it('remove o progresso do item para todos os usuários, sem filtrar por usuário', async () => {
        db.query.mockResolvedValue({})

        await excluirProgressoPorItem('topico', 5)

        expect(db.query.mock.calls[0][0]).not.toContain('id_usuario')
      })
    })

    describe('buscarProgressoTopicos', () => {
      it('busca só o progresso do tipo topico do usuário informado', async () => {
        const linhas = [
          { item_id: 1, estudado: true },
          { item_id: 2, estudado: false }
        ]
        db.query.mockResolvedValue({ rows: linhas })

        const resultado = await buscarProgressoTopicos(1, [1, 2])

        expect(db.query).toHaveBeenCalledWith(expect.stringContaining("tipo = 'topico'"), [1, [1, 2]])
        expect(db.query.mock.calls[0][0]).not.toContain('subitem')
        expect(resultado).toEqual(linhas)
      })

      it('retorna lista vazia sem consultar o banco quando não há ids', async () => {
        const resultado = await buscarProgressoTopicos(1, [])

        expect(resultado).toEqual([])
        expect(db.query).not.toHaveBeenCalled()
      })
    })

    describe('buscarProgressoSubitens', () => {
      it('busca só o progresso do tipo subitem do usuário informado', async () => {
        const linhas = [
          { item_id: 7, estudado: true },
          { item_id: 8, estudado: false }
        ]
        db.query.mockResolvedValue({ rows: linhas })

        const resultado = await buscarProgressoSubitens(1, [7, 8])

        expect(db.query).toHaveBeenCalledWith(expect.stringContaining("tipo = 'subitem'"), [1, [7, 8]])
        expect(db.query.mock.calls[0][0]).not.toContain('topico')
        expect(resultado).toEqual(linhas)
      })

      it('retorna lista vazia sem consultar o banco quando não há ids', async () => {
        const resultado = await buscarProgressoSubitens(1, [])

        expect(resultado).toEqual([])
        expect(db.query).not.toHaveBeenCalled()
      })
    })

    it.each([
      ['alternarProgresso', () => alternarProgresso(1, 'topico', 5, true)],
      ['excluirProgressoPorItem', () => excluirProgressoPorItem('topico', 5)],
      ['buscarProgressoTopicos', () => buscarProgressoTopicos(1, [1])],
      ['buscarProgressoSubitens', () => buscarProgressoSubitens(1, [1])]
    ])('%s propaga o erro quando o banco falha', async (_nome, chamar) => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(chamar()).rejects.toThrow('falha de conexão')
    })
  })

  describe('marcar e desmarcar como estudado', () => {
    it('marca como estudado: envia estudado = true e retorna o registro gravado', async () => {
      const linha = { id_usuario: 1, tipo: 'topico', item_id: 5, estudado: true }
      db.query.mockResolvedValue({ rows: [linha] })

      const resultado = await alternarProgresso(1, 'topico', 5, true)

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [1, 'topico', 5, true])
      expect(resultado).toEqual(linha)
      expect(resultado.estudado).toBe(true)
    })

    it('desmarca: envia estudado = false e retorna o registro atualizado', async () => {
      const linha = { id_usuario: 1, tipo: 'topico', item_id: 5, estudado: false }
      db.query.mockResolvedValue({ rows: [linha] })

      const resultado = await alternarProgresso(1, 'topico', 5, false)

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [1, 'topico', 5, false])
      expect(resultado).toEqual(linha)
      expect(resultado.estudado).toBe(false)
    })

    it('usa upsert: se o registro já existe, atualiza o estudado em vez de duplicar', async () => {
      db.query.mockResolvedValue({ rows: [{}] })

      await alternarProgresso(1, 'subitem', 8, true)

      const [sql] = db.query.mock.calls[0]
      expect(sql).toContain('ON CONFLICT (id_usuario, tipo, item_id)')
      expect(sql).toContain('DO UPDATE SET estudado = $4')
      expect(sql).toContain('RETURNING *')
    })

    it('marcar e depois desmarcar o mesmo item faz duas gravações com valores opostos', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ item_id: 5, estudado: true }] })
        .mockResolvedValueOnce({ rows: [{ item_id: 5, estudado: false }] })

      const marcado = await alternarProgresso(1, 'topico', 5, true)
      const desmarcado = await alternarProgresso(1, 'topico', 5, false)

      expect(db.query).toHaveBeenCalledTimes(2)
      expect(db.query.mock.calls[0][1]).toEqual([1, 'topico', 5, true])
      expect(db.query.mock.calls[1][1]).toEqual([1, 'topico', 5, false])
      expect(marcado.estudado).toBe(true)
      expect(desmarcado.estudado).toBe(false)
    })

    it('grava o progresso para o usuário informado, sem misturar usuários', async () => {
      db.query.mockResolvedValue({ rows: [{}] })

      await alternarProgresso(1, 'topico', 5, true)
      await alternarProgresso(2, 'topico', 5, true)

      expect(db.query.mock.calls[0][1][0]).toBe(1)
      expect(db.query.mock.calls[1][1][0]).toBe(2)
    })

    it('propaga o erro quando o banco falha ao gravar', async () => {
      db.query.mockRejectedValue(new Error('falha de conexão'))

      await expect(alternarProgresso(1, 'topico', 5, true)).rejects.toThrow('falha de conexão')
    })
  })
})