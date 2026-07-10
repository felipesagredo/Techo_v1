const pool = require('../config/db');

const updateMockData = async () => {
    try {
        console.log('Updating volunteers with mock data...');
        
        // Actualizar algunos voluntarios con datos de prueba
        await pool.query(`
            UPDATE users 
            SET telefono = '+56 9 1234 5678', 
                comuna = 'Maipú', 
                habilidades = 'Carpintería, Liderazgo, Primeros Auxilios'
            WHERE email = 'voluntario1@techo.org' OR id = (SELECT id FROM users WHERE role_id = 2 LIMIT 1)
        `);

        await pool.query(`
            UPDATE users 
            SET telefono = '+56 9 8765 4321', 
                comuna = 'Renca', 
                habilidades = 'Electricidad, Trabajo en Altura'
            WHERE email = 'voluntario2@techo.org' OR id = (SELECT id FROM users WHERE role_id = 2 OFFSET 1 LIMIT 1)
        `);

        console.log('✅ Mock data updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error updating mock data:', err);
        process.exit(1);
    }
};

updateMockData();
