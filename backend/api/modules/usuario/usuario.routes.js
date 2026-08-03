import { Router } from 'express'
import * as usuarioController from './usuario.controller.js'

const router = Router()

router.get('/listagem', usuarioController.listagem)

export default router