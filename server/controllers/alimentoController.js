const alimentoService = require('../services/alimento.service')

// Obtener alimentos
const getAlimentos = async (req, res) => {
  try {

    const alimentos =
      await alimentoService.getAlimentos()

    res.json(alimentos)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Error obteniendo alimentos',
    })
  }
}

// Crear alimento
const createAlimento = async (req, res) => {
  try {

    const { nombre } = req.body

    const alimento =
      await alimentoService.createAlimento(nombre)

    res.status(201).json(alimento)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Error creando alimento',
    })
  }
}

// Eliminar alimento
const deleteAlimento = async (req, res) => {
  try {

    const { id } = req.params

    await alimentoService.deleteAlimento(id)

    res.json({
      message: 'Alimento eliminado',
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  getAlimentos,
  createAlimento,
  deleteAlimento,
}