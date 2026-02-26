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

app.get('/texto/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const result = await db.query(
      'SELECT * FROM public.texto WHERE id_usuario = $1',
      [id_usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nenhum texto encontrado' });
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
  TEXTO
*/

// app.get('listagem-texto', async (req, res) => {
//   try {
//     const { rows } = await db.query('SELECT * FROM texto');
//     res.json(rows);
//   }
//   catch (err) {
//     res.status(500).send(err.message);
//   }
// });

app.get('/listagem-texto', async (req, res) => {
  try {
    const { id_usuario } = req.query; // ← muda para id_usuario

    let query = `SELECT * FROM texto`;
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


app.post('/novo-texto', async (req, res) => {
  try {
    const { conteudo, id_usuario } = req.body;

    const result = await db.query(
      'INSERT INTO public.texto (conteudo, id_usuario) VALUES ($1, $2) RETURNING *',
      [conteudo, id_usuario]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

app.put('/editar-texto/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { conteudo } = req.body;

    const result = await db.query(
      'UPDATE public.texto SET conteudo = $1 WHERE id_usuario = $2 RETURNING *',
      [conteudo, id_usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Texto não encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});


app.listen(3003, () => console.log('Servidor rodando na porta 3003'));