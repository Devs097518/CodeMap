import db from '../../../db/pool.js'

export const listarUsuarios = async (email) => {
  let query = `SELECT * FROM usuario`
  let params = []

  if (email) {
    query += ` WHERE email = $1`
    params.push(email)
  }

  const { rows } = await db.query(query, params)
  return rows
}