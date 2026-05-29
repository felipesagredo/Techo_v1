const jornadaService =
  require('../services/jornada.service')

// =========================
// GET
// =========================

const getJornadas = async (req, res) => {

  try {

    const jornadas =
      await jornadaService.getJornadas()

    res.json(jornadas)

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: error.message,
    })
  }
}

// =========================
// CREATE
// =========================

const createJornada = async (req, res) => {

  try {

    const jornada =
      await jornadaService.createJornada(
        req.body
      )

    res.status(201).json(jornada)

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: error.message,
    })
  }
}

module.exports = {

  getJornadas,

  createJornada,
}