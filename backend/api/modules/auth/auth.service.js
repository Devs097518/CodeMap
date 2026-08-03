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

export const buscarUsuarioLogado = async (id_usuario) => {
  const { rows } = await pool.query(
    'SELECT u.id_usuario, u.email, u.role, p.username, p.uf FROM usuario u LEFT JOIN pessoa p ON p.id_usuario = u.id_usuario WHERE u.id_usuario = $1',
    [id_usuario]
  )
  return rows[0] || null
}




// # Login (salva o cookie num arquivo)
// curl -c cookies.txt -X POST http://localhost:3003/login \
//   -H "Content-Type: application/json" \
//   -d '{"email":"seu@email.com","senha":"suasenha"}'

// # Testa rota protegida usando o cookie salvo
// curl -b cookies.txt http://localhost:3003/auth/me

// # Testa logout
// curl -b cookies.txt -X POST http://localhost:3003/logout