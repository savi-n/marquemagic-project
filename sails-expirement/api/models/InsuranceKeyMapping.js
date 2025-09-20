/**
 * Insurance.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_write",
  tableName: "insurance_key_mapping",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "bigint",
      isInteger: true
    },
    unique_key: {
      type: "string",
      columnType: "varchar",
      maxLength: 30
    },
    loan_id: {
      type: "number",
      columnType: "bigint"
    },
    director_id: {
      type: "number",
      columnType: "bigint"
    },
    ins_id: {
      type: "number",
      columnType: "int",
      allowNull: false
    },
    key_status: {
      type: "string",
      columnType: "enum",
      isIn: ['used', 'unused'],
      defaultsTo: 'unused'
    }
  },

};
