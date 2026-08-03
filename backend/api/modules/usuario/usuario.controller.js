import * as usuarioService from './usuario.service.js'

export const listagem = async (req, res) => {
  try {
    const { email } = req.query
    const usuarios = await usuarioService.listarUsuarios(email)
    res.json(usuarios)
  } catch (err) {
    res.status(500).send(err.message)
  }
}