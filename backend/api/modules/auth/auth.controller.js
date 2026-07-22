import * as authService from './auth.service.js'

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body
    const token = await authService.login(email, senha)
    res.json({ token })
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
}

export const logout = (req, res) => {
  res.json({ message: 'Logout realizado' })
}