import * as categoriaService from './categoria.service.js'

const tratarErroPostgres = (err, res) => {
  if (err.code === '23505') {
    return res.status(409).json({ status: 'erro', mensagem: 'Já existe uma categoria com esse nome, slug ou ordem' })
  }
  return res.status(500).json({ status: 'erro', mensagem: err.message })
}

export const listagem = async (req, res) => {
  try {
    const incluirArquivadas = req.query.arquivadas === 'true'
    const categorias = await categoriaService.listarCategorias(incluirArquivadas)
    res.json(categorias)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const novo = async (req, res) => {
  try {
    const { nome, ordem } = req.body

    if (!nome || ordem === undefined) {
      return res.status(400).json({ status: 'erro', mensagem: 'nome e ordem são obrigatórios' })
    }

    const categoria = await categoriaService.criarCategoria(nome, ordem)
    res.status(201).json(categoria)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { nome, ordem } = req.body

    if (!nome || ordem === undefined) {
      return res.status(400).json({ status: 'erro', mensagem: 'nome e ordem são obrigatórios' })
    }

    const categoria = await categoriaService.editarCategoria(id, nome, ordem)

    if (!categoria) {
      return res.status(404).json({ status: 'erro', mensagem: 'Categoria não encontrada' })
    }

    res.status(200).json(categoria)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const deletar = async (req, res) => {
  try {
    const { id } = req.params
    const categoria = await categoriaService.buscarCategoriaPorId(id)

    if (!categoria) {
      return res.status(404).json({ status: 'erro', mensagem: 'Categoria não encontrada' })
    }
    if (categoria.deleted_at) {
      return res.status(409).json({ status: 'erro', mensagem: 'Categoria já está arquivada' })
    }

    const atualizada = await categoriaService.arquivarCategoria(id)
    res.status(200).json(atualizada)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}

export const restaurar = async (req, res) => {
  try {
    const { id } = req.params
    const categoria = await categoriaService.buscarCategoriaPorId(id)

    if (!categoria) {
      return res.status(404).json({ status: 'erro', mensagem: 'Categoria não encontrada' })
    }
    if (!categoria.deleted_at) {
      return res.status(409).json({ status: 'erro', mensagem: 'Categoria já está ativa' })
    }

    const atualizada = await categoriaService.restaurarCategoria(id)
    res.status(200).json(atualizada)
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}