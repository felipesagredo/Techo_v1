const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'RestriccionAlimentaria',
  tableName: 'restricciones_alimentarias',

  columns: {

    id: {
      primary: true,
      type: 'int',
      generated: true,
    },

    nombre: {
      type: 'varchar',
      unique: true,
    },

    descripcion: {
      type: 'text',
      nullable: true,
    },
  },
});