/**
 * RemarksConfig.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_write",
  tableName: "remarks_config",

  attributes: {
    id: {
      type: "number",
      columnType: "int",
      autoIncrement: true
    },

    name: {
      type: "string",
      columnType: "varchar",
      maxLength: 255
    },

    config_type: {
      type: "string",
      columnType: "enum",
      isIn: ['Loan']
    },

    white_label_id: {
      type: "string",
      columnType: "varchar",
      maxLength: 255
    },

    createdAt: {
      type: "ref",
      columnType: "datetime",
      required: true
    },

  },

};
