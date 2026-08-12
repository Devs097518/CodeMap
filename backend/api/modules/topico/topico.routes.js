import { Router } from 'express'
import { role } from '../../middlewares/role.middleware.js'
import * as topicoController from './topico.controller.js'

const router = Router()

router.post('/criarTopico', role('admin'), topicoController.novo)
router.put('/editar/:id', role('admin'), topicoController.editar)
router.delete('/deletar/:id', role('admin'), topicoController.deletar)
router.put('/mover/:id', role('admin'), topicoController.mover)

export default router