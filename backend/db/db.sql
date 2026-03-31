CREATE DATABASE codemap;

/c codemap;

CREATE TYPE tipo_atribuicao AS ENUM ('cliente', 'admin');

CREATE TABLE usuario(
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    papel tipo_atribuicao
);

CREATE TABLE pessoa(
    id_pessoa SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    UF CHAR(2) NOT NULL,
    id_usuario INTEGER UNIQUE REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE pasta(
    id_pasta SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TYPE status_nota AS ENUM ('pendente', 'fazendo', 'feito');

CREATE TABLE nota(
    id_nota SERIAL PRIMARY KEY,
    titulo TEXT,
    conteudo TEXT NOT NULL,
    id_pasta INTEGER REFERENCES pasta(id_pasta) ON DELETE CASCADE NOT NULL,
    status status_nota
);