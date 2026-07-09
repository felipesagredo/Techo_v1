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

  let alimentos = []

  if (
    Array.isArray(data.alimentos) &&
    data.alimentos.length > 0
  ) {

    alimentos = await alimentoRepository.findByIds(
      data.alimentos
    )

    for (const alimento of alimentos) {

      alimento.asignado = true
      alimento.jornadaActiva = true
      alimento.encargado = data.responsable

      await alimentoRepository.save(alimento)
    }
  }

  const nuevaJornada =
    jornadaRepository.create({

      nombre: data.nombre,

      responsable: data.responsable,

      activa: data.activa ?? true,

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
// =========================
// ASIGNAR ALIMENTO
// =========================

const assignAlimento = async (
  jornadaId,
  alimentoId
) => {

  const jornada =
    await jornadaRepository.findOne({

      where: {
        id: Number(jornadaId),
      },

      relations: ['alimentos'],
    })

  if (!jornada) {

    throw new Error('Jornada no encontrada')
  }

  const alimento =
    await alimentoRepository.findOne({

      where: {
        id: Number(alimentoId),
      },
    })

  if (!alimento) {

    throw new Error('Alimento no encontrado')
  }

  alimento.asignado = true
  alimento.jornadaActiva = true
  alimento.encargado = jornada.responsable

  await alimentoRepository.save(alimento)

  jornada.alimentos.push(alimento)

  return await jornadaRepository.save(jornada)
}

module.exports = {

  createJornada,

  getJornadas,

  assignAlimento,
}