import * as roadmapService from './roadmap.service.js'

const tratarErroPostgres = (err, res) => {
  if (err.code === '23503') {
    return res.status(400).json({ status: 'erro', mensagem: 'Categoria informada não existe' })
  }
  return res.status(500).json({ status: 'erro', mensagem: err.message })
}

export const listagem = async (req, res) => {
  try {
    const roadmaps = await roadmapService.listarRoadmapsPublicos()
    res.json(roadmaps)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const listagemAdmin = async (req, res) => {
  try {
    const { categoria_id } = req.query
    const incluirArquivados = req.query.arquivados === 'true'
    const roadmaps = await roadmapService.listarRoadmapsAdmin({ categoria_id, incluirArquivados })
    res.json(roadmaps)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const detalhe = async (req, res) => {
  try {
    const { id } = req.params
    const roadmap = await roadmapService.buscarRoadmapPublicoPorId(id)
    if (!roadmap) {
      return res.status(404).json({ status: 'erro', mensagem: 'Roadmap não encontrado' })
    }
    res.json(roadmap)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const detalheAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const roadmap = await roadmapService.buscarRoadmapAdminPorId(id)

    if (!roadmap) {
      return res.status(404).json({ status: 'erro', mensagem: 'Roadmap não encontrado' })
    }
    res.json(roadmap)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const novo = async (req, res) => {
  try {
    const { categoria_id, titulo, descricao, is_active } = req.body

    if (!categoria_id || !titulo) {
      return res.status(400).json({ status: 'erro', mensagem: 'categoria_id e titulo são obrigatórios' })
    }

    const roadmap = await roadmapService.criarRoadmap(
      categoria_id,
      titulo,
      descricao ?? null,
      is_active ?? false
    )
    res.status(201).json(roadmap)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { categoria_id, titulo, descricao, is_active } = req.body

    if (!categoria_id || !titulo) {
      return res.status(400).json({ status: 'erro', mensagem: 'categoria_id e titulo são obrigatórios' })
    }

    const roadmap = await roadmapService.editarRoadmap(
      id,
      categoria_id,
      titulo,
      descricao ?? null,
      is_active ?? false
    )

    if (!roadmap) {
      return res.status(404).json({ status: 'erro', mensagem: 'Roadmap não encontrado' })
    }
    res.status(200).json(roadmap)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const roadmap = await roadmapService.buscarRoadmapPorId(id)

    if (!roadmap) {
      return res.status(404).json({ status: 'erro', mensagem: 'Roadmap não encontrado' })
    }
    if (roadmap.deleted_at) {
      return res.status(409).json({ status: 'erro', mensagem: 'Roadmap já está arquivado' })
    }

    const atualizado = await roadmapService.arquivarRoadmap(id)
    res.status(200).json(atualizado)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const restaurar = async (req, res) => {
  try {
    const { id } = req.params
    const roadmap = await roadmapService.buscarRoadmapPorId(id)

    if (!roadmap) {
      return res.status(404).json({ status: 'erro', mensagem: 'Roadmap não encontrado' })
    }
    if (!roadmap.deleted_at) {
      return res.status(409).json({ status: 'erro', mensagem: 'Roadmap já está ativo' })
    }

    const atualizado = await roadmapService.restaurarRoadmap(id)
    res.status(200).json(atualizado)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}