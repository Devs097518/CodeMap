import * as notaService from './nota.service.js'

export const listagem = async (req, res) => {
  try {
    const { id_pasta } = req.query
    const notas = await notaService.listarNotas(id_pasta)
    res.json(notas)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export const porUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params
    const nota = await notaService.listarNotaPorUsuario(id_usuario)

    if (!nota) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nenhuma nota encontrada' })
    }

    res.status(200).json(nota)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const novo = async (req, res) => {
  try {
    const { conteudo, id_pasta, titulo, status } = req.body
    const nota = await notaService.criarNota(conteudo, id_pasta, titulo, status)
    res.status(201).json(nota)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { conteudo, titulo, status } = req.body
    const nota = await notaService.editarNota(id, conteudo, titulo, status)

    if (!nota) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nota não encontrada' })
    }

    res.status(200).json(nota)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const nota = await notaService.deletarNota(id)

    if (!nota) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nota não encontrada' })
    }

    res.status(200).json(nota)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}