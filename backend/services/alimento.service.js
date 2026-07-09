import AppDataSource from '../config/db.js';
import AlimentoSchema from '../entity/Alimento.js';

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

  return await alimentoRepository.save(nuevoAlimento);
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

  return await alimentoRepository.save(alimento);
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