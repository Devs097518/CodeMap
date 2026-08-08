import { Router } from 'express'
import * as topicoController from './topico.controller.js'

const router = Router()

router.post('/criarTopico', topicoController.novo)
router.put('/editar/:id', topicoController.editar)
router.delete('/deletar/:id', topicoController.deletar)
router.put('/mover/:id', topicoController.mover)

export default router