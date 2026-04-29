const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',

  columns: {

    id: {
      primary: true,
      type: 'int',
      generated: true,
    },

    name: {
      type: 'varchar',
      length: 100,
    },

    email: {
      type: 'varchar',
      unique: true,
    },

    password: {
      type: 'varchar',
    },

    role: {
      type: 'varchar',
      default: 'usuario',
    },

    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
});