import { EntitySchema } from "typeorm";

const AddressSchema = new EntitySchema({
    name: "Address",
    tableName: "addresses",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        label: {
            type: "varchar",
            length: 255
        },
        lat: {
            type: "numeric"
        },
        lng: {
            type: "numeric"
        },
        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP"
        }
    },
    relations: {
        createdBy: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "created_by"
            },
            nullable: true,
            onDelete: "SET NULL"
        }
    }
});

export default AddressSchema;
