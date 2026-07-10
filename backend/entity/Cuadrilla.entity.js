import { EntitySchema } from "typeorm";

const CuadrillaSchema = new EntitySchema({
    name: "Cuadrilla",
    tableName: "cuadrillas",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        nombre: {
            type: "varchar",
            length: 100
        },
        zona: {
            type: "varchar",
            length: 255
        },
        estado: {
            type: "varchar",
            length: 50,
            default: "PENDIENTE"
        },
        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP"
        },
        latitud: {
            type: "decimal",
            precision: 10,
            scale: 8,
            nullable: true
        },
        longitud: {
            type: "decimal",
            precision: 11,
            scale: 8,
            nullable: true
        },
        meta_voluntarios: {
            type: "int",
            default: 5
        },
        capacidad: {
            type: "int",
            default: 10
        },
        meta_herramientas: {
            type: "int",
            default: 5
        },
        herramientas_requeridas: {
            type: "text",
            nullable: true
        },
        materiales_requeridos: {
            type: "text",
            nullable: true
        }
    }
});

export default CuadrillaSchema;
