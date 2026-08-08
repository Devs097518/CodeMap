import { Router } from 'express'
import * as categoriaController from './categoria.controller.js'

const router = Router()

router.get('/listagem', categoriaController.listagem)
router.post('/criarCategoria', categoriaController.novo)
router.put('/editar/:id', categoriaController.editar)
router.delete('/deletar/:id', categoriaController.deletar)
router.put('/restaurar/:id', categoriaController.restaurar)
router.put('/mover/:id', categoriaController.mover)

export default router