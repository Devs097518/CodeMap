import * as topicoService from './topico.service.js'
import * as subitemService from '../subitem/subitem.service.js'

const tratarErroPostgres = (err, res) => {
  if (err.code === '23503') {
    return res.status(400).json({ status: 'erro', mensagem: 'Roadmap informado não existe' })
  }
  return res.status(500).json({ status: 'erro', mensagem: err.message })
}

export const listagemComSubitens = async (req, res) => {
  try {
    const { id } = req.params // id_roadmap
    const topicos = await topicoService.listarTopicosPorRoadmap(id)

    const topicosComSubitens = await Promise.all(
      topicos.map(async (topico) => ({
        ...topico,
        subitens: await subitemService.listarSubitensPorTopico(topico.id_topico),
      }))
    )

    res.json(topicosComSubitens)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const novo = async (req, res) => {
  try {
    const { roadmap_id, titulo, descricao } = req.body
    if (!roadmap_id || !titulo) {
      return res.status(400).json({ status: 'erro', mensagem: 'roadmap_id e titulo são obrigatórios' })
    }
    const topico = await topicoService.criarTopico(roadmap_id, titulo, descricao ?? null)
    res.status(201).json(topico)
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
    const topico = await topicoService.editarTopico(id, titulo, descricao ?? null)
    if (!topico) {
      return res.status(404).json({ status: 'erro', mensagem: 'Tópico não encontrado' })
    }
    res.status(200).json(topico)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const topico = await topicoService.excluirTopico(id)
    if (!topico) {
      return res.status(404).json({ status: 'erro', mensagem: 'Tópico não encontrado' })
    }
    res.status(200).json(topico)
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
    const resultado = await topicoService.moverTopico(id, direcao)
    if (!resultado.encontrado) {
      return res.status(404).json({ status: 'erro', mensagem: 'Tópico não encontrado' })
    }
    res.status(200).json({ status: 'ok', semMovimento: resultado.semMovimento })
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}