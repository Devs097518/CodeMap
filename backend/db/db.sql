CREATE DATABASE codemap;

/c codemap;

CREATE TYPE tipo_usuario AS ENUM ('client', 'admin');

CREATE TABLE usuario(
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role tipo_usuario NOT NULL DEFAULT 'client'
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

CREATE TABLE categoria(
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    ordem INTEGER UNIQUE NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE roadmap(
    id_roadmap SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categoria(id_categoria),
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);