/**
 * ViewAlogsRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    datastore: "mysql_namastecredit_read",
    tableName: "view_loanwithALogs",
    attributes: {
        id: {
            type: 'number', // Assuming 'id' is a numeric identifier
            autoIncrement: true,
            columnName: 'loan_id',
            unique: true,
            required: true,
        },
        user_id: {
            type: 'number',
        },
        loan_product_id: {
            type: 'number',
        },
        loan_ref_id: {
            type: 'string',
        },
        businessname: {
            type: 'string', // Use 'longtext' for large text or JSON data
        },
        status: {
            type: 'string', // Use 'longtext' for large text or JSON data
        },
    },
};
//ViewLoanWithALogs
