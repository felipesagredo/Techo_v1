const AppDataSource = require('../config/data-source')
const Alimento = require('../entity/Alimento')

const alimentoRepository =
  AppDataSource.getRepository(Alimento)

// Obtener
const getAlimentos = async () => {
  return await alimentoRepository.find()
}

// Crear
const createAlimento = async (nombre) => {

  const alimento =
    alimentoRepository.create({
      nombre,
      asignado: false,
    })

  return await alimentoRepository.save(alimento)
}

// Eliminar
const deleteAlimento = async (id) => {

  const alimento =
    await alimentoRepository.findOneBy({ id })

  if (!alimento) {
    throw new Error('Alimento no encontrado')
  }

  if (alimento.asignado) {
    throw new Error(
      'No se puede eliminar un alimento asignado'
    )
  }

  await alimentoRepository.remove(alimento)
}

module.exports = {
  getAlimentos,
  createAlimento,
  deleteAlimento,
}