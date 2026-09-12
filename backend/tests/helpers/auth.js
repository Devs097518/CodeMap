import { autenticar } from '../../api/middlewares/auth.middleware.js'

/**
 * Helper de testes de integração (Supertest).
 *
 * Pressupõe que o arquivo de teste já chamou:
 *   jest.mock('../../api/middlewares/auth.middleware.js')
 *
 * Isso transforma `autenticar` num jest.fn() controlável — os helpers
 * abaixo só definem o que esse mock faz a cada chamada, simulando o
 * comportamento do middleware real sem depender de JWT/cookies de verdade.
 */

// Simula um usuário autenticado, com o payload que normalmente viria do JWT decodificado
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