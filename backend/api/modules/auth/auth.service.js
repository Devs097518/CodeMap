import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../../../db/pool.js'

export const login = async (email, senha) => {
  const { rows } = await pool.query(
    'SELECT * FROM usuario WHERE email = $1',
    [email]
  )
  const usuario = rows[0]
  if (!usuario) throw new Error('Usuário ou senha incorretos') //Usuário não encontrado

  const senhaValida = await bcrypt.compare(senha, usuario.senha)
  if (!senhaValida) throw new Error('Usuário ou senha incorretos') //Senha incorreta

  const token = jwt.sign(
    { id: usuario.id_usuario, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  return token
}