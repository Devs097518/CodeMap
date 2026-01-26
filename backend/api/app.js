import express from 'express';
import db from '../db/db.js';

const app = express();

app.get('/usuarios', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM usuario');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));