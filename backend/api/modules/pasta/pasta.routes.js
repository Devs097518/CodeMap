import { Router } from 'express';
import db from '../../../db/db.js';

const router = Router();

router.get('/listagem', async (req, res) => {
  try {
    const { id_usuario } = req.query;

    let query = `SELECT * FROM pasta`;
    let params = [];

    if (id_usuario) {
      query += ` WHERE id_usuario = $1`;
      params.push(id_usuario);
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/novo', async (req, res) => {
  try {
    const { id_usuario, titulo } = req.body;

    const result = await db.query(
      'INSERT INTO public.pasta (id_usuario, titulo) VALUES ($1, $2) RETURNING *',
      [id_usuario, titulo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

router.put('/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo } = req.body;

    const result = await db.query(
      'UPDATE public.pasta SET titulo = $1 WHERE id_pasta = $2 RETURNING *',
      [titulo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Pasta não encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

router.delete('/deletar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM public.pasta WHERE id_pasta = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Pasta não encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

export default router;