/**
 * PrioritySectorDetails.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: "mysql_namastecredit_read",
    tableName: "priority_sector_details",
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            isInteger: true
        },
        loan_id: {
            type: "number",
            columnType: "bigint",
            isInteger: true,
            allowNull: true
        },
        initial_json: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        status: {
            type: "string",
            columnType: "enum",
            isIn: ["active", "inactive"],
            defaultsTo: "NULL"
        },
        created_at: {
            type: "ref",
            columnType: "datetime",

        },
        updated_at: {
            type: "ref",
            columnType: "datetime",

        },
        updated_json: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        director_id: {
            type: "number",
            columnType: "int",
            isInteger: true,
            allowNull: true
        }
    }

}
