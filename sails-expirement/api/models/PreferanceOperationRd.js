/**
 * PreferenceOperationRd.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: "mysql_namastecredit_read",
    tableName: "preference_operation",
    attributes: {
        id: {
            type: "number",
            required: true,
            columnName: "p_op_id",
            unique: true
        },
        label: {
            type: "string",
            required: true,
            columnType: "varchar",
            maxLength: 255
        },
        operation: {
            type: "string",
            columnType: "text",
            required: true
        },
        op_control: {
            type: "string",
            columnType: "text",
            required: true
        },
        min_expected_control: {
            type: "number",
            columnType: "int",
            required: true
        },
        expected_type: {
            type: "string",
            columnType: "text",
            required: true
        },
        description: {
            type: "string",
            columnType: "text",
            required: true
        },
        status: {
            type: "number",
            columnType: "int",
            required: true
        }


    }
};
