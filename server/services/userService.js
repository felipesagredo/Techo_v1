const pool = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (userData) => {
    const { name, email, password, role_id } = userData;

    // Si no viene un role_id, asignamos el ID 2 (Voluntario) por defecto
    const finalRoleId = role_id || 2;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
        INSERT INTO users (name, email, password, role_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, role_id
    `;
    const values = [name, email, hashedPassword, finalRoleId];

    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = { createUser };