const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initDB = require('./initDB');


// Importar Rutas
const authRoutes = require('./routes/authRoutes');
const app = express();
const cuadrillaRoutes = require('./routes/cuadrillaRoutes');
app.use(express.json());
app.use(cors());
app.use('/api/cuadrillas', cuadrillaRoutes);

// Inicializar Base de Datos
initDB();

// Usar Rutas
app.use('/api', authRoutes);
// app.use('/api/tools', toolRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Techo Chile corriendo en puerto ${PORT}`);
});
