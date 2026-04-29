const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Jornada',
  tableName: 'jornadas',

  columns: {

    id: {
      primary: true,
      type: 'int',
      generated: true,
    },

    nombre: {
      type: 'varchar',
    },

    fecha: {
      type: 'date',
    },

    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
});