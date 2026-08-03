export const role = (roleEsperado) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' })
    }

    if (req.user.role !== roleEsperado) {
      return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' })
    }

    next()
  }
}