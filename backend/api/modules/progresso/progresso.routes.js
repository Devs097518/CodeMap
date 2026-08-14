import { Router } from 'express'
import { role } from '../../middlewares/role.middleware.js'
import * as progressoController from './progresso.controller.js'

const router = Router()

router.put('/topico/:id', role('client'), progressoController.alternarTopico)
router.put('/subitem/:id', role('client'), progressoController.alternarSubitem)

export default router