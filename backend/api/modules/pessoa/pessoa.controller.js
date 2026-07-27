import * as pessoaService from './pessoa.service.js'

export const listagem = async (req, res) => {
  try {
    const pessoas = await pessoaService.listarPessoas()
    res.json(pessoas)
  } catch (err) {
    res.status(500).send(err.message)
  }
}