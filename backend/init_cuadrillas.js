const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'fgk59efg4f',
  port: 5432,
});

async function run() {
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cuadrillas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        zona VARCHAR(255) NOT NULL,
        estado VARCHAR(50) DEFAULT 'PENDIENTE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS roles_cuadrilla (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cuadrilla_miembros (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        cuadrilla_id INTEGER REFERENCES cuadrillas(id),
        rol_cuadrilla_id INTEGER REFERENCES roles_cuadrilla(id),
        UNIQUE(user_id, cuadrilla_id)
      );
    `);
    console.log('Tablas creadas.');

    // Insertar roles_cuadrilla
    await client.query(`
      INSERT INTO roles_cuadrilla (nombre) VALUES 
      ('Voluntario Senior'),
      ('Capataz de Zona'),
      ('Voluntario')
      ON CONFLICT DO NOTHING;
    `);

    // Limpiar cuadrillas existentes para evitar duplicados en el mock
    await client.query('DELETE FROM cuadrilla_miembros');
    await client.query('DELETE FROM cuadrillas');
    
    // Insertar Cuadrillas
    const c1 = await client.query(`INSERT INTO cuadrillas (nombre, zona, estado) VALUES ('Cuadrilla Los Alerces', 'Campamento Felipe Camiroaga, Viña del Mar', 'EN CONSTRUCCIÓN') RETURNING id`);
    const c2 = await client.query(`INSERT INTO cuadrillas (nombre, zona, estado) VALUES ('Cuadrilla La Esperanza', 'Toma Nuevo Amanecer, Cerrillos', 'PENDIENTE') RETURNING id`);
    const c3 = await client.query(`INSERT INTO cuadrillas (nombre, zona, estado) VALUES ('Cuadrilla San José', 'Aldea La Unión, Talca', 'ABASTECIMIENTO') RETURNING id`);
    const c4 = await client.query(`INSERT INTO cuadrillas (nombre, zona, estado) VALUES ('Cuadrilla Los Cipreses', 'Villa Los Huertos, Rancagua', 'EN CONSTRUCCIÓN') RETURNING id`);

    // Insertar usuarios capataces y miembros dummy
    // Helper to add user
    async function addUser(name, email) {
      const res = await client.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, 'admin123') ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [name, email]);
      return res.rows[0].id;
    }
    
    const u1 = await addUser('Andrés Morales', 'andres@techo.org');
    const u3 = await addUser('Camila Jara', 'camila@techo.org');
    const u4 = await addUser('Joaquín Soto', 'joaquin@techo.org');

    // Get roles
    const rolesRes = await client.query('SELECT id, nombre FROM roles_cuadrilla');
    const roles = {};
    rolesRes.rows.forEach(r => roles[r.nombre] = r.id);

    // Asignar capataces
    await client.query(`INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)`, [u1, c1.rows[0].id, roles['Voluntario Senior']]);
    await client.query(`INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)`, [u3, c3.rows[0].id, roles['Capataz de Zona']]);
    await client.query(`INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)`, [u4, c4.rows[0].id, roles['Voluntario']]);

    // Añadir miembros extra para que cuadren los números (8, 5, 12, 6)
    // C1: 8 total (1 capataz + 7)
    for(let i=0; i<7; i++) {
        let uid = await addUser(`Dummy C1_${i}`, `dummyc1_${i}@techo.org`);
        await client.query(`INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)`, [uid, c1.rows[0].id, roles['Voluntario']]);
    }
    // C2: 5 total (0 capataz + 5)
    for(let i=0; i<5; i++) {
        let uid = await addUser(`Dummy C2_${i}`, `dummyc2_${i}@techo.org`);
        await client.query(`INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)`, [uid, c2.rows[0].id, roles['Voluntario']]);
    }
    // C3: 12 total (1 capataz + 11)
    for(let i=0; i<11; i++) {
        let uid = await addUser(`Dummy C3_${i}`, `dummyc3_${i}@techo.org`);
        await client.query(`INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)`, [uid, c3.rows[0].id, roles['Voluntario']]);
    }
    // C4: 6 total (1 capataz + 5)
    for(let i=0; i<5; i++) {
        let uid = await addUser(`Dummy C4_${i}`, `dummyc4_${i}@techo.org`);
        await client.query(`INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)`, [uid, c4.rows[0].id, roles['Voluntario']]);
    }

    console.log('Datos mock insertados correctamente.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
