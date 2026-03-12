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
    const { conteudo, id_usuario, titulo } = req.body;

    const result = await db.query(
      'INSERT INTO public.nota (conteudo, id_usuario, titulo) VALUES ($1, $2, $3) RETURNING *',
      [conteudo, id_usuario, titulo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

app.put('/editar-nota/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { conteudo, titulo } = req.body;
    

    const result = await db.query(
      'UPDATE public.nota SET conteudo = $1, titulo = $2 WHERE id_nota = $3 RETURNING *',
      [conteudo, titulo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'erro', mensagem: 'Nota não encontrada' });
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


//CADASTRO

app.post('/novo-cadastro', async (req, res) => {
  const { email, senha, username, uf } = req.body;
  const client = await db.connect(); // pega uma conexão dedicada

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
    await client.query('ROLLBACK'); // desfaz tudo se qualquer insert falhar

    if (error.constraint === 'usuario_email_key') {
      return res.status(409).json({ error: 'usuario_email_key' });
    }
    if (error.constraint === 'pessoa_username_key') {
      return res.status(409).json({ error: 'pessoa_username_key' });
    }

    res.status(500).json({ error: error.message });
  } finally {
    client.release(); // devolve a conexão para o pool
  }
});