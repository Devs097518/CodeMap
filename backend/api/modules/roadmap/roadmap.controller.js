import * as roadmapService from './roadmap.service.js'

const tratarErroPostgres = (err, res) => {
  if (err.code === '23503') {
    return res.status(400).json({ status: 'erro', mensagem: 'Categoria informada não existe' })
  }
  return res.status(500).json({ status: 'erro', mensagem: err.message })
}

// labels é opcional, mas quando vem precisa ser uma lista
const labelsValidas = (labels) => labels === undefined || Array.isArray(labels)

export const listagem = async (req, res) => {
  try {
    const roadmaps = await roadmapService.listarRoadmapsPublicos(req.user.id)

    const resultado = roadmaps.map(({ total_unidades, unidades_estudadas, ...roadmap }) => ({
      ...roadmap,
      iniciado: unidades_estudadas > 0,
      progresso_percentual: total_unidades > 0 ? Math.round((unidades_estudadas / total_unidades) * 100) : 0,
    }))

    res.json(resultado)
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

export const listarLabels = async (req, res) => {
  try {
    const labels = await roadmapService.listarLabels()
    res.json(labels)
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
    const { categoria_id, titulo, descricao, is_active, labels } = req.body

    if (!categoria_id || !titulo) {
      return res.status(400).json({ status: 'erro', mensagem: 'categoria_id e titulo são obrigatórios' })
    }
    if (!labelsValidas(labels)) {
      return res.status(400).json({ status: 'erro', mensagem: 'labels deve ser uma lista' })
    }

    const roadmap = await roadmapService.criarRoadmap(
      categoria_id,
      titulo,
      descricao ?? null,
      is_active ?? false,
      labels
    )
    res.status(201).json(roadmap)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { categoria_id, titulo, descricao, is_active, labels } = req.body

    if (!categoria_id || !titulo) {
      return res.status(400).json({ status: 'erro', mensagem: 'categoria_id e titulo são obrigatórios' })
    }
    if (!labelsValidas(labels)) {
      return res.status(400).json({ status: 'erro', mensagem: 'labels deve ser uma lista' })
    }

    const roadmap = await roadmapService.editarRoadmap(
      id,
      categoria_id,
      titulo,
      descricao ?? null,
      is_active ?? false,
      labels
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
    const roadmap = await roadmapService.buscarRoadmapAdminPorId(id)

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
    const roadmap = await roadmapService.buscarRoadmapAdminPorId(id)

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

// Só roadmaps públicos (ativos e não arquivados) podem virar meta
export const adicionarMeta = async (req, res) => {
  try {
    const { id } = req.params
    const roadmap = await roadmapService.buscarRoadmapPublicoPorId(id)

    if (!roadmap) {
      return res.status(404).json({ status: 'erro', mensagem: 'Roadmap não encontrado' })
    }

    await roadmapService.adicionarMeta(req.user.id, roadmap.id_roadmap)
    res.status(201).json({ status: 'ok', roadmap_id: roadmap.id_roadmap })
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const removerMeta = async (req, res) => {
  try {
    const { id } = req.params
    const removida = await roadmapService.removerMeta(req.user.id, id)

    if (!removida) {
      return res.status(404).json({ status: 'erro', mensagem: 'Meta não encontrada' })
    }

    res.status(200).json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}