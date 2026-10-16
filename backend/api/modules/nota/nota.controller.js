import * as notaService from './nota.service.js'

// tags é opcional, mas quando vem precisa ser uma lista
const tagsValidas = (tags) => tags === undefined || Array.isArray(tags)

export const listagem = async (req, res) => {
  try {
    const { id_caderno } = req.query
    const notas = await notaService.listarNotas(id_caderno)
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
    const { conteudo, id_caderno, titulo, tags } = req.body

    if (!tagsValidas(tags)) {
      return res.status(400).json({ status: 'erro', mensagem: 'tags deve ser uma lista' })
    }

    const nota = await notaService.criarNota(conteudo, id_caderno, titulo, tags)
    res.status(201).json(nota)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { conteudo, titulo, tags } = req.body

    if (!tagsValidas(tags)) {
      return res.status(400).json({ status: 'erro', mensagem: 'tags deve ser uma lista' })
    }

    const nota = await notaService.editarNota(id, conteudo, titulo, tags)

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