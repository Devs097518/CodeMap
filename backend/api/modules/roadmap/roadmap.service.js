import db from '../../../db/pool.js'

export const listarRoadmapsAdmin = async ({ categoria_id, incluirArquivados } = {}) => {
  const conditions = []
  const params = []

  if (!incluirArquivados) {
    conditions.push('deleted_at IS NULL')
  }
  if (categoria_id) {
    params.push(categoria_id)
    conditions.push(`categoria_id = $${params.length}`)
  }

  let query = 'SELECT * FROM roadmap'
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  query += ' ORDER BY id_roadmap ASC'

  const { rows } = await db.query(query, params)
  return rows
}

export const buscarRoadmapAdminPorId = async (id) => {
  const { rows } = await db.query('SELECT * FROM roadmap WHERE id_roadmap = $1', [id])
  return rows[0] || null
}

export const listarRoadmapsPublicos = async (id_usuario) => {
  const { rows } = await db.query(
    `SELECT 
       r.*,
       COALESCE(unidades.total, 0) AS total_unidades,
       COALESCE(unidades.estudadas, 0) AS unidades_estudadas
     FROM roadmap r
     JOIN categoria c ON c.id_categoria = r.categoria_id
     LEFT JOIN LATERAL (
       SELECT
         (SELECT COUNT(*) FROM topico t WHERE t.roadmap_id = r.id_roadmap)
         + (SELECT COUNT(*) FROM subitem s JOIN topico t2 ON t2.id_topico = s.topico_id WHERE t2.roadmap_id = r.id_roadmap)
         AS total,
         (SELECT COUNT(*) FROM progresso p JOIN topico t ON t.id_topico = p.item_id
            WHERE p.tipo = 'topico' AND t.roadmap_id = r.id_roadmap AND p.id_usuario = $1 AND p.estudado = true)
         + (SELECT COUNT(*) FROM progresso p JOIN subitem s ON s.id_subitem = p.item_id
            JOIN topico t2 ON t2.id_topico = s.topico_id
            WHERE p.tipo = 'subitem' AND t2.roadmap_id = r.id_roadmap AND p.id_usuario = $1 AND p.estudado = true)
         AS estudadas
     ) unidades ON true
     WHERE r.is_active = true AND r.deleted_at IS NULL AND c.deleted_at IS NULL
     ORDER BY r.id_roadmap ASC`,
    [id_usuario]
  )
  return rows
}

export const buscarRoadmapPublicoPorId = async (id) => {
  const { rows } = await db.query(
    `SELECT roadmap.* FROM roadmap
     JOIN categoria ON categoria.id_categoria = roadmap.categoria_id
     WHERE roadmap.id_roadmap = $1
       AND roadmap.is_active = true
       AND roadmap.deleted_at IS NULL
       AND categoria.deleted_at IS NULL`,
    [id]
  )
  return rows[0] || null
}

export const criarRoadmap = async (categoria_id, titulo, descricao, is_active) => {
  const { rows } = await db.query(
    `INSERT INTO public.roadmap (categoria_id, titulo, descricao, is_active)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [categoria_id, titulo, descricao, is_active]
  )
  return rows[0]
}

export const editarRoadmap = async (id, categoria_id, titulo, descricao, is_active) => {
  const result = await db.query(
    `UPDATE public.roadmap
     SET categoria_id = $1, titulo = $2, descricao = $3, is_active = $4
     WHERE id_roadmap = $5 AND deleted_at IS NULL
     RETURNING *`,
    [categoria_id, titulo, descricao, is_active, id]
  )
  return result.rows[0] || null
}

export const arquivarRoadmap = async (id) => {
  const result = await db.query(
    'UPDATE public.roadmap SET deleted_at = NOW() WHERE id_roadmap = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}

export const restaurarRoadmap = async (id) => {
  const result = await db.query(
    'UPDATE public.roadmap SET deleted_at = NULL WHERE id_roadmap = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}