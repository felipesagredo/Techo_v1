import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initDB from './initDB.js';
import authRoutes from './routes/authRoutes.js';
import cuadrillaRoutes from './routes/cuadrillaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import herramientasRoutes from './routes/Herramientas.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/cuadrillas', cuadrillaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/herramientas', herramientasRoutes);

// Inicializar Base de Datos
initDB();

// Usar Rutas
app.use('/api', authRoutes);
// app.use('/api/tools', toolRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Techo Chile corriendo en puerto ${PORT}`);
});
