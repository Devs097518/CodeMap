CREATE DATABASE codemap;

CREATE TABLE usuario(
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE pessoa(
    id_pessoa SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    UF CHAR(2) NOT NULL,
    id_usuario INTEGER UNIQUE REFERENCES usuario(id_usuario)
);


CREATE TABLE texto(
    id_texto SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    id_usuario INTEGER UNIQUE REFERENCES usuario(id_usuario)
);