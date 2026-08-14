import * as progressoService from './progresso.service.js'

export const alternarTopico = async (req, res) => {
  try {
    const { id } = req.params
    const { estudado } = req.body
    const id_usuario = req.user.id

    if (typeof estudado !== 'boolean') {
      return res.status(400).json({ status: 'erro', mensagem: 'estudado deve ser true ou false' })
    }

    const progresso = await progressoService.alternarProgresso(id_usuario, 'topico', id, estudado)
    res.status(200).json(progresso)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const alternarSubitem = async (req, res) => {
  try {
    const { id } = req.params
    const { estudado } = req.body
    const id_usuario = req.user.id

    if (typeof estudado !== 'boolean') {
      return res.status(400).json({ status: 'erro', mensagem: 'estudado deve ser true ou false' })
    }

    const progresso = await progressoService.alternarProgresso(id_usuario, 'subitem', id, estudado)
    res.status(200).json(progresso)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}