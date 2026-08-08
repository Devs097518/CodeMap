import { Router } from 'express'
import * as subitemController from './subitem.controller.js'

const router = Router()

router.post('/criarSubitem', subitemController.novo)
router.put('/editar/:id', subitemController.editar)
router.delete('/deletar/:id', subitemController.deletar)
router.put('/mover/:id', subitemController.mover)

export default router