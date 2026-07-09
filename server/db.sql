-- Script para crear la tabla de usuarios en PostgreSQL
-- Ejecuta esto en tu query tool de pgAdmin en la base de datos 'techo_db'

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS roles_cuadrilla (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS cuadrillas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  zona VARCHAR(255) NOT NULL,
  estado VARCHAR(50) DEFAULT 'PENDIENTE',
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  meta_voluntarios INTEGER DEFAULT 5,
  capacidad INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cuadrilla_miembros (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  cuadrilla_id INTEGER REFERENCES cuadrillas(id),
  rol_cuadrilla_id INTEGER REFERENCES roles_cuadrilla(id),
  UNIQUE(user_id, cuadrilla_id)
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

INSERT INTO roles_cuadrilla (nombre) VALUES 
('Voluntario Senior'),
('Capataz de Zona'),
('Voluntario')
ON CONFLICT (nombre) DO NOTHING;
