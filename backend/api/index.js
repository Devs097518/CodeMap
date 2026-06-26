import { Router } from 'express';
import usuarioRoutes from './modules/usuario/usuario.routes.js';
import notaRoutes from './modules/nota/nota.routes.js';
import pastaRoutes from './modules/pasta/pasta.routes.js';
import pessoaRoutes from './modules/pessoa/pessoa.routes.js';
import authRoutes from './modules/auth/auth.routes.js';

const router = Router();

router.use('/usuario', usuarioRoutes);
router.use('/nota', notaRoutes);
router.use('/pasta', pastaRoutes);
router.use('/pessoa', pessoaRoutes);
router.use('/auth', authRoutes);

export default router;