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

export const listarCategoriasAdmin = async (incluirArquivadas) => {
  let query = `SELECT * FROM categoria`
  if (!incluirArquivadas) {
    query += ` WHERE deleted_at IS NULL`
  }
  query += ` ORDER BY ordem ASC`
  const { rows } = await db.query(query)
  return rows
}

export const listarCategoriasPublicas = async () => {
  const { rows } = await db.query(
    `SELECT * FROM categoria WHERE deleted_at IS NULL ORDER BY ordem ASC`
  )
  return rows
}

export const criarCategoria = async (nome) => {
  const slug = gerarSlug(nome)

  const { rows } = await db.query(
    `INSERT INTO public.categoria (nome, slug, ordem)
     VALUES ($1, $2, COALESCE((SELECT MAX(ordem) FROM categoria), 0) + 1)
     RETURNING *`,
    [nome, slug]
  )
  return rows[0]
}

export const editarCategoria = async (id, nome) => {
  const slug = gerarSlug(nome)

  const result = await db.query(
    'UPDATE public.categoria SET nome = $1, slug = $2 WHERE id_categoria = $3 AND deleted_at IS NULL RETURNING *',
    [nome, slug, id]
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

export const moverCategoria = async (id, direcao) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows: atualRows } = await client.query(
      'SELECT * FROM categoria WHERE id_categoria = $1 AND deleted_at IS NULL FOR UPDATE',
      [id]
    )
    const atual = atualRows[0]
    if (!atual) {
      await client.query('ROLLBACK')
      return { encontrada: false }
    }

    const operador = direcao === 'cima' ? '<' : '>'
    const ordenacao = direcao === 'cima' ? 'DESC' : 'ASC'

    const { rows: vizinhoRows } = await client.query(
      `SELECT * FROM categoria WHERE deleted_at IS NULL AND ordem ${operador} $1 ORDER BY ordem ${ordenacao} LIMIT 1 FOR UPDATE`,
      [atual.ordem]
    )
    const vizinho = vizinhoRows[0]
    if (!vizinho) {
      await client.query('ROLLBACK')
      return { encontrada: true, semMovimento: true }
    }

    await client.query('UPDATE categoria SET ordem = -1 WHERE id_categoria = $1', [atual.id_categoria])
    await client.query('UPDATE categoria SET ordem = $1 WHERE id_categoria = $2', [atual.ordem, vizinho.id_categoria])
    await client.query('UPDATE categoria SET ordem = $1 WHERE id_categoria = $2', [vizinho.ordem, atual.id_categoria])

    await client.query('COMMIT')
    return { encontrada: true, semMovimento: false }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}