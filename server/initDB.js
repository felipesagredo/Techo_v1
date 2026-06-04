import pool from './config/db.js';

const initDB = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) UNIQUE NOT NULL,
      descripcion VARCHAR(255)
    );`,
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role_id INTEGER REFERENCES roles(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS herramientas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion VARCHAR(500) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      categoria_herramienta VARCHAR(30) NOT NULL,
      assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
      estado VARCHAR(30) NOT NULL DEFAULT 'disponible',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS materiales (
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
    );`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }

    const rolesExist = await pool.query('SELECT COUNT(*) FROM roles');
    if (parseInt(rolesExist.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO roles (nombre, descripcion) VALUES
        ('admin', 'Administrador con acceso total'),
        ('voluntario', 'Voluntario de campo'),
        ('socio', 'Socio colaborador')
        ON CONFLICT (nombre) DO NOTHING
      `);
      console.log('✅ Roles iniciales insertados');
    }

    console.log('✅ Sistema de base de datos listo y sincronizado');
  } catch (err) {
    console.error('❌ Error inicializando base de datos:', err);
  }
};

export default initDB;
