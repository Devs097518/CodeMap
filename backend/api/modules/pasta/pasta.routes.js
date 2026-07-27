import { Router } from 'express'
import * as pastaController from './pasta.controller.js'

const router = Router()

router.get('/listagem', pastaController.listagem)
router.post('/novo', pastaController.novo)
router.put('/editar/:id', pastaController.editar)
router.delete('/deletar/:id', pastaController.deletar)

export default router