import { EntitySchema } from "typeorm";

const AsignacionMaterialSchema = new EntitySchema({
    name: "AsignacionMaterial",
    tableName: "asignacion_materiales",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        material_id: {
            type: "int"
        },
        cuadrilla_id: {
            type: "int"
        },
        cantidad_asignada: {
            type: "int"
        },
        fecha_asignacion: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP"
        },
        notas: {
            type: "text",
            nullable: true
        }
    },
    relations: {
        material: {
            target: "Materiales",
            type: "many-to-one",
            joinColumn: {
                name: "material_id"
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
        }
    }
});

export default AsignacionMaterialSchema;
