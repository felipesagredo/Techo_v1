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
// SINCRONIZAR JORNADAS CON CUADRILLAS
// =========================

const syncJornadasWithCuadrillas = async () => {
  try {
    const query = `
      SELECT 
        c.nombre,
        (
          SELECT u.name 
          FROM cuadrilla_miembros cm2
          JOIN roles_cuadrilla rc ON cm2.rol_cuadrilla_id = rc.id
          JOIN users u ON cm2.user_id = u.id
          WHERE cm2.cuadrilla_id = c.id 
            AND rc.nombre IN ('Capataz de Zona', 'Voluntario Senior')
          LIMIT 1
        ) AS capataz_nombre
      FROM cuadrillas c;
    `;
    const cuadrillas = await AppDataSource.query(query);
    const jornadasExistentes = await jornadaRepository.find();

    for (const cuadrilla of cuadrillas) {
      const jornadaExistente = jornadasExistentes.find(j => j.nombre === cuadrilla.nombre);
      const capataz = cuadrilla.capataz_nombre || 'Sin capataz';

      if (!jornadaExistente) {
        const nuevaJornada = jornadaRepository.create({
          nombre: cuadrilla.nombre,
          responsable: capataz,
          activa: true,
        });
        await jornadaRepository.save(nuevaJornada);
      } else {
        if (jornadaExistente.responsable !== capataz || !jornadaExistente.activa) {
          jornadaExistente.responsable = capataz;
          jornadaExistente.activa = true;
          await jornadaRepository.save(jornadaExistente);
        }
      }
    }
  } catch (error) {
    console.error('Error al sincronizar jornadas con cuadrillas:', error);
  }
};

// =========================
// LISTAR
// =========================

export const getJornadas = async () => {
  await syncJornadasWithCuadrillas();
  return await jornadaRepository.find({
    relations: ['alimentos'],
  });
};

// =========================
// LISTAR SOLO ACTIVAS
// =========================

export const getJornadasActivas = async () => {
  await syncJornadasWithCuadrillas();
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