import { Router } from 'express'
import * as cadernoController from './caderno.controller.js'

const router = Router()

router.get('/listagem', cadernoController.listagem)
router.post('/novo', cadernoController.novo)
router.put('/editar/:id', cadernoController.editar)
router.delete('/deletar/:id', cadernoController.deletar)

export default router