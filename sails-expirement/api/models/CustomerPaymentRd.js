/**
 * CustomerPayment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {


  datastore: "mysql_namastecredit_read",
  tableName: "customer_payment",
  attributes: {

    id: {
      type: "number",
      autoIncrement: true,
      columnType: "integer",
      isInteger: true
    },
    loan_id: {
      type: "number",
      required: true,
      columnType: "integer"
    },
    reference_no: {
      type: "string",
      required: true,
      columnType: "varchar"
    },
    reference_type: {
      type: "string",
      required: true,
      columnType: "enum",
      isIn: ["IMD", "BT"]
    },
    status: {
      type: "string",
      required: true,
      columnType: "enum",
      isIn: ["Pending", "Failed", "Complete"]
    },
    response: {
      type: 'json',
      columnType: 'json'
    }

  },

};
