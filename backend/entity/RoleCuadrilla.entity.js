import { EntitySchema } from "typeorm";

const RoleCuadrillaSchema = new EntitySchema({
    name: "RoleCuadrilla",
    tableName: "roles_cuadrilla",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        nombre: {
            type: "varchar",
            length: 50,
            unique: true
        }
    }
});

export default RoleCuadrillaSchema;
