const { EntitySchema } = require('typeorm')

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

    activa: {
      type: 'boolean',
      default: true,
    },

    responsable: {
      type: 'varchar',
    },

    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },

  relations: {

    alimentos: {

      type: 'many-to-many',

      target: 'Alimento',

      joinTable: true,

      cascade: true,
    },
  },
})