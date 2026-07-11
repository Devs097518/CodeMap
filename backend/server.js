import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import api from './api/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', api);

app.listen(3003, () => console.log('Servidor rodando na porta 3003'));
