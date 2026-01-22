CREATE DATABASE codemap;
\c codemap;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmaps (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_items (
  id SERIAL PRIMARY KEY,
  roadmap_id INTEGER REFERENCES roadmaps(id),
  title VARCHAR(255) NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  roadmap_item_id INTEGER REFERENCES roadmap_items(id),
  status VARCHAR(50) CHECK (status IN ('not-started', 'studying', 'completed', 'ignored')),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, roadmap_item_id)
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  roadmap_id INTEGER REFERENCES roadmaps(id),
  title VARCHAR(255) NOT NULL,
  difficulty VARCHAR(50),
  description TEXT
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  roadmap_id INTEGER REFERENCES roadmaps(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);