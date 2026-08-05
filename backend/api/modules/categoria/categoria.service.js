import db from '../../../db/pool.js'

const gerarSlug = (nome) => {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .replace(/-$/, '') 
}

export const listarCategorias = async (incluirArquivadas) => {
  let query = `SELECT * FROM categoria`

  if (!incluirArquivadas) {
    query += ` WHERE deleted_at IS NULL`
  }

  query += ` ORDER BY ordem ASC`

  const { rows } = await db.query(query)
  return rows
}

export const criarCategoria = async (nome, ordem) => {
  const slug = gerarSlug(nome)

  const result = await db.query(
    'INSERT INTO public.categoria (nome, slug, ordem) VALUES ($1, $2, $3) RETURNING *',
    [nome, slug, ordem]
  )
  return result.rows[0]
}

export const editarCategoria = async (id, nome, ordem) => {
  const slug = gerarSlug(nome)

  const result = await db.query(
    'UPDATE public.categoria SET nome = $1, slug = $2, ordem = $3 WHERE id_categoria = $4 AND deleted_at IS NULL RETURNING *',
    [nome, slug, ordem, id]
  )
  return result.rows[0] || null
}

export const arquivarCategoria = async (id) => {
  const result = await db.query(
    'UPDATE public.categoria SET deleted_at = NOW() WHERE id_categoria = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}

export const restaurarCategoria = async (id) => {
  const result = await db.query(
    'UPDATE public.categoria SET deleted_at = NULL WHERE id_categoria = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}

export const buscarCategoriaPorId = async (id) => {
  const result = await db.query(
    'SELECT * FROM public.categoria WHERE id_categoria = $1',
    [id]
  )
  return result.rows[0] || null
}