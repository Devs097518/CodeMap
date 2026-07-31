import jwt from 'jsonwebtoken'

export const autenticar = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}

// import jwt from 'jsonwebtoken'

// export const autenticar = (req, res, next) => {
//   const authHeader = req.headers.authorization

//   if (!authHeader) {
//     return res.status(401).json({ message: 'Token não fornecido' })
//   }

//   const token = authHeader.split(' ')[1] 

//   if (!token) {
//     return res.status(401).json({ message: 'Token mal formatado' })
//   }

//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET)
//     req.user = payload 
//     next()
//   } catch (error) { 
//     return res.status(401).json({ message: 'Token inválido ou expirado' })
//   }
// }