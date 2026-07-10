const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Porcion',
  tableName: 'porciones',

  columns: {

    id: {
      primary: true,
      type: 'int',
      generated: true,
    },

    cantidad: {
      type: 'int',
      default: 0,
    },

    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },

  relations: {

    jornada: {
      target: 'Jornada',
      type: 'many-to-one',
      joinColumn: true,
    },

    tipo_dieta: {
      target: 'TipoDieta',
      type: 'many-to-one',
      joinColumn: true,
    },
  },
});