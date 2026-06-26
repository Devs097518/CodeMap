import { Router } from 'express';
import db from '../../../db/db.js';

const router = Router();

router.get('/listagem', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM pessoa');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;