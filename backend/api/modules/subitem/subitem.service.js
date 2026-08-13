import db from '../../../db/pool.js'
import * as progressoService from '../progresso/progresso.service.js'

export const listarSubitensPorTopico = async (topico_id) => {
  const { rows } = await db.query(
    'SELECT * FROM subitem WHERE topico_id = $1 ORDER BY ordem ASC',
    [topico_id]
  )
  return rows
}

export const criarSubitem = async (topico_id, titulo, descricao) => {
  const { rows } = await db.query(
    `INSERT INTO public.subitem (topico_id, titulo, descricao, ordem)
     VALUES ($1, $2, $3, COALESCE((SELECT MAX(ordem) FROM subitem WHERE topico_id = $1), 0) + 1)
     RETURNING *`,
    [topico_id, titulo, descricao]
  )
  return rows[0]
}

export const editarSubitem = async (id, titulo, descricao) => {
  const result = await db.query(
    'UPDATE public.subitem SET titulo = $1, descricao = $2 WHERE id_subitem = $3 RETURNING *',
    [titulo, descricao, id]
  )
  return result.rows[0] || null
}

export const excluirSubitem = async (id) => {
  const result = await db.query('DELETE FROM public.subitem WHERE id_subitem = $1 RETURNING *', [id])
  const subitem = result.rows[0] || null

  if (subitem) {
    await progressoService.excluirProgressoPorItem('subitem', id)
  }

  return subitem
}

export const moverSubitem = async (id, direcao) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows: atualRows } = await client.query(
      'SELECT * FROM subitem WHERE id_subitem = $1 FOR UPDATE',
      [id]
    )
    const atual = atualRows[0]
    if (!atual) {
      await client.query('ROLLBACK')
      return { encontrado: false }
    }

    const operador = direcao === 'cima' ? '<' : '>'
    const ordenacao = direcao === 'cima' ? 'DESC' : 'ASC'

    const { rows: vizinhoRows } = await client.query(
      `SELECT * FROM subitem WHERE topico_id = $1 AND ordem ${operador} $2 ORDER BY ordem ${ordenacao} LIMIT 1 FOR UPDATE`,
      [atual.topico_id, atual.ordem]
    )
    const vizinho = vizinhoRows[0]
    if (!vizinho) {
      await client.query('ROLLBACK')
      return { encontrado: true, semMovimento: true }
    }

    await client.query('UPDATE subitem SET ordem = -1 WHERE id_subitem = $1', [atual.id_subitem])
    await client.query('UPDATE subitem SET ordem = $1 WHERE id_subitem = $2', [atual.ordem, vizinho.id_subitem])
    await client.query('UPDATE subitem SET ordem = $1 WHERE id_subitem = $2', [vizinho.ordem, atual.id_subitem])

    await client.query('COMMIT')
    return { encontrado: true, semMovimento: false }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}