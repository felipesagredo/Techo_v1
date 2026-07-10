import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import RoleSchema from '../entity/Role.entity.js';
import UserSchema from '../entity/User.entity.js';
import HerramientasSchema from '../entity/Herramientas.entity.js';
import MaterialesSchema from '../entity/Materiales.entity.js';
import CuadrillaSchema from '../entity/Cuadrilla.entity.js';
import RoleCuadrillaSchema from '../entity/RoleCuadrilla.entity.js';
import CuadrillaMiembroSchema from '../entity/CuadrillaMiembro.entity.js';
import PrestamoHerramientaSchema from '../entity/PrestamoHerramienta.entity.js';
import AsignacionMaterialSchema from '../entity/AsignacionMaterial.entity.js';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || process.env.HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || process.env.PASSWORD,
  database: process.env.DB_NAME || process.env.DATABASE,
  synchronize: false,
  logging: false,
  entities: [
    RoleSchema,
    UserSchema,
    HerramientasSchema,
    MaterialesSchema,
    CuadrillaSchema,
    RoleCuadrillaSchema,
    CuadrillaMiembroSchema,
    PrestamoHerramientaSchema,
    AsignacionMaterialSchema
  ]
});

export default AppDataSource;

