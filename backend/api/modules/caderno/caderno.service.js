import db from '../../../db/pool.js'

export const listarCadernos = async (id_usuario) => {
  // total_notas: quantidade de notas de cada caderno (0 quando o caderno está vazio).
  // O ::int é necessário porque o COUNT do Postgres volta como bigint, que o driver
  // `pg` entrega como string.
  let query = `
    SELECT c.*, COUNT(n.id_caderno)::int AS total_notas
    FROM caderno c
    LEFT JOIN nota n ON n.id_caderno = c.id_caderno`
  const params = []

  if (id_usuario) {
    query += ` WHERE c.id_usuario = $1`
    params.push(id_usuario)
  }

  // Ordem estável: a cor de cada card depende da posição na lista
  query += ` GROUP BY c.id_caderno ORDER BY c.id_caderno`

  const { rows } = await db.query(query, params)
  return rows
}

export const criarCaderno = async (id_usuario, titulo) => {
  const result = await db.query(
    'INSERT INTO public.caderno (id_usuario, titulo) VALUES ($1, $2) RETURNING *',
    [id_usuario, titulo]
  )
  return result.rows[0]
}

export const editarCaderno = async (id, titulo) => {
  const result = await db.query(
    'UPDATE public.caderno SET titulo = $1 WHERE id_caderno = $2 RETURNING *',
    [titulo, id]
  )
  return result.rows[0] || null
}

export const deletarCaderno = async (id) => {
  const result = await db.query(
    'DELETE FROM public.caderno WHERE id_caderno = $1 RETURNING *',
    [id]
  )
  return result.rows[0] || null
}