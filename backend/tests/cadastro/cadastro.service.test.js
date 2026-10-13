import { jest } from '@jest/globals'
import bcrypt from 'bcrypt'
import pool from '../../db/pool.js'
import { cadastrar } from '../../api/modules/cadastro/cadastro.service.js'

// O service é testado isolado do banco e do bcrypt: pool, client e hash são mockados.
jest.mock('../../db/pool.js', () => ({
  __esModule: true,
  default: { connect: jest.fn() }
}))

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: { hash: jest.fn() }
}))

const dados = ['ana@email.com', 'senha123', 'ana', 'PE']
const usuarioCriado = { id_usuario: 10, email: 'ana@email.com', senha: 'hash-da-senha' }
const pessoaCriada = { id_pessoa: 3, username: 'ana', uf: 'PE', id_usuario: 10 }

let client

beforeEach(() => {
  client = { query: jest.fn(), release: jest.fn() }
  pool.connect.mockResolvedValue(client)
})

afterEach(() => {
  jest.resetAllMocks()
})

// Respostas do client na ordem das queries: BEGIN, INSERT usuario, INSERT pessoa, COMMIT
const simularSucesso = () => {
  bcrypt.hash.mockResolvedValue('hash-da-senha')
  client.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [usuarioCriado] })
    .mockResolvedValueOnce({ rows: [pessoaCriada] })
    .mockResolvedValueOnce({})
}

// Lista só o SQL de cada chamada ao client na ordem em que acontecem
const comandos = () => client.query.mock.calls.map(([sql]) => sql)

describe('cadastro.service', () => {
  describe('cadastrar', () => {
    it('cria usuário e pessoa e retorna os dois registros', async () => {
      simularSucesso()

      const resultado = await cadastrar(...dados)

      expect(resultado).toEqual({ usuario: usuarioCriado, pessoa: pessoaCriada })
    })

    it('gera o hash da senha com custo 10 e grava o hash, nunca a senha pura', async () => {
      simularSucesso()

      await cadastrar(...dados)

      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10)
      expect(client.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO public.usuario'),
        ['ana@email.com', 'hash-da-senha']
      )
      expect(JSON.stringify(client.query.mock.calls)).not.toContain('senha123')
    })

    it('vincula a pessoa ao id do usuário recém-criado', async () => {
      simularSucesso()

      await cadastrar(...dados)

      expect(client.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO public.pessoa'),
        ['ana', 'PE', 10]
      )
    })

    it('executa a transação na ordem: BEGIN, inserts e COMMIT', async () => {
      simularSucesso()

      await cadastrar(...dados)

      expect(comandos()).toEqual([
        'BEGIN',
        expect.stringContaining('INSERT INTO public.usuario'),
        expect.stringContaining('INSERT INTO public.pessoa'),
        'COMMIT'
      ])
    })

    it('libera a conexão ao final, sem rollback, quando tudo dá certo', async () => {
      simularSucesso()

      await cadastrar(...dados)

      expect(client.release).toHaveBeenCalledTimes(1)
      expect(comandos()).not.toContain('ROLLBACK')
    })

    it('faz rollback, não faz commit e repassa o erro original quando o email já existe', async () => {
      const erroDuplicado = Object.assign(new Error('duplicate key value'), { code: '23505' })
      bcrypt.hash.mockResolvedValue('hash-da-senha')
      client.query
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(erroDuplicado)
        .mockResolvedValueOnce({})

      await expect(cadastrar(...dados)).rejects.toBe(erroDuplicado)

      expect(comandos()).toEqual([
        'BEGIN',
        expect.stringContaining('INSERT INTO public.usuario'),
        'ROLLBACK'
      ])
      expect(client.release).toHaveBeenCalledTimes(1)
    })

    it('faz rollback e libera a conexão quando falha ao inserir a pessoa', async () => {
      bcrypt.hash.mockResolvedValue('hash-da-senha')
      client.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [usuarioCriado] })
        .mockRejectedValueOnce(new Error('falha ao inserir pessoa'))
        .mockResolvedValueOnce({})

      await expect(cadastrar(...dados)).rejects.toThrow('falha ao inserir pessoa')

      expect(comandos()).toEqual([
        'BEGIN',
        expect.stringContaining('INSERT INTO public.usuario'),
        expect.stringContaining('INSERT INTO public.pessoa'),
        'ROLLBACK'
      ])
      expect(client.release).toHaveBeenCalledTimes(1)
    })

    it('faz rollback sem inserir nada quando o hash da senha falha', async () => {
      bcrypt.hash.mockRejectedValue(new Error('falha no hash'))
      client.query.mockResolvedValue({})

      await expect(cadastrar(...dados)).rejects.toThrow('falha no hash')

      expect(comandos()).toEqual(['BEGIN', 'ROLLBACK'])
      expect(client.release).toHaveBeenCalledTimes(1)
    })

    it('propaga o erro e não tenta liberar conexão quando não consegue conectar', async () => {
      pool.connect.mockRejectedValue(new Error('sem conexão'))

      await expect(cadastrar(...dados)).rejects.toThrow('sem conexão')

      expect(bcrypt.hash).not.toHaveBeenCalled()
      expect(client.release).not.toHaveBeenCalled()
    })
  })
})