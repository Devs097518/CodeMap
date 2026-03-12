CREATE DATABASE codemap;

/c codemap;

CREATE TABLE usuario(
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE pessoa(
    id_pessoa SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    UF CHAR(2) NOT NULL,
    id_usuario INTEGER UNIQUE REFERENCES usuario(id_usuario)
);

CREATE TABLE pasta(
    id_pasta SERIAL PRIMARY KEY,
    titulo TEXT,
    id_usuario INTEGER REFERENCES usuario(id_usuario)
);

CREATE TABLE nota(
    id_nota SERIAL PRIMARY KEY,
    titulo TEXT,
    conteudo TEXT NOT NULL,
    id_pasta INTEGER REFERENCES pasta(id_pasta)
);