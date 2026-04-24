"use strict"
import {EntitySchema} from "typeorm";

const MaterialesSchema = new EntitySchema({
    name: "Materiales",
    tableName: "Material",
    columns: {
        id_material: {
            type: Number,
            primary: true,
            generated: true
        },
        nombre_material: {
            type: String,
            length: 30
        },
        categoria: {
            type: String,
            length:40
        },
        largo: {
            type: Number,
            nullable: true
        },
        ancho: {
            type: Number,
            nullable: true
        },
        peso: {
            type: Number,
        }
    },
    relations: {
        users:{
            relations: "many-to-one",
            target: "User",
            joinColumn: {
                name: "assigned_to"
            }
        }
    }
});

export default MaterialesSchema;