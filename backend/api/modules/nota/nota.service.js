import db from '../../../db/pool.js'

export const listarNotas = async (id_caderno) => {
  let query = `SELECT * FROM nota`
  let params = []

  if (id_caderno) {
    query += ` WHERE id_caderno = $1`
    params.push(id_caderno)
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

export const criarNota = async (conteudo, id_caderno, titulo) => {
  const result = await db.query(
    'INSERT INTO public.nota (conteudo, id_caderno, titulo) VALUES ($1, $2, $3) RETURNING *',
    [conteudo, id_caderno, titulo]
  )
  return result.rows[0]
}

export const editarNota = async (id, conteudo, titulo) => {
  const result = await db.query(
    'UPDATE public.nota SET conteudo = $1, titulo = $2 WHERE id_nota = $3 RETURNING *',
    [conteudo, titulo, id]
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