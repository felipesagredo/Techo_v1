const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDB = require('./initDB');
const pool = require('./config/db');

// Rutas
const authRoutes = require('./routes/authRoutes');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// RUTA PRINCIPAL
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: '🚀 API Techo Chile funcionando correctamente'
  });
});

// TEST BASE DE DATOS
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      ok: true,
      message: '✅ PostgreSQL conectado',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error DB:', error);

    res.status(500).json({
      ok: false,
      message: '❌ Error conectando a PostgreSQL'
    });
  }
});

// INICIALIZAR DB
initDB();

// RUTAS API
app.use('/api/auth', authRoutes);

// RUTA NO ENCONTRADA
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

// MANEJO GLOBAL DE ERRORES
app.use((err, req, res, next) => {
  console.error('Error global:', err);

  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor'
  });
});

// SERVIDOR
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});