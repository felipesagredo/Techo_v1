import { EntitySchema } from "typeorm";

const MaterialesSchema = new EntitySchema({
    name: "Materiales",
    tableName: "materiales",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        nombre_material: {
            type: "varchar",
            length: 100
        },
        cantidad: {
            type: "int",
            default: 0
        },
        categoria: {
            type: "varchar",
            length: 100
        },
        largo: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: true
        },
        ancho: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: true
        },
        peso: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: true
        },
        estado: {
            type: "varchar",
            length: 30,
            default: "disponible"
        },
        archivos: {
            type: "text",
            nullable: true
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

export default MaterialesSchema;