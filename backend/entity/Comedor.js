const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Comedor',
  tableName: 'comedores',

  columns: {

    id: {
      primary: true,
      type: 'int',
      generated: true,
    },

    nombre: {
      type: 'varchar',
    },

    direccion: {
      type: 'text',
      nullable: true,
    },

    capacidad: {
      type: 'int',
      default: 0,
    },

    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
});