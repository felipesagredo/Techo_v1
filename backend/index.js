import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AppDataSource from './config/db.js';
import initDB from './initDB.js';
import authRoutes from './routes/authRoutes.js';
import cuadrillaRoutes from './routes/cuadrillaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import herramientasRoutes from './routes/Herramientas.routes.js';
import materialesRoutes from './routes/Materiales.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/cuadrillas', cuadrillaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/herramientas', herramientasRoutes);
app.use('/api/materiales', materialesRoutes);
app.use('/api/material', materialesRoutes);
app.use('/api/inventario', inventarioRoutes);

// Endpoint de Estadísticas del Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Total voluntarios (role_id = 2)
    const volsRes = await AppDataSource.query('SELECT COUNT(*) FROM users WHERE role_id = 2');
    const totalVoluntarios = parseInt(volsRes[0].count, 10);

    // 2. Total herramientas
    const herrsRes = await AppDataSource.query('SELECT COUNT(*) FROM herramientas');
    const totalHerramientas = parseInt(herrsRes[0].count, 10);

    // 3. Cuadrillas activas
    const cuadrillasRes = await AppDataSource.query('SELECT COUNT(*) FROM cuadrillas');
    const totalCuadrillas = parseInt(cuadrillasRes[0].count, 10);

    // 4. Items en stock crítico o mal estado (herramientas en mal estado / dañadas o materiales con cantidad <= 5)
    const badToolsRes = await AppDataSource.query("SELECT COUNT(*) FROM herramientas WHERE estado IN ('malo', 'dañado')");
    const lowMatRes = await AppDataSource.query("SELECT COUNT(*) FROM materiales WHERE cantidad <= 5");
    const stockCritico = parseInt(badToolsRes[0].count, 10) + parseInt(lowMatRes[0].count, 10);

    // 5. Cuadrillas recientes
    const recentCuadrillas = await AppDataSource.query(`
      SELECT c.id, c.nombre, c.zona, c.estado,
        (SELECT COUNT(*) FROM cuadrilla_miembros WHERE cuadrilla_id = c.id) as miembros_count
      FROM cuadrillas c
      ORDER BY c.id DESC
      LIMIT 4
    `);

    // 6. Inventario reciente (herramientas y materiales unidos)
    const recentInventory = await AppDataSource.query(`
      (SELECT id, nombre_material as nombre, cantidad, estado, 'material' as tipo FROM materiales)
      UNION ALL
      (SELECT id, nombre, stock as cantidad, estado, 'herramienta' as tipo FROM herramientas)
      ORDER BY id DESC
      LIMIT 3
    `);

    res.json({
      totalVoluntarios,
      totalHerramientas,
      totalCuadrillas,
      stockCritico,
      recentCuadrillas,
      recentInventory
    });
  } catch (err) {
    console.error('Error al obtener estadísticas del dashboard:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});

// Usar Rutas
app.use('/api', authRoutes);

// Inicializar Base de Datos con TypeORM y arrancar servidor
AppDataSource.initialize()
  .then(() => {
    console.log('⚡ Conexión a Base de Datos establecida con TypeORM');
    initDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Techo Chile corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al inicializar Base de Datos con TypeORM:', err);
  });
