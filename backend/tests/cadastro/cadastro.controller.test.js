import { jest } from '@jest/globals'
import * as cadastroService from '../../api/modules/cadastro/cadastro.service.js'
import { cadastrar } from '../../api/modules/cadastro/cadastro.controller.js'

// O controller é testado isolado: o service é mockado e req/res são simulados.
jest.mock('../../api/modules/cadastro/cadastro.service.js', () => ({
  __esModule: true,
  cadastrar: jest.fn()
}))

// Cria um res falso cujos métodos encadeáveis retornam o próprio res
const criarRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

// Simula um erro do Postgres com o nome da constraint violada
const erroDeConstraint = (constraint) =>
  Object.assign(new Error('duplicate key value violates unique constraint'), {
    code: '23505',
    constraint
  })

afterEach(() => {
  jest.resetAllMocks()
})

describe('cadastro.controller', () => {
  describe('cadastrar', () => {
    const req = {
      body: { email: 'ana@email.com', senha: 'senha123', username: 'ana', uf: 'PE' }
    }

    it('chama o service com email, senha, username e uf do body', async () => {
      cadastroService.cadastrar.mockResolvedValue({})

      await cadastrar(req, criarRes())

      expect(cadastroService.cadastrar).toHaveBeenCalledWith(
        'ana@email.com',
        'senha123',
        'ana',
        'PE'
      )
    })

    it('responde 201 com o resultado do cadastro quando tudo dá certo', async () => {
      const resultado = {
        usuario: { id_usuario: 10, email: 'ana@email.com' },
        pessoa: { id_pessoa: 3, username: 'ana', uf: 'PE', id_usuario: 10 }
      }
      cadastroService.cadastrar.mockResolvedValue(resultado)
      const res = criarRes()

      await cadastrar(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(resultado)
    })

    it('responde 409 quando o email já está cadastrado (usuario_email_key)', async () => {
      cadastroService.cadastrar.mockRejectedValue(erroDeConstraint('usuario_email_key'))
      const res = criarRes()

      await cadastrar(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({ error: 'usuario_email_key' })
    })

    it('responde 409 quando o username já está em uso (pessoa_username_key)', async () => {
      cadastroService.cadastrar.mockRejectedValue(erroDeConstraint('pessoa_username_key'))
      const res = criarRes()

      await cadastrar(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({ error: 'pessoa_username_key' })
    })

    it('responde 500 quando a violação é de outra constraint', async () => {
      cadastroService.cadastrar.mockRejectedValue(erroDeConstraint('outra_constraint_key'))
      const res = criarRes()

      await cadastrar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'duplicate key value violates unique constraint'
      })
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      cadastroService.cadastrar.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await cadastrar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'falha de conexão' })
    })

    // Pendentes: o controller não valida o body e o service devolve o usuário com
    // RETURNING *, então o hash da senha segue na resposta 201.
    // Transformar em testes reais quando as correções forem feitas.
    it.todo('responde 400 e não chama o service quando faltam campos obrigatórios (email, senha, username, uf)')
    it.todo('não expõe o hash da senha na resposta 201')
  })
})