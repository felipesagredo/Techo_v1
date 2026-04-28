const pool = require('./config/db');

const initDB = async () => {
  const queries = [
    // 1. Crear tabla de Roles
    `CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) UNIQUE NOT NULL,
      descripcion VARCHAR(255)
    );`,

    // 2. Crear tabla de Usuarios con relación a Roles
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role_id INTEGER REFERENCES roles(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  try {
    // Ejecutar creación de tablas
    for (let query of queries) {
      await pool.query(query);
    }

    // 3. Insertar roles iniciales si no existen
    const rolesExist = await pool.query('SELECT COUNT(*) FROM roles');
    if (parseInt(rolesExist.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO roles (nombre, descripcion) VALUES 
        ('admin', 'Administrador con acceso total'),
        ('voluntario', 'Voluntario de campo'),
        ('socio', 'Socio colaborador')
      `);
      console.log('✅ Roles iniciales insertados');
    }

    // 4. Verificar si la columna role_id existe en users (por si la tabla se creó antes sin ella)
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='role_id'
    `);

    if (columnCheck.rows.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id) DEFAULT 2');
      console.log('✅ Columna role_id añadida a la tabla users');
    }

    console.log('✅ Sistema de base de datos listo y sincronizado');
  } catch (err) {
    console.error('❌ Error inicializando base de datos:', err);
  }
};

module.exports = initDB;
