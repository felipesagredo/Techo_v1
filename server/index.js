const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initDB = require('./initDB');

// Importar Rutas
const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const app = express();
const cuadrillaRoutes = require('./routes/cuadrillaRoutes');

// Middleware debe estar ANTES de las rutas
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Rutas
app.use('/api/cuadrillas', cuadrillaRoutes);
app.use('/api/addresses', addressRoutes);

// Manejadores de errores globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

// Inicializar Base de Datos
initDB()
  .then(() => {
    // Usar Rutas
    app.use('/api', authRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Techo Chile corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error fatal inicializando servidor:', err.message);
    process.exit(1);
  });
