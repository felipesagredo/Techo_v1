import { EntitySchema } from 'typeorm';

const AlimentoSchema = new EntitySchema({
  name: 'Alimento',
  tableName: 'alimentos',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nombre: {
      type: 'varchar',
      length: 100,
    },
    cantidad: {
      type: 'int',
      default: 0,
    },
    porciones: {
      type: 'int',
      default: 0,
    },
    tipoDieta: {
      type: 'varchar',
      default: 'Normal',
      name: 'tipoDieta',
    },
    asignado: {
      type: 'boolean',
      default: false,
    },
    jornadaActiva: {
      type: 'boolean',
      default: false,
      name: 'jornadaActiva',
    },
    encargado: {
      type: 'varchar',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'createdAt',
    },
  },
});

export default AlimentoSchema;