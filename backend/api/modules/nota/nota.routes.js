import { Router } from 'express';
import db from '../../../db/db.js';

const router = Router();

router.get('/listagem', async (req, res) => {
  try {
    const { id_pasta } = req.query;

    let query = `SELECT * FROM nota`;
    let params = [];

    if (id_pasta) {
      query += ` WHERE id_pasta = $1`;
      params.push(id_pasta);
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/por-usuario/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const result = await db.query(
      'SELECT * FROM public.nota WHERE id_usuario = $1',
      [id_usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nenhuma nota encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

router.post('/novo', async (req, res) => {
  try {
    const { conteudo, id_pasta, titulo, status } = req.body;

    const result = await db.query(
      'INSERT INTO public.nota (conteudo, id_pasta, titulo, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [conteudo, id_pasta, titulo, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

router.put('/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { conteudo, titulo, status } = req.body;

    const result = await db.query(
      'UPDATE public.nota SET conteudo = $1, titulo = $2, status = $4 WHERE id_nota = $3 RETURNING *',
      [conteudo, titulo, id, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nota não encontrada' });
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
      'DELETE FROM public.nota WHERE id_nota = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nota não encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

export default router;