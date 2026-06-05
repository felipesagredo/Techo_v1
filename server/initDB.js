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

    // 7. Verificar si la columna meta_voluntarios existe en cuadrillas
    const metaCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='cuadrillas' AND column_name='meta_voluntarios'
    `);

    if (metaCheck.rows.length === 0) {
      await pool.query('ALTER TABLE cuadrillas ADD COLUMN meta_voluntarios INTEGER DEFAULT 5');
      console.log('✅ Columna meta_voluntarios añadida a la tabla cuadrillas');
    }

    // 8. Verificar nuevas columnas en users (telefono, comuna, habilidades)
    const userColumnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name IN ('telefono', 'comuna', 'habilidades')
    `);

    const existingColumns = userColumnsCheck.rows.map(r => r.column_name);

    if (!existingColumns.includes('telefono')) {
      await pool.query('ALTER TABLE users ADD COLUMN telefono VARCHAR(20)');
      console.log('✅ Columna telefono añadida a users');
    }
    if (!existingColumns.includes('comuna')) {
      await pool.query('ALTER TABLE users ADD COLUMN comuna VARCHAR(100)');
      console.log('✅ Columna comuna añadida a users');
    }
    if (!existingColumns.includes('habilidades')) {
      await pool.query('ALTER TABLE users ADD COLUMN habilidades TEXT');
      console.log('✅ Columna habilidades añadida a users');
    }

    // Cuadrillas: Añadir capacidad
    const cuadrillaColsRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cuadrillas'");
    const cuadrillaCols = cuadrillaColsRes.rows.map(c => c.column_name);

    if (!cuadrillaCols.includes('capacidad')) {
      await pool.query('ALTER TABLE cuadrillas ADD COLUMN capacidad INTEGER DEFAULT 10');
      console.log('✅ Columna capacidad añadida a cuadrillas');
    }

    console.log('✅ Sistema de base de datos listo y sincronizado');
  } catch (err) {
    console.error('❌ Error inicializando base de datos:', err);
  }
};

export default initDB;
