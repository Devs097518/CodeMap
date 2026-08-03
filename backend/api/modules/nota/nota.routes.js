import { Router } from 'express'
import * as notaController from './nota.controller.js'

const router = Router()

router.get('/listagem', notaController.listagem)
router.get('/por-usuario/:id_usuario', notaController.porUsuario)
router.post('/novo', notaController.novo)
router.put('/editar/:id', notaController.editar)
router.delete('/deletar/:id', notaController.deletar)

export default router