import * as jornadaService from '../services/jornada.service.js';

// =========================
// GET
// =========================

export const getJornadas = async (req, res) => {
  try {
    const jornadas = await jornadaService.getJornadas();
    res.json(jornadas);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =========================
// GET ACTIVAS
// =========================

export const getJornadasActivas = async (req, res) => {
  try {
    const jornadas = await jornadaService.getJornadasActivas();
    res.json(jornadas);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =========================
// CREATE
// =========================

export const createJornada = async (req, res) => {
  try {
    const jornada = await jornadaService.createJornada(req.body);
    res.status(201).json(jornada);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =========================
// ASIGNAR ALIMENTO
// =========================

export const assignAlimento = async (req, res) => {
  try {
    const jornada = await jornadaService.assignAlimento(
      req.params.jornadaId,
      req.body.alimentoId
    );
    res.json({ ok: true, message: 'Alimento asignado correctamente', jornada });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};