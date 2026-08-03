import * as pastaService from './pasta.service.js'

export const listagem = async (req, res) => {
  try {
    const { id_usuario } = req.query
    const pastas = await pastaService.listarPastas(id_usuario)
    res.json(pastas)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export const novo = async (req, res) => {
  try {
    const { id_usuario, titulo } = req.body
    const pasta = await pastaService.criarPasta(id_usuario, titulo)
    res.status(201).json(pasta)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo } = req.body
    const pasta = await pastaService.editarPasta(id, titulo)

    if (!pasta) {
      return res.status(404).json({ status: 'erro', mensagem: 'Pasta não encontrada' })
    }

    res.status(200).json(pasta)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const pasta = await pastaService.deletarPasta(id)

    if (!pasta) {
      return res.status(404).json({ status: 'erro', mensagem: 'Pasta não encontrada' })
    }

    res.status(200).json(pasta)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}