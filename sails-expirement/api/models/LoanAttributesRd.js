/**
 * PreferenceOperationRd.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: "mysql_namastecredit_read",
    tableName: "loan_attributes",
    attributes: {
        id: {
            type: "number",
            required: true,
            columnName: "attribute_id",
            unique: true
        },
        attribute_name: {
            type: "string",
            required: true,
            columnType: "varchar",
            maxLength: 100
        },
        is_active: {
            type: "number",
            columnType: "int",
            required: false
        },
        white_label_id: {
            type: "number",
            columnType: "int",
            required: true
        },
        is_unique: {
            type: "number",
            columnType: "int",
            required: false
        }


    }
};
