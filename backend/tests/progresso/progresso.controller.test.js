import { jest } from '@jest/globals'
import * as progressoService from '../../api/modules/progresso/progresso.service.js'
import {
  alternarTopico,
  alternarSubitem
} from '../../api/modules/progresso/progresso.controller.js'

// O controller é testado isolado: o service é mockado e req/res são simulados.
jest.mock('../../api/modules/progresso/progresso.service.js', () => ({
  __esModule: true,
  alternarProgresso: jest.fn()
}))

// Cria um res falso cujos métodos encadeáveis retornam o próprio res
const criarRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

// Cria um req com o id do item na rota, o body e o usuário já autenticado
const criarReq = (body = { estudado: true }, id = '5') => ({
  params: { id },
  body,
  user: { id: 7, role: 'cliente' }
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('progresso.controller', () => {
  describe.each([
    ['alternarTopico', alternarTopico, 'topico'],
    ['alternarSubitem', alternarSubitem, 'subitem']
  ])('%s', (_nome, handler, tipo) => {
    it(`registra o progresso com o tipo ${tipo}, o id da rota e o usuário do token`, async () => {
      progressoService.alternarProgresso.mockResolvedValue({})

      await handler(criarReq(), criarRes())

      expect(progressoService.alternarProgresso).toHaveBeenCalledWith(7, tipo, '5', true)
    })

    it('responde 200 com o progresso gravado', async () => {
      const progresso = { id_usuario: 7, tipo, item_id: 5, estudado: true }
      progressoService.alternarProgresso.mockResolvedValue(progresso)
      const res = criarRes()

      await handler(criarReq(), res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(progresso)
    })

    it.each([true, false])('aceita estudado = %s (marcar e desmarcar)', async (estudado) => {
      progressoService.alternarProgresso.mockResolvedValue({ estudado })
      const res = criarRes()

      await handler(criarReq({ estudado }), res)

      expect(progressoService.alternarProgresso).toHaveBeenCalledWith(7, tipo, '5', estudado)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ estudado })
    })

    it('usa sempre o id do usuário autenticado, ignorando um id_usuario enviado no body', async () => {
      progressoService.alternarProgresso.mockResolvedValue({})

      await handler(criarReq({ estudado: true, id_usuario: 999 }), criarRes())

      expect(progressoService.alternarProgresso).toHaveBeenCalledWith(7, tipo, '5', true)
    })

    it.each([
      ['ausente', {}],
      ['texto', { estudado: 'true' }],
      ['número 1', { estudado: 1 }],
      ['número 0', { estudado: 0 }],
      ['nulo', { estudado: null }]
    ])('responde 400 e não chama o service quando estudado é %s', async (_caso, body) => {
      const res = criarRes()

      await handler(criarReq(body), res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'erro',
        mensagem: 'estudado deve ser true ou false'
      })
      expect(progressoService.alternarProgresso).not.toHaveBeenCalled()
    })

    it('responde 500 com a mensagem do erro quando o service falha', async () => {
      progressoService.alternarProgresso.mockRejectedValue(new Error('falha de conexão'))
      const res = criarRes()

      await handler(criarReq(), res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ status: 'erro', mensagem: 'falha de conexão' })
    })
  })
})