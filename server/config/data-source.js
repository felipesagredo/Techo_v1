const { DataSource } = require('typeorm')
require('dotenv').config()

const Alimento = require('../entity/Alimento')

const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),

  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: true,
  logging: false,

  entities: [Alimento],
})

module.exports = AppDataSource