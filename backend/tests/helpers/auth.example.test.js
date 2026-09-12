import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import { autenticar } from '../../api/middlewares/auth.middleware.js'
import { autenticarComo, semAutenticacao } from './auth.js'

jest.mock('../../api/middlewares/auth.middleware.js')

/**
 * Exemplo autocontido (não depende de nenhum módulo real do projeto) de
 * como usar o helper `tests/helpers/auth.js` em qualquer teste de
 * integração de rota protegida por `autenticar`.
 *
 * Padrão pra copiar em novas issues:
 *   1. jest.mock('.../auth.middleware.js') no topo do arquivo de teste
 *   2. import { autenticarComo, semAutenticacao } from '../helpers/auth.js'
 *   3. chamar um dos dois helpers ANTES de cada request(app)... do teste
 */
const appExemplo = express()
appExemplo.get('/rota-protegida', autenticar, (req, res) => {
  res.json({ mensagem: `Olá, usuário ${req.user.id}` })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('exemplo: uso do helper de autenticação em testes de integração', () => {
  it('libera acesso quando autenticarComo simula um usuário logado', async () => {
    autenticarComo({ id: 42, role: 'cliente' })

    const res = await request(appExemplo).get('/rota-protegida')

    expect(res.status).toBe(200)
    expect(res.body.mensagem).toBe('Olá, usuário 42')
  })

  it('bloqueia acesso quando semAutenticacao simula ausência de token', async () => {
    semAutenticacao()

    const res = await request(appExemplo).get('/rota-protegida')

    expect(res.status).toBe(401)
  })
})