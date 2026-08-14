import db from '../../../db/pool.js'

export const alternarProgresso = async (id_usuario, tipo, item_id, estudado) => {
  const { rows } = await db.query(
    `INSERT INTO public.progresso (id_usuario, tipo, item_id, estudado)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id_usuario, tipo, item_id)
     DO UPDATE SET estudado = $4
     RETURNING *`,
    [id_usuario, tipo, item_id, estudado]
  )
  return rows[0]
}

export const excluirProgressoPorItem = async (tipo, item_id) => {
  await db.query('DELETE FROM public.progresso WHERE tipo = $1 AND item_id = $2', [tipo, item_id])
}

export const buscarProgressoTopicos = async (id_usuario, topico_ids) => {
  if (topico_ids.length === 0) return []
  const { rows } = await db.query(
    `SELECT item_id, estudado FROM progresso WHERE id_usuario = $1 AND tipo = 'topico' AND item_id = ANY($2)`,
    [id_usuario, topico_ids]
  )
  return rows
}

export const buscarProgressoSubitens = async (id_usuario, subitem_ids) => {
  if (subitem_ids.length === 0) return []
  const { rows } = await db.query(
    `SELECT item_id, estudado FROM progresso WHERE id_usuario = $1 AND tipo = 'subitem' AND item_id = ANY($2)`,
    [id_usuario, subitem_ids]
  )
  return rows
}