import * as subitemService from './subitem.service.js'

const tratarErroPostgres = (err, res) => {
  if (err.code === '23503') {
    return res.status(400).json({ status: 'erro', mensagem: 'Tópico informado não existe' })
  }
  return res.status(500).json({ status: 'erro', mensagem: err.message })
}

export const novo = async (req, res) => {
  try {
    const { topico_id, titulo, descricao } = req.body
    if (!topico_id || !titulo) {
      return res.status(400).json({ status: 'erro', mensagem: 'topico_id e titulo são obrigatórios' })
    }
    const subitem = await subitemService.criarSubitem(topico_id, titulo, descricao ?? null)
    res.status(201).json(subitem)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, descricao } = req.body
    if (!titulo) {
      return res.status(400).json({ status: 'erro', mensagem: 'titulo é obrigatório' })
    }
    const subitem = await subitemService.editarSubitem(id, titulo, descricao ?? null)
    if (!subitem) {
      return res.status(404).json({ status: 'erro', mensagem: 'Sub-item não encontrado' })
    }
    res.status(200).json(subitem)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const subitem = await subitemService.excluirSubitem(id)
    if (!subitem) {
      return res.status(404).json({ status: 'erro', mensagem: 'Sub-item não encontrado' })
    }
    res.status(200).json(subitem)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const mover = async (req, res) => {
  try {
    const { id } = req.params
    const { direcao } = req.body
    if (!['cima', 'baixo'].includes(direcao)) {
      return res.status(400).json({ status: 'erro', mensagem: 'direcao deve ser "cima" ou "baixo"' })
    }
    const resultado = await subitemService.moverSubitem(id, direcao)
    if (!resultado.encontrado) {
      return res.status(404).json({ status: 'erro', mensagem: 'Sub-item não encontrado' })
    }
    res.status(200).json({ status: 'ok', semMovimento: resultado.semMovimento })
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}