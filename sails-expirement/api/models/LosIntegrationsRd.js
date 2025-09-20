/**
 * LosIntegrationsRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  datastore: "mysql_namastecredit_read",
  tableName: "los_integrations",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "int",
      isInteger: true,
      unique: true
    },
    loan_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      required: true
    },
    request_type: {
      type: "string",
      columnType: "varchar",
      allowNull: true,
    },
    created_at: {
      type: "ref",
      columnType: "datetime",
      autoCreatedAt: true

    },
    updated_at: {
      type: "ref",
      columnType: "datetime",
      autoUpdatedAt: true
    },
    comments: {
      type: "string",
      columnType: "text",
      allowNull: true,
    },
    request_status: {
      type: "string",
      columnType: "enum",
      isIn: ['success', 'failed', 'error', 'in-progress']
    }
  }
};
