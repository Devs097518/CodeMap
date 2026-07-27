import db from '../../../db/pool.js'

export const listarPastas = async (id_usuario) => {
  let query = `SELECT * FROM pasta`
  let params = []

  if (id_usuario) {
    query += ` WHERE id_usuario = $1`
    params.push(id_usuario)
  }

  const { rows } = await db.query(query, params)
  return rows
}

export const criarPasta = async (id_usuario, titulo) => {
  const result = await db.query(
    'INSERT INTO public.pasta (id_usuario, titulo) VALUES ($1, $2) RETURNING *',
    [id_usuario, titulo]
  )
  return result.rows[0]
}

export const editarPasta = async (id, titulo) => {
  const result = await db.query(
    'UPDATE public.pasta SET titulo = $1 WHERE id_pasta = $2 RETURNING *',
    [titulo, id]
  )
  return result.rows[0] || null
}

export const deletarPasta = async (id) => {
  const result = await db.query(
    'DELETE FROM public.pasta WHERE id_pasta = $1 RETURNING *',
    [id]
  )
  return result.rows[0] || null
}