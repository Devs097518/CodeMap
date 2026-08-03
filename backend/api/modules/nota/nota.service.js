import db from '../../../db/pool.js'

export const listarNotas = async (id_pasta) => {
  let query = `SELECT * FROM nota`
  let params = []

  if (id_pasta) {
    query += ` WHERE id_pasta = $1`
    params.push(id_pasta)
  }

  const { rows } = await db.query(query, params)
  return rows
}

export const listarNotaPorUsuario = async (id_usuario) => {
  const result = await db.query(
    'SELECT * FROM public.nota WHERE id_usuario = $1',
    [id_usuario]
  )
  return result.rows[0] || null
}

export const criarNota = async (conteudo, id_pasta, titulo, status) => {
  const result = await db.query(
    'INSERT INTO public.nota (conteudo, id_pasta, titulo, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [conteudo, id_pasta, titulo, status]
  )
  return result.rows[0]
}

export const editarNota = async (id, conteudo, titulo, status) => {
  const result = await db.query(
    'UPDATE public.nota SET conteudo = $1, titulo = $2, status = $4 WHERE id_nota = $3 RETURNING *',
    [conteudo, titulo, id, status]
  )
  return result.rows[0] || null
}

export const deletarNota = async (id) => {
  const result = await db.query(
    'DELETE FROM public.nota WHERE id_nota = $1 RETURNING *',
    [id]
  )
  return result.rows[0] || null
}