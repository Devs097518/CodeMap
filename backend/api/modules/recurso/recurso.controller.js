import * as recursoService from './recurso.service.js'

const tratarErroPostgres = (err, res) => {
  if (err.code === '23503') {
    return res.status(400).json({ status: 'erro', mensagem: 'Tópico ou sub-item informado não existe' })
  }
  if (err.code === '23514') {
    return res.status(400).json({ status: 'erro', mensagem: 'tipo inválido' })
  }
  return res.status(500).json({ status: 'erro', mensagem: err.message })
}

const urlValida = (url) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const listagem = async (req, res) => {
  try {
    const { id } = req.params
    const { tipo } = req.query

    if (!['topico', 'subitem'].includes(tipo)) {
      return res.status(400).json({ status: 'erro', mensagem: "tipo deve ser 'topico' ou 'subitem'" })
    }

    const recursos = tipo === 'topico'
      ? await recursoService.listarRecursosPorTopico(id)
      : await recursoService.listarRecursosPorSubitem(id)

    res.json(recursos)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const novo = async (req, res) => {
  try {
    const { id } = req.params
    const { tipo, label, url } = req.body

    if (!['topico', 'subitem'].includes(tipo)) {
      return res.status(400).json({ status: 'erro', mensagem: "tipo deve ser 'topico' ou 'subitem'" })
    }
    if (!label || !url) {
      return res.status(400).json({ status: 'erro', mensagem: 'label e url são obrigatórios' })
    }
    if (!urlValida(url)) {
      return res.status(400).json({ status: 'erro', mensagem: 'url inválida' })
    }

    const recurso = await recursoService.criarRecurso(tipo, id, label, url)
    res.status(201).json(recurso)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { label, url } = req.body

    if (!label || !url) {
      return res.status(400).json({ status: 'erro', mensagem: 'label e url são obrigatórios' })
    }
    if (!urlValida(url)) {
      return res.status(400).json({ status: 'erro', mensagem: 'url inválida' })
    }

    const recurso = await recursoService.editarRecurso(id, label, url)

    if (!recurso) {
      return res.status(404).json({ status: 'erro', mensagem: 'Recurso não encontrado' })
    }
    res.status(200).json(recurso)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const recurso = await recursoService.excluirRecurso(id)

    if (!recurso) {
      return res.status(404).json({ status: 'erro', mensagem: 'Recurso não encontrado' })
    }
    res.status(200).json(recurso)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}