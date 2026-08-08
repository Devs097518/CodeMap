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

CREATE TABLE topico(
    id_topico SERIAL PRIMARY KEY,
    roadmap_id INTEGER NOT NULL REFERENCES roadmap(id_roadmap),
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL,
    UNIQUE (roadmap_id, ordem)
);

CREATE TABLE subitem(
    id_subitem SERIAL PRIMARY KEY,
    topico_id INTEGER NOT NULL REFERENCES topico(id_topico) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL,
    UNIQUE (topico_id, ordem)
);

CREATE TABLE recurso(
    id_recurso SERIAL PRIMARY KEY,
    topico_id INTEGER REFERENCES topico(id_topico) ON DELETE CASCADE,
    subitem_id INTEGER REFERENCES subitem(id_subitem) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    CONSTRAINT chk_recurso_um_pai CHECK (
        (topico_id IS NOT NULL AND subitem_id IS NULL) OR
        (topico_id IS NULL AND subitem_id IS NOT NULL)
    )
);