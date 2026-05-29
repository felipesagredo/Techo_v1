const AppDataSource =
  require('../config/data-source')

const Alimento =
  require('../entity/Alimento')

const alimentoRepository =
  AppDataSource.getRepository(Alimento)

// GET
const getAlimentos = async () => {

  return await alimentoRepository.find()
}

// CREATE
const createAlimento = async (data) => {

  const nuevoAlimento =
    alimentoRepository.create({

      nombre: data.nombre,

      asignado: false,

      jornadaActiva: false,

      encargado: null,
    })

  return await alimentoRepository.save(
    nuevoAlimento
  )
}

// UPDATE
const updateAlimento = async (
  id,
  data
) => {

  const alimento =
    await alimentoRepository.findOneBy({
      id: Number(id),
    })

  if (!alimento) {

    throw new Error(
      'Alimento no encontrado'
    )
  }

  alimento.nombre =
    data.nombre || alimento.nombre

  return await alimentoRepository.save(
    alimento
  )
}

// DELETE
const deleteAlimento = async (id) => {

  const alimento =
    await alimentoRepository.findOneBy({
      id: Number(id),
    })

  if (!alimento) {

    throw new Error(
      'Alimento no encontrado'
    )
  }

  // Restricción funcional

  if (
    alimento.asignado ||
    alimento.jornadaActiva
  ) {

    throw new Error(
      'No se puede eliminar un alimento asociado a una jornada activa'
    )
  }

  return await alimentoRepository.remove(
    alimento
  )
}

module.exports = {

  getAlimentos,

  createAlimento,

  updateAlimento,

  deleteAlimento,
}