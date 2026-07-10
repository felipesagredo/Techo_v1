import { DataSource, EntitySchema } from 'typeorm';
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
import AlimentoSchema from '../entity/Alimento.js';

dotenv.config();

// Jornada schema inline (CJS original converted)
const JornadaSchema = new EntitySchema({
  name: 'Jornada',
  tableName: 'jornadas',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    nombre: { type: 'varchar' },
    activa: { type: 'boolean', default: true },
    responsable: { type: 'varchar' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    alimentos: {
      type: 'many-to-many',
      target: 'Alimento',
      joinTable: true,
      cascade: true,
    },
  },
});

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
    AsignacionMaterialSchema,
    AlimentoSchema,
    JornadaSchema,
  ]
});

export { JornadaSchema };
export default AppDataSource;


