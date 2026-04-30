const pool = require('../config/db');

// OBTENER TODOS
exports.getAllAlimentos = async (req, res) => {

  try {

    const result = await pool.query(
      'SELECT * FROM alimentos ORDER BY id ASC'
    );

    res.json({
      ok: true,
      alimentos: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo alimentos'
    });
  }
};

// OBTENER UNO
exports.getAlimentoById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM alimentos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Alimento no encontrado'
      });
    }

    res.json({
      ok: true,
      alimento: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo alimento'
    });
  }
};

// CREAR
exports.createAlimento = async (req, res) => {
    try {

    const {
      nombre,
      stock,
      fecha_vencimiento
    } = req.body;

    const result = await pool.query(
      `INSERT INTO alimentos
      (nombre, stock, fecha_vencimiento)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [nombre, stock, fecha_vencimiento]
    );

    res.status(201).json({
      ok: true,
      message: 'Alimento creado',
      alimento: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error creando alimento'
    });
  }
};

// ACTUALIZAR
exports.updateAlimento = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      nombre,
      stock,
      fecha_vencimiento
    } = req.body;

    const result = await pool.query(
      `UPDATE alimentos
      SET nombre = $1,
          stock = $2,
          fecha_vencimiento = $3
      WHERE id = $4
      RETURNING *`,
      [nombre, stock, fecha_vencimiento, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Alimento no encontrado'
      });
    }

    res.json({
      ok: true,
      message: 'Alimento actualizado',
      alimento: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error actualizando alimento'
    });
  }
};

// ELIMINAR
exports.deleteAlimento = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM alimentos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Alimento no encontrado'
      });
    }

    res.json({
      ok: true,
      message: 'Alimento eliminado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error eliminando alimento'
    });
  }
};