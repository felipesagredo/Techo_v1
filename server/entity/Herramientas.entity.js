"use strict";
import { EntitySchema } from "typeorm";

const HerramientasSchema = new EntitySchema({
    name: "Herramientas",
    tableName: "Herramienta",
    columns: {
        id:  {
            type: Number,
            primary: true,
            generated: true
        },
        nombre: {
            type: String,
            length: 30
        },
        description: {
            type: String,
            length: 500
        },
        stock: {
            type: Number
        },
        assigned_to: {
            type: String,
            length: 30,
            nullable: true
        },
        categoria_herramienta: {
            type: String,
            length: 30
        },
        fechaCreacion: {
            type: Date,
            default: () => "CURRENT_TIMESTAMP"
        }
    },
    relations: {
        users: {
            relations: "many-to-one",
            target: "User",
            joinColumn: {
                name: "assigned_to"
            }
        }
    }
});

export default HerramientasSchema;