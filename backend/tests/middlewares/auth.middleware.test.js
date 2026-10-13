import { jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { autenticar } from '../../api/middlewares/auth.middleware.js'

// Aqui o jsonwebtoken NÃO é mockado: geramos tokens reais (válidos, expirados
// e com assinatura errada) para testar a verificação de verdade.
const SEGREDO_TESTE = 'segredo-de-teste'
const segredoOriginal = process.env.JWT_SECRET

beforeAll(() => {
  process.env.JWT_SECRET = SEGREDO_TESTE
})

afterAll(() => {
  process.env.JWT_SECRET = segredoOriginal
})

const criarRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

const criarReq = (token) => ({ cookies: token ? { token } : {} })

describe('auth.middleware - autenticar', () => {
  it('responde 401 quando não há token no cookie', () => {
    const res = criarRes()
    const next = jest.fn()

    autenticar(criarReq(), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' })
    expect(next).not.toHaveBeenCalled()
  })

  it('chama next e preenche req.user quando o token é válido', () => {
    const token = jwt.sign({ id: 7, role: 'cliente' }, SEGREDO_TESTE, { expiresIn: '15m' })
    const req = criarReq(token)
    const res = criarRes()
    const next = jest.fn()

    autenticar(req, res, next)

    expect(req.user).toEqual(expect.objectContaining({ id: 7, role: 'cliente' }))
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('responde 401 quando o token está expirado', () => {
    const expiradoHaDezSegundos = Math.floor(Date.now() / 1000) - 10
    const token = jwt.sign(
      { id: 7, role: 'cliente', exp: expiradoHaDezSegundos },
      SEGREDO_TESTE
    )
    const res = criarRes()
    const next = jest.fn()

    autenticar(criarReq(token), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('responde 401 quando o token foi assinado com outro segredo', () => {
    const token = jwt.sign({ id: 7, role: 'admin' }, 'segredo-de-outra-pessoa', {
      expiresIn: '15m'
    })
    const res = criarRes()
    const next = jest.fn()

    autenticar(criarReq(token), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('responde 401 quando o token está malformado', () => {
    const res = criarRes()
    const next = jest.fn()

    autenticar(criarReq('isso-nao-e-um-jwt'), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' })
    expect(next).not.toHaveBeenCalled()
  })
})