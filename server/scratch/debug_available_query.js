const pool = require('../config/db');

const testQuery = async () => {
    const query = `
        SELECT id, name, email, role_id, telefono, comuna, habilidades 
        FROM users 
        WHERE role_id = 2 AND id NOT IN (SELECT user_id FROM cuadrilla_miembros)
        ORDER BY name ASC
    `;
    try {
        console.log('Running query...');
        const res = await pool.query(query);
        console.log('Success! Rows:', res.rows.length);
        process.exit(0);
    } catch (err) {
        console.error('Query failed:', err.message);
        process.exit(1);
    }
};

testQuery();
