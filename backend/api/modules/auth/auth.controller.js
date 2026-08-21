import * as authService from './auth.service.js'

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body
    const token = await authService.login(email, senha)

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      // sameSite: 'strict'
      sameSite: 'lax',
      path: '/'       
    })

    res.json({ message: 'Login realizado' }) 
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
}

export const logout = (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logout realizado' })
}

export const me = async (req, res) => {
  try {
    const usuario = await authService.buscarUsuarioLogado(req.user.id)
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' })
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}