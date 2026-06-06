import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initDB from './initDB.js';
import authRoutes from './routes/authRoutes.js';
import cuadrillaRoutes from './routes/cuadrillaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import herramientasRoutes from './routes/Herramientas.routes.js';
import materialesRoutes from './routes/Materiales.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/cuadrillas', cuadrillaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/herramientas', herramientasRoutes);
app.use('/api/materiales', materialesRoutes);
app.use('/api/material', materialesRoutes);

// Endpoint de Estadísticas del Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const pool = (await import('./config/db.js')).default;
    
    // 1. Total voluntarios (role_id = 2)
    const volsRes = await pool.query('SELECT COUNT(*) FROM users WHERE role_id = 2');
    const totalVoluntarios = parseInt(volsRes.rows[0].count, 10);

    // 2. Total herramientas
    const herrsRes = await pool.query('SELECT COUNT(*) FROM herramientas');
    const totalHerramientas = parseInt(herrsRes.rows[0].count, 10);

    // 3. Cuadrillas activas
    const cuadrillasRes = await pool.query('SELECT COUNT(*) FROM cuadrillas');
    const totalCuadrillas = parseInt(cuadrillasRes.rows[0].count, 10);

    // 4. Items en stock crítico o mal estado (herramientas en mal estado / dañadas o materiales con cantidad <= 5)
    const badToolsRes = await pool.query("SELECT COUNT(*) FROM herramientas WHERE estado IN ('malo', 'dañado')");
    const lowMatRes = await pool.query("SELECT COUNT(*) FROM materiales WHERE cantidad <= 5");
    const stockCritico = parseInt(badToolsRes.rows[0].count, 10) + parseInt(lowMatRes.rows[0].count, 10);

    // 5. Cuadrillas recientes
    const recentCuadrillasRes = await pool.query(`
      SELECT c.id, c.nombre, c.zona, c.estado,
        (SELECT COUNT(*) FROM cuadrilla_miembros WHERE cuadrilla_id = c.id) as miembros_count
      FROM cuadrillas c
      ORDER BY c.id DESC
      LIMIT 4
    `);

    // 6. Inventario reciente (herramientas y materiales unidos)
    const recentInventoryRes = await pool.query(`
      (SELECT id, nombre_material as nombre, cantidad, estado, 'material' as tipo FROM materiales)
      UNION ALL
      (SELECT id, nombre, 1 as cantidad, estado, 'herramienta' as tipo FROM herramientas)
      ORDER BY id DESC
      LIMIT 3
    `);

    res.json({
      totalVoluntarios,
      totalHerramientas,
      totalCuadrillas,
      stockCritico,
      recentCuadrillas: recentCuadrillasRes.rows,
      recentInventory: recentInventoryRes.rows
    });
  } catch (err) {
    console.error('Error al obtener estadísticas del dashboard:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});

// Inicializar Base de Datos
initDB();

// Usar Rutas
app.use('/api', authRoutes);
// app.use('/api/tools', toolRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Techo Chile corriendo en puerto ${PORT}`);
});
