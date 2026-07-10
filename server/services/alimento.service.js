import AppDataSource, { JornadaSchema } from '../config/db.js';
import AlimentoSchema from '../entity/Alimento.js';
import * as jornadaService from './jornada.service.js';

const alimentoRepository = AppDataSource.getRepository(AlimentoSchema);

export const getAlimentos = async () => {
  return await alimentoRepository.find();
};

export const createAlimento = async (data) => {
  const nuevoAlimento = alimentoRepository.create({
    nombre: data.nombre,
    cantidad: Number(data.cantidad) || 0,
    porciones: Number(data.porciones) || 0,
    tipoDieta: data.tipoDieta || 'Normal',
    asignado: false,
    jornadaActiva: false,
    encargado: null,
  });

  const savedAlimento = await alimentoRepository.save(nuevoAlimento);

  // Si se indicó una jornada, vinculamos el alimento a ella
  if (data.jornadaId) {
    savedAlimento.asignado = true;
    savedAlimento.jornadaActiva = true;
    if (data.encargado) {
      savedAlimento.encargado = data.encargado;
    }
    await alimentoRepository.save(savedAlimento);

    await jornadaService.assignAlimento(
      Number(data.jornadaId),
      savedAlimento.id
    );

    const updated = await alimentoRepository.findOneBy({ id: savedAlimento.id });
    return updated;
  }

  return savedAlimento;
};

export const updateAlimento = async (id, data) => {
  const alimento = await alimentoRepository.findOneBy({
    id: Number(id),
  });

  if (!alimento) {
    throw new Error('Alimento no encontrado');
  }

  alimento.nombre = data.nombre ?? alimento.nombre;
  alimento.cantidad = data.cantidad !== undefined ? Number(data.cantidad) : alimento.cantidad;
  alimento.porciones = data.porciones !== undefined ? Number(data.porciones) : alimento.porciones;
  alimento.tipoDieta = data.tipoDieta ?? alimento.tipoDieta;

  // Actualizar encargado si viene en la solicitud
  if ('encargado' in data) {
    alimento.encargado = data.encargado || null;
  }

  // Si se cambia o asigna una jornada
  if (data.jornadaId) {
    alimento.asignado = true;
    alimento.jornadaActiva = true;
    if (data.encargado) {
      alimento.encargado = data.encargado;
    }
    await alimentoRepository.save(alimento);

    await jornadaService.assignAlimento(
      Number(data.jornadaId),
      alimento.id
    );
  } else if (data.jornadaId === null || data.jornadaId === '' || data.jornadaId === 0) {
    // Desasignar de jornada
    alimento.asignado = false;
    alimento.jornadaActiva = false;
    alimento.encargado = null;
  }

  const saved = await alimentoRepository.save(alimento);
  return saved;
};

export const deleteAlimento = async (id) => {
  const alimento = await alimentoRepository.findOneBy({
    id: Number(id),
  });

  if (!alimento) {
    throw new Error('Alimento no encontrado');
  }

  if (alimento.asignado || alimento.jornadaActiva) {
    throw new Error('No se puede eliminar un alimento asociado a una jornada activa');
  }

  return await alimentoRepository.remove(alimento);
};