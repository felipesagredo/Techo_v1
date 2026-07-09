import { EntitySchema } from "typeorm";

const PrestamoHerramientaSchema = new EntitySchema({
    name: "PrestamoHerramienta",
    tableName: "prestamos_herramientas",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        herramienta_id: {
            type: "int"
        },
        user_id: {
            type: "int"
        },
        fecha_prestamo: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP"
        },
        fecha_devolucion: {
            type: "timestamp",
            nullable: true
        },
        estado_prestamo: {
            type: "varchar",
            length: 30,
            default: "prestado"
        },
        notas: {
            type: "text",
            nullable: true
        }
    },
    relations: {
        herramienta: {
            target: "Herramientas",
            type: "many-to-one",
            joinColumn: {
                name: "herramienta_id"
            },
            onDelete: "CASCADE"
        },
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "user_id"
            },
            onDelete: "CASCADE"
        }
    }
});

export default PrestamoHerramientaSchema;
