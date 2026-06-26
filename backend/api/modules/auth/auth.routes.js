import { Router } from 'express';
import db from '../../../db/db.js';

const router = Router();

router.post('/cadastro', async (req, res) => {
  const { email, senha, username, uf } = req.body;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const usuarioResult = await client.query(
      'INSERT INTO public.usuario (email, senha) VALUES ($1, $2) RETURNING *',
      [email, senha]
    );
    const usuario = usuarioResult.rows[0];

    const pessoaResult = await client.query(
      'INSERT INTO public.pessoa (username, uf, id_usuario) VALUES ($1, $2, $3) RETURNING *',
      [username, uf, usuario.id_usuario]
    );

    await client.query('COMMIT');

    res.status(201).json({ usuario, pessoa: pessoaResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.constraint === 'usuario_email_key') {
      return res.status(409).json({ error: 'usuario_email_key' });
    }
    if (error.constraint === 'pessoa_username_key') {
      return res.status(409).json({ error: 'pessoa_username_key' });
    }

    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;