import * as cadastroService from './cadastro.service.js'

export const cadastrar = async (req, res) => {
  const { email, senha, username, uf } = req.body

  try {
    const resultado = await cadastroService.cadastrar(email, senha, username, uf)
    res.status(201).json(resultado)
  } catch (error) {
    if (error.constraint === 'usuario_email_key') {
      return res.status(409).json({ error: 'usuario_email_key' })
    }
    if (error.constraint === 'pessoa_username_key') {
      return res.status(409).json({ error: 'pessoa_username_key' })
    }

    res.status(500).json({ error: error.message })
  }
}