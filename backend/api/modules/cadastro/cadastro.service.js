import bcrypt from 'bcrypt'
import pool from '../../../db/pool.js'

export const cadastrar = async (email, senha, username, uf) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const hashSenha = await bcrypt.hash(senha, 10)
    // const hashSenha = senha;

    const usuarioResult = await client.query(
      'INSERT INTO public.usuario (email, senha) VALUES ($1, $2) RETURNING *',
      [email, hashSenha]
    )
    const usuario = usuarioResult.rows[0]

    const pessoaResult = await client.query(
      'INSERT INTO public.pessoa (username, uf, id_usuario) VALUES ($1, $2, $3) RETURNING *',
      [username, uf, usuario.id_usuario]
    )

    await client.query('COMMIT')

    return { usuario, pessoa: pessoaResult.rows[0] }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}