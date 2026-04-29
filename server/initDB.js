const pool = require('./config/db');

const initDB = async () => {

  const queries = [

    // USUARIOS
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(30) DEFAULT 'usuario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // RESTRICCIONES ALIMENTARIAS
    `CREATE TABLE IF NOT EXISTS restricciones_alimentarias (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL,
      descripcion TEXT
    );`,

    // TIPO DIETA
    `CREATE TABLE IF NOT EXISTS tipos_dieta (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL,
      descripcion TEXT
    );`,

    // COMEDORES
    `CREATE TABLE IF NOT EXISTS comedores (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      direccion TEXT,
      capacidad INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // JORNADAS
    `CREATE TABLE IF NOT EXISTS jornadas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100),
      fecha DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // ALIMENTOS
    `CREATE TABLE IF NOT EXISTS alimentos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      stock INTEGER DEFAULT 0,
      fecha_vencimiento DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // PORCIONES
    `CREATE TABLE IF NOT EXISTS porciones (
      id SERIAL PRIMARY KEY,
      cantidad INTEGER DEFAULT 0,

      jornada_id INTEGER REFERENCES jornadas(id),
      tipo_dieta_id INTEGER REFERENCES tipos_dieta(id),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  try {

    for (const query of queries) {
      await pool.query(query);
    }

    console.log('✅ Base de datos inicializada correctamente');

  } catch (error) {

    console.error('❌ Error inicializando DB:', error);

  }
};

module.exports = initDB;