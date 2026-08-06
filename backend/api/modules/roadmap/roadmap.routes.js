import { Router } from 'express'
import * as roadmapController from './roadmap.controller.js'

const router = Router()

router.get('/listagem', roadmapController.listagem)
router.get('/detalhe/:id', roadmapController.detalhe)
router.post('/criarRoadmap', roadmapController.novo)
router.put('/editar/:id', roadmapController.editar)
router.delete('/deletar/:id', roadmapController.deletar)
router.put('/restaurar/:id', roadmapController.restaurar)

export default router