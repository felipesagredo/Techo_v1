-- Script para crear la tabla de usuarios en PostgreSQL
-- Ejecuta esto en tu query tool de pgAdmin en la base de datos 'techo_db'

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un usuario de prueba (la contraseña será 'admin123' encriptada por el backend después, 
-- pero por ahora esto es solo la estructura)
