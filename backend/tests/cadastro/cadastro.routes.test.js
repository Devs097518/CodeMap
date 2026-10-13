import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import bcrypt from 'bcrypt'
import pool from '../../db/pool.js'
import cadastroRoutes from '../../api/modules/cadastro/cadastro.routes.js'

// Integração completa: route + controller + service reais.
// Só as bordas externas são mockadas: o pool/client do banco e o bcrypt.
jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { connect: jest.fn() }
}))

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: { hash: jest.fn() }
}))

const app = express()
app.use(express.json())
app.use('/api', cadastroRoutes)

const dados = { email: 'ana@email.com', senha: 'senha123', username: 'ana', uf: 'PE' }
const usuarioCriado = { id_usuario: 10, email: 'ana@email.com', senha: 'hash-da-senha' }
const pessoaCriada = { id_pessoa: 3, username: 'ana', uf: 'PE', id_usuario: 10 }

let client

beforeEach(() => {
  client = { query: jest.fn(), release: jest.fn() }
  pool.connect.mockResolvedValue(client)
  bcrypt.hash.mockResolvedValue('hash-da-senha')
})

afterEach(() => {
  jest.resetAllMocks()
})

// Simula um erro do Postgres com o nome da constraint violada
const erroDeConstraint = (constraint) =>
  Object.assign(new Error('duplicate key value violates unique constraint'), {
    code: '23505',
    constraint
  })

// Lista só o SQL de cada chamada ao client, na ordem em que aconteceram
const comandos = () => client.query.mock.calls.map(([sql]) => sql)

describe('cadastro.routes', () => {
  describe('POST /api/cadastro', () => {
    it('cria usuário e pessoa, confirma a transação e responde 201 com os registros', async () => {
      client.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [usuarioCriado] })
        .mockResolvedValueOnce({ rows: [pessoaCriada] })
        .mockResolvedValueOnce({}) // COMMIT

      const res = await request(app).post('/api/cadastro').send(dados)

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ usuario: usuarioCriado, pessoa: pessoaCriada })
      expect(comandos()).toEqual([
        'BEGIN',
        expect.stringContaining('INSERT INTO public.usuario'),
        expect.stringContaining('INSERT INTO public.pessoa'),
        'COMMIT'
      ])
      expect(client.release).toHaveBeenCalledTimes(1)
    })

    it('leva os dados do body até as queries, gravando o hash no lugar da senha', async () => {
      client.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [usuarioCriado] })
        .mockResolvedValueOnce({ rows: [pessoaCriada] })
        .mockResolvedValueOnce({})

      await request(app).post('/api/cadastro').send(dados)

      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10)
      expect(client.query).toHaveBeenNthCalledWith(2, expect.any(String), [
        'ana@email.com',
        'hash-da-senha'
      ])
      expect(client.query).toHaveBeenNthCalledWith(3, expect.any(String), ['ana', 'PE', 10])
      expect(JSON.stringify(client.query.mock.calls)).not.toContain('senha123')
    })

    it('responde 409 e faz rollback quando o email já está cadastrado', async () => {
      client.query
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(erroDeConstraint('usuario_email_key'))
        .mockResolvedValueOnce({})

      const res = await request(app).post('/api/cadastro').send(dados)

      expect(res.status).toBe(409)
      expect(res.body).toEqual({ error: 'usuario_email_key' })
      expect(comandos()).toEqual([
        'BEGIN',
        expect.stringContaining('INSERT INTO public.usuario'),
        'ROLLBACK'
      ])
      expect(client.release).toHaveBeenCalledTimes(1)
    })

    it('responde 409 e desfaz também o usuário quando o username já está em uso', async () => {
      client.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [usuarioCriado] })
        .mockRejectedValueOnce(erroDeConstraint('pessoa_username_key'))
        .mockResolvedValueOnce({})

      const res = await request(app).post('/api/cadastro').send(dados)

      expect(res.status).toBe(409)
      expect(res.body).toEqual({ error: 'pessoa_username_key' })
      expect(comandos()).toEqual([
        'BEGIN',
        expect.stringContaining('INSERT INTO public.usuario'),
        expect.stringContaining('INSERT INTO public.pessoa'),
        'ROLLBACK'
      ])
      expect(comandos()).not.toContain('COMMIT')
    })

    it('responde 500 com a mensagem do erro quando não consegue conectar ao banco', async () => {
      pool.connect.mockRejectedValue(new Error('sem conexão'))

      const res = await request(app).post('/api/cadastro').send(dados)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ error: 'sem conexão' })
    })

    it('só aceita o método POST: GET na mesma rota responde 404', async () => {
      const res = await request(app).get('/api/cadastro')

      expect(res.status).toBe(404)
      expect(pool.connect).not.toHaveBeenCalled()
    })

    // Pendentes: o controller não valida o body e o service devolve o usuário com
    // RETURNING *, então o hash da senha segue na resposta 201.
    // Transformar em testes reais quando as correções forem feitas (issue separada).
    it.todo('responde 400 e não abre transação quando faltam campos obrigatórios')
    it.todo('não expõe o hash da senha na resposta 201')
  })
})