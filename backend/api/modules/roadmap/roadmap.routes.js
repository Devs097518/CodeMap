import { Router } from 'express'
import { role } from '../../middlewares/role.middleware.js'
import * as roadmapController from './roadmap.controller.js'
import * as topicoController from '../topico/topico.controller.js'

const router = Router()

router.get('/listagem', roadmapController.listagem)
router.get('/listagemAdmin', role('admin'), roadmapController.listagemAdmin)
router.get('/detalhe/:id', roadmapController.detalhe)
router.get('/detalheAdmin/:id', role('admin'), roadmapController.detalheAdmin)
router.get('/:id/topicos', topicoController.listagemComSubitens)
router.get('/:id/topicosAdmin', role('admin'), topicoController.listagemComSubitensAdmin)

router.post('/criarRoadmap', role('admin'), roadmapController.novo)
router.put('/editar/:id', role('admin'), roadmapController.editar)
router.delete('/deletar/:id', role('admin'), roadmapController.deletar)
router.put('/restaurar/:id', role('admin'), roadmapController.restaurar)

export default router