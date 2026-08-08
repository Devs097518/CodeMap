import { Router } from 'express'
import * as recursoController from './recurso.controller.js'

const router = Router()

router.get('/:id/listagem', recursoController.listagem)       // ?tipo=topico|subitem
router.post('/:id/criarRecurso', recursoController.novo)      // body: { tipo, label, url }
router.put('/editar/:id', recursoController.editar)
router.delete('/deletar/:id', recursoController.deletar)

export default router