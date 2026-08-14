import db from '../../../db/pool.js'
import * as subitemService from '../subitem/subitem.service.js'
import * as progressoService from '../progresso/progresso.service.js'

export const listarTopicosPorRoadmap = async (roadmap_id) => {
  const { rows } = await db.query(
    'SELECT * FROM topico WHERE roadmap_id = $1 ORDER BY ordem ASC',
    [roadmap_id]
  )
  return rows
}

export const criarTopico = async (roadmap_id, titulo, descricao) => {
  const { rows } = await db.query(
    `INSERT INTO public.topico (roadmap_id, titulo, descricao, ordem)
     VALUES ($1, $2, $3, COALESCE((SELECT MAX(ordem) FROM topico WHERE roadmap_id = $1), 0) + 1)
     RETURNING *`,
    [roadmap_id, titulo, descricao]
  )
  return rows[0]
}

export const editarTopico = async (id, titulo, descricao) => {
  const result = await db.query(
    'UPDATE public.topico SET titulo = $1, descricao = $2 WHERE id_topico = $3 RETURNING *',
    [titulo, descricao, id]
  )
  return result.rows[0] || null
}

export const excluirTopico = async (id) => {
  const subitens = await subitemService.listarSubitensPorTopico(id)

  const result = await db.query('DELETE FROM public.topico WHERE id_topico = $1 RETURNING *', [id])
  const topico = result.rows[0] || null

  if (topico) {
    await progressoService.excluirProgressoPorItem('topico', id)

    for (const subitem of subitens) {
      await progressoService.excluirProgressoPorItem('subitem', subitem.id_subitem)
    }
  }

  return topico
}

export const moverTopico = async (id, direcao) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows: atualRows } = await client.query(
      'SELECT * FROM topico WHERE id_topico = $1 FOR UPDATE',
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
      `SELECT * FROM topico WHERE roadmap_id = $1 AND ordem ${operador} $2 ORDER BY ordem ${ordenacao} LIMIT 1 FOR UPDATE`,
      [atual.roadmap_id, atual.ordem]
    )
    const vizinho = vizinhoRows[0]
    if (!vizinho) {
      await client.query('ROLLBACK')
      return { encontrado: true, semMovimento: true }
    }

    await client.query('UPDATE topico SET ordem = -1 WHERE id_topico = $1', [atual.id_topico])
    await client.query('UPDATE topico SET ordem = $1 WHERE id_topico = $2', [atual.ordem, vizinho.id_topico])
    await client.query('UPDATE topico SET ordem = $1 WHERE id_topico = $2', [vizinho.ordem, atual.id_topico])

    await client.query('COMMIT')
    return { encontrado: true, semMovimento: false }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}