import AppDataSource, { JornadaSchema } from '../config/db.js';
import AlimentoSchema from '../entity/Alimento.js';

const jornadaRepository = AppDataSource.getRepository(JornadaSchema);
const alimentoRepository = AppDataSource.getRepository(AlimentoSchema);

// =========================
// CREAR JORNADA
// =========================

export const createJornada = async (data) => {

  let alimentos = [];

  if (Array.isArray(data.alimentos) && data.alimentos.length > 0) {
    alimentos = await alimentoRepository.findByIds(data.alimentos);

    for (const alimento of alimentos) {
      alimento.asignado = true;
      alimento.jornadaActiva = true;
      alimento.encargado = data.responsable;
      await alimentoRepository.save(alimento);
    }
  }

  const nuevaJornada = jornadaRepository.create({
    nombre: data.nombre,
    responsable: data.responsable,
    activa: data.activa ?? true,
    alimentos,
  });

  return await jornadaRepository.save(nuevaJornada);
};

// =========================
// LISTAR
// =========================

export const getJornadas = async () => {
  return await jornadaRepository.find({
    relations: ['alimentos'],
  });
};

// =========================
// LISTAR SOLO ACTIVAS
// =========================

export const getJornadasActivas = async () => {
  return await jornadaRepository.find({
    where: { activa: true },
    relations: ['alimentos'],
  });
};

// =========================
// ASIGNAR ALIMENTO
// =========================

export const assignAlimento = async (jornadaId, alimentoId) => {

  const jornada = await jornadaRepository.findOne({
    where: { id: Number(jornadaId) },
    relations: ['alimentos'],
  });

  if (!jornada) throw new Error('Jornada no encontrada');

  const alimento = await alimentoRepository.findOne({
    where: { id: Number(alimentoId) },
  });

  if (!alimento) throw new Error('Alimento no encontrado');

  alimento.asignado = true;
  alimento.jornadaActiva = true;
  alimento.encargado = jornada.responsable;

  await alimentoRepository.save(alimento);

  // Evitar duplicados
  const yaAsignado = jornada.alimentos.some((a) => a.id === alimento.id);
  if (!yaAsignado) {
    jornada.alimentos.push(alimento);
  }

  return await jornadaRepository.save(jornada);
};