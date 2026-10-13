import { jest } from '@jest/globals'
import { role } from '../../api/middlewares/role.middleware.js'

const criarRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('role.middleware - role', () => {
  it('retorna uma função de middleware', () => {
    expect(typeof role('admin')).toBe('function')
  })

  it('responde 401 quando não há usuário autenticado em req.user', () => {
    const res = criarRes()
    const next = jest.fn()

    role('admin')({}, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não autenticado' })
    expect(next).not.toHaveBeenCalled()
  })

  it.each(['admin', 'cliente'])('chama next quando o usuário tem a role esperada (%s)', (perfil) => {
    const res = criarRes()
    const next = jest.fn()

    role(perfil)({ user: { id: 1, role: perfil } }, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(res.status).not.toHaveBeenCalled()
  })

  it.each([
    ['cliente', 'admin'],
    ['admin', 'cliente']
  ])('responde 403 quando o usuário é %s e a rota exige %s', (roleDoUsuario, roleEsperado) => {
    const res = criarRes()
    const next = jest.fn()

    role(roleEsperado)({ user: { id: 1, role: roleDoUsuario } }, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acesso negado: permissão insuficiente'
    })
    expect(next).not.toHaveBeenCalled()
  })
})