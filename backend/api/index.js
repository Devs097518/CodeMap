import { Router } from 'express';
import { autenticar } from './middlewares/auth.middleware.js';
// import { role } from './middlewares/role.middleware.js';
import usuarioRoutes from './modules/usuario/usuario.routes.js';
import notaRoutes from './modules/nota/nota.routes.js';
import pastaRoutes from './modules/pasta/pasta.routes.js';
import pessoaRoutes from './modules/pessoa/pessoa.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import cadastroRoutes from './modules/cadastro/cadastro.routes.js';
import categoriaRoutes from './modules/categoria/categoria.routes.js';



const router = Router();

router.use('/usuario', usuarioRoutes);
router.use('/nota', autenticar, notaRoutes);
router.use('/pasta', autenticar, pastaRoutes);
router.use('/pessoa', pessoaRoutes);
router.use('/auth', authRoutes);
router.use('/cadastro', cadastroRoutes);
router.use('/categoria', categoriaRoutes); //autenticar, role('admin'),

export default router;