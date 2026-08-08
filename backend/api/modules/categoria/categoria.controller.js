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
    const { nome } = req.body
    if (!nome) {
      return res.status(400).json({ status: 'erro', mensagem: 'nome é obrigatório' })
    }
    const categoria = await categoriaService.criarCategoria(nome)
    res.status(201).json(categoria)
  } catch (err) {
    tratarErroPostgres(err, res)
  }
}

export const editar = async (req, res) => {
  try {
    const { id } = req.params
    const { nome } = req.body
    if (!nome) {
      return res.status(400).json({ status: 'erro', mensagem: 'nome é obrigatório' })
    }
    const categoria = await categoriaService.editarCategoria(id, nome)

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

export const mover = async (req, res) => {
  try {
    const { id } = req.params
    const { direcao } = req.body

    if (!['cima', 'baixo'].includes(direcao)) {
      return res.status(400).json({ status: 'erro', mensagem: 'direcao deve ser "cima" ou "baixo"' })
    }

    const resultado = await categoriaService.moverCategoria(id, direcao)

    if (!resultado.encontrada) {
      return res.status(404).json({ status: 'erro', mensagem: 'Categoria não encontrada' })
    }

    res.status(200).json({ status: 'ok', semMovimento: resultado.semMovimento })
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message })
  }
}