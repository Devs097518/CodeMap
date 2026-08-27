import db from '../../../db/pool.js'

export const listarCadernos = async (id_usuario) => {
  let query = `SELECT * FROM caderno`
  let params = []

  if (id_usuario) {
    query += ` WHERE id_usuario = $1`
    params.push(id_usuario)
  }

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