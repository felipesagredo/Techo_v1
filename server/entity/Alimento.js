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
      nullable: false,
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
})