BEGIN;

INSERT INTO categoria (nome, slug, ordem) VALUES
  ('Programação', 'programacao', 1),
  ('Segurança', 'seguranca', 2),
  ('Banco de Dados', 'banco-de-dados', 3);

INSERT INTO roadmap (categoria_id, titulo, descricao, is_active) VALUES
  ((SELECT id_categoria FROM categoria WHERE nome = 'Programação'),
   'Lógica de Programação',
   'Fundamentos para quem está começando: variáveis, condicionais, loops e funções.',
   true),

  ((SELECT id_categoria FROM categoria WHERE nome = 'Programação'),
   'JavaScript',
   'A linguagem padrão da web: sintaxe, DOM e conceitos assíncronos.',
   true),

  ((SELECT id_categoria FROM categoria WHERE nome = 'Programação'),
   'TypeScript',
   'Tipagem estática sobre JavaScript. Ainda em elaboração.',
   false),

  ((SELECT id_categoria FROM categoria WHERE nome = 'Segurança'),
   'Fundamentos de Segurança',
   'Conceitos essenciais de segurança da informação para desenvolvedores.',
   true),

  ((SELECT id_categoria FROM categoria WHERE nome = 'Banco de Dados'),
   'SQL Básico',
   'Consultas, filtros e junções essenciais para trabalhar com bancos relacionais.',
   true),

  ((SELECT id_categoria FROM categoria WHERE nome = 'Banco de Dados'),
   'PostgreSQL Avançado',
   'Índices, transações e otimização de queries. Ainda em elaboração.',
   false);

INSERT INTO topico (roadmap_id, titulo, descricao, ordem) VALUES
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'Lógica de Programação'),
   'Variáveis e Tipos', 'Como armazenar e representar dados na memória.', 1),
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'Lógica de Programação'),
   'Estruturas Condicionais', 'Tomada de decisão no código: if, else e switch.', 2),
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'Lógica de Programação'),
   'Loops', 'Repetição de instruções: for, while e do-while.', 3);

INSERT INTO subitem (topico_id, titulo, descricao, ordem) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'Loops' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'Lógica de Programação')),
   'For', 'Repetição com contador definido.', 1),
  ((SELECT id_topico FROM topico WHERE titulo = 'Loops' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'Lógica de Programação')),
   'While', 'Repetição enquanto uma condição for verdadeira.', 2),
  ((SELECT id_topico FROM topico WHERE titulo = 'Loops' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'Lógica de Programação')),
   'Do While', 'Repetição que executa ao menos uma vez.', 3);

INSERT INTO topico (roadmap_id, titulo, descricao, ordem) VALUES
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript'),
   'Variáveis e Constantes', 'let, const e var: escopo e mutabilidade.', 1),
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript'),
   'Funções', 'Declaração, expressão e arrow functions.', 2),
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript'),
   'Assincronia', 'Callbacks, Promises e async/await.', 3);

INSERT INTO subitem (topico_id, titulo, descricao, ordem) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'Variáveis e Constantes' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript')),
   'Let', 'Declaração de variável com escopo de bloco.', 1),
  ((SELECT id_topico FROM topico WHERE titulo = 'Variáveis e Constantes' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript')),
   'Const', 'Declaração de constante — referência imutável.', 2);

INSERT INTO subitem (topico_id, titulo, descricao, ordem) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'Assincronia' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript')),
   'Promises', 'Representação de uma operação assíncrona.', 1),
  ((SELECT id_topico FROM topico WHERE titulo = 'Assincronia' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript')),
   'Async/Await', 'Sintaxe mais legível sobre Promises.', 2);

INSERT INTO topico (roadmap_id, titulo, descricao, ordem) VALUES
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'Fundamentos de Segurança'),
   'Autenticação vs Autorização', 'A diferença entre provar quem você é e o que você pode fazer.', 1),
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'Fundamentos de Segurança'),
   'Hashing de Senhas', 'Por que nunca armazenar senha em texto puro.', 2);

INSERT INTO topico (roadmap_id, titulo, descricao, ordem) VALUES
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'SQL Básico'),
   'SELECT e WHERE', 'Consultando e filtrando dados de uma tabela.', 1),
  ((SELECT id_roadmap FROM roadmap WHERE titulo = 'SQL Básico'),
   'JOINs', 'Combinando dados de múltiplas tabelas.', 2);

INSERT INTO subitem (topico_id, titulo, descricao, ordem) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'JOINs' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'SQL Básico')),
   'INNER JOIN', 'Retorna apenas linhas com correspondência nas duas tabelas.', 1),
  ((SELECT id_topico FROM topico WHERE titulo = 'JOINs' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'SQL Básico')),
   'LEFT JOIN', 'Retorna todas as linhas da esquerda, com ou sem correspondência.', 2);

INSERT INTO recurso (topico_id, label, url) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'Variáveis e Tipos' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'Lógica de Programação')),
   'Artigo introdutório', 'https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript');

INSERT INTO recurso (topico_id, label, url) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'Variáveis e Constantes' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript')),
   'MDN Web Docs', 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/let');

INSERT INTO recurso (subitem_id, label, url) VALUES
  ((SELECT id_subitem FROM subitem WHERE titulo = 'Const' AND topico_id = (SELECT id_topico FROM topico WHERE titulo = 'Variáveis e Constantes' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript'))),
   'Documentação oficial', 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/const');

INSERT INTO recurso (topico_id, label, url) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'Assincronia' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'JavaScript')),
   'Guia de Promises', 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Using_promises');

INSERT INTO recurso (topico_id, label, url) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'Hashing de Senhas' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'Fundamentos de Segurança')),
   'OWASP Password Storage', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html');

INSERT INTO recurso (topico_id, label, url) VALUES
  ((SELECT id_topico FROM topico WHERE titulo = 'SELECT e WHERE' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'SQL Básico')),
   'PostgreSQL Tutorial', 'https://www.postgresql.org/docs/current/tutorial-select.html');

INSERT INTO recurso (subitem_id, label, url) VALUES
  ((SELECT id_subitem FROM subitem WHERE titulo = 'INNER JOIN' AND topico_id = (SELECT id_topico FROM topico WHERE titulo = 'JOINs' AND roadmap_id = (SELECT id_roadmap FROM roadmap WHERE titulo = 'SQL Básico'))),
   'Documentação PostgreSQL', 'https://www.postgresql.org/docs/current/queries-table-expressions.html');

COMMIT;