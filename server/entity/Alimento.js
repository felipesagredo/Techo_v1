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

    disponible: {
      type: 'boolean',
      default: true,
    },

    jornadaActiva: {
      type: 'boolean',
      default: false,
    },
  },
})