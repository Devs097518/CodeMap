import { Router } from 'express'
import * as cadastroController from './cadastro.controller.js'

const router = Router()

router.post('/cadastro', cadastroController.cadastrar)

export default router