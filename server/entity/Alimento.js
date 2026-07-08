const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({

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
    },

    asignado: {

      type: 'boolean',

      default: false,
    },

    jornadaActiva: {

      type: 'boolean',

      default: false,
    },

    encargado: {

      type: 'varchar',

      nullable: true,
    },

    createdAt: {

      type: 'timestamp',

      createDate: true,
    },
  },

  relations: {

    jornadas: {

      type: 'many-to-many',

      target: 'Jornada',

      inverseSide: 'alimentos',
    },
  },
})