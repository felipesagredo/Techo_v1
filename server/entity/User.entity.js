"use strict";
import { EntitySchema } from "typeorm";

const UserSchema = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar",
            length: 100
        },
        email: {
            type: "varchar",
            length: 100,
            unique: true
        },
        password: {
            type: "varchar",
            length: 255
        },
        role_id: {
            type: "int"
        }
    },
    relations: {
        role: {
            target: "Role",
            type: "many-to-one",
            joinColumn: {
                name: "role_id"
            },
            onDelete: "SET NULL"
        }
    }
});

export default UserSchema;