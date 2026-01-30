import express from 'express';
import db from '../db/db.js';


const app = express();
app.use(express.json());


//READ
app.get('/listagem-usuario', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM usuario');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/listagem-pessoa', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM pessoa');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('listagem-texto' , async (req,res) => {
  try{
    const { rows } = await db.query('SELECT * FROM texto');
    res.json(rows);
  }
  catch(err){
    res.status(500).send(err.message);
  }
});


//CREATE
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

app.post('/novo-texto', async (req, res) => {
  try{
    const { conteudo, id_usuario } = req.body;

    const result = await db.query(
      'INSERT INTO public.texto (conteudo, id_usuario) VALUES ($1, $2) RETURNING *',
      [conteudo, id_usuario]
    );

    res.status(201).json(result.rows[0]);
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));