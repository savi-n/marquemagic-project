/**
 * PannoResponse.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: 'mysql_namastecredit',
  tableName: 'panno_response',
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "bigint",
      columnName: "panresponse_id",
      isInteger: true,
    },
    kyc_key: {
      type: "string",
      columnType: "char",
      columnName: "panno",
      maxLength: 10,
      unique: true,
      required: true
    },
    last_name: {
      type: "string",
      columnType: "char",
      maxLength: 75,
      allowNull: true
    },
    first_name: {
      type: "string",
      columnType: "char",
      maxLength: 25,
      allowNull: true
    },
    middle_name: {
      type: "string",
      columnType: "char",
      maxLength: 25,
      allowNull: true
    },
    pan_data_type: {
      type: "string",
      columnType: "set",
    },
    uniqueId: {
      type: "string",
      columnType: "varchar",
      columnName: "unique_id",
      allowNull: true,
    },
    response: {
      type: "string",
      columnType: "longtext",
      allowNull: true,
    },
    ints: {
      type: "string",
      columnType: "datetime",
      defaultsTo: '0000-00-00 00:00:00'
    },
    dt_created: {
      type: 'ref',
      columnType: 'datetime',
      autoUpdatedAt: true,
    },
    verification_response: {
      type: "string",
      columnType: "longtext",
      allowNull: true
    },
    remarks : {
      type: "string",
      columnType: "json",
      allowNull: true
    },
    panStatus: {
      type: "string",
      columnType: "enum",
      isIn: [
          "E", "F", "N"
      ],
        columnName: "pan_status",
        allowNull: true
    }
  },
 

};

