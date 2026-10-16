import db from '../../../db/pool.js'

const MAX_TAGS = 5
const MAX_CHARS_TAG = 20

// Padroniza as tags: minúsculas, sem "#", espaços viram "-", sem repetidas e no máximo 5
export const normalizarTags = (tags) => {
  if (!Array.isArray(tags)) return []

  const limpas = tags
    .map((t) =>
      String(t)
        .trim()
        .toLowerCase()
        .replace(/^#+/, '')
        .replace(/\s+/g, '-')
        .slice(0, MAX_CHARS_TAG)
    )
    .filter(Boolean)

  return [...new Set(limpas)].slice(0, MAX_TAGS)
}

export const listarNotas = async (id_caderno) => {
  let query = `SELECT * FROM nota`
  let params = []

  if (id_caderno) {
    query += ` WHERE id_caderno = $1`
    params.push(id_caderno)
  }

  // Ordem estável: a tela usa o id para numerar as páginas
  query += ` ORDER BY id_nota`

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

export const criarNota = async (conteudo, id_caderno, titulo, tags = []) => {
  const result = await db.query(
    'INSERT INTO public.nota (conteudo, id_caderno, titulo, tags) VALUES ($1, $2, $3, $4) RETURNING *',
    [conteudo, id_caderno, titulo, normalizarTags(tags)]
  )
  return result.rows[0]
}

// Se `tags` não vier (undefined), as tags atuais da nota são mantidas
export const editarNota = async (id, conteudo, titulo, tags) => {
  const tagsNormalizadas = tags === undefined ? null : normalizarTags(tags)

  const result = await db.query(
    'UPDATE public.nota SET conteudo = $1, titulo = $2, tags = COALESCE($4::text[], tags) WHERE id_nota = $3 RETURNING *',
    [conteudo, titulo, id, tagsNormalizadas]
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