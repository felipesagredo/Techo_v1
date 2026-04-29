const { EntitySchema } = require('typeorm');

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

    stock: {
      type: 'int',
      default: 0,
    },

    fecha_vencimiento: {
      type: 'date',
      nullable: true,
    },

    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
});