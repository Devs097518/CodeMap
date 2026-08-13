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