const pool = require('./config/db');

const initDB = async () => {
  const queries = [
    // Tabla de Usuarios
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'voluntario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Tabla de Herramientas (Ejemplo para tu compañero)
    `CREATE TABLE IF NOT EXISTS tools (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      stock INTEGER DEFAULT 0,
      assigned_to INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  try {
    for (let query of queries) {
      await pool.query(query);
    }
    console.log('✅ Sistema de base de datos listo (Tablas verificadas)');
  } catch (err) {
    console.error('❌ Error inicializando base de datos:', err);
  }
};

module.exports = initDB;
