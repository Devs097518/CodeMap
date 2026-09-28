import { autenticar } from '../../api/middlewares/auth.middleware.js'

export const autenticarComo = (user) => {
  autenticar.mockImplementation((req, res, next) => {
    req.user = user
    next()
  })
}

// Simula ausência de token (usuário não logado)
export const semAutenticacao = () => {
  autenticar.mockImplementation((req, res) => {
    res.status(401).json({ message: 'Token não fornecido' })
  })
}