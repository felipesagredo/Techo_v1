const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDB = require('./initDB');
const pool = require('./config/db');

// RUTAS
const authRoutes = require('./routes/authRoutes');
const alimentoRoutes = require('./routes/alimentoRoutes');

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

    console.error(error);

    res.status(500).json({
      ok: false,
      message: '❌ Error conectando a PostgreSQL'
    });
  }
});

// INICIAR BASE DE DATOS
initDB();

// RUTAS API
app.use('/api/auth', authRoutes);

app.use('/api/alimentos', alimentoRoutes);

// RUTA NO ENCONTRADA
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

// ERRORES GLOBALES
app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor'
  });
});

// PUERTO
const PORT = process.env.PORT || 5000;

// LEVANTAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});