import { EntitySchema } from "typeorm";

const HerramientasSchema = new EntitySchema({
    name: "Herramientas",
    tableName: "herramientas",
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
        descripcion: {
            type: "varchar",
            length: 500
        },
        stock: {
            type: "int",
            default: 0
        },
        categoria_herramienta: {
            type: "varchar",
            length: 30
        },
        estado: {
            type: "varchar",
            length: 30,
            default: "disponible"
        },
        assigned_to: {
            type: "int",
            nullable: true
        },
        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP"
        },
        updated_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP"
        }
    },
    relations: {
        assignedUser: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "assigned_to"
            },
            onDelete: "SET NULL",
            nullable: true
        }
    }
});

export default HerramientasSchema;