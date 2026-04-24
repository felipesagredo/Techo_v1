# Guía para el Equipo (Grupo 12 - Techo Chile)

¡Bienvenido al proyecto! Esta estructura está diseñada para que podamos trabajar en paralelo sin conflictos.

## Cómo añadir una nueva funcionalidad (Ejemplo: Herramientas)

Si quieres añadir un apartado de **Herramientas**, sigue estos pasos:

### 1. Base de Datos
Añade tu tabla en `server/initDB.js`. Ejemplo:
```javascript
`CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  assigned_to INTEGER REFERENCES users(id)
);`
```

### 2. Lógica (Controller)
Crea un archivo en `server/controllers/toolController.js`:
```javascript
const pool = require('../config/db');

exports.getTools = async (req, res) => {
  const result = await pool.query('SELECT * FROM tools');
  res.json(result.rows);
};
```

### 3. Rutas (Routes)
Crea un archivo en `server/routes/toolRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const authMiddleware = require('../middleware/auth'); // Opcional: para proteger la ruta

router.get('/', authMiddleware, toolController.getTools);

module.exports = router;
```

### 4. Registrar en el Servidor
En `server/index.js`, importa y usa tu ruta:
```javascript
const toolRoutes = require('./routes/toolRoutes');
app.use('/api/tools', toolRoutes);
```

---
**Nota sobre Seguridad**: Usa el `authMiddleware` en tus rutas si quieres que solo usuarios logueados puedan acceder a ellas. El ID del usuario logueado estará disponible en `req.user.id`.
