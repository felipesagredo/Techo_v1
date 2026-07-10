import { EntitySchema } from "typeorm";

const CuadrillaMiembroSchema = new EntitySchema({
    name: "CuadrillaMiembro",
    tableName: "cuadrilla_miembros",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        user_id: {
            type: "int"
        },
        cuadrilla_id: {
            type: "int"
        },
        rol_cuadrilla_id: {
            type: "int"
        }
    },
    relations: {
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "user_id"
            },
            onDelete: "CASCADE"
        },
        cuadrilla: {
            target: "Cuadrilla",
            type: "many-to-one",
            joinColumn: {
                name: "cuadrilla_id"
            },
            onDelete: "CASCADE"
        },
        rolCuadrilla: {
            target: "RoleCuadrilla",
            type: "many-to-one",
            joinColumn: {
                name: "rol_cuadrilla_id"
            },
            onDelete: "CASCADE"
        }
    }
});

export default CuadrillaMiembroSchema;
