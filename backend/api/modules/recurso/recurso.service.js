import db from '../../../db/pool.js'

export const listarRecursosPorTopico = async (topico_id) => {
  const { rows } = await db.query('SELECT * FROM recurso WHERE topico_id = $1', [topico_id])
  return rows
}

export const listarRecursosPorSubitem = async (subitem_id) => {
  const { rows } = await db.query('SELECT * FROM recurso WHERE subitem_id = $1', [subitem_id])
  return rows
}

export const criarRecurso = async (tipo, id, label, url) => {
  const coluna = tipo === 'topico' ? 'topico_id' : 'subitem_id'
  const { rows } = await db.query(
    `INSERT INTO public.recurso (${coluna}, label, url) VALUES ($1, $2, $3) RETURNING *`,
    [id, label, url]
  )
  return rows[0]
}

export const editarRecurso = async (id, label, url) => {
  const result = await db.query(
    'UPDATE public.recurso SET label = $1, url = $2 WHERE id_recurso = $3 RETURNING *',
    [label, url, id]
  )
  return result.rows[0] || null
}

export const excluirRecurso = async (id) => {
  const result = await db.query('DELETE FROM public.recurso WHERE id_recurso = $1 RETURNING *', [id])
  return result.rows[0] || null
}