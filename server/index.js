const express = require('express')
const cors = require('cors')
require('dotenv').config()
require('reflect-metadata')

const AppDataSource = require('./config/data-source')

const authRoutes = require('./routes/authRoutes')
const alimentoRoutes = require('./routes/alimentoRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Ruta base
app.get('/', (req, res) => {
  res.send('API Techo Chile funcionando')
})

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/alimentos', alimentoRoutes)

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada',
  })
})

app.use((err, req, res, next) => {
  console.error(err)

  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor',
  })
})

const PORT = process.env.PORT || 5000

AppDataSource.initialize()
  .then(() => {

    console.log('TypeORM conectado')

    app.listen(PORT, () => {
      console.log(
        `Servidor corriendo en http://localhost:${PORT}`
      )
    })

  })
  .catch((error) => {
    console.error(
      'Error conectando TypeORM:',
      error
    )
  })