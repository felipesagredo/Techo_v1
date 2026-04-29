const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTRO
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        ok: false,
        message: 'El correo ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role || 'voluntario']
    );

    // Guardar historial
    await pool.query(
      `INSERT INTO historial (accion, usuario_id)
       VALUES ($1, $2)`,
      ['Usuario registrado', result.rows[0].id]
    );

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Error register:', err);

    res.status(500).json({
      ok: false,
      message: 'Error en el registro'
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];

    // Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Crear token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    // Guardar historial
    await pool.query(
      `INSERT INTO historial (accion, usuario_id)
       VALUES ($1, $2)`,
      ['Inicio de sesión', user.id]
    );

    res.json({
      ok: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Error login:', err);

    res.status(500).json({
      ok: false,
      message: 'Error en el login'
    });
  }
};