import { Router } from 'express'
import { role } from '../../middlewares/role.middleware.js'
import * as categoriaController from './categoria.controller.js'

const router = Router()

router.get('/listagem', categoriaController.listagem)
router.get('/listagemAdmin', role('admin'), categoriaController.listagemAdmin)
router.post('/criarCategoria', role('admin'), categoriaController.novo)
router.put('/editar/:id', role('admin'), categoriaController.editar)
router.delete('/deletar/:id', role('admin'), categoriaController.deletar)
router.put('/restaurar/:id', role('admin'), categoriaController.restaurar)
router.put('/mover/:id', role('admin'), categoriaController.mover)

export default router