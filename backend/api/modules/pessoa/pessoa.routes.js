import { Router } from 'express'
import * as pessoaController from './pessoa.controller.js'

const router = Router()

router.get('/listagem', pessoaController.listagem)

export default router