-- Script para crear la tabla de usuarios en PostgreSQL
-- Ejecuta esto en tu query tool de pgAdmin en la base de datos 'techo_db'

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS herramientas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria_herramienta VARCHAR(30) NOT NULL,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'disponible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materiales (
  id SERIAL PRIMARY KEY,
  nombre_material VARCHAR(100) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  categoria VARCHAR(100) NOT NULL,
  largo NUMERIC(10,2),
  ancho NUMERIC(10,2),
  peso NUMERIC(10,2),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'disponible',
  archivos TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador con acceso total'),
('voluntario', 'Voluntario de campo'),
('socio', 'Socio colaborador')
ON CONFLICT (nombre) DO NOTHING;
