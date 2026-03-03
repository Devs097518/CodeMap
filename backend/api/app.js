import express from 'express';
import cors from 'cors';
import db from '../db/db.js';


const app = express();

app.use(cors());
app.use(express.json());


/*
  USUARIO
*/

app.get('/listagem-usuario', async (req, res) => {
  try {
    const { email } = req.query; // ← Pega o email da query string

    let query = `SELECT * FROM usuario`;
    let params = [];

    if (email) {
      query += ` WHERE email = $1`;
      params.push(email);
    }

    const { rows } = await db.query(query, params);
    // const { rows } = await db.query(`SELECT * FROM usuario WHERE email='dayv@gmail.com'`); // <--- funciona
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/nota/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const result = await db.query(
      'SELECT * FROM public.nota WHERE id_usuario = $1',
      [id_usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nenhum nota encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

app.post('/novo-usuario', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const result = await db.query(
      'INSERT INTO public.usuario (email, senha) VALUES ($1, $2) RETURNING *',
      [email, senha]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



/*
  PESSOA
*/

app.get('/listagem-pessoa', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM pessoa');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/novo-pessoa', async (req, res) => {
  try {
    const { username, uf, id_usuario } = req.body;

    const result = await db.query(
      'INSERT INTO public.pessoa (username, uf, id_usuario) VALUES ($1, $2, $3) RETURNING *',
      [username, uf, id_usuario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Usuário não encontrado. O id_usuario informado não existe.'
      });
    }

    res.status(500).json({ error: error.message });
  }
});


/*
  nota
*/

app.get('/listagem-nota', async (req, res) => {
  try {
    const { id_usuario } = req.query; // ← muda para id_usuario

    let query = `SELECT * FROM nota`;
    let params = [];

    if (id_usuario) {
      query += ` WHERE id_usuario = $1`; // ← filtra pela coluna certa
      params.push(id_usuario);
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.post('/novo-nota', async (req, res) => {
  try {
    const { conteudo, id_usuario } = req.body;

    const result = await db.query(
      'INSERT INTO public.nota (conteudo, id_usuario) VALUES ($1, $2) RETURNING *',
      [conteudo, id_usuario]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

app.put('/editar-nota/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { conteudo } = req.body;

    const result = await db.query(
      'UPDATE public.nota SET conteudo = $1 WHERE id_usuario = $2 RETURNING *',
      [conteudo, id_usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'nota não encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});


app.delete('/deletar-nota/:id', async (req, res) => {
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


app.listen(3003, () => console.log('Servidor rodando na porta 3003'));