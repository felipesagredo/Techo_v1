const pool = require('./config/db');
require('dotenv').config();

const updateUserRoleToAdmin = async () => {
  try {
    // Actualizar el usuario con id 1 al role_id 1 (admin)
    const result = await pool.query(
      'UPDATE users SET role_id = $1 WHERE id = $2 RETURNING id, name, email, role_id',
      [1, 1] // role_id = 1 (admin), userId = 1
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✅ Usuario actualizado correctamente:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nuevo Role ID: ${user.role_id} (admin)`);
    
    pool.end();
  } catch (err) {
    console.error('❌ Error al actualizar el usuario:', err);
    process.exit(1);
  }
};

updateUserRoleToAdmin();
