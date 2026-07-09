import { EntitySchema } from "typeorm";

const RoleSchema = new EntitySchema({
    name: "Role",
    tableName: "roles",
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
        },
        descripcion: {
            type: "varchar",
            length: 255,
            nullable: true
        }
    }
});

export default RoleSchema;