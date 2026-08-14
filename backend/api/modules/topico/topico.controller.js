import * as topicoService from './topico.service.js'
import * as subitemService from '../subitem/subitem.service.js'
import * as roadmapService from '../roadmap/roadmap.service.js'

const tratarErroPostgres = (err, res) => {
  if (err.code === '23503') {
    return res.status(400).json({ status: 'erro', mensagem: 'Roadmap informado não existe' })
  }
  return res.status(500).json({ status: 'erro', mensagem: err.message })
}

import * as progressoService from '../progresso/progresso.service.js'

export const listagemComSubitens = async (req, res) => {
  try {
    const { id } = req.params
    const roadmap = await roadmapService.buscarRoadmapPublicoPorId(id)

    if (!roadmap) {
      return res.status(404).json({ status: 'erro', mensagem: 'Roadmap não encontrado' })
    }

    const topicos = await topicoService.listarTopicosPorRoadmap(id)
    const topicoIds = topicos.map((t) => t.id_topico)

    const subitensPorTopico = await Promise.all(
      topicos.map((t) => subitemService.listarSubitensPorTopico(t.id_topico))
    )
    const subitemIds = subitensPorTopico.flat().map((s) => s.id_subitem)

    const [progressoTopicos, progressoSubitens] = await Promise.all([
      progressoService.buscarProgressoTopicos(req.user.id, topicoIds),
      progressoService.buscarProgressoSubitens(req.user.id, subitemIds),
    ])

    const mapaTopicos = new Map(progressoTopicos.map((p) => [p.item_id, p.estudado]))
    const mapaSubitens = new Map(progressoSubitens.map((p) => [p.item_id, p.estudado]))

    const topicosComSubitens = topicos.map((topico, index) => ({
      ...topico,
      estudado: mapaTopicos.get(topico.id_topico) ?? false,
      subitens: subitensPorTopico[index].map((sub) => ({
        ...sub,
        estudado: mapaSubitens.get(sub.id_subitem) ?? false,
      })),
    }))

    res.json(topicosComSubitens)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const listagemComSubitensAdmin = async (req, res) => {
  try {
    const { id } = req.params
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