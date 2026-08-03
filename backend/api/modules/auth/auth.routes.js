import { Router } from 'express'
import * as authController from './auth.controller.js'
import { autenticar } from '../../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/me', autenticar, authController.me)

export default router
