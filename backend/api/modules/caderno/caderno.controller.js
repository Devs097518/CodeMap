import * as cadernoService from './caderno.service.js'

export const listagem = async (req, res) => {
  try {
    const { id_usuario } = req.query
    const cadernos = await cadernoService.listarCadernos(id_usuario)
    res.json(cadernos)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export const novo = async (req, res) => {
  try {
    const { id_usuario, titulo } = req.body
    const caderno = await cadernoService.criarCaderno(id_usuario, titulo)
    res.status(201).json(caderno)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo } = req.body
    const caderno = await cadernoService.editarCaderno(id, titulo)

    if (!caderno) {
      return res.status(404).json({ status: 'erro', mensagem: 'Caderno não encontrado' })
    }

    res.status(200).json(caderno)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const caderno = await cadernoService.deletarCaderno(id)

    if (!caderno) {
      return res.status(404).json({ status: 'erro', mensagem: 'Caderno não encontrado' })
    }

    res.status(200).json(caderno)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}