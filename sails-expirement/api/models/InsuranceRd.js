/**
 * InsuranceRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_read",
  tableName: "insurance",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "bigint",
      isInteger: true
    },
    loan_id: {
      type: "number",
      columnType: "bigint",
      allowNull: false
    },
    ins_id: {
      type: "number",
      columnType: "bigint",
      allowNull: false
    },
    ins_name: {
      type: "string",
      columnType: "varchar",
      maxLength: 45,
      allowNull: false
    },
    ins_ref_no: {
      type: "string",
      columnType: "varchar",
      maxLength: 45
    },
    ins_mode: {
      type: "string",
      columnType: "enum",
      isIn: ['online', 'offline']
    },
    ins_charge: {
      type: "number",
      columnType: "double"
    },
    gst_charge: {
      type: "number",
      columnType: "double"
    },
    record_status: {
      type: "string",
      columnType: "enum",
      isIn: ['active', 'inactive']
    },
    req_res_log: {
      type: "ref",
      columnType: "json"
    }

  },

};
