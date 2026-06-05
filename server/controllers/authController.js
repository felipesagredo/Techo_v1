import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password, role_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalRoleId = role_id || 2; // Por defecto voluntario
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role_id',
      [name, email, hashedPassword, finalRoleId]
    );
    res.status(201).json({ message: 'Usuario registrado', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el registro' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Usuario no encontrado' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const jwtSecret = process.env.JWT_SECRET || 'secret_key_123';
    const token = jwt.sign({ id: user.id, email: user.email, role_id: user.role_id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, role_id: user.role_id }, message: 'Inicio de Sesion Exitoso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el login' });
  }
};

export default { register, login };
