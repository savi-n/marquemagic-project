/**
 * InsuranceDeviationRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_read",
  tableName: "insurance_deviation",
  attributes: {
    id: {
      type: "number",
      columnType: "bigint",
      isInteger: true,
      autoIncrement: true
    },
    loan_id: {
      type: "number",
      columnType: "bigint",
      isInteger: true
    },
    status: {
      type: "string",
      columnType: "enum",
      isIn: ['not-initiated', 'not-required', 'initiated', 'approved', 'rejected'],
      allowNull: true
    },
    record_status: {
      type: "string",
      columnType: "enum",
      isIn: ['active', 'inactive'],
      defaultsTo: 'active'
    }
  },

};
