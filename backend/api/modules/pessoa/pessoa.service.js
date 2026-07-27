import db from '../../../db/pool.js'

export const listarPessoas = async () => {
  const { rows } = await db.query('SELECT * FROM pessoa')
  return rows
}