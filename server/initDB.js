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
    );`,

    // 3. Crear tabla de Cuadrillas con Geoposicionamiento
    `CREATE TABLE IF NOT EXISTS cuadrillas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      zona VARCHAR(255) NOT NULL,
      estado VARCHAR(50) DEFAULT 'PENDIENTE',
      latitud DECIMAL(10, 8),
      longitud DECIMAL(11, 8),
      meta_voluntarios INTEGER DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 4. Crear tabla de Roles de Cuadrilla
    `CREATE TABLE IF NOT EXISTS roles_cuadrilla (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) UNIQUE NOT NULL
    );`,

    // 5. Tabla de Miembros (Relación muchos a muchos)
    `CREATE TABLE IF NOT EXISTS cuadrilla_miembros (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      cuadrilla_id INTEGER REFERENCES cuadrillas(id),
      rol_cuadrilla_id INTEGER REFERENCES roles_cuadrilla(id),
      UNIQUE(user_id, cuadrilla_id)
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

    // 4. Insertar roles de cuadrilla iniciales si no existen
    const cuadrillaRolesExist = await pool.query('SELECT COUNT(*) FROM roles_cuadrilla');
    if (parseInt(cuadrillaRolesExist.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO roles_cuadrilla (nombre) VALUES 
        ('Voluntario Senior'),
        ('Capataz de Zona'),
        ('Voluntario')
      `);
      console.log('✅ Roles de cuadrilla insertados');
    }

    // 5. Verificar si las columnas de coordenadas existen en cuadrillas
    const latCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='cuadrillas' AND column_name='latitud'
    `);

    if (latCheck.rows.length === 0) {
      await pool.query('ALTER TABLE cuadrillas ADD COLUMN latitud DECIMAL(10, 8), ADD COLUMN longitud DECIMAL(11, 8)');
      console.log('✅ Columnas latitud y longitud añadidas a cuadrillas');
    }

    // 6. Verificar si la columna role_id existe en users
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
