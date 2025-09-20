/**
 * InsuranceMasterRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_read",
  tableName: "insurance_master",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "int",
      isInteger: true
    },
    ins_id: {
      type: "number",
      columnType: "int",
      isInteger: true
    },
    ins_name: {
      type: "string",
      columnType: "varchar",
      maxLength: 45
    },
    ins_category: {
      type: "string",
      columnType: "enum",
      isIn: ['Property Insurance', 'Life Insurance', 'Health Insurance', 'EMI Protect Insurance', 'Critical Illness Insurance', 'Personal Accident Insurance']
    },
    vendor_available: {
      type: "number",
      columnType: "tinyint"
    },
    vendor_integrated: {
      type: "number",
      columnType: "tinyint"
    },
    company: {
      type: "string",
      columnType: "varchar",
      maxLength: 24
    },
    high_level_category: {
      type: "string",
      columnType: "varchar",
      maxLength: 24
    }
  },

};
