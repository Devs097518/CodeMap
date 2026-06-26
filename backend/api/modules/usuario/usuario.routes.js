import { Router } from 'express';
import db from '../../../db/db.js';

const router = Router();

router.get('/listagem', async (req, res) => {
  try {
    const { email } = req.query;

    let query = `SELECT * FROM usuario`;
    let params = [];

    if (email) {
      query += ` WHERE email = $1`;
      params.push(email);
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;