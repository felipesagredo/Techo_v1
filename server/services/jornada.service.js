const AppDataSource =
  require('../config/data-source')

const Jornada =
  require('../entity/Jornada')

const Alimento =
  require('../entity/Alimento')

const jornadaRepository =
  AppDataSource.getRepository(Jornada)

const alimentoRepository =
  AppDataSource.getRepository(Alimento)

// =========================
// CREAR JORNADA
// =========================

const createJornada = async (data) => {

  const alimentos =
    await alimentoRepository.findBy({
      id: data.alimentos || [],
    })

  // Marcar alimentos asignados

  for (const alimento of alimentos) {

    alimento.asignado = true

    alimento.jornadaActiva = true

    alimento.encargado =
      data.responsable

    await alimentoRepository.save(
      alimento
    )
  }

  const nuevaJornada =
    jornadaRepository.create({

      nombre: data.nombre,

      responsable: data.responsable,

      activa: true,

      alimentos,
    })

  return await jornadaRepository.save(
    nuevaJornada
  )
}

// =========================
// LISTAR
// =========================

const getJornadas = async () => {

  return await jornadaRepository.find({

    relations: ['alimentos'],
  })
}

module.exports = {

  createJornada,

  getJornadas,
}