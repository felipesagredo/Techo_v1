import * as alimentoService from '../services/alimento.service.js';

export const getAlimentos = async (req, res) => {
  try {
    const alimentos = await alimentoService.getAlimentos();
    res.json(alimentos);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

export const createAlimento = async (req, res) => {
  try {
    const alimento = await alimentoService.createAlimento(req.body);
    res.status(201).json(alimento);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

export const updateAlimento = async (req, res) => {
  try {
    const alimento = await alimentoService.updateAlimento(req.params.id, req.body);
    res.json(alimento);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

export const deleteAlimento = async (req, res) => {
  try {
    await alimentoService.deleteAlimento(req.params.id);
    res.json({
      ok: true,
      message: 'Alimento eliminado',
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};